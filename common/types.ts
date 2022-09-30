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
};

export type Bullet = {
  id: number;
  position: Position;
};

export type GameState = {
  players: Player[];
  bullets: Bullet[];
};
