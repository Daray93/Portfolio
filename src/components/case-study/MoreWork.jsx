import styled from "styled-components";
import { motion } from "framer-motion";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiLock } from "react-icons/fi";
import ProjectMedia from "../showcase/ProjectMedia";
import Tagline from "../showcase/Tagline";
import projects from "../../data/projects";
import { ease, easeArr, dur } from "../../styles/motion";
import { COVER_RADIUS } from "../showcase/coverFrame";

// The end of a case study: the other projects, from the same list and
// with the same pictures as the homepage carousel, so they always match
// it. The next project (in carousel order, wrapping round) comes first and
// large; the rest follow two across (stacked on phones).
//
// Its gap above matches the one between the cover and the first section
// (--cover-gap, set on CaseStudyLayout's Frame).

const Section = styled(motion.section)`
  display: grid;
  gap: 2rem;
  margin-top: var(--cover-gap, 8rem);
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 900px) {
    gap: 1.5rem;
    padding-top: 1.25rem;
  }

  /* no line on phones, as with the sections above */
  @media (max-width: 640px) {
    padding-top: 0;
    border-top: 0;
  }
`;

// plays in like a section (see CaseStudySection): the heading, then each
// card in turn
const play = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06 } },
};
const rise = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeArr.out } },
};
const Rise = motion.div;

// the same scale as a section heading (see CaseStudySection)
const Heading = styled.h2`
  margin: 0;
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.15;
  color: ${({ theme }) => theme.text};
  /* phones: a lighter weight, so the heading doesn't sit heavy at this size */
  @media (max-width: 640px) {
    font-weight: 500;
  }
`;

const Rest = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Card = styled(Link)`
  display: grid;
  gap: 1rem;
  color: ${({ theme }) => theme.text};

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 6px;
    border-radius: ${COVER_RADIUS.default}px;
  }
`;

// The picture, framed like the carousel card and the cover. The explicit
// clip keeps the corners round while the picture scales on hover.
const Media = styled.div`
  position: relative;
  aspect-ratio: ${({ $large }) => ($large ? "16 / 9" : "16 / 10")};
  border-radius: ${COVER_RADIUS.default}px;
  clip-path: inset(0 round ${COVER_RADIUS.default}px);
  overflow: hidden;
  isolation: isolate;

  > :first-child {
    transition: transform ${dur.slow}s ${ease.out};
  }

  /* the same hairline frame as the carousel's cards */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px
      ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)")};
    pointer-events: none;
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    ${Card}:hover & > :first-child {
      transform: scale(1.04);
    }
  }

  @media (max-width: 640px) {
    aspect-ratio: 4 / 3;
    border-radius: ${COVER_RADIUS.phone}px;
    clip-path: inset(0 round ${COVER_RADIUS.phone}px);
  }
`;

// the padlock on a password-protected project
const Lock = styled.span`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: #fff;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Text = styled.div`
  display: grid;
  gap: 0.3rem;
`;

const Eyebrow = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
`;

const Name = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${({ $large }) => ($large ? "clamp(1.4rem, 2.2vw, 1.75rem)" : "1.2rem")};
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;

  svg {
    flex-shrink: 0;
    width: 0.9em;
    height: 0.9em;
    transition: transform ${dur.base}s ${ease.out};
  }

  ${Card}:hover & svg {
    transform: translate(2px, -2px);
  }
`;

const Line = styled.span`
  font-size: 1rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.textSecondary};
`;

function ProjectCard({ project, large = false }) {
  return (
    <Card to={project.to}>
      <Media $large={large}>
        <ProjectMedia project={project} />
        {project.locked && (
          <Lock aria-label="Password protected">
            <FiLock aria-hidden="true" />
          </Lock>
        )}
      </Media>
      <Text>
        {large && <Eyebrow>Next project</Eyebrow>}
        <Name $large={large}>
          {project.title}
          <FiArrowUpRight aria-hidden="true" />
        </Name>
        <Line>
          <Tagline project={project} />
        </Line>
      </Text>
    </Card>
  );
}

export default function MoreWork({ currentProjectId }) {
  const i = projects.findIndex((p) => p.id === currentProjectId);
  // from the next one round to the one before this, in carousel order
  const others = i < 0 ? projects : [...projects.slice(i + 1), ...projects.slice(0, i)];
  const { reduced } = useMotionPreference();
  if (!others.length) return null;
  const [next, ...rest] = others;
  const motionProps = reduced
    ? { initial: false }
    : { initial: "hidden", whileInView: "shown", viewport: { once: true, margin: "0px 0px -6% 0px" } };

  return (
    <Section aria-labelledby="more-work" variants={play} {...motionProps}>
      <Rise variants={rise}>
        <Heading id="more-work">More work</Heading>
      </Rise>
      <Rise variants={rise}>
        <ProjectCard project={next} large />
      </Rise>
      {rest.length > 0 && (
        <Rest as={motion.div} variants={play}>
          {rest.map((p) => (
            <Rise key={p.id} variants={rise}>
              <ProjectCard project={p} />
            </Rise>
          ))}
        </Rest>
      )}
    </Section>
  );
}
