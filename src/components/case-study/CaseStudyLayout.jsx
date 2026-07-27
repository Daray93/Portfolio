import React, { useRef } from "react";
import styled from "styled-components";
import CaseStudyNav from "./CaseStudyNav";

const Shell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Frame = styled.div`
  width: 100%;
  max-width: 1320px;
  position: relative;
  padding: 0rem 3rem;

  @media (max-width: 1100px) {
    padding: 3rem 2rem;
  }

  @media (max-width: 900px) {
    padding: 5rem 1rem 0rem 1rem;
  }
`;

const Content = styled.main`
  min-width: 0;
  margin-left: 0;
  padding-left: 200px;

  @media (max-width: 1100px) {
    padding-left: 150px;
  }

  @media (max-width: 900px) {
    padding-left: 0;
  }
`;

export default function CaseStudyLayout({ sections, children }) {
  const frameRef = useRef(null);

  return (
    <Shell>
      <Frame ref={frameRef}>
        <Content>{children}</Content>
      </Frame>

      {/* Desktop & Mobile Nav */}
      <CaseStudyNav sections={sections} frameRef={frameRef} />
      
    </Shell>
  );
}