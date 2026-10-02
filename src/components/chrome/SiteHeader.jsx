import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { ease, easeArr, dur } from "../../styles/motion";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { useThemeMode } from "../../styles/ThemeModeContext";
import AboutCard from "./AboutCard";
import logo from "../../assets/shared/dp-logo.png";

// Minimal top bar: the logo (home) on the left, the page's centre left to
// the content.
//   phones/tablets  a menu button on the right opens the full-screen menu
//                   (Case studies, Websites and About)
//   desktop         Case studies and Websites as a pill nav on the right,
//                   always in view. About isn't in it: hovering (or
//                   focusing) the name and logo unfolds the About card from
//                   under them. A desktop-width screen with no hover (a big
//                   tablet) gets an About pill instead.
// A light/dark toggle sits at the far right at every size. Sits above the
// full-screen menu so its buttons can close it.
//
// On a page that scrolls under it (a case study), `docked` makes it compact
// and gives it a glass backing so text passing beneath doesn't show through
// the logo; `current` marks a page as current when the URL isn't one of the
// nav's own (a case study belongs to Case studies).

const DESKTOP = "(min-width: 1025px)";

// a pointer that can hover: where the About card unfolds from the logo
const HOVERS = "(hover: hover) and (pointer: fine)";

// `touchOnly`: a pill only where the logo's About card can't be hovered open
const PAGES = [
  { to: "/", label: "Case studies" },
  { to: "/websites", label: "Websites" },
  { to: "/about-me", label: "About", touchOnly: true },
];

// a moment's pause before the card opens or closes, so brushing past the
// logo doesn't flash it and the pointer can travel from the logo to the card
const OPEN_MS = 90;
const CLOSE_MS = 160;

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

  ${({ $docked, theme }) =>
    $docked &&
    css`
      padding: 14px 32px;
      background: color-mix(in srgb, ${theme.body} 78%, transparent);
      -webkit-backdrop-filter: blur(20px) saturate(1.4);
      backdrop-filter: blur(20px) saturate(1.4);
      box-shadow: 0 1px 0 ${theme.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"};
      transition:
        opacity ${dur.base}s ${ease.out},
        transform ${dur.slow}s ${ease.out},
        visibility 0s linear;

      @media ${DESKTOP} {
        padding: 14px 40px;
      }

      @media (max-width: 640px) {
        padding: 10px 16px;
      }

      /* away, it isn't drawn at all once it has slid off -- nothing of it
         over the cover while a card transition plays there */
      ${({ $away }) =>
        $away &&
        css`
          transform: translateY(-100%);
          visibility: hidden;
          transition:
            opacity ${dur.base}s ${ease.out},
            transform ${dur.slow}s ${ease.out},
            visibility 0s linear ${dur.slow}s;
        `}
    `}
`;

// Home: the logo in a circle, and beside it the name and what I do -- so
// anyone landing knows whose work this is before looking at a card. The
// role line shows from tablets up; phones keep the name.
const Logo = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;

  &:hover {
    color: inherit;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
    border-radius: 999px;
  }
`;

// the circle, in the same frosted surface as the pill nav
const Mark = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.navSurface};
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};
  transition: background-color ${dur.fast}s ${ease.out};

  /* the logo's shape as a mask, filled with the text colour, so it's
     off-white on dark and near-black on light like the rest of the header */
  &::after {
    content: "";
    width: 22px;
    aspect-ratio: 128 / 123;
    background: currentColor;
    -webkit-mask: url(${logo}) center / contain no-repeat;
    mask: url(${logo}) center / contain no-repeat;
  }

  ${Logo}:hover & {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
  }
`;

const Who = styled.span`
  display: grid;
  gap: 1px;
  line-height: 1.2;
`;

const Name = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const Role = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};

  @media (max-width: 640px) {
    display: none;
  }
`;

// ---------------- The About card, from the logo ----------------

