import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { FiChevronLeft, FiChevronRight, FiLock } from "react-icons/fi";
import { ease, dur } from "../../styles/motion";

// A custom cursor for the carousel only. Everywhere else -- header, menu,
// footer, links, text -- the visitor keeps their own system cursor, so
// nothing lags, covers text or needs learning.
//
// Inside an area marked `data-cursor-area`, the pointer becomes a disc
// saying what a click does, taken from the nearest `data-cursor`:
//   open  "View"          the card in focus
//   lock  padlock, Locked the card in focus is password protected
//   prev  ‹   next  ›     a side card: moves the carousel to it
//   drag  "Drag"          between cards
//
// Fine pointers (mouse/trackpad) only; touch devices and forced-colours
// (high contrast) modes never mount it.

const LABELS = {
  open: "View",
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

const Disc = styled.div`
  position: absolute;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.body};
  /* a thin ring of the page colour keeps it clear over any media */
  box-shadow: 0 0 0 1px color-mix(in srgb, ${({ theme }) => theme.body} 45%, transparent);
  transform: scale(${({ $on, $down }) => (!$on ? 0 : $down ? 0.9 : 1)});
  transition: transform ${dur.base}s ${ease.out};

  ${({ $reduced }) =>
    $reduced &&
    css`
      transition: none;
    `}
`;

// every label is stacked in the disc; the current one fades in
const Label = styled.span`
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 2px;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity ${dur.fast}s ${ease.out};

  svg {
    width: 16px;
    height: 16px;
  }

  ${({ $icon }) =>
    $icon &&
    css`
      svg {
        width: 26px;
        height: 26px;
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
            <Label key={name} $on={shown === name} $icon={name === "prev" || name === "next"}>
              {LABELS[name]}
            </Label>
          ))}
        </Disc>
      </Root>
    </>
  );
}
