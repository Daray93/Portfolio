// The framed card a project opens into: the case study cover is inset from
// the screen edges by a margin, with rounded corners -- and the card
// transition (ExpandTransition) lands on exactly that frame. Both read these
// values so they always match.

export const COVER_PHONE_QUERY = "(max-width: 640px)";

export const COVER_INSET = { phone: 12, default: 24 };
export const COVER_RADIUS = { phone: 24, default: 20 };

export function coverFrame() {
  const phone = window.matchMedia(COVER_PHONE_QUERY).matches;
  return {
    inset: phone ? COVER_INSET.phone : COVER_INSET.default,
    radius: phone ? COVER_RADIUS.phone : COVER_RADIUS.default,
  };
}
