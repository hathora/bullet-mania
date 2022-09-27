import { Direction, GameState } from "./types";

export enum ClientMessageType {
  SetDirection,
  SetAngle,
  Shoot,
}

export enum ServerMessageType {
  StateUpdate,
}

export type ClientMessage = SetDirectionMessage | SetAngleMessage | ShootMessage;

export type SetDirectionMessage = {
  type: ClientMessageType.SetDirection;
  direction: Direction;
};

export type SetAngleMessage = {
  type: ClientMessageType.SetAngle;
  angle: number;
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
