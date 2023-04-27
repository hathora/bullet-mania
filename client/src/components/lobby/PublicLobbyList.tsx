import { useInterval } from "use-interval";
import React, { useEffect } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
// eslint-disable-next-line import/order
import dayjs from "dayjs";
dayjs.extend(relativeTime);

import { ClockIcon, TrophyIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { LobbyV2Api, RoomV1Api } from "@hathora/hathora-cloud-sdk";

import { isReadyForConnect } from "../../utils";
import { LobbyState } from "../../../../common/types";
import { Region } from "../../../../common/lobby-service/Region";
import { Lobby } from "../../../../common/lobby-service/Lobby";

import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { BulletButton } from "./BulletButton";

const lobbyClient = new LobbyV2Api();
const roomClient = new RoomV1Api();

export function PublicLobbyList() {
  const lobbies = useLobbies();
  const [readyRooms, setReadyRooms] = React.useState<Set<string>>(new Set());
  useEffect(() => {
    lobbies.forEach(async (l) => {
      // Ensure that lobby is ready for connections before adding to visible lobby list
      await isReadyForConnect(roomClient, lobbyClient, l.roomId);
      setReadyRooms((prev) => {
        return new Set([...prev, l.roomId]);
      });
    });
  }, [lobbies]);
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
          {lobbies.length > 0 ? (
            lobbies
              .filter((l) => readyRooms.has(l.roomId))
              .sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0))
              .map((lobby, index) => {
                const lobbyState = lobby.state as LobbyState | undefined;
                return (
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
                        {`${lobbyState?.playerNicknameMap ? Object.keys(lobbyState.playerNicknameMap).length : 0}/${
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
                        <div className={"flex items-center text-xxs"}>{`${FLAG_TABLE[lobby.region]} ${
                          lobby.region
                        }`}</div>
                        <div className={"flex items-center gap-1 text-xxs"}>
                          <ClockIcon className="h-4 w-4 text-secondary-700" />
                          <span className={"max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap"}>{`${dayjs(
                            lobby.createdAt
                          ).fromNow()}`}</span>
                        </div>
                        <div className={"flex items-center"}>
                          <UserIcon className="h-4 w-4 text-secondary-700 text-xxs" />
                          {lobbyState && lobbyState.playerNicknameMap[lobby.createdBy] ? (
                            `${lobbyState.playerNicknameMap[lobby.createdBy]}`
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
                      {lobbyState?.isGameEnd ? (
                        <div className={"leading-4 mt-0.5"}>
                          <span>GAME ENDED</span>
                        </div>
                      ) : (
                        <button
                          className={"mt-2"}
                          onClick={() => {
                            if (
                              !lobbyState ||
                              Object.keys(lobbyState.playerNicknameMap).length < lobby.initialConfig.capacity
                            ) {
                              window.location.href = `/${lobby.roomId}`; //update url
                            }
                          }}
                        >
                          <BulletButton
                            disabled={
                              lobbyState &&
                              Object.keys(lobbyState.playerNicknameMap).length >= lobby.initialConfig.capacity
                            }
                            text={"JOIN!"}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
          ) : (
            <tr className={"text-secondary-800 text-sm py-2"}>
              No active games, try <strong>creating a game</strong> and <strong>sharing the link!</strong>
            </tr>
          )}
        </tbody>
      </table>
    </LobbyPageCard>
  );
}

function useLobbies<S extends object, I extends object>(): Lobby<S, I>[] {
  const [lobbies, setLobbies] = React.useState<Lobby<S, I>[]>([]);
  React.useEffect(() => {
    lobbyClient.listActivePublicLobbies(process.env.HATHORA_APP_ID).then(setLobbies);
  }, []);
  useInterval(() => {
    lobbyClient.listActivePublicLobbies(process.env.HATHORA_APP_ID).then(setLobbies);
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
