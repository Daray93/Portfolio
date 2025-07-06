// pages/WeddingMate.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ProjectLayout from "../components/ProjectLayout";

// Images
import weddingHero from "../assets/WMHero.png";
import wireframe1 from "../assets/WM2.png";
import wireframe2 from "../assets/WM3.png";
import wireframe3 from "../assets/WM4.png";
import wireframe4 from "../assets/WM5.png";
// === Layout Styles ===


const ContentRow = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RolesColumn = styled.div`
  flex: 1 1 45%;
  min-width: 280px;
`;

const HeroColumn = styled.div`
  flex: 1 1 50%;
  min-width: 280px;
`;

const Columns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Column = styled.div`
  flex: 1;
`;

export const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text || "#333"};
`;

const SectionHeading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text || "#333"};
`;

// Text List styling
const List = styled.ul`
  padding-left: 0;
  list-style-type: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.projectDescription || "rgba(70, 70, 70, 0.76)"};
`;

const ListItem = styled.li`
  margin-bottom: 4px;
`;

// Hero image wrapper and image styles
const ImageWrapper = styled.div`
  margin-top: 0;
  text-align: center;
  cursor: pointer;
`;

const Image = styled.img`
  width: 100%;
  max-width: 340px;
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

const Caption = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text || "#444"};
  text-align: center;
  margin-top: 0rem;
  max-width: 600px;
`;

// InfoSection and blocks
const InfoSection = styled.section`
  margin-top: 4rem;
  padding: 1.25rem 0rem;
  border-radius: 12px;
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;

  @media (min-width: 480px) {
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
  flex-basis: 100%;
  min-width: 120px;

  @media (min-width: 480px) {
    flex-basis: auto;
    flex-grow: 0;
  }
`;

const InfoHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.accent || "#82c91e"};
  color: white;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 300;
  white-space: nowrap;
`;

// Sections (overview + 4 content blocks)
const BaseSection = styled.section`
  padding: 2rem;
  border-radius: 12px;
  margin-top: 4rem;
  color: ${({ theme }) => theme.text};
`;

const SectionOverview = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgOverview || "#f0f0f0"};
`;

const SectionOne = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgOne || "#e0e0e0"};
`;

const SectionTwo = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgTwo || "#d0d0d0"};
`;

const SectionThree = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgThree || "#c0c0c0"};
`;

const SectionFour = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgFour || "#b0b0b0"};
`;

// Paragraphs with color backgrounds
const ParagraphOverview = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  padding: 0rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.sectionBgOverview || "#f0f0f0"};
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
  box-shadow: none;
`;

const ParagraphOne = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  padding: 0rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.paragraphBgOne || "#e9e9e9"};
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
`;

const ParagraphTwo = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgTwo || "#d9d9d9"};
`;

const ParagraphThree = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgThree || "#c9c9c9"};
`;

const ParagraphFour = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgFour || "#b9b9b9"};
`;

// SectionOneContent flex container
const SectionOneContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SurveyImage = styled.img`
  width: 100%;
  max-width: 200px;
  border-radius: 16px;
  object-fit: cover;
  margin-top: 2rem;
  cursor: pointer;
  gap: 1rem;
  margin-right: 4rem;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.01);
    transition: border 0.3s ease, transform 0.3s ease;
  }
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  background: white;

  @media (min-width: 768px) {
    border-radius: 8px;
  }
`;

// CTA Buttons
const CTAWrapper = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg || "#82c91e"};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg || "#5a7d12"};
    color: white;
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg || "#82c91e"};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  margin-right: 16px;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg || "#5a7d12"};
    color: white;
  }
`;

