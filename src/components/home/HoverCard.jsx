import styled from "styled-components";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";

const MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

export default function PasswordCard({ title, category, icon, morphId, onClick }) {
  return (
    <Card
      onClick={onClick}
      data-cursor="locked"
      $morph={!!morphId}
      layoutId={morphId}
      layout={!!morphId}
      transition={MORPH_TRANSITION}
    >
      {icon && (
        <IconWrap aria-hidden="true">
          <MotionIcon
            src={icon}
            alt=""
            layoutId={morphId ? `${morphId}-media` : undefined}
            layout={!!morphId}
            transition={MORPH_TRANSITION}
          />
        </IconWrap>
      )}

      {(title || category) && (
        <Overlay>
          <LeftStack>
            {title && <Title>{title}</Title>}
            {category && <Category>{category}</Category>}
          </LeftStack>
        </Overlay>
      )}

      <LockBadge aria-hidden="true">
        <FiLock />
      </LockBadge>
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

  /* Plain (non-morph, e.g. Audanote) usage stays exactly as before --
     chrome only changes when this card is the source of a homepage->
     case-study morph, so it carries its own border/shadow once it
     leaves the grid cell that used to provide them. Background stays
     cardBackground either way -- unlike the full-bleed image/video
     cards, this one only shows a centered icon, so the flat panel
     color is always visible and needs to match the rest of the grid.
     Radius always matches CardSurface's own clamp (rather than a fixed
     24px for the non-morph case) so it stays correct at every
     breakpoint instead of only happening to line up at some sizes. */
  border-radius: clamp(18px, 2.5vw, 32px);
  background: ${({ theme }) => theme.cardBackground};
  border: ${({ $morph, theme }) => ($morph ? `1px solid ${theme.border}` : "none")};
  box-shadow: ${({ $morph, theme }) => ($morph ? theme.shadowSm : "none")};
`;

const IconWrap = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MotionIcon = styled(motion.img)`
  width: 56px;
  height: 56px;
  object-fit: contain;
`;

const LockBadge = styled.span`
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

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  transition: opacity 0.25s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const LeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-weight: 500;
  font-family: "General Sans", sans-serif;
  letter-spacing: 0.01em;
`;

const Category = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  /* Same light pill background as ScreenshotPanCard/VideoHoverCard's
     tags, so every case-study card reads as one consistent pill style
     rather than three near-but-not-quite-matching tones. */
  background: ${({ $bg }) => $bg || "rgba(235, 235, 230, 0.85)"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
`;
