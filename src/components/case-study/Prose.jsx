import styled from "styled-components";

// Shared building blocks for case study writing: body text, lists, pills,
// a live-site link, and clearly labelled stand-ins for screens that haven't
// been captured yet.

// body text: a touch smaller on phones, for more words to a line
export const Paragraph = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
  max-width: 65ch;
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

// a heading within a section (the section's own title is the h2)
export const Subheading = styled.h3`
  margin: 1rem 0 0;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: ${({ theme }) => theme.text};
`;

// The project at a glance, under the overview: Role, Year, Sector, Team,
// Tools. As many across as fit (all five on a wide screen), two on phones.
// Pass `items` as [label, value] pairs.
const FactsList = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 1.25rem 2rem;
  width: 100%;
  margin: 0.75rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  dt {
    margin: 0 0 0.3rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.textSecondary};
  }

  dd {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.45;
    color: ${({ theme }) => theme.text};
  }
`;

export function Facts({ items }) {
  return (
    <FactsList>
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </FactsList>
  );
}

export const List = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
  max-width: 65ch;
  font-size: 1.05rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.text};

  strong {
    font-weight: 600;
  }

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

export const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[2]};
`;

export const Pill = styled.span`
  padding: ${({ theme }) => `${theme.space[1]} ${theme.space[3]}`};
  border-radius: 999px;
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.8rem;
`;

export const Callout = styled.div`
  padding: 1.25rem 1.5rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 65ch;
`;

export const LiveLink = styled.a`
  display: inline-flex;
  /* sections stack their content in a column, which would stretch the
     button full width: it keeps its own */
  align-self: flex-start;
  justify-self: start;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  font-weight: 500;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  color: ${({ theme }) => theme.buttonPrimaryText};

  &:hover {
    color: ${({ theme }) => theme.buttonPrimaryText};
    background: ${({ theme }) => theme.buttonPrimaryHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
  }

  /* phones: a full-width button, easy to hit with a thumb */
  @media (max-width: 640px) {
    align-self: stretch;
    width: 100%;
    justify-content: center;
    padding: 0.9rem 1.2rem;
  }
`;

// Stands in for real screenshots until they exist -- obviously a
// placeholder rather than a stretched logo that looks broken.
export const MediaPlaceholder = styled.div`
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.cardInset};
  font-size: 0.85rem;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;

export const MediaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  width: 100%;

  ${MediaPlaceholder} {
    flex: 1;
    min-width: 200px;
  }
`;
