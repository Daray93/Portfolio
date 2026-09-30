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

// Card <-> page transitions, both directions.
//
// Opening: the card scales up into a large framed card -- inset from the
// screen edges, corners still rounded (see coverFrame) -- while the page
// behind it settles from the carousel's background to the plain page
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
//   fade     the homepage never measured its card in time: the frame fades
//            out over it rather than vanishing
//
// Only a clip, transforms and opacity animate, never layout. Lives above the
// routes (see App.jsx) so it outlives the page that started it.

// long and heavy: slow to leave the card, slow to arrive at the frame
const EASE = [0.7, 0, 0.2, 1];
const OPEN_S = 1.05;
const HANDOFF_S = dur.fast * 1.4;
const CLOSE_S = 0.95;

// The longest each waiting phase may hold before moving on regardless.
// arrive and hold wait behind a copy that looks exactly like what's coming,
// so a long wait is invisible, while giving up early shows as a cut.
// prep waits behind an invisible copy that looks exactly like the card,
// so it too can wait: starting the grow before the picture is ready is what
// flashes.
const WAIT_MS = { prep: 1200, arrive: 2500, leave: 300, hold: 2500 };

// Which project was opened from the carousel. Set on opening; read when
// the homepage comes back into view to decide whether to play the way back.
export const RETURN_KEY = "expanded-project";
// the carousel's remembered card (read by the homepage on arrival)
export const SLIDE_KEY = "showcase-slide";

// Touch screens go straight back to the carousel -- "All work" or the
// phone's own back gesture -- with no way-back animation: nothing is
// remembered for one to play. The card still opens with its transition.
const touchOnly = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;

const ExpandContext = createContext(null);

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 5000;
  overflow: hidden;
  pointer-events: none;
  will-change: clip-path;
`;

// The media, sized to the final frame (its inset is set from coverFrame).
// No will-change: transform -- with it the browser draws the layer once at
// the scale it starts at and stretches that, so opening from the card
// (small) grew a blurry copy that snapped sharp at the handoff. Without it,
// the picture is redrawn at each size, sharp the whole way up.
const Media = styled(motion.div)`
  position: absolute;
  transform-origin: 50% 50%;
