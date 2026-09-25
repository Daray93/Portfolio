import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { StyleSheetManager } from "styled-components";
import styled from "styled-components";

import GlobalStyle from "./styles/GlobalStyle";
import { ThemeModeProvider } from "./styles/ThemeModeContext";
import { MotionPreferenceProvider, useMotionPreference } from "./styles/MotionPreferenceContext";
import { HomeMorphIntentProvider, useHomeMorphIntent } from "./styles/HomeMorphIntentContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import { logEvent } from "firebase/analytics";
import { analyticsReady } from "./firebase";

// Case studies are lazy -- each one pulls in its own images/video on top
// of its own JS, so landing on "/" previously shipped all five case
// studies' code even though a visitor might only ever view the grid.
const Kropt = lazy(() => import("./case-studies/kropt/Kropt"));
const Neuroloop = lazy(() => import("./case-studies/neuroloop/Neuroloop"));
const OrthoViveCaseStudy = lazy(() => import("./case-studies/orthovive/OrthoVive"));
const IbhfCaseStudy = lazy(() => import("./case-studies/ibhf/Ibhf"));
const OperationAvocadoCaseStudy = lazy(() => import("./case-studies/operation-avocado/OperationAvocado"));
const AudanoteCaseStudy = lazy(() => import("./case-studies/audanote/Audanote"));
const AboutMe = lazy(() => import("./pages/about-me/AboutMe"));

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.body};
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  overflow: visible;
  /* AnimatePresence's mode="popLayout" below pulls the exiting route out
     of flow via position:absolute the instant a new route mounts, so it
     can keep animating (or, for Home, just sit at opacity:1) without
     blocking the incoming page's own layout. Without a positioned
     ancestor to anchor that absolute positioning to, it falls back to
     the nearest one further up the tree (or the viewport) instead of
     this box -- which read as the outgoing page suddenly jumping to a
     different position/size for its whole exit duration rather than
     just fading/sitting in place. */
  position: relative;
`;

// Visually hidden until focused -- every route puts Navbar (logo + 4
// filter pills + theme toggle) ahead of content in the tab order; this
// lets a keyboard user jump straight past it instead of tabbing through
// on every single page load.
const SkipLink = styled.a`
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 10000;
  padding: 0.65rem 1.25rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.buttonPrimaryBg};
  color: ${({ theme }) => theme.buttonPrimaryText};
  font-family: "Geist", sans-serif;
  font-weight: 500;
  text-decoration: none;
  transition: top 0.15s ease;

  &:focus-visible {
    top: 1rem;
  }
`;

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    // Deferred a frame so it lands after framer-motion's layout-effect
    // measurement of any morphing (layoutId) element on the outgoing
    // page -- resetting scroll synchronously here would move that
    // element before its "from" rect is captured, breaking the morph.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  return null;
}

// Firebase Analytics only auto-logs a page_view once, off whatever URL
// was loaded at init -- client-side route changes never touch the
// network, so without this every case study visit after the first would
// be invisible. analyticsReady resolves to null when unsupported (private
// browsing, tracking blockers) rather than throwing.
function AnalyticsPageview() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    analyticsReady.then((analytics) => {
      if (analytics) logEvent(analytics, "page_view", { page_path: pathname });
    });
  }, [pathname]);
  return null;
}

// Wrapping here (rather than in every page file) is what lets
// AnimatePresence keep the outgoing page mounted long enough for any
// morphId element on it (see CaseStudyHero) to finish animating into its
// counterpart on the incoming page -- still needed for About Me's real
// cross-route morph (layoutId="morph-about-me", see
// Splash.jsx/AboutMe.jsx/MorphAnimatedPage below) even though regular
// navigation no longer animates.
const PageTransition = styled(motion.div)`
  width: 100%;
`;

// No fade, no delay -- a plain, instant swap for every route except the
// About Me morph (see MorphAnimatedPage/HomeAnimatedPage below). This
// used to crossfade over 0.2s; the crossfade itself read as smoother than
// a hard cut in isolation, but paired with the chrome (Navbar/Footer)
// toggling on a DIFFERENT, unsynchronised delay (see hideChrome below) it
// read as a stray, uncoordinated flicker rather than a single clean
// transition -- worse than just committing to instant on both at once.
function AnimatedPage({ children }) {
  return (
    <PageTransition initial={false} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      {children}
    </PageTransition>
  );
}

// About Me's own route -- unlike AnimatedPage above, this ALWAYS holds at
// opacity:1 through a real 0.5s exit/entry, both directions. An ancestor's
// opacity animates the *rendered* (composited) opacity of everything
// inside it, including a descendant motion element that's independently
// running its own layoutId scale animation -- so a plain fade here would
// drag the morphing element's opacity to 0 mid-flight even though its own
// shared-element projection is trying to keep it visually continuous.
// That reads as the cell's content disappearing rather than physically
// growing. There's no directional ambiguity here (only Home links here,
// only here links back to Home) unlike Home's own route, which needs
// HomeAnimatedPage below to pick per-navigation instead.
function MorphAnimatedPage({ children }) {
  return (
    <PageTransition
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </PageTransition>
  );
}

// Home's exit needs to pick between AnimatedPage's instant swap (leaving
// to a case study) and MorphAnimatedPage's held-opacity morph (leaving to
// About Me) -- the About Me cell sets `morphing` right before navigating
// away (see HomeMorphIntentContext), read live here since Home's own
// Route props are frozen the instant AnimatePresence starts its exit.
// Entry stays the plain instant swap either way -- arriving back from
// About Me was never the reported problem, only leaving to it was.
function HomeAnimatedPage({ children }) {
  const { morphing } = useHomeMorphIntent();
  return (
    <PageTransition
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={morphing ? { duration: 0.5, ease: "easeInOut" } : { duration: 0 }}
    >
      {children}
    </PageTransition>
  );
}

// Blank rather than a spinner -- a matching-background placeholder is
// invisible in practice while the lazy chunk loads, without adding a
// flash of its own.
const RouteFallback = styled.div`
  min-height: 60vh;
  background: ${({ theme }) => theme.body};
