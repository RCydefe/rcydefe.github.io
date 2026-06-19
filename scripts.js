const tabsEl = document.getElementById("tabs");
const bodyEl = document.getElementById("board-body");

const BUTTON_CYCLE = ["red", "yellow", "blue", "white", "green"];

let games = [];
let activeIndex = 0;

init();

async function init() {
  try {
    const res = await fetch("scores.json", { cache: "no-store" });
    if (!res.ok) throw new Error("scores.json not found");
    const data = await res.json();
    games = Array.isArray(data.games) ? data.games : [];
  } catch (err) {
    games = [];
    console.error("Could not load scores.json:", err);
  }

  if (games.length === 0) {
    tabsEl.innerHTML = "";
    renderEmptyBoard("No games yet. Add one in scores.json.");
    return;
  }

  renderTabs();
  renderBoard(activeIndex);
}

function renderTabs() {
  tabsEl.innerHTML = "";

  games.forEach((game, i) => {
    const color = game.button || BUTTON_CYCLE[i % BUTTON_CYCLE.length];

    const btn = document.createElement("button");
    btn.className = "cab-button";
    btn.type = "button";
    btn.dataset.color = color;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
    btn.id = `tab-${game.id || i}`;

    const bulb = document.createElement("span");
    bulb.className = "bulb";
    bulb.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = game.name || `GAME ${i + 1}`;

    btn.append(bulb, label);

    btn.addEventListener("click", () => {
      activeIndex = i;
      renderTabs();
      renderBoard(activeIndex);
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        activeIndex = (activeIndex + dir + games.length) % games.length;
        renderTabs();
        renderBoard(activeIndex);
        const next = tabsEl.querySelector(`[aria-selected="true"]`);
        if (next) next.focus();
      }
    });

    tabsEl.appendChild(btn);
  });
}

function renderBoard(index) {
  const game = games[index];
  bodyEl.innerHTML = "";

  if (!game) {
    renderEmptyBoard("No data for this game yet.");
    return;
  }

  const scores = Array.isArray(game.highScores) ? [...game.highScores] : [];
  scores.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (scores.length === 0) {
    renderEmptyBoard("No scores logged yet. Be the first.");
    return;
  }

  scores.forEach((entry, i) => {
    const row = document.createElement("tr");

    const rank = document.createElement("td");
    rank.className = "col-rank";
    rank.textContent = String(i + 1).padStart(2, "0");

    const name = document.createElement("td");
    name.className = "col-name";
    name.textContent = (entry.name || "---").toUpperCase().slice(0, 6);

    const score = document.createElement("td");
    score.className = "col-score";
    score.textContent = formatScore(entry.score);

    const date = document.createElement("td");
    date.className = "col-date";
    date.textContent = formatDate(entry.date);

    row.append(rank, name, score, date);
    bodyEl.appendChild(row);
  });
}

function renderEmptyBoard(message) {
  bodyEl.innerHTML = "";
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 4;
  cell.className = "board-empty";
  cell.textContent = message;
  row.appendChild(cell);
  bodyEl.appendChild(row);
}

function formatScore(score) {
  const n = Number(score) || 0;
  return n.toLocaleString("en-US");
}

function formatDate(dateStr) {
  if (!dateStr) return "--.--.--";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
}
