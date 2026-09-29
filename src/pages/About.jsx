import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useIsPresent } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiFileText } from "react-icons/fi";
import { SiLinkedin } from "react-icons/si";
import { useShell } from "../components/shell/context";
import CopyEmail from "../components/chrome/CopyEmail";
import { pill } from "../components/chrome/pill";
import { LINKEDIN_URL } from "../data/contact";
import { useMotionPreference } from "../styles/MotionPreferenceContext";
import { ease, dur } from "../styles/motion";
import portrait from "../components/home/assets/Me.png";

// About, inside the shared frame (see Shell), told as a story that runs
// sideways: a track of chapters along a hairline timeline, the next one
// peeking in from the right. Under the track, a bar that never moves: where
// you are in the story on the left, email and LinkedIn on the right.
//
// A mouse wheel turns one chapter per gesture (like the Work carousel);
// trackpad side-swipes and touch scroll the track natively and snap to each
// chapter; arrow keys and the bar's arrows step too. The frame itself never
// scrolls, and nothing here listens once the page starts sliding out.
//
// On phones the story stacks instead: the chapters run down one ordinary
// scrolling page (a sideways track clips anything taller than the screen),
// each timeline filling in as it's scrolled past, with email and LinkedIn
// at the end.

const CV_URL = "/Dara-Phillips_cv_2026.pdf";
// the course has since been renamed Creative Digital Computing; same code, same page
const COURSE_URL = "https://tus.ie/courses/us825/";

// a few course modules, the ones closest to the work
const MODULES = [
  "UI/UX Prototyping",
  "Interaction Design Practice",
  "Design Thinking",
  "Front-End Development",
  "3D Computer Graphics",
  "Virtual, Augmented & Spatial Computing",
];
const PHONE = "(max-width: 640px)";
// phones stack the chapters down one scrolling page instead of sideways
const stacked = () => window.matchMedia(PHONE).matches;
const WHEEL_QUIET_MS = 180;
// how far a mouse drag must travel to turn a chapter
const DRAG_STEP = 60;

// each chapter's short name, for the contents under the track (in order)
const CHAPTERS = ["Hello", "Study", "Freelance", "How I work", "Tools", "What's next"];
const STUDY = CHAPTERS.indexOf("Study");

// grouped by what they're for; only tools I can talk through in depth
const TOOLS = [
  { label: "Design", items: ["Figma", "Blender", "Unity"] },
  { label: "Build", items: ["Claude Code", "Firebase", "GitHub"] },
  { label: "Sites", items: ["React", "TypeScript", "WordPress"] },
  { label: "Team", items: ["Jira", "Linear"] },
];

const PRINCIPLES = [
  { title: "Start with the problem", text: "Pen and paper before pixels, so the screens answer a real need." },
  { title: "Design in systems", text: "Components and tokens first, so what gets built stays consistent." },
  { title: "Prototype for real", text: "Working versions, not just mockups, so ideas get tested with actual use." },
  {
    title: "Ship, then learn",
    text: "Getting products in front of people, and letting what they do shape the next version.",
  },
];

// ---------------- frame ----------------

// the header's zone on top, the footer's margin below (as on Work)
const Page = styled.article`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: clamp(24px, 4vh, 48px);
  padding: 136px 0 56px;

  /* phones: the page itself scrolls; words fade out before reaching the
     header rather than sliding under it */
  @media ${PHONE} {
    display: block;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    padding: 96px 0 40px;
    -webkit-mask-image: linear-gradient(to bottom, transparent 64px, #000 96px);
    mask-image: linear-gradient(to bottom, transparent 64px, #000 96px);
  }

  @media (max-height: 640px) and (min-width: 641px) {
    padding-top: 112px;
    padding-bottom: 32px;
  }

  /* phones held sideways: every pixel of height counts */
  @media (max-height: 480px) and (min-width: 641px) {
    gap: 16px;
    padding-top: 84px;
    padding-bottom: 16px;
  }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
`;

