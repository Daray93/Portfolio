import React, { useState } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

// Reusable rounded pill nav with two sliding indicators (framer-motion
// shared layoutId): a solid fill for the selected option, and a softer
// highlight that physically tracks the cursor as you hover between
// options. Every color comes from theme.js -- pass a unique `groupId`
// if more than one instance can be mounted at once, so their sliding
// indicators don't share an animation.

// `scrollable`: opt-in for callers with more options than a phone screen
// comfortably fits (see CaseStudyLayout's up-to-six section pills). Default
// behaviour (Navbar's bottom nav, 4 fixed items) still squeezes pills to
// fill the width via flex -- switching that to scroll too would leave
// visible empty space instead of the intended full-width bar.
const ScrollShell = styled.div`
  position: relative;
  display: inline-block;

  /* Only takes the full width (and thus a real box for Track's edge
     fades/scroll to work inside) at the same breakpoint Track itself
     switches into its mobile treatment. Above that, staying shrink-
     wrapped is what lets a flex/absolute-positioned parent (NavCenter's
     justify-content:center, or CaseStudyLayout's NavWrapper) still
     center it -- a block-level width:100% here would fill the parent
     and left-align the inline content inside instead. */
  @media (max-width: 560px) {
    display: block;
    width: 100%;
  }
`;

const Track = styled.nav`
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: ${({ theme }) => theme.navSurface};
  border-radius: 999px;

  /* As the mobile bottom nav (see Navbar.jsx) this is the whole visible
     bar, floating on its own rather than sitting inside a larger nav
     row -- stretches to the same width as the grid cards above it
     (NavContainer carries the matching side padding). It's floating
     directly over scrolling grid content now instead of sitting on a
     mostly-static top bar, so it gets a frosted-glass treatment
     (blurred backdrop + shadow) to stay legible against whatever's
     underneath it. navSurface is already translucent -- the blur is
     what turns that into actual glass instead of a flat tint. */
  @media (max-width: 560px) {
    display: flex;
    width: 100%;
    padding: 5px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: ${({ theme }) => theme.shadowLg};
    border: 1px solid ${({ theme }) => theme.border};

    ${({ $scrollable }) =>
      $scrollable &&
      css`
        overflow-x: auto;
        justify-content: flex-start;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          display: none;
        }
      `}
  }
`;

const PillButton = styled.button`
  position: relative;
  padding: 0.5rem 1.1rem;
  border: none;
  background: transparent;
  border-radius: 999px;
  font-family: "General Sans", sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: none;
  color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryText : theme.textSecondary)};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryHoverText : theme.text)};
  }

  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 560px) {
    ${({ $scrollable }) =>
      $scrollable
        ? css`
            flex: none;
            white-space: nowrap;
            padding: 0.6rem 0.9rem;
          `
        : css`
            flex: 1;
            padding: 0.6rem 0.6rem;
          `}
  }
`;

// Fades the pill row's edges out to white right where it scrolls under
// them, hinting there's more to scroll to -- a white gradient (matching
// the pill nav's own glassy navSurface tone) layered over a backdrop-blur,
// so it reads as the content fading into the nav's own surface rather
// than a flat, colourless blur. Overlay only, never intercepts touch/scroll.
const EdgeFade = styled.div`
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 32px;
  pointer-events: none;
  z-index: 2;
  border-radius: 999px;

  @media (max-width: 560px) {
    display: ${({ $show }) => ($show ? "block" : "none")};
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  ${({ $side, theme }) =>
    $side === "left"
      ? css`
          left: 0;
          background: linear-gradient(to right, ${theme.navSurface}, transparent);
        `
      : css`
          right: 0;
          background: linear-gradient(to left, ${theme.navSurface}, transparent);
        `}
`;

// border-radius is set via the style prop (not this stylesheet), on
// purpose -- framer only tracks/corrects inline style values through
// a shared-layout scale animation, so a CSS-authored radius here would
// visibly warp for a beat whenever the animation scales the box
// non-uniformly (e.g. sliding between pills of different widths).
const Fill = styled(motion.span)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  z-index: 0;

  ${PillButton}:hover & {
    background: ${({ theme }) => theme.buttonPrimaryHover};
  }
`;

const HoverHighlight = styled(motion.span)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.buttonGhostHoverBg};
  z-index: 0;
`;

const Label = styled.span`
  position: relative;
  z-index: 1;
`;

export default function PillNav({
  options,
  activeId,
  onChange,
  groupId = "pill-nav",
  scrollable = false,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <ScrollShell>
      <Track role="tablist" onMouseLeave={() => setHoveredId(null)} $scrollable={scrollable}>
        {options.map((option) => {
          const active = option.id === activeId;
          return (
            <PillButton
              key={option.id}
              role="tab"
              type="button"
              aria-selected={active}
              $active={active}
              $scrollable={scrollable}
              onClick={() => onChange(option.id)}
              onMouseEnter={() => setHoveredId(option.id)}
            >
              <AnimatePresence>
                {!active && hoveredId === option.id && (
                  <HoverHighlight
                    layoutId={`${groupId}-hover`}
                    style={{ borderRadius: 999 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 500, damping: 40 },
                      opacity: { duration: 0.15 },
                    }}
                  />
                )}
              </AnimatePresence>
              {active && (
                <Fill
                  layoutId={`${groupId}-fill`}
                  style={{ borderRadius: 999 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Label>{option.label}</Label>
            </PillButton>
          );
        })}
      </Track>
      {scrollable && (
        <>
          <EdgeFade $side="left" $show />
          <EdgeFade $side="right" $show />
        </>
      )}
    </ScrollShell>
  );
}
