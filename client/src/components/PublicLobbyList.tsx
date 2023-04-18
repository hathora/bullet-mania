import { useInterval } from "use-interval";
import React, { useEffect } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
// eslint-disable-next-line import/order
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import { ClockIcon, TrophyIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";

import { InitialConfig, LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";
import { Lobby } from "../../../common/lobby-service/Lobby";

import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { BulletButton } from "./BulletButton";

interface PublicLobbyListProps {
  lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>;
  joinRoom: (roomId: string) => void;
}

export function PublicLobbyList(props: PublicLobbyListProps) {
  const { lobbyClient, joinRoom } = props;
  const lobbies = useLobbies(lobbyClient);
  const [readyRooms, setReadyRooms] = React.useState<Set<string>>(new Set());
  //BUG! this waits until all lobbies are ready before updating the list, rather than rendering
  //the ready lobbies as they become ready. not good if we hit scale!
  useEffect(() => {
    Promise.all(
      lobbies.map(async (l) => {
        await lobbyClient.getConnectionDetailsForLobby(l.roomId);
        return l.roomId;
      })
    )
      .then((rooms) => new Set(rooms))
      .then(setReadyRooms);
  }, [lobbies, lobbyClient]);
  return (
    <LobbyPageCard className={""}>
      <Header className="mt-4 mb-2">Join Public Lobby</Header>
      <table className="w-full mb-4 border border-secondary-700 rounded-sm overflow-y-auto max-h-[390px]">
        <tbody>
          <tr className="bg-secondary-500 text-secondary-800">
            <th className="py-1 text-sm font-medium border border-secondary-700">Room ID</th>
            <th className="py-1 text-sm font-medium border border-secondary-700">Spots</th>
            <th colSpan={2} className="py-1 text-sm font-medium border border-secondary-700">
              Details
            </th>
            <th colSpan={1} className="py-1 text-sm font-medium border border-secondary-700"></th>
          </tr>
          {lobbies
            .filter((l) => readyRooms.has(l.roomId))
            .map((lobby, index) => (
              <tr
                key={`lobby_${lobby.createdBy}_${lobby.createdAt}`}
                className={`text-secondary-900 ${index % 2 === 0 ? "bg-secondary-600" : ""}`}
              >
                <td
                  className={`border-r text-sm ${index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"}`}
                >{`${lobby.roomId}`}</td>
                <td className={`border-r text-sm ${index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"}`}>
                  <div className={"flex items-center justify-center gap-1"}>
                    <UsersIcon className="h-4 w-4 text-secondary-700" />
                    {`${lobby.state?.playerCount ?? 0}/${lobby.initialConfig.capacity}`}
                  </div>
                </td>
                <td className={"flex justify-center px-0.5 py-1 text-xs"}>
                  <div className={"grid grid-cols-2 grid-rows-2 gap-x-2"}>
                    <div className={"flex items-center"}>{`${FLAG_TABLE[lobby.region]} ${lobby.region}`}</div>
                    <div className={"flex items-center gap-1 text-xs"}>
                      <ClockIcon className="h-4 w-4 text-secondary-700" />
                      {`${dayjs(lobby.createdAt).fromNow()}`}
                    </div>
                    <div className={"flex items-center"}>
                      <UserIcon className="h-4 w-4 text-secondary-700" />
                      {lobby.createdBy}
                    </div>
                    <div className={"flex items-center gap-1 text-xs"}>
                      <TrophyIcon className="h-4 w-4 text-secondary-700" />
                      {`${lobby.initialConfig.winningScore} kills to win`}
                    </div>
                  </div>
                </td>
                <td className={`border-r ${index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"}`}></td>
                <td>
                  <button className={"mt-2"} onClick={() => joinRoom(lobby.roomId)}>
                    <BulletButton text={"JOIN!"} />
                  </button>
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
    lobbyClient.listActivePublicLobbies().then(setLobbies);
  }, [lobbyClient]);
  useInterval(() => {
    lobbyClient.listActivePublicLobbies().then(setLobbies);
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
