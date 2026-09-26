import { FiExternalLink } from "react-icons/fi";
import { CaseStudyLayout, CaseStudyPage, CaseStudySection } from "../../components/case-study/Index";
import {
  Paragraph,
  List,
  PillRow,
  Pill,
  Callout,
  LiveLink,
  MediaPlaceholder,
  MediaRow,
} from "../../components/case-study/Prose";
import OtherProjects from "../../components/shared/OtherProjects";

// Draft: written from what the shipped app does. The why, screens and real
// outcomes still to add.

export default function Cruciate() {
  return (
    <CaseStudyLayout
      sections={[
        { id: "overview", label: "Overview" },
        { id: "why", label: "Why" },
        { id: "journey", label: "The journey" },
        { id: "progress", label: "Progress" },
        { id: "safety", label: "Safety" },
        { id: "outcomes", label: "Outcomes" },
      ]}
    >
      <CaseStudyPage>
        <CaseStudySection id="overview" title="Overview" tldrVisible>
          <Paragraph>
            Cruciate is a mobile-first app for ACL rehab, before and after surgery. It turns a long,
            phase-by-phase recovery into one clear plan for today, and shows the progress that&apos;s
            easy to miss week to week.
          </Paragraph>
          <PillRow>
            <Pill>Product design</Pill>
            <Pill>Health</Pill>
            <Pill>Mobile-first web app</Pill>
            <Pill>React + TypeScript</Pill>
            <Pill>Supabase</Pill>
          </PillRow>
          <LiveLink href="https://cruciate.vercel.app/" target="_blank" rel="noopener noreferrer">
            Visit Cruciate <FiExternalLink aria-hidden="true" />
          </LiveLink>
        </CaseStudySection>

        <CaseStudySection id="why" title="Why" tldrVisible>
          <Callout>
            [Add why you built it: who it&apos;s for, what was missing from the rehab tools or
            printouts people get now, and anything personal behind it.]
          </Callout>
        </CaseStudySection>

        <CaseStudySection id="journey" title="The journey">
          <Paragraph>
            Recovery is organised around dates. Onboarding asks for the injury and surgery dates, and
            everything after that is measured in weeks since surgery.
          </Paragraph>
          <List>
            <li>
              <strong>A phase roadmap</strong> shows where you are in recovery and what comes next.
            </li>
            <li>
              <strong>Today&apos;s rehab</strong> is a checklist of the current phase&apos;s
              exercises, with timers for holds.
            </li>
            <li>
              <strong>Moving on is a choice.</strong> Switching phase early asks you to confirm first.
            </li>
          </List>
          <MediaRow>
            <MediaPlaceholder>Onboarding: add screenshot</MediaPlaceholder>
            <MediaPlaceholder>Today&apos;s rehab: add screenshot</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        <CaseStudySection id="progress" title="Progress">
          <Paragraph>
            Knee range of motion is the number that matters most, so it gets its own logging flow.
            Illustrations show how to take each reading, seated or lying down, and a trend chart shows
            how it changes over time.
          </Paragraph>
          <Paragraph>
            A session calendar and history keep a record of every workout, and a body map shows which
            muscle groups you&apos;ve worked most. Finishing a session is marked with an encouraging
            message, because rehab is repetitive and motivation fades.
          </Paragraph>
          <MediaRow>
            <MediaPlaceholder>Range-of-motion logging: add screenshot</MediaPlaceholder>
            <MediaPlaceholder>Progress chart: add screenshot</MediaPlaceholder>
          </MediaRow>
        </CaseStudySection>

        <CaseStudySection id="safety" title="Safety">
          <Paragraph>
            An app giving exercises after surgery has to be careful about when it says yes.
          </Paragraph>
          <List>
            <li>A waiver to read and agree to before you start.</li>
            <li>
              A daily symptom check-in. Flag something concerning, such as chest pain or a wound that
              looks infected, and that day&apos;s exercises pause with a prompt to contact your care
              team.
            </li>
            <li>Loaded exercises stay locked until you&apos;re cleared for them.</li>
            <li>Milestone check-ins at key points in recovery.</li>
          </List>
          <MediaPlaceholder>Red-flag check-in: add screenshot</MediaPlaceholder>
        </CaseStudySection>

        <CaseStudySection id="outcomes" title="Outcomes">
          <Callout>
            [Add who has used it, feedback from them or a physio, and what you&apos;d change next.]
          </Callout>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="cruciate" />
    </CaseStudyLayout>
  );
}
