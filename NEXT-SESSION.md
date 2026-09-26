# Portfolio redesign: next session

Branch: `redesign/showcase`, started from the `bento-version` tag. **Nothing on this branch is committed yet.** Commit first thing.

The Bento version is saved in the `bento-version` tag on GitHub and in `Desktop/Portfolio/my-portfolio-BENTO-VERSION.zip`.

## Where it stands

The homepage is done and working: a cinematic showcase carousel inspired by niallphillips.vercel.app/portfolio.

- **Projects, in order:** Cruciate, Operation Avocado, Pints Yurt, OrthoVive (password-locked). Set in `src/data/projects.js`, which is the single source for cards, colours, icons and captions.
- **Removed from the carousel, but pages and files kept:** Audanote, Kropt, Neuroloop, IBHF. Their routes still work if you visit the URL directly.
- **Card to project transition:** the card scales up into a large framed card (a margin all round, rounded corners) while the page behind settles to the plain page background. It lands on the case study's cover, which is that same frame.
- **The way back:**
  - Pulling back on the cover (scroll up at the top, or drag down on a phone) shrinks the frame slightly with the gesture, springing back if let go.
  - Pulled far enough, it plays the reverse: the frame shrinks into its card, and the side cards, header and footer blur and fade in afterwards.
  - "All work" and the browser's back button play the same way back.
  - The carousel ignores scrolling until the gesture that brought you back has stopped, so momentum can't skip to the next project.
- **No-flash handling:** every step of the transition waits until its image or video is actually ready before showing it, with a time limit on each wait.

## Check first

1. **The card transition, both ways.** Run `npm run dev` and click the focused card (Cruciate, Avocado or Pints). Check:
   - the first frame matches the card exactly (no jump)
   - no flash at any point, including with the Operation Avocado video card
   - the side cards push away as the card opens
   - the framed cover lands exactly where the transition ends
   - pulling back, "All work" and browser back all shrink cleanly into the card
   - the carousel doesn't skip to the next project after coming back
2. **The intro.** Open a new tab to replay it: solid lift, fast then slow; side cards spread once the focused card is uncovered; header visible throughout.

## To do, in order

1. **Theme per page: homepage dark, case studies light.**
   - Today one Light/Dark setting applies site-wide (dark by default). An earlier "Auto" version did this per page and was removed, so check `src/styles/ThemeModeContext.jsx` and its history.
   - Decide what the menu's Light/Dark switch does once pages have their own themes. For example, remove it, or let it override both.
   - The card transition's page-background layer (`Curtain` in `ExpandTransition.jsx`) uses the current theme's background. It needs to become the **destination** page's background:
     - opening a project: fade to the light case study background
     - coming back: start from light and fade into the dark homepage
   - The case study cover's page background (`Cover` in `ProjectCover.jsx`) must match the light theme so the handoff stays invisible.
2. **Case study template.** Your layout work. Below the cover, every case study still uses the old layout, and the title is repeated under the cover. Aim for one shared template like the reference: intro plus a facts list (Role, Year, Team, Tools), numbered sections, next/previous project links, and a big contact footer. Bring the new header, menu and cursor onto these pages.
3. **Screenshots for Pints Yurt and Cruciate** (6–10 phone screens each, into a `screenshots` folder in each Desktop project folder). Then:
   - build 16:9 and 4:5 mockup card images to replace the logo cards
   - fill the dashed image slots in both case studies
4. **Case study copy gaps** (marked with brackets on the pages):
   - Cruciate: why you built it, who it's for, feedback
   - Pints Yurt: real numbers (pubs, prices reported, users)
5. **MISE:** fold into the Operation Avocado case study as a "what I did differently the second time" section.
6. **About page:** replace the WebGL scroll story with a statement, intro plus facts, a timeline of roles, and education.
7. **Websites section:** somewhere for IBHF and your recent sites, a simple grid or list linking to the live sites.
8. **Clean-up:**
   - delete the unused Bento homepage code (`src/components/home/Splash.jsx` and its card components)
   - remove the leftover Audanote mentions in `OtherProjects.jsx` comments
   - full pass on phones and tablets
9. **Deploy** once happy (Firebase hosting).

## Decisions made

- **Font:** Instrument Sans only, set once as `--font-sans` in `src/styles/GlobalStyle.jsx`.
- **Theme:** currently dark by default site-wide, with Light and Dark in the menu. This changes with to-do 1.
- **Motion:** every curve and duration comes from `src/styles/motion.js`. The `reveal` block sets the intro timing.
- **Cursor:** the original ball cursor (`src/components/chrome/Cursor.jsx`). A follow-the-cursor label was tried and reverted.
- **Card size (desktop):** `--vw: 38vw`. The carousel's vertical position is `padding-block: 136px 132px` on `Stage` in `Showcase.jsx`.
- **Header and footer on desktop:** 56px from the top and bottom, 88px from the sides. The intro screen's counter matches.
- **Case study cover frame:** 24px margin (12px on phones), 20px corners (14px on phones), set in `src/components/showcase/coverFrame.js`. The transition and the cover both read it.
- **Pull-back feel:** `PULL_COMMIT` (distance before it commits) and `PULL_SHRINK` (how much the frame shrinks) at the top of `ProjectCover.jsx`.
- **Roles:** Cruciate and Pints Yurt are "Designer & Developer, 2026". Pints Yurt credits Claude Code.

## Key files

| What | Where |
| --- | --- |
| Project list (cards, colours, captions) | `src/data/projects.js` |
| Homepage carousel, pager, footer | `src/components/showcase/Showcase.jsx` |
| Card to project transition | `src/components/showcase/ExpandTransition.jsx` |
| Cover frame size and corners | `src/components/showcase/coverFrame.js` |
| Background lighting | `src/components/showcase/Backdrop.jsx` |
| Intro / loading screen | `src/components/chrome/Preloader.jsx` |
| Header, menu, copy-email | `src/components/chrome/` |
| Case study cover (and pull-back) and layout | `src/components/case-study/ProjectCover.jsx`, `CaseStudyLayout.jsx` |
| New case study pages | `src/case-studies/pints-yurt/`, `src/case-studies/cruciate/` |
| Theme | `src/styles/ThemeModeContext.jsx`, `src/styles/theme.js` |
| Motion rules | `src/styles/motion.js` |
