import React from "react";
import { Game, AUTO } from "phaser";
import { HathoraConnection } from "@hathora/client-sdk";

import { GameScene } from "../scenes/GameScene";

export const GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "game-content",
};

interface GameComponentProps {
  connection: HathoraConnection | undefined;
  token: string;
  sessionMetadata: {
    serverUrl: string;
    winningScore: number;
  };
}
export function GameComponent(props: GameComponentProps) {
  const { connection, token, sessionMetadata } = props;
  if (connection != null) {
    const game = new Game(GameConfig);
    game.scene.start(GameScene.NAME, { connection, token, sessionMetadata });
  }
  return <div id="game-content"></div>;
}
