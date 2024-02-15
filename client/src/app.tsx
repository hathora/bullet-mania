import ReactDOM from "react-dom/client";
import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HathoraConnection } from "@hathora/client-sdk";

import { SessionMetadata, RoomConfig } from "../../common/types";

import { getHathoraSdk, isReadyForConnect, Token } from "./utils";
import { Socials } from "./components/website/Socials";
import { HathoraLogo } from "./components/website/HathoraLogo";
import { GithubCorner } from "./components/website/GithubCorner";
import { Footer } from "./components/website/Footer";
import { ExplanationText, NavLink } from "./components/website/ExplanationText";
import { Arrow } from "./components/website/Arrow";
import { NicknameScreen } from "./components/lobby/NicknameScreen";
import { LobbySelector } from "./components/lobby/LobbySelector";
import { BulletButton } from "./components/lobby/BulletButton";
import { GameComponent, GameConfig } from "./components/GameComponent";

const appId = process.env.HATHORA_APP_ID;
const hathoraSdk = getHathoraSdk(appId);

function App() {
  const [googleIdToken, setGoogleIdToken] = useState<string | undefined>();
  const token = useAuthToken(googleIdToken);
  const [connection, setConnection] = useState<HathoraConnection | undefined>();
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | undefined>(undefined);
  const [failedToConnect, setFailedToConnect] = useState(false);
  const [roomIdNotFound, setRoomIdNotFound] = useState<string | undefined>(undefined);
  const [isNicknameAcked, setIsNicknameAcked] = React.useState<boolean>(false);

  if (appId == null || token == null) {
    return (
      <div
        className={"bg-neutralgray-700 text-neutralgray-400 text-xl w-full h-screen flex items-center justify-center"}
      >
        Loading...
      </div>
    );
  }
  const roomIdFromUrl = getRoomIdFromUrl();
  if (
    roomIdFromUrl != null &&
    sessionMetadata?.roomId != roomIdFromUrl &&
    roomIdNotFound == null &&
    !failedToConnect &&
    !sessionMetadata?.isGameEnd
  ) {
    // Once we parse roomId from the URL, get connection details to connect player to the server
    isReadyForConnect(appId, roomIdFromUrl, hathoraSdk)
      .then(async ({ connectionInfo, lobbyInfo }) => {
        setRoomIdNotFound(undefined);
        if (connection != null) {
          connection.disconnect(1000);
        }

        try {
          const roomConfig = JSON.parse(lobbyInfo.roomConfig) as RoomConfig;

          if (!roomConfig.isGameEnd) {
            const connect = new HathoraConnection(roomIdFromUrl, connectionInfo);
            connect.onClose(async () => {
              // If game has ended, we want updated lobby state
              const { lobbyV3: updatedLobbyInfo } = await hathoraSdk.lobbyV3.getLobbyInfoByRoomId(roomIdFromUrl);
              if (updatedLobbyInfo == null) {
                return;
              }
              const updatedRoomConfig = JSON.parse(updatedLobbyInfo.roomConfig) as RoomConfig;
              setSessionMetadata({
                serverUrl: `${connectionInfo.host}:${connectionInfo.port}`,
                region: updatedLobbyInfo.region,
                roomId: updatedLobbyInfo.roomId,
                capacity: updatedRoomConfig.capacity,
                winningScore: updatedRoomConfig.winningScore,
                isGameEnd: !!updatedRoomConfig.isGameEnd,
                winningPlayerId: updatedRoomConfig.winningPlayerId,
                playerNicknameMap: updatedRoomConfig.playerNicknameMap,
                creatorId: updatedLobbyInfo.createdBy,
              });
              setFailedToConnect(true);
            });
            setConnection(connect);
          }
          setSessionMetadata({
            serverUrl: `${connectionInfo.host}:${connectionInfo.port}`,
            region: lobbyInfo.region,
            roomId: lobbyInfo.roomId,
            capacity: roomConfig.capacity,
            winningScore: roomConfig.winningScore,
            isGameEnd: roomConfig.isGameEnd,
            winningPlayerId: roomConfig.winningPlayerId,
            playerNicknameMap: roomConfig.playerNicknameMap,
            creatorId: lobbyInfo.createdBy,
          });
        } catch (e) {
          setRoomIdNotFound(roomIdFromUrl);
        }
      })
      .catch(() => {
        setRoomIdNotFound(roomIdFromUrl);
      });
  }
  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_AUTH_CLIENT_ID ?? ""}>
      <GithubCorner />
      <div className="py-5 overflow-hidden" style={{ backgroundColor: "#0E0E1B" }}>
        <div className="md:w-fit mx-auto px-2 md:px-0">
          <div className={"flex justify-center items-center"}>
            <div className={"flex justify-center items-center md:items-end"}>
              <a href="https://hathora.dev" className={"w-[150px] md:w-[207px]"}>
                <HathoraLogo />
              </a>
              <div className={"mx-3 text-hathoraSecondary-400 text-xs md:text-lg text-baseline"}>PRESENTS</div>
            </div>
            <a href="/" className={""}>
              <img src="bullet_mania_logo_light.png" className="h-[40px] md:h-[60px]" alt="logo" />
            </a>
          </div>
          <p className={"visible md:hidden text-neutralgray-400 text-center mt-3"}>
            Bullet Mania isn't currently playable on mobile <br />
            <NavLink headingId={"docsTop"}>Skip to documentation</NavLink>
          </p>
          <div className={"md:mt-4 relative"} style={{ width: GameConfig.width, height: GameConfig.height }}>
            {failedToConnect ? (
              <div className="border text-white flex flex-wrap flex-col justify-center h-full w-full content-center text-secondary-400 text-center">
                Connection was closed
                <br />
                {sessionMetadata?.isGameEnd ? (
                  <>
                    <div className={"text-secondary-600"}>Game has ended</div>
                    <div className={"text-secondary-600"}>
                      {`${
                        sessionMetadata.winningPlayerId
                          ? sessionMetadata.playerNicknameMap[sessionMetadata.winningPlayerId]
                          : sessionMetadata.winningPlayerId
                      } won!`}
                    </div>
                  </>
                ) : (
                  <span className={"text-secondary-600"}>Game is full</span>
                )}
                <br />
                <a href={"/"} className={"mt-2"}>
                  <BulletButton text={"Return to Lobby"} xlarge />
                </a>
              </div>
            ) : (
              <>
                <div
                  className={
                    "hidden lg:flex items-center gap-2 absolute font-hathora font-bold text-3xl text-neutralgray-550 -left-[220px] top-[272px]"
                  }
                >
                  <div>TRY IT</div>
                  <div>
                    <Arrow />
                  </div>
                </div>
                <div
                  className={
                    "hidden lg:flex items-center gap-2 absolute font-hathora font-bold text-3xl text-neutralgray-550 -left-[290px] top-[658px]"
                  }
                >
                  <div>LEARN HOW</div>
                  <div>
                    <Arrow />
                  </div>
                </div>
                {connection == null && !sessionMetadata?.isGameEnd && !roomIdFromUrl ? (
                  <LobbySelector
                    appId={appId}
                    playerToken={token}
                    roomIdNotFound={roomIdNotFound}
                    setGoogleIdToken={setGoogleIdToken}
                  />
                ) : !isNicknameAcked && !sessionMetadata?.isGameEnd ? (
                  <NicknameScreen sessionMetadata={sessionMetadata} setIsNicknameAcked={setIsNicknameAcked} />
                ) : (
                  <></>
                )}
                <GameComponent
                  connection={connection}
                  token={token}
                  sessionMetadata={sessionMetadata}
                  isNicknameAcked={isNicknameAcked}
                />
              </>
            )}
          </div>
          <Socials roomId={sessionMetadata?.roomId} />
          <ExplanationText />
        </div>
      </div>
      <Footer />
    </GoogleOAuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

