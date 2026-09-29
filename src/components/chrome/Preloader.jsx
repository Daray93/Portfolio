import { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { ease, dur, reveal } from "../../styles/motion";

// First visit only (remembered in this browser). It opens on a single shot:
//   load   a blank screen in the page colour with just "Dara · Phillips"
//          centred, while the carousel's images decode
//   frame  the name fades; the screen becomes a window in the exact
//          shape of the focused card (still plain inside, so nothing changes)
//   shot   the card fades up inside that window on its own, like the first
//          shot of a film, pushing in gently as it comes (the homepage's
//          settle, cropped by the window)
//   open   the window opens out to the edges of the screen, gathering speed,
//          and the rest of the page is there
// The same framed-card language as opening a project (see ExpandTransition).
//
// It tells the homepage three moments: the shot starting (onStart -- its
// settle begins), the window opening far enough for the side cards to move
// (onReveal), and the end (onDone). getFrame supplies the focused card's box
// and corner radius. Every later visit skips it, in this tab or a new one;
// with reduced motion it simply clears. To see it again, clear the site's
// data (or `localStorage.removeItem("preloaded")` in the console).

const SEEN_KEY = "preloaded";
// TEMPORARY, for testing: play on every fresh page load (still skipped when
// coming back to the homepage within the site). Set to false before
// deploying so it's first visit only again.
const EVERY_LOAD = true;
let seenThisLoad = false;
// long enough for the name to arrive in full and be read, however fast
// the images load: it's fully in at ARRIVE_S, then holds
const ARRIVE_S = 0.6;
const MIN_MS = 1200;

// the details clear first, then the shot fades up
const FADE_S = dur.fast * 0.8;

// when each step starts, in seconds from the load finishing
const SHOT_AT = reveal.delay;
const OPEN_AT = SHOT_AT + reveal.shot + reveal.hold;
// the side cards start gliding out a little way into the opening
const SPREAD_AT = OPEN_AT + reveal.open * 0.25;
const END_AT = OPEN_AT + reveal.open;

const Screen = styled.div`
  position: fixed;
  inset: 0;
  z-index: 7000;
  display: grid;
  place-items: center;
  /* solid while loading, in the page's own colour (light or dark) so the
     window opens onto more of the same; after that the window's surround
     covers the page */
  background: ${({ $phase, theme }) => ($phase === "load" ? theme.body : "transparent")};
  color: ${({ theme }) => theme.text};
  pointer-events: ${({ $phase }) => ($phase === "open" ? "none" : "auto")};
`;

// The window onto the page: the card's box, with everything around it
// covered by a spread shadow big enough to cover any screen.
const Window = styled.div`
  position: fixed;
  box-shadow: 0 0 0 200vmax ${({ theme }) => theme.body};
  background: ${({ theme }) => theme.body};
  pointer-events: none;

  ${({ $phase }) =>
    $phase !== "frame" &&
    css`
      background: transparent;
      transition: background-color ${reveal.shot}s ${ease.out};
    `}

  ${({ $phase }) =>
    $phase === "open" &&
    css`
      transition:
        top ${reveal.open}s ${reveal.openCurve},
        left ${reveal.open}s ${reveal.openCurve},
        width ${reveal.open}s ${reveal.openCurve},
        height ${reveal.open}s ${reveal.openCurve},
        border-radius ${reveal.open}s ${reveal.openCurve};
    `}
`;

// the details fade and drift down a touch as the shot begins
const Details = styled.div`
  position: relative; /* above the window's cover */
  transition:
    opacity ${FADE_S}s ${ease.out},
    transform ${FADE_S}s ${ease.out};

  ${({ $done }) =>
    $done &&
    css`
      opacity: 0;
      transform: translateY(6px);
    `}
`;

// the name, centred, its initials in bold: it arrives with a slow fade, then
// clears as the shot begins
const arrive = keyframes`
  from { opacity: 0; }
`;

const Name = styled(Details)`
  font-size: clamp(1.125rem, 1.8vw, 1.5rem);
  font-weight: 400;
  letter-spacing: -0.015em;
  animation: ${arrive} ${ARRIVE_S}s ${ease.out} backwards;

  strong {
    font-weight: 600;
  }

  /* the spacer: a middle dot with room either side */
  span {
    margin: 0 0.5em;
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// whether this visit will show the preloader (the homepage holds its
// entrance until it lifts)
export function willPreload() {
  return !alreadySeen();
}

// The loading screen only ever opens the site: a visit that starts on
// another page (About, Websites) counts as seen, so it can't play later
// in the middle of a page change.
export function skipPreload() {
  seenThisLoad = true;
}

function alreadySeen() {
  if (EVERY_LOAD) return seenThisLoad;
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      // decode too, so nothing pops in a frame late once the shot fades up
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(resolve);
    };
    img.src = src;
  });
}

// the window's box: the focused card, or the whole screen once open
function frameStyle(frame, open) {
  if (open || !frame) return { top: 0, left: 0, width: "100vw", height: "100dvh", borderRadius: 0 };
  return { top: frame.top, left: frame.left, width: frame.width, height: frame.height, borderRadius: frame.radius };
}

export default function Preloader({ sources, reduced, onStart, onReveal, onDone, getFrame }) {
  const [show, setShow] = useState(() => !alreadySeen());
  const [done, setDone] = useState(false);
  // load | frame | shot | open
  const [phase, setPhase] = useState("load");
  const [frame, setFrame] = useState(null);
  // latest callbacks, without restarting the sequence on re-renders
  const cb = useRef({ onStart, onReveal, onDone, getFrame });
  cb.current = { onStart, onReveal, onDone, getFrame };

  useEffect(() => {
    if (!show) return undefined;
    let cancelled = false;
    let loaded = 0;
    let shown = 0;
    let raf = 0;
    const start = performance.now();
    const total = Math.max(sources.length, 1);

    // the count eases toward what has actually loaded, and never outruns
    // the minimum display time
    const tick = (now) => {
      // nothing to wait for counts as loaded, not as never loading
      const real = sources.length ? loaded / total : 1;
      const timeCap = Math.min((now - start) / MIN_MS, 1);
      shown += (Math.min(real, timeCap) - shown) * 0.2;
      if (Math.min(real, timeCap) === 1 && shown > 0.995) shown = 1;
      if (shown >= 1) {
        setDone(true);
        seenThisLoad = true;
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {
          // storage blocked -- they'll just see it again next time
        }
        return;
      }
      if (!cancelled) raf = requestAnimationFrame(tick);
    };

    sources.forEach((src) =>
      loadImage(src).then(() => {
        loaded += 1;
      })
    );
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [show, sources]);

  // the sequence, once loaded
  useEffect(() => {
    if (!done) return undefined;
    if (reduced) {
      cb.current.onStart?.();
      cb.current.onReveal?.();
      cb.current.onDone?.();
      setShow(false);
      return undefined;
    }

    // measured before the settle starts, so it's the card's resting box
    setFrame(cb.current.getFrame?.() ?? null);
    setPhase("frame");

    const timers = [];
    const at = (s, fn) => timers.push(setTimeout(fn, s * 1000));
    // two frames: the covered window is painted before its fill starts to clear
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        at(SHOT_AT, () => {
          setPhase("shot");
          cb.current.onStart?.();
        });
        at(OPEN_AT, () => setPhase("open"));
        at(SPREAD_AT, () => cb.current.onReveal?.());
        at(END_AT + 0.05, () => {
          cb.current.onDone?.();
          setShow(false);
        });
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [done, reduced]);

  if (!show) return null;

  return (
    <Screen $phase={phase} role="status" aria-label={done ? "Loaded" : "Loading"}>
      {phase !== "load" && <Window $phase={phase} style={frameStyle(frame, phase === "open")} aria-hidden="true" />}
      <Name $done={done} aria-hidden="true">
        <strong>D</strong>ara
        <span>·</span>
        <strong>P</strong>hillips
      </Name>
    </Screen>
  );
}
