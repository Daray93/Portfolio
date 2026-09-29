import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiArrowUpRight } from "react-icons/fi";
import ProjectMedia from "../showcase/ProjectMedia";
import Tagline from "../showcase/Tagline";
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
// Pulling back (mouse and trackpad only): scrolling up while the page is at
// the top shrinks the frame a little and fills the ring round
// "All work"'s arrow, both following the gesture smoothly. No words: the
// frame giving way is the feedback. Past PULL_COMMIT the ring is full and
// lifts; letting go there plays the way home -- the frame shrinks back into
// its card on the homepage, starting from exactly the size the pull left it
// at. Let go short and everything eases back. Nothing goes home until the
// visitor lets go, and scrolling up the page into the top never pulls on
// its own (see TOP_REST_MS).
//
// Not on touch screens: dragging down at the top of a page is the browser's
// own pull-to-refresh there, and the two fought (it refreshed as it left).
// There "All work" is a plain back button, arrow pointing back, and the
// phone's own back gesture plays the same way home.

// gesture distance (px) to fill the ring -- a deliberate pull, not a flick
const PULL_COMMIT = 360;
// how far the frame shrinks by the time it commits (0.1 = to 90%)
const PULL_SHRINK = 0.1;
// ignore input for a moment after arriving, so momentum from the homepage
// can't pull the visitor straight back
const PULL_ARM_MS = 900;
// a pause this long in wheel input counts as letting go -- long enough that
// the steps of a notched mouse wheel still add up to one pull
const WHEEL_RELEASE_MS = 320;
// Scrolling up the page and hitting the top doesn't start a pull: the
// scroll that got there (momentum included) has to stop for this long
// first, so only a fresh gesture at the top can take the visitor home.
const TOP_REST_MS = 350;
// How closely the shown pull chases the gesture, per frame (0-1): lower is
// smoother and lazier. Following a pull, then easing back after letting go.
const FOLLOW = 0.16;
const SETTLE = 0.07;
// Hovering "All work" shows the start of a pull: the ring this full
// (HOVER_PULL), and the frame at the size a pull that far gives it (the
// same curve as the gesture's `draw`).
const HOVER_PULL = 0.5;
const HOVER_SCALE = 1 - PULL_SHRINK * (1 - (1 - HOVER_PULL) ** 2);
// "or scroll up" under "All work": shown on the first case study of a
// visit only (remembered for the browser session), then never again
const PULL_HINT_KEY = "cover-pull-hint-shown";
// touch screens with no mouse or trackpad: no pull (see above)
const TOUCH_ONLY = "(hover: none) and (pointer: coarse)";
const PULL_HINT_S = 3.6;

// the hint's one showing: in after the title, a moment to read, out
const hintOnce = keyframes`
  0%   { opacity: 0; transform: translateY(-4px); }
  12%  { opacity: 1; transform: none; }
  82%  { opacity: 1; transform: none; }
  100% { opacity: 0; transform: none; }
`;

// the first case study of this visit, and the gesture is on
function firstPullHint(reduced) {
  if (reduced || window.matchMedia(TOUCH_ONLY).matches) return false;
  try {
    return !sessionStorage.getItem(PULL_HINT_KEY);
  } catch {
    return false;
  }
}

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
  transition: transform ${dur.slow}s ${ease.out};

  @media ${COVER_PHONE_QUERY} {
    border-radius: ${COVER_RADIUS.phone}px;
    clip-path: inset(0 round ${COVER_RADIUS.phone}px);
  }

  /* Hovering "All work" previews the way back: exactly the start of a pull
     -- the ring half full, and the frame shrunk toward its centre by as
     much as a pull that far would (HOVER_SCALE), the first step of
     shrinking home into its card. The button moves with the frame, like
     everything on it (its hover area has room to spare for that -- see
     Back). Not while a real pull is on. */
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    &:has([data-back]:hover):not(:has([data-pull="on"], [data-pull="full"])) {
      transform: scale(${HOVER_SCALE});
    }
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

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// Keeps the title legible whatever the media is: a shade low down, only
// behind the text (the top needs none -- "All work" and "Visit app" carry
// their own glass). It fades in with the title rather than being there
// when the card lands, so the cover first looks exactly like the card it
// grew from, and the shade reads as part of the title arriving.
const Scrim = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 26%, transparent 46%);
  pointer-events: none;
  animation: ${fadeIn} ${dur.slow}s ${EASE} 0.2s both;

  /* narrow screens: the title and details wrap onto more lines, so the
     shade reaches higher */
  @media (max-width: 900px) {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.35) 36%, transparent 58%);
  }
