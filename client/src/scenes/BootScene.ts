import { Scene } from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { RoomConnection } from "../connection";

const client = new HathoraClient(process.env.APP_ID as string, process.env.COORDINATOR_HOST);

export class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }

  preload() {
    this.load.image("player", "player.png");
    this.load.image("bullet", "bullet.png");
  }

  create() {
    getToken().then((token) => {
      getRoomId(token).then(async (roomId) => {
        const connection = new RoomConnection(client, token, roomId);
        await connection.connect();

        this.scene.start('scene-game', {
          connection,
          token
        });
      });
    });
  }
}

async function getToken(): Promise<string> {
  const maybeToken = sessionStorage.getItem("topdown-shooter-token");
  if (maybeToken !== null) {
    return maybeToken;
  }
  const token = await client.loginAnonymous();
  sessionStorage.setItem("topdown-shooter-token", token);
  return token;
}

async function getRoomId(token: string): Promise<string> {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop()!;
  } else {
    const roomId = await client.create(token, new Uint8Array());
    history.pushState({}, "", `/${roomId}`);
    return roomId;
  }
}