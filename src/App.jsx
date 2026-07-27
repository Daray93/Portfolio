import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, StyleSheetManager } from "styled-components";
import styled from "styled-components";

import GlobalStyle from "./styles/GlobalStyle";
import { theme } from "./styles/theme";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CustomCursor from "./components/layout/CustomCursor";

import Home from "./pages/Home";
import Kropt from "./case-studies/kropt/Kropt";
import Neuroloop from "./case-studies/neuroloop/Neuroloop";
import OrthoViveCaseStudy from "./case-studies/orthovive/OrthoVive";
import IbhfCaseStudy from "./case-studies/ibhf/Ibhf";
import OperationAvocadoCaseStudy from "./case-studies/operation-avocado/OperationAvocado";

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
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  const isKropt = location.pathname.startsWith("/kropt");
  const isNeuroloop = location.pathname.startsWith("/neuroloop");
  const isOrthoVive = location.pathname.startsWith("/orthovive");
  const isIbhf = location.pathname.startsWith("/ibhf");
  const isOperationAvocado = location.pathname.startsWith("/operation-avocado");

  const hideChrome =
    isKropt || isNeuroloop || isOrthoVive || isIbhf || isOperationAvocado;

  return (
    <StyleSheetManager shouldForwardProp={(prop) => prop !== "theme"}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <CustomCursor theme={{ mode: "light" }} />
        <ScrollToTopOnRouteChange />

        <AppWrapper>
          {!hideChrome && <Navbar />}

          <Main>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/orthovive" element={<OrthoViveCaseStudy />} />
              <Route path="/kropt" element={<Kropt />} />
              <Route path="/neuroloop" element={<Neuroloop />} />
              <Route path="/ibhf" element={<IbhfCaseStudy />} />
              <Route path="/operation-avocado" element={<OperationAvocadoCaseStudy />} />
            </Routes>
          </Main>

          {!hideChrome && <Footer />}
        </AppWrapper>
      </ThemeProvider>
    </StyleSheetManager>
  );
}