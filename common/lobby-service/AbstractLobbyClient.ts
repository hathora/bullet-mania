import { Lobby } from './Lobby';
import { Region } from './Region';
import { getJson, poll, postJson } from './util';

export abstract class AbstractLobbyClient<LobbyState extends object = object> {
  protected lobbyEndpoint: string;
  private roomsEndpoint: string;

  constructor(appId: string, endpoint: string = 'https://api.hathora.dev') {
    this.lobbyEndpoint = `${endpoint}/lobby/v2/${appId}`;
    this.roomsEndpoint = `  ${endpoint}/rooms/v1/${appId}`;
  }

  async listActivePublicLobbiesV2(region?: Region): Promise<Lobby<LobbyState>[]> {
    const lobbies = await getJson(
      `${this.lobbyEndpoint}/list/public` + (region != null ? `&region=${region}` : '')
    );
    return lobbies as Lobby<LobbyState>[];
  }

  async getLobbyInfoV2(roomId: string): Promise<Lobby<LobbyState>> {
    const res = await getJson(`${this.lobbyEndpoint}/info/${roomId}`, {});
    return await res.json();
  }

  async getConnectionDetailsForLobbyV2(roomId: string): Promise<ConnectionDetails> {
    return poll(
      async () => {
        const res: ConnectionInfo = await getJson(
          `${this.roomsEndpoint}/connectioninfo/${roomId}`,
          {}
        );
        return res;
      },
      isActiveConnection,
      500,
      20
    );
  }
}

type StartingConnectionInfo = { status: 'starting' };
type ActiveConnectionInfo = ConnectionDetails & {
  status: 'active';
};
type ConnectionInfo = StartingConnectionInfo | ActiveConnectionInfo;
export type ConnectionDetails = {
  host: string;
  port: number;
  transportType: 'tcp' | 'tls' | 'udp';
};

function isActiveConnection(
  ConnectionInfo: ConnectionInfo
): ConnectionInfo is ActiveConnectionInfo {
  return ConnectionInfo.status === 'active';
}
