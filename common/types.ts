import { Region } from "@hathora/hathora-cloud-sdk";

export type Direction = {
  x: number;
  y: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  id: string;
  nickname: string;
  position: Position;
  aimAngle: number;
  isDead: boolean;
  bullets: number;
  isReloading: number | undefined;
  dashCooldown: number | undefined;
  score: number;
  sprite: number;
};

export type Bullet = {
  id: number;
  position: Position;
};

export type GameState = {
  players: Player[];
  bullets: Bullet[];
};

export type RoomConfig = {
  capacity: number;
  winningScore: number;
  playerNicknameMap: { [playerId: string]: string };
  isGameEnd: boolean;
  winningPlayerId?: string;
};

export type SessionMetadata = {
  serverUrl: string;
  roomId: string;
  region: Region;
  capacity: number;
  winningScore: number;
  isGameEnd: boolean;
  winningPlayerId?: string;
  playerNicknameMap: { [playerId: string]: string };
  creatorId: string;
};
