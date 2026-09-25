import React, { useState, useRef, useEffect } from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import styled from "styled-components";

// Assets
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
import FinalYearProjectReport from "./assets/FinalYearProjectReport.pdf";
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
  cursor: pointer;
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
  cursor: pointer;
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
  border-radius: ${({ theme }) => theme.radius.btn};
  border: 1px solid ${({ theme }) => theme.buttonPrimaryBg};
  font-family: "Geist", sans-serif;
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
          { id: "overview", label: "Overview" },
          { id: "problem", label: "Problem" },
          { id: "goal", label: "Goal" },
          { id: "process", label: "Process" },
          { id: "outcomes", label: "Outcomes" },
        ]}
      >
        <CaseStudyPage>

          {/* ---------- 01 Overview ---------- */}
          <CaseStudySection id="overview" title="Overview" tldrVisible>
            <CaseStudyHero
              title="Neuroloop"
              subtitle="Learn how social media shapes your brain"
            >
              <Paragraph>
                <strong>Neuroloop is an AI-powered VR learning experience</strong>{" "}
                designed to help students grasp how social media affects attention, emotion, and behaviour.
              </Paragraph>

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
              fullWidthSlides={true}
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
                href={FinalYearProjectReport}
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
          <CaseStudySection
            id="problem"
            title="Problem"
            tldr="Students spend hours a day on social media with almost no formal education about what it's doing to their attention and mood -- most can't make an informed choice about their own habits, only an unconscious one."
          >
            <Paragraph>
              Students spend hours on social media, yet there's very little formal
              education about its effects on the brain. Most have no idea how
              scrolling reshapes their own attention, emotion, and ability to
              reflect — which means they can't make an informed choice about their
              own habits, only an unconscious one. Three numbers make the scale of
              that gap concrete:
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

          {/* ---------- 03 Goal ---------- */}
          <CaseStudySection
            id="goal"
            title="Goal"
            tldr="Make the invisible effects of social media experiential instead of explained -- a VR/AI experience students feel and interact with, since a knowledge gap this behavioural wasn't going to close through more reading."
          >
            <Paragraph>
              Traditional education wasn't moving this number — lectures and text
              explain attention and dopamine in the abstract, which is exactly the
              kind of information students already tune out while scrolling. The
              strategy was to make the effect experiential instead: put students
              inside a VR environment where they could see and feel how a feed
              manipulates attention and mood in real time, then reinforce it
              through an AI-voiced avatar that could respond and explain rather
              than just narrate.
            </Paragraph>
            <Paragraph>
              That's why the build leaned so heavily on VR, Spline, and Convai
              rather than a simpler web explainer: the whole bet was that an
              experiential medium would land where a written one hadn't — and that
              only holds if the experience itself is polished enough to actually
              hold attention rather than lose it, the same failure mode as the
              apps it's teaching students about.
            </Paragraph>
          </CaseStudySection>

          {/* ---------- 04 Process ---------- */}
          <CaseStudySection
            id="process"
            title="Process"
            tldr="Surveys, interviews, and competitor analysis shaped two student personas and confirmed the knowledge gap firsthand; from there, VR flows, a web app, and AI-voiced 3D avatars were built and iterated through user testing."
            tldrMedia={
              <MediaCard onClick={() => openModal(Survey1)}>
                <Image src={Survey1} alt="Student survey results on social media habits" />
              </MediaCard>
            }
          >
            <Paragraph>
              To create an engaging VR/web app learning experience, I needed to
              understand how students interact with social media, what motivates
              them, and how they process complex scientific content. Surveys,
              interviews, and competitor analysis surfaced real behaviours, needs,
              and pain points, grounding the goal above in more than a hunch.
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

            <Paragraph style={{ marginTop: "2rem" }}>
              From there the work moved into design: VR flows built to make
              dopamine, attention, and emotional responses visible and
              interactive rather than explained in a slide. The harder problem
              wasn't drawing a clean interface — it was translating an invisible
              physiological effect into something a student could actually watch
              happen to them.
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
          <CaseStudySection
            id="outcomes"
            title="Outcomes"
            tldr="Both the VR and web experiences shipped and tested well for clarity and engagement -- but with no structured before/after comprehension check, whether it actually taught the material better than a written explanation is still unverified, not confirmed."
          >
            <Paragraph>
              Neuroloop shipped: both the VR build and a public web app (linked
              above) exist and work, and iterative user testing — watching real
              students move through the flows and adjusting whatever confused or
              lost them — shaped every round of design. That much of the goal was
              met: the experience is immersive, and people engaged with it rather
              than tuning it out.
            </Paragraph>
            <Paragraph>
              What I can't honestly claim is that it worked as education. User
              testing confirmed the experience was clear and engaging, which is a
              real result, but a weaker one than proving comprehension actually
              improved. There was no structured before/after check on what
              students understood about social media's effects on attention and
              mood before versus after using it, so the core bet — that an
              experiential medium teaches this better than a written one — is
              still unverified, not confirmed. The one hint I do have is
              anecdotal, not data: a classmate who replayed the level and
              retook the quiz seemed to do noticeably better the second time,
              but I never captured that systematically, so it's an
              observation, not evidence. If I ran this again, I'd build a
              lightweight pre/post comprehension check in from day one: "people
              found it engaging" and "people understood more afterward" are very
              different claims, and only one of them is what Neuroloop actually
              set out to prove.
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