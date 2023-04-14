import { Region } from "./Region";
import { Lobby } from "./Lobby";
import { postJson } from "./util";
import { AbstractLobbyClient } from "./AbstractLobbyClient";

export class PlayerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState> {
  constructor(appId: string, endpoint: string = "https://api.hathora.dev") {
    super(appId, endpoint);
  }

  async createPrivateLobbyV2(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/private` + (roomId != null ? `&roomId=${roomId}` : ""),
      { region, initialConfig },
      { Authorization: playerToken }
    );

    return lobby as Lobby<LobbyState>;
  }

  async createPublicLobbyV2(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/public` + (roomId != null ? `&roomId=${roomId}` : ""),
      { region, initialConfig },
      { Authorization: playerToken }
    );

    return lobby as Lobby<LobbyState>;
  }
}
