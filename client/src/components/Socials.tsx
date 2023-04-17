import React from "react";

export function Socials() {
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
