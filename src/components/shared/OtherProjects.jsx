import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import ScreenshotPanCard from "../home/ScreenshotPanCard";
import AvocadoJumpingJack from "../../case-studies/operation-avocado/AvocadoJumpingJack";
import { lightTheme } from "../../styles/theme";
import neuroloopHero from "../../case-studies/neuroloop/assets/NeuroloopHero.png";
import kroptHeader from "../../case-studies/kropt/assets/KroptHeader.png";
import IbhfCell from "../../case-studies/ibhf/assets/ibhf-cell.png";
import OrthoViveLogo from "../../case-studies/orthovive/assets/OrthoVive.png";
import AudanoteLogo from "../../case-studies/audanote/assets/Audanote-logo.svg";

// ---------------- Styled ----------------
const Wrapper = styled(motion.section)`
  margin: 0rem 0rem 0 0rem;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

const Heading = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

// Breaks the card row out of CaseStudyLayout's Frame, which caps at
// 900px -- above that width Frame leaves the row cramped into 2 cards
// per line with a lonely 3rd wrapping below instead of using the
// desktop viewport's real width. Below 900px Frame is already
// full-width itself (nothing to break out of), so this collapses to a
// normal block there via the media query.
const GridBreakout = styled.div`
  @media (min-width: 901px) {
    width: 100vw;
    margin-left: calc(50% - 50vw);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 320px));
  justify-content: center;
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 3rem;

  @media (max-width: 900px) {
    padding: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CardLink = styled(Link)`
  display: block;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.skeletonBase};
  /* Matches ScreenshotPanCard's Frame -- it already moved off a fixed
     24px to this same responsive clamp for exactly this reason (see its
     own border-radius comment). A flat 24px here drifted from that
     radius at most viewport widths, so this link's own clip edge and its
     content's rounded corner didn't quite line up. */
  border-radius: ${({ theme }) => theme.radius.xxl};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 1 / 0.9;

  /* This link IS the overflow:hidden element (not a wrapper around one,
     like Splash.jsx's CardSurface/GridSlot split), so a normal outline
     would get clipped by its own overflow -- inset never extends past
     its own edge, so it can't be. See CardSurface in Splash.jsx for the
     same reasoning. */
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 3px ${({ theme }) => theme.accent};
  }
`;

// Minimal stand-in for HoverCard (see components/home/HoverCard.jsx) --
// used for projects whose homepage cell is icon-only rather than a
// video/screenshot preview (OrthoVive and Audanote's password-gated
// cells). Doesn't reuse HoverCard directly since that component bakes in
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
  /* Above the Avocado rig's own internal stacking (TimerLabel tops out at
     z-index:3, see AvocadoJumpingJack.jsx) -- neither AvocadoCard nor
     Stage sets a z-index of their own, so nothing between here and there
     opens a new stacking context to contain those values; this has to
     outrank them directly or the rig/its hover countdown paint over this
     card's title/tag instead of sitting behind it. */
  z-index: 4;
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
  font-family: "Fraunces Variable", serif;
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

// Avocado's homepage cell is a live rig (AvocadoJumpingJack), not a
// static image -- there's no screenshot/icon asset for it to share with
// IconCard/ScreenshotPanCard above. Just the rig and its ground shadow
// (see `showTimer={false}` below) plus the same "In Progress" pill
// Splash.jsx shows on it (see AvocadoCell/ComingSoonPill there).
const AvocadoCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const AvocadoBadge = styled.span`
  position: absolute;
  top: clamp(0.6rem, 1.5vw, 1rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  z-index: 5;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.navSurface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Fraunces Variable", serif;
  font-size: 0.75rem;
  font-weight: 400;
  border-radius: 20px;
  padding: 4px 10px;
  pointer-events: none;
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
// Splash.jsx) -- including which CARD TYPE it uses (static screenshot,
// icon, or the Avocado rig), so this reads as the same tile shown a
// second time, not a differently-styled stand-in for it.
const NEUROLOOP_SCREENS = [neuroloopHero];
const KROPT_SCREENS = [kroptHeader];
const IBHF_SCREENS = [IbhfCell];

// Newest to oldest project.
const PROJECTS = [
  {
    id: "operation-avocado",
    type: "avocado",
    title: "Operation Avocado",
    tag: "Mobile Web App",
    path: "/operation-avocado",
  },
  {
    id: "orthovive",
    type: "icon",
    title: "OrthoVive",
    icon: OrthoViveLogo,
    tag: "Med-Tech Case Study",
    path: "/orthovive",
  },
  {
    id: "ibhf",
    type: "screenshot",
    title: "IBHF",
    screens: IBHF_SCREENS,
    tag: "Conservation Case Study",
    tagColor: "#92400E",
    path: "/ibhf",
  },
  {
    id: "audanote",
    type: "icon",
    title: "Audanote",
    icon: AudanoteLogo,
    tag: "Health-Tech Case Study",
    path: "/audanote",
  },
  {
    id: "kropt",
    type: "screenshot",
    title: "Kropt Mobile App",
    screens: KROPT_SCREENS,
    tag: "Ag-Tech Case Study",
    tagColor: "#497025",
    path: "/kropt",
  },
  {
    id: "neuroloop",
    type: "screenshot",
    title: "Neuroloop",
    screens: NEUROLOOP_SCREENS,
    tag: "AI & VR Case Study",
    tagColor: "#0c5562",
    path: "/neuroloop",
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
      <GridBreakout>
        <Grid>
          {filtered.map((project) => (
            // OrthoVive and Audanote stay in light mode regardless of the
            // site's own dark/light toggle, same as their homepage grid
            // cells (see Splash.jsx) -- their category pill has fixed,
            // non-themed colors that only read correctly against a light
            // card. Radius is carved back out of that override (kept as
            // the AMBIENT theme's, not light's) since it's a structural
            // token, not a color one. The function form passes the ambient
            // theme through unchanged for every other card.
            <ThemeProvider
              key={project.id}
              theme={(outer) =>
                project.id === "orthovive" || project.id === "audanote"
                  ? { ...lightTheme, radius: outer.radius }
                  : outer
              }
            >
              <CardLink to={project.path}>
                {project.type === "icon" ? (
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
                ) : project.type === "avocado" ? (
                  <AvocadoCard>
                    <AvocadoJumpingJack fill showTimer={false} rigScale={0.6} />
                    <AvocadoBadge aria-hidden="true">In Progress</AvocadoBadge>
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
                  </AvocadoCard>
                ) : (
                  <ScreenshotPanCard
                    screens={project.screens}
                    title={project.title}
                    tag={project.tag}
                    tagColor={project.tagColor}
                    staticImage
                  />
                )}
              </CardLink>
            </ThemeProvider>
          ))}
        </Grid>
      </GridBreakout>
    </Wrapper>
  );
}
