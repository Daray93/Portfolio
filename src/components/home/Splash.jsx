import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { ThemeProvider } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { lightTheme } from "../../styles/theme";
import {
  FiMaximize,
  FiMaximize2,
  FiMinimize2,
  FiMail,
  FiMapPin,
  FiClock,
  FiCheck,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import { SiLinkedin, SiStrava } from "react-icons/si";
import GmailIcon from "./GmailIcon";
import Button from "../shared/Button";
import HoverCardCV from "./HoverCardCV";
import VideoHoverCard from "./VideoHoverCard";
import HoverCard from "./HoverCard";
import ScreenshotPanCard from "./ScreenshotPanCard";
import ProtectedGate from "../shared/ProtectedGate";
import MePhoto from "./assets/Me.png";
import DuolingoAvatarVideoMp4 from "./assets/Duolingo-avatar.mp4";
import DuolingoIcon from "./assets/Duolingo-icon.svg";
import DuolingoStreak from "./assets/Duolingo-streak.svg";
import NeuroloopVideo from "../../case-studies/neuroloop/assets/NeuroloopTeaser.mp4";
import AvocadoJumpingJack from "../../case-studies/operation-avocado/AvocadoJumpingJack";
import OrthoViveLogo from "../../case-studies/orthovive/assets/OrthoVive.png";
import IbhfBee from "../../case-studies/ibhf/assets/irishBb.jpg";
import AudanoteLogo from "../../case-studies/audanote/assets/Audanote-logo.svg";
import AboutMeLogoSvg from "../../pages/about-me/my-logo.svg";

// Kropt splash screen, smart-animating from its dark background into the
// logo mark on hover (see ScreenshotPanCard's crossfade-pair handling).
import kroptSplash1 from "../../case-studies/kropt/assets/Kropt-splash001.svg";
import kroptSplash2 from "../../case-studies/kropt/assets/Kropt-splash002.svg";

const KROPT_SCREENS = [[kroptSplash1, kroptSplash2]];
const IBHF_SCREENS = [IbhfBee];

// A curated handful from a much bigger dump -- picked for variety
// (Ireland/Italy/Egypt, scenery + personality shots) rather than trying
// to fit everything in. Each is its own screen (not a crossfade pair
// like Kropt's), so the pan strip scrolls through them individually.
import travelSkydive from "./assets/Travel-Photos/Skydive-Jump.jpg";
import travelPisa from "./assets/Travel-Photos/Leaning-Tower-Of-Pisa.jpg";
import travelPyramids from "./assets/Travel-Photos/Giza-Pyramids.jpg";
import travelParade from "./assets/Travel-Photos/Limerick-Shamrock-Parade.jpg";
import travelRingFort from "./assets/Travel-Photos/Kerry-Ring-Fort.jpg";
import travelAranCave from "./assets/Travel-Photos/Aran-Islands-Cave-Window.jpg";
import travelDingle from "./assets/Travel-Photos/Dingle-Peninsula-Coast.jpg";
import travelRaceMedal from "./assets/Travel-Photos/Race-Medal.jpg";

const TRAVEL_SCREENS = [
  travelSkydive,
  travelPisa,
  travelPyramids,
  travelParade,
  travelRingFort,
  travelAranCave,
  travelDingle,
  travelRaceMedal,
];

// ---------------- Layout ----------------

const SplashContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: ${({ theme }) => theme.space[5]} 2rem 0;
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.space[4]} 1.25rem 0;
  }
`;

// A grid can't size its own rows off container-query units that query
// itself (self-reference) -- the browser silently falls back to the
// viewport, which overshoots once the grid is narrower than the
// viewport (e.g. capped by max-width). So the query container lives on
// this wrapper, one level up, and SplashGrid just fills it.
const GridViewport = styled.div`
  container-type: inline-size;
  width: 100%;
  max-width: 1040px;
`;


const SplashGrid = styled.div`
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(4, 1fr);
  /* Row height locked to column width so every cell is a true square,
     regardless of content -- matches the reference's fixed square cells. */
  grid-auto-rows: calc((100cqw - 3 * 18px) / 4);
  gap: 18px;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: calc((100cqw - 18px) / 2);
  }

  /* Below 560px every shape controls its own visible height via
     aspect-ratio (see GridSlot) instead of a fixed square row track --
     that's what lets the hero read as a landscape rectangle instead of
     a square, and lets the email/LinkedIn/CV trio share one row at a
     third of the width each rather than stacking full-width. Row
     tracks just size to whatever's in them. */
  @media (max-width: 560px) {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: min-content;
  }
