import Phaser, { Math as pMath, Scene } from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { InterpolationBuffer } from "interpolation-buffer";
import { ClientMessageType, ServerMessageType } from "../../../common/messages";
import { Bullet, Direction, GameState, Player } from "../../../common/types";
import map from "../../../common/map.json";
import { RoomConnection } from "../connection";

const BULLETS_MAX = 3;

export class GameScene extends Scene {
  // A variable to represent our RoomConnection instance
  private connection!: RoomConnection;

  // The buffer which holds state snapshots
  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  // A map of player sprites currently connected
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private playersAmmo: Map<string, Phaser.GameObjects.Text> = new Map();
  // A map of bullet sprites currently in-air
  private bullets: Map<number, Phaser.GameObjects.Sprite> = new Map();
  // The Hathora user for the current client's connected player
  private currentUserID: string | undefined;
  // The current client's connected player's sprite object
  private playerSprite: Phaser.GameObjects.Sprite | undefined;
  // The previous tick's aim radians (used to check if aim has changed, before sending an update)
  private prevAimRad: number = 0;
  // Ammo indicator assets
  private ammos: Map<number, Phaser.GameObjects.Image> = new Map();
  private reloading: Phaser.GameObjects.Text | undefined = undefined;
  private score: Phaser.GameObjects.Text | undefined = undefined;
  private leaderScore: Phaser.GameObjects.Text | undefined = undefined;
  private dash: Phaser.GameObjects.Text | undefined = undefined;

  constructor() {
    super("scene-game");
  }

  init({ connection, token }: { connection: RoomConnection; token: string }) {
    // Receive connection and user data from BootScene
    this.connection = connection;

    const currentUser = HathoraClient.getUserFromToken(token);
    this.currentUserID = currentUser.id;
  }

