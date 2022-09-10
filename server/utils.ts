import { Box, System, Body } from "detect-collisions";

const WIDTH = 800;
const HEIGHT = 600;
const BORDER = 100;

export enum BodyType {
  Player,
  Bullet,
  Wall,
}
export type PhysicsBody = Body & { oType: BodyType };

export function addWall(physics: System, x: number, y: number, width: number, height: number) {
  const body = new Box({ x, y }, width, height, { isStatic: true });
  physics.insert(Object.assign(body, { oType: BodyType.Wall }));
}

export function setupWorldBounds(physics: System) {
  addWall(physics, -BORDER, -BORDER, WIDTH + 2 * BORDER, BORDER);
  addWall(physics, WIDTH, -BORDER, BORDER, HEIGHT + 2 * BORDER);
  addWall(physics, -BORDER, HEIGHT, WIDTH + 2 * BORDER, BORDER);
  addWall(physics, -BORDER, -BORDER, BORDER, HEIGHT + 2 * BORDER);
}
