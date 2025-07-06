import React, { useState, useEffect, lazy, Suspense } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { lightTheme, darkTheme } from "./styles/theme";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Work = lazy(() => import("./pages/Work"));
const Aoede = lazy(() => import("./pages/Aoede"));
const Neuroloop = lazy(() => import("./pages/neuroloop")); 
const LogoDesign = lazy(() => import("./pages/LogoDesign"));
const WeddingMate = lazy(() => import("./pages/WeddingMate"));
const TUSFitness = lazy(() => import("./pages/TUSFitness"));

const GlobalStyle = createGlobalStyle`
  

  body {
    font-family: 'Inter', sans-serif;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: background 0.3s ease, color 0.3s ease;
  }

  * {
    box-sizing: border-box;
  }
`;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  width: 90%;
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 0rem;
}


  @media (max-width: 480px) {
    width: 90%;
  }
`;

const PageWrapper = styled(motion.div)`
  width: 100%;
`;

function App() {
  const location = useLocation();
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (prefersDark ? "dark" : "light"));

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <title>Dara Phillips → Portfolio</title>
        <meta
          name="description"
          content="Dara Phillips is a digital media artist specializing in interactive, immersive experiences and creative web design."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="canonical" href="https://daraphillips.com" />

      <GlobalStyle />
      <ScrollToTop />

      <AppWrapper>
        <Navbar toggleTheme={toggleTheme} theme={theme} />

        <Main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <PageWrapper
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Home />
                    </PageWrapper>
                  </Suspense>
                }
              />
              <Route path="/about" element={<Suspense fallback={<div>Loading...</div>}><About /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<div>Loading...</div>}><Contact /></Suspense>} />
              <Route path="/work" element={<Suspense fallback={<div>Loading...</div>}><Work /></Suspense>} />
              <Route path="/aoede" element={<Suspense fallback={<div>Loading...</div>}><Aoede /></Suspense>} />
              <Route path="/neuroloop" element={<Suspense fallback={<div>Loading...</div>}><Neuroloop /></Suspense>} />
              <Route path="/logoDesign" element={<Suspense fallback={<div>Loading...</div>}><LogoDesign /></Suspense>} />
              <Route path="/weddingMate" element={<Suspense fallback={<div>Loading...</div>}><WeddingMate /></Suspense>} />
              <Route path="/tusFitness" element={<Suspense fallback={<div>Loading...</div>}><TUSFitness /></Suspense>} />
            </Routes>
          </AnimatePresence>
        </Main>

        <Footer />
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
