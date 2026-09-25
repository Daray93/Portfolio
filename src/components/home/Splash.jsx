import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { css, ThemeProvider } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { lightTheme } from "../../styles/theme";
import {
  FiMaximize,
  FiMaximize2,
  FiMinimize2,
  FiMapPin,
  FiClock,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiSun,
  FiMoon,
  FiWind,
} from "react-icons/fi";
import { SiLinkedin } from "react-icons/si";
import { useThemeMode } from "../../styles/ThemeModeContext";
import { useMotionPreference } from "../../styles/MotionPreferenceContext";
import { useHomeMorphIntent } from "../../styles/HomeMorphIntentContext";
import GmailIcon from "./GmailIcon";
import Button from "../shared/Button";
import HoverCardCV from "./HoverCardCV";
import HoverCard from "./HoverCard";
import ScreenshotPanCard from "./ScreenshotPanCard";
import ProtectedGate from "../shared/ProtectedGate";
import MePhoto from "./assets/Me.png";
import neuroloopHero from "../../case-studies/neuroloop/assets/NeuroloopHero.png";
import AvocadoJumpingJack from "../../case-studies/operation-avocado/AvocadoJumpingJack";
import OrthoViveLogo from "../../case-studies/orthovive/assets/OrthoVive.png";
import IbhfCell from "../../case-studies/ibhf/assets/ibhf-cell.png";
import AudanoteLogo from "../../case-studies/audanote/assets/Audanote-logo.svg";

import kroptHeader from "../../case-studies/kropt/assets/KroptHeader.png";

const KROPT_SCREENS = [kroptHeader];
const IBHF_SCREENS = [IbhfCell];
const NEUROLOOP_SCREENS = [neuroloopHero];

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
    gap: 22px;
  }
`;

// ---------------- Shared Card ----------------

const Card = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.xxl};
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
  tall: { col: 1, row: 2 }, // phone-shaped: 2 cells merged vertically
  hero: { col: 2, row: 1 }, // 2 cells merged horizontally
  big: { col: 2, row: 2 }, // 4 cells merged -- TEMP, every project cell is trying this on for size (see CELLS)
  // Same footprint as trio -- never actually shown at this width, see
  // GridSlot's own $shape==="trioUtility" override below.
  trioUtility: { col: 1, row: 1 },
};

// Below 560px the grid switches to a 3-column track (see SplashGrid) so
// the email/LinkedIn/CV trio can share one row. Every other shape spans
// all 3 columns (full width) and gets its visible height from an
// aspect-ratio instead of a row-span, so a "tall"/"big" shape's height
// no longer depends on a second column existing to be tall relative to.
const MOBILE_SHAPE = {
  single: { col: 3, aspect: "1 / 1" },
  trio: { col: 1, aspect: "1 / 1" },
  // Same square as `single` -- "tall" only means something at desktop's
  // multi-row grid (a 1x2 phone shape). On mobile every project cell is
  // already a single full-width row regardless of shape, so keeping its
  // own taller 1/2 ratio just made Avocado/Kropt read as a different
  // size than every other project instead of a uniform row of cards.
  tall: { col: 3, aspect: "1 / 1" },
  big: { col: 3, aspect: "1 / 1" }, // same uniform mobile size as every other project cell
  hero: { col: 3, aspect: "2 / 1" }, // landscape rectangle, not a square
  // Same square trio footprint as `trio` -- each toggle (theme, reduce
  // motion) is its own cell now, joining CV in a second row-of-3 instead
  // of both sharing one slim full-width bar.
  trioUtility: { col: 1, aspect: "1 / 1" },
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
     makes the card's own content (Link/onClick/etc.) inert. Opacity
     itself is a plain inline style (not framer-motion's animate prop)
     set alongside this, so this transition is what actually animates
     the fade -- animate's opacity value was going stale on a live
     filter change (client-side nav), only reading correctly after a
     full page reload. */
  transition: opacity 0.3s ease;
  pointer-events: ${({ $dimmed }) => ($dimmed ? "none" : "auto")};

  @media (max-width: 560px) {
    grid-column: span ${({ $shape }) => MOBILE_SHAPE[$shape].col};
    grid-row: span 1;
    height: auto;
    aspect-ratio: ${({ $shape }) => MOBILE_SHAPE[$shape].aspect};
    /* Reorders the project cells for mobile only, independent of the
       desktop dense-packing sequence below (which the order property
       also feeds -- per spec, dense auto-placement processes items in
       order, then source order -- so this can't be set unconditionally
       without reshuffling the desktop mosaic too). Defaults to 0
       (source order) for every cell that doesn't set one. */
    order: ${({ $mobileOrder }) => $mobileOrder ?? 0};
  }

  /* The toggle cells (theme/motion) only make sense at the width where
     they have their own dedicated mobile chrome to sit next to (Navbar's
     bottom filter pill) -- desktop already surfaces both from Navbar's
     top bar, so these stay out of the grid entirely there rather than
     rendering as empty-looking single cells. */
  ${({ $shape }) =>
    $shape === "trioUtility" &&
    `
    display: none;

    @media (max-width: 560px) {
      display: flex;
    }
  `}
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
     interactive affordance, which these no longer are. */
  &:hover {
    transform: ${({ $dimmed }) => ($dimmed ? "none" : "translateY(-8px)")};
    box-shadow: ${({ $dimmed, theme }) => ($dimmed ? theme.shadowSm : theme.shadowLg)};
  }

  /* Every cell's actual interactive element (Link/button/role="button")
     sits inside this overflow:hidden card, so a normal focus outline or
     box-shadow ring drawn on THAT element gets clipped at exactly the
     edge this card crops -- rendered, but invisible. An INSET shadow
     can't have that problem: it never extends past this element's own
     edge in the first place, so it survives its own overflow:hidden
     regardless of what's focused inside it. :has(:focus-visible) (not
     :focus-within) so this only lights up for keyboard/programmatic
     focus, not an ordinary mouse click. */
  &:has(:focus-visible) {
    box-shadow: ${({ theme }) => theme.shadowLg}, inset 0 0 0 3px ${({ theme }) => theme.accent};
  }
`;

