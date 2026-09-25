import { useRef, useState, useLayoutEffect } from "react";
import styled, { css } from "styled-components";
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
 * `saturateOnHover`: rests slightly desaturated, blooms to full colour
 * plus a small scale on hover -- for single-screenshot cards with
 * nothing to pan through (e.g. IBHF's bee photo), so hovering still
 * reads as a deliberate reveal rather than a static tile. Was a
 * continuous idle sway (translate the whole photo around) before; that
 * read as fake motion on a photo where nothing's actually moving, see
 * git history. Applied to the image rather than Pan so it never fights
 * the hover/click-driven pan transform on the same element.
 *
 * `staticImage`: skips the whole pan mechanism (no measurement, no
 * hover/click handlers) and crops the first screen to fill the frame
 * instead -- for a genuinely inert tile (e.g. Kropt's home screen).
 * Plain `screens={[oneImage]}` alone doesn't guarantee that: at
 * direction="vertical" the image is sized width:100%/height:auto for
 * panning, so whenever its natural height (at that width) still
 * overflows the frame, it pans on hover regardless of there being only
 * one screen to pan through.
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
  saturateOnHover = false,
  staticImage = false,
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
    if (staticImage) return undefined;

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
  }, [screens, horizontal, focalPoint, axis, controls, staticImage]);

  const panDuration = Math.max(MIN_PAN_DURATION, panDistance / panSpeed);

  const startPan = () => {
    controls.start({ [axis]: -panDistance }, { duration: panDuration, ease: "easeInOut" });
  };

  const resetPan = () => {
    controls.start({ [axis]: -restOffset }, { duration: RESET_DURATION, ease: "easeOut" });
  };

  const handleMouseEnter = () => {
    if (staticImage) return;
    isHoveredRef.current = true;
    if (!pausedRef.current) startPan();
  };

  const handleMouseLeave = () => {
    if (staticImage) return;
    isHoveredRef.current = false;
    if (!pausedRef.current) resetPan();
  };

  const handleClick = () => {
    if (staticImage) return;
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
      {staticImage ? (
        <StillShot src={screens[0]} alt="" />
      ) : (
        <Pan ref={panRef} $horizontal={horizontal} animate={controls} initial={false}>
          {screens.map((entry) =>
            Array.isArray(entry) ? (
              <CrossfadeSlot key={entry.join("|")} $horizontal={horizontal}>
                <Shot src={entry[0]} alt="" $horizontal={horizontal} $saturateOnHover={saturateOnHover} />
                <FadeShot src={entry[1]} alt="" $horizontal={horizontal} />
              </CrossfadeSlot>
            ) : (
              <Shot key={entry} src={entry} alt="" $horizontal={horizontal} $saturateOnHover={saturateOnHover} />
            )
          )}
        </Pan>
      )}

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
  cursor: pointer;

  /* Plain (non-morph) usage stays a transparent, simply-rounded box.
     Chrome only appears when this card is the source of a homepage->
     case-study morph -- see VideoHoverCard for the same convention.
     Radius always matches the outer grid Card's own clamp (see Splash.jsx)
     regardless of morph state -- a fixed value here (24px) drifted from
     that responsive one at small viewports, so the image's own rounded
     corner no longer lined up with the card clipping it on mobile. */
  border-radius: ${({ theme }) => theme.radius.xxl};
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

// staticImage's own image -- cropped to fill the frame with no pan, no
// filter/scale transition, nothing. A genuinely inert tile.
const StillShot = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Shot = styled.img`
  display: block;
  flex-shrink: 0;
  width: ${({ $horizontal }) => ($horizontal ? "auto" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};

  /* Rests slightly muted rather than fully desaturated -- strong enough
     to read as deliberate once it blooms on hover, not so strong it
     looks broken/washed-out sitting at rest next to the grid's other
     full-colour cards. */
  ${({ $saturateOnHover }) =>
    $saturateOnHover &&
    css`
      filter: saturate(0.6) contrast(0.98);
      transform: scale(1);
      /* Same snap-and-settle curve as CaseStudyFab's own transform
         transition -- a deliberate, confident bloom rather than the
         generic linear-ish feel of a plain ease. */
      transition: filter 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);

      ${Frame}:hover & {
        filter: saturate(1.15) contrast(1.02);
        transform: scale(1.045);
      }
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

  /* Title/tag move to their own plain-text row below the image at this
     width instead (see Splash.jsx's MobileCaptionLink/Button). */
  @media (max-width: 560px) {
    display: none;
  }
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
  font-family: "Fraunces Variable", serif;
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
