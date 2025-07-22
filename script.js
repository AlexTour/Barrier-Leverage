let selectedCardId = null;

function renderCards() {
  const search = searchInput.value.toLowerCase();
  const activeThemes = Array.from(themeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  container.innerHTML = '';

  const allCards = [];

  barriers.forEach(barrier => {
    if (
      (barrier.title.toLowerCase().includes(search) || barrier.description.toLowerCase().includes(search)) &&
      activeThemes.includes(barrier.theme)
    ) {
      const div = document.createElement('div');
      div.className = 'card barrier';
      div.dataset.id = barrier.id;
      div.dataset.type = 'barrier';
      div.innerHTML = `
        <span class="label">${barrier.theme}</span>
        <h3>${barrier.title}</h3>
        <p>${barrier.description}</p>
        <small class="source">${barrier.source}</small>
      `;
      container.appendChild(div);
      allCards.push(div);
    }
  });

  leveragePoints.forEach(lp => {
    if (
      (lp.action.toLowerCase().includes(search) || lp.description.toLowerCase().includes(search)) &&
      activeThemes.includes(lp.theme)
    ) {
      const div = document.createElement('div');
      div.className = 'card leverage';
      div.dataset.id = lp.id;
      div.dataset.type = 'leverage';
      div.dataset.addresses = lp.addresses.join(',');
      div.innerHTML = `
        <span class="label">${lp.theme}</span>
        <h3>${lp.action}</h3>
        <p>${lp.description}</p>
        <p><strong>Addresses:</strong> ${lp.addresses.join(', ')}</p>
        <small class="source">${lp.source}</small>
      `;
      container.appendChild(div);
      allCards.push(div);
    }
  });

  allCards.forEach(card => {
    card.addEventListener('click', () => {
      const isSame = selectedCardId === card.dataset.id;
      selectedCardId = isSame ? null : card.dataset.id;
      updateHighlights(allCards);
    });
  });

  updateHighlights(allCards);
}

function updateHighlights(cards) {
  cards.forEach(card => {
    card.classList.remove('selected', 'connected', 'faded');
  });

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
