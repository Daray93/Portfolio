import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiX, FiVolume2, FiVolumeX } from "react-icons/fi";
import CaseStudyFab from "../../components/case-study/CaseStudyFab";
import AboutMeScene, { TURNS } from "./AboutMeScene";
import useAmbientSound from "./useAmbientSound";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

// How long (seconds) the intro label holds at full opacity before fading
// itself out -- a timer, not scroll: it plays the same way whether the
// visitor sits still or scrolls straight through it.
const INTRO_HOLD_SECONDS = 5.5;
const INTRO_FADE_SECONDS = 1;

// Fixed palette, deliberately independent of the site's own light/dark
// theme -- this page is meant to read as its own cinematic space rather
// than a themed section of the portfolio (chromeless route, see App.jsx).
const PAPER = "#f5f4f0";
const BLACK = "#0a0a0a";
// EXPERIMENT: the sky (AboutMeScene's SKY_PALETTES) is now a light
// cream/white family (brand tokens from theme.js) instead of a
// dark-to-light day cycle, so the near-white PAPER chrome this page
// originally used for the progress track/fill/dots and the close/sound
// buttons has nowhere near enough contrast against it -- both were
// designed to read as light marks on a dark sky. INK is that chrome's
// replacement: the same near-black theme.js uses for body text
// (`text: "#17171a"`), used everywhere PAPER used to carry the "visible
// against the sky" job -- so black/cream carry the weight here too, the
// same as the sky. VIOLET is now only the accent highlight (the
// milestone glow + its focus ring), matching the brand's actual accent
// (`accent: "#6c5ce7"`) rather than the brighter violet tried first.
// CONTROL_BG/BORDER are a separate, deliberately opaque-ish dark chip for
// the close/sound buttons specifically, since those need to stay legible
// (and keep a real 3:1 boundary) against every point in the sky's
// gradient, not just blend into whichever stop happens to be showing.
const INK = "#17171a";
const VIOLET = "#6c5ce7";
const GLOW_EDGE = "#cabdf5";
const CONTROL_BG = "rgba(23, 23, 26, 0.72)";
const CONTROL_BG_HOVER = "rgba(23, 23, 26, 0.9)";
const CONTROL_BORDER = "rgba(255, 255, 255, 0.35)";
const CONTROL_BORDER_HOVER = "rgba(255, 255, 255, 0.6)";

// How long the exit cover takes to fade fully opaque before the scroll
// reset + navigate fire underneath it -- see goHome below.
const EXIT_FADE_SECONDS = 0.32;

