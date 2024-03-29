import React from "react";

interface LobbyPageCardProps {
  children: React.ReactNode;
  className?: string;
}
export function LobbyPageCard(props: LobbyPageCardProps) {
  return (
    <div
      className={`bg-secondary-400 border-2 border-brand-500 rounded-lg block text-center px-2 m-1 ${props.className}`}
    >
      {props.children}
    </div>
  );
}
