import { Lobby } from "./Lobby";
import { Region } from "./Region";
import { getJson, poll, postJson } from "./util";

export abstract class AbstractLobbyClient<LobbyState extends object = object, InitialConfig extends object = object> {
  protected lobbyEndpoint: string;
  private roomsEndpoint: string;

  constructor(appId: string, endpoint: string = "https://api.hathora.dev") {
    this.lobbyEndpoint = `${endpoint}/lobby/v2/${appId}`;
    this.roomsEndpoint = `  ${endpoint}/rooms/v1/${appId}`;
  }

  async listActivePublicLobbiesV2(region?: Region): Promise<Lobby<LobbyState, InitialConfig>[]> {
    const lobbies = await getJson(`${this.lobbyEndpoint}/list/public` + (region != null ? `&region=${region}` : ""));
    return lobbies as Lobby<LobbyState, InitialConfig>[];
  }

  async getLobbyInfoV2(roomId: string): Promise<Lobby<LobbyState, InitialConfig>> {
    const res = await getJson(`${this.lobbyEndpoint}/info/${roomId}`, {});
    return res;
  }
  getConnectionDetailsForLobbyV2 = memoize((roomId: string) => this._getConnectionDetailsForLobbyV2(roomId));

  private async _getConnectionDetailsForLobbyV2(roomId: string): Promise<ConnectionDetails> {
    return poll(
      async () => {
        const res: ConnectionInfo = await getJson(`${this.roomsEndpoint}/connectioninfo/${roomId}`, {});
        return res;
      },
      isActiveConnection,
      500,
      100
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

const memoize = <S, T>(fn: (a: S) => T) => {
  const cache = new Map<S, T>();
  const cached = function (arg: S) {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    } else {
      const result = fn(arg);
      cache.set(arg, result);
      return result;
    }
  };
  cached.cache = cache;
  console.log("cache", cache);
  return cached;
};
