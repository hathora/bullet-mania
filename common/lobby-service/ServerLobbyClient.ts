import { AbstractLobbyClient } from "./AbstractLobbyClient";
import { Lobby } from "./Lobby";

export class ServerLobbyClient<
  LobbyState extends object = object,
  InitialConfig extends object = object
> extends AbstractLobbyClient<LobbyState, InitialConfig> {
  private appToken: string;

  constructor(appToken: string, appId: string) {
    super(appId);
    this.appToken = appToken;
  }

  async setLobbyState(roomId: string, state: LobbyState): Promise<Lobby<LobbyState>> {
    const lobby = await this.lobbyClient.setLobbyState(
      this.appId,
      roomId,
      { state },
      { headers: { Authorization: `Bearer ${this.appToken}`, "Content-Type": "application/json" } }
    );
    return lobby as Lobby<LobbyState>;
  }

  async destroyRoom(roomId: string): Promise<void> {
    return this.roomClient.destroyRoom(
      this.appId,
      roomId,
      { headers: { Authorization: `Bearer ${this.appToken}`, "Content-Type": "application/json" } }
    );
  }
}
