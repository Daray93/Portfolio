import { Link } from "react-router-dom";
import styled from "styled-components";
import { FiEye } from "react-icons/fi";
import { SiLinkedin } from "react-icons/si";
import CopyEmail from "./CopyEmail";
import { pill } from "./pill";
import { LINKEDIN_URL } from "../../data/contact";
import { ease, dur } from "../../styles/motion";
import portrait from "../../assets/profile-photo.png";

// About, as one small card: a face, a few lines in my own voice, what I'm
// looking for, and how to reach me. No dates, no lists.
//
// Two homes (they supply the surface around it):
//   desktop          unfolds from the header's name and logo on hover or
//                    focus (see SiteHeader)
//   phones/tablets   the About page, from the menu (see pages/About.jsx);
//                    also what /about-me shows anywhere
//
// `as` sets the greeting's heading level (h1 on the page, h2 in the header);
// `onNavigate` lets the header close its card when a link in it is followed.

const CV_URL = "/Dara-Phillips_cv_2026.pdf";

const Card = styled.div`
  display: grid;
  gap: 20px;
  color: ${({ theme }) => theme.text};
`;

const Byline = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

// already a circle on a warm light background; the disc behind it only
// shows while it loads
const Portrait = styled.img`
  flex: none;
  width: 72px;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  background: #ece8e1;
`;

const Greeting = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const Where = styled.p`
  margin: 3px 0 0;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.textTertiary};
`;

const Story = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.textSecondary};

  a {
    color: ${({ theme }) => theme.text};
    font-weight: 500;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    text-decoration-color: ${({ theme }) => theme.textTertiary};
    transition: text-decoration-color ${dur.fast}s ${ease.out};
  }

  a:hover {
    color: ${({ theme }) => theme.text};
    text-decoration-color: currentColor;
  }

  a:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

// what I'm looking for: a small label over a plain line
const Next = styled.div`
  display: grid;
  gap: 4px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.border};

  span {
    font-size: 0.8125rem;
    font-weight: 500;
    color: ${({ theme }) => theme.textTertiary};
  }

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

// the CV and LinkedIn side by side, the email address under them (it's too
// long to share a row)
const Contact = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  > button,
  > a {
    ${pill}
  }

  > button {
    grid-column: 1 / -1;
  }
`;

// LinkedIn blue on hover, text and icon together. Tripled to outrank the
// pill's own hover colour
const Social = styled.a`
  &&& {
    transition:
      color ${dur.fast}s ${ease.out},
      border-color ${dur.fast}s ${ease.out},
      background-color ${dur.fast}s ${ease.out};
  }

  &&&:hover {
    color: ${({ theme }) => theme.linkedin};
  }
`;

// the CV, the one filled button: the main thing to do here
const CvButton = styled.a`
  && {
    border-color: ${({ theme }) => theme.buttonPrimaryBg};
    background: ${({ theme }) => theme.buttonPrimaryBg};
    color: ${({ theme }) => theme.buttonPrimaryText};
  }

  &&:hover {
    border-color: ${({ theme }) => theme.buttonPrimaryHover};
    background: ${({ theme }) => theme.buttonPrimaryHover};
    color: ${({ theme }) => theme.buttonPrimaryHoverText};
  }
`;

export default function AboutCard({ as = "h2", onNavigate }) {
  return (
    <Card>
      <Byline>
        <Portrait src={portrait} draggable={false} alt="" />
        <div>
          <Greeting as={as}>Hi, I&apos;m Dara.</Greeting>
          <Where>Product Designer · Ireland</Where>
        </div>
      </Byline>

      <Story>
        Most of what I make starts with something that annoyed me. A torn ACL became{" "}
        <Link to="/cruciate" onClick={onNavigate}>
          Cruciate
        </Link>
        . The difference in Guinness prices from pub to pub became{" "}
        <Link to="/pints-yurt" onClick={onNavigate}>
          Pints Yurt
        </Link>
        . A workout app behind a paywall became{" "}
        <Link to="/operation-avocado" onClick={onNavigate}>
          Operation Avocado
        </Link>
        . I design them, then build them myself.
      </Story>

      <Next>
        <span>What&apos;s next</span>
        <p>Looking for a product team where design and build sit close together.</p>
      </Next>

      <Contact>
        <CvButton href={CV_URL} target="_blank" rel="noopener noreferrer">
          <FiEye aria-hidden="true" />
          CV
          <span className="sr-only"> (PDF, opens in a new tab)</span>
        </CvButton>
        <Social href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          <SiLinkedin aria-hidden="true" />
          LinkedIn
          <span className="sr-only"> (opens in a new tab)</span>
        </Social>
        <CopyEmail />
      </Contact>
    </Card>
  );
}
