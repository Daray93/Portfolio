import { FiExternalLink } from "react-icons/fi";
import { CaseStudySection } from "../../components/case-study/Index";
import { Paragraph, Subheading, Facts, Callout, LiveLink } from "../../components/case-study/Prose";
import Figure, { Figures } from "../../components/case-study/Figure";

import oaHero from "./assets/OA-Hero.mp4";
import oaOnboardingTip from "./assets/goal-tip.jpeg";
import oaOnboardingAnchor from "./assets/frequency-anchor.jpeg";
import oaPlan from "./assets/choose-workout.jpeg";
import oaBuilder from "./assets/build-workout.jpeg";
import oaExerciseDetail from "./assets/push-up-detail.jpeg";
import oaProgress from "./assets/progress.jpeg";
import oaProfile from "./assets/profile.jpeg";
import oaWorkoutsHub from "./assets/workouts-hub.jpeg";
import oaSquats from "./assets/squats-session.jpeg";
import oaMissingAvatar from "./assets/missing-avatar.png";
import oaPlanHome from "./assets/Plan.png";
import oaSevenPaywall from "./assets/7MinuteWorkout.png";
import oaFitbodPaywall from "./assets/FitBod.png";
import oaPenAndPaper from "./assets/PenAndPaperFirstArtifact.png";

// The case study's sections, built from the shared pieces every case study
// uses (see CASE-STUDY-PLAN.md, "Consistency rules"). Screens are Figures:
// click one to see it large.

const paywalls = (
  <Figures columns={2}>
    <Figure src={oaSevenPaywall} alt="Seven (7 Minute Workout) paywall screen" caption="Seven" />
    <Figure src={oaFitbodPaywall} alt="Fitbod paywall screen" caption="Fitbod" />
  </Figures>
);

const firstArtifact = (
  <Figure
    src={oaPenAndPaper}
    alt="Pen and paper sketch from the first conversation: name, branding direction, core features, and success criteria"
    caption="The first artifact — name, branding direction, feature list, and what success looked like, before any of it touched Figma."
  />
);

