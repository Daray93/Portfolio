import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import HoverCardVoir from "../home/HoverCardVoir";
import NeuroloopVideo from "../../case-studies/neuroloop/assets/NeuroloopTeaser.mp4";
import KVideo from "../../case-studies/kropt/assets/KroptVideo.mp4";
import IBHFVideo from "../../case-studies/ibhf/assets/ibhf.mp4";

// ---------------- Styled ----------------
const Wrapper = styled(motion.section)`
  margin: 0rem 0rem 0 0rem;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    margin: 0rem 2rem 0 2rem;
    padding: 1.5rem 0;
  }
`;

const Heading = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const CardLink = styled(Link)`
  display: block;
  width: 300px;
  border: 1px solid ${({ theme }) => theme.skeletonBase};
  border-radius: 24px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 1 / 0.9;

  &:hover {
    
  }
`;

// ---------------- Motion ----------------
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
  },
};

// ---------------- Data ----------------
const PROJECTS = [
  {
    id: "neuroloop",
    title: "Neuroloop",
    video: NeuroloopVideo,
    tag: "AI & VR Case Study",
    tagColor: "#4CA1AF",
    cursor: "view",       // <-- custom cursor
    path: "/neuroloop",
  },
  // {
  //   id: "voir",
  //   title: "Voir DS",
  //   video: VVideo,
  //   tag: "Coming Soon",
  //   tagColor: "#E09F3E",
  //   cursor: "soon", // <-- different custom cursor
  //   path: "/",
  // },
  {
  id: "kropt",
    title: "Kropt",
    video: KVideo,
    tag: "Mobile App Concept",
    tagColor: "#DAFF90",
    cursor: "view",
    path: "/kropt",
  },
  {
    id: "ibhf",
    title: "Irish Bee & Heritage Foundation",
    video: IBHFVideo,
    tag: "Website",
    tagColor: "#F59E0B",
    cursor: "view",
    path: "/ibhf",
  },
];

// ---------------- Component ----------------
export default function OtherProjects({ currentProjectId }) {
  const filtered = PROJECTS.filter((p) => p.id !== currentProjectId);

  if (!filtered.length) return null;

  return (
    <Wrapper
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
    >
      <Heading>Other Projects</Heading>
      <Grid>
        {filtered.map((project) => (
          <CardLink
            key={project.id}
            to={project.path}
            data-cursor={project.cursor} // <-- custom cursor per project
          >
            <HoverCardVoir
              src={project.video}
              title={project.title}
              tag={project.tag}
              crop="scale(1) translateY(0%)"
              tagColor={project.tagColor}
            />
          </CardLink>
        ))}
      </Grid>
    </Wrapper>
  );
}
