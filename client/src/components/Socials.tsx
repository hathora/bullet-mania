import React, { useState } from "react";

export function Socials() {
  return (
    <div className="flex flex-row justify-center">{socialButton("github.svg", "github-hover.svg", "", "github")()}</div>
  );
}

function socialButton(neutralImage: string, hoverImage: string, link: string, alt: string) {
  return () => {
    const [image, setImage] = useState(neutralImage);
    return (
      <button
        onMouseEnter={() => setImage(hoverImage)}
        onMouseLeave={() => setImage(neutralImage)}
        className="flex flex-row justify-center"
        onClick={() => window.open(link, "_blank")}
      >
        <img src={image} alt={alt} className="w-8 h-8 m-2" />
      </button>
    );
  };
}

{
  /* <div onHover={} className="flex flex-row justify-center">
<a href="" target="_blank" rel="noreferrer">
  <img src={image} alt="github" className="w-8 h-8 m-2" />
</a>
</div> */
}
