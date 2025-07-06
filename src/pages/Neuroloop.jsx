// pages/ProjectTwo.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import ProjectLayout from "../components/ProjectLayout";
import neuroloop from "../assets/neuroloop.png";
import WordCloud from "../assets/WordCloud.svg";
import GoogleForms from "../assets/GoogleForms.svg";
import GoogleForms2 from "../assets/GoogleForms2.svg";
import neuroloop2 from "../assets/neuroloop2.png";


// Layout
const Content = styled.main`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Text = styled.section`
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 500;
  margin: 0px;
`;

const List = styled.ul`
  padding-left: 0px;
  list-style-type: none;
  font-size: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 4px;
  color: ${({ theme }) => theme.projectDescription || "rgba(70, 70, 70, 0.76)"};
`;

const ImageWrapper = styled.aside`
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Image = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  margin-bottom: 2rem;
  aspect-ratio: 16 / 9;
  border: 2px solid transparent;
  transition: border 0.3s ease, transform 0.3s ease;

  &:hover {
    border: 2px solid ${({ theme }) => theme.accent || "#82c91e"};
    transform: scale(1.05);
  }
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

const BackButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  margin-right: 16px; /* Add some spacing to separate the buttons */
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: white;
  }
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

const SectionHeading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

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
  background-color: ${({ theme }) => theme.sectionBgOne};
`;

const SectionTwo = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgTwo};
`;

const SectionThree = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgThree};
`;

const SectionFour = styled(BaseSection)`
  background-color: ${({ theme }) => theme.sectionBgFour};
`;

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
  background-color: ${({ theme }) => theme.paragraphBgOne};
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
`;

const ParagraphTwo = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgTwo};
`;

const ParagraphThree = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgThree};
`;

const ParagraphFour = styled(ParagraphOne)`
  background-color: ${({ theme }) => theme.paragraphBgFour};
`;

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
  max-width: 400px;
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
    border: 2px solid ${({ theme }) => theme.accent || "#82c91e"};
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

  @media (min-width: 768px){
    border-radius: 8px;
  }
