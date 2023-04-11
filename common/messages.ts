import { Direction, GameState } from "./types";

export enum ClientMessageType {
  SetDirection,
  SetAngle,
  Shoot,
  Ping,
  Dash,
}

export enum ServerMessageType {
  StateUpdate,
  PingResponse,
}

export type ClientMessage = SetDirectionMessage | SetAngleMessage | ShootMessage | PingMessage | DashMessage;

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

export type DashMessage = {
  type: ClientMessageType.Dash;
};

export type PingMessage = {
  type: ClientMessageType.Ping;
  id: number;
};

export type ServerMessage = StateUpdateMessage | PingResponseMessage;

export type StateUpdateMessage = {
  type: ServerMessageType.StateUpdate;
  state: GameState;
  ts: number;
};

export type PingResponseMessage = {
  type: ServerMessageType.PingResponse;
  id: number;
};
