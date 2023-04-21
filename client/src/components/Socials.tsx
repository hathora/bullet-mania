import React, { useState } from "react";

interface SocialProps {
  roomId: string | undefined;
}
export function Socials({ roomId }: SocialProps) {
  const [showCopied, setShowCopied] = useState(false);

  return (
    <div className="flex items-left w-full h-full my-4">
      <SocialIcon href="https://discord.gg/hathora" imgSrc="social-media/icon-discord.svg" imgAlt="Discord" />
      <SocialIcon href="https://github.com/hathora" imgSrc="social-media/icon-github.svg" imgAlt="Github" />
      <SocialIcon href="https://twitter.com/HathoraDev" imgSrc="social-media/icon-twitter.svg" imgAlt="Twitter" />
      <SocialIcon
        href="https://www.youtube.com/channel/UCwJhOa1fXbkitI0u94PJOHg"
        imgSrc="social-media/icon-youtube.svg"
        imgAlt="YouTube"
      />
      <SocialIcon
        href="https://www.linkedin.com/company/hathora/"
        imgSrc="social-media/icon-linkedin.svg"
        imgAlt="LinkedIn"
      />
      {roomId && (
        <div className={"ml-auto flex items-center gap-2"}>
          {showCopied && <div className={"text-neutralgray-400"}>Copied!</div>}
          <button
            className={
              "rounded-full border px-6 py-2 text-base font-medium shadow-sm transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-hathoraBrand-500 border border-hathoraBrand-500 text-xs justify-center text-hathoraBrand-500 hover:border-hathoraSecondary-500 hover:text-hathoraSecondary-500"
            }
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShowCopied(true);
              setTimeout(() => {
                setShowCopied(false);
              }, 2000);
            }}
          >
            Copy link to share!
          </button>
        </div>
      )}
    </div>
  );
}

interface SocialIconProps {
  href: string;
  imgSrc: string;
  imgAlt: string;
}

function SocialIcon(props: SocialIconProps) {
  const { href, imgSrc, imgAlt } = props;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mr-3">
      <img src={imgSrc} alt={imgAlt} />
    </a>
  );
}
