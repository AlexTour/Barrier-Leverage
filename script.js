// script.js

let data = null;
let selected = null; // { type: 'barrier'|'leverage', id: '...' }

async function init() {
  const res = await fetch(
    "https://raw.githubusercontent.com/AlexTour/Barrier-Leverage/refs/heads/main/impactMap.json"
  );
  data = await res.json();

  buildThemeFilters();
  attachEventListeners();
  renderAll();
}

function buildThemeFilters() {
  const barrierThemes = data.barriers.map((b) => b.theme);
  const leverageThemes = data.leveragePoints.map((lp) => lp.theme);
  const allThemes = [...new Set([...barrierThemes, ...leverageThemes])];

  const container = document.getElementById("theme-filters");
  container.innerHTML = "";
  allThemes.forEach((t) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label><input type="checkbox" value="${t}" checked> ${t}</label>
    `;
    container.appendChild(div);
  });
}

function attachEventListeners() {
  document.getElementById("search").addEventListener("input", renderAll);
  document
    .querySelectorAll("#theme-filters input[type=checkbox]")
    .forEach((cb) => cb.addEventListener("change", renderAll));
}

function renderAll() {
  renderSection("barrier-cards", "barrier");
  renderSection("leverage-cards", "leverage");
  applySelectionEffects();
}

function renderSection(containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const filtered = filterItems(type);

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = `card`;
    card.dataset.type = type;
    card.dataset.id = item.id;

    const label = document.createElement("span");
    label.className = `label theme-${toClass(item.theme)}`;
    label.textContent = item.theme;

    const title = document.createElement("h3");
    title.textContent = type === "barrier" ? item.tag : item.action;

    const desc = document.createElement("p");
    desc.textContent = item.description;

    const source = document.createElement("div");
    source.className = "source";
    source.textContent = item.source;

    card.appendChild(label);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(source);

    card.addEventListener("click", () => selectCard(type, item.id));
    container.appendChild(card);
  });
}

function filterItems(type) {
  const text = document.getElementById("search").value.toLowerCase();
  const active = Array.from(
    document.querySelectorAll("#theme-filters input:checked")
  ).map((cb) => cb.value);

  return (type === "barrier" ? data.barriers : data.leveragePoints)
    .filter((it) => active.includes(it.theme))
    .filter(
      (it) =>
        (it.tag || it.action).toLowerCase().includes(text) ||
        it.description.toLowerCase().includes(text)
    );
}

function selectCard(type, id) {
  if (selected && selected.type === type && selected.id === id) {
    selected = null; // unselect
  } else {
    selected = { type, id };
  }
  applySelectionEffects();
}

function applySelectionEffects() {
  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => {
    card.classList.remove("selected", "related");
    card.style.opacity = selected ? "0.3" : "1";
  });

  if (!selected) return;

  const selCard = document.querySelector(
    `.card[data-type="${selected.type}"][data-id="${selected.id}"]`
  );
  if (selCard) {
    selCard.classList.add("selected");
    selCard.style.opacity = "1";
  }

  let relatedIDs = [];
  if (selected.type === "barrier") {
    relatedIDs = data.leveragePoints
      .filter((lp) => lp.addressesBarrierIDs.includes(selected.id))
      .map((lp) => lp.id);
  } else {
    const lp = data.leveragePoints.find((lp) => lp.id === selected.id);
    relatedIDs = lp ? lp.addressesBarrierIDs : [];
  }

  const relatedType = selected.type === "barrier" ? "leverage" : "barrier";
  relatedIDs.forEach((id) => {
    const card = document.querySelector(
      `.card[data-type="${relatedType}"][data-id="${id}"]`
    );
    if (card) {
      card.classList.add("related");
      card.style.opacity = "1";
    }
  });
}

// Convert theme name to safe CSS class
function toClass(str) {
  return str.replace(/\s+/g, "").replace(/[^A-Za-z0-9]/g, "");
}

init();
