import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FiLinkedin, FiMail } from "react-icons/fi";
import HomeIcon from "./Home.png";

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
`;

const FabContainer = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%) translateY(${({ hidden }) => (hidden ? "120%" : "0")});
  display: flex;
  gap: 0.75rem;
  z-index: 3000;
  background: ${({ theme }) => theme.cardBackground};
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
  opacity: ${({ hidden }) => (hidden ? 0 : 1)};

  @media (min-width: 901px) {
    display: none;
  }
`;

const FabButton = styled.button`
  all: unset;
  cursor: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  font-weight: 500;
  color: ${({ theme }) => theme.body};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    animation: ${float} 0.2s ease forwards;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }
`;

const IconFab = styled.a`
  all: unset;
  cursor: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }

  img {
    width: 18px;
    height: 18px;
  }
`;

const HomeIconImg = styled.img`
  width: 18px;
  height: 18px;
`;

export default function CaseStudyFab() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current + 6) setHidden(true);
      else if (current < lastScrollY.current - 6) setHidden(false);
      lastScrollY.current = current;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <FabContainer hidden={hidden}>
      <FabButton onClick={() => (window.location.href = "/")}>
        <HomeIconImg src={HomeIcon} alt="Home" />
        Home
      </FabButton>
      <IconFab
        href="https://www.linkedin.com/in/daraphillips01010/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiLinkedin />
      </IconFab>
      <IconFab href="mailto:daraphillips.design@gmail.com">
        <FiMail />
      </IconFab>
    </FabContainer>
  );
}
