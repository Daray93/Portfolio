import React, { useState, useRef, useEffect } from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";
import styled from "styled-components";

// Assets
import kroptProcess from "./assets/KroptProcess.png";
import kroptFarmTasks from "./assets/KroptFarmTasks.png";
import kroptHeader from "./assets/KroptHeader.png";
import kroptFlow from "./assets/KroptUserFlow.png";
import kroptWireframes from "./assets/KroptWireframes.png";
import kroptHome from "./assets/KroptHome.png";
import kroptSoilHealth from "./assets/KroptSoilHealth.png";
import kroptDemoVideo from "./assets/KroptVideo.mp4";
import OtherProjects from "../../components/shared/OtherProjects";
import ResCarousel from "../../components/shared/ResultsCarousel";

/* ---------- Shared styles ---------- */

const Paragraph = styled.p`
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: ${({ theme }) => theme.radius.md};
  object-fit: cover;
`;

const VideoContainer = styled.div`
  display: flex;
  justify-content: center;
  background: #151819;
  padding: ${({ theme }) => theme.space[4]};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Video = styled.video`
  width: 50%;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  justify-self: center;
  align-self: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Callout = styled.div`
  padding: ${({ theme }) => `${theme.space[4]} ${theme.space[5]}`};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.95rem;
  line-height: 1.45;
`;

/* ---------- Modal ---------- */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  border-radius: ${({ theme }) => theme.radius.lg};
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

/* ---------- Responsive solution container ---------- */

const SolutionContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space[5]};
  justify-content: center;
  align-items: stretch;
  padding: ${({ theme }) => theme.space[5]};
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.lg};

  > * {
    flex: 1;
    max-width: 400px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.space[4]};

    > * {
      max-width: 100%;
    }
  }
`;

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

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.space[5]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.space[4]};
  }
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.space[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

/* ---------- Media card ---------- */

const MediaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[2]};
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.space[7]};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space[3]};
  }
`;

const Caption = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.4;
  margin-top: ${({ theme }) => theme.space[2]};
  padding: ${({ theme }) => theme.space[5]};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.body};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space[3]};
  }