// each chapter fades up a touch after the one before
const arrive = css`
  animation: ${rise} ${dur.slow}s ${ease.out} backwards;
  animation-delay: ${({ $i = 0 }) => 0.1 + $i * 0.06}s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// ---------------- track ----------------

// the sides line up with the header (88px, 40px on tablets, 24px on phones)
const Track = styled.ol`
  --side: 88px;
  --gap: clamp(48px, 7vw, 112px);

  align-self: center;
  display: flex;
  align-items: flex-start;
  gap: var(--gap);
  max-height: 100%;
  margin: 0;
  /* the end leaves room for the last chapter to reach the start too (--end,
     measured in sync()), so every chapter has a stop of its own */
  padding: 0 var(--end, var(--side)) 0 var(--side);
  list-style: none;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--side);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* a mouse can drag the story along (see the drag effect) */
  @media (hover: hover) and (pointer: fine) and (min-width: 641px) {
    cursor: grab;
  }

  &[data-dragging] {
    cursor: grabbing;
    scroll-snap-type: none;
    user-select: none;
  }

  @media (max-width: 1024px) {
    --side: 40px;
  }

  @media ${PHONE} {
    --side: 24px;
    --gap: 56px;

    flex-direction: column;
    max-height: none;
    padding: 0 var(--side);
    overflow: visible;
    scroll-snap-type: none;
  }
`;

// A chapter: its number and when above the timeline's hairline, the story
// below. Narrow enough that the next one shows at the edge. The opening is
// wide (the statement and portrait side by side); a short one, like Tools,
// is narrow so its few words don't sit in a wide empty column.
const WIDTH = {
  desktop: { wide: "min(720px, 62vw)", normal: "min(460px, 38vw)", short: "min(380px, 30vw)" },
  tablet: { wide: "min(600px, 76vw)", normal: "min(420px, 58vw)", short: "min(320px, 44vw)" },
};

// the chapter in place reads at full strength, the rest sit back
const Chapter = styled.li`
  ${arrive}
  flex: none;
  width: ${({ $size = "normal" }) => WIDTH.desktop[$size]};
  scroll-snap-align: start;
  opacity: 0.38;
  transition: opacity ${dur.slow}s ${ease.out};

  &[data-state="current"] {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 1024px) {
    width: ${({ $size = "normal" }) => WIDTH.tablet[$size]};
  }

  /* stacked: full width, and all of it readable at once */
  @media ${PHONE} {
    &,
    &[data-state] {
      width: auto;
      opacity: 1;
    }
  }
`;

const Meta = styled.p`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 14px;
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.textTertiary};
`;

// The timeline: a hairline under each chapter's meta, running on through
// the gap to the next chapter, with a dot where this one starts. It is the
// progress too: a dot fills in once its chapter is reached, and the line
// draws on to the next dot once that one is.
const Line = styled.div`
  position: relative;
  height: 1px;
  margin-right: calc(-1 * var(--gap));
  margin-bottom: clamp(24px, 4vh, 40px);
  background: ${({ theme }) => theme.border};

  /* the drawn part */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.text};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform ${dur.slow}s ${ease.inOut};
  }

  /* the dot: an empty ring until reached, then filled */
  &::before {
    content: "";
    position: absolute;
    z-index: 1;
    top: -4px;
    left: 0;
    width: 9px;
    height: 9px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 1.5px solid ${({ theme }) => theme.textTertiary};
    background: ${({ theme }) => theme.body};
    transition:
      background-color ${dur.base}s ${ease.out},
      border-color ${dur.base}s ${ease.out},
      transform ${dur.base}s ${ease.out};
  }

  ${Chapter}[data-state="past"] &::after {
    transform: scaleX(1);
  }

  ${Chapter}:is([data-state="past"], [data-state="current"]) &::before {
    border-color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.text};
  }

  ${Chapter}[data-state="current"] &::before {
    transform: scale(1.3);
  }

  ${Chapter}:last-child & {
    margin-right: 0;
  }

  /* stacked: each line spans its own chapter only */
  @media ${PHONE} {
    margin-right: 0;
    margin-bottom: 24px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after,
    &::before {
      transition: none;
    }
  }
