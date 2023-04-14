import { useInterval } from "use-interval";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import { InitialConfig, InitialConfig, LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";
import { Lobby } from "../../../common/lobby-service/Lobby";

import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
interface PublicLobbyListProps {
  lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>;
  joinLobby: (roomId: string) => void;
}

export function PublicLobbyList(props: PublicLobbyListProps) {
  const { lobbyClient, joinLobby } = props;
  const lobbies = useLobbies(lobbyClient);
  return (
    <LobbyPageCard>
      <Header>Join Public Lobby</Header>
      <table className="w-full border">
        <tbody>
          <tr>
            <th className="border-x">Room ID</th>
            <th className="border-x">Spots</th>
            <th colSpan={2} className="border-x">
              Details
            </th>
            <th colSpan={1} className="border-x"></th>
          </tr>
          {lobbies.map((lobby) => (
            <tr key={`lobby_${lobby.createdBy}_${lobby.createdAt}`}>
              <td>{`${lobby.roomId}`}</td>
              <td>{`${lobby.state?.playerIds.length ?? 0}/${lobby.initialConfig.capacity}`}</td>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td>{`${FLAG_TABLE[lobby.region]} ${lobby.region}`}</td>
                      <td>{`${dayjs(lobby.createdAt).fromNow()}`}</td>
                    </tr>
                    <tr>
                      <td>{`${lobby.createdBy}`}</td>
                      <td>{`${lobby.initialConfig.winningScore} kills to win`}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td></td>
              <td>
                <button onClick={() => joinLobby(lobby.roomId)}>Join</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LobbyPageCard>
  );
}

function useLobbies<S extends object, I extends object>(lobbyClient: PlayerLobbyClient<S, I>): Lobby<S, I>[] {
  const [lobbies, setLobbies] = React.useState<Lobby<S, I>[]>([]);
  React.useEffect(() => {
    lobbyClient.listActivePublicLobbiesV2().then(setLobbies);
  }, [lobbyClient]);
  useInterval(() => {
    lobbyClient.listActivePublicLobbiesV2().then(setLobbies);
  }, 2000);
  return lobbies;
}

const FLAG_TABLE: Record<Region, string> = {
  Seattle: "🇺🇸",
  Chicago: "🇺🇸",
  London: "🇬🇧",
  Frankfurt: "🇩🇪",
  Mumbai: "🇮🇳",
  Singapore: "🇸🇬",
  Tokyo: "🇯🇵",
  Sydney: "🇦🇺",
  Washington_DC: "🇺🇸",
  Sao_Paulo: "🇧🇷",
};
