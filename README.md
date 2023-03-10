# Hathora Topdown Shooter

## Overiew 

Multiplayer 2D shooter demo made using [Hathora Buildkits](https://github.com/hathora/buildkits) + [Phaser](http://phaser.io/)

Assets from [Kenney](https://kenney.nl/assets/topdown-shooter)

Read step-by-step [tutorial](https://docs.hathora.dev/#/buildkit/tutorial_top_down_shooter) for this implementation

Additional implementations of the game client are also available for the following engines:
  - [Unity](https://github.com/hathora/topdown-shooter-unity-client)
  - [Bevy](https://github.com/hathora/topdown-shooter-bevy-client)

## Try it

The game is playable at https://hathora-topdown-shooter.surge.sh

![A screenshot of the completed top-down shooter game in action.](https://user-images.githubusercontent.com/5400947/199274234-ff3a66b4-3528-4be3-b6be-2240d3141846.png)

Instructions:

  - WASD to move
  - Mouse to aim and shoot
  - Once you are in a game, share the URL to allow others to join

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

## Running locally 

To run locally:

- Have node installed
- Get a Hathora `appId` and `appSecret` [(see below)]((#getting-an-app_id-and-app_secret))
- Create a .env file at the root with
```
APP_ID=<appId>
APP_SECRET=<appSecret>
```
- Start server: inside `server` directory run `npm start` (remember to `npm install` first)
- Start client: inside `client` directory run `npm start` (remember to `npm install` first)

## Getting an APP_ID and APP_SECRET

Visit [console.hathora.dev](https://console.hathora.dev/) and login if you haven't already done so.

You will be greeted with a project list screen, if you have already created an app the App ID and App Secret can be copied directly from the list...

![A screenshot of the Hathora console's project list](https://user-images.githubusercontent.com/7004280/224391310-2cad1799-d048-4776-97c9-4e1d62997fb0.png)

If you have not yet created an app, click the `Create Application` button. You will then be faced with the following screen...

![A screenshot of the Hathora console's Create Application screen](https://user-images.githubusercontent.com/7004280/224392467-327ae3a2-79b0-4ac2-8484-5d7b3ac42b6d.png)

After entering a valid name and creating your application, it's App ID and App Secret will be available to be copied.