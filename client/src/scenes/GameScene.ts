import Phaser, { Math as pMath, Scene } from "phaser";
import { InterpolationBuffer } from "interpolation-buffer";
import { HathoraClient, HathoraConnection } from "@hathora/client-sdk";

import { Bullet, SessionMetadata, GameState, Player } from "../../../common/types";
import { ClientMessageType, ServerMessageType } from "../../../common/messages";
import map from "../../../common/map.json";

const BULLETS_MAX = 3;

export class GameScene extends Scene {
  private preloaderContainer!: HTMLDivElement;
  private preloaderBar!: HTMLDivElement;

  // A variable to represent our RoomConnection instance
  private connection: HathoraConnection | undefined;
  private token: string | undefined;
  private sessionMetadata: SessionMetadata | undefined;

  // The buffer which holds state snapshots
  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  // A map of player sprites currently connected
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private playersName: Map<string, Phaser.GameObjects.Text> = new Map();
  private playersAmmo: Map<string, Phaser.GameObjects.Text> = new Map();
  // A map of bullet sprites currently in-air
  private bullets: Map<number, Phaser.GameObjects.Sprite> = new Map();
  // The Hathora user for the current client's connected player
  private currentUserID: string | undefined;
  // The current client's connected player's sprite object
  private playerSprite: Phaser.GameObjects.Sprite | undefined;
  // The previous tick's aim radians (used to check if aim has changed, before sending an update)
  private prevAimRad = 0;
  // Ammo indicator assets
  private ammos: Map<number, Phaser.GameObjects.Image> = new Map();
  private reloading: Phaser.GameObjects.Text | undefined = undefined;
  private leaderBoard: Map<string, Phaser.GameObjects.Text> = new Map();
  private dash: Phaser.GameObjects.Text | undefined = undefined;
  private respawnText: Phaser.GameObjects.Text | undefined = undefined;
  private endText: Phaser.GameObjects.Text | undefined = undefined;
  private disconnectText: Phaser.GameObjects.Text | undefined = undefined;

  static NAME = "scene-game";

  constructor() {
    super(GameScene.NAME);
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
    this.load.image("splash", "splash.png");
  }

  init({
    connection,
    token,
    sessionMetadata,
  }: {
    connection: HathoraConnection;
    token: string;
    sessionMetadata: SessionMetadata;
  }) {
    // Receive connection and user data from BootScene
    this.connection = connection;
    this.token = token;
    this.sessionMetadata = sessionMetadata;

    const currentUser = HathoraClient.getUserFromToken(token);
    this.currentUserID = currentUser.id;
  }

  bindPreloaderDOM() {
    this.preloaderContainer = document.querySelector(".preloader") as HTMLDivElement;
    this.preloaderBar = this.preloaderContainer.querySelector(".preloader__bar-inner") as HTMLDivElement;
    this.preloaderContainer.classList.remove("off");
  }

  setPreloaderPercentage(p: number) {
    if (p === 1) {
      this.preloaderContainer.classList.add("off");
    }

    this.preloaderBar.style.width = `${p * 100}%`;
  }

