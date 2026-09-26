import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import useEmblaCarousel from "embla-carousel-react";
import { FiLock } from "react-icons/fi";
import { SiLinkedin } from "react-icons/si";
import projects from "../../data/projects";
import { LINKEDIN_URL } from "../../data/contact";
import { useThemeMode } from "../../styles/ThemeModeContext";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import useProtectedAccess from "../shared/useProtectedAccess";
import ProtectedGate from "../shared/ProtectedGate";
import RollText from "../shared/RollText";
import SiteHeader from "../chrome/SiteHeader";
import SiteMenu from "../chrome/SiteMenu";
import Cursor from "../chrome/Cursor";
import Preloader, { willPreload } from "../chrome/Preloader";
import Backdrop from "./Backdrop";
import ProjectMedia, { PHONE_QUERY } from "./ProjectMedia";
import { useExpandTransition, RETURN_KEY, SLIDE_KEY } from "./ExpandTransition";
import { ease, dur, stagger, reveal } from "../../styles/motion";

// The homepage: one project card in focus at a time, the ones either side
// smaller and softer, looping forever. Drag, scroll, arrow keys or the dots
// move it; clicking the card in focus opens it (or asks for the password,
// if it's locked).

const EASE = ease.out;
// phones on their side: too short for the caption's second line or the
// logo above the pager
const SHORT = "(max-height: 520px) and (orientation: landscape)";

// every card image this screen will actually show, for the preloader to
// wait on (videos stream in on their own)
const onPhone = window.matchMedia(PHONE_QUERY).matches;
const PRELOAD = projects
  .filter((p) => p.media.type !== "video")
  .map((p) => (onPhone && p.media.mobileSrc) || p.media.src);

