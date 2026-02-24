// ============================================================
// screens/gear.js — Manage gear screen (equip / unequip cards)
// ============================================================

function renderManageGear() {
  const player = getPlayer(gameState.selectedPlayerId);
  if (!player) return `<div class="screen"><p>Player not found.</p><button onclick="updateState({screen:'hub'})">Back</button></div>`;

  const base = player.stats;
  const eff  = effectiveStats(player);
  const isGK = gameState.slots.GK === player.id;
  const gearSlots = isGK ? GK_GEAR_SLOTS : GEAR_SLOTS;
  const slotLabel = { head: 'Head', body: 'Body', feet: 'Feet', gloves: 'Gloves' };

  const statsHtml = STATS.map(s => `
    <div class="stat-row">
      <span class="stat-label">${s.charAt(0).toUpperCase() + s.slice(1)}</span>
      <span class="stat-value">${base[s]}</span>
      ${eff[s] > base[s] ? `<span class="stat-bonus">+${eff[s] - base[s]}</span>` : ''}
      ${statBar(eff[s])}
    </div>
  `).join('');

  const gearSlotsHtml = gearSlots.map(gs => {
    const equippedId = player.gear[gs];
    const equipped   = equippedId ? CARDS[equippedId] : null;
    // Show only cards with unequipped copies available (equipped card is shown above, not here)
    const available = gameState.inventory
      .filter(i => CARDS[i.cardId]?.slot === gs && availableQty(i.cardId) > 0)
      .map(i => CARDS[i.cardId]);

    const equippedHtml = equipped
      ? `<div class="equipped-card" style="border-color:${RARITY_COLOR[equipped.rarity]}">
           ${rarityBadge(equipped.rarity)}
           <strong>${equipped.name}</strong>
           <em>${equipped.flavourText}</em>
           <div class="bonus-list">${Object.entries(equipped.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No bonus'}</div>
           <button class="btn-small btn-danger" onclick="unequipGear('${player.id}','${gs}')">Remove</button>
         </div>`
      : `<div class="empty-gear-slot">Empty — nothing equipped</div>`;

    const inventoryHtml = available.length
      ? available.map(c => {
          const free = availableQty(c.id);
          const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No bonus';
          return `
            <div class="inventory-card" onclick="equipGear('${player.id}','${gs}','${c.id}')">
              ${rarityBadge(c.rarity)}
              <strong>${c.name}</strong> <span class="qty">×${free}</span>
              <em>${c.flavourText}</em>
              <div class="bonus-list">${bonuses}</div>
            </div>`;
        }).join('')
      : `<p class="dim">No ${slotLabel[gs].toLowerCase()} gear in inventory</p>`;

    return `
      <div class="gear-section">
        <h3>${slotLabel[gs]}</h3>
        ${equippedHtml}
        <div class="inventory-cards">${inventoryHtml}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="screen manage-gear-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'hub'})">← Back</button>
        <h1>${player.name}</h1>
      </div>
      <div class="gear-layout">
        <div class="stats-panel">
          <h2>Stats</h2>
          ${statsHtml}
        </div>
        <div class="gear-panel">
          <h2>Gear</h2>
          ${gearSlotsHtml}
        </div>
      </div>
    </div>
  `;
}

function equipGear(playerId, slot, cardId) {
  const players = gameState.players.map(p => {
    if (p.id !== playerId) return p;
    const newGear = { ...p.gear };
    // Remove from any other slot on this same player (can't double-equip one card)
    for (const s of GK_GEAR_SLOTS) {
      if (newGear[s] === cardId && s !== slot) newGear[s] = null;
    }
    newGear[slot] = cardId;
    return { ...p, gear: newGear };
  });
  updateState({ players });
}

function unequipGear(playerId, slot) {
  const players = gameState.players.map(p => {
    if (p.id !== playerId) return p;
    return { ...p, gear: { ...p.gear, [slot]: null } };
  });
  updateState({ players });
}
