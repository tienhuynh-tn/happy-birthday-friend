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

## GitHub Pages Deployment (Root = /)

This repository is served from the root of the `main` branch. To avoid overwriting source files in
`/2026/memory-jar/`, the static export is copied into a publish folder:

```
/2026/memory-jar-site/
```

Deploy steps:
1. Run `npm run deploy:memory-jar`
2. Commit the contents of `/2026/memory-jar-site/`

The app will be available at:
`https://tienhuynh-tn.github.io/happy-birthday-friend/2026/memory-jar-site/`

If you need the URL to be `/2026/memory-jar/`, the source folder would need to be moved or a separate
publish directory wired into Pages, which is not allowed by current repo settings.

## Project Structure
- `app/` Next.js App Router pages and layout
- `components/` UI components
- `data/` types and data helpers
- `lib/` hooks and utilities
- `public/` static assets and `wishes.txt`
