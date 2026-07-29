import React from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
  CaseStudyMorphMedia,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import ibhfVideo from "./assets/ibhf.mp4";

export default function IbhfCaseStudy() {
  return (
    <CaseStudyLayout sections={[{ id: "overview", label: "Overview" }]} morphId="morph-ibhf">
      <CaseStudyPage>
        <CaseStudySection id="overview">
          <CaseStudyMorphMedia morphId="morph-ibhf" video={ibhfVideo} />

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
