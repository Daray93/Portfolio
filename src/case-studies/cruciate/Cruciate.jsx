import { FiExternalLink } from "react-icons/fi";
import { CaseStudyLayout, CaseStudyPage, CaseStudySection } from "../../components/case-study/Index";
import {
  Paragraph,
  Subheading,
  Facts,
  List,
  Callout,
  LiveLink,
  MediaPlaceholder,
  MediaRow,
} from "../../components/case-study/Prose";
import OtherProjects from "../../components/shared/OtherProjects";

// Draft: written from what the shipped app does. Screens and real outcomes
// still to add.

export default function Cruciate() {
  return (
    <CaseStudyLayout
      numbered
      sections={[
        { id: "overview", label: "Overview" },
        { id: "problem", label: "The problem" },
        { id: "journey", label: "The journey" },
        { id: "progress", label: "Progress" },
        { id: "options", label: "Options" },
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
          <Facts
            items={[
              ["Role", "Design & Development"],
              ["Year", "2026"],
              ["Sector", "Health"],
              ["Team", "Solo"],
              ["Tools", "React, TypeScript, Supabase, Claude Code"],
            ]}
          />
        </CaseStudySection>

        <CaseStudySection id="problem" title="The problem" tldrVisible>
          <Paragraph>In 2026, I tore my ACL and meniscus.</Paragraph>
          <Paragraph>The diagnosis was clear. An X-ray and MRI showed exactly what was wrong.</Paragraph>
          <Paragraph>What came next wasn&apos;t.</Paragraph>
          <Paragraph>
            Without private health insurance, I faced a long wait for surgery with little guidance on
            how to prepare, what my options were, or what to do in the meantime.
          </Paragraph>
          <Paragraph>
            I later discovered the EU Cross-Border Healthcare Directive, which can allow Irish patients
            to seek treatment elsewhere in the EU and claim reimbursement through the HSE.
          </Paragraph>
          <Paragraph>
            That made me realise the gap wasn&apos;t just access to surgery. It was everything around
            it.
          </Paragraph>
          <Paragraph>
            People need a clear plan before and after surgery, practical guidance between
            appointments, and enough information to understand their options.
          </Paragraph>
          <Subheading>Three questions</Subheading>
          <List>
            <li>
              How might we give people a clear pre- and post-surgery plan without relying entirely on
              physio access?
            </li>
            <li>How might we keep people motivated when progress is slow and difficult to see?</li>
            <li>How might we make treatment options clear from the moment someone is diagnosed?</li>
          </List>
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

        <CaseStudySection id="options" title="Options">
          <Paragraph>
            Onboarding asks one extra question: have you heard of the EU Cross-Border Healthcare
            Directive? If the answer is no, a short plain-English explainer follows, with a link to
            the HSE&apos;s own page. The app points to the official source rather than giving advice
            itself.
          </Paragraph>
          <MediaRow>
            <MediaPlaceholder>Directive question: add screenshot</MediaPlaceholder>
            <MediaPlaceholder>Explainer: add screenshot</MediaPlaceholder>
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
          <LiveLink href="https://cruciate.vercel.app/" target="_blank" rel="noopener noreferrer">
            Visit Cruciate <FiExternalLink aria-hidden="true" />
          </LiveLink>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="cruciate" />
    </CaseStudyLayout>
  );
}
