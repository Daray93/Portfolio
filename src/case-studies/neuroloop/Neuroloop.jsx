import React, { useState, useRef, useEffect } from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
  CaseStudyMorphMedia,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import styled from "styled-components";

// Assets
import neuroloopTeaser from "./assets/NeuroloopTeaser.mp4";
import Survey1 from "./assets/Survey1.png";
import Survey2 from "./assets/Survey2.png";
import Survey3 from "./assets/Survey3.png";
import Competitor1 from "./assets/Competitor1.png";
import projectArchitecture from "./assets/ProjectArchitecture.png";
import webAppArchitecture from "./assets/WebAppArchitecture.png";
import vrAppArchitecture from "./assets/VrAppArchitecture.png";
import soundDesign from "./assets/SoundDesign.png";
import hook from "./assets/NeuroloopVRDemo.mp4";
import WebAppDemo from "./assets/NeuroloopWebAppDemo.mp4";
import { FiClock, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import ResultsCarousel from "../../components/shared/ResultsCarousel";
import { FiFileText } from "react-icons/fi";
import { GiBrain } from "react-icons/gi"; // Using Game Icons for brain outline

/* ---------- Shared styles ---------- */
const Paragraph = styled.p`
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Callout = styled.div`
  padding: 1.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.95rem;
  line-height: 1.45;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.radius.md};
  object-fit: cover;
  cursor: none;
`;

const Video = styled.video`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};

  @media (max-width: 768px) {
    border-radius: ${({ theme }) => theme.radius.sm};
  }
`;

const IconRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

/* ---------- Modal ---------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.body};
`;

const CloseButton = styled.button`
  position: absolute;
  top: -44px;
  right: 0;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: none;
`;

/* ---------- Role / Pills ---------- */
const RoleContainer = styled.div`
  font-size: 1.05rem;
  line-height: 1.55;
  margin: ${({ theme }) => `${theme.space[4]} 0 0 0`};
  color: ${({ theme }) => theme.text};
`;

const RoleHeading = styled.h3`
  margin: 0 0 ${({ theme }) => theme.space[3]} 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[2]};
`;

const Pill = styled.span`
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[3]}`};
  border-radius: 999px;
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
`;

/* ---------- Media Card ---------- */
const MediaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

/* ---------- Solution Container (Hero videos) ---------- */
const SolutionContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: stretch;
  padding: 1.5rem;
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.xl};
  flex-wrap: wrap;

  > * {
    flex: 1 1 280px;
  }
`;

const VideoWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  video {
    width: 100%;
    border-radius: ${({ theme }) => theme.radius.md};
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 1.5rem;

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.text};
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    color: ${({ theme }) => theme.text};
  }
`;

/* ---------- Styled Components for Personas ---------- */
const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PersonaCard = styled.div`
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 1.5rem;

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.text};
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    color: ${({ theme }) => theme.text};
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.buttonPrimaryBg};
  font-family: "Manrope", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.buttonPrimaryText};
  background: ${({ theme }) => theme.buttonPrimaryBg};
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonPrimaryHover};
    border-color: ${({ theme }) => theme.buttonPrimaryHover};
    color: ${({ theme }) => theme.buttonPrimaryHoverText};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const CTAButtonSecondary = styled(CTAButton)`
  background: ${({ theme }) => theme.buttonSecondaryBg};
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  color: ${({ theme }) => theme.buttonSecondaryText};
  box-shadow: ${({ theme }) => theme.shadowSm};

  &:hover {
    background: ${({ theme }) => theme.surfaceSubtle};
    color: ${({ theme }) => theme.accent};
    border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  }
`;


