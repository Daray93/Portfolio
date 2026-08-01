import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

/**
 * VideoHoverCard
 * - Plays video on hover (desktop)
 * - Plays automatically, muted, once scrolled into view (mobile --
 *   no hover to trigger it, but gated to visibility so it doesn't
 *   start streaming the instant the page loads)
 * - Fully responsive
 * - Masonry / bento safe
 * - Shows tag with per-project color
 * - Supports per-card crop control
 * - Optional `morphId`: shares a layoutId with a CaseStudyMorphMedia on the
 *   linked case study page, so this card visibly grows into that page's
 *   hero media across the route change (see Splash.jsx / App.jsx).
 */
export default function VideoHoverCard({
  src,
  poster,
  title,
  tag = "Coming Soon",
  crop = "scale(1.08) translateY(-4%)",
  tagColor = "#F59E0B",
  tagBackground,
  morphId,
}) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|iphone|ipad|ipod|mobile/i.test(ua)) setIsMobile(true);
  }, []);

  // Reset video on mount
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  const playVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {
      /* ignore autoplay errors */
    });
  };

  const stopVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  // No hover on mobile, so the muted preview autoplays there instead --
  // but gated to when the card actually scrolls into view, not on
  // mount. These video previews run 3.5-6.5MB each; playing every one
  // the instant the homepage loads meant a phone visitor downloaded and
  // streamed several MB of video before scrolling to see any of it.
  useEffect(() => {
    if (!isMobile || !cardRef.current) return undefined;
    const el = cardRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) playVideo();
        else stopVideo();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isMobile]);

  return (
    <Card
      ref={cardRef}
      $morph={!!morphId}
      layoutId={morphId}
      layout={!!morphId}
      transition={MORPH_TRANSITION}
      onMouseEnter={!isMobile ? playVideo : undefined}
      onMouseLeave={!isMobile ? stopVideo : undefined}
    >
      {/* Crop is a static cosmetic pan/zoom (mostly to hide a watermark
          baked into the source footage) -- kept on this plain wrapper so
          it never fights framer-motion's own transform on the video
          below while that video is mid-morph. */}
      <CropMask style={{ transform: crop }}>
        <Video
          ref={videoRef}
          layoutId={morphId ? `${morphId}-media` : undefined}
          layout={!!morphId}
          transition={MORPH_TRANSITION}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="metadata"
        />
      </CropMask>

      {(title || tag) && (
        <Overlay>
          <LeftStack>
            {title && <Title>{title}</Title>}
            {tag && <Tag $bg={tagBackground} $color={tagColor}>{tag}</Tag>}
          </LeftStack>
        </Overlay>
      )}
    </Card>
  );
}

/* ---------------- styles ---------------- */

const Card = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: none;

  /* Plain (non-morph) usage stays exactly as before -- chrome only
     appears when this card is the source of a homepage->case-study
     morph, so it carries its own background/border/shadow once it
     leaves the grid cell that used to provide them. Radius always
     matches the outer grid Card's own clamp (see Splash.jsx) regardless
     of morph state -- a fixed value here (24px) drifted from that
     responsive one at small viewports, so the video's own rounded corner
     no longer lined up with the card clipping it on mobile. */
  border-radius: clamp(18px, 2.5vw, 32px);
  background: ${({ $morph, theme }) => ($morph ? theme.body : "transparent")};
  border: ${({ $morph, theme }) => ($morph ? `1px solid ${theme.border}` : "none")};
  box-shadow: ${({ $morph, theme }) => ($morph ? theme.shadowSm : "none")};
`;

const CropMask = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Video = styled(motion.video)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
`;

const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Title = styled.span`
  /* Fixed light color regardless of site theme -- this sits directly on
     the video preview (no scrim behind it), so it needs to read against
     that footage rather than flip dark in light mode and disappear. */
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  font-size: 1.25;
  font-weight: 500;
  font-family: "General Sans", sans-serif;
  letter-spacing: 0.01em;
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

  /* Same light pill background as ScreenshotPanCard/HoverCard's tags,
     so every case-study card reads as one consistent pill style rather
     than three near-but-not-quite-matching tones. */
  background: ${({ $bg }) => $bg || "rgba(235, 235, 230, 0.85)"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
`;
