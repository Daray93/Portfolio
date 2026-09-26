import { useState } from "react";
import styled from "styled-components";
import { FiArrowUpRight } from "react-icons/fi";
import SiteHeader from "../components/chrome/SiteHeader";
import SiteMenu from "../components/chrome/SiteMenu";
import websites from "../data/websites";
import { ease, dur } from "../styles/motion";

// Live sites built for clients: a plain list, each row opening the site in a
// new tab. The list itself lives in src/data/websites.js.

const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  padding: 160px 88px 96px;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};

  @media (max-width: 1024px) {
    padding: 128px 40px 72px;
  }

  @media (max-width: 640px) {
    padding: 104px 16px 56px;
  }
`;

const Heading = styled.h1`
  margin: 0 0 clamp(40px, 7vh, 72px);
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const Row = styled.a`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  align-items: baseline;
  gap: 8px 32px;
  padding: 28px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  color: inherit;
  font-weight: 400;

  &:hover {
    color: inherit;
  }

  svg {
    align-self: center;
    width: 22px;
    height: 22px;
    transition: transform ${dur.base}s ${ease.out};
  }

  &:hover svg,
  &:focus-visible svg {
    transform: translate(3px, -3px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 4px;
  }

  @media (max-width: 760px) {
    grid-template-columns: minmax(0, 1fr) auto;

    svg {
      grid-row: 1;
      grid-column: 2;
    }
  }
`;

const Name = styled.span`
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 500;
  letter-spacing: -0.02em;
`;

const What = styled.span`
  color: ${({ theme }) => theme.textSecondary};

  @media (max-width: 760px) {
    grid-column: 1 / -1;
  }
`;

export default function Websites() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SiteHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((o) => !o)} />
      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Page inert={menuOpen}>
        <Heading>Websites</Heading>
        <List>
          {websites.map((site) => (
            <li key={site.url}>
              <Row href={site.url} target="_blank" rel="noopener noreferrer">
                <Name>
                  {site.name}
                  {site.year && ` · ${site.year}`}
                </Name>
                <What>{site.what}</What>
                <FiArrowUpRight aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </Row>
            </li>
          ))}
        </List>
      </Page>
    </>
  );
}
