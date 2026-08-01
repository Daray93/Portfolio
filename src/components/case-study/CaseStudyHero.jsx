import styled from "styled-components";
import { useCaseStudyView } from "./CaseStudyViewContext";

const Wrap = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0;
`;

const Subtitle = styled.span`
  font-weight: 500;
  color: #2323238f;
`;

const ViewToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
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
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 999px;
  font-family: "General Sans", sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: none;
  color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryText : theme.textSecondary)};
  background: ${({ theme, $active }) => ($active ? theme.buttonPrimaryBg : "transparent")};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: ${({ theme, $active }) => ($active ? theme.buttonPrimaryHoverText : theme.text)};
  }
`;

export default function CaseStudyHero({ title, subtitle, children }) {
  const { view, setView } = useCaseStudyView();

  return (
    <Wrap>
      <Title>
        {title} {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Title>
      {children}
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
            TL;DR
          </ViewToggleButton>
          <ViewToggleButton
            type="button"
            role="tab"
            aria-selected={view === "detailed"}
            $active={view === "detailed"}
            onClick={() => setView("detailed")}
          >
            Full Story
          </ViewToggleButton>
        </ViewToggle>
      </ViewToggleRow>
    </Wrap>
  );
}
