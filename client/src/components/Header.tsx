import React from "react";

export function Header(props: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold">{props.children}</h1>;
}