const CellLabel = styled.span`
  font-family: "Fraunces Variable", serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textTertiary};
`;

// ---------------- Hero content (cell 1) ----------------

const HeroInner = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  cursor: pointer;
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
  font-family: "Fraunces Variable", serif;
  font-weight: 600;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: ${({ theme }) => theme.text};
`;

const HeroRole = styled.span`
  font-family: "Geist", sans-serif;
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
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;

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
  cursor: pointer;
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
  font-family: "Geist", sans-serif;
  font-size: clamp(0.8rem, 1.8vw, 0.95rem);
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  word-break: break-word;
`;

// Generic "single brand icon, links out" cell -- LinkedIn's own idle
// themed monochrome, hover (whole card) swaps to the brand's true color.
const BrandLinkCellInner = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;

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

// ---------------- Utility row (cell 100, mobile only) ----------------
// Each toggle (theme, reduce motion) is its own grid cell now, built from
// the same Card/CardSurface chrome as every other trio cell -- this just
// fills that cell's content area, so it has no card-like chrome of its
// own (background/border/shadow/radius) to avoid doubling up with
// CardSurface's.
const UtilityButton = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: ${({ theme }) => theme.textSecondary};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover,
  &[aria-pressed="true"] {
    background: ${({ theme }) => theme.buttonGhostHoverBg};
    color: ${({ theme }) => theme.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 2px;
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

const UtilityButtonLabel = styled.span`
  font-family: "Geist", sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
`;

const LINKEDIN_BLUE = "#0a66c2";

// Same true LinkedIn blue as BrandLinkCellInner above, applied to the
// modal's LinkedIn button on hover (text + icon via currentColor).
const LinkedInButton = styled(Button)`
  &:hover:not(:disabled) {
    color: ${LINKEDIN_BLUE};
  }
`;


// ---------------- Operation Avocado (cell 6) ----------------

// Now a normal routed case study (see OperationAvocado.jsx /
// CaseStudyLayout), same shape as Kropt/Neuroloop/OrthoVive/IBHF -- was
// previously a fixed overlay grown on top of this page via a shared
// layoutId, which is why this carries its own border/background/shadow
// rather than relying on the parent CardSurface (so it looked complete
// once "detached" mid-morph). Kept as-is even though nothing detaches it
// anymore; it doesn't hurt anything sitting inside CardSurface's own
// chrome, and every other project cell type does the same.
const AvocadoCell = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.xxl};
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
  cursor: pointer;
`;

