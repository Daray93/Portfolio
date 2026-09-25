import React, { createContext, useContext, useState } from "react";

// Lets Splash.jsx's About Me cell flag, right at click time, that the
// upcoming Home exit is the real layoutId morph into About Me (see
// morph-about-me/about-card in Splash.jsx/AboutMe.jsx) rather than a
// plain case-study visit -- App.jsx reads this to decide whether Home's
// exit should hold at opacity:1 (so the morphing grid cell doesn't fade
// to invisible mid-flight) or fade out like every other page leave.
//
// A context, not a prop threaded through the Route element: once
// AnimatePresence starts animating Home's exit, React Router has already
// stopped rendering it fresh (it's kept mounted only to finish that exit
// animation), so any prop baked into its Route/element JSX is frozen at
// whatever it was on the last render before the URL changed -- clicking
// About Me updates this AFTER that point. A Context read inside the
// still-mounted (if exiting) component picks up the new value live,
// because context propagation re-renders subscribers independent of
// whether their own parent handed them fresh props.
const HomeMorphIntentContext = createContext({
  morphing: false,
  setMorphing: () => {},
});

export function HomeMorphIntentProvider({ children }) {
  const [morphing, setMorphing] = useState(false);
  return (
    <HomeMorphIntentContext.Provider value={{ morphing, setMorphing }}>
      {children}
    </HomeMorphIntentContext.Provider>
  );
}

export function useHomeMorphIntent() {
  return useContext(HomeMorphIntentContext);
}
