// ============================================================
// utils.js — Shared utilities used by screens and simulator
// ============================================================

// State accessors
function getPlayer(id) { return gameState.players.find(p => p.id === id); }
function getOpponent(id) { return gameState.opponentTeams.find(t => t.id === id); }
function slotName(slot) {
  return ({ GK: 'Goalkeeper', D: 'Defender', M1: 'Midfielder', M2: 'Midfielder', S: 'Striker' })[slot] || slot;
}

// Compute effective stats: base stats + all equipped gear bonuses.
// Shared between UI (screens) and simulator — keep in sync.
function effectiveStats(player) {
  const stats = { ...player.stats };
  for (const cardId of Object.values(player.gear)) {
    if (cardId && CARDS[cardId]) {
      for (const [stat, bonus] of Object.entries(CARDS[cardId].statBonuses)) {
        stats[stat] = (stats[stat] || 0) + bonus;
      }
    }
  }
  return stats;
}

// UI helpers
function statBar(value, max = 15) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `<div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>`;
}

function rarityBadge(rarity) {
  return `<span class="rarity-badge" style="background:${RARITY_COLOR[rarity]}">${RARITY_LABEL[rarity]}</span>`;
}

function cardMini(cardId) {
  if (!cardId) return `<span class="gear-empty">Empty</span>`;
  const c = CARDS[cardId];
  const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(', ') || 'No bonus';
  return `<span class="gear-chip" style="border-color:${RARITY_COLOR[c.rarity]}" title="${c.flavourText} | ${bonuses}">${c.name}</span>`;
}

function tierStars(difficulty) {
  const full = Math.round(difficulty / 2);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// Inventory helpers
function inventoryCount(cardId) {
  const item = gameState.inventory.find(i => i.cardId === cardId);
  return item ? item.quantity : 0;
}

function equippedCount(cardId) {
  return gameState.players.reduce((n, p) =>
    n + Object.values(p.gear).filter(id => id === cardId).length, 0);
}

function availableQty(cardId) {
  return inventoryCount(cardId) - equippedCount(cardId);
}
