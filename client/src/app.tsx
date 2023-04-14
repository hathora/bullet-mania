import { env } from "process";

import ReactDOM from "react-dom/client";
import React, { useCallback, useEffect, useState } from "react";
import { HathoraConnection } from "@hathora/client-sdk";

import { InitialConfig, LobbyState } from "../../common/types";
import { PlayerLobbyClient } from "../../common/lobby-service/PlayerLobbyClient";
import { AuthClient } from "../../common/lobby-service/AuthClient";

import { LobbySelector } from "./components/LobbySelector";
import { HathoraLogo } from "./components/HathoraLogo";
import { GameComponent, GameConfig } from "./components/GameComponent";
import { ExplanationText } from "./components/ExplanationText";

const ENDPOINT = "https://api.hathora.io";

function App() {
  const appId = process.env.APP_ID ?? env.APP_ID;
  const token = useAuthToken(appId, ENDPOINT);
  const [connection, setConnection] = useState<HathoraConnection | undefined>();

  const joinLobby = useCallback(
    (lobbyClient: PlayerLobbyClient<LobbyState>) => (roomId: string) =>
      lobbyClient.getConnectionDetailsForLobbyV2(roomId).then((connectionDetails) => {
        if (connection != null) {
          connection.disconnect(200);
        }
        if (import.meta.env.DEV) {
          setConnection(
            new HathoraConnection(roomId, { host: "localhost", port: 4000, transportType: "tcp" as const })
          );
        } else {
          setConnection(new HathoraConnection(roomId, connectionDetails));
        }
        history.pushState({}, "", `/${roomId}`); //update url
      }),
    [connection]
  );
  if (appId == null || token == null) {
    return <div>loading...</div>;
  }
  const lobbyClient = new PlayerLobbyClient<LobbyState, InitialConfig>(appId, ENDPOINT);
  const roomIdFromUrl = getRoomIdFromUrl();
  if (roomIdFromUrl != null) {
    joinLobby(lobbyClient)(roomIdFromUrl);
  }
  return (
    <div className="h-screen" style={{ backgroundColor: "#1E1E1E" }}>
      <div className="w-fit mx-auto">
        <HathoraLogo />
        <div style={{ width: GameConfig.width, height: GameConfig.height }}>
          {connection == null && (
            <LobbySelector lobbyClient={lobbyClient} joinLobby={joinLobby(lobbyClient)} playerToken={token} />
          )}
          <GameComponent connection={connection} token={token} />
        </div>
        <ExplanationText />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

function useAuthToken(appId: string | undefined, endpoint?: string): string | undefined {
  const [token, setToken] = React.useState<string | undefined>();
  useEffect(() => {
    if (appId != null) {
      const authClient = new AuthClient(appId, endpoint);
      getToken(authClient).then(setToken);
    }
  }, [appId, endpoint]);
  return token;
}

// The getToken function first checks sessionStorage to see if there is an existing token, and if there is returns it. If not, it logs the user into a new session and updates the sessionStorage key.
async function getToken(client: AuthClient): Promise<string> {
  const maybeToken = sessionStorage.getItem("topdown-shooter-token");
  if (maybeToken !== null) {
    return maybeToken;
  }
  const token = await client.loginAnonymousV1();
  sessionStorage.setItem("topdown-shooter-token", token);
  return token;
}

function getRoomIdFromUrl(): string | undefined {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop();
  }
}
