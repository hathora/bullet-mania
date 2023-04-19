import { Memoize } from "typescript-memoize";
import { Lobby } from "./Lobby";
import { Region } from "./Region";
import {
  Configuration,
  LobbyV2Api,
  LobbyV2ApiInterface,
  RoomV1Api,
  RoomV1ApiInterface,
} from "@hathora/hathora-cloud-sdk";
import { poll } from "./util";

export abstract class AbstractLobbyClient<LobbyState extends object = object, InitialConfig extends object = object> {
  protected appId: string;
  protected lobbyClient: LobbyV2ApiInterface;
  protected roomClient: RoomV1ApiInterface;

  constructor(appId: string) {
    const endpoint = process.env.HATHORA_API_HOST ?? "https://api.hathora.dev";
    this.appId = appId;
    this.lobbyClient = new LobbyV2Api(new Configuration({ basePath: endpoint }));
    this.roomClient = new RoomV1Api(new Configuration({ basePath: endpoint }));
  }

  async listActivePublicLobbies(region?: Region): Promise<Lobby<LobbyState, InitialConfig>[]> {
    const lobbies = await this.lobbyClient.listActivePublicLobbies(this.appId, region);
    return lobbies as Lobby<LobbyState, InitialConfig>[];
  }

  @Memoize()
  async getLobbyInfo(roomId: string): Promise<Lobby<LobbyState, InitialConfig>> {
    const res = await this.lobbyClient.getLobbyInfo(this.appId, roomId);
    return res as Lobby<LobbyState, InitialConfig>;
  }

  @Memoize((roomId, localConnectionDetails) => `${roomId};${JSON.stringify(localConnectionDetails)}`)
  async getConnectionDetailsForLobby(
    roomId: string,
    localConnectionDetails?: ConnectionDetails
  ): Promise<ConnectionDetails> {
    return poll(
      async () => {
        const info = await this.getLobbyInfo(roomId);
        if (localConnectionDetails != null && info.visibility === "local") {
          return { ...localConnectionDetails, status: "active" as const };
        }
        const res: ConnectionInfo = await this.roomClient.getConnectionInfo(this.appId, roomId);
        return res;
      },
      isActiveConnection,
      1000,
      50
    );
  }
}

type StartingConnectionInfo = { status: "starting" };
type ActiveConnectionInfo = ConnectionDetails & {
  status: "active";
};
type ConnectionInfo = StartingConnectionInfo | ActiveConnectionInfo;
export type ConnectionDetails = {
  host: string;
  port: number;
  transportType: "tcp" | "tls" | "udp";
};

function isActiveConnection(ConnectionInfo: ConnectionInfo): ConnectionInfo is ActiveConnectionInfo {
  return ConnectionInfo.status === "active";
}
