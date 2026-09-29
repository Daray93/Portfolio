import { forwardRef, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FiArrowDown, FiArrowLeft } from "react-icons/fi";
import ProjectMedia from "../showcase/ProjectMedia";
import RollText from "../shared/RollText";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { ease, dur } from "../../styles/motion";
import { COVER_INSET, COVER_RADIUS, COVER_PHONE_QUERY } from "../showcase/coverFrame";
import { useExpandTransition } from "../showcase/ExpandTransition";

// Opener for a case study: a large framed card -- inset from the screen
// edges with rounded corners, on the page's own background --
// showing the same media as the project's carousel card, at exactly the
// size the card scales up to when it's opened (see ExpandTransition and
// coverFrame). The card hands off to this without a visible seam, then the
// title and details fade up over it together.
//
// Pulling back: scrolling up while the page is at the top (or dragging
// down on a phone) shrinks the frame a little, following the gesture. Let go
// early and it springs back; pull past PULL_COMMIT and the way home plays --
// the frame shrinks back into its card on the homepage, starting from
// exactly the size the pull left it at.

// gesture distance (px) at which the pull commits to going home
const PULL_COMMIT = 220;
// how far the frame shrinks by the time it commits (0.1 = to 90%)
const PULL_SHRINK = 0.1;
// ignore input for a moment after arriving, so momentum from the homepage
// can't pull the visitor straight back
const PULL_ARM_MS = 900;
// a pause this long in wheel input counts as letting go
const WHEEL_RELEASE_MS = 160;

const EASE = ease.out;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
`;

const Cover = styled.section`
  width: 100%;
  height: 100vh;
  height: 100dvh; /* the visible height, as the transition measures it */
  padding: ${COVER_INSET.default}px;
  /* the same page as the card transition's curtain, so the handoff between
     them can't show */
  background: ${({ theme }) => theme.body};

  @media ${COVER_PHONE_QUERY} {
    padding: ${COVER_INSET.phone}px;
  }
`;

const Frame = styled.div`
  position: relative;
  height: 100%;
  transform-origin: 50% 50%;
  will-change: transform;
  overflow: hidden;
  isolation: isolate;
  border-radius: ${COVER_RADIUS.default}px;
  /* The rounded corners as an explicit clip too, as on the carousel card:
     overflow + radius alone can stop clipping media on its own layer (a
     video, or the frame mid-pull), and the corners flash square -- most
     visibly as the card transition clears over this frame. */
  clip-path: inset(0 round ${COVER_RADIUS.default}px);
  background: #000;
  color: #fff;

  @media ${COVER_PHONE_QUERY} {
    border-radius: ${COVER_RADIUS.phone}px;
    clip-path: inset(0 round ${COVER_RADIUS.phone}px);
  }
`;

// Its own stacking context: media that layers itself with z-index (the
// avocado rig goes up to 4) stays inside it, under the scrim and the text,
// instead of competing with them.
const Media = styled.div`
  position: absolute;
  inset: 0;
  isolation: isolate;
`;

// keeps the text legible whatever the media is: dark at the bottom where
// the title sits, a little at the top for the back link
const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.35) 38%, transparent 62%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, transparent 18%);
  pointer-events: none;
`;

const Back = styled(Link)`
  position: absolute;
  top: 24px;
  left: 40px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  animation: ${fadeUp} ${dur.slow}s ${EASE} 0.2s both;

  &:hover {
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    top: 16px;
    left: 16px;
  }
`;

const Caption = styled.div`
  position: absolute;
  left: 40px;
  right: 40px;
  bottom: 40px;
  display: grid;
  gap: 16px;
  animation: ${fadeUp} ${dur.slow}s ${EASE} 0.2s both;

  /* clear of the case study's floating bottom bar (CaseStudyFab) */
  @media (max-width: 900px) {
    bottom: 108px;
  }

  @media (max-width: 640px) {
    left: 16px;
    right: 16px;
  }
`;

const Title = styled.p`
  margin: 0;
  font-size: clamp(2.5rem, 7vw, 6.5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
  text-wrap: balance;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 32px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.78);

  strong {
    font-weight: 600;
    color: #fff;
  }

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

const ScrollCue = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;

  svg {
    transition: transform ${dur.base}s ${EASE};
  }

  &:hover svg {
    transform: translateY(3px);
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }
`;

