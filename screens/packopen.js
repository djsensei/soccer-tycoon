// ============================================================
// screens/packopen.js — Card pack opening screen
// ============================================================

// Handler: open the next pending pack, add cards to inventory, then render.
// This is called by buttons — render functions never mutate state.
function openNextPack() {
  const pending = gameState.pendingPacks[0];
  if (!pending) { updateState({ screen: 'hub' }); return; }

  // Support both old format (string) and new format ({ packId, opponentId })
  const packId     = typeof pending === 'string' ? pending : pending.packId;
  const opponentId = typeof pending === 'string' ? null    : pending.opponentId;

  const cardIds = openPack(packId, opponentId);
  const newInventory = [...gameState.inventory];
  for (const cardId of cardIds) {
    const existing = newInventory.find(i => i.cardId === cardId);
    if (existing) existing.quantity++;
    else newInventory.push({ cardId, quantity: 1 });
  }

  updateState({
    screen: 'packopen',
    pendingPacks:     gameState.pendingPacks.slice(1),
    inventory:        newInventory,
    lastOpenedCards:  cardIds,
    lastOpenedPackId: packId,
  });
}

function renderPackOpening() {
  const packId  = gameState.lastOpenedPackId;
  const pack    = PACK_TYPES[packId];
  const cardIds = gameState.lastOpenedCards || [];

  const cardsHtml = cardIds.map((cardId, i) => {
    const c       = CARDS[cardId];
    const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No stat bonus';
    return `
      <div class="pack-card" style="animation-delay:${i * 0.3}s; border-color:${RARITY_COLOR[c.rarity]}">
        ${rarityBadge(c.rarity)}
        <div class="pack-card-slot">${c.slot.charAt(0).toUpperCase() + c.slot.slice(1)}</div>
        <div class="pack-card-name">${c.name}</div>
        <div class="pack-card-flavour">${c.flavourText}</div>
        <div class="pack-card-bonus">${bonuses}</div>
      </div>`;
  }).join('');

  const nextBtn = gameState.pendingPacks.length > 0
    ? `<button class="btn-primary" onclick="openNextPack()">Open Next Pack</button>`
    : `<button class="btn-primary btn-large" onclick="updateState({screen:'hub'})">Back to Hub</button>`;

  return `
    <div class="screen packopen-screen">
      <h1>🎁 ${pack?.name || 'Pack Opening'}</h1>
      <div class="pack-cards">${cardsHtml}</div>
      <div class="pack-actions">${nextBtn}</div>
    </div>
  `;
}
