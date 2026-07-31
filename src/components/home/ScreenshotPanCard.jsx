import { useRef, useState, useLayoutEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

/**
 * Stacks a sequence of app screens into one continuous strip, cropped to
 * the first screen at rest, then pans through the whole strip on hover --
 * like flipping through the app's screens in one continuous scroll. Pan
 * distance is measured from the strip's actual rendered size (via
 * ResizeObserver) so it lands exactly on the last screen's edge
 * regardless of the cell's size.
 *
 * Each entry in `screens` is either a single image src, or an array of
 * two srcs that occupy the same slot and crossfade between each other
 * (a "smart animate" pair between two states of the same screen) while
 * hovered, instead of being two separate frames you pan past.
 *
 * `direction`: "vertical" (default) or "horizontal".
 *
 * Optional `morphId`: shares a layoutId with a CaseStudyMorphMedia on the
 * linked case study page, same as VideoHoverCard (see Splash.jsx).
 */
export default function ScreenshotPanCard({
  screens,
  direction = "vertical",
  title,
  tag = "Coming Soon",
  tagColor = "#F59E0B",
  morphId,
  panDuration = 18,
  // Fraction (0-1) of the computed pan distance to sit at when not
  // hovered, so the strip can rest partway through instead of always
  // starting flush at its top/left edge -- e.g. a portrait photo with
  // dead space above the subject can rest already panned past it.
  // Hovering still pans the rest of the way to the strip's far edge.
  focalPoint = 0,
}) {
  const frameRef = useRef(null);
  const panRef = useRef(null);
  const [panDistance, setPanDistance] = useState(0);
  const horizontal = direction === "horizontal";
  const restOffset = panDistance * focalPoint;

  useLayoutEffect(() => {
    const measure = () => {
      if (!frameRef.current || !panRef.current) return;
      const frameSize = horizontal ? frameRef.current.offsetWidth : frameRef.current.offsetHeight;
      const stripSize = horizontal ? panRef.current.scrollWidth : panRef.current.scrollHeight;
      setPanDistance(Math.max(0, stripSize - frameSize));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    if (panRef.current) ro.observe(panRef.current);

    return () => ro.disconnect();
  }, [screens, horizontal]);

  return (
    <Frame
      ref={frameRef}
      $morph={!!morphId}
      layoutId={morphId}
      layout={!!morphId}
      transition={MORPH_TRANSITION}
    >
      <Pan
        ref={panRef}
        $horizontal={horizontal}
        $distance={panDistance}
        $restOffset={restOffset}
        $duration={panDuration}
      >
        {screens.map((entry) =>
          Array.isArray(entry) ? (
            <CrossfadeSlot key={entry.join("|")} $horizontal={horizontal}>
              <Shot src={entry[0]} alt="" $horizontal={horizontal} />
              <FadeShot src={entry[1]} alt="" $horizontal={horizontal} />
            </CrossfadeSlot>
          ) : (
            <Shot key={entry} src={entry} alt="" $horizontal={horizontal} />
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
     case-study morph -- see VideoHoverCard for the same convention. */
  border-radius: ${({ $morph }) => ($morph ? "clamp(18px, 2.5vw, 32px)" : "24px")};
  background: ${({ $morph, theme }) => ($morph ? theme.body : "transparent")};
  border: ${({ $morph, theme }) => ($morph ? `1px solid ${theme.border}` : "none")};
  box-shadow: ${({ $morph, theme }) => ($morph ? theme.shadowSm : "none")};
`;

const Pan = styled.div`
  display: flex;
  flex-direction: ${({ $horizontal }) => ($horizontal ? "row" : "column")};
  align-items: ${({ $horizontal }) => ($horizontal ? "stretch" : "flex-start")};
  width: ${({ $horizontal }) => ($horizontal ? "max-content" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};
  transform: ${({ $horizontal, $restOffset }) =>
    $horizontal ? `translateX(-${$restOffset}px)` : `translateY(-${$restOffset}px)`};
  /* Quick reset by default -- the slow, cinematic pan only applies while
     actively hovered (below). Sharing one transition duration for both
     directions meant a brief hover left the strip creeping back to start
     for up to a full panDuration, looking stuck instead of resetting. */
  transition: transform 0.6s ease;
  will-change: transform;

  ${Frame}:hover & {
    transition: transform ${({ $duration }) => $duration}s ease-in-out;
    transform: ${({ $horizontal, $distance }) =>
      $horizontal ? `translateX(-${$distance}px)` : `translateY(-${$distance}px)`};
  }
`;

const Shot = styled.img`
  display: block;
  flex-shrink: 0;
  width: ${({ $horizontal }) => ($horizontal ? "auto" : "100%")};
  height: ${({ $horizontal }) => ($horizontal ? "100%" : "auto")};
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
