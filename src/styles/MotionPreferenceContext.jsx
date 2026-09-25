import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "reduce-motion";

const MotionPreferenceContext = createContext(null);

function getInitialReduced() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "true" || stored === "false") return stored === "true";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Drives framer-motion's own <MotionConfig reducedMotion> (see App.jsx) --
// that one prop is what actually disables/simplifies every motion.*
// animation site-wide, so this context is just the toggle + persistence
// on top of it. Named "MotionPreference" rather than "ReducedMotion" to
// avoid colliding with framer-motion's own built-in useReducedMotion hook
// (which only reads the OS setting, not this app-level override).
export function MotionPreferenceProvider({ children }) {
  const [reduced, setReduced] = useState(getInitialReduced);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(reduced));
  }, [reduced]);

  const toggleReduced = () => setReduced((r) => !r);

  const value = useMemo(() => ({ reduced, toggleReduced }), [reduced]);

  return (
    <MotionPreferenceContext.Provider value={value}>{children}</MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference() {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) throw new Error("useMotionPreference must be used within a MotionPreferenceProvider");
  return ctx;
}