export default function OperationAvocadoContent() {
  return (
    <>
      <CaseStudySection id="overview" title="Overview" tldrVisible>
        <Paragraph>
          Operation Avocado is a mobile-first workout tracker, built as a web app for an audience of
          two: my girlfriend and me. Every workout app worth using paywalls the useful parts — a real
          builder, real progress history, more than a token exercise library. Ours has none of that:
          no app store, no install, just a link that works on any phone.
        </Paragraph>
        <Facts
          items={[
            ["Role", "Design & Development"],
            ["Year", "2026"],
            ["Sector", "Health & fitness"],
            ["Team", "Solo"],
            ["Tools", "Claude Code, TypeScript, Firebase, GitHub"],
          ]}
        />
        <Figure video src={oaHero} alt="Operation Avocado in use" />
        <Paragraph>
          What made this one interesting was the process: instead of a Figma-to-code workflow, I used
          Claude Code heavily through implementation, which let me iterate far faster than drawing
          each screen by hand. My role didn&apos;t change — I was still making the product and UX
          decisions — but the real work was translating those decisions into a working product, then
          iterating on the experience as it came together.
        </Paragraph>
        <Subheading>My role</Subheading>
        <Paragraph>
          I designed the product end to end — every flow, screen, and piece of copy — and directed the
          build through Claude Code: setting the direction up front, then reviewing what came back
          and redirecting it whenever a screen drifted from what the two of us actually needed.
          Thirteen commits, three weeks, one live app.
        </Paragraph>
      </CaseStudySection>

      <CaseStudySection
        id="problem"
        title="Problem"
        tldr="Quick-workout apps paywall the one feature that actually matters — customisation — and cross-platform parity between iPhone and Android is rare to nonexistent."
        tldrMedia={paywalls}
      >
        <Paragraph>
          Every app built around quick, timed workouts hides the same thing behind a subscription: any
          way to customise the exercises. Free tiers exist to sell the paid tier, not to help you
          train — pay to unlock basics, or settle for a fixed routine that doesn&apos;t fit how you
          actually train.
        </Paragraph>
        <Paragraph>
          The second problem was platform, not features: I&apos;m on iPhone, she&apos;s on Android, and
          most of the good workout apps only exist — or only work properly — on one or the other. We
          couldn&apos;t even land on the same app to try. Building it as a web app sidestepped that
          entirely: one link, the same experience on any phone, no picking a platform to design for.
        </Paragraph>
        {paywalls}
      </CaseStudySection>

      <CaseStudySection
        id="goal"
        title="Goal"
        tldr="A free, platform-agnostic workout tracker built around a customisable builder rather than fixed programs — flexible enough to serve two people with different training needs, and scalable beyond them."
      >
        <Paragraph>
          What success looked like: no paywall on the parts that matter, a builder instead of a fixed
          program library, and one app flexible enough that two people who wanted different things
          could both get what they actually needed — with room for anyone else who ends up using it
          too. Shipping it as a web app was part of that: no App Store gate, no install, just a link
          that opens on any phone.
        </Paragraph>
      </CaseStudySection>

      <CaseStudySection
        id="process"
        title="Process"
        tldr="Started on paper with my partner, then a Seven Minute Workout-inspired builder, task-based shadowing instead of formal usability tests, branding as the one conventional step kept, an AI-directed build, and behavioural nudges (reciprocity, anchoring) built into onboarding."
        tldrMedia={firstArtifact}
      >
        <Paragraph>
          Pen and paper is still where every project starts for me — a millennial habit, maybe, but
          nothing beats it for getting thoughts in order before opening a tool. This sketch is the
          first conversation with my partner, boiled down: a name, a branding direction to carry into
          Figma, the core features worth building, whether login and profiles belonged in an MVP at
          all, and what success would actually look like.
        </Paragraph>
        {firstArtifact}
        <Paragraph>
          <strong>Mechanic —</strong> the classic Seven Minute Workout, adapted into a builder instead
          of a fixed routine: what the goal required, not a style choice. Visuals stayed restrained —
          one accent green, one set of design rules, checked against every new screen.
        </Paragraph>
        <Paragraph>
          <strong>Research —</strong> we were the whole audience, so the usual process didn&apos;t
          apply. Instead of formal usability tests, I shadowed my partner with a plain task list — log
          in, choose a workout, build one with two leg exercises and an upper-body finisher — and
          watched where she actually got stuck. Competitor analysis stayed narrow too: not feature
          parity, just UX patterns worth reusing — smart forms, filterable lists, calendar-style
          progress.
        </Paragraph>
        <Paragraph>
          <strong>Branding —</strong> the one conventional step I kept: sketching the avocado mark,
          testing colour, landing on the single accent green. Personas, moodboards, wireframes, Figma
          prototypes — the rest of the usual kit — never happened. There was no persona to build;
          there were her actual answers, in pen.
        </Paragraph>
        <Paragraph>
          <strong>Build —</strong> started in VS Code, not Figma: splash page first, then the landing
          page, then everything after that directed through Claude Code — reviewing what came back and
          redirecting it whenever a screen drifted, the same review loop a design lead runs with an
          engineer, compressed into one person.
        </Paragraph>
        <Paragraph>
          <strong>Onboarding —</strong> one-pass, goals/injuries/schedule asked once. Two behavioural
          nudges: a tailored tip after the goal question (reciprocity), and an anchor on the frequency
          step (&quot;most trainers recommend 3–4 days&quot;) to pull answers toward realistic, not
          aspirational.
        </Paragraph>
        <Figures columns={2}>
          <Figure
            src={oaOnboardingTip}
            alt="Onboarding goal step showing a tailored tip"
            caption="Each answer earns a short, specific tip before the next question — reciprocity, not just data collection."
          />
          <Figure
            src={oaOnboardingAnchor}
            alt="Onboarding frequency step anchored on 3 to 4 days a week"
            caption="The frequency step anchors on “3–4 days” instead of leaving the number to guesswork — a nudge toward an answer people actually keep."
          />
        </Figures>
        <Paragraph>
          One deliberate personal touch: the in-workout coaching lines are voiced, and I wanted an
          Irish voice — because I&apos;m Irish, and every fitness app defaults to the same generic
          American trainer energy. Little details like that, plus workouts with real names instead of
          &quot;Workout 1, Workout 2,&quot; are what make an app feel like <em>yours</em> instead of a
          template.
        </Paragraph>
        <Figure
          src={oaPlan}
          alt="Choosing a workout for the day from a named list"
          caption="Picking today's workout — “Avocado Awakening,” “Lunch Break Legend” — named, not just labelled Workout 1, Workout 2."
        />
        <Paragraph>
          Exercises render as live 3D models rather than looping GIFs, and each one comes from a
          different source at a different scale. Getting every character to appear at a consistent
          size took real trial and error — the kind of detail that&apos;s invisible when it&apos;s
          right and glaring the moment it isn&apos;t.
        </Paragraph>
        <Figures columns={2}>
          <Figure
            src={oaBuilder}
            alt="Workout builder combining a searchable exercise library with a low-impact toggle"
            caption="The builder — a searchable, filterable exercise library with a low-impact toggle built in. This is the feature the whole app exists to make free."
          />
          <Figure
            src={oaExerciseDetail}
            alt="Exercise detail showing a 3D animated demonstration"
            caption="Exercises render as live 3D models rather than looping GIFs — only a handful exist so far; most of the 117-exercise library is still waiting on its animation."
          />
        </Figures>
        <Callout>
          Design principles: one accent colour, generous touch targets, and feedback (sound,
          vibration, streaks) that nudges without nagging.
        </Callout>
      </CaseStudySection>

      <CaseStudySection
        id="outcomes"
        title="Outcomes"
        tldr="Shipped and live, with the core design goal met: no paywall on core functionality. The gap is daily usability — most of the 117-exercise library still lacks a 3D demo — surfacing build sequencing as the key lesson."
        tldrMedia={
          <Figures columns={2}>
            <Figure
              src={oaPlanHome}
              alt="Plan home screen showing today's date, add workout, log an activity, and rest day options"
              caption="Met — shipped, live, and working."
            />
            <Figure
              src={oaMissingAvatar}
              alt="Superman Hold exercise detail with a blank placeholder where the 3D demo should be"
              caption="Not yet — most of the library still looks like this, no demo."
            />
          </Figures>
        }
      >
        <Callout>
          <strong>Met</strong> — live, deployed, free of any paywall: builder, one-pass onboarding,
          and calendar all work as designed.
        </Callout>
        <Figures columns={2}>
          <Figure
            src={oaPlanHome}
            alt="Plan home screen showing today's date, add workout, log an activity, and rest day options"
            caption="The home screen — plan, log, or rest, all one tap away."
          />
          <Figure
            src={oaWorkoutsHub}
            alt="Workouts hub with options to create a custom workout or browse by focus area"
            caption="The workouts hub — quick session or build your own."
          />
          <Figure
            src={oaProgress}
            alt="Progress page showing a personal goal and a monthly calendar"
            caption="The goal and calendar view — ready for real training days."
          />
          <Figure src={oaProfile} alt="Profile screen" caption="Profile — finished and live." />
        </Figures>
        <Callout>
          <strong>Not yet</strong> — real daily use. Only a handful of the 117 exercises have a 3D
          demo: a few pulled from Mixamo, a few more hand-recorded on Rokoko&apos;s free-tier body
          tracking. The rest still needs animating before a full session actually works end to end,
          which means the core design bets are still hypotheses — tested by the two of us clicking
          through, not by sustained real use.
        </Callout>
        <Figures columns={3}>
          <Figure
            src={oaMissingAvatar}
            alt="Superman Hold exercise detail with a blank placeholder where the 3D demo should be"
            caption="Most of the library still looks like this — a blank placeholder, not a demo."
          />
          <Figure
            src={oaExerciseDetail}
            alt="Push-up exercise detail showing a finished 3D animated demonstration"
            caption="A push-up gets the real treatment — this is what's supposed to be there."
          />
          <Figure
            src={oaSquats}
            alt="Squats exercise detail showing a finished 3D animated demonstration"
            caption="Squats — same treatment, same quality."
          />
        </Figures>
        <Paragraph>
          The clearest lesson: wrong build order. Every screen shipped before the animation pipeline
          did, and that pipeline — not the UI — was the real bottleneck, since a 3D model per exercise
          takes per-asset effort that doesn&apos;t scale the way screen design does. Next time: prove
          the pipeline on a handful of exercises first, then build the screens around it.
        </Paragraph>
        <LiveLink href="https://operation-avocado.web.app/" target="_blank" rel="noopener noreferrer">
          Visit Operation Avocado <FiExternalLink aria-hidden="true" />
        </LiveLink>
      </CaseStudySection>
    </>
  );
}
