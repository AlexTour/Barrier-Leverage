const container = document.getElementById('cards');
const searchInput = document.getElementById('search');
const themeFiltersContainer = document.getElementById('themeFilters');

let barriers = [];
let leveragePoints = [];
let selectedCardId = null;

fetch('https://raw.githubusercontent.com/AlexTour/Barrier-Leverage/refs/heads/main/impactMap.json')
  .then(res => res.json())
  .then(data => {
    barriers = data.barriers;
    leveragePoints = data.leveragePoints;
    createFilters();
    renderCards();
  });

function createFilters() {
  const themes = [...new Set([...barriers, ...leveragePoints].map(x => x.theme))];
  themes.forEach(theme => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" class="theme-filter" value="${theme}" checked> ${theme}`;
    themeFiltersContainer.appendChild(label);
  });
  document.querySelectorAll('.theme-filter').forEach(cb => cb.addEventListener('change', renderCards));
  searchInput.addEventListener('input', renderCards);
}

function renderCards() {
  const search = searchInput.value.toLowerCase();
  const activeThemes = Array.from(document.querySelectorAll('.theme-filter:checked')).map(cb => cb.value);
  container.innerHTML = '';

  const cards = [];

  barriers.forEach(barrier => {
    if ((barrier.tag.toLowerCase().includes(search) || barrier.description.toLowerCase().includes(search)) && activeThemes.includes(barrier.theme)) {
      const card = document.createElement('div');
      card.className = 'card barrier';
      card.dataset.id = barrier.id;
      card.dataset.type = 'barrier';
      card.innerHTML = `
        <span class="label">${barrier.theme}</span>
        <h3>${barrier.title}</h3>
        <p>${barrier.description}</p>
        <small class="source">${barrier.source}</small>
      `;
      cards.push(card);
      container.appendChild(card);
    }
  });

  leveragePoints.forEach(lp => {
    if ((lp.action.toLowerCase().includes(search) || lp.description.toLowerCase().includes(search)) && activeThemes.includes(lp.theme)) {
      const card = document.createElement('div');
      card.className = 'card leverage';
      card.dataset.id = lp.id;
      card.dataset.type = 'leverage';
      card.dataset.addresses = lp.addresses.join(',');
      card.innerHTML = `
        <span class="label">${lp.theme}</span>
        <h3>${lp.action}</h3>
        <p>${lp.description}</p>
        <p><strong>Addresses:</strong> ${lp.addresses.join(', ')}</p>
        <small class="source">${lp.source}</small>
      `;
      cards.push(card);
      container.appendChild(card);
    }
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const isSame = selectedCardId === card.dataset.id;
      selectedCardId = isSame ? null : card.dataset.id;
      updateHighlights(cards);
    });
  });

  updateHighlights(cards);
}

function updateHighlights(cards) {
  cards.forEach(card => card.classList.remove('selected', 'connected', 'faded'));
  if (!selectedCardId) return;
  const selected = cards.find(c => c.dataset.id === selectedCardId);
  if (!selected) return;
  selected.classList.add('selected');
  const type = selected.dataset.type;
  const id = selected.dataset.id;
  const connectedIds = [];

  if (type === 'barrier') {
    leveragePoints.forEach(lp => {
      if (lp.addresses.includes(id)) connectedIds.push(lp.id);
    });
  } else if (type === 'leverage') {
    const ids = selected.dataset.addresses ? selected.dataset.addresses.split(',') : [];
    connectedIds.push(...ids);
  }

  cards.forEach(card => {
    if (card.dataset.id === id) return;
    if (connectedIds.includes(card.dataset.id)) {
      card.classList.add('connected');
    } else {
      card.classList.add('faded');
    }
  });
}