  create() {
    this.bindPreloaderDOM();
    const tileSize = map.tileSize;
    const top = map.top * tileSize;
    const left = map.left * tileSize;
    const bottom = map.bottom * tileSize;
    const right = map.right * tileSize;

    this.setPreloaderPercentage(0.1);
    // Render grass
    this.add.tileSprite(left, top, right - left, bottom - top, "floor").setOrigin(0, 0);

    // Render map objects
    map.wallsRed.forEach(({ x, y, width, height }) => {
      this.add.tileSprite(x * tileSize, y * tileSize, width * tileSize, height * tileSize, "wall_red").setOrigin(0, 0);
    });
    map.wallsBlue.forEach(({ x, y, width, height }) => {
      this.add.tileSprite(x * tileSize, y * tileSize, width * tileSize, height * tileSize, "wall_blue").setOrigin(0, 0);
    });

    this.setPreloaderPercentage(0.2);
    // Set the main camera's background colour and bounding box
    this.cameras.main.setBounds(map.left, map.top, right - left, bottom - top);

    // Display metadata
    const _roomId = this.add
      .text(300, 4, `Room ID:${this.sessionMetadata?.roomId ?? ""}`, { color: "white" })
      .setAlpha(0.8)
      .setScrollFactor(0);
    const _serverUrl = this.add
      .text(4, 4, this.sessionMetadata?.serverUrl ?? "", { color: "white" })
      .setAlpha(0.8)
      .setScrollFactor(0);
    const _region = this.add.text(4, 20, this.sessionMetadata?.region ?? "", { color: "white" }).setScrollFactor(0);

    // Ping indicator
    const pingText = this.add.text(4, 36, "Ping:", { color: "white" }).setScrollFactor(0);
    const pings: number[] = [];

    this.setPreloaderPercentage(0.3);
    // Dash indicator
    this.dash = this.add.text(670, this.scale.height - 40, "Dash: READY", { color: "white" }).setScrollFactor(0);
    this.add.text(670, this.scale.height - 24, "(SPACEBAR)", { color: "white" }).setScrollFactor(0);

    // Ammos indicator
    this.add.text(4, this.scale.height - 40, "Ammo:", { color: "white" }).setScrollFactor(0);
    for (let i = 0; i < BULLETS_MAX; i++) {
      this.ammos.set(i, this.add.image(60 + 16 * i, this.scale.height - 32, "bullet").setScrollFactor(0));
    }
    this.setPreloaderPercentage(0.4);
    this.reloading = this.add
      .text(56, this.scale.height - 40, "RELOADING", { color: "white" })
      .setVisible(false)
      .setScrollFactor(0);
    this.add.text(4, this.scale.height - 24, "(LEFT CLICK)", { color: "white" }).setScrollFactor(0);
    this.respawnText = this.add
      .text(this.scale.width / 2 - 60, 280, "Press [R] to respawn", { color: "white" })
      .setScrollFactor(0)
      .setVisible(false);
    this.setPreloaderPercentage(0.5);

    this.endText = this.add
      .text(this.scale.width / 2 - 210, 220, "GAME OVER - Winning score reached", {
        color: "#ecf5f5",
        fontSize: "20px",
        backgroundColor: "#9A282A",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setVisible(this.sessionMetadata?.isGameEnd || false);
    this.disconnectText = this.add
      .text(this.scale.width / 2 - 140, 260, "Match will disconnect shortly", {
        color: "#ecf5f5",
        backgroundColor: "#9A282A",
        padding: { x: 4, y: 2 },
      })
      .setScrollFactor(0)
      .setVisible(false);
    this.setPreloaderPercentage(0.6);

    this.connection?.onMessageJson((msg) => {
      switch (msg.type) {
        case ServerMessageType.StateUpdate:
          // Start enqueuing state updates
          if (this.stateBuffer === undefined) {
            this.stateBuffer = new InterpolationBuffer(msg.state, 50, lerp);
          } else {
            this.stateBuffer.enqueue(msg.state, [], msg.ts);
          }
          break;
        case ServerMessageType.PingResponse:
          // Update ping text
          pings.push(Date.now() - msg.id);
          if (pings.length > 10) {
            pings.shift();
          }
          pingText.text = `Ping: ${[...pings].sort((a, b) => a - b)[Math.floor(pings.length / 2)]}`;
          break;
      }
    });
    this.setPreloaderPercentage(0.7);

    this.token != null ? this.connection?.connect(this.token) : {};

    // Send pings every 500ms
    setInterval(() => {
      this.connection?.writeJson({ type: ClientMessageType.Ping, id: Date.now() });
    }, 1000);

    // Handle keyboard input
    const keys = this.input.keyboard.addKeys("W,S,A,D") as {
      W: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    const keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    let prevDirection = {
      x: 0,
      y: 0,
    };
    this.setPreloaderPercentage(0.8);

    const handleKeyEvt = () => {
      const direction = {
        x: 0,
        y: 0,
      };
      if (keys.W.isDown) {
        direction.y = -1;
      } else if (keys.S.isDown) {
        direction.y = 1;
      } else {
        direction.y = 0;
      }

      if (keys.D.isDown) {
        direction.x = 1;
      } else if (keys.A.isDown) {
        direction.x = -1;
      } else {
        direction.x = 0;
      }

      if (prevDirection.x !== direction.x || prevDirection.y !== direction.y) {
        // If connection is open and direction has changed, send updated direction
        prevDirection = direction;
        this.connection?.writeJson({ type: ClientMessageType.SetDirection, direction });
      }

      if (keySpace.isDown) {
        this.connection?.writeJson({ type: ClientMessageType.Dash });
      }
      if (keyR.isDown) {
        this.connection?.writeJson({ type: ClientMessageType.Respawn });
      }

      if (keySpace.isDown) {
        this.connection?.writeJson({ type: ClientMessageType.Dash });
      }
      if (keyR.isDown) {
        this.connection?.writeJson({ type: ClientMessageType.Respawn });
      }
    };
    this.setPreloaderPercentage(0.9);

    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);

    this.setPreloaderPercentage(0.95);
    // Handle mouse-click input
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // If the connection is open, send through click events
      this.connection?.writeJson({ type: ClientMessageType.Shoot });
    });
    setTimeout(() => {
      this.setPreloaderPercentage(1);
    }, 400);
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
        state.players
          .filter((p) => !p.isDead)
          .map((player) => [
            player.id,
            new Phaser.GameObjects.Sprite(
              this,
              player.position.x,
              player.position.y,
              `p${player.sprite}${player.isReloading ? "_reload" : ""}`
            ).setRotation(player.aimAngle),
          ])
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

    //set nickname for this player if it isn't set yet
    state.players
      .filter((p) => p.id === this.currentUserID && p.nickname !== sessionStorage.getItem("bullet-mania-nickname"))
      .forEach(() => {
        this.connection?.writeJson({
          type: ClientMessageType.SetNickname,
          nickname: sessionStorage.getItem("bullet-mania-nickname"),
        });
      });

    // calc leaderboard
    state.players
      .sort((a, b) => b.score - a.score)
      .forEach((player, index) => {
        if (
          this.sessionMetadata?.winningScore &&
          player.score >= this.sessionMetadata.winningScore &&
          this.endText &&
          this.disconnectText
        ) {
          this.endText.visible = true;
          this.endText.text = `GAME OVER - ${player.nickname} wins (${player.score} kills)`;
          this.disconnectText.visible = true;
        }
        // update leaderboard text
        if (this.leaderBoard.has(player.id)) {
          const existing = this.leaderBoard.get(player.id);
          if (existing) {
            existing.text = `${player.nickname}: ${player.score}`;
            existing.setY(4 + 20 * index);
          }
        } else {
          const newScore = new Phaser.GameObjects.Text(
            this,
            640,
            4 + 20 * index,
            `${player.nickname}: ${player.score}`,
            {
              color: player.id === this.currentUserID ? "green" : "white",
            }
          ).setScrollFactor(0);
          this.add.existing(newScore);
          this.leaderBoard.set(player.id, newScore);
        }
      });

    state.players.forEach((player) => {
      // Update player name label
      if (this.playersName.has(player.id)) {
        const existing = this.playersName.get(player.id);
        if (existing) {
          existing.visible = !player.isDead;
          existing.text = player.nickname;
          existing.x = player.position.x - 48;
          existing.y = player.position.y - 34;
        }
      } else {
        const newName = new Phaser.GameObjects.Text(
          this,
          player.position.x - 48,
          player.position.y - 34,
          `${player.nickname}`,
          {
            color: player.id === this.currentUserID ? "green" : "white",
          }
        )
          .setVisible(!player.isDead)
          .setAlpha(0.6);
        this.add.existing(newName);
        this.playersName.set(player.id, newName);
      }
      // Update reloading label
      if (this.playersAmmo.has(player.id)) {
        const existing = this.playersAmmo.get(player.id);
        if (existing) {
          existing.visible = player.isReloading !== undefined && !player.isDead;
          existing.text = `RELOAD ${Math.max(0, Math.ceil(((player.isReloading || 0) - Date.now()) / 1000))}s`;
          existing.x = player.position.x - 28;
          existing.y = player.position.y + 24;
        }
      } else {
        const newLabel = new Phaser.GameObjects.Text(
          this,
          player.position.x - 28,
          player.position.y + 24,
          `RELOAD ${Math.max(0, Math.ceil(((player.isReloading || 0) - Date.now()) / 1000))}s`,
          {
            color: "white",
          }
        )
          .setVisible(player.isReloading !== undefined && !player.isDead)
          .setAlpha(0.6);
        this.add.existing(newLabel);
        this.playersAmmo.set(player.id, newLabel);
      }
    });
    // clean up if player has left
    for (const [key, value] of this.playersName.entries()) {
      if (!state.players.find((p) => p.id === key)) {
        // delete player name label
        value.destroy();
        this.playersName.delete(key);
        // delete other global indicators
        this.playersAmmo.get(key)?.destroy();
        this.playersAmmo.delete(key);
        this.leaderBoard.get(key)?.destroy();
        this.leaderBoard.delete(key);
      }
    }

    // sync ammo indicator and score
    const player = state.players.find((p) => p.id === this.currentUserID);
    if (player) {
      if (this.respawnText) {
        this.respawnText.visible = player.isDead;
      }
      if (player.dashCooldown) {
        if (this.dash) {
          this.dash.text = `Dash: ${Math.max(0, (player.dashCooldown - Date.now()) / 1000)}s`;
        }
      } else {
        if (this.dash) {
          this.dash.text = "Dash: READY";
        }
      }

      // sync reload indicator
      if (this.reloading) {
        this.reloading.visible = !!player.isReloading;
        if (player.isReloading) {
          this.reloading.text = `${Math.max(0, ((player.isReloading || 0) - Date.now()) / 1000)}s`;
        }
      }
    }
    const bulletsRemaining = player?.bullets;
    if (bulletsRemaining !== undefined) {
      for (let i = 0; i < BULLETS_MAX; i++) {
        if (this.ammos.has(i)) {
          const ammos = this.ammos.get(i);
          if (ammos) {
            ammos.visible = !(bulletsRemaining <= i);
          }
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
      this.connection?.writeJson({ type: ClientMessageType.SetAngle, angle: aimRad });
    }

    this.prevAimRad = aimRad;
  }

  private syncSprites<T>(oldSprites: Map<T, Phaser.GameObjects.Sprite>, newSprites: Map<T, Phaser.GameObjects.Sprite>) {
    newSprites.forEach((sprite, id) => {
      if (oldSprites.has(id)) {
        const oldSprite = oldSprites.get(id);
        if (oldSprite != null) {
          oldSprite.x = sprite.x;
          oldSprite.y = sprite.y;
          oldSprite.rotation = sprite.rotation;
          oldSprite.setTexture(sprite.texture.key);
        }
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
    nickname: from.nickname,
    position: {
      x: from.position.x + (to.position.x - from.position.x) * pctElapsed,
      y: from.position.y + (to.position.y - from.position.y) * pctElapsed,
    },
    aimAngle: to.aimAngle,
    isDead: to.isDead,
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
