import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import useEmblaCarousel from "embla-carousel-react";
import { useIsPresent } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiLock, FiMaximize2 } from "react-icons/fi";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import useProtectedAccess from "../shared/useProtectedAccess";
import ProtectedGate from "../shared/ProtectedGate";
import Preloader, { willPreload } from "../chrome/Preloader";
import ProjectMedia, { PHONE_QUERY } from "./ProjectMedia";
import Tagline from "./Tagline";
import { COVER_RADIUS } from "./coverFrame";
import { useExpandTransition, RETURN_KEY, SLIDE_KEY } from "./ExpandTransition";
import { useShell } from "../shell/context";
import { ease, dur, reveal } from "../../styles/motion";

// A carousel of cards, used for the case studies (Work) and the client
// websites (Websites) -- both inside the shared frame (see Shell), which
// holds the background, header and menu. `kind` picks what a card does:
//   "work"   opens the case study (or asks for the password), with the
//            loading screen on a first visit and the card growing into it
//   "sites"  opens the live site in a new tab
//
// One card in focus at a time, the ones either side
// smaller and softer, looping forever. Drag, scroll, arrow keys or the dots
// move it; clicking the card in focus opens it (or asks for the password,
// if it's locked).

const EASE = ease.out;
// phones on their side: too short for the caption's second line or the
// logo above the pager
const SHORT = "(max-height: 520px) and (orientation: landscape)";
// Tablets held sideways. Told apart from laptops by being a touch screen
// with no hover -- not by shape: Safari's own bars take a real iPad's
// landscape height down to about 1180 x 710, as wide a shape as a laptop.
// A window close to 4:3 counts too, so a resized desktop browser can
// preview it. Past 1024px wide these otherwise get the desktop layout.
// (Each is a comma list, so the width range goes on every branch.)
const tabletWide = (range) =>
  [
    `${range} and (orientation: landscape) and (min-height: 521px) and (hover: none) and (pointer: coarse)`,
    `${range} and (orientation: landscape) and (min-height: 521px) and (max-aspect-ratio: 3/2)`,
  ].join(", ");
const TABLET_WIDE = tabletWide("(min-width: 641px) and (max-width: 1400px)");
const TABLET_WIDE_SMALL = tabletWide("(min-width: 641px) and (max-width: 1024px)");
const TABLET_WIDE_DESKTOP_CHROME = tabletWide("(min-width: 1025px) and (max-width: 1400px)");

const onPhone = window.matchMedia(PHONE_QUERY).matches;

// every card image a carousel will actually show -- screenshots and logos --
// for the preloader to wait on (videos stream in on their own; wordmarks are
// just text)
const preloadSources = (items) =>
  items
    .filter((p) => p.media.src && p.media.type !== "video")
    .map((p) => (onPhone && p.media.mobileSrc) || p.media.src);

// A picture of the card for the background to blur: a screenshot, or what a
// device mockup shows. Logos, videos, wordmarks and designed compositions
// (SVG mockups -- a wall or fan of phones blurs to murk) don't make good
// colour fields, so those cards use their colours instead.
function backdropImage(item) {
  const m = item?.media;
  if (!m || !m.src || /\.(mp4|webm|mov|svg)(\?|$)/i.test(m.src)) return null;
  // a contained picture (a composition on a transparent ground) blurs to mud
  if (m.type === "image") return m.fit === "contain" ? null : (onPhone && m.mobileSrc) || m.src;
  if (m.type === "tablet" || m.type === "desktop") return m.src;
  return null;
}

// each carousel remembers its own card in focus for the session
const slideKey = (kind) => (kind === "work" ? SLIDE_KEY : `${SLIDE_KEY}:${kind}`);

function readSlide(kind, count) {
  try {
    const i = Number(sessionStorage.getItem(slideKey(kind)));
    return Number.isInteger(i) && i >= 0 && i < count ? i : 0;
  } catch {
    return 0;
  }
}

