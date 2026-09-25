import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

// ---------------- Styled Components ----------------

const Card = styled(motion.div)`
  border-radius: 24px;
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const WorkHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.text};
  line-height: 1.3;
`;

const WorkText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  color: ${({ theme }) => theme.textSecondary};
`;

const WorkCta = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaceSubtle};
  }
`;

// ---------------- Component ----------------

export default function WorkCard() {
  return (
    <Card
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
      }}
    >
      <div>
        <WorkHeading>Professional Work</WorkHeading>
        <WorkText>
          Currently working with early-stage startups under NDA. Scope includes
          product design, interactive prototyping, and design system development.
        </WorkText>
      </div>
      <WorkCta
        href="mailto:daraphillips.design@gmail.com" target="_blank" rel="noopener noreferrer"
      >
        Inquire about availability
      </WorkCta>
    </Card>
  );
}