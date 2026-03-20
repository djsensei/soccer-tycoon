// ============================================================
// utils.js — Shared utilities used by screens and simulator
// ============================================================

// Add random noise to an energy cost (+/- up to variance points)
function noisyCost(baseCost, variance = 3) {
  const noise = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  return Math.max(1, baseCost + noise);
}

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
  // Fatigue penalty
  const energy = player.energy != null ? player.energy : ENERGY_CONFIG.maxEnergy;
  if (energy < ENERGY_CONFIG.fatigueThreshold) {
    const deficit = ENERGY_CONFIG.fatigueThreshold - energy;
    const penalty = deficit * ENERGY_CONFIG.fatiguePenaltyRate;
    for (const s of Object.keys(stats)) {
      stats[s] = Math.max(ENERGY_CONFIG.minStatFloor, Math.round(stats[s] * (1 - penalty)));
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
  const energy = player.energy != null ? player.energy : ENERGY_CONFIG.maxEnergy;
  const fatigued = energy < ENERGY_CONFIG.fatigueThreshold;
  const penalty = fatigued ? (ENERGY_CONFIG.fatigueThreshold - energy) * ENERGY_CONFIG.fatiguePenaltyRate : 0;
  for (const s of STATS) {
    const base = player.stats[s] || 0;
    const milestone = (player.statBonuses && player.statBonuses[s]) || 0;
    let gear = 0;
    for (const cardId of Object.values(player.gear)) {
      if (cardId && CARDS[cardId] && CARDS[cardId].statBonuses[s]) {
        gear += CARDS[cardId].statBonuses[s];
      }
    }
    const preFatigue = base + gear + milestone;
    const total = fatigued ? Math.max(ENERGY_CONFIG.minStatFloor, Math.round(preFatigue * (1 - penalty))) : preFatigue;
    const fatigueLoss = fatigued ? total - preFatigue : 0;
    result[s] = { base, gear, milestone, fatigueLoss, total };
  }
  return result;
}

// Energy UI helpers
function energyBar(energy) {
  const pct = Math.max(0, Math.min(100, energy));
  const cls = energyClass(energy);
  return `<div class="energy-bar ${cls}"><div class="energy-bar-fill" style="width:${pct}%"></div><span class="energy-bar-label">${energy}</span></div>`;
}

function energyClass(energy) {
  if (energy >= 60) return 'energy-high';
  if (energy >= 40) return 'energy-mid';
  return 'energy-low';
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
            ${d.fatigueLoss ? `<span class="sdm-fatigue">${d.fatigueLoss} fatigue</span>` : ''}
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

// --- Help System ------------------------------------------------
let _helpModalScreen = null;

function openHelp(screenKey, evt) {
  if (evt) evt.stopPropagation();
  _helpModalScreen = screenKey;
  render();
}

function closeHelp() {
  _helpModalScreen = null;
  render();
}

function buildHelpButton(screenKey) {
  return `<button class="help-btn" onclick="openHelp('${screenKey}', event)">?</button>`;
}

function buildHelpModal(screenKey) {
  const content = HELP_CONTENT[screenKey];
  if (!content) return '';
  const tipsHtml = content.tips.map(t => `<li>${t}</li>`).join('');
  return `
    <div class="modal-backdrop" onclick="closeHelp()">
      <div class="modal-content help-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeHelp()">✕</button>
        <div class="help-modal-title">${content.title}</div>
        <ul class="help-modal-tips">${tipsHtml}</ul>
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

function tierProgress(fans) {
  const tier     = currentFanTier(fans);
  const tierData = FAN_TIERS[tier];
  const idx      = TIER_ORDER.indexOf(tier);
  const range    = tierData.max - tierData.min + 1;
  const pct      = Math.min(100, Math.max(0, Math.round(((fans - tierData.min) / range) * 100)));
  const nextTier = idx + 1 < TIER_ORDER.length ? TIER_ORDER[idx + 1] : null;
  return { tier, pct, nextTier };
}