`;

// ---------------- Shared Card ----------------

const Card = styled.div`
  position: relative;
  border-radius: clamp(18px, 2.5vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  background: ${({ theme }) => theme.cardBackground};
  width: 100%;
  height: 100%;
  box-shadow: ${({ theme }) => theme.shadowSm};
`;

// ---------------- Shape vocabulary ----------------
// Every cell declares a shape (how many cells it merges), not a fixed
// position. grid-auto-flow: dense packs them, so the same shapes hold
// at 4, 2, or 1 columns -- a span-2 shape only needs adjusting once,
// at the single-column breakpoint where there's no second column left.

const SHAPE_SPAN = {
  single: { col: 1, row: 1 }, // 1 cell
  trio: { col: 1, row: 1 }, // same footprint as single above 560px -- only differs on the mobile row-of-3
  trioWide: { col: 1, row: 1 }, // same desktop footprint as trio -- only differs on mobile, see MOBILE_SHAPE
  tall: { col: 1, row: 2 }, // phone-shaped: 2 cells merged vertically
  big: { col: 2, row: 2 }, // 4 cells merged
  hero: { col: 2, row: 1 }, // 2 cells merged horizontally
  huge: { col: 4, row: 2 }, // full row, 8 cells -- Travel's expanded state, see travelExpanded
};

// Below 560px the grid switches to a 3-column track (see SplashGrid) so
// the email/LinkedIn/CV trio can share one row. Every other shape spans
// all 3 columns (full width) and gets its visible height from an
// aspect-ratio instead of a row-span, so a "tall"/"big" shape's height
// no longer depends on a second column existing to be tall relative to.
const MOBILE_SHAPE = {
  single: { col: 3, aspect: "1 / 1" },
  trio: { col: 1, aspect: "1 / 1" },
  // Spotify (cell 12) -- its embed needs a fixed 152px to stay
  // interactive (see SpotifyEmbedFrame), which a small mobile trio
  // square can't fit without cropping it. Full width instead of sharing
  // the trio row, at a landscape ratio sized so the cell comes out
  // ~152px+ tall even on narrow phones (~155px at a 320px-wide grid).
  trioWide: { col: 3, aspect: "1.8 / 1" },
  tall: { col: 3, aspect: "1 / 2" },
  big: { col: 3, aspect: "1 / 1" }, // Neuroloop drops its 2x2 hero treatment and reads as a single square cell on mobile
  hero: { col: 3, aspect: "2 / 1" }, // landscape rectangle, not a square
  huge: { col: 3, aspect: "1 / 1.7" }, // already full-width at "big" -- expanding means taller, not wider
};

// Pure grid placement -- this is the element framer-motion tracks via
// `layout`/`layoutId` for the filter reorder and the about-card morph.
// It carries no visible chrome of its own, so nothing here ever fights
// framer's transform management.
const GridSlot = styled.div`
  --col-span: ${({ $shape }) => SHAPE_SPAN[$shape].col};
  --row-span: ${({ $shape }) => SHAPE_SPAN[$shape].row};
  grid-column: span var(--col-span);
  grid-row: span var(--row-span);
  width: 100%;
  height: 100%;
  /* Grid items default to min-width/min-height: auto, which lets an
     unconstrained descendant's natural content size (e.g. a wide
     unwrapped image strip) blow out the track it sits in. This pins
     the item to its track size regardless of content. */
  min-width: 0;
  min-height: 0;
  /* Dimmed-by-filter cells (see isFilteredOut in Splash()) fade out but
     stay in the grid to hold their layout slot -- pointer-events: none
     makes the card's own content (Link/onClick/etc.) inert; DimmedGuard
     (CardSurface's child, see below) explicitly re-enables its own
     pointer-events so it alone still catches hover/click. Opacity itself
     is a plain inline style (not framer-motion's animate prop) set
     alongside this, so this transition is what actually animates the
     fade -- animate's opacity value was going stale on a live filter
     change (client-side nav), only reading correctly after a full page
     reload. */
  transition: opacity 0.3s ease;
  pointer-events: ${({ $dimmed }) => ($dimmed ? "none" : "auto")};

  @media (max-width: 560px) {
    grid-column: span ${({ $shape }) => MOBILE_SHAPE[$shape].col};
    grid-row: span 1;
    height: auto;
    aspect-ratio: ${({ $shape }) => MOBILE_SHAPE[$shape].aspect};
  }
`;

const MotionCell = motion(GridSlot);

// Invisible desktop-only filler (see the "spacer-" entries in CELLS) --
// absorbs a leftover grid slot at a category boundary so grid-auto-flow:
// dense can't pull the NEXT category's cell into it. A separate styled
// component rather than styled(MotionCell) -- wrapping an already
// motion()-wrapped styled component in another styled() layer doesn't
// reliably forward transient ($-prefixed) props down to GridSlot's own
// interpolation, which crashed SHAPE_SPAN[$shape] on undefined. Spacers
// are always a single 1x1 cell, so the span can just be hardcoded here
// instead of routing through SHAPE_SPAN at all. Disappears below the
// 4-column desktop breakpoint: the 2-col/900px and 3-col/560px layouts
// pack differently and were never gappy at these spots to begin with.
const GridSpacer = styled(motion.div)`
  grid-column: span 1;
  grid-row: span 1;

  @media (max-width: 900px) {
    display: none;
  }
`;

// The actual visible card surface, nested inside GridSlot. Framer
// never touches this element's transform, so a plain CSS hover works
// reliably instead of being overridden by framer's layout projection.
const CardSurface = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  /* Dimmed-by-filter cards skip the lift-on-hover -- it reads as an
     interactive affordance, which these no longer are (see DimmedGuard
     below). */
  &:hover {
    transform: ${({ $dimmed }) => ($dimmed ? "none" : "translateY(-8px)")};
    box-shadow: ${({ $dimmed, theme }) => ($dimmed ? theme.shadowSm : theme.shadowLg)};
  }
`;

const CellLabel = styled.span`
  font-family: "General Sans", sans-serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textTertiary};
`;

// Sits on top of a dimmed cell's own content (Link/onClick/etc.) so it
// alone catches hover/click -- absorbs clicks (no handler) and swaps in
// the custom cursor's "disabled" state via data-cursor, without having
// to individually gate every cell type's own interactive element.
// Explicit pointer-events: auto so it stays interactive even though
// GridSlot (its ancestor) sets pointer-events: none for the rest of
// the card's now-inert content.
const DimmedGuard = styled.span`
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: auto;
  cursor: none;
`;

// ---------------- Hero content (cell 1) ----------------

const HeroInner = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  cursor: none;
`;

const HeroPhoto = styled.img`
  width: clamp(84px, 38%, 160px);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
`;

// Shares layoutId="about-photo" with MotionModalPhoto so the photo
// itself gets its own FLIP transition instead of passively stretching
// while the outer card's non-uniform scale morphs between shapes.
const MotionHeroPhoto = motion(HeroPhoto);

const HeroTextStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
`;

const HeroName = styled.span`
  font-family: "General Sans", sans-serif;
  font-weight: 600;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: ${({ theme }) => theme.text};
`;

const HeroRole = styled.span`
  font-family: "Manrope", sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1rem);
  color: ${({ theme }) => theme.textSecondary};
`;

// Shared small circular icon badge, top-right of a cell. Hidden until
// the card is hovered -- used for the expand, copy, and external-link
// affordances alike, so they all behave the same way.
const HoverIconBadge = styled.span`
  position: absolute;
  top: clamp(0.6rem, 1.5vw, 1rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.navSurface};
  color: ${({ theme, $copied }) => ($copied ? theme.inputSuccess : theme.textSecondary)};
  cursor: none;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;
  /* No-ops when this renders as a span (the usual case) -- only matters
     for the one usage (Travel's expand toggle) that renders it as a
     button instead, where these strip the browser's default button
     chrome so it matches the decorative badges pixel-for-pixel. */
  padding: 0;
  font: inherit;
  appearance: none;

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
    color: ${({ theme, $copied }) => ($copied ? theme.inputSuccess : theme.buttonGhostHoverText)};
  }

  /* Only relevant for the button usage -- a decorative span can't
     receive focus, so this never fires for the other badges. */
  &:focus-visible {
    opacity: 1;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  /* No hover on touch devices -- these badges are the only affordance
     for "this cell does something", so below 560px they stay visible
     all the time instead of being permanently hidden. */
  @media (max-width: 560px) {
    opacity: 1;
  }
`;

const EmailCellInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(0.6rem, 1.5vw, 0.9rem);
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  cursor: none;
`;

const EmailIcon = styled.span`
  display: flex;

  svg {
    width: 56px;
    height: 56px;

    /* Trio cells (email/LinkedIn/CV) run a third of the row width on
       mobile instead of the full width they got before -- shrink to
       match so the icon doesn't crowd the smaller cell. */
    @media (max-width: 560px) {
      width: 34px;
      height: 34px;
    }
  }
`;

const EmailAddress = styled.span`
  font-family: "Manrope", sans-serif;
  font-size: clamp(0.8rem, 1.8vw, 0.95rem);
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  word-break: break-word;
`;

// Generic "single brand icon, links out" cell -- LinkedIn (about) and
// Strava/Spotify/Duolingo (life) all share this shape: idle themed
// monochrome, hover (whole card) swaps to the brand's true color.
const BrandLinkCellInner = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.textSecondary};
  cursor: none;

  /* direct child only -- otherwise this would also catch the smaller
     external-link icon nested inside HoverIconBadge below */
  & > svg {
    width: clamp(28px, 6vw, 40px);
    height: clamp(28px, 6vw, 40px);
    transition: color 0.25s ease;
  }

  ${Card}:hover & > svg {
    color: ${({ $hoverColor }) => $hoverColor};
  }
`;

const LINKEDIN_BLUE = "#0a66c2";
const STRAVA_ORANGE = "#FC4C02";

// Spotify cell (12) -- an actual playable playlist (Spotify's official
// embed, no OAuth/account needed -- it's a public playlist URL, not
// account data) rather than a plain icon. Anonymous visitors get a
// 30s preview per track; full playback prompts a Spotify login.
//
// Spotify's embed ships in three fixed heights it's designed for -- 80
// (ultra-compact, static play bar with no actual play control), 152
// (compact single track, fully playable), 352 (full track list). 152px
// is the smallest one that's actually interactive -- this cell uses the
// "trioWide" shape (see SHAPE_SPAN/MOBILE_SHAPE) specifically so it has
// room for that on mobile instead of being squeezed into the small
// square the other trio cells use. CardSurface's own flex centering
// handles vertically centering it within the cell around it.
const SpotifyEmbedFrame = styled.iframe`
  width: 100%;
  height: 152px;
  border: none;
  display: block;
`;

// Duolingo cell (13) -- a looping avatar clip instead of a plain icon,
// same full-bleed-video treatment as VideoHoverCard/ScreenshotPanCard
// above use for their preview cards, just without a morphId since this
// doesn't go anywhere but out to Duolingo.
const DuolingoCellInner = styled.a`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  cursor: none;
`;

const DuolingoVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

// Mobile Safari/Chrome frequently ignore the plain `autoPlay` attribute
// for a video that isn't yet in the viewport at load time -- explicitly
// kicking off playback once it's actually visible (same IntersectionObserver
// approach as VideoHoverCard's mobile path) makes it start reliably instead
// of sitting on its poster frame until tapped.
function DuolingoVideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const tryPlay = () => {
      video.play().catch(() => {
        /* ignore autoplay errors */
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
      },
      { threshold: 0.4 }
    );
    io.observe(video);
    tryPlay();

    return () => io.disconnect();
  }, []);

  return (
    <DuolingoVideo ref={videoRef} src={src} autoPlay loop muted playsInline preload="auto" />
  );
}

