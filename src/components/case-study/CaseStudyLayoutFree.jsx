import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiMinimize2 } from "react-icons/fi";
import CaseStudyFab from "./CaseStudyFab";

// A second, deliberately minimal case-study shell -- built alongside
// CaseStudyLayout (not replacing it) since the shared CaseStudySection
// card system imposes chrome (padding/background/border) that this page
// doesn't want; it renders nothing but this plain frame, and the page
// decides its own content layout entirely.
const Shell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Frame = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: ${({ theme }) => theme.body};
  border-radius: 0;
  border: 1px solid transparent;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
`;

const Content = styled.main`
  min-width: 0;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 6rem 2rem 6rem;

  @media (max-width: 900px) {
    padding: 6rem 1.25rem 4rem;
  }
`;

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

export default function CaseStudyLayoutFree({ children }) {
  const navigate = useNavigate();

  return (
    <Shell>
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
