import React from "react";
import { CaseStudyLayout, CaseStudyPage } from "../../components/case-study/Index";
import OperationAvocadoContent from "./OperationAvocadoContent";

// Same shell every other case study uses (see Kropt.jsx) -- previously
// this only ran as a bare-bones fallback (CaseStudyLayoutFree) for a cold
// load on /operation-avocado, with the "real" version being an animated
// overlay grown out of the homepage grid cell (OperationAvocadoOverlay,
// now removed). That overlay traded structure (PillNav, section cards)
// for a from-the-grid grow animation; now that homepage->page morphs are
// gone everywhere else too, there was no reason left for this one to be
// the odd one out.
export default function OperationAvocadoCaseStudy() {
  return (
    <CaseStudyLayout
      sections={[
        { id: "overview", label: "Overview" },
        { id: "user", label: "The User" },
        { id: "vision", label: "Vision" },
        { id: "process", label: "Process" },
        { id: "challenges", label: "Challenges / Insights" },
        { id: "results", label: "Results" },
      ]}
    >
      <CaseStudyPage>
        <OperationAvocadoContent />
      </CaseStudyPage>
    </CaseStudyLayout>
  );
}
