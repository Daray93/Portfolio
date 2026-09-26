import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { FiChevronLeft, FiChevronRight, FiLock, FiMaximize2 } from "react-icons/fi";
import { ease, dur } from "../../styles/motion";

// Custom cursor: one piece of embossed glass that changes shape with what's
// under it.
//   ring   anywhere else: a small, empty glass ring on the pointer
//   hover  over a link or button: the ring slides onto it and stretches into
//          a rounded shape around it (matching its corners), drifting a
//          little toward the pointer. No blur here, so the item stays sharp.
//   disc   over the carousel (`data-cursor-area`): a large glass disc saying
//          what a click does, from the nearest `data-cursor`:
//            open  enlarge arrows  the card in focus (it grows into the project)
//            lock  padlock, Locked the card in focus is password protected
//            prev  ‹   next  ›     a side card: moves the carousel to it
//            drag  "Drag"          between cards
//
// Text fields get the system text cursor back. Fine pointers (mouse/trackpad)
// only; touch devices and forced-colours (high contrast) modes keep the
// system cursor. With reduced motion it snaps into place instead of gliding.

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
const ICON_ONLY = new Set(["open", "prev", "next"]);

const RING = 20;
const DISC = 88;
// room around a hovered item
const PAD_X = 10;
const PAD_Y = 6;
// how far the hover shape leans toward the pointer (share of the distance)
const LEAN = 0.08;
// anything bigger than this isn't wrapped (it would just be a big box)
const MAX_WRAP = { w: 520, h: 180 };
// per-frame follow at 60Hz: position, and the shape's size
const FOLLOW = 0.35;
const MORPH = 0.22;

const TEXT_FIELD =
  "input:not([type='checkbox'], [type='radio'], [type='button'], [type='submit'], [type='range']), textarea, select, [contenteditable='true']";
const CONTROL = "a[href], button:not(:disabled), [role='button'], label, summary";

const HideNative = createGlobalStyle`
  @media (forced-colors: none) {
    html.has-cursor,
    html.has-cursor * {
      cursor: none !important;
    }

    html.has-cursor :is(${TEXT_FIELD}) {
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
`;

// Size, place and corners are set every frame (see the loop below); the
// look of each mode crossfades here.
const Shape = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  width: ${RING}px;
  height: ${RING}px;
  border-radius: ${RING / 2}px;
  color: #fff;
  will-change: transform, width, height;
  transition:
    background-color ${dur.fast}s ${ease.out},
    box-shadow ${dur.fast}s ${ease.out},
    backdrop-filter ${dur.fast}s ${ease.out};

  /* empty glass: a clear centre, a lit rim */
  &[data-mode="ring"] {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(4px) saturate(160%);
    -webkit-backdrop-filter: blur(4px) saturate(160%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      inset 0 0 0 1.5px rgba(255, 255, 255, 0.55),
      0 4px 14px rgba(0, 0, 0, 0.35);
  }

  /* around an item: a faint lift and the same rim, no blur over its text */
  &[data-mode="hover"] {
    background: rgba(255, 255, 255, 0.09);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.35),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.28);
  }

  /* smoked glass over the carousel: the tint keeps the white label legible
     over the brightest card */
  &[data-mode="disc"] {
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(16px) saturate(170%);
    -webkit-backdrop-filter: blur(16px) saturate(170%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.35),
      inset 0 0 0 1px rgba(255, 255, 255, 0.14),
      0 10px 32px rgba(0, 0, 0, 0.28);
  }

  /* no blur to lean on: a denser tint does the job alone */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    &[data-mode="disc"] {
      background: rgba(0, 0, 0, 0.72);
    }
  }
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
  white-space: nowrap;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transform: scale(${({ $on }) => ($on ? 1 : 0.8)});
  filter: blur(${({ $on }) => ($on ? 0 : 4)}px);
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out},
    filter ${dur.fast}s ${ease.out};

  svg {
    width: ${({ $icon }) => ($icon ? 28 : 16)}px;
    height: ${({ $icon }) => ($icon ? 28 : 16)}px;
    stroke-width: ${({ $icon }) => ($icon ? 1.5 : 1.75)};
  }
