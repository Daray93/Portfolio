import styled, { css, keyframes } from "styled-components";
import { ease } from "../../styles/motion";

// The page background behind the carousel, lit like a film frame rather
// than tinted: each project's colours become a large soft key light and a
// smaller, dimmer rim light over its base colour, with falloff into dark
// edges, heavier bands top and bottom (a letterbox without the hard bars)
// and a fine moving grain over everything. One layer per project,
// crossfading to whichever card is in focus; the light drifts very slowly.
//
// backdrop colours: [key light, rim light, base]

const CROSSFADE_S = 1.6;

const drift = keyframes`
  0%   { transform: translate3d(-2%, -1.5%, 0) rotate(0deg) scale(1.04); }
  50%  { transform: translate3d(2%, 1.5%, 0) rotate(4deg) scale(1.1); }
  100% { transform: translate3d(-1.5%, 2%, 0) rotate(-3deg) scale(1.05); }
`;

// grain shifts a few pixels at a time, on a stepped timing like film
// running through a gate
const grainShift = keyframes`
  0%   { transform: translate(0, 0); }
  20%  { transform: translate(-3%, 2%); }
  40%  { transform: translate(2%, -3%); }
  60%  { transform: translate(-2%, -1%); }
  80%  { transform: translate(3%, 3%); }
  100% { transform: translate(0, 0); }
`;

// fractal noise as a tiling image, white specks at varying alpha
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.2'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: ${({ $base }) => $base};
  transition: background-color ${CROSSFADE_S}s ${ease.inOut};
`;

const Drift = styled.div`
  position: absolute;
  inset: -20%;
  animation: ${drift} 70s ease-in-out infinite alternate;

  ${({ $still }) =>
    $still &&
    css`
      animation: none;
    `}
`;

const Layer = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity ${CROSSFADE_S}s ${ease.inOut};

  /* ::before is the key light (large, soft, high and to the left);
     ::after the rim light (smaller, dimmer, low and to the right) */
  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 50%;
  }

  &::before {
    left: 8%;
    top: 4%;
    width: 64%;
    height: 72%;
    background: radial-gradient(closest-side, ${({ $c1 }) => $c1}, transparent);
    opacity: ${({ $light }) => ($light ? 0.4 : 0.9)};
  }

  &::after {
    right: 6%;
    bottom: 6%;
    width: 42%;
    height: 48%;
    background: radial-gradient(closest-side, ${({ $c2 }) => $c2}, transparent);
    opacity: ${({ $light }) => ($light ? 0.3 : 0.45)};
  }
`;

// light falls off into the edges, heaviest top and bottom
const Falloff = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: ${({ $light }) =>
    $light
      ? `radial-gradient(120% 95% at 50% 50%, transparent 55%, rgba(242, 240, 234, 0.75) 100%),
         linear-gradient(to bottom, rgba(242, 240, 234, 0.5), transparent 14%, transparent 86%, rgba(242, 240, 234, 0.5))`
      : `radial-gradient(115% 90% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.7) 100%),
         linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent 16%, transparent 84%, rgba(0, 0, 0, 0.55))`};
`;

const Grain = styled.div`
  position: absolute;
  inset: -10%;
  pointer-events: none;
  background-image: ${GRAIN};
  background-size: 180px 180px;
  opacity: ${({ $light }) => ($light ? 0.05 : 0.075)};
  animation: ${grainShift} 0.9s steps(5) infinite;

  ${({ $still }) =>
    $still &&
    css`
      animation: none;
    `}
`;

export default function Backdrop({ projects, active, light, still }) {
  const base = light ? "#f2f0ea" : projects[active]?.backdrop[2] ?? "#0b0b0b";

  return (
    <Root $base={base} aria-hidden="true">
      <Drift $still={still}>
        {projects.map((p, i) => (
          <Layer key={p.id} $on={i === active} $light={light} $c1={p.backdrop[0]} $c2={p.backdrop[1]} />
        ))}
      </Drift>
      <Falloff $light={light} />
      <Grain $light={light} $still={still} />
    </Root>
  );
}
