import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Text as TroikaText } from "troika-three-text";
import seagullGlb from "./flying_seagull.glb?url";
// Self-hosted already for the site's own CSS type (see GlobalStyle.jsx) --
// reused here as raw font files so the caption text below is real
// geometry in the scene (proper depth/occlusion/perspective scale)
// instead of a DOM overlay, without needing new font assets. Three
// weights for real eyebrow/heading/body hierarchy.
import manropeMedium from "@fontsource/manrope/files/manrope-latin-500-normal.woff?url";
import manropeSemibold from "@fontsource/manrope/files/manrope-latin-600-normal.woff?url";
import manropeBold from "@fontsource/manrope/files/manrope-latin-700-normal.woff?url";

// Copy node_modules/three/examples/jsm/libs/draco/ into public/draco/ --
// self-hosted to match the fonts rather than pulling a CDN. Harmless if
// the .glb turns out not to be DRACO-compressed: the decoder is only
// fetched when a compressed primitive is actually encountered.
const DRACO_DECODER_PATH = "/draco/";

// Only ever seen if WebGL fails to initialise -- the shader sky sphere
// below covers the entire frame otherwise. Kept as a cheap static
// approximation of the palette so a failed canvas degrades to something
// atmospheric rather than to the app shell's own background.
//
// z-index is 0, not negative -- a negative z-index here would paint this
// behind the app shell's own opaque background (AppWrapper in App.jsx
// fills with theme.body, the homepage's own color), not just behind the
// canvas: negative-z-index content paints before an ancestor's
// unpositioned background fill, regardless of DOM position, which is
// what made this read as "the homepage's background" instead of a sky.
const SkyBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #FFF;
`;

const CanvasEl = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
`;

// A `feTurbulence`-generated noise tile, inlined as a data URI rather
// than a shipped image -- this is pure CSS from here down (a slowly
// drifting background-position plus a gentle opacity breathe), so the
// "hazy mist" layer costs nothing in the WebGL frame budget: no extra
// render target, no per-frame JS, just a compositor-level animation the
// GPU handles independently of the Three.js scene.
const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='1240' height='1240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
const GRAIN_DATA_URL = `data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}`;

// Mist grain tuning -- the three numbers that actually control how
// visible the "hazy mist" layer reads. Edit these directly to test
// different looks (save + reload, no other changes needed):
//   MIST_OPACITY_BASE   -- opacity the instant the layer mounts
//   MIST_OPACITY_MIN/MAX -- the breathe animation's low/high ends: the
//                           layer pulses between these every 9s
const MIST_OPACITY_BASE = 0.1;
const MIST_OPACITY_MIN = 0.035;
const MIST_OPACITY_MAX = 0.2;

// Oversized (inset -10%) so the drift below never pans far enough to
// reveal a tile edge, and mix-blend-mode: overlay so it reads as
// atmospheric mist grain rather than a visible texture sitting on top
// of the scene.
const MistGrain = styled.div`
  position: fixed;
  inset: -10%;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: ${MIST_OPACITY_BASE};
  background-image: url("${GRAIN_DATA_URL}");
  background-size: 240px 240px;
  animation: aboutMeGrainDrift 50s linear infinite, aboutMeGrainBreathe 9s ease-in-out infinite;

  @keyframes aboutMeGrainDrift {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(-240px, -180px, 0);
    }
  }

  @keyframes aboutMeGrainBreathe {
    0%,
    100% {
      opacity: ${MIST_OPACITY_MIN};
    }
    50% {
      opacity: ${MIST_OPACITY_MAX};
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// The story exists twice: once as WebGL geometry (the experience) and
// once as real, ordered HTML (the content). The HTML copy is visually
// hidden but NOT aria-hidden, so assistive tech, "reader mode", and
// search crawlers get the actual narrative rather than an empty page --
// the canvas stack above is entirely aria-hidden precisely because this
// exists. If WebGL fails to initialise it un-hides and becomes the
// page's real, readable content instead of a blank sky.
const StoryText = styled.section`
  ${({ $visible }) =>
    $visible
      ? `
    position: relative;
    z-index: 2;
    max-width: 34rem;
    margin: 0 auto;
    padding: 6rem 1.5rem;
    color: #ffffff;
    text-shadow: 0 1px 12px rgba(30, 50, 80, 0.45);
  `
      : `
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  `}

  h2 {
    margin: 0 0 0.4rem;
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.2;
  }

  p {
    margin: 0 0 3rem;
    font-size: 1.05rem;
    line-height: 1.55;
  }

  b {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.85;
  }
