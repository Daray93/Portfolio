import { useRef, useState, useLayoutEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion, useAnimationControls } from "framer-motion";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

// Minimum pan duration regardless of computed distance -- a narrow strip
// (few screens) would otherwise finish almost instantly at a fixed
// px/second rate, reading as a flicker rather than a deliberate pan.
const MIN_PAN_DURATION = 3;
const RESET_DURATION = 0.6;

/**
 * Stacks a sequence of app screens into one continuous strip, cropped to
 * the first screen at rest, then pans through the whole strip on hover --
 * like flipping through the app's screens in one continuous scroll. Pans
 * at a constant speed (px/second) rather than a fixed total duration, so
 * a wider strip (e.g. this same card expanded to a much bigger cell, see
 * Splash.jsx's Travel toggle) takes proportionally longer to cross
 * instead of covering more distance in the same time and blurring past.
 *
 * Each entry in `screens` is either a single image src, or an array of
 * two srcs that occupy the same slot and crossfade between each other
 * (a "smart animate" pair between two states of the same screen) while
 * hovered, instead of being two separate frames you pan past.
 *
 * `direction`: "vertical" (default) or "horizontal".
 *
 * Clicking freezes the pan exactly where it currently is -- a middle
 * ground between a passive hover preview and a full flick-through
 * carousel, letting a visitor stop on a photo they want a better look at
 * without needing prev/next controls. Clicking again resumes: continuing
 * to pan if still hovered, or resetting to rest if the pointer's since
 * left.
 *
 * Optional `morphId`: shares a layoutId with a CaseStudyMorphMedia on the
 * linked case study page, same as VideoHoverCard (see Splash.jsx).
 *
 * `sway`: a slow, continuous idle rotation on the image itself (not the
 * pan strip) -- for single-screenshot cards with nothing to pan through
 * (e.g. IBHF's bee photo), so it's not just a static, unmoving tile
 * either. Applied to the image rather than Pan so it never fights the
 * hover/click-driven pan transform on the same element.
 */
