import React from "react";
import { Game, AUTO } from "phaser";
import { HathoraConnection } from "@hathora/client-sdk";

import { GameScene } from "../scenes/GameScene";
import { Token } from "../../../common/types";

export const GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "game-content",
};

interface GameComponentProps {
  connection: HathoraConnection | undefined;
  token: Token;
  sessionMetadata: {
    serverUrl?: string;
    winningScore: number;
    isGameEnd?: boolean;
  };
}
export function GameComponent(props: GameComponentProps) {
  const { connection, token, sessionMetadata } = props;
  if ((token != null && connection != null) || sessionMetadata.isGameEnd) {
    const game = new Game(GameConfig);
    game.scene.start(GameScene.NAME, { connection, token: token.value, sessionMetadata });
  }
  return (
    <div id="game-content" className="relative">
      <div className="preloader off">
        <img src="lobby_header.png" alt="Hathora" />

        <div className="preloader__bar">
          <div className="preloader__bar-inner"></div>
        </div>
      </div>
    </div>
  );
}
