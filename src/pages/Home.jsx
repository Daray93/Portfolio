import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import IrishParallaxHero from "../components/IrishParallaxHero";
import Projects from "../components/Project";

export default function Home() {
  const projectsRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "projects" && projectsRef.current) {
      // Delay scrolling to allow page/render animation to finish
      const timeout = setTimeout(() => {
        projectsRef.current.scrollIntoView({ behavior: "smooth" });
        // Clear the state from browser history
        window.history.replaceState({}, document.title, location.pathname);
      }, 1000); // You can tweak this delay if needed

      return () => clearTimeout(timeout);
    }
  }, [location]);

  return (
    <>

        <title>Dara Phillips → Portfolio</title>
        <meta
          name="description"
          content="Dara Phillips is an aspiring Product & XR Designer specialising in immersive, interactive experiences using creative technology."
        />
        <meta name="keywords" content="React, Digital Media, Portfolio, Dara Phillips" />
        <meta property="og:title" content="Dara Phillips Portfolio" />
        <meta property="og:description" content="Recent Graduate | Product & XR Designer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://daraphillips.com" />
        <meta property="og:image" content="preview.jpg" />

      <IrishParallaxHero scrollToRef={projectsRef} />

      <div id="projects" ref={projectsRef}>
        <Projects />
      </div>
    </>
  );
}
