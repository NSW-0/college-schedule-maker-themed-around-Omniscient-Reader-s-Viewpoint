# 📖 ORV Schedule Maker

> *"I was the only one who knew the end of this story."*  
> — Kim Dokja, Omniscient Reader's Viewpoint

A single-page college schedule builder themed after **Omniscient Reader's Viewpoint (전지적 독자 시점)** — dark atmosphere, gold/amber accents, and zero tolerance for scheduling conflicts. Add lectures, visualize them on a live weekly grid, and export your semester as JSON or a PNG screenshot.

---

## ✨ Features

- **Visual weekly grid** — Renders Mon / Tue / Wed / Thu / Sat columns with a dynamic time axis that auto-fits your earliest and latest lecture
- **Add & edit lectures** — Modal dialog with 12-hour time pickers (hour, minute, AM/PM), multi-day selection via pill checkboxes, and smart validation
- **Auto end-time** — When you change the start time, the end time advances by 90 minutes automatically if it would fall behind
- **Color palette** — Each new lecture gets a unique color from an 8-color palette (coral, teal, amber, purple, and more); never repeats until all are used
- **Right-click context menu** — Click any course block to Edit or Delete it
- **Save as JSON** — Exports the full schedule (title + all lectures) as a `.json` file for later reloading
- **Save as PNG** — Screenshots the grid at 2× resolution via `html2canvas`, excluding the toolbar, for a clean shareable image
- **Load schedule** — Reload any previously saved `.json` file to resume editing
- **New schedule** — Clears everything with a confirmation prompt
- **ORV aesthetic** — Cinzel headings, Raleway body text, dark panel backgrounds, and glowing gold borders throughout

---

## 🗂️ Project Structure

```
college-schedule/
├── index.html   # App shell: toolbar, grid container, modal, context menu
├── app.js       # All state & logic: rendering, modal, save/load, events
├── style.css    # ORV theme: CSS variables, grid layout, animations
└── bg.jpg       # Background image (required for PNG export)
```

No build tool. No framework. No package manager. Four files — open and go.

---

## 🛠️ Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Structure   | Vanilla HTML5                                   |
| Logic       | Vanilla JS ES6+ (`'use strict'`)                |
| Styling     | Vanilla CSS3 with custom properties             |
| Screenshot  | [html2canvas 1.4.1](https://html2canvas.hertzen.com/) via CDN |
| Fonts       | Google Fonts — **Cinzel** (headings), **Raleway** (body) |

---

## 🚀 Running the App

Opening `index.html` directly works for all features **except** PNG export, which requires a local HTTP server for `bg.jpg` to load correctly via `html2canvas`.

```bash
# Option 1 — Node
npx serve .

# Option 2 — Python
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

---

## 🗓️ How to Use

1. **Enter a title** in the top bar (optional — appears inside the exported PNG)
2. **Click `＋ Add Lecture`** — fill in the course name, start/end time, and check the days it meets
3. **Click Confirm** — the lecture appears on the grid immediately
4. **Click a course block** — a context menu lets you **Edit** or **Delete** it
5. **Click `⬇ Save Schedule`** — downloads both a `.json` data file and a `.png` screenshot
6. **Click `↑ Load Schedule`** — pick a previously saved `.json` to restore your schedule
7. **Click `✕ New Schedule`** — clears everything and starts fresh

---

## ⌨️ Keyboard Shortcuts

| Key      | Action                                      |
|----------|---------------------------------------------|
| `Enter`  | Confirm the modal (when a field is focused) |
| `Escape` | Close modal or dismiss context menu         |

---

## 🔑 Key Element IDs

| ID                 | Purpose                                                |
|--------------------|--------------------------------------------------------|
| `grid-wrapper`     | Grid render target (`app.js` line 51)                  |
| `modal-overlay`    | Add / Edit lecture modal (`app.js` line 221)           |
| `ctx-menu`         | Right-click context menu (`app.js` line 263)           |
| `schedule-display` | `html2canvas` screenshot target (`app.js` line 295)    |
| `controls-bar`     | Toolbar — excluded from screenshot (`app.js` line 303) |

---

## 🎨 Color Palette

Courses are assigned colors in order, cycling only after all 8 are used:

| Color        | Hex       |
|--------------|-----------|
| Coral        | `#E76F51` |
| Sandy Orange | `#F4A261` |
| Teal         | `#2A9D8F` |
| Steel Blue   | `#457B9D` |
| Amber Yellow | `#E9C46A` |
| Soft Purple  | `#9B72CF` |
| Mint         | `#52B788` |
| Rose         | `#F28482` |

---

## 📁 Save Format

Schedules are saved as plain JSON:

```json
{
  "title": "Spring 2025",
  "courses": [
    {
      "id": "uuid-here",
      "name": "CS 101 — Intro to Programming",
      "startTime": "09:00",
      "endTime": "10:30",
      "days": ["Mon", "Wed"],
      "color": "#2A9D8F"
    }
  ]
}
```

---

## ⚠️ Known Limitations

- **PNG export requires a local server** — `bg.jpg` will fail CORS checks if opened via `file://`
- **Days are fixed** — Mon, Tue, Wed, Thu, Sat only (no Sun or Fri)
- **No conflict detection** — overlapping lectures will stack visually but won't be flagged
- **No persistence** — state lives in memory; reload the page and the schedule is gone unless saved

---

## 📜 License

MIT — free to use, modify, and share.

---

## 💬 Acknowledgements

- Themed after the Korean web novel **Omniscient Reader's Viewpoint** by *sing N song* (싱숑)
- Background art and all character references belong to their respective creators
- Built for readers who plan their semester with the resolve of a final-scenario protagonist

---

> *"The story isn't over yet. Keep reading — and keep scheduling."*
