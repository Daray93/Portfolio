import styled from "styled-components";
import { ease, dur } from "../../styles/motion";

// Text that rolls up on hover and is replaced by `hover` (defaults to the
// same text again). Triggers from its own hover or from the nearest link/
// button around it, so it can sit inside any clickable. The second line is
// a real element hidden from assistive tech rather than CSS `content`, which
// some screen readers would read out twice.
const Roll = styled.span`
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  line-height: 1.3;
`;

// Only the first line takes up space -- the second hangs just below it,
// out of sight until the track moves up by one line.
const Track = styled.span`
  position: relative;
  display: block;
  transition: transform ${dur.base}s ${ease.out};

  ${Roll}:hover > &,
  a:hover > ${Roll} > &,
  button:hover > ${Roll} > &,
  a:focus-visible > ${Roll} > &,
  button:focus-visible > ${Roll} > & {
    transform: translateY(-100%);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// --roll-align lets a parent centre the incoming line when it's shorter
// than the outgoing one
const Line = styled.span`
  display: flex;
  align-items: center;
  justify-content: var(--roll-align, flex-start);
  gap: 0.4em;
  white-space: nowrap;
`;

const Next = styled(Line)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
`;

export default function RollText({ children, hover, className }) {
  return (
    <Roll className={className}>
      <Track>
        <Line>{children}</Line>
        <Next aria-hidden="true">{hover ?? children}</Next>
      </Track>
    </Roll>
  );
}
