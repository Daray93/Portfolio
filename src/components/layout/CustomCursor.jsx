import React, { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { FiLock, FiEye } from "react-icons/fi";
import LoaderIcon from "../icons/ComingSoon";
import ZoomIcon from "../icons/ZoomIcon";

/* ---------------- Animations ---------------- */

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const ripple = keyframes`
  to {
    transform: scale(2);
    opacity: 0;
  }
`;

/* ---------------- Styles ---------------- */

const CursorWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  transform: translate3d(0, 0, 0);
  will-change: transform;
`;

const CursorInner = styled.div`
  transform: translate(-50%, -50%);
`;

const Dot = styled.img`
  width: 16px;
  height: 16px;
  display: block;
  transform: scale(${({ $click }) => ($click ? 1.25 : 1)});
  filter: ${({ $click }) =>
    $click ? "brightness(1.2) saturate(1.3)" : "none"};
  transition: transform 0.1s ease, filter 0.15s ease;
  animation: ${fadeIn} 0.18s ease both;
`;

const Pill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.2rem 1rem 0.2rem 0.7rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 999px;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  transform: scale(${({ $click }) => ($click ? 0.94 : 1)});
  transition:
    transform 0.1s ease,
    background 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease,
    opacity 0.15s ease;
  animation: ${fadeIn} 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;

  ${({ $variant, theme }) =>
    $variant === "view" &&
    css`
      background: ${theme.buttonPrimaryBg};
      color: ${theme.body};
    `}

  ${({ $variant }) =>
    $variant === "soon" &&
    css`
      background: #ad761d99;
      color: white;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    `}

  ${({ $variant, theme }) =>
    $variant === "locked" &&
    css`
      background: ${theme.buttonPrimaryBg};
      color: ${theme.body};
    `}

  /* Fixed light styling (not theme-derived) for the Kropt cell, whose
     preview art is dark -- stays a light pill in both site themes rather
     than flipping to a dark-on-dark pill when the site is in dark mode. */
  ${({ $variant }) =>
    $variant === "view-light" &&
    css`
      background: rgba(245, 245, 242, 0.92);
      color: #17171a;
    `}
`;

const IconWrap = styled.span`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;

  ${({ $spin }) =>
    $spin &&
    css`
      animation: ${spin} 0.9s linear infinite;
    `}
`;

const Ripple = styled.span`
  position: absolute;
  inset: -8px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.buttonPrimaryBg}49;
  animation: ${ripple} 0.45s ease forwards;
`;

/* ---------------- Zoom Cursor (Matches black/white pointer) ---------------- */

const ZoomCursor = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #00000099;
  border: 1px solid ${({ theme }) => theme.accentSoft};
  display: grid;
  place-items: center;
  transform: scale(${({ $click }) => ($click ? 0.9 : 1)});
  transition: transform 0.1s ease;
  animation: ${fadeIn} 0.15s ease both;
`;

const ZoomIconWrap = styled.span`
  color: ${({ theme }) => theme.body};
  display: grid;
  place-items: center;
`;

/* ---------------- Component ---------------- */

const CustomCursor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [click, setClick] = useState(false);
  const [mode, setMode] = useState(null);
  const [showRipple, setShowRipple] = useState(false);

  const wrapperRef = useRef(null);
  const raf = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const hoverTimeout = useRef(null);

  /* ---------- Mobile detect ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ---------- Cursor motion ---------- */
  useEffect(() => {
    if (isMobile) return;

    const move = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!raf.current) tick();
    };

    const tick = () => {
      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;

      pos.current.x += dx * 0.45;
      pos.current.y += dy * 0.45;

      wrapperRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = null;
      }
    };

    const mouseDown = () => {
      setClick(true);
      setMode(null);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 350);
    };

    const mouseUp = () => setClick(false);

    const handleOver = (e) => {
      const el = e.target.closest("[data-cursor]");
      if (!el) return;
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => {
        setMode(el.dataset.cursor);
      }, 50);
    };

    const handleOut = (e) => {
      const el = e.target.closest("[data-cursor]");
      if (!el) return;
      clearTimeout(hoverTimeout.current);
      setMode(null);
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerout", handleOut);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      cancelAnimationFrame(raf.current);
      clearTimeout(hoverTimeout.current);
    };
  }, [isMobile]);

  /* ---------- Route safety ---------- */
  useEffect(() => {
    const reset = () => setMode(null);
    window.addEventListener("popstate", reset);
    return () => window.removeEventListener("popstate", reset);
  }, []);

  if (isMobile) return null;

  return (
    <CursorWrapper ref={wrapperRef}>
      <CursorInner>
        {!mode && (
          <>
            <Dot src="/customCursor.svg" alt="" $click={click} />
            {showRipple && <Ripple />}
          </>
        )}

        {mode === "view" && (
          <Pill $click={click} $variant="view">
            <IconWrap>
              <FiEye size={18} />
            </IconWrap>
            View
          </Pill>
        )}

        {mode === "view-light" && (
          <Pill $click={click} $variant="view-light">
            <IconWrap>
              <FiEye size={18} />
            </IconWrap>
            View
          </Pill>
        )}

        {mode === "zoom" && (
          <ZoomCursor $click={click}>
            <ZoomIconWrap>
              <ZoomIcon size={24} />
            </ZoomIconWrap>
          </ZoomCursor>
        )}

        {mode === "soon" && (
          <Pill $click={click} $variant="soon">
            <IconWrap $spin>
              <LoaderIcon size={18} color="white" />
            </IconWrap>
            Coming soon
          </Pill>
        )}

        {mode === "locked" && (
          <Pill $click={click} $variant="locked">
            <IconWrap>
              <FiLock size={16} />
            </IconWrap>
            Locked
          </Pill>
        )}
      </CursorInner>
    </CursorWrapper>
  );
};

export default CustomCursor;