  create() {
    const tileSize = map.tileSize;
    const top = map.top * tileSize;
    const left = map.left * tileSize;
    const bottom = map.bottom * tileSize;
    const right = map.right * tileSize;

    // Render grass
    this.add.tileSprite(left, top, right - left, bottom - top, "grass").setOrigin(0, 0);

    // Render map objects
    map.walls.forEach(({ x, y, width, height }) => {
      this.add.tileSprite(x * tileSize, y * tileSize, width * tileSize, height * tileSize, "wall").setOrigin(0, 0);
    });

    // Set the main camera's background colour and bounding box
    this.cameras.main.setBounds(map.left, map.top, right - left, bottom - top);

    // Ping indicator
    const pingText = this.add.text(4, 4, "Ping:", { color: "white" }).setScrollFactor(0);
    const pings: number[] = [];

    // Score indicator
    this.score = this.add.text(670, 4, "Score:", { color: "white" }).setScrollFactor(0);
    this.leaderScore = this.add.text(660, 24, "Leader:", { color: "white" }).setScrollFactor(0);

    // Dash indicator
    this.dash = this.add.text(670, this.scale.height - 40, "Dash: READY", { color: "white" }).setScrollFactor(0);
    this.add.text(670, this.scale.height - 24, "(SPACEBAR)", { color: "white" }).setScrollFactor(0);

    // Ammos indicator
    const ammoText = this.add.text(4, this.scale.height - 40, "Ammo:", { color: "white" }).setScrollFactor(0);
    for (var i = 0; i < BULLETS_MAX; i++) {
      this.ammos.set(i, this.add.image(60 + (16*i), this.scale.height - 32, "bullet").setScrollFactor(0));
    }
    this.reloading = this.add.text(56, this.scale.height - 40, "RELOADING", { color: "white" }).setVisible(false).setScrollFactor(0);
    this.add.text(4, this.scale.height - 24, "(LEFT CLICK)", { color: "white" }).setScrollFactor(0);

    this.connection.addListener((msg) => {
      if (msg.type === ServerMessageType.StateUpdate) {
        // Start enqueuing state updates
        if (this.stateBuffer === undefined) {
          this.stateBuffer = new InterpolationBuffer(msg.state, 50, lerp);
        } else {
          this.stateBuffer.enqueue(msg.state, [], msg.ts);
        }
      } else if (msg.type === ServerMessageType.PingResponse) {
        // Update ping text
        pings.push(Date.now() - msg.id);
        if (pings.length > 10) {
          pings.shift();
        }
        const sortedPings = [...pings].sort((a, b) => a - b);
        pingText.text = `Ping: ${sortedPings[Math.floor(pings.length / 2)]}`;
      }
    });

    // Send pings every 500ms
    setInterval(() => {
      this.connection.sendMessage({ type: ClientMessageType.Ping, id: Date.now() });
    }, 1000);

    // Handle keyboard input
    const keys = this.input.keyboard.addKeys("W,S,A,D") as {
      W: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    const keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    let prevDirection = {
      x: 0,
      y: 0
    };

    const handleKeyEvt = () => {
      let direction = {
        x: 0,
        y: 0
      };
      if (keys.W.isDown) {
        direction.y = -1;
      }
      else if (keys.S.isDown) {
        direction.y = 1;
      }
      else {
        direction.y = 0;
      }

      if (keys.D.isDown) {
        direction.x = 1;
      }
      else if (keys.A.isDown) {
        direction.x = -1;
      }
      else {
        direction.x = 0;
      }

      if (prevDirection.x !== direction.x || prevDirection.y !== direction.y) {
        // If connection is open and direction has changed, send updated direction
        prevDirection = direction;
        this.connection.sendMessage({ type: ClientMessageType.SetDirection, direction });
      }

      if (keySpace.isDown) {
        this.connection.sendMessage({ type: ClientMessageType.Dash });
      }
    };

    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);

    // Handle mouse-click input
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // If the connection is open, send through click events
      this.connection.sendMessage({ type: ClientMessageType.Shoot });
    });
  }

  update() {
    // If the stateBuffer hasn't been defined, skip this update tick
    if (this.stateBuffer === undefined) {
      return;
    }

    // Get the mousePointer and current interpolated state from the buffer
    const { mousePointer } = this.input;
    const { state } = this.stateBuffer.getInterpolatedState(Date.now());

    // Synchronize the players in our game's state with sprites to represent them graphically
    this.syncSprites(
      this.players,
      new Map(
        state.players.map((player) => [
          player.id,
          new Phaser.GameObjects.Sprite(this, player.position.x, player.position.y, `p${player.sprite}${player.isReloading ? "_reload" : ""}`).setRotation(
            player.aimAngle
          ),
        ])
      )
    );
    this.syncTexts(
      this.playersAmmo,
      new Map(
        state.players.map((player) => {
          return [
            player.id,
            new Phaser.GameObjects.Text(this, player.position.x - 28, player.position.y + 24, `RELOAD ${Math.max(0,Math.ceil(((player.isReloading || 0) - Date.now())/1000))}s`, { color: "white"}).setAlpha(.6).setVisible(player.isReloading !== undefined),
          ]
        })
      )
    );

    // Do the same with bullets
    this.syncSprites(
      this.bullets,
      new Map(
        state.bullets.map((bullet) => [
          bullet.id,
          new Phaser.GameObjects.Sprite(this, bullet.position.x, bullet.position.y, "bullet"),
        ])
      )
    );

    // calc leader score
    let highScore = 0;
    state.players.forEach(p => {
      if (p.score > highScore) {
        highScore = p.score;
      }
    });
    this.leaderScore!.text = "Leader: " + (highScore).toString();

    // sync ammo indicator and score
    let player = state.players.find(p => p.id === this.currentUserID);
    if (player) {
      // console.log(player)
      this.score!.text = "Score: " + (player!.score || 0).toString();
      if (player.dashCooldown) {
        this.dash!.text = `Dash: ${Math.max(0, (player.dashCooldown - Date.now()) / 1000)}s`;
      }
      else {
        this.dash!.text = `Dash: READY`;
      }

      // sync reload indicator
      this.reloading!.visible = !!player.isReloading;
      if (player.isReloading) {
        this.reloading!.text = `${Math.max(0,(player.isReloading! - Date.now())/1000)}s`
      }
    }
    const bulletsRemaining = player?.bullets;
    if (bulletsRemaining !== undefined) {
      for (let i = 0; i < BULLETS_MAX; i++) {
        if (this.ammos.has(i)) {
          this.ammos.get(i)!.visible = !(bulletsRemaining <= i);
        }
      }
    }

    // If this.playerSprite has been defined (a ref to our own sprite), send our mouse position to the server
    if (this.playerSprite) {
      this.sendMousePosition(mousePointer, this.playerSprite);
    }
  }

  private sendMousePosition(mousePointer: Phaser.Input.Pointer, playerSprite: Phaser.GameObjects.Sprite) {
    // Extract the mouse's coordinates, player's coordinates, and zoom + worldView properties of scene's the main camera
    const { x: mouseX, y: mouseY } = mousePointer;
    const { x: playerX, y: playerY } = playerSprite;
    const { zoom, worldView } = this.cameras.main;

    // Establish the angle between the player's camera-relative position and the mouse
    const relX = (playerX - worldView.x) * zoom;
    const relY = (playerY - worldView.y) * zoom;
    const aimRad = pMath.Angle.Between(relX + zoom, relY + zoom, mouseX, mouseY);
    const aimMoved = this.prevAimRad !== aimRad;

    // Only if the aim has updated, send the update
    if (aimMoved) {
      this.connection.sendMessage({ type: ClientMessageType.SetAngle, angle: aimRad });
    }

    this.prevAimRad = aimRad;
  }

  private syncSprites<T>(oldSprites: Map<T, Phaser.GameObjects.Sprite>, newSprites: Map<T, Phaser.GameObjects.Sprite>) {
    newSprites.forEach((sprite, id) => {
      console.log(sprite.texture)
      if (oldSprites.has(id)) {
        const oldSprite = oldSprites.get(id)!;
        oldSprite.x = sprite.x;
        oldSprite.y = sprite.y;
        oldSprite.rotation = sprite.rotation;
        oldSprite.setTexture(sprite.texture.key);
      } else {
        this.add.existing(sprite);
        oldSprites.set(id, sprite);

        // Follow this client's player-controlled sprite
        if (this.currentUserID && id === this.currentUserID) {
          this.cameras.main.startFollow(sprite);
          this.playerSprite = sprite;
        }
      }
    });
    oldSprites.forEach((sprite, id) => {
      if (!newSprites.has(id)) {
        sprite.destroy();
        oldSprites.delete(id);
      }
    });
  }

  private syncTexts<T>(oldTexts: Map<T, Phaser.GameObjects.Text>, newTexts: Map<T, Phaser.GameObjects.Text>) {
    newTexts.forEach((textObj, id) => {
      if (oldTexts.has(id)) {
        const oldSprite = oldTexts.get(id)!;
        oldSprite.x = textObj.x;
        oldSprite.y = textObj.y;
        oldSprite.rotation = textObj.rotation;
        oldSprite.visible = textObj.visible;
        oldSprite.text = textObj.text;
      } else {
        this.add.existing(textObj);
        oldTexts.set(id, textObj);
      }
    });
    oldTexts.forEach((textObj, id) => {
      if (!newTexts.has(id)) {
        textObj.destroy();
        oldTexts.delete(id);
      }
    });
  }
}

