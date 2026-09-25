import styled from "styled-components";
import { motion } from "framer-motion";
import { useCaseStudyView } from "./CaseStudyViewContext";

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Groups Title+Subtitle as one unit so Wrap's own 1.5rem gap (meant to
// separate the whole heading from the hero media/view-toggle below it)
// doesn't also land between the title and its own tagline -- that spacing
// is set explicitly on Subtitle instead, much tighter.
const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
`;

// A block-level tagline under the title, not a same-size span crammed
// inside the h1 -- distinct size/weight gives it a clear place in the
// hierarchy instead of reading as a run-on continuation of the title,
// and it's now a real <p> rather than part of the h1's accessible name.
const Subtitle = styled.p`
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 500;
  line-height: 1.4;
  margin: 0.5rem 0 0 0;
  color: ${({ theme }) => theme.textSecondary};
`;

const ViewToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ViewToggleLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ViewToggle = styled.div`
  display: inline-flex;
  flex-shrink: 0;
  gap: 4px;
  padding: 4px;
  background: ${({ theme }) => theme.navSurface};
  border-radius: 999px;
`;

const ViewToggleButton = styled.button`
  position: relative;
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 999px;
  font-family: "Fraunces Variable", serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryText : theme.textSecondary)};
  background: transparent;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryHoverText : theme.text)};
  }
`;

// Physically slides between TL;DR/Full Story via a shared layoutId (same
// technique as PillNav's own Fill) rather than each button just swapping
// its own background color in place. border-radius is set via the style
// prop, not this stylesheet, for the same reason as PillNav's Fill --
// framer only tracks/corrects inline style values through a shared-layout
// scale animation, so a CSS-authored radius here would visibly warp for a
// beat while it slides between the two (differently-sized) buttons.
const ViewToggleFill = styled(motion.span)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  z-index: 0;
`;

const ViewToggleLabelText = styled.span`
  position: relative;
  z-index: 1;
`;

export default function CaseStudyHero({ title, subtitle, children }) {
  const { view, setView } = useCaseStudyView();

  return (
    <Wrap>
      <TitleGroup>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleGroup>
      <ViewToggleRow>
        <ViewToggleLabel>Reading this on the go?</ViewToggleLabel>
        <ViewToggle role="tablist" aria-label="Case study detail level">
          <ViewToggleButton
            type="button"
            role="tab"
            aria-selected={view === "tldr"}
            $active={view === "tldr"}
            onClick={() => setView("tldr")}
          >
            {view === "tldr" && (
              <ViewToggleFill
                layoutId="view-toggle-fill"
                style={{ borderRadius: 999 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <ViewToggleLabelText>TL;DR</ViewToggleLabelText>
          </ViewToggleButton>
          <ViewToggleButton
            type="button"
            role="tab"
            aria-selected={view === "detailed"}
            $active={view === "detailed"}
            onClick={() => setView("detailed")}
          >
            {view === "detailed" && (
              <ViewToggleFill
                layoutId="view-toggle-fill"
                style={{ borderRadius: 999 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <ViewToggleLabelText>Full Story</ViewToggleLabelText>
          </ViewToggleButton>
        </ViewToggle>
      </ViewToggleRow>
      {children}
    </Wrap>
  );
}
