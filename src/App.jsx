import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
const OperationAvocadoOverlay = lazy(() => import("./case-studies/operation-avocado/OperationAvocadoOverlay"));
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

const CHROMELESS_PREFIXES = ["/kropt", "/neuroloop", "/orthovive", "/ibhf", "/operation-avocado", "/about-me"];
const shouldHideChrome = (pathname) =>
  CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Operation Avocado opens as a fixed overlay on top of whatever page it
  // was launched from (see Splash.jsx's openAvocado / OperationAvocadoOverlay)
  // rather than a routed page swap -- `backgroundLocation` is the page that
  // was showing when it was opened, stashed in router state. As long as
  // it's set, the *primary* Routes below keeps rendering that page (so it
  // never unmounts, and the cell being expanded never disappears); the
  // overlay is a second, independent layer on top of it.
  const backgroundLocation = location.state?.backgroundLocation;
  const routedLocation = backgroundLocation || location;

  // Navbar/Footer take up real flex space in AppWrapper, so toggling them
  // the instant the route changes would yank that space away mid-fade,
  // right as a project cell is morphing into its case study. Delaying the
  // flip to match AnimatedPage's fade duration keeps chrome stable through
  // the transition instead of jump-cutting under it. Driven by
  // routedLocation rather than location so the overlay (which manages its
  // own chrome) doesn't affect Home's Navbar/Footer underneath it.
  const [hideChrome, setHideChrome] = React.useState(() => shouldHideChrome(routedLocation.pathname));

  React.useEffect(() => {
    const next = shouldHideChrome(routedLocation.pathname);
    const t = setTimeout(() => setHideChrome(next), next ? 350 : 0);
    return () => clearTimeout(t);
  }, [routedLocation.pathname]);

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
              <Routes location={routedLocation} key={routedLocation.pathname}>
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
                  path="/about-me"
                  element={
                    <AnimatedPage noFade>
                      <Suspense fallback={<RouteFallback />}>
                        <AboutMe />
                      </Suspense>
                    </AnimatedPage>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Main>

          {!hideChrome && <Footer />}

          <AnimatePresence>
            {backgroundLocation && location.pathname === "/operation-avocado" && (
              <Suspense fallback={null} key="avocado-overlay">
                <OperationAvocadoOverlay onClose={() => navigate("/?filter=work")} />
              </Suspense>
            )}
          </AnimatePresence>
        </AppWrapper>
      </ThemeModeProvider>
    </StyleSheetManager>
  );
}