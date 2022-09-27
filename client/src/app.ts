import { Game, AUTO } from "phaser";

// Scenes
import { GameScene } from "./scenes/GameScene";
import { BootScene } from "./scenes/BootScene";

new Game({
  type: AUTO,
  width: 800,
  height: 600,
  scene: [BootScene, GameScene],
  parent: "root",
});