/* ---------- Neuroloop Case Study ---------- */
export default function NeuroloopCaseStudy() {
  const [modalSrc, setModalSrc] = useState(null);
  const lastActiveRef = useRef(null);

  const openModal = (src) => {
    lastActiveRef.current = document.activeElement;
    setModalSrc(src);
  };

  const closeModal = () => {
    setModalSrc(null);
    lastActiveRef.current?.focus?.();
  };

  useEffect(() => {
    if (!modalSrc) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [modalSrc]);

  return (
    <>
      <CaseStudyLayout
        sections={[
          { id: "solution", label: "What I Did" },
          { id: "problem", label: "The Problem" },
          { id: "research", label: "How I Researched" },
          { id: "design", label: "The Design" },
          { id: "outcomes", label: "Project Outcomes" },
        ]}
        morphId="morph-neuroloop"
      >
        <CaseStudyPage>

          {/* ---------- 01 Solution ---------- */}
          <CaseStudySection id="solution">
            <CaseStudyMorphMedia morphId="morph-neuroloop" video={neuroloopTeaser} />

            <CaseStudyHero
              title="Neuroloop"
              subtitle="Learn how social media shapes your brain"
            >
              <Paragraph>
                <strong>Neuroloop is an AI-powered VR learning experience</strong>{" "}
                designed to help students grasp how social media affects attention, emotion, and behaviour.
              </Paragraph>

              {/* Recommended: add a visual showing VR headset interaction or overview diagram */}
              <PillRow>
                <Pill>2025</Pill>
                <Pill>Educational Tech</Pill>
                <Pill>Figma</Pill>
                <Pill>Spline</Pill>
                <Pill>Web App</Pill>
                <Pill>3D AI Avatar</Pill>
                <Pill>Convai</Pill>
                <Pill>VR Design</Pill>
                <Pill>VR Dev</Pill>
                <Pill>Unity</Pill>
              </PillRow>

              
                
              <ResultsCarousel
              items={[
                { type: "video", src: hook },
                { type: "video", src: WebAppDemo },
              ]}
              openModal={openModal}
              stackVideosOnMobile={true}
            />
              
              <ButtonWrapper>
              <CTAButton
                href="https://neuroloop-13690.web.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Neuroloop Web App<GiBrain size={20} />
                
              </CTAButton>

              <CTAButtonSecondary
                href="/NeuroloopReport.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Project Report<FiFileText size={20} />
                
              </CTAButtonSecondary>
            </ButtonWrapper>
            </CaseStudyHero>

            <RoleContainer>
            
            <RoleHeading>My Role</RoleHeading>
            I led Neuroloop from concept to completion, designing every interaction, interface, and flow while developing both the VR and web applications. From prototyping in Unity to shaping AI-driven 3D avatars in Spline and Convai, every part of the project passed through my hands.  

            <br /><br />

            My focus was on design. I aimed for an intuitive and engaging experience that made complex neuroscience clear and memorable. Research and user testing guided each iteration, helping me refine the flows and visual storytelling so students could explore and understand in a way that felt natural, focused, and enjoyable.  

            <br /><br />
            {/* Recommendation: add visuals here showing early wireframes or interface mockups to reinforce your hands-on design leadership */}
          </RoleContainer>
          </CaseStudySection>

          {/* ---------- 02 Problem ---------- */}
          <CaseStudySection id="problem" title="Problem">
            <Paragraph>
              Students spend hours on social media, yet there’s very little formal education about its effects on the brain. 
              Many are unaware of how scrolling shapes attention, emotion, and reflection. 
              These three key metrics highlight the scale of the issue:
            </Paragraph>

            <UserGrid>
              <UserCard>
                <FiClock size={28} />
                <h4>Average Daily Usage</h4>
                <p>Students spend on average 3.5 hours per day on social media, often without noticing its effect on focus and productivity.</p>
              </UserCard>

              <UserCard>
                <FiTrendingUp size={28} />
                <h4>Emotional Fluctuations</h4>
                <p>70% of surveyed students reported mood swings after extended scrolling sessions, showing a clear impact on emotional regulation.</p>
              </UserCard>

              <UserCard>
                <FiAlertCircle size={28} />
                <h4>Limited Awareness</h4>
                <p>Only 20% of students felt they understood how social media affects attention and learning, highlighting a major knowledge gap.</p>
              </UserCard>
            </UserGrid>
          </CaseStudySection>

          {/* ---------- 03 Research ---------- */}
          <CaseStudySection id="research" title="Research">
            <Paragraph>
              To create an engaging VR/Web App learning experience, I needed to understand how students interact with social media, what motivates them, and how they process complex scientific content. Surveys, interviews, and competitor analysis revealed behaviours, needs, and pain points, guiding the design of Neuroloop.
            </Paragraph>

            {/* ---------- Student Personas ---------- */}
            <Paragraph style={{ marginTop: "2rem", marginBottom: "1rem", fontWeight: "600" }}>
              Key User Personas
            </Paragraph>

            <PersonaGrid>
              <PersonaCard>
                <h4>Active Social Learner</h4>
                <p>
                  Aged 16–18, spends hours online daily. Curious about science but struggles to maintain focus. Prefers interactive, visual, and reflective learning experiences that keep attention engaged.
                </p>
              </PersonaCard>

              <PersonaCard>
                <h4>Casual Observer</h4>
                <p>
                  Aged 16–18, uses social media mainly to connect with friends. Less motivated by scientific content, requiring clear explanations and guided reflections to understand complex topics.
                </p>
              </PersonaCard>
            </PersonaGrid>

            {/* ---------- Research Carousel ---------- */}
            <Paragraph style={{ marginTop: "2rem", marginBottom: "1rem", fontWeight: "600" }}>
              Research Artifacts
            </Paragraph>

            <ResultsCarousel images={[Survey1, Survey2, Survey3, Competitor1]} onClick={openModal} />

            {/* ---------- Key Insight ---------- */}
            <Callout style={{ marginTop: "1.5rem" }}>
              Most students were unaware of how scrolling affects attention and mood. This confirmed a significant knowledge gap that Neuroloop could address through immersive learning.
            </Callout>
          </CaseStudySection>

          {/* ---------- 04 Design ---------- */}
          <CaseStudySection id="design" title="Design">
            <Paragraph>
              I focused on designing VR flows that made dopamine, attention, and emotional responses visible and interactive.
              {/* Recommendation: include VR interface screenshots, architecture diagrams */}
            </Paragraph>

            <IconRow>
              {[projectArchitecture, webAppArchitecture, vrAppArchitecture, soundDesign].map(
                (img, i) => (
                  <MediaCard key={i} onClick={() => openModal(img)}>
                    <Image src={img} alt={`Design ${i + 1}`} />
                  </MediaCard>
                )
              )}
            </IconRow>

            <Callout>
              Technologies supporting design: Unity, Figma, Spline, Convai, VR APIs.
            </Callout>
          </CaseStudySection>

          {/* ---------- 05 Outcomes ---------- */}
          <CaseStudySection id="outcomes" title="Outcomes">
            <Paragraph>
              Neuroloop shows that immersive VR design can make abstract neuroscience tangible.
            </Paragraph>
            <Paragraph>
              User testing confirmed the clarity of interactions, engagement, and comprehension.
              {/* Recommendation: add a visual showing key results or engagement metrics */}
            </Paragraph>
          </CaseStudySection>

        </CaseStudyPage>

        <OtherProjects currentProjectId="neuroloop" />
      </CaseStudyLayout>

      {/* ---------- Modal ---------- */}
      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeModal}>×</CloseButton>
            <ModalImage src={modalSrc} alt="Preview" />
          </div>
        </ModalOverlay>
      )}
    </>
  );
}