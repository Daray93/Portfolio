import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

/**
 * HoverCardVoir
 * - Plays video on hover (desktop)
 * - Plays on tap / automatically muted on mobile
 * - Fully responsive
 * - Masonry / bento safe
 * - Shows tag with per-project color
 * - Supports per-card crop control
 * - Optional "In Progress" pill (top right)
 */
export default function HoverCardVoir({
  src,
  poster,
  title,
  tag = "Coming Soon",
  crop = "scale(1.08) translateY(-4%)",
  tagColor = "#F59E0B",
  tagBackground = "#F59E0B", // default accent
  inProgress = false
}) {
  const videoRef = useRef(null);
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

  // Auto-play muted videos on mobile
  useEffect(() => {
    if (isMobile) {
      playVideo();
    }
  }, [isMobile]);

  return (
    <Card
      onMouseEnter={!isMobile ? playVideo : undefined}
      onMouseLeave={!isMobile ? stopVideo : undefined}
      onTouchStart={isMobile ? playVideo : undefined}
      onTouchEnd={isMobile ? stopVideo : undefined}
    >
      <Video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        autoPlay={isMobile} // autoplay only on mobile when muted
        preload="metadata"
        style={{ transform: crop }}
      />

      {inProgress && <InProgressPill>In Progress</InProgressPill>}

      {(title || tag) && (
        <Overlay>
          <LeftStack>
            {title && <Title>{title}</Title>}
            {tag && <Tag $color={tagColor}>{tag}</Tag>}
          </LeftStack>
        </Overlay>
      )}
    </Card>
  );
}

/* ---------------- styles ---------------- */

const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 24px;
  background: transparent;
  cursor: none;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const InProgressPill = styled.span`
position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 4px 10px 4px 7px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 400;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 0;
  }
`;

const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1.25;
  font-weight: 500;
  font-family: "Space Grotesk", sans-serif;
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

  background: ${({ $bg }) => $bg || "#bebebe2b"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
`;

const TagBackground = styled.span`
  width: fit-content;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: ${({ $background }) => `${$background}22`};
  backdrop-filter: blur(6px);
  color: ${({ $background }) => $background};
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;