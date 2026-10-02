import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";
import { SiLinkedin } from "react-icons/si";
import CopyEmail from "./CopyEmail";
import { pill } from "./pill";
import { LINKEDIN_URL } from "../../data/contact";
import { ease, easeArr, dur } from "../../styles/motion";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
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
// The photo grows when it's hovered (or tapped, or pressed from the
// keyboard), so there's a face to see: the name drops from beside it to
// under it, and everything below slides down to make room.
//
// `as` sets the greeting's heading level (h1 on the page, h2 in the header);
// `onNavigate` lets the header close its card when a link in it is followed.

const CV_URL = "/Dara-Phillips_cv_2026.pdf";

const PHOTO = 72;
const PHOTO_BIG = 160;

// The card's own height follows its content, eased, so the surface around
// it grows with the photo instead of jumping to the new size.
const Frame = styled(motion.div)``;

// three groups, with more space between them than inside them: who I am
// (face, name, story), what's next, and how to reach me
const Card = styled.div`
  display: grid;
  gap: 28px;
  color: ${({ theme }) => theme.text};
`;

const Intro = styled.div`
  display: grid;
  gap: 18px;
`;

// the name beside the photo; under it once the photo is big
const Byline = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  &[data-big] {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// The photo's square. Hover is read from the square, not the circle in it,
// and it grows from its top left corner, so the pointer that opened it is
// still inside once it's big.
const Face = styled(motion.div)`
  flex: none;
  width: ${PHOTO}px;
  aspect-ratio: 1;

  &[data-big] {
    width: ${PHOTO_BIG}px;
  }
`;

const FaceButton = styled.button`
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: zoom-in;
  transition: none;

  &[aria-expanded="true"] {
    cursor: zoom-out;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 3px;
  }
`;

// already a circle on a warm light background; the disc behind it only
// shows while it loads
const Portrait = styled.img`
  display: block;
  width: 100%;
  height: 100%;
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
  margin: 4px 0 0;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.textTertiary};
`;

const Story = styled(motion.p)`
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

// what I'm looking for: a small label over a plain line, in a panel of its
// own so it reads apart from the story above and the buttons below
const Next = styled(motion.div)`
  display: grid;
  gap: 6px;
  padding: 16px 20px;
  border-radius: 16px;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.border};

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
const Contact = styled(motion.div)`
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
      background-color ${dur.fast}s ${ease.out},
      scale ${dur.fast}s ${ease.out};
  }

  &&&:hover {
    color: ${({ theme }) => theme.linkedin};
  }

  /* the pill's quick press, which the transition above would slow */
  &&&:active {
    transition-duration: 0.1s;
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
  const { reduced } = useMotionPreference();
  const [big, setBig] = useState(false);
  // a mouse opens the photo by hovering, so its click does nothing; a tap
  // or the keyboard toggles it
  const byMouse = useRef(false);

  // the card's height, measured, for Frame to ease towards
  const card = useRef(null);
  const [height, setHeight] = useState("auto");
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      // nothing to measure while the header's card isn't laid out (phones)
      setHeight(card.current.offsetHeight || "auto");
    });
    observer.observe(card.current);
    return () => observer.disconnect();
  }, []);

  const morph = reduced ? { duration: 0 } : { duration: dur.base, ease: easeArr.out };
  // moved to its new place, never stretched on the way
  const slide = { layout: "position", transition: morph };

  return (
    <Frame initial={false} animate={{ height }} transition={morph}>
      <Card ref={card}>
        <Intro>
          <Byline data-big={big ? "" : undefined}>
            <Face
              layout
              transition={morph}
              data-big={big ? "" : undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && setBig(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setBig(false)}
              onPointerDown={(e) => {
                byMouse.current = e.pointerType === "mouse";
              }}
            >
              <FaceButton
                type="button"
                aria-label={big ? "Shrink photo" : "Enlarge photo"}
                aria-expanded={big}
                onClick={(e) => {
                  // detail 0: pressed from the keyboard
                  if (e.detail === 0 || !byMouse.current) setBig((b) => !b);
                }}
              >
                <Portrait src={portrait} draggable={false} alt="" />
              </FaceButton>
            </Face>
            <motion.div {...slide}>
              <Greeting as={as}>Hi, I&apos;m Dara.</Greeting>
              <Where>Product Designer · Ireland</Where>
            </motion.div>
          </Byline>

          <Story {...slide}>
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
        </Intro>

        <Next {...slide}>
          <span>What&apos;s next</span>
          <p>Looking for a product team where design and build sit close together.</p>
        </Next>

        <Contact {...slide}>
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
    </Frame>
  );
}
