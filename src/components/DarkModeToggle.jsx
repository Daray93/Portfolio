import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// Toggle button styled with transient props: $thememode and $visible
const ToggleButton = styled.button`
  background: ${({ theme }) => theme.toggleBorder};
  border: none;
  border-radius: 20px;
  width: 40px;
  height: 20px;
  cursor: pointer;
  outline: none;
  z-index: 1001;
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  align-items: center;
  justify-content: ${({ $thememode }) =>
    $thememode === "light" ? "flex-start" : "flex-end"};
  padding: 0 5px;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.accent || "#82c91e"};
  }

  &:active {
    background: ${({ theme }) => theme.accent || "#82c91e"};
    box-shadow: none;
    transform: none;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    width: 44px;
    height: 22px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 20px;
    border-radius: 14px;
    margin: 0 0 .5em 0;
  }
`;

const Circle = styled.div`
  background: ${({ theme }) => theme.body};
  width: 15px;
  height: 15px;
  border-radius: 50%;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
  }
`;

export default function DarkModeToggle({ toggle, theme, visible = true }) {
  return (
    <ToggleButton
      onClick={toggle}
      $thememode={theme}
      $visible={visible}
      aria-label="Toggle theme"
      type="button"
    >
      <Circle />
    </ToggleButton>
  );
}

// ✅ Prop validation
DarkModeToggle.propTypes = {
  toggle: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  visible: PropTypes.bool,
};
