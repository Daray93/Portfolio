import React from "react";
import styled from "styled-components";
import { FiMinimize2 } from "react-icons/fi";
import CaseStudyFab from "../../components/case-study/CaseStudyFab";
import OperationAvocadoContent from "./OperationAvocadoContent";

// No morph animation -- appears immediately over the homepage rather
// than growing out of its grid cell (see Splash.jsx's AvocadoCell).
const Box = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  overflow: hidden;
  background: ${({ theme }) => theme.body};
`;

const Scroll = styled.div`
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const Inner = styled.div`
  min-width: 0;
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
  z-index: 2001;
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

export default function OperationAvocadoOverlay({ onClose }) {
  return (
    <>
      <CollapseButton type="button" aria-label="Back to home" onClick={onClose}>
        <FiMinimize2 />
      </CollapseButton>

      <Box>
        <Scroll>
          <Inner>
            <OperationAvocadoContent />
          </Inner>
        </Scroll>
      </Box>

      <CaseStudyFab homeFilter="work" />
    </>
  );
}
