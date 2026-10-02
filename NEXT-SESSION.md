# Portfolio redesign: next session

Branch: `redesign/showcase` (on GitHub), started from the `bento-version` tag. Commit per to-do.

The Bento version is saved in the `bento-version` tag on GitHub and in `Desktop/Portfolio/my-portfolio-BENTO-VERSION.zip`.

**Start with "Cruciate: what's left" below.** Parked on 30 Sep 2026 with the page nearly done.

## Current focus: finishing the Cruciate case study

Decided 29 Sep 2026: work on Cruciate alone until it's done. The other case studies wait.

### Where Cruciate stands (30 Sep 2026)

The page (`src/case-studies/cruciate/Cruciate.jsx`) follows the eight-section plan in `CASE-STUDY-PLAN.md`, about 1,300 words (roughly 8 minutes on the toggle), with a TL;DR for every section.

- **01 Overview:** what an ACL is, then what Cruciate is and Dara's role.
- **02 The problem:** the real story (tag rugby, no insurance, told at the hospital it wasn't the ACL, a private MRI a month later, asking the GP for a referral, finding the Cross-Border Directive later), a stated problem, and the three "How might we" questions, which link to the challenges that answer them. The TL;DR repeats the questions.
- **03 Research:** "I'm not a physio… Cruciate curates it into one place." 03.01 Reddit and Instagram: six priorities in recovery order, as step cards. 03.02 Curovate, the closest app. 03.03 where the exercises come from (Jeremy Burnham MD's guide, The [P]rehab Guys, Brigham and Women's protocol, as named in the app's migration 011). 03.04 seven papers, each checked on PubMed (details, DOI and abstract): Grant 2005, Shaarani 2013, Failla 2016, Shelbourne & Nitz 1990, Adams 2012, Ardern 2014, Grindem 2016. The page says they were checked before publishing, not that the exercises were chosen from them.
- **04 Insights:** five rows, each marked Evidence or Hypothesis.
- **05 Exploration:** from the app's git history and Claude Code session images. 05.01 the knee diagram's four versions (real images from 29 Sep sessions). 05.02 the symptom check and 05.03 the home screen: "after" screens in, "before" still placeholders.
- **06 The solution:** four challenges, with 21 real screenshots across them.
- **07 Validation:** not tested yet, not released because of legal concerns; five success criteria and the plan.
- **08 Outcomes and learnings:** outcome, what I learned, next steps.

Screenshots: cropped (status bar off), renamed and in `src/case-studies/cruciate/assets/screens`; Dara's originals are in `SideProjects/cruciate/design/screenshots/originals`. The ROM trend was retaken after deleting a mis-logged 13 Sep reading in Supabase.

### Cruciate: what's left

*From Dara:*
1. **A locked exercise** screenshot for 06.04 (load clearance off in Profile, then Today's rehab in a phase with loaded exercises). The last missing screen.
2. **The two old "before" screens** (optional): the always-visible red-flag checklist (commit `989e38c`) and the one long home screen (`a6f64cb`). Running old versions failed: sign-in returns to the live site. If they can't be got, turn 05.02 and 05.03 into short written notes with the current screen only.
3. **Whether Dara uses the app themselves, and since when:** a line for Outcomes, if true.
4. **Validation wording:** keep "a physio review" as the first planned step, or lead with people who've had ACL surgery? Dara said "without the physio interview for now" for Research.
5. **Check the wording Claude wrote in Dara's voice:** the "why" of each Exploration iteration, the step-card explanations for "Reduce the swelling" and "Load it without fear", and "progress so slow it was hard to tell whether any of it was working" in the story.

*For Claude:*
6. Wire in the locked-exercise screen, and resolve 05.02 and 05.03 either way.
7. A full read in both modes (full and TL;DR) with Dara, desktop and phone, then commit.

*Ideas raised, not decided:*
- **Home: "compared with last week" and a consistency measure.** Dara considered adding yesterday's reading and a day streak. Claude's advice: compare with last week or a 7-day average (daily readings are noisy), and use weekly consistency ("5 of 7 days") or a streak that forgives red-flag and rest days, since a plain streak punishes the pauses the safety design asks for. If built, sketch the options first: it would be real exploration from the time, for 05.
- **Check-in readings on the trend chart:** the chart mixes careful session readings with "a rough guess is fine" check-in sliders. Worth separating or marking.

### Tidy-up from 30 Sep

- `SideProjects/cruciate-old` (a checkout of `989e38c` for the "before" screens): the server has stopped; the folder can be deleted.
- Supabase Redirect URLs added for it (`http://192.168.1.26:5174/**`, `http://localhost:5174/**`), if Dara added them: remove.

## Where it stands

The homepage is done and working: a cinematic showcase carousel inspired by niallphillips.vercel.app/portfolio.

- **Projects, in order:** Cruciate, Operation Avocado, Pints Yurt, OrthoVive (password-locked). Set in `src/data/projects.js`, which is the single source for cards, colours, icons and captions.
- **Removed from the carousel, but pages and files kept:** Audanote, Kropt, Neuroloop, IBHF. Their routes still work if you visit the URL directly.
- **One shared frame:** Case studies (the homepage), Websites and About share one frame (`src/components/shell/Shell.jsx`). The background, header and menu stay put; only the page in the middle slides, following the header's pill nav.
- **Card to project transition:** the card scales up into a large framed card (a margin all round, rounded corners) while the page behind settles to the plain page background. It lands on the case study's cover, which is that same frame. Fixed on 29 Sep 2026: corners stay rounded throughout, the picture stays sharp as it grows, and it no longer skips.
- **The way back:**
  - Pulling back on the cover (scroll up at the top, or drag down on a phone) shrinks the frame slightly with the gesture, springing back if let go.
  - Pulled far enough, it plays the reverse: the frame shrinks into its card, and the side cards, header and footer fade in afterwards.
  - "All work" and the browser's back button play the same way back.
  - The carousel ignores scrolling until the gesture that brought you back has stopped, so momentum can't skip to the next project.
- **No-flash handling:** every step of the transition waits until its image is actually ready, with a time limit on each wait (`WAIT_MS` in `ExpandTransition.jsx`). The carousel's case study pages are fetched in the background once the homepage is idle, so they're ready when a card lands.

## Check first

1. **The card transition, both ways,** on Cruciate, Operation Avocado, Pints Yurt and OrthoVive (after unlocking), on desktop and a phone. Test with `npm run build` then `npm run preview`: `npm run dev` loads pages slowly the first time and exaggerates skipping. Check:
   - the first frame matches the card exactly (no jump)
   - the corners stay rounded the whole way, with no square edges or gaps inside them
   - the side cards push away as the card opens
   - pulling back, "All work" and browser back all shrink cleanly into the card
   - nothing skips; if it does, note whether opening or closing, and which way back
2. **Theme.** Follows the device until the visitor picks with the toggle (header, and the case study's button); the pick is remembered. Reload in both modes: no flash of the other one.
3. **The intro.** Reload to replay it (`EVERY_LOAD` in Preloader.jsx replays it on every reload while testing). The card should fade up exactly inside the opening window, on a phone too.

## To do, in order

1. **Finish Cruciate** (see "Cruciate: what's left" above). The shared template is built: `CaseStudySection`, and the process blocks in `src/components/case-study/Process.jsx` (`SubSection`, `Challenge`, `BeforeAfter`, `Insights`, `Criteria`, `Questions`, `Steps`, `Sources`, `Closing`). Rules for spacing, numbering (06.01) and TL;DRs are in `CASE-STUDY-PLAN.md`.
2. **Then the other case studies** in the same structure: Pints Yurt, Operation Avocado, OrthoVive. Pints Yurt needs 6–10 phone screenshots and real numbers (pubs, prices reported, users). Then build 16:9 and 4:5 mockup card images for the carousel.
3. **Covers for Operation Avocado and Pints Yurt.** Every cover now centres its title on phones, like Cruciate's, so these two need pictures with nothing important in the middle (the avocado and the phone fan sit there now). Dara is testing images. Operation Avocado's cover is the live 3D rig, not a picture. Pints Yurt: drop `fit: "contain"` for a picture that fills the frame.
4. **MISE:** fold into the Operation Avocado case study as a "what I did differently the second time" section.
5. **Homepage on tablets:** make more of the carousel and the space around it at tablet sizes (roughly 641–1024px, portrait and landscape). The card track should feel like the focus rather than a desktop layout scaled down: bigger cards, better use of the tall portrait screen, and check the pager, caption and footer positions around it. Decide the direction with Dara before building.
6. **OrthoVive content.** The lock works (sign-in lasts until the browser closes, `src/firebase.js`), but the page's text and brief image ship in the public build (`dist/assets/OrthoVive-*.js`, `OrthoVive-Brief-*.png`), so the password only hides them. Decided: move the content into Firebase Storage `protected/orthovive/` (loaded after sign-in via `useProtectedAsset`), later; Claude prepares files and code, Dara uploads or approves the upload. Also decide whether OrthoVive leaves the carousel until the project has more work. Its card picture (`render.png`, 510×330) is soft full screen; a bigger render would help.
7. **Clean-up:**
   - delete the unused Bento homepage code (`src/components/home/`: `Splash.jsx` and its card components)
   - remove the leftover Audanote mentions in `OtherProjects.jsx` comments
   - full pass on phones and tablets
8. **Deploy** once happy (Firebase hosting). First set `EVERY_LOAD` to `false` in `src/components/chrome/Preloader.jsx` (off, the intro plays on a visitor's first visit only). After deploying, re-scrape the new link preview image at linkedin.com/post-inspector.

## Decisions made

- **Font:** Poppins only (400–700, self-hosted via @fontsource), set once as `--font-sans` in `src/styles/GlobalStyle.jsx`.
- **Theme:** one theme for the whole site. Follows the visitor's device until they pick with the toggle; the pick is remembered in the browser. Set in `ThemeModeContext.jsx`; `index.html` paints the same choice before the app loads. The transition's page-colour layer uses the current theme.
- **Corners:** one radius scale for both themes (`radius` in `src/styles/theme.js`). Dark mode used to square off every corner; decided 30 Sep 2026 to use the light-mode radius in both.
- **Case study cover on phones:** title and tagline centred on every cover; "Read the case study" is a glass pill at the bottom (like "Visit app"), 48px tall. The per-cover `coverCaption` option was removed.
- **Case study numbering:** sections 01–08; a section's peer parts are numbered sub-sections (06.01), numbered from the section automatically; `Subheading` is never numbered.
- **Case study honesty:** evidence or hypothesis on every insight; papers verified before they go on the page; screenshots are the real app with real data (fix bad data in the app, never edit the image).
- **LinkedIn hover:** the whole label turns LinkedIn blue (text and icon), in the menu and on About.
- **Nav and About (2 Oct 2026):** the nav is Case studies and Websites. About is one small card (`src/components/chrome/AboutCard.jsx`): photo, a few lines in Dara's voice, "What's next", and CV / LinkedIn / email. No dates, degree, years of experience or tool lists: the old page read like a CV and framed Dara as junior. On desktop it unfolds from the header's name and logo on hover or keyboard focus (`SiteHeader.jsx`); phones and tablets reach it from the menu, as the `/about-me` page. A desktop-width screen with no hover gets an About pill. The profile photo is `src/assets/profile-photo.png`. A short intro video was considered and parked.
- **Cursor:** the normal system cursor. The custom glass cursor was removed for good. On the carousel, the focused card shows a small glass circle top right on hover (expand icon, or a padlock on OrthoVive), and glass arrow buttons at the screen edges move to the side cards.
- **Buttons:** one outlined pill style, `src/components/chrome/pill.js` (menu email and LinkedIn, About's actions).
- **Motion:** every curve and duration comes from `src/styles/motion.js`. The `reveal` block sets the intro timing. Reduced motion follows the visitor's system setting only (live, in `MotionPreferenceContext.jsx`).
- **Background:** "ambient" mode (`MODE` in `Backdrop.jsx`, dark theme only; light is the plain page colour). A card with a screenshot blurs its picture into the background; the others get two soft pools from `backdrop: [key, floor, base]` in `projects.js`. The key pool (upper left) sits behind the caption's white text, so it stays deep enough for 4.5:1; brighter colours go in the second pool. Operation Avocado's key is `#182b1c`.
- **Card pictures:** Cruciate and Pints Yurt cards are 2x WebP renders of their SVGs (the SVGs are kept as sources). Scaling the SVGs' embedded screenshots and blurred shadows full screen made the transition stutter, so re-export the WebP when a card SVG changes.
- **LinkedIn blue:** `theme.linkedin` (`#0A66C2` on light, `#70B5F9` on dark). Used by the menu's LinkedIn link, About's, and the footer's "Get in touch."
- **Card size (desktop):** `--vw: 38vw`. The carousel's vertical position is `padding-block: 136px 132px` on `Stage` in `Showcase.jsx`.
- **Header and footer on desktop:** 56px from the top and bottom, 88px from the sides. The intro screen's counter matches.
- **Case study cover frame:** 24px margin (12px on phones), 20px corners (24px on phones), set in `src/components/showcase/coverFrame.js`. The transition and the cover both read it.
- **Pull-back feel:** `PULL_COMMIT` (distance before it commits) and `PULL_SHRINK` (how much the frame shrinks) at the top of `ProjectCover.jsx`.
- **Roles:** Cruciate and Pints Yurt are "Designer & Developer, 2026". Pints Yurt credits Claude Code.

## Key files

| What | Where |
| --- | --- |
| Project list (cards, colours, captions) | `src/data/projects.js` |
| Shared frame (Work, About, Websites) | `src/components/shell/Shell.jsx` |
| Homepage carousel, pager, footer | `src/components/showcase/Showcase.jsx` |
| Card to project transition | `src/components/showcase/ExpandTransition.jsx` |
| What fills a card | `src/components/showcase/ProjectMedia.jsx` |
| Cover frame size and corners | `src/components/showcase/coverFrame.js` |
| Background | `src/components/showcase/Backdrop.jsx` |
| Intro / loading screen | `src/components/chrome/Preloader.jsx` |
| Header, menu, copy-email, pill style | `src/components/chrome/` |
| Case study cover (and pull-back) and layout | `src/components/case-study/ProjectCover.jsx`, `CaseStudyLayout.jsx` |
| New case study pages | `src/case-studies/pints-yurt/`, `src/case-studies/cruciate/` |
| About, Websites | `src/pages/About.jsx`, `src/pages/Websites.jsx`, `src/data/websites.js` |
| Theme | `src/styles/ThemeModeContext.jsx`, `src/styles/theme.js` |
| Motion rules | `src/styles/motion.js` |
