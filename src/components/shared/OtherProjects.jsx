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
import OrthoViveLogo from "../../case-studies/orthovive/assets/OrthoVive.png";
import AvocadoLogo from "../../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";
import AudanoteLogo from "../../case-studies/audanote/assets/Audanote-logo.svg";

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

// Minimal stand-in for HoverCard (see components/home/HoverCard.jsx) --
// used for projects whose homepage cell is icon-only rather than a video/
// screenshot preview (OrthoVive's password-gated cell, Avocado's mascot
// tile). Doesn't reuse HoverCard directly since that component bakes in
// its own lock cursor/badge, which is only correct for the gated ones.
const IconCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.cardBackground};
`;

const IconMedia = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
`;

const IconOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  pointer-events: none;
`;

const IconLeftStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const IconTitle = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-weight: 500;
  font-family: "General Sans", sans-serif;
  letter-spacing: 0.01em;
`;

const IconTag = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${({ $bg }) => $bg || "rgba(235, 235, 230, 0.85)"};
  color: ${({ $color }) => $color || "#000"};
  border: 1px solid ${({ $color }) => ($color ? `${$color}55` : "#00000022")};
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
    sway: true,
    tag: "Conservation Case Study",
    tagColor: "#92400E",
    cursor: "view",
    path: "/ibhf",
  },
  {
    id: "orthovive",
    type: "icon",
    title: "OrthoVive",
    icon: OrthoViveLogo,
    tag: "Med-Tech Case Study",
    cursor: "locked",
    path: "/orthovive",
  },
  {
    id: "operation-avocado",
    type: "icon",
    title: "Operation Avocado",
    icon: AvocadoLogo,
    tag: "Mobile Web App",
    cursor: "view",
    path: "/operation-avocado",
  },
  {
    id: "audanote",
    type: "icon",
    title: "Audanote",
    icon: AudanoteLogo,
    tag: "Health-Tech Case Study",
    cursor: "locked",
    path: "/audanote",
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
            ) : project.type === "icon" ? (
              <IconCard>
                {project.icon && <IconMedia src={project.icon} alt="" />}
                {(project.title || project.tag) && (
                  <IconOverlay>
                    <IconLeftStack>
                      {project.title && <IconTitle>{project.title}</IconTitle>}
                      {project.tag && (
                        <IconTag $color={project.tagColor}>{project.tag}</IconTag>
                      )}
                    </IconLeftStack>
                  </IconOverlay>
                )}
              </IconCard>
            ) : (
              <ScreenshotPanCard
                screens={project.screens}
                title={project.title}
                tag={project.tag}
                tagColor={project.tagColor}
                focalPoint={project.focalPoint}
                sway={project.sway}
              />
            )}
          </CardLink>
        ))}
      </Grid>
    </Wrapper>
  );
}
