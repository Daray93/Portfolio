import styled from "styled-components";
import Figure from "./Figure";
import { MediaPlaceholder } from "./Prose";
import { useSectionNumber, useCaseStudyView } from "./CaseStudyViewContext";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";

// The blocks that show the process, not just the product (see
// CASE-STUDY-PLAN.md), the same on every case study:
//
//   <Tag hypothesis />                         Evidence, or Hypothesis when
//                                                it came from my own reasoning
//   <Insights rows={[{ tag, source, finding, insight, response }]} />
//                                               Finding -> Insight -> Design
//                                                response, stacked on phones
//   <SubSection number title summary>…</SubSection>
//                                               a numbered part of a section,
//                                                "06.01" in section 06, with
//                                                the room above it set once
//                                                (see CaseStudySection)
//   <Challenge number title summary insight tag work outcome>screens</Challenge>
//                                               one design challenge in The
//                                                solution (a SubSection)
//   <BeforeAfter number title before after note />
//                                               two screens and what changed
//                                                (a SubSection);
//                                                `before`/`after` are
//                                                { src, alt } or a placeholder
//                                                label while uncaptured
//   <Criteria rows={[[criterion, how, result]]} />
//                                               success criteria; no result
//                                                reads "Not tested yet"
//   <Questions items={[[question, ["06.01", "06.02"]]]} />
//                                               the "How might we" questions
//                                                the page sets out to answer,
//                                                set large, each linking to
//                                                the sub-sections that answer
//                                                it
//   <Closing outcome learned next />          the page's last three parts

// ---- Evidence or Hypothesis
const TagPill = styled.span`
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: ${({ theme }) => theme.text};
  background: ${({ theme, $hypothesis }) => ($hypothesis ? "transparent" : theme.cardInset)};
  /* a hypothesis is drawn open: a dashed outline, nothing filled in yet */
  box-shadow: ${({ theme, $hypothesis }) => ($hypothesis ? "none" : `inset 0 0 0 1px ${theme.border}`)};
  border: ${({ theme, $hypothesis }) => ($hypothesis ? `1px dashed ${theme.textSecondary}` : "0")};
`;

export function Tag({ hypothesis = false }) {
  return <TagPill $hypothesis={hypothesis}>{hypothesis ? "Hypothesis" : "Evidence"}</TagPill>;
}

// the small grey label over a labelled part
const Label = styled.span`
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
`;

const Text = styled.div`
  font-size: 1rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.text};

  p {
    margin: 0;
  }

  p + p {
    margin-top: 0.6rem;
  }

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

// ---- Insights
const InsightList = styled.ol`
  display: grid;
  gap: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const InsightRow = styled.li`
  display: grid;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`;

const RowHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem 2rem;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
`;

export function Insights({ rows }) {
  return (
    <InsightList>
      {rows.map((row, i) => (
        <InsightRow key={i}>
          <RowHead>
            <Tag hypothesis={row.tag === "hypothesis"} />
            {row.source && <span>{row.source}</span>}
          </RowHead>
          <Columns>
            <Text>
              <Label>Finding</Label>
              {row.finding}
            </Text>
            <Text>
              <Label>Insight</Label>
              {row.insight}
            </Text>
            <Text>
              <Label>Design response</Label>
              {row.response}
            </Text>
          </Columns>
        </InsightRow>
      ))}
    </InsightList>
  );
}

// ---- a numbered sub-section
//
// Numbering, the same on every case study:
//   06        a section (CaseStudySection)
//   06.01     a sub-section: one of a section's peer parts -- a design
//             challenge, an iteration -- always numbered, in order
//   Subheading   a small heading inside running text, never numbered
const SubBlock = styled.article`
  display: grid;
  gap: 1rem;
  width: 100%;
  /* lands clear of the header when a link jumps here (see Questions) */
  scroll-margin-top: 6rem;

  &:focus {
    outline: none;
  }
