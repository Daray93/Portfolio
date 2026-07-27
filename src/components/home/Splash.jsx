import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FiLinkedin, FiMail, FiMapPin, FiClock } from "react-icons/fi";
import HoverCard from "./HoverCard";
import HoverCardCV from "./HoverCardCV";
import HoverCardVoir from "./HoverCardVoir";
import Pwork from "./ProfessionalWork";
import ProtectedGate from "../shared/ProtectedGate";

// Assets
import CVVideo from "./assets/ResumeVideo.mp4";
import KroptVideo from "./assets/Scene.mp4";
import NeuroloopVideo from "../../case-studies/neuroloop/assets/NeuroloopTeaser.mp4";
import GIF from "./assets/Scene-1.gif";
import IBHF from "../../case-studies/ibhf/assets/ibhf.mp4";
import AvocadoLogo from "../../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";

// ---------------- Layout ----------------

const SplashContainer = styled.section`
  display: flex;
  justify-content: center;
  padding: 0rem 2rem 0;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    padding: 0rem 1.25rem 0;
  }
`;

const SplashGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: repeat(3, minmax(240px, auto));
  gap: 24px;
  width: 100%;
  max-width: 1199px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

// ---------------- Shared Card ----------------

const Card = styled.div`
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
  width: 100%;
  height: 100%;
  box-shadow: ${({ theme }) => theme.shadowSm};
`;

const TextCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// ---------------- Header Row ----------------

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const TitleStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

// ---------------- Meta Chips ----------------

const MetaRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.85rem;
  white-space: nowrap;

  svg {
    width: 0.8rem;
    height: 0.8rem;
    stroke-width: 1.8;
  }
`;

// ---------------- Text Elements ----------------

const Headline = styled.div`
  font-family: "Space Grotesk", sans-serif;
  font-weight: 500;
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.25;
  color: ${({ theme }) => theme.text};
`;

const Subline = styled.div`
  font-family: "Manrope", sans-serif;
  font-weight: 400;
  font-size: clamp(16px, 2.4vw, 18px);
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.35;
  max-width: 46ch;
`;

// ---------------- Buttons ----------------

const ButtonWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
    margin-top: 1rem;
  }
`;

const Cta = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.buttonPrimaryBg};
  font-family: "Manrope", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.buttonPrimaryText};
  background: ${({ theme }) => theme.buttonPrimaryBg};
  transition: all 0.25s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonPrimaryHover};
    border-color: ${({ theme }) => theme.buttonPrimaryHover};
    color: ${({ theme }) => theme.buttonPrimaryHoverText};
  }
`;

const IconButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: ${({ theme }) => theme.shadowSm};

  svg {
    width: 1.1em;
    height: 1.1em;
  }

  &:hover {
    background: ${({ theme }) => theme.surfaceSubtle};
  }
`;

// ---------------- Grid Slots ----------------

const Col1Card1 = styled(TextCard)`
  grid-column: 1;
  grid-row: 1 / span 2;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 1;
  }
`;

const Col1Card2 = styled(Card)`
  grid-column: 1;
  grid-row: 3;
  aspect-ratio: 16 / 9;

  @media (max-width: 1199px) {
    height: 240px;
  }

  @media (max-width: 767px) {
    order: 2;
  }
`;

const Col3Card1 = styled(Card)`
  position: relative;
  grid-column: 3;
  grid-row: 1;
  aspect-ratio: 1 / 1;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 3;
    aspect-ratio: 1 / 1;
  }
`;

const ComingSoonPill = styled.span`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  border-radius: 20px;
  padding: 4px 10px;
  pointer-events: none;
`;

const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  pointer-events: none;
`;

const CardOverlayStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const CardOverlayTitle = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-weight: 500;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: 0.01em;
`;

const CardOverlayTag = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: #bebebe2b;
  color: #000;
  border: 1px solid #00000022;
`;

const Col2Card1 = styled(Card)`
  grid-column: 2;
  grid-row: 1;
  aspect-ratio: 1 / 1;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 4;
  }
`;

const Col2Card2 = styled(Card)`
  grid-column: 2;
  grid-row: 2 / span 2;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    aspect-ratio: 1 / 1;
    order: 5;
  }
`;

const Col3Card2 = styled(Card)`
  grid-column: 3;
  grid-row: 2;
  aspect-ratio: 0.7 / 0.6;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 6;
  }
`;

const Col3Card3 = styled(Card)`
  grid-column: 3;
  grid-row: 3;
  aspect-ratio: 1 / 1;

  @media (max-width: 1199px) {
    grid-column: auto;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 7;
  }
`;

const CenteredLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  img {
    width: 45%;
    height: auto;
    border-radius: 22%;
  }
`;

