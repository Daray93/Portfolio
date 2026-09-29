import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";

// One theme for the whole site, light or dark. It follows the visitor's
// device until they pick one with a toggle (the header, the case study
// FAB); their pick is remembered in this browser. index.html paints the
// same choice before the app loads, so there's no flash.
const STORAGE_KEY = "theme-pref";

const ThemeModeContext = createContext(null);

function storedMode() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

const deviceMode = () => (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

export function ThemeModeProvider({ children }) {
  const [picked, setPicked] = useState(storedMode);
  const [device, setDevice] = useState(deviceMode);
  const mode = picked ?? device;

  // until they pick, follow the device live (it can switch at sunset)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setDevice(deviceMode());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // keep the pre-paint class in step, for anything reading it
  useEffect(() => {
    document.documentElement.classList.toggle("light", mode === "light");
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        const next = mode === "light" ? "dark" : "light";
        setPicked(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // storage blocked -- the choice just won't survive a reload
        }
      },
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within a ThemeModeProvider");
  return ctx;
}
