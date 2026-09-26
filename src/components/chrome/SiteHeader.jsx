import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import RollText from "../shared/RollText";
import { ease, dur } from "../../styles/motion";
import logo from "../../assets/shared/dp-logo.png";

// Minimal top bar: logo home link on the left, name in the middle (rolls to
// "About me"), menu button on the right. Sits above the full-screen menu so
// the button can close it.

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  pointer-events: none;
  color: ${({ theme }) => theme.text};

  /* during the intro the header shows through, above the black loading
     screen: light text whatever the theme, and not clickable yet (the menu
     would open underneath the black) */
  ${({ $overIntro }) =>
    $overIntro &&
    css`
      z-index: 7100;
      color: #f4f4f4;

      > * {
        pointer-events: none;
      }
    `}

  > * {
    pointer-events: auto;
  }

  @media (min-width: 1025px) {
    padding: 56px 88px;
  }

  @media (max-width: 640px) {
    padding: 16px;
  }

  @media (max-height: 520px) and (orientation: landscape) {
    padding: 8px 24px;
  }
`;

// The logo's shape used as a mask, filled with the theme's text colour, so
// it's off-white on dark and near-black on light like the rest of the header.
const Logo = styled(Link)`
  display: block;
  color: inherit;
  transition: opacity ${dur.fast}s ${ease.out};

  /* masked on a child, so the link's own focus ring isn't masked away */
  span {
    display: block;
    width: 36px;
    aspect-ratio: 128 / 123;
    background: currentColor;
    -webkit-mask: url(${logo}) center / contain no-repeat;
    mask: url(${logo}) center / contain no-repeat;
  }

  &:hover {
    color: inherit;
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
  }
`;

const Name = styled(Link)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  --roll-align: center;
  font-size: 0.95rem;
  font-weight: 400;
  color: inherit;

  strong {
    font-weight: 600;
  }

  &:hover {
    color: inherit;
  }
`;

const MenuButton = styled.button`
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;

  span {
    position: absolute;
    left: 11px;
    right: 11px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transition: transform ${dur.base}s ${ease.out};
  }

  span:nth-child(1) {
    top: 17px;
    transform: ${({ $open }) => ($open ? "translateY(4px) rotate(45deg)" : "none")};
  }

  span:nth-child(2) {
    top: 25px;
    transform: ${({ $open }) => ($open ? "translateY(-4px) rotate(-45deg)" : "none")};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`;

export default function SiteHeader({ menuOpen, onMenuToggle, overIntro = false }) {
  return (
    <Bar $overIntro={overIntro}>
      <Logo to="/" aria-label="Home">
        <span aria-hidden="true" />
      </Logo>
      <Name to="/about-me" aria-label="Dara Phillips, about me">
        <RollText hover="About me">
          <span>
            <strong>Dara</strong> Phillips
          </span>
        </RollText>
      </Name>
      <MenuButton
        type="button"
        $open={menuOpen}
        onClick={onMenuToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </MenuButton>
    </Bar>
  );
}
