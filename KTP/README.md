# Everyday Korean — GitHub Pages Prototype

A build-free, mobile-first Korean learning website. The interface and lesson data are separated so content can be maintained through GitHub without editing the page layout.

## Project structure

```text
korean_tutor_mobile_draft/
├─ index.html
├─ styles.css
├─ app.js
└─ data/
   ├─ site.json
   ├─ tracks.json
   ├─ memory-cards.json
   └─ daily-sentences.json
```

## Editing content

- `data/site.json`: homepage progress, streak, and section labels
- `data/tracks.json`: course cards and lesson lists
- `data/memory-cards.json`: context cards, Korean variants, hidden attitudes, translations
- `data/daily-sentences.json`: reusable everyday sentence list

Add new objects using the existing JSON structure. The interface is rendered automatically by `app.js`.

## Preview locally

JSON files are loaded with `fetch()`, so opening `index.html` directly through `file://` may be blocked by the browser. Run a small local server from the project directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

1. Upload the project files to a GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose the branch and root folder.
5. Open the generated Pages URL.

No build tools or package installation are required.

## Current functions

- Beige/brown responsive mobile UI
- JSON-driven course cards, memory cards, and daily sentences
- Korean browser text-to-speech
- Sentence-attitude tabs
- Saved memory cards stored in `localStorage`
- Course preview dialog
- Side menu and bottom navigation
