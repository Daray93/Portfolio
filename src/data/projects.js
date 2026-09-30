// Every project the showcase carousel shows, in carousel order. Adding a
// project is one entry here (plus its route in App.jsx).
//
// Caption copy follows one pattern so every card reads the same:
//   title        the project name, one or two words
//   description  the problem it solves, led with the problem rather than
//                the product ("Making ACL recovery easier to navigate",
//                ~25-40 characters). Cruciate first; the others still say
//                what they are, and move over as their case studies are
//                restructured (see CASE-STUDY-PLAN.md)
//   shortDescription  optional: a shorter tagline for phones, where the
//                full one wraps awkwardly (see Tagline)
//   role         the work I did: "Design & Development", or "Design" where I
//                only designed
//   years        always given
//
// media:     what fills the card -- { type: "image" | "video", src } (an
//            image can add fit: "contain" to show all of it, and mobileFit
//            to fit differently on phones), or
//            { type: "logo", src } for a mark centred on the `panel` colour,
//            or { type: "avocado" } for Operation Avocado's live rig.
//            Images can add `mobileSrc`, a tall portrait (about 3:5) version for phones,
//            and `srcSet` / `mobileSrcSet`: the same picture at several widths
//            (an imagetools import), sized to the screen.
// backdrop:  [key, floor, base]. Only the floor colour shows at the
//            moment: a subtle strip of light under the pager, on the design
//            system's own page colour (light or dark). Pick a mid-tone of the
//            project's hue that reads softly on both. Key and base are kept
//            for if a fuller background comes back.
// icon:      the project's logo (not shown on the homepage at the moment --
//            the pager is plain dots). `fill: true` for app
//            icons that bring their own background (given rounded corners),
//            false for bare marks on transparent.
// live:      the live app's URL, if there is one -- "Visit app" on the case
//            study's cover, top right
// coverInk:  "dark" for a light cover picture (dark text and light glass
//            on the case study cover); white text by default
// locked:    password-protected (see ProtectedGate) -- the card asks for the
//            password instead of opening, until the visitor has unlocked.

import oaIcon from "../case-studies/operation-avocado/assets/Mobile-Logo-OA.png";
import orthoviveLogo from "../case-studies/orthovive/assets/OrthoVive.png";
import orthoviveRender from "../case-studies/orthovive/assets/render.png";
import pintsCard from "../case-studies/pints-yurt/assets/py-cover.webp";
// the same pictures at several widths, for the browser to pick the one
// that suits the screen (made at build time: see vite.config.js)
import pintsCardSet from "../case-studies/pints-yurt/assets/py-cover.webp?w=1280;1920;2560&format=webp&quality=75&as=srcset";
import pintsIcon from "../case-studies/pints-yurt/assets/pints-icon.png";
import cruciateLogo from "../case-studies/cruciate/assets/cruciate-logo.svg";
import cruciateCard from "../case-studies/cruciate/assets/cruciate-cover.png?w=2880&format=webp&quality=88";
import cruciateCardSet from "../case-studies/cruciate/assets/cruciate-cover.png?w=1920;2560;2880;3840;5120&format=webp&quality=88&as=srcset";

const projects = [
  {
    id: "cruciate",
    title: "Cruciate",
    description: "Making ACL recovery easier to navigate",
    shortDescription: "Navigating ACL recovery",
    role: "Design & Development",
    years: "2026",
    to: "/cruciate",
    live: "https://cruciate.vercel.app/",
    // a wall of app screens on the diagonal, bleeding off every edge on a
    // grey teal -- it fills the card at every size. Made straight from the
    // PNG at build time (one compression, not two) so the screens stay crisp
    media: { type: "image", src: cruciateCard, srcSet: cruciateCardSet },
    panel: "#6e898c",
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
    live: "https://operation-avocado.web.app/",
    // the live avocado rig (the hero video, OA-Hero.mp4, is still in the
    // case study's assets)
    media: { type: "avocado" },
    // the rig's stage green (see ProjectMedia)
    panel: "#7bae45",
    // a light cover: dark text and frosted glass on it (see ProjectCover)
    coverInk: "dark",
    icon: { src: oaIcon, fill: true },
    // a deep forest green behind the caption, then the avocado's card green
    backdrop: ["#182b1c", "#7bae45", "#070d04"],
  },
  {
    id: "pints-yurt",
    title: "Pints Yurt",
    description: "Crowdsourced pint prices",
    role: "Design & Development",
    years: "2026",
    to: "/pints-yurt",
    live: "https://pints-yurt.web.app/",
    // four phones fanned on the diagonal (py-cover.svg), shown whole on the
    // card's brown at every size. The card uses a 2x WebP render of the SVG:
    // scaling an SVG's embedded screenshots full screen stutters the
    // transition, so re-render py-cover.webp if the SVG changes
    media: { type: "image", src: pintsCard, srcSet: pintsCardSet, fit: "contain" },
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
    coverInk: "dark",
    icon: { src: orthoviveLogo, fill: false },
    backdrop: ["#1f4fb8", "#6f9ee8", "#020409"],
  },
];

export default projects;