`;

// ---------------------------------------------------------------------
// Sky palettes
// ---------------------------------------------------------------------
// The sky is the story. Eleven palettes now (up from the original six),
// crossfaded by the flight's own progress so the journey travels through
// a full day in finer steps: pale dawn -> climbing morning light -> high
// blue -> a genuinely flatter, greyer overcast drift (not just another
// blue) -> golden hour -> a lingering late-gold beat -> full sunset ->
// dusk settling -> blue hour. The six original stops are unchanged; five
// new ones are interleaved between them purely for richer variety and
// pacing, not tied to any particular chapter.
//
// Every one of these also drives the lighting and the fog, so the bird
// and the haze on the horizon are always the colour of the sky they're
// currently in -- that coupling is what stops a WebGL scene reading as
// "3D objects in front of a gradient".
//
// hemi/sun intensities are part of the palette on purpose: the overcast
// stop isn't just greyer, it's flatter-lit, with the key light pulled
// right down and the ambient hemisphere carrying more of the load.
const SKY_PALETTES = [
  // Dawn
  {
    stop: 0.0,
    zenith: 0x0d1b33,
    mid: 0x1f3f67,
    horizon: 0x8d5f42,
    glow: 0xf2a35b,
    hemi: 0.85,
    sun: 0.75,
  },

  // Climbing Light -- dawn's warmth still hanging on the horizon, but the
  // zenith already deepening toward morning blue.
  {
    stop: 0.1,
    zenith: 0x0f2c53,
    mid: 0x2a5480,
    horizon: 0x7d6b52,
    glow: 0xf5b978,
    hemi: 0.93,
    sun: 0.93,
  },

  // Bright Morning
  {
    stop: 0.20,
    zenith: 0x12335f,
    mid: 0x35689d,
    horizon: 0x6b88a5,
    glow: 0xf0c57a,
    hemi: 1.0,
    sun: 1.1,
  },

  // High Blue -- the sun keeps climbing, colour keeps saturating, the
  // morning's warm glow cooling off toward midday's pale one.
  {
    stop: 0.30,
    zenith: 0x173d6c,
    mid: 0x4276a9,
    horizon: 0x63879d,
    glow: 0xdcd6c0,
    hemi: 1.03,
    sun: 1.18,
  },

  // Midday
  {
    stop: 0.40,
    zenith: 0x1b4678,
    mid: 0x4d84b5,
    horizon: 0x5f87a4,
    glow: 0xcfe3ef,
    hemi: 1.05,
    sun: 1.25,
  },

  // Overcast Drift -- deliberately desaturated and flatter-lit (see the
  // hemi/sun note above) rather than another shade of blue, so the day
  // reads as having weather, not just a colour ramp.
  {
    stop: 0.50,
    zenith: 0x17395c,
    mid: 0x51728c,
    horizon: 0x77807c,
    glow: 0xdcccb0,
    hemi: 0.95,
    sun: 0.95,
  },

  // Golden Hour
  {
    stop: 0.60,
    zenith: 0x18365d,
    mid: 0x4d6486,
    horizon: 0x96572f,
    glow: 0xff9345,
    hemi: 0.9,
    sun: 1.15,
  },

  // Late Gold -- one extra beat of warm, saturated light before sunset's
  // deeper colours take over, rather than jumping straight there.
  {
    stop: 0.71,
    zenith: 0x152e50,
    mid: 0x46577a,
    horizon: 0xa8552b,
    glow: 0xff8340,
    hemi: 0.85,
    sun: 1.22,
  },

  // Sunset -- lands under the second-last chapter ("I'm ready to join my
  // first product team"), swapped from the original orange sunset to a
  // clean white/green so that beat reads as a distinct, fresh moment
  // rather than continuing the warm dusk ramp either side of it.
  {
    stop: 0.82,
    zenith: 0xdff2e2,
    mid: 0xa8d9a4,
    horizon: 0x5fa568,
    glow: 0xf3fff2,
    hemi: 1.0,
    sun: 1.1,
  },

  // Dusk Settle -- sunset's embers cooling into purple, a step down from
  // it before blue hour's near-night calm.
  {
    stop: 0.91,
    zenith: 0x0d1730,
    mid: 0x2e2c49,
    horizon: 0x5f3228,
    glow: 0xc25f45,
    hemi: 0.72,
    sun: 0.85,
  },

  // Blue Hour -- the flight's final beat, landing on the last chapter's
  // call to action. Swapped from a dark, near-night navy to a bright
  // light-blue/pink pastel so the journey ends on an open, hopeful note
  // instead of fading toward black.
  {
    stop: 1.0,
    zenith: 0xaee0f0,
    mid: 0xd8b8d8,
    horizon: 0xf7b8c8,
    glow: 0xfff0e8,
    hemi: 1.0,
    sun: 1.0,
  },
];

// Pre-converted once at module load. THREE.Color holds these in the
// renderer's working (linear) space, which is also the right space to
// interpolate in -- lerping sRGB values directly produces muddy
// midpoints, especially on the blue-to-orange transitions this palette
// leans on hardest.
const SKY_STOPS = SKY_PALETTES.map((palette) => ({
  stop: palette.stop,
  zenith: new THREE.Color(palette.zenith),
  mid: new THREE.Color(palette.mid),
  horizon: new THREE.Color(palette.horizon),
  glow: new THREE.Color(palette.glow),
  hemi: palette.hemi,
  sun: palette.sun,
}));

// Where the warm bloom sits on the horizon, and therefore where the key
// light comes from -- the two are deliberately the same vector, so the
// bird is always lit from the direction the sun visibly is. Slightly
// ahead and to the left of the flight's general heading (-Z).
const SUN_DIRECTION = new THREE.Vector3(-0.38, 0.16, -0.91).normalize();

const SKY_RADIUS = 1000;

// Disposes a material and every texture hanging off it -- the plain
// `material.dispose()` leaves loaded glTF textures resident in GPU
// memory, which is the expensive half on a model like this.
function disposeMaterial(material) {
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && value.isTexture) value.dispose();
  }
  material.dispose();
}

// Cheap hash-based value noise + fbm. Written out rather than pulling in
// a simplex implementation: at this scale (slow, low-contrast mottling
// across a gradient) the difference is invisible, and this avoids a
// third-party shader dependency for four lines of maths.
const NOISE_GLSL = /* glsl */ `
  float aboutMeHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float aboutMeValueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(aboutMeHash(i), aboutMeHash(i + vec2(1.0, 0.0)), u.x),
      mix(aboutMeHash(i + vec2(0.0, 1.0)), aboutMeHash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float aboutMeFbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * aboutMeValueNoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
`;

// Path now runs roughly 2x as long as a first pass, with a straight
// "cruise" point inserted after each genuine turn (see CAPTIONED_INDICES
// below) -- those cruise points aren't captioned, so they exist purely
// to stretch out the open track between one caption and the next. Still
// perfectly level (every y is 0): only ever curves left/right toward the
// horizon, never climbs or dips. Rendered directly as the white track,
// so the visible line and the model's actual flight path can never
// drift apart.
const PATH_POINTS = [
  // z pushed out from the original 60 -- every OTHER turn gets a run-up
  // (turn -> cruise -> next turn), but turn 1 had none, just a direct
  // start -> turn1 leg. That made it come up too soon. This adds real
  // straight-line distance before turn 1 (and, since every later turn is
  // still further down the same now-longer path, a smaller proportional
  // delay to each of them too) without needing to touch anything past
  // turn 1's own geometry. Pushed further still (260 wasn't enough) --
  // go higher again if turn 1 is still coming up too soon.
  new THREE.Vector3(0, 0, 550), // 0  start

  new THREE.Vector3(45, 0, -110), // 1  turn 1
  new THREE.Vector3(85, 0, -260), // 2  cruise
  new THREE.Vector3(-55, 0, -430), // 3  turn 2
  new THREE.Vector3(-90, 0, -600), // 4  cruise
  new THREE.Vector3(52, 0, -780), // 5  turn 3
  new THREE.Vector3(88, 0, -950), // 6  cruise
  new THREE.Vector3(-50, 0, -1130), // 7  turn 4
  new THREE.Vector3(-85, 0, -1300), // 8  cruise
  new THREE.Vector3(55, 0, -1480), // 9  turn 5
  new THREE.Vector3(90, 0, -1650), // 10 cruise
  new THREE.Vector3(-38, 0, -1820), // 11 turn 6
  new THREE.Vector3(0, 0, -1980), // 12 end
];

// Only these points get a caption -- the "turn" points, not the cruise
// points between them. That gap (turn -> cruise -> next turn, versus
// every point being captioned) is what actually spaces the captions out
// in scroll-time: arc-length parameterization means the more uncaptioned
// track sits between two captions, the further apart their t values end
// up, regardless of the path's raw physical length.
const CAPTIONED_POINT_INDICES = [1, 3, 5, 7, 9, 11];

const FIELD_DEPTH = 3000;

// Shared curve instance -- pure geometry math, safe to compute once at
// module load and reuse across mounts rather than rebuilding it (and the
// turn-caption search below) every time the route is visited.
const curve = new THREE.CatmullRomCurve3(PATH_POINTS, false, "catmullrom", 0.5);

// CatmullRomCurve3's getPointAt(t) is arc-length parameterized, so a
// control point's index doesn't map directly to a t value -- find the
// closest sample instead. Run once per turn at module load, not per
// frame.
function closestTOnCurve(curveArg, target, samples = 400) {
  let bestT = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const d = curveArg.getPointAt(t).distanceToSquared(target);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
    }
  }
  return bestT;
}

// ---------------------------------------------------------------------
// FADE -- captions and the model's own entry/exit. Everything here is a
// pure function of flight progress (t), so all of it is scroll-scrubbable
// rather than clock-based.
// ---------------------------------------------------------------------

// How far (in curve progress) a caption leads its turn -- it fades in as
// the camera approaches, not exactly on top of it.
const TURN_CAPTION_LEAD = 0.02;
const CAPTION_WINDOW = 0.05; // half-width of the whole fade-in/hold/fade-out window around each caption's t
const CAPTION_HOLD = 0.4; // fraction of that window held at FULL opacity, so there's a plateau to read against rather than a single peak frame
// Pulled in close to the model on purpose -- MODEL_TARGET_SIZE is 14, so
// a wingtip reaches roughly 7 units from the bird's centre; these two put
// the caption's near edge and altitude close enough that a wing all but
// grazes the text as it passes, rather than the caption floating in its
// own separate space above/beside the flight. Nudge both if the actual
// model geometry needs it tighter or looser.
const CAPTION_UP_OFFSET = new THREE.Vector3(0, 9, 0);
const CAPTION_SIDE_OFFSET = 6; // world units left/right of the track's own centerline, at caption scale 1

// The model and track fade/scale in over the first sliver of the track
// and back out over the last -- scroll back up and it un-fades, rather
// than a clock-based tween that keeps playing once triggered. Widened
// from a near-instant 0.01 so the fly-in below (ENTRY_FLYIN_DISTANCE)
// has enough scroll-room to actually read as the creature closing a
// distance, not just popping into place while it happens to be fading.
const ENTRY_FADE_END = 0.05;
// Extra distance AHEAD of its normal chase-cam position (along the
// track's own tangent) the creature starts at, easing to 0 by
// ENTRY_FADE_END -- the camera's own position/look-at stay on the
// normal chase path throughout, so the creature reads as arriving from
// deeper in the hazy distance (helped by the existing fog) and closing
// the gap into formation, rather than materialising already in place.
const ENTRY_FLYIN_DISTANCE = 70;
// Once the flight passes 90% of the track, the creature scales down and
// fades out over the remaining 10% instead of just popping out of
// existence at the very end -- onJourneyEnd (see EXIT_COMPLETE_THRESHOLD
// below) waits on this too, so leaving no longer depends on scrolling
// past whatever content sits below the flight.
const EXIT_FADE_START = 0.9;
// How close to the end of the flight's own local progress (t) counts as
// "the creature has finished disappearing" -- fires onJourneyEnd. t is
// the eased spring position, so it only asymptotically reaches 1 once
// the visitor stops scrolling at the very bottom; 0.995 keeps that
// settle time to a couple of seconds instead of a much longer tail.
const EXIT_COMPLETE_THRESHOLD = 0.995;

// Vertical gaps between the three tiers, in world units. Deliberately
// unequal and small relative to the old flat 5.5: an eyebrow belongs to
// the heading it labels, so it sits tight to it, while the body is a
// separate thought and gets the wider gap. Scaled down by the same 0.8
// factor as the font sizes below, so the gap-to-glyph-size ratio (and
// therefore the rhythm of the stack) stays the same as before, rather
// than reading as oversized once the type itself shrank.
const TIER_GAP_EYEBROW = 1.3; // eyebrow -> heading (was 1.6)
const TIER_GAP_HEADING = 2.1; // heading -> body (was 2.6)

// Per-tier font sizes -- each the ORIGINAL size x0.8, preserving the
// same size ratios between tiers (so the eyebrow/heading/body hierarchy
// reads the same, just smaller overall).
const CAPTION_EYEBROW_FONT_SIZE = 1.4; // was 1.8
const CAPTION_HEADING_FONT_SIZE = 3.8; // was 4.8
const CAPTION_BODY_FONT_SIZE = 1.8; // was 2.3

// The reference width the responsive caption scale is solved against
// (see computeViewportLayout) -- kept at the ORIGINAL heading width on
// purpose, decoupled from CAPTION_HEADING_MAX_WIDTH below. Since a
// tier's on-screen width works out to `tier.maxWidth * captionScale`,
// and captionScale itself is `target / CAPTION_SCALE_REFERENCE_WIDTH`,
// leaving this constant alone while shrinking the maxWidths below is
// what actually makes the blocks narrower on screen -- changing this
// value too would just inflate captionScale to cancel the difference
// back out, leaving the heading's on-screen width unchanged.
const CAPTION_SCALE_REFERENCE_WIDTH = 60;

// Per-tier wrap widths -- each is the ORIGINAL width reduced by a third,
// so every tier wraps into a visibly narrower column (more lines, taller
// stack) rather than just rendering smaller. The dynamic stacking below
// (measuredHeight + chained sync() callbacks) reflows to whatever height
// that produces, so this is safe to retune independently of the layout
// logic.
const CAPTION_EYEBROW_MAX_WIDTH = 37; // was 56
const CAPTION_HEADING_MAX_WIDTH = 40; // was 60
const CAPTION_BODY_MAX_WIDTH = 36; // was 54

// A faint dark halo on the glyphs. Load-bearing now that the sky travels
// through six palettes -- white type is fine against dusk but nearly
// invisible against the pale Departure horizon. Set to 0 for the
// completely unadorned look.
const CAPTION_OUTLINE_WIDTH = "1.2%";
const CAPTION_OUTLINE_COLOR = 0x2c4a6b;
const CAPTION_OUTLINE_OPACITY = 0.35;

// An about-me, told as six short chapters instead of a bullet list --
// exported shape is also what the hidden HTML fallback renders, so the
// two can never drift apart.
export const TURN_CHAPTERS = [
 {
  eyebrow: "2021 — Origin Story",
  heading: "Product designer, based in Ireland.",
  body: "I graduated from TUS Limerick with a First Class BSc in Immersive Digital Media — the kind of degree that teaches you how to think in systems, not just screens.",
},
{
  eyebrow: "2025 — First Real Test",
  heading: "One week after I finished university.",
  body: "My first project was a mobile physiotherapy app prototype in Figma. Freelance, solo, straight out of graduation. It taught me how to turn someone’s idea into something that works for real users.",
},
{
  eyebrow: "2025 — Building Altitude",
  heading: "I design in Figma & build in React.",
  body: "Since that first project, I’ve doubled down on design systems, component thinking, and folding Claude into my workflow.",
},
{
  eyebrow: "2026 — Systems Over Aesthetics",
  heading: "I learn by building things that work.",
  body: "I designed, built, and shipped my own workout app — full auth, GitHub version control, and zero paywalls. It forced me to think like a designer, developer, and product owner at the same time.",
},
{
  eyebrow: "2026 — Where I'm Heading",
  heading: "I'm ready to join my first product team.",
  body: "Until now, my work has been solo — freelance projects and learning by shipping things myself.",
},
{
  eyebrow: "2026 — Next Destination",
  heading: "Open to full-time, remote, or a reason to relocate.",
  body: "If you're building something ambitious and need someone who can design, build, and adapt at speed, reach out > daraphillips.design@gmail.com",
},
];


// `side` is which side of the track the caption sits on, in screen
// terms: the perpendicular used below is (-tangent.z, 0, tangent.x),
// which for a path travelling toward -Z resolves to world +X, and the
// chase camera looks down -Z with +Y up -- so +X is screen RIGHT.
//
// Alignment follows from that. A caption to the right of the track is
// left-aligned, so its flush edge faces the track and the ragged edge
// runs away from it; a caption to the LEFT of the track is right-
// aligned, mirroring it.
// Exported so AboutMe.jsx can plot each chapter's own `t` as a milestone
// on the page's vertical progress bar, using the exact same fraction of
// flight progress this scene fades captions in and out at.
export const TURNS = CAPTIONED_POINT_INDICES.map((pointIndex, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  return {
    ...(TURN_CHAPTERS[i] || { eyebrow: `${i + 1}`, heading: "", body: "" }),
    // Floor is CAPTION_WINDOW (plus a hair of margin), not an arbitrary
    // 0.02 -- the fade-in window extends CAPTION_WINDOW on either side of
    // a caption's t, so a t any closer than that to the flight's t = 0
    // start would already be inside its own fade-in window before the
    // user has scrolled at all.
    t: Math.max(
      CAPTION_WINDOW + 0.005,
      closestTOnCurve(curve, PATH_POINTS[pointIndex]) - TURN_CAPTION_LEAD
    ),
    side,
    align: side === 1 ? "left" : "right",
  };
});

// Model auto-fits to this size (its largest dimension, in world units)
// regardless of the glb's native scale -- safer than guessing units.
const MODEL_TARGET_SIZE = 14;

// How long (real seconds, not scroll) the creature takes to fade/scale
// in once its glb has actually finished loading -- see modelLoadFade.
const MODEL_LOAD_FADE_SECONDS = 0.6;

// The track's own tube radius -- factored out since it's also used to
// guarantee clearance between the model and the track (below).
const TRACK_RADIUS = 0.2;

// Purely a visual lift for the rendered tube mesh -- applied only to the
// track's own Object3D position, never to `curve` itself, so the
// model's flight, the camera, the captions, and the wind marks (all
// measured off curve.getPointAt/getTangentAt) are completely unaffected.
// This is what closes the gap between the track and the model from the
// track's side; modelClearance's own trimmed margin (below) closes it
// from the model's side -- see the note there for the resulting
// worst-case clearance.
const TRACK_Y_OFFSET = 4;

// The track's own peak opacity (at visibility 1), so it reads as a
// faint guide rather than a bright line competing with the model or the
// captions.
const TRACK_OPACITY_MAX = 0.1;

// Matches the clamp on `bank` below -- used to size how much extra
// clearance the model needs so a banked wingtip can't dip into the
// track mid-turn.
const MAX_BANK_ANGLE = 0.4;
const BANK_SENSITIVITY = 3.5; // radians of bank per radian of yaw change over the lookahead
const BANK_SMOOTHING = 3.5; // per-second easing rate, so the bird rolls into and out of turns rather than snapping to the clamp

// ---------------------------------------------------------------------
// CAMERA -- the chase cam behind the bird, and the dedicated shot it
// eases onto for each caption.
// ---------------------------------------------------------------------

// Chase camera geometry -- behind and a little below the model, so it
// reads from a slight low angle (looking up at it) instead of looking
// down. Distance is generous rather than a tight chase, so wide turns
// stay framed instead of clipping through the track's inside edge.
const CHASE_DISTANCE = 30;
const CHASE_HEIGHT = 0;
// Per-second easing rates, converted to an alpha each frame via
// 1 - exp(-rate * dt), so they behave identically at 60fps and 144fps.
const CHASE_SMOOTHING = 5.5;
const LOOK_SMOOTHING = 4.5;

// Roughly how far the camera sits from a caption when it's centred in
// frame. Used only to solve the responsive caption scale (see
// computeViewportLayout below); it doesn't need to be exact, just
// stable, since a per-frame solve would make the text visibly grow as
// you approach it.
const NOMINAL_CAPTION_DISTANCE = 46;

// How far below a caption's own anchor point the dedicated "reading"
// camera sits -- a small negative offset, matching CHASE_HEIGHT's slight
// low angle, so settling on a caption doesn't suddenly flatten the shot
// to dead-on eye level.
const CAPTION_CAM_HEIGHT_OFFSET = -2;

// How much the camera actually gives in toward that dedicated caption
// viewpoint at full caption opacity -- 1 fully parks the camera on the
// dedicated shot (text dead centre, see tmpCaptionCenter above), 0 never
// leaves the chase. On a wide desktop frame the model and its caption are
// both comfortably in view already, so a partial nudge is enough (the
// camera still reads as continuing its flight past the caption rather
// than detaching to hold a shot on it). On a narrow portrait phone
// there isn't room for both at once, and the text is the actual content
// here, not the bird -- so mobile goes all the way to a full lock: it
// eases onto dead centre as the caption approaches (in step with its
// opacity ramp) and eases back off the same way as it fades past. See
// computeViewportLayout, which picks between these based on aspect ratio.
const CAMERA_CAPTURE_STRENGTH_DESKTOP = 0.45;
const CAMERA_CAPTURE_STRENGTH_MOBILE = 1;

// ---------------------------------------------------------------------
// TEXT GRAVITY -- how strongly continued scrolling gets "caught" as the
// flight nears a caption, and the spring physics that drives the whole
// flight's position along the path.
// ---------------------------------------------------------------------

// The flight's position along the path behaves like a damped
// mass-on-a-spring being pulled toward wherever raw scroll currently
// points, rather than tracking it 1:1 -- scrolling gives it a nudge, it
// eases into motion, and eases back to a stop once you stop scrolling
// (or overshoots-then-settles if you flick fast), instead of snapping
// straight to the scrollbar's position.
const SPRING_STIFFNESS = 3.2;
const SPRING_DAMPING = 4.2;

// Hard ceiling on how fast the spring is ever allowed to move (progress
// per second), independent of how it got there. Without this, scrolling
// hard through a caption's gravity well (below) builds up a large gap
// between the raw scroll target and the spring's own position -- once
// gravity releases, that pent-up gap gets multiplied by full stiffness
// in one go, which is what read as the creature suddenly rocketing
// forward right after passing a caption. Clamping velocity caps that
// release at a brisk-but-controlled speed instead of a spike.
const SPRING_MAX_SPEED = 0.5;

// "Gravity" around each caption -- within this many units of path
// progress from a caption's t, the spring's pull toward the scroll
// target is weakened (down to CAPTION_GRAVITY_MIN_FACTOR right at the
// caption), so continued scrolling advances the flight much more slowly
// while there's text to read, then releases smoothly once past it.
// MIN_FACTOR is deliberately not too close to 0 -- a near-total stop
// is what let scroll input pile up into the overshoot SPRING_MAX_SPEED
// now caps; a softer slowdown means less debt builds up in the first
// place. RADIUS is wider than the fade window (CAPTION_WINDOW) so the
// slowdown/recovery itself is gradual rather than a short, sharp well.
const CAPTION_GRAVITY_RADIUS = 0.055;
const CAPTION_GRAVITY_MIN_FACTOR = 0.16;

// "Cutting through air" marks -- short white streaks spawned near the
// creature as it flies, each fading out over its own lifetime. A pooled,
// reused set (rather than creating/destroying objects continuously) to
// avoid GC churn from a system that's constantly spawning. Spawn rate
// and opacity are driven by the flight's SPEED (spring velocity), not a
// fixed clock -- so, like Atmos, the marks only really show when you're
// moving fast, and vanish when you settle at a caption.
const MARK_POOL_SIZE = 40;
const MARK_LIFETIME = 1.4; // seconds
const MARK_MIN_INTERVAL = 0.045; // fastest spawn cadence, at full speed
const MARK_MAX_INTERVAL = 0.4; // slowest cadence still worth spawning at; below the speed threshold, none spawn
// Spring velocity (units of path progress / second) that counts as
// "full speed" for the wind. Tuned to a firm scroll, not a gentle one,
// so open-track cruising shows wind and reading a caption doesn't.
const WIND_FULL_SPEED = 0.9;
const WIND_MIN_SPEED = 0.06; // below this the air is still -- no marks at all

// The seagull glb ships a real "flap" animation clip -- played on a loop
// at all times (a gliding bird never fully stops flapping) rather than
// scrubbed to scroll position like the rest of the scene, since a flap
// cycle frozen mid-frame reads as broken in a way a paused camera or
// caption doesn't. Its speed still reacts to scroll: the same windStrength
// signal driving the wind-cut marks above eases the flap rate from a lazy
// glide up to a hard beat as the flight speeds up.
const FLAP_IDLE_RATE = 0.6;
const FLAP_FULL_RATE = 2.4;

// Explicit draw order for the transparent passes, so layering is decided
// here rather than by whatever the per-frame distance sort happens to
// produce. Captions sit on top of everything.
const RENDER_ORDER = { sky: -1000, track: 0, model: 0, marks: 5, captions: 10 };

/**
 * Fixed full-viewport Three.js scene: a shader sky sphere whose palette
 * travels with the journey, a visible white track (a tube along the
 * flight path) that a loaded .glb creature follows above (never touching
 * it), chased by the camera, with speed-driven wind-cut marks trailing it
 * and floating caption groups (eyebrow / heading / body, offset to
 * alternating sides of the track and aligned toward it) that appear just
 * before each turn -- scrolling through one feels weighted, like gravity
 * pulling against continued progress, so there's time to read it.
 *
 * The sky's current palette also drives the hemisphere light, the key
 * light, and the fog colour, so the creature and the haze on the horizon
 * are always the colour of the sky they're in.
 *
 * Everything is driven by the flight's own local scroll progress
 * (`flightProgressRef`) so the pace is set purely by however tall that
 * page region is. `onJourneyEnd` fires once the creature has finished
 * scaling down and fading out at the end of that same local progress
 * (see EXIT_FADE_START/EXIT_COMPLETE_THRESHOLD) -- leaving no longer
 * depends on scrolling past whatever content sits below the flight.
 *
 * The progress value is read every animation frame off a plain ref
 * rather than passed as a prop, so scrolling doesn't trigger a React
 * re-render on every tick.
 */
export default function AboutMeScene({ flightProgressRef, onJourneyEnd }) {
  const canvasRef = useRef(null);
  const onJourneyEndRef = useRef(onJourneyEnd);
  onJourneyEndRef.current = onJourneyEnd;
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setWebglFailed(true); // reveals the HTML story below instead of a blank sky
      return undefined;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Async work (the two glTF loads, troika's sync passes) can resolve
    // after an unmount -- adding to a torn-down scene at that point
    // leaks whatever was loaded.
    let disposed = false;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = (event) => {
      reducedMotion = event.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    const scene = new THREE.Scene();
    // Fog colour is no longer a constant -- it's re-sampled from the
    // current palette's horizon colour every frame (below), so distant
    // geometry always dissolves into exactly the tone the sky is at
    // that moment rather than into a fixed guess. This is a single
    // scene-wide value, so it can't grade with height; the horizon
    // colour is the right choice because that's where distant geometry
    // actually vanishes.
    //
    // Deliberately hazy rather than clear: fog starts close and finishes
    // well short of FIELD_DEPTH, so geometry dissolves into the horizon
    // much sooner than a "see forever" distance would.
    scene.fog = new THREE.Fog(0xffffff, 45, 1300);

    const camera = new THREE.PerspectiveCamera(
      10,
      window.innerWidth / window.innerHeight,
      0.1,
      FIELD_DEPTH + 200
    );
    camera.position.set(0, CHASE_HEIGHT, 40 + CHASE_DISTANCE);

    // ---------------- sky ----------------
    // An inward-facing sphere, coloured entirely in the fragment shader
    // from the ray direction, and re-centred on the camera every frame
    // so it can never be flown out of. depthTest is off and it draws
    // first, which is the standard skybox trick: it becomes a background
    // that nothing has to sort against, and its radius stops mattering.

    const skyUniforms = {
      uZenith: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uGlowDir: { value: new THREE.Vector3(SUN_DIRECTION.x, 0, SUN_DIRECTION.z).normalize() },
      uTime: { value: 0 },
    };

    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          // The sphere is never rotated, only translated to follow the
          // camera, so the local position doubles as the world-space
          // view direction -- the horizon stays pinned to world y = 0
          // instead of tumbling with the camera.
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uZenith;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        uniform vec3 uGlowDir;
        uniform float uTime;
        varying vec3 vDir;

        ${NOISE_GLSL}

        void main() {
          float h = vDir.y;

          // Three vertical stops, smoothstepped rather than linearly
          // mixed, with the tightest transition near the horizon --
          // that's where a real sky compresses the most, and where a
          // linear ramp reads most obviously as a CSS gradient.
          vec3 col = mix(uHorizon, uMid, smoothstep(-0.22, 0.10, h));
          col = mix(col, uZenith, smoothstep(0.05, 0.62, h));

          // Warm bloom, strongest low in the sky and in the sun's
          // direction. Flattening vDir to the XZ plane first means the
          // bloom is a horizontal bearing, so it stays put on the
          // horizon rather than following the camera's pitch.
          vec3 flatDir = normalize(vec3(vDir.x, 0.0, vDir.z) + 1e-5);
          float bearing = pow(max(dot(flatDir, uGlowDir), 0.0), 2.5);
          float band = 1.0 - smoothstep(-0.16, 0.38, h);
          col = mix(col, uGlow, bearing * band * 0.8);
          // A weaker bloom right along the horizon in every direction,
          // so the sun isn't the only warm thing down there.
          col = mix(col, uGlow, (1.0 - smoothstep(-0.06, 0.20, h)) * 0.22);

          // Slow mottling. Dividing xz by the vertical component fakes a
          // flat cloud plane overhead, which stretches the noise toward
          // the horizon the way real high cloud does, instead of the
          // even speckle a straight spherical mapping gives.
          vec2 np = vDir.xz / (abs(vDir.y) + 0.42);
          float n = aboutMeFbm(np * 1.6 + vec2(uTime * 0.012, uTime * 0.006));
          col *= 0.94 + 0.13 * n;

          gl_FragColor = vec4(col, 1.0);
          // NOTE: on three < r152 this chunk is named <encodings_fragment>.
          #include <colorspace_fragment>

          // Ordered-ish dither at 1/255. A full-screen gradient this
          // smooth will band visibly on 8-bit displays without it.
          gl_FragColor.rgb += (aboutMeHash(gl_FragCoord.xy) - 0.5) / 255.0;
        }
      `,
    });

    const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(SKY_RADIUS, 32, 24), skyMaterial);
    skyMesh.renderOrder = RENDER_ORDER.sky;
    skyMesh.frustumCulled = false;
    scene.add(skyMesh);

    // Reusable colour scratch, so sampling the palette every frame
    // doesn't allocate.
    const paletteZenith = new THREE.Color();
    const paletteMid = new THREE.Color();
    const paletteHorizon = new THREE.Color();
    const paletteGlow = new THREE.Color();
    let paletteHemi = 1;
    let paletteSun = 1;

    function samplePalette(progress) {
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      let i = 0;
      while (i < SKY_STOPS.length - 2 && p > SKY_STOPS[i + 1].stop) i++;
      const a = SKY_STOPS[i];
      const b = SKY_STOPS[i + 1];
      // Smoothstepped so palettes ease into each other -- a linear
      // crossfade makes the handover point itself visible as a moment
      // where the sky changes speed.
      const local = THREE.MathUtils.smoothstep(p, a.stop, b.stop);
      paletteZenith.copy(a.zenith).lerp(b.zenith, local);
      paletteMid.copy(a.mid).lerp(b.mid, local);
      paletteHorizon.copy(a.horizon).lerp(b.horizon, local);
      paletteGlow.copy(a.glow).lerp(b.glow, local);
      paletteHemi = THREE.MathUtils.lerp(a.hemi, b.hemi, local);
      paletteSun = THREE.MathUtils.lerp(a.sun, b.sun, local);
    }

    // ---------------- lighting ----------------
    // Both lights are re-tinted from the palette every frame, which is
    // the whole trick: the bird is never lit by anything the sky isn't
    // currently doing.

    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    // Direction is position-minus-target and the target defaults to the
    // origin, so this is set once -- no per-frame work needed to keep
    // the key light aimed consistently with the sky's warm bloom.
    sun.position.copy(SUN_DIRECTION).multiplyScalar(500);
    scene.add(sun);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // ---------------- flight path track ----------------
    // A real, visible guide rail -- a thin THREE.Line would render at
    // 1px regardless of linewidth on most GPUs/browsers, so a solid tube
    // reads as an actual "thick white line" instead.

    const trackGeometry = new THREE.TubeGeometry(curve, 320, TRACK_RADIUS, 8, false);
    const trackMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: true,
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.y = TRACK_Y_OFFSET;
    track.renderOrder = RENDER_ORDER.track;
    scene.add(track);

    // ---------------- turn captions ----------------
    // Real 3D text (troika-three-text -- SDF glyphs on actual mesh
    // geometry), not a DOM overlay tricked into following a projected
    // point: each caption is a group of three (eyebrow/heading/body),
    // offset to one side of the track and aligned toward it.

    // Fixed vertical offsets between tiers don't work here -- at these
    // font sizes/widths the heading routinely wraps to 2-3 lines. Each
    // tier is anchored by its own TOP edge and the next tier's position
    // is only set once troika reports that tier's measured height (via
    // sync()'s callback + textRenderInfo), chaining eyebrow -> heading
    // -> body since sync() is asynchronous. Once the last one lands, the
    // whole stack is shifted so it's vertically CENTRED on its world
    // anchor rather than hanging below it.
    function measuredHeight(text) {
      const bounds = text.textRenderInfo?.blockBounds;
      return bounds ? bounds[3] - bounds[1] : text.fontSize * 1.3;
    }

    function makeCaptionText({
      content,
      fontUrl,
      fontSize,
      letterSpacing = 0,
      color,
      maxWidth,
      align,
    }) {
      const text = new TroikaText();
      text.text = content;
      text.font = fontUrl;
      text.fontSize = fontSize;
      text.letterSpacing = letterSpacing;
      text.maxWidth = maxWidth;
      text.lineHeight = 1.3;
      // Both, together: textAlign sets the ragged edge within the block,
      // anchorX sets which edge the block hangs off its own origin. All
      // three tiers share one flush edge -- the one facing the track.
      text.textAlign = align;
      text.anchorX = align;
      text.anchorY = "top";
      text.color = color;
      text.outlineWidth = CAPTION_OUTLINE_WIDTH;
      text.outlineColor = CAPTION_OUTLINE_COLOR;
      text.outlineOpacity = CAPTION_OUTLINE_OPACITY;
      text.renderOrder = RENDER_ORDER.captions;
      // troika's Text mesh has no glyph geometry until its first sync()
      // resolves (async -- goes through a worker), but it's added to the
      // scene immediately below. Left visible, the renderer would attempt
      // to draw it in that gap with an InstancedBufferGeometry that has no
      // glyph-instance data bound yet, which is what read as flickering,
      // overlapping "z-fighting" text right from the first frame,
      // regardless of scroll position. Flipped back on in makeCaptionText's
      // own sync callback, once real geometry exists.
      text.visible = false;
      return text;
    }

    // troika's `.material` getter returns a single material normally, but
    // an array of [outlineMaterial, fillMaterial] whenever outlineWidth is
    // set (as it is here) -- every caller needs to handle both shapes, or
    // property writes silently land on a throwaway array instead of the
    // real material(s).
    function forEachCaptionMaterial(text, fn) {
      const material = text.material;
      if (Array.isArray(material)) {
        material.forEach(fn);
      } else {
        fn(material);
      }
    }

    function finalizeCaptionMaterial(text) {
      // troika builds the mesh's material as part of sync -- material
      // properties are only safe to touch once that's actually run.
      forEachCaptionMaterial(text, (material) => {
        material.transparent = true;
        material.depthWrite = false;
        material.opacity = 0;
        material.fog = true;
      });
    }

    const captionGroups = TURNS.map((turn) => {
      const group = new THREE.Group();
      const stack = new THREE.Group(); // shifted after measurement to centre the block on the anchor
      group.add(stack);

      const eyebrow = makeCaptionText({
        content: turn.eyebrow,
        fontUrl: manropeSemibold,
        fontSize: CAPTION_EYEBROW_FONT_SIZE,
        letterSpacing: 0.12,
        color: 0xffffff,
        maxWidth: CAPTION_EYEBROW_MAX_WIDTH,
        align: turn.align,
      });
      const heading = makeCaptionText({
        content: turn.heading,
        fontUrl: manropeBold,
        fontSize: CAPTION_HEADING_FONT_SIZE,
        color: 0xffffff,
        maxWidth: CAPTION_HEADING_MAX_WIDTH,
        align: turn.align,
      });
      const body = makeCaptionText({
        content: turn.body,
        fontUrl: manropeMedium,
        fontSize: CAPTION_BODY_FONT_SIZE,
        color: 0xffffff,
        maxWidth: CAPTION_BODY_MAX_WIDTH,
        align: turn.align,
      });
      stack.add(eyebrow, heading, body);
      scene.add(group);

      eyebrow.position.y = 0;
      eyebrow.sync(() => {
        if (disposed) return;
        finalizeCaptionMaterial(eyebrow);
        eyebrow.visible = true;
        heading.position.y = eyebrow.position.y - measuredHeight(eyebrow) - TIER_GAP_EYEBROW;
        heading.sync(() => {
          if (disposed) return;
          finalizeCaptionMaterial(heading);
          heading.visible = true;
          body.position.y = heading.position.y - measuredHeight(heading) - TIER_GAP_HEADING;
          body.sync(() => {
            if (disposed) return;
            finalizeCaptionMaterial(body);
            body.visible = true;
            stack.position.y = -(body.position.y - measuredHeight(body)) / 2;
          });
        });
      });

      return { group, stack, eyebrow, heading, body };
    });

    // ---------------- wind-cut marks ----------------

    const markGroup = new THREE.Group();
    scene.add(markGroup);
    const markPool = Array.from({ length: MARK_POOL_SIZE }, () => {
      const markGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.8, 0, 0),
        new THREE.Vector3(1.8, 0, 0),
      ]);
      const markMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(markGeometry, markMaterial);
      line.visible = false;
      line.renderOrder = RENDER_ORDER.marks;
      markGroup.add(line);
      return { line, markGeometry, markMaterial, life: 0 };
    });
    let nextMarkIndex = 0;
    let markSpawnTimer = 0;

    // ---------------- creature ----------------

    let model = null;
    const modelMaterials = [];
    // Fallback until the model's actually loaded and its real geometry
    // can be measured -- the model isn't rendered until then anyway, so
    // this default is never actually visible.
    let modelClearance = 10;
    // The model's fitted scale (MODEL_TARGET_SIZE / maxDim), reapplied
    // every frame multiplied by `visibility` -- entry/exit is a scale
    // tween as well as an opacity fade, not just a fade, so the creature
    // visibly shrinks away at the end of the track rather than just
    // fading out at a constant size.
    let modelBaseScale = 1;
    let flapMixer = null;
    // 0..1, a real-time ramp starting the frame the model is actually
    // added to the scene -- separate from `visibility`, which is purely
    // a function of scroll position. Without this, a model that finishes
    // loading (glb fetch + DRACO decode) after the visitor has already
    // scrolled past ENTRY_FADE_END pops in at full opacity/size the
    // instant it's ready, instead of fading in like it does on a fast
    // connection. No visible loading UI to match it (a spinner while
    // scrolling through empty sky reads as more broken, not less) -- this
    // just guarantees the creature's OWN entrance always fades, whenever
    // it actually finishes loading.
    let modelLoadFade = 0;

    loader.load(
      seagullGlb,
      (gltf) => {
        if (disposed) return; // unmounted mid-load -- adding now would leak the whole model
        model = gltf.scene;

        // Box3().setFromObject measures WORLD-space bounds -- exported
        // glTF files frequently bake a nonzero position onto the root
        // node (the artist's own scene origin, not necessarily the
        // mesh's center), which would silently throw off every
        // "distance from origin" measurement below. Zeroing it first
        // guarantees those measurements are actually relative to the
        // pivot this code repositions every frame -- this was the real
        // cause of the model dipping below the track.
        model.position.set(0, 0, 0);
        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        modelBaseScale = MODEL_TARGET_SIZE / maxDim;
        model.scale.setScalar(modelBaseScale);
        model.updateMatrixWorld(true);

        // Clearance has to survive every future rotation the model gets
        // (lookAt reorienting it to face the tangent, plus the artistic
        // bank/roll) -- measuring just its resting vertical extent isn't
        // enough, since lookAt rotates around the model's own local axes
        // and the glb's "down" doesn't necessarily line up with world
        // "down" once rotated. Instead, find the farthest any point on
        // the mesh sits from the model's own origin -- a distance
        // rotation can never change -- and lift by that much plus a
        // margin. That guarantees clearance in every orientation.
        const scaledBox = new THREE.Box3().setFromObject(model);
        const corners = [
          [scaledBox.min.x, scaledBox.min.y, scaledBox.min.z],
          [scaledBox.min.x, scaledBox.min.y, scaledBox.max.z],
          [scaledBox.min.x, scaledBox.max.y, scaledBox.min.z],
          [scaledBox.min.x, scaledBox.max.y, scaledBox.max.z],
          [scaledBox.max.x, scaledBox.min.y, scaledBox.min.z],
          [scaledBox.max.x, scaledBox.min.y, scaledBox.max.z],
          [scaledBox.max.x, scaledBox.max.y, scaledBox.min.z],
          [scaledBox.max.x, scaledBox.max.y, scaledBox.max.z],
        ];
        const maxRadiusFromOrigin = corners.reduce(
          (max, [x, y, z]) => Math.max(max, Math.hypot(x, y, z)),
          0
        );
        // The margin here is trimmed from the original 2 to 1.5 (the
        // model sits a little lower relative to y = 0), and TRACK_Y_OFFSET
        // separately lifts the rendered track mesh by 1 -- net worst-case
        // clearance between the two is 1.5 - 1 = 0.5, comfortably above
        // zero, rather than the two changes stacking to close the gap
        // entirely.
        modelClearance = maxRadiusFromOrigin + TRACK_RADIUS + 1.5;

        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.renderOrder = RENDER_ORDER.model;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              mat.transparent = true;
              mat.opacity = 0;
              mat.fog = true;
              modelMaterials.push(mat);
            });
          }
        });

        scene.add(model);

        const flapClip = gltf.animations.find((clip) => clip.name === "flap");
        if (flapClip) {
          flapMixer = new THREE.AnimationMixer(model);
          flapMixer.clipAction(flapClip).play();
        }
      },
      undefined,
      (err) => {
        console.warn("About Me: failed to load creature model", err); // eslint-disable-line no-console
      }
    );

    let frameId = 0;
    let journeyEnded = false;

    // Responsive captions. The camera's fov is VERTICAL, so on a
    // portrait phone the horizontal field collapses and a 60-unit-wide
    // text block runs off both edges. Rather than rebuilding the text
    // geometry on every resize, solve a uniform scale for the caption
    // groups (and scale their lateral offset to match) against how wide
    // the frame actually is at a caption's typical distance. Recomputed
    // on resize only -- a per-frame solve would make the text visibly
    // grow as you fly toward it.
    let captionScale = 1;
    let captionSideOffset = CAPTION_SIDE_OFFSET;
    // Recomputed alongside captionScale below, off the same portrait
    // check already used for the FOV widen -- a narrow phone frame
    // doesn't have room to show the model and its caption at once, so it
    // gets the much stronger capture value.
    let captureStrength = CAMERA_CAPTURE_STRENGTH_DESKTOP;

    const computeViewportLayout = () => {
      const aspect = window.innerWidth / window.innerHeight;
      const isPortrait = aspect < 1;
      camera.fov = isPortrait ? 74 : 60; // widen the lens on portrait so the sky doesn't read as a letterbox
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      captureStrength = isPortrait ? CAMERA_CAPTURE_STRENGTH_MOBILE : CAMERA_CAPTURE_STRENGTH_DESKTOP;

      const halfWidth =
        NOMINAL_CAPTION_DISTANCE * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect;
      captionScale = THREE.MathUtils.clamp(
        (halfWidth * 2 * 0.82) / CAPTION_SCALE_REFERENCE_WIDTH,
        0.34,
        1
      );
      captionSideOffset = CAPTION_SIDE_OFFSET * captionScale;
    };

    const onResize = () => {
      computeViewportLayout();
      // Reapplied here, not just at init -- dragging the window to a
      // monitor with a different DPR changes devicePixelRatio.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      // `false` -- only resize the drawing buffer, don't let three set an
      // inline canvas.style.width/height in fixed pixels (its default).
      // That inline size would override CanvasEl's own 100%/100% CSS and
      // stick at whatever window.innerWidth/innerHeight were at the last
      // resize event, which is exactly what read as a hard line down one
      // edge once the real viewport (a scrollbar appearing, mobile
      // browser chrome show/hide) no longer matched it.
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };

    onResize();
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let elapsedTotal = 0;
    let springPos = 0;
    let springVel = 0;
    let springInitialized = false;
    let smoothedBank = 0;
    const UP = new THREE.Vector3(0, 1, 0);
    const tmpLookTarget = new THREE.Vector3();
    const tmpCamPos = new THREE.Vector3();
    const tmpElevated = new THREE.Vector3();
    const tmpPerp = new THREE.Vector3();
    const tmpSpawnPos = new THREE.Vector3();
    const tmpCaptionAnchor = new THREE.Vector3();
    const tmpActiveCaptionPos = new THREE.Vector3();
    const tmpActiveCaptionCamPos = new THREE.Vector3();
    const tmpDesiredLook = new THREE.Vector3();
    const smoothedLook = new THREE.Vector3();
    let lookInitialized = false;
    const AXIS_X = new THREE.Vector3(1, 0, 0);
    const AXIS_Z = new THREE.Vector3(0, 0, 1);
    const tmpCaptionFront = new THREE.Vector3();
    // tmpCaptionAnchor is the block's flush (near) edge, not its visual
    // middle -- text extends away from the track from there, so framing
    // on the anchor left the block sitting off to one side of the shot
    // instead of centred. This measures the block's REAL world-space
    // centre off its actual rendered geometry instead.
    const tmpCaptionBox = new THREE.Box3();
    const tmpCaptionCenter = new THREE.Vector3();

    // Gentle vertical drift, like a bird riding air currents rather than
    // flying a perfectly rigid line -- applied only to the model's own
    // rendered position (not the shared path reference the camera and
    // marks use), so the camera stays smooth while just the creature
    // bobs.
    const BOB_AMPLITUDE = 0.9;
    const BOB_SPEED = 0.14;

    // Sub-stepped at a fixed timestep -- a spring integrated with a
    // large/variable dt (e.g. after a dropped frame) can overshoot
    // wildly or go unstable, so real elapsed time is consumed in fixed
    // slices instead of one big variable step.
    const SPRING_STEP = 1 / 120;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const frameDt = clock.getDelta();
      elapsedTotal += frameDt;

      const targetT = THREE.MathUtils.clamp(flightProgressRef.current ?? 0, 0, 1);
      if (!springInitialized) {
        // Snap on the very first frame -- e.g. a reload that restores a
        // mid-page scroll position shouldn't play a catch-up animation
        // from the very start of the path.
        springPos = targetT;
        springInitialized = true;
      } else if (reducedMotion) {
        // No spring, no overshoot, no lag: progress tracks scroll
        // directly. The caption gravity is a motion effect too, so it
        // goes with it.
        springPos = targetT;
        springVel = 0;
      } else {
        let remaining = Math.min(frameDt, 0.25); // clamp a huge stall (tab backgrounded, etc.)
        while (remaining > 0) {
          const step = Math.min(SPRING_STEP, remaining);

          // "Gravity" near a caption -- weaken the spring's pull toward
          // the scroll target the closer the current position is to a
          // caption's t, so scrolling through the text advances the
          // flight much more slowly than it does on open track.
          let nearestCaptionDistance = Infinity;
          for (const turn of TURNS) {
            const d = Math.abs(springPos - turn.t);
            if (d < nearestCaptionDistance) nearestCaptionDistance = d;
          }
          const gravityEase = THREE.MathUtils.smoothstep(
            nearestCaptionDistance,
            0,
            CAPTION_GRAVITY_RADIUS
          );
          const stiffness =
            SPRING_STIFFNESS * THREE.MathUtils.lerp(CAPTION_GRAVITY_MIN_FACTOR, 1, gravityEase);

          const force = (targetT - springPos) * stiffness - springVel * SPRING_DAMPING;
          springVel += force * step;
          springVel = THREE.MathUtils.clamp(springVel, -SPRING_MAX_SPEED, SPRING_MAX_SPEED);
          springPos += springVel * step;
          remaining -= step;
        }
        springPos = THREE.MathUtils.clamp(springPos, 0, 1);
      }
      const t = THREE.MathUtils.clamp(springPos, 0, 1);
      // How fast the flight is actually moving along the path, as a
      // 0..1 wind strength. This is the speed signal Atmos drives its
      // wind particles from -- fast scroll = visible air, settling at a
      // caption = still air.
      const speed = Math.abs(springVel);
      const windStrength = THREE.MathUtils.smoothstep(speed, WIND_MIN_SPEED, WIND_FULL_SPEED);

      // ---- sky, lights and fog, all off one palette sample ----
      samplePalette(t);
      skyUniforms.uZenith.value.copy(paletteZenith);
      skyUniforms.uMid.value.copy(paletteMid);
      skyUniforms.uHorizon.value.copy(paletteHorizon);
      skyUniforms.uGlow.value.copy(paletteGlow);
      if (!reducedMotion) skyUniforms.uTime.value = elapsedTotal;
      hemi.color.copy(paletteMid);
      hemi.groundColor.copy(paletteGlow);
      hemi.intensity = paletteHemi;
      sun.color.copy(paletteGlow);
      sun.intensity = paletteSun;
      scene.fog.color.copy(paletteHorizon);

      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      tmpElevated.copy(point).addScaledVector(UP, modelClearance);

      // Entry/exit fade purely as a function of scroll position (t) --
      // scrubbable in both directions, no independent timer.
      let visibility = 1;
      if (t < ENTRY_FADE_END) {
        visibility = t / ENTRY_FADE_END;
      } else if (t > EXIT_FADE_START) {
        visibility = 1 - (t - EXIT_FADE_START) / (1 - EXIT_FADE_START);
      }
      visibility = THREE.MathUtils.clamp(visibility, 0, 1);

      trackMaterial.opacity = visibility * TRACK_OPACITY_MAX;

      if (model) {
        if (modelLoadFade < 1) {
          // Reduced motion still gets a fade -- just an instant one --
          // rather than skipping the ramp and popping in, since this
          // isn't the kind of parallax/bounce reduced-motion users are
          // opting out of, just an entrance that always needs to resolve
          // to fully visible somehow.
          modelLoadFade = reducedMotion ? 1 : Math.min(1, modelLoadFade + frameDt / MODEL_LOAD_FADE_SECONDS);
        }

        model.position.copy(tmpElevated);
        // Flying in: only during the entry window (t can go back into it
        // on an upward scroll, same as everything else here), so this
        // never fires again once the creature has actually arrived.
        if (t < ENTRY_FADE_END) {
          model.position.addScaledVector(tangent, ENTRY_FLYIN_DISTANCE * (1 - visibility));
        }
        // Built off the creature's OWN (possibly offset) position rather
        // than tmpElevated directly, so it keeps facing forward along the
        // track during the fly-in instead of looking back toward where
        // it "should" be.
        tmpLookTarget.copy(model.position).add(tangent);
        model.lookAt(tmpLookTarget);
        // If the creature appears to fly backwards once you see it move,
        // the glb's forward axis doesn't match lookAt's assumption --
        // uncomment to flip it 180 degrees.
        // model.rotateY(Math.PI);

        // Bank into turns, measured as the signed change in HEADING (yaw
        // about the world up axis) over a short lookahead -- works on
        // any heading, unlike a raw tangent.x difference. Smoothed so
        // the roll eases in and out of a turn instead of snapping
        // straight to the clamp.
        const aheadTangent = curve.getTangentAt(Math.min(1, t + 0.01)).normalize();
        const yaw = Math.atan2(tangent.x, tangent.z);
        const aheadYaw = Math.atan2(aheadTangent.x, aheadTangent.z);
        // Wrap the difference into -PI..PI so crossing the atan2 seam
        // doesn't read as a violent full-circle turn.
        const rawDelta = aheadYaw - yaw;
        const yawDelta = Math.atan2(Math.sin(rawDelta), Math.cos(rawDelta));
        const targetBank = THREE.MathUtils.clamp(
          -yawDelta * BANK_SENSITIVITY,
          -MAX_BANK_ANGLE,
          MAX_BANK_ANGLE
        );
        smoothedBank = THREE.MathUtils.lerp(
          smoothedBank,
          targetBank,
          1 - Math.exp(-BANK_SMOOTHING * frameDt)
        );
        model.rotateZ(smoothedBank);

        // Applied after lookAt/bank, not folded into tmpElevated before
        // them -- doing it earlier fed a bobbing position into lookAt
        // while the look target stayed flat, which pitched the nose up
        // and down each cycle instead of translating the whole model
        // vertically.
        if (!reducedMotion) {
          model.position.y += Math.sin(elapsedTotal * BOB_SPEED) * BOB_AMPLITUDE;
        }

        // Scale is tied to the same visibility curve as opacity, so the
        // creature shrinks away at the end of the track (and grows in at
        // the very start) instead of fading at a constant size. Also
        // multiplied by modelLoadFade, so a model that finishes loading
        // after the visitor has already scrolled past ENTRY_FADE_END
        // still fades/scales in over MODEL_LOAD_FADE_SECONDS instead of
        // snapping straight to whatever `visibility` already is.
        const effectiveVisibility = visibility * modelLoadFade;
        model.scale.setScalar(modelBaseScale * effectiveVisibility);

        // depthWrite is only a problem while the model is semi-
        // transparent; leaving it off at full opacity made the bird's
        // own geometry sort against itself. Toggled rather than
        // `transparent`, which would force a shader recompile mid-fade.
        const opaque = effectiveVisibility > 0.99;
        modelMaterials.forEach((mat) => {
          mat.opacity = effectiveVisibility;
          mat.depthWrite = opaque;
        });
      }

      if (flapMixer) {
        flapMixer.timeScale = THREE.MathUtils.lerp(
          FLAP_IDLE_RATE,
          FLAP_FULL_RATE,
          reducedMotion ? 0 : windStrength
        );
        flapMixer.update(frameDt);
      }

      // ---- wind-cut marks: cadence and opacity both scale with speed ----
      // At a standstill (reading a caption) the air is still; a firm
      // scroll fills it with streaks. The interval shortens as speed
      // rises, so fast motion doesn't just make brighter marks, it makes
      // MORE of them.
      markSpawnTimer += frameDt;
      const spawnInterval = THREE.MathUtils.lerp(MARK_MAX_INTERVAL, MARK_MIN_INTERVAL, windStrength);
      if (
        !reducedMotion &&
        visibility > 0.05 &&
        windStrength > 0.01 &&
        markSpawnTimer >= spawnInterval
      ) {
        markSpawnTimer = 0;
        const slot = markPool[nextMarkIndex];
        nextMarkIndex = (nextMarkIndex + 1) % MARK_POOL_SIZE;
        slot.life = MARK_LIFETIME;
        slot.birthWind = windStrength; // remembered so a streak keeps the intensity it was born at as it ages

        tmpPerp.set(-tangent.z, 0, tangent.x).normalize();
        tmpSpawnPos
          .copy(tmpElevated)
          .addScaledVector(tangent, -4)
          .addScaledVector(tmpPerp, (Math.random() - 0.5) * 7);
        tmpSpawnPos.y += (Math.random() - 0.5) * 5;

        slot.line.position.copy(tmpSpawnPos);
        slot.line.quaternion.setFromUnitVectors(AXIS_X, tangent);
        slot.line.visible = true;
      }
      markPool.forEach((mark) => {
        if (mark.life <= 0) return;
        mark.life -= frameDt;
        if (mark.life <= 0) {
          mark.line.visible = false;
          mark.markMaterial.opacity = 0;
        } else {
          mark.markMaterial.opacity =
            (mark.life / MARK_LIFETIME) * 0.75 * visibility * (mark.birthWind ?? 1);
        }
      });

      // Fires once the creature has finished scaling down and fading out
      // at the end of the flight's own local progress -- no longer tied
      // to scrolling through whatever content sits below the flight.
      if (!journeyEnded && t >= EXIT_COMPLETE_THRESHOLD) {
        journeyEnded = true;
        onJourneyEndRef.current?.();
      }

      // ---- turn captions ----
      // Runs before the camera update so the camera knows, this same
      // frame, whether a caption is active and where it is.
      let activeCaptionOpacity = 0;
      TURNS.forEach((turn, i) => {
        const { group, stack, eyebrow, heading, body } = captionGroups[i];
        if (!eyebrow.material || !heading.material || !body.material) return; // still waiting on first sync()

        // Trapezoid, not a triangle: ramp in, HOLD at full opacity across
        // the middle, ramp out. The group itself is always positioned
        // and oriented below, every frame, regardless of this value --
        // a caption never "appears"; it's always there, just invisible
        // (opacity 0) until the flight is close enough for that to climb
        // toward 1.
        const distance = t - turn.t;
        let capOpacity = 0;
        if (distance > -CAPTION_WINDOW && distance < CAPTION_WINDOW) {
          const edge = Math.abs(distance) / CAPTION_WINDOW; // 0 at the caption, 1 at the window edge
          // smoothstep(x, min, max) needs min < max -- the swapped
          // (edge, 1, CAPTION_HOLD) below previously meant `edge` (which
          // never exceeds 1) always failed the x <= min(1) check and
          // returned 0 outright, so opacity didn't ease out at all: it
          // held at 1 for edge <= CAPTION_HOLD and then hard-cut to 0 the
          // instant it didn't, a real 0/100 flip rather than a fade.
          capOpacity = edge <= CAPTION_HOLD ? 1 : 1 - THREE.MathUtils.smoothstep(edge, CAPTION_HOLD, 1);
        }
        capOpacity *= visibility;

        forEachCaptionMaterial(eyebrow, (m) => (m.opacity = capOpacity));
        forEachCaptionMaterial(heading, (m) => (m.opacity = capOpacity));
        forEachCaptionMaterial(body, (m) => (m.opacity = capOpacity * 0.88));

        const anchorPoint = curve.getPointAt(turn.t);
        const anchorTangent = curve.getTangentAt(turn.t).normalize();
        tmpPerp.set(-anchorTangent.z, 0, anchorTangent.x).normalize();
        tmpCaptionAnchor
          .copy(anchorPoint)
          .add(CAPTION_UP_OFFSET)
          .addScaledVector(tmpPerp, turn.side * captionSideOffset);

        group.position.copy(tmpCaptionAnchor);
        group.scale.setScalar(captionScale);
        // Fixed orientation, not a camera billboard -- like signage
        // planted beside the route, angled to face oncoming traffic
        // rather than swivelling to track the viewer. The chase camera
        // (and the dedicated caption viewpoint below, anchored at
        // anchorPoint - tangent * NOMINAL_CAPTION_DISTANCE) always
        // approaches from the -tangent side looking roughly toward
        // +tangent, so the caption's front needs to face -tangent, not
        // sideways across the track -- facing across it put the camera's
        // forward-looking view direction edge-on to the text (parallel to
        // its surface) rather than facing it. Computed purely from the
        // curve's fixed geometry at this turn's t, so it never rotates
        // while the camera moves through its own caption-approach blend
        // below -- that combination (text rotating AND fading at once)
        // is what previously read as the caption "blinking" in.
        tmpCaptionFront.copy(anchorTangent).multiplyScalar(-1);
        group.quaternion.setFromUnitVectors(AXIS_Z, tmpCaptionFront);

        if (capOpacity > activeCaptionOpacity) {
          activeCaptionOpacity = capOpacity;

          // Measured off the actual rendered glyphs (world-space, so it
          // already accounts for group.position/scale/quaternion set
          // above) rather than assumed from the anchor -- the block's
          // flush edge sits at the anchor, but its ragged edge can run
          // well past it, especially on a 2-3 line heading. Both sides
          // work the same way: whichever side the offset went (turn.side
          // via tmpPerp), the box centre reflects wherever the text
          // actually ended up.
          group.updateMatrixWorld(true);
          tmpCaptionBox.setFromObject(stack);
          if (!tmpCaptionBox.isEmpty()) {
            tmpCaptionBox.getCenter(tmpCaptionCenter);
          } else {
            tmpCaptionCenter.copy(tmpCaptionAnchor); // pre-sync fallback, shouldn't hit given the material guard above
          }

          tmpActiveCaptionPos.copy(tmpCaptionCenter);
          // A dedicated viewpoint for THIS caption, anchored to its own
          // fixed spot on the curve (turn.t) rather than the model's
          // constantly-advancing position -- behind the block's actual
          // centre along the path's own tangent, at NOMINAL_CAPTION_DISTANCE
          // (the same distance computeViewportLayout already assumes when
          // solving captionScale), so settling here frames the text
          // centred and at the size it was actually sized for.
          tmpActiveCaptionCamPos
            .copy(tmpCaptionCenter)
            .addScaledVector(anchorTangent, -NOMINAL_CAPTION_DISTANCE)
            .addScaledVector(UP, CAPTION_CAM_HEIGHT_OFFSET);
        }
      });

      // Chase camera: behind and below the (already-elevated) creature
      // along the path's own direction -- except while a caption is
      // active, when position and look-at ease toward the caption's own
      // dedicated viewpoint (see above), scaled by captureStrength rather
      // than following the text's opacity 1:1. Desktop keeps a partial
      // nudge (the camera still reads as continuing its flight past the
      // caption); portrait mobile goes almost all the way to centring the
      // text as it's approached, then drifts back to chasing the model as
      // the caption's own opacity fades past it -- see computeViewportLayout.
      //
      // Both position and aim are eased at a frame-rate-independent rate
      // on top of that blend, so neither the caption hand-off nor
      // ordinary scroll jitter reads as a camera cut or a jolt.
      tmpCamPos
        .copy(tmpElevated)
        .addScaledVector(tangent, -CHASE_DISTANCE)
        .addScaledVector(UP, CHASE_HEIGHT);
      tmpDesiredLook.copy(tmpElevated);
      if (activeCaptionOpacity > 0.001) {
        const captureBlend = activeCaptionOpacity * captureStrength;
        tmpCamPos.lerp(tmpActiveCaptionCamPos, captureBlend);
        tmpDesiredLook.lerp(tmpActiveCaptionPos, captureBlend);
      }

      if (!lookInitialized) {
        camera.position.copy(tmpCamPos);
        smoothedLook.copy(tmpDesiredLook);
        lookInitialized = true;
      } else {
        camera.position.lerp(tmpCamPos, 1 - Math.exp(-CHASE_SMOOTHING * frameDt));
        smoothedLook.lerp(tmpDesiredLook, 1 - Math.exp(-LOOK_SMOOTHING * frameDt));
      }
      camera.lookAt(smoothedLook);

      // Position only, never rotation -- the sky follows the camera so
      // it can't be flown out of, while its gradient stays locked to the
      // world's own horizon.
      skyMesh.position.copy(camera.position);

      renderer.render(scene, camera);
    };

    // A backgrounded tab still gets rAF ticks in some browsers, and the
    // scene is a fixed full-viewport layer that's never off-screen, so
    // this is the one meaningful place to stop doing work.
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!frameId) {
        clock.getDelta(); // discard the stall so the spring doesn't get a giant dt
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);

      skyMesh.geometry.dispose();
      skyMaterial.dispose();
      trackGeometry.dispose();
      trackMaterial.dispose();
      captionGroups.forEach(({ eyebrow, heading, body }) => {
        eyebrow.dispose();
        heading.dispose();
        body.dispose();
      });
      markPool.forEach((mark) => {
        mark.markGeometry.dispose();
        mark.markMaterial.dispose();
      });
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) child.geometry?.dispose();
        });
      }
      modelMaterials.forEach(disposeMaterial);
      dracoLoader.dispose();
      renderer.dispose();
    };
  }, [flightProgressRef]);

  return (
    <>
      <SkyBackdrop aria-hidden="true" />
      <CanvasEl ref={canvasRef} aria-hidden="true" />
      {!webglFailed && <MistGrain aria-hidden="true" />}
      <StoryText $visible={webglFailed} aria-label="About Me">
        {TURN_CHAPTERS.map((chapter) => (
          <article key={chapter.eyebrow}>
            <b>{chapter.eyebrow}</b>
            <h2>{chapter.heading}</h2>
            <p>{chapter.body}</p>
          </article>
        ))}
      </StoryText>
    </>
  );
}
