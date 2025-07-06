import React from "react";
import styled from "styled-components";
import { motion, useScroll, useTransform } from "framer-motion";
import meImage from "../assets/me.png";

const Page = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
`;

const Section = styled.section`
  position: relative;
  height: 80vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
  height: 80vh;
  padding: 0 0.5rem;
  
}
`;

const HeroContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  max-width: 1100px;
  padding: 0rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

const HeroText = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const HeroImage = styled(motion.img)`
  flex: 1;
  max-width: 45%;
  border-radius: 12px;
  height: auto;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 70%;
    display: none; /* Hide on mobile */
  }
`;

const Welcome = styled(motion.h2)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.welcomeText};  // ✅ updated
  margin: 0 0 0.5rem;
  font-weight: 500;
  letter-spacing: 1px;

  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;


const Title = styled(motion.h1)`
  font-size: 2.5rem;

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: ${({ theme }) => theme.subtitle};
  font-size: 1.75rem;
  margin: 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Tagline = styled(motion.p)`
color: ${({ theme }) => theme.tagline};
  font-size: 1.25rem;
  max-width: 900px;
  margin: 0 auto 1.5rem;

  @media (max-width: 600px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

const ScrollButton = styled(motion.button)`
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
  }
`;


const CTAContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2rem;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 1rem;
  }
`;

export default function IrishParallaxHero({ scrollToRef }) {

  const handleScroll = () => {
    if (scrollToRef?.current) {
      scrollToRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Page>
      <Section>
        <HeroContainer>
          <HeroImage
            src={meImage}
            alt="Dara Phillips"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <HeroText>
            <Welcome
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Fáilte romhat! <span role="img" aria-label="Ireland">🇮🇪</span>
            </Welcome>

            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              I'm Dara Phillips
            </Title>

            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              Recent graduate | Product & XR Designer.
            </Subtitle>

            <Tagline
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              Transforming concepts into immersive, meaningful interactions.
            </Tagline>

            <CTAContainer>
              <ScrollButton
                onClick={handleScroll}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                View My Work ↓
              </ScrollButton>
            </CTAContainer>
          </HeroText>
        </HeroContainer>
      </Section>
    </Page>
  );
}
