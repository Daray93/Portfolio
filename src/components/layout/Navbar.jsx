import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import PillNav from "../shared/PillNav";
import { FILTERS } from "../shared/filters";
import { useThemeMode } from "../../styles/ThemeModeContext";

// ---------------- Styled Components ----------------
// Fixed, deterministic height shared by Nav and its spacer below --
// no measurement/timing race, they can never drift apart.
// Below 560px the nav drops its top bar entirely and becomes just the
// floating pill filter, docked to the bottom of the viewport instead --
// the logo and theme toggle are hidden at that size rather than sharing
// a bar with the pill (see LogoText/ThemeToggle below). $hidden still
// slides it fully out of view on scroll, just downward instead of up
// since it now lives at the bottom.
const Nav = styled.nav`
  width: 100%;
  height: ${({ theme }) => theme.space[8]};
  display: flex;
  align-items: center;
  background: transparent;
  position: fixed;
  top: ${({ theme }) => theme.space[3]};
  left: 0;
  right: 0;
  z-index: 1000;
  transform: translateY(
    ${({ $hidden, theme }) => ($hidden ? `calc(-100% - ${theme.space[3]})` : "0")}
  );
  transition: transform 0.3s ease;

  @media (max-width: 560px) {
    top: auto;
    bottom: 0;
    height: auto;
    transform: translateY(${({ $hidden }) => ($hidden ? "100%" : "0")});
  }
`;

// Reserves the nav's height (plus the breathing room above it) in
// normal flow so page content doesn't jump underneath it now that
// Nav itself is position:fixed. Not needed on mobile -- Nav no longer
// sits at the top there, so it shouldn't reserve top space either.
const NavSpacer = styled.div`
  height: ${({ theme }) => `calc(${theme.space[8]} + ${theme.space[3]})`};

  @media (max-width: 560px) {
    height: 0;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1199px;
  margin: 0 auto;
  padding: 0 0rem;
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }

  /* Only the pill filter shows below 560px (see LogoText/ThemeToggle;
     the theme toggle gets a proper home in Splash's own mobile utility
     row instead, see UtilityRowInner there) -- center it now that it's
     the sole child instead of being pinned left by justify-content:
     space-between. Side padding matches SplashContainer's own mobile
     padding (1.25rem) so the pill's outer edge lines up with the grid
     cards above it. */
  @media (max-width: 560px) {
    justify-content: center;
    padding: 0 1.25rem;
  }
`;

const LogoText = styled(NavLink)`
  font-family: "Geist", sans-serif;
  font-weight: 400;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.skeletonBase};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

const NavCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.skeletonBase};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }

  svg {
    width: 1.1rem;
    height: 1.1rem;
  }

  @media (max-width: 560px) {
    display: none;
  }
`;

// ---------------- Navbar Component ----------------
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode, toggleMode } = useThemeMode();

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current + 6 && current > 80) setHidden(true);
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

  // The filter only really "means" anything on the homepage grid --
  // elsewhere it's just a nav shortcut back to a filtered home.
  const activeFilter = location.pathname === "/" ? searchParams.get("filter") || "all" : "all";

  const handleFilterChange = (id) => {
    // Picking a filter reorders the grid, which the user might be
    // scrolled well past -- jump back to the top, where the
    // newly-matching cells now start, so the reorg is visible.
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (location.pathname !== "/") {
      navigate(id === "all" ? "/" : `/?filter=${id}`);
      return;
    }
    if (id === "all") {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", id);
    }
    setSearchParams(searchParams);
  };

  // Hide on case study routes
  const hideOnCaseStudy =
    location.pathname.startsWith("/kropt") ||
    location.pathname.startsWith("/neuroloop");

  if (hideOnCaseStudy) return null;

  return (
    <>
    <Nav $hidden={hidden}>
      <NavContainer>
        <LogoText to="/">dp</LogoText>

        <NavCenter>
          <PillNav
            options={FILTERS}
            activeId={activeFilter}
            onChange={handleFilterChange}
            groupId="site-filter"
          />
        </NavCenter>

        <ThemeToggle
          type="button"
          onClick={toggleMode}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mode === "dark" ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
      </NavContainer>
    </Nav>
    <NavSpacer />
    </>
  );
}
