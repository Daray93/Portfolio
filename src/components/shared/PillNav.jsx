import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

// Reusable rounded pill nav with two sliding indicators (framer-motion
// shared layoutId): a solid fill for the selected option, and a softer
// highlight that physically tracks the cursor as you hover between
// options. Every color comes from theme.js -- pass a unique `groupId`
// if more than one instance can be mounted at once, so their sliding
// indicators don't share an animation.

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
    flex: 1;
    padding: 0.6rem 0.6rem;
  }
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

export default function PillNav({ options, activeId, onChange, groupId = "pill-nav" }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <Track role="tablist" onMouseLeave={() => setHoveredId(null)}>
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <PillButton
            key={option.id}
            role="tab"
            type="button"
            aria-selected={active}
            $active={active}
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
  );
}
