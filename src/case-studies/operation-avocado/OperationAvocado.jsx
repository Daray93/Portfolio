import React from "react";
import { CaseStudyLayoutFree } from "../../components/case-study/Index";
import OperationAvocadoContent from "./OperationAvocadoContent";

// Plain routed version -- used for a cold load / direct link / refresh
// on /operation-avocado, where there's no homepage cell to expand from.
// The animated, expands-from-the-grid version is OperationAvocadoOverlay,
// rendered by App.jsx on top of Home when the cell itself is clicked.
export default function OperationAvocadoCaseStudy() {
  return (
    <CaseStudyLayoutFree>
      <OperationAvocadoContent />
    </CaseStudyLayoutFree>
  );
}