function lerp(from: GameState, to: GameState, pctElapsed: number): GameState {
  return {
    players: to.players.map((toPlayer) => {
      const fromPlayer = from.players.find((p) => p.id === toPlayer.id);
      return fromPlayer !== undefined ? lerpPlayer(fromPlayer, toPlayer, pctElapsed) : toPlayer;
    }),
    bullets: to.bullets.map((toBullet) => {
      const fromBullet = from.bullets.find((p) => p.id === toBullet.id);
      return fromBullet !== undefined ? lerpBullet(fromBullet, toBullet, pctElapsed) : toBullet;
    }),
  };
}

function lerpPlayer(from: Player, to: Player, pctElapsed: number): Player {
  return {
    id: to.id,
    position: {
      x: from.position.x + (to.position.x - from.position.x) * pctElapsed,
      y: from.position.y + (to.position.y - from.position.y) * pctElapsed,
    },
    aimAngle: to.aimAngle,
    bullets: to.bullets,
    isReloading: to.isReloading,
    dashCooldown: to.dashCooldown,
    score: to.score,
    sprite: to.sprite,
  };
}

function lerpBullet(from: Bullet, to: Bullet, pctElapsed: number): Bullet {
  return {
    id: to.id,
    position: {
      x: from.position.x + (to.position.x - from.position.x) * pctElapsed,
      y: from.position.y + (to.position.y - from.position.y) * pctElapsed,
    },
  };
}
