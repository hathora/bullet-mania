import ReactDOM from "react-dom/client";
import React, { useCallback, useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HathoraConnection } from "@hathora/client-sdk";

import { SessionMetadata, InitialConfig, LobbyState, Token } from "../../common/types";
import { PlayerLobbyClient } from "../../common/lobby-service/PlayerLobbyClient";
import { AuthClient } from "../../common/lobby-service/AuthClient";

import { Socials } from "./components/Socials";
import { LobbySelector } from "./components/LobbySelector";
import { HathoraLogo } from "./components/HathoraLogo";
import { GameComponent, GameConfig } from "./components/GameComponent";
import { ExplanationText } from "./components/ExplanationText";
import { BulletButton } from "./components/BulletButton";

function App() {
  const appId = process.env.HATHORA_APP_ID;
  const [googleIdToken, setGoogleIdToken] = useState<string | undefined>();
  const token = useAuthToken(appId, googleIdToken);
  const [connection, setConnection] = useState<HathoraConnection | undefined>();
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata>({ serverUrl: "", winningScore: 15 });
  const [failedToConnect, setFailedToConnect] = useState(false);
  const [roomIdNotFound, setRoomIdNotFound] = useState<string | undefined>(undefined);

  const joinRoom = useCallback(
    (lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>) => (roomId: string) =>
      lobbyClient
        .getConnectionDetailsForLobby(roomId, { host: "localhost", port: 4000, transportType: "tcp" as const })
        .then(async (connectionDetails) => {
          setRoomIdNotFound(undefined);
          if (connection != null) {
            connection.disconnect(1000);
          }

          try {
            const lobbyInfo = await lobbyClient.getLobbyInfo(roomId);

            if (!lobbyInfo.state?.isGameEnd) {
              const connect = new HathoraConnection(roomId, connectionDetails);
              connect.onClose(async () => {
                // If game has ended, we want updated lobby state
                const updatedLobbyInfo = await lobbyClient.getLobbyInfo(roomId);
                setSessionMetadata({
                  serverUrl: `${connectionDetails.host}:${connectionDetails.port}`,
                  region: updatedLobbyInfo.region,
                  roomId: updatedLobbyInfo.roomId,
                  capacity: updatedLobbyInfo.initialConfig.capacity,
                  winningScore: updatedLobbyInfo.initialConfig.winningScore,
                  isGameEnd: updatedLobbyInfo.state?.isGameEnd,
                  winningPlayer: updatedLobbyInfo.state?.winningPlayer,
                });
                setFailedToConnect(true);
              });
              setConnection(connect);
            }
            setSessionMetadata({
              serverUrl: `${connectionDetails.host}:${connectionDetails.port}`,
              region: lobbyInfo.region,
              roomId: lobbyInfo.roomId,
              capacity: lobbyInfo.initialConfig.capacity,
              winningScore: lobbyInfo.initialConfig.winningScore,
              isGameEnd: lobbyInfo.state?.isGameEnd,
              winningPlayer: lobbyInfo.state?.winningPlayer,
            });
            history.pushState({}, "", `/${roomId}`); //update url
          } catch (e) {
            setRoomIdNotFound(roomId);
          }
        })
        .catch(() => {
          setRoomIdNotFound(roomId);
        }),
    [connection]
  );
  if (appId == null || token == null) {
    return <div>loading...</div>;
  }
  const lobbyClient = new PlayerLobbyClient<LobbyState, InitialConfig>(appId);
  const roomIdFromUrl = getRoomIdFromUrl();
  if (roomIdFromUrl != null && connection == null && !sessionMetadata.isGameEnd) {
    joinRoom(lobbyClient)(roomIdFromUrl);
  }
  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_AUTH_CLIENT_ID ?? ""}>
      <div className="py-5" style={{ backgroundColor: "#0E0E1B" }}>
        <div className="w-fit mx-auto">
          <div className={"flex justify-center items-end"}>
            <HathoraLogo />
            <div className={"ml-4 text-hathoraSecondary-400 text-xl text-baseline"}>SAMPLE GAME</div>
          </div>
          <div className={"mt-4"} style={{ width: GameConfig.width, height: GameConfig.height }}>
            {failedToConnect ? (
              <div className="border text-white flex flex-wrap flex-col justify-center h-full w-full content-center text-secondary-400 text-center">
                Connection was closed
                <br />
                {sessionMetadata.isGameEnd ? (
                  <>
                    <div className={"text-secondary-600"}>Game has ended</div>
                    <div className={"text-secondary-600"}>{sessionMetadata.winningPlayer} won!</div>
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
                {connection == null && !sessionMetadata.isGameEnd && (
                  <LobbySelector
                    lobbyClient={lobbyClient}
                    joinRoom={joinRoom(lobbyClient)}
                    playerToken={token}
                    roomIdNotFound={roomIdNotFound}
                    setGoogleIdToken={setGoogleIdToken}
                  />
                )}
                <GameComponent connection={connection} token={token} sessionMetadata={sessionMetadata} />
              </>
            )}
          </div>
          <Socials roomId={sessionMetadata.roomId} />
          <ExplanationText />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

function useAuthToken(appId: string | undefined, googleIdToken: string | undefined): Token | undefined {
  const [token, setToken] = React.useState<Token | undefined>();
  useEffect(() => {
    if (appId != null) {
      const authClient = new AuthClient(appId);
      getToken(authClient, googleIdToken).then(setToken);
    }
  }, [appId, googleIdToken]);
  return token;
}

// The getToken function first checks sessionStorage to see if there is an existing token, and if there is returns it. If not, it logs the user into a new session and updates the sessionStorage key.
async function getToken(client: AuthClient, googleIdToken: string | undefined): Promise<Token> {
  const maybeToken = sessionStorage.getItem("topdown-shooter-token");
  const maybeTokenType = sessionStorage.getItem("topdown-shooter-token-type");
  if (maybeToken !== null && maybeTokenType != null) {
    return {
      type: maybeTokenType,
      value: maybeToken,
    } as Token;
  }
  if (googleIdToken == null) {
    const token = await client.loginAnonymous();
    return { value: token, type: "anonymous" };
  }
  const token = await client.loginGoogle(googleIdToken);
  sessionStorage.setItem("topdown-shooter-token", token);
  sessionStorage.setItem("topdown-shooter-token-type", "google");
  return { value: token, type: "google" };
}

function getRoomIdFromUrl(): string | undefined {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop();
  }
}
