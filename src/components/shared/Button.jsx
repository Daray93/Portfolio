import styled, { css } from "styled-components";

// Coherent button system: 4 variants, all colors from theme.js.
// Usage: <Button $variant="primary">Save</Button>
//        <Button as="a" href="..." $variant="secondary">LinkedIn</Button>
//        <Button $variant="ghost" $size="sm" aria-label="Close"><FiX /></Button>

const SIZE = {
  md: css`
    padding: 0.65rem 1.25rem;
    font-size: 1rem;
    border-radius: ${({ theme }) => theme.radius.btn};
  `,
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border-radius: ${({ theme }) => theme.radius.btn};
  `,
};

const VARIANT = {
  // Solid fill, max emphasis -- the one primary action on a screen.
  primary: css`
    background: ${({ theme }) => theme.buttonPrimaryBg};
    color: ${({ theme }) => theme.buttonPrimaryText};
    border: 1px solid ${({ theme }) => theme.buttonPrimaryBg};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.buttonPrimaryHover};
      border-color: ${({ theme }) => theme.buttonPrimaryHover};
      color: ${({ theme }) => theme.buttonPrimaryHoverText};
    }
  `,
  // Solid pale fill + soft border -- medium emphasis, sits next to primary.
  secondary: css`
    background: ${({ theme }) => theme.buttonSecondaryBg};
    color: ${({ theme }) => theme.buttonSecondaryText};
    border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.buttonSecondaryHover};
    }
  `,
  // Transparent + defined border -- medium emphasis without a filled surface.
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.buttonOutlineText};
    border: 1px solid ${({ theme }) => theme.buttonOutlineBorder};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.buttonOutlineHoverBg};
    }
  `,
  // Transparent, no border -- lowest emphasis, minor/icon-affordance actions.
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.buttonGhostText};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.buttonGhostHoverBg};
      color: ${({ theme }) => theme.buttonGhostHoverText};
    }
  `,
};

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: "Geist", sans-serif;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;

  ${({ $size = "md" }) => SIZE[$size]}
  ${({ $variant = "primary" }) => VARIANT[$variant]}

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }

  svg {
    width: 1.1em;
    height: 1.1em;
    flex-shrink: 0;
  }
`;

export default Button;
