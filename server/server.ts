import path from "path";
import { fileURLToPath } from "url";

import { UserId, RoomId, Application, startServer, verifyJwt } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { Box, Body, System } from "detect-collisions";
import { Direction, GameState } from "../common/types";
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from "../common/messages";
import map from "../common/map.json" assert { type: "json" };

// The millisecond tick rate
const TICK_INTERVAL_MS = 50;

// Player configuration
const PLAYER_RADIUS = 20; // The player's circular radius, used for collision detection
const PLAYER_SPEED = 200; // The player's movement speed
const DASH_DISTANCE = 40; // The player's dash distance

// Bullet configuration
const BULLET_RADIUS = 9; // The bullet's circular radius, used for collision detection
const BULLET_SPEED = 1000; // The bullet's movement speed when shot

// Reloading
const BULLETS_MAX = 3;
const RELOAD_SPEED = 3000; // in millis
const DASH_COOLDOWN = 2000; // in millis

// An x, y vector representing the spawn location of the player on the map
const SPAWN_POSITIONS = [
  {
    x: 512,
    y: 512,
  },
  {
    x: 24,
    y: 256,
  },
  {
    x: 1000,
    y: 256,
  },
  {
    x: 512,
    y: 2048,
  },
  {
    x: 24,
    y: 1875,
  },
  {
    x: 1000,
    y: 1875,
  },
];

// The width of the map boundary rectangles
const BOUNDARY_WIDTH = 50;

// An enum which represents the type of body for a given object
enum BodyType {
  Player,
  Bullet,
  Wall,
}
const PLAYER_SPRITES_COUNT = 9;

// A type to represent a physics body with a type (uses BodyType above)
type PhysicsBody = Body & { oType: BodyType };

// A type which defines the properties of a player used internally on the server (not sent to client)
type InternalPlayer = {
  id: UserId;
  body: PhysicsBody;
  direction: Direction;
  angle: number;
  bullets: number;
  isReloading: number | undefined;
  dashCooldown: number | undefined;
  score: number;
  sprite: number;
};

// A type which defines the properties of a bullet used internally on the server (not sent to client)
type InternalBullet = {
  id: number;
  playerId: UserId;
  body: PhysicsBody;
  angle: number;
};

// A type which represents the internal state of the server, containing:
//   - physics: our "physics" engine (detect-collisions library)
//   - players: an array containing all connected players to a room
//   - bullets: an array containing all bullets currently in the air for a given room
type InternalState = {
  physics: System;
  players: InternalPlayer[];
  bullets: InternalBullet[];
};

// A map which the server uses to contain all room's InternalState instances
const rooms: Map<RoomId, InternalState> = new Map();

