// ============================================================
// screens/gear.js — Gear Up screen (all players, inventory panel)
// ============================================================

// Module-level selection state (not persisted)
let _gearSel = { playerId: null, slot: null };

const SLOT_LABEL = { head: 'Head', body: 'Body', feet: 'Feet', gloves: 'Gloves' };

function renderGearUp() {
  const startingEntries = POSITIONS.map(posSlot => ({
    p: getPlayer(gameState.slots[posSlot]),
    posSlot,
  })).filter(x => x.p);

  const benchEntries = gameState.players
    .filter(p => !Object.values(gameState.slots).includes(p.id))
    .map(p => ({ p, posSlot: null }));

  function gearSlotCell(p, gs) {
    const equippedId = p.gear[gs];
    const card = equippedId ? CARDS[equippedId] : null;
    const isSelected = _gearSel.playerId === p.id && _gearSel.slot === gs;
    return `
      <div class="gear-slot-cell ${isSelected ? 'gsc-selected' : ''} ${card ? '' : 'gsc-empty'}"
           onclick="selectGearSlot('${p.id}','${gs}')">
        <div class="gsc-label">${SLOT_LABEL[gs]}</div>
        ${card
          ? `<div class="gsc-card" title="${card.name}" style="border-color:${RARITY_COLOR[card.rarity]}">${cardImage(equippedId, 'small')}</div>`
          : `<div class="gsc-placeholder">Empty</div>`
        }
      </div>`;
  }

  const playerRowsHtml = [...startingEntries, ...benchEntries].map(({ p, posSlot }) => {
    const isGK = gameState.slots.GK === p.id;
    const gearSlots = isGK ? GK_GEAR_SLOTS : GEAR_SLOTS;
    const isRowSelected = _gearSel.playerId === p.id;
    return `
      <div class="player-gear-row ${isRowSelected ? 'pgr-selected' : ''}">
        <div class="pgr-identity">
          <div class="pgr-pos">${posSlot ? slotName(posSlot) : 'Bench'}</div>
          <div class="pgr-name">${p.name}</div>
        </div>
        <div class="pgr-slots">
          ${gearSlots.map(gs => gearSlotCell(p, gs)).join('')}
        </div>
      </div>`;
  }).join('');

  // Inventory panel
  let panelTitle, invPanelHtml;

  if (!_gearSel.playerId || !_gearSel.slot) {
    panelTitle = 'Inventory';
    invPanelHtml = `<p class="dim inv-empty-hint">Tap a gear slot to equip cards</p>`;
  } else {
    const selPlayer = getPlayer(_gearSel.playerId);
    const equippedId = selPlayer?.gear[_gearSel.slot];
    panelTitle = `${SLOT_LABEL[_gearSel.slot]} — ${selPlayer?.name}`;

    const equippedHtml = equippedId ? `
      <div class="inv-section">
        <div class="inv-section-label">Equipped</div>
        <div class="inventory-card equipped">
          ${cardImage(equippedId, 'small')}
          <div class="inventory-card-text">
            ${rarityBadge(CARDS[equippedId].rarity)}
            <strong>${CARDS[equippedId].name}</strong>
            <em>${CARDS[equippedId].flavourText}</em>
            <div class="bonus-list">${Object.entries(CARDS[equippedId].statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No bonus'}</div>
            <button class="btn-small btn-danger" onclick="unequipGear('${_gearSel.playerId}','${_gearSel.slot}')">Remove</button>
          </div>
        </div>
      </div>` : `<p class="dim" style="margin-bottom:0.75rem">No gear equipped</p>`;

    const available = gameState.inventory
      .filter(i => CARDS[i.cardId]?.slot === _gearSel.slot && availableQty(i.cardId) > 0)
      .sort((a, b) => RARITIES.indexOf(CARDS[b.cardId].rarity) - RARITIES.indexOf(CARDS[a.cardId].rarity));

    const availableHtml = available.length ? `
      <div class="inv-section">
        <div class="inv-section-label">In inventory (${available.length})</div>
        ${available.map(i => {
          const c = CARDS[i.cardId];
          const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No bonus';
          return `
            <div class="inventory-card" onclick="equipGear('${_gearSel.playerId}','${_gearSel.slot}','${c.id}')">
              ${cardImage(c.id, 'small')}
              <div class="inventory-card-text">
                ${rarityBadge(c.rarity)}
                <strong>${c.name}</strong> <span class="qty">×${availableQty(c.id)}</span>
                <em>${c.flavourText}</em>
                <div class="bonus-list">${bonuses}</div>
              </div>
            </div>`;
        }).join('')}
      </div>` : `<p class="dim">No ${_gearSel.slot} gear in inventory</p>`;

    invPanelHtml = equippedHtml + availableHtml;
  }

  return `
    <div class="screen gearup-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'hub'})">← Back</button>
        <h1>Gear Up</h1>
      </div>
      <div class="gearup-layout">
        <div class="gearup-players">
          ${playerRowsHtml}
        </div>
        <div class="gearup-inventory">
          <h2>${panelTitle}</h2>
          ${invPanelHtml}
        </div>
      </div>
    </div>
  `;
}

function selectGearSlot(playerId, slot) {
  _gearSel = { playerId, slot };
  render();
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