// Real Duolingo mark (own rounded-square shape and green already baked
// into the SVG) rather than the generic react-icons glyph, so the video
// is identifiable as Duolingo's even before/if it's finished loading.
// Sized relative to the cell (1/5 of it) rather than a fixed pixel value
// so it scales with the cell instead of looking oversized/undersized at
// different breakpoints.
const DuolingoIconBadge = styled.img`
  position: absolute;
  bottom: clamp(1.4rem, 3vw, 2rem);
  left: clamp(0.6rem, 1.5vw, 1rem);
  width: 20%;
  aspect-ratio: 1 / 1;
  border-radius: 22%;
`;

// Streak count, bottom-right. Badge height matches DuolingoIconBadge's
// sizing (20% of the cell) so the flame and the logo scale together and
// sit on the same visual baseline instead of drifting apart at different
// cell sizes -- percentage height only resolves here because the badge
// itself is absolutely positioned against DuolingoCellInner (a definite
// height), same containing block the logo badge uses.
//
// The flame SVG's own viewBox is a 141x213 portrait rect, not square --
// sizing it as a fixed square (as an icon button badge normally would
// be) squashed the flame out of shape and threw off its visual center
// against the number next to it. height:100% + aspect-ratio keeps the
// source proportions so the flame's actual mass (not a distorted
// bounding box) is what lines up with the digit.
const DuolingoStreakBadge = styled.div`
  position: absolute;
  bottom: clamp(1.4rem, 3vw, 2rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  height: 20%;
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

const DuolingoStreakIcon = styled.img`
  height: 100%;
  width: auto;
  aspect-ratio: 141 / 213;
