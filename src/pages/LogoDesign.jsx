import React, { useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";


import ProjectLayout from "../components/ProjectLayout";

import Logo1 from "../assets/EcoStream.svg";
import Logo2 from "../assets/Windmill.svg";
import Logo3 from "../assets/Logo.svg";
import Logo4 from "../assets/TwinStudios.svg";
import Logo5 from "../assets/AoedeLogo.svg";
import Logo6 from "../assets/PatrickswellLogo.svg";
import Logo7 from "../assets/NeuroloopLogo.svg";

const StyledSlider = styled(Slider)`
  margin-top: 2rem;

  .slick-slide {
    display: flex !important;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .slick-dots li button:before {
    color: ${({ theme }) => theme.accent || "#82c91e"};
  }

  .slick-prev,
  .slick-next {
    z-index: 1;
  }
`;

const LogoCard = styled.div`
  text-align: center;
  max-width: 220px;
  padding: 1rem;
  outline: none;
  border: none;

  &:focus,
  &:active {
    outline: none;
    border: none;
    box-shadow: none;
  }
`;


const LogoImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 16px;
  transition: transform 0.3s ease, border-color 0.3s ease;

  ${LogoCard}:hover & {
    transform: scale(1.05);
  }
`;

const Caption = styled.p`
  font-size: 0.95rem;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.text || "#444"};
`;

const CTAWrapper = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: white;
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.scrollButtonBg};
  color: white;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  margin-right: 16px; /* Add some spacing to separate the buttons */
  transition: background 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg};
    color: white;
  }
`;

export default function ProjectThree() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 960,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <ProjectLayout
      title="Logo Design"
      tagline="A collection of logos I've created for various clients and projects."
    >
      <StyledSlider {...settings}>
        <LogoCard>
          <LogoImage src={Logo1} alt="EcoBrand logo – Sustainability Company" />
          <Caption>Concept | Sustainability Company</Caption>
        </LogoCard>
        <LogoCard>
          <LogoImage src={Logo2} alt="Wind Energy Concept Logo" />
          <Caption>Concept | Wind Energy</Caption>
        </LogoCard>
        <LogoCard>
          <LogoImage src={Logo3} alt="Personal Developer Logo" />
          <Caption>Personal Logo</Caption>
        </LogoCard>
        <LogoCard>
          <LogoImage src={Logo4} alt="Twin Studios Logo" />
          <Caption>Concept | Game Studio Logo</Caption>
        </LogoCard>
        <LogoCard>
          <LogoImage src={Logo5} alt="Aoede Physiotherapy App Logo" />
          <Caption>Physiotherapist App | Aoede</Caption>
        </LogoCard>
         <LogoCard>
          <LogoImage src={Logo6} alt="Patrickswell F.c. Logo" />
          <Caption>Patrickswell F.c. Logo</Caption>
        </LogoCard>
        <LogoCard>
          <LogoImage src={Logo7} alt="Neuroloop Logo" />
          <Caption>Neuroloop Logo</Caption>
        </LogoCard>
      </StyledSlider>

       {/* Forward/Back Buttons */}
      <CTAWrapper>
        <BackButton to="/neuroloop">← Back</BackButton>
        <CTAButton to="/weddingMate">View Next Project →</CTAButton>
      </CTAWrapper>
    </ProjectLayout>
  );
}
