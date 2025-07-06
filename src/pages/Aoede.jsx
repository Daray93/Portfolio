// pages/ProjectOne.jsx
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ProjectLayout from "../components/ProjectLayout";
import thera from "../assets/Aoede.png";


// Add this styled container to hold the two columns side by side
const HeroAndTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media(min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const HeroImageWrapper = styled.div`
  flex: 1;
  margin-top: 0;
  text-align: center;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 280px;
  border-radius: 20px;
  object-fit: cover;
  margin-top: 2rem;
  margin-bottom: 2rem;
  margin-right: 4rem;
  border: 2px solid transparent;
  transition: border 0.3s ease, transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Text = styled.section`
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
`;

const Section = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
`;

const List = styled.ul`
  padding-left: 0;
  list-style-type: none;
  font-size: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.projectDescription || "rgba(70, 70, 70, 0.76)"};
`;

const CTAWrapper = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: white;
  }
`;


export default function ProjectOne() {
  return (
    <ProjectLayout
  title="Aoede"
  tagline="An app to speed up Physiotherapist's workflow."
>
  <HeroAndTextContainer>

    <Text>
      <Section>
        <SectionTitle>Roles & Deliverables</SectionTitle>
        <List>
          <ListItem>Low-to-high fidelity wireframes</ListItem>
          <ListItem>Interactive prototyping (mobile-first)</ListItem>
        </List>
      </Section>

      <Section style={{ marginTop: "2rem" }}>
        <SectionTitle>Status</SectionTitle>
        <p>
          This project is currently <strong>ongoing</strong> and covered by a{" "}
          <strong>Non-Disclosure Agreement</strong>. As a result, only limited
          information and visuals can be shared publicly. Please feel free to
          reach out for more details during a private conversation.
        </p>
      </Section>
    </Text>

    <HeroImageWrapper>
      <HeroImage src={thera} alt="Aoede Hero" />
    </HeroImageWrapper>
  </HeroAndTextContainer>

  <CTAWrapper>
    <CTAButton to="/neuroloop">View Next Project →</CTAButton>
  </CTAWrapper>
</ProjectLayout>
  );
}
