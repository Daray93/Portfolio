import { createContext, useContext } from "react";

// Lets CaseStudyHero's TL;DR / Full Story toggle (which only has access to
// its own children) reach sideways into sibling CaseStudySections further
// down the same page -- CaseStudyLayout is the provider, so the toggle
// state is scoped per case study rather than global.
//
// numberOf(id) gives a section its place in the page ("01", "02"...) when
// the case study is numbered (CaseStudyLayout's `numbered`), else null.
export const CaseStudyViewContext = createContext({
  view: "detailed",
  setView: () => {},
  numberOf: () => null,
});

export const useCaseStudyView = () => useContext(CaseStudyViewContext);

// The number of the section a piece of content sits in ("06"), so its
// numbered sub-sections can follow on from it ("06.01"). CaseStudySection
// is the provider; null outside a numbered section.
export const SectionNumberContext = createContext(null);

export const useSectionNumber = () => useContext(SectionNumberContext);
