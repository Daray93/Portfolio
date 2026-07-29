import styled from "styled-components";
import { motion } from "framer-motion";
import { FiEye, FiFileText } from "react-icons/fi";

export default function HoverCardCV({ title, onOpen }) {
  return (
    <Card
      onClick={onOpen}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      <IconWrap
        aria-hidden="true"
        whileHover={{
          y: [0, -14, 0],
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <FiFileText />
      </IconWrap>

      <EyeBadge aria-hidden="true">
        <FiEye />
      </EyeBadge>

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

// No independent border-radius/background/border here -- this card is
// always rendered inside Splash.jsx's CardSurface, which already draws
// the grid cell's chrome (clamp(18px, 2.5vw, 32px) radius, border,
// shadow). Duplicating it here at a fixed 30px produced two concentric
// borders at mismatched radii, most visible at the smaller mobile cell
// size. Unlike HoverCard/HoverCardVoir/ScreenshotPanCard, this one never
// morphs out of the grid, so it never needs to look complete standalone.
const Card = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: none;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent};
  }
`;

const IconWrap = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSecondary};

  svg {
    width: 56px;
    height: 56px;
    stroke-width: 1.25;

    /* This cell runs a third of the row width on mobile as part of the
       email/LinkedIn/CV trio (see Splash.jsx), instead of the full
       width it got before -- shrink to match. */
    @media (max-width: 560px) {
      width: 34px;
      height: 34px;
    }
  }
`;

const EyeBadge = styled.span`
  position: absolute;
  top: clamp(0.6rem, 1.5vw, 1rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.navSurface};
  color: ${({ theme }) => theme.textSecondary};
  z-index: 3;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
    color: ${({ theme }) => theme.buttonGhostHoverText};
  }

  svg {
    width: 14px;
    height: 14px;
  }

  /* No hover on touch devices -- stays visible below 560px instead of
     being permanently hidden (see HoverIconBadge in Splash.jsx). */
  @media (max-width: 560px) {
    opacity: 1;
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

  /* This cell runs icon-only at the trio's mobile size (see Splash.jsx)
     -- same as the LinkedIn cell next to it -- rather than the label
     colliding with the centered icon in a much smaller box. */
  @media (max-width: 560px) {
    display: none;
  }
`;

const Title = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-family: "General Sans", sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const Year = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
  margin-top: 0.1rem;
  font-weight: 400;
`;
