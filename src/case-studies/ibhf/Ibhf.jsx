import React from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";

export default function IbhfCaseStudy() {
  return (
    <CaseStudyLayout sections={[{ id: "overview", label: "Overview" }]}>
      <CaseStudyPage>
        <CaseStudySection id="overview">
          <CaseStudyHero
            title="Irish Bee & Heritage Foundation"
            subtitle="Case study coming soon"
          >
            <p>
              Full write-up in progress. In the meantime, see the live site at{" "}
              <a href="https://ibhf.ie" target="_blank" rel="noopener noreferrer">
                ibhf.ie
              </a>.
            </p>
          </CaseStudyHero>
        </CaseStudySection>
      </CaseStudyPage>

      <OtherProjects currentProjectId="ibhf" />
    </CaseStudyLayout>
  );
}
