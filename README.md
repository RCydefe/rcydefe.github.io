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

Open `scores.json`. Each game is an object in the `games` array:

```json
{
  "id": "space-invaders",
  "name": "SPACE INVADERS",
  "button": "red",
  "highScores": [
    { "name": "RAY", "score": 25600, "date": "2026-06-14" }
  ]
}
```

- `id` — unique, lowercase, no spaces (used internally).
- `name` — what shows on the tab button.
- `button` — bulb color: `red`, `yellow`, `blue`, `white`, or `green`. Optional
  — if you skip it, colors cycle automatically.
- `highScores` — add as many `{ name, score, date }` entries as you want.
  They're re-sorted highest-to-lowest automatically, so paste new runs in any
  order. `name` is capped at 6 characters on screen, arcade-style.

To add a whole new game, copy a game object, give it a new `id` and `name`,
and add it to the `games` array. A tab appears for it automatically — no HTML
or CSS changes needed.

Commit and push `scores.json` whenever you want the live board updated:

```
git add scores.json
git commit -m "Update scores"
git push
```

GitHub Pages picks up the change within a minute or so.

## Local preview

Because the page `fetch`es `scores.json`, opening `index.html` directly from
disk will fail in most browsers (CORS on `file://`). Serve it locally instead:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
