import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { CaseStudySection, CaseStudyHero } from "../../components/case-study/Index";
import { FiSmartphone } from "react-icons/fi";

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

/* ---------------- shared bits ---------------- */
// Same local-styled-component convention every other case study file
// uses (see Kropt.jsx) rather than a shared import -- these are just
// per-page content formatting, not structural chrome.

const Paragraph = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const Pill = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
`;

const ButtonWrapper = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  }
`;

const Callout = styled.div`
  padding: 1.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// Capped rather than width: 100% -- these are portrait phone screenshots,
// so stretching one to the full text column made it enormous (and the
// small in-app text unreadably blown up) instead of reading as a neat
// screenshot. Sized like a thumbnail; ShotImg stays click-to-zoom for
// anyone who wants the full-size ModalImage version.
const Shot = styled.figure`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: min(220px, 60vw);
`;

const ShotImg = styled.img`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadowLg};
  cursor: zoom-in;
`;

const ShotCaption = styled.figcaption`
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const ExampleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
`;

const ExampleShot = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: min(200px, 42vw);
`;

const ExampleImg = styled.img`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadowLg};
  cursor: zoom-in;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
  padding: 2rem;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

/* ---------------- "My Role" -- same convention as Kropt's RoleContainer/RoleHeading ---------------- */

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

/* ---------------- hero media ---------------- */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// No forced aspect-ratio -- unlike the homepage tile (see Splash.jsx),
// this holds a real screenshot/mockup rather than the square jumping-jack
// rig, so it just sizes to whatever image is dropped in and fades in on
// mount. Full width of the section's own content column (the Row/Body
// padding in CaseStudySection.jsx already provides the page margin), not
// a capped tile, since the current mockup is a wide landscape shot meant
// to read as a banner rather than a small preview.
const HeroMedia = styled.div`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.xxl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowLg};
  animation: ${fadeIn} 0.3s ease both;
`;

const HeroMediaVideo = styled.video`
  display: block;
  width: 100%;
