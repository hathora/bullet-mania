import React from "react";

import { LobbyState } from "../../../common/types";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";

import { PublicLobbyList } from "./PublicLobbyList";
import { LobbyPageCard } from "./LobbyPageCard";
import { GameCreator } from "./GameCreator";
interface LobbySelectorProps {
  lobbyClient: PlayerLobbyClient<LobbyState>;
  joinLobby: (roomId: string) => void;
  playerToken: string;
}

export function LobbySelector(props: LobbySelectorProps) {
  const { lobbyClient, joinLobby, playerToken } = props;
  return (
    <div className="bg-[url('/splash.png')] h-full flex flex-col p-1">
      <div className={"flex items-center justify-center mt-6 mb-4"}>
        <img src="lobby_header.png" alt="logo" className="" />
      </div>
      <div className="flex overflow-hidden h-full w-full justify-between">
        <div className="grow">
          <PublicLobbyList lobbyClient={lobbyClient} joinLobby={joinLobby} />
        </div>
        <div className="flex flex-col grow min-w-[240px]">
          <GameCreator lobbyClient={lobbyClient} playerToken={playerToken} />
          <LobbyPageCard>Join existing game</LobbyPageCard>
        </div>
      </div>
    </div>
  );
}
