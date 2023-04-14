import React from "react";

import { InitialConfig, LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";

import { MultiSelect } from "./MultiSelect";
import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { Dropdown } from "./Dropdown";

interface GameCreatorProps {
  lobbyClient: PlayerLobbyClient<LobbyState>;
  playerToken: string;
  joinRoom: (roomId: string) => void;
}
export function GameCreator(props: GameCreatorProps) {
  const { lobbyClient, playerToken, joinRoom } = props;
  const [visibility, setVisibility] = React.useState<"Public" | "Private">("Public");
  const [region, setRegion] = React.useState<Region>(Region.Chicago);
  const [capacity, setCapacity] = React.useState<number>(6);
  const [winningScore, setWinningScore] = React.useState<number>(20);

  const initialConfig: InitialConfig = { capacity, winningScore };
  return (
    <LobbyPageCard>
      <Header>Create New Game</Header>
      <MultiSelect options={["Public", "Private"]} selected={visibility} onSelect={setVisibility} />
      <Dropdown options={Object.values(Region)} selected={region} onSelect={setRegion} />
      <Dropdown
        options={[1, 2, 3, 4, 5, 6, 7]}
        format={(s) => `${s} players`}
        selected={capacity}
        onSelect={(s) => setCapacity(Number(s))}
      />
      <Dropdown
        options={[5, 10, 15, 20, 25]}
        format={(s) => `${s} kills to win`}
        selected={winningScore}
        onSelect={(s) => setWinningScore(Number(s))}
      />
      <button
        onClick={async () => {
          const lobby = await lobbyClient.createPublicLobbyV2(playerToken, region, initialConfig);
          joinRoom(lobby.roomId);
        }}
      >
        Create!
      </button>
    </LobbyPageCard>
  );
}
