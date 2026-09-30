# Case study plan: showing the process

Built from interview feedback (David) and a review of the Cruciate case study. It applies to every case study in the carousel: Cruciate, Operation Avocado, Pints Yurt and OrthoVive.

## The problem with the current case studies

They read as product walkthroughs: what the app does and how its features work. A hiring manager wants the reasoning behind the features: what you found out, what you prioritised, what else you tried, how you tested it, and what changed as a result.

So every case study tells the same story:

**problem → research → insight → design decisions → validation → outcomes**

Less time on more polished screens; more time showing the thinking behind the screens you already have.

## Ground rules

- **Evidence or hypothesis, always labelled.** If something came from research (interviews, a physio, competitor review, usage data), say where from. If it came from your own reasoning, call it a *design hypothesis*. That label is what makes the rest believable.
- **No invented numbers.** Don't imply outcomes you haven't measured. If there are no results yet, say so and show the validation plan. An honest plan beats an unsupported claim.
- **Don't create research after the fact.** If you didn't do interviews, document the desk research and personal observation you did do, and name where more research is needed.
- **Not a feature list.** Group features into three or four design challenges. Someone skimming should get the central problem and your decisions without reading every feature.

## The shared structure

Every case study uses these sections in this order. A smaller project can merge sections (noted below), but keeps the order and the questions.

| # | Section | Answers | What goes in it |
| --- | --- | --- | --- |
| 1 | **Overview** | What is it? What did you do? | One-line problem statement, not the tech stack. Facts list: Role, Year, Platform, Timeline, Team, Tools. One strong mockup straight away. |
| 2 | **The problem** | Why does this need to exist? | Who it's for, what's hard for them, what existing tools miss, why you built it. |
| 3 | **Research** | How did you understand the problem? | Methods, sources, competitors reviewed, conversations. Only what you actually did. |
| 4 | **Insights** | How did you get from research to a solution? | Three to five insights, each shown as *Evidence → Insight → Design response* (see below). Your design principles come out of these. |
| 5 | **Exploration** | What options did you consider, and why this one? | Sketches, early Figma, alternative layouts, flows, discarded ideas, each with why it was dropped. |
| 6 | **The solution** | How does the design solve the problem? | Three or four design challenges, each *Challenge → Reasoning → Decision → Screens*. |
| 7 | **Validation** | Did it work, and how do you know? | Success criteria and how each was tested (see below). What confused people, what worked, what you changed. Before-and-after screens. |
| 8 | **Outcomes and learnings** | What impact did you have, and what did you learn? | Three short parts: **Outcome** (what shipped, who used it, the evidence), **What I learned**, **Next steps**. |

Then next/previous project links and the contact footer.

### Consistency rules (every case study)

Every case study is built from the same shared pieces, in the same order, so spacing and type match without any page setting its own. If a page needs something these don't cover, add it to the shared components, not to the page.

**Page order**

1. The cover (`ProjectCover`, automatic for projects in `projects.js`)
2. The TL;DR / Full length toggle (`ViewToggle`)
3. Numbered sections (`CaseStudySection`, with `numbered` on `CaseStudyLayout`), starting with **Overview**: a short paragraph, then the `Facts` row (Role, Year, Sector, Team, Tools)
4. The live app link (`LiveLink`) at the end of the last section, if there is one
5. More work (`MoreWork`)

**Components to use** (from `components/case-study/`)

| For | Use |
| --- | --- |
| Body text | `Paragraph` |
| Lists | `List` |
| A heading inside a section | `Subheading` |
| A worked example or key point | `Callout` |
| Project facts | `Facts` |
| A screenshot, image or video (click an image to see it large) | `Figure` (`size="phone"` or `"wide"`, or `video`) |
| Screenshots side by side | `Figures` (`columns={2}` or `3`; two across on phones) |
| A stand-in for a screen not captured yet | `MediaPlaceholder`, in a `MediaRow` |
| The live app | `LiveLink` |