`;

const StyledVideo = styled.iframe`
  width: 100%;
  max-width: 400px;
  height: 225px; /* 16:9 aspect ratio for 400px width */
  border-radius: 16px;
  margin-top: 2rem;
  margin-right: 4rem;
  border: 2px solid transparent;
  &:hover {
  transform: scale(1.01);
    border: 2px solid ${({ theme }) => theme.accent || "#82c91e"};
    transition: border 0.3s ease, transform 0.3s ease;
  @media (max-width: 768px) {
    height: 200px;
    margin-right: 0;
    overflow: hidden;
    
  }
`;

const Caption = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text || "#444"};
  text-align: center;
  margin-top: 0rem;
  max-width: 400px;
`;

export default function ProjectTwo() {
  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, []);

  const [modalSrc, setModalSrc] = useState(null);

  const openModal = (src) => {
    setModalSrc(src);
  };

  const closeModal = () => {
    setModalSrc(null);
  };

  return (
    <ProjectLayout
      title="Neuroloop"
      tagline="An app that educates users on how social media impacts the brain."
      titleLink="https://neuroloop-13690.web.app/"
    >
      <Content>
        <Text>
          <SectionTitle>Roles & Deliverables</SectionTitle>
          <Columns>
            <Column>
              <SectionTitle
                as="h3"
                style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
              >
                Design
              </SectionTitle>
              <List>
                <ListItem>UX research</ListItem>
                <ListItem>UI design</ListItem>
                <ListItem>Design system</ListItem>
                <ListItem>Interactive prototyping</ListItem>
              </List>
            </Column>
            <Column>
              <SectionTitle
                as="h3"
                style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}
              >
                Development
              </SectionTitle>
              <List>
                <ListItem>Responsive Web app</ListItem>
                <ListItem>VR app</ListItem>
                <ListItem>Firebase for auth & real-time data</ListItem>
                <ListItem>ChatGPT API + Convai integration</ListItem>
              </List>
            </Column>
          </Columns>
        </Text>

        <a
          href="https://neuroloop-13690.web.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ImageWrapper>
          <div>
            <Image src={neuroloop} alt="Neuroloop Preview" />
            <Caption>Click to check out the web app.</Caption>
          </div>
        </ImageWrapper>
        </a>
      </Content>

      <InfoSection>
        <InfoBlock>
          <InfoHeading>Industry</InfoHeading>
          <TagsWrapper>
            <Tag>Education</Tag>
            <Tag>Healthcare</Tag>
          </TagsWrapper>
        </InfoBlock>
        <InfoBlock>
          <InfoHeading>Year</InfoHeading>
          <TagsWrapper>
            <Tag>2025</Tag>
          </TagsWrapper>
        </InfoBlock>
        <InfoBlock>
          <InfoHeading>My Involvement</InfoHeading>
          <TagsWrapper>
            <Tag>UX Research</Tag>
            <Tag>UI Design</Tag>
            <Tag>Front-end Dev</Tag>
            <Tag>VR Development</Tag>
          </TagsWrapper>
        </InfoBlock>
      </InfoSection>

      <SectionOverview>
        <SectionHeading>Overview</SectionHeading>
        <ParagraphOverview>
          Neuroloop is a VR experience paired with a companion web app, designed to
          raise awareness about how social media impacts the brain. Together, they
          help students build healthier digital habits through immersive storytelling
          and research-driven design.
        </ParagraphOverview>
      </SectionOverview>

      <SectionOne>
        <SectionHeading>The Challenge</SectionHeading>
        <SectionOneContent>
          <ParagraphOne>
            Today, many people, particularly students, are unaware of or unequipped
            to manage how social media influences their brains, decisions, and
            emotional well-being. This project set out to raise awareness and spark
            more mindful digital habits. This Word Cloud of user feedback highlights
            key concerns.
          </ParagraphOne>
           <SurveyImage
          src={WordCloud}
          alt="Word Cloud visual"
          onClick={() => openModal(WordCloud)}
        />
        </SectionOneContent>
      </SectionOne>

      <SectionTwo>
        <SectionHeading>Discovery</SectionHeading>
        <ParagraphTwo>
          Based on insights gathered from Google Forms surveys and secondary
          research, users reported frequently using social media during activities
          such as driving, watching TV, and engaging in other daily tasks. Many
          admitted to spending more time on social media than they initially
          intended, highlighting a common struggle with self-regulation. These
          findings played a critical role in shaping the app’s feature priorities,
          emphasising the need for tools that promote mindful usage and digital
          well-being.
        </ParagraphTwo>
        <SurveyImage
          src={GoogleForms}
          alt="Google Forms Survey visual"
          onClick={() => openModal(GoogleForms)}
        />
        <SurveyImage
          src={GoogleForms2}
          alt="Google Forms Survey visual"
          onClick={() => openModal(GoogleForms2)}
        />
      </SectionTwo>

      <SectionThree>
        <SectionHeading>User Journey</SectionHeading>
        <ParagraphThree>
          Neuroloop guides users through an immersive VR experience designed to raise awareness about social media's impact on the brain. 
          The journey unfolds through interactive storytelling, narrated scenes, and guided reflection. At any point, users can engage with 
          an AI-powered avatar to ask questions and explore topics related to neuroscience and digital wellness, making the experience both 
          personalised and educational.
  </ParagraphThree>
        <SurveyImage
                src={neuroloop2}
                alt="UserJourney visual"
                onClick={() => openModal(neuroloop2)}
              />
          <StyledVideo
      src="https://www.youtube.com/embed/NIdZXaMN8Hc"
      title="Neuroloop VR Experience"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />



      </SectionThree>

      <SectionFour>
        <SectionHeading>Reflection</SectionHeading>
        <ParagraphFour>
          Working on Neuroloop deepened my understanding of cross-platform design,
          especially aligning web and VR UX patterns. I also learned a lot about user
          motivation in educational apps and how to effectively use conversational AI
          tools.
        </ParagraphFour>
      </SectionFour>

      <CTAWrapper>
        <BackButton to="/aoede">← Back</BackButton>
        <CTAButton to="/logoDesign">View Next Project →</CTAButton>
      </CTAWrapper>


      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <ModalImage src={modalSrc} alt="Enlarged Survey" />
        </ModalOverlay>
      )}
      
    </ProjectLayout>
  );
}