`;

// "All work", its arrow in a ring that fills as the visitor pulls back
// (--pull, 0 to 1, set by the gesture; data-pull="on" while pulling,
// "full" when letting go would go home).
const TopBar = styled.div`
  --pull: 0;
  position: absolute;
  top: 20px;
  left: 32px;
  z-index: 1;
  animation: ${fadeUp} ${dur.slow}s ${EASE} 0.2s both;

  @media (max-width: 640px) {
    top: 12px;
    left: 12px;
  }
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  position: relative;

  /* extra hover room all round: hovering shrinks the frame and carries the
     button a little way inward (see Frame), and the pointer should still
     be on it when it gets there, not flicker the hover off and on */
  &::before {
    content: "";
    position: absolute;
    inset: -48px;
  }
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;

  &:hover {
    color: #fff;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
    border-radius: 999px;
  }
`;

const Ring = styled.span`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  transition:
    transform ${dur.base}s ${EASE},
    background-color ${dur.fast}s ${EASE};

  > svg.pull,
  > svg.back {
    width: 20px;
    height: 20px;
  }

  /* up (scroll up to go back) where the pull is; the usual back arrow on
     touch screens, where there's no pull */
  > svg.back {
    display: none;
  }
  @media ${TOUCH_ONLY} {
    > svg.pull {
      display: none;
    }
    > svg.back {
      display: block;
    }
  }

  svg.ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }

  circle {
    fill: none;
    stroke-width: 2;
  }

  /* the track: a faint hairline always, so the ring reads as a button */
  circle:first-child {
    stroke: rgba(255, 255, 255, 0.3);
  }

  /* the fill, driven every frame by the gesture (no CSS transition: the
     gesture code smooths it) */
  circle:last-child {
    stroke: #fff;
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - var(--pull) * 100);
    opacity: min(1, calc(var(--pull) * 8));
  }

  /* On hover, a short stretch of the ring draws in and eases back: a quiet
     hint that it fills, so a pull at the top later reads as familiar. Only
     for pointers that hover, not with reduced motion, and never while a
     pull is drawing the real fill. */
  circle.hint {
    stroke: rgba(255, 255, 255, 0.75);
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    opacity: 0;
    transition:
      stroke-dashoffset ${dur.slow}s ${EASE},
      opacity ${dur.base}s ${EASE};
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    ${Back}:hover & circle.hint {
      stroke-dashoffset: ${100 - HOVER_PULL * 100};
      opacity: 1;
    }
  }

  [data-pull="on"] & circle.hint,
  [data-pull="full"] & circle.hint {
    opacity: 0;
  }

  ${Back}:hover & {
    background: rgba(0, 0, 0, 0.3);
  }

  /* full: a small lift, so "let go now" is felt */
  [data-pull="full"] & {
    transform: scale(1.1);
    background: rgba(0, 0, 0, 0.36);
  }
`;

// The live app, top right, opposite "All work": the same quiet glass as
// its ring, and opening in a new tab so the case study stays open behind.
// Only for projects with a `live` URL (see projects.js).
// Under "All work", once per visit (see PULL_HINT_KEY): the pull exists.
// On its own small glass, since the top of the picture has no shade.
const PullHint = styled.span`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 400;
  white-space: nowrap;
  pointer-events: none;
  animation: ${hintOnce} ${PULL_HINT_S}s ${EASE} 0.9s both;


  /* a pull under way says it all: the hint steps aside */
  [data-pull="on"] > &,
  [data-pull="full"] > & {
    visibility: hidden;
  }
`;

const Visit = styled.a`
  position: absolute;
  top: 20px;
  right: 32px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 18px 0 20px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.18);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  animation: ${fadeUp} ${dur.slow}s ${EASE} 0.2s both;
  transition: background-color ${dur.fast}s ${EASE};

  svg {
    width: 18px;
    height: 18px;
    transition: transform ${dur.base}s ${EASE};
  }

  &:hover {
    color: #fff;
    background: rgba(0, 0, 0, 0.3);
  }

  &:hover svg {
    transform: translate(2px, -2px);
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    top: 12px;
    right: 12px;
    padding: 0 14px 0 16px;
  }
