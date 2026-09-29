import { useRef } from "react";
import styled, { css, keyframes, useTheme } from "styled-components";
import { ease } from "../../styles/motion";

// The page background in the shared frame. Two looks, picked by MODE:
//
//   "ambient"  the card in focus melts into the whole background: its
//              picture (a screenshot, or what a device mockup shows) is laid
//              over the screen and blurred 80px, saturated and given a touch
//              of contrast, so the colour comes from the work itself. Cards
//              with no picture to use (logos, videos, wordmarks) get two soft
//              pools of their colours instead, slowly flowing. A dark tint
//              over the top keeps text readable. The whole stack drifts
//              very slowly. Dark mode only: light mode is the plain page
//              colour (a melted colour field under a pale tint turns milky).
//   "floor"    the design system's plain page colour, with one subtle strip
//              of the page's colour under the pager (dark mode only).
//
// Either way, each change fades a new layer in over the old one.
//
// palette: [key, floor, base]; image: a picture to blur, or null. A palette
// of null means a plain page: whatever was showing fades out.
const MODE = "ambient";

const CROSSFADE_S = 1.6;
// how fast the colour clears for a plain page (About): well inside the
// page's slide, so it arrives on the plain background, not the last page's
const PLAIN_S = 0.3;

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.body};
  transition: background-color 0.3s ease;
`;

// ---------------- ambient ----------------

const ambientDrift = keyframes`
  0%   { transform: translate3d(-1.5%, -1%, 0) scale(1) rotate(-1deg); }
  50%  { transform: translate3d(1%, 1.5%, 0) scale(1.04) rotate(1deg); }
  100% { transform: translate3d(2%, -0.5%, 0) scale(1.02) rotate(1.5deg); }
`;

// the two colour pools also flow around inside their layer
const flow = keyframes`
  0%   { background-position: 0% 20%; }
  50%  { background-position: 60% 80%; }
  100% { background-position: 100% 40%; }
`;

// One blur over the whole stack: layers crossfade sharp and are blurred
// together, so the soft edges look the same however many are showing.
const Melt = styled.div`
  position: absolute;
  inset: 0;
  filter: blur(80px) saturate(2.4) contrast(1.08);
  opacity: 0.95;
  animation: ${ambientDrift} 110s ease-in-out infinite alternate;
  will-change: transform;

  ${({ $still }) =>
    $still &&
    css`
      animation: none;
    `}

  /* phones: a lighter blur, and no drift */
  @media (max-width: 640px) {
    filter: blur(48px) saturate(2) contrast(1.05);
    animation: none;
  }
`;

const pools = ([a, b, base]) =>
  `radial-gradient(55% 60% at 28% 30%, ${a} 0%, transparent 70%),
   radial-gradient(50% 55% at 75% 72%, ${b} 0%, transparent 70%), ${base}`;

// phones: a tall, narrow screen would squeeze those into thin blobs, so the
// pools run wide and flat instead, each spanning the whole width
const widePools = ([a, b, base]) =>
  `radial-gradient(110% 45% at 35% 28%, ${a} 0%, transparent 72%),
   radial-gradient(105% 42% at 65% 74%, ${b} 0%, transparent 72%), ${base}`;

const Layer = styled.div`
  position: absolute;
  inset: 0;
  transform: scale(1.1);
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  /* a plain page clears the colour quickly, before it has slid in */
  transition: opacity ${({ $plain }) => ($plain ? PLAIN_S : 0.8)}s ${ease.out};

  ${({ $image }) =>
    $image
      ? css`
          background: #0a0a0a center / cover no-repeat;
          background-image: url("${$image}");
        `
      : css`
          background: ${({ $colours }) => pools($colours)};
          background-size: 160% 160%;
          animation: ${flow} 90s ease-in-out infinite alternate;

          @media (max-width: 640px) {
            background: ${({ $colours }) => widePools($colours)};
            background-size: 130% 130%;
          }
        `}

  ${({ $still }) =>
    $still &&
    css`
      animation: none;
    `}
`;

// the tint that keeps text readable over the colour
const Tint = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
`;

// ---------------- floor ----------------

const floorDrift = keyframes`
  0%   { transform: translate3d(-1.5%, -0.5%, 0) scale(1.03); }
  50%  { transform: translate3d(1.5%, 0.5%, 0) scale(1.06); }
  100% { transform: translate3d(-1%, 1%, 0) scale(1.04); }
`;

const Drift = styled.div`
  position: absolute;
  inset: -20%;
  animation: ${floorDrift} 110s ease-in-out infinite alternate;

  ${({ $still }) =>
    $still &&
    css`
      animation: none;
    `}
`;

// where the floor light sits, like a CSS radial gradient on the screen:
// [width, height, x, y] -- "58% 12% at 50% 97%"
const FLOOR = [58, 12, 50, 97];

// Drift runs 20% past the screen on every side, so a screen position x% is
// (x + 20) / 1.4 % of the Drift box; the light is that box, moved and scaled
const place = ([rx, ry, cx, cy]) => {
  const x = (cx - rx + 20) / 1.4;
  const y = (cy - ry + 20) / 1.4;
  return { transform: `translate(${x}%, ${y}%) scale(${(2 * rx) / 140}, ${(2 * ry) / 140})` };
};

const Light = styled.div`
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
`;

// falling off the way real light does, so there's no visible edge
const glow = (c) => `radial-gradient(
  closest-side,
  ${c} 0%,
  color-mix(in srgb, ${c} 72%, transparent) 16%,
  color-mix(in srgb, ${c} 42%, transparent) 36%,
  color-mix(in srgb, ${c} 18%, transparent) 58%,
  color-mix(in srgb, ${c} 5%, transparent) 80%,
  transparent 100%
)`;

const Glow = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${({ $c }) => glow($c)};
  opacity: ${({ $on, theme }) => ($on && theme.mode === "dark" ? 0.4 : 0)};
  transition: opacity ${({ $plain }) => ($plain ? PLAIN_S : CROSSFADE_S)}s ${ease.inOut};
`;

// before any page has set a colour: a neutral grey
const NEUTRAL = ["#2a2a30", "#6a6a74", "#050506"];

// Every look seen so far keeps its own layer and only the current one is
// shown, so a change crossfades from the old to the new wherever it came
// from -- another card, or another page entirely.
export default function Backdrop({ palette = NEUTRAL, image = null, still }) {
  const theme = useTheme();
  const seen = useRef(new Map());
  const ambient = MODE === "ambient";

  // light mode: just the page colour
  if (ambient && theme.mode !== "dark") return <Root aria-hidden="true" />;

  const plain = palette === null && !image;
  const id = plain ? null : ambient && image ? `img:${image}` : palette.join();
  if (!plain && !seen.current.has(id)) seen.current.set(id, { palette, image: ambient ? image : null });
  const layers = [...seen.current];

  if (ambient) {
    return (
      <Root aria-hidden="true">
        <Melt $still={still}>
          {layers.map(([k, l]) => (
            <Layer key={k} $on={k === id} $plain={plain} $image={l.image} $colours={l.palette} $still={still} />
          ))}
        </Melt>
        <Tint />
      </Root>
    );
  }

  return (
    <Root aria-hidden="true">
      <Drift $still={still}>
        <Light style={place(FLOOR)}>
          {layers.map(([k, l]) => (
            <Glow key={k} $on={k === id} $plain={plain} $c={l.palette[1]} />
          ))}
        </Light>
      </Drift>
    </Root>
  );
}
