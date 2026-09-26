import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import ProjectMedia from "./ProjectMedia";
import projects from "../../data/projects";
import { easeArr, dur } from "../../styles/motion";
import { coverFrame } from "./coverFrame";
import { lightTheme } from "../../styles/theme";

// Card <-> page transitions, both directions.
//
// Opening: the card scales up into a large framed card -- inset from the
// screen edges, corners still rounded (see coverFrame) -- while the page
// behind it settles from the dark carousel to the case study's light page
// background. It's a copy of the media sized to that final frame,
// clipped to the card's exact box and corners, with the media scaled and
// placed so the first frame matches the card pixel for pixel. The route
// changes underneath and the copy hands off to the case study's cover (see
// ProjectCover), which is that same frame.
//
// Coming back plays it in reverse, into the card.
//
// Nothing is ever revealed before it's ready, so nothing flashes:
//   prep     the copy sits invisibly over the card (which looks the same)
//            until its image has decoded / its video shows the card's frame
//   grow     it appears and scales up to the frame
//   arrive   the route has changed; wait for the cover's media to be ready
//            (its video synced to the copy's frame)
//   handoff  the copy and the page-colour layer clear over the real cover
//   leave    on the way back from the cover (pulled back, or "All work"): a
//            copy sits invisibly over the cover -- at whatever size the pull
//            left it -- until its media is ready, then the route changes
//   hold     the frame is up from the homepage's very first paint (also after
//            the browser's back button), until the homepage has measured the
//            card
//   shrink   the frame shrinks into the card
//
// Only a clip, transforms and opacity animate, never layout. Lives above the
// routes (see App.jsx) so it outlives the page that started it.

// long and heavy: slow to leave the card, slow to arrive at the frame
const EASE = [0.7, 0, 0.2, 1];
const OPEN_S = 1.05;
const HANDOFF_S = dur.fast * 1.4;
const CLOSE_S = 0.95;

// the longest each waiting phase may hold before moving on regardless
const WAIT_MS = { prep: 300, arrive: 900, leave: 300, hold: 1500 };

// Which project was opened from the carousel. Set on opening; read when
// the homepage comes back into view to decide whether to play the way back.
export const RETURN_KEY = "expanded-project";
// the carousel's remembered card (read by the homepage on arrival)
export const SLIDE_KEY = "showcase-slide";

const ExpandContext = createContext(null);

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 5000;
  overflow: hidden;
  pointer-events: none;
  will-change: clip-path;
`;

// the media, sized to the final frame (its inset is set from coverFrame)
const Media = styled(motion.div)`
  position: absolute;
  transform-origin: 50% 50%;
  will-change: transform;
`;

// The page background, behind the card while it's out of the carousel.
// Always the case study's light page, never the current theme: the theme
// follows the route, which changes mid-transition. Opening, it fades in over
// the dark homepage and hands off to the cover's identical page; coming
// back, it takes over from that page and fades out to the homepage.
const Curtain = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 4999;
  pointer-events: none;
  background: ${lightTheme.body};
`;

const OPEN_MEDIA = { x: 0, y: 0, scale: 1 };

// the frame the card opens into
function frameOnly() {
  const { inset, radius } = coverFrame();
  const openClip = `inset(${inset}px ${inset}px ${inset}px ${inset}px round ${radius}px)`;
  return { inset, openClip, clip: openClip, media: OPEN_MEDIA, startClip: openClip, startMedia: OPEN_MEDIA };
}

// The frame as the cover left it -- possibly scaled down by a pull -- so
// the way back starts exactly there. The cover's frame scales about its
// centre, so its media does too.
function fromCover({ rect, radius, videoTime }) {
  const { inset } = coverFrame();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clip = `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round ${radius}px)`;
  const media = {
    x: rect.left + rect.width / 2 - vw / 2,
    y: rect.top + rect.height / 2 - vh / 2,
    scale: rect.width / (vw - 2 * inset),
  };
  return { inset, clip, media, startClip: clip, startMedia: media, videoTime };
}

