import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";

// New key (was "theme-mode") on purpose: the old one was written on every
// visit from the OS preference, so almost every returning visitor has a
// stored value -- reusing it would mean nobody ever sees the new dark
// default below.
const STORAGE_KEY = "theme-pref";

const ThemeModeContext = createContext(null);

// Dark unless the visitor has picked light themselves (the menu, the case
// study FAB).
function getInitialMode() {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "light") return "light";
  } catch {
    // storage blocked -- fall through to the default
  }
  return "dark";
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage blocked -- the choice just won't survive a reload
    }
  }, [mode]);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")) }),
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
