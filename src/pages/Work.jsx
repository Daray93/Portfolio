import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import logoGif from "../assets/Logo-gif.gif";
import tusGif from "../assets/tusFit.gif";
import wMGif from "../assets/weddingM.gif";
import hook from "../assets/hook.mp4";
import thera from "../assets/Aoede.svg";

// Styled Components (copied from your Work.jsx with some tweaks)
const PageWrapper = styled.div`
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: ${({ theme }) => theme.textPrimary};
`;

const Grid = styled.div`
  display: grid;
  gap: 2.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const Card = styled(Link)`
  background-color: ${({ theme }) => theme.projectsBg};
  border-radius: 24px;
  box-shadow: rgba(0, 0, 0, 0.00) 0px 6px 24px 0px, rgba(0, 0, 0, 0.00) 0px 0px 0px 1px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border: 2px solid ${({ theme }) => theme.projectsBorder};
     transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  display: flex;
  flex-direction: column;
`;

const CardMediaWrapper = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.textPrimary};
`;

const CardTagline = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0;
`;

// Your projects data from Projects.jsx
const projects = [
  {
    id: "Aoede",
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

export default function Work() {
  return (
    <PageWrapper>
      {/* <Title>My Work</Title> */}
      <Grid>
        {projects.map(({ id, title, description, image, video, route }) => (
          <Card key={id} to={route}>
            <CardMediaWrapper>
              {video ? (
                <CardVideo
                  src={video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-label={title}
                />
              ) : (
                <CardImage src={image} alt={title} />
              )}
            </CardMediaWrapper>

            <CardContent>
              <CardTitle>{title}</CardTitle>
              <CardTagline>{description}</CardTagline>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </PageWrapper>
  );
}
