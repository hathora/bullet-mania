import Phaser from "phaser";
import { HathoraClient } from "@hathora/client-sdk";
import { ClientMessageType, ServerMessage } from "../../common/messages";
import { HathoraTransport } from "@hathora/client-sdk/lib/transport";
import { Direction, GameState, Player } from "../../common/types";
import { InterpolationBuffer } from "interpolation-buffer";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

class GameScene extends Phaser.Scene {
  private connection: HathoraTransport | undefined;
  private stateBuffer: InterpolationBuffer<GameState> | undefined;
  private players: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("player", "player.png");
  }

  create() {
    const client = new HathoraClient(import.meta.env.APP_ID);
    client.loginAnonymous().then((token) => {
      client.create(token, new Uint8Array()).then((roomId) => {
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
        console.log("sending msg", msg);
        this.connection?.write(encoder.encode(JSON.stringify(msg)));
      }
    };
    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);
  }

  update() {
    if (this.stateBuffer === undefined) {
      return;
    }

    const { state } = this.stateBuffer.getInterpolatedState(Date.now());

    state.players.forEach((player) => {
      if (!this.players.has(player.id)) {
        this.addPlayer(player);
      } else {
        this.updatePlayer(player);
      }
    });
  }

  private addPlayer({ id, position, aimAngle }: Player) {
    const sprite = this.add.sprite(position.x, position.y, "player").setOrigin(0, 0).setAngle(aimAngle);
    this.players.set(id, sprite);
  }

  private updatePlayer({ id, position, aimAngle }: Player) {
    const sprite = this.players.get(id)!;
    sprite.x = position.x;
    sprite.y = position.y;
    sprite.angle = aimAngle;
  }

  private onMessage(data: ArrayBuffer) {
    const msg: ServerMessage = JSON.parse(decoder.decode(data));
    console.log("Message received", msg);
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

function lerp(from: GameState, to: GameState, pctElapsed: number): GameState {
  return {
    players: to.players.map((toPlayer) => {
      const fromPlayer = from.players.find((p) => p.id === toPlayer.id);
      return fromPlayer !== undefined ? lerpPlayer(fromPlayer, toPlayer, pctElapsed) : toPlayer;
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

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  parent: "root",
  dom: { createContainer: true },
});