export default function AboutMe() {
  const navigate = useNavigate();
  const { enabled: soundOn, toggle: toggleSound } = useAmbientSound();
  const [exiting, setExiting] = useState(false);

  // The flight itself gets its own dedicated, generously tall scroll
  // region (FlightSpacer) so its pace is set purely by that region's
  // height -- independent of the intro's length -- rather than being
  // compressed into whatever's left of the whole document. This is
  // what the model/track in AboutMeScene actually animate against; the
  // model stays hidden until this local progress starts moving, which
  // only happens once the visitor has scrolled past the intro.
  const flightSpacerRef = useRef(null);
  // "end end", not "end start" -- FlightSpacer is the last thing on the
  // page (CaseStudyFab below is fixed-position, contributing no height),
  // so reaching "end start" (the spacer's bottom aligned with the
  // viewport's TOP) would need a full extra viewport-height of scrollable
  // room after it that doesn't exist. The browser hits the document's
  // actual bottom first, capping native scroll short of it -- which read
  // as progress never quite reaching 1.0 (the bar wouldn't fill, and the
  // exit sequence never fired). "end end" (spacer's bottom aligned with
  // the viewport's BOTTOM) lands exactly on the natural max scroll
  // position instead, so 100% is always reachable.
  const { scrollYProgress: flightProgress } = useScroll({
    target: flightSpacerRef,
    offset: ["start start", "end end"],
  });
  // The Three.js scene reads this every animation frame off a plain ref
  // instead of a prop, so 60fps camera/model updates don't route through
  // React state/re-renders -- see AboutMeScene.
  const flightProgressRef = useRef(0);
  useMotionValueEvent(flightProgress, "change", (v) => {
    flightProgressRef.current = v;
  });

  // Drives the progress line below -- clamped to 0-100% by useTransform,
  // so it reads empty during the intro and full once the flight (and the
  // creature's own exit) completes, rather than over/undershooting
  // outside that range the way the raw motion value can (see the clamp
  // on flightProgressRef.current above).
  const progressFillWidth = useTransform(flightProgress, [0, 1], ["0%", "100%"]);

  // Collapses back to the homepage, sharing layoutId="morph-about-me"
  // with the grid cell there so the page shrinks back into it rather than
  // just swapping. That projection captures this page's CURRENT on-screen
  // rect as its "from" state the instant the route changes -- and by the
  // time the flight actually ends, the visitor is scrolled to the bottom
  // of a ~2200vh page, so Frame's real bounding box is a sliver at the
  // very bottom of something enormous, almost entirely off-screen above
  // the viewport. Morphing THAT into the small grid cell is what read as
  // "buggy": nothing visible tracks correctly, and it just hard-cuts once
  // the transition timer runs out instead of going straight there.
  // Resetting scroll first makes Frame's captured rect a normal,
  // on-screen, viewport-sized box again, same as if the visitor had
  // simply clicked the close button from the top of the page.
  //
  // window.scrollTo(0, 0) on a 2200vh page is an instant jump, not a
  // scroll -- with nothing covering the screen first, that read as the
  // whole flight rewinding in a visible flash right before the route
  // change. Fading ExitCover in and doing the reset+navigate underneath
  // it (see the effect below) hides that jump entirely instead.
  const goHome = useCallback(() => {
    setExiting(true);
  }, []);

  useEffect(() => {
    if (!exiting) return undefined;
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      navigate("/");
    }, EXIT_FADE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [exiting, navigate]);

  // Inverts the same "start start" / "end end" mapping useScroll above
  // uses to produce flightProgress -- t=0 is scrollY sitting at
  // FlightSpacer's own (document, not viewport) top, t=1 is scrollY at
  // spacerHeight - viewportHeight past that (the scroll position where
  // the spacer's bottom aligns with the viewport's bottom, not its top --
  // see the offset comment above). getBoundingClientRect().top + scrollY
  // for the top reference works regardless of anything else on the page
  // shifting the spacer's offsetParent.
  const scrollToChapter = useCallback((t) => {
    const spacer = flightSpacerRef.current;
    if (!spacer) return;
    const documentTop = spacer.getBoundingClientRect().top + window.scrollY;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: documentTop + t * (spacer.offsetHeight - window.innerHeight),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <>
      <title>About me — Dara Phillips</title>
      <meta
        name="description"
        content="This is an about-me told as a scroll-driven flight instead of a boring ass bullet list."
      />

      <AboutMeScene flightProgressRef={flightProgressRef} onJourneyEnd={goHome} />

      <ProgressTrack>
        <ProgressFill style={{ width: progressFillWidth }} />
        {TURNS.map((turn, i) => (
          <ProgressMilestoneItem
            key={turn.eyebrow}
            turn={turn}
            prevT={TURNS[i - 1]?.t ?? 0}
            nextT={TURNS[i + 1]?.t ?? 1}
            flightProgress={flightProgress}
            onSelect={scrollToChapter}
          />
        ))}
      </ProgressTrack>

      <CloseButton type="button" aria-label="Close, back to home" onClick={goHome}>
        <FiX />
      </CloseButton>

      <SoundButton
        type="button"
        aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
        aria-pressed={soundOn}
        onClick={toggleSound}
      >
        {soundOn ? <FiVolume2 /> : <FiVolumeX />}
      </SoundButton>

      <Frame layoutId="morph-about-me" layout transition={MORPH_TRANSITION}>
        <Intro
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: INTRO_FADE_SECONDS, delay: INTRO_HOLD_SECONDS, ease: "easeInOut" }}
        >
          <IntroLabel
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            // Delay starts just after MORPH_TRANSITION's own 0.5s duration
            // finishes, not immediately -- arriving here from the homepage
            // grid cell means Frame (this element's ancestor) is ALSO
            // running its own layoutId scale/position animation for that
            // same window. A child independently animating opacity/y
            // while an ancestor is mid layout-projection is what read as
            // a flicker: framer applies scale-correction transforms to
            // descendants throughout the parent's animation, which fights
            // this element's own transform if both are moving at once. A
            // direct page load has no morph to wait out, so this just
            // reads as a slightly later, still-clean fade-in there.
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Scroll to fly in
          </IntroLabel>
        </Intro>

        {/* Reserves the scroll distance the whole flight (model
            appearing, following the track, fading out) plays out over --
            tall on purpose, so the journey reads as controlled/deliberate
            rather than rushed. Raise/lower this height to re-pace it. */}
        <FlightSpacer ref={flightSpacerRef} aria-hidden="true" />
      </Frame>

      <CaseStudyFab />

      <AnimatePresence>
        {exiting && (
          <ExitCover
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: EXIT_FADE_SECONDS, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- layout shell ---------------- */

// Shares layoutId with the homepage cell's own frame (see Splash.jsx's
// cell 15) -- growing straight into the page background rather than a
// card floating on top of it. Radius/border/shadow settle to
// zero-strength (not the keyword "none", which framer can't interpolate
// a layout animation to/from) so the morph lands on a normal full-bleed
// page. Background is transparent so the fixed canvas (AboutMeScene, a
// sibling behind this) shows through everywhere.
const Frame = styled(motion.div)`
  position: relative;
  width: none;
  min-height: 100vh;
  overflow: hidden;
  background: transparent;
  color: ${BLACK};
  border-radius: 0;
  border: 1px solid transparent;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);

  /* Layered over the fixed AboutMeScene sky/canvas (z-index 0/1) and
     under the always-on close/sound buttons (z-index 20). */
  z-index: 2;
`;

// A thin horizontal line centred along the bottom edge, clear of the
// close/sound buttons (top-anchored) and any FAB in the corner --
// deliberately not full-width, so it reads as a minimal instrument
// rather than a loading bar.
const ProgressTrack = styled.div`
  position: fixed;
  left: 50%;
  bottom: clamp(1.5rem, 4vh, 2.5rem);
  transform: translateX(-50%);
  width: min(70vw, 640px);
  height: 2px;
  border-radius: 999px;
  background: rgba(58, 34, 96, 0.18);
  z-index: 20;
`;

const ProgressFill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  background: ${INK};
`;

// One per caption, plotted at that chapter's own `t` (see TURNS in
// AboutMeScene) -- a milestone map of where the story's text blocks sit
// along the flight, not just a generic loading bar. A real <button>
// (not a styled div) so it's reachable by keyboard/AT and gets a proper
// click target -- sized well beyond the visible dot for touch, with the
// dot itself just one of its centred children.
const ProgressMilestoneButton = styled.button`
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid ${VIOLET};
    outline-offset: 3px;
    border-radius: 50%;
  }
`;

// A soft violet-to-pink glow that crossfades in as the flight approaches
// a milestone and back out past it (see the useTransform input range in
// ProgressMilestoneItem) -- a moving spotlight handing off between
// chapters, rather than a flat "reached" state. Was violet-to-amber;
// amber read as a clash once the sky itself became a white/violet
// family, so the outer stop moved to a pink-violet that's actually part
// of that palette (matches the sky's own blue-hour glow stop) instead of
// fighting it.
const ProgressMilestoneGlow = styled(motion.div)`
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: radial-gradient(circle, ${VIOLET} 0%, ${GLOW_EDGE} 55%, transparent 75%);
  filter: blur(3px);
  pointer-events: none;
`;

const ProgressMilestoneDot = styled(motion.div)`
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${INK};
  pointer-events: none;
`;

// Split into its own component (rather than inlined in the .map() below)
// because each instance needs its own useTransform calls -- calling
// hooks a variable number of times inside a .map() callback isn't valid,
// but a fixed-shape child component rendered once per milestone is.
function ProgressMilestoneItem({ turn, prevT, nextT, flightProgress, onSelect }) {
  // Solid once passed, dim before -- a quick ease rather than an
  // instant snap, over the last little sliver of approach.
  const dotOpacity = useTransform(flightProgress, [Math.max(0, turn.t - 0.015), turn.t], [0.3, 1]);
  // Peaks exactly at this milestone's own t and eases to 0 at its
  // NEIGHBOURS' t values, so as progress moves from one chapter to the
  // next, the glow hands off smoothly between them instead of popping
  // on/off.
  const glowOpacity = useTransform(flightProgress, [prevT, turn.t, nextT], [0, 1, 0]);

  return (
    <ProgressMilestoneButton
      type="button"
      style={{ left: `${turn.t * 100}%` }}
      onClick={() => onSelect(turn.t)}
      aria-label={`Jump to chapter: ${turn.heading}`}
    >
      <ProgressMilestoneGlow style={{ opacity: glowOpacity }} />
      <ProgressMilestoneDot style={{ opacity: dotOpacity }} />
    </ProgressMilestoneButton>
  );
}

// A dark, deliberately opaque-ish chip rather than the near-white PAPER
// treatment this used before -- that only had contrast against the old
// dark sky. The sky's a light white/violet gradient now and drifts
// through several pastel stops, so this can't rely on any one of them
// for contrast; it has to carry its own against all of them, in both
// idle and hover states, which is what CONTROL_BG's opacity is tuned
// for. Hover used to fade toward transparent (fine against a dark sky,
// meant the button "resolved into" the surroundings) -- against a light
// sky that read as the button vanishing, so hover now deepens instead.
const FixedIconButton = styled.button`
  position: fixed;
  top: clamp(1rem, 2.5vw, 1.5rem);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${CONTROL_BORDER};
  background: ${CONTROL_BG};
  backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  z-index: 20;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: ${CONTROL_BG_HOVER};
    border-color: ${CONTROL_BORDER_HOVER};
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 3px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CloseButton = styled(FixedIconButton)`
  right: clamp(1rem, 2.5vw, 1.5rem);
`;

// Covers the whole screen (above the close/sound buttons and the
// progress track) while goHome's scroll reset + navigate fire underneath
// it -- see the comment on goHome above.
const ExitCover = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 30;
  background: ${PAPER};
  pointer-events: none;
`;

const SoundButton = styled(FixedIconButton)`
  right: clamp(4.25rem, 8vw, 5rem);
`;

/* ---------------- intro ---------------- */

const Intro = styled(motion.section)`
  position: fixed;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 1.5rem 4rem;
  pointer-events: none;
`;

// Height here is the single dial for flight pacing -- taller means more
// scrolling per unit of path travel, i.e. a slower, more controlled
// journey. See flightProgress above. (AboutMeScene also eases the raw
// scroll value over time -- see PATH_SMOOTHING_RATE -- so motion never
// snaps to a wheel/trackpad jump even on a shorter spacer than this.)
const FlightSpacer = styled.div`
  height: 2200vh;
`;

// The intro's only line now -- same muted treatment the old "Not Your
// Usual About Page" eyebrow had, just repurposed as the scroll cue.
const IntroLabel = styled(motion.span)`
  font-family: "Fraunces Variable", serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(10, 10, 10, 0.6);
`;

