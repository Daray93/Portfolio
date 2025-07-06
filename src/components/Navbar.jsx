import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  MdMenu,
  MdClose,
  MdPerson,
  MdCode,
  MdEmail,
  MdHome,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import logoLight from "../assets/logoLight.png";
import logoDark from "../assets/logoDark.png";
import DarkModeToggle from "./DarkModeToggle";

// Styled Components
const Nav = styled.nav`
  width: 100%;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled(motion.img)`
  height: 60px;
  width: auto;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 1001;
`;

const MenuIcon = styled.div`
  display: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    display: block;
  }
`;

const Menu = styled(motion.ul)`
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${({ theme }) => theme.body};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    z-index: 999;
  }
`;

// Use React Router's NavLink directly for active link detection
const NavLink = styled(RouterNavLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: 'Inter', sans-serif;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -4px;
    height: 2px;
    width: 0%;
    background-color: ${({ theme }) => theme.accent || "#82c91e"};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  &:hover {
    color: ${({ theme }) => theme.accent || "#82c91e"};
  }

  &.active {
    color: ${({ theme }) => theme.accent || "#82c91e"};

    &::after {
      width: 100%;
    }
  }

  svg {
    font-size: 1.3rem;
  }
`;

const MenuItem = styled(motion.li)`
  position: relative;
  display: flex;
  align-items: center;
`;

// Motion Variants
const menuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Navbar({ toggleTheme, theme }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  const currentTheme = theme === "dark" ? "dark" : "light";
  const logoSrc = currentTheme === "dark" ? logoDark : logoLight;

  const MenuContent = (
    <>
      <MenuItem variants={itemVariants}>
        <NavLink to="/" onClick={closeMenu} end>
          <MdHome />
          Home
        </NavLink>
      </MenuItem>

      <MenuItem variants={itemVariants}>
        <NavLink to="/about" onClick={closeMenu}>
          <MdPerson />
          About
        </NavLink>
      </MenuItem>

      <MenuItem variants={itemVariants}>
        <NavLink to="/work" onClick={closeMenu}>
          <MdCode />
          Work
        </NavLink>
      </MenuItem>

      <MenuItem variants={itemVariants}>
        <NavLink to="/contact" onClick={closeMenu}>
          <MdEmail />
          Contact
        </NavLink>
      </MenuItem>
    </>
  );

  return (
    <Nav>
      <Logo to="/">
        <LogoImg
          key={logoSrc}
          src={logoSrc}
          alt="Dara Phillips Logo"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      </Logo>

      <RightControls>
        {!isMobile && (
          <Menu initial="visible" animate="visible" variants={menuVariants}>
            {MenuContent}
          </Menu>
        )}

        <DarkModeToggle toggle={toggleTheme} theme={currentTheme} visible />

        {isMobile && (
          <MenuIcon onClick={toggleMenu}>
            {open ? <MdClose /> : <MdMenu />}
          </MenuIcon>
        )}
      </RightControls>

      <AnimatePresence>
        {isMobile && open && (
          <Menu
            key="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
          >
            {MenuContent}
          </Menu>
        )}
      </AnimatePresence>
    </Nav>
  );
}
