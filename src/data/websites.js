// Live websites, shown on the Websites page as the same carousel as the case
// studies (see Showcase), newest first. The card in focus opens the live
// site in a new tab. Same caption pattern and backdrop rules as
// projects.js; see the notes there.
//
// id           a unique slug
// title        the client or site
// description  what it is, a short noun phrase (~25-35 characters)
// role         "Design & Development", or "Design" where I only designed
// years        optional
// url          the live address
// media        what fills the card: { type: "image", src } for a finished
//              image; { type: "tablet" | "desktop", src } for a screenshot or
//              screen recording shown on that device (add `split` -- a second
//              screenshot of the same page, e.g. its dark mode -- to split the
//              screen diagonally between the two); or { type: "wordmark",
//              ink } (the name in `ink` on the `panel` colour) until there's
//              something to show
//
// Each site's media lives in its own folder, src/websites/<id>/ (IBHF's
// laptop shot is shared with its case study, in src/case-studies/ibhf/assets/).
// backdrop     [key light, floor bounce, base] for the page background

import aliceScreen from "../websites/alice-abreu-music/screen.webp";
import miseRecording from "../websites/mise/mise.mp4";
import gulfemLight from "../websites/gulfem-cevheribucak/screen-light.webp";
import gulfemDark from "../websites/gulfem-cevheribucak/screen-dark.webp";
import ibhfCard from "../case-studies/ibhf/assets/ibhf-cell.png";
import ibhfCardPhone from "../websites/ibhf/card-phone.webp";

const websites = [
  {
    id: "alice-abreu-music",
    title: "Alice Abreu Music",
    description: "Website for a working musician",
    role: "Design & Development",
    url: "https://alice-abreu-music.web.app/",
    // the top of the homepage on a desktop screen (full-page.png beside it
    // is the whole page, kept as the source)
    media: { type: "desktop", src: aliceScreen },
    panel: "#e9e5f7",
    backdrop: ["#5a2d8a", "#9a78c8", "#040206"],
  },
  {
    id: "gulfem-cevheribucak",
    title: "Gülfem Cevheribucak",
    description: "Academic portfolio for a researcher",
    role: "Design & Development",
    url: "https://gulfem-cevheribucak.web.app/",
    // the homepage in light and dark, split on a diagonal (the full pages
    // are kept beside the crops as the source)
    media: { type: "desktop", src: gulfemLight, split: gulfemDark },
    panel: "#e7e3dc",
    // her brand colour
    backdrop: ["#6b4a3b", "#6b4a3b", "#050302"],
  },
  {
    id: "mise",
    title: "MISE",
    description: "Workout web app, a second take",
    role: "Design & Development",
    url: "https://is-mise.web.app/",
    media: { type: "tablet", src: miseRecording },
    // the app's own dark UI; a soft white glow behind it
    panel: "#1a1a1c",
    backdrop: ["#cfd0d4", "#ffffff", "#0c0c0e"],
  },
  {
    id: "ibhf",
    title: "Irish Bee & Heritage Foundation",
    description: "Beekeeping courses and online shop",
    role: "Design & Development",
    url: "https://ibhf.ie",
    // the site on a laptop; on phones the same laptop, centred on a taller
    // canvas of its backdrop (card-phone.webp, made from ibhf-cell.png)
    media: { type: "image", src: ibhfCard, mobileSrc: ibhfCardPhone },
    panel: "#eeedeb",
    backdrop: ["#5e440a", "#c89a3a", "#050402"],
  },
];

export default websites;
