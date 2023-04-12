import { Scene } from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { RoomConnection } from "../connection";

// Instantiate an object which represents our client
const connectionDetails = import.meta.env.DEV
  ? { host: window.location.hostname, port: 4000, transportType: "tcp" as const }
  : undefined;
const client = new HathoraClient(process.env.APP_ID!, connectionDetails);

// Here we extend from Phaser's Scene class to create a game scene compatible with Phaser
export class BootScene extends Scene {
  constructor() {
    // This string is used to identify this scene when it's running
    super("scene-boot");
  }

  // Called immediately after the constructor, this function is used to preload assets
  preload() {
    // Load our assets from before
    this.load.image("bullet", "bullet.png");
    this.load.image("player", "player.png");
    this.load.image("p0_reload", "p0_reload.png");
    this.load.image("p1_reload", "p1_reload.png");
    this.load.image("p2_reload", "p2_reload.png");
    this.load.image("p3_reload", "p3_reload.png");
    this.load.image("p4_reload", "p4_reload.png");
    this.load.image("p5_reload", "p5_reload.png");
    this.load.image("p6_reload", "p6_reload.png");
    this.load.image("p7_reload", "p7_reload.png");
    this.load.image("p8_reload", "p8_reload.png");
    this.load.image("p0", "p0.png");
    this.load.image("p1", "p1.png");
    this.load.image("p2", "p2.png");
    this.load.image("p3", "p3.png");
    this.load.image("p4", "p4.png");
    this.load.image("p5", "p5.png");
    this.load.image("p6", "p6.png");
    this.load.image("p7", "p7.png");
    this.load.image("p8", "p8.png");
    this.load.image("wall", "wall.png");
    this.load.image("wall_red", "wall_red.png");
    this.load.image("wall_blue", "wall_blue.png");
    this.load.image("wall", "wall.png");
    this.load.image("grass", "grass.png");
    this.load.image("floor", "floor.png");
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
