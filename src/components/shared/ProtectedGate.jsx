import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { auth, authReady } from "../../firebase";
import RollText from "./RollText";
import { ease, dur } from "../../styles/motion";

// Shared Firebase Auth account gating every NDA-protected case study.
// The real password lives only in Firebase Auth — never in this repo.
const VIEWER_EMAIL = "viewer@daraphillips.com";

const MAX_ATTEMPTS = 5;

// Full screen, like the site menu: the same near-opaque, blurred cover and
// no panel -- just a padlock, "Case study locked", one line of copy, the
// field and one button, centred, with a close button where the menu button
// sits. The padlock clicks shut as it opens and lifts open on the right
// password. Follows the page's theme, so it works over the dark homepage
// and on the light case study.

const shake = keyframes`
  0%   { transform: translateX(0); }
  15%  { transform: translateX(-6px); }
  30%  { transform: translateX(6px); }
  45%  { transform: translateX(-4px); }
  60%  { transform: translateX(4px); }
  75%  { transform: translateX(-2px); }
  90%  { transform: translateX(2px); }
  100% { transform: translateX(0); }
`;

const appear = keyframes`
  from { opacity: 0; }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(8px); }
`;

// the shackle drops into the body: starts raised, clicks down
const shut = keyframes`
  from { transform: translateY(-4px); }
  70%  { transform: translateY(0.5px); }
  to   { transform: translateY(0); }
`;

const dark = ({ theme }) => theme.mode === "dark";

const PasswordOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow-y: auto;
  /* the site menu's cover */
  background: ${(p) => (dark(p) ? "rgba(8, 8, 8, 0.94)" : "rgba(242, 240, 234, 0.96)")};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  animation: ${appear} ${dur.fast}s ${ease.out} both;
`;

const PasswordModal = styled.div`
  width: 360px;
  max-width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.text};
  animation: ${rise} ${dur.slow}s ${ease.out} both;

  ${({ $shaking }) =>
    $shaking &&
    css`
      animation: ${shake} 0.45s ${ease.out};
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// Where the header's menu button is, at every size, so closing is in the
// same place as opening the menu. Drawn as the menu button's own X.
const Close = styled.button`
  position: fixed;
  top: 24px;
  right: 40px;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  span {
    position: absolute;
    left: 11px;
    right: 11px;
    top: 21px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
  }

  span:nth-child(1) {
    transform: rotate(45deg);
  }

  span:nth-child(2) {
    transform: rotate(-45deg);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  @media (min-width: 1025px) {
    top: 56px;
    right: 88px;
  }

  @media (max-width: 640px) {
    top: 16px;
    right: 24px;
  }
`;

// A padlock drawn in two parts so the shackle can move on its own.
const Lock = styled.svg`
  display: block;
  width: 24px;
  height: 24px;
  margin: 0 auto 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  overflow: visible;

  .shackle {
    transform-box: fill-box;
    animation: ${shut} ${dur.base}s ${ease.out} ${dur.base}s both;
    transition: transform ${dur.base}s ${ease.out};
  }

  ${({ $open }) =>
    $open &&
    css`
      .shackle {
        animation: none;
        transform: translateY(-4px);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    .shackle {
      animation: none;
      transition: none;
    }
  }
`;

// quiet and small: a note on the door, not a headline
const Title = styled.h2`
  margin: 0 0 6px;
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.3;
  text-wrap: balance;
`;

const Lede = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.textSecondary};
  text-wrap: balance;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-top: 28px;
`;

const invalid = (status) => status === "error" || status === "empty";

const PasswordInput = styled.input`
  width: 100%;
  /* room above the text for the label once it has moved up (see FloatLabel) */
  padding: 24px 52px 8px 20px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (invalid(p.$status) ? p.theme.inputError : dark(p) ? "rgba(255, 255, 255, 0.16)" : p.theme.inputBorder)};
  background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.8)")};
  color: ${({ theme }) => theme.text};
  font: inherit;
  font-size: 1rem;
  transition:
    border-color ${dur.fast}s ${ease.out},
    box-shadow ${dur.fast}s ${ease.out};

  &:focus {
    outline: none;
    border-color: ${(p) => (invalid(p.$status) ? p.theme.inputError : p.theme.text)};
    box-shadow: 0 0 0 4px ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(23, 23, 26, 0.08)")};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

// Sits in the field like a placeholder; on focus, or once there's a
// password, it shrinks up to the top of the field and stays there.
const FloatLabel = styled.label`
  position: absolute;
  left: 21px;
  top: 50%;
  font-size: 1rem;
  line-height: 1;
  color: ${(p) => (invalid(p.$status) ? p.theme.inputError : p.theme.textTertiary)};
  pointer-events: none;
  transform: translateY(-50%);
  transform-origin: left center;
  transition:
    transform ${dur.base}s ${ease.out},
    color ${dur.fast}s ${ease.out};

  ${PasswordInput}:focus + &,
  ${PasswordInput}:not(:placeholder-shown) + &,
  ${PasswordInput}:-webkit-autofill + & {
    transform: translateY(calc(-50% - 11px)) scale(0.75);
    color: ${(p) => (invalid(p.$status) ? p.theme.inputError : p.theme.textSecondary)};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: color ${dur.fast}s ${ease.out};
  }
`;

const ToggleVisibility = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: ${({ theme }) => theme.textTertiary};
  cursor: pointer;
  transition: color ${dur.fast}s ${ease.out};

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 2px;
  }
