import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const Section = styled.section`
  background-color: ${({ theme }) => theme.footerBg || "#1f1f1f"};
  color: ${({ theme }) => theme.contactText || "#f0f0f0"};
  padding: 4rem 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const FooterInfo = styled(motion.div)`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;

  a {
    color: ${({ theme }) => theme.accent || "#82c91e"};
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.accentHover || "#a3d844"};
      text-decoration: underline;
    }
  }
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 2rem;
  margin-bottom: 2rem;

  a {
    color: ${({ theme }) => theme.accent || "#82c91e"};
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.accentHover || "#a3d844"};
    }
  }
`;

const Copyright = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary || "#bbb"};
`;

export default function Footer() {
  return (
    <Section id="footer">
      <Container>
        <FooterInfo
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Optional message or contact form */}
        </FooterInfo>

        <SocialIcons>
          <a
            href="https://www.instagram.com/phillipsdara_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.linkedin.com/in/daraphillips01010/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
         <Link to="/contact" aria-label="Email">
        <FaEnvelope />
        </Link>
        </SocialIcons>

        <Copyright>© {new Date().getFullYear()} Dara Phillips.</Copyright>
      </Container>
    </Section>
  );
}
