import { register, Store, UserId, RoomId } from "@hathora/server-sdk";
import { Direction, GameState } from "../common/types";
import { Circle, System } from "detect-collisions";
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from "../common/messages";

const PLAYER_RADIUS = 20;
const PLAYER_SPEED = 50;

type InternalPlayer = {
  id: UserId;
  body: Circle;
  aimAngle: number;
  direction: Direction;
};

type InternalState = {
  physics: System;
  players: InternalPlayer[];
};

const rooms: Map<RoomId, { game: InternalState; subscribers: Set<UserId> }> = new Map();

const store: Store = {
  newState(roomId: bigint, userId: string): void {
    rooms.set(roomId, {
      game: {
        physics: new System(),
        players: [],
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
      const body = game.physics.createCircle({ x: 0, y: 0 }, PLAYER_RADIUS);
      game.players.push({
        id: userId,
        body,
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
    }
  },
};

const appSecret = process.env.APP_SECRET;
if (appSecret === undefined) {
  throw new Error("APP_SECRET not set");
}
const coordinator = await register({
  appSecret,
  authInfo: { anonymous: { separator: "-" } },
  store,
});

const { host, appId, storeId } = coordinator;
console.log(`Connected to coordinator at ${host} with appId ${appId} and storeId ${storeId}`);

function broadcastStateUpdate(roomId: RoomId) {
  const { subscribers, game } = rooms.get(roomId)!;
  const now = Date.now();
  const state: GameState = {
    players: game.players.map((player) => ({
      id: player.id,
      position: { x: player.body.x, y: player.body.y },
      aimAngle: player.aimAngle,
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
    broadcastStateUpdate(roomId);
  });
}, 50);
