import React from "react";

interface LobbyPageCardProps {
  children: React.ReactNode;
}
export function LobbyPageCard(props: LobbyPageCardProps) {
  return (
    <div className="border-solid border-2 rounded-lg block text-center px-3 m-2" style={{ backgroundColor: "#A9CFCF" }}>
      {props.children}
    </div>
  );
}
