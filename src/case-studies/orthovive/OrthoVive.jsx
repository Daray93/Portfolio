import { useNavigate } from "react-router-dom";
import { CaseStudyLayout, CaseStudyPage, CaseStudySection } from "../../components/case-study/Index";
import {
  Paragraph,
  List,
  Facts,
  Callout,
  MediaPlaceholder,
  MediaRow,
} from "../../components/case-study/Prose";
import Figure from "../../components/case-study/Figure";
import MoreWork from "../../components/case-study/MoreWork";
import ViewToggle from "../../components/case-study/ViewToggle";
import ProtectedGate from "../../components/shared/ProtectedGate";
import useProtectedAccess from "../../components/shared/useProtectedAccess";

import BriefPhoto from "./assets/OrthoVive-Brief.png";

// Draft: the structure is in place; the screens and the stakeholder
// feedback are still placeholders (marked with brackets).

export default function OrthoViveCaseStudy() {
  const { isUnlocked, loading } = useProtectedAccess();
  const navigate = useNavigate();

  if (loading) return null;
  if (!isUnlocked) {
    // Landing here directly (a bookmark, a More work card, a shared URL)
    // shows the same password prompt as the locked homepage card, rather
    // than bouncing home unexplained. redirectTo is this same route: a
    // successful unlock just needs this to re-render, unlocked.
    return <ProtectedGate open onClose={() => navigate("/")} redirectTo="/orthovive" />;
  }

  return (
    <CaseStudyLayout
      numbered
      sections={[
        { id: "brief", label: "Overview" },
        { id: "v1", label: "First prototype" },
        { id: "feedback", label: "Stakeholder feedback" },
        { id: "v2", label: "Refined prototype" },
        { id: "outcomes", label: "Outcomes" },
      ]}
    >
      <CaseStudyPage>
        <ViewToggle />

        <CaseStudySection id="brief" title="Overview" tldrVisible>
          <Paragraph>
            <strong>This project began with a brief from the client</strong>, outlining the core
            problem and goals for the product. I used it as the starting point for early concept
            exploration.
          </Paragraph>
          <Facts
            items={[
              ["Role", "Design"],
              ["Year", "2026"],
              ["Sector", "Med-tech"],
              ["Team", "Solo, with the client"],
              ["Tools", "Figma, Claude, React"],
            ]}
          />
          <Figure src={BriefPhoto} alt="The original project brief" caption="The client's brief" size="wide" />
          <Paragraph>
            From the brief, I identified the core user needs and used Claude to quickly explore
            interaction ideas and structure, before moving into Figma to build the first prototype.
          </Paragraph>
        </CaseStudySection>

        <CaseStudySection
          id="v1"
          title="First prototype"
          tldr="I worked through the structure and flows with Claude, then prototyped a first version in Figma to test the core concept before any detailed visual design."
        >
          <Paragraph>
            Working from the brief, I used Claude to think through the initial structure and flows,
            then prototyped the first version in Figma to test the core concept.
          </Paragraph>
          <MediaRow>
            <MediaPlaceholder>First prototype screen: add real capture</MediaPlaceholder>
            <MediaPlaceholder>First prototype screen: add real capture</MediaPlaceholder>
          </MediaRow>
          <Callout>
            Goal of this version: validate the core flow and get early feedback before investing in
            detailed visual design.
          </Callout>
        </CaseStudySection>

        <CaseStudySection
          id="feedback"
          title="Stakeholder feedback"
          tldr="Reviewing the first prototype with the stakeholder surfaced new priorities and constraints that shaped the next version."
        >
          <Paragraph>
            I shared the first prototype with the stakeholder for review. The conversation surfaced
            new priorities and constraints that shaped the next iteration.
          </Paragraph>
          <List>
            <li>[A constraint or concern raised]</li>
            <li>[A new priority identified]</li>
            <li>[An area flagged for revision]</li>
          </List>
          <MediaPlaceholder>Stakeholder feedback notes: add real capture</MediaPlaceholder>
          <Callout>
            Key insight: [summary of the main takeaway from the stakeholder conversation].
          </Callout>
        </CaseStudySection>

        <CaseStudySection
          id="v2"
          title="Refined prototype"
          tldr="I revised the design in Figma to address the concerns raised and align with the stakeholder's priorities."
        >
          <Paragraph>
            Based on this feedback, I revised the design in Figma to address the concerns raised and
            better align with the stakeholder&apos;s priorities.
          </Paragraph>
          <MediaRow>
            <MediaPlaceholder>Refined prototype screen: add real capture</MediaPlaceholder>
            <MediaPlaceholder>Refined prototype screen: add real capture</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        <CaseStudySection
          id="outcomes"
          title="Outcomes"
          tldr="The refined prototype moved the project closer to a build-ready design, with a clearer structure shaped by direct client input."
        >
          <Paragraph>
            The refined prototype addressed the stakeholder&apos;s feedback and moved the project
            closer to a build-ready design, with a clearer structure and flow informed by direct
            client input.
          </Paragraph>
        </CaseStudySection>
      </CaseStudyPage>

      <MoreWork currentProjectId="orthovive" />
    </CaseStudyLayout>
  );
}
