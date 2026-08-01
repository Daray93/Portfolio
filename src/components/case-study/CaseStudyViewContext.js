import { createContext, useContext } from "react";

// Lets CaseStudyHero's TL;DR / Full Story toggle (which only has access to
// its own children) reach sideways into sibling CaseStudySections further
// down the same page -- CaseStudyLayout is the provider, so the toggle
// state is scoped per case study rather than global.
export const CaseStudyViewContext = createContext({
  view: "detailed",
  setView: () => {},
});

export const useCaseStudyView = () => useContext(CaseStudyViewContext);
