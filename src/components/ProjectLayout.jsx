// components/ProjectLayout.jsx
import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

// Styled container for the layout
const Container = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  color: ${({ theme }) => theme.text};
`;

// Regular title style
const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

// Clickable link-style title
const TitleLink = styled.a`
  font-size: 3rem;
  font-weight: 700;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.linkHover || "#0077ff"};
    text-decoration: none;
  }
`;

// Subtitle / tagline
const Tagline = styled.p`
  font-size: 1.25rem;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary || "#666"};
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
`;

// Motion wrappers
const AnimatedHeader = motion.div;
const AnimatedBody = motion.div;

// Component
export default function ProjectLayout({ title, tagline, titleLink, children }) {
  return (
    <Container>
      <AnimatedHeader
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {titleLink ? (
          <TitleLink href={titleLink} target="_blank" rel="noopener noreferrer">
            {title}
          </TitleLink>
        ) : (
          <Title>{title}</Title>
        )}
        {tagline && <Tagline>{tagline}</Tagline>}
      </AnimatedHeader>

      <AnimatedBody
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {children}
      </AnimatedBody>
    </Container>
  );
}