// The clip and media transform that make the framed copy look exactly like
// the card. The clip is the card's own box and corners. The media is
// measured from the card's image box (it runs a little past the card, for
// the side-card blur): cover-fitted media shows the image at
// max(boxW/imgW, boxH/imgH) there and max(frameW/imgW, frameH/imgH) in the
// frame, and the ratio of the two is the starting scale.
function framing(cardEl) {
  const card = cardEl.getBoundingClientRect();
  const box = (cardEl.firstElementChild ?? cardEl).getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const radius = parseFloat(getComputedStyle(cardEl).borderRadius) || 20;
  const frame = frameOnly();
  const fw = vw - 2 * frame.inset;
  const fh = vh - 2 * frame.inset;

  const el = cardEl.querySelector("img, video");
  const iw = el?.naturalWidth || el?.videoWidth || 0;
  const ih = el?.naturalHeight || el?.videoHeight || 0;
  const cover = el && el.dataset.fit !== "contain" && iw && ih;
  const scale = cover
    ? Math.max(box.width / iw, box.height / ih) / Math.max(fw / iw, fh / ih)
    : Math.max(box.width / fw, box.height / fh);

  return {
    ...frame,
    clip: `inset(${card.top}px ${vw - card.right}px ${vh - card.bottom}px ${card.left}px round ${radius}px)`,
    media: {
      x: box.left + box.width / 2 - vw / 2,
      y: box.top + box.height / 2 - vh / 2,
      scale,
    },
    videoTime: el?.tagName === "VIDEO" ? el.currentTime : undefined,
  };
}

function readReturn() {
  try {
    return sessionStorage.getItem(RETURN_KEY);
  } catch {
    return null;
  }
}

function clearReturn() {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // storage blocked -- nothing was stored either
  }
}

