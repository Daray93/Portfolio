import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { LayoutGroup } from "framer-motion";
import { CaseStudyViewContext } from "./CaseStudyViewContext";
import ProjectCover from "./ProjectCover";
import SiteHeader from "../chrome/SiteHeader";
import SiteMenu from "../chrome/SiteMenu";
import projects from "../../data/projects";
import { RETURN_KEY } from "../showcase/ExpandTransition";

// The frame every case study sits in: the site's own header and menu (the
// same as Work, About and Websites), the project's cover when it has one,
// then the reading column.
//
// The header stays out of the way while the cover fills the screen (the
// cover has its own "All work" and "Visit app") and comes in once the
// reader scrolls into the case study. "Work" shows as the current page:
// case studies belong to it.
//
// `sections` lists the page's sections in order ({ id, label }); with
// `numbered`, each CaseStudySection shows its place ("01", "02"...).

const Shell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// max-width caps the whole column -- text, images, and captions alike --
// at one comfortable reading measure. --cover-gap is the space above the
// first section (below the cover, clearing the fixed header); the end of
// the page (MoreWork) uses the same, so the page opens and closes evenly.
const Frame = styled.div`
  --cover-gap: 8rem;
  width: 100%;
  max-width: 900px;
  min-height: 100vh;
  position: relative;
  padding: var(--cover-gap) 3rem 5rem;
  margin: 0 auto;

  @media (max-width: 1100px) {
    --cover-gap: 7rem;
    padding: var(--cover-gap) 2rem 4rem;
  }

  @media (max-width: 900px) {
    --cover-gap: 6rem;
    padding: var(--cover-gap) 1rem 3rem;
  }
`;

const Content = styled.main`
  min-width: 0;
`;

// cover (full width) stacked above the reading column
const Main = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export default function CaseStudyLayout({ sections, numbered = false, children }) {
  const [view, setView] = useState("detailed");
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // the carousel entry for this page, if it has one -- drives the cover
  const project = projects.find((p) => pathname.startsWith(p.to));
  const coverRef = useRef(null);
  const [coverInView, setCoverInView] = useState(Boolean(project));

  useEffect(() => {
    const el = coverRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setCoverInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [project]);

  // The homepage plays the card's way back only when the visitor returns
  // to it straight from here -- leaving for anywhere else forgets it.
  useEffect(
    () => () => {
      if (window.location.pathname !== "/") {
        try {
          sessionStorage.removeItem(RETURN_KEY);
        } catch {
          // storage blocked -- nothing was stored either
        }
      }
    },
    []
  );

  // the menu closes on any page change, and the page underneath holds
  // still while it's open
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const html = document.documentElement;
    const was = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = was;
    };
  }, [menuOpen]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const numberOf = useCallback(
    (id) => {
      if (!numbered || !sections) return null;
      const i = sections.findIndex((s) => s.id === id);
      return i < 0 ? null : String(i + 1).padStart(2, "0");
    },
    [numbered, sections]
  );
  const viewValue = useMemo(() => ({ view, setView, numberOf }), [view, numberOf]);

  // hidden over the cover, unless the menu is open (its close button lives
  // in the header)
  const headerAway = coverInView && !menuOpen;

  return (
    <CaseStudyViewContext.Provider value={viewValue}>
      <Shell>
        {/* Its own layout group: the header's pill animates between pills
            by a shared name, and during the card transition the homepage's
            header is still on screen -- without this, the two headers'
            "Work" pills animate into each other. */}
        <LayoutGroup id="case-study-header">
          <SiteHeader
            menuOpen={menuOpen}
            onMenuToggle={() => setMenuOpen((o) => !o)}
            away={headerAway}
            current="/"
            docked
          />
        </LayoutGroup>
        <SiteMenu open={menuOpen} onClose={closeMenu} current="/" />

        <Main inert={menuOpen}>
          {project && <ProjectCover ref={coverRef} project={project} />}
          <Frame>
            <Content>{children}</Content>
          </Frame>
        </Main>
      </Shell>
    </CaseStudyViewContext.Provider>
  );
}
