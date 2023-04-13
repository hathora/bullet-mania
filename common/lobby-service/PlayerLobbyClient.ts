import { Region } from './Region';
import { Lobby } from './Lobby';
import { postJson } from './util';
import { AbstractLobbyClient } from './AbstractLobbyClient';

export class PlayerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState> {
  private playerToken: string;

  constructor(playerToken: string, appId: string, endpoint: string = 'https://api.hathora.dev') {
    super(appId, endpoint);
    this.playerToken = playerToken;
  }

  async createPrivateLobbyV2(
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/private` + (roomId != null ? `&roomId=${roomId}` : ''),
      { region, initialConfig },
      { Authorization: this.playerToken }
    );

    return lobby as Lobby<LobbyState>;
  }

  async createPublicLobbyV2(
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/public` + (roomId != null ? `&roomId=${roomId}` : ''),
      { region, initialConfig },
      { Authorization: this.playerToken }
    );

    return lobby as Lobby<LobbyState>;
  }
}
