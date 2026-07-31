import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiMinimize2 } from "react-icons/fi";
import PillNav from "../shared/PillNav";
import CaseStudyFab from "./CaseStudyFab";

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
const Frame = styled.div`
  width: 100%;
  max-width: 1320px;
  min-height: 100vh;
  position: relative;
  padding: 0rem 3rem;
  margin: 0 auto;

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

// Collapses the panel back to the homepage -- client-side navigation
// (not a hard reload), defaulting the grid to the Work filter (see
// CaseStudyFab's homeFilter for the mobile equivalent).
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

export default function CaseStudyLayout({ sections, children }) {
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
        onClick={() => navigate("/?filter=work")}
      >
        <FiMinimize2 />
      </CollapseButton>

      <Frame>
        <Content>{children}</Content>
      </Frame>

      <CaseStudyFab homeFilter="work" />
    </Shell>
  );
}
