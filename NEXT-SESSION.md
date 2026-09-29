# Portfolio redesign: next session

Branch: `redesign/showcase` (on GitHub), started from the `bento-version` tag. Commit per to-do.

The Bento version is saved in the `bento-version` tag on GitHub and in `Desktop/Portfolio/my-portfolio-BENTO-VERSION.zip`.

**Start with to-do 1, the case study template.**

## Current focus: the Cruciate case study only

Decided 29 Sep 2026: work on Cruciate alone until it's done, restructured to the eight-section plan in `CASE-STUDY-PLAN.md` (read its Cruciate section). The other case studies wait.

**Known so far (from Dara):**
- Research done, beyond the personal injury story: physio advice, other ACL patients, a review of other rehab apps, and published rehab protocols.
- The exercises and phases come from a mix of those sources.
- Nobody else has tested it yet. Dara can get a physio (and people who've had ACL surgery) to review it.
- The app was iterated in code with Claude Code; there are no sketches or Figma files from the time.

**Honesty rule for artefacts:** don't present sketches or Figma made now as the original process. Real options instead:
- the Cruciate repo's git history: earlier versions of key screens, before and after
- design the Cross-Border onboarding step in sketches and Figma first, for real, before building it
- any new Figma mapping labelled as done afterwards, to find gaps

**What Claude needs from Dara, most urgent first:**

*Unblocks the Research and Insights sections (a few lines each):*
1. Physio advice: what did they tell you that shaped the app?
2. Other ACL patients: where did you hear from them (Reddit, friends, forums), and what came up repeatedly?
3. Other apps: which ones, and what did each get wrong or leave out?
4. Protocols: which ones (hospital names are fine), and what did you take from them?

*A decision:* design the case study layout yourself first (Figma or a sketch) for Claude to build, or have Claude build a first version from the eight-section structure for you to react to?

*Validation, over the next week or two:*
5. Physio review with four set tasks: find today's exercises, log a range-of-motion reading, read the trend chart, respond to a red flag. Note what confused them and what they'd change, then change at least one thing and screenshot before and after. Claude can write a one-page session script for it.
6. Optional but strong: two or three people who've had ACL surgery doing the same tasks.

*Exploration:*
7. The go-ahead to mine the Cruciate repo's git history for before-and-after screens, and its location (it isn't at `Desktop/cruciate`).
8. Sketch and Figma the Cross-Border onboarding step before building it.

*For the page:*
9. 6–10 phone screenshots of the current app: onboarding, today's rehab, a completed session, range-of-motion logging, the progress chart, history, the symptom check-in, a warning state and a locked exercise.
10. Anything else that's true, such as whether you use it daily yourself, and for how long.

Items 1–4 and the layout decision unblock the next session; the rest can come in as it's ready.

## Where it stands

The homepage is done and working: a cinematic showcase carousel inspired by niallphillips.vercel.app/portfolio.

- **Projects, in order:** Cruciate, Operation Avocado, Pints Yurt, OrthoVive (password-locked). Set in `src/data/projects.js`, which is the single source for cards, colours, icons and captions.
- **Removed from the carousel, but pages and files kept:** Audanote, Kropt, Neuroloop, IBHF. Their routes still work if you visit the URL directly.
- **One shared frame:** Work (the homepage), About and Websites share one frame (`src/components/shell/Shell.jsx`). The background, header and menu stay put; only the page in the middle slides, following the header's pill nav.
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

1. **Case study template.** Read `CASE-STUDY-PLAN.md` first: after interview feedback, every case study is being restructured to show process (problem → research → insights → exploration → solution → validation → outcomes), not a feature walkthrough. It has the shared eight-section structure, the components the template needs, a per-project mapping, and the questions Dara needs to answer for each. Below the cover, every case study still uses the old layout, and the title is repeated under the cover. Build the template with Cruciate first. Bring the new header and menu onto these pages.
2. **Screenshots for Pints Yurt and Cruciate** (6–10 phone screens each, into a `screenshots` folder in each Desktop project folder). Then:
   - build 16:9 and 4:5 mockup card images to replace the current cards
   - fill the dashed image slots in both case studies
3. **Case study copy gaps** (marked with brackets on the pages):
   - Cruciate: the Why is written (personal story, then three "How might we" questions that map to Journey, Progress and a new Options section). Still to do: a Research section between Why and The journey, and Outcomes (not released publicly yet because of legal concerns; say so honestly, and suggest a private usability test or physio review for feedback). Options describes the Cross-Border Directive onboarding step, which isn't built yet: Dara is building it in `Desktop/cruciate` from `CROSS-BORDER-ONBOARDING.md` there. Don't publish Options until it's built and its two screenshots are in.
   - Pints Yurt: real numbers (pubs, prices reported, users)
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
- **Cursor:** the normal system cursor. The custom glass cursor was removed for good. On the carousel, the focused card shows a small glass circle top right on hover (expand icon, or a padlock on OrthoVive), and glass arrow buttons at the screen edges move to the side cards.
- **Buttons:** one outlined pill style, `src/components/chrome/pill.js` (menu email and LinkedIn, About's actions).
- **Motion:** every curve and duration comes from `src/styles/motion.js`. The `reveal` block sets the intro timing. Reduced motion follows the visitor's system setting only (live, in `MotionPreferenceContext.jsx`).
- **Background:** "ambient" mode (`MODE` in `Backdrop.jsx`, dark theme only; light is the plain page colour). A card with a screenshot blurs its picture into the background; the others get two soft pools from `backdrop: [key, floor, base]` in `projects.js`. The key pool (upper left) sits behind the caption's white text, so it stays deep enough for 4.5:1; brighter colours go in the second pool. Operation Avocado's key is `#182b1c`.
- **Card pictures:** Cruciate and Pints Yurt cards are 2x WebP renders of their SVGs (the SVGs are kept as sources). Scaling the SVGs' embedded screenshots and blurred shadows full screen made the transition stutter, so re-export the WebP when a card SVG changes.
- **LinkedIn hover:** LinkedIn blue, `theme.linkedin` (`#0A66C2` on light, `#70B5F9` on dark). Used by the menu's LinkedIn link and the footer's "Get in touch."
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
