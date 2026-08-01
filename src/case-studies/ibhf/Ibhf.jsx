import React from "react";
import {
  CaseStudyLayout,
  CaseStudyPage,
  CaseStudySection,
  CaseStudyHero,
  CaseStudyMorphMedia,
} from "../../components/case-study/Index";
import OtherProjects from "../../components/shared/OtherProjects";
import ibhfHero from "./assets/IBHF-HERO.png";

export default function IbhfCaseStudy() {
  return (
    <CaseStudyLayout sections={[{ id: "overview", label: "Overview" }]}>
      <CaseStudyPage>
        <CaseStudySection id="overview" tldrVisible>
          <CaseStudyMorphMedia image={ibhfHero} imageFit="cover" />

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