// z-index:5 on this and AvocadoOverlay below both matter: neither
// CenteredLogoLink nor AvocadoJumpingJack's own Stage sets a z-index of
// their own, so they never open a real stacking context -- without an
// explicit value here, these two would default to z-index:auto and lose
// to Rig's z-index:1 (and TimerLabel's z-index:3) despite coming later
// in the DOM, since a positioned sibling with a real z-index always
// beats one at auto regardless of source order.
const ComingSoonPill = styled.span`
  position: absolute;
  top: clamp(0.6rem, 1.5vw, 1rem);
  right: clamp(0.6rem, 1.5vw, 1rem);
  z-index: 5;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.navSurface};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textSecondary};
  font-family: "Fraunces Variable", serif;
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
  z-index: 5;
  display: flex;
  align-items: flex-end;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  pointer-events: none;

  /* Title/tag move to their own plain-text row below the image at this
     width instead (see MobileCaptionLink/Button) -- see the "Mobile work
     section" comment further up this file. */
  @media (max-width: 560px) {
    display: none;
  }
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
  font-family: "Fraunces Variable", serif;
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
  cursor: pointer;
`;

const AboutMeLogoWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Inline (not an <img src>) so its fill can track theme.text -- near-
// black in light mode, off-white in dark -- rather than staying the
// mark's original fixed blue regardless of theme.
const AboutMeLogo = styled.svg`
  width: 56px;
  height: 56px;

  path {
    fill: ${({ theme }) => theme.text};
  }

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
  font-family: "Fraunces Variable", serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.01em;
`;

const AboutMeSubtext = styled.span`
  font-family: "Geist", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
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
  border-radius: ${({ theme }) => theme.radius.xxl};
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
  cursor: pointer;

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
  font-family: "Geist", sans-serif;
  font-size: 0.8rem;
  white-space: nowrap;

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const ModalText = styled.p`
  margin: 0;
  font-family: "Geist", sans-serif;
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
// 15 trio  -- About Me (scroll-driven flight-through story -- see
//             AboutMe.jsx). Grouped with the about cluster here, not
//             "work" (where it originally landed as a placeholder before
//             it had real content) since that's what it actually is.
//             Sits fourth (with CV) rather than leading the row -- see
//             the spacer ordering note by CELLS below.
//  4 trio  -- CV / resume
//  6 tall   -- Operation Avocado (mobile web app, "coming soon")
//  5 single -- OrthoVive teaser (password-locked)
//  7 tall   -- Kropt (mobile app screenshot)
//  9 single -- IBHF (conservation WP site)
// 10 single -- Audanote (password-locked, same as OrthoVive)
//  8 single -- Neuroloop (oldest case study, a uni project -- sized down
//              from its old 2x2 "flagship" treatment so the grid's size
//              hierarchy doesn't overstate it against the newer client
//              work, and ordered last so it's the last thing down the
//              page too).

// ---------------- Mobile work section (heading + below-image captions) ----------------
// Desktop keeps every project's title/tag as an overlay on the image
// (see each card component's own Overlay). On mobile that overlay was
// competing with the photo for attention in a much smaller tile, so
// each project's caption instead renders as its own plain-text grid row
// directly below the image -- see the "caption" CELLS entries and the
// early-return branch for them in the render loop below. Both this
// heading and every caption stay display:none above 560px and take
// col:span 3 (full width) at that breakpoint, same trick as the toggle
// cells (see GridSlot/SHAPE_SPAN) -- so they add zero footprint to the
// desktop grid regardless of where they sit in the CELLS array.
const MobileSectionHeading = styled.h3`
  display: none;

  @media (max-width: 560px) {
    display: block;
    grid-column: span 3;
    /* Every about/utility cell leaves $mobileOrder unset (defaults to 0,
       see GridSlot) and every work cell/caption sits at 10-60 (see CELLS)
       -- this needs to land strictly between the two so it visually stays
       right above the work row regardless of which filter is active. It
       can't rely on DOM position to break an order 0 tie with the about
       cells (as it did with no order of its own) since the "work" filter
       reshuffles CELLS, putting this heading EARLIER in the DOM than the
       about cells it used to trail -- which flipped their tie and put the
       heading above them instead of the work section. */
    order: 5;
    margin: 2rem 0 0.25rem;
    font-family: "Fraunces Variable", serif;
    font-weight: 600;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.text};
  }
`;