`;

/* ---------- Page ---------- */

export default function KroptCaseStudy() {
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
          { id: "user", label: "The User" },
          { id: "vision", label: "Vision" },
          { id: "proof", label: "Proof of Concept" },
          { id: "challenges", label: "Challenges / Insights" },
          { id: "results", label: "Results" },
        ]}
      >
        <CaseStudyPage>

          {/* ---------- Overview ---------- */}
          <CaseStudySection id="overview" title="Overview">
            <CaseStudyHero
              title="Kropt"
              subtitle="Farm smarter and more sustainably"
            >
              <Paragraph>
                <strong>Kropt is a mobile app concept</strong> exploring how farmers
                could track soil health, livestock wellbeing, and crop yields in one
                practical, unified system. It focuses on mobile-first, offline-capable
                workflows built for real farm conditions.
              </Paragraph>

              <PillRow>
                <Pill>2025</Pill>
                <Pill>UX / UI</Pill>
                <Pill>Figma</Pill>
                <Pill>Mobile first</Pill>
                <Pill>Agri Tech</Pill>
              </PillRow>

              <SolutionContainer>
                <VideoContainer>
                  <Video autoPlay loop muted playsInline>
                    <source src={kroptDemoVideo} type="video/mp4" />
                  </Video>
                </VideoContainer>

                <Image
                  src={kroptHeader}
                  alt="Kropt header screen"
                  data-cursor="zoom"
                  onClick={() => openModal(kroptHeader)}
                />
              </SolutionContainer>
            </CaseStudyHero>

            <RoleContainer>
              <RoleHeading>My Role</RoleHeading>
              I led the UX research and UX UI design from early discovery to high fidelity prototypes. This included speaking with farmers, mapping real
              fidelity prototypes. This included speaking with farmers, mapping real
              world workflows, and creating practical interfaces that are clear,
              usable, and built to support real farm work rather than just look good.
            </RoleContainer>
          </CaseStudySection>

          {/* ---------- The User ---------- */}
          <CaseStudySection id="user" title="The User">
            <Paragraph>
              Kropt is built for small to medium regenerative farmers who care deeply
              about the long term health of their land. They work hands on, rely on
              experience and observation, and value tools that fit naturally into
              daily farm life.
            </Paragraph>

            <UserGrid>
              <UserCard>
                <h4>How they work</h4>
                <p>
                  Farmers spend their days outdoors, moving between fields, sheds,
                  and livestock. They rely on memory, notebooks, and routines refined
                  over years. Technology only matters if it fits seamlessly into
                  these flows.
                </p>
              </UserCard>

              <UserCard>
                <h4>Pain points</h4>
                <p>
                  Records are scattered across paper, spreadsheets, and multiple
                  tools. This makes it hard to see patterns over time, plan ahead, or
                  know whether regenerative practices are working.
                </p>
              </UserCard>

              <UserCard>
                <h4>What matters to them</h4>
                <p>
                  Farmers want to improve soil, support animal welfare, and leave the
                  land better than they found it. They value clarity and confidence
                  in decisions without adding extra admin to what are already long days.
                </p>
              </UserCard>
            </UserGrid>

            <Callout>
              These farmers are not seeking complex software. They want a simple,
              reliable system that fits real farm work and quietly builds
              understanding over time.
            </Callout>
          </CaseStudySection>

          {/* ---------- Vision ---------- */}
          <CaseStudySection id="vision" title="Vision">
            <Paragraph>
              Kropt was designed to feel calm, practical, and trustworthy. 
            </Paragraph>

            <Paragraph>
              The interface focuses on fast daily actions and clear visual feedback.
              Instead of isolated numbers, it shows patterns and insights that help
              farmers understand what needs to be done, and to make better decisions over time.
            </Paragraph>

            <Paragraph>
              Farmers rise early to milk cows and often finish late doing the same.
              Screens must be legible in dim light yet readable in bright daylight.
            </Paragraph>

            <Paragraph>
              Dark mode reduces glare during long days. Strong contrast, large touch
              targets, and clear hierarchy make the system reliable, usable, and
              trustworthy.
            </Paragraph>

            <MediaCard>
              <Image
                src={kroptProcess}
                alt="User flow showing daily logging leading to long term insight"
                data-cursor="zoom"
                onClick={() => openModal(kroptProcess)}
              />
              <Caption>
                Here is the process I undertook to design Kropt, starting with understanding the user and their needs, then defining a clear vision, creating a proof of concept, and finally reflecting on challenges and results.
              </Caption>
            </MediaCard>

            <MediaCard>
              <Image
                src={kroptHome}
                alt="Home screen showing calm summaries and daily priorities"
                data-cursor="zoom"
                onClick={() => openModal(kroptHome)}
              />
              <Caption>
                The home screen summarises the farm day, showing priorities and
                progress without overwhelming the user.
              </Caption>
            </MediaCard>

            <MediaCard>
              <Image
                src={kroptSoilHealth}
                alt="Soil health analytics showing trend insights"
                data-cursor="zoom"
                onClick={() => openModal(kroptSoilHealth)}
              />
              <Caption>
                Soil health analytics reveal trends over time while keeping daily
                input simple and fast.
              </Caption>
            </MediaCard>

            <Callout>
              Design principles: clarity over density, consistency over novelty, and
              feedback over guesswork.
            </Callout>
          </CaseStudySection>

          {/* ---------- Proof of Concept ---------- */}
          <CaseStudySection id="proof" title="Proof of Concept">
            <Paragraph>
              The proof of concept tested how soil, livestock, and crop data could
              come together in a single, practical system. Early wireframes explored
              modular cards for quick daily logging with optional deeper insights.
            </Paragraph>

            <MediaCard>
              <Image
                src={kroptWireframes}
                alt="Wireframes showing modular card approach for logging farm data"
                data-cursor="zoom"
                onClick={() => openModal(kroptWireframes)}
              />
              <Caption>
                Wireframes explored modular cards for daily input and long term
                tracking, balancing speed with depth.
              </Caption>
            </MediaCard>

            <Paragraph>
              A complete user flow validated navigation, hierarchy, and transitions.
              Logging activities, reviewing trends, and discovering insights needed
              to feel natural and efficient.
            </Paragraph>

            <MediaCard>
              <Image
                src={kroptFlow}
                alt="User flow showing logging to insight journey"
                data-cursor="zoom"
                onClick={() => openModal(kroptFlow)}
              />
              <Caption>
                The user flow illustrates the journey from daily logging to reviewing
                trends and gaining insight, reducing cognitive load and building
                confidence.
              </Caption>
            </MediaCard>

            <Paragraph>
              The interactive prototype showed that farm operations could be captured
              in seconds while supporting meaningful long term analysis. Offline
              support, clear hierarchy, and dark mode were tested for real
              conditions.
            </Paragraph>

            <MediaCard>
              <VideoContainer>
                <Video autoPlay loop muted playsInline>
                  <source src={kroptDemoVideo} type="video/mp4" />
                </Video>
              </VideoContainer>
              <Caption>
                Prototype video shows daily logging, visual feedback, and trend
                analysis in action.
              </Caption>
            </MediaCard>
          </CaseStudySection>

          {/* ---------- Challenges / Insights ---------- */}
          <CaseStudySection id="challenges" title="Challenges / Insights">
            <Paragraph>
              Research included conversations with local farmers, analysis of farm
              management tools, and review of regenerative agriculture literature.
              This highlighted tensions between simplicity and data depth.
            </Paragraph>

            <UserGrid>
              <UserCard>
                <h4>Input in tough conditions</h4>
                <p>
                  Farmers need low friction logging even in low connectivity and
                  physically challenging environments.
                </p>
              </UserCard>

              <UserCard>
                <h4>Unifying data</h4>
                <p>
                  Soil, crop, and livestock data must be integrated without
                  overwhelming the user.
                </p>
              </UserCard>

              <UserCard>
                <h4>Making trends visible</h4>
                <p>
                  Long term trends must be clear to non technical users to support
                  confidence and planning.
                </p>
              </UserCard>

              <UserCard>
                <h4>Building trust</h4>
                <p>
                  Consistency, clarity, and predictable interactions are essential
                  for sustained adoption.
                </p>
              </UserCard>
            </UserGrid>

            <Callout>
              Visual feedback, not raw data, drives long term engagement. Farmers are
              more likely to log consistently when trends and outcomes are clear.
            </Callout>
          </CaseStudySection>

          {/* ---------- Results ---------- */}
          <CaseStudySection id="results" title="Results">
            <Paragraph>
              Kropt demonstrates that mobile first design can support complex farm
              workflows under real world constraints. Offline capability,
              progressive disclosure, and data integration were validated in
              context.
            </Paragraph>

            <Paragraph>
              While conceptual, the project illustrates a scalable approach for
              sustainability focused industries where clear visibility drives better
              decisions.
            </Paragraph>

            <ResCarousel images={[kroptHeader, kroptHome, kroptSoilHealth, kroptFarmTasks]} openModal={openModal} />
          </CaseStudySection>

        </CaseStudyPage>
        <OtherProjects currentProjectId="kropt" />
      </CaseStudyLayout>

      {/* ---------- Modal ---------- */}
      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <div
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={closeModal}>×</CloseButton>
            <ModalImage src={modalSrc} alt="Preview" />
          </div>
        </ModalOverlay>
      )}
    </>
  );
}