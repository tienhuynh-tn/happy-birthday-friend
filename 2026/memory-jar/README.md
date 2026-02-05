# Memory Jar

A single-page birthday web app built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Tech stack
- Next.js (App Router) with static export
- TypeScript
- Tailwind CSS

## Features
- Candy-jar style glass container with floating wish notes
- Tap a note to open a birthday card modal
- Random wish picker
- Fill-level progress and final surprise note
- CSS-based celebration effects
- Responsive and accessible UI

## Live URL
https://tienhuynh-tn.github.io/happy-birthday-friend/memory-jar/

## Local dev

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the app.

## Build & export

```bash
npm run build
```

Static export output is written to `./out`.

## Quick deploy Memory Jar

```bash
cd 2026/memory-jar
npm install
npm run build
cd ../..
rm -rf memory-jar
cp -R 2026/memory-jar/out memory-jar
git add memory-jar
git commit -m "deploy: update memory-jar"
git push
```

## Deployment notes
- GitHub Pages serves static content from the `main` branch at the repo root (`/`).
- `out/` inside `2026/memory-jar` is intermediate output only.
- The published folder is `/memory-jar` at the repo root.
- Do NOT commit `.next/`.

## Troubleshooting
- If CSS/JS 404, confirm you are opening:
  https://tienhuynh-tn.github.io/happy-birthday-friend/memory-jar/
- If `wishes.txt` 404, ensure it exists in `out/` and is fetched via `fetch("./wishes.txt")`.

## Project Structure
- `app/` Next.js App Router pages and layout
- `components/` UI components
- `data/` types and data helpers
- `lib/` hooks and utilities
- `public/` static assets and `wishes.txt`