`;

const Caption = styled.div`
  position: absolute;
  left: 40px;
  right: 40px;
  bottom: 40px;
  display: grid;
  /* two groups: the name with its tagline, then the details */
  gap: 32px;
  animation: ${fadeUp} ${dur.slow}s ${EASE} 0.2s both;

  @media (max-width: 640px) {
    bottom: 24px;
    gap: 22px;
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

// the project's name and its tagline, read as one
const Heading = styled.div`
  display: grid;
  gap: 12px;

  @media (max-width: 640px) {
    gap: 8px;
  }
`;

const Lede = styled.p`
  margin: 0;
  max-width: 32ch;
  font-size: clamp(1.1rem, 1.9vw, 1.6rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.92);
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
  const barRef = useRef(null);
  // shown on this cover only if it's the first of the visit
  const [pullHint] = useState(() => firstPullHint(reduced));
  useEffect(() => {
    if (!pullHint) return;
    try {
      sessionStorage.setItem(PULL_HINT_KEY, "1");
    } catch {
      // storage blocked -- it'll just show again on the next case study
    }
  }, [pullHint]);

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
    const bar = barRef.current;
    // reduced motion: no gesture at all -- "All work" and the browser's back
    // button still take the visitor home
    if (!frame || reduced || window.matchMedia(TOUCH_ONLY).matches) return undefined;
    const armedAt = performance.now() + PULL_ARM_MS;
    const html = document.documentElement;
    const prevOverscroll = html.style.overscrollBehaviorY;
    // stop the browser's own bounce fighting the pull
    html.style.overscrollBehaviorY = "none";

    // pull: the gesture so far; shown: what's drawn, chasing it each frame
    let pull = 0;
    let shown = 0;
    let following = false;
    let raf = 0;
    let released = 0;
    let gone = false;
    // at the top, and the scroll that brought the page there has stopped
    // (see TOP_REST_MS); true on arrival, when the cover is already showing
    let rested = window.scrollY <= 0;
    let restTimer = 0;

    const armed = () => performance.now() > armedAt && rested;
    const atTop = () => window.scrollY <= 0;
    const settleAtTop = () => {
      clearTimeout(restTimer);
      restTimer = setTimeout(() => {
        rested = atTop();
      }, TOP_REST_MS);
    };

    // draw the shown pull: the frame gives way (quick at first, easing off
    // toward the commit) and the ring fills
    const draw = () => {
      const t = Math.min(shown / PULL_COMMIT, 1);
      const eased = 1 - (1 - t) * (1 - t);
      frame.style.transform = t > 0.0005 ? `scale(${1 - PULL_SHRINK * eased})` : "";
      bar?.style.setProperty("--pull", t.toFixed(4));
    };
    const tick = () => {
      const k = following ? FOLLOW : SETTLE;
      shown += (pull - shown) * k;
      if (Math.abs(pull - shown) < 0.5) shown = pull;
      draw();
      // back at rest: hand the frame back to its CSS (the hover's ease)
      if (shown === 0 && pull === 0) frame.style.transition = "";
      raf = shown === pull ? 0 : requestAnimationFrame(tick);
    };
    const animate = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    let full = false;
    const setFull = (next) => {
      // the moment it fills, a short buzz where the phone supports it
      // (Android; iPhones ignore it), so "let go now" is felt
      if (next && !full) {
        try {
          navigator.vibrate?.(12);
        } catch {
          // not allowed here -- the ring's lift still shows it
        }
      }
      full = next;
      if (!bar) return;
      if (next) bar.dataset.pull = "full";
      else bar.dataset.pull = pull > 0 ? "on" : "";
    };

    // past the commit point it holds there (a little give, no more), and
    // waits for the visitor to let go
    const pullBy = (px) => {
      if (gone) return;
      following = true;
      frame.style.transition = "none";
      pull = Math.min(Math.max(0, pull + px), PULL_COMMIT * 1.08);
      setFull(pull >= PULL_COMMIT);
      animate();
    };
    const release = () => {
      if (gone || pull === 0) return;
      if (pull >= PULL_COMMIT) {
        gone = true;
        cancelAnimationFrame(raf);
        raf = 0;
        goHome();
        return;
      }
      // let go short: everything eases back
      following = false;
      pull = 0;
      setFull(false);
      animate();
    };

    const onScroll = () => {
      if (!atTop()) {
        rested = false;
        clearTimeout(restTimer);
      } else if (!rested) {
        settleAtTop();
      }
    };

    const onWheel = (e) => {
      if (gone) return;
      if (!rested) {
        // still the scroll that reached the top: wait for it to stop
        if (atTop()) settleAtTop();
        return;
      }
      if (!armed()) return;
      if (e.deltaY < 0 && atTop()) pullBy(-e.deltaY);
      else if (pull > 0 && e.deltaY > 0) pullBy(-e.deltaY);
      else return;
      clearTimeout(released);
      released = setTimeout(release, WHEEL_RELEASE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(released);
      clearTimeout(restTimer);
      html.style.overscrollBehaviorY = prevOverscroll;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, [goHome, reduced]);

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

      <TopBar ref={barRef}>
        <Back
          to="/"
          aria-label="Back to all work"
          data-back
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            goHome();
          }}
        >
          <Ring aria-hidden="true">
            <svg className="ring" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="23" pathLength="100" />
              <circle className="hint" cx="24" cy="24" r="23" pathLength="100" />
              <circle cx="24" cy="24" r="23" pathLength="100" />
            </svg>
            <FiArrowUp className="pull" />
            <FiArrowLeft className="back" />
          </Ring>
          <RollText hover="All work">All work</RollText>
        </Back>
        {pullHint && (
          <PullHint aria-hidden="true">
            or scroll up
          </PullHint>
        )}
      </TopBar>

      {project.live && (
        <Visit href={project.live} target="_blank" rel="noopener noreferrer">
          Visit app
          <FiArrowUpRight aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </Visit>
      )}

      <Caption>
        <Heading>
          <Title>{project.title}</Title>
          <Lede>
            <Tagline project={project} />
          </Lede>
        </Heading>
        <Meta>
          <span>
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
