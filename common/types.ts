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

export type LobbyState = {
  playerCount: number;
};

export type InitialConfig = {
  capacity: number;
  winningScore: number;
};

export type SessionMetadata = { serverUrl: string, winningScore: number };
