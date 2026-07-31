// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Left on "auto", the browser restores whatever scroll position a tab had
// before a refresh -- on scroll-linked routes like About Me that races the
// app's own route-change reset (see ScrollToTopOnRouteChange in App.jsx)
// and can win, landing mid-flight with zero scroll input and caption tiers
// that haven't finished laying out yet.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// Get the root element
const rootElement = document.getElementById("root");

// Create root and render
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
