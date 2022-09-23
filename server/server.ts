import { register, Store, UserId, RoomId } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { Box, SATVector, System } from "detect-collisions";
import { Direction, GameState } from "../common/types";
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from "../common/messages";
import { BodyType, PhysicsBody } from "./utils";
import { MAP, SPAWN_POSITION } from "../common/map";

const TICK_INTERVAL_MS = 50;

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 200;

const BULLET_RADIUS = 9;
const BULLET_SPEED = 800;

type InternalPlayer = {
  id: UserId;
  body: PhysicsBody;
  direction: Direction;
  angle: number;
};

type InternalBullet = {
  id: number;
  body: PhysicsBody;
  angle: number;
};

type InternalState = {
  physics: System;
  players: InternalPlayer[];
  bullets: InternalBullet[];
};

const rooms: Map<RoomId, InternalState> = new Map();

const store: Store = {
  newState(roomId: bigint, userId: string): void {
    const physics = new System();

    // Create map box bodies
    MAP.forEach(({ x, y, width, height }) => {
      const body = Object.assign(new Box({ x, y }, width as number, height as number, { isStatic: true }), {
        oType: BodyType.Wall,
      });

      body.setOffset(new SATVector(0, 0));

      physics.insert(body);
      physics.updateBody(body);
    });

    rooms.set(roomId, {
      physics,
      players: [],
      bullets: [],
    });
  },
  subscribeUser(roomId: bigint, userId: string): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const game = rooms.get(roomId)!;
    if (!game.players.some((player) => player.id === userId)) {
      const body = game.physics.createCircle(SPAWN_POSITION, PLAYER_RADIUS);
      game.players.push({
        id: userId,
        body: Object.assign(body, { oType: BodyType.Player }),
        direction: Direction.None,
        angle: 0,
      });
    }
  },
  unsubscribeUser(roomId: bigint, userId: string): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const game = rooms.get(roomId)!;
    const idx = game.players.findIndex((player) => player.id === userId);
    if (idx >= 0) {
      game.players.splice(idx, 1);
    }
  },
  onMessage(roomId: bigint, userId: string, data: ArrayBufferView): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const game = rooms.get(roomId)!;
    const player = game.players.find((player) => player.id === userId);
    if (player === undefined) {
      return;
    }

    const dataStr = Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
    const message: ClientMessage = JSON.parse(dataStr);
    if (message.type === ClientMessageType.SetDirection) {
      player.direction = message.direction;
    } else if (message.type === ClientMessageType.SetAngle) {
      player.angle = message.angle;
    } else if (message.type === ClientMessageType.Shoot) {
      const body = game.physics.createCircle({ x: player.body.x, y: player.body.y }, BULLET_RADIUS);
      game.bullets.push({
        id: Math.floor(Math.random() * 1e6),
        body: Object.assign(body, { oType: BodyType.Bullet }),
        angle: player.angle,
      });
    }
  },
};

dotenv.config({ path: "../.env" });
if (process.env.APP_SECRET === undefined) {
  throw new Error("APP_SECRET not set");
}
const coordinator = await register({
  coordinatorHost: process.env.COORDINATOR_HOST,
  appSecret: process.env.APP_SECRET,
  authInfo: { anonymous: { separator: "-" } },
  store,
});

const { host, appId, storeId } = coordinator;
console.log(`Connected to coordinator at ${host} with appId ${appId} and storeId ${storeId}`);

setInterval(() => {
  rooms.forEach((game, roomId) => {
    tick(game, TICK_INTERVAL_MS / 1000);
    broadcastStateUpdate(roomId);
  });
}, TICK_INTERVAL_MS);

function tick(game: InternalState, deltaMs: number) {
  // update players
  game.players.forEach((player) => {
    if (player.direction === Direction.Up) {
      player.body.y -= PLAYER_SPEED * deltaMs;
    } else if (player.direction === Direction.Down) {
      player.body.y += PLAYER_SPEED * deltaMs;
    } else if (player.direction === Direction.Left) {
      player.body.x -= PLAYER_SPEED * deltaMs;
    } else if (player.direction === Direction.Right) {
      player.body.x += PLAYER_SPEED * deltaMs;
    }
  });

  // update bullets
  game.bullets.forEach((bullet) => {
    bullet.body.x += Math.cos(bullet.angle) * BULLET_SPEED * deltaMs;
    bullet.body.y += Math.sin(bullet.angle) * BULLET_SPEED * deltaMs;
  });

  // handle collisionss
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
  const subscribers = coordinator.getSubscribers(roomId);
  const now = Date.now();
  const state: GameState = {
    players: game.players.map((player) => ({
      id: player.id,
      position: { x: player.body.x, y: player.body.y },
      aimAngle: player.angle,
    })),
    bullets: game.bullets.map((bullet) => ({
      id: bullet.id,
      position: { x: bullet.body.x, y: bullet.body.y },
    })),
  };
  subscribers.forEach((userId) => {
    const msg: ServerMessage = {
      type: ServerMessageType.StateUpdate,
      state,
      ts: now,
    };
    coordinator.sendMessage(roomId, userId, Buffer.from(JSON.stringify(msg), "utf8"));
  });
}
