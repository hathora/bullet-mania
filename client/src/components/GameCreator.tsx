import React from "react";

import { InitialConfig, LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";

import { MultiSelect } from "./MultiSelect";
import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { Dropdown } from "./Dropdown";
import { BulletButton } from "./BulletButton";

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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const initialConfig: InitialConfig = { capacity, winningScore };
  return (
    <LobbyPageCard>
      <Header className="mt-4 mb-2">Create Game</Header>
      <MultiSelect className="mb-3" options={["Public", "Private"]} selected={visibility} onSelect={setVisibility} />
      <Dropdown className="mb-3" width="w-56" options={Object.values(Region)} selected={region} onSelect={setRegion} />
      <Dropdown
        className="mb-3"
        width="w-56"
        options={[1, 2, 3, 4, 5, 6, 7]}
        format={(s) => `${s} players`}
        selected={capacity}
        onSelect={(s) => setCapacity(Number(s))}
      />
      <Dropdown
        className="mb-3"
        width="w-56"
        options={[5, 10, 15, 20, 25]}
        format={(s) => `${s} kills to win`}
        selected={winningScore}
        onSelect={(s) => setWinningScore(Number(s))}
      />
      <button
        className="mb-3"
        onClick={async () => {
          if (!isLoading) {
            setIsLoading(true);
            try {
              const lobby =
                visibility === "Public"
                  ? await lobbyClient.createPublicLobbyV2(playerToken, region, initialConfig)
                  : await lobbyClient.createPrivateLobbyV2(playerToken, region, initialConfig);
              joinRoom(lobby.roomId);
            } catch (e) {
              setIsLoading(false);
              setError(e.toString());
            }
          }
        }}
      >
        <BulletButton text={"CREATE!"} large />
      </button>
      {isLoading && <div className={"text-secondary-700 inline-flex items-center"}>Loading..</div>}
      {error && <div className={"mb-3 text-brand-500 text-xs"}>{error}</div>}
    </LobbyPageCard>
  );
}
