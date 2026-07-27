import React from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";

export default function OperationAvocadoCaseStudy() {
  return (
    <CaseStudyLayout sections={[{ id: "overview", label: "Overview" }]}>
      <CaseStudyPage>
        <CaseStudySection id="overview">
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