`;

// About Me arrives/leaves via a real morph (layoutId="morph-about-me")
// that runs over 0.5s (see MorphAnimatedPage), hence its own longer
// delay below -- chrome toggling needs a matching delay there, or
// Navbar/Footer would vanish the instant the route changes, a beat
// before the outgoing page has even started its exit. Every other route
// swaps instantly (see AnimatedPage), so its chrome toggles instantly
// too (delay 0) -- keeping both in the same tick is what actually reads
// as clean rather than glitchy; staggering an instant content swap
// against a delayed chrome toggle was the flicker.
const MORPH_CHROMELESS_PREFIXES = ["/about-me"];
const CHROMELESS_PREFIXES = ["/kropt", "/neuroloop", "/orthovive", "/ibhf", "/operation-avocado", "/audanote", ...MORPH_CHROMELESS_PREFIXES];
const shouldHideChrome = (pathname) =>
  CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
const isMorphRoute = (pathname) =>
  MORPH_CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

// framer-motion's own reducedMotion prop is what actually disables/
// simplifies every motion.* animation site-wide -- this just bridges the
// app's own toggle (see MotionPreferenceContext, surfaced in Splash.jsx's
// mobile utility row and the case study FAB) into it. A separate
// component (not read directly in App) since useMotionPreference needs
// MotionPreferenceProvider as an ancestor, not a sibling.
//
// `children` is a render-prop (receives `reduced`) rather than a plain
// node -- framer-motion only reads MotionConfig's reducedMotion value
// when a motion component is first created (its VisualElement caches
// "shouldReduceMotion" at mount, not on every render), so flipping the
// prop alone silently did nothing to whatever was already on screen; it
// only took effect after a full page reload, when everything mounted
// fresh under the new value. App forces that same fresh-mount by keying
// AppWrapper off `reduced` (see below) -- this render-prop is what lets
// it read the same value the config itself just changed to.
function MotionPreferenceBridge({ children }) {
  const { reduced } = useMotionPreference();
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      {children(reduced)}
    </MotionConfig>
  );
}

export default function App() {
  const location = useLocation();

  // Navbar/Footer take up real flex space in AppWrapper (Navbar itself is
  // position:fixed, but reserves its height via NavSpacer in normal flow;
  // Footer sits directly in flow), so toggling them needs to land in the
  // same tick as the content swap it accompanies -- one changing before
  // the other is exactly what reads as a glitch, not either change on its
  // own. Every route now swaps instantly (see AnimatedPage) except About
  // Me's real 0.5s morph (see MorphAnimatedPage), so only that route
  // keeps a matching delay; everything else is 0.
  const [hideChrome, setHideChrome] = React.useState(() => shouldHideChrome(location.pathname));

  React.useEffect(() => {
    const next = shouldHideChrome(location.pathname);
    const delay = next && isMorphRoute(location.pathname) ? 350 : 0;
    const t = setTimeout(() => setHideChrome(next), delay);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <StyleSheetManager shouldForwardProp={(prop) => prop !== "theme"}>
      <MotionPreferenceProvider>
      <MotionPreferenceBridge>
      {(reduced) => (
      <ThemeModeProvider>
        <GlobalStyle />
        <ScrollToTopOnRouteChange />
        <AnalyticsPageview />

        <SkipLink href="#main-content">Skip to content</SkipLink>

        {/* Keyed off `reduced` so every motion.* component underneath
            (Navbar's PillNav indicator, the routed page's own reveals/
            layout transitions, etc.) gets a fresh mount picking up the
            new reducedMotion setting -- see MotionPreferenceBridge's own
            comment for why that's necessary. ScrollToTopOnRouteChange/
            AnalyticsPageview stay outside this boundary on purpose: they
            fire their effects on mount, and remounting them here would
            re-trigger an unwanted scroll-to-top/pageview every time this
            toggle flips. */}
        <AppWrapper key={reduced}>
          {!hideChrome && <Navbar />}

          <Main id="main-content" tabIndex={-1}>
            <HomeMorphIntentProvider>
            <AnimatePresence mode="popLayout" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomeAnimatedPage><Home /></HomeAnimatedPage>} />
                <Route
                  path="/orthovive"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <OrthoViveCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/kropt"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <Kropt />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/neuroloop"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <Neuroloop />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/ibhf"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <IbhfCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/operation-avocado"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <OperationAvocadoCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/audanote"
                  element={
                    <AnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <AudanoteCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/about-me"
                  element={
                    <MorphAnimatedPage>
                      <Suspense fallback={<RouteFallback />}>
                        <AboutMe />
                      </Suspense>
                    </MorphAnimatedPage>
                  }
                />
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
            </HomeMorphIntentProvider>
          </Main>

          {!hideChrome && <Footer />}
        </AppWrapper>
      </ThemeModeProvider>
      )}
      </MotionPreferenceBridge>
      </MotionPreferenceProvider>
    </StyleSheetManager>
  );
}