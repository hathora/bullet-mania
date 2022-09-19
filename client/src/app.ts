import Phaser, { Math as pMath } from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { ClientMessageType } from "../../common/messages";
import { Bullet, Direction, GameState, Player } from "../../common/types";
import { InterpolationBuffer } from "interpolation-buffer";
import { RoomConnection } from "./connection";
import MAP from '../../common/map';

const client = new HathoraClient(process.env.APP_ID as string, process.env.COORDINATOR_HOST);

class GameScene extends Phaser.Scene {
  private connection!: RoomConnection;

  // The buffer which holds state snapshots
  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  // A map of player sprites currently connected
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  // A map of bullet sprites currently in-air
  private bullets: Map<number, Phaser.GameObjects.Sprite> = new Map();
  // A flag to determine if a connection to server has been established
  private isConnectionOpen: boolean = false;
  // The graphics representation of the map objects
  private mapGfx: Phaser.GameObjects.Graphics | undefined;
  // The Hathora user for the current client's connected player
  private hathoraUser: object & { id: string } | undefined;
  // The current client's connected player's sprite object
  private playerSprite: Phaser.GameObjects.Sprite | undefined;
  // The previous tick's aim radians (used to check if aim has changed, before sending an update)
  private prevAimRad: number = 0;

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("player", "player.png");
    this.load.image("bullet", "bullet.png");
  }

  create() {
    getToken().then((token) => {
      getRoomId(token).then((roomId) => {
        this.connection = new RoomConnection(client, token, roomId);
        this.connection.connect();
        this.connection.addListener(({ state, ts }) => {
          // Flag connection as open, to enable input to be sent
          if (!this.isConnectionOpen) {
            this.isConnectionOpen = true;
          }

          // Start enqueuing state updates
          if (this.stateBuffer === undefined) {
            this.stateBuffer = new InterpolationBuffer(state, 50, lerp);
          } else {
            this.stateBuffer.enqueue(state, [], ts);
          }

          // Store the player's ID so we can differentiate them later
          this.hathoraUser = HathoraClient.getUserFromToken(token);
        });
      });
    });

    // Handle keyboard input
    const keys = this.input.keyboard.addKeys('W,S,A,D') as {
      W: Phaser.Input.Keyboard.Key,
      S: Phaser.Input.Keyboard.Key,
      A: Phaser.Input.Keyboard.Key,
      D: Phaser.Input.Keyboard.Key
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

      if (this.isConnectionOpen && prevDirection !== direction) {
        // If connection is open and direction has changed, send updated direction
        prevDirection = direction;
        this.connection.sendMessage({ type: ClientMessageType.SetDirection, direction });
      }
    };

    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);

    // Handle mouse-click input
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.isConnectionOpen) {
        // If the connection is open, send through click events
        this.connection.sendMessage({ type: ClientMessageType.Shoot });
      }
    });

    // Render map objects
    this.mapGfx = this.add.graphics();
    
    // Loop through each object in the map array...
    MAP.forEach(({ type, x, y, width, height, color }) => {
      // Typescript sanity check 🤣
      if (!this.mapGfx) {
        return;
      }

      // And draw it's shape according to it's 'type' property
      if (type === 'rect') {
        this.mapGfx.fillStyle(color, 1);
        this.mapGfx.fillRect(
          (x - (width / 2)), // Offset by 1/2 width / height to draw object with origin (0.5, 0.5)
          (y - (height / 2)),
          width,
          height
        );
      }
    });
  }

  update() {
    if (!this.isConnectionOpen || this.stateBuffer === undefined) {
      return;
    }

    const {mousePointer} = this.input;
    const { state } = this.stateBuffer.getInterpolatedState(Date.now());

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

    this.syncSprites(
      this.bullets,
      new Map(
        state.bullets.map((bullet) => [
          bullet.id,
          new Phaser.GameObjects.Sprite(this, bullet.position.x, bullet.position.y, "bullet"),
        ])
      )
    );

    if (this.playerSprite) {
      this.sendMousePosition(mousePointer, this.playerSprite);
    }
  }

  private sendMousePosition(mousePointer: Phaser.Input.Pointer, playerSprite: Phaser.GameObjects.Sprite) {
    const {x: mouseX, y: mouseY} = mousePointer;
    const {x: playerX, y: playerY} = playerSprite;
    const {zoom, worldView} = this.cameras.main;

    // Establish the angle between the player's camera-relative position and the mouse
    const relX = ((playerX - worldView.x) * zoom);
    const relY = ((playerY - worldView.y) * zoom);
    const aimRad = pMath.Angle.Between(relX + zoom, relY + zoom, mouseX, mouseY);
    const aimMoved = (this.prevAimRad !== aimRad);

    // Only if the aim has updated, send the update
    if (aimMoved) {
      this.connection.sendMessage({ type: ClientMessageType.SetAngle,
        angle: aimRad
      });
    }
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
        if (this.hathoraUser && id === this.hathoraUser.id) {
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

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "root",
  dom: { createContainer: true },
});
