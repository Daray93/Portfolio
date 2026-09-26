import { useEffect, useRef } from "react";
import styled from "styled-components";

// What fills a project's card -- also what the card transition scales up
// (see ExpandTransition) and the case study cover shows, so all three always
// show the same thing. An image can carry a `mobileSrc` for phones, where
// cards are portrait and a landscape screenshot crops badly.
//
// onReady fires once there's something real to show -- the image decoded,
// or the video showing a frame -- so the transition never reveals a blank
// box. startTime seeks a video to a given moment first (to match the card
// it's taking over from).

export const PHONE_QUERY = "(max-width: 640px)";

// Bleeds a pixel past its container on every side: a card clips it anyway,
// and it means no sub-pixel gap at the edges while the card scales.
const Fill = styled.div`
  position: absolute;
  inset: -1px;
  overflow: hidden;
  background: ${({ $panel }) => $panel || "#111"};

  picture {
    display: contents;
  }

  img,
  video {
    width: 100%;
    height: 100%;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
  }
`;

const Cover = styled.img`
  object-fit: cover;
  object-position: ${({ $position }) => $position || "center"};
`;

const CoverVideo = styled.video`
  object-fit: cover;
`;

const Logo = styled.img`
  object-fit: contain;
  /* sized off the shorter side so a logo reads the same in a card and
     grown to full screen */
  padding: clamp(24px, 14%, 180px);
`;

export default function ProjectMedia({ project, className, onReady, startTime }) {
  const { media, panel } = project;
  const fillRef = useRef(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const el = fillRef.current?.querySelector("img, video");
    if (!el || !readyRef.current) return undefined;
    let cancelled = false;
    const ready = () => !cancelled && readyRef.current?.();

    if (el.tagName === "VIDEO") {
      const showing = () => {
        if (typeof startTime === "number" && Math.abs(el.currentTime - startTime) > 0.05) {
          el.addEventListener("seeked", ready, { once: true });
          el.currentTime = startTime;
        } else {
          ready();
        }
      };
      if (el.readyState >= 2) showing();
      else el.addEventListener("loadeddata", showing, { once: true });
      return () => {
        cancelled = true;
        el.removeEventListener("loadeddata", showing);
        el.removeEventListener("seeked", ready);
      };
    }

    const decoded = () => (el.decode ? el.decode().catch(() => {}) : Promise.resolve()).then(ready);
    if (el.complete && el.naturalWidth) decoded();
    else el.addEventListener("load", decoded, { once: true });
    return () => {
      cancelled = true;
      el.removeEventListener("load", decoded);
    };
  }, [startTime]);

  return (
    <Fill ref={fillRef} className={className} $panel={panel}>
      {media.type === "video" ? (
        <CoverVideo src={media.src} autoPlay loop muted playsInline draggable={false} />
      ) : media.type === "logo" ? (
        <Logo src={media.src} alt="" draggable={false} data-fit="contain" />
      ) : (
        <picture>
          {media.mobileSrc && <source media={PHONE_QUERY} srcSet={media.mobileSrc} />}
          <Cover src={media.src} alt="" draggable={false} $position={media.position} />
        </picture>
      )}
    </Fill>
  );
}
