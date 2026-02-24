// ============================================================
// screens/hub.js — Main hub screen (roster, stats, navigation)
// ============================================================

function renderHub() {
  const { teamName, fans, matchesPlayed, slots, players } = gameState;

  const rosterSlots = POSITIONS.map(slot => {
    const p = getPlayer(slots[slot]);
    if (!p) return `<div class="player-card empty-slot"><div class="slot-label">${slotName(slot)}</div><div class="slot-name">Empty</div></div>`;
    const eff = effectiveStats(p);
    const gearSlots = slot === 'GK' ? GK_GEAR_SLOTS : GEAR_SLOTS;
    const gearHtml = gearSlots.map(gs => `<div class="gear-slot-mini">${cardMini(p.gear[gs])}</div>`).join('');
    return `
      <div class="player-card" onclick="openGearScreen('${p.id}')">
        <div class="slot-label">${slotName(slot)}</div>
        <div class="slot-name">${p.name}</div>
        <div class="player-stats-mini">
          ${STATS.map(s => `<span title="${s}">${s.slice(0, 3).toUpperCase()} ${eff[s]}</span>`).join('')}
        </div>
        <div class="gear-slots-mini">${gearHtml}</div>
        <div class="gear-hint">Tap to manage gear</div>
      </div>
    `;
  });

  const benchPlayers = players.filter(p => !Object.values(slots).includes(p.id));
  const benchHtml = benchPlayers.length
    ? benchPlayers.map(p => `
        <div class="player-card bench-card" onclick="openGearScreen('${p.id}')">
          <div class="slot-label">Bench</div>
          <div class="slot-name">${p.name}</div>
          <div class="gear-hint">Tap to manage gear</div>
        </div>
      `).join('')
    : '<p class="dim">No bench players</p>';

  const invCount = gameState.inventory.reduce((sum, i) => sum + i.quantity, 0);

  return `
    <div class="screen hub-screen">
      <header class="hub-header">
        <div class="hub-title">
          <h1>⚽ ${teamName}</h1>
          <div class="fans-display">👥 ${fans.toLocaleString()} fans</div>
        </div>
        <div class="hub-meta">
          <span>Match ${matchesPlayed}</span>
          <span>🃏 ${invCount} cards</span>
        </div>
      </header>

      <section>
        <h2>Starting XI</h2>
        <div class="roster-grid">${rosterSlots.join('')}</div>
      </section>

      <section>
        <h2>Bench</h2>
        <div class="bench-grid">${benchHtml}</div>
      </section>

      <div class="hub-actions">
        <button class="btn-primary btn-large" onclick="updateState({screen:'matchselect'})">⚔️ Play a Match</button>
      </div>

      ${fans >= 1000000 ? '<div class="win-banner">🏆 YOU REACHED 1,000,000 FANS! YOU WIN!! 🏆</div>' : ''}
      ${fans < 100      ? '<div class="lose-banner">😱 UNDER 100 FANS — YOU\'RE GETTING SACKED!</div>' : ''}
    </div>
  `;
}

function openGearScreen(playerId) {
  updateState({ screen: 'managegear', selectedPlayerId: playerId });
}
