import { useEffect, useRef } from "react";
import styled from "styled-components";
import AvocadoJumpingJack from "../../case-studies/operation-avocado/AvocadoJumpingJack";

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

  > picture {
    display: contents;
  }

  /* the card's own picture fills it -- only that one: anything nested (the
     avocado's limbs, a device's screen) sizes itself */
  > img,
  > video,
  > picture > img {
    width: 100%;
    height: 100%;
    display: block;
  }

  img,
  video {
    user-select: none;
    -webkit-user-drag: none;
  }
`;

// `fit: "contain"` shows the whole picture inside the card (on its panel
// colour, with a little room) -- for a composition like a fan of phones
// that cropping would cut into. `mobileFit` can differ on phones, where the
// card is tall and a crop to the middle often frames it better.
const Cover = styled.img`
  object-fit: ${({ $fit }) => $fit};
  object-position: ${({ $position }) => $position || "center"};
  padding: ${({ $fit }) => ($fit === "contain" ? "4%" : "0")};
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

// A screenshot or screen recording shown on a device, centred on the panel
// colour -- a landscape tablet (4:3) or a desktop monitor (16:10 on a
// stand). Drawn in CSS, so it stays sharp at any size, a card or grown to
// full screen. The stage is a size container, so the device is as big as
// fits either way (cqw/cqh); the screenshot or recording fills its screen,
// anchored to the top (a web page reads from its header down).
const DEVICES = {
  // width / total height (the monitor's includes its stand)
  tablet: { ratio: 4 / 3 },
  desktop: { ratio: 1.36 },
};

const DeviceStage = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 9%;
  container-type: size;
`;

// what's on the screen, a picture or a recording
const screenFill = `
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  background: #000;
`;

const Tablet = styled.div`
  --w: min(100cqw, calc(100cqh * ${DEVICES.tablet.ratio}));
  position: relative;
  width: var(--w);
  aspect-ratio: 4 / 3;
  padding: calc(var(--w) * 0.028);
  border-radius: calc(var(--w) * 0.055);
  background: #0c0c0e;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    inset 0 0 0 calc(var(--w) * 0.006) #2a2a2e,
    0 calc(var(--w) * 0.03) calc(var(--w) * 0.09) rgba(0, 0, 0, 0.45);

  /* the front camera, centred on the left bezel */
  &::before {
    content: "";
    position: absolute;
    left: calc(var(--w) * 0.012);
    top: 50%;
    width: calc(var(--w) * 0.006);
    aspect-ratio: 1;
    border-radius: 50%;
    background: #1f2a33;
    transform: translateY(-50%);
  }

  img,
  video {
    ${screenFill}
    border-radius: calc(var(--w) * 0.03);
  }
`;

// a slim monitor: thin even bezels, a camera dot, then a neck and foot
const Desktop = styled.div`
  --w: min(100cqw, calc(100cqh * ${DEVICES.desktop.ratio}));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--w);
`;

const Monitor = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  padding: calc(var(--w) * 0.014);
  border-radius: calc(var(--w) * 0.018);
  background: #0c0c0e;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.14),
    0 calc(var(--w) * 0.03) calc(var(--w) * 0.08) rgba(0, 0, 0, 0.4);

  /* the camera, centred on the top bezel */
  &::before {
    content: "";
    position: absolute;
    top: calc(var(--w) * 0.006);
    left: 50%;
    width: calc(var(--w) * 0.004);
    aspect-ratio: 1;
    border-radius: 50%;
    background: #1f2a33;
    transform: translateX(-50%);
  }

  img,
  video {
    ${screenFill}
    border-radius: calc(var(--w) * 0.006);
  }
`;

const Neck = styled.div`
  width: calc(var(--w) * 0.14);
  height: calc(var(--w) * 0.085);
  background: linear-gradient(to bottom, #3a3a3f, #bdbdc2 30%, #d8d8dc 60%, #a9a9ae);
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);
`;

const Foot = styled.div`
  width: calc(var(--w) * 0.3);
  height: calc(var(--w) * 0.012);
  border-radius: calc(var(--w) * 0.004) calc(var(--w) * 0.004) calc(var(--w) * 0.008) calc(var(--w) * 0.008);
  background: linear-gradient(to bottom, #e2e2e6, #9d9da2);
  box-shadow: 0 calc(var(--w) * 0.01) calc(var(--w) * 0.03) rgba(0, 0, 0, 0.3);
`;

const isVideo = (src) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

// Two screenshots of the same page -- light and dark -- split on a diagonal:
// the second shows to the right of the line. The layouts match pixel for
// pixel, so the line runs straight through the page.
const Split = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;

  img + img {
    position: absolute;
    inset: 0;
    clip-path: polygon(62% 0, 100% 0, 100% 100%, 38% 100%);
  }
`;

function Screen({ src, split }) {
  if (split) {
    return (
      <Split>
        <img src={src} alt="" draggable={false} />
        <img src={split} alt="" draggable={false} />
      </Split>
    );
  }
  return isVideo(src) ? (
    <video src={src} autoPlay loop muted playsInline draggable={false} />
  ) : (
    <img src={src} alt="" draggable={false} />
  );
}

function Device({ type, src, split }) {
  return (
    <DeviceStage>
      {type === "desktop" ? (
        <Desktop>
          <Monitor>
            <Screen src={src} split={split} />
          </Monitor>
          <Neck />
          <Foot />
        </Desktop>
      ) : (
        <Tablet>
          <Screen src={src} split={split} />
        </Tablet>
      )}
    </DeviceStage>
  );
}

// The avocado rig is drawn for a square stage -- its size, the shadow under
// its feet and the timer are all percentages of a square -- so on a card of
// any shape it gets a square of its own, as big as fits, centred on its
// green.
const AvocadoStage = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: #7bae45;
  container-type: size;

  > div {
    width: min(100cqw, 100cqh);
    height: min(100cqw, 100cqh);
  }
`;

// No image yet: the name set large on the panel colour, as a placeholder
// that still reads as designed. Sized off the card's width (a container
// query) so it scales with the card, including grown to full screen.
const Wordmark = styled.span`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 12%;
  container-type: inline-size;
  color: ${({ $ink }) => $ink || "#f4f4f4"};

  > span {
    font-size: clamp(1.25rem, 9cqi, 4.5rem);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1;
    text-align: center;
    text-wrap: balance;
  }
`;

export default function ProjectMedia({ project, className, onReady, startTime }) {
  const { media, panel } = project;
  // how the picture sits in the card (see Cover)
  const phone = typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
  const fit = (phone && media.mobileFit) || media.fit || "cover";
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
      ) : media.type === "avocado" ? (
        // the live avocado: blinks, watches the cursor, jumps on hover
        <AvocadoStage>
          <div>
            <AvocadoJumpingJack fill showTimer={false} handoff={false} rigScale={0.9} />
          </div>
        </AvocadoStage>
      ) : media.type === "tablet" || media.type === "desktop" ? (
        <Device type={media.type} src={media.src} split={media.split} />
      ) : media.type === "wordmark" ? (
        <Wordmark $ink={media.ink} aria-hidden="true">
          <span>{project.title}</span>
        </Wordmark>
      ) : media.type === "logo" ? (
        <Logo src={media.src} alt="" draggable={false} data-fit="contain" />
      ) : (
        <picture>
          {media.mobileSrc && <source media={PHONE_QUERY} srcSet={media.mobileSrc} />}
          <Cover
            src={media.src}
            alt=""
            draggable={false}
            $position={media.position}
            $fit={fit}
            data-fit={fit === "contain" ? "contain" : undefined}
          />
        </picture>
      )}
    </Fill>
  );
}
