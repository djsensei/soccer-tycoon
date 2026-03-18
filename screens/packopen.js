// ============================================================
// screens/packopen.js — Card pack opening screen
// ============================================================

// Module state for card-by-card reveal
let _revealIndex    = 0;
let _sortedCards    = [];
let _skipRevealed   = false;
let _showingRevealed = false; // true while the just-revealed card is animating
let _newCardIds     = null;   // Set of cardIds the player didn't own before this pack

const RARITY_SORT = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

// Handler: open the next pending pack, add cards to inventory, then render.
// This is called by buttons — render functions never mutate state.
function openNextPack() {
  const pending = gameState.pendingPacks[0];
  if (!pending) { updateState({ screen: 'table' }); return; }

  // Support both old format (string) and new format ({ packId, opponentId })
  const packId     = typeof pending === 'string' ? pending : pending.packId;
  const opponentId = typeof pending === 'string' ? null    : pending.opponentId;

  const cardIds = openPack(packId, opponentId);
  // Track which cards the player didn't own before this pack
  const ownedBefore = new Set(gameState.inventory.map(i => i.cardId));
  _newCardIds = new Set(cardIds.filter(id => !ownedBefore.has(id)));
  const newInventory = [...gameState.inventory];
  for (const cardId of cardIds) {
    const existing = newInventory.find(i => i.cardId === cardId);
    if (existing) existing.quantity++;
    else newInventory.push({ cardId, quantity: 1 });
  }

  // Reset reveal state before rendering
  _revealIndex    = 0;
  _skipRevealed   = false;
  _showingRevealed = false;
  _sortedCards  = [...cardIds].sort((a, b) => {
    const ra = RARITY_SORT[CARDS[a]?.rarity] ?? 0;
    const rb = RARITY_SORT[CARDS[b]?.rarity] ?? 0;
    if (ra !== rb) return ra - rb;
    return (CARDS[a]?.name || '').localeCompare(CARDS[b]?.name || '');
  });

  updateState({
    screen: 'packopen',
    pendingPacks:     gameState.pendingPacks.slice(1),
    inventory:        newInventory,
    lastOpenedCards:  cardIds,
    lastOpenedPackId: packId,
  });
}

function revealNextCard() {
  if (_revealIndex >= _sortedCards.length) return;
  if (_showingRevealed) {
    // Card is showing — tap to dismiss and advance
    _showingRevealed = false;
    _revealIndex++;
    render();
  } else {
    // Cardback is showing — tap to flip and reveal
    _showingRevealed = true;
    render();
  }
}

function skipReveal() {
  _skipRevealed = true;
  _revealIndex  = _sortedCards.length;
  render();
}

function renderPackOpening() {
  const packId  = gameState.lastOpenedPackId;
  const pack    = PACK_TYPES[packId];
  const allRevealed = _revealIndex >= _sortedCards.length;

  // If skip was pressed or all cards revealed, show classic grid
  if (_skipRevealed || allRevealed) {
    return renderPackGrid(pack);
  }

  // Card-by-card reveal mode
  return renderPackReveal(pack);
}

