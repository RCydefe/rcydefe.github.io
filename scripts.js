const categoryTabsEl = document.getElementById("category-tabs");
const tabsEl = document.getElementById("tabs");
const bodyEl = document.getElementById("board-body");
const marqueeTitleEl = document.getElementById("marquee-title");
const metricHeaderEl = document.getElementById("metric-header");

const BUTTON_CYCLE = ["red", "yellow", "blue", "white", "green"];

let categories = [];
let activeCatIndex = 0;
let activeGameIndex = 0;

init();

async function init() {
  try {
    const res = await fetch("scores.json", { cache: "no-store" });
    if (!res.ok) throw new Error("scores.json not found");
    const data = await res.json();
    categories = Array.isArray(data.categories) ? data.categories : [];
  } catch (err) {
    categories = [];
    console.error("Could not load scores.json:", err);
  }

  if (categories.length === 0) {
    categoryTabsEl.innerHTML = "";
    tabsEl.innerHTML = "";
    renderEmptyBoard("No boards yet. Add a category in scores.json.");
    return;
  }

  renderCategoryTabs();
  renderGameTabs();
  renderBoard();
}

function renderCategoryTabs() {
  categoryTabsEl.innerHTML = "";

  categories.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = "category-tab";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === activeCatIndex ? "true" : "false");
    btn.id = `cat-tab-${cat.id || i}`;
    btn.textContent = cat.label || `BOARD ${i + 1}`;

    btn.addEventListener("click", () => {
      if (i === activeCatIndex) return;
      activeCatIndex = i;
      activeGameIndex = 0;
      renderCategoryTabs();
      renderGameTabs();
      renderBoard();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        activeCatIndex = (activeCatIndex + dir + categories.length) % categories.length;
        activeGameIndex = 0;
        renderCategoryTabs();
        renderGameTabs();
        renderBoard();
        const next = categoryTabsEl.querySelector(`[aria-selected="true"]`);
        if (next) next.focus();
      }
    });

    categoryTabsEl.appendChild(btn);
  });
}

function renderGameTabs() {
  tabsEl.innerHTML = "";
  const games = (categories[activeCatIndex] && categories[activeCatIndex].games) || [];

  games.forEach((game, i) => {
    const color = game.button || BUTTON_CYCLE[i % BUTTON_CYCLE.length];

    const btn = document.createElement("button");
    btn.className = "cab-button";
    btn.type = "button";
    btn.dataset.color = color;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", i === activeGameIndex ? "true" : "false");
    btn.id = `tab-${game.id || i}`;

    const bulb = document.createElement("span");
    bulb.className = "bulb";
    bulb.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = game.name || `GAME ${i + 1}`;

    btn.append(bulb, label);

    btn.addEventListener("click", () => {
      activeGameIndex = i;
      renderGameTabs();
      renderBoard();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        activeGameIndex = (activeGameIndex + dir + games.length) % games.length;
        renderGameTabs();
        renderBoard();
        const next = tabsEl.querySelector(`[aria-selected="true"]`);
        if (next) next.focus();
      }
    });

    tabsEl.appendChild(btn);
  });
}

function renderBoard() {
  const category = categories[activeCatIndex];
  bodyEl.innerHTML = "";

  if (!category) {
    renderEmptyBoard("No data for this board yet.");
    return;
  }

  marqueeTitleEl.textContent = category.label || "SCOREBOARD";
  const metric = category.metric === "time" ? "time" : "score";
  metricHeaderEl.textContent = category.metricLabel || (metric === "time" ? "TIME" : "SCORE");

  const game = (category.games || [])[activeGameIndex];

  if (!game) {
    renderEmptyBoard("No data for this game yet.");
    return;
  }

  const entries = Array.isArray(game.entries) ? [...game.entries] : [];
  const ascending = category.sort === "asc";
  entries.sort((a, b) => {
    const av = Number(a[metric]) || 0;
    const bv = Number(b[metric]) || 0;
    return ascending ? av - bv : bv - av;
  });

  if (entries.length === 0) {
    renderEmptyBoard("No runs logged yet. Be the first.");
    return;
  }

  entries.forEach((entry, i) => {
    const row = document.createElement("tr");

    const rank = document.createElement("td");
    rank.className = "col-rank";
    rank.textContent = String(i + 1).padStart(2, "0");

    const name = document.createElement("td");
    name.className = "col-name";
    name.textContent = (entry.name || "---").toUpperCase().slice(0, 6);

    const value = document.createElement("td");
    value.className = "col-score";
    value.textContent = metric === "time" ? formatTime(entry.time) : formatScore(entry.score);

    const date = document.createElement("td");
    date.className = "col-date";
    date.textContent = formatDate(entry.date);

    row.append(rank, name, value, date);
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

function formatTime(totalSeconds) {
  const n = Number(totalSeconds) || 0;
  const mins = Math.floor(n / 60);
  const secs = n - mins * 60;
  const wholeSecs = Math.floor(secs);
  const ms = Math.round((secs - wholeSecs) * 1000);
  return `${mins}:${String(wholeSecs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
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
