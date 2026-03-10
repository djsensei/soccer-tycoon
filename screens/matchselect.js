// ============================================================
// screens/matchselect.js — Pick an opponent screen
// ============================================================

function renderMatchSelect() {
  const tierOrder = { local: 0, national: 1, international: 2, special: 3 };
  const tierLabel = { local: '🏠 Local League', national: '🏟️ National', international: '🌍 International', special: '✨ Special' };

  const available = gameState.opponentTeams
    .filter(t => t.isAvailable)
    .sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9));

  const tierGroups = {};
  for (const t of available) {
    if (!tierGroups[t.tier]) tierGroups[t.tier] = [];
    tierGroups[t.tier].push(t);
  }

  const groupsHtml = Object.entries(tierGroups).map(([tier, teams]) => `
    <div class="tier-group">
      <h2>${tierLabel[tier] || tier}</h2>
      <div class="opponent-grid">
        ${teams.map(t => {
          const unlocked = isOpponentUnlocked(t, gameState.fans);
          const base = t.fanRewardBase;
          const minFan = Math.round(base * FAN_MULTIPLIERS.loss);
          const maxFan = Math.round(base * FAN_MULTIPLIERS.bigWin);
          if (unlocked) {
            return `
              <div class="opponent-card ${t.tier}" onclick="selectOpponent('${t.id}')">
                <div class="opp-name">${t.name}</div>
                <div class="opp-stars">${tierStars(t.difficulty)}</div>
                <div class="opp-note">${t.specialNote}</div>
                <div class="opp-fans">
                  <span class="fan-range loss">${minFan.toLocaleString()}</span>
                  <span> to </span>
                  <span class="fan-range win">+${maxFan.toLocaleString()}</span>
                  <span class="fan-label"> fans</span>
                </div>
              </div>`;
          } else {
            const reqTier = requiredTierForOpponent(t);
            const reqLabel = FAN_TIERS[reqTier]?.label || reqTier;
            const reqFans  = FAN_TIERS[reqTier]?.min || 0;
            return `
              <div class="opponent-card ${t.tier} locked">
                <div class="opp-name">${t.name}</div>
                <div class="opp-stars">${tierStars(t.difficulty)}</div>
                <div class="opp-note">${t.specialNote}</div>
                <div class="lock-hint">🔒 Reach ${reqLabel} (${reqFans.toLocaleString()} fans)</div>
              </div>`;
          }
        }).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="screen matchselect-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'table'})">← Back</button>
        <h1>Pick Your Opponent</h1>
      </div>
      ${groupsHtml || '<p class="dim">No opponents available.</p>'}
    </div>
  `;
}

function selectOpponent(opponentId) {
  updateState({ screen: 'prematch', selectedOpponentId: opponentId });
}