// Create an object to represent our Store
const store: Application = {
  verifyToken(token: string): UserId | undefined {
    const userId = verifyJwt(token, process.env.HATHORA_APP_SECRET!);
    if (userId === undefined) {
      console.error("Failed to verify token", token);
    }
    return userId;
  },

  // subscribeUser is called when a new user enters a room, it's an ideal place to do any player-specific initialization steps
  subscribeUser(roomId: RoomId, userId: string): void {
    if (!rooms.has(roomId)) {
      console.log("newRoom", roomId, userId);
      rooms.set(roomId, initializeRoom());
    }
    console.log("subscribeUser", roomId, userId);
    const game = rooms.get(roomId)!;

    // Make sure the player hasn't already spawned
    if (!game.players.some((player) => player.id === userId)) {
      // Then create a physics body for the player
      const spawn = SPAWN_POSITIONS[Math.floor(Math.random() * SPAWN_POSITIONS.length)];
      const body = game.physics.createCircle(spawn, PLAYER_RADIUS);
      game.players.push({
        id: userId,
        body: Object.assign(body, { oType: BodyType.Player }),
        direction: { x: 0, y: 0 },
        angle: 0,
        bullets: 3,
        isReloading: undefined,
        dashCooldown: undefined,
        score: 0,
        sprite: Math.floor(Math.random() * PLAYER_SPRITES_COUNT),
      });
    }
  },

  // unsubscribeUser is called when a user disconnects from a room, and is the place where you'd want to do any player-cleanup
  unsubscribeUser(roomId: RoomId, userId: string): void {
    // Make sure the room exists
    if (!rooms.has(roomId)) {
      return;
    }
    console.log("unsubscribeUser", roomId, userId);

    // Remove the player from the room's state
    const game = rooms.get(roomId)!;
    const idx = game.players.findIndex((player) => player.id === userId);
    if (idx >= 0) {
      game.physics.remove(game.players[idx].body);
      game.players.splice(idx, 1);
    }
  },

  // onMessage is an integral part of your game's server. It is responsible for reading messages sent from the clients and handling them accordingly, this is where your game's event-based logic should live
  onMessage(roomId: RoomId, userId: string, data: ArrayBuffer): void {
    if (!rooms.has(roomId)) {
      return;
    }

    // Get the player, or return out of the function if they don't exist
    const game = rooms.get(roomId)!;
    const player = game.players.find((player) => player.id === userId);
    if (player === undefined) {
      return;
    }

    // Parse out the data string being sent from the client
    const message: ClientMessage = JSON.parse(Buffer.from(data).toString("utf8"));

    // Handle the various message types, specific to this game
    if (message.type === ClientMessageType.SetDirection) {
      player.direction = message.direction;
    } else if (message.type === ClientMessageType.SetAngle) {
      player.angle = message.angle;
    } else if (message.type === ClientMessageType.Dash) {
      if (!player.dashCooldown) {
        player.body.x += DASH_DISTANCE * player.direction.x;
        player.body.y += DASH_DISTANCE * player.direction.y;
        player.dashCooldown = Date.now() + DASH_COOLDOWN;
      }
    } else if (message.type === ClientMessageType.Shoot) {
      if (player.isReloading) {
        return;
      }
      player.bullets--;
      if (player.bullets === 0) {
        player.isReloading = Date.now() + RELOAD_SPEED;
      }
      const body = game.physics.createCircle({ x: player.body.x, y: player.body.y }, BULLET_RADIUS);
      game.bullets.push({
        id: Math.floor(Math.random() * 1e6),
        playerId: player.id,
        body: Object.assign(body, { oType: BodyType.Bullet }),
        angle: player.angle,
      });
    } else if (message.type === ClientMessageType.Ping) {
      const msg: ServerMessage = {
        type: ServerMessageType.PingResponse,
        id: message.id,
      };
      server.sendMessage(roomId, userId, Buffer.from(JSON.stringify(msg), "utf8"));
    }
  },
};

// Load our environment variables into process.env
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });
if (process.env.HATHORA_APP_SECRET === undefined) {
  throw new Error("HATHORA_APP_SECRET not set");
}

// Start the server
const port = parseInt(process.env.PORT ?? "4000");
const server = await startServer(store, port);
console.log(`Server listening on port ${port}`);

// Start the game's update loop
setInterval(() => {
  rooms.forEach((game, roomId) => {
    // Tick each room's game
    tick(game, TICK_INTERVAL_MS / 1000);

    // Send the state updates to each client connected to that room
    broadcastStateUpdate(roomId);
  });
}, TICK_INTERVAL_MS);