`;

// The page background, behind the card while it's out of the carousel, in
// the site's theme -- the same as the case study cover's page it hands off
// to, so the handoff can't show.
const Curtain = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 4999;
  pointer-events: none;
  background: ${({ theme }) => theme.body};
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
  // the corners as drawn: the card is scaled while the carousel settles, so
  // its radius on screen is its CSS radius times that scale
  const drawn = card.width / (cardEl.offsetWidth || card.width) || 1;
  const radius = (parseFloat(getComputedStyle(cardEl).borderRadius) || 20) * drawn;
  const frame = frameOnly();
  const fw = vw - 2 * frame.inset;
  const fh = vh - 2 * frame.inset;

  const el = cardEl.querySelector("img, video");
  const iw = el?.naturalWidth || el?.videoWidth || 0;
  const ih = el?.naturalHeight || el?.videoHeight || 0;
  const contain = el?.dataset.fit === "contain";
  let scale;
  let bleed;
  if (el && iw && ih && contain) {
    // Contained media sits inside padding that's a share of the width, so
    // it grows in step with the box: the card's padding as drawn, and the
    // frame's the same share of the frame's width.
    const boxEl = cardEl.firstElementChild ?? cardEl;
    const drawnBox = box.width / (boxEl.offsetWidth || box.width) || 1;
    const pad = (parseFloat(getComputedStyle(el).paddingLeft) || 0) * drawnBox;
    const framePad = (pad * fw) / box.width;
    scale =
      Math.min((box.width - 2 * pad) / iw, (box.height - 2 * pad) / ih) /
      Math.min((fw - 2 * framePad) / iw, (fh - 2 * framePad) / ih);
  } else if (el && iw && ih) {
    const toFrame = Math.max(fw / iw, fh / ih);
    scale = Math.max(box.width / iw, box.height / ih) / toFrame;
    // The whole picture at its frame size, uncropped: when the card's
    // shape differs from the frame's, the frame scaled down to the card is
    // narrower or shorter than it, and the card shows picture there.
    bleed = { width: iw * toFrame, height: ih * toFrame };
  } else {
    scale = Math.max(box.width / fw, box.height / fh);
  }

  return {
    ...frame,
    clip: `inset(${card.top}px ${vw - card.right}px ${vh - card.bottom}px ${card.left}px round ${radius}px)`,
    media: {
      x: box.left + box.width / 2 - vw / 2,
      y: box.top + box.height / 2 - vh / 2,
      scale,
    },
    bleed,
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

  // Busy from the instant a transition starts until it's cleared -- set
  // straight away, not on the next render, so even two clicks in the same
  // frame can't start two. Only one transition ever runs.
  const busyRef = useRef(false);
  const begin = useCallback((next) => {
    busyRef.current = true;
    setActive(next);
  }, []);
  useEffect(() => {
    if (!active) busyRef.current = false;
  }, [active]);

  // "All work" (or a pull) while a card is still landing: kept, and played
  // the moment the landing finishes, rather than cutting into it
  const pendingReturn = useRef(null);

  // ---- opening
  const expand = useCallback(
    (project, cardEl) => {
      try {
        if (!touchOnly()) sessionStorage.setItem(RETURN_KEY, project.id);
      } catch {
        // storage blocked -- there just won't be a way-back animation
      }
      if (busyRef.current) return;
      if (reduced || !cardEl) {
        navigate(project.to);
        return;
      }
      begin({ project, from: framing(cardEl), phase: "prep" });
    },
    [navigate, reduced, begin]
  );

  // the copy's media is ready to be seen: show it and start scaling
  const onCopyReady = useCallback(() => toPhase("prep", "grow"), [toPhase]);

  // the cover's media is ready: clear the copy over it
  const coverReady = useCallback(() => toPhase("arrive", "handoff"), [toPhase]);

  // ---- the way back, started from the cover (see ProjectCover)
  const returnFrom = useCallback(
    (project, snapshot) => {
      if (busyRef.current) {
        const a = activeRef.current;
        if (a && ["arrive", "handoff"].includes(a.phase)) pendingReturn.current = { project, snapshot };
        return;
      }
      const instant = touchOnly();
      try {
        if (instant) sessionStorage.removeItem(RETURN_KEY);
        else sessionStorage.setItem(RETURN_KEY, project.id);
        const i = projects.findIndex((p) => p.id === project.id);
        if (i >= 0) sessionStorage.setItem(SLIDE_KEY, String(i));
      } catch {
        // storage blocked -- the homepage just won't play the way back
      }
      if (reduced || instant || !snapshot) {
        navigate("/");
        return;
      }
      begin({ project, from: fromCover(snapshot), phase: "leave" });
    },
    [navigate, reduced, begin]
  );

  // a way back asked for during the landing: play it once the landing is done
  const returnRef = useRef(returnFrom);
  returnRef.current = returnFrom;
  useEffect(() => {
    if (active || !pendingReturn.current) return undefined;
    const { project, snapshot } = pendingReturn.current;
    pendingReturn.current = null;
    const raf = requestAnimationFrame(() => returnRef.current(project, snapshot));
    return () => cancelAnimationFrame(raf);
  }, [active]);

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
    pendingReturn.current = null;
    begin({ project, from: frameOnly(), phase: "hold" });
  }, [pathname, reduced, begin]);

  // Somewhere else entirely mid-transition (the menu, a link, the browser's
  // back or forward): let it go cleanly -- no overlay left up, no card left
  // hidden. Arriving back on the homepage is handled above instead.
  useEffect(() => {
    const a = activeRef.current;
    if (!a) return;
    const onPage = ["arrive", "handoff", "leave"].includes(a.phase);
    const expected = onPage ? a.project.to : "/";
    if (pathname === expected || pathname === "/") return;
    pendingReturn.current = null;
    a.onDone?.();
    setActive(null);
  }, [pathname]);

  // Returns false when there's nothing to play (reduced motion), so the
  // caller shows its card straight away.
  const collapse = useCallback(
    (project, cardEl, onDone) => {
      // only takes over from the homepage's hold (or its fade), never from
      // a transition still under way
      const a = activeRef.current;
      if (a && !["hold", "fade"].includes(a.phase)) return false;
      if (reduced || !cardEl) {
        setActive(null);
        return false;
      }
      begin({ project, from: framing(cardEl), phase: "shrink", onDone });
      return true;
    },
    [reduced, begin]
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
    } else if (a.phase === "handoff" || a.phase === "shrink" || a.phase === "fade") {
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
    else if (phase === "hold") t = setTimeout(() => toPhase("hold", "fade"), WAIT_MS.hold);
    else {
      const lengthS = { grow: OPEN_S, handoff: HANDOFF_S, shrink: CLOSE_S, fade: HANDOFF_S }[phase];
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
    const fading = phase === "fade";
    overlay = {
      initial: { clipPath: from.startClip, opacity: leaving ? 0 : 1 },
      animate: { clipPath: back ? from.clip : from.startClip, opacity: leaving || fading ? 0 : 1 },
      transition: {
        clipPath: { duration: CLOSE_S, ease: EASE },
        opacity: fading ? { duration: HANDOFF_S, ease: easeArr.out } : { duration: 0 },
      },
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
      animate: { opacity: back || leaving || fading ? 0 : 1 },
      transition: back
        ? { duration: CLOSE_S * 0.9, ease: EASE }
        : fading
          ? { duration: HANDOFF_S, ease: easeArr.out }
          : { duration: 0 },
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
      // the cover holds its text and shade until the copy has cleared off
      // it, so the handoff is picture to identical picture (see ProjectCover)
      coverHeld: Boolean(active && ["arrive", "handoff"].includes(active.phase)),
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
              // the card's own colour behind the media, so any of the clip
              // the scaled-down frame doesn't reach is the card, not a gap
              style={{ background: active.project.panel }}
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
                  bleed={active.from.bleed}
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
