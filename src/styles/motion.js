// One motion language for the whole site. Every transition, animation and
// scripted tween reads from here, so things that happen together feel
// related instead of each picking its own curve and timing.
//
//   out     things arriving or reacting (hover, reveal, settle): a quick
//           start that eases gently into place
//   inOut   things travelling from one place to another (a card growing
//           to full screen, a panel covering the page): slow away, slow in
//
// Durations step up by role: small UI feedback is fast, whole-screen
// movement is slow.

export const ease = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
};

// framer-motion takes curves as arrays
export const easeArr = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
};

// seconds
export const dur = {
  fast: 0.25, // colour, opacity of small UI
  base: 0.5, // hover movement, text rolls
  slow: 0.8, // reveals, panels
  slower: 1.2, // whole-screen travel, background crossfades
};

// A button giving a little under a press, the same everywhere: pills and
// other wide buttons with `press`, small round icon buttons (where 3% would
// be a pixel) with `pressSmall`. It uses `scale`, not `transform`, so it adds
// to whatever transform the button already has. Dropped into a styled
// component's styles; the component lists `scale` in its own transition so
// letting go eases back.
const pressed = (to) => `
  &:active {
    scale: ${to};
    transition-duration: 0.1s;
  }
`;
export const press = pressed(0.97);
export const pressSmall = pressed(0.9);

// gap between items revealed in sequence
export const stagger = 0.08;

// The intro reveal (see Preloader). It opens on a single shot: the loading
// screen's black becomes a window in the shape of the focused card, the card
// fades up inside it, then the window opens out to the screen's edges and
// the side cards glide out as it goes.
export const reveal = {
  delay: 0.15, // the shot starts as the loading details finish fading
  shot: 0.45, // the card fading up inside its window
  hold: 0.05, // a beat on the single shot
  open: 0.7, // the window opening out to the screen's edges
  openCurve: "cubic-bezier(0.32, 0, 0.67, 0)", // gathers speed and meets the edges at full pace, no braking
  spread: 1.1, // the side cards gliding out as the window opens
  spreadCurve: "cubic-bezier(0.22, 1, 0.36, 1)", // a long, even deceleration
};