const ProjectCover = forwardRef(function ProjectCover({ project }, ref) {
  const { reduced } = useMotionPreference();
  const { coverReady, coverStartTime, returnFrom } = useExpandTransition();
  const navigate = useNavigate();
  const coverRef = useRef(null);
  const frameRef = useRef(null);

  // hand the frame, as it is right now, to the way-back transition
  const goHome = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) {
      navigate("/");
      return;
    }
    const scale = frame.getBoundingClientRect().width / frame.offsetWidth || 1;
    const radius = (parseFloat(getComputedStyle(frame).borderRadius) || 20) * scale;
    const video = frame.querySelector("video");
    returnFrom(project, {
      rect: frame.getBoundingClientRect(),
      radius,
      videoTime: video ? video.currentTime : undefined,
    });
  }, [navigate, project, returnFrom]);

  // the pull back: see PULL_* above
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const armedAt = performance.now() + PULL_ARM_MS;
    const html = document.documentElement;
    const prevOverscroll = html.style.overscrollBehaviorY;
    // stop the browser's own bounce / pull-to-refresh fighting the pull
    html.style.overscrollBehaviorY = "none";

    let pull = 0;
    let released = 0;
    let touchY = null;
    let gone = false;

    const armed = () => performance.now() > armedAt;
    const atTop = () => window.scrollY <= 0;

    // shrink with the gesture: quick at first, easing off toward the commit
    const show = () => {
      const t = Math.min(pull / PULL_COMMIT, 1);
      const eased = 1 - (1 - t) * (1 - t);
      frame.style.transition = "none";
      frame.style.transform = `scale(${1 - PULL_SHRINK * eased})`;
    };
    const springBack = () => {
      pull = 0;
      frame.style.transition = `transform ${dur.slow}s ${EASE}`;
      frame.style.transform = "";
    };
    const pullBy = (px) => {
      if (gone) return;
      pull = Math.max(0, pull + px);
      if (pull >= PULL_COMMIT) {
        gone = true;
        show();
        goHome();
        return;
      }
      if (pull > 0) show();
      else springBack();
    };

    const onWheel = (e) => {
      if (gone || !armed()) return;
      if (e.deltaY < 0 && atTop()) pullBy(-e.deltaY);
      else if (pull > 0 && e.deltaY > 0) pullBy(-e.deltaY);
      clearTimeout(released);
      released = setTimeout(() => !gone && pull > 0 && springBack(), WHEEL_RELEASE_MS);
    };
    const onTouchStart = (e) => {
      touchY = atTop() && armed() ? e.touches[0].clientY : null;
    };
    const onTouchMove = (e) => {
      if (touchY === null || gone) return;
      const dy = e.touches[0].clientY - touchY;
      pull = 0;
      pullBy(Math.max(0, dy) * 0.9);
    };
    const onTouchEnd = () => {
      touchY = null;
      if (!gone && pull > 0) springBack();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      clearTimeout(released);
      html.style.overscrollBehaviorY = prevOverscroll;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [goHome]);

  const setRefs = (el) => {
    coverRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  const scrollToContent = () => {
    const el = coverRef.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetHeight, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <Cover ref={setRefs} aria-label={project.title}>
      <Frame ref={frameRef}>
      <Media>
        {/* tells the card transition when it's safe to hand over, and starts
            a video on the same frame the transition was showing */}
        <ProjectMedia project={project} onReady={coverReady} startTime={coverStartTime} />
      </Media>
      <Scrim />

      <Back
        to="/"
        aria-label="Back to all work"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          goHome();
        }}
      >
        <RollText hover={<><FiArrowLeft aria-hidden="true" /> All work</>}>
          <FiArrowLeft aria-hidden="true" /> All work
        </RollText>
      </Back>

      <Caption>
        <Title>{project.title}</Title>
        <Meta>
          <span>
            {project.description}
            <br />
            {project.role}
            {project.years && (
              <>
                {" • "}
                <strong>{project.years}</strong>
              </>
            )}
          </span>
          <ScrollCue type="button" onClick={scrollToContent}>
            <RollText hover="Scroll to read">Read the case study</RollText>
            <FiArrowDown aria-hidden="true" />
          </ScrollCue>
        </Meta>
      </Caption>
      </Frame>
    </Cover>
  );
});

export default ProjectCover;
