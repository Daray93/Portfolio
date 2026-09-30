import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { FiX } from "react-icons/fi";
import { dur, ease } from "../../styles/motion";

// Pictures in a case study, the same on every page:
//
//   <Figure src alt caption size="phone" />   a phone screenshot, capped at
//                                               a neat thumbnail width
//   <Figure src alt caption size="wide" />    a landscape image, the full
//                                               column
//   <Figure video src caption />              a looping, muted video, the
//                                               full column
//   <Figures columns={2|3}>…</Figures>        side by side: up to `columns`
//                                               across, two on phones
//                                               (`phoneColumns={1}` stacks
//                                               wide images instead)
//
// Clicking an image opens it large (Escape, the close button or a click
// outside closes it, and focus goes back to the image). Videos just play.

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  justify-items: center;
  align-items: start;
  gap: 1.5rem 1.25rem;
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: repeat(${({ $phoneColumns }) => $phoneColumns}, minmax(0, 1fr));
    gap: 1.25rem 0.75rem;
  }
`;

export function Figures({ columns = 2, phoneColumns = 2, children }) {
  return (
    <Row $columns={columns} $phoneColumns={phoneColumns}>
      {children}
    </Row>
  );
}

const Frame = styled.figure`
  display: grid;
  gap: 0.6rem;
  justify-items: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${({ $size }) => ($size === "phone" ? "220px" : "none")};
`;

const Zoom = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
  border-radius: ${({ $size, theme }) => ($size === "phone" ? theme.radius.lg : theme.radius.xl)};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.text};
    outline-offset: 4px;
  }
`;

const Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
  border-radius: ${({ $size, theme }) => ($size === "phone" ? theme.radius.lg : theme.radius.xl)};
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform ${dur.base}s ${ease.out};

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    ${Zoom}:hover & {
      transform: scale(1.015);
    }
  }
`;

const Video = styled.video`
  display: block;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.xl};
`;

const Caption = styled.figcaption`
  max-width: 60ch;
  font-size: 0.85rem;
  line-height: 1.45;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

// ---- the large view
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  padding: 3rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
`;

const Large = styled.img`
  max-width: min(92vw, 1200px);
  max-height: 86vh;
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Close = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

function Lightbox({ src, alt, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const was = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = was;
    };
  }, [onClose]);

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label={alt || "Image"} onClick={onClose}>
      <Close ref={closeRef} type="button" aria-label="Close" onClick={onClose}>
        <FiX aria-hidden="true" />
      </Close>
      <Large src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
    </Overlay>,
    document.body
  );
}

export default function Figure({ src, alt = "", caption, size = "phone", video = false }) {
  const [open, setOpen] = useState(false);
  const zoomRef = useRef(null);
  const close = useCallback(() => {
    setOpen(false);
    zoomRef.current?.focus();
  }, []);

  if (video) {
    return (
      <Frame $size="wide">
        <Video src={src} autoPlay loop muted playsInline aria-label={alt || undefined} />
        {caption && <Caption>{caption}</Caption>}
      </Frame>
    );
  }

  return (
    <Frame $size={size}>
      <Zoom
        ref={zoomRef}
        type="button"
        $size={size}
        onClick={() => setOpen(true)}
        aria-label={alt ? `View larger: ${alt}` : "View larger"}
      >
        <Img src={src} alt={alt} $size={size} loading="lazy" />
      </Zoom>
      {caption && <Caption>{caption}</Caption>}
      {open && <Lightbox src={src} alt={alt} onClose={close} />}
    </Frame>
  );
}
