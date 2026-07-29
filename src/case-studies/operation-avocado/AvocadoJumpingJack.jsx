import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import gsap from "gsap";

import body from "./assets/ao-body.svg";
import leftArm from "./assets/ao-left-arm.svg";
import rightArm from "./assets/ao-right-arm.svg";
import leftLeg from "./assets/ao-left-leg.svg";
import rightLeg from "./assets/ao-right-leg.svg";

// Same solid green as Mobile-Logo-OA.png's background, sampled directly
// from the source file, so this rig reads as a live version of that logo.
const GREEN = "#7BAE45";
// The light-yellow flesh tone right behind the eyes in ao-body.svg --
// used for the blinking eyelids so they disappear into the face.
const EYELID = "#F4E882";

// `$fill`: used standalone (case study preview) it's a bounded, rounded
// square tile; embedded in a homepage grid cell (which isn't square --
// see Splash.jsx's "tall" shape) it just fills whatever box it's given
// and lets the parent cell own the rounding/clipping.
const Stage = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $fill }) => ($fill ? "100%" : "auto")};
  max-width: ${({ $fill }) => ($fill ? "none" : "360px")};
  aspect-ratio: ${({ $fill }) => ($fill ? "auto" : "1 / 1")};
  margin: ${({ $fill }) => ($fill ? "0" : "0 auto")};
  background: ${GREEN};
  border-radius: ${({ $fill }) => ($fill ? "0" : "clamp(18px, 2.5vw, 32px)")};
  overflow: hidden;