`;

// "06.01" -> "part-06-01", the id a link to a sub-section uses
const partId = (label) => `part-${label.replace(".", "-")}`;

const SubHead = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const SubNumber = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.textSecondary};
`;

const SubTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
  color: ${({ theme }) => theme.text};
  text-wrap: balance;

  @media (max-width: 640px) {
    font-size: 1.15rem;
  }
`;

const Summary = styled.p`
  margin: 0;
  max-width: 60ch;
  font-size: 1.05rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.textSecondary};

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

export function SubSection({ number, title, summary, children }) {
  const parent = useSectionNumber();
  const own = number != null ? String(number).padStart(2, "0") : null;
  const label = own && parent ? `${parent}.${own}` : own;
  return (
    <SubBlock
      data-subsection=""
      id={own && parent ? partId(label) : undefined}
      // focusable from script only, so a jump moves keyboard focus here too
      tabIndex={own && parent ? -1 : undefined}
    >
      <SubHead>
        {label && <SubNumber>{label}</SubNumber>}
        <SubTitle>{title}</SubTitle>
        {summary && <Summary>{summary}</Summary>}
      </SubHead>
      {children}
    </SubBlock>
  );
}

// ---- a design challenge
const Parts = styled.div`
  display: grid;
  gap: 1rem;
  max-width: 65ch;
`;

const PartLabel = styled(Label)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export function Challenge({ number, title, summary, insight, tag, work, outcome, children }) {
  return (
    <SubSection number={number} title={title} summary={summary}>
      <Parts>
        {insight && (
          <Text>
            <PartLabel>
              Insight {tag && <Tag hypothesis={tag === "hypothesis"} />}
            </PartLabel>
            {insight}
          </Text>
        )}
        {work && (
          <Text>
            <Label>The work</Label>
            {work}
          </Text>
        )}
        <Text>
          <Label>Outcome</Label>
          {outcome || <p>To be validated.</p>}
        </Text>
      </Parts>
      {children}
    </SubSection>
  );
}

// ---- before and after
const Pair = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  max-width: 520px;

  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const Side = styled.div`
  display: grid;
  gap: 0.5rem;
  align-content: start;

  ${MediaPlaceholder} {
    min-height: 320px;
    padding: 1rem;
  }
`;

const Note = styled.div`
  max-width: 65ch;
  font-size: 1rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.text};

  p {
    margin: 0;
  }

  p + p {
    margin-top: 0.6rem;
  }
`;

function Screen({ label, shot }) {
  return (
    <Side>
      <Label>{label}</Label>
      {typeof shot === "string" || !shot ? (
        <MediaPlaceholder>{shot || `${label}: add screenshot`}</MediaPlaceholder>
      ) : (
        <Figure src={shot.src} alt={shot.alt} />
      )}
    </Side>
  );
}

export function BeforeAfter({ number, title, before, after, note }) {
  return (
    <SubSection number={number} title={title}>
      <Pair>
        <Screen label="Before" shot={before} />
        <Screen label="After" shot={after} />
      </Pair>
      {note && <Note>{note}</Note>}
    </SubSection>
  );
}

