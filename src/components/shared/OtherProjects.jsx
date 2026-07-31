import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import VideoHoverCard from "../home/VideoHoverCard";
import ScreenshotPanCard from "../home/ScreenshotPanCard";
import NeuroloopVideo from "../../case-studies/neuroloop/assets/NeuroloopTeaser.mp4";
import kroptSplash1 from "../../case-studies/kropt/assets/Kropt-splash001.svg";
import kroptSplash2 from "../../case-studies/kropt/assets/Kropt-splash002.svg";
import IbhfBee from "../../case-studies/ibhf/assets/irishBb.jpg";

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
// Same asset/copy/colour as each project's own homepage cell (see
// Splash.jsx) -- including which CARD TYPE it uses (video vs screenshot
// pan), so this reads as the same tile shown a second time, not a
// differently-styled stand-in for it.
const KROPT_SCREENS = [[kroptSplash1, kroptSplash2]];
const IBHF_SCREENS = [IbhfBee];

const PROJECTS = [
  {
    id: "neuroloop",
    type: "video",
    title: "Neuroloop",
    video: NeuroloopVideo,
    crop: "scale(1.18) translate(-3%, -3%)",
    tag: "AI & VR Case Study",
    tagColor: "#0c5562",
    cursor: "view",
    path: "/neuroloop",
  },
  {
    id: "kropt",
    type: "screenshot",
    title: "Kropt Mobile App",
    screens: KROPT_SCREENS,
    tag: "Ag-Tech Case Study",
    tagColor: "#497025",
    cursor: "view-light",
    path: "/kropt",
  },
  {
    id: "ibhf",
    type: "screenshot",
    title: "IBHF",
    screens: IBHF_SCREENS,
    focalPoint: 0.6,
    tag: "Conservation Case Study",
    tagColor: "#92400E",
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
            {project.type === "video" ? (
              <VideoHoverCard
                src={project.video}
                title={project.title}
                tag={project.tag}
                crop={project.crop}
                tagColor={project.tagColor}
              />
            ) : (
              <ScreenshotPanCard
                screens={project.screens}
                title={project.title}
                tag={project.tag}
                tagColor={project.tagColor}
                focalPoint={project.focalPoint}
              />
            )}
          </CardLink>
        ))}
      </Grid>
    </Wrapper>
  );
}
