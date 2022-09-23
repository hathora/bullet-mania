import { Body } from "detect-collisions";

export enum BodyType {
  Player,
  Bullet,
  Wall,
}
export type PhysicsBody = Body & { oType: BodyType };
