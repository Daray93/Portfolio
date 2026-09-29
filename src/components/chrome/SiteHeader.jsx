import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { ease, easeArr, dur } from "../../styles/motion";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { useThemeMode } from "../../styles/ThemeModeContext";
import logo from "../../assets/shared/dp-logo.png";

// Minimal top bar: the logo (home) on the left, the page's centre left to
// the content.
//   phones/tablets  a menu button on the right opens the full-screen menu
//   desktop         the three pages as a pill nav on the right, always in
//                   view
// A light/dark toggle sits at the far right at every size. Sits above the
// full-screen menu so its buttons can close it.

const DESKTOP = "(min-width: 1025px)";

const PAGES = [
  { to: "/", label: "Work" },
  { to: "/about-me", label: "About" },
  { to: "/websites", label: "Websites" },
];

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  pointer-events: none;
  color: ${({ theme }) => theme.text};
  transition: opacity ${dur.base}s ${ease.out};

  /* stepping aside while a project card opens or shrinks back home */
  ${({ $away }) =>
    $away &&
    css`
      opacity: 0;

      > * {
        pointer-events: none !important;
      }
    `}

  /* during the intro the header shows through, above the loading screen,
     and isn't clickable yet (the menu would open underneath it) */
  ${({ $overIntro }) =>
    $overIntro &&
    css`
      z-index: 7100;

      > * {
        pointer-events: none;
      }
    `}

  > * {
    pointer-events: auto;
  }

  @media ${DESKTOP} {
    padding: 56px 88px;
  }

  @media (max-width: 640px) {
    padding: 16px 24px;
  }

  @media (max-height: 520px) and (orientation: landscape) {
    padding: 8px 24px;
  }
`;

// The logo's shape used as a mask, filled with the theme's text colour, so
// it's off-white on dark and near-black on light like the rest of the header.
const Logo = styled(Link)`
  display: block;
  color: inherit;
  transition: opacity ${dur.fast}s ${ease.out};

  /* masked on a child, so the link's own focus ring isn't masked away */
  span {
    display: block;
    width: 36px;
    aspect-ratio: 128 / 123;
    background: currentColor;
    -webkit-mask: url(${logo}) center / contain no-repeat;
    mask: url(${logo}) center / contain no-repeat;
  }

  &:hover {
    color: inherit;
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }
`;

// ---------------- Desktop pill nav ----------------

const PillTrack = styled.nav`
  display: none;

  @media ${DESKTOP} {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: ${({ theme }) => theme.navSurface};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: inset 0 0 0 1px
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};

    ${({ $hidden }) =>
      $hidden &&
      css`
        display: none;
      `}
  }
`;

const Pill = styled(Link)`
  position: relative;
  display: block;
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme, $current }) => ($current ? theme.buttonPrimaryText : theme.textSecondary)};
  transition: color ${dur.fast}s ${ease.out};

  &:hover {
    color: ${({ theme, $current }) => ($current ? theme.buttonPrimaryText : theme.text)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
  }
`;

// The current page's fill, and a softer highlight following the pointer
// between pills. Both slide with the site's ease -- no spring. Corner
// radius goes through the style prop so framer keeps it round while it
// scales between pills of different widths.
const PillFill = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: ${({ theme }) => theme.buttonPrimaryBg};
`;

const PillHover = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: ${({ theme }) => theme.buttonGhostHoverBg};
`;

const PillLabel = styled.span`
  position: relative;
  z-index: 1;
`;

// ---------------- Right-hand controls ----------------

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeButton = styled.button`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color ${dur.fast}s ${ease.out};

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.75;
  }

  &:hover {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const dark = mode === "dark";
  return (
    <ThemeButton
      type="button"
      onClick={toggleMode}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
    </ThemeButton>
  );
}

// phones and tablets only -- desktop has the pill nav instead
const MenuButton = styled.button`
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;

  span {
    position: absolute;
    left: 11px;
    right: 11px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transition: transform ${dur.base}s ${ease.out};
  }

  span:nth-child(1) {
    top: 17px;
    transform: ${({ $open }) => ($open ? "translateY(4px) rotate(45deg)" : "none")};
  }

  span:nth-child(2) {
    top: 25px;
    transform: ${({ $open }) => ($open ? "translateY(-4px) rotate(-45deg)" : "none")};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  @media ${DESKTOP} {
    display: none;
  }
`;

function PillNav({ hidden }) {
  const { pathname } = useLocation();
  const { reduced } = useMotionPreference();
  const [hovered, setHovered] = useState(null);
  const slide = reduced
    ? { duration: 0 }
    : { duration: dur.base, ease: easeArr.out };

  return (
    <PillTrack
      aria-label="Main"
      $hidden={hidden}
      onMouseLeave={() => setHovered(null)}
    >
      {PAGES.map((p) => {
        const current = pathname === p.to;
        return (
          <Pill
            key={p.to}
            to={p.to}
            $current={current}
            aria-current={current ? "page" : undefined}
            onMouseEnter={() => setHovered(p.to)}
          >
            <AnimatePresence>
              {!current && hovered === p.to && (
                <PillHover
                  layoutId="header-pill-hover"
                  style={{ borderRadius: 999 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: slide,
                    opacity: { duration: reduced ? 0 : dur.fast * 0.6 },
                  }}
                />
              )}
            </AnimatePresence>
            {current && (
              <PillFill
                layoutId="header-pill-fill"
                style={{ borderRadius: 999 }}
                transition={slide}
              />
            )}
            <PillLabel>{p.label}</PillLabel>
          </Pill>
        );
      })}
    </PillTrack>
  );
}

export default function SiteHeader({
  menuOpen,
  onMenuToggle,
  overIntro = false,
  away = false,
}) {
  return (
    <Bar $overIntro={overIntro} $away={away}>
      <Logo to="/" aria-label="Dara Phillips, home">
        <span aria-hidden="true" />
      </Logo>
      <Controls>
        <PillNav hidden={menuOpen} />
        <ThemeToggle />
        <MenuButton
          type="button"
          $open={menuOpen}
          onClick={onMenuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </MenuButton>
      </Controls>
    </Bar>
  );
}
