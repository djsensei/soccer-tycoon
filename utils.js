// ============================================================
// utils.js — Shared utilities used by screens and simulator
// ============================================================

// State accessors
function getPlayer(id) { return gameState.players.find(p => p.id === id); }
function getOpponent(id) {
  // Legacy: search opponentTeams if present
  if (gameState.opponentTeams) return gameState.opponentTeams.find(t => t.id === id);
  return findLeagueTeam(id);
}

function findLeagueTeam(id) {
  if (!gameState.leagueTeams) return null;
  for (const leagueKey of LEAGUE_ORDER) {
    const teams = gameState.leagueTeams[leagueKey];
    if (!teams) continue;
    const found = teams.find(t => t.id === id);
    if (found) return found;
  }
  return null;
}

function getTeamName(teamId) {
  if (teamId === 'player') return gameState.teamName;
  const team = findLeagueTeam(teamId);
  return team ? team.name : teamId;
}

function sortStandings(standings) {
  return Object.entries(standings).sort(([, a], [, b]) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
}

function slotName(slot) {
  return ({ GK: 'Goalkeeper', D: 'Defender', M1: 'Midfielder', M2: 'Midfielder', S: 'Striker' })[slot] || slot;
}

// Compute effective stats: base stats + all equipped gear bonuses.
// Shared between UI (screens) and simulator — keep in sync.
function effectiveStats(player) {
  const stats = { ...player.stats };
  // Milestone bonuses
  if (player.statBonuses) {
    for (const [stat, bonus] of Object.entries(player.statBonuses)) {
      stats[stat] = (stats[stat] || 0) + bonus;
    }
  }
  // Gear bonuses
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
function statBar(value, max = 15, color = null) {
  const cap = 10;
  const displayVal = Math.min(value, cap);
  const pct = Math.min(100, Math.round((displayVal / cap) * 100));
  const bg = color ? `background:${color};` : '';
  const star = value > cap ? `<span class="stat-star" style="color:${color || 'var(--accent)'}">★</span>` : '';
  return `<div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%;${bg}"></div></div>${star}`;
}

function rarityBadge(rarity) {
  return `<span class="rarity-badge" style="background:${RARITY_COLOR[rarity]}">${RARITY_LABEL[rarity]}</span>`;
}

function cardImage(cardId, size = 'large') {
  if (!cardId || !CARDS[cardId]) return `<div class="card-img-wrap ${size} card-img-missing"></div>`;
  return `<div class="card-img-wrap ${size}">
    <img src="img/cards/processed/${cardId}.png" alt="${CARDS[cardId].name}"
         onerror="this.parentElement.classList.add('card-img-missing')">
  </div>`;
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

// --- Stat Detail Modal -----------------------------------------
function statBreakdown(player) {
  const result = {};
  for (const s of STATS) {
    const base = player.stats[s] || 0;
    const milestone = (player.statBonuses && player.statBonuses[s]) || 0;
    let gear = 0;
    for (const cardId of Object.values(player.gear)) {
      if (cardId && CARDS[cardId] && CARDS[cardId].statBonuses[s]) {
        gear += CARDS[cardId].statBonuses[s];
      }
    }
    result[s] = { base, gear, milestone, total: base + gear + milestone };
  }
  return result;
}

let _statModalPlayerId = null;

function openStatModal(playerId, evt) {
  if (evt) evt.stopPropagation();
  _statModalPlayerId = playerId;
  render();
}

function closeStatModal() {
  _statModalPlayerId = null;
  render();
}

function buildStatDetailModal() {
  if (!_statModalPlayerId) return '';
  const p = getPlayer(_statModalPlayerId);
  if (!p) return '';
  const bd = statBreakdown(p);
  const rowsHtml = STATS.map(s => {
    const d = bd[s];
    const desc = STAT_DESCRIPTIONS[s] || '';
    return `
      <div class="sdm-row">
        <div class="sdm-stat-name" style="color:${STAT_COLORS[s]}">${STAT_ABBR[s]}</div>
        <div class="sdm-stat-detail">
          <div class="sdm-stat-total">${d.total}</div>
          <div class="sdm-stat-parts">
            <span>Base: ${d.base}</span>
            ${d.gear ? `<span class="sdm-gear">+${d.gear} gear</span>` : ''}
            ${d.milestone ? `<span class="sdm-milestone">+${d.milestone} milestone</span>` : ''}
          </div>
          <div class="sdm-stat-desc">${desc}</div>
        </div>
        <div class="sdm-stat-bar-wrap">
          ${statBar(d.total, 10, STAT_COLORS[s])}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="modal-backdrop" onclick="closeStatModal()">
      <div class="modal-content sdm-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeStatModal()">✕</button>
        <div class="sdm-title">${p.name}</div>
        <div class="sdm-rows">${rowsHtml}</div>
      </div>
    </div>`;
}

// --- Fan Tier Helpers (Phase 1) ---------------------------------
function currentFanTier(fans) {
  for (const key of TIER_ORDER) {
    if (fans <= FAN_TIERS[key].max) return key;
  }
  return TIER_ORDER[TIER_ORDER.length - 1];
}

function requiredTierForOpponent(opponent) {
  if (opponent.tier !== 'special') return TIER_UNLOCK[opponent.tier] || 'local';
  if (opponent.difficulty <= 6) return 'regional';
  if (opponent.difficulty <= 8) return 'national';
  return 'international';
}

function isOpponentUnlocked(opponent, fans) {
  const playerTierIdx   = TIER_ORDER.indexOf(currentFanTier(fans));
  const requiredTierIdx = TIER_ORDER.indexOf(requiredTierForOpponent(opponent));
  return playerTierIdx >= requiredTierIdx;
}

function tierProgress(fans) {
  const tier     = currentFanTier(fans);
  const tierData = FAN_TIERS[tier];
  const idx      = TIER_ORDER.indexOf(tier);
  const range    = tierData.max - tierData.min + 1;
  const pct      = Math.min(100, Math.max(0, Math.round(((fans - tierData.min) / range) * 100)));
  const nextTier = idx + 1 < TIER_ORDER.length ? TIER_ORDER[idx + 1] : null;
  return { tier, pct, nextTier };
}