`;

const Heading = styled.h2`
  margin: 0 0 16px;
  max-width: 20ch;
  font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.15;
  text-wrap: balance;
`;

const Body = styled.p`
  margin: 0;
  max-width: 46ch;
  font-size: clamp(1rem, 1.3vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.textSecondary};

  & + & {
    margin-top: 12px;
  }
`;

// ---------------- the degree ----------------

// First Class Honours, marked quietly: the first time the Study chapter
// comes into place, a gold ring draws round a small "1st" seal and the seal
// settles in; the words beside it stay plain. Once it's been left, the
// chapter is marked data-played and the award simply stays finished, so
// going back doesn't replay it. With reduced motion it's finished from the
// start.
const GOLD = "#b8892b";

const drawRing = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`;

const sealIn = keyframes`
  from { opacity: 0; transform: scale(0.6); }
`;

// quieter than the heading, with space on either side so it can land
const Award = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: clamp(20px, 3.5vh, 36px) 0;

  @media (max-height: 480px) and (min-width: 641px) {
    margin: 12px 0;
  }
`;

const Seal = styled.div`
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  aspect-ratio: 1;

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  circle {
    fill: none;
    stroke-width: 1.5;
  }

  circle:first-child {
    stroke: ${({ theme }) => theme.border};
  }

  /* the drawn ring: pathLength 1, so a dash of 1 is the whole way round */
  circle:last-child {
    stroke: ${GOLD};
    stroke-dasharray: 1;
    stroke-linecap: round;
  }

  span {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: ${GOLD};
  }

  /* finished by default (reduced motion, or already played); with motion,
     it waits undrawn until the chapter is first reached */
  @media (prefers-reduced-motion: no-preference) {
    ${Chapter}:not([data-state="past"]):not([data-played]) & circle:last-child {
      stroke-dashoffset: 1;
    }

    ${Chapter}:not([data-state="past"]):not([data-played]) & span {
      opacity: 0;
    }

    ${Chapter}[data-state="current"]:not([data-played]) & circle:last-child {
      animation: ${drawRing} 1s ${ease.inOut} 0.2s forwards;
    }

    ${Chapter}[data-state="current"]:not([data-played]) & span {
      animation: ${sealIn} ${dur.slow}s ${ease.out} 0.7s both;
      opacity: 1;
    }
  }
`;

// plain words at body size; the ring says the rest
const Honours = styled.p`
  margin: 0;
  font-size: clamp(1rem, 1.3vw, 1.125rem);
  font-weight: 500;
  line-height: 1.4;
  color: ${({ theme }) => theme.text};
`;

// ---------------- the opening chapter ----------------

// a byline (face, name, where and how long) over the statement, which
// carries the chapter
const Opening = styled.div`
  display: grid;
  gap: clamp(24px, 4vh, 40px);
`;

const Byline = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Name = styled.h1`
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.text};
`;

const Statement = styled.p`
  margin: 0;
  max-width: 18ch;
  font-size: clamp(1.75rem, 4vw, 3.25rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.1;
  text-wrap: balance;
`;

const Facts = styled.p`
  margin: 2px 0 0;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.textTertiary};
`;

// the illustrated portrait is dark ink on transparent, so it sits on a warm
// light disc; swap the import for a photo and it crops the same way
const Portrait = styled.img`
  flex: none;
  width: clamp(96px, 9.5vw, 128px);
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 20%;
  background: #ece8e1;
