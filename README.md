# Bullet Mania
![Hathora presents Bullet Mania](/client/src/assets/screenshots/banner.png)

## Overview 

Multiplayer 2D shooter demo made using:
  - [Phaser](https://phaser.io/) - Game framework
  - [Hathora Cloud SDK](https://github.com/hathora/hathora-cloud-sdks) - Server hosting
  - [Hathora Buildkits](https://github.com/hathora/buildkits) - Network transport
  - [React](https://react.dev/) - Lobby UI

Assets from [Kenney](https://kenney.nl/assets/top-down-shooter)

Additional implementations of the game client are also available for the following engines:
  - [Unity](https://github.com/hathora/topdown-shooter-unity-client)
  - [Bevy](https://github.com/hathora/topdown-shooter-bevy-client)

## Try it

The game is playable at https://bullet-mania.netlify.app

Lobby            |  Gameplay
:-------------------------:|:-------------------------:
![A screenshot of the completed top-down shooter lobby.](/client/src/assets/screenshots/lobby_screenshot.png) |  ![A screenshot of the completed top-down shooter game in action.](/client/src/assets/screenshots/gameplay_screenshot_cropped.png)

Instructions:

  - **WASD** to move
  - **Mouse** to aim and shoot
  - **Spacebar** to dash
  - **R** to reload
  - Once you are in a game, share the URL to allow others to join

## Running locally 

To run locally:

- Have node installed
- Get a Hathora `appId` and `appSecret` via https://console.hathora.dev/
- Create a .env file at the root with
```
HATHORA_APP_ID=<appId>
HATHORA_APP_SECRET=<appSecret>
DEVELOPER_TOKEN=<appToken>
```
- Start server: inside `server` directory run `npm start` (remember to `npm install` first)
- Start client: inside `client` directory run `npm start` (remember to `npm install` first)

## Architecture

Fully server authoritative game:
- Client sends user inputs to server
- Server processes the inputs and runs game simulation (at 20fps)
- Server broadcasts state snapshots to clients (at 20fps)
- Client interpolates the state snapshots and renders the game UI (at 60fps)
- No prediction on the client side

Room based architecture:
- One player creates a game session and gets back a `roomId`
- They send the `roomId` to others
- Others can join the same session with this `roomId`
