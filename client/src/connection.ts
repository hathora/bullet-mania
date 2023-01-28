import { HathoraClient } from "@hathora/client-sdk";
import { HathoraConnection } from "@hathora/client-sdk";

import { ClientMessage, ServerMessage } from "../../common/messages";

export type UpdateListener = (update: ServerMessage) => void;

// A class representing a connection to our server room
export class RoomConnection {
  private connection: HathoraConnection | undefined;

  public constructor(private client: HathoraClient, public token: string, public roomId: string) {}

  public async connect() {
    this.connection = await this.client.newConnection(this.roomId);
    this.connection.onClose((err) => {
      console.error("close", err);
    });
    await this.connection.connect(this.token);
  }

  public addListener(listener: UpdateListener) {
    this.connection?.onMessageJson<ServerMessage>((data) => {
      listener(data);
    });
  }

  public sendMessage(msg: ClientMessage) {
    this.connection?.writeJson(msg);
  }

  public disconnect() {
    this.connection?.disconnect();
  }
}
