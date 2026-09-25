import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiHome, FiArrowRight } from "react-icons/fi";
import PillNav from "../shared/PillNav";
import CaseStudyFab, { CASE_STUDY_ORDER } from "./CaseStudyFab";
import { CaseStudyViewContext } from "./CaseStudyViewContext";

const Shell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// Purely a layout wrapper now -- no background/border/radius/shadow of
// its own, so it doesn't read as an outer "card" wrapping the actual
// section cards (see CaseStudySection's Row, which is the real visible
// card, in theme.cardBackground). It used to carry theme.body as its own
// fill specifically so a homepage->page morph animation would read as
// the homepage continuing rather than a separate panel; now that there's
// no morph (see Splash.jsx), that fill just doubled up on AppWrapper's
// own theme.body behind it, and its border/shadow made it look like a
// second, darker container around every section.
// max-width caps the whole column -- text, images, and captions alike --
// at one comfortable reading measure instead of letting paragraphs cap
// themselves narrower than the images/callouts next to them (see Paragraph
// etc. in each case study file, which used to carry their own max-width:
// 68ch; that fought this container instead of matching it). Top padding
// clears the fixed NavWrapper pill (see below) with real breathing room
// instead of the 0rem it had at desktop, which packed content right up
// against the nav.
const Frame = styled.div`
  width: 100%;
  max-width: 900px;
  min-height: 100vh;
  position: relative;
  padding: 8rem 3rem 5rem;
  margin: 0 auto;

  @media (max-width: 1100px) {
    padding: 7rem 2rem 4rem;
  }

  @media (max-width: 900px) {
    padding: 6rem 1rem 3rem;
  }
`;

const Content = styled.main`
  min-width: 0;
`;

// PillNav's own mobile styling (see PillNav.jsx, @media max-width: 560px)
// makes its pills width: 100% / flex: 1 -- that only does anything useful
// if ITS OWN parent actually has a real width to fill. Above 560px this
// stays shrink-wrapped and centred (the desktop look); at/below it, swap
// to a left/right-anchored box so there's an actual width for the pills
// to stretch into, instead of a centred, content-sized nothing.
// Full-width bar (mirrors Navbar.jsx's own Nav/NavContainer/NavCenter
// split) rather than a shrink-to-fit box centered via translateX(-50%).
// That shrink-to-fit box was the bug: a fixed-position element with no
// declared width is constrained to the viewport's available width when
// its content is wider than that, and Home+PillNav+Next together crossed
// that line on plenty of real viewport widths -- forcing the pill nav's
// own track (and its option labels) to wrap. A full-width bar gives the
// centre section real, unconstrained room via flex:1 instead.
const NavWrapper = styled.div`
  position: fixed;
  top: 1.5rem;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;

  @media (max-width: 560px) {
    top: 0;
  }
`;

// Flanks the pill nav with Home (left) and Next (right) on desktop --
// replaces the old top-right collapse button, which was redundant chrome
// competing with the nav pills for the same corner. Mobile keeps its own
// Home/Next in CaseStudyFab's bottom bar instead (same 900px breakpoint
// that bar appears at), so both of these hide below it -- at which point
// NavCenter is the row's only real child, hence the justify-content
// override below (space-between has nothing to space a single item
// against, and would otherwise leave the pill nav pinned to one side).
const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  max-width: 1100px;
  padding: 0 1.5rem;

  @media (max-width: 900px) {
    justify-content: center;
    padding: 0 1rem;
  }
`;

const NavCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 0;
`;

// Same ghost treatment as Navbar.jsx's LogoText/ThemeToggle (its own
// left/right nav options on the splash) -- transparent by default,
// filling in with cardBackground + a hairline border on hover, rather
// than a filled/outlined button competing with the pill nav for weight.
const HomeButton = styled.button`
  all: unset;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

  @media (max-width: 900px) {
    display: none;
  }
`;

const NextButton = styled(Link)`
  all: unset;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Fraunces Variable", serif;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  flex-shrink: 0;
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

  @media (max-width: 900px) {
    display: none;
  }
`;

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
};

// Set by Splash.jsx every time the homepage filter changes -- reading it
// back here means "close" returns to whichever filter was actually
// active, not a hardcoded one. Falls back to "work" (all case studies'
// own filter) when there's nothing to restore, e.g. a case study opened
// via a direct/shared link with no prior homepage visit this session.
// Wrapped in try/catch since sessionStorage can throw under strict
// privacy settings (e.g. Safari private browsing).
const getHomeFilter = () => {
  try {
    return sessionStorage.getItem("homeFilter") || "work";
  } catch {
    return "work";
  }
};

export default function CaseStudyLayout({ sections, children }) {
  const [activeId, setActiveId] = useState(sections?.[0]?.id ?? null);
  const [view, setView] = useState("detailed");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const homeFilter = getHomeFilter();

  const currentIndex = CASE_STUDY_ORDER.findIndex((p) => pathname.startsWith(p.path));
  const nextProject =
    currentIndex === -1
      ? null
      : CASE_STUDY_ORDER[(currentIndex + 1) % CASE_STUDY_ORDER.length];

  const handleChange = (id) => {
    setActiveId(id);
    scrollToSection(id);
  };

  // Keeps the pill nav's active indicator in sync with whatever section is
  // actually on screen, not just the last one clicked -- otherwise
  // scrolling manually leaves the nav pointing at a section you scrolled
  // away from ages ago. The -20%/-70% rootMargin treats a band near the
  // top of the viewport as the "active" zone, so a section counts as
  // current once it's scrolled up near the nav rather than only while
  // it fills the whole screen.
  useEffect(() => {
    if (!sections?.length) return;

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <CaseStudyViewContext.Provider value={{ view, setView }}>
      <Shell>
        <NavWrapper>
          <NavContainer>
            <HomeButton
              type="button"
              aria-label="Home"
              onClick={() => navigate(`/?filter=${homeFilter}`)}
            >
              <FiHome />
            </HomeButton>

            <NavCenter>
              <PillNav
                options={sections.map((s) => ({ id: s.id, label: s.label }))}
                activeId={activeId}
                onChange={handleChange}
                groupId="case-study-nav"
                scrollable
              />
            </NavCenter>

            {nextProject && (
              <NextButton
                to={nextProject.path}
                state={{ fabNav: true }}
                aria-label={`Next project: ${nextProject.label}`}
              >
                Next
                <FiArrowRight size={16} />
              </NextButton>
            )}
          </NavContainer>
        </NavWrapper>

        <Frame>
          <Content>{children}</Content>
        </Frame>

        <CaseStudyFab homeFilter={homeFilter} />
      </Shell>
    </CaseStudyViewContext.Provider>
  );
}