// the project the visitor opened last, if they've come straight back from
// it (only read here -- the transition provider clears it once it's used)
function peekReturn() {
  try {
    return sessionStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
}

function saveSlide(kind, i) {
  try {
    sessionStorage.setItem(slideKey(kind), String(i));
  } catch {
    // storage blocked -- coming back just starts at the first card
  }
}

// ---------------- Layout ----------------

// Two ways to arrive:
//   "wipe"  first visit -- the loading screen opens on the focused card
//           alone (see Preloader) while the stage settles (a slow push-in,
//           like a camera coming to rest); the cards wait, stacked behind
//           it, until the window opens out, then glide out
//   "fade"  arriving from another page -- the header drops in, the stage
//           fades up and the footer follows
const introFade = keyframes`
  from { opacity: 0; transform: translateY(var(--from, 0)); }
`;

const settle = keyframes`
  from { transform: scale(1.06); }
`;

const Page = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.text};
  user-select: none;
  -webkit-user-select: none;

  > header,
  > footer,
  > section {
    transition: opacity ${dur.base}s ${ease.out};
  }

  > header {
    --from: -10px;
  }

  > section {
    --from: 0px;
  }

  > footer {
    --from: 10px;
  }

  ${({ $intro, $ready }) =>
    $intro === "fade" &&
    !$ready &&
    css`
      > header,
      > footer,
      > section {
        opacity: 0;
      }
    `}

  /* "backwards" only: holds the start state through each delay, then hands
     back to the normal styles, so the leaving fade below still works */
  ${({ $intro, $ready }) =>
    $intro === "fade" &&
    $ready &&
    css`
      > header {
        animation: ${introFade} ${dur.slow}s ${ease.out} 0.05s backwards;
      }
      > section {
        animation: ${introFade} ${dur.slower}s ${ease.out} 0.15s backwards;
      }
      > footer {
        animation: ${introFade} ${dur.slow}s ${ease.out} 0.35s backwards;
      }
    `}

  ${({ $intro, $ready }) =>
    $intro === "wipe" &&
    $ready &&
    css`
      > section {
        /* pushes in through the shot and the opening, landing softly */
        animation: ${settle} ${reveal.shot + reveal.hold + reveal.open + dur.fast}s ${ease.out} backwards;
      }
    `}

  /* coming back from a project: only the card being returned to shows at
     first; the header and footer fade in once it's home */
  ${({ $returning }) =>
    $returning &&
    css`
      > section {
        pointer-events: none;
      }

      > header,
      > footer {
        opacity: 0;
      }
    `}

  /* while a card opens into its project, the header and footer fade and
     the cards either side push away (see Mover) -- a camera moving in on
     the one in focus */
  ${({ $leaving }) =>
    $leaving &&
    css`
      pointer-events: none;

      > header,
      > footer {
        opacity: 0;
      }
    `}
`;

// Padded clear of the header and footer, so "centred" means centred in the
// space between them rather than on the whole screen.
const Stage = styled.section`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  padding-block: 80px 130px;
  outline: none;

  /* desktop: header and footer sit further in from the edges, so the
     band between them starts and ends further in too. Weighted toward the
     top so the cards sit a little low in the frame. Alternatives: 156px 112px sits as low as it can;
     116px 152px centres card + caption together; 78px 190px centres the
     card itself. */
  @media (min-width: 1025px) {
    padding-block: 136px 132px;
  }

  /* tablets held sideways: about 40px of clear space below the header and
     above the footer, so the card doesn't crowd them (see Band). Up to
     1024px they sit about 70px and 60px in; past it, the desktop header and
     footer, about 100px and 92px. */
  @media ${TABLET_WIDE_SMALL} {
    padding-block: 116px 108px;
  }

  @media ${TABLET_WIDE_DESKTOP_CHROME} {
    padding-block: 144px 140px;
  }

  /* phones: generous room under the header before the caption; the
     footer is just the pager lines */
  @media (max-width: 640px) {
    padding-block: 96px 72px;
  }

  @media ${SHORT} {
    padding-block: 56px 60px;
  }
