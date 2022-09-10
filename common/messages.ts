import { Direction, GameState } from "./types";

export enum ClientMessageType {
  SetDirection,
  SetAimAngle,
  Shoot,
}

export enum ServerMessageType {
  StateUpdate,
}

export type ClientMessage = SetDirectionMessage | SetAimAngleMessage | ShootMessage;

export type SetDirectionMessage = {
  type: ClientMessageType.SetDirection;
  direction: Direction;
};

export type SetAimAngleMessage = {
  type: ClientMessageType.SetAimAngle;
  aimAngle: number;
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
