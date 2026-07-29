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

// Case studies are lazy -- each one pulls in its own images/video on top
// of its own JS, so landing on "/" previously shipped all five case
// studies' code even though a visitor might only ever view the grid.
const Kropt = lazy(() => import("./case-studies/kropt/Kropt"));
const Neuroloop = lazy(() => import("./case-studies/neuroloop/Neuroloop"));
const OrthoViveCaseStudy = lazy(() => import("./case-studies/orthovive/OrthoVive"));
const IbhfCaseStudy = lazy(() => import("./case-studies/ibhf/Ibhf"));
const OperationAvocadoCaseStudy = lazy(() => import("./case-studies/operation-avocado/OperationAvocado"));

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

// Fades each route in/out; wrapping here (rather than in every page file)
// is what lets AnimatePresence keep the outgoing page mounted long enough
// for any morphId element on it (see CaseStudyHero) to finish animating
// into its counterpart on the incoming page.
const PageTransition = styled(motion.div)`
  width: 100%;
`;

function AnimatedPage({ children }) {
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

const CHROMELESS_PREFIXES = ["/kropt", "/neuroloop", "/orthovive", "/ibhf", "/operation-avocado"];
const shouldHideChrome = (pathname) =>
  CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export default function App() {
  const location = useLocation();

  // Navbar/Footer take up real flex space in AppWrapper, so toggling them
  // the instant the route changes would yank that space away mid-fade,
  // right as a project cell is morphing into its case study. Delaying the
  // flip to match AnimatedPage's fade duration keeps chrome stable through
  // the transition instead of jump-cutting under it.
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

        <AppWrapper>
          {!hideChrome && <Navbar />}

          <Main>
            <AnimatePresence mode="popLayout" initial={false}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
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
              </Routes>
            </AnimatePresence>
          </Main>

          {!hideChrome && <Footer />}
        </AppWrapper>
      </ThemeModeProvider>
    </StyleSheetManager>
  );
}