`;

// what's under the pointer: { mode, label, el }
function read(target) {
  const ring = { mode: "ring", label: null, el: null };
  if (!(target instanceof Element)) return ring;
  if (target.closest(TEXT_FIELD)) return { mode: "native", label: null, el: null };
  if (target.closest("[data-cursor-area]")) {
    const label = target.closest("[data-cursor]")?.dataset.cursor;
    return LABELS[label] ? { mode: "disc", label, el: null } : ring;
  }
  const el = target.closest(CONTROL);
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.width && r.width <= MAX_WRAP.w && r.height <= MAX_WRAP.h) return { mode: "hover", label: null, el };
  }
  return ring;
}

export default function Cursor({ reduced }) {
  const [enabled] = useState(
    () => window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(forced-colors: active)").matches
  );
  const [mode, setMode] = useState("ring");
  const [label, setLabel] = useState(null);
  const [visible, setVisible] = useState(false);
  const shapeRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    document.documentElement.classList.add("has-cursor");

    const pointer = { x: -100, y: -100 };
    // the shape as drawn: centre, size, corner radius
    const cur = { x: -100, y: -100, w: RING, h: RING, r: RING / 2 };
    const now = { mode: "ring", el: null, down: false, fresh: true };
    let raf = 0;
    let last = performance.now();

    const target = () => {
      if (now.mode === "hover" && now.el?.isConnected) {
        const rect = now.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const w = rect.width + PAD_X * 2;
        const h = rect.height + PAD_Y * 2;
        // follow the item's own corners, never rounder than a pill
        const own = parseFloat(getComputedStyle(now.el).borderTopLeftRadius) || 0;
        const r = Math.min(h / 2, own ? own + PAD_Y : 12);
        return { x: cx + (pointer.x - cx) * LEAN, y: cy + (pointer.y - cy) * LEAN, w, h, r };
      }
      const size = now.mode === "disc" ? DISC : RING;
      return { x: pointer.x, y: pointer.y, w: size, h: size, r: size / 2 };
    };

    const tick = (time) => {
      // steps scale with the frame time, so a 120Hz screen moves at the
      // same speed as a 60Hz one
      const dt = Math.min(time - last, 64) / 16.67;
      last = time;
      const t = target();
      const kPos = reduced || now.fresh ? 1 : 1 - Math.pow(1 - FOLLOW, dt);
      const kSize = reduced ? 1 : 1 - Math.pow(1 - MORPH, dt);
      now.fresh = false;
      cur.x += (t.x - cur.x) * kPos;
      cur.y += (t.y - cur.y) * kPos;
      cur.w += (t.w - cur.w) * kSize;
      cur.h += (t.h - cur.h) * kSize;
      cur.r += (t.r - cur.r) * kSize;

      const el = shapeRef.current;
      if (el) {
        const press = now.down ? (now.mode === "hover" ? 0.97 : 0.88) : 1;
        el.style.width = `${cur.w}px`;
        el.style.height = `${cur.h}px`;
        el.style.borderRadius = `${cur.r}px`;
        el.style.transform = `translate3d(${cur.x - cur.w / 2}px, ${cur.y - cur.h / 2}px, 0) scale(${press})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const update = (el) => {
      const next = read(el);
      now.mode = next.mode;
      now.el = next.el;
      setMode(next.mode);
      if (next.label) setLabel(next.label);
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      // first sighting: appear on the pointer, not sliding in from a corner
      if (cur.x < 0) now.fresh = true;
      setVisible(true);
      update(e.target);
    };
    // the element under a still pointer can change (the carousel moves, the
    // menu opens) -- re-check now and then
    const recheck = () => update(document.elementFromPoint(pointer.x, pointer.y));
    const onLeave = () => setVisible(false);
    const onDown = () => (now.down = true);
    const onUp = () => (now.down = false);
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
      <Root $visible={visible && mode !== "native"} aria-hidden="true">
        <Shape ref={shapeRef} data-mode={mode === "native" ? "ring" : mode}>
          {Object.keys(LABELS).map((name) => (
            <Label key={name} $on={mode === "disc" && label === name} $icon={ICON_ONLY.has(name)}>
              {LABELS[name]}
            </Label>
          ))}
        </Shape>
      </Root>
    </>
  );
}