`;

// Card size: a share of the screen width (--vw), capped so the card's
// height (at --ratio) never exceeds what's left after --reserve -- the
// Stage padding, the caption and the Viewport padding (--pad). Every screen
// shape sets its own, so nothing overflows at any size or orientation. Set
// here rather than on the track so the arrows can line up with the card.
const Band = styled.div`
  position: relative;
  width: 100%;
  --pad: 24px;
  --vw: 38vw;
  --ratio: 1.778;
  --reserve: 416px;
  --gap: 20px;
  /* the screen as it is right now (dvh: grows when mobile browser bars
     hide), falling back to the smallest it can be */
  --vh: 100svh;
  --w: min(var(--vw), max(180px, calc((var(--vh) - var(--reserve)) * var(--ratio))));

  @supports (height: 100dvh) {
    --vh: 100dvh;
  }

  @media (max-width: 1024px) {
    --vw: 64vw;
    --reserve: 368px;
  }

  /* tablets held sideways: height is what limits the card here, so it's
     sized to leave clear space above and below (see Stage) and room for the
     caption under it. --reserve is the Stage padding, 2 x --pad and about
     110px for the caption. */
  @media ${TABLET_WIDE} {
    --pad: 12px;
    --vw: 64vw;
  }

  @media ${TABLET_WIDE_SMALL} {
    --reserve: 358px;
  }

  @media ${TABLET_WIDE_DESKTOP_CHROME} {
    --reserve: 418px;
  }

  /* portrait tablets have height to spare: taller, wider cards */
  @media (min-width: 641px) and (max-width: 1024px) and (orientation: portrait) {
    --vw: 72vw;
    --ratio: 1.333;
  }

  /* phones: tall portrait cards (7:10), closer in shape to the
     full-height page they grow into when opened */
  @media (max-width: 640px) {
    --pad: 12px;
    --vw: 76vw;
    --ratio: 0.7;
    --reserve: 288px;
    --gap: 4vw;
  }

  @media ${SHORT} {
    --vw: 52vw;
    --ratio: 1.778;
    --reserve: 196px;
  }
`;

const Viewport = styled.div`
  overflow: hidden;
  /* cards either side are clipped by the screen edge, not by this box */
  padding: var(--pad) 0;
`;

const Track = styled.div`
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--gap) * -1);
`;

// Glass circles, like the menu's: the action badge on the card in focus
// and the arrows either side.
const glass = css`
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    0 8px 24px rgba(0, 0, 0, 0.28);

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(0, 0, 0, 0.72);
  }
`;

// Previous / next, at the screen edges, level with the middle of the card
// (it sits at the bottom of the track, under its caption). Each shows while
// the side card it moves to is hovered (or the arrow itself, or it has
// keyboard focus); always shown where there's no hover.
const Arrow = styled.button`
  ${glass}
  position: absolute;
  z-index: 3;
  bottom: calc(var(--pad) + var(--w) / var(--ratio) / 2);
  ${({ $side }) => $side}: clamp(12px, 3vw, 40px);
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  cursor: pointer;
  opacity: 0;
  transform: translateY(50%) scale(0.9);
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.fast}s ${ease.out},
    background-color ${dur.fast}s ${ease.out};

  &:hover,
  &:focus-visible,
  ${Band}:has([data-side="${({ $side }) => ($side === "left" ? "prev" : "next")}"]:hover) & {
    opacity: 1;
    transform: translateY(50%);
  }

  @media (hover: none) {
    opacity: 1;
    transform: translateY(50%);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.75;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  &:active {
    transform: translateY(50%) scale(0.96);
    transition-duration: 0.1s;
  }


  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
  }

  /* hidden on phones for now: swiping and the pager cover it */
  @media (max-width: 640px) {
    display: none;
  }
`;

const Slide = styled(Link)`
  z-index: ${({ $active }) => ($active ? 2 : 1)};
  flex: 0 0 calc(var(--w) + var(--gap));
  min-width: 0;
  padding-left: var(--gap);
  display: flex;
  flex-direction: column;
  /* captions wrap to different heights -- sitting every card on the same
     bottom line keeps the row level */
  justify-content: flex-end;
  gap: 18px;
  color: inherit;
  font-weight: 400;
  -webkit-tap-highlight-color: transparent;


  &:hover {
    color: inherit;
  }

  &:focus-visible {
    outline: none;
  }
`;

// The whole caption moves as one piece -- title, description and role
// together. The outgoing one clears quickly; the incoming one waits for the
// track to settle, then fades up into place.
const Caption = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: 0;


  transform: translateY(8px);
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.fast}s ${ease.out};

  ${({ $on }) =>
    $on &&
    css`
      opacity: 1;
      transform: none;
      transition:
        opacity ${dur.slow}s ${ease.out} 0.3s,
        transform ${dur.slow}s ${ease.out} 0.3s;
    `}
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.75rem, 2.6vw, 2.75rem);
  font-weight: 500;
  /* tighter as it grows, so the big title still reads as one word shape */
  letter-spacing: -0.035em;
  line-height: 1.05;

  /* desktop: the card is big enough to lead, so the title steps back --
     smaller and a shade softer than full white */
  @media (min-width: 1025px) {
    font-size: clamp(1.625rem, 1.8vw, 2rem);
    font-weight: 500;
    letter-spacing: -0.025em;
    opacity: 0.92;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.005em;
  /* dark: a soft grey that sits back from the title but still passes AA
     (4.5:1+) over the brightest glow behind it (see the backdrop note in
     projects.js); light: the theme's own secondary, AA on the cream */
  color: ${({ theme }) => (theme.mode === "dark" ? "#bdbdbd" : theme.textSecondary)};

  strong {
    font-weight: 600;
    color: ${({ theme }) => (theme.mode === "dark" ? "#dcdcdc" : theme.text)};
  }

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }

  @media ${SHORT} {
    display: none;
  }
`;

