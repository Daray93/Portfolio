import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import HomeIcon from "./Home.png";
import { FiLinkedin, FiMail, FiArrowLeft } from "react-icons/fi";

/* ---------------- Animations ---------------- */
const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
`;

/* ---------------- Desktop Nav ---------------- */
const DesktopNavWrapper = styled.div`
  position: fixed;
  top: 5rem;
  left: 5rem;
  bottom:5rem;
  width: 260px;
  height: fit-content;
  z-index: 1000;

  @media (max-width: 900px) {
    display: none;
  }
`;

const BackButton = styled.button`
  all: unset;
  cursor: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  font-family: "Manrope", sans-serif;
  color: ${({ theme }) => theme.textSecondary};
  border: 1px solid transparent;
  padding: 0.5rem 1rem;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => theme.cardBackground};
    color: ${({ theme }) => theme.text};
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.skeletonBase};
  }
`;

const List = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Item = styled.button`
  all: unset;
  cursor: none;
  font-weight: 400;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active, theme }) => ($active ? theme.text : "#90a1b9")};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 196px;

  &:hover {
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 900px) {
    width: auto;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    background: ${({ $active, theme }) =>
      $active ? theme.cardBackground : "transparent"};
    border: 1px solid
      ${({ $active, theme }) =>
        $active ? theme.skeletonBase : theme.skeletonBase + "80"};
    flex-shrink: 0;
  }
`;

const Track = styled.div`
  width: 100%;
  height: 1.5px;
  background: ${({ theme }) => theme.skeletonBase};
  border-radius: 2px;
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Fill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  transition: width 0.15s ease;
`;

/* ---------------- Mobile Nav ---------------- */
const MobileNavWrapper = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: block;
    position: fixed;
    top: env(safe-area-inset-top);
    left: 0;
    right: 0;
    z-index: 3000;
    background: ${({ theme }) => theme.body};
    padding: 0.75rem 0;
    overflow: hidden;
    font-family: "Space Grotesk", sans-serif;
  }
`;

const MobileListContainer = styled.div`
  position: relative;
`;

const MobileList = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  padding: 0 1rem 6px;
`;

const MobileProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: ${({ theme }) => theme.skeletonBase};
`;

const MobileProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  transition: width 0.15s linear;
`;

/* ---------------- FAB Buttons ---------------- */
const FabContainer = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%) translateY(${({ hidden }) =>
    hidden ? "120%" : "0"});
  display: flex;
  gap: 0.75rem;
  z-index: 3000;
  background: ${({ theme }) => theme.cardBackground};
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
  opacity: ${({ hidden }) => (hidden ? 0 : 1)};

  @media (min-width: 901px) {
    display: none;
  }
`;

const FabButton = styled.button`
  all: unset;
  cursor: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttonPrimaryBg};
  font-weight: 500;
  color: ${({ theme }) => theme.body};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    animation: ${float} 0.2s ease forwards;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }
`;

const IconFab = styled.a`
  all: unset;
  cursor: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.buttonSecondaryBorder};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  }

  &:active {
    animation: ${bounce} 0.15s ease;
  }

  img {
    width: 18px;
    height: 18px;
  }
`;

const HomeIconImg = styled.img`
  width: 18px;
  height: 18px;
`;

