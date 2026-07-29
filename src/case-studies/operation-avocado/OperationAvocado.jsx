import React from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
  CaseStudyMorphMedia,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import AvocadoLogo from "./assets/Mobile-Logo-OA.png";
import AvocadoJumpingJack from "./AvocadoJumpingJack";

export default function OperationAvocadoCaseStudy() {
  return (
    <CaseStudyLayout sections={[{ id: "overview", label: "Overview" }]} morphId="morph-avocado">
      <CaseStudyPage>
        <CaseStudySection id="overview">
          <CaseStudyMorphMedia morphId="morph-avocado" image={AvocadoLogo} imageFit="contain" />

          <AvocadoJumpingJack />

          <CaseStudyHero
            title="Operation Avocado"
            subtitle="Case study coming soon"
          >
            <p>Full write-up in progress — check back soon.</p>
          </CaseStudyHero>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="operation-avocado" />
    </CaseStudyLayout>
  );
}
