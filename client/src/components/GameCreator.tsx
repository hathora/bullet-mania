import React from "react";

import { LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";

import { LobbyPageCard } from "./LobbyPageCard";

interface GameCreatorProps {
  lobbyClient: PlayerLobbyClient<LobbyState>;
}
export function GameCreator(props: GameCreatorProps) {
  const { lobbyClient } = props;
  const initialConfig = {};
  return (
    <LobbyPageCard>
      <button onClick={() => lobbyClient.createPublicLobbyV2(Region.Chicago, initialConfig)}>Create New Game</button>
    </LobbyPageCard>
  );
}
