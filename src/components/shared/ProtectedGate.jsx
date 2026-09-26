import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { auth, authReady } from "../../firebase";
import RollText from "./RollText";
import { ease, dur } from "../../styles/motion";

// Shared Firebase Auth account gating every NDA-protected case study.
// The real password lives only in Firebase Auth — never in this repo.
const VIEWER_EMAIL = "viewer@daraphillips.com";

const MAX_ATTEMPTS = 5;

// Styled like the rest of the site: the menu's dark, blurred backdrop, and a
// glass panel with a lit rim like the cursor's disc. Follows the page's
// theme, so it works over the dark homepage and on the light case study.

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
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
`;

const dark = ({ theme }) => theme.mode === "dark";

const PasswordOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: ${(p) => (dark(p) ? "rgba(8, 8, 8, 0.72)" : "rgba(242, 240, 234, 0.72)")};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  animation: ${appear} ${dur.base}s ${ease.out} both;
`;

const PasswordModal = styled.div`
  width: 440px;
  max-width: 100%;
  padding: 36px;
  border-radius: 20px;
  background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.72)")};
  box-shadow:
    inset 0 1px 0 ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.9)")},
    inset 0 0 0 1px ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : p.theme.border)},
    0 24px 64px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.12)")};
  color: ${({ theme }) => theme.text};
  animation: ${rise} ${dur.base}s ${ease.out} both;

  ${({ $shaking }) =>
    $shaking &&
    css`
      animation: ${shake} 0.45s ${ease.out};
    `}

  @media (max-width: 480px) {
    padding: 24px;
  }
`;

// the padlock, in a small glass circle
const Badge = styled.span`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 24px;
  border-radius: 50%;
  box-shadow:
    inset 0 1px 0 ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.9)")},
    inset 0 0 0 1px ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.16)" : p.theme.border)};

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.75;
  }
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.05;
`;

const Lede = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: ${({ theme }) => theme.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  margin-top: 28px;
`;

const invalid = (status) => status === "error" || status === "empty";

const PasswordInput = styled.input`
  width: 100%;
  padding: 16px 52px 16px 20px;
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

  &::placeholder {
    color: ${({ theme }) => theme.textTertiary};
  }

  &:focus {
    outline: none;
    border-color: ${(p) => (invalid(p.$status) ? p.theme.inputError : p.theme.text)};
    box-shadow: 0 0 0 4px ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.08)" : "rgba(23, 23, 26, 0.08)")};
  }

  &:disabled {
    opacity: 0.5;
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
  margin: 10px 0 0 20px;
  min-height: 1.2em;
  font-size: 0.85rem;
  color: ${({ $type, theme }) => ($type === "error" ? theme.inputError : theme.textTertiary)};
`;

const PasswordButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;

  @media (max-width: 360px) {
    flex-direction: column-reverse;
  }
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
`;

const ModalSecondaryButton = styled.button`
  ${pill}
  border: 1px solid ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.16)" : p.theme.border)};
  background: transparent;
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ theme }) => theme.text};
  }
`;

// ---------------- Component ----------------

export default function ProtectedGate({ open, onClose, redirectTo = "/orthovive", title = "Protected project" }) {
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
    if (isLocked) {
      setInputStatus("locked");
      setFeedbackMsg("Too many attempts. Please try again later.");
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setInputStatus("empty");
      setFeedbackMsg("Please enter a password.");
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      // The real check happens against Firebase Auth's servers, not this code.
      await authReady;
      await signInWithEmailAndPassword(auth, VIEWER_EMAIL, password);
      setInputStatus("idle");
      setFeedbackMsg("");
      setPassword("");
      onClose();
      navigate(redirectTo);
      return;
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      triggerShake();
      setPassword("");

      if (err.code === "auth/too-many-requests" || newAttempts >= MAX_ATTEMPTS) {
        setInputStatus("locked");
        setFeedbackMsg("Too many attempts. Please try again later.");
      } else {
        setInputStatus("error");
        const remaining = MAX_ATTEMPTS - newAttempts;
        setFeedbackMsg(
          remaining === 1
            ? "Incorrect password. 1 attempt remaining."
            : `Incorrect password. ${remaining} attempts remaining.`
        );
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
    <PasswordOverlay onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <PasswordModal
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="protected-gate-title"
        $shaking={isShaking}
      >
        <Badge aria-hidden="true">
          <FiLock />
        </Badge>
        <Title id="protected-gate-title">{title}</Title>
        <Lede>This case study is under NDA. Enter the password to view it.</Lede>

        <InputWrapper>
          <PasswordInput
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            aria-label="Password"
            aria-describedby="protected-gate-feedback"
            aria-invalid={invalid(inputStatus)}
            value={password}
            $status={inputStatus}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && !isLocked && !submitting && handlePasswordSubmit()}
            disabled={isLocked || submitting}
            autoFocus
          />
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
          <ModalSecondaryButton type="button" onClick={handleClose}>
            <RollText>Cancel</RollText>
          </ModalSecondaryButton>
          <ModalPrimaryButton type="button" onClick={handlePasswordSubmit} disabled={isLocked || submitting}>
            {isLocked ? "Locked" : submitting ? "Checking…" : <RollText>View case study</RollText>}
          </ModalPrimaryButton>
        </PasswordButtons>
      </PasswordModal>
    </PasswordOverlay>
  );
}