// Custom hook to access auth token
function useAuthToken(googleIdToken: string | undefined): Token | undefined {
  const [token, setToken] = React.useState<Token | undefined>();
  useEffect(() => {
    if (appId != null) {
      getToken(googleIdToken).then(setToken);
    }
  }, [googleIdToken]);
  return token;
}

// 1. Check sessionStorage for existing token
// 2. If googleIdToken passed, use it for auth and store token
// 3. If none above, then use anonymous auth
async function getToken(googleIdToken: string | undefined): Promise<Token> {
  const maybeToken = sessionStorage.getItem("bullet-mania-token");
  const maybeTokenType = sessionStorage.getItem("bullet-mania-token-type");
  if (maybeToken !== null && maybeTokenType != null) {
    return {
      type: maybeTokenType,
      value: maybeToken,
    } as Token;
  }
  if (googleIdToken == null) {
    const { loginResponse } = await hathoraSdk.authV1.loginAnonymous();
    if (loginResponse == null) {
      throw new Error("Failed to login anonymously");
    }
    return { value: loginResponse.token, type: "anonymous" };
  }
  const { loginResponse } = await hathoraSdk.authV1.loginGoogle({ idToken: googleIdToken });
  if (loginResponse == null) {
    throw new Error("Failed to login with google");
  }
  sessionStorage.setItem("bullet-mania-token", loginResponse.token);
  sessionStorage.setItem("bullet-mania-token-type", "google");
  return { value: loginResponse.token, type: "google" };
}

function getRoomIdFromUrl(): string | undefined {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop();
  }
}
