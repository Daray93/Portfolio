# Portfolio redesign: next session

Branch: `redesign/showcase`, started from the `bento-version` tag. The showcase work is committed (`631c31f`); commit per to-do from here.

The Bento version is saved in the `bento-version` tag on GitHub and in `Desktop/Portfolio/my-portfolio-BENTO-VERSION.zip`.

## Where it stands

The homepage is done and working: a cinematic showcase carousel inspired by niallphillips.vercel.app/portfolio.

- **Projects, in order:** Cruciate, Operation Avocado, Pints Yurt, OrthoVive (password-locked). Set in `src/data/projects.js`, which is the single source for cards, colours, icons and captions.
- **Removed from the carousel, but pages and files kept:** Audanote, Kropt, Neuroloop, IBHF. Their routes still work if you visit the URL directly.
- **Card to project transition:** the card scales up into a large framed card (a margin all round, rounded corners) while the dark homepage behind settles to the light case study background. It lands on the case study's cover, which is that same frame.
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
2. **Per-page themes.** Homepage dark, case studies light. Opening a card, the page behind should fade from dark to the cream case study background with no seam at the cover; coming back, it should fade from cream into the dark carousel. Reload a case study URL directly: it should paint cream from the first frame, no dark flash. The menu no longer has a Theme switch, and the case study bottom bar no longer has a sun/moon button.
3. **The cursor.** Off the carousel: a small empty glass ring. Hover the logo, name, menu button, pager icons, "Get in touch.", and in the menu the big links, copy email and LinkedIn: the ring should wrap each one smoothly, following its shape (round for the pager icons). On the carousel: the big disc with its icons. The password field in the OrthoVive gate should show the normal text caret.
4. **The intro.** Open a new tab to replay it: solid lift, fast then slow; side cards spread once the focused card is uncovered; header visible throughout.

## To do, in order

1. **Case study template.** Your layout work. Below the cover, every case study still uses the old layout, and the title is repeated under the cover. Aim for one shared template like the reference: intro plus a facts list (Role, Year, Team, Tools), numbered sections, next/previous project links, and a big contact footer. Bring the new header, menu and cursor onto these pages.
2. **Screenshots for Pints Yurt and Cruciate** (6–10 phone screens each, into a `screenshots` folder in each Desktop project folder). Then:
   - build 16:9 and 4:5 mockup card images to replace the logo cards
   - fill the dashed image slots in both case studies
3. **Case study copy gaps** (marked with brackets on the pages):
   - Cruciate: why you built it, who it's for, feedback
   - Pints Yurt: real numbers (pubs, prices reported, users)
4. **MISE:** fold into the Operation Avocado case study as a "what I did differently the second time" section.
5. **About page:** replace the WebGL scroll story with a statement, intro plus facts, a timeline of roles, and education.
6. **Websites section:** somewhere for IBHF and your recent sites, a simple grid or list linking to the live sites.
7. **Clean-up:**
   - delete the unused Bento homepage code (`src/components/home/Splash.jsx` and its card components)
   - remove the leftover Audanote mentions in `OtherProjects.jsx` comments
   - full pass on phones and tablets
8. **Deploy** once happy (Firebase hosting).

## Decisions made

- **Font:** Instrument Sans only, set once as `--font-sans` in `src/styles/GlobalStyle.jsx`.
- **Theme:** fixed per page, no switch. Homepage dark, every other page (case studies, About, 404) light. Set by the route in `ThemeModeContext.jsx`; `index.html` paints the same choice before the app loads. The card transition's curtain and the cover's page are both pinned to `lightTheme.body`, so the handoff is always dark homepage to light case study.
- **Motion:** every curve and duration comes from `src/styles/motion.js`. The `reveal` block sets the intro timing. Reduced motion follows the visitor's system setting only (live, in `MotionPreferenceContext.jsx`); the menu's switch was removed.
- **Backdrop colours:** each project's primary glow (upper left) sits behind the caption's white text, so it stays deep enough for 4.5:1; bright colours go in the secondary glow (lower right). Pints Yurt: latte glow plus a cream low light. A dark shade behind the caption was tried and rejected. Rule noted in `projects.js`.
- **LinkedIn hover:** LinkedIn blue, `theme.linkedin` (`#0A66C2` on light pages, LinkedIn's dark-mode `#70B5F9` on dark ones so it stays readable). Used by the menu's LinkedIn link and the footer's "Get in touch."
- **Cursor:** `src/components/chrome/Cursor.jsx`, one piece of embossed glass that changes shape: a small empty glass ring on the pointer by default; over a link or button it slides onto it and wraps it in a rounded shape matching its corners (no blur, so the text stays sharp); over the carousel (`data-cursor-area`) an 88px smoked-glass disc with the enlarge icon on the focused card, a padlock on OrthoVive, ‹ / › on side cards, "Drag" between cards. Tuning constants (sizes, padding, lean, follow/morph speed) are at the top of the file. Text fields keep the system caret. Earlier tries: an icon badge on every link (too busy), and carousel-only with the system cursor elsewhere.
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
