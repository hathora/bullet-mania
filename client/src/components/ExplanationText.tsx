import React from "react";

import { GameConfig } from "./GameComponent";

export function ExplanationText() {
  return (
    <div style={{ width: GameConfig.width }}>
      <h1 style={h1Style}>Bullet Mania’s multiplayer infrastructure</h1>
      <p style={pStyle}>
        We built Bullet Mania to showcase how easy it is to build a multiplayer game on Hathora. This game is completely
        open source and you can check it out here.
      </p>
      <p style={pStyle}>
        Hathora is a serverless cloud hosting platform that dynamically provisions servers for multiplayer games on
        demand. With our platform, your game servers will be available globally and you won’t pay for idle servers. When
        your game sees player spikes, Hathora will automatically scale your game servers to meet demand.{" "}
      </p>
      <h1 style={h1Style}> Modern infrastructure, accessible to everyone</h1>
      <p style={pStyle}>
        With Hathora you can spin up servers on demand with 1 API call. Bullet Mania was built in less than a week and
        can scale on Hathora’s serverless architecture to a global audience. Read more about serverless here.
      </p>
      <h1 style={h1Style}>How do you use Hathora for your game?</h1>
      <p style={pStyle}>
        When a match request arrives from a player, Hathora will generate a unique “roomId” which resolves to a “host +
        port” that the game client can connect to. Read more about Hathora entities here. In order to provision capacity
        on Hathora, your game will need some middleware Lobby/Matchmaking service to authenticate and route players to a
        correct game server. Bullet Mania uses Hathora’s lightweight Lobby service so players can request a match.
        Players requesting a match must be authenticated in order to provide “rateLimiting”. Your game can either use
        Hathora auth service (read here) or you can use your own auth and sign it with your application’s appSecret.
        Unauthenticated users can still join existing public and private rooms.
      </p>
    </div>
  );
}

const h1Style = {
  fontFamily: "Oxanium",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "32px",
  lineHeight: "44px",
  color: "#AF64EE",
  marginBottom: "8px",
  marginTop: "7px",
};

const pStyle = {
  fontFamily: "Oxanium",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "28px",
  color: "white",
};
