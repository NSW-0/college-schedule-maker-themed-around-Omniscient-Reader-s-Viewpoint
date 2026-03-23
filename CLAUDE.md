# ORV Schedule Maker

A single-page college schedule builder themed after *Omniscient Reader's Viewpoint* (dark gold/amber aesthetic). Users add lectures with times and days, view them on a visual grid, and export as JSON or PNG screenshot.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | Vanilla HTML5 (`index.html`) |
| Logic | Vanilla JS ES6+ (`app.js`, `'use strict'`) |
| Styling | Vanilla CSS3 with custom properties (`style.css`) |
| Screenshot | html2canvas 1.4.1 (CDN) |
| Fonts | Google Fonts — Cinzel (headings), Raleway (body) |

No build tool, no framework, no package manager. Open `index.html` directly in a browser (or via a local HTTP server for `bg.jpg` to load correctly).

## Project Structure

```
college-schedule/
├── index.html      # App shell, modal, context menu markup
├── app.js          # All logic: state, rendering, events
├── style.css       # ORV theme, layout, animations
└── bg.jpg          # Background image (required for PNG export)
```

## Running the App

```bash
# Any static server works — needed for bg.jpg CORS in html2canvas
npx serve .
# or
python -m http.server 8080
```

Open `index.html` directly for basic use; PNG export requires a local server.

## No Build / No Tests

There is no build step, test suite, or linter configuration. Changes take effect on browser reload.

## Key IDs (HTML ↔ JS contract)

| Element ID | Purpose |
|-----------|---------|
| `grid-wrapper` | Grid render target (`app.js:51`) |
| `modal-overlay` | Add/edit modal (`app.js:221`) |
| `ctx-menu` | Right-click context menu (`app.js:263`) |
| `schedule-display` | html2canvas screenshot target (`app.js:295`) |
| `controls-bar` | Toolbar excluded from screenshot (`app.js:303`) |

## Additional Documentation

- `.claude/docs/architectural_patterns.md` — state model, rendering strategy, event wiring, export design, and other recurring patterns