// The frame-by-frame logic of your game should live in it's server's tick function. This is often a place to check for collisions, compute score, and so forth
function tick(game: InternalState, deltaMs: number) {
  // Move each player with a direction set
  game.players.forEach((player) => {
    player.body.x += PLAYER_SPEED * player.direction.x * deltaMs;
    player.body.y += PLAYER_SPEED * player.direction.y * deltaMs;

    if (player.isReloading && player.isReloading < Date.now()) {
      player.isReloading = undefined;
      player.bullets = BULLETS_MAX;
    }

    if (player.dashCooldown && player.dashCooldown < Date.now()) {
      player.dashCooldown = undefined;
    }
  });

  // Move all active bullets along a path based on their radian angle
  game.bullets.forEach((bullet) => {
    bullet.body.x += Math.cos(bullet.angle) * BULLET_SPEED * deltaMs;
    bullet.body.y += Math.sin(bullet.angle) * BULLET_SPEED * deltaMs;
  });

  // Handle collision detections between the various types of PhysicsBody's
  game.physics.checkAll(({ a, b, overlapV }: { a: PhysicsBody; b: PhysicsBody; overlapV: SAT.Vector }) => {
    if (a.oType === BodyType.Player && b.oType === BodyType.Wall) {
      a.x -= overlapV.x;
      a.y -= overlapV.y;
    } else if (a.oType === BodyType.Player && b.oType === BodyType.Player) {
      b.x += overlapV.x;
      b.y += overlapV.y;
    } else if (a.oType === BodyType.Bullet && b.oType === BodyType.Wall) {
      game.physics.remove(a);
      const bulletIdx = game.bullets.findIndex((bullet) => bullet.body === a);
      if (bulletIdx >= 0) {
        game.bullets.splice(bulletIdx, 1);
      }
    } else if (a.oType === BodyType.Bullet && b.oType === BodyType.Player) {
      game.physics.remove(a);
      // Update shooting player's score
      const bullet = game.bullets.find((bullet) => bullet.body === a);
      const shooter = game.players.find(p => p.id === bullet?.playerId);
      if (shooter) {
        shooter.score += 100;
        console.log("score! ", shooter)
      }

      const bulletIdx = game.bullets.findIndex((bullet) => bullet.body === a);
      if (bulletIdx >= 0) {
        game.bullets.splice(bulletIdx, 1);
      }
      game.physics.remove(b);
      const playerIdx = game.players.findIndex((player) => player.body === b);
      if (playerIdx >= 0) {
        game.players.splice(playerIdx, 1);
      }
    }
  });
}

function broadcastStateUpdate(roomId: RoomId) {
  const game = rooms.get(roomId)!;
  const now = Date.now();
  // Map properties in the game's state which the clients need to know about to render the game
  const state: GameState = {
    players: game.players.map((player) => ({
      id: player.id,
      position: { x: player.body.x, y: player.body.y },
      aimAngle: player.angle,
      bullets: player.bullets,
      isReloading: player.isReloading,
      dashCooldown: player.dashCooldown,
      score: player.score,
      sprite: player.sprite,
    })),
    bullets: game.bullets.map((bullet) => ({
      id: bullet.id,
      position: { x: bullet.body.x, y: bullet.body.y },
    })),
  };

  // Send the state update to each connected client
  const msg: ServerMessage = {
    type: ServerMessageType.StateUpdate,
    state,
    ts: now,
  };
  server.broadcastMessage(roomId, Buffer.from(JSON.stringify(msg), "utf8"));
}

function initializeRoom() {
  const physics = new System();
  const tileSize = map.tileSize;
  const top = map.top * tileSize;
  const left = map.left * tileSize;
  const bottom = map.bottom * tileSize;
  const right = map.right * tileSize;

  // Create map wall bodies
  map.walls.forEach(({ x, y, width, height }) => {
    physics.insert(wallBody(x * tileSize, y * tileSize, width * tileSize, height * tileSize));
  });

  // Create map boundary boxes
  physics.insert(wallBody(left, top - BOUNDARY_WIDTH, right - left, BOUNDARY_WIDTH)); // top
  physics.insert(wallBody(left - BOUNDARY_WIDTH, top, BOUNDARY_WIDTH, bottom - top)); // left
  physics.insert(wallBody(left, bottom, right - left, BOUNDARY_WIDTH)); // bottom
  physics.insert(wallBody(right, top, BOUNDARY_WIDTH, bottom - top)); // right

  return {
    physics,
    players: [],
    bullets: [],
  };
}

function wallBody(x: number, y: number, width: number, height: number): PhysicsBody {
  return Object.assign(new Box({ x, y }, width, height, { isStatic: true }), {
    oType: BodyType.Wall,
  });
}
