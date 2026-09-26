import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiLock,
  FiMenu,
  FiToggleRight,
  FiX,
} from "react-icons/fi";
import { ease, dur } from "../../styles/motion";

// Custom cursor for fine pointers (mouse/trackpad) only -- touch devices
// never mount it, and neither do forced-colours (high contrast) modes,
// which keep the system cursor.
//
// One look everywhere: a solid disc in the page's text colour with a thin
// ring of the page colour (so it reads over any media), and an icon in the
// middle naming what a click will do. It comes in two sizes:
//   large    over the carousel (`data-cursor-size="large"`): the disc sits
//            on the pointer, like a lens over the card
//   control  over links and buttons: a small badge beside the pointer, so
//            it never covers the words, with a dot marking the exact point
//            that clicks
//
// The icon comes from the nearest `data-cursor` under the pointer, or is
// worked out from the element (see stateFor). The vocabulary:
//   open      →   open this project
//   link      →   go to another page on the site
//   back      ←   go back to the previous page
//   down      ↓   scroll down to the content
//   external  ↗   opens in a new tab / leaves the site
//   prev/next ‹ › move the carousel that way
//   drag      ‹›  drag (or scroll) to browse
//   lock      padlock  password protected
//   copy / copied      copy to the clipboard, then a tick once it's done
//   menu / close       open or close the menu
//   toggle    switch a setting
//   press     any other button (a plain dot: "clickable")
//   none      just the dot (e.g. the pager button already in focus)
// Text fields get the system text cursor back.

// the arrows on either side of a drag: Feather's chevrons, drawn as one icon
function DragIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
    </svg>
  );
}

function PressIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  open: FiArrowRight,
  link: FiArrowRight,
  back: FiArrowLeft,
  down: FiArrowDown,
  external: FiArrowUpRight,
  prev: FiChevronLeft,
  next: FiChevronRight,
  drag: DragIcon,
  lock: FiLock,
  copy: FiCopy,
  copied: FiCheck,
  menu: FiMenu,
  close: FiX,
  toggle: FiToggleRight,
  press: PressIcon,
};

const SIZE = { large: 76, control: 34 };
// how far the control badge sits from the pointer, on each axis
const OFFSET = 24;
// the badge flips to the other side this close to the window's edge
const EDGE = OFFSET + SIZE.control;

const HideNative = createGlobalStyle`
  @media (forced-colors: none) {
    html.has-cursor,
    html.has-cursor * {
      cursor: none !important;
    }

    html.has-cursor input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"]),
    html.has-cursor textarea,
    html.has-cursor [contenteditable="true"] {
      cursor: text !important;
    }
  }
`;

const Root = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 6000;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity ${dur.fast}s ${ease.out};

  @media (forced-colors: active) {
    display: none;
  }
`;

const ring = ({ theme }) => `0 0 0 1px color-mix(in srgb, ${theme.body} 45%, transparent)`;

// the exact point that clicks
const Dot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text};
  box-shadow: ${ring};
  transform: scale(${({ $hidden }) => ($hidden ? 0 : 1)});
  transition: transform ${dur.fast}s ${ease.out};
`;

const Disc = styled.div`
  --x: 0px;
  --y: 0px;
  --s: 0;
  position: absolute;
  display: grid;
  place-items: center;
  width: ${SIZE.control}px;
  height: ${SIZE.control}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.body};
  box-shadow: ${ring};
  font-size: 16px; /* the icon's size */
  transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(var(--s));
  transition:
    width ${dur.base}s ${ease.out},
    height ${dur.base}s ${ease.out},
    font-size ${dur.base}s ${ease.out},
    transform ${dur.base}s ${ease.out};

  ${({ $size, $flipX, $flipY }) =>
    $size === "control" &&
    css`
      --x: ${$flipX ? -OFFSET : OFFSET}px;
      --y: ${$flipY ? -OFFSET : OFFSET}px;
      --s: 1;
    `}

  ${({ $size }) =>
    $size === "large" &&
    css`
      --s: 1;
      width: ${SIZE.large}px;
      height: ${SIZE.large}px;
      font-size: 26px;
    `}

  ${({ $size, $down }) =>
    $size && $down &&
    css`
      --s: 0.88;
    `}

  ${({ $reduced }) =>
    $reduced &&
    css`
      transition: none;
    `}
`;

// every icon is stacked in the disc; the current one fades and scales in
const Icon = styled.span`
  position: absolute;
  display: grid;
  place-items: center;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: scale(${({ $on }) => ($on ? 1 : 0.5)});
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out};

  svg {
    width: 1em;
    height: 1em;
  }
`;

const isExternal = (a) => a.target === "_blank" || (a.origin && a.origin !== window.location.origin);

// what a click on `target` does: { state, size }
function stateFor(target) {
  const none = { state: "default", size: null };
  if (!(target instanceof Element)) return none;
  if (target.closest("input:not([type='checkbox'], [type='radio'], [type='button'], [type='submit']), textarea, select, [contenteditable='true']")) {
    return { state: "native", size: null };
  }
  const size = target.closest("[data-cursor-size='large']") ? "large" : "control";

  let state = target.closest("[data-cursor]")?.dataset.cursor;
  if (!state) {
    const link = target.closest("a[href]");
    if (link) state = isExternal(link) ? "external" : "link";
    else if (target.closest("button, [role='button'], label, summary")) state = "press";
  }
  return ICONS[state] ? { state, size } : none;
}

export default function Cursor({ reduced }) {
  const [enabled] = useState(
    () => window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(forced-colors: active)").matches
  );
  const [{ state, size }, setCurrent] = useState({ state: "default", size: null });
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);
  const [flip, setFlip] = useState({ x: false, y: false });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add("has-cursor");

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      // eased follow, or locked to the pointer when motion is reduced. The
      // step scales with the frame time, so a 120Hz screen follows at the
      // same speed as a 60Hz one instead of twice as fast.
      const dt = Math.min(now - last, 64);
      last = now;
      const k = reduced ? 1 : 1 - Math.pow(1 - 0.2, dt / 16.67);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      if (rootRef.current) rootRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // setState bails out on an identical value, so only real changes render
    const update = (el) => {
      const next = stateFor(el);
      setCurrent((c) => (c.state === next.state && c.size === next.size ? c : next));
      const x = target.x > window.innerWidth - EDGE;
      const y = target.y > window.innerHeight - EDGE;
      setFlip((f) => (f.x === x && f.y === y ? f : { x, y }));
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (pos.x < 0) {
        pos.x = target.x;
        pos.y = target.y;
      }
      setVisible(true);
      update(e.target);
    };
    // the element under a still pointer can change (carousel slides move,
    // the menu opens, "Copy" turns to "Copied") -- re-check now and then
    const recheck = () => update(document.elementFromPoint(target.x, target.y));
    const onLeave = () => setVisible(false);
    const onDown = () => setDown(true);
    const onUp = () => {
      setDown(false);
      // a click often changes what's under the pointer (copied, menu open)
      setTimeout(recheck, 60);
    };
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
      <Root ref={rootRef} $visible={visible && state !== "native"} aria-hidden="true">
        <Disc $size={size} $down={down} $flipX={flip.x} $flipY={flip.y} $reduced={reduced}>
          {Object.keys(ICONS).map((name) => {
            const Glyph = ICONS[name];
            return (
              <Icon key={name} $on={state === name}>
                <Glyph />
              </Icon>
            );
          })}
        </Disc>
        <Dot $hidden={size === "large"} />
      </Root>
    </>
  );
}
