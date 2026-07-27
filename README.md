# Dara Phillips — Product Design Portfolio

Personal portfolio for Dara Phillips, Product Designer. A single-page React app showcasing
case studies with custom interactions, animation, and a bespoke cursor/UI system — built,
broken, and rebuilt in the open.

**Live site:** [daraphillips.com](https://daraphillips.com)

---

## A quick word on AI, since everyone asks

Yes, this portfolio was built with an AI coding assistant in the loop. No, it did not
"design" anything — it deleted 4,500+ lines of dead code, compressed a 209MB video down to
20MB without anyone noticing, and reorganized a folder structure that had somehow
accumulated five different logo files named some variation of `Logo.svg`. Taste, judgment,
and "does this actually solve the user's problem" are still very much a human job. The
part where you clean up after yourself, however, AI is suspiciously good at — which,
if you've ever worked with a designer, is either very reassuring or very threatening,
depending on the designer.

If you're a recruiter reading this: I use AI tools daily, I'm not afraid of them, and I can
talk at length about where they're genuinely useful in a design workflow versus where
they're just expensive autocomplete. If you're another designer reading this: same energy,
let's talk shop.

---

## Case Studies

| Project | Route | What it is |
| - | - | - |
| **Kropt** | `/kropt` | Mobile app concept — behaviour-driven habit formation for agriculture |
| **Neuroloop** | `/neuroloop` | AI & VR case study — an immersive learning experience |
| **OrthoVive** | `/orthovive` | NDA client work — password-protected (see below) |
| **ibhf.ie** | `/ibhf` | Website design for the Irish Bee & Heritage Foundation |
| **Operation Avocado** | `/operation-avocado` | Mobile web app — coming soon |

NDA case studies are gated behind real authentication (Firebase Auth + Storage Security
Rules), not a password baked into the JavaScript — so client work stays client-confidential,
not "security through nobody reading the bundle."

## Tech Stack

- **React 19** + **Vite** — app shell and build tooling
- **React Router v7** — client-side routing
- **styled-components** — theming and component styles
- **Framer Motion** / **GSAP** — animation and transitions
- **React Hook Form** + **EmailJS** — contact form handling
- **Firebase** — Hosting, Authentication, and Storage (for gated NDA content)

## Project Structure

Organized by feature, not by file type — each case study is self-contained, so adding the
next one means adding one folder, not hunting through a shared `assets/` pile.

```text
src/
  case-studies/
    <name>/            Page component + its own assets/, one folder per project
  components/
    layout/             Navbar, Footer, cursor — app-wide chrome
    home/                Homepage-only components and assets
    case-study/          Shared scaffolding every case study uses (hero, nav, sections)
    shared/              Cross-project components (carousels, the auth gate, etc.)
    icons/               Small standalone icon components
  pages/                 Top-level routed pages (currently just Home)
  styles/                Theme tokens and global styles
  assets/shared/          Truly site-wide assets only
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Deployment

The site deploys to Firebase Hosting. Build output goes to `dist/` per `firebase.json`,
with all routes rewritten to `index.html` to support client-side routing. Storage Security
Rules (`storage.rules`) deploy separately and gate access to NDA-protected case study assets.

```bash
npm run build
firebase deploy
```
