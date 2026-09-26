import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { SiLinkedin } from "react-icons/si";
import RollText from "../shared/RollText";
import { ease, dur, stagger } from "../../styles/motion";
import { LINKEDIN_URL } from "../../data/contact";
import CopyEmail from "./CopyEmail";

// Full-screen navigation behind the header's menu button. Motion follows the
// visitor's system "reduce motion" setting, so there's no switch for it here.

const Panel = styled.div`
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(32px, 6vh, 64px);
  padding: 96px 16px 48px;
  overflow-y: auto;
  background: ${({ theme }) => (theme.mode === "dark" ? "rgba(8, 8, 8, 0.94)" : "rgba(242, 240, 234, 0.96)")};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: ${({ theme }) => theme.text};
  clip-path: inset(0 0 ${({ $open }) => ($open ? "0" : "100%")} 0);
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition:
    clip-path ${dur.slow}s ${ease.inOut} ${({ $open }) => ($open ? "0s" : `${dur.fast * 0.6}s`)},
    visibility 0s linear ${({ $open }) => ($open ? "0s" : `${dur.slow + dur.fast}s`)};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-height: 520px) and (orientation: landscape) {
    justify-content: flex-start;
    gap: 20px;
    padding: 64px 24px 24px;
  }
`;

const Links = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
`;

const Item = styled.li`
  overflow: hidden;

  & + & {
    margin-top: 8px;
  }
`;

const BigLink = styled(Link)`
  display: inline-block;
  /* scales with height too, so all three links fit a phone on its side */
  font-size: clamp(2.25rem, min(8vw, 10svh), 5.5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: ${({ theme, $current }) => ($current ? theme.text : theme.textTertiary)};
  transform: translateY(${({ $open }) => ($open ? "0" : "105%")});
  transition:
    transform ${({ $open }) => ($open ? `${dur.slow}s ${ease.out}` : `${dur.fast}s ${ease.inOut}`)}
      ${({ $open, $i }) => ($open ? `${dur.fast + $i * stagger}s` : "0s")},
    color ${dur.fast}s ${ease.out};

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.text};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: color ${dur.fast}s ${ease.out};
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 28px;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: opacity ${({ $open }) => ($open ? `${dur.base}s ${ease.out} ${dur.fast + 3 * stagger}s` : `${dur.fast * 0.6}s ${ease.out} 0s`)};
`;

const Social = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 400;
  color: ${({ theme }) => theme.textSecondary};

  &:hover {
    color: ${({ theme }) => theme.linkedin};
  }
`;

export default function SiteMenu({ open, onClose }) {
  const { pathname } = useLocation();
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    firstLinkRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const links = [
    { to: "/", label: "Case studies" },
    { to: "/about-me", label: "About" },
    { to: "/websites", label: "Websites" },
  ];

  return (
    <Panel id="site-menu" $open={open} inert={!open}>
      <nav aria-label="Main">
        <Links>
          {links.map((l, i) => (
            <Item key={l.to}>
              <BigLink
                ref={i === 0 ? firstLinkRef : undefined}
                to={l.to}
                onClick={onClose}
                $open={open}
                $i={i}
                $current={pathname === l.to}
                aria-current={pathname === l.to ? "page" : undefined}
              >
                {l.label}
              </BigLink>
            </Item>
          ))}
        </Links>
      </nav>

      <Row $open={open}>
        <CopyEmail />
        <Social href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          <SiLinkedin aria-hidden="true" />
          <RollText>LinkedIn</RollText>
          <span className="sr-only"> (opens in a new tab)</span>
        </Social>
      </Row>
    </Panel>
  );
}
