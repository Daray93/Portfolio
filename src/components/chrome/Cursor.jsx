import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { FiChevronLeft, FiChevronRight, FiLock, FiMaximize2 } from "react-icons/fi";
import { ease, dur } from "../../styles/motion";

// A custom cursor for the carousel only. Everywhere else -- header, menu,
// footer, links, text -- the visitor keeps their own system cursor, so
// nothing lags, covers text or needs learning.
//
// Inside an area marked `data-cursor-area`, the pointer becomes a disc
// saying what a click does, taken from the nearest `data-cursor`:
//   open  enlarge arrows  the card in focus (it grows into the project)
//   lock  padlock, Locked the card in focus is password protected
//   prev  ‹   next  ›     a side card: moves the carousel to it
//   drag  "Drag"          between cards
//
// Fine pointers (mouse/trackpad) only; touch devices and forced-colours
// (high contrast) modes never mount it.

const LABELS = {
  open: <FiMaximize2 aria-hidden="true" />,
  lock: (
    <>
      <FiLock aria-hidden="true" />
      Locked
    </>
  ),
  prev: <FiChevronLeft aria-hidden="true" />,
  next: <FiChevronRight aria-hidden="true" />,
  drag: "Drag",
};

// the carousel hides the system cursor; the disc stands in for it there
const HideNative = createGlobalStyle`
  html.has-cursor [data-cursor-area],
  html.has-cursor [data-cursor-area] * {
    cursor: none !important;
  }
`;

const Root = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 6000;
  pointer-events: none;
`;

// Smoked glass: a dark tint that blurs and lifts the media behind it, so the
// disc reads as part of the picture rather than a sticker on it. The tint
// keeps the white label legible over the brightest card; a lit top rim and
// a soft shadow give it some depth.
const Disc = styled.div`
  position: absolute;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  margin: -44px 0 0 -44px;
  border-radius: 50%;
  background: color-mix(in srgb, #000 32%, transparent);
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    0 10px 32px rgba(0, 0, 0, 0.28);
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: scale(${({ $on, $down }) => (!$on ? 0.4 : $down ? 0.92 : 1)});
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out};

  /* no blur to lean on: a denser tint does the job alone */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(0, 0, 0, 0.72);
  }

  ${({ $reduced }) =>
    $reduced &&
    css`
      transition: opacity ${dur.fast}s ${ease.out};
    `}
`;

// every label is stacked in the disc; the current one comes into focus
const Label = styled.span`
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 3px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: scale(${({ $on }) => ($on ? 1 : 0.8)});
  filter: blur(${({ $on }) => ($on ? 0 : 4)}px);
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out},
    filter ${dur.fast}s ${ease.out};

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 1.75;
  }

  ${({ $icon }) =>
    $icon &&
    css`
      svg {
        width: 28px;
        height: 28px;
        stroke-width: 1.5;
      }
    `}
`;

function stateFor(el) {
  if (!(el instanceof Element) || !el.closest("[data-cursor-area]")) return null;
  const state = el.closest("[data-cursor]")?.dataset.cursor;
  return LABELS[state] ? state : null;
}

export default function Cursor({ reduced }) {
  const [enabled] = useState(
    () => window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(forced-colors: active)").matches
  );
  const [state, setState] = useState(null);
  // the last label shown, kept while the disc shrinks away
  const [shown, setShown] = useState(null);
  const [down, setDown] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (state) setShown(state);
  }, [state]);

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add("has-cursor");

    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };
    let raf = 0;
    let last = performance.now();
    let inside = false;

    const tick = (now) => {
      // a light follow, or locked to the pointer when motion is reduced. The
      // step scales with the frame time, so a 120Hz screen follows at the
      // same speed as a 60Hz one.
      const dt = Math.min(now - last, 64);
      last = now;
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.35, dt / 16.67);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      if (rootRef.current) rootRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const show = (next) => {
      // entering the carousel: start right on the pointer, not sliding in
      // from wherever the disc was last
      if (next && !inside) {
        pos.x = target.x;
        pos.y = target.y;
      }
      inside = !!next;
      setState(next);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      show(stateFor(e.target));
    };
    // the element under a still pointer can change (the carousel moves, the
    // menu opens over it) -- re-check now and then
    const recheck = () => show(stateFor(document.elementFromPoint(target.x, target.y)));
    const onLeave = () => show(null);
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const interval = setInterval(recheck, 250);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, reduced]);

  if (!enabled) return null;

  return (
    <>
      <HideNative />
      <Root ref={rootRef} aria-hidden="true">
        <Disc $on={!!state} $down={down} $reduced={reduced}>
          {Object.keys(LABELS).map((name) => (
            <Label key={name} $on={shown === name} $icon={name === "open" || name === "prev" || name === "next"}>
              {LABELS[name]}
            </Label>
          ))}
        </Disc>
      </Root>
    </>
  );
}
