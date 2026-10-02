import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { SiLinkedin } from "react-icons/si";
import RollText from "../shared/RollText";
import { ease, dur } from "../../styles/motion";
import { LINKEDIN_URL } from "../../data/contact";
import CopyEmail from "./CopyEmail";
import { pill } from "./pill";

// Full-screen navigation behind the header's menu button, on phones and
// tablets (desktop has the header's pill nav instead, and About under the
// logo): three big links centred, email and LinkedIn below. Motion follows the visitor's system
// "reduce motion" setting, so there's no switch for it here.

const Panel = styled.div`
  position: fixed;
  inset: 0;
  z-index: 900;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 32px;
  /* the header's side margins; the bottom matches the homepage footer */
  padding: 136px 88px 56px;
  overflow-y: auto;
  /* frosted: the page shows through as blurred colour, under a tint deep
     enough that the links keep their contrast whatever card is behind */
  background: ${({ theme }) => (theme.mode === "dark" ? "rgba(8, 8, 8, 0.78)" : "rgba(242, 240, 234, 0.86)")};
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);

  /* no backdrop blur (older browsers): fall back to the solid cover */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: ${({ theme }) => (theme.mode === "dark" ? "rgba(8, 8, 8, 0.94)" : "rgba(242, 240, 234, 0.96)")};
  }
  color: ${({ theme }) => theme.text};
  /* a quick fade in place, no movement */
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition:
    opacity ${dur.fast * 0.8}s ${ease.out},
    visibility 0s linear ${({ $open }) => ($open ? "0s" : `${dur.fast * 0.8}s`)};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 1024px) {
    padding: 104px 40px 24px;
  }

  @media (max-width: 640px) {
    padding: 88px 24px 20px;
  }

  @media (max-height: 520px) and (orientation: landscape) {
    gap: 16px;
    padding: 56px 24px 12px;
  }
`;

const Nav = styled.nav`
  align-self: center;
`;

// the gap scales with the screen's height too, so the three links breathe
// on a tall phone and still fit on one turned sideways
const Links = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 5svh, 48px);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li``;

const BigLink = styled(Link)`
  display: inline-block;
  /* scales with height too, so all three links fit a phone on its side */
  font-size: clamp(2.5rem, min(9vw, 11svh), 6.5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.05;
  /* the other pages in the secondary text colour (AA and then some on the
     tinted panel); the current one full strength (and aria-current for
     screen readers) */
  color: ${({ theme, $current }) => ($current ? theme.text : theme.textSecondary)};
  transition: color ${dur.fast}s ${ease.out};

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 6px;
    border-radius: 6px;
  }
`;

// Email and LinkedIn as a matching pair of pill buttons, centred under the
// links: side by side where there's room, stacked full width on phones
// (the address is too long to share a row there).
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;

  > button,
  > a {
    ${pill}
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// LinkedIn blue on hover, text and icon together (the icon follows the
// text colour). Tripled to outrank the pill's own hover colour
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

const LINKS = [
  { to: "/", label: "Case studies" },
  { to: "/websites", label: "Websites" },
  { to: "/about-me", label: "About" },
];

// email and LinkedIn, in whichever row the layout needs
function ContactLinks({ as }) {
  const Wrap = as;
  return (
    <Wrap>
      <CopyEmail />
      <Social href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
        <SiLinkedin aria-hidden="true" />
        <RollText>LinkedIn</RollText>
        <span className="sr-only"> (opens in a new tab)</span>
      </Social>
    </Wrap>
  );
}

// `current` marks a page as current when the URL isn't one of the three
// (a case study belongs to Case studies)
export default function SiteMenu({ open, onClose, current }) {
  const { pathname } = useLocation();
  const here = current ?? pathname;
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    firstLinkRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <Panel id="site-menu" $open={open} inert={!open}>
        <Nav aria-label="Main">
          <Links>
            {LINKS.map((l, i) => (
              <Item key={l.to}>
                <BigLink
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={l.to}
                  onClick={onClose}
                  $current={here === l.to}
                  aria-current={here === l.to ? "page" : undefined}
                >
                  {l.label}
                </BigLink>
              </Item>
            ))}
          </Links>
        </Nav>
        <ContactLinks as={Row} />
    </Panel>
  );
}
