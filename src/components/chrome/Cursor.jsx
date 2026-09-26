import { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import { FiArrowUpRight, FiLock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ease, dur } from "../../styles/motion";

// Custom cursor for fine pointers (mouse/trackpad) only -- touch devices
// never mount it. Its shape comes from the nearest `data-cursor` attribute
// under the pointer:
//   "open"  large ball + arrow   (the card in focus)
//   "lock"  large ball + padlock (a locked card in focus)
//   "drag"  chevrons either side (the carousel around the focused card)
// Any other link or button grows the ball a little.

const HideNative = createGlobalStyle`
  html.has-cursor,
  html.has-cursor * {
    cursor: none !important;
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

const Ball = styled.div`
  position: absolute;
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.body};
  transition:
    width ${dur.base}s ${ease.out},
    height ${dur.base}s ${ease.out},
    margin ${dur.base}s ${ease.out},
    background-color ${dur.fast}s ${ease.out},
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.fast}s ${ease.out};

  svg {
    width: 26px;
    height: 26px;
    opacity: 0;
    transform: scale(0.4);
    transition:
      opacity ${dur.fast}s ${ease.out},
      transform ${dur.base}s ${ease.out};
  }

  ${({ $state }) =>
    ($state === "open" || $state === "lock") &&
    css`
      width: 84px;
      height: 84px;
      margin: -42px 0 0 -42px;
    `}

  ${({ $state }) =>
    $state === "link" &&
    css`
      width: 44px;
      height: 44px;
      margin: -22px 0 0 -22px;
      opacity: 0.35;
    `}

  ${({ $state }) =>
    $state === "drag" &&
    css`
      width: 64px;
      height: 64px;
      margin: -32px 0 0 -32px;
      background: transparent;
      border: 1.5px solid ${({ theme }) => theme.text};
    `}

  ${({ $down }) =>
    $down &&
    css`
      transform: scale(0.85);
    `}
`;

const Icon = styled.span`
  position: absolute;
  display: grid;
  place-items: center;

  ${({ $on }) =>
    $on &&
    css`
      svg {
        opacity: 1;
        transform: none;
      }
    `}
`;

const Chevrons = styled.span`
  position: absolute;
  display: flex;
  gap: 58px;
  color: ${({ theme }) => theme.text};

  svg {
    width: 20px;
    height: 20px;
  }

  ${({ $on }) =>
    $on &&
    css`
      svg {
        opacity: 1;
        transform: none;
      }
    `}
`;

function stateFor(target) {
  if (!(target instanceof Element)) return "default";
  const tagged = target.closest("[data-cursor]");
  if (tagged) return tagged.dataset.cursor;
  if (target.closest("a, button, [role='button'], label, input, select, textarea")) return "link";
  return "default";
}

export default function Cursor({ reduced }) {
  const [enabled] = useState(() => window.matchMedia("(pointer: fine)").matches);
  const [state, setState] = useState("default");
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);
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

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (pos.x < 0) {
        pos.x = target.x;
        pos.y = target.y;
      }
      setVisible(true);
      setState(stateFor(e.target));
    };
    // the element under a still pointer can change (carousel slides move,
    // the menu opens) -- re-check now and then
    const recheck = () => setState(stateFor(document.elementFromPoint(target.x, target.y)));
    const onLeave = () => setVisible(false);
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
      <Root ref={rootRef} $visible={visible} aria-hidden="true">
        <Ball $state={state} $down={down}>
          <Icon $on={state === "open"}>
            <FiArrowUpRight />
          </Icon>
          <Icon $on={state === "lock"}>
            <FiLock />
          </Icon>
          <Chevrons $on={state === "drag"}>
            <FiChevronLeft />
            <FiChevronRight />
          </Chevrons>
        </Ball>
      </Root>
    </>
  );
}
