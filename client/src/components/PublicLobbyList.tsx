import { useInterval } from "use-interval";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import { LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";
import { Lobby } from "../../../common/lobby-service/Lobby";

import { LobbyPageCard } from "./LobbyPageCard";
interface PublicLobbyListProps {
  lobbyClient: PlayerLobbyClient<LobbyState>;
  joinLobby: (roomId: string) => void;
}

export function PublicLobbyList(props: PublicLobbyListProps) {
  const { lobbyClient, joinLobby } = props;
  const lobbies = useLobbies(lobbyClient);
  return (
    <LobbyPageCard>
      <Header text="Join Public Lobby" />
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
              <td>{`${lobby.state?.players.length ?? 0}/${lobby.capacity ?? 0}`}</td>
              <td>
                <table>
                  <tbody>
                    <tr>
                      <td>{`${FLAG_TABLE[lobby.region]} ${lobby.region}`}</td>
                      <td>{`${dayjs(lobby.createdAt).fromNow()}`}</td>
                    </tr>
                    <tr>
                      <td>{`${lobby.createdBy}`}</td>
                      <td>{`${lobby.state?.killsToWin ?? 0} kills to win`}</td>
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

function useLobbies(lobbyClient: PlayerLobbyClient<LobbyState>): Lobby<LobbyState>[] {
  const [lobbies, setLobbies] = React.useState<Lobby<LobbyState>[]>([]);
  React.useEffect(() => {
    lobbyClient.listActivePublicLobbiesV2().then(setLobbies);
  }, [lobbyClient]);
  useInterval(() => {
    lobbyClient.listActivePublicLobbiesV2().then(setLobbies);
  }, 2000);
  return lobbies;
}

function Header(props: { text: string }) {
  return <h1 className="text-2xl font-bold">{props.text}</h1>;
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
