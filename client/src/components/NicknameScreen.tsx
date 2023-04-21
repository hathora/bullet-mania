import React from "react";

import { SessionMetadata } from "../../../common/types";

import { LobbyPageCard } from "./LobbyPageCard";
import { Header } from "./Header";

interface NicknameScreenProps {
  sessionMetadata: SessionMetadata | undefined;
  setIsNicknameAcked: (isNicknameAcked: boolean) => void;
}

export function NicknameScreen(props: NicknameScreenProps) {
  const { sessionMetadata, setIsNicknameAcked } = props;
  const [nickname, setNickname] = React.useState(sessionStorage.getItem("topdown-shooter-nickname"));
  const [error, setError] = React.useState<string | undefined>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);
  inputRef.current?.focus();
  return (
    <div className="bg-[url('/splash.png')] h-full flex flex-col p-1 relative">
      <div className={"flex items-center justify-center mt-6 mb-4"}>
        <img src="lobby_header.png" alt="logo" className="" />
      </div>
      <div className="flex overflow-hidden h-full w-full justify-between">
        <div className="flex flex-col grow w-[240px]">
          <LobbyPageCard className="h-full">
            <Header className="mt-3 mb-1">Joining...</Header>
            <div className="px-4 py-2 bg-secondary-600 rounded placeholder:text-secondary-800 text-secondary-800 cursor-pointer mb-3">
              {makePretty(sessionMetadata)}
            </div>
            <Header className="mt-5 mb-1">Enter Nickname</Header>
            <div className="flex flex-col">
              <input
                ref={inputRef}
                className="mx-auto w-60 px-4 py-2 bg-secondary-600 rounded placeholder:text-secondary-800 text-secondary-800 cursor-text mb-3"
                name="gameCode"
                placeholder="ENTER NICKNAME"
                value={nickname ?? ""}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (nickname && nickname.length > 1 && nickname.length < 20) {
                      sessionStorage.setItem("topdown-shooter-nickname", nickname);
                      setIsNicknameAcked(true);
                    } else {
                      setError("Nickname must be between 2 and 20 characters");
                    }
                  }
                }}
              />
              {error}
            </div>
          </LobbyPageCard>
        </div>
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
