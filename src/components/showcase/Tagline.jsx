import styled from "styled-components";
import { PHONE_QUERY } from "./ProjectMedia";

// A project's tagline -- its `description`, or on phones its
// `shortDescription` when it has one (a line that wraps awkwardly on a
// narrow screen). Used by the carousel caption and the case study cover,
// so the two always say the same thing.

const Full = styled.span`
  @media ${PHONE_QUERY} {
    display: none;
  }
`;

const Short = styled.span`
  display: none;

  @media ${PHONE_QUERY} {
    display: inline;
  }
`;

export default function Tagline({ project }) {
  if (!project.shortDescription) return project.description;
  return (
    <>
      <Full>{project.description}</Full>
      <Short>{project.shortDescription}</Short>
    </>
  );
}
