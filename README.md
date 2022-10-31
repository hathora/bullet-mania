# Hathora Topdown Shooter

## Overiew 

Multiplayer 2D shooter demo made using Hathora [client-sdk-ts](https://github.com/hathora/client-sdk-ts) and [server-sdk-ts](https://github.com/hathora/server-sdk-ts) + [Phaser](http://phaser.io/)

Additional implementations of the game client are also available for the following engines:
  - [Unity](https://github.com/hathora/topdown-shooter-unity-client)
  - [Bevy](https://github.com/hathora/topdown-shooter-bevy-client)

Assets from [Kenney](https://kenney.nl/assets/topdown-shooter)

Step by step tutorial: https://docs.hathora.dev/#/buildkit/tutorial_top_down_shooter

## Try it

The game is playable at https://hathora-topdown-shooter.surge.sh

![A screenshot of the completed top-down shooter game in action.](https://user-images.githubusercontent.com/5400947/192792673-3c6c5496-3c52-4d0d-87d6-b04f5ef59ea9.png)

Instructions:

  - WASD to move
  - Mouse to aim and shoot
  - Once you are in a game, share the URL to allow others to join

## Running locally 

To run locally:

- Have node installed
- Get a Hathora `appId` and `appSecret` via `curl -X POST https://coordinator.hathora.dev/registerApp`
- Create a .env file at the root with
```
APP_ID=<appId>
APP_SECRET=<appSecret>
```
- Start server: inside `server` directory run `npm start` (remember to `npm install` first)
- Start client: inside `client` directory run `npm start` (remember to `npm install` first)
