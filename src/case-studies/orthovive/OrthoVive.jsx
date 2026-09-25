import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
  CaseStudyMorphMedia,
} from "../../components/case-study/Index";

import OtherProjects from "../../components/shared/OtherProjects";
import ProtectedGate from "../../components/shared/ProtectedGate";
import useProtectedAccess from "../../components/shared/useProtectedAccess";
import styled from "styled-components";

// Assets
import OrthoViveLogo from "./assets/OrthoVive.png";
import BriefPhoto from "./assets/OrthoVive-Brief.png";

import { FiClock, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

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
  cursor: pointer;
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

const IconRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

// Stands in for real screenshots (prototype frames, feedback notes) until
// those exist -- clearly labelled rather than reusing OrthoVive-Brief.png
// (the one real asset so far) across every slot, which just looked
// broken instead of obviously "placeholder" (see Audanote.jsx, same
// convention).
const MediaPlaceholder = styled.div`
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;

const MediaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  ${MediaPlaceholder} {
    flex: 1;
    min-width: 240px;
  }
`;

/* ---------- OrthoVive Case Study ---------- */

export default function OrthoViveCaseStudy() {
  const { isUnlocked, loading } = useProtectedAccess();
  const navigate = useNavigate();
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
    // Was a silent `<Navigate to="/" />` -- landing here directly (a
    // bookmark, the Other Projects link, a shared URL) bounced you home
    // with zero explanation of why, unlike clicking the locked card on
    // the homepage grid, which opens this exact same password prompt in
    // place. Showing it here too means every path to a locked project
    // behaves the same way. redirectTo points back at this same route
    // (not away from it) since a successful unlock just needs this
    // component to re-render with isUnlocked now true, not a navigation
    // anywhere else.
    return (
      <ProtectedGate open onClose={() => navigate("/")} redirectTo="/orthovive" />
    );
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
          <CaseStudySection id="brief" title="Overview" tldrVisible>
            <CaseStudyHero
              title="OrthoVive"
              subtitle="From brief to working prototype with Claude + Figma"
            >
              <PillRow>
                <Pill>2025</Pill>
                <Pill>Figma</Pill>
                <Pill>React</Pill>
                <Pill>Claude</Pill>
              </PillRow>

              <CaseStudyMorphMedia image={OrthoViveLogo} imageFit="contain" />

              <Paragraph>
                <strong>This project began with a brief from the client</strong>{" "}
                outlining the core problem and goals for the product. I used this as
                the starting point for early concept exploration.
              </Paragraph>

              <Image
                src={BriefPhoto}
                alt="Original project brief"
                onClick={() => openModal(BriefPhoto)}
              />
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

            <MediaRow>
              <MediaPlaceholder>First prototype screen — add real capture</MediaPlaceholder>
              <MediaPlaceholder>First prototype screen — add real capture</MediaPlaceholder>
            </MediaRow>

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

            <MediaPlaceholder>Stakeholder feedback notes — add real capture</MediaPlaceholder>

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

            <MediaRow>
              <MediaPlaceholder>Refined prototype screen — add real capture</MediaPlaceholder>
              <MediaPlaceholder>Refined prototype screen — add real capture</MediaPlaceholder>
            </MediaRow>
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

        <OtherProjects currentProjectId="orthovive" />
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