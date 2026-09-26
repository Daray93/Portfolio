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

// gap between items revealed in sequence
export const stagger = 0.08;

// The intro reveal. The loading screen lifts away as one solid panel; the
// carousel cards stay stacked behind the focused one until the panel's
// bottom edge passes the bottom of that card, then glide out to their
// places.
export const reveal = {
  delay: 0.35, // after the loading details have faded
  lift: 1.9, // the panel travelling off the top
  liftCurve: "cubic-bezier(0.16, 1, 0.3, 1)", // launches fast, then slows right down as it leaves
  spread: 2.4, // the cards gliding out once uncovered
  spreadCurve: "cubic-bezier(0.22, 1, 0.36, 1)", // a long, even deceleration
};
