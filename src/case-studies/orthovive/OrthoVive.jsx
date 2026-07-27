import React, { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";

import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";

import OtherProjects from "../../components/shared/OtherProjects";
import useProtectedAccess from "../../components/shared/useProtectedAccess";
import styled from "styled-components";

// Assets
import BriefPhoto from "./assets/OrthoVive-Brief.png";
import PrototypeV1_1 from "./assets/OrthoVive-Brief.png";
import PrototypeV1_2 from "./assets/OrthoVive-Brief.png";
import StakeholderNotes from "./assets/OrthoVive-Brief.png";
import PrototypeV2_1 from "./assets/OrthoVive-Brief.png";
import PrototypeV2_2 from "./assets/OrthoVive-Brief.png";
import demoVideo from "../../components/home/assets/ResumeVideo.mp4";

import { FiClock, FiTrendingUp, FiAlertCircle, FiFileText } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";

import ResultsCarousel from "../../components/shared/ResultsCarousel";

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
`;

const MediaCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 1.5rem;
`;

const IconRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const SolutionContainer = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const VideoWrapper = styled.div`
  flex: 1;
`;

/* ---------- ProjectName Case Study ---------- */

export default function ProjectNameCaseStudy() {
  const { isUnlocked, loading } = useProtectedAccess();
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

  if (loading) return null;
  if (!isUnlocked) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <CaseStudyLayout
        sections={[
          { id: "brief", label: "The Brief" },
          { id: "v1", label: "First Prototype" },
          { id: "feedback", label: "Stakeholder Feedback" },
          { id: "v2", label: "Refined Prototype" },
          { id: "outcomes", label: "Project Outcomes" },
        ]}
      >
        <CaseStudyPage>

          {/* ---------- Brief ---------- */}
          <CaseStudySection id="brief">
            <CaseStudyHero
              title="ProjectName"
              subtitle="From brief to working prototype with Claude + Figma"
            >
              <Paragraph>
                <strong>This project began with a brief from the client</strong>{" "}
                outlining the core problem and goals for the product. I used this as
                the starting point for early concept exploration.
              </Paragraph>

              <PillRow>
                <Pill>2025</Pill>
                <Pill>Figma</Pill>
                <Pill>React</Pill>
                <Pill>Claude</Pill>
              </PillRow>

              <Image
                src={BriefPhoto}
                alt="Original project brief"
                onClick={() => openModal(BriefPhoto)}
              />

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  View Live Prototype <GiBrain size={20} />
                </a>

                <a href="/ProjectNameReport.pdf" target="_blank" rel="noopener noreferrer">
                  View Project Report <FiFileText size={20} />
                </a>
              </div>
            </CaseStudyHero>

            <Paragraph style={{ marginTop: "2rem" }}>
              From the brief, I identified the core user needs and used Claude to
              quickly explore interaction ideas and structure, before moving into
              Figma to build out the first prototype.
            </Paragraph>
          </CaseStudySection>

          {/* ---------- First Prototype ---------- */}
          <CaseStudySection id="v1" title="First Prototype">
            <Paragraph>
              Working from the brief, I used Claude to think through the initial
              structure and flows, then prototyped the first version in Figma to
              test the core concept.
            </Paragraph>

            <IconRow>
              {[PrototypeV1_1, PrototypeV1_2].map((img, i) => (
                <MediaCard key={i} onClick={() => openModal(img)}>
                  <Image src={img} alt={`First prototype ${i + 1}`} />
                </MediaCard>
              ))}
            </IconRow>

            <Callout>
              Goal of this version: validate the core flow and get early feedback
              before investing in detailed visual design.
            </Callout>
          </CaseStudySection>

          {/* ---------- Stakeholder Feedback ---------- */}
          <CaseStudySection id="feedback" title="Stakeholder Feedback">
            <Paragraph>
              I shared the first prototype with the stakeholder for review. This
              conversation surfaced new priorities and constraints that shaped the
              next iteration.
            </Paragraph>

            <IconRow>
              <div><FiClock /> Constraint or concern raised</div>
              <div><FiTrendingUp /> New priority identified</div>
              <div><FiAlertCircle /> Area flagged for revision</div>
            </IconRow>

            <Image
              src={StakeholderNotes}
              alt="Notes from stakeholder feedback session"
              onClick={() => openModal(StakeholderNotes)}
            />

            <Callout>
              Key insight: [summary of the main takeaway from the stakeholder conversation].
            </Callout>
          </CaseStudySection>

          {/* ---------- Refined Prototype ---------- */}
          <CaseStudySection id="v2" title="Refined Prototype">
            <Paragraph>
              Based on this feedback, I revised the design in Figma to address the
              concerns raised and better align with the stakeholder's priorities.
            </Paragraph>

            <ResultsCarousel
              items={[
                { type: "video", src: demoVideo },
              ]}
              images={[PrototypeV2_1, PrototypeV2_2]}
              openModal={openModal}
              stackVideosOnMobile={true}
            />
          </CaseStudySection>

          {/* ---------- Outcomes ---------- */}
          <CaseStudySection id="outcomes" title="Outcomes">
            <Paragraph>
              The refined prototype addressed the stakeholder's feedback and moved
              the project closer to a build-ready design, with a clearer structure
              and flow informed by direct client input.
            </Paragraph>
          </CaseStudySection>

        </CaseStudyPage>

        <OtherProjects currentProjectId="projectname" />
      </CaseStudyLayout>

      {/* ---------- Modal ---------- */}
      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <CloseButton onClick={closeModal}>×</CloseButton>
            <ModalImage src={modalSrc} alt="Preview" />
          </div>
        </ModalOverlay>
      )}
    </>
  );
}