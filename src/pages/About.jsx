import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaBook, FaDumbbell, FaMusic, FaUtensils, FaPlane, FaUsers, FaFutbol, FaPalette, FaDog, FaTree, FaDownload, FaEye } from "react-icons/fa";

const Section = styled.section`
  margin: 4rem 0;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const Text = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const CVSection = styled(motion.div)`
  background: ${({ theme }) => theme.textAreaBg};
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 3rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
`;

const CVTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
`;

const CVText = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.textSecondary || "#666"};
`;

const ViewButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: #fefefe;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: #fff;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: #fefefe;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: #fff;
  }

  svg {
    font-size: 1.1rem;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.textAreaBg};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  svg {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.scrollButtonBg};
  }

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  p {
    font-size: 0.95rem;
    color: #555;
    margin-top: 0.5rem;
  }
`;

const interests = [
  { icon: <FaFutbol />, title: "Sports", desc: "From a young age I've always played team sports, I love staying active and competitive." },
  { icon: <FaDumbbell />, title: "Health & Fitness", desc: "Exercise keeps me energised, focused, and inspired." },
  { icon: <FaMusic />, title: "Singing", desc: "Music has always been a creative outlet and a source of joy." },
  { icon: <FaUsers />, title: "Family", desc: "Growing up in a large Irish family shaped my values and humor." },
  { icon: <FaUtensils />, title: "Cooking & Food", desc: "I love experimenting in the kitchen and discovering global flavors." },
  { icon: <FaPlane />, title: "Travel", desc: "Exploring new places feeds my curiosity and creativity." },
  { icon: <FaPalette />, title: "Design", desc: "Design is my language, from UX to storytelling and visual art." },
  { icon: <FaTree />, title: "Outdoors", desc: "In a screen-dominated world, I often crave the wild - mountains, forests, or the sea, I can't get enough." },
  { icon: <FaDog />, title: "Animals", desc: "I adore animals, especially my dog Charlie." },
  { icon: <FaBook />, title: "Lifelong Learning", desc: "I'm always curious, from design trends to new tech, I'm driven to keep growing." }
];

export default function About() {
  return (
    <Section>
        <title>About Dara</title>
        <meta name="description" content="Dara Phillips is an aspiring Product & XR Designer with a passion for immersive, interactive storytelling through technology." />
        <meta name="keywords" content="React, Digital Media, Portfolio, Dara Phillips" />
        <meta property="og:title" content="Dara Phillips Portfolio" />
        <meta property="og:description" content="Recent Graduate | Product & XR Designer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://daraphillips.com" />
        <meta property="og:image" content="https://yourdomain.com/preview.jpg" />

      <Title>About Me</Title>
      <Text
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        I'm <b>Dara Phillips</b>, a curious and creative Irish designer with a love for storytelling, tech, and tasty food.
        As a twin from a big, lively family, I’m all about connection and community. Whether I’m designing immersive
        digital experiences or belting out a tune, I bring passion and purpose to everything I do.
      </Text>

      <CVSection
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <CVTitle>My Resume</CVTitle>
        <CVText>
          Want to dive deeper into my skills, experience, and design journey? Feel free to download or view my CV.
        </CVText>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <DownloadButton href="/Dara-Phillips_cv_2025.pdf" download="/Dara-Phillips_cv_2025.pdf">
            <FaDownload /> Download
          </DownloadButton>
          <ViewButton href="/Dara-Phillips_cv_2025.pdf" target="_blank" rel="noopener noreferrer">
            <FaEye /> View
          </ViewButton>
        </div>
      </CVSection>


      <Grid>
        {interests.map(({ icon, title, desc }, index) => (
          <Card
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {icon}
            <h3>{title}</h3>
            <p>{desc}</p>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