// First arrival: the cards either side start stacked behind the one in
// focus and glide out to their places. --side is how many places from the centre the
// card sits; --w and --gap come from Track.
const spreadOut = keyframes`
  from { transform: translateX(calc(var(--side) * -1 * (var(--w) + var(--gap)))); }
`;

// Carries the arrival movement -- Embla moves the slides themselves, so
// this sits inside them rather than on them.
const Mover = styled.div`
  position: relative;
  border-radius: ${COVER_RADIUS.default}px;

  /* keyboard focus ring around the card, not the caption as well -- drawn
     here, since the card's own rounded clip would hide it */
  ${Slide}:focus-visible & {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    border-radius: ${COVER_RADIUS.phone}px;
  }

  /* waiting under the loading screen: held where the spread starts from */
  ${({ $spread }) =>
    $spread === "stacked" &&
    css`
      transform: translateX(calc(var(--side) * -1 * (var(--w) + var(--gap))));
    `}

  ${({ $spread }) =>
    $spread === "wipe" &&
    css`
      animation: ${spreadOut} ${reveal.spread}s ${reveal.spreadCurve} backwards;
    `}

  ${({ $spread }) =>
    $spread === "fade" &&
    css`
      animation: ${spreadOut} ${dur.slower}s ${ease.out} 0.3s backwards;
    `}

  /* opening a project: the other cards drift outward, away from the one in
     focus, and dissolve -- on the same curve and length as the card opening.
     Coming back, they're hidden until the focused card has landed, then
     blur in. */
  transition:
    transform 1.05s cubic-bezier(0.7, 0, 0.2, 1),
    opacity 0.9s ${ease.out},
    filter 1.1s ${ease.out};

  ${({ $veiled }) =>
    $veiled &&
    css`
      opacity: 0;
      filter: blur(14px);
    `}

  ${({ $pushAway }) =>
    $pushAway &&
    css`
      transform: translateX(calc(var(--away) * 12vw)) scale(0.94);
      opacity: 0;
    `}
`;

// Size, brightness and softness all follow --f: 1 in focus, 0 one
// card away, set every frame from the track's actual position (see the
// tween in Showcase) -- so they move with a drag or a snap exactly, rather
// than on a timer of their own. $active only gives the right first frame.
const Card = styled.div`
  --f: ${({ $active }) => ($active ? 1 : 0)};
  position: relative;
  aspect-ratio: var(--ratio);
  /* the same corners as the case study cover it opens into */
  border-radius: ${COVER_RADIUS.default}px;
  overflow: hidden;
  /* The rounded corners as an explicit clip too: overflow + radius alone
     stops clipping a child while it animates on its own layer (the hover
     zoom), so the corners would flash square as the picture scales. */
  clip-path: inset(0 round ${COVER_RADIUS.default}px);
  /* own compositing layer: keeps the rounded clip exact while the card
     scales, instead of leaving a hairline seam at its edges */
  isolation: isolate;
  backface-visibility: hidden;
  transform: scale(calc(0.88 + 0.12 * var(--f))) translateZ(0);
  transform-origin: center;
  will-change: transform;

  /* Out of focus, the whole card is evenly soft: its edges feather by the
     same amount the image inside is blurred (a blur of r spreads an edge
     over roughly 3r), like one object out of focus rather than a sharp
     frame around a blurry picture. Both grow as the card moves away from
     the centre and are gone entirely when it's in focus.
     Horizontal and vertical fades are intersected so all four edges go.
     Each fade starts 1px outside the card, so in focus (no feather) the
     edge is solid rather than a faint transparent line. */
  --blur: calc((1 - var(--f)) * 1px);
  --feather: calc(var(--blur) * 3);
  -webkit-mask-image:
    linear-gradient(to right, transparent -1px, #000 var(--feather), #000 calc(100% - var(--feather)), transparent calc(100% + 1px)),
    linear-gradient(to bottom, transparent -1px, #000 var(--feather), #000 calc(100% - var(--feather)), transparent calc(100% + 1px));
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to right, transparent -1px, #000 var(--feather), #000 calc(100% - var(--feather)), transparent calc(100% + 1px)),
    linear-gradient(to bottom, transparent -1px, #000 var(--feather), #000 calc(100% - var(--feather)), transparent calc(100% + 1px));
  mask-composite: intersect;

  /* the image itself softens too. It runs well past the card on every
     side, so its own blurred edge is clipped away rather than showing. */
  > * {
    inset: -12px;
    filter: brightness(calc(0.78 + 0.22 * var(--f))) blur(var(--blur));
    transition: transform ${dur.slow}s ${ease.out};
  }

  /* Hovering the card in focus eases its picture in a touch, inside the
     same frame. The open transition measures the picture as it is on
     screen, zoom included, so clicking mid-zoom still hands off exactly.
     Pointers that hover only, and not with reduced motion. */
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    ${Slide}[aria-current="true"]:hover > * > & > * {
      transform: scale(1.06);
    }
  }

  /* touch devices: skip the per-frame blur and feathering, keep the dimming */
  @media (pointer: coarse) {
    -webkit-mask-image: none;
    mask-image: none;

    > * {
      filter: brightness(calc(0.78 + 0.22 * var(--f)));
    }
  }


  /* one frame for every card, whatever fills it: a hairline just inside
     the edge, so a light logo panel, a dark one and a video all sit in
     the same border on the dark stage */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};
    pointer-events: none;
  }

  @media (max-width: 640px) {
    border-radius: ${COVER_RADIUS.phone}px;
    clip-path: inset(0 round ${COVER_RADIUS.phone}px);
  }
`;