// the logo and, under it, the card it unfolds
const Home = styled.div`
  position: relative;
  display: inline-flex;
`;

// Only where a pointer can hover, at desktop width. The padding on top is
// part of the hover area, so the pointer can cross from the logo to the
// card without it closing.
const Reveal = styled.div`
  display: none;

  @media ${DESKTOP} and ${HOVERS} {
    display: block;
    position: absolute;
    top: 100%;
    left: -12px;
    width: 384px;
    padding-top: 14px;
    visibility: hidden;
    pointer-events: none;
    transition: visibility 0s linear ${dur.base}s;

    &[data-open] {
      visibility: visible;
      pointer-events: auto;
      transition-delay: 0s;
    }
  }
`;

// The card's surface. It unfolds downwards from under the name: clipped to
// nothing at its top edge, then opened out (the clip reaches past the edges
// once open, so the shadow isn't cut off).
const Sheet = styled.div`
  padding: 24px;
  border-radius: 24px;
  background: ${({ theme }) => theme.body};
  box-shadow:
    inset 0 0 0 1px ${({ theme }) => theme.border},
    0 24px 64px -24px rgba(0, 0, 0, ${({ theme }) => (theme.mode === "dark" ? 0.7 : 0.28)});
  clip-path: inset(0 -64px 100% -64px);
  opacity: 0;
  transform: translateY(-6px);
  transition:
    clip-path ${dur.base}s ${ease.out},
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out};

  ${Reveal}[data-open] & {
    clip-path: inset(-64px);
    opacity: 1;
    transform: none;
    transition:
      clip-path ${dur.slow}s ${ease.out},
      opacity ${dur.fast}s ${ease.out},
      transform ${dur.slow}s ${ease.out};
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    ${Reveal}[data-open] & {
      transition: none;
      transform: none;
    }
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

  /* About: a pill only where the logo's card can't be hovered open */
  ${({ $touchOnly }) =>
    $touchOnly &&
    css`
      @media ${HOVERS} {
        display: none;
      }
    `}
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

function PillNav({ hidden, current: currentPath }) {
  const { pathname } = useLocation();
  const here = currentPath ?? pathname;
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
        const current = here === p.to;
        return (
          <Pill
            key={p.to}
            to={p.to}
            $current={current}
            $touchOnly={p.touchOnly}
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
  current,
  docked = false,
}) {
  const { pathname } = useLocation();
  // the About card under the logo (desktop, with a pointer that hovers)
  const [aboutOpen, setAboutOpen] = useState(false);
  const timer = useRef(0);
  const blocked = menuOpen || away || overIntro;

  const openSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAboutOpen(true), OPEN_MS);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAboutOpen(false), CLOSE_MS);
  };
  const closeNow = () => {
    clearTimeout(timer.current);
    setAboutOpen(false);
  };

  // closed on arriving anywhere new, and whenever the header steps aside
  useEffect(() => {
    clearTimeout(timer.current);
    setAboutOpen(false);
  }, [pathname, blocked]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const showAbout = aboutOpen && !blocked;

  return (
    <Bar $overIntro={overIntro} $away={away} $docked={docked}>
      <Home
        onMouseEnter={openSoon}
        onMouseLeave={closeSoon}
        // keyboard: focusing the logo opens the card, so Tab carries on into it
        onFocus={() => {
          clearTimeout(timer.current);
          setAboutOpen(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) closeNow();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeNow();
        }}
      >
        <Logo to="/">
          <Mark aria-hidden="true" />
          <Who>
            <Name>Dara Phillips</Name>
            <Role>Product designer &amp; developer</Role>
          </Who>
        </Logo>
        <Reveal data-open={showAbout ? "" : undefined} inert={!showAbout}>
          <Sheet>
            <AboutCard onNavigate={closeNow} />
          </Sheet>
        </Reveal>
      </Home>
      <Controls>
        <PillNav hidden={menuOpen} current={current} />
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