`;

const FeedbackText = styled.p`
  margin: 10px 0 0;
  min-height: 1.2em;
  font-size: 0.85rem;
  color: ${({ $type, theme }) => ($type === "error" ? theme.inputError : theme.textTertiary)};
`;

const PasswordButtons = styled.div`
  display: flex;
  margin-top: 16px;
`;

const pill = css`
  flex: 1;
  display: inline-flex;
  justify-content: center;
  padding: 14px 20px;
  border-radius: 999px;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color ${dur.fast}s ${ease.out},
    opacity ${dur.fast}s ${ease.out};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
  }
`;

const ModalPrimaryButton = styled.button`
  ${pill}
  border: 1px solid ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.body};

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${({ $busy }) =>
    $busy &&
    css`
      cursor: default;
    `}
`;

// ---------------- Component ----------------

export default function ProtectedGate({ open, onClose, redirectTo = "/orthovive" }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Traps Tab within the modal and handles Escape. The password input gets
  // initial focus via autoFocus below, so this only needs the trap + Escape.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      const focusable = modal
        ? modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')
        : [];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputStatus, setInputStatus] = useState("idle"); // idle | empty | error | locked
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // the right password: the padlock lifts open before the page changes
  const [unlocked, setUnlocked] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleClose = () => {
    setPassword("");
    setInputStatus("idle");
    setFeedbackMsg("");
    // intentionally preserve attempts across reopens
    onClose();
  };

  const isLocked = attempts >= MAX_ATTEMPTS;

  const handlePasswordSubmit = async () => {
    if (submitting || unlocked) return;
    if (isLocked) {
      setInputStatus("locked");
      setFeedbackMsg("Too many tries. Try again later.");
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setInputStatus("empty");
      setFeedbackMsg("Enter the password.");
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      // The real check happens against Firebase Auth's servers, not this code.
      await authReady;
      await signInWithEmailAndPassword(auth, VIEWER_EMAIL, password);
      setInputStatus("idle");
      setFeedbackMsg("Unlocked.");
      setPassword("");
      setUnlocked(true);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(
        () => {
          onClose();
          navigate(redirectTo);
        },
        still ? 0 : dur.base * 1000
      );
      return;
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();
      setPassword("");

      if (err.code === "auth/too-many-requests" || newAttempts >= MAX_ATTEMPTS) {
        setInputStatus("locked");
        setFeedbackMsg("Too many tries. Try again later.");
      } else {
        setInputStatus("error");
        const remaining = MAX_ATTEMPTS - newAttempts;
        setFeedbackMsg(`Not quite. ${remaining} ${remaining === 1 ? "try" : "tries"} left.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setPassword(e.target.value);
    // Clear error state as soon as they start typing again
    if (inputStatus === "error" || inputStatus === "empty") {
      setInputStatus("idle");
      setFeedbackMsg("");
    }
  };

  if (!open) return null;

  return (
    <PasswordOverlay
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="protected-gate-title"
      aria-describedby="protected-gate-lede"
    >
      <PasswordModal $shaking={isShaking}>
        <Lock viewBox="0 0 24 24" $open={unlocked} aria-hidden="true">
          <path className="shackle" d="M7 11V7a5 5 0 0 1 10 0v4" />
          <rect x="3" y="11" width="18" height="11" rx="2" />
        </Lock>
        <Title id="protected-gate-title">Case study locked</Title>
        <Lede id="protected-gate-lede">Enter the password below.</Lede>

        <InputWrapper>
          <PasswordInput
            id="protected-gate-password"
            type={showPassword ? "text" : "password"}
            // a space, so :placeholder-shown can tell when it's empty
            placeholder=" "
            aria-describedby="protected-gate-feedback"
            aria-invalid={invalid(inputStatus)}
            value={password}
            $status={inputStatus}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            // read-only while checking, not disabled, so it keeps focus
            readOnly={submitting || unlocked}
            disabled={isLocked}
            autoFocus
          />
          <FloatLabel htmlFor="protected-gate-password" $status={inputStatus}>
            Password
          </FloatLabel>
          {!isLocked && (
            <ToggleVisibility
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </ToggleVisibility>
          )}
        </InputWrapper>

        <FeedbackText id="protected-gate-feedback" role="alert" $type={inputStatus === "idle" ? "hint" : "error"}>
          {feedbackMsg || " "}
        </FeedbackText>

        <PasswordButtons>
          <ModalPrimaryButton
            type="button"
            onClick={handlePasswordSubmit}
            disabled={isLocked}
            // busy, not disabled, so focus stays on it while it checks
            aria-disabled={submitting || unlocked || undefined}
            $busy={submitting || unlocked}
          >
            {isLocked ? "Locked" : submitting ? "Checking…" : unlocked ? "Unlocked" : <RollText>Unlock</RollText>}
          </ModalPrimaryButton>
        </PasswordButtons>
      </PasswordModal>
      <Close type="button" onClick={handleClose} aria-label="Close">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </Close>
    </PasswordOverlay>
  );
}
