import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Assets
import logoGif from "../assets/Logo-gif.gif";
import tusGif from "../assets/tusFit.gif";
import wMGif from "../assets/weddingM.gif";
import hook from "../assets/hook.mp4";
import thera from "../assets/Aoede.svg";

// Styled Components
const Section = styled.section`
  width: 100vw;
  min-height: 100vh;        /* full viewport height */
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;  /* vertical centering */
  align-items: center;      /* horizontal centering */
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.projectsBg || "#151515"};
  border-radius: 24px 24px 0 0;

  @media (max-width: 768px) {
    padding-top: 110px;    /* navbar height on mobile */
    margin-top: -110px;    /* offset it back */
  }

  @media (min-width: 480px) {
    min-height: 100vh;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 0;           /* prevent stretching */
  flex-shrink: 0;
  align-items: center;    /* center grid horizontally */

  @media (max-width: 480px) {
    max-width: 100%;
    padding: 0 0.5rem;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 2rem;
  width: 100%;
  justify-content: center;
  flex-grow: 1;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Card = styled(motion.div)`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 300px;
  width: 100%;
  background: transparent;

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const ImageWrapper = styled(motion.div)`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  background: none;
  aspect-ratio: 16 / 9;

  @media (max-width: 480px) {
    aspect-ratio: 16 / 9;
  }
`;

const PlaceholderImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
`;

const ProjectTitle = styled.h3`
  margin: 0.5rem 0 0 0;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 400;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.projectDescription || theme.text || "#333"};
  text-align: center;
  margin-top: 0.3rem;
  margin-bottom: 0rem;
  font-weight: 300;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 2rem;
  }
`;

// Project Data — add route field for linking to each project page
const projects = [
  {
    id: "therapp",
    title: "Current Work",
    description: "Client - Physiotherapist",
    image: thera,
    route: "/aoede",
  },
  {
    id: "fyp",
    title: "Neuroloop",
    description: "Web/VR App design and development",
    video: hook,
    route: "/neuroloop",
  },
  {
    id: "icons",
    title: "Logo Design",
    description: "Brand Design using Figma",
    image: logoGif,
    route: "/logoDesign",
  },
  {
    id: "wedding-mate",
    title: "Wedding Mate",
    description: "Mobile App | Figma Prototype",
    image: wMGif,
    route: "/weddingMate",
  },
  {
    id: "tus-fitness-app",
    title: "TUS Fitness",
    description: "Mobile App | Figma Prototype",
    image: tusGif,
    route: "/tusFitness",
  },
];

// Main Component
export default function Projects() {
  return (
    <Section id="projects">
      <ContentWrapper>
        {/* <Title>My Work</Title> */}
        <ProjectsGrid>
          {projects.map(({ title, description, image, video, route }, i) => (
            <StyledLink to={route} key={i}>
              <Card
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <ImageWrapper
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {video ? (
                    <VideoPlayer
                      src={video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label={title}
                    />
                  ) : (
                    <PlaceholderImage src={image} alt={title} />
                  )}
                </ImageWrapper>
                <ProjectTitle>{title}</ProjectTitle>
                <ProjectDescription>{description}</ProjectDescription>
              </Card>
            </StyledLink>
          ))}
        </ProjectsGrid>
      </ContentWrapper>
    </Section>
  );
}