export default function WeddingMate() {
  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, []);

  const [modalSrc, setModalSrc] = useState(null);

  const openModal = (src) => setModalSrc(src);
  const closeModal = () => setModalSrc(null);

  return (
    <ProjectLayout
      title="Wedding Mate"
      tagline="A personalised wedding planning platform that simplifies coordination for couples and guests."
      titleLink="https://www.figma.com/proto/pnB9iOaa9tQIPrnxkEpPHV/Big-day-App?node-id=93-407&t=bmNGashJ7klz9i07-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=325%3A3392"
    >
      <ContentRow>
        <RolesColumn>
          <SectionTitle>Roles & Deliverables</SectionTitle>
          <Columns>
            <Column>
              <SectionTitle as="h3" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
                Design
              </SectionTitle>
              <List>
                <ListItem>Wireframing</ListItem>
                <ListItem>UI Design</ListItem>
                <ListItem>Prototyping</ListItem>
              </List>
            </Column>
           
          </Columns>
        </RolesColumn>

        <HeroColumn>
          <a href="https://www.figma.com/proto/pnB9iOaa9tQIPrnxkEpPHV/Big-day-App?node-id=93-407&t=bmNGashJ7klz9i07-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=325%3A3392" target="_blank" rel="noopener noreferrer">
            <ImageWrapper>
              <Image src={weddingHero} alt="Wedding Mate Preview" />
              <Caption>Click to view the Figma prototype.</Caption>
            </ImageWrapper>
          </a>
        </HeroColumn>
      </ContentRow>

      <InfoSection>
        <InfoBlock>
          <InfoHeading>Industry</InfoHeading>
          <TagsWrapper>
            <Tag>Event Planning</Tag>
            <Tag>Hospitality</Tag>
          </TagsWrapper>
        </InfoBlock>
        <InfoBlock>
          <InfoHeading>Year</InfoHeading>
          <TagsWrapper>
            <Tag>2024</Tag>
          </TagsWrapper>
        </InfoBlock>
        <InfoBlock>
          <InfoHeading>My Involvement</InfoHeading>
          <TagsWrapper>
            <Tag>UI Design</Tag>
            <Tag>Prototyping</Tag>
          </TagsWrapper>
        </InfoBlock>
      </InfoSection>

      <SectionOverview>
        <SectionHeading>Overview</SectionHeading>
        <ParagraphOverview>
          Wedding Mate is a personalised event coordination app that simplifies wedding planning through collaborative features and streamlined communication between couples and their guests. This Figma prototype emphasises guest connection and provides clear access to wedding details - all in one place.
        </ParagraphOverview> 
        <SurveyImage
            src={wireframe1}
            alt="App Screen one"
            onClick={() => openModal(wireframe1)}
          />
          <SurveyImage
            src={wireframe2}
            alt="App Screen two"
            onClick={() => openModal(wireframe2)}
          />
           <SurveyImage
            src={wireframe3}
            alt="App Screen three"
            onClick={() => openModal(wireframe3)}
          />
           <SurveyImage
            src={wireframe4}
            alt="App Screen Four"
            onClick={() => openModal(wireframe4)}
          />
      </SectionOverview>

      <SectionOne>
        <SectionHeading>The Problem</SectionHeading>
        <SectionOneContent>
          <ParagraphOne>
            Planning a wedding involves many moving parts and often leads to miscommunication and stress. Couples needed a centralised place to manage RSVPs and share wedding details. This wireframe shows initial planning concepts.
          </ParagraphOne>
         
        </SectionOneContent>
      </SectionOne>

      <SectionTwo>
        <SectionHeading>User Insights</SectionHeading>
        <ParagraphTwo>
          Research revealed that users prioritized seamless communication, easy RSVP management, and the ability to customize timelines. We synthesised this into key app priorities.
        </ParagraphTwo>
      </SectionTwo>

      <SectionThree>
        <SectionHeading>Solution</SectionHeading>
        <ParagraphThree>
          Wedding Mate delivers a user-friendly dashboard with customizable checklists, live calendar syncing, and personalized themes. Users can collaborate with their partner in real-time and invite guests with ease.
        </ParagraphThree>
      </SectionThree>

      <SectionFour>
        <SectionHeading>Reflection</SectionHeading>
        <ParagraphFour>
          This project taught me the importance of inclusive design and building features that genuinely reduce friction during high-stress moments. Working closely with real couples helped ground every UX choice in empathy.
        </ParagraphFour>
      </SectionFour>

      <CTAWrapper>
        <BackButton to="/logoDesign">← Back</BackButton>
        <CTAButton to="/tusFitness">View Next Project →</CTAButton>
      </CTAWrapper>

      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <ModalImage src={modalSrc} alt="Enlarged View" />
        </ModalOverlay>
      )}
    </ProjectLayout>
  );
}
