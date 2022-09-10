import Phaser from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { ServerMessage } from "../../common/messages";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    const client = new HathoraClient(import.meta.env.APP_ID);
    client.loginAnonymous().then((token) => {
      client.create(token, new Uint8Array()).then((roomId) => {
        client.connect(token, roomId, this.onMessage, this.onClose);
      });
    });
  }

  private onMessage(data: ArrayBuffer) {
    const msg: ServerMessage = JSON.parse(decoder.decode(data));
    console.log("Message received", msg);
  }

  private onClose(e: { code: number; reason: string }) {
    console.error("Connection closed", e.reason);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "root",
  dom: { createContainer: true },
});
