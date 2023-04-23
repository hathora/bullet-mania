import ts from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import js from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import React from "react";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";

import "./rsh-style.css";
import GitHubIcon from "../assets/github.svg";

import { GameConfig } from "./GameComponent";

SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("javascript", js);

export function ExplanationText() {
  return (
    <div className={"mt-6"} style={{ width: GameConfig.width }}>
      <h1 style={h1Style}>Learn how we built Bullet Mania</h1>
      <Link href={"https://github.com/hathora/topdown-shooter/"} icon={GitHubIcon}>
        Bullet Mania source code
      </Link>
      <p style={textStyle}>
        We built <strong>Bullet Mania</strong> to showcase how simple it is to build and scale a multiplayer game on{" "}
        <Link href={"https://hathora.dev/docs"}>Hathora Cloud</Link>. Hathora Cloud works well for both new and existing
        multiplayer games. To learn more about deploying your multiplayer game on Hathora Cloud, check out our{" "}
        <Link href={"https://hathora.dev/docs/get-started"}>10-minute Get Started guide</Link>.
      </p>
      <h1 style={h1Style}>What is happening?</h1>
      <p style={textStyle}>
        When a player <NavLink headingId={"createLobby"}>creates a public or private room</NavLink>, a game server is
        dynamically provisioned by Hathora Cloud in the region specified.
      </p>
      <p style={textStyle}>
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
      <p style={textStyle}>As seen in Bullet Mania your players will get good ping times because Hathora has:</p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-decimal ml-6"}>
        <li className={"mt-1"}>
          <strong>multi-region server availability</strong> to get players a server closest to them
        </li>
        <li className={"mt-1"}>
          <strong>private edge network</strong> that avoids network congestion and ensures an optimal path to the server
        </li>
      </ul>
      <p style={textStyle}>
        You get improved performance while reducing operational complexity because you don’t have to worry about:
      </p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-decimal ml-6"}>
        <li className={"mt-1"}>Patching underlying hosts for security</li>
        <li className={"mt-1"}>Capacity planning in each region you want game servers available</li>
        <li className={"mt-1"}>Paying for idle capacity to manage demand spikes</li>
      </ul>
      <h1 style={h1Style}>How to use Hathora for your game?</h1>
      <p style={textStyle}>
        You’ll need some middleware that can request capacity on Hathora and share the connection information with the
        right players. If you don’t have an existing Lobby/Matchmaking service, Hathora offers a lightweight Lobby
        Service to spin up and route players to the correct room.
      </p>
      <p style={textStyle}>With our Lobby Service, integration just takes a few steps:</p>
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
        <NavButton headingId={"lobbyInfo"} className={"group top-[246px] left-[252px]"}>
          Get Lobby Info{" "}
          <ArrowLongRightIcon className="ml-0.5 h-5 w-5 text-hathoraBrand-500 group-hover:text-neutralgray-700 stroke-2" />
        </NavButton>
        <NavButton headingId={"createLobby"} className={"group top-[396px] right-[180px]"}>
          Create Lobby{" "}
          <ArrowLongRightIcon className="ml-0.5 h-5 w-5 text-hathoraBrand-500 group-hover:text-neutralgray-700 stroke-2" />
        </NavButton>
        <NavButton headingId={"connectionInfo"} className={"group top-[500px] right-[240px]"}>
          Get Connection Info{" "}
          <ArrowLongRightIcon className="ml-0.5 h-5 w-5 text-hathoraBrand-500 group-hover:text-neutralgray-700 stroke-2" />
        </NavButton>
      </div>
      <h1 id={"authenticatePlayers"} style={h1Style}>
        Authenticate Players
      </h1>
      <p style={textStyle}>Use Hathora’s Auth Client to generate a unique token for players using Google login.</p>
      <p className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>
        Import auth client from <Code>@hathora/hathora-cloud-sdk</Code>
      </p>
      <CodeBlock>
        {`import {(AuthV1Api, AuthV1ApiInterface, Configuration)} from "@hathora/hathora-cloud-sdk";

let client = new AuthV1Api(new Configuration({ basePath: "api.hathora.dev" }));`}
      </CodeBlock>
      <p className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>
        Use auth client to generate player tokens (needed to create rooms)
      </p>
      <CodeBlock>
        {`// arbitrary token & id
let token = await authClient.loginAnonymous().token;

// integrate with Google
let token = await authClient.loginGoogle(googleIdToken).token;

// players enter names
let token = await authClient.loginNickname(this.appId,{nickname:"name"}).token;`}
      </CodeBlock>
      <h1 id={"createLobby"} style={h1Style}>
        Create public and private lobbies
      </h1>
      <p style={textStyle}>There are 3 types of lobbies that a player can create:</p>
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
      <p style={textStyle}>
        If you have any specific user input you need to take in to initial your game state then pass it in through the{" "}
        <Code>initialConfig</Code> object. In Bullet Mania, for example, <Code>initialConfig</Code> includes:
      </p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
        <li className={"mt-1"}># of players in the room</li>
        <li className={"mt-1"}># of kills to win</li>
      </ul>
      <p className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>
        Authenticated players (via client) can create lobbies
      </p>
      <CodeBlock>{`lobbyClient.createLobby(
  playerToken: Token,
  region: Region,
  initialConfig: InitialConfig,
  visibility: "public", "private", "local"
)`}</CodeBlock>
      <h1 id={"listPublicLobbies"} style={h1Style}>
        Fetch all public lobbies
      </h1>
      <p style={textStyle}>
        Retrieve a list of active public lobbies so players can coordinate which game to join. The region parameter is
        optional to filter the list by.
      </p>
      <p className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>Display all active public rooms</p>
      <CodeBlock>{`lobbyClient.listActivePublicLobbies(
  appId: string,
  region?: Region
)`}</CodeBlock>
      <h1 id={"connectToLobby"} style={h1Style}>
        Connect to a public or private lobby
      </h1>
      <p style={textStyle}>
        When a player requests to join, you can retrieve the lobby data to determine state. State is an object that
        stores the game state set by the server and is passed to all players. In Bullet Mania, the game checks to see if
        there’s space for another player before sending connection information.
      </p>
      <p style={textStyle}>See how we implemented it for Bullet Mania:</p>
      <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
        <li className={"mt-2"}>
          <Link
            href={"https://github.com/hathora/topdown-shooter/blob/develop/client/src/app.tsx#L41"}
            icon={GitHubIcon}
          >
            Connecting to a room (client)
          </Link>
        </li>
        <li className={"mt-2"}>
          <Link
            href={"https://github.com/hathora/topdown-shooter/blob/develop/server/server.ts#L166"}
            icon={GitHubIcon}
          >
            Checking player capacity (server)
          </Link>
        </li>
      </ul>
      <h2 id={"joinLobby"} style={h2Style}>
        Join a room
      </h2>
      <p id={"lobbyInfo"} className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>
        Fetch lobby information
      </p>
      <CodeBlock>{`lobbyClient.getLobbyInfo(
  appId: string,
  roomId: string 
)`}</CodeBlock>
      <p id={"connectionInfo"} className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>
        Get connection info (host and port) to route your player
      </p>
      <CodeBlock>{`roomService.getConnectionInfo(
  appId: string,
  roomId: string
)`}</CodeBlock>
      <h1 id={"setLobbyState"} style={h1Style}>
        Update lobby state on game server
      </h1>
      <p style={textStyle}>
        Use lobby state to pass game data to players. State can only be updated by the server.{" "}
        <Link href={"https://github.com/hathora/topdown-shooter/blob/develop/server/server.ts#L481"} icon={GitHubIcon}>
          See how Bullet Mania uses lobby state
        </Link>
        <p className={"text-neutralgray-400 mt-4 mb-2 ml-1 font-hathoraBody"}>Update lobby state</p>
        <CodeBlock>{`lobbyClient.setLobbyState(
  appId: string,
  roomId: string,
  setLobbyStateRequest: SetLobbyStateRequest
)`}</CodeBlock>
      </p>
      <h1 id={"appendix"} style={h1Style}>
        Appendix
      </h1>
      <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
        <li className={"mt-1"}>
          You need to authenticate players, with either your own identity service (sign with Hathora appSecret) or
          Hathora auth service, to spin up a room – rateLimiting per user
        </li>
        <li className={"mt-1"}>
          Players can call <Code>{"/lobby/v2/{appId}/create/private"}</Code> or{" "}
          <Code>{"/lobby/v2/{appId}/create/public"}</Code> to start a match on Hathora
          <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
            <li className={"mt-1"}>Private room: copy the returned roomId and share with friends</li>
            <li className={"mt-1"}>
              Public room: call on <Code>{"/lobby/v2/{appId}/list/public"}</Code> to list all possible rooms in a
              particular region and display to your players (region is optional)
            </li>
          </ul>
        </li>
        <li className={"mt-1"}>List public lobbies</li>
        <li className={"mt-1"}>
          Player can connect to room by grabbing all relevant information about a room by specifying appID and roomID on{" "}
          <Code>{"/lobby/v2/{appId}/info/{roomId}"}</Code>
          <ul className={"font-hathoraBody text-neutralgray-200 list-disc ml-6"}>
            <li className={"mt-1"}>
              Once your player has a roomId they want to join (this can be done via sharing roomId, public lobby
              listing, or custom matchmaking logic), they can connect to the room with...
            </li>
            <li className={"mt-1"}>
              State: JSON object that you can use to store and share game state information to all players{" "}
            </li>
            <li className={"mt-1"}>
              initialConfig: JSON object that the player who created the room can use to initialize the game
            </li>
            <li className={"mt-1"}>createAt: when the room was created</li>
            <li className={"mt-1"}>createdBy: who create the room</li>
            <li className={"mt-1"}>Region: where the game server is located</li>
          </ul>
        </li>
        <li className={"mt-1"}>Manually spin down rooms and servers</li>
      </ul>
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
 * Component used for code block
 */
function CodeBlock(props: { children: string | string[]; className?: string }) {
  return (
    <div className="container">
      <SyntaxHighlighter language="javascript" className={"syntax-highlighter"} useInlineStyles={false}>
        {props.children}
      </SyntaxHighlighter>
    </div>
  );
}

/*
 * Component used for external links
 */
function Link(props: { children: React.ReactNode; href: string; className?: string; icon?: string }) {
  return (
    <a
      className={`font-hathoraBody text-hathoraBrand-500 hover:underline ${
        props.icon ? "inline-flex items-center rounded -ml-2 px-2 py-1 hover:bg-neutralgray-650" : "inline-block"
      } ${props.className}`}
      href={props.href}
      target={"_blank"}
    >
      {props.children}
      {props.icon && <img src={props.icon} className={"h4 w-4 ml-1"} />}
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

const h2Style = {
  fontFamily: "Space Grotesk",
  fontStyle: "normal",
  fontWeight: 500,
  fontSize: "22px",
  lineHeight: "28px",
  color: "#AF64EE",
  marginBottom: "10px",
  marginTop: "20px",
};

const textStyle = {
  marginTop: "16px",
  fontFamily: "Lato",
  fontSize: "16px",
  lineHeight: "26px",
  color: "#d4d4e3",
};
