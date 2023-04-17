import { Region } from "./Region";
import { Lobby } from "./Lobby";
import { postJson } from "./util";
import { AbstractLobbyClient } from "./AbstractLobbyClient";

export class PlayerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState, InitialConfig> {
  constructor(appId: string) {
    super(appId);
  }

  async createPrivateLobbyV2(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/private` + (roomId != null ? `&roomId=${roomId}` : ""),
      { region, initialConfig },
      { Authorization: playerToken }
    );

    return lobby as Lobby<LobbyState, InitialConfig>;
  }

  async createPublicLobbyV2(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/public` + (roomId != null ? `&roomId=${roomId}` : ""),
      { region, initialConfig },
      { Authorization: playerToken }
    );

    return lobby as Lobby<LobbyState, InitialConfig>;
  }

  async createLocalLobbyV2(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await postJson(
      `${this.lobbyEndpoint}/create/local` + (roomId != null ? `&roomId=${roomId}` : ""),
      { region, initialConfig },
      { Authorization: playerToken }
    );

    return lobby as Lobby<LobbyState, InitialConfig>;
  }
}
