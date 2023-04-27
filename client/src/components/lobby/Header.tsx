import React from "react";

export function Header(props: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-xl font-semibold uppercase text-brand-500 ${props.className}`}>{props.children}</h1>;
}
