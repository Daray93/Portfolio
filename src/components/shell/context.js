import { createContext, useContext } from "react";

// The shared frame's context (see Shell.jsx).

// the pages in the frame, in the header pill nav's order
export const SHELL_PAGES = ["/", "/about-me", "/websites"];
export const isShellPage = (pathname) => SHELL_PAGES.includes(pathname);

export const ShellContext = createContext(null);
export const useShell = () => useContext(ShellContext);
