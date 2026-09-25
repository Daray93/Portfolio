import { createGlobalStyle } from "styled-components";
// Only the weights actually referenced by a `font-weight:` anywhere in
// src/ -- 200 and 800 were being shipped unused.
import "@fontsource/geist/300.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
// Fraunces is a true variable font (weight 100-900 on one file) rather
// than a set of discrete static weights, so this one import covers every
// font-weight used against it anywhere in src/.
import "@fontsource-variable/fraunces";

const GlobalStyle = createGlobalStyle`
  /* ---------------- Base ---------------- */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: "Geist", sans-serif;
    font-weight: 400;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
  }

  /* ---------------- Text selection ---------------- */
  ::selection {
    background-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accentText};
  }

  ::-moz-selection {
    background-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accentText};
  }

  /* ---------------- Links ---------------- */
  a {
    color: ${({ theme }) => theme.link};
    font-weight: 500;
    text-decoration: inherit;
    transition: color 0.25s ease;
  }

  a:hover {
    color: ${({ theme }) => theme.linkHover};
  }

  /* ---------------- Buttons ---------------- */
  button {
    border-radius: ${({ theme }) => theme.radius.btn};
    font-family: inherit;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.25s ease;
  }

  .primary-btn {
    background-color: ${({ theme }) => theme.buttonPrimaryBg};
    color: ${({ theme }) => theme.buttonPrimaryText};
    border: 1px solid transparent;

    &:hover {
      background-color: ${({ theme }) => theme.buttonPrimaryHover};
      color: ${({ theme }) => theme.buttonPrimaryHoverText};
    }
  }

  .secondary-btn {
    background-color: ${({ theme }) => theme.buttonSecondaryBg};
    color: ${({ theme }) => theme.buttonSecondaryText};
    border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};

    &:hover {
      background-color: ${({ theme }) => theme.buttonSecondaryHover};
    }
  }

  /* ---------------- Inputs ---------------- */
  input, textarea, select {
    background: ${({ theme }) => theme.inputBg};
    border: 1px solid ${({ theme }) => theme.inputBorder};
    color: ${({ theme }) => theme.text};
    font-family: inherit;
    font-size: 1rem;
    padding: 0.5em 0.75em;
    border-radius: ${({ theme }) => theme.radius.btn};
    transition: border-color 0.25s ease;
  }

  input:focus, textarea:focus, select:focus {
    border-color: ${({ theme }) => theme.inputBorderFocus};
    outline: none;
  }

  input:hover, textarea:hover, select:hover {
    border-color: ${({ theme }) => theme.inputBorderHover};
  }

  /* ---------------- Tags / Pills ---------------- */
  .tag {
    background: ${({ theme }) => theme.tagBg};
    color: ${({ theme }) => theme.tagText};
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    backdrop-filter: blur(6px);
  }

  /* ---------------- Misc ---------------- */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.skeletonBase};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }
`;

export default GlobalStyle;
