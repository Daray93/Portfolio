// theme.js

export const theme = {
  /* =====================
     Core Surfaces
  ===================== */
  body: "#ffffff",              // app background
  background: "#fafafa",        // secondary sections
  cardBackground: "#f8fafc", 
  cardInset: "#cbd6e373",         // cards
  surfaceSubtle: "#f4f4f5",     // hover fills, soft panels
  border: "#e5e5e7",            // default borders
  divider: "#ededee",

  /* =====================
     Typography
  ===================== */
  text: "#020618",              // near-black, premium feel
  textSecondary: "#45556c",     // body secondary
  textTertiary: "#8b8f94",      // captions, meta
  subtitle: "#6b6f75",
  muted: "#9aa0a6",

  /* =====================
     Brand Accent
     (swap once globally)
  ===================== */
  accent: "#2563eb",            // blue-600 (calm, professional)
  accentSoft: "#eff6ff",
  accentHover: "#1d4ed8",
  accentText: "#ffffff",

  /* =====================
     Buttons
  ===================== */
  buttonPrimaryBg: "#2563eb",
  buttonPrimaryText: "#fafafa",
  buttonPrimaryHover: "#1d4ed8",
  buttonPrimaryHoverText: "#fafafa",

  buttonSecondaryBg: "#ffffff",
  buttonSecondaryText: "#020618",
  buttonSecondaryBorder: "#e5e5e7",
  buttonSecondaryHover: "#f4f4f5",

  /* =====================
     Forms
  ===================== */
  inputBg: "#ffffff",
  inputBorder: "#e5e5e7",
  inputBorderHover: "#c7c7cc",
  inputBorderFocus: "#2563eb",
  inputError: "#ef4444",
  inputSuccess: "#22c55e",
  placeholder: "#9aa0a6",

  /* =====================
     Links
  ===================== */
  link: "#020618",
  linkHover: "#2563eb",

  /* =====================
     Skeletons / Loading
  ===================== */
  skeletonBase: "#ededee",
  skeletonHighlight: "#f6f6f7",

  /* =====================
     Tags / Pills
  ===================== */
  tagBg: "#f4f4f5",
  tagText: "#52525b",

  /* =====================
     Effects
  ===================== */
  shadowSm: "0 2px 8px rgba(0,0,0,0.04)",
  shadowMd: "0 6px 20px rgba(0,0,0,0.06)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.08)",

  glow: `
    radial-gradient(
      60% 60% at 50% 50%,
      rgba(37, 99, 235, 0.12) 0%,
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