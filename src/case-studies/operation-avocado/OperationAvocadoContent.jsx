import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { CaseStudySection, CaseStudyHero } from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import AvocadoJumpingJack from "./AvocadoJumpingJack";

import oaLogin from "./assets/oa-login.png";
import oaOnboarding01 from "./assets/oa-onboarding-01-goal-tip.png";
import oaOnboarding08 from "./assets/oa-onboarding-08-goal-target.png";
import oaOnboarding10 from "./assets/oa-onboarding-10-plan-ready.png";
import oaPlan from "./assets/oa-plan-default.png";
import oaPlanModal from "./assets/oa-plan-choose-workout.png";
import oaWorkoutsHub from "./assets/oa-workouts-hub.png";
import oaBuilder from "./assets/oa-workout-builder.png";
import oaExerciseLibrary from "./assets/oa-exercise-library.png";
import oaExerciseDetail from "./assets/oa-exercise-detail.png";
import oaSession from "./assets/oa-workout-session.png";
import oaProgress from "./assets/oa-progress.png";
import oaProfile from "./assets/oa-profile.png";

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
  gap: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.cardInset};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const Shot = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ShotImg = styled.img`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.border};
  cursor: zoom-in;
`;

const ShotCaption = styled.figcaption`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
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

// Fixed size rather than growing from anywhere -- it just fades in, same
// as Kropt/Neuroloop's own hero media, now that there's no homepage->page
// morph to grow out of (see Splash.jsx).
const HeroMedia = styled.div`
  width: min(320px, 46vw);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border-radius: clamp(18px, 2.5vw, 32px);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease both;
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
            <Pill>Full-Stack</Pill>
            <Pill>React / TypeScript</Pill>
            <Pill>Firebase</Pill>
            <Pill>AI-Assisted Build</Pill>
          </PillRow>

          <HeroMedia>
            <AvocadoJumpingJack fill />
          </HeroMedia>

          <Paragraph>
            Operation Avocado is a mobile-first workout tracker built for an audience
            of two: me and my girlfriend. Every workout app worth using hides the
            useful parts — a real custom workout builder, actual progress history,
            more than a token exercise library — behind a subscription. So I designed
            and built our own. No premium tier, no "unlock more workouts" wall, no
            ads for protein powder neither of us asked for.
          </Paragraph>
          <Shot>
            <ShotImg
              src={oaLogin}
              alt="Operation Avocado login screen"
              onClick={() => openModal(oaLogin)}
            />
            <ShotCaption>
              "Less desserts, more operation-avocado" — the product's voice starts
              on screen one.
            </ShotCaption>
          </Shot>
        </CaseStudyHero>

        <RoleContainer>
          <RoleHeading>My Role</RoleHeading>
          I designed the product end to end and drove the build using Claude Code
          as an implementation partner — I set the architecture and direction up
          front (a project spec covering routing, state layering, the
          services/hooks/features split, and design tokens), then largely let it
          run and steered with prompts rather than hand-writing every file.
          Thirteen commits, three weeks, one live app.
        </RoleContainer>
      </CaseStudySection>

      {/* ---------- The User ---------- */}
      <CaseStudySection id="user" title="The User">
        <Paragraph>
          There's no persona deck here — the two users are me and my girlfriend,
          and the interesting design problem was that we don't want the same
          thing. I wanted structured strength work; she wanted something she could
          shape to her own routine. A fixed program for two doesn't work when
          neither of you follows the same one, so the whole app is built around a
          workout <em>builder</em> — pick exercises, tune work/rest/rounds, save it
          as your own template — rather than a locked library of "programs" you're
          stuck picking from, which is the model most of the big apps push you
          toward once you hit their free-tier ceiling.
        </Paragraph>
        <Shot>
          <ShotImg
            src={oaOnboarding10}
            alt="Onboarding summary showing a personalised plan"
            onClick={() => openModal(oaOnboarding10)}
          />
          <ShotCaption>
            Onboarding ends with a plan built from your own answers, not a
            generic starter program.
          </ShotCaption>
        </Shot>
      </CaseStudySection>

      {/* ---------- Vision ---------- */}
      <CaseStudySection id="vision" title="Vision">
        <Paragraph>
          The reference point for the core workout mechanic was the classic Seven
          Minute Workout — a tight, timed circuit — which I adapted into a proper
          builder rather than a fixed routine. Visually the app runs on one
          restrained design language: a single green, a token-based design system,
          and a component kit with a live playground page so it stayed consistent
          as features got added quickly.
        </Paragraph>
        <Paragraph>
          One deliberate personal touch: the in-workout coaching lines are voiced,
          and I wanted an Irish voice — because I'm Irish, and every fitness app
          defaults to the same generic American trainer energy. Little things like
          that are what make an app feel like <em>yours</em> instead of a
          template.
        </Paragraph>
        <Callout>
          Design principles: one accent colour, generous touch targets, and
          feedback (sound, vibration, streaks) that nudges without nagging.
        </Callout>
      </CaseStudySection>

      {/* ---------- Process ---------- */}
      <CaseStudySection id="process" title="Process">
        <Paragraph>
          The onboarding is one-pass — goals, injuries, schedule, asked once,
          never repeated — and I leaned on a couple of behavioural-design touches:
          a tailored "tip" line after you answer the goal question (reciprocity —
          give something useful back before asking the next question), and an
          anchoring line on the frequency step ("most trainers recommend 3–4 days")
          to nudge realistic answers rather than aspirational ones nobody sticks
          to.
        </Paragraph>
        <Shot>
          <ShotImg
            src={oaOnboarding01}
            alt="Onboarding goal step showing a tailored tip"
            onClick={() => openModal(oaOnboarding01)}
          />
          <ShotCaption>
            Each answer earns a short, specific tip before the next question —
            reciprocity, not just data collection.
          </ShotCaption>
        </Shot>
        <Shot>
          <ShotImg
            src={oaOnboarding08}
            alt="Onboarding goal target step with a date to work toward"
            onClick={() => openModal(oaOnboarding08)}
          />
          <ShotCaption>
            A specific goal and a date, not a vague intention — this is what the
            app reminds you of later.
          </ShotCaption>
        </Shot>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaPlan}
              alt="Plan home screen"
              onClick={() => openModal(oaPlan)}
            />
            <ShotCaption>
              The home screen for a given day — a streak, and a straight choice
              between a workout, a logged activity, or a rest day.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaPlanModal}
              alt="Choosing between a ready-made workout and creating a custom one"
              onClick={() => openModal(oaPlanModal)}
            />
            <ShotCaption>
              Ready-made sessions sit alongside "create your own" — neither is
              the default the app pushes you toward.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaWorkoutsHub}
              alt="Workouts hub with focus-area browsing"
              onClick={() => openModal(oaWorkoutsHub)}
            />
            <ShotCaption>Browse by focus area, or go straight to custom.</ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaBuilder}
              alt="Workout builder with a selected exercise and settings"
              onClick={() => openModal(oaBuilder)}
            />
            <ShotCaption>
              The builder — this is the feature the whole app exists to make
              free.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaExerciseLibrary}
              alt="Exercise library with filters and a low-impact toggle"
              onClick={() => openModal(oaExerciseLibrary)}
            />
            <ShotCaption>117 exercises, filterable by area and impact.</ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaExerciseDetail}
              alt="Exercise detail showing a 3D animated demonstration"
              onClick={() => openModal(oaExerciseDetail)}
            />
            <ShotCaption>
              Exercises render as live 3D models rather than looping GIFs — still
              being reworked, so this is an early pass, not the polished version.
            </ShotCaption>
          </Shot>
        </Grid2>
        <Shot>
          <ShotImg
            src={oaSession}
            alt="A workout session in progress with a countdown timer"
            onClick={() => openModal(oaSession)}
          />
          <ShotCaption>Mid-session — timer, rep count, and the same 3D demo.</ShotCaption>
        </Shot>

        <Paragraph>
          Two build decisions worth calling out. First, the 3D exercise demos:
          Mixamo rigs rendered live via <code>react-three-fiber</code>, normalised
          to a consistent height regardless of the source rig's scale — genuinely
          fiddly, since mesh bounds aren't reliable for a skinned character
          mid-animation, so the scaling reads the skeleton's rest-pose bone
          positions instead. Second, push notifications run on an hourly GitHub
          Actions cron job hitting Firebase Cloud Messaging directly, instead of a
          paid Firebase Cloud Function — a small decision, but one that mirrors the
          whole reason the app exists: don't pay for what you don't have to.
        </Paragraph>
      </CaseStudySection>

      {/* ---------- Challenges / Insights ---------- */}
      <CaseStudySection id="challenges" title="Challenges / Insights">
        <Grid3>
          <Card>
            <h4>iOS is difficult about this</h4>
            <p>
              Web push on iPhone only works if the app is added to the Home
              Screen (iOS 16.4+) — not from a normal Safari tab. Not a bug, just a
              platform wall.
            </p>
          </Card>
          <Card>
            <h4>Normalising arbitrary 3D rigs</h4>
            <p>
              Scaling every exercise model to the same on-screen height meant
              reading skeleton bone positions, not mesh bounds — a fiddly problem
              for what looks, on the surface, like "just show an exercise."
            </p>
          </Card>
          <Card>
            <h4>Steering an AI-driven build</h4>
            <p>
              Letting Claude run fast is only safe if the architecture is decided
              first — the services/hooks/features split and design tokens were
              non-negotiable up front, specifically so a fast build didn't turn
              into an inconsistent one.
            </p>
          </Card>
        </Grid3>
      </CaseStudySection>

      {/* ---------- Results ---------- */}
      <CaseStudySection id="results" title="Results">
        <Paragraph>
          Operation Avocado is live today, and it's what my girlfriend and I
          actually use to build and run our own workouts. It's not a highlight
          reel — the calendar shows missed days same as logged ones — but that's
          the honest state of a tool built for two real people rather than a demo
          audience.
        </Paragraph>
        <Grid2>
          <Shot>
            <ShotImg
              src={oaProgress}
              alt="Progress page showing a personal goal and a monthly calendar"
              onClick={() => openModal(oaProgress)}
            />
            <ShotCaption>
              A real goal, a real calendar — including the days that didn't
              happen.
            </ShotCaption>
          </Shot>
          <Shot>
            <ShotImg
              src={oaProfile}
              alt="Profile page with training level and notification settings"
              onClick={() => openModal(oaProfile)}
            />
            <ShotCaption>Training level adjusts the workouts immediately, no re-onboarding.</ShotCaption>
          </Shot>
        </Grid2>
      </CaseStudySection>

      <OtherProjects currentProjectId="operation-avocado" />

      {modalSrc && (
        <ModalOverlay onClick={closeModal}>
          <ModalImage src={modalSrc} alt="" onClick={(e) => e.stopPropagation()} />
        </ModalOverlay>
      )}
    </>
  );
}
