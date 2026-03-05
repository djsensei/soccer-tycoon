// ============================================================
// screens/hub.js — Main hub screen (roster, stats, navigation)
// ============================================================

// Module-level swap state (not persisted)
let _swapTarget = null;

function renderTierDisplay(fans) {
  const { tier, pct, nextTier } = tierProgress(fans);
  const tierData = FAN_TIERS[tier];
  const hint = nextTier
    ? `Next: ${FAN_TIERS[nextTier].label} at ${(FAN_TIERS[nextTier].min).toLocaleString()}`
    : 'MAX TIER';
  return `
    <div class="tier-display">
      <span class="tier-badge">${tierData.label}</span>
      <div class="tier-progress-bar" title="${hint}">
        <div class="tier-progress-fill" style="width:${pct}%"></div>
      </div>
      <span class="tier-next-hint">${hint}</span>
    </div>
  `;
}

function renderHub() {
  const { teamName, fans, matchesPlayed, slots, players } = gameState;

  const rosterSlots = POSITIONS.map(slot => {
    const p = getPlayer(slots[slot]);
    if (!p) return `<div class="player-card empty-slot"><div class="slot-label">${slotName(slot)}</div><div class="slot-name">Empty</div></div>`;
    const eff = effectiveStats(p);
    const isSwapSrc = _swapTarget === p.id;
    const swapHint = isSwapSrc
      ? `<div class="swap-hint selected">Selected — tap another to swap</div>`
      : _swapTarget
        ? `<div class="swap-hint">Tap to swap</div>`
        : `<div class="swap-hint">Tap to swap position</div>`;
    return `
      <div class="player-card ${isSwapSrc ? 'swap-selected' : ''}" onclick="selectForSwap('${p.id}')">
        <div class="slot-label">${slotName(slot)}</div>
        <div class="slot-name">${p.name}</div>
        <div class="player-stats-mini" onclick="openStatModal('${p.id}', event)">
          ${STATS.map(s => `<span title="${s}">${STAT_ABBR[s]} ${eff[s]}</span>`).join('')}
        </div>
        ${swapHint}
      </div>
    `;
  });

  const invCount = gameState.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const swapBadge = _swapTarget ? ' <span class="swap-mode-badge">Swap Mode</span>' : '';

  return `
    <div class="screen hub-screen">
      <header class="hub-header">
        <div class="hub-title">
          <h1>⚽ ${teamName}</h1>
          <div class="fans-display">👥 ${fans.toLocaleString()} fans</div>
          ${renderTierDisplay(fans)}
        </div>
        <div class="hub-meta">
          <span>Match ${matchesPlayed}</span>
          <span>🃏 ${invCount} cards</span>
        </div>
      </header>

      <section>
        <h2>Starting XI${swapBadge}</h2>
        <div class="roster-grid">${rosterSlots.join('')}</div>
      </section>

      <div class="hub-actions">
        <button class="btn-primary btn-large" onclick="updateState({screen:'matchselect'})">⚔️ Play a Match</button>
        <button class="btn-secondary" onclick="updateState({screen:'managegear'})">🎽 Gear Up</button>
      </div>

      <div class="hub-footer">
        <button class="btn-small btn-danger" onclick="startOver()">↺ Start Over</button>
      </div>

      ${fans >= 1000000 ? '<div class="win-banner">🏆 YOU REACHED 1,000,000 FANS! YOU WIN!! 🏆</div>' : ''}
      ${fans < 100      ? '<div class="lose-banner">😱 UNDER 100 FANS — YOU\'RE GETTING SACKED!</div>' : ''}
      ${buildStatDetailModal()}
    </div>
  `;
}

function selectForSwap(playerId) {
  if (_swapTarget === null) {
    _swapTarget = playerId;
    render();
  } else if (_swapTarget === playerId) {
    // Deselect
    _swapTarget = null;
    render();
  } else {
    // Perform swap
    const slots = { ...gameState.slots };
    const sourceSlot = Object.entries(slots).find(([, id]) => id === _swapTarget)?.[0] ?? null;
    const targetSlot = Object.entries(slots).find(([, id]) => id === playerId)?.[0] ?? null;

    if (sourceSlot && targetSlot) {
      // Both are starters — swap their slots
      slots[sourceSlot] = playerId;
      slots[targetSlot] = _swapTarget;
    }

    _swapTarget = null;
    updateState({ slots });
  }
}

function startOver() {
  if (confirm('Start over? All progress will be lost.')) {
    deleteSave();
    gameState = { screen: 'newgame' };
    render();
  }
}