`;

export default function OperationAvocadoContent() {
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
      {/* ---------- Overview ---------- */}
      <CaseStudySection id="overview" title="Overview" tldrVisible>
        <CaseStudyHero title="Operation Avocado" subtitle="A workout tracker without the paywall">
          <PillRow>
            <Pill>2026</Pill>
            <Pill>Product Design</Pill>
            <Pill>Mobile-First</Pill>
            <Pill>Claude Code</Pill>
            <Pill>TypeScript</Pill>
            <Pill>Firebase</Pill>
            <Pill>GitHub</Pill>
          </PillRow>

          <HeroMedia>
            <HeroMediaVideo src={oaHero} autoPlay loop muted playsInline />
          </HeroMedia>

          <Paragraph>
            Operation Avocado is a mobile-first workout tracker, built as a
            web app for an audience of two: my girlfriend and me. Every
            workout app worth using paywalls the useful parts — a real
            builder, real progress history, more than a token exercise
            library. Ours has none of that: no app store, no install, just a
            link that works on any phone.
          </Paragraph>
          <Paragraph>
            What made this one interesting was the process: instead of a
            Figma-to-code workflow, I used Claude Code heavily through
            implementation, which let me iterate far faster than drawing
            each screen by hand. My role didn't change — I was still making
            the product and UX decisions — but the real work was
            translating those decisions into a working product, then
            iterating on the experience as it came together.
          </Paragraph>

          <ButtonWrapper>
            <CTAButton
              href="https://operation-avocado.web.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Operation Avocado<FiSmartphone size={20} />
            </CTAButton>
          </ButtonWrapper>
        </CaseStudyHero>

        <RoleContainer>
          <RoleHeading>My Role</RoleHeading>
          I designed the product end to end — every flow, screen, and piece of
          copy — and directed the build through Claude Code: setting the
          direction up front, then reviewing what came back and redirecting it
          whenever a screen drifted from what the two of us actually needed.
          Thirteen commits, three weeks, one live app.
        </RoleContainer>
      </CaseStudySection>

      {/* ---------- Problem ---------- */}
      <CaseStudySection
        id="problem"
        title="Problem"
        tldr="Quick-workout apps paywall the one feature that actually matters — customisation — and cross-platform parity between iPhone and Android is rare to nonexistent."
        tldrMedia={
          <ExampleRow>
            <ExampleShot>
              <ExampleImg
                src={oaSevenPaywall}
                alt="Seven (7 Minute Workout) paywall screen"
                onClick={() => openModal(oaSevenPaywall)}
              />
              <ShotCaption>Seven</ShotCaption>
            </ExampleShot>
            <ExampleShot>
              <ExampleImg
                src={oaFitbodPaywall}
                alt="Fitbod paywall screen"
                onClick={() => openModal(oaFitbodPaywall)}
              />
              <ShotCaption>Fitbod</ShotCaption>
            </ExampleShot>
          </ExampleRow>
        }
      >
        <Paragraph>
          Every app built around quick, timed workouts hides the same thing
          behind a subscription: any way to customise the exercises. Free
          tiers exist to sell the paid tier, not to help you train — pay to
          unlock basics, or settle for a fixed routine that doesn't fit how
          you actually train.
        </Paragraph>
        <Paragraph>
          The second problem was platform, not features: I'm on iPhone, she's
          on Android, and most of the good workout apps only exist — or only
          work properly — on one or the other. We couldn't even land on the
          same app to try. Building it as a web app sidestepped that
          entirely: one link, the same experience on any phone, no picking a
          platform to design for.
        </Paragraph>
        <ExampleRow>
          <ExampleShot>
            <ExampleImg
              src={oaSevenPaywall}
              alt="Seven (7 Minute Workout) paywall screen"
              onClick={() => openModal(oaSevenPaywall)}
            />
            <ShotCaption>Seven</ShotCaption>
          </ExampleShot>
          <ExampleShot>
            <ExampleImg
              src={oaFitbodPaywall}
              alt="Fitbod paywall screen"
              onClick={() => openModal(oaFitbodPaywall)}
            />
            <ShotCaption>Fitbod</ShotCaption>
          </ExampleShot>
        </ExampleRow>
      </CaseStudySection>

      {/* ---------- Goal ---------- */}
      <CaseStudySection
        id="goal"
        title="Goal"
        tldr="A free, platform-agnostic workout tracker built around a customisable builder rather than fixed programs — flexible enough to serve two people with different training needs, and scalable beyond them."
      >
        <Paragraph>
          What success looked like: no paywall on the parts that matter, a
          builder instead of a fixed program library, and one app flexible
          enough that two people who wanted different things could both get
          what they actually needed — with room for anyone else who ends up
          using it too. Shipping it as a web app was part of that: no App
          Store gate, no install, just a link that opens on any phone.
        </Paragraph>
      </CaseStudySection>

      {/* ---------- Process ---------- */}
      <CaseStudySection
        id="process"
        title="Process"
        tldr="Started on paper with my partner, then a Seven Minute Workout-inspired builder, task-based shadowing instead of formal usability tests, branding as the one conventional step kept, an AI-directed build, and behavioural nudges (reciprocity, anchoring) built into onboarding."
        tldrMedia={
          <Shot>
            <ShotImg
              src={oaPenAndPaper}
              alt="Pen and paper sketch from the first conversation: name, branding direction, core features, and success criteria"
              onClick={() => openModal(oaPenAndPaper)}
            />
            <ShotCaption>
              The first artifact — name, branding direction, feature list, and
              what success looked like, before any of it touched Figma.
            </ShotCaption>
          </Shot>
        }
      >
        <Paragraph>
          Pen and paper is still where every project starts for me — a
          millennial habit, maybe, but nothing beats it for getting thoughts
          in order before opening a tool. This sketch is the first
          conversation with my partner, boiled down: a name, a branding
          direction to carry into Figma, the core features worth building,
          whether login and profiles belonged in an MVP at all, and what
          success would actually look like.
        </Paragraph>
        <Shot>
          <ShotImg
            src={oaPenAndPaper}
            alt="Pen and paper sketch from the first conversation: name, branding direction, core features, and success criteria"
            onClick={() => openModal(oaPenAndPaper)}
          />
          <ShotCaption>
            The first artifact — name, branding direction, feature list, and
            what success looked like, before any of it touched Figma.
          </ShotCaption>
        </Shot>
        <Paragraph>
          <strong>Mechanic —</strong> the classic Seven Minute Workout, adapted
          into a builder instead of a fixed routine: what the goal required,
          not a style choice. Visuals stayed restrained — one accent green,
          one set of design rules, checked against every new screen.
        </Paragraph>
        <Paragraph>
          <strong>Research —</strong> we were the whole audience, so the usual
          process didn't apply. Instead of formal usability tests, I shadowed
          my partner with a plain task list — log in, choose a workout, build
          one with two leg exercises and an upper-body finisher — and watched
          where she actually got stuck. Competitor analysis stayed narrow too:
          not feature parity, just UX patterns worth reusing — smart forms,
          filterable lists, calendar-style progress.
        </Paragraph>
        <Paragraph>
          <strong>Branding —</strong> the one conventional step I kept:
          sketching the avocado mark, testing colour, landing on the single
          accent green. Personas, moodboards, wireframes, Figma prototypes —
          the rest of the usual kit — never happened. There was no persona to
          build; there were her actual answers, in pen.
        </Paragraph>
        <Paragraph>
          <strong>Build —</strong> started in VS Code, not Figma: splash page
          first, then the landing page, then everything after that directed
          through Claude Code — reviewing what came back and redirecting it
          whenever a screen drifted, the same review loop a design lead runs
          with an engineer, compressed into one person.
        </Paragraph>
        <Paragraph>
          <strong>Onboarding —</strong> one-pass, goals/injuries/schedule
          asked once. Two behavioural nudges: a tailored tip after the goal
          question (reciprocity), and an anchor on the frequency step ("most
          trainers recommend 3–4 days") to pull answers toward realistic,
          not aspirational.
        </Paragraph>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaOnboardingTip}
              alt="Onboarding goal step showing a tailored tip"
              onClick={() => openModal(oaOnboardingTip)}
            />
            <ShotCaption>
              Each answer earns a short, specific tip before the next question —
              reciprocity, not just data collection.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaOnboardingAnchor}
              alt="Onboarding frequency step anchored on 3 to 4 days a week"
              onClick={() => openModal(oaOnboardingAnchor)}
            />
            <ShotCaption>
              The frequency step anchors on "3–4 days" instead of leaving the
              number to guesswork — a nudge toward an answer people actually
              keep.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Paragraph>
          One deliberate personal touch: the in-workout coaching lines are
          voiced, and I wanted an Irish voice — because I'm Irish, and every
          fitness app defaults to the same generic American trainer energy.
          Little details like that, plus workouts with real names instead of
          "Workout 1, Workout 2," are what make an app feel like{" "}
          <em>yours</em> instead of a template.
        </Paragraph>
        <Shot>
          <ShotImg
            src={oaPlan}
            alt="Choosing a workout for the day from a named list"
            onClick={() => openModal(oaPlan)}
          />
          <ShotCaption>
            Picking today's workout — "Avocado Awakening," "Lunch Break
            Legend" — named, not just labelled Workout 1, Workout 2.
          </ShotCaption>
        </Shot>
        <Paragraph>
          Exercises render as live 3D models rather than looping GIFs, and each
          one comes from a different source at a different scale. Getting every
          character to appear at a consistent size took real trial and error —
          the kind of detail that's invisible when it's right and glaring the
          moment it isn't.
        </Paragraph>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaBuilder}
              alt="Workout builder combining a searchable exercise library with a low-impact toggle"
              onClick={() => openModal(oaBuilder)}
            />
            <ShotCaption>
              The builder — a searchable, filterable exercise library with a
              low-impact toggle built in. This is the feature the whole app
              exists to make free.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaExerciseDetail}
              alt="Exercise detail showing a 3D animated demonstration"
              onClick={() => openModal(oaExerciseDetail)}
            />
            <ShotCaption>
              Exercises render as live 3D models rather than looping GIFs —
              only a handful exist so far; most of the 117-exercise library
              is still waiting on its animation.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Callout>
          Design principles: one accent colour, generous touch targets, and
          feedback (sound, vibration, streaks) that nudges without nagging.
        </Callout>
      </CaseStudySection>

      {/* ---------- Outcomes ---------- */}
      <CaseStudySection
        id="outcomes"
        title="Outcomes"
        tldr="Shipped and live, with the core design goal met: no paywall on core functionality. The gap is daily usability — most of the 117-exercise library still lacks a 3D demo — surfacing build sequencing as the key lesson."
        tldrMedia={
          <Grid2>
            <Shot>
              <ShotImg
                src={oaPlanHome}
                alt="Plan home screen showing today's date, add workout, log an activity, and rest day options"
                onClick={() => openModal(oaPlanHome)}
              />
              <ShotCaption>Met — shipped, live, and working.</ShotCaption>
            </Shot>
            <Shot>
              <ShotImg
                src={oaMissingAvatar}
                alt="Superman Hold exercise detail with a blank placeholder where the 3D demo should be"
                onClick={() => openModal(oaMissingAvatar)}
              />
              <ShotCaption>
                Not yet — most of the library still looks like this, no demo.
              </ShotCaption>
            </Shot>
          </Grid2>
        }
      >
        <Callout>
          <strong>Met</strong> — live, deployed, free of any paywall: builder,
          one-pass onboarding, and calendar all work as designed.
        </Callout>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaPlanHome}
              alt="Plan home screen showing today's date, add workout, log an activity, and rest day options"
              onClick={() => openModal(oaPlanHome)}
            />
            <ShotCaption>
              The home screen — plan, log, or rest, all one tap away.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaWorkoutsHub}
              alt="Workouts hub with options to create a custom workout or browse by focus area"
              onClick={() => openModal(oaWorkoutsHub)}
            />
            <ShotCaption>
              The workouts hub — quick session or build your own.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaProgress}
              alt="Progress page showing a personal goal and a monthly calendar"
              onClick={() => openModal(oaProgress)}
            />
            <ShotCaption>
              The goal and calendar view — ready for real training days.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaProfile}
              alt="Profile screen"
              onClick={() => openModal(oaProfile)}
            />
            <ShotCaption>Profile — finished and live.</ShotCaption>
          </Shot>
        </Grid2>
        <Callout>
          <strong>Not yet</strong> — real daily use. Only a handful of the
          117 exercises have a 3D demo: a few pulled from Mixamo, a few more
          hand-recorded on Rokoko's free-tier body tracking. The rest still
          needs animating before a full session actually works end to end,
          which means the core design bets are still hypotheses — tested by
          the two of us clicking through, not by sustained real use.
        </Callout>
        <Grid3>
          <Shot>
            <ShotImg
              src={oaMissingAvatar}
              alt="Superman Hold exercise detail with a blank placeholder where the 3D demo should be"
              onClick={() => openModal(oaMissingAvatar)}
            />
            <ShotCaption>
              Most of the library still looks like this — a blank
              placeholder, not a demo.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaExerciseDetail}
              alt="Push-up exercise detail showing a finished 3D animated demonstration"
              onClick={() => openModal(oaExerciseDetail)}
            />
            <ShotCaption>
              A push-up gets the real treatment — this is what's supposed to
              be there.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaSquats}
              alt="Squats exercise detail showing a finished 3D animated demonstration"
              onClick={() => openModal(oaSquats)}
            />
            <ShotCaption>Squats — same treatment, same quality.</ShotCaption>
          </Shot>
        </Grid3>
        <Paragraph>
          The clearest lesson: wrong build order. Every screen shipped before
          the animation pipeline did, and that pipeline — not the UI — was
          the real bottleneck, since a 3D model per exercise takes per-asset
          effort that doesn't scale the way screen design does. Next time:
          prove the pipeline on a handful of exercises first, then build the
          screens around it.
        </Paragraph>
      </CaseStudySection>

      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <ModalImage src={modalSrc} alt="" onClick={(e) => e.stopPropagation()} />
        </ModalOverlay>
      )}
    </>
  );
}
