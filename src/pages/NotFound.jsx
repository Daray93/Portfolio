import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/shared/Button";

export default function NotFound() {
  return (
    <Wrap>
      <Content>
        <Eyebrow>Error 404</Eyebrow>
        <Heading>You can't park here mateee.</Heading>
        <Body>
          Whatever you were looking for isn't here — it might have moved,
          or the link's just wrong.
        </Body>
        <Button as={Link} to="/">
          Back to Home
        </Button>
      </Content>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.body};
`;

const Content = styled.div`
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  padding: 2rem;
`;

const Eyebrow = styled.span`
  font-family: "General Sans", sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.accent};
`;

const Heading = styled.h1`
  font-family: "General Sans", sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const Body = styled.p`
  font-size: 1rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;
