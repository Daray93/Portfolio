import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { ease, dur, reveal } from "../../styles/motion";

// First visit of a session only: a black intro screen with a thin loading
// line bottom-left and a counter bottom-right, filling while the carousel's
// images decode. When it's done, the line and counter fade, then the whole
// black panel lifts off the top of the screen in one piece.
//
// It tells the homepage two moments: when the lift starts (onLiftStart),
// and when the panel's bottom edge passes a line the homepage supplies
// (getRevealLine / onReveal) -- the bottom of the focused card, so the
// cards only start moving once they're actually uncovered.
// Coming back to the homepage later in the same session skips it.

const SEEN_KEY = "preloaded";
// long enough to read as a loader rather than a flicker
const MIN_MS = 700;

// the details clear first, then the panel lifts
const FADE_S = dur.fast * 0.8;

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
  background: #000;
  color: #fff;
  will-change: transform;

  ${({ $done }) =>
    $done &&
    css`
      transform: translateY(-100%);
      transition: transform ${reveal.lift}s ${reveal.liftCurve} ${reveal.delay}s;
    `}

  @media (max-width: 1024px) {
    padding: 24px 40px;
  }

  @media (max-width: 640px) {
    padding: 20px 16px;
  }
`;

// the details fade and drift down a touch as the wipe begins
const Details = styled.div`
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
      // decode too, so nothing pops in a frame late once the screen lifts
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(resolve);
    };
    img.src = src;
  });
}

export default function Preloader({ sources, reduced, onLiftStart, onReveal, onDone, getRevealLine }) {
  const [show, setShow] = useState(() => !alreadySeen());
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const fillRef = useRef(null);
  const screenRef = useRef(null);
  // latest callbacks, without restarting the lift tracking on re-renders
  const cb = useRef({ onLiftStart, onReveal, onDone, getRevealLine });
  cb.current = { onLiftStart, onReveal, onDone, getRevealLine };

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

  // Follow the lift frame by frame: report its start, then the moment the
  // panel's bottom edge rises past the homepage's line; unmount once it's
  // off screen. With reduced motion there's no lift -- report both at once.
  useEffect(() => {
    if (!done) return undefined;
    if (reduced) {
      cb.current.onLiftStart?.();
      cb.current.onReveal?.();
      cb.current.onDone?.();
      setShow(false);
      return undefined;
    }
    let raf = 0;
    let started = false;
    let revealed = false;
    const t0 = performance.now();
    const endAt = (reveal.delay + reveal.lift) * 1000 + 50;

    const track = (now) => {
      const elapsed = now - t0;
      if (!started && elapsed >= reveal.delay * 1000) {
        started = true;
        cb.current.onLiftStart?.();
      }
      if (!revealed && screenRef.current) {
        const bottom = screenRef.current.getBoundingClientRect().bottom;
        const line = cb.current.getRevealLine?.() ?? window.innerHeight * 0.7;
        if (bottom <= line) {
          revealed = true;
          cb.current.onReveal?.();
        }
      }
      if (elapsed >= endAt) {
        if (!revealed) cb.current.onReveal?.();
        cb.current.onDone?.();
        setShow(false);
        return;
      }
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [done, reduced]);

  if (!show) return null;

  return (
    <Screen ref={screenRef} $done={done} role="status" aria-label={done ? "Loaded" : "Loading"}>
      <Line $done={done} aria-hidden="true">
        <Fill ref={fillRef} style={{ transform: "scaleX(0)" }} />
      </Line>
      <Counter $done={done} aria-hidden="true">
        {pct}%
      </Counter>
    </Screen>
  );
}
