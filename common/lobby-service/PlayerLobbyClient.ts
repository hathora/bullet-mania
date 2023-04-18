import { Region } from "./Region";
import { Lobby } from "./Lobby";
import { AbstractLobbyClient } from "./AbstractLobbyClient";

export class PlayerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState, InitialConfig> {
  constructor(appId: string) {
    super(appId);
  }

  async createPrivateLobby(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await this.lobbyClient.createPrivateLobby(this.appId, playerToken, { region, initialConfig }, roomId);
    return lobby as Lobby<LobbyState, InitialConfig>;
  }

  async createPublicLobby(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await this.lobbyClient.createPublicLobby(this.appId, playerToken, { region, initialConfig }, roomId);
    return lobby as Lobby<LobbyState, InitialConfig>;
  }

  async createLocalLobby(
    playerToken: string,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await this.lobbyClient.createLocalLobby(this.appId, playerToken, { region, initialConfig }, roomId);
    return lobby as Lobby<LobbyState, InitialConfig>;
  }
}
