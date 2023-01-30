import { Scene } from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { RoomConnection } from "../connection";

// Instantiate an object which represents our client
const connectionInfo = import.meta.env.DEV
  ? { host: "localhost", port: 4000, transportType: "tcp" as const }
  : undefined;
const client = new HathoraClient(process.env.APP_ID!, connectionInfo);

// Here we extend from Phaser's Scene class to create a game scene compatible with Phaser
export class BootScene extends Scene {
  constructor() {
    // This string is used to identify this scene when it's running
    super("scene-boot");
  }

  // Called immediately after the constructor, this function is used to preload assets
  preload() {
    // Load our assets from before
    this.load.image("player", "player.png");
    this.load.image("bullet", "bullet.png");
    this.load.image("wall", "wall.png");
    this.load.image("grass", "grass.png");
  }

  // Called before the update loop begins, create is used to intialize what the scene needs
  create() {
    // Make a call to our getToken function, defined below
    getToken().then(async (token) => {
      // Once we have a token, we can get our roomId
      const roomId = await getRoomId(token);
      // With a roomId, we can establish a connection to the room on server
      const connection = new RoomConnection(client, token, roomId);
      await connection.connect();

      // After we have a connection and token, start the game scene, passing in both
      this.scene.start("scene-game", { connection, token });
    });
  }
}

// The getToken function first checks sessionStorage to see if there is an existing token, and if there is returns it. If not, it logs the user into a new session and updates the sessionStorage key.
async function getToken(): Promise<string> {
  const maybeToken = sessionStorage.getItem("topdown-shooter-token");
  if (maybeToken !== null) {
    return maybeToken;
  }
  const token = await client.loginAnonymous();
  sessionStorage.setItem("topdown-shooter-token", token);
  return token;
}

// getRoomId will first check if the location's pathname contains the roomId, and will return it if it does, otherwise it will request one from the HathoraClient instance we defined earlier.
async function getRoomId(token: string): Promise<string> {
  if (location.pathname.length > 1) {
    return location.pathname.split("/").pop()!;
  } else {
    const roomId = await client.createPrivateLobby(token);
    history.pushState({}, "", `/${roomId}`);
    return roomId;
  }
}