// ---------------- Component ----------------

export default function Splash() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <SplashContainer>
      <SplashGrid>
        {/* ---------- Hero Text ---------- */}
        <Col1Card1>
          <HeaderRow>
            <TitleStack>
              <Headline>
                <div>Dara Phillips</div>
                <div style={{ color: "#45556ca1", opacity: 0.6 }}>Product Designer</div>
              </Headline>
            </TitleStack>

            <MetaRow>
              <MetaItem>
                <FiMapPin />
                Ireland
              </MetaItem>
              <MetaItem>
                <FiClock />
                1 year exp.
              </MetaItem>
            </MetaRow>
          </HeaderRow>

          <Subline>
          I design in Figma and build interactive products in React, with a focus on
          scalable component systems and user-centered interfaces.
        </Subline>

        <Subline>
          Recent projects include a Figma prototype for a medtech startup developed
          with students from the BioInnovate program, and a WordPress site for the
          Irish Bee &amp; Heritage Foundation.
        </Subline>

        <Subline>
          I'm currently developing my skills in design systems and AI-assisted
          workflows, exploring how tools like Claude and MCPs fit into modern
          product design.
        </Subline>

        <Subline>
          I'm freelancing with early-stage B2B startups and open to full-time,
          remote, or relocation opportunities.
        </Subline>

          <ButtonWrapper>
            <Cta href="mailto:daraphillips.design@gmail.com">
              <FiMail />
              Email
            </Cta>

            <IconButton
              href="https://www.linkedin.com/in/daraphillips01010/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin />
              LinkedIn
            </IconButton>
          </ButtonWrapper>
        </Col1Card1>

        {/* ---------- OrthoVive ---------- */}
        <Col1Card2 data-cursor="view">
          <HoverCard
            src={GIF}
            title="OrthoVive"
            category="Med-Tech Case Study"
            tagColor="#497025"
            tagBackground="rgb(0, 0, 0)"
            crop="scale(1) translateY(5%)"
            showTime={false}
            onClick={() => setShowPasswordModal(true)}
          />
        </Col1Card2>

        {/* ---------- Operation Avocado ---------- */}
        {/* Placeholder: no animation/video yet, just the logo centered until one's ready */}
        <Col3Card1 data-cursor="view">
          <CenteredLogoLink to="/operation-avocado">
            <img src={AvocadoLogo} alt="Operation Avocado" />
          </CenteredLogoLink>
          <ComingSoonPill>Coming Soon</ComingSoonPill>
          <CardOverlay>
            <CardOverlayStack>
              <CardOverlayTitle>Operation Avocado</CardOverlayTitle>
              <CardOverlayTag>Mobile Web App</CardOverlayTag>
            </CardOverlayStack>
          </CardOverlay>
        </Col3Card1>

        {/* ---------- CV ---------- */}
        <Col2Card1>
          <HoverCardCV
            src={CVVideo}
            title="My CV"
            onOpen={() => window.open("/Dara-Phillips_cv_2026.pdf", "_blank")}
          />
        </Col2Card1>

        {/* ---------- Kropt ---------- */}
        <Col2Card2 data-cursor="view">
          <Link to="/kropt" style={{ height: "100%", display: "block" }}>
            <HoverCardVoir
              src={KroptVideo}
              title="Kropt Mobile App"
              tag="Ag-Tech Case Study"
              tagColor="#497025"
              tagBackground="rgb(0, 0, 0)"
              crop="scale(.9) translateY(-7%)"
            />
          </Link>
        </Col2Card2>

        {/* ---------- Neuroloop ---------- */}
        <Col3Card2 data-cursor="view">
          <Link to="/neuroloop" style={{ display: "block", width: "100%", height: "100%" }}>
            <HoverCardVoir
              src={NeuroloopVideo}
              title="Neuroloop"
              tag="AI & VR Case Study"
              crop="scale(1) translateY(0%)"
              tagColor="#0c5562"
            />
          </Link>
        </Col3Card2>

        {/* ---------- IBHF WEBSITE CHANGE ** ---------- */}
        <Col3Card3 data-cursor="view">
        <a href="https://ibhf.ie"
          target="_blank"
          rel="noopener noreferrer"
          style={{ height: "100%", display: "block" }}
        >
          <HoverCardVoir
            src={IBHF}
            title="Irish Bee & Heritage Foundation"
            tag="Conservation - WP Site"
            tagColor="#706025"
            tagBackground="rgb(0, 0, 0)"
            crop="scale(.9) translateY(-7%)"
            inProgress
          />
        </a>
      </Col3Card3>
      </SplashGrid>

      <ProtectedGate
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SplashContainer>
  );
}