`;

const DuolingoStreakCount = styled.span`
  font-family: "General Sans", sans-serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  line-height: 1;
  color: #ff9600;
`;

const DUOLINGO_STREAK = 3;

// Same pill recipe as AvocadoOverlayTag below (theme.tagBg/tagText/border
// + blur) rather than a one-off style, so the Strava/Duolingo captions
// read as the same design language as every other tag in the app instead
// of inventing a new caption treatment. Anchored bottom-left of whichever
// cell it's dropped into -- BrandLinkCellInner/DuolingoCellInner don't
// set their own `position`, so this resolves against CardSurface (the
// whole cell), landing in that cell's actual bottom-left corner. The
// pill's own blur+fill gives it enough contrast on its own, so unlike
// VideoHoverCard/ScreenshotPanCard's Overlay it doesn't need a dark
// gradient scrim behind it too.
const CellPill = styled.span`
  position: absolute;
  left: clamp(0.7rem, 2vw, 1.1rem);
  bottom: clamp(0.7rem, 2vw, 1.1rem);
  /* Without this, a phrase like "Wanna race?" is wider than a small
     mobile trio cell -- with no cap, the pill just overflows past the
     card edge and gets clipped by CardSurface's own overflow: hidden
     instead of wrapping, which is what read as "broken". */
  max-width: calc(100% - 1.4rem);
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-family: "General Sans", sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  background: ${({ theme }) => theme.tagBg};
  color: ${({ theme }) => theme.tagText};
  border: 1px solid ${({ theme }) => theme.border};
  pointer-events: none;

  /* Small enough that it may still need to wrap even at max-width --
     999px on a two-line box reads as an odd stretched oval rather than
     a pill, so this drops to a normal rounded-rect radius there instead. */
  @media (max-width: 560px) {
    font-size: 0.6rem;
    letter-spacing: 0.03em;
    border-radius: 10px;
  }
`;

// Same true LinkedIn blue as BrandLinkCellInner above, applied to the
// modal's LinkedIn button on hover (text + icon via currentColor).
const LinkedInButton = styled(Button)`
  &:hover:not(:disabled) {
    color: ${LINKEDIN_BLUE};
  }
`;


// ---------------- Operation Avocado (cell 6) ----------------

// Carries its own chrome (rather than relying on the parent CardSurface)
// since this is the element that hands off into the OperationAvocado
// overlay -- once it's replaced by that overlay it needs to look
// complete on its own. Background matches the homepage's own (theme.body)
// so it reads as continuous with the page behind it. No morph animation
// (see openAvocado below) -- the overlay just appears immediately on
// click rather than growing out of this cell.
const AvocadoCell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: clamp(18px, 2.5vw, 32px);
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.body};
  box-shadow: ${({ theme }) => theme.shadowSm};
  overflow: hidden;
`;

const CenteredLogoLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: none;
`;

const ComingSoonPill = styled.span`
  position: absolute;
  top: clamp(0.6rem, 1.5vw, 1rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.navSurface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "General Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  border-radius: 20px;
  padding: 4px 10px;
  pointer-events: none;
  transition: opacity 0.2s ease;

  /* steps out of the way of the hover-revealed expand badge in the
     same corner */
  ${Card}:hover & {
    opacity: 0;
  }

  /* No hover on touch devices, so the expand badge above stays
     permanently visible in this same corner (see HoverIconBadge) --
     this pill moves to the opposite corner on mobile instead of
     fighting it for space. */
  @media (max-width: 560px) {
    right: auto;
    left: clamp(0.6rem, 1.5vw, 1rem);
  }
`;

const AvocadoOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  pointer-events: none;
`;

const AvocadoOverlayStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const AvocadoOverlayTitle = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  font-weight: 500;
  font-family: "General Sans", sans-serif;
  letter-spacing: 0.01em;
`;

const AvocadoOverlayTag = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  backdrop-filter: blur(24px);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${({ theme }) => theme.tagBg};
  color: ${({ theme }) => theme.tagText};
  border: 1px solid ${({ theme }) => theme.border};
`;

// ---------------- About Me (cell 15) ----------------
// Same composition as HoverCardCV (the CV cell): logo centred via an
// absolute-fill wrap, text stacked bottom-left via absolute positioning
// -- not flex alignment, so the text's position doesn't depend on (or
// compete with) the centred logo's own size. Text stays light-weight
// (Atmos-inspired thin type, not the bold headline treatment the rest of
// the grid uses). Still shares layoutId="morph-about-me" with
// AboutMe.jsx's own <Frame> so the cell grows straight into it -- that's
// why this is a motion.div rather than a plain one, same as
// EmailCellInner/BrandLinkCellInner in shape but needing the
// layout/layoutId props those don't.

const AboutMeCellInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: none;
`;

const AboutMeLogoWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AboutMeLogo = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;

  /* Same size (and breakpoint) as IconWrap's own svg in HoverCardCV --
     this cell is the same trio footprint now, not the old 2-cell hero. */
  @media (max-width: 560px) {
    width: 34px;
    height: 34px;
  }
`;

const AboutMeTextStack = styled.div`
  position: absolute;
  left: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;

  /* Same call as HoverCardCV -- icon-only at the smallest mobile size
     rather than the label colliding with the centred logo. */
  @media (max-width: 560px) {
    display: none;
  }
`;

const AboutMeHeader = styled.span`
  font-family: "General Sans", sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.01em;
`;

const AboutMeSubtext = styled.span`
  font-family: "Manrope", sans-serif;
  font-size: 0.85rem;
  font-weight: 300;
  margin-top: 0.1rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ABOUT_ME_MORPH_TRANSITION = { layout: { duration: 0.5, ease: "easeInOut" } };

// ---------------- About Me modal ----------------

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const AboutModal = styled(motion.div)`
  position: relative;
  width: min(600px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: clamp(18px, 2.5vw, 32px);
  box-shadow: ${({ theme }) => theme.shadowLg};
  padding: clamp(1.5rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: clamp(1rem, 2vw, 1.5rem);
  right: clamp(1rem, 2vw, 1.5rem);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.buttonSecondaryBg};
  color: ${({ theme }) => theme.buttonSecondaryText};
  cursor: none;

  &:hover {
    background: ${({ theme }) => theme.surfaceSubtle};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ModalHeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
`;

const ModalPhoto = styled.img`
  width: clamp(72px, 15vw, 110px);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
`;

const MotionModalPhoto = motion(ModalPhoto);

const ModalIdentityLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const ModalMetaRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.35rem;
`;

const ModalMetaItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Manrope", sans-serif;
  font-size: 0.8rem;
  white-space: nowrap;

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const ModalText = styled.p`
  margin: 0;
  font-family: "Manrope", sans-serif;
  font-size: 0.95rem;
  line-height: 1.55;
  color: ${({ theme }) => theme.textSecondary};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

// ---------------- Grid Structure ----------------
// Content plan (shapes stay as-is):
//  1 hero  -- intro / about me
//  2 trio  -- copy email
//  3 trio  -- LinkedIn, opens new tab
//  4 trio  -- CV / resume
// 15 trio  -- About Me (scroll-driven flight-through story -- see
//             AboutMe.jsx), same footprint as CV/LinkedIn/email now
//             (swapped array positions with CV, cell 4, to sit third in
//             the about row rather than trailing as an oversized hero).
//             Grouped with the about cluster here, not "work" (where it
//             originally landed as a placeholder before it had real
//             content) since that's what it actually is; also
//             kept full-opacity under the "life" filter (see
//             FILTER_VISIBLE_IDS below), since several of its own
//             chapters point straight at the life cells (Strava,
//             Duolingo).
//  5 single -- OrthoVive teaser (password-locked)
//  6 tall   -- Operation Avocado (mobile web app, "coming soon")
//  7 tall   -- Kropt (mobile app screenshot)
//  8 big    -- Neuroloop (flagship case study -- shrinks to a single
//              cell under the "work" filter; see compactShape below)
//  9 single -- IBHF (conservation WP site)
// 10 single -- Audanote (password-locked, same as OrthoVive -- no
//              /audanote route yet, so a successful unlock has nowhere
//              real to land until that page exists)
// 11 trio  -- Strava, opens new tab
// 12 trio  -- Spotify, opens new tab
// 13 trio  -- Duolingo, opens new tab
// 14 single -- Travel photos (ScreenshotPanCard, same pan-on-hover component
//             Kropt uses -- tried an interactive globe here first, didn't
//             fit the site's visual language, pulled it back out along
//             with its packages). Sits as a single cell (beside Duolingo)
//             until clicked -- toggling travelExpanded grows it to the
//             "huge" shape (a full row), and dense grid-flow bumps it down
//             to its own row at the bottom to fit, same mechanism that
//             already reflows everything else on a shape change (e.g. the
//             "work" filter shrinking Neuroloop) -- expand/collapse just
//             rides that.

const EMAIL = "daraphillips.design@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/daraphillips01010/";

const STRAVA_URL = "https://www.strava.com/athletes/21950453";
const DUOLINGO_URL = "https://www.duolingo.com/profile/DaraPhilli1";

// Which cells stay full-opacity under a given filter -- not simply
// "same category", since dense grid-flow doesn't guarantee a category's
// cells all land in the visually "active" front rows once reordered
// (see orderedCells in Splash()). Same id set drives both desktop and
// mobile, even though the two layouts don't share a literal "top row".
// Filters not listed here still fall back to plain category matching.
const FILTER_VISIBLE_IDS = {
  life: [11, 12, 13, 14, 15],
};

const CELLS = [
  { id: 1, shape: "hero", category: "about" },
  { id: 2, shape: "trio", category: "about" },
  { id: 3, shape: "trio", category: "about" },
  { id: 15, shape: "trio", category: "about" },
  { id: 4, shape: "trio", category: "about" },
  // About totals 6 grid-units (2+1+1+1+1) on the 4-column desktop grid --
  // two short of a clean 2 rows. Without these, dense packing pulls the
  // next two cells (OrthoVive, Kropt) up into that leftover space, right
  // beside the about cluster. Desktop-only (see GridSpacer); the 2-col/
  // 3-col layouts never had this gap.
  { id: "spacer-about-1" },
  { id: "spacer-about-2" },
  // Reordered so the tall/tall/big trio (Avocado, Kropt, Neuroloop) leads
  // -- those three alone tile a perfectly gapless 2x4 block (2+2+4=8), so
  // leading with them keeps that block clean; the plain singles (OrthoVive,
  // IBHF, Audanote) trail after instead of breaking it up.
  { id: 6, shape: "tall", category: "work" },
  { id: 7, shape: "tall", category: "work" },
  // Under "all" this is the flagship 2x2 feature. Under "work" specifically,
  // the 5 other work items tile perfectly into a gapless 4x2 block if this
  // one shrinks to a single cell instead -- see the packing note in Splash().
  { id: 8, shape: "big", compactShape: "single", category: "work" },
  { id: 5, shape: "single", category: "work" },
  { id: 9, shape: "single", category: "work" },
  { id: 10, shape: "single", category: "work" },
  // Work totals 11 units -- one short of a clean 3 rows, same reasoning
  // as spacer-about: without this, Strava (the first life cell) gets
  // pulled up into the gap right beside the work cluster.
  { id: "spacer-work" },
  { id: 11, shape: "trio", category: "life" },
  { id: 12, shape: "trioWide", category: "life" },
  { id: 13, shape: "trio", category: "life" },
  { id: 14, shape: "single", category: "life" },
];

// ---------------- Component ----------------

export default function Splash() {
  // The filter nav itself lives in the global Navbar now -- it drives
  // this grid through the ?filter= query param, so both stay in sync
  // regardless of which page you clicked the filter from.
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";

  const navigate = useNavigate();
  const location = useLocation();

  // Operation Avocado opens as a fixed overlay on top of this page (see
  // OperationAvocadoOverlay) rather than a routed page swap -- stashing
  // the current location as router state is what lets the background
  // Routes keep rendering this page underneath instead of unmounting it,
  // so scroll position/grid state survives the round trip. No morph
  // animation -- the overlay just appears immediately, opaque and
  // full-screen, on click.
  const openAvocado = () => {
    navigate("/operation-avocado", { state: { backgroundLocation: location } });
  };

  // The overlay's own box is opaque and covers the full viewport, so this
  // cell is already fully hidden behind it regardless -- unmounting it
  // here too is just avoiding the redundant render, not load-bearing for
  // anything visual.
  const avocadoOverlayOpen = location.pathname === "/operation-avocado";

  const [aboutOpen, setAboutOpen] = useState(false);
  const [travelExpanded, setTravelExpanded] = useState(false);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && setAboutOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen]);

  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied or unavailable -- nothing to recover into
    }
  };

  // null | "orthovive" | "audanote" -- which locked card opened the gate,
  // so a successful unlock navigates to the right place.
  const [passwordTarget, setPasswordTarget] = useState(null);

  // Matching cells first (in their original relative order), the rest
  // follow after -- dense grid-flow repacks them, framer-motion's
  // `layout` prop animates the move.
  const orderedCells =
    filter === "all"
      ? CELLS
      : [
          ...CELLS.filter((cell) => cell.category === filter),
          ...CELLS.filter((cell) => cell.category !== filter),
        ];

  return (
    <>
    <SplashContainer>
      <GridViewport>
        <SplashGrid>
          {orderedCells.map((cell) => {
            // Purely a layout placeholder (see the "spacer-" entries in
            // CELLS) -- no card, no filter/dim logic, nothing else in
            // this file needs to know about it.
            if (typeof cell.id === "string") {
              return <GridSpacer key={cell.id} aria-hidden="true" />;
            }

            const isAboutCell = cell.id === 1;
            const visibleIds = FILTER_VISIBLE_IDS[filter];
            const isVisible =
              filter === "all" || (visibleIds ? visibleIds.includes(cell.id) : cell.category === filter);
            const filterOpacity = isVisible ? 1 : 0.35;
            const isFilteredOut = filterOpacity !== 1;
            // While the modal is open, the grid slot stays reserved (so
            // nothing else flows into it) but goes invisible -- the
            // visible card "becomes" the modal via the shared layoutId.
            const opacity = isAboutCell && aboutOpen ? 0 : filterOpacity;
            const effectiveShape =
              cell.id === 14 && travelExpanded
                ? "huge"
                : filter === "work" && cell.compactShape
                ? cell.compactShape
                : cell.shape;

            return (
              <MotionCell
                key={cell.id}
                layout
                layoutId={isAboutCell && !aboutOpen ? "about-card" : undefined}
                $shape={effectiveShape}
                $dimmed={isFilteredOut}
                style={{
                  ...(isAboutCell ? { zIndex: 10 } : null),
                  opacity,
                }}
                transition={{
                  layout: { duration: 0.5, ease: "easeInOut" },
                }}
              >
                {/* OrthoVive (cell 5) and Audanote (cell 10) stay in light
                    mode regardless of the site's own dark/light toggle,
                    rather than flipping to a dark card chrome -- OrthoVive
                    for its clinical case study look, Audanote because
                    HoverCard's category pill has fixed, non-themed colors
                    that only read correctly against a light card. The
                    function form of `theme` passes the ambient theme
                    through unchanged for every other cell. */}
                <ThemeProvider theme={(outer) => (cell.id === 5 || cell.id === 10 ? lightTheme : outer)}>
                <CardSurface
                  $dimmed={isFilteredOut}
                  style={cell.id === 12 ? { background: "#1F1F1F" } : undefined}
                >
                  {isAboutCell ? (
                    !aboutOpen && (
                      <HeroInner
                        role="button"
                        tabIndex={0}
                        aria-label="Expand about me"
                        onClick={() => setAboutOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setAboutOpen(true);
                          }
                        }}
                      >
                        <MotionHeroPhoto layoutId="about-photo" src={MePhoto} alt="Dara Phillips" />
                        <HeroTextStack>
                          <HeroName>Dara Phillips</HeroName>
                          <HeroRole>Product Designer</HeroRole>
                        </HeroTextStack>
                        <HoverIconBadge aria-hidden="true">
                          <FiMaximize2 />
                        </HoverIconBadge>
                      </HeroInner>
                    )
                  ) : cell.id === 2 ? (
                    <EmailCellInner
                      role="button"
                      tabIndex={0}
                      aria-label="Copy email address"
                      onClick={copyEmail}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          copyEmail();
                        }
                      }}
                    >
                      <EmailIcon aria-hidden="true">
                        <GmailIcon />
                      </EmailIcon>
                      <EmailAddress>{copied ? "Copied!" : ""}</EmailAddress>
                      <HoverIconBadge $copied={copied} aria-hidden="true">
                        {copied ? <FiCheck /> : <FiCopy />}
                      </HoverIconBadge>
                    </EmailCellInner>
                  ) : cell.id === 3 ? (
                    <BrandLinkCellInner
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open LinkedIn in a new tab"
                      $hoverColor={LINKEDIN_BLUE}
                    >
                      <SiLinkedin />
                      <HoverIconBadge aria-hidden="true">
                        <FiExternalLink />
                      </HoverIconBadge>
                    </BrandLinkCellInner>
                  ) : cell.id === 4 ? (
                    <HoverCardCV
                      title="My CV"
                      onOpen={() => window.open("/Dara-Phillips_cv_2026.pdf", "_blank")}
                    />
                  ) : cell.id === 5 ? (
                    <HoverCard
                      title="OrthoVive"
                      category="Med-Tech Case Study"
                      icon={OrthoViveLogo}
                      onClick={() => setPasswordTarget("orthovive")}
                    />
                  ) : cell.id === 6 ? (
                    <AnimatePresence>
                      {!avocadoOverlayOpen && (
                        <AvocadoCell key="avocado-cell" data-cursor="view">
                      <CenteredLogoLink
                        role="button"
                        tabIndex={0}
                        aria-label="Open Operation Avocado"
                        onClick={openAvocado}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openAvocado();
                          }
                        }}
                      >
                        <AvocadoJumpingJack fill />
                      </CenteredLogoLink>
                      <ComingSoonPill>In Progress</ComingSoonPill>
                      <AvocadoOverlay>
                        <AvocadoOverlayStack>
                          <AvocadoOverlayTitle>Operation Avocado</AvocadoOverlayTitle>
                          <AvocadoOverlayTag>Mobile Web App</AvocadoOverlayTag>
                        </AvocadoOverlayStack>
                      </AvocadoOverlay>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                        </AvocadoCell>
                      )}
                    </AnimatePresence>
                  ) : cell.id === 7 ? (
                    <>
                      <Link to="/kropt" data-cursor="view-light" style={{ height: "100%", display: "block" }}>
                        <ScreenshotPanCard
                          screens={KROPT_SCREENS}
                          title="Kropt Mobile App"
                          tag="Ag-Tech Case Study"
                          tagColor="#497025"
                        />
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 8 ? (
                    <>
                      <Link to="/neuroloop" data-cursor="view" style={{ display: "block", width: "100%", height: "100%" }}>
                        <VideoHoverCard
                          src={NeuroloopVideo}
                          title="Neuroloop"
                          tag="AI & VR Case Study"
                          crop="scale(1.18) translate(-3%, -3%)"
                          tagColor="#0c5562"
                        />
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 9 ? (
                    <>
                      <Link to="/ibhf" data-cursor="view" style={{ height: "100%", display: "block" }}>
                        <ScreenshotPanCard
                          screens={IBHF_SCREENS}
                          title="IBHF"
                          tag="Conservation Case Study"
                          tagColor="#92400E"
                          focalPoint={0.6}
                        />
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 10 ? (
                    <HoverCard
                      title="Audanote"
                      category="Health-Tech Case Study"
                      icon={AudanoteLogo}
                      onClick={() => setPasswordTarget("audanote")}
                    />
                  ) : cell.id === 11 ? (
                    <BrandLinkCellInner
                      href={STRAVA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open Strava in a new tab"
                      $hoverColor={STRAVA_ORANGE}
                    >
                      <SiStrava />
                      <CellPill>My Strava</CellPill>
                      <HoverIconBadge aria-hidden="true">
                        <FiExternalLink />
                      </HoverIconBadge>
                    </BrandLinkCellInner>
                  ) : cell.id === 12 ? (
                    <SpotifyEmbedFrame
                      src="https://open.spotify.com/embed/playlist/0ENOn9mdzoDzoGQlY2Kj0F?utm_source=generator&theme=0"
                      title="Spotify playlist"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  ) : cell.id === 13 ? (
                    <DuolingoCellInner
                      href={DUOLINGO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open Duolingo in a new tab"
                    >
                      <DuolingoVideoPlayer src={DuolingoAvatarVideoMp4} />
                      <DuolingoIconBadge src={DuolingoIcon} alt="" aria-hidden="true" />
                      <DuolingoStreakBadge aria-hidden="true">
                        <DuolingoStreakIcon src={DuolingoStreak} alt="" />
                        <DuolingoStreakCount>{DUOLINGO_STREAK}</DuolingoStreakCount>
                      </DuolingoStreakBadge>
                      <HoverIconBadge aria-hidden="true">
                        <FiExternalLink />
                      </HoverIconBadge>
                    </DuolingoCellInner>
                  ) : cell.id === 14 ? (
                    <>
                      <ScreenshotPanCard
                        screens={TRAVEL_SCREENS}
                        direction="horizontal"
                        title="Travel"
                        tag="A Few Favourites"
                        tagColor="#1F6F8B"
                      />
                      <HoverIconBadge
                        as="button"
                        type="button"
                        aria-label={travelExpanded ? "Collapse travel photos" : "Expand travel photos"}
                        onClick={() => setTravelExpanded((expanded) => !expanded)}
                      >
                        {travelExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 15 ? (
                    <>
                      <Link
                        to="/about-me"
                        data-cursor="view"
                        style={{ width: "100%", height: "100%", display: "block" }}
                      >
                        <AboutMeCellInner
                          layoutId="morph-about-me"
                          layout
                          transition={ABOUT_ME_MORPH_TRANSITION}
                        >
                          <AboutMeLogoWrap aria-hidden="true">
                            <AboutMeLogo src={AboutMeLogoSvg} alt="" />
                          </AboutMeLogoWrap>
                          <AboutMeTextStack>
                            <AboutMeHeader>About me</AboutMeHeader>
                            <AboutMeSubtext>Scroll driven animation</AboutMeSubtext>
                          </AboutMeTextStack>
                        </AboutMeCellInner>
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : (
                    <CellLabel>{cell.id}</CellLabel>
                  )}
                  {/* Sits on top of the card's own interactive content
                      (Link/onClick/etc.) rather than trying to disable
                      each cell type individually -- one overlay per
                      dimmed cell blocks clicks and swaps in the
                      "disabled" cursor uniformly regardless of what's
                      underneath. */}
                  {isFilteredOut && <DimmedGuard data-cursor="disabled" aria-hidden="true" />}
                </CardSurface>
                </ThemeProvider>
              </MotionCell>
            );
          })}
        </SplashGrid>
      </GridViewport>
    </SplashContainer>

    {createPortal(
      <AnimatePresence>
        {aboutOpen && (
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAboutOpen(false)}
          >
            <AboutModal layoutId="about-card" style={{ zIndex: 10 }}>
              <ModalCloseButton
                type="button"
                aria-label="Close"
                onClick={() => setAboutOpen(false)}
              >
                <FiMinimize2 />
              </ModalCloseButton>

              <ModalHeaderStack>
                <MotionModalPhoto layoutId="about-photo" src={MePhoto} alt="Dara Phillips" />
                <ModalIdentityLine>
                  <HeroName>Dara Phillips</HeroName>
                  <HeroRole>Product Designer</HeroRole>
                </ModalIdentityLine>
                <ModalMetaRow>
                  <ModalMetaItem>
                    <FiMapPin />
                    Ireland
                  </ModalMetaItem>
                  <ModalMetaItem>
                    <FiClock />
                    1 year exp.
                  </ModalMetaItem>
                </ModalMetaRow>
              </ModalHeaderStack>

              <ModalText>
                I design in Figma and build interactive products in React, with a focus
                on scalable component systems and user-centered interfaces.
              </ModalText>

              <ModalText>
                Recent projects include a Figma prototype for a medtech startup
                developed with students from the BioInnovate program, and a WordPress
                site for the Irish Bee &amp; Heritage Foundation.
              </ModalText>

              <ModalText>
                I&apos;m currently developing my skills in design systems and
                AI-assisted workflows, exploring how tools like Claude and MCPs fit
                into modern product design.
              </ModalText>

              <ModalText>
                I&apos;m freelancing with early-stage B2B startups and open to
                full-time, remote, or relocation opportunities.
              </ModalText>

              <ModalActions>
                <Button as="a" href={`mailto:${EMAIL}`} $variant="primary">
                  <FiMail />
                  Email
                </Button>
                <LinkedInButton
                  as="a"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  $variant="secondary"
                >
                  <SiLinkedin />
                  LinkedIn
                </LinkedInButton>
              </ModalActions>
            </AboutModal>
          </Backdrop>
        )}
      </AnimatePresence>,
      document.body
    )}

    {createPortal(
      <ProtectedGate
        open={!!passwordTarget}
        onClose={() => setPasswordTarget(null)}
        redirectTo={passwordTarget === "audanote" ? "/audanote" : "/orthovive"}
      />,
      document.body
    )}
    </>
  );
}
