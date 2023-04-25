import { Region } from "./Region";
import { Lobby } from "./Lobby";
import { AbstractLobbyClient } from "./AbstractLobbyClient";
import {CreateLobbyRequestVisibilityEnum} from "@hathora/hathora-cloud-sdk/src/models/CreateLobbyRequest";

export class PlayerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState, InitialConfig> {
  constructor(appId: string) {
    super(appId);
  }

  async createLobby(
    playerToken: string,
    visibility: CreateLobbyRequestVisibilityEnum,
    region: Region,
    initialConfig: InitialConfig,
    roomId?: string
  ): Promise<Lobby<LobbyState, InitialConfig>> {
    const lobby = await this.lobbyClient.createLobby(this.appId, playerToken, { visibility, region, initialConfig }, roomId);
    return lobby as Lobby<LobbyState, InitialConfig>;
  }
}
