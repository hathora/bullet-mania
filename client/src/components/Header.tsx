import React from "react";

export function Header(props: { children: React.ReactNode; className?: string }) {
  return <h1 className={props.className}>{props.children}</h1>;
}