// ---- success criteria
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.text};

  th {
    padding: 0 1rem 0.75rem 0;
    font-size: 0.8rem;
    font-weight: 500;
    text-align: left;
    color: ${({ theme }) => theme.textSecondary};
  }

  td {
    padding: 1rem 1rem 1rem 0;
    vertical-align: top;
    border-top: 1px solid ${({ theme }) => theme.border};
  }

  td:first-child {
    font-weight: 500;
  }

  tr:last-child td {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  /* phones: each criterion becomes a small card of labelled lines */
  @media (max-width: 640px) {
    thead {
      display: none;
    }

    tbody,
    tr,
    td {
      display: block;
    }

    tr {
      padding: 1rem 0;
      border-top: 1px solid ${({ theme }) => theme.border};
    }

    tr:last-child {
      border-bottom: 1px solid ${({ theme }) => theme.border};
    }

    td,
    tr:last-child td {
      padding: 0;
      border: 0;
    }

    td + td {
      margin-top: 0.6rem;
    }

    td + td::before {
      content: attr(data-label);
      display: block;
      margin-bottom: 0.15rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: ${({ theme }) => theme.textSecondary};
    }
  }
`;

const Pending = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
`;

export function Criteria({ rows }) {
  return (
    <Table>
      <thead>
        <tr>
          <th scope="col">Success criterion</th>
          <th scope="col">How it&apos;s evaluated</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([criterion, how, result]) => (
          <tr key={criterion}>
            <td>{criterion}</td>
            <td data-label="How it's evaluated">{how}</td>
            <td data-label="Result">{result || <Pending>Not tested yet</Pending>}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// ---- Outcome / What I learned / Next steps
const Trio = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem 2rem;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const TrioPart = styled(Text)`
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};

  ul {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.4rem;
  }
`;

const TrioTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

export function Closing({ outcome, learned, next }) {
  return (
    <Trio>
      <TrioPart>
        <TrioTitle>Outcome</TrioTitle>
        {outcome}
      </TrioPart>
      <TrioPart>
        <TrioTitle>What I learned</TrioTitle>
        {learned}
      </TrioPart>
      <TrioPart>
        <TrioTitle>Next steps</TrioTitle>
        {next}
      </TrioPart>
    </Trio>
  );
}

// ---- the questions the page answers
const QuestionList = styled.ol`
  display: grid;
  gap: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: question;
`;

const Question = styled.li`
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 0.35rem 0.75rem;
  padding: 1.25rem 0;
  border-top: 1px solid ${({ theme }) => theme.border};
  counter-increment: question;

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  &::before {
    content: counter(question, decimal-leading-zero);
    grid-row: 1 / span 2;
    padding-top: 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.textSecondary};
  }

  @media (max-width: 640px) {
    grid-template-columns: 2rem minmax(0, 1fr);
    padding: 1rem 0;
  }
`;

const QuestionText = styled.p`
  margin: 0;
  max-width: 34ch;
  font-size: clamp(1.2rem, 1.8vw, 1.45rem);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.3;
  color: ${({ theme }) => theme.text};
  text-wrap: balance;
`;

const Answered = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};

  a {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: ${({ theme }) => theme.text};
    text-decoration: underline;
    text-decoration-color: ${({ theme }) => theme.border};
    text-underline-offset: 0.2em;
    transition: text-decoration-color 0.2s;
  }

  a:hover {
    text-decoration-color: currentColor;
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

// "06.01", "06.01 and 06.02", "06.01, 06.02 and 06.03"
function joinWith(parts) {
  return parts.flatMap((part, i) => {
    if (i === 0) return [part];
    return [i === parts.length - 1 ? " and " : ", ", part];
  });
}

export function Questions({ items }) {
  const { view, setView } = useCaseStudyView();
  const { reduced } = useMotionPreference();

  // scroll to the sub-section and move focus there. In TL;DR mode the
  // sub-sections aren't on the page, so switch to the full story first
  const jump = (e, label) => {
    e.preventDefault();
    const go = () => {
      const target = document.getElementById(partId(label));
      if (!target) return;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      target.focus({ preventScroll: true });
      window.history.replaceState(null, "", `#${partId(label)}`);
    };
    if (view === "tldr") {
      setView("detailed");
      requestAnimationFrame(() => requestAnimationFrame(go));
    } else {
      go();
    }
  };

  return (
    <QuestionList>
      {items.map(([question, answeredIn = []]) => (
        <Question key={question}>
          <QuestionText>{question}</QuestionText>
          {answeredIn.length > 0 && (
            <Answered>
              Answered in{" "}
              {joinWith(
                answeredIn.map((label) => (
                  <a key={label} href={`#${partId(label)}`} onClick={(e) => jump(e, label)}>
                    {label}
                  </a>
                ))
              )}
            </Answered>
          )}
        </Question>
      ))}
    </QuestionList>
  );
}