// What a click on the card in focus does -- open it, or the padlock if it's
// locked -- in the top right, on hover. Always shown where there's no hover.
const Badge = styled.span`
  ${glass}
  position: absolute;
  z-index: 1;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  opacity: 0;
  transform: scale(0.9);
  pointer-events: none;
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.fast}s ${ease.out};

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 1.75;
  }

  ${({ $on }) =>
    $on &&
    css`
      ${Slide}:hover &,
      ${Slide}:focus-visible & {
        opacity: 1;
        transform: none;
      }

      @media (hover: none) {
        opacity: 1;
        transform: none;
      }
    `}

  /* Locked: the padlock is a status, not an action, so it shows on the card
     in focus without waiting for a hover -- a touch larger, on a solid dark
     disc so the white lock holds its contrast on light images too */
  ${({ $locked, $on }) =>
    $locked &&
    css`
      width: 36px;
      height: 36px;
      background: rgba(12, 12, 14, 0.78);

      svg {
        width: 16px;
        height: 16px;
        stroke-width: 2;
      }

      ${$on &&
      css`
        opacity: 1;
        transform: none;
      `}
    `}

  @media (max-width: 640px) {
    top: 12px;
    right: 12px;
  }
`;

// Just the pager, centred under the card -- contact lives in the menu, so
// the homepage has the header up top, the work in the middle and nothing
// else competing with it.
const Footer = styled.footer`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 24px 40px;

  @media (min-width: 1025px) {
    padding: 56px 88px;
  }

  @media (max-width: 640px) {
    padding: 8px 24px 20px;
  }

  @media ${SHORT} {
    padding: 10px 24px;
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
`;

// A dot per project that morphs: the one in focus stretches into a pill and
// the others stay round, the length sliding across as the cards move. Each
// button is 16px wider than its mark, so the gaps stay even whichever one
// is long, and none is narrower than a 24px target.
const PagerButton = styled.button`
  position: relative;
  display: grid;
  place-items: center;
  width: ${({ $on }) => ($on ? "48px" : "24px")};
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: transparent;
  cursor: pointer;
  transition: width ${dur.slow}s ${ease.inOut};

  &::before {
    content: "";
    width: ${({ $on }) => ($on ? "32px" : "8px")};
    height: 8px;
    border-radius: 4px;
    background: ${({ theme }) => theme.text};
    /* 0.5 keeps the resting dots at 3:1 or more against the background */
    opacity: ${({ $on }) => ($on ? 1 : 0.5)};
    transition:
      width ${dur.slow}s ${ease.inOut},
      opacity ${dur.fast}s ${ease.out};
  }

  &:hover::before {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &::before {
      transition: opacity ${dur.fast}s ${ease.out};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
  }
`;

