# Dara Phillips — Product Design Portfolio

Personal portfolio site for Dara Phillips, Product Designer. Built as a single-page React app showcasing case studies (Neuroloop, Kropt, OrthoVive) with custom interactions, animation, and a bespoke cursor/UI system.

Live site: [daraphillips.com](https://daraphillips.com)

## Tech Stack

- **React 19** + **Vite** — app shell and build tooling
- **React Router v7** — client-side routing
- **styled-components** — theming and component styles
- **Framer Motion** / **GSAP** — animation and transitions
- **MUI (Material UI)** — select UI primitives
- **React Hook Form** + **EmailJS** — contact form handling
- **Firebase Hosting** — deployment

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

## Project Structure

```text
src/
  components/       Shared UI (Navbar, Footer, cursor, cards, feedback widgets)
  components/case-study/   Reusable case study layout primitives (hero, nav, sections)
  pages/            Route-level pages (Home, Kropt, Neuroloop, OrthoVive)
  styles/           Theme tokens and global styles
  assets/           Images, videos, and logos used across case studies
```

## Deployment

The site is deployed to Firebase Hosting. Build output goes to `dist/` per `firebase.json`, with all routes rewritten to `index.html` to support client-side routing.

```bash
npm run build
firebase deploy
```

## Case Studies

- **Neuroloop** — `/neuroloop`
- **Kropt** — `/kropt`
- **OrthoVive** — `/orthovive`
