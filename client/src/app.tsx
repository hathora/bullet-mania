import ReactDOM from "react-dom/client";
import React, { useCallback, useEffect, useState } from "react";
import React from "react";
import { HathoraConnection } from "@hathora/client-sdk";

import { SessionMetadata, InitialConfig, LobbyState } from "../../common/types";
import { PlayerLobbyClient } from "../../common/lobby-service/PlayerLobbyClient";
import { AuthClient } from "../../common/lobby-service/AuthClient";

import { Socials } from "./components/Socials";
import { LobbySelector } from "./components/LobbySelector";
import { HathoraLogo } from "./components/HathoraLogo";
import { GameComponent, GameConfig } from "./components/GameComponent";
import { ExplanationText } from "./components/ExplanationText";

function App() {
  const appId = process.env.HATHORA_APP_ID;
  const token = useAuthToken(appId);
  const [connection, setConnection] = useState<HathoraConnection | undefined>();
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata>({ serverUrl: "", winningScore: 15 });
  const [failedToConnect, setFailedToConnect] = useState(false);

  const joinRoom = useCallback(
    (lobbyClient: PlayerLobbyClient<LobbyState, InitialConfig>) => (roomId: string) =>
      lobbyClient
        .getConnectionDetailsForLobby(roomId, { host: "localhost", port: 4000, transportType: "tcp" as const })
        .then(async (connectionDetails) => {
          if (connection != null) {
            connection.disconnect(1000);
          }

          const res = await lobbyClient.getLobbyInfo(roomId);

          const connect = new HathoraConnection(roomId, connectionDetails);
          connect.onClose(() => setFailedToConnect(true));
          setConnection(connect);
          setSessionMetadata({
            serverUrl: `${connectionDetails.host}:${connectionDetails.port}`,
            winningScore: res.initialConfig.winningScore,
          });
          history.pushState({}, "", `/${roomId}`); //update url
        }),
    [connection]
  );
  if (appId == null || token == null) {
    return <div>loading...</div>;
  }
  const lobbyClient = new PlayerLobbyClient<LobbyState, InitialConfig>(appId);
  const roomIdFromUrl = getRoomIdFromUrl();
  if (roomIdFromUrl != null && connection == null) {
    joinRoom(lobbyClient)(roomIdFromUrl);
  }
  return (
    <div className="py-5" style={{ backgroundColor: "#0E0E1B" }}>
      <div className="w-fit mx-auto">
        <HathoraLogo />
        <div style={{ width: GameConfig.width, height: GameConfig.height }}>
          {failedToConnect ? (
            <div className="border text-white flex flex-wrap flex-col justify-center h-full w-full content-center">
              Failed to connect to server
            </div>
          ) : (
            <>
              {connection == null && (
                <LobbySelector lobbyClient={lobbyClient} joinRoom={joinRoom(lobbyClient)} playerToken={token} />
              )}
              <GameComponent connection={connection} token={token} sessionMetadata={sessionMetadata} />
            </>
          )}
        </div>
        <Socials />
        <ExplanationText />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

function useAuthToken(appId: string | undefined): string | undefined {
  const [token, setToken] = React.useState<string | undefined>();
  useEffect(() => {
    if (appId != null) {
      const authClient = new AuthClient(appId);
      getToken(authClient).then(setToken);
    }
  }, [appId]);
  return token;
}

// The getToken function first checks sessionStorage to see if there is an existing token, and if there is returns it. If not, it logs the user into a new session and updates the sessionStorage key.
async function getToken(client: AuthClient): Promise<string> {
  const maybeToken = sessionStorage.getItem("topdown-shooter-token");
  if (maybeToken !== null) {
    return maybeToken;
  }
  const token = await client.loginAnonymous();
  sessionStorage.setItem("topdown-shooter-token", token);
  return token;
}

function getRoomIdFromUrl(): string | undefined {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop();
  }
}
