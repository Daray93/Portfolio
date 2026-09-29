// Every project the showcase carousel shows, in carousel order. Adding a
// project is one entry here (plus its route in App.jsx).
//
// Caption copy follows one pattern so every card reads the same:
//   title        the project name, one or two words
//   description  what it is, a short noun phrase (~25-35 characters)
//   role         the work I did: "Design & Development", or "Design" where I
//                only designed
//   years        always given
//
// media:     what fills the card -- { type: "image" | "video", src } (an
//            image can add fit: "contain" to show all of it, and mobileFit
//            to fit differently on phones), or
//            { type: "logo", src } for a mark centred on the `panel` colour,
//            or { type: "avocado" } for Operation Avocado's live rig.
//            Images can add `mobileSrc`, a tall portrait (about 3:5) version for phones.
// backdrop:  [key, floor, base]. Only the floor colour shows at the
//            moment: a subtle strip of light under the pager, on the design
//            system's own page colour (light or dark). Pick a mid-tone of the
//            project's hue that reads softly on both. Key and base are kept
//            for if a fuller background comes back.
// icon:      the project's logo (not shown on the homepage at the moment --
//            the pager is plain dots). `fill: true` for app
//            icons that bring their own background (given rounded corners),
//            false for bare marks on transparent.
// locked:    password-protected (see ProtectedGate) -- the card asks for the
//            password instead of opening, until the visitor has unlocked.

import oaIcon from "../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";
import orthoviveLogo from "../case-studies/orthovive/assets/OrthoVive.png";
import orthoviveRender from "../case-studies/orthovive/assets/render.png";
import pintsCard from "../case-studies/pints-yurt/assets/PintsYurt.svg";
import pintsCardPhone from "../case-studies/pints-yurt/assets/PintsYurt-phone.svg";
import pintsIcon from "../case-studies/pints-yurt/assets/pints-icon.png";
import cruciateLogo from "../case-studies/cruciate/assets/cruciate-logo.svg";
import cruciateCard from "../case-studies/cruciate/assets/Cruciate.svg";

const projects = [
  {
    id: "cruciate",
    title: "Cruciate",
    description: "ACL rehab tracker, pre and post-op",
    role: "Design & Development",
    years: "2026",
    to: "/cruciate",
    // a wall of app screens on the diagonal, bleeding off every edge on a
    // deep teal -- it fills the card at every size
    media: { type: "image", src: cruciateCard },
    panel: "#0c3d39",
    icon: { src: cruciateLogo, fill: false },
    backdrop: ["#0a6e66", "#3fb8a8", "#020606"],
  },
  {
    id: "operation-avocado",
    title: "Operation Avocado",
    description: "Workout tracker without a paywall",
    role: "Design & Development",
    years: "2026",
    to: "/operation-avocado",
    // the live avocado rig (the hero video, OA-Hero.mp4, is still in the
    // case study's assets)
    media: { type: "avocado" },
    icon: { src: oaIcon, fill: true },
    // the avocado's own greens: its skin, then its card
    backdrop: ["#456b24", "#7bae45", "#070d04"],
  },
  {
    id: "pints-yurt",
    title: "Pints Yurt",
    description: "Crowdsourced pint prices",
    role: "Design & Development",
    years: "2026",
    to: "/pints-yurt",
    // three phones, tilted: the whole set on wide cards; on phones the same
    // drawing framed on the leaderboard (PintsYurt-phone.svg: only its
    // viewBox differs), whole, with its neighbours peeking in
    media: { type: "image", src: pintsCard, mobileSrc: pintsCardPhone, fit: "contain", mobileFit: "cover" },
    panel: "#16100b",
    icon: { src: pintsIcon, fill: true },
    // the card's own stout: a deep brown a step lighter than the card, and a
    // dim latte for the head -- muted and dark, since the background
    // saturates them
    backdrop: ["#2a1c12", "#6e5c45", "#060403"],
  },
  {
    id: "orthovive",
    title: "OrthoVive",
    description: "Med-tech device prototype",
    role: "Design",
    years: "2026",
    to: "/orthovive",
    locked: true,
    // a 3D render of the knee implant, on its own soft grey
    media: { type: "image", src: orthoviveRender },
    panel: "#bebebe",
    icon: { src: orthoviveLogo, fill: false },
    backdrop: ["#1f4fb8", "#6f9ee8", "#020409"],
  },
];

export default projects;
