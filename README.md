# Arcade High Scores

A static, cabinet-style high score board. One JSON file drives every game's
leaderboard — edit it, push, done.

## Files

| File          | Purpose                                          |
|---------------|---------------------------------------------------|
| `index.html`  | Page structure                                    |
| `styles.css`  | Cabinet / CRT visual treatment                    |
| `scripts.js`  | Loads `scores.json`, builds tabs + table          |
| `scores.json` | **The only file you need to edit to add scores**  |

## Going live on GitHub Pages

1. Push this folder to a repo (e.g. `arcade-scoreboard`).
2. In the repo: **Settings → Pages → Source → Deploy from a branch**, pick
   `main` and `/ (root)`, save.
3. GitHub gives you a URL like `https://<username>.github.io/arcade-scoreboard/`
   within a minute or two.

## Updating scores

Open `scores.json`. It's a list of **categories** (the tabs at the very top
— right now `HIGH SCORES` and `SPEED RUNS`), and each category has its own
list of **games**:

```json
{
  "id": "speedruns",
  "label": "SPEED RUNS",
  "metric": "time",
  "metricLabel": "TIME",
  "sort": "asc",
  "games": [
    {
      "id": "space-invaders",
      "name": "SPACE INVADERS",
      "button": "red",
      "entries": [
        { "name": "RAY", "time": 632.18, "date": "2026-06-16" }
      ]
    }
  ]
}
```

Category fields:
- `label` — text on the top tab and the marquee.
- `metric` — `"score"` or `"time"`. Controls which field on each entry is
  read (`entry.score` or `entry.time`) and how it's formatted — scores get
  comma separators, times get formatted as `M:SS.mmm` (so store time as a
  plain number of seconds, e.g. `92.4` → `1:32.400`).
- `metricLabel` — the column header text (e.g. `SCORE` or `TIME`).
- `sort` — `"desc"` (highest wins, for scores) or `"asc"` (lowest wins, for
  times).

Game fields (same idea as before):
- `id` — unique, lowercase, no spaces.
- `name` — what shows on the game-select button.
- `button` — bulb color: `red`, `yellow`, `blue`, `white`, or `green`.
  Optional — colors cycle automatically if skipped.
- `entries` — add as many `{ name, score|time, date }` objects as you want.
  They're re-sorted automatically, so paste new runs in any order. `name` is
  capped at 6 characters on screen, arcade-style.

To add a whole new game to a category, copy a game object inside that
category's `games` array, give it a new `id`/`name`. To add a whole new
category (e.g. a co-op or seasonal board), copy a whole category object at
the top level and give it a new `id`/`label` — a new top tab appears
automatically, no HTML or CSS changes needed.

Commit and push `scores.json` whenever you want the live board updated:

```
git add scores.json
git commit -m "Update scores"
git push
```

GitHub Pages picks up the change within a minute or so.

## If the live page doesn't show the scoreboard

GitHub Pages runs every repo through Jekyll by default. Jekyll has its own
opinion about what the homepage should be, and on a repo with no real Jekyll
site, it can render a generic theme page (built from your repo's name and
description) instead of serving `index.html` as-is.

Two things fix this:

1. **Keep the included `.nojekyll` file at the repo root.** It's a 0-byte
   file — its only job is to tell GitHub Pages "skip Jekyll, serve the files
   exactly as committed." Don't delete it.
2. **`index.html`, `styles.css`, `scripts.js`, `scores.json`, and
   `.nojekyll` must all sit directly in the repo root** (the same folder
   Pages is told to serve from) — not inside a subfolder like
   `arcade-scoreboard/`. If they're nested, either move them up to root or
   set **Settings → Pages → Source** to that subfolder.

## Local preview

Because the page `fetch`es `scores.json`, opening `index.html` directly from
disk will fail in most browsers (CORS on `file://`). Serve it locally instead:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
