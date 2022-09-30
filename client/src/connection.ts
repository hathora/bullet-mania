import { HathoraClient } from "@hathora/client-sdk";
import { HathoraTransport, TransportType } from "@hathora/client-sdk/lib/transport";

import { ClientMessage, ServerMessage } from "../../common/messages";

export type UpdateListener = (update: ServerMessage) => void;

// A class representing a connection to our server room
export class RoomConnection {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  private connection: HathoraTransport | undefined;
  private listeners: UpdateListener[] = [];

  public constructor(private client: HathoraClient, public token: string, public roomId: string) {}

  public async connect() {
    this.connection = await this.client.connect(
      this.token,
      this.roomId,
      (msg) => this.handleMessage(msg),
      (err) => this.handleClose(err),
      TransportType.WebSocket
    );
  }

  public addListener(listener: UpdateListener) {
    this.listeners.push(listener);
  }

  public sendMessage(msg: ClientMessage) {
    this.connection?.write(this.encoder.encode(JSON.stringify(msg)));
  }

  public disconnect() {
    this.connection?.disconnect();
    this.listeners = [];
  }

  private handleMessage(data: ArrayBuffer) {
    const msg: ServerMessage = JSON.parse(this.decoder.decode(data));
    this.listeners.forEach((listener) => listener(msg));
  }

  private handleClose(err: { code: number; reason: string }) {
    console.error("close", err);
  }
}