export function ExpandTransitionProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { reduced } = useMotionPreference();
  // null | { project, from, phase, onDone?, coverTime? }
  const [active, setActive] = useState(null);
  const activeRef = useRef(null);
  activeRef.current = active;
  const overlayRef = useRef(null);

  const toPhase = useCallback((from, to, extra) => {
    setActive((a) => (a && a.phase === from ? { ...a, ...extra, phase: to } : a));
  }, []);

  // ---- opening
  const expand = useCallback(
    (project, cardEl) => {
      try {
        sessionStorage.setItem(RETURN_KEY, project.id);
      } catch {
        // storage blocked -- there just won't be a way-back animation
      }
      if (reduced || !cardEl) {
        navigate(project.to);
        return;
      }
      setActive({ project, from: framing(cardEl), phase: "prep" });
    },
    [navigate, reduced]
  );

  // the copy's media is ready to be seen: show it and start scaling
  const onCopyReady = useCallback(() => toPhase("prep", "grow"), [toPhase]);

  // the cover's media is ready: clear the copy over it
  const coverReady = useCallback(() => toPhase("arrive", "handoff"), [toPhase]);

  // ---- the way back, started from the cover (see ProjectCover)
  const returnFrom = useCallback(
    (project, snapshot) => {
      try {
        sessionStorage.setItem(RETURN_KEY, project.id);
        const i = projects.findIndex((p) => p.id === project.id);
        if (i >= 0) sessionStorage.setItem(SLIDE_KEY, String(i));
      } catch {
        // storage blocked -- the homepage just won't play the way back
      }
      if (reduced || !snapshot) {
        navigate("/");
        return;
      }
      setActive({ project, from: fromCover(snapshot), phase: "leave" });
    },
    [navigate, reduced]
  );

  // the copy over the cover is ready: take over from it and go home
  const commitReturn = useCallback(() => {
    if (activeRef.current?.phase !== "leave") return;
    toPhase("leave", "hold");
    navigate("/");
  }, [navigate, toPhase]);

  // ---- the way back: cover the homepage from its very first paint
  const prevPath = useRef(null);
  useLayoutEffect(() => {
    const came = prevPath.current;
    prevPath.current = pathname;
    if (pathname !== "/" || came === "/") return;
    const id = readReturn();
    clearReturn();
    // already covered -- started from the cover itself
    if (activeRef.current?.phase === "hold") return;
    const project = id && projects.find((p) => p.id === id);
    if (!project || reduced) return;
    setActive({ project, from: frameOnly(), phase: "hold" });
  }, [pathname, reduced]);

  // Returns false when there's nothing to play (reduced motion), so the
  // caller shows its card straight away.
  const collapse = useCallback(
    (project, cardEl, onDone) => {
      if (reduced || !cardEl) {
        setActive(null);
        return false;
      }
      setActive({ project, from: framing(cardEl), phase: "shrink", onDone });
      return true;
    },
    [reduced]
  );

  // ---- phase endings
  const finishedRef = useRef(null);
  const onComplete = () => {
    const a = activeRef.current;
    if (!a || finishedRef.current === a) return;
    if (a.phase === "grow") {
      finishedRef.current = a;
      const video = overlayRef.current?.querySelector("video");
      navigate(a.project.to);
      toPhase("grow", "arrive", { coverTime: video ? video.currentTime : undefined });
    } else if (a.phase === "handoff" || a.phase === "shrink") {
      finishedRef.current = a;
      a.onDone?.();
      setActive(null);
    }
  };
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  // safety timers: every phase moves on in time even if a "ready" or
  // "complete" signal never arrives, so the overlay can't be left up
  useEffect(() => {
    if (!active) return undefined;
    const { phase } = active;
    let t;
    if (phase === "prep") t = setTimeout(() => toPhase("prep", "grow"), WAIT_MS.prep);
    else if (phase === "arrive") t = setTimeout(() => toPhase("arrive", "handoff"), WAIT_MS.arrive);
    else if (phase === "leave") t = setTimeout(commitReturn, WAIT_MS.leave);
    else if (phase === "hold") t = setTimeout(() => toPhase("hold", "shrink"), WAIT_MS.hold);
    else {
      const lengthS = { grow: OPEN_S, handoff: HANDOFF_S, shrink: CLOSE_S }[phase];
      t = setTimeout(() => completeRef.current(), (lengthS + 0.5) * 1000);
    }
    return () => clearTimeout(t);
  }, [active, toPhase, commitReturn]);

  // ---- what each phase looks like
  const opening = active && ["prep", "grow", "arrive", "handoff"].includes(active.phase);
  let overlay = null;
  let media = null;
  let curtain = null;

  if (active && opening) {
    const { from, phase } = active;
    const shown = phase !== "prep";
    const cleared = phase === "handoff";
    overlay = {
      initial: { clipPath: from.clip, opacity: 0 },
      animate: {
        clipPath: phase === "prep" ? from.clip : from.openClip,
        opacity: shown && !cleared ? 1 : 0,
      },
      transition: {
        clipPath: { duration: OPEN_S, ease: EASE },
        // appears in a single frame (the card beneath looks the same); clears
        // gently at the handoff
        opacity: cleared ? { duration: HANDOFF_S, ease: easeArr.out } : { duration: 0 },
      },
    };
    media = {
      initial: from.media,
      animate: phase === "prep" ? from.media : OPEN_MEDIA,
      transition: { duration: OPEN_S, ease: EASE },
    };
    curtain = {
      initial: { opacity: 0 },
      animate: { opacity: phase === "prep" || cleared ? 0 : 1 },
      transition: cleared ? { duration: HANDOFF_S, ease: easeArr.out } : { duration: OPEN_S * 0.9, ease: EASE },
    };
  } else if (active) {
    const { from, phase } = active;
    const back = phase === "shrink";
    const leaving = phase === "leave";
    overlay = {
      initial: { clipPath: from.startClip, opacity: leaving ? 0 : 1 },
      animate: { clipPath: back ? from.clip : from.startClip, opacity: leaving ? 0 : 1 },
      transition: { clipPath: { duration: CLOSE_S, ease: EASE }, opacity: { duration: 0 } },
    };
    media = {
      initial: from.startMedia,
      animate: back ? from.media : from.startMedia,
      transition: { duration: CLOSE_S, ease: EASE },
    };
    // the page colour takes over from the cover's own (identical) page in a
    // single frame, then the homepage's colour field comes back as the card
    // returns
    curtain = {
      initial: { opacity: leaving ? 0 : 1 },
      animate: { opacity: back || leaving ? 0 : 1 },
      transition: back ? { duration: CLOSE_S * 0.9, ease: EASE } : { duration: 0 },
    };
  }

  const value = useMemo(
    () => ({
      expand,
      collapse,
      coverReady,
      returnFrom,
      // where the cover's video should start, to match the copy
      coverStartTime: active?.phase === "arrive" ? active.coverTime : undefined,
      // the carousel steps back while a card is on its way out
      leavingId: active && ["prep", "grow"].includes(active.phase) ? active.project.id : null,
    }),
    [expand, collapse, coverReady, returnFrom, active]
  );

  const key = opening ? "open" : "return";

  return (
    <ExpandContext.Provider value={value}>
      {children}
      {active &&
        createPortal(
          <>
            <Curtain key={`curtain-${key}`} aria-hidden="true" {...curtain} />
            <Overlay
              key={`overlay-${key}`}
              ref={overlayRef}
              aria-hidden="true"
              {...overlay}
              onAnimationComplete={() => completeRef.current()}
            >
              <Media
                {...media}
                style={{
                  top: active.from.inset,
                  right: active.from.inset,
                  bottom: active.from.inset,
                  left: active.from.inset,
                }}
              >
                <ProjectMedia
                  project={active.project}
                  startTime={active.from.videoTime}
                  onReady={opening ? onCopyReady : active.phase === "leave" ? commitReturn : undefined}
                />
              </Media>
            </Overlay>
          </>,
          document.body
        )}
    </ExpandContext.Provider>
  );
}

export function useExpandTransition() {
  const ctx = useContext(ExpandContext);
  if (!ctx) throw new Error("useExpandTransition must be used within an ExpandTransitionProvider");
  return ctx;
}
