import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
// the old in-menu switch saved its choice here; cleared so it can't keep
// overriding the system setting for anyone who once pressed it
const OLD_STORAGE_KEY = "reduce-motion";

const MotionPreferenceContext = createContext(null);

// Follows the visitor's system "reduce motion" setting, live -- the one
// place people already expect to ask for less motion, so the site has no
// switch of its own. Drives framer-motion's own <MotionConfig reducedMotion>
// (see App.jsx) and, via the "reduce-motion" class, CSS transitions too
// (see GlobalStyle). Named "MotionPreference" rather than "ReducedMotion" to
// avoid colliding with framer-motion's built-in useReducedMotion hook.
export function MotionPreferenceProvider({ children }) {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    try {
      window.localStorage.removeItem(OLD_STORAGE_KEY);
    } catch {
      // storage blocked -- nothing was stored either
    }
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
  }, [reduced]);

  const value = useMemo(() => ({ reduced }), [reduced]);

  return (
    <MotionPreferenceContext.Provider value={value}>{children}</MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference() {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) throw new Error("useMotionPreference must be used within a MotionPreferenceProvider");
  return ctx;
}
