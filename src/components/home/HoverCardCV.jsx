import { useRef, useEffect, useState } from "react";
import styled from "styled-components";

export default function HoverCardCV({ src, poster, title, onOpen }) {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  /* ---------- Mobile detect ---------- */
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|iphone|ipad|ipod|mobile/i.test(ua)) setIsMobile(true);
  }, []);

  /* ---------- Reset video on mount ---------- */
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  }, []);

  const playVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => {});
  };

  const stopVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  /* ---------- Auto play on mobile ---------- */
  useEffect(() => {
    if (isMobile) playVideo();
  }, [isMobile]);

  return (
    <Card
      onClick={onOpen}
      onMouseEnter={!isMobile ? playVideo : undefined}
      onMouseLeave={!isMobile ? stopVideo : undefined}
      onTouchStart={isMobile ? playVideo : undefined}
      onTouchEnd={isMobile ? stopVideo : undefined}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      <Video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        autoPlay={isMobile}
        preload="metadata"
      />

      <BottomBar>
        <PrimaryButton
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          aria-label="Open CV"
        >
          <span>Read.cv</span>
        </PrimaryButton>
      </BottomBar>

      {title && (
        <TitleWrapper>
          <Title>{title}</Title>
          <Year>2026</Year>
        </TitleWrapper>
      )}
    </Card>
  );
}

/* ---------------- styles ---------------- */

const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
  background: transparent;
  cursor: none;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent};
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const BottomBar = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
  background: ${({ theme }) => theme.cardBackground};
  z-index: 3;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  font-size: 0.95rem;
  transition: all 0.25s ease;
  box-shadow: ${({ theme }) => theme.shadowSm};

  &:hover {
    background: ${({ theme }) => theme.surfaceSubtle};
    color: ${({ theme }) => theme.accentHover};
  }

  &:active {
    transform: scale(0.9);
  }
`;

const TitleWrapper = styled.div`
  position: absolute;
  left: 1.5rem;
  bottom: 1.5rem;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;
`;

const Title = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const Year = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
  margin-top: 0.1rem;
  font-weight: 400;
`;