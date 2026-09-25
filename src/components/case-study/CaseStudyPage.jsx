import styled from "styled-components";

const CaseStudyPage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background: ${({ theme }) => theme.body};
  border-radius: ${({ theme }) => theme.radius.xl};

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

export default CaseStudyPage;