export default function ScreenshotPanCard({
  screens,
  direction = "vertical",
  title,
  tag = "Coming Soon",
  tagColor = "#F59E0B",
  morphId,
  panSpeed = 210,
  // Fraction (0-1) of the computed pan distance to sit at when not
  // hovered, so the strip can rest partway through instead of always
  // starting flush at its top/left edge -- e.g. a portrait photo with
  // dead space above the subject can rest already panned past it.
  // Hovering still pans the rest of the way to the strip's far edge.
  focalPoint = 0,
  sway = false,
}) {
  const frameRef = useRef(null);
  const panRef = useRef(null);
  const [panDistance, setPanDistance] = useState(0);
  const isHoveredRef = useRef(false);
  const pausedRef = useRef(false);
  const controls = useAnimationControls();
  const horizontal = direction === "horizontal";
  const axis = horizontal ? "x" : "y";
  const restOffset = panDistance * focalPoint;

  useLayoutEffect(() => {
    const measure = () => {
      if (!frameRef.current || !panRef.current) return;
      const frameSize = horizontal ? frameRef.current.offsetWidth : frameRef.current.offsetHeight;
      const stripSize = horizontal ? panRef.current.scrollWidth : panRef.current.scrollHeight;
      const distance = Math.max(0, stripSize - frameSize);
      setPanDistance(distance);
      // Only snaps to the new resting offset when nothing's actively
      // hovered/paused -- refs (not reactive state) so a resize mid-hover
      // doesn't yank the strip out from under an in-progress pan.
      if (!pausedRef.current && !isHoveredRef.current) {
        controls.set({ [axis]: -distance * focalPoint });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    if (panRef.current) ro.observe(panRef.current);

    return () => ro.disconnect();
  }, [screens, horizontal, focalPoint, axis, controls]);

  const panDuration = Math.max(MIN_PAN_DURATION, panDistance / panSpeed);

  const startPan = () => {
    controls.start({ [axis]: -panDistance }, { duration: panDuration, ease: "easeInOut" });
  };

  const resetPan = () => {
    controls.start({ [axis]: -restOffset }, { duration: RESET_DURATION, ease: "easeOut" });
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (!pausedRef.current) startPan();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (!pausedRef.current) resetPan();
  };

  const handleClick = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    if (next) {
      controls.stop(); // freezes at whatever value was mid-flight, no snapping
    } else if (isHoveredRef.current) {
      startPan();
    } else {
      resetPan();
    }
  };

  return (
    <Frame
      ref={frameRef}
      $morph={!!morphId}
      layoutId={morphId}
      layout={!!morphId}
      transition={MORPH_TRANSITION}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Pan ref={panRef} $horizontal={horizontal} animate={controls} initial={false}>
        {screens.map((entry) =>
          Array.isArray(entry) ? (
            <CrossfadeSlot key={entry.join("|")} $horizontal={horizontal}>
              <Shot src={entry[0]} alt="" $horizontal={horizontal} $sway={sway} />
              <FadeShot src={entry[1]} alt="" $horizontal={horizontal} />
            </CrossfadeSlot>
          ) : (
            <Shot key={entry} src={entry} alt="" $horizontal={horizontal} $sway={sway} />
          )
        )}
      </Pan>

      {(title || tag) && (
        <Overlay>
          <LeftStack>
            {title && <Title>{title}</Title>}
            {tag && <Tag $color={tagColor}>{tag}</Tag>}
          </LeftStack>
        </Overlay>
      )}
    </Frame>
  );
}

/* ---------------- styles ---------------- */

const Frame = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: none;

  /* Plain (non-morph) usage stays a transparent, simply-rounded box.
     Chrome only appears when this card is the source of a homepage->
     case-study morph -- see VideoHoverCard for the same convention.
     Radius always matches the outer grid Card's own clamp (see Splash.jsx)
     regardless of morph state -- a fixed value here (24px) drifted from
     that responsive one at small viewports, so the image's own rounded
     corner no longer lined up with the card clipping it on mobile. */
  border-radius: clamp(18px, 2.5vw, 32px);
  background: ${({ $morph, theme }) => ($morph ? theme.body : "transparent")};
  border: ${({ $morph, theme }) => ($morph ? `1px solid ${theme.border}` : "none")};
  box-shadow: ${({ $morph, theme }) => ($morph ? theme.shadowSm : "none")};
`;

const Pan = styled(motion.div)`
  display: flex;
  flex-direction: ${({ $horizontal }) => ($horizontal ? "row" : "column")};
  align-items: ${({ $horizontal }) => ($horizontal ? "stretch" : "flex-start")};
  width: ${({ $horizontal }) => ($horizontal ? "max-content" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};
  will-change: transform;
`;

// Lifts, then rocks left-right with real amplitude (not a subtle wobble) --
// scaled up enough that even the widest translated extreme never pulls
// the image edge in past Frame's own clipped bounds and reveals a sliver
// of background behind it.
const swayAnim = keyframes`
  0% { transform: translate(0, 0) scale(1.1); }
  25% { transform: translate(0, -8px) scale(1.1); }
  50% { transform: translate(12px, -4px) scale(1.1); }
  75% { transform: translate(-12px, -4px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1.1); }
`;

const Shot = styled.img`
  display: block;
  flex-shrink: 0;
  width: ${({ $horizontal }) => ($horizontal ? "auto" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};

  ${({ $sway }) =>
    $sway &&
    css`
      animation: ${swayAnim} 6s ease-in-out infinite;
    `}
`;

// Second frame of a crossfade pair sits absolutely over the first, which
// stays in normal flow and sets the slot's size.
const CrossfadeSlot = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${({ $horizontal }) => ($horizontal ? "auto" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};
`;

const FadeShot = styled.img`
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.9s ease;

  ${Frame}:hover & {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  pointer-events: none;
  z-index: 2;
  /* Stays visible through the hover crossfade -- a permanent scrim (not
     just text color) keeps the title/pill legible no matter what the
     underlying screenshot looks like at that point in the animation. */
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0) 65%);
`;

const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Title = styled.span`
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  font-family: "General Sans", sans-serif;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
`;

const Tag = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  background: ${({ $bg }) => $bg || "rgba(235, 235, 230, 0.85)"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
`;
