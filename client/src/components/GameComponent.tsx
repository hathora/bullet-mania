import React from "react";
import { Game, AUTO } from "phaser";
import { HathoraConnection } from "@hathora/client-sdk";

import { Token } from "../utils";
import { GameScene } from "../scenes/GameScene";
import { SessionMetadata } from "../../../common/types";

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
  sessionMetadata: SessionMetadata | undefined;
  isNicknameAcked: boolean;
}
export function GameComponent(props: GameComponentProps) {
  const { connection, token, sessionMetadata, isNicknameAcked } = props;
  const [sceneRendered, setSceneRendered] = React.useState<boolean>(false);
  if (
    !sceneRendered &&
    ((connection != null && sessionMetadata != null && isNicknameAcked) || sessionMetadata?.isGameEnd)
  ) {
    setSceneRendered(true);
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
