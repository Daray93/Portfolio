import { createContext, useContext } from "react";

// The shared frame's context (see Shell.jsx).

// the pages in the frame, in the nav's order (About last, as in the menu)
export const SHELL_PAGES = ["/", "/websites", "/about-me"];
export const isShellPage = (pathname) => SHELL_PAGES.includes(pathname);

export const ShellContext = createContext(null);
export const useShell = () => useContext(ShellContext);
