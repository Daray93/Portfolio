import styled from "styled-components";
import { useCaseStudyView } from "./CaseStudyViewContext";

const Row = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 24px; // card rounding
  border: 1px solid ${({ theme }) => theme.border};
  padding: 5rem;
  gap: 1.5rem;

  @media (max-width: 900px) {
    gap: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

// Wrapper for title and decorative square
const TitleWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem; // space between square and text
  flex-direction: column; // allows separator below title
  width: 100%;
`;

// Small square next to the title
const TitleSquare = styled.div`
  width: 0.45rem; // ~12px
  height: 0.45rem; // ~12px
  background: ${({ theme }) => theme.accent}; // use your accent color
  border-radius: 0px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  cursor: none;
  font-weight: 400;
  font-family: "General Sans", sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 196px;
  margin: 0;

  @media (max-width: 900px) {
    font-size: 0.65rem;
    width: 100%;
  }
`;

// Separator under the heading
const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.border};
  margin-top: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 900px) {
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 900px) {
    gap: 0.75rem;
  }
`;

const Full = styled.div`
  width: 100%;
`;

const TldrPlaceholder = styled.p`
  margin: 0;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;

export default function CaseStudySection({
  id,
  title,
  children,
  full,
  tldrVisible = false,
  tldr,
  ...props
}) {
  const { view } = useCaseStudyView();

  // TL;DR mode shortens every section rather than removing it -- the
  // overview/hero section (tldrVisible) is exempt since it's already
  // the short version of the page. Everything else swaps its full body
  // for a condensed one-liner: a real `tldr` prop when a section has
  // been given one, otherwise a placeholder standing in for copy that
  // hasn't been written yet.
  const isShortened = view === "tldr" && !tldrVisible;

  return (
    <Row id={id} {...props}>
      {title && (
        <TitleWrapper>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TitleSquare />
            <Title>{title}</Title>
          </div>
          <Separator />
        </TitleWrapper>
      )}
      <Body>
        {isShortened ? (
          <TldrPlaceholder>
            {tldr ||
              (title
                ? `TL;DR placeholder — a shortened summary of "${title}" goes here.`
                : "TL;DR placeholder — a shortened summary goes here.")}
          </TldrPlaceholder>
        ) : (
          children
        )}
      </Body>
      {!isShortened && full && <Full>{full}</Full>}
    </Row>
  );
}