`;

// ---------------- chapter contents ----------------

const Principles = styled.ol`
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: principle;

  li {
    counter-increment: principle;
  }

  h3 {
    display: flex;
    gap: 12px;
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: -0.01em;

    &::before {
      content: counter(principle, decimal-leading-zero);
      font-weight: 400;
      font-variant-numeric: tabular-nums;
      color: ${({ theme }) => theme.textTertiary};
    }
  }

  p {
    margin: 4px 0 0;
    padding-left: calc(2ch + 12px);
    font-size: 0.9375rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.textSecondary};
  }
`;

// the modules that fed the work, bulleted in two short columns
const Modules = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.textSecondary};

  li {
    position: relative;
    padding-left: 16px;
  }

  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${({ theme }) => theme.textTertiary};
  }

  @media ${PHONE} {
    grid-template-columns: 1fr;
  }
`;

// each group a small label over its tools, a middle dot between each
const Tools = styled.dl`
  display: grid;
  gap: 14px;
  margin: 24px 0 0;

  div {
    display: grid;
    gap: 2px;
  }

  dt {
    font-size: 0.8125rem;
    font-weight: 500;
    color: ${({ theme }) => theme.textTertiary};
  }

  dd {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.text};
  }

  dd span + span::before {
    content: "·";
    margin: 0 0.5em;
    color: ${({ theme }) => theme.textTertiary};
  }
`;

// a link inside a sentence: underlined so it reads as one, darkening on hover
const InlineLink = styled.a`
  color: ${({ theme }) => theme.text};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: ${({ theme }) => theme.textTertiary};
  transition: text-decoration-color ${dur.fast}s ${ease.out};

  &:hover {
    text-decoration-color: currentColor;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

// ---------------- the bar under the track ----------------

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px 32px;
  padding: 0 88px;

  /* the chapter names need the full width here: contents above, contact below */
  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0 40px;
  }

  /* stacked: just the contact links, at the end of the page */
  @media ${PHONE} {
    margin-top: 56px;
    padding: 0 24px;
  }
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
  max-width: 640px;

  @media (max-width: 1024px) {
    max-width: none;
  }

  @media ${PHONE} {
    display: none;
  }
`;

const Step = styled.button`
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition:
    border-color ${dur.fast}s ${ease.out},
    opacity ${dur.fast}s ${ease.out};

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.text};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
  }
`;

const Contents = styled.nav`
  flex: 1 1 auto;
  min-width: 0;
`;

// The whole story at a glance, and a way to jump in anywhere: a small
// timeline of every chapter, a dot and a short name each, drawn in up to
// the one in place (the same states as the story's own timeline). The rail
// runs from the first dot to the last.
const Rail = styled.ol`
  --n: ${({ $n }) => $n};
  --done: ${({ $done }) => $done};

  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 14px;
    left: 4px;
    right: calc(100% / var(--n) - 4px);
    height: 1px;
    background: ${({ theme }) => theme.border};
  }

  &::after {
    background: ${({ theme }) => theme.text};
    transform: scaleX(var(--done));
    transform-origin: left;
    transition: transform ${dur.slow}s ${ease.inOut};
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      transition: none;
    }
  }
`;

const Mark = styled.button`
  display: grid;
  justify-items: start;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 8px 6px 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: left;
  color: ${({ theme }) => theme.textTertiary};
  cursor: pointer;
  transition: color ${dur.fast}s ${ease.out};

  /* the dot: an empty ring until reached, then filled */
  i {
    position: relative;
    z-index: 1;
    width: 9px;
    height: 9px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 1.5px solid ${({ theme }) => theme.textTertiary};
    background: ${({ theme }) => theme.body};
    transition:
      background-color ${dur.base}s ${ease.out},
      border-color ${dur.base}s ${ease.out},
      transform ${dur.base}s ${ease.out};
  }

  span {
    max-width: 100%;
    overflow: hidden;
    font-size: 0.8125rem;
    font-weight: 500;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &[data-state="past"] i,
  &[data-state="current"] i {
    border-color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.text};
  }

  &[data-state="current"] {
    color: ${({ theme }) => theme.text};
  }

  &[data-state="current"] i {
    transform: scale(1.3);
  }

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
    border-radius: 6px;
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    i {
      transition: none;
    }
  }
`;

