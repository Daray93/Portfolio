import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Container from "./ContainerFooter";

// ------------------ Motion Variants ------------------
const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// ------------------ Styled Components ------------------
const FooterWrapper = styled(motion.footer)`
  padding: 0;
  color: ${({ theme }) => theme.textSecondary};

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
`;

const Copyright = styled.p`
  font-size: 0.95rem;
  font-weight: 300;
  color: ${({ theme }) => theme.textSecondary};
`;

const ChatWrapper = styled.div`
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const ChatLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`;

const EmailLink = styled.a`
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-weight: 400;

  &:hover {
    text-decoration: underline;
  }
`;

// ------------------ Component ------------------
export default function Footer() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <FooterWrapper
      id="footer"
      variants={footerVariants}
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <Container>
        <FooterBottom>
          <Copyright>
            © {new Date().getFullYear()} – Dara Phillips
          </Copyright>

          <ChatWrapper>
            <ChatLabel>Let’s chat →</ChatLabel>
            <EmailLink href="mailto:daraphillips.design@gmail.com">
              daraphillips.design@gmail.com
            </EmailLink>
          </ChatWrapper>
        </FooterBottom>
      </Container>
    </FooterWrapper>
  );
}
