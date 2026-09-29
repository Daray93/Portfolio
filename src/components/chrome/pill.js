import { css } from "styled-components";
import { ease, dur } from "../../styles/motion";

// The site's outlined pill button (the menu's email and LinkedIn, About's
// actions): 48px tall, a hairline border, the text colour on hover.
export const pill = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 22px;
  border: 1px solid ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.18)" : theme.border)};
  border-radius: 999px;
  background: ${({ theme }) => (theme.mode === "dark" ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.6)")};
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  transition:
    border-color ${dur.fast}s ${ease.out},
    background-color ${dur.fast}s ${ease.out};

  svg {
    flex: none;
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
    border-radius: 999px;
  }
`;
