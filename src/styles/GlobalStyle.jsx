import { createGlobalStyle } from "styled-components";
// Instrument Sans is the one typeface across the whole site -- hierarchy
// comes from size and weight, not a second family. Only the weights
// actually used are imported.
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";

const GlobalStyle = createGlobalStyle`
  /* ---------------- Base ---------------- */
  :root {
    --font-sans: "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: var(--font-sans);
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

  /* ---------------- Reduced motion ---------------- */
  /* driven by the in-site toggle (MotionPreferenceContext), which starts
     from the OS setting -- so this one class covers both, and switching
     the toggle off still wins over the OS. Things still change state,
     they just don't travel to get there. */
  html.reduce-motion *,
  html.reduce-motion *::before,
  html.reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    animation-delay: 0s !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }

  /* ---------------- Screen-reader only ---------------- */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
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
