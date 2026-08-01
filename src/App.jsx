import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { StyleSheetManager } from "styled-components";
import styled from "styled-components";

import GlobalStyle from "./styles/GlobalStyle";
import { ThemeModeProvider } from "./styles/ThemeModeContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CustomCursor from "./components/layout/CustomCursor";

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

// Fades each route in/out; wrapping here (rather than in every page file)
// is what lets AnimatePresence keep the outgoing page mounted long enough
// for any morphId element on it (see CaseStudyHero) to finish animating
// into its counterpart on the incoming page.
const PageTransition = styled(motion.div)`
  width: 100%;
`;

// `noFade`: an ancestor's opacity animates the *rendered* (composited)
// opacity of everything inside it, including a descendant motion element
// that's independently running its own layoutId scale animation -- so
// this page-level fade was dragging a homepage cell's opacity down to 0
// mid-flight even though its own shared-element projection was trying to
// keep it visually continuous. That read as the cell's content
// disappearing rather than physically growing. Routes that arrive/leave
// via a morphId (Home and the case studies) skip the fade entirely and
// let the layoutId scale be the only thing driving the transition; the
// exit animation is kept (just non-visual) purely so AnimatePresence
// still holds the outgoing page mounted for the scale to finish.
function AnimatedPage({ children, noFade = false }) {
  if (noFade) {
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

  return (
    <PageTransition
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {children}
    </PageTransition>
  );
}

// Blank rather than a spinner -- AnimatedPage already fades the route in
// from opacity 0, so a matching-background placeholder is invisible in
// practice while the lazy chunk loads, without adding a flash of its own.
const RouteFallback = styled.div`
  min-height: 60vh;
  background: ${({ theme }) => theme.body};
`;

const CHROMELESS_PREFIXES = ["/kropt", "/neuroloop", "/orthovive", "/ibhf", "/operation-avocado", "/audanote", "/about-me"];
const shouldHideChrome = (pathname) =>
  CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export default function App() {
  const location = useLocation();

  // Navbar/Footer take up real flex space in AppWrapper, so toggling them
  // the instant the route changes would yank that space away mid-fade,
  // right as a project cell is transitioning into its case study. Delaying
  // the flip to match AnimatedPage's fade duration keeps chrome stable
  // through the transition instead of jump-cutting under it.
  const [hideChrome, setHideChrome] = React.useState(() => shouldHideChrome(location.pathname));

  React.useEffect(() => {
    const next = shouldHideChrome(location.pathname);
    const t = setTimeout(() => setHideChrome(next), next ? 350 : 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <StyleSheetManager shouldForwardProp={(prop) => prop !== "theme"}>
      <ThemeModeProvider>
        <GlobalStyle />
        <CustomCursor />
        <ScrollToTopOnRouteChange />
        <AnalyticsPageview />

        <AppWrapper>
          {!hideChrome && <Navbar />}

          <Main>
            <AnimatePresence mode="popLayout" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedPage noFade><Home /></AnimatedPage>} />
                <Route
                  path="/orthovive"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <OrthoViveCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/kropt"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <Kropt />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/neuroloop"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <Neuroloop />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/ibhf"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <IbhfCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/operation-avocado"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <OperationAvocadoCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/audanote"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <AudanoteCaseStudy />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/about-me"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <AboutMe />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
          </Main>

          {!hideChrome && <Footer />}
        </AppWrapper>
      </ThemeModeProvider>
    </StyleSheetManager>
  );
}