function renderPackReveal(pack) {
  const total = _sortedCards.length;

  // Previously revealed cards as thumbnails
  const prevHtml = _sortedCards.slice(0, _revealIndex).map(cardId => {
    const c = CARDS[cardId];
    return `<div class="reveal-prev-card rarity-${c.rarity}" style="border-color:${RARITY_COLOR[c.rarity]}">
      ${cardImage(cardId, 'small')}
    </div>`;
  }).join('');

  // Current card — either cardback or revealed
  const currentId = _sortedCards[_revealIndex];
  const currentCard = CARDS[currentId];
  let stageHtml;

  if (_showingRevealed) {
    const bonuses = Object.entries(currentCard.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No stat bonus';
    const isNew = _newCardIds && _newCardIds.has(currentId);
    const newBadge = isNew ? '<div class="reveal-new-badge">NEW!</div>' : '';
    const rarityAnim = currentCard.rarity === 'epic' ? 'reveal-flip-epic'
      : currentCard.rarity === 'legendary' ? 'reveal-flip-legendary'
      : 'reveal-flip';
    stageHtml = `
      <div class="pack-card ${rarityAnim} rarity-${currentCard.rarity}" style="border-color:${RARITY_COLOR[currentCard.rarity]}; cursor:pointer;" onclick="revealNextCard()">
        ${newBadge}
        ${cardImage(currentId, 'large')}
        ${rarityBadge(currentCard.rarity)}
        <div class="pack-card-slot">${currentCard.slot.charAt(0).toUpperCase() + currentCard.slot.slice(1)}</div>
        <div class="pack-card-name">${currentCard.name}</div>
        <div class="pack-card-flavour">${currentCard.flavourText}</div>
        <div class="pack-card-bonus">${bonuses}</div>
        <div class="reveal-hint">Tap to continue</div>
      </div>`;
  } else {
    const rarityClass = currentCard.rarity === 'rare' ? 'reveal-cardback-rare'
      : currentCard.rarity === 'epic' ? 'reveal-cardback-epic'
      : currentCard.rarity === 'legendary' ? 'reveal-cardback-legendary'
      : '';
    stageHtml = `
      <div class="reveal-cardback rarity-${currentCard.rarity} ${rarityClass}" style="border-color:${RARITY_COLOR[currentCard.rarity]}" onclick="revealNextCard()">
        <div class="cardback-rarity">${currentCard.rarity.toUpperCase()}</div>
        <div class="reveal-hint">Tap to reveal</div>
        <div class="reveal-count">Card ${_revealIndex + 1} of ${total}</div>
      </div>`;
  }

  return `
    <div class="screen packopen-screen">
      <h1>${pack?.name || 'Pack Opening'}</h1>
      ${prevHtml ? `<div class="reveal-prev-row">${prevHtml}</div>` : ''}
      <div class="reveal-stage">${stageHtml}</div>
      <div class="pack-actions">
        <button class="btn-secondary" onclick="skipReveal()">Skip</button>
      </div>
      ${buildHelpButton('packopen')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}

function renderPackGrid(pack) {
  const cards = _sortedCards.length ? _sortedCards : (gameState.lastOpenedCards || []);
  // Skip used: staggered flip. Natural reveal complete: just show them.
  const animate = _skipRevealed;
  const stagger = 0.15;

  const cardsHtml = cards.map((cardId, i) => {
    const c       = CARDS[cardId];
    const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No stat bonus';
    const animStyle = animate ? `animation-delay:${i * stagger}s;` : 'animation:none;';
    return `
      <div class="pack-card rarity-${c.rarity}" style="${animStyle} border-color:${RARITY_COLOR[c.rarity]}">
        ${cardImage(cardId, 'large')}
        ${rarityBadge(c.rarity)}
        <div class="pack-card-slot">${c.slot.charAt(0).toUpperCase() + c.slot.slice(1)}</div>
        <div class="pack-card-name">${c.name}</div>
        <div class="pack-card-flavour">${c.flavourText}</div>
        <div class="pack-card-bonus">${bonuses}</div>
      </div>`;
  }).join('');

  let nextBtn;
  if (gameState.pendingPacks.length > 0) {
    nextBtn = `<button class="btn-primary" onclick="openNextPack()">Open Next Pack</button>`;
  } else if (gameState.currentMatch && gameState.currentMatch.showTraining) {
    nextBtn = `<div class="pack-nav-buttons">
      <button class="btn-primary" onclick="initTrainingChoices(); updateState({screen:'training'})">Training Time!</button>
      <button class="btn-secondary" onclick="updateState({screen:'managegear'})">Gear Up</button>
    </div>`;
  } else {
    nextBtn = `<div class="pack-nav-buttons">
      <button class="btn-primary" onclick="updateState({screen:'table'})">View Table</button>
      <button class="btn-secondary" onclick="updateState({screen:'managegear'})">Gear Up</button>
    </div>`;
  }

  return `
    <div class="screen packopen-screen">
      <h1>${pack?.name || 'Pack Opening'}</h1>
      <div class="pack-cards">${cardsHtml}</div>
      <div class="pack-actions">${nextBtn}</div>
      ${buildHelpButton('packopen')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}
