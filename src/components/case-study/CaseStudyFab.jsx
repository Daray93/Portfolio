import React, { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiHome, FiMoon, FiSun } from "react-icons/fi";
import { useThemeMode } from "../../styles/ThemeModeContext";

// Mirrors the project order in OtherProjects.jsx's grid -- keep both in
// sync if a case study is added, removed, or reordered there. Used to
// find what "next" means for the mobile fab's next-project arrow, and
// (exported) CaseStudyLayout's desktop Next button beside the pill nav.
export const CASE_STUDY_ORDER = [
  { path: "/operation-avocado", label: "Operation Avocado" },
  { path: "/orthovive", label: "OrthoVive" },
  { path: "/ibhf", label: "IBHF" },
  { path: "/audanote", label: "Audanote" },
  { path: "/kropt", label: "Kropt Mobile App" },
  { path: "/neuroloop", label: "Neuroloop" },
];

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
`;

// Same frosted-glass, no-drop-shadow treatment as PillNav's mobile track
// (see its own comment) -- this is wayfinding/escape chrome sitting right
// below it, not a CTA, so it should read as quiet, ambient UI rather than
// compete with the TL;DR toggle for "the button to press" attention.
const FabContainer = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%) translateY(${({ hidden }) => (hidden ? "120%" : "0")});
  display: flex;
  gap: 0.75rem;
  z-index: 3000;
  background: ${({ theme }) => theme.navSurface};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
  opacity: ${({ hidden }) => (hidden ? 0 : 1)};

  @media (min-width: 901px) {
    display: none;
  }
`;

const FabButton = styled.button`
  all: unset;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  font-weight: 500;
  color: ${({ theme }) => theme.body};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.15s ease;

  &:hover {
    animation: ${float} 0.2s ease forwards;
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }
`;

const NextFab = styled(Link)`
  all: unset;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }
`;

// Round icon-only shape (no label) -- same footprint the old LinkedIn/
// Email links used before they were replaced by NextFab. Shared by the
// theme toggle, Back (mirrors NextFab's direction but skips its label --
// "Back" doesn't need spelling out next to an already-labeled "Next"),
// and Home's compact shape once the fab is in "browsing" mode (see
// cameFromFabNav) -- with Back+Next added, everything but Next drops its
// label and shrinks to match, so all four controls still fit the bar.
const iconCircleStyles = css`
  all: unset;
  cursor: pointer;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }
`;

const IconCircleFab = styled.button`
  ${iconCircleStyles}
`;

const BackFab = styled(Link)`
  ${iconCircleStyles}
`;

// Same circular footprint, but always the CTA/primary color -- Home stays
// the one consistently "branded" control regardless of fab state (plain
// pill in the default layout, this circle once compact), while the
// toggle/Back stay neutral/secondary since they're plain utilities.
const HomeIconFab = styled.button`
  ${iconCircleStyles}
  border: none;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  color: ${({ theme }) => theme.body};
`;

// `homeFilter`: which homepage filter tab to land on when the mobile Home
// button is tapped -- pass "work" from a project's own layout (see
// CaseStudyLayout) so closing a project defaults the grid back to Work
// instead of All. Left unset for non-project usage (see AboutMe.jsx),
// which has no equivalent default.
export default function CaseStudyFab({ homeFilter }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { pathname } = location;
  const { mode, toggleMode } = useThemeMode();

  const currentIndex = CASE_STUDY_ORDER.findIndex((p) => pathname.startsWith(p.path));
  const nextProject =
    currentIndex === -1
      ? null
      : CASE_STUDY_ORDER[(currentIndex + 1) % CASE_STUDY_ORDER.length];
  const prevProject =
    currentIndex === -1
      ? null
      : CASE_STUDY_ORDER[(currentIndex - 1 + CASE_STUDY_ORDER.length) % CASE_STUDY_ORDER.length];

  // True once the visitor has actually stepped between case studies via
  // this fab (state carried on the Link itself, see the `state` prop
  // below) -- landing straight on a case study some other way (a shared
  // link, the homepage grid) shouldn't show a "Back" for a project they
  // never actually looked at.
  const cameFromFabNav = Boolean(location.state?.fabNav);
  const fabNavState = { fabNav: true };

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current + 6) setHidden(true);
      else if (current < lastScrollY.current - 6) setHidden(false);
      lastScrollY.current = current;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goHome = () => (window.location.href = homeFilter ? `/?filter=${homeFilter}` : "/");
  const themeLabel = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const themeIcon = mode === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />;

  return (
    <FabContainer hidden={hidden}>
      {cameFromFabNav ? (
        <>
          <HomeIconFab type="button" onClick={goHome} aria-label="Home">
            <FiHome size={16} />
          </HomeIconFab>
          <IconCircleFab type="button" onClick={toggleMode} aria-label={themeLabel}>
            {themeIcon}
          </IconCircleFab>
          {prevProject && (
            <BackFab
              to={prevProject.path}
              state={fabNavState}
              aria-label={`Previous project: ${prevProject.label}`}
            >
              <FiArrowLeft size={18} />
            </BackFab>
          )}
          {nextProject && (
            <NextFab
              to={nextProject.path}
              state={fabNavState}
              aria-label={`Next project: ${nextProject.label}`}
            >
              Next
              <FiArrowRight size={18} />
            </NextFab>
          )}
        </>
      ) : (
        <>
          <FabButton onClick={goHome}>
            <FiHome size={18} />
            Home
          </FabButton>
          <IconCircleFab type="button" onClick={toggleMode} aria-label={themeLabel}>
            {themeIcon}
          </IconCircleFab>
          {nextProject && (
            <NextFab
              to={nextProject.path}
              state={fabNavState}
              aria-label={`Next project: ${nextProject.label}`}
            >
              Next
              <FiArrowRight size={18} />
            </NextFab>
          )}
        </>
      )}
    </FabContainer>
  );
}