Not on the page: tag pills (the facts row replaces them), the old `CaseStudyHero` (the cover already shows the title), or page-local styled text.

**Every section has a `tldr`**: a one or two sentence summary, shown in TL;DR mode. Without one, TL;DR mode shows a placeholder. Only Overview is exempt (`tldrVisible`).

**Spacing and type** (set once, in the shared components; don't override on a page)

| | Desktop | Phones |
| --- | --- | --- |
| Cover to first section, and last section to More work (`--cover-gap`) | 8rem (7rem up to 1100px) | 6rem |
| Toggle to Overview | 3rem | 2.75rem |
| Between sections | 6rem | 4rem |
| Section heading to its content | 1.75rem | 1.25rem |
| Between paragraphs and blocks in a section | 1.25rem | 1rem |
| Section heading | ~2rem, weight 600, normal case, number above | 1.6rem, weight 500 |
| Subheading | 1.15rem, weight 600 | same |
| Body text | 1.05rem | 1rem |
| Side margins | 3rem (2rem up to 1100px) | 1rem |
| Divider line above each section | yes | no |

**Motion:** every section fades in once as it scrolls into view (an 8px lift, 0.6s), from `CaseStudySection`; nothing moves with reduced motion.

### Writing style: short, labelled chunks

Borrowed from a strong reference case study (a design-system role at Fresha): keep the eight-section structure, but write every section in short, labelled chunks a hiring manager can skim in a minute, not long paragraphs. Its format alone isn't enough for us: it has no problem, research, insight or validation, and its outcomes are unevidenced claims. So it's the style, inside our structure.

- **Facts block** under the overview: Role, Year, Sector, Team, Tools (`Facts` in `Prose.jsx`).
- **Each numbered section** opens with a one-line summary under its title.
- **Each design challenge in The solution** is a numbered block:
  > **Challenge title**
  > *One-line summary.*
  > **Insight:** what the research showed (tagged Evidence or Hypothesis)
  > **The work:** the design decisions
  > **Outcome:** what validation found, or "To be validated"
  > *Screens*
- **Every outcome** is evidence or labelled as a hypothesis, never a bare claim like "reduced friction".

### The Insights block: Evidence → Insight → Design response

The most important addition, because David asked about synthesis. Don't just show research artefacts: show what you concluded from them. Laid out as three columns (stacked on phones):

| Evidence | Insight | Design response |
| --- | --- | --- |
| What did I observe? A finding, with its source and context. | What does this mean for the user? The underlying need, not a restatement of the finding. | What did I design because of it? A sketch, wireframe or screen, and why it addresses the insight. |

Each row is tagged **Evidence** or **Hypothesis** (see the ground rules).

### The Validation block: success criteria

A table of what success meant, how it's tested, and what happened:

| Success criterion | How it's evaluated | Result |
| --- | --- | --- |
| e.g. Users understand today's plan | Ask users to find their next exercise without help | Participants, completion, errors or confusion, what changed. Or "Not tested yet". |

For usage metrics, give the measurement period and real figures.

### Process artefacts to pull from Figma and notes

You don't need to publish your working files. Pick a few that show your thinking:

- **Research synthesis:** notes, affinity maps, competitor comparisons, prioritisation.
- **Early exploration:** sketches, wireframes, alternative layouts.
- **Iterations:** earlier and later versions side by side, annotated with what changed.
- **Testing evidence:** task observations, feedback, and the changes that followed.

## Per project

What each case study has now, where it goes in the new structure, and what's missing. The **To gather** items are questions only you can answer.

### Cruciate

Current sections: Overview, Why, The journey, Progress, Options, Safety, Outcomes (placeholder).

| Now | Becomes |
| --- | --- |
| Overview | 1 Overview, shorter: the project and your responsibilities |
| Why | 2 The problem (personal story plus who it's for), and the start of 3 Research |
| The journey, Progress, Options, Safety | 6 The solution, as four design challenges (below) |
| Outcomes placeholder | 7 Validation and 8 Outcomes |

The solution, as four challenges:

1. **Making a long recovery feel manageable:** why recovery is organised around dates and phases, how onboarding sets the timeline, how the roadmap shows what's ahead. *Screens: onboarding, roadmap.*
2. **Turning a rehab plan into a daily action:** the checklist, exercise instructions and hold timers; completing and skipping exercises. *Screens: today's rehab, completed session.*
3. **Making gradual progress visible:** range-of-motion logging, measurement illustrations, trend charts, calendar and history. *Screens: measurement flow, progress chart, history.*
4. **Designing for safety and uncertainty:** symptom checks, exercise restrictions and milestone confirmations, and why a self-guided tool needs them. Make clear it supports clinical guidance and doesn't replace it. *Screens: symptom check-in, warning state, locked exercise.*

Options (the Cross-Border Directive step) stays unpublished until it's built and screenshotted; when it is, it fits under challenge 1.

Suggested opening (adjust to what you can back up):

> **Cruciate: making ACL recovery easier to navigate.** ACL rehabilitation is a long process with changing exercises, restrictions and milestones. Cruciate is a mobile-first rehab companion that brings a person's recovery timeline, daily exercises and progress tracking into one place, with safety checks built in. I designed and built it, exploring how a structured daily plan could make recovery easier to follow and progress easier to understand.

Validation criteria to use:

| Success criterion | How it's evaluated |
| --- | --- |
| Users understand today's plan | Ask them to find their next exercises without help |
| Users can log measurements | Watch whether they complete a range-of-motion entry correctly |
| Users understand their progress | Ask them to read their trend chart |
| Users understand safety restrictions | Test whether they know what to do when a red flag appears |
| Users return to the plan | Repeat sessions and weekly use, if there's real usage data |

It isn't public yet because of legal concerns. Say so, and present a private usability test or a physio review as the validation plan.

**Known (29 Sep 2026):** research covered physio advice, other ACL patients, a review of other rehab apps and published protocols, and the exercises and phases come from a mix of them. Not tested by anyone else yet; a physio review is planned. Iterated in code with Claude Code, with no sketches or Figma from the time: use the repo's git history for before and after, and design the Cross-Border step in sketches and Figma first.

**To gather** (full list in NEXT-SESSION.md, "Current focus"):
- The detail behind each research source: what the physio said, what patients said and where, which apps and what they lacked, which protocols.
- Which insights are evidence, and which are hypotheses.
- The physio review's findings, and what changed because of them.

### Operation Avocado

Current sections: Overview, Problem, Goal, Process, Outcomes. It already has the strongest process material: pen-and-paper sketches, a first artifact (name, branding, feature list), onboarding reasoning, and design principles.

| Now | Becomes |
| --- | --- |
| Overview | 1 Overview |
| Problem ("every app built around quick, timed workouts hides the same thing": the paywall; and the iPhone/Android problem) | 2 The problem |
| Goal ("what success looked like") | Success criteria, carried into 7 Validation |
| Process: sketches, first artifact | 5 Exploration |
| Process: onboarding tips, named workouts, 3D exercise models, builder, principles | 6 The solution, as three or four challenges |
| Outcomes | 7 Validation and 8 Outcomes |
| MISE (to be added) | "What I did differently the second time": the iteration story, in 8 Learnings, or 5 Exploration if it changed the design |

**To gather:**
- 3 Research: which workout apps did you compare, and what exactly was paywalled? A small competitor table would make the problem concrete.
- 4 Insights: turn the design principles (one accent colour, big touch targets, named workouts) into Evidence → Insight → Response rows, each labelled.
- 7 Validation: has she, or anyone else, been using it? For how long, and what did they say or change?

### Pints Yurt

Current sections: Overview, The question, Principles, Community price, Building it, Outcomes. It already has real success criteria ("find the cheapest nearby pint in under 5 seconds", "report a price in under 10 seconds"). Those are the backbone of its validation.

| Now | Becomes |
| --- | --- |
| Overview | 1 Overview |
| The question | 2 The problem, and the success criteria for 7 |
| Principles (price first, map first, community verified, recency, browse freely) | 4 Insights: each principle becomes a row with the evidence or hypothesis behind it |
| Community price | 6 The solution: "Making crowdsourced prices trustworthy" (the outlier example stays) |
| Building it | Short. A "how it was built" note inside 6, or cut: the process matters more than the stack |
| Outcomes | 7 Validation (time the 5 s and 10 s tasks with real people) and 8 Outcomes (real numbers: pubs, prices reported, users) |

**To gather:**
- 3 Research: how did you find out pint prices were a problem? Friends, existing apps, forums?
- 5 Exploration: map-first vs list-first, pin designs, earlier versions of the price sheet.
- 7 Validation: has anyone been timed on the two tasks? If not, that's a quick test worth running before publishing.
- 8 Outcomes: real usage figures, with the period they cover.

### OrthoVive

Current sections: Overview (brief), First Prototype, Stakeholder Feedback, Refined Prototype, Outcomes. Its shape is already brief → v1 → feedback → v2, which is the validation-and-iteration story the other three lack. It's the strongest proof you test and iterate.

| Now | Becomes |
| --- | --- |
| Overview (the brief) | 1 Overview and 2 The problem (what the brief asked for, and for whom) |
| "From the brief, I identified the core user needs" | 3 Research and 4 Insights: which needs, and from where |
| First Prototype | 5 Exploration |
| Stakeholder Feedback | 7 Validation, the core of this one |
| Refined Prototype | 6 The solution, shown as before and after against the feedback |
| Outcomes | 8 Outcomes |

The Claude + Figma workflow is a method, not the story. Mention it in the Overview facts or in Exploration, not as the subtitle.

**To gather:**
- The key insight from the stakeholder conversation. It's still a placeholder: "[summary of the main takeaway…]".
- The specific feedback points and what changed for each: side-by-side v1 and v2 screens.
- What happened after v2.

This content is locked; it moves to Firebase Storage later (see NEXT-SESSION to-do 6).

## Building the template

To-do 1 in NEXT-SESSION.md. Components the shared template needs:

- **Facts list** under the cover: Role, Year, Platform, Timeline, Team, Tools.
- **Numbered section heading**: 01–08, the title, and the question it answers as a small line under it.
- **Insight rows**: Evidence → Insight → Design response in three columns, stacked on phones, each with an Evidence or Hypothesis tag.
- **Design challenge block**: Challenge → Reasoning → Decision, with room for one to three screens.
- **Before/after pair**: two screens side by side with an annotation of what changed.
- **Success criteria table**: criterion, how it's evaluated, result (with a clear "Not tested yet" state).
- **Outcome / Learned / Next**: three short parts closing the page.
- **Artefact figure**: for sketches, notes and messy Figma: a caption and a slightly rougher frame than the polished screens, so process reads as process.
- Next/previous project links, then the big contact footer.

Suggested order: build the template with Cruciate first (it has the most material to restructure), then Pints Yurt, Operation Avocado, OrthoVive.

## Final checklist, per case study

- [ ] **Problem and motivation:** who it's for, what's missing, why you built it
- [ ] **Research:** sources, methods and real findings
- [ ] **Synthesis:** findings connected to user needs and design decisions (Evidence / Insight / Response)
- [ ] **Exploration:** alternatives and why the final direction won
- [ ] **Validation and iteration:** feedback, issues found, changes made
- [ ] **Success metrics:** criteria defined, real results or honestly "not yet"
- [ ] **Visual process:** a few sketches, notes, wireframes or Figma iterations
