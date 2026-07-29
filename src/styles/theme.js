// theme.js
// lightTheme and darkTheme share the exact same keys, so every
// `${({ theme }) => theme.x}` usage across the app works unchanged --
// only the values swap when ThemeModeContext switches the active mode.

const radius = {
  xl: "clamp(16px, 2vw, 24px)", // large containers
  lg: "clamp(12px, 1.5vw, 16px)", // cards
  md: "clamp(8px, 1vw, 12px)", // media
  sm: "clamp(6px, 0.8vw, 8px)", // buttons/inputs
  xs: "clamp(4px, 0.5vw, 6px)", // pills/chips
};

const space = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
  8: "64px",
  9: "96px",
};

export const lightTheme = {
  mode: "light",

  /* Core Surfaces */
  body: "#f2f0ea",              // app background (warm cream)
  background: "#f7f6f1",        // secondary sections
  cardBackground: "#faf9f7",
  cardInset: "#e5e1d573",
  surfaceSubtle: "#eeece5",     // hover fills, soft panels
  border: "#e2ded2",            // default borders
  divider: "#e8e4d8",
  navSurface: "rgba(249, 249, 249, 0.8)", // translucent pill-nav track

  /* Typography */
  text: "#17171a",              // near-black, premium feel
  textSecondary: "#514f48",     // body secondary
  textTertiary: "#8a877d",      // captions, meta
  subtitle: "#6e6b62",
  muted: "#a19d92",

  /* Brand Accent */
  accent: "#6c5ce7",            // blue-violet
  accentSoft: "#eeeaff",
  accentHover: "#5848d1",
  accentText: "#ffffff",

  /* Buttons */
  buttonPrimaryBg: "#17171a",
  buttonPrimaryText: "#f7f6f1",
  buttonPrimaryHover: "#000000",
  buttonPrimaryHoverText: "#ffffff",

  buttonSecondaryBg: "#f7f6f1",
  buttonSecondaryText: "#17171a",
  buttonSecondaryBorder: "#e2ded2",
  buttonSecondaryHover: "#eeece5",

  buttonOutlineText: "#17171a",
  buttonOutlineBorder: "#17171a",
  buttonOutlineHoverBg: "#eeece5",

  buttonGhostText: "#514f48",
  buttonGhostHoverBg: "#eeece5",
  buttonGhostHoverText: "#17171a",

  /* Forms */
  inputBg: "#ffffff",
  inputBorder: "#e2ded2",
  inputBorderHover: "#c9c4b4",
  inputBorderFocus: "#6c5ce7",
  inputError: "#ef4444",
  inputSuccess: "#22c55e",
  placeholder: "#a19d92",

  /* Links */
  link: "#17171a",
  linkHover: "#6c5ce7",

  /* Skeletons / Loading */
  skeletonBase: "#e8e4d8",
  skeletonHighlight: "#f2f0ea",

  /* Tags / Pills */
  tagBg: "#eeece5",
  tagText: "#57544c",

  /* Effects */
  shadowSm: "0 2px 8px rgba(0,0,0,0.04)",
  shadowMd: "0 6px 20px rgba(0,0,0,0.06)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.08)",

  glow: `
    radial-gradient(
      60% 60% at 50% 50%,
      rgba(108, 92, 231, 0.12) 0%,
      rgba(255, 255, 255, 0) 70%
    )
  `,

  radius,
  space,
};

export const darkTheme = {
  mode: "dark",

  /* Core Surfaces — IBM Carbon Gray 100 scale, Google-style neutral elevation */
  body: "#161616",              // Carbon Gray 100
  background: "#1d1d1d",        // one elevation step up
  cardBackground: "#262626",    // Carbon Gray 90 (layer-01)
  cardInset: "#2f2f2fb3",
  surfaceSubtle: "#2c2c2c",     // hover fills, soft panels
  border: "#393939",            // Carbon Gray 80
  divider: "#333333",
  navSurface: "rgba(22, 22, 22, 0.8)",

  /* Typography */
  text: "#f4f4f4",              // Carbon Gray 10
  textSecondary: "#c6c6c6",     // Carbon Gray 30
  textTertiary: "#8d8d8d",      // Carbon Gray 50
  subtitle: "#a8a8a8",          // Carbon Gray 40
  muted: "#6f6f6f",             // Carbon Gray 60

  /* Brand Accent */
  accent: "#a56eff",            // Carbon Purple 40 — tuned for AA contrast on Gray 100
  accentSoft: "#33254d",
  accentHover: "#be95ff",       // Carbon Purple 30
  accentText: "#161616",

  /* Buttons */
  buttonPrimaryBg: "#f4f4f4",   // inverted: light fill reads as "primary" on dark
  buttonPrimaryText: "#161616",
  buttonPrimaryHover: "#ffffff",
  buttonPrimaryHoverText: "#000000",

  buttonSecondaryBg: "#262626",
  buttonSecondaryText: "#f4f4f4",
  buttonSecondaryBorder: "#393939",
  buttonSecondaryHover: "#2c2c2c",

  buttonOutlineText: "#f4f4f4",
  buttonOutlineBorder: "#f4f4f4",
  buttonOutlineHoverBg: "#2c2c2c",

  buttonGhostText: "#c6c6c6",
  buttonGhostHoverBg: "#2c2c2c",
  buttonGhostHoverText: "#f4f4f4",

  /* Forms */
  inputBg: "#262626",
  inputBorder: "#393939",
  inputBorderHover: "#525252",
  inputBorderFocus: "#a56eff",
  inputError: "#ff8389",        // Carbon Red 40 (dark)
  inputSuccess: "#42be65",      // Carbon Green 40 (dark)
  placeholder: "#6f6f6f",

  /* Links */
  link: "#f4f4f4",
  linkHover: "#a56eff",

  /* Skeletons / Loading */
  skeletonBase: "#2c2c2c",
  skeletonHighlight: "#333333",

  /* Tags / Pills */
  tagBg: "#2c2c2c",
  tagText: "#c6c6c6",

  /* Effects */
  shadowSm: "0 2px 8px rgba(0,0,0,0.3)",
  shadowMd: "0 6px 20px rgba(0,0,0,0.4)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.5)",

  glow: `
    radial-gradient(
      60% 60% at 50% 50%,
      rgba(165, 110, 255, 0.16) 0%,
      rgba(0, 0, 0, 0) 70%
    )
  `,

  radius,
  space,
};

// Kept for anything importing the old flat export directly.
export const theme = lightTheme;
