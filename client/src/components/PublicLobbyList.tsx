import { useInterval } from "use-interval";
import React, { useEffect } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
// eslint-disable-next-line import/order
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import { ClockIcon, TrophyIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";

import { LOCAL_CONNECTION_DETAILS } from "../utils";
import { InitialConfig, LobbyState } from "../../../common/types";
import { Region } from "../../../common/lobby-service/Region";
import { PlayerLobbyClient } from "../../../common/lobby-service/PlayerLobbyClient";
import { Lobby } from "../../../common/lobby-service/Lobby";

import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { BulletButton } from "./BulletButton";

interface PublicLobbyListProps {
  lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>;
}

export function PublicLobbyList(props: PublicLobbyListProps) {
  const { lobbyClient } = props;
  const lobbies = useLobbies(lobbyClient);
  const [readyRooms, setReadyRooms] = React.useState<Set<string>>(new Set());
  useEffect(() => {
    lobbies.forEach(async (l) => {
      // Ensure that lobby is ready for connections before adding to visible lobby list
      await lobbyClient.getConnectionDetailsForLobby(l.roomId, LOCAL_CONNECTION_DETAILS);
      setReadyRooms((prev) => {
        return new Set([...prev, l.roomId]);
      });
    });
  }, [lobbies, lobbyClient]);
  return (
    <LobbyPageCard className={""}>
      <Header className="mt-4 mb-2">Join Public Game</Header>
      <table className="w-full mb-4 border border-secondary-700 rounded-sm">
        <thead className={"flex w-full border-b border-secondary-700"}>
          <tr className="flex w-full bg-secondary-500 text-secondary-800">
            <th className="w-24 py-1 text-sm font-medium border-r border-secondary-700">Room ID</th>
            <th className="w-16 py-1 text-sm font-medium border-r border-secondary-700">Spots</th>
            <th className="w-56 py-1 text-sm font-medium border-r border-secondary-700">Details</th>
            <th className="w-20 py-1 text-sm font-medium"> </th>
          </tr>
        </thead>
        <tbody
          className={`flex flex-col items-center ${
            lobbies.length > 8 ? "overflow-y-scroll" : "overflow-y-auto"
          } w-full`}
          style={{ maxHeight: "330px" }}
        >
          {lobbies
            .filter((l) => readyRooms.has(l.roomId))
            .sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0))
            .map((lobby, index) => (
              <tr
                key={`lobby_${lobby.createdBy}_${lobby.createdAt}`}
                className={"flex w-full text-secondary-900 odd:bg-secondary-600"}
              >
                <td
                  className={`w-24 border-r text-xs flex items-center justify-center ${
                    index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"
                  }`}
                >{`${lobby.roomId}`}</td>
                <td
                  className={`w-16 border-r text-sm flex items-center justify-center ${
                    index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"
                  }`}
                >
                  <div className={"flex items-center justify-center gap-1"}>
                    <UsersIcon className="h-4 w-4 text-secondary-700" />
                    {`${lobby.state ? Object.keys(lobby.state.playerNicknameMap).length : 0}/${
                      lobby.initialConfig.capacity
                    }`}
                  </div>
                </td>
                <td
                  className={`w-56 col-span-2 flex justify-around px-0.5 py-0.5 text-xs border-r ${
                    index % 2 === 0 ? "border-secondary-400" : "border-secondary-600"
                  }`}
                >
                  <div className={"grid grid-cols-2 grid-rows-2 gap-x-1"}>
                    <div className={"flex items-center text-xxs"}>{`${FLAG_TABLE[lobby.region]} ${lobby.region}`}</div>
                    <div className={"flex items-center gap-1 text-xxs"}>
                      <ClockIcon className="h-4 w-4 text-secondary-700" />
                      <span className={"max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap"}>{`${dayjs(
                        lobby.createdAt
                      ).fromNow()}`}</span>
                    </div>
                    <div className={"flex items-center"}>
                      <UserIcon className="h-4 w-4 text-secondary-700 text-xxs" />
                      {lobby.state?.playerNicknameMap[lobby.createdBy] ? (
                        `${lobby.state.playerNicknameMap[lobby.createdBy]}`
                      ) : (
                        <span className="italic">creator left</span>
                      )}
                    </div>
                    <div className={"flex items-center gap-1 text-xxs"}>
                      <TrophyIcon className="h-4 w-4 text-secondary-700" />
                      {`${lobby.initialConfig.winningScore} kills to win`}
                    </div>
                  </div>
                </td>
                <td className={"w-20"}>
                  {lobby.state?.isGameEnd ? (
                    <div className={"leading-4 mt-0.5"}>
                      <span>GAME ENDED</span>
                    </div>
                  ) : (
                    <button
                      className={"mt-2"}
                      onClick={() => {
                        if (
                          !lobby.state ||
                          Object.keys(lobby.state.playerNicknameMap).length < lobby.initialConfig.capacity
                        ) {
                          window.location.href = `/${lobby.roomId}`; //update url
                        }
                      }}
                    >
                      <BulletButton
                        disabled={
                          lobby.state &&
                          Object.keys(lobby.state.playerNicknameMap).length >= lobby.initialConfig.capacity
                        }
                        text={"JOIN!"}
                      />
                    </button>
                  )}
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

export const FLAG_TABLE: Record<Region, string> = {
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
