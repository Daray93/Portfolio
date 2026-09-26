import React, { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";

// Each page has its own fixed theme: the homepage carousel is dark, every
// reading page (case studies, About, 404) is light. There's no switch -- the
// card transition (see ExpandTransition) is built around that dark-to-light
// handoff. index.html paints the same choice before the app loads.
const themeForPath = (pathname) => (pathname === "/" ? "dark" : "light");

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const { pathname } = useLocation();
  const mode = themeForPath(pathname);
  const value = useMemo(() => ({ mode }), [mode]);

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
