import { ConnectionInfo, Lobby } from "@hathora/hathora-cloud-sdk/src/models/index";
import { LobbyV2Api, RoomV1Api } from "@hathora/hathora-cloud-sdk";
import { ConnectionDetails } from "@hathora/client-sdk";

export const LOCAL_CONNECTION_DETAILS: ConnectionDetails = {
  host: "localhost",
  port: 4000,
  transportType: "tcp" as const,
};

export type Token = GoogleToken | AnonymousToken;

export interface GoogleToken {
  type: "google";
  value: string;
}
interface AnonymousToken {
  type: "anonymous";
  value: string;
}

export const Token = {
  isGoogleToken(token: Token): token is GoogleToken {
    return token.type === "google";
  },
  isAnonymousToken(token: Token): token is AnonymousToken {
    return token.type === "anonymous";
  },
};

export async function isReadyForConnect(
  roomClient: RoomV1Api,
  lobbyClient: LobbyV2Api,
  roomId: string
): Promise<{ lobbyInfo: Lobby; connectionInfo: ConnectionInfo }> {
  const MAX_CONNECT_ATTEMPTS = 50;
  const TRY_CONNECT_INTERVAL_MS = 1000;

  const lobbyInfo = await lobbyClient.getLobbyInfo(process.env.HATHORA_APP_ID, roomId);

  if (lobbyInfo.visibility === "local") {
    return new Promise<{ lobbyInfo: Lobby; connectionInfo: ConnectionInfo }>((resolve) =>
      resolve({ lobbyInfo, connectionInfo: LOCAL_CONNECTION_DETAILS })
    );
  }

  for (let i = 0; i < MAX_CONNECT_ATTEMPTS; i++) {
    const res = await roomClient.getConnectionInfo(process.env.HATHORA_APP_ID, roomId);
    if (res.status === "Active") {
      return { lobbyInfo, connectionInfo: res };
    }
    await new Promise((resolve) => setTimeout(resolve, TRY_CONNECT_INTERVAL_MS));
  }
  throw new Error("Polling timed out");
}
