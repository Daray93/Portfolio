import { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useShell } from "../components/shell/context";
import AboutCard from "../components/chrome/AboutCard";
import { ease, dur } from "../styles/motion";

// About, inside the shared frame (see Shell): the About card on its own, in
// the middle of the page. Phones and tablets reach it from the menu; on
// desktop the same card unfolds from the header's name and logo instead
// (see SiteHeader), so this page is only seen there from a direct link.
//
// The frame itself never scrolls; this page scrolls inside it if the card
// is taller than the screen, its words fading out before the header.

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
`;

// the header's zone on top (--top); the sides line up with the header
const Page = styled.article`
  --top: 136px;

  position: absolute;
  inset: 0;
  display: grid;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: var(--top) 40px 56px;
  -webkit-mask-image: linear-gradient(to bottom, transparent calc(var(--top) - 32px), #000 var(--top));
  mask-image: linear-gradient(to bottom, transparent calc(var(--top) - 32px), #000 var(--top));

  @media (max-width: 640px) {
    --top: 96px;
    padding: var(--top) 24px 40px;
  }

  @media (max-height: 640px) and (min-width: 641px) {
    --top: 112px;
    padding-bottom: 32px;
  }
`;

// centred where there's room, from the top where there isn't
const Sheet = styled.div`
  place-self: center;
  width: 100%;
  max-width: 440px;
  animation: ${rise} ${dur.slow}s ${ease.out} 0.1s backwards;

  @media (max-width: 640px) {
    place-self: start center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function About() {
  const { setPalette, setImage } = useShell();

  useEffect(() => {
    // a plain page: no colour behind the words
    setPalette(null);
    setImage(null);
  }, [setPalette, setImage]);

  return (
    <Page>
      <title>About → Dara Phillips</title>
      <meta
        name="description"
        content="Dara Phillips, product designer based in Ireland. Designs in Figma, then builds what's been designed, from brief to launch."
      />
      <Sheet>
        <AboutCard as="h1" />
      </Sheet>
    </Page>
  );
}
