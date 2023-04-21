import React from "react";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

import { GameConfig } from "./GameComponent";

export function ExplanationText() {
  return (
    <div className={"mt-6"} style={{ width: GameConfig.width }}>
      <h1 style={h1Style}>What is happening?</h1>
      <p style={pStyle}>
        We built <strong>Bullet Mania</strong> to showcase how to build and scale a multiplayer game on{" "}
        <Link href={"https://hathora.dev/docs/concepts/room-lifecycle"}>Hathora</Link>. Bullet Mania is{" "}
        <strong>fully open-source</strong>, source code is available{" "}
        <Link href={"https://github.com/hathora/topdown-shooter"}>here</Link>.
      </p>
      <p style={pStyle}>
        When a player creates a public or private <Link href={"https://hathora.dev/docs"}>room</Link> via the Hathora
        Lobby Service, a game server is dynamically provisioned in the region specified.
      </p>
      <p style={pStyle}>
        <strong>Important notes</strong>
      </p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
        <li className={"mt-2"}>
          A player must be authenticated to create/provision rooms so Hathora can enforce rate limiting
        </li>
        <li className={"mt-2"}>
          Bullet Mania's servers are automatically scalable because Hathora provisions as many rooms as needed
        </li>
        <li className={"mt-2"}>Once your game server exits or is idle for 5 minutes, the compute resource goes away</li>
        <li className={"mt-2"}>Hathora has no fixed costs, pricing is based on active compute usage</li>
      </ul>
      <h1 style={h1Style}>Why is it good?</h1>
      <p style={pStyle}>As seen in Bullet Mania your players will get good ping times because Hathora has:</p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-decimal ml-6"}>
        <li className={"mt-1"}>
          <strong>multi-region server availability</strong> to get players a server closest to them
        </li>
        <li className={"mt-1"}>
          <strong>private edge network</strong> that avoids network congestion and ensures an optimal path to the server
        </li>
      </ul>
      <p style={pStyle}>
        You get improved performance while reducing operational complexity because you don’t have to worry about:
      </p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-decimal ml-6"}>
        <li className={"mt-1"}>Patching underlying hosts for security</li>
        <li className={"mt-1"}>Capacity planning in each region you want game servers available</li>
        <li className={"mt-1"}>Paying for idle capacity to manage demand spikes</li>
      </ul>
      <h1 style={h1Style}>How to use Hathora for your game?</h1>
      <p style={pStyle}>
        You’ll need some middleware that can request capacity on Hathora and share the connection information with the
        right players. If you don’t have an existing Lobby/Matchmaking service, Hathora offers a lightweight Lobby
        Service to spin up and route players to the correct room.
      </p>
      <p style={pStyle}>With our Lobby Service, integration just takes a few steps:</p>
      <ul className={"font-hathoraBody list-decimal ml-6"}>
        <li className={"mt-1 text-neutralgray-400 hover:text-neutralgray-200 font-semibold"}>
          <NavLink className={"text-hathoraBrand-50"} headingId={"authenticatePlayers"}>
            Authenticate players
          </NavLink>
        </li>
        <li className={"mt-1 text-neutralgray-400 hover:text-neutralgray-200 font-semibold"}>
          <NavLink headingId={"createLobby"}>Create public or private lobbies</NavLink>
        </li>
        <li className={"mt-1 text-neutralgray-400 hover:text-neutralgray-200 font-semibold"}>
          <NavLink headingId={"listPublicLobbies"}>Fetch all public lobbies</NavLink>
        </li>
        <li className={"mt-1 text-neutralgray-400 hover:text-neutralgray-200 font-semibold"}>
          <NavLink headingId={"connectToLobby"}>Connect to a public or private lobby</NavLink>
        </li>
        <li className={"mt-1 text-neutralgray-400 hover:text-neutralgray-200 font-semibold"}>
          <NavLink headingId={"setLobbyState"}>Update lobby state on game server</NavLink>
        </li>
      </ul>
      <div className={"flex justify-center"}>
        <p className={"text-neutralgray-500 mt-6 mb-1 ml-1 font-hathoraBody"}>
          Click on the buttons below to see how each part has been implemented
        </p>
      </div>
      <div className={"relative"}>
        <img src={"/screenshots/lobby.png"} className={"opacity-50"} />
        <NavButton headingId={"listPublicLobbies"} className={"group top-[174px] left-[18px]"}>
          List Public Lobbies{" "}
          <ArrowLongRightIcon className="ml-0.5 h-5 w-5 text-hathoraBrand-500 group-hover:text-neutralgray-700 stroke-2" />
        </NavButton>
        <NavButton headingId={"createLobby"} className={"group top-[396px] right-[180px]"}>
          Create Lobby{" "}
          <ArrowLongRightIcon className="ml-0.5 h-5 w-5 text-hathoraBrand-500 group-hover:text-neutralgray-700 stroke-2" />
        </NavButton>
      </div>
      <h1 id={"createLobby"} style={h1Style}>
        Create Lobby
      </h1>
    </div>
  );
}

/*
 * Component used for external links
 */
function Link(props: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <a
      className={`font-hathoraBody text-hathoraBrand-500 hover:underline ${props.className}`}
      href={props.href}
      target={"_blank"}
    >
      {props.children}
    </a>
  );
}

/*
 * Component used to link text to scroll to a specific section
 */
function NavLink(props: { children: React.ReactNode; headingId: string; className?: string }) {
  return (
    <a
      href={`#${props.headingId}`}
      onClick={(e) => {
        e.preventDefault();
        document.querySelector(`#${props.headingId}`)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
      className={`font-hathoraBody text-hathoraBrand-500 hover:underline  ${props.className}`}
    >
      {props.children}
    </a>
  );
}

/*
 * Component used to render buttons over screenshot and scroll to specific sections
 */
function NavButton(props: { children: React.ReactNode; headingId: string; className?: string }) {
  return (
    <a
      href={`#${props.headingId}`}
      onClick={(e) => {
        e.preventDefault();
        document.querySelector(`#${props.headingId}`)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
      className={`absolute w-[160px] py-2 rounded bg-neutralgray-700 transition duration-400 group hover:bg-hathoraBrand-500 hover:text-neutralgray-700 font-semibold flex items-center justify-center font-hathora text-xs text-hathoraBrand-500 ${props.className}`}
    >
      {props.children}
    </a>
  );
}

const h1Style = {
  fontFamily: "Space Grotesk",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "32px",
  lineHeight: "40px",
  color: "#AF64EE",
  marginBottom: "12px",
  marginTop: "28px",
};

const pStyle = {
  marginTop: "16px",
  fontFamily: "Lato",
  fontSize: "16px",
  lineHeight: "26px",
  color: "#d4d4e3",
};
