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
      <h1 id={"authenticatePlayers"} style={h1Style}>
        Authenticate Players
      </h1>
      <p style={pStyle}>Use Hathora’s Auth Client to generate a unique token for players using Google login.</p>
      <Code>{"import {(AuthV1Api, AuthV1ApiInterface, Configuration)} from \"@hathora/hathora-cloud-sdk\";"}</Code>
      <h1 id={"createLobby"} style={h1Style}>
        Create public and private lobbies
      </h1>
      <p style={pStyle}>There are 3 types of lobbies that a player can create:</p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-decimal ml-6"}>
        <li className={"mt-1"}>
          <strong>Public</strong>: it will be returned the roomId in the public lobby list and any player can join
        </li>
        <li className={"mt-1"}>
          <strong>Private</strong>: the player who created the game must share the roomId with their friends
        </li>
        <li className={"mt-1"}>
          <strong>Local</strong>: for testing with a server running locally
        </li>
      </ul>
      <p style={pStyle}>
        If you have any specific user input you need to take in to initial your game state then pass it in through the{" "}
        <Code>initialConfig</Code> object. In Bullet Mania, for example, <Code>initialConfig</Code> includes:
      </p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
        <li className={"mt-1"}># of players in the room</li>
        <li className={"mt-1"}># of kills to win</li>
      </ul>
      <h1 id={"connectToLobby"} style={h1Style}>
        Fetch all public lobbies
      </h1>
      <p style={pStyle}>
        Retrieve a list of active public lobbies so players can coordinate which game to join. The region parameter is
        optional to filter the list by.
      </p>
      <h1 id={"listPublicLobbies"} style={h1Style}>
        Connect to a public or private lobby
      </h1>
      <p style={pStyle}>
        When a player requests to join, you can retrieve the lobby data to determine state. State is an object that
        stores the game state set by the server and is passed to all players. In Bullet Mania, the game checks to see if
        there’s space for another player before sending connection information. Check the code here (TODO: add link).
      </p>
      <h1 id={"setLobbyState"} style={h1Style}>
        Update lobby state on game server
      </h1>
      <p style={pStyle}>
        Use state to pass game data to players. State can only be updated by the server. See how Bullet Mania uses state
        here (TODO: add link).
      </p>
      <h1 id={"appendix"} style={h1Style}>
        Appendix
      </h1>
      <p style={pStyle}></p>
    </div>
  );
}

/*
 * Component used for short code snippet
 */
function Code(props: { children: React.ReactNode; className?: string }) {
  return (
    <code className={`bg-neutralgray-550 text-hathoraBrand-400 text-sm p-0.5 mt-2 rounded ${props.className}`}>
      {props.children}
    </code>
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
