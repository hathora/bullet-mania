import { Direction, GameState, Position } from "./types";

export enum ClientMessageType {
  SetDirection,
  SetTarget,
  Shoot,
}

export enum ServerMessageType {
  StateUpdate,
}

export type ClientMessage = SetDirectionMessage | SetTargetMessage | ShootMessage;

export type SetDirectionMessage = {
  type: ClientMessageType.SetDirection;
  direction: Direction;
};

export type SetTargetMessage = {
  type: ClientMessageType.SetTarget;
  taget: Position;
};

export type ShootMessage = {
  type: ClientMessageType.Shoot;
};

export type ServerMessage = StateUpdateMessage;

export type StateUpdateMessage = {
  type: ServerMessageType.StateUpdate;
  state: GameState;
  ts: number;
};
