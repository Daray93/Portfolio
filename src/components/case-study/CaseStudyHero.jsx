import styled from "styled-components";

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

export default function CaseStudyHero({ title, subtitle, children }) {
  return (
    <Wrap>
      <Title>
        {title} {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </Title>
      {children}
    </Wrap>
  );
}
