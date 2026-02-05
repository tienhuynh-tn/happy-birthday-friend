# Memory Jar

A single-page birthday web app built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features
- Candy-jar style glass container with floating wish notes
- Tap a note to open a birthday card modal
- Random wish picker
- Fill-level progress and final surprise note
- CSS-based celebration effects
- Responsive and accessible UI

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the app.

## Build & Run

```bash
npm run build
npm run start
```

## GitHub Pages Deployment

This project is configured for GitHub Pages under the subpath:
`/happy-birthday-friend/memory-jar/`

Build output is generated at:
`2026/memory-jar/out/`

To deploy on the existing main branch:
1. Run `npm run deploy:memory-jar`
2. This copies `out/` into `/memory-jar/` at the repo root.

## Project Structure
- `app/` Next.js App Router pages and layout
- `components/` UI components
- `data/` types and data helpers
- `lib/` hooks and utilities
- `public/` static assets and `wishes.txt`
