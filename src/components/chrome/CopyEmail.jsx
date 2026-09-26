import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { FiMail } from "react-icons/fi";
import { EMAIL } from "../../data/contact";
import { ease, dur } from "../../styles/motion";

// The email address as a copy button: clicking copies it and the icon draws
// a tick while the address gives way to "Copied", then both settle back. If
// the clipboard isn't available it opens the email app instead.

const RESET_MS = 1800;
const TICK_LENGTH = 24;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  transition: color ${dur.fast}s ${ease.out};

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

// icon slot: the mail icon and the tick share it, crossfading
const IconSlot = styled.span`
  position: relative;
  display: inline-grid;
  width: 1em;
  height: 1em;

  > * {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
  }
`;

const Mail = styled(FiMail)`
  opacity: ${({ $hide }) => ($hide ? 0 : 1)};
  transform: scale(${({ $hide }) => ($hide ? 0.6 : 1)});
  transition:
    opacity ${dur.fast}s ${ease.out},
    transform ${dur.base}s ${ease.out};
`;

// the tick draws itself along its own path
const Tick = styled.svg`
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;

  path {
    stroke-dasharray: ${TICK_LENGTH};
    stroke-dashoffset: ${TICK_LENGTH};
    transition: stroke-dashoffset ${dur.fast}s ${ease.out};
  }

  ${({ $on }) =>
    $on &&
    css`
      path {
        stroke-dashoffset: 0;
        transition: stroke-dashoffset ${dur.base}s ${ease.out} 0.1s;
      }
    `}
`;

// the address and "Copied" share one line; one rolls out as the other in
const Label = styled.span`
  position: relative;
  display: inline-grid;
  overflow: hidden;
  line-height: 1.3;

  > span {
    grid-area: 1 / 1;
    white-space: nowrap;
    transition:
      transform ${dur.base}s ${ease.out},
      opacity ${dur.fast}s ${ease.out};
  }
`;

const Address = styled.span`
  transform: translateY(${({ $hide }) => ($hide ? "-100%" : "0")});
  opacity: ${({ $hide }) => ($hide ? 0 : 1)};
`;

const Copied = styled.span`
  transform: translateY(${({ $on }) => ($on ? "0" : "100%")});
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // clipboard blocked or unavailable -- fall back to the email app
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), RESET_MS);
  };

  return (
    <>
      <Button
        type="button"
        onClick={copy}
        aria-label={`Copy email address ${EMAIL}`}
      >
        <IconSlot aria-hidden="true">
          <Mail $hide={copied} />
          <Tick viewBox="0 0 24 24" $on={copied}>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </Tick>
        </IconSlot>
        <Label aria-hidden="true">
          <Address $hide={copied}>{EMAIL}</Address>
          <Copied $on={copied}>Copied</Copied>
        </Label>
      </Button>
      <span className="sr-only" role="status">
        {copied ? "Email address copied" : ""}
      </span>
    </>
  );
}