// the project's name, just above a dot on hover or keyboard focus (not on
// the one in focus -- its caption is already on screen)
const Tip = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  padding: 5px 10px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.body};
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.fast}s ${ease.out};

  ${PagerButton}:focus-visible & {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  @media (hover: hover) {
    ${PagerButton}:hover & {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
`;

// ---------------- Component ----------------

const NOUN = { work: "project", sites: "website" };

export default function Showcase({ items, kind = "work", label = "Selected work" }) {
  const { reduced } = useMotionPreference();
  const { menuOpen, setPalette, setImage, setChrome, slidIn } = useShell();
  const work = kind === "work";
  const { isUnlocked } = useProtectedAccess();
  const { expand, collapse, leavingId } = useExpandTransition();
  // false while this page slides out of the frame (see Shell): it stays on
  // screen for the slide but must stop listening, or the next page's first
  // scroll turns this carousel and re-tints the background under that page
  const present = useIsPresent();

  const [startIndex] = useState(() => readSlide(kind, items.length));
  // coming straight back from the project in focus: its card stays hidden
  // until the full-screen media has shrunk back into it
  const [returning, setReturning] = useState(() => work && peekReturn() === items[startIndex]?.id);
  // the entrance plays on a fresh arrival, not on the way back from a
  // project (that has its own motion); it starts once the preloader lifts
  const [intro] = useState(() => {
    // arriving from another page in the frame: the slide is the entrance
    if (returning || slidIn()) return null;
    return work && willPreload() ? "wipe" : "fade";
  });
  // ready: the page's entrance has begun (the intro's shot has started, or
  // there's no loading screen). spreading: the intro's window is opening
  // out, so the cards can move. settled: they've mostly arrived, caption's turn.
  const [ready, setReady] = useState(() => intro !== "wipe");
  const [spreading, setSpreading] = useState(() => intro !== "wipe");
  const [settled, setSettled] = useState(() => intro !== "wipe");
  // the loading screen is up (the header shows through it until it's gone)
  const [covered, setCovered] = useState(() => intro === "wipe");

  useEffect(() => {
    if (!spreading || settled) return undefined;
    const t = setTimeout(() => setSettled(true), reveal.spread * 600);
    return () => clearTimeout(t);
  }, [spreading, settled]);

  // The focused card's box and corners, for the intro's window onto it.
  // Also centres the stage's settle (push-in) on that card, so the card only
  // grows inside its window rather than drifting against its edges.
  const getFrame = useCallback(() => {
    const card = cardRefs.current[startIndex];
    if (!card) return null;
    const { top, left, width, height } = card.getBoundingClientRect();
    const stage = card.closest("section");
    if (stage) {
      const s = stage.getBoundingClientRect();
      stage.style.transformOrigin = `${left + width / 2 - s.left}px ${top + height / 2 - s.top}px`;
    }
    return { top, left, width, height, radius: parseFloat(getComputedStyle(card).borderRadius) || 0 };
  }, [startIndex]);
  const [selected, setSelected] = useState(startIndex);
  const [gateFor, setGateFor] = useState(null);
  const cardRefs = useRef([]);
  const gateTriggerRef = useRef(null);

  const [viewportRef, embla] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex,
    duration: reduced ? 1 : 34,
  });

  // Each card's focus (--f) from the track's live position: 1 at the centre
  // falling to 0 a card away, with the transform origin on the side facing
  // the centre so side cards shrink toward the one in focus. Follows
  // Embla's own tween recipe, including the loop's wrapped slides.
  useEffect(() => {
    if (!embla) return undefined;
    const tween = () => {
      const engine = embla.internalEngine();
      const progress = embla.scrollProgress();
      const snaps = embla.scrollSnapList();
      snaps.forEach((snap, snapIndex) => {
        engine.slideRegistry[snapIndex].forEach((slideIndex) => {
          let diff = snap - progress;
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                diff = Math.sign(target) === -1 ? snap - (1 + progress) : snap + (1 - progress);
              }
            });
          }
          const el = cardRefs.current[slideIndex];
          if (!el) return;
          const f = Math.max(0, 1 - Math.abs(diff * snaps.length));
          el.style.setProperty("--f", f.toFixed(3));
          el.style.transformOrigin = diff > 0 ? "left center" : "right center";
        });
      });
    };
    tween();
    embla.on("scroll", tween).on("reInit", tween).on("slideFocus", tween);
    return () => {
      embla.off("scroll", tween).off("reInit", tween).off("slideFocus", tween);
    };
  }, [embla]);

  // track the card in focus, and remember it for coming back from a page
  useEffect(() => {
    if (!embla) return undefined;
    const onSelect = () => {
      const i = embla.selectedScrollSnap();
      setSelected(i);
      saveSlide(kind, i);
    };
    embla.on("select", onSelect);
    onSelect();
    return () => embla.off("select", onSelect);
  }, [embla, kind]);

  // the background takes the card in focus's colours
  useEffect(() => {
    if (!present) return;
    setPalette(items[selected]?.backdrop);
    setImage(backdropImage(items[selected]));
  }, [items, selected, present, setPalette, setImage]);

  // the header stays hidden behind the loading screen (it's just the name
  // there), and steps aside while a card opens or shrinks back home; back
  // to normal when this page goes
  useEffect(() => {
    setChrome({ overIntro: false, away: covered || !!leavingId || returning });
  }, [covered, leavingId, returning, setChrome]);
  useEffect(() => () => setChrome({ overIntro: false, away: false }), [setChrome]);

  // the way back: once the carousel has laid out and the card's picture has
  // loaded (the shrink is measured from its size), shrink the project's
  // media from full screen into its card
  useEffect(() => {
    if (!embla || !returning) return undefined;
    let cancelled = false;
    let raf = 0;
    const start = () => {
      if (cancelled) return;
      raf = requestAnimationFrame(() => {
        const el = cardRefs.current[startIndex];
        const started =
          el && collapse(items[startIndex], el, () => setReturning(false));
        if (!started) setReturning(false);
      });
    };
    const img = cardRefs.current[startIndex]?.querySelector("img");
    if (img && !(img.complete && img.naturalWidth)) {
      (img.decode ? img.decode() : Promise.reject()).catch(() => {}).then(start);
    } else {
      start();
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [embla, returning, collapse, startIndex, items]);

  // Coming back from a project, the carousel ignores input while the card
  // shrinks home -- and afterwards, until the scroll that brought the
  // visitor back has fully died away (each leftover event pushes the
  // release back), so its momentum can't carry on to the next project.
  // A fresh, deliberate scroll works as soon as the old one has stopped.
  const CALM_MS = 450;
  const returningRef = useRef(returning);
  returningRef.current = returning;
  const calmUntil = useRef(returning ? Infinity : 0);
  useEffect(() => {
    if (!returning && calmUntil.current === Infinity) calmUntil.current = performance.now() + CALM_MS;
  }, [returning]);
  const inputCalm = () => returningRef.current || performance.now() < calmUntil.current;

  // wheel/trackpad: one card per gesture. A trackpad keeps firing wheel
  // events long after the fingers lift, so the lock only releases once the
  // events have actually stopped for a moment.
  useEffect(() => {
    if (!embla || menuOpen || gateFor || !present) return undefined;
    let acc = 0;
    let locked = false;
    let quiet = 0;

    const onWheel = (e) => {
      e.preventDefault();
      if (inputCalm()) {
        if (!returningRef.current) calmUntil.current = performance.now() + CALM_MS;
        return;
      }
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        locked = false;
        acc = 0;
      }, 180);
      if (locked) return;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 30) {
        if (acc > 0) embla.scrollNext();
        else embla.scrollPrev();
        locked = true;
        acc = 0;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(quiet);
      window.removeEventListener("wheel", onWheel);
    };
  }, [embla, menuOpen, gateFor, present]);

  // arrow keys anywhere on the page
  useEffect(() => {
    if (!embla || menuOpen || gateFor || !present) return undefined;
    const onKey = (e) => {
      if (inputCalm()) return;
      if (e.key === "ArrowRight") embla.scrollNext();
      else if (e.key === "ArrowLeft") embla.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla, menuOpen, gateFor, present]);

  const isLocked = useCallback((p) => p.locked && !isUnlocked, [isUnlocked]);

  const onSlideClick = (e, i) => {
    // modified clicks (new tab etc.) behave like any normal link
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    // (the end of a drag never gets here -- Embla swallows that click itself)
    // a side card comes into focus first
    if (i !== selected) {
      e.preventDefault();
      embla?.scrollTo(i);
      return;
    }
    // a website in focus: let the link open it in a new tab
    if (!work) return;
    e.preventDefault();
    if (!embla) return;
    const project = items[i];
    if (isLocked(project)) {
      gateTriggerRef.current = e.currentTarget;
      setGateFor(project);
      return;
    }
    const card = cardRefs.current[i];
    expand(project, card);
  };

  const closeGate = () => {
    setGateFor(null);
    gateTriggerRef.current?.focus();
  };

  const noun = NOUN[kind];
  const preload = useMemo(() => preloadSources(items), [items]);

  let spreadMode = null;
  if (intro === "wipe") spreadMode = spreading ? "wipe" : "stacked";
  else if (intro === "fade" && ready) spreadMode = "fade";

  return (
    <Page $leaving={!!leavingId} $returning={returning} $intro={intro} $ready={ready}>
      {work && (
        <Preloader
          sources={preload}
          reduced={reduced}
          onStart={() => setReady(true)}
          onReveal={() => setSpreading(true)}
          onDone={() => setCovered(false)}
          getFrame={getFrame}
        />
      )}

      <Stage aria-label={label}>
        <Band>
          <Viewport ref={viewportRef}>
            <Track>
              {items.map((p, i) => {
                const active = i === selected;
                const locked = work && isLocked(p);
                const link = work
                  ? { to: p.to }
                  : { as: "a", href: p.url, target: "_blank", rel: "noopener noreferrer" };
                // places from the card in focus when the page arrived, the
                // short way round the loop. Fixed to the arrival -- measured
                // from the current card instead, scrolling would hand the
                // intro spread to each new pair of neighbours and replay it.
                const n = items.length;
                let side = (((i - startIndex) % n) + n) % n;
                if (side > n / 2) side -= n;
                // which way this card sits from the one in focus now, for
                // the push-away when a project opens
                let away = (((i - selected) % n) + n) % n;
                if (away > n / 2) away -= n;

                return (
                  <Slide
                    key={p.id}
                    $active={active}
                    {...link}
                    draggable={false}
                    onClick={(e) => onSlideClick(e, i)}
                    aria-label={`${p.title}${locked ? " (password protected)" : ""}${work ? "" : " (opens in a new tab)"}`}
                    aria-current={active ? "true" : undefined}
                    data-side={away === -1 ? "prev" : away === 1 ? "next" : undefined}
                  >
                    <Caption $on={active && ready && settled && !returning && !leavingId} aria-hidden={!active}>
                      <Title>{p.title}</Title>
                      <Meta>
                        <span>
                          <Tagline project={p} />
                        </span>
                        <span>
                          {p.role}
                          {p.years && (
                            <>
                              {" • "}
                              <strong>{p.years}</strong>
                            </>
                          )}
                        </span>
                      </Meta>
                    </Caption>
                    <Mover
                      // only the cards either side of the focused one spread;
                      // anything further out starts and ends off-screen, so
                      // moving it would just sweep it across the others
                      $spread={Math.abs(side) === 1 ? spreadMode : null}
                      $pushAway={!!leavingId && !active}
                      $veiled={returning && !active}
                      style={{ "--side": side, "--away": Math.sign(away) }}
                    >
                      <Card
                        ref={(el) => (cardRefs.current[i] = el)}
                        $active={active}
                        $bare={!!leavingId || returning}
                        style={returning && i === startIndex ? { visibility: "hidden" } : undefined}
                      >
                        <ProjectMedia project={p} />
                      </Card>
                      <Badge
                        $on={active && settled && !returning && !leavingId}
                        $locked={locked}
                        aria-hidden="true"
                      >
                        {locked ? <FiLock /> : work ? <FiMaximize2 /> : <FiArrowUpRight />}
                      </Badge>
                    </Mover>
                  </Slide>
                );
              })}
            </Track>
          </Viewport>
          <Arrow
            type="button"
            $side="left"
            aria-label={`Previous ${noun}`}
            onClick={() => embla?.scrollPrev()}
          >
            <FiArrowLeft aria-hidden="true" />
          </Arrow>
          <Arrow
            type="button"
            $side="right"
            aria-label={`Next ${noun}`}
            onClick={() => embla?.scrollNext()}
          >
            <FiArrowRight aria-hidden="true" />
          </Arrow>
        </Band>
      </Stage>

      <Footer>
        <Pager role="group" aria-label={`Choose a ${noun}`}>
          {items.map((p, i) => (
            <PagerButton
              key={p.id}
              type="button"
              $on={i === selected}
              aria-label={p.title}
              aria-pressed={i === selected}
              onClick={() => embla?.scrollTo(i)}
            >
              {i !== selected && <Tip aria-hidden="true">{p.title}</Tip>}
            </PagerButton>
          ))}
        </Pager>
      </Footer>


      {work &&
        createPortal(
          <ProtectedGate open={!!gateFor} onClose={closeGate} redirectTo={gateFor?.to ?? "/"} />,
          document.body
        )}
    </Page>
  );
}