/* ---------------- Component ---------------- */
export default function CaseStudyNav({ sections, frameRef }) {
  const [activeId, setActiveId] = useState(null);
  const [sectionProgress, setSectionProgress] = useState({});
  const [pageProgress, setPageProgress] = useState(0);
  const [fabHidden, setFabHidden] = useState(false);
  const [leftOffset, setLeftOffset] = useState(0);

  const listRef = useRef(null);
  const itemRefs = useRef({});
  const snapTimeout = useRef(null);
  const lastScrollY = useRef(0);

  /* ---------- Update left offset for desktop nav ---------- */
  useEffect(() => {
    const updateOffset = () => {
      if (!frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      setLeftOffset(rect.left - 32); // 60px padding from content
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, [frameRef]);

  /* ---------- Hide FAB on scroll ---------- */
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY.current + 6) setFabHidden(true);
      else if (current < lastScrollY.current - 6) setFabHidden(false);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Page + Section Progress ---------- */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - vh;
      setPageProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);

      let current = null;
      const next = {};

      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const top = el.offsetTop;
        const height = el.offsetHeight;
        const progress = ((scrollY + vh - top) / height) * 100;
        next[s.id] = Math.min(100, Math.max(0, progress));
        if (scrollY + vh * 0.33 >= top && scrollY + vh * 0.33 <= top + height) {
          current = s.id;
        }
      });

      setSectionProgress(next);
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  /* ---------- Scroll to section ---------- */
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  };

  /* ---------- Auto-center mobile pill ---------- */
  useEffect(() => {
    if (!activeId || !itemRefs.current[activeId] || !listRef.current) return;
    const container = listRef.current;
    const item = itemRefs.current[activeId];
    const itemLeft = item.offsetLeft;
    const itemRight = itemLeft + item.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;
    if (itemLeft < viewLeft || itemRight > viewRight) {
      const target = item.offsetLeft - container.clientWidth / 2 + item.offsetWidth / 2;
      container.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [activeId]);

  /* ---------- Magnetic Snap Mobile ---------- */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      clearTimeout(snapTimeout.current);
      snapTimeout.current = setTimeout(() => snapToNearest(), 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const snapToNearest = () => {
    if (!listRef.current) return;
    const container = listRef.current;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closest = null;
    let dist = Infinity;

    Object.values(itemRefs.current).forEach((el) => {
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(elCenter - center);
      if (d < dist) {
        dist = d;
        closest = el;
      }
    });

    if (closest) {
      const target = closest.offsetLeft - container.clientWidth / 2 + closest.offsetWidth / 2;
      container.scrollTo({ left: target, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopNavWrapper style={{ left: `${leftOffset}px` }}>
        <BackButton onClick={() => (window.location.href = "/")}>
          <FiArrowLeft />
          Back
        </BackButton>

        <List>
          {sections.map((s, i) => (
            <Item
              key={s.id}
              ref={(el) => (itemRefs.current[s.id] = el)}
              $active={activeId === s.id}
              onClick={() => scrollTo(s.id)}
            >
              {`${String(i + 1).padStart(2, "0")}. ${s.label}`}
              <Track>
                <Fill $progress={activeId === s.id ? sectionProgress[s.id] || 0 : 0} />
              </Track>
            </Item>
          ))}
        </List>
      </DesktopNavWrapper>

      {/* Mobile / Tablet Nav */}
      <MobileNavWrapper>
        <MobileListContainer>
          <MobileList ref={listRef}>
            {sections.map((s, i) => (
              <Item
                key={s.id}
                ref={(el) => (itemRefs.current[s.id] = el)}
                $active={activeId === s.id}
                onClick={() => scrollTo(s.id)}
              >
                {`${String(i + 1).padStart(2, "0")}. ${s.label}`}
              </Item>
            ))}
          </MobileList>
          <MobileProgressBar>
            <MobileProgressFill style={{ width: `${pageProgress}%` }} />
          </MobileProgressBar>
        </MobileListContainer>
      </MobileNavWrapper>

      {/* FAB Buttons */}
      <FabContainer hidden={fabHidden}>
        <FabButton onClick={() => (window.location.href = "/")}>
          <HomeIconImg src={HomeIcon} alt="Home" />
          Home
        </FabButton>
        <IconFab
          href="https://www.linkedin.com/in/daraphillips01010/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiLinkedin />
        </IconFab>
        <IconFab href="mailto:daraphillips.design@gmail.com">
          <FiMail />
        </IconFab>
      </FabContainer>
    </>
  );
}