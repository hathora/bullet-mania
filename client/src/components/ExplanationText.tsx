import React from "react";

import { GameConfig } from "./GameComponent";

export function ExplanationText() {
  return (
    <div style={{ width: GameConfig.width }}>
      <h1 style={h1Style}>What is happening?</h1>
      <p style={pStyle}>
        Top-down Shooter is a multiplayer 2D shooter. You must navigate through the map while shooting bullets at others
        and avoid dying.
      </p>
    </div>
  );
}

const h1Style = {
  fontFamily: "Space Grotesk",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "32px",
  lineHeight: "44px",
  color: "#AF64EE",
};

const pStyle = {
  fontFamily: "Space Grotesk",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "28px",
  color: "white",
};