`;

// Sits above Rig's top edge in the green header space. Pure-CSS fade/rise
// on hover -- the countdown itself still needs JS (see the interval in
// the component below) but its *entrance* doesn't. Desktop-only in
// practice: there's no hover on touch devices, so it never appears on
// mobile (see the `canHover` check below) -- there the jump animation
// just loops ambiently instead. `$urgent` (last few seconds before the
// set finishes and hands off into the case study) grows the text and
// flips it to a warm red so the handoff reads as imminent rather than
// arriving out of nowhere. Red-on-green fails contrast on its own, so
// urgent state also drops in a near-black pill behind the text rather
// than relying on the coloured text alone.
const TimerLabel = styled.div`
  position: absolute;
  left: 50%;
  top: 17%;
  z-index: 3;
  transform: translate(-50%, -4px);
  font-family: "General Sans", sans-serif;
  font-weight: 600;
  font-size: ${({ $urgent }) => ($urgent ? "clamp(1.3rem, 6cqw, 2rem)" : "clamp(0.9rem, 4cqw, 1.3rem)")};
  color: ${({ $urgent }) => ($urgent ? "#FF6B5E" : "#fff")};
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  padding: ${({ $urgent }) => ($urgent ? "0.15em 0.65em" : "0")};
  background: ${({ $urgent }) => ($urgent ? "rgba(0, 0, 0, 0.82)" : "transparent")};
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease, font-size 0.2s ease,
    color 0.2s ease, padding 0.2s ease, background 0.2s ease;
  pointer-events: none;

  ${Stage}:hover & {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

// Sized/positioned in ao-body.svg's own viewBox units (71 x 119) so the
// limb/eye math below lines up 1:1 with that artwork.
const Rig = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40%;
  aspect-ratio: 71 / 119;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

// Ground contact shadow, kept as a sibling of Rig (not a child) so it
// stays planted while Rig's own `y` jumps -- only its size/opacity
// tweens, in the same timeline, to read as the avocado casting less
// shadow at the top of the jump and more at ground contact. `top` is
// derived from Rig's own geometry (top offset + leg length, converted
// out of Rig-relative % into Stage-relative %) so it lands right under
// the feet at rest instead of floating above or below them.
const Shadow = styled.div`
  position: absolute;
  left: 50%;
  top: 70%;
  width: 48%;
  aspect-ratio: 3 / 1;
  background: #000;
  opacity: 0.32;
  border-radius: 50%;
  filter: blur(1.5px);
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
`;

const Body = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

// Each limb's `left`/`top`/`width` place its bounding box in Rig-relative
// percent, derived from ao-body.svg's viewBox (71x119) and each limb's
// own attachment point within its own artwork -- and `transform-origin`
// is that same attachment point (shoulder for arms, hip for legs)
// expressed as a percent of the limb's own box, so GSAP's `rotation` on
// each swings it from the joint rather than its bounding-box centre.
const Limb = styled.img`
  position: absolute;
  z-index: 1;
  will-change: transform;
`;

// Widened from the original 34-unit-wide artwork to 42 (same per-unit
// scale, so stroke thickness reads the same) -- the extra reach makes
// the arm longer without moving the shoulder pivot, which stays glued
// to the same spot on the body since the box grows away from it.
//
// The SVG's own viewBox has 4 units of margin past the shoulder end (46
// wide, not 42) so the round stroke cap there has room to render fully --
// at 42 wide the cap's ~3.5-unit radius pushed past the viewBox edge and
// got flattened off. width/transform-origin are scaled up to match
// (64.9% / 90.5%, up from 59.3% / 99.1%) so that extra canvas margin is
// invisible: the drawn line and the pivot point land in exactly the same
// place on screen as before, just with the clipping fixed.
const LeftArm = styled(Limb)`
  left: -27.8%;
  top: 9%;
  width: 64.9%;
  aspect-ratio: 46 / 30;
  transform-origin: 90.5% 85%;
`;

// RightArm's own viewBox is 45 (not 42, like LeftArm) so its box keeps
// the same ~3.5-unit cap margin past the hand end that LeftArm gets for
// free from its narrower box. The line itself is drawn the same length
// as LeftArm's (32.63 units, pivot to hand) so the two arms actually
// reach the same distance on screen -- only the box's spare width
// differs, and width is scaled up to match (69.14% vs 64.9%) so the
// per-unit scale stays identical to LeftArm's despite that.
//
// Same round-cap fix as LeftArm, mirrored: RightArm's shoulder end sits
// near the box's *left* edge (x=0.4, not the right like LeftArm's), so
// the 4 units of margin go on the left instead -- the SVG's path shifts
// +4 to make room, and `left` shifts to compensate so the shoulder pivot
// still lands in the same spot rather than sliding right with it.
const RightArm = styled(Limb)`
  left: 54.36%;
  top: 9%;
  width: 69.14%;
  aspect-ratio: 49 / 30;
  transform-origin: 8.98% 85%;
`;

const LeftLeg = styled(Limb)`
  left: -10.6%;
  top: 79%;
  width: 36.6%;
  aspect-ratio: 26 / 40;
  transform-origin: 83% 10%;
`;

const RightLeg = styled(Limb)`
  left: 74.6%;
  top: 79%;
  width: 36.6%;
  aspect-ratio: 26 / 40;
  transform-origin: 15% 10%;
`;

// Socket + pupil sit over ao-body.svg's baked-in eyes (centred roughly
// at 29.3/24.5 and 41.7/24.5 in its 71x119 viewBox) so the live pupil
// visually replaces the flat one drawn into the artwork.
const Eye = styled.div`
  position: absolute;
  top: 17.9%;
  width: 9.07%;
  aspect-ratio: 1 / 1;
  z-index: 3;
`;

const LeftEye = styled(Eye)`
  left: 36.8%;
`;

const RightEye = styled(Eye)`
  left: 54.2%;
`;

const Pupil = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: #272727;
  transform: translate(-50%, -50%);
  will-change: transform;
`;

const Eyelid = styled.div`
  position: absolute;
  inset: -6% -10%;
  border-radius: 50%;
  background: ${EYELID};
  transform: scaleY(0);
  transform-origin: 50% 0%;
  will-change: transform;
`;

// Classic anime "exertion" sweat drop. Sits above each eye, near the
// head's outer curve, so it reads as beading off the temple rather than
// off the face. GSAP animates scale/y/opacity on the outer SweatDrop
// (see sweatTl below) while the teardrop shape itself -- a circle with
// one corner squared off and rotated 45deg -- lives on the inner
// SweatDropShape, static and untouched by GSAP. Kept as two nested
// elements rather than one because GSAP decomposes an element's
// existing CSS transform matrix the first time it tweens it, and a
// matrix that starts at scale(0) is singular -- the 45deg rotation
// baked into it can't be recovered, so it would snap unrotated the
// moment the drip animation kicked in.
const SweatDrop = styled.div`
  position: absolute;
  top: 8%;
  width: 6.3%;
  aspect-ratio: 1 / 1;
  opacity: 0;
  transform: scale(0);
  z-index: 4;
  will-change: transform, opacity;
`;

const SweatDropShape = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #cdeeff, #7ec8e3);
  border-radius: 0% 50% 50% 50%;
  transform: rotate(45deg);
`;

const SweatLeft = styled(SweatDrop)`
  left: 21%;
`;

const SweatRight = styled(SweatDrop)`
  left: 75%;
`;

const randomBetween = (min, max) => min + Math.random() * (max - min);

const COUNTDOWN_START = 10;
// Last stretch of the countdown where TimerLabel switches to its
// bigger/red "urgent" styling, as a heads-up before the handoff into
// the case study.
const URGENT_THRESHOLD = 3;

export default function AvocadoJumpingJack({ fill = false }) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);
  const stageRef = useRef(null);
  const rigRef = useRef(null);
  const shadowRef = useRef(null);
  const bodyRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const leftLegRef = useRef(null);
  const rightLegRef = useRef(null);

  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftLidRef = useRef(null);
  const rightLidRef = useRef(null);

  const sweatLeftRef = useRef(null);
  const sweatRightRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return undefined;

    // Touch devices can't hover, so a purely hover-gated animation never
    // ran at all there -- this is the one thing that actually differs
    // between desktop and mobile (everything else below just runs
    // either way). Desktop keeps the original "hover starts a timed set"
    // interaction (see the canHover block below); mobile just gets the
    // jump loop running ambiently with no countdown/hand-off.
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // The artwork itself is drawn mid-jumping-jack (arms out, legs apart)
    // -- that's rotation 0 / "open". A short crouch (dip + squash) builds
    // anticipation, then the jump extends up (stretch, limbs swing to
    // "closed", shadow shrinks/fades as if the light source falls away).
    // yoyo plays the whole thing in reverse for the landing. Arms swing
    // further than before (80° vs the old 52°) since they're straight
    // bars now -- no elbow bend contributing the rest of the angle
    // needed to read as "down at sides".
    const tl = gsap.timeline({
      paused: canHover,
      repeat: -1,
      yoyo: true,
      defaults: { ease: "power1.inOut" },
    });

    tl.to(rigRef.current, { y: 3, duration: 0.1 }, 0)
      .to(bodyRef.current, { scaleX: 1.08, scaleY: 0.9, duration: 0.1 }, 0)
      .to(rigRef.current, { y: -16, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(bodyRef.current, { scaleX: 0.95, scaleY: 1.06, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(leftArmRef.current, { rotation: 80, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(rightArmRef.current, { rotation: -80, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(leftLegRef.current, { rotation: -18, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(rightLegRef.current, { rotation: 18, duration: 0.32, ease: "power2.out" }, 0.1)
      .to(shadowRef.current, { scaleX: 0.55, scaleY: 0.45, opacity: 0.12, duration: 0.32, ease: "power2.out" }, 0.1);

    // Sweat beads: appear-drip-fade, looping, one drop per side offset
    // by half a cycle so they don't well up in lockstep. On desktop this
    // only starts a few seconds into a hover (see handleEnter below) --
    // on mobile, same as the jump loop, it just runs continuously.
    const sweatDrops = [sweatLeftRef.current, sweatRightRef.current];
    const resetSweat = () => gsap.set(sweatDrops, { opacity: 0, scale: 0, y: 0 });
    const sweatTl = gsap.timeline({ paused: canHover, repeat: -1 });
    sweatTl
      .fromTo(sweatLeftRef.current, { opacity: 0, scale: 0.4, y: 0 }, { opacity: 0.9, scale: 1, duration: 0.25, ease: "power1.out" }, 0)
      .to(sweatLeftRef.current, { y: 14, opacity: 0, duration: 0.6, ease: "power1.in" }, 0.25)
      .fromTo(sweatRightRef.current, { opacity: 0, scale: 0.4, y: 0 }, { opacity: 0.9, scale: 1, duration: 0.25, ease: "power1.out" }, 0.5)
      .to(sweatRightRef.current, { y: 14, opacity: 0, duration: 0.6, ease: "power1.in" }, 0.75);

    // Desktop-only: hover plays the jump/sweat timelines above and drives
    // a 10s countdown; reaching 0:00 while still hovering hands off into
    // the case study, same as clicking through to "watch the whole set".
    // On leave, tween the timeline's own playhead back to 0 rather than
    // just pausing in place -- freezing mid-swing would leave the avocado
    // stuck in an odd pose until the next hover.
    let countdownId;
    let sweatTimer;
    let handleEnter;
    let handleLeave;
    let stageEl;
    if (canHover) {
      const stopCountdown = () => {
        clearInterval(countdownId);
        setSecondsLeft(COUNTDOWN_START);
      };
      const startCountdown = () => {
        clearInterval(countdownId);
        let remaining = COUNTDOWN_START;
        setSecondsLeft(remaining);
        countdownId = setInterval(() => {
          remaining -= 1;
          setSecondsLeft(Math.max(remaining, 0));
          if (remaining <= 0) {
            clearInterval(countdownId);
            navigate("/operation-avocado");
          }
        }, 1000);
      };

      handleEnter = () => {
        tl.play();
        startCountdown();
        sweatTimer = gsap.delayedCall(4, () => sweatTl.play(0));
      };
      handleLeave = () => {
        gsap.to(tl, { progress: 0, duration: 0.3, ease: "power2.out", onComplete: () => tl.pause(0) });
        stopCountdown();
        sweatTimer?.kill();
        sweatTl.pause(0);
        resetSweat();
      };

      stageEl = stageRef.current;
      stageEl?.addEventListener("mouseenter", handleEnter);
      stageEl?.addEventListener("mouseleave", handleLeave);
    }

    // Pupils ease toward the real cursor position, clamped to a small
    // radius inside each socket so they never pop outside the white.
    const leftX = gsap.quickTo(leftPupilRef.current, "x", { duration: 0.25, ease: "power3" });
    const leftY = gsap.quickTo(leftPupilRef.current, "y", { duration: 0.25, ease: "power3" });
    const rightX = gsap.quickTo(rightPupilRef.current, "x", { duration: 0.25, ease: "power3" });
    const rightY = gsap.quickTo(rightPupilRef.current, "y", { duration: 0.25, ease: "power3" });

    const trackEye = (eyeEl, setX, setY, clientX, clientY) => {
      if (!eyeEl) return;
      const rect = eyeEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const maxTravel = rect.width * 0.27;
      const travel = Math.min(dist, maxTravel);
      setX((dx / dist) * travel);
      setY((dy / dist) * travel);
    };

    const handlePointerMove = (e) => {
      trackEye(leftEyeRef.current, leftX, leftY, e.clientX, e.clientY);
      trackEye(rightEyeRef.current, rightX, rightY, e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", handlePointerMove);

    // Sporadic blinking -- a quick close/open on a random 2-6s cadence,
    // occasionally a double-blink for a bit of character.
    let blinkTimer;
    const doBlink = () => {
      const lids = [leftLidRef.current, rightLidRef.current];
      const blinkOnce = () =>
        gsap
          .timeline()
          .to(lids, { scaleY: 1, duration: 0.09, ease: "power1.in" })
          .to(lids, { scaleY: 0, duration: 0.12, ease: "power1.out" });

      blinkOnce();
      if (Math.random() < 0.3) {
        gsap.delayedCall(0.22, blinkOnce);
      }

      blinkTimer = gsap.delayedCall(randomBetween(2, 6), doBlink);
    };
    blinkTimer = gsap.delayedCall(randomBetween(1, 3), doBlink);

    return () => {
      tl.kill();
      sweatTl.kill();
      sweatTimer?.kill();
      stageEl?.removeEventListener("mouseenter", handleEnter);
      stageEl?.removeEventListener("mouseleave", handleLeave);
      clearInterval(countdownId);
      window.removeEventListener("pointermove", handlePointerMove);
      blinkTimer.kill();
    };
  }, [navigate]);

  return (
    <Stage ref={stageRef} $fill={fill}>
      <TimerLabel aria-hidden="true" $urgent={secondsLeft <= URGENT_THRESHOLD}>
        0:{String(secondsLeft).padStart(2, "0")}
      </TimerLabel>
      <Shadow ref={shadowRef} />
      <Rig ref={rigRef}>
        <Body ref={bodyRef} src={body} alt="" />
        <LeftArm ref={leftArmRef} src={leftArm} alt="" />
        <RightArm ref={rightArmRef} src={rightArm} alt="" />
        <LeftLeg ref={leftLegRef} src={leftLeg} alt="" />
        <RightLeg ref={rightLegRef} src={rightLeg} alt="" />

        <LeftEye ref={leftEyeRef}>
          <Pupil ref={leftPupilRef} />
          <Eyelid ref={leftLidRef} />
        </LeftEye>
        <RightEye ref={rightEyeRef}>
          <Pupil ref={rightPupilRef} />
          <Eyelid ref={rightLidRef} />
        </RightEye>

        <SweatLeft ref={sweatLeftRef}>
          <SweatDropShape />
        </SweatLeft>
        <SweatRight ref={sweatRightRef}>
          <SweatDropShape />
        </SweatRight>
      </Rig>
    </Stage>
  );
}
