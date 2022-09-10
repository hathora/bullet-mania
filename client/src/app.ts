import Phaser from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { ClientMessageType, ServerMessage } from "../../common/messages";
import { HathoraTransport } from "@hathora/client-sdk/lib/transport";
import { Bullet, Direction, GameState, Player } from "../../common/types";
import { InterpolationBuffer } from "interpolation-buffer";

const client = new HathoraClient(import.meta.env.APP_ID);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

class GameScene extends Phaser.Scene {
  private userId!: string;
  private connection!: HathoraTransport;

  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private bullets: Map<number, Phaser.GameObjects.Sprite> = new Map();

  private prevAngle = 0;

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("player", "player.png");
    this.load.image("bullet", "bullet.png");
  }

  create() {
    getToken().then((token) => {
      this.userId = HathoraClient.getUserFromToken(token).id;
      getRoomId(token).then((roomId) => {
        client
          .connect(
            token,
            roomId,
            (msg) => this.onMessage(msg),
            (e) => this.onClose(e)
          )
          .then((connection) => {
            this.connection = connection;
          });
      });
    });

    // keyboard input
    const keys = this.input.keyboard.createCursorKeys();
    let prevDirection = Direction.None;
    const handleKeyEvt = () => {
      let direction: Direction;
      if (keys.up.isDown) {
        direction = Direction.Up;
      } else if (keys.down.isDown) {
        direction = Direction.Down;
      } else if (keys.right.isDown) {
        direction = Direction.Right;
      } else if (keys.left.isDown) {
        direction = Direction.Left;
      } else {
        direction = Direction.None;
      }

      if (prevDirection !== direction) {
        prevDirection = direction;
        const msg = { type: ClientMessageType.SetDirection, direction };
        this.connection.write(encoder.encode(JSON.stringify(msg)));
      }
    };
    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);

    // mouse input
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const msg = { type: ClientMessageType.Shoot };
      this.connection.write(encoder.encode(JSON.stringify(msg)));
    });
  }

  update() {
    if (this.stateBuffer === undefined) {
      return;
    }

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

    const pointer = this.input.activePointer;
    const player = this.players.get(this.userId);
    if (player !== undefined) {
      const angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);
      if (angle !== this.prevAngle) {
        this.prevAngle = angle;
        const msg = { type: ClientMessageType.SetAimAngle, aimAngle: angle };
        this.connection.write(encoder.encode(JSON.stringify(msg)));
      }
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
      }
    });
    oldSprites.forEach((sprite, id) => {
      if (!newSprites.has(id)) {
        sprite.destroy();
        oldSprites.delete(id);
      }
    });
  }

  private onMessage(data: ArrayBuffer) {
    const msg: ServerMessage = JSON.parse(decoder.decode(data));
    if (this.stateBuffer === undefined) {
      this.stateBuffer = new InterpolationBuffer(msg.state, 50, lerp);
    } else {
      this.stateBuffer.enqueue(msg.state, [], msg.ts);
    }
  }

  private onClose(e: { code: number; reason: string }) {
    console.error("Connection closed", e.reason);
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