function readSlide() {
  try {
    const i = Number(sessionStorage.getItem(SLIDE_KEY));
    return Number.isInteger(i) && i >= 0 && i < projects.length ? i : 0;
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

function saveSlide(i) {
  try {
    sessionStorage.setItem(SLIDE_KEY, String(i));
  } catch {
    // storage blocked -- coming back just starts at the first card
  }
}

// ---------------- Layout ----------------

// Two ways to arrive:
//   "wipe"  first visit -- the loading screen lifts away over a page that's
//           already there while the stage settles (a slow push-in, like a
//           camera coming to rest); the cards wait, stacked, until the
//           panel uncovers the focused card, then glide out
//   "fade"  arriving from another page -- the header drops in, the stage
//           fades up and the footer follows
const introFade = keyframes`
  from { opacity: 0; transform: translateY(var(--from, 0)); }
`;

const settle = keyframes`
  from { transform: scale(1.06); }
`;

const Page = styled.div`
  position: fixed;
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
        /* lands softly under the lift (which itself speeds away) */
        animation: ${settle} ${reveal.lift + dur.fast}s ${ease.out} backwards;
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
     top so the cards sit a little low in the frame, clear of the pager
     logos (~130px up). Alternatives: 156px 112px sits as low as it can;
     116px 152px centres card + caption together; 78px 190px centres the
     card itself. */
  @media (min-width: 1025px) {
    padding-block: 136px 132px;
  }

  @media (max-width: 640px) {
    padding-block: 64px 132px;
  }

  @media ${SHORT} {
    padding-block: 56px 60px;
  }
`;

const Viewport = styled.div`
  width: 100%;
  overflow: hidden;
  /* cards either side are clipped by the screen edge, not by this box */
  padding: 24px 0;

  @media (max-width: 640px) {
    padding: 12px 0;
  }
`;

// Card size: a share of the screen width (--vw), capped so the card's
// height (at --ratio) never exceeds what's left after --reserve -- the
// Stage padding, the caption and the Viewport padding. Every screen shape
// sets its own three, so nothing overflows at any size or orientation.
const Track = styled.div`
  --vw: 38vw;
  --ratio: 1.778;
  --reserve: 414px;
  --gap: 20px;
  --w: min(var(--vw), max(180px, calc((100svh - var(--reserve)) * var(--ratio))));
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--gap) * -1);

  @media (max-width: 1024px) {
    --vw: 64vw;
    --reserve: 360px;
  }

  /* portrait tablets have height to spare: taller, wider cards */
  @media (min-width: 641px) and (max-width: 1024px) and (orientation: portrait) {
    --vw: 72vw;
    --ratio: 1.333;
  }

  /* phones: portrait cards (4:5), closer in shape to the full-height
     page they grow into when opened */
  @media (max-width: 640px) {
    --vw: 76vw;
    --ratio: 0.8;
    --reserve: 330px;
    --gap: 4vw;
  }

  @media ${SHORT} {
    --vw: 52vw;
    --ratio: 1.778;
    --reserve: 190px;
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
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 24px;
  font-size: 0.9rem;
  /* a touch brighter than textSecondary, for contrast over the backdrop's
     glow (see the backdrop note in projects.js) */
  color: #e0e0e0;

  strong {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
  }

  svg {
    vertical-align: -2px;
    margin-left: 6px;
  }

  @media (max-width: 640px) {
    font-size: 0.8rem;
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
  border-radius: 20px;
  overflow: hidden;
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
  }

  /* touch devices: skip the per-frame blur and feathering, keep the dimming */
  @media (pointer: coarse) {
    -webkit-mask-image: none;
    mask-image: none;

    > * {
      filter: brightness(calc(0.78 + 0.22 * var(--f)));
    }
  }

  /* keyboard focus ring on the card, not around the caption as well */
  ${Slide}:focus-visible & {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    border-radius: 14px;
  }
`;

const Footer = styled.footer`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 24px 40px;
  font-size: 0.9rem;

  @media (min-width: 1025px) {
    padding: 56px 88px;
  }

  /* phones: dots centred, "Get in touch" on its own line under them */
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 10px;
    padding: 12px 16px 20px;
  }

  @media ${SHORT} {
    padding: 10px 24px;
  }
`;

// same colour and weight as "Get in touch." opposite, so the footer reads
// as one line
const Copyright = styled.p`
  margin: 0;
  font-weight: 500;
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    display: none;
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  /* touch: bigger targets, packed closer so the row still fits */
  @media (pointer: coarse) {
    gap: 4px;
  }
`;

// A dot per project. The one in focus is ringed, with that project's logo
// (greyed out) floating above it -- every dot carries its logo, and only
// the active one's is visible, so it crossfades along as the cards move.
const RING_R = 10;
// how close (px) the cursor has to come before a dot's logo starts to appear
const NEAR_RADIUS = 140;
const RING_C = +(2 * Math.PI * RING_R).toFixed(2);

const PagerButton = styled.button`
  --near: 0;
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;

  /* the dot */
  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.text};
    opacity: ${({ $on }) => ($on ? 1 : 0.35)};
    transition: opacity ${dur.fast}s ${ease.out};
  }

  &:hover::before {
    opacity: 1;
  }

  /* the ring: drawn around the active dot, starting from the top */
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    pointer-events: none;
  }

  circle {
    fill: none;
    stroke: ${({ theme }) => theme.text};
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: ${RING_C};
    stroke-dashoffset: ${({ $on }) => ($on ? 0 : RING_C)};
    /* round caps would leave a speck where an undrawn ring starts */
    opacity: ${({ $on }) => ($on ? 1 : 0)};
    transition: ${({ $on }) =>
      $on
        ? `stroke-dashoffset ${dur.slower}s ${ease.inOut} ${stagger}s, opacity 0s`
        : `stroke-dashoffset ${dur.fast}s ${ease.out}, opacity ${dur.fast}s ${ease.out}`};
  }

  @media (prefers-reduced-motion: reduce) {
    circle {
      transition: none;
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
  }

  @media (pointer: coarse) {
    width: 36px;
    height: 36px;
  }
`;

// The active project's logo sits above its dot. The others condense into
// view as the cursor comes near -- from blurred and faint to clear, the
// closer it gets -- driven by --near (0 far away, 1 on the dot), which the
// pointer tracking in Showcase writes on each dot.
const Icon = styled.img`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  width: 36px;
  height: 36px;
  object-fit: contain;
  pointer-events: none;
  /* the square app icons get the same soft corners as the rounded ones */
  border-radius: ${({ $fill }) => ($fill ? "22%" : "0")};
  /* bare marks are mostly dark ink, which greys out to nearly nothing on
     the dark theme -- lift them so they still read */
  --lift: ${({ $fill, theme }) => (!$fill && theme.mode === "dark" ? "brightness(2.2)" : "brightness(1)")};

  ${({ $on }) =>
    $on
      ? css`
          filter: grayscale(1) var(--lift) blur(0);
          opacity: 0.85;
          transform: translate(-50%, 0) scale(1);
          transition:
            opacity ${dur.base}s ${ease.out},
            filter ${dur.base}s ${ease.out},
            transform ${dur.slow}s ${ease.out};
        `
      : css`
          filter: grayscale(1) var(--lift) blur(calc((1 - var(--near)) * 6px));
          opacity: calc(var(--near) * 0.7);
          transform: translate(-50%, calc((1 - var(--near)) * 10px)) scale(calc(0.8 + 0.2 * var(--near)));
          /* short, so it follows the cursor closely but never jitters */
          transition:
            opacity ${dur.fast}s ${ease.out},
            filter ${dur.fast}s ${ease.out},
            transform ${dur.fast}s ${ease.out};
        `}

  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
  }

  @media ${SHORT} {
    display: none;
  }
`;

// name on hover/focus for the other dots (the active one has its logo)
const Tip = styled.span`
  position: absolute;
  bottom: calc(100% + 54px);
  left: 50%;
  padding: 5px 10px;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.75rem;
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

const Contact = styled.a`
  --roll-align: flex-end;
  justify-self: end;

  @media (max-width: 640px) {
    --roll-align: center;
    justify-self: center;
  }

  font-weight: 500;
  color: inherit;

  &:hover {
    color: ${({ theme }) => theme.linkedin};
  }
`;

// ---------------- Component ----------------

export default function Showcase() {
  const { mode } = useThemeMode();
  const { reduced } = useMotionPreference();
  const { isUnlocked } = useProtectedAccess();
  const { expand, collapse, leavingId } = useExpandTransition();

  const [startIndex] = useState(readSlide);
  // coming straight back from the project in focus: its card stays hidden
  // until the full-screen media has shrunk back into it
  const [returning, setReturning] = useState(() => peekReturn() === projects[startIndex]?.id);
  // the entrance plays on a fresh arrival, not on the way back from a
  // project (that has its own motion); it starts once the preloader lifts
  const [intro] = useState(() => {
    if (returning) return null;
    return willPreload() ? "wipe" : "fade";
  });
  // ready: the page's entrance has begun (the lift has started, or there's
  // no loading screen). spreading: the lift has uncovered the focused card,
  // so the cards can move. settled: they've mostly arrived, caption's turn.
  const [ready, setReady] = useState(() => !willPreload());
  const [spreading, setSpreading] = useState(() => intro !== "wipe");
  const [settled, setSettled] = useState(() => intro !== "wipe");
  // the loading screen is up (the header shows through it until it's gone)
  const [covered, setCovered] = useState(() => intro === "wipe");

  useEffect(() => {
    if (!spreading || settled) return undefined;
    const t = setTimeout(() => setSettled(true), reveal.spread * 600);
    return () => clearTimeout(t);
  }, [spreading, settled]);

  // where the loading screen's bottom edge has to reach before the cards
  // move: the bottom of the focused card, read live as the lift runs
  const getRevealLine = useCallback(
    () => cardRefs.current[startIndex]?.getBoundingClientRect().bottom ?? window.innerHeight * 0.7,
    [startIndex]
  );
  const [selected, setSelected] = useState(startIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gateFor, setGateFor] = useState(null);
  const cardRefs = useRef([]);
  const gateTriggerRef = useRef(null);
  const pagerRef = useRef(null);

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
      saveSlide(i);
    };
    embla.on("select", onSelect);
    onSelect();
    return () => embla.off("select", onSelect);
  }, [embla]);

  // the way back: once the carousel has laid out, shrink the project's media
  // from full screen into its card
  useEffect(() => {
    if (!embla || !returning) return undefined;
    const raf = requestAnimationFrame(() => {
      const el = cardRefs.current[startIndex];
      const started =
        el && collapse(projects[startIndex], el, () => setReturning(false));
      if (!started) setReturning(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [embla, returning, collapse, startIndex]);

  // Pager logos appear as the cursor nears their dot: each dot gets --near,
  // 1 on the dot fading to 0 at NEAR_RADIUS. Fine pointers only -- touch has
  // no cursor to come near with.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    let raf = 0;
    let x = -1e4;
    let y = -1e4;
    const update = () => {
      raf = 0;
      pagerRef.current?.querySelectorAll("button").forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        btn.style.setProperty("--near", Math.max(0, 1 - d / NEAR_RADIUS).toFixed(3));
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      schedule();
    };
    const onLeave = () => {
      x = -1e4;
      y = -1e4;
      schedule();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // the page itself never scrolls here
  useEffect(() => {
    const html = document.documentElement;
    const prev = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = "hidden";
    // no rubber-band bounce on iOS while the homepage is up
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.overflow;
      html.style.overscrollBehavior = prev.overscroll;
    };
  }, []);

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
    if (!embla || menuOpen || gateFor) return undefined;
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
  }, [embla, menuOpen, gateFor]);

  // arrow keys anywhere on the page
  useEffect(() => {
    if (!embla || menuOpen || gateFor) return undefined;
    const onKey = (e) => {
      if (inputCalm()) return;
      if (e.key === "ArrowRight") embla.scrollNext();
      else if (e.key === "ArrowLeft") embla.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embla, menuOpen, gateFor]);

  const isLocked = useCallback((p) => p.locked && !isUnlocked, [isUnlocked]);

  const onSlideClick = (e, i) => {
    // modified clicks (new tab etc.) behave like any normal link
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // (the end of a drag never gets here -- Embla swallows that click itself)
    if (!embla) return;
    if (i !== selected) {
      embla.scrollTo(i);
      return;
    }
    const project = projects[i];
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

  const light = mode === "light";

  let spreadMode = null;
  if (intro === "wipe") spreadMode = spreading ? "wipe" : "stacked";
  else if (intro === "fade" && ready) spreadMode = "fade";

  return (
    <Page $leaving={!!leavingId} $returning={returning} $intro={intro} $ready={ready}>
      <Preloader
        sources={PRELOAD}
        reduced={reduced}
        onLiftStart={() => setReady(true)}
        onReveal={() => setSpreading(true)}
        onDone={() => setCovered(false)}
        getRevealLine={getRevealLine}
      />
      <Backdrop projects={projects} active={selected} light={light} still={reduced} />

      <SiteHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((o) => !o)} overIntro={covered} />
      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Stage aria-label="Selected work" inert={menuOpen}>
        <Viewport ref={viewportRef} data-cursor="drag" data-cursor-area>
          <Track>
            {projects.map((p, i) => {
              const active = i === selected;
              const locked = isLocked(p);
              // places from the card in focus when the page arrived, the
              // short way round the loop. Fixed to the arrival -- measured
              // from the current card instead, scrolling would hand the
              // intro spread to each new pair of neighbours and replay it.
              const n = projects.length;
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
                  to={p.to}
                  draggable={false}
                  onClick={(e) => onSlideClick(e, i)}
                  aria-label={`${p.title}${locked ? " (password protected)" : ""}`}
                  aria-current={active ? "true" : undefined}
                  // a side card moves the carousel to it; the one in focus opens
                  data-cursor={active ? (locked ? "lock" : "open") : away < 0 ? "prev" : "next"}
                >
                  <Caption $on={active && ready && settled && !returning && !leavingId} aria-hidden={!active}>
                    <Title>{p.title}</Title>
                    <Meta>
                      <span>{p.description}</span>
                      <span>
                        {p.role}
                        {p.years && (
                          <>
                            {" • "}
                            <strong>{p.years}</strong>
                          </>
                        )}
                        {locked && <FiLock aria-hidden="true" />}
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
                      style={returning && i === startIndex ? { visibility: "hidden" } : undefined}
                    >
                      <ProjectMedia project={p} />
                    </Card>
                  </Mover>
                </Slide>
              );
            })}
          </Track>
        </Viewport>
      </Stage>

      <Footer inert={menuOpen}>
        <Copyright>© {new Date().getFullYear()} Dara Phillips</Copyright>
        <Pager ref={pagerRef} role="group" aria-label="Choose a project">
          {projects.map((p, i) => (
            <PagerButton
              key={p.id}
              type="button"
              $on={i === selected}
              aria-label={p.title}
              aria-pressed={i === selected}
              onClick={() => embla?.scrollTo(i)}
            >
              <svg viewBox="0 0 28 28" aria-hidden="true">
                <circle cx="14" cy="14" r={RING_R} />
              </svg>
              <Icon src={p.icon.src} alt="" draggable={false} $on={i === selected} $fill={p.icon.fill} />
              {i !== selected && <Tip aria-hidden="true">{p.title}</Tip>}
            </PagerButton>
          ))}
        </Pager>
        <Contact href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="Get in touch on LinkedIn (opens in a new tab)">
          <RollText
            hover={
              <>
                <SiLinkedin aria-hidden="true" />
                LinkedIn
              </>
            }
          >
            Get in touch.
          </RollText>
        </Contact>
      </Footer>

      <Cursor reduced={reduced} />

      {createPortal(
        <ProtectedGate open={!!gateFor} onClose={closeGate} redirectTo={gateFor?.to ?? "/"} />,
        document.body
      )}
    </Page>
  );
}
