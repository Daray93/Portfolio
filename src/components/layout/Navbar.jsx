import React, { useState } from "react";
import styled from "styled-components";
import { NavLink, useLocation } from "react-router-dom";
import NIcon from "../../case-studies/neuroloop/assets/NeuroloopLogo.png";
import KIcon from "../../case-studies/kropt/assets/KroptLogo.svg";
import OIcon from "../../case-studies/orthovive/assets/OrthoVive.svg";
import IBHFIcon from "../../case-studies/ibhf/assets/ibhf.png";
import AvocadoIcon from "../../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedGate from "../shared/ProtectedGate";

// ---------------- Styled Components ----------------
const Nav = styled.nav`
  width: 100%;
  background: ${({ theme }) => theme.body};
  padding: 1rem 0;
  position: relative;
  z-index: 1000;
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1199px;
  margin: 0 auto;
  padding: 0 0rem;
  width: 100%;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const LogoText = styled(NavLink)`
  font-family: "Manrope", sans-serif;
  font-weight: 400;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid transparent;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.skeletonBase};
  }
`;

const Menu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
  gap: 1rem;
`;

const MenuItem = styled.li`
  position: relative;
`;

const MenuLink = styled(NavLink)`
  font-family: "Manrope", sans-serif;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: none;
  border: 1px solid transparent;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.cardBackground};
    border: 1px solid ${({ theme }) => theme.skeletonBase};
  }
`;

// Dropdown container
const DropdownContainer = styled(motion.div)`
  position: absolute;
  top: 140%;
  left: -20%;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.skeletonBase};
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

// Dropdown items
const DropdownLink = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  background: ${({ bg }) => bg || "transparent"};
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-weight: 500;
  overflow: hidden;
  min-height: 2.5rem;

  &:hover {
    background: ${({ hoverBg }) => hoverBg};
    color: ${({ theme }) => theme.text};
  }
`;

const DropdownIcon = styled.img`
  width: 1.8em;
  height: 1.8em;
  flex-shrink: 0;
`;

const TightLabel = styled.span`
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

// ---------------- Navbar Component ----------------
export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const location = useLocation();

  // Hide on case study routes
  const hideOnCaseStudy =
    location.pathname.startsWith("/kropt") ||
    location.pathname.startsWith("/neuroloop");

  if (hideOnCaseStudy) return null;

  return (
    <Nav>
      <NavContainer>
        <LogoText to="/">dp</LogoText>

        <Menu>
          <MenuItem
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <MenuLink as="a">case studies</MenuLink>

            <AnimatePresence>
              {dropdownOpen && (
                <DropdownContainer
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <DropdownLink
                    to="/operation-avocado"
                    bg="#a5d6a722"
                    hoverBg="#66bb6a33"
                  >
                    <DropdownIcon
                      src={AvocadoIcon}
                      alt="Operation Avocado Logo"
                      style={{ borderRadius: "22%" }}
                    />
                    <TightLabel>
                      <span>Operation</span>
                      <span>Avocado</span>
                    </TightLabel>
                  </DropdownLink>

                  <DropdownLink
                    to="/orthovive"
                    bg="#a5a5a522"
                    hoverBg="#3a3a3a22"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      setShowPasswordModal(true);
                    }}
                  >
                    <DropdownIcon src={OIcon} alt="OrthoVive Logo" />
                    OrthoVive
                  </DropdownLink>

                  <DropdownLink to="/ibhf" bg="#ffe79072" hoverBg="#dfc05082">
                    <DropdownIcon src={IBHFIcon} alt="Irish Bee & Heritage Foundation Logo" />
                    ibhf.ie
                  </DropdownLink>

                  <DropdownLink to="/kropt" bg="#daff908d" hoverBg="#b7df5082">
                    <DropdownIcon src={KIcon} alt="Kropt Logo" />
                    Kropt
                  </DropdownLink>

                  <DropdownLink
                    to="/neuroloop"
                    bg="#03b8fa4a"
                    hoverBg="#03b8fa7a"
                  >
                    <DropdownIcon src={NIcon} alt="Neuroloop Logo" />
                    Neuroloop
                  </DropdownLink>

                </DropdownContainer>
              )}
            </AnimatePresence>
          </MenuItem>
        </Menu>

        <LogoText as="a" href="mailto:daraphillips.design@gmail.com">
          contact
        </LogoText>
      </NavContainer>

      <ProtectedGate
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </Nav>
  );
}
