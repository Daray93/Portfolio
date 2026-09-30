import { Children, isValidElement } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useCaseStudyView, SectionNumberContext } from "./CaseStudyViewContext";
import { Paragraph } from "./Prose";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { easeArr } from "../../styles/motion";

// One section of a case study: its number and heading, then its content.
//
// Each section fades in once as it scrolls into view: the heading, then its
// content piece by piece, each with the smallest lift -- quick and quiet, so
// nothing is still arriving while it's being read. Nothing moves with
// reduced motion.

const Row = styled(motion.section)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.75rem;

  @media (max-width: 900px) {
    gap: 1.25rem;
  }
`;

// A hairline above each section on wider screens, its number small and
// quiet above a real heading: normal case, the page's second level after
// the cover title. No line on phones.
const Head = styled.div`
  display: grid;
  gap: 0.6rem;
  width: 100%;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 900px) {
    gap: 0.4rem;
    padding-top: 1.25rem;
  }

  @media (max-width: 640px) {
    padding-top: 0;
    border-top: 0;
  }
`;

// the section's place in a numbered case study
const SectionNumber = styled(motion.span)`
  font-size: 0.9rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.textSecondary};
`;

const Title = styled(motion.h2)`
  margin: 0;
  font-family: var(--font-sans);
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: ${({ theme }) => theme.text};
  text-wrap: balance;
  /* phones: a lighter weight, so the heading doesn't sit heavy at this size */
  @media (max-width: 640px) {
    font-weight: 500;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;

  /* a numbered sub-section (06.01, see SubSection in Process.jsx) stands
     apart from what's before it: 3.5rem in all (2.5rem on phones), except
     when it opens the section */
  > * > [data-subsection] {
    margin-top: 2.25rem;
  }

  > *:first-child > [data-subsection] {
    margin-top: 0;
  }

  @media (max-width: 900px) {
    gap: 1rem;

    > * > [data-subsection] {
      margin-top: 1.5rem;
    }
  }
`;

// each piece of content, so it can play in on its own beat
const Piece = styled(motion.div)`
  width: 100%;
`;

const Full = styled.div`
  width: 100%;
`;

const TldrPlaceholder = styled.p`
  margin: 0;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;

// a section's real one-line summary, read like any paragraph
const TldrText = styled(Paragraph)``;

const TldrBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`;

// the words in a TL;DR, whether it's plain text or blocks (Paragraph,
// Questions...), for the reading times on the toggle
function wordsIn(node) {
  if (node == null || typeof node === "boolean") return 0;
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(node)) return node.reduce((n, child) => n + wordsIn(child), 0);
  if (isValidElement(node)) {
    const { children, items } = node.props;
    return wordsIn(children) + wordsIn(items);
  }
  return 0;
}

// ---- the play-in
const EASE = easeArr.out;

// one gentle step for everything: a fade with the smallest lift
const fade = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const section = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06 } },
};

const head = fade;

// the section number and heading arrive together, as one
const number = {};
const title = {};

const body = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.05 } },
};

const piece = fade;

export default function CaseStudySection({
  id,
  title: heading,
  children,
  full,
  tldrVisible = false,
  tldr,
  tldrMedia,
  ...props
}) {
  const { view, numberOf } = useCaseStudyView();
  const { reduced } = useMotionPreference();
  const sectionNumber = numberOf?.(id);

  // TL;DR mode shortens every section rather than removing it -- the
  // overview/hero section (tldrVisible) is exempt since it's already
  // the short version of the page. Everything else swaps its full body
  // for a condensed one-liner (a real `tldr` prop when a section has
  // been given one, otherwise a placeholder) plus, when the section has
  // one, the same image/video used in the full story -- a skim reader
  // should still see the work, not just read about it.
  const isShortened = view === "tldr" && !tldrVisible;

  // plays once, as the section comes a little way into view; with reduced
  // motion everything is simply there
  const play = reduced
    ? { initial: false }
    : {
        initial: "hidden",
        whileInView: "shown",
        viewport: { once: true, margin: "0px 0px -6% 0px" },
      };

  return (
    <SectionNumberContext.Provider value={sectionNumber || null}>
      <Row
        id={id}
        variants={section}
        // for the reading times on the TL;DR toggle (see ViewToggle)
        data-case-section=""
        data-tldr-visible={tldrVisible ? "" : undefined}
        data-tldr-words={tldr ? wordsIn(tldr) : undefined}
        {...play}
        {...props}
      >
        {heading && (
          <Head as={motion.div} variants={head}>
            {sectionNumber && <SectionNumber variants={number}>{sectionNumber}</SectionNumber>}
            <Title variants={title}>{heading}</Title>
          </Head>
        )}
        <Body as={motion.div} variants={body}>
          {isShortened ? (
            <Piece variants={piece}>
              <TldrBody>
                {tldrMedia}
                {/* plain text is one paragraph; blocks render as they are */}
                {tldr && typeof tldr === "string" ? (
                  <TldrText>{tldr}</TldrText>
                ) : tldr ? (
                  tldr
                ) : (
                  <TldrPlaceholder>
                    {heading
                      ? `TL;DR placeholder — a shortened summary of "${heading}" goes here.`
                      : "TL;DR placeholder — a shortened summary goes here."}
                  </TldrPlaceholder>
                )}
              </TldrBody>
            </Piece>
          ) : (
            Children.toArray(children).map((child, i) => (
              <Piece key={child?.key ?? i} variants={piece}>
                {child}
              </Piece>
            ))
          )}
        </Body>
        {!isShortened && full && <Full>{full}</Full>}
      </Row>
    </SectionNumberContext.Provider>
  );
}
