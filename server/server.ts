import { register, Store, UserId, RoomId } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { Box, System, Body } from "detect-collisions";
import { Direction, GameState } from "../common/types";
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from "../common/messages";

const TICK_INTERVAL_MS = 50;
const TICK_INTERVAL_SEC = TICK_INTERVAL_MS / 1000;

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 200;

const BULLET_RADIUS = 9;
const BULLET_SPEED = 800;

enum BodyType {
  Player,
  Bullet,
  Wall,
}
type PhysicsBody = Body & { oType: BodyType };

type InternalPlayer = {
  id: UserId;
  body: PhysicsBody;
  aimAngle: number;
  direction: Direction;
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

    // world bounds
    const WIDTH = 800;
    const HEIGHT = 600;
    const BORDER = 100;
    addWall(physics, -BORDER, -BORDER, WIDTH + 2 * BORDER, BORDER);
    addWall(physics, WIDTH, -BORDER, BORDER, HEIGHT + 2 * BORDER);
    addWall(physics, -BORDER, HEIGHT, WIDTH + 2 * BORDER, BORDER);
    addWall(physics, -BORDER, -BORDER, BORDER, HEIGHT + 2 * BORDER);

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
        aimAngle: 0,
        direction: Direction.None,
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
    throw new Error("Function not implemented.");
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
    } else if (message.type === ClientMessageType.SetAimAngle) {
      player.aimAngle = message.aimAngle;
    } else if (message.type === ClientMessageType.Shoot) {
      const body = game.physics.createCircle({ x: player.body.x, y: player.body.y }, BULLET_RADIUS);
      game.bullets.push({
        id: Math.floor(Math.random() * 1e6),
        body: Object.assign(body, { oType: BodyType.Bullet }),
        angle: player.aimAngle,
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

function addWall(physics: System, x: number, y: number, width: number, height: number) {
  const body = new Box({ x, y }, width, height, { isStatic: true });
  physics.insert(Object.assign(body, { oType: BodyType.Wall }));
}

function broadcastStateUpdate(roomId: RoomId) {
  const { subscribers, game } = rooms.get(roomId)!;
  const now = Date.now();
  const state: GameState = {
    players: game.players.map((player) => ({
      id: player.id,
      position: { x: player.body.x, y: player.body.y },
      aimAngle: player.aimAngle,
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

setInterval(() => {
  rooms.forEach(({ game }, roomId) => {
    // update players
    game.players.forEach((player) => {
      if (player.direction === Direction.Up) {
        player.body.y -= PLAYER_SPEED * TICK_INTERVAL_SEC;
      } else if (player.direction === Direction.Down) {
        player.body.y += PLAYER_SPEED * TICK_INTERVAL_SEC;
      } else if (player.direction === Direction.Left) {
        player.body.x -= PLAYER_SPEED * TICK_INTERVAL_SEC;
      } else if (player.direction === Direction.Right) {
        player.body.x += PLAYER_SPEED * TICK_INTERVAL_SEC;
      }
    });

    // update bullets
    game.bullets.forEach((bullet) => {
      bullet.body.x += Math.cos(bullet.angle) * BULLET_SPEED * TICK_INTERVAL_SEC;
      bullet.body.y += Math.sin(bullet.angle) * BULLET_SPEED * TICK_INTERVAL_SEC;
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

    broadcastStateUpdate(roomId);
  });
}, TICK_INTERVAL_MS);