// Shared layout for a caption cell, regardless of whether it renders as
// a Link (routed projects) or a button (password-gated ones) -- kept as
// a `css` block rather than one styled component so both element types
// still get real, correct semantics/behaviour instead of one being
// force-fit into the other's tag.
const mobileCaptionStyles = css`
  display: none;

  @media (max-width: 560px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    grid-column: span 3;
    width: 100%;
    padding: 0;
    margin: 0 0 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    /* Matches its own project image's $mobileOrder (see GridSlot) so it
       stays directly under that image after reordering, not the image
       that used to sit in this array position. */
    order: ${({ $order }) => $order ?? 0};
  }
`;

const MobileCaptionLink = styled(Link)`
  ${mobileCaptionStyles}
`;

const MobileCaptionButton = styled.button`
  ${mobileCaptionStyles}
`;

const MobileCaptionTitle = styled.span`
  font-family: "Fraunces Variable", serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const MobileCaptionTag = styled.span`
  width: fit-content;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: ${({ theme }) => theme.tagBg};
  color: ${({ theme }) => theme.tagText};
  border: 1px solid ${({ theme }) => theme.border};
`;

const EMAIL = "daraphillips.design@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/daraphillips01010/";

const CELLS = [
  { id: 1, shape: "hero", category: "about" },
  { id: 2, shape: "trio", category: "about" },
  { id: 3, shape: "trio", category: "about" },
  // These two spacers come BEFORE About Me/CV (rather than trailing
  // after them, as plain "fill the leftover row" filler normally would)
  // specifically so dense packing seats them at the left of row 2,
  // pushing About Me and CV to its right-hand columns instead -- About
  // totals 6 grid-units (2+1+1+1+1) on the 4-column desktop grid, two
  // short of a clean 2 rows, and without spacers *somewhere* in this
  // block dense packing would instead pull the next two cells
  // (OrthoVive, IBHF) up into that leftover space, right beside the
  // about cluster. Desktop-only (see GridSpacer); the 2-col/3-col
  // layouts never had this gap.
  { id: "spacer-about-1" },
  { id: "spacer-about-2" },
  { id: 15, shape: "trio", category: "about" },
  { id: 4, shape: "trio", category: "about" },
  // Theme/reduce-motion toggles -- mobile only (see GridSlot's own
  // $shape==="trioUtility" override), each its own trio-shaped cell so
  // they join CV in a second row-of-3 on mobile (Bio / [Email, LinkedIn,
  // About Me] / [CV, Theme, Motion]) instead of both sharing one slim
  // full-width bar with CV left stranded alone. category: "utility" so
  // they're exempt from the filter dim/reorder logic in Splash() (see
  // isVisible there) -- these aren't portfolio content, so they should
  // never fade out or be reasoned about the way a work/about card is.
  // Desktop-hidden regardless of position (see GridSlot), so where they
  // sit in this array only affects the mobile layout.
  { id: 100, shape: "trioUtility", category: "utility" },
  { id: 101, shape: "trioUtility", category: "utility" },
  // "My Work" -- mobile only (see MobileSectionHeading), sits right
  // above the project cells. Desktop-hidden regardless of array
  // position, same as the toggle cells above.
  { id: "heading-work", category: "work", heading: "My Work" },
  // TEMP: every project bumped to "big" (2x2, 4 cells) so they can be
  // compared side by side at that size before picking which (if any)
  // actually keep it -- was previously a deliberate size hierarchy
  // (tall/single mixed shapes signalling which projects mattered more),
  // see git history to restore that if this doesn't stick. Uniform
  // shapes means dense packing just fills left-to-right, top-to-bottom
  // in array order now -- 6 projects x 4 units = 24, a clean 6 rows, no
  // spacer needed.
  //
  // Each "caption" entry directly follows its own project -- mobile
  // only (see MobileCaptionLink/Button), display:none at desktop, so it
  // adds no footprint to the packing math above and can't shift it.
  // Array position now also matches mobileOrder (see GridSlot/
  // mobileCaptionStyles) exactly -- Kropt second-last, Neuroloop last,
  // on both breakpoints -- so mobileOrder is redundant here, just no
  // longer worth the risk of ripping out along with the CSS it drives.
  { id: 6, shape: "big", category: "work", mobileOrder: 10 },
  {
    id: "caption-6",
    category: "work",
    mobileOrder: 10,
    caption: { title: "Operation Avocado", tag: "Mobile Web App", to: "/operation-avocado" },
  },
  { id: 5, shape: "big", category: "work", mobileOrder: 20 },
  {
    id: "caption-5",
    category: "work",
    mobileOrder: 20,
    caption: { title: "OrthoVive", tag: "Med-Tech Case Study", password: "orthovive" },
  },
  { id: 9, shape: "big", category: "work", mobileOrder: 30 },
  {
    id: "caption-9",
    category: "work",
    mobileOrder: 30,
    caption: { title: "ibhf.ie", tag: "Conservation Case Study", to: "/ibhf" },
  },
  { id: 10, shape: "big", category: "work", mobileOrder: 40 },
  {
    id: "caption-10",
    category: "work",
    mobileOrder: 40,
    caption: { title: "Audanote", tag: "Health-Tech Case Study", password: "audanote" },
  },
  { id: 7, shape: "big", category: "work", mobileOrder: 50 },
  {
    id: "caption-7",
    category: "work",
    mobileOrder: 50,
    caption: { title: "Kropt", tag: "Ag-Tech Case Study", to: "/kropt" },
  },
  { id: 8, shape: "big", category: "work", mobileOrder: 60 },
  {
    id: "caption-8",
    category: "work",
    mobileOrder: 60,
    caption: { title: "Neuroloop", tag: "AI & VR Case Study", to: "/neuroloop" },
  },
];

// ---------------- Component ----------------

export default function Splash() {
  // The filter nav itself lives in the global Navbar now -- it drives
  // this grid through the ?filter= query param, so both stay in sync
  // regardless of which page you clicked the filter from.
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";

  // Backs the mobile-only toggle cells (100, 101, see CELLS) -- same
  // theme toggle Navbar's own ThemeToggle drives, and the app-wide
  // reduced-motion preference that gates framer-motion's MotionConfig in
  // App.jsx.
  const { mode: themeMode, toggleMode: toggleThemeMode } = useThemeMode();
  const { reduced: reducedMotion, toggleReduced: toggleReducedMotion } = useMotionPreference();

  // Drives App.jsx's HomeAnimatedPage: the About Me cell below sets this
  // true right before navigating, so Home's exit holds at opacity:1 for
  // the morph instead of fading like a plain case-study visit. Reset back
  // to false on every fresh mount of this page (landing here fresh, or
  // returning from wherever) so a later, unrelated project click in the
  // same visit doesn't inherit a stale `true` left over from a previous
  // About Me visit.
  const { setMorphing } = useHomeMorphIntent();
  useEffect(() => {
    setMorphing(false);
  }, [setMorphing]);

  // Remembered so a case study's close/collapse button can return to
  // whichever filter was actually active, instead of always landing back
  // on a hardcoded "Work" (see CaseStudyLayout / CaseStudyFab). Session-
  // scoped rather than threaded through every card's Link/navigate call
  // (there are close to a dozen entry points, including the password-
  // gated ones) -- this is the one place every filter change already
  // passes through, so it's the simplest single source of truth.
  useEffect(() => {
    try {
      sessionStorage.setItem("homeFilter", filter);
    } catch {
      // Ignore -- strict privacy settings (e.g. Safari private browsing)
      // can throw here; CaseStudyLayout's getHomeFilter() falls back to
      // "work" when nothing was stored.
    }
  }, [filter]);

  // Operation Avocado now opens as a normal routed page (see
  // OperationAvocado.jsx / CaseStudyLayout) -- same as every other case
  // study, rather than a fixed overlay grown on top of this page. It used
  // to stash the current location as router state so a background
  // Routes render could keep this page mounted underneath it; that's
  // gone now that there's no overlay to keep it mounted for.

  const [aboutOpen, setAboutOpen] = useState(false);

  // Modal focus management: without this, opening the modal leaves
  // keyboard focus on whatever was under it (the hero cell unmounts the
  // instant aboutOpen flips true, so focus was silently dropping to
  // <body>), Tab could walk out of the modal into grid content sitting
  // invisibly behind the backdrop, and closing left focus nowhere in
  // particular. aboutTriggerRef remembers whatever opened the modal
  // (HeroInner in the grid) so focus has somewhere real to return to.
  const aboutModalRef = useRef(null);
  const aboutTriggerRef = useRef(null);

  useEffect(() => {
    if (!aboutOpen) return;

    const modal = aboutModalRef.current;
    const focusable = modal
      ? modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setAboutOpen(false);
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      aboutTriggerRef.current?.focus();
    };
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
  // Remembers whichever HoverCard opened the gate, so closing it (without
  // unlocking) can return focus there -- same reasoning as
  // aboutTriggerRef above.
  const passwordTriggerRef = useRef(null);
  const closePasswordGate = () => {
    setPasswordTarget(null);
    passwordTriggerRef.current?.focus();
  };

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
            // this file needs to know about it. "heading"/"caption"
            // entries are the mobile-only work-section heading and each
            // project's below-image caption (see the "Mobile work
            // section" comment further up) -- real content, but neither
            // needs the filter-dim/card-chrome treatment every portfolio
            // cell below gets, so they're handled here too.
            if (typeof cell.id === "string") {
              if (cell.heading) {
                return <MobileSectionHeading key={cell.id}>{cell.heading}</MobileSectionHeading>;
              }
              if (cell.caption) {
                const { title, tag, to, password } = cell.caption;
                const content = (
                  <>
                    <MobileCaptionTitle>{title}</MobileCaptionTitle>
                    {tag && <MobileCaptionTag>{tag}</MobileCaptionTag>}
                  </>
                );
                return to ? (
                  <MobileCaptionLink key={cell.id} to={to} $order={cell.mobileOrder}>
                    {content}
                  </MobileCaptionLink>
                ) : (
                  <MobileCaptionButton
                    key={cell.id}
                    type="button"
                    $order={cell.mobileOrder}
                    onClick={(e) => {
                      passwordTriggerRef.current = e.currentTarget;
                      setPasswordTarget(password);
                    }}
                  >
                    {content}
                  </MobileCaptionButton>
                );
              }
              return <GridSpacer key={cell.id} aria-hidden="true" />;
            }

            const isAboutCell = cell.id === 1;
            const isVisible =
              cell.category === "utility" ||
              filter === "all" ||
              cell.category === filter;
            const filterOpacity = isVisible ? 1 : 0.35;
            const isFilteredOut = filterOpacity !== 1;
            // While the modal is open, the grid slot stays reserved (so
            // nothing else flows into it) but goes invisible -- the
            // visible card "becomes" the modal via the shared layoutId.
            const opacity = isAboutCell && aboutOpen ? 0 : filterOpacity;

            return (
              <MotionCell
                key={cell.id}
                layout
                layoutId={isAboutCell && !aboutOpen ? "about-card" : undefined}
                $shape={cell.shape}
                $mobileOrder={cell.mobileOrder}
                $dimmed={isFilteredOut}
                // pointer-events:none (GridSlot's own CSS, keyed off
                // $dimmed) only blocks the mouse -- it does nothing to
                // keyboard focus, so a filtered-out card was still fully
                // Tab-reachable and Enter-activatable despite looking
                // (and behaving, for a mouse) disabled. `inert` removes
                // it from the tab order and AT tree too, matching what
                // it already looks like.
                inert={isFilteredOut}
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
                    that only read correctly against a light card. Radius
                    is carved back out of that override (kept as the
                    AMBIENT theme's, not light's) since it's a structural
                    token, not a color one -- these two cards should still
                    square off in dark mode like every other card does.
                    The function form of `theme` passes the ambient theme
                    through unchanged for every other cell. */}
                <ThemeProvider
                  theme={(outer) =>
                    cell.id === 5 || cell.id === 10
                      ? { ...lightTheme, radius: outer.radius }
                      : outer
                  }
                >
                <CardSurface $dimmed={isFilteredOut}>
                  {isAboutCell ? (
                    !aboutOpen && (
                      <HeroInner
                        role="button"
                        tabIndex={0}
                        aria-label="Expand about me"
                        onClick={(e) => {
                          aboutTriggerRef.current = e.currentTarget;
                          setAboutOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            aboutTriggerRef.current = e.currentTarget;
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
                      onClick={(e) => {
                        passwordTriggerRef.current = e.currentTarget;
                        setPasswordTarget("orthovive");
                      }}
                    />
                  ) : cell.id === 6 ? (
                    <>
                      <Link
                        to="/operation-avocado"
                        style={{ width: "100%", height: "100%", display: "block" }}
                      >
                        <AvocadoCell>
                          <CenteredLogoLink>
                            <AvocadoJumpingJack fill rigScale={0.9} />
                          </CenteredLogoLink>
                          <ComingSoonPill>In Progress</ComingSoonPill>
                          <AvocadoOverlay>
                            <AvocadoOverlayStack>
                              <AvocadoOverlayTitle>Operation Avocado</AvocadoOverlayTitle>
                              <AvocadoOverlayTag>Mobile Web App</AvocadoOverlayTag>
                            </AvocadoOverlayStack>
                          </AvocadoOverlay>
                        </AvocadoCell>
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 7 ? (
                    <>
                      <Link
                        to="/kropt"
                        style={{ width: "100%", height: "100%", display: "block" }}
                      >
                        <ScreenshotPanCard
                          screens={KROPT_SCREENS}
                          title="Kropt Mobile App"
                          tag="Ag-Tech Case Study"
                          tagColor="#497025"
                          staticImage
                        />
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 8 ? (
                    <>
                      <Link to="/neuroloop" style={{ display: "block", width: "100%", height: "100%" }}>
                        <ScreenshotPanCard
                          screens={NEUROLOOP_SCREENS}
                          title="Neuroloop"
                          tag="AI & VR Case Study"
                          tagColor="#0c5562"
                          staticImage
                        />
                      </Link>
                      <HoverIconBadge aria-hidden="true">
                        <FiMaximize />
                      </HoverIconBadge>
                    </>
                  ) : cell.id === 9 ? (
                    <>
                      <Link
                        to="/ibhf"
                        style={{ width: "100%", height: "100%", display: "block" }}
                      >
                        <ScreenshotPanCard
                          screens={IBHF_SCREENS}
                          title="ibhf.ie"
                          tag="Conservation Case Study"
                          tagColor="#92400E"
                          staticImage
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
                      onClick={(e) => {
                        passwordTriggerRef.current = e.currentTarget;
                        setPasswordTarget("audanote");
                      }}
                    />
                  ) : cell.id === 15 ? (
                    <>
                      <Link
                        to="/about-me"
                        onClick={() => setMorphing(true)}
                        style={{ width: "100%", height: "100%", display: "block" }}
                      >
                        <AboutMeCellInner
                          layoutId="morph-about-me"
                          layout
                          transition={ABOUT_ME_MORPH_TRANSITION}
                        >
                          <AboutMeLogoWrap aria-hidden="true">
                            <AboutMeLogo viewBox="0 0 32 31" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.14062 1.9043C11.7086 -0.559795 16.5885 -1.37807 24.1777 4.08691C26.5327 5.21644 28.3858 6.86054 29.748 8.89258L29.7549 8.9043L29.7627 8.91602C31.0715 10.9006 31.8423 13.034 31.8848 15.2773L31.9971 21.2168C32.0471 23.8642 31.4359 26.9459 28.7119 28.8896V28.8867C25.7072 30.3326 22.8651 30.7333 19.8818 30.6611L19.8389 30.4854C19.7906 30.2843 19.745 30.0842 19.7012 29.8857C19.6174 29.5066 19.541 29.1322 19.4727 28.7627C19.2752 27.6266 19.1507 26.536 19.0986 25.4912C19.4843 25.7551 19.8436 25.9679 20.1768 26.1299C22.3035 27.1639 24.0826 27.2782 25.5146 26.4727C26.7014 25.8265 27.3803 24.5959 27.5508 22.7461C27.6055 22.2974 27.6282 21.81 27.6182 21.2832L27.5059 15.3438C27.4771 13.8348 26.9613 12.3205 25.959 10.8008C24.9574 9.30664 23.6554 8.1749 22.0527 7.40625C21.8149 7.29211 21.5855 7.1984 21.3652 7.12402C21.2473 7.08417 21.1315 7.04993 21.0186 7.02148C19.9227 6.74573 19.0658 7.00732 18.4482 7.80664C18.0724 6.59741 17.4522 5.64378 16.5879 4.94629C16.3981 4.79314 16.1967 4.65186 15.9834 4.52344C15.8283 4.43004 15.6665 4.344 15.499 4.26367C15.3321 4.1836 15.1684 4.1168 15.0078 4.06445C14.7517 3.98093 14.5036 3.93289 14.2637 3.91992C14.0257 3.9071 13.7952 3.92877 13.5732 3.98535C12.9611 4.12262 12.5667 4.2763 12.3906 4.44531C12.2146 4.6142 12.0765 4.76314 11.9766 4.89258L12.0312 5.04492C12.054 5.06098 12.0772 5.07734 12.0996 5.09375L12.9287 7.41016L13.2695 25.3682C13.3119 27.5985 13.8279 29.2913 14.8174 30.4473C13.0889 30.1423 11.4283 29.7164 11.0322 29.5166C10.1797 29.0866 8.77851 27.9184 8.90723 26.9678C8.11714 27.7666 6.98282 27.8297 5.50488 27.1572C3.91716 26.4346 2.62715 25.3701 1.63574 23.9639C0.643889 22.5335 0.134382 21.1075 0.107422 19.6865L0.00195312 14.123C-0.0432267 11.7388 0.650905 10.1798 2.08398 9.44727C3.51677 8.69067 5.29638 8.79636 7.42188 9.76367C7.7548 9.91521 8.11446 10.1142 8.5 10.3613C8.43707 9.1491 8.263 7.87137 7.97754 6.52832L7.16797 4.29883L8.33691 2.78613C8.59513 2.45165 8.88215 2.15235 9.14062 1.9043ZM5.5625 20.1631C5.5803 21.1023 5.81191 21.8999 6.25586 22.5557C6.72515 23.1991 7.56172 23.8312 8.7666 24.4512L8.61719 16.5752C8.52796 15.8902 8.22484 15.2746 7.70703 14.7285C7.21405 14.1699 6.45282 13.5612 5.4248 12.9023L5.5625 20.1631ZM18.7637 10.2773C19.5989 10.7301 20.2597 11.1882 20.7451 11.6523C20.9664 11.8642 21.1513 12.0778 21.2998 12.292C21.6783 12.8799 21.904 13.5748 21.9766 14.377C21.99 14.5252 21.998 14.6775 22.001 14.833L22.1475 22.5439C22.0041 22.4472 21.8655 22.3517 21.7324 22.2568C21.6199 22.1767 21.5104 22.0973 21.4053 22.0186C20.735 21.5174 20.2146 21.0456 19.8438 20.6035C19.4288 20.1432 19.1498 19.636 19.0068 19.083C18.9695 18.9387 18.9416 18.7912 18.9229 18.6406L18.7637 10.2773Z" />
                            </AboutMeLogo>
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
                  ) : cell.id === 100 ? (
                    <UtilityButton
                      type="button"
                      onClick={toggleThemeMode}
                      aria-label={
                        themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"
                      }
                    >
                      {themeMode === "dark" ? <FiSun /> : <FiMoon />}
                      <UtilityButtonLabel>Theme</UtilityButtonLabel>
                    </UtilityButton>
                  ) : cell.id === 101 ? (
                    <UtilityButton
                      type="button"
                      onClick={toggleReducedMotion}
                      aria-pressed={reducedMotion}
                      aria-label={
                        reducedMotion ? "Turn animations back on" : "Reduce motion and animations"
                      }
                    >
                      <FiWind />
                      <UtilityButtonLabel>{reducedMotion ? "Motion off" : "Motion on"}</UtilityButtonLabel>
                    </UtilityButton>
                  ) : (
                    <CellLabel>{cell.id}</CellLabel>
                  )}
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
            onClick={(e) => e.target === e.currentTarget && setAboutOpen(false)}
          >
            <AboutModal
              ref={aboutModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-modal-name"
              layoutId="about-card"
              style={{ zIndex: 10 }}
            >
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
                  <HeroName id="about-modal-name">Dara Phillips</HeroName>
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
                  <GmailIcon />
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
        onClose={closePasswordGate}
        redirectTo={passwordTarget === "audanote" ? "/audanote" : "/orthovive"}
      />,
      document.body
    )}
    </>
  );
}
