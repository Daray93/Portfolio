import { useEffect, useState } from "react";
import styled from "styled-components";
import { LayoutGroup, motion } from "framer-motion";
import { useCaseStudyView } from "./CaseStudyViewContext";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { dur, easeArr } from "../../styles/motion";

// TL;DR or the full length: switches every section between its one-line
// summary (a section's `tldr`) and its full content. Sits above the
// overview. The same look as the header's pill nav: a frosted track, the
// current choice filled, the fill sliding between them.
//
// Each option shows its reading time, worked out from the page when it
// loads (in full): every word of every section for the full length; for
// the TL;DR, each section's heading and summary (the overview in full).
// At an average 220 words a minute, never under a minute.

const WORDS_PER_MINUTE = 220;
const words = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;
const minutes = (n) => Math.max(1, Math.round(n / WORDS_PER_MINUTE));

function readingTimes() {
  let full = 0;
  let tldr = 0;
  document.querySelectorAll("[data-case-section]").forEach((el) => {
    const all = words(el.textContent);
    full += all;
    if (el.hasAttribute("data-tldr-visible")) tldr += all;
    else tldr += words(el.querySelector("h2")?.textContent) + Number(el.dataset.tldrWords || 0);
  });
  return full ? { tldr: minutes(tldr), detailed: minutes(full) } : null;
}

const OPTIONS = [
  { id: "tldr", label: "TL;DR" },
  { id: "detailed", label: "Full length" },
];

const Track = styled.div`
  display: inline-flex;
  /* its own width, and close above the overview: the page spaces its
     sections 6rem apart (4rem on phones; see CaseStudyPage), and this
     belongs with the first one */
  /* 3rem to the overview on desktop and tablets, 2.75rem on phones */
  align-self: flex-start;
  margin-bottom: -3rem;

  @media (max-width: 768px) {
    margin-bottom: -1rem;
  }

  @media (max-width: 640px) {
    margin-bottom: -1.25rem;
  }

  /* phones: full width, the two choices sharing it evenly */
  @media (max-width: 640px) {
    align-self: stretch;
    display: flex;
  }

  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.navSurface};
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)")};
`;

const Option = styled.button`
  position: relative;
  padding: 0.55rem 1.15rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme, $on }) => ($on ? theme.buttonPrimaryText : theme.textSecondary)};
  transition: color ${dur.fast}s ease;

  &:hover {
    color: ${({ theme, $on }) => ($on ? theme.buttonPrimaryText : theme.text)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    flex: 1;
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
  }
`;

const Fill = styled(motion.span)`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: ${({ theme }) => theme.buttonPrimaryBg};
`;

const Label = styled.span`
  position: relative;
  z-index: 1;
`;

// the reading time, a step quieter than the choice itself
const Time = styled.span`
  opacity: 0.7;
  font-weight: 400;
`;

export default function ViewToggle() {
  const { view, setView } = useCaseStudyView();
  const { reduced } = useMotionPreference();
  // measured once, while the page shows everything (it opens in full)
  const [times, setTimes] = useState(null);
  useEffect(() => {
    if (view === "detailed" && !times) setTimes(readingTimes());
  }, [view, times]);
  const slide = reduced ? { duration: 0 } : { duration: dur.base, ease: easeArr.out };

  return (
    // its own layout group, so its fill never slides to or from another
    // pill on the page
    <LayoutGroup id="case-study-view">
      <Track role="group" aria-label="How much to read">
        {OPTIONS.map((o) => {
          const on = view === o.id;
          return (
            <Option key={o.id} type="button" $on={on} aria-pressed={on} onClick={() => setView(o.id)}>
              {on && <Fill layoutId="view-fill" style={{ borderRadius: 999 }} transition={slide} />}
              <Label>
                {o.label}
                {times && <Time> · {times[o.id]} min</Time>}
              </Label>
            </Option>
          );
        })}
      </Track>
    </LayoutGroup>
  );
}
