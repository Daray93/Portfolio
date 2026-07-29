import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiMinimize2 } from "react-icons/fi";
import PillNav from "../shared/PillNav";
import CaseStudyFab from "./CaseStudyFab";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

const Shell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// This is the element that actually morphs: sharing `morphId` with the
// homepage cell (see Splash.jsx) makes the whole page grow out of that
// cell into an almost-full-screen panel, rather than just a media box
// inside an already-present page. Background matches the homepage's own
// (theme.body, not a card surface colour) so it reads as the homepage
// itself zooming in, not a separate card floating on top of it.
const Frame = styled(motion.div)`
  width: 100%;
  max-width: 1320px;
  min-height: 100vh;
  position: relative;
  padding: 0rem 3rem;
  margin: 0 auto;
  background: ${({ theme }) => theme.body};
  border-radius: clamp(18px, 2.5vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadowSm};

  @media (max-width: 1100px) {
    padding: 3rem 2rem;
  }

  @media (max-width: 900px) {
    padding: 5rem 1rem 0rem 1rem;
  }
`;

const Content = styled.main`
  min-width: 0;
`;

const NavWrapper = styled.div`
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
`;

// Collapses the panel back down into its homepage cell -- client-side
// navigation (not a hard reload) so the shared layoutId can play the
// morph in reverse, same as CaseStudyFab's mobile-only Home button does
// visually but without the page-transition benefit.
const CollapseButton = styled.button`
  position: fixed;
  top: clamp(1rem, 2.5vw, 1.5rem);
  right: clamp(1rem, 2.5vw, 1.5rem);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.navSurface};
  color: ${({ theme }) => theme.textSecondary};
  cursor: none;
  z-index: 1000;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
    color: ${({ theme }) => theme.buttonGhostHoverText};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
};

export default function CaseStudyLayout({ sections, morphId, children }) {
  const [activeId, setActiveId] = useState(sections?.[0]?.id ?? null);
  const navigate = useNavigate();

  const handleChange = (id) => {
    setActiveId(id);
    scrollToSection(id);
  };

  return (
    <Shell>
      <NavWrapper>
        <PillNav
          options={sections.map((s) => ({ id: s.id, label: s.label }))}
          activeId={activeId}
          onChange={handleChange}
          groupId="case-study-nav"
        />
      </NavWrapper>

      <CollapseButton
        type="button"
        aria-label="Back to home"
        onClick={() => navigate("/")}
      >
        <FiMinimize2 />
      </CollapseButton>

      <Frame layoutId={morphId} layout={!!morphId} transition={MORPH_TRANSITION}>
        <Content>{children}</Content>
      </Frame>

      <CaseStudyFab />
    </Shell>
  );
}
