import React from "react";

import { Token } from "../../utils";
import { InitialConfig, LobbyState } from "../../../../common/types";
import { PlayerLobbyClient } from "../../../../common/lobby-service/PlayerLobbyClient";

import { PublicLobbyList } from "./PublicLobbyList";
import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { GameCreator } from "./GameCreator";
interface LobbySelectorProps {
  lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>;
  playerToken: Token;
  setGoogleIdToken: (idToken: string) => void;
  roomIdNotFound: string | undefined;
}

export function LobbySelector(props: LobbySelectorProps) {
  const { lobbyClient, playerToken, setGoogleIdToken, roomIdNotFound } = props;
  const [privateLobbyID, setPrivateLobbyID] = React.useState<string>("");
  return (
    <div className="bg-[url('/splash.png')] h-full flex flex-col p-1 relative">
      {roomIdNotFound && (
        <div className={"absolute left-1/2 -translate-x-1/2 text-red-500 font-semibold"}>
          Room not found: {roomIdNotFound}
        </div>
      )}
      <div className={"flex items-center justify-center mt-6 mb-4"}>
        <img src="bullet_mania_logo.png" alt="logo" className="" />
      </div>
      <div className="flex overflow-hidden h-full w-full justify-between">
        <div className="grow">
          <PublicLobbyList lobbyClient={lobbyClient} />
        </div>
        <div className="flex flex-col grow w-[240px]">
          <GameCreator lobbyClient={lobbyClient} playerToken={playerToken} setGoogleIdToken={setGoogleIdToken} />
          <LobbyPageCard>
            <Header className="mt-3 mb-1">Join Game</Header>
            <input
              className="px-4 py-2 bg-secondary-600 rounded placeholder:text-secondary-800 text-secondary-800 cursor-text mb-3"
              name="gameCode"
              placeholder="ENTER ROOM CODE"
              value={privateLobbyID}
              onChange={(e) => setPrivateLobbyID(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/${privateLobbyID}`;
                }
              }}
            />
          </LobbyPageCard>
        </div>
      </div>
    </div>
  );
}