// email, LinkedIn and the CV as pills; stacked full width on phones
// (the address is too long to share a row there)
const Contact = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;

  > button,
  > a {
    ${pill}
  }

  @media (max-width: 1024px) {
    justify-content: flex-start;
  }

  @media ${PHONE} {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const Social = styled.a`
  &:hover svg {
    color: ${({ theme }) => theme.linkedin};
  }
`;

// the CV, the bar's one filled button: the main thing to do here. First in
// the stack on phones, last in the row (nearest the corner) elsewhere.
const CvButton = styled.a`
  && {
    border-color: ${({ theme }) => theme.buttonPrimaryBg};
    background: ${({ theme }) => theme.buttonPrimaryBg};
    color: ${({ theme }) => theme.buttonPrimaryText};
  }

  &&:hover {
    border-color: ${({ theme }) => theme.buttonPrimaryHover};
    background: ${({ theme }) => theme.buttonPrimaryHover};
    color: ${({ theme }) => theme.buttonPrimaryHoverText};
  }

  @media ${PHONE} {
    order: -1;
  }
`;

// ---------------- page ----------------

export default function About() {
  const { setPalette, setImage, menuOpen } = useShell();
  const { reduced } = useMotionPreference();
  // false while the page slides out of the frame: it stops listening then
  const present = useIsPresent();

  const pageRef = useRef(null);
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // a plain page: no colour behind the words
    setPalette(null);
    setImage(null);
  }, [setPalette, setImage]);

  // each chapter's scroll position (its start, less the track's side
  // padding), capped at the end of the track
  const stops = useCallback(() => {
    const track = trackRef.current;
    if (!track) return [];
    const side = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const max = track.scrollWidth - track.clientWidth;
    return [...track.children].map((el) => Math.min(max, Math.max(0, el.offsetLeft - side)));
  }, []);

  // which chapter is in place (the stop nearest the track's position).
  // Also sizes the track's end so the last chapter can reach the start
  // like the rest.
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    // stacked on a phone: the last chapter whose top has passed the middle
    // of the screen, or the final one once the page reaches its end
    const page = pageRef.current;
    if (page && stacked()) {
      const mid = page.getBoundingClientRect().top + page.clientHeight / 2;
      let i = 0;
      [...track.children].forEach((el, n) => {
        if (el.getBoundingClientRect().top <= mid) i = n;
      });
      if (page.scrollTop + page.clientHeight >= page.scrollHeight - 2) i = track.children.length - 1;
      setIndex(i);
      return;
    }

    const last = track.lastElementChild;
    if (last) {
      const side = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const end = `${Math.max(side, track.clientWidth - side - last.offsetWidth)}px`;
      if (track.style.getPropertyValue("--end") !== end) track.style.setProperty("--end", end);
    }
    const list = stops();
    const x = track.scrollLeft;
    let i = 0;
    list.forEach((s, n) => {
      if (Math.abs(x - s) < Math.abs(x - list[i])) i = n;
    });
    setIndex(i);
  }, [stops]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    sync();
    const page = pageRef.current;
    const ro = new ResizeObserver(sync);
    ro.observe(track);
    track.addEventListener("scroll", sync, { passive: true });
    page?.addEventListener("scroll", sync, { passive: true });
    return () => {
      ro.disconnect();
      track.removeEventListener("scroll", sync);
      page?.removeEventListener("scroll", sync);
    };
  }, [sync]);

  const goTo = useCallback(
    (i) => {
      const track = trackRef.current;
      const list = stops();
      if (!track || !list.length) return;
      const n = Math.max(0, Math.min(list.length - 1, i));
      track.scrollTo({ left: list[n], behavior: reduced ? "auto" : "smooth" });
    },
    [stops, reduced],
  );

  // where each chapter is in the story, for the timeline and the fade
  const stateOf = (n) => {
    if (n < index) return "past";
    return n === index ? "current" : "ahead";
  };

  // the degree's moment plays once a visit: it counts as played once the
  // Study chapter has been reached and then left
  const [awardPlayed, setAwardPlayed] = useState(false);
  const wasOnStudy = useRef(false);
  useEffect(() => {
    if (index === STUDY) wasOnStudy.current = true;
    else if (wasOnStudy.current) setAwardPlayed(true);
  }, [index]);

  // the latest chapter for the listeners below, without re-binding them
  const indexRef = useRef(index);
  indexRef.current = index;

  // wheel: one chapter per gesture (a trackpad keeps firing long after the
  // fingers lift, so the lock only releases once the events stop). A
  // sideways trackpad swipe over the track is left to scroll natively.
  useEffect(() => {
    if (menuOpen || !present) return undefined;
    let acc = 0;
    let locked = false;
    let quiet = 0;

    const onWheel = (e) => {
      // stacked on a phone: the wheel scrolls the page as normal
      if (stacked()) return;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (sideways && trackRef.current?.contains(e.target)) return;
      e.preventDefault();
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        locked = false;
        acc = 0;
      }, WHEEL_QUIET_MS);
      if (locked) return;
      acc += sideways ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 30) {
        goTo(indexRef.current + (acc > 0 ? 1 : -1));
        locked = true;
        acc = 0;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(quiet);
      window.removeEventListener("wheel", onWheel);
    };
  }, [menuOpen, present, goTo]);

  // mouse drag: the track follows the pointer, then settles on a chapter.
  // A drag past DRAG_STEP turns to the next (or previous) one; a shorter one
  // settles back on the nearest. Touch is left to scroll natively.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || menuOpen || !present) return undefined;
    let drag = null;

    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || stacked()) return;
      if (e.target.closest("a, button")) return;
      // no text selection or image ghost-dragging under the drag
      e.preventDefault();
      drag = { x: e.clientX, left: track.scrollLeft, from: indexRef.current, moved: false };
    };

    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 4) return;
        drag.moved = true;
        track.dataset.dragging = "";
        track.setPointerCapture(e.pointerId);
      }
      track.scrollLeft = drag.left - dx;
    };

    const onUp = (e) => {
      if (!drag) return;
      const { moved, from } = drag;
      const dx = e.clientX - drag.x;
      drag = null;
      if (!moved) return;

      // the drag isn't a click on whatever it ended over
      const swallow = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);

      // wherever it was let go, and at least one chapter on for a real drag
      let target = indexRef.current;
      if (target === from && Math.abs(dx) > DRAG_STEP) target = from + (dx < 0 ? 1 : -1);
      goTo(target);
      // snapping back on only once the glide has landed, or it jumps
      const settle = () => delete track.dataset.dragging;
      track.addEventListener("scrollend", settle, { once: true });
      setTimeout(settle, 800);
    };

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    return () => {
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      delete track.dataset.dragging;
    };
  }, [menuOpen, present, goTo]);

  // arrow keys anywhere on the page
  useEffect(() => {
    if (menuOpen || !present) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(indexRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, present, goTo]);

  return (
    <Page ref={pageRef}>
      <title>About → Dara Phillips</title>
      <meta
        name="description"
        content="Dara Phillips, product designer based in Ireland. Designs in Figma, then builds what's been designed, from brief to launch."
      />

      <Track ref={trackRef} aria-label="About Dara, in chapters">
        <Chapter $i={0} data-state={stateOf(0)} $size="wide">
          <Meta>
            <span>01</span>
            <span>Hello</span>
          </Meta>
          <Line />
          <Opening>
            <Byline>
              <Portrait src={portrait} draggable={false} alt="Illustrated portrait of Dara Phillips" />
              <div>
                <Name>Dara Phillips</Name>
                <Facts>Ireland · 1.5 years exp.</Facts>
              </div>
            </Byline>
            <Statement>I design products and get them into people's hands.</Statement>
          </Opening>
        </Chapter>

        <Chapter $i={1} data-state={stateOf(1)} data-played={awardPlayed || undefined}>
          <Meta>
            <span>02</span>
            <span>2021 – 2025</span>
          </Meta>
          <Line />
          <Heading>Where it started</Heading>
          <Award>
            <Seal aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="38" />
                <circle cx="40" cy="40" r="38" pathLength="1" />
              </svg>
              <span>1st</span>
            </Seal>
            <Honours>First Class Honours</Honours>
          </Award>
          <Body>
            A BSc in{" "}
            <InlineLink href={COURSE_URL} target="_blank" rel="noopener noreferrer">
              Immersive Digital Media
            </InlineLink>{" "}
            at TUS Limerick.
          </Body>
          <Modules aria-label="Course modules">
            {MODULES.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </Modules>
        </Chapter>

        <Chapter $i={2} data-state={stateOf(2)}>
          <Meta>
            <span>03</span>
            <span>2025 – Present</span>
          </Meta>
          <Line />
          <Heading>Freelance product designer</Heading>
          <Body>I take work from the first brief to a live launch, designing and building it myself.</Body>
          <Body>
            Three client sites are live: for a musician, a researcher, and a beekeeping foundation with its own shop.
            Alongside them I've shipped products of my own: an ACL rehab tracker, a workout app with no paywall, and an
            app that crowdsources pint prices.
          </Body>
        </Chapter>

        <Chapter $i={3} data-state={stateOf(3)}>
          <Meta>
            <span>04</span>
            <span>How I work</span>
          </Meta>
          <Line />
          <Principles>
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </Principles>
        </Chapter>

        <Chapter $i={4} data-state={stateOf(4)} $size="short">
          <Meta>
            <span>05</span>
            <span>Tools</span>
          </Meta>
          <Line />
          <Heading>I design in Figma, then build what I've designed.</Heading>
          <Body>I studied development, so I can follow the code AI writes and catch when it's wrong.</Body>
          <Tools>
            {TOOLS.map((g) => (
              <div key={g.label}>
                <dt>{g.label}</dt>
                <dd>
                  {g.items.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </dd>
              </div>
            ))}
          </Tools>
        </Chapter>

        <Chapter $i={5} data-state={stateOf(5)}>
          <Meta>
            <span>06</span>
            <span>What's next</span>
          </Meta>
          <Line />
          <Heading>Looking for a product team where design and build sit close together.</Heading>
        </Chapter>
      </Track>

      <Bar>
        <Progress>
          <Step type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous chapter">
            <FiArrowLeft aria-hidden="true" />
          </Step>
          <Step
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index >= CHAPTERS.length - 1}
            aria-label="Next chapter"
          >
            <FiArrowRight aria-hidden="true" />
          </Step>
          <Contents aria-label="Chapters">
            <Rail $n={CHAPTERS.length} $done={index / (CHAPTERS.length - 1)}>
              {CHAPTERS.map((name, n) => (
                <li key={name}>
                  <Mark
                    type="button"
                    data-state={stateOf(n)}
                    aria-current={n === index ? "step" : undefined}
                    aria-label={`${name}, chapter ${n + 1} of ${CHAPTERS.length}`}
                    onClick={() => goTo(n)}
                  >
                    <i aria-hidden="true" />
                    <span aria-hidden="true">{name}</span>
                  </Mark>
                </li>
              ))}
            </Rail>
          </Contents>        </Progress>

        <Contact>
          <CopyEmail />
          <Social href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            <SiLinkedin aria-hidden="true" />
            LinkedIn
            <span className="sr-only"> (opens in a new tab)</span>
          </Social>
          <CvButton href={CV_URL} target="_blank" rel="noopener noreferrer">
            <FiFileText aria-hidden="true" />
            Read my CV
            <span className="sr-only"> (PDF, opens in a new tab)</span>
          </CvButton>
        </Contact>
      </Bar>
    </Page>
  );
}
