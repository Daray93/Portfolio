import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiUsers, FiLayers, FiCheckSquare } from "react-icons/fi";

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
import AudanoteLogo from "./assets/Audanote-logo.svg";

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

const StatusPill = styled(Pill)`
  background: #f5f0dc;
  color: #92400e;
  font-weight: 600;
`;

// Stands in for real screenshots (wireframes, prototype frames, ticket
// screenshots) until those exist -- clearly labelled rather than
// stretching the one logo asset into every image slot, which would just
// look broken instead of obviously "placeholder".
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

const IconRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

/* ---------- Audanote Case Study ---------- */

export default function AudanoteCaseStudy() {
  const { isUnlocked, loading } = useProtectedAccess();
  const navigate = useNavigate();

  if (loading) return null;
  if (!isUnlocked) {
    // See the matching comment in OrthoVive.jsx -- shows the password
    // prompt in place instead of silently bouncing home, so every path
    // to a locked project (homepage card, this direct route, Other
    // Projects) behaves the same way.
    return (
      <ProtectedGate open onClose={() => navigate("/")} redirectTo="/audanote" />
    );
  }

  return (
    <CaseStudyLayout
      sections={[
        { id: "overview", label: "Overview" },
        { id: "wireframes", label: "Wireframes" },
        { id: "prototype", label: "Prototype" },
        { id: "collaboration", label: "Collaboration" },
        { id: "iteration", label: "Iteration" },
        { id: "outcomes", label: "Outcomes" },
      ]}
    >
      <CaseStudyPage>
        {/* ---------- Overview ---------- */}
        <CaseStudySection id="overview" title="Overview" tldrVisible>
          <CaseStudyHero title="Audanote" subtitle="A health-tech product, designed alongside one stakeholder">
            <PillRow>
              <Pill>Health-Tech</Pill>
              <Pill>Figma</Pill>
              <Pill>Stakeholder Collaboration</Pill>
              <StatusPill>In Progress</StatusPill>
            </PillRow>

            <CaseStudyMorphMedia image={AudanoteLogo} imageFit="contain" />

            <Paragraph>
              Placeholder overview — replace with the real one-line pitch for
              Audanote. This case study is being written up as the project
              itself progresses: wireframes first, then a working prototype,
              then an ongoing loop of stakeholder feedback and iteration
              rather than a single big reveal at the end.
            </Paragraph>
          </CaseStudyHero>
        </CaseStudySection>

        {/* ---------- Wireframes ---------- */}
        <CaseStudySection id="wireframes" title="Wireframes">
          <Paragraph>
            Placeholder — early structure worked out in low-fidelity
            wireframes before any visual design, so the stakeholder could
            align on flow and structure before either of us invested time in
            detail that might still change.
          </Paragraph>

          <MediaPlaceholder>Wireframe screens — add once finalised</MediaPlaceholder>
        </CaseStudySection>

        {/* ---------- Prototype ---------- */}
        <CaseStudySection id="prototype" title="Prototype">
          <Paragraph>
            Placeholder — from the wireframes, a working prototype was built
            out in Figma covering the app's core flows, along with
            supporting artifacts used to walk the stakeholder through the
            thinking behind each decision.
          </Paragraph>

          <MediaRow>
            <MediaPlaceholder>Prototype screen — add real capture</MediaPlaceholder>
            <MediaPlaceholder>Supporting artifact — add real capture</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        {/* ---------- Collaboration ---------- */}
        <CaseStudySection id="collaboration" title="Collaboration">
          <Paragraph>
            Placeholder — design decisions are made with the stakeholder
            rather than presented after the fact: regular 1:1 meetings, a
            shared Figma file we both work in directly, and a running log of
            tickets the stakeholder raises that I action and resolve.
          </Paragraph>

          <IconRow>
            <div><FiUsers /> 1:1 stakeholder meetings</div>
            <div><FiLayers /> Shared Figma file, worked in live</div>
            <div><FiCheckSquare /> Tickets raised, changes actioned</div>
          </IconRow>

          <MediaPlaceholder>Stakeholder ticket / notes screenshot — add real capture</MediaPlaceholder>
        </CaseStudySection>

        {/* ---------- Iteration ---------- */}
        <CaseStudySection id="iteration" title="Iteration">
          <Paragraph>
            Placeholder — each round of feedback becomes a set of tickets,
            worked through directly in the shared file. Anything that needs
            a trade-off conversation gets flagged back to the stakeholder
            rather than actioned blindly.
          </Paragraph>

          <Callout>
            [Add specifics once a few real iteration rounds are documented —
            what changed, why, and what the ticket/response loop actually
            looked like.]
          </Callout>
        </CaseStudySection>

        {/* ---------- Outcomes ---------- */}
        <CaseStudySection id="outcomes" title="Outcomes">
          <Paragraph>
            Placeholder — Audanote is still in active development. This
            section will cover measurable outcomes once the collaboration
            reaches a shipped milestone.
          </Paragraph>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="audanote" />
    </CaseStudyLayout>
  );
}
