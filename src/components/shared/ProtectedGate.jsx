import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

import ShowPasswordIcon from "../../assets/shared/show-password.svg";
import HidePasswordIcon from "../../assets/shared/hide-password.svg";

// Shared Firebase Auth account gating every NDA-protected case study.
// The real password lives only in Firebase Auth — never in this repo.
const VIEWER_EMAIL = "viewer@daraphillips.com";

const MAX_ATTEMPTS = 5;

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

const PasswordOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
`;

const PasswordModal = styled.div`
  width: 420px;
  max-width: 100%;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadowLg};

  animation: ${({ $shaking }) => $shaking ? shake : "none"} 0.45s ease;

  h3 {
    margin: 0 0 0.25rem;
    font-family: "Fraunces Variable", serif;
    color: ${({ theme }) => theme.text};
    font-size: clamp(1rem, 2.5vw, 1.2rem);
  }

  p {
    margin: 0;
    font-family: "Geist", sans-serif;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.textTertiary};
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-top: 1rem;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $status, theme }) =>
    $status === "error" ? theme.inputError :
    $status === "empty" ? theme.inputError :
    theme.inputBorder};
  background: ${({ $status, theme }) =>
    $status === "error" ? "rgba(239, 68, 68, 0.04)" :
    $status === "empty" ? "rgba(239, 68, 68, 0.04)" :
    theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-family: "Geist", sans-serif;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.placeholder};
  }

  &:hover {
    border-color: ${({ $status, theme }) =>
      $status === "error" || $status === "empty" ? theme.inputError : theme.inputBorderHover};
  }

  &:focus {
    outline: none;
    border-color: ${({ $status, theme }) =>
      $status === "error" || $status === "empty" ? theme.inputError : theme.inputBorderFocus};
    box-shadow: ${({ $status }) =>
      $status === "error" || $status === "empty"
        ? "0 0 0 3px rgba(239, 68, 68, 0.12)"
        : "0 0 0 3px rgba(37, 99, 235, 0.12)"};
  }
`;

const ToggleVisibility = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;

  img {
    width: 1.2rem;
    height: 1.2rem;
    opacity: 0.4;
    transition: opacity 0.15s ease;
  }

  &:hover img {
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.inputBorderFocus};
    border-radius: 4px;
  }
`;

const FeedbackText = styled.p`
  margin-top: 0.5rem !important;
  font-size: 0.8rem !important;
  color: ${({ $type, theme }) =>
    $type === "error" ? theme.inputError : theme.textTertiary} !important;
  min-height: 1.1rem;
  transition: color 0.15s ease;
`;

const PasswordButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 360px) {
    flex-direction: column;
  }
`;

const ModalPrimaryButton = styled.button`
  flex: 1;
  padding: 0.85rem;
  border: none;
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  color: ${({ theme }) => theme.buttonPrimaryText};
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttonPrimaryHover};
    box-shadow: ${({ theme }) => theme.shadowSm};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.inputBorderFocus};
    outline-offset: 2px;
  }
`;

const ModalSecondaryButton = styled.button`
  flex: 1;
  padding: 0.85rem;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  font-family: "Geist", sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.buttonSecondaryHover};
    color: ${({ theme }) => theme.linkHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.inputBorderFocus};
    outline-offset: 2px;
  }
`;

// ---------------- Component ----------------

export default function ProtectedGate({ open, onClose, redirectTo = "/orthovive" }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Same reasoning as the About Me modal (Splash.jsx): traps Tab within
  // the modal and handles Escape, since neither existed before -- Tab
  // could walk out into whatever grid content sits behind the overlay,
  // and there was no keyboard way to dismiss this beyond tabbing all the
  // way to Cancel. The password input already gets initial focus via
  // autoFocus below, so this only needs to handle the trap + Escape.
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
        <h3 id="protected-gate-title">Protected Project</h3>
        <p>This case study is password protected.</p>

        <InputWrapper>
          <PasswordInput
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
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
              <img
                src={showPassword ? HidePasswordIcon : ShowPasswordIcon}
                alt={showPassword ? "Hide password" : "Show password"}
              />
            </ToggleVisibility>
          )}
        </InputWrapper>

        <FeedbackText $type={inputStatus === "idle" ? "hint" : "error"}>
          {feedbackMsg || " "}
        </FeedbackText>

        <PasswordButtons>
          <ModalSecondaryButton onClick={handleClose}>
            Cancel
          </ModalSecondaryButton>
          <ModalPrimaryButton
            onClick={handlePasswordSubmit}
            disabled={isLocked || submitting}
          >
            {isLocked ? "Locked" : submitting ? "Checking..." : "Enter"}
          </ModalPrimaryButton>
        </PasswordButtons>
      </PasswordModal>
    </PasswordOverlay>
  );
}
