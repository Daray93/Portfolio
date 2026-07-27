// components/Container.js
import styled from "styled-components";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
  padding: 1rem 4rem; /* small horizontal padding */

  @media (max-width: 1024px) {
    padding: 1rem 2rem;
  }
  @media (max-width: 768px) {
    padding: 1rem 1rem;
  }
`;



export default Container;
