import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { ease, dur, reveal } from "../../styles/motion";

// First visit of a session only. It opens on a single shot:
//   load   a black screen with a thin loading line bottom-left and a counter
//          bottom-right, filling while the carousel's images decode
//   frame  the line and counter fade; the black becomes a window in the exact
//          shape of the focused card (still black inside, so nothing changes)
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
// and corner radius. Coming back to the homepage later in the same session
// skips it; with reduced motion it simply clears.

const SEEN_KEY = "preloaded";
// long enough to read as a loader rather than a flicker
const MIN_MS = 700;

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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  font-size: 0.9rem; /* same as the homepage footer it gives way to */
  gap: 24px;
  padding: 56px 88px; /* the footer's own padding, so the count sits where it will */
  /* solid while loading; after that the window's surround is the black */
  background: ${({ $phase }) => ($phase === "load" ? "#000" : "transparent")};
  color: #fff;
  pointer-events: ${({ $phase }) => ($phase === "open" ? "none" : "auto")};

  @media (max-width: 1024px) {
    padding: 24px 40px;
  }

  @media (max-width: 640px) {
    padding: 20px 16px;
  }
`;

// The window onto the page: the card's box, with everything around it
// blacked out by a spread shadow big enough to cover any screen.
const Window = styled.div`
  position: fixed;
  box-shadow: 0 0 0 200vmax #000;
  background: #000;
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
  position: relative; /* above the window's black */
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

const Line = styled(Details)`
  /* level with the middle of the counter's text */
  margin-bottom: 0.65em;
  width: clamp(120px, 16vw, 220px);
  height: 1px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
`;

const Fill = styled.div`
  height: 100%;
  background: #fff;
  transform-origin: left;
`;

const Counter = styled(Details)`
  line-height: 1.3;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
`;

// whether this visit will show the preloader (the homepage holds its
// entrance until it lifts)
export function willPreload() {
  return !alreadySeen();
}

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
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
  const [pct, setPct] = useState(0);
  const fillRef = useRef(null);
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
      const real = loaded / total;
      const timeCap = Math.min((now - start) / MIN_MS, 1);
      shown += (Math.min(real, timeCap) - shown) * 0.2;
      if (Math.min(real, timeCap) === 1 && shown > 0.995) shown = 1;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${shown})`;
      setPct(Math.round(shown * 100));
      if (shown >= 1) {
        setDone(true);
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
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
    // two frames: the black window is painted before its fill starts to clear
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
      <Line $done={done} aria-hidden="true">
        <Fill ref={fillRef} style={{ transform: "scaleX(0)" }} />
      </Line>
      <Counter $done={done} aria-hidden="true">
        {pct}%
      </Counter>
    </Screen>
  );
}
