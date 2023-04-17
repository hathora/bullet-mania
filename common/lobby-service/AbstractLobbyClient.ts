import { Lobby } from "./Lobby";
import { Region } from "./Region";
import { getJson, poll, postJson } from "./util";

export abstract class AbstractLobbyClient<LobbyState extends object = object, InitialConfig extends object = object> {
  protected lobbyEndpoint: string;
  private roomsEndpoint: string;

  constructor(appId: string) {
    const endpoint = process.env.HATHORA_API_HOST ?? "https://api.hathora.dev";
    this.lobbyEndpoint = `${endpoint}/lobby/v2/${appId}`;
    this.roomsEndpoint = `  ${endpoint}/rooms/v1/${appId}`;
  }

  async listActivePublicLobbiesV2(region?: Region): Promise<Lobby<LobbyState, InitialConfig>[]> {
    const lobbies = await getJson(`${this.lobbyEndpoint}/list/public` + (region != null ? `&region=${region}` : ""));
    return lobbies as Lobby<LobbyState, InitialConfig>[];
  }

  private async _getLobbyInfoV2(roomId: string): Promise<Lobby<LobbyState, InitialConfig>> {
    const res = await getJson(`${this.lobbyEndpoint}/info/${roomId}`, {});
    return res;
  }

  getLobbyInfoV2 = memoize1((roomId: string) => this._getLobbyInfoV2(roomId));

  getConnectionDetailsForLobbyV2 = memoize2((roomId: string, localConnectionDetails?: ConnectionDetails) =>
    this._getConnectionDetailsForLobbyV2(roomId, localConnectionDetails)
  );

  private async _getConnectionDetailsForLobbyV2(
    roomId: string,
    localConnectionDetails?: ConnectionDetails
  ): Promise<ConnectionDetails> {
    return poll(
      async () => {
        const info = await this.getLobbyInfoV2(roomId);
        if (localConnectionDetails != null && info.visibility === "local") {
          return { ...localConnectionDetails, status: "active" as const };
        }
        const res: ConnectionInfo = await getJson(`${this.roomsEndpoint}/connectioninfo/${roomId}`, {});
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

const memoize1 = <Arg0, Output>(fn: (arg0: Arg0) => Output) => {
  const cache = new Map<Arg0, Output>();
  const cached = function (_arg0: Arg0) {
    if (cache.has(_arg0)) {
      return cache.get(_arg0)!;
    } else {
      const result = fn(_arg0);
      cache.set(_arg0, result);
      return result;
    }
  };
  cached.cache = cache;
  return cached;
};

const memoize2 = <Arg0, Arg1, Output>(fn: (arg0: Arg0, arg1: Arg1) => Output) => {
  const cache = new Map<Arg0, Map<Arg1, Output>>();
  const cached = function (_arg0: Arg0, _arg1: Arg1) {
    if (cache.has(_arg0)) {
      const subMap = cache.get(_arg0)!;
      if (subMap.has(_arg1)) {
        return subMap.get(_arg1)!;
      } else {
        const result = fn(_arg0, _arg1);
        subMap.set(_arg1, result);
        return result;
      }
    } else {
      const result = fn(_arg0, _arg1);
      const subMap = new Map<Arg1, Output>();
      subMap.set(_arg1, result);
      cache.set(_arg0, subMap);
      return result;
    }
  };
  cached.cache = cache;
  return cached;
};
