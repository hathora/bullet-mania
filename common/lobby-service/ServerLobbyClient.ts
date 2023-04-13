import { AbstractLobbyClient } from './AbstractLobbyClient';
import { Lobby } from './Lobby';
import { Region } from './Region';
import { postJson } from './util';

export class ServerLobbyClient<
  LobbyState extends object = object
> extends AbstractLobbyClient<LobbyState> {
  private appToken: string;

  constructor(appToken: string, appId: string, endpoint: string = 'https://api.hathora.dev') {
    super(appId, endpoint);
    this.appToken = appToken;
  }

  async setLobbyState(roomId: string, state: LobbyState): Promise<Lobby<LobbyState>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/setState/${roomId}`,
      { state },
      { Authorization: `Bearer ${this.appToken}` }
    );

    return lobby as Lobby<LobbyState>;
  }
}
