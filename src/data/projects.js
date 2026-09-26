// Every project the showcase carousel shows, in carousel order. Adding a
// project is one entry here (plus its route in App.jsx).
//
// Caption copy follows one pattern so every card reads the same:
//   title        the project name, one or two words
//   description  what it is, a short noun phrase (~25-35 characters)
//   role, years  always both
//
// media:     what fills the card -- { type: "image" | "video", src }, or
//            { type: "logo", src } for a mark centred on the `panel` colour.
//            Images can add `mobileSrc`, a portrait (4:5) version for phones.
// backdrop:  three colours the blurred page background is built from while
//            this card is in focus: [primary glow, secondary glow, base].
//            The primary glow sits right behind the caption's white text, so
//            keep it deep (roughly no lighter than #7d693e / #067a6f); bright
//            colours belong in the secondary glow, low and to the right,
//            which the text never crosses.
// icon:      the project's logo for the footer pager. `fill: true` for app
//            icons that bring their own background (given rounded corners),
//            false for bare marks on transparent.
// locked:    password-protected (see ProtectedGate) -- the card asks for the
//            password instead of opening, until the visitor has unlocked.

import oaHero from "../case-studies/operation-avocado/assets/OA-Hero.mp4";
import oaIcon from "../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";
import orthoviveLogo from "../case-studies/orthovive/assets/OrthoVive.png";
import pintGlass from "../case-studies/pints-yurt/assets/pint.png";
import pintsIcon from "../case-studies/pints-yurt/assets/pints-icon.png";
import cruciateLogo from "../case-studies/cruciate/assets/cruciate-logo.svg";

// Pints Yurt and Cruciate show their marks on a brand-colour panel until
// screenshots exist for a proper mockup card.
const projects = [
  {
    id: "cruciate",
    title: "Cruciate",
    description: "ACL rehab tracker, pre and post-op",
    role: "Designer & Developer",
    years: "2026",
    to: "/cruciate",
    media: { type: "logo", src: cruciateLogo },
    panel: "#0f1416",
    icon: { src: cruciateLogo, fill: false },
    backdrop: ["#067a6f", "#23855a", "#0a1012"],
  },
  {
    id: "operation-avocado",
    title: "Operation Avocado",
    description: "Workout tracker without a paywall",
    role: "Designer & Builder",
    years: "2026",
    to: "/operation-avocado",
    media: { type: "video", src: oaHero },
    icon: { src: oaIcon, fill: true },
    backdrop: ["#4e7623", "#cccf5e", "#141c07"],
  },
  {
    id: "pints-yurt",
    title: "Pints Yurt",
    description: "Crowdsourced pint prices for Limerick",
    role: "Designer & Developer",
    years: "2026",
    to: "/pints-yurt",
    media: { type: "logo", src: pintGlass },
    panel: "#f3e9d2",
    icon: { src: pintsIcon, fill: true },
    // stout: black, a warm latte glow, and its cream head as the low light
    backdrop: ["#7d693e", "#e8d6ae", "#0a0806"],
  },
  {
    id: "orthovive",
    title: "OrthoVive",
    description: "Med-tech concept, brief to prototype",
    role: "Product Designer",
    years: "2025",
    to: "/orthovive",
    locked: true,
    media: { type: "logo", src: orthoviveLogo },
    panel: "#eef1f6",
    icon: { src: orthoviveLogo, fill: false },
    backdrop: ["#1b3f6e", "#9aa8bd", "#060f20"],
  },
];

export default projects;
