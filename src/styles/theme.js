// theme.js

export const theme = {
  /* =====================
     Core Surfaces
  ===================== */
  body: "#f2f0ea",              // app background (warm cream)
  background: "#f7f6f1",        // secondary sections
  cardBackground: "#f8f7f3",
  cardInset: "#e5e1d573",         // cards
  surfaceSubtle: "#eeece5",     // hover fills, soft panels
  border: "#e2ded2",            // default borders
  divider: "#e8e4d8",

  /* =====================
     Typography
  ===================== */
  text: "#17171a",              // near-black, premium feel
  textSecondary: "#514f48",     // body secondary
  textTertiary: "#8a877d",      // captions, meta
  subtitle: "#6e6b62",
  muted: "#a19d92",

  /* =====================
     Brand Accent
     (swap once globally)
  ===================== */
  accent: "#6c5ce7",            // blue-violet
  accentSoft: "#eeeaff",
  accentHover: "#5848d1",
  accentText: "#ffffff",

  /* =====================
     Buttons
  ===================== */
  buttonPrimaryBg: "#17171a",
  buttonPrimaryText: "#f7f6f1",
  buttonPrimaryHover: "#000000",
  buttonPrimaryHoverText: "#ffffff",

  buttonSecondaryBg: "#f7f6f1",
  buttonSecondaryText: "#17171a",
  buttonSecondaryBorder: "#e2ded2",
  buttonSecondaryHover: "#eeece5",

  /* =====================
     Forms
  ===================== */
  inputBg: "#ffffff",
  inputBorder: "#e2ded2",
  inputBorderHover: "#c9c4b4",
  inputBorderFocus: "#6c5ce7",
  inputError: "#ef4444",
  inputSuccess: "#22c55e",
  placeholder: "#a19d92",

  /* =====================
     Links
  ===================== */
  link: "#17171a",
  linkHover: "#6c5ce7",

  /* =====================
     Skeletons / Loading
  ===================== */
  skeletonBase: "#e8e4d8",
  skeletonHighlight: "#f2f0ea",

  /* =====================
     Tags / Pills
  ===================== */
  tagBg: "#eeece5",
  tagText: "#57544c",

  /* =====================
     Effects
  ===================== */
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

  /* =====================
     Layout System
  ===================== */

   radius: {
   xl: "clamp(16px, 2vw, 24px)", // large containers
   lg: "clamp(12px, 1.5vw, 16px)", // cards
   md: "clamp(8px, 1vw, 12px)", // media
   sm: "clamp(6px, 0.8vw, 8px)", // buttons/inputs
   xs: "clamp(4px, 0.5vw, 6px)", // pills/chips
   },

  space: {
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
  },
};