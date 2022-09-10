import { register, Store, UserId, RoomId } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { System } from "detect-collisions";
import { Direction, GameState, Position } from "../common/types";
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from "../common/messages";
import { angleBetween, BodyType, PhysicsBody, setupWorldBounds } from "./utils";

const TICK_INTERVAL_MS = 50;

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 200;

const BULLET_RADIUS = 9;
const BULLET_SPEED = 800;

type InternalPlayer = {
  id: UserId;
  body: PhysicsBody;
  direction: Direction;
  target: Position;
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

const rooms: Map<RoomId, { game: InternalState; subscribers: Set<UserId> }> = new Map();

const store: Store = {
  newState(roomId: bigint, userId: string): void {
    const physics = new System();
    setupWorldBounds(physics);
    rooms.set(roomId, {
      game: {
        physics,
        players: [],
        bullets: [],
      },
      subscribers: new Set(),
    });
  },
  subscribeUser(roomId: bigint, userId: string): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const { game, subscribers } = rooms.get(roomId)!;
    subscribers.add(userId);
    if (!game.players.some((player) => player.id === userId)) {
      const body = game.physics.createCircle({ x: 50, y: 50 }, PLAYER_RADIUS);
      game.players.push({
        id: userId,
        body: Object.assign(body, { oType: BodyType.Player }),
        direction: Direction.None,
        target: { x: 0, y: 0 },
      });
    }
  },
  unsubscribeUser(roomId: bigint, userId: string): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const { game, subscribers } = rooms.get(roomId)!;
    subscribers.delete(userId);
    const idx = game.players.findIndex((player) => player.id === userId);
    if (idx >= 0) {
      game.players.splice(idx, 1);
    }
  },
  unsubscribeAll(): void {
    console.error("unsubscribeAll() not implemented");
  },
  onMessage(roomId: bigint, userId: string, data: ArrayBufferView): void {
    if (!rooms.has(roomId)) {
      return;
    }
    const { game } = rooms.get(roomId)!;
    const player = game.players.find((player) => player.id === userId);
    if (player === undefined) {
      return;
    }

    const dataStr = Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
    const message: ClientMessage = JSON.parse(dataStr);
    if (message.type === ClientMessageType.SetDirection) {
      player.direction = message.direction;
    } else if (message.type === ClientMessageType.SetTarget) {
      player.target = message.taget;
    } else if (message.type === ClientMessageType.Shoot) {
      const body = game.physics.createCircle({ x: player.body.x, y: player.body.y }, BULLET_RADIUS);
      game.bullets.push({
        id: Math.floor(Math.random() * 1e6),
        body: Object.assign(body, { oType: BodyType.Bullet }),
        angle: angleBetween(player.body, player.target),
      });
    }
  },
};

dotenv.config({ path: "../.env" });
if (process.env.APP_SECRET === undefined) {
  throw new Error("APP_SECRET not set");
}
const coordinator = await register({
  appSecret: process.env.APP_SECRET,
  authInfo: { anonymous: { separator: "-" } },
  store,
});

const { host, appId, storeId } = coordinator;
console.log(`Connected to coordinator at ${host} with appId ${appId} and storeId ${storeId}`);

setInterval(() => {
  rooms.forEach(({ game }, roomId) => {
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
  const { subscribers, game } = rooms.get(roomId)!;
  const now = Date.now();
  const state: GameState = {
    players: game.players.map((player) => ({
      id: player.id,
      position: { x: player.body.x, y: player.body.y },
      aimAngle: angleBetween(player.body, player.target),
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
    coordinator.stateUpdate(roomId, userId, Buffer.from(JSON.stringify(msg), "utf8"));
  });
}
