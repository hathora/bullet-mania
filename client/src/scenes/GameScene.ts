import Phaser, { Math as pMath, Scene } from "phaser";
import { ClientMessageType } from "../../../common/messages";
import { Bullet, Direction, GameState, Player } from "../../../common/types";
import { InterpolationBuffer } from "interpolation-buffer";
import { RoomConnection } from "../connection";
import { MAP, MAP_BOUNDARIES, MAP_HEIGHT, MAP_WIDTH } from "../../../common/map";
import { HathoraClient } from "@hathora/client-sdk";

export class GameScene extends Scene {
  // A variable to represent our RoomConnection instance
  private connection!: RoomConnection;

  // The buffer which holds state snapshots
  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  // A map of player sprites currently connected
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  // A map of bullet sprites currently in-air
  private bullets: Map<number, Phaser.GameObjects.Sprite> = new Map();
  // The Hathora user for the current client's connected player
  private currentUserID: string | undefined;
  // The current client's connected player's sprite object
  private playerSprite: Phaser.GameObjects.Sprite | undefined;
  // The previous tick's aim radians (used to check if aim has changed, before sending an update)
  private prevAimRad: number = 0;

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
    this.connection.addListener(({ state, ts }) => {
      // Start enqueuing state updates
      if (this.stateBuffer === undefined) {
        this.stateBuffer = new InterpolationBuffer(state, 50, lerp);
      } else {
        this.stateBuffer.enqueue(state, [], ts);
      }
    });

    // Handle keyboard input
    const keys = this.input.keyboard.addKeys("W,S,A,D") as {
      W: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
    };
    let prevDirection = Direction.None;

    const handleKeyEvt = () => {
      let direction: Direction;
      if (keys.W.isDown) {
        direction = Direction.Up;
      } else if (keys.S.isDown) {
        direction = Direction.Down;
      } else if (keys.D.isDown) {
        direction = Direction.Right;
      } else if (keys.A.isDown) {
        direction = Direction.Left;
      } else {
        direction = Direction.None;
      }

      if (prevDirection !== direction) {
        // If connection is open and direction has changed, send updated direction
        prevDirection = direction;
        this.connection.sendMessage({ type: ClientMessageType.SetDirection, direction });
      }
    };

    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);

    // Handle mouse-click input
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      // If the connection is open, send through click events
      this.connection.sendMessage({ type: ClientMessageType.Shoot });
    });

    // Render grass
    this.add.tileSprite(MAP_BOUNDARIES.left, MAP_BOUNDARIES.top, MAP_WIDTH, MAP_HEIGHT, "grass").setOrigin(0, 0);

    // Render map objects
    MAP.forEach(({ x, y, width, height }) => {
      this.add.tileSprite(x, y, width, height, "wall").setOrigin(0, 0);
    });

    // Set the main camera's background colour and bounding box
    this.cameras.main.setBounds(MAP_BOUNDARIES.left, MAP_BOUNDARIES.top, MAP_WIDTH, MAP_HEIGHT);
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
          new Phaser.GameObjects.Sprite(this, player.position.x, player.position.y, "player").setRotation(
            player.aimAngle
          ),
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
      if (oldSprites.has(id)) {
        const oldSprite = oldSprites.get(id)!;
        oldSprite.x = sprite.x;
        oldSprite.y = sprite.y;
        oldSprite.rotation = sprite.rotation;
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
    position: {
      x: from.position.x + (to.position.x - from.position.x) * pctElapsed,
      y: from.position.y + (to.position.y - from.position.y) * pctElapsed,
    },
    aimAngle: to.aimAngle,
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
