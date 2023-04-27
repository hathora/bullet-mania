import React from "react";
import dayjs from "dayjs";
import { UsersIcon } from "@heroicons/react/24/solid";
import { ClockIcon, TrophyIcon, UserIcon } from "@heroicons/react/24/outline";

import { SessionMetadata } from "../../../common/types";

import { FLAG_TABLE } from "./PublicLobbyList";
import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";
import { BulletButton } from "./BulletButton";

interface NicknameScreenProps {
  sessionMetadata: SessionMetadata | undefined;
  setIsNicknameAcked: (isNicknameAcked: boolean) => void;
}

export function NicknameScreen(props: NicknameScreenProps) {
  const { sessionMetadata, setIsNicknameAcked } = props;
  const [nickname, setNickname] = React.useState(sessionStorage.getItem("bullet-mania-nickname"));
  const [error, setError] = React.useState<string | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);
  inputRef.current?.focus();
  function handleSubmit() {
    if (nickname && nickname.length > 1 && nickname.length < 20) {
      sessionStorage.setItem("bullet-mania-nickname", nickname);
      setIsNicknameAcked(true);
    } else {
      setError("Nickname must be between 2 and 20 characters");
    }
  }

  return (
    <div className="bg-[url('/splash.png')] h-full flex flex-col p-1 relative">
      <div className={"flex items-center justify-center mt-6 mb-4"}>
        <img src="lobby_header.png" alt="logo" className="" />
      </div>
      <div className="flex overflow-hidden h-full w-full justify-center">
        <LobbyPageCard className="w-[300px] h-fit">
          <Header className="mt-3 mb-1">Join Game</Header>
          <div className="px-4 py-2 rounded placeholder:text-secondary-800 text-secondary-800 cursor-pointer mb-3">
            <div>Room Code: {sessionMetadata?.roomId}</div>
            <div className={"text-sm text-secondary-700 mb-4"}>{sessionMetadata?.serverUrl}</div>
            <div className={"mx-auto grid grid-cols-2 grid-rows-2 gap-x-1"}>
              <div className={"flex items-center gap-1 text-xxs"}>
                <UserIcon className="h-4 w-4 text-secondary-700 text-xxs" />
                host:
                {sessionMetadata?.playerNicknameMap[sessionMetadata.creatorId] ? (
                  `${sessionMetadata.playerNicknameMap[sessionMetadata.creatorId]}`
                ) : (
                  <span className="italic">{sessionMetadata?.creatorId}</span>
                )}
              </div>
              <div className={"flex items-center text-xxs"}>
                {sessionMetadata?.region ? `${FLAG_TABLE[sessionMetadata.region]} ${sessionMetadata.region}` : ""}
              </div>
              <div className={"flex items-center gap-1 text-xxs"}>
                <UsersIcon className="h-4 w-4 text-secondary-700" />
                {`${sessionMetadata?.capacity} max players`}
              </div>
              <div className={"flex items-center gap-1 text-xxs"}>
                <TrophyIcon className="h-4 w-4 text-secondary-700" />
                {`${sessionMetadata?.winningScore} kills to win`}
              </div>
            </div>
          </div>
          <Header className="mt-5 mb-1">NAME:</Header>
          <div className="flex flex-col items-center mb-4">
            <input
              ref={inputRef}
              className="mx-auto w-60 px-4 py-2 bg-secondary-600 rounded placeholder:text-secondary-800 text-secondary-800 cursor-text mb-3"
              name="gameCode"
              placeholder="ENTER NICKNAME"
              value={nickname ?? ""}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
            {error && <div className={"-mt-1 text-brand-500 text-xs"}>{error}</div>}
            <button
              className={"mt-2"}
              onClick={() => {
                handleSubmit();
              }}
            >
              <BulletButton large text={"READY!"} />
            </button>
          </div>
        </LobbyPageCard>
      </div>
    </div>
  );
}

function makePretty(sessionMetadata: SessionMetadata | undefined) {
  return (
    sessionMetadata && (
      <>
        {sessionMetadata.playerNicknameMap[sessionMetadata.creatorId] && (
          <div>Creator: {sessionMetadata.playerNicknameMap[sessionMetadata.creatorId]}</div>
        )}
        <div>Room Code: {sessionMetadata.roomId}</div>
        <div>Region: {sessionMetadata.region}</div>
        <div>Capacity: {sessionMetadata.capacity}</div>
        <div>Winning Score: {sessionMetadata.winningScore}</div>
        {Object.keys(sessionMetadata.playerNicknameMap).length > 0 && (
          <div>Players: {Object.values(sessionMetadata.playerNicknameMap).join(", ")}</div>
        )}
      </>
    )
  );
}
