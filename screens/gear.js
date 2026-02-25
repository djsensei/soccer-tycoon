// ============================================================
// screens/gear.js — Gear Up screen (all players, inventory panel)
// ============================================================

// Module-level selection state (not persisted)
let _gearSel = { playerId: null, slot: null };
let _invFilter = 'all';   // 'all' | 'head' | 'body' | 'feet' | 'gloves'
let _modalCard = null;     // cardId or null

const SLOT_LABEL = { head: 'Head', body: 'Body', feet: 'Feet', gloves: 'Gloves' };
const SLOT_ORDER = ['head', 'body', 'feet', 'gloves'];

function renderGearUp() {
  const startingEntries = POSITIONS.map(posSlot => ({
    p: getPlayer(gameState.slots[posSlot]),
    posSlot,
  })).filter(x => x.p);

  const benchEntries = gameState.players
    .filter(p => !Object.values(gameState.slots).includes(p.id))
    .map(p => ({ p, posSlot: null }));

  function gearSlotCell(p, gs, isPlaceholder) {
    if (isPlaceholder) {
      return `<div class="gear-slot-cell gsc-gloves-placeholder"></div>`;
    }
    const equippedId = p.gear[gs];
    const card = equippedId ? CARDS[equippedId] : null;
    const isSelected = _gearSel.playerId === p.id && _gearSel.slot === gs;
    const onclick = card
      ? `selectGearSlot('${p.id}','${gs}'); openCardModal('${equippedId}')`
      : `selectGearSlot('${p.id}','${gs}')`;
    return `
      <div class="gear-slot-cell ${isSelected ? 'gsc-selected' : ''} ${card ? '' : 'gsc-empty'}"
           onclick="${onclick}">
        <div class="gsc-label">${SLOT_LABEL[gs]}</div>
        ${card
          ? `<div class="gsc-card" title="${card.name}" style="border-color:${RARITY_COLOR[card.rarity]}">${cardImage(equippedId, 'small')}</div>`
          : `<div class="gsc-placeholder">Empty</div>`
        }
      </div>`;
  }

  // Column headers
  const columnHeaderHtml = `
    <div class="gearup-column-header">
      <div class="gch-spacer"></div>
      <div class="gch-slots">
        ${SLOT_ORDER.map(s => `<div class="gch-slot">${SLOT_LABEL[s]}</div>`).join('')}
      </div>
    </div>`;

  const playerRowsHtml = [...startingEntries, ...benchEntries].map(({ p, posSlot }) => {
    const isGK = gameState.slots.GK === p.id;
    const isRowSelected = _gearSel.playerId === p.id;
    // All rows render in SLOT_ORDER; non-GK get invisible gloves placeholder
    const slotsHtml = SLOT_ORDER.map(gs => {
      if (gs === 'gloves' && !isGK) return gearSlotCell(p, gs, true);
      return gearSlotCell(p, gs, false);
    }).join('');
    return `
      <div class="player-gear-row ${isRowSelected ? 'pgr-selected' : ''}">
        <div class="pgr-identity">
          <div class="pgr-pos">${posSlot ? slotName(posSlot) : 'Bench'}</div>
          <div class="pgr-name">${p.name}</div>
        </div>
        <div class="pgr-slots">
          ${slotsHtml}
        </div>
      </div>`;
  }).join('');

  // Inventory panel — always visible
  let contextHint;
  if (_gearSel.playerId && _gearSel.slot) {
    const selPlayer = getPlayer(_gearSel.playerId);
    contextHint = `Equipping to: <strong>${selPlayer?.name}</strong> — ${SLOT_LABEL[_gearSel.slot]}`;
  } else {
    contextHint = 'Select a gear slot to equip';
  }

  // Filter bar
  const filters = ['all', 'head', 'body', 'feet', 'gloves'];
  const filterBarHtml = filters.map(f => {
    const label = f === 'all' ? 'All' : SLOT_LABEL[f];
    const active = _invFilter === f ? 'inv-filter-btn--active' : '';
    return `<button class="inv-filter-btn ${active}" onclick="setInvFilter('${f}')">${label}</button>`;
  }).join('');

  // Filter + sort inventory
  const filtered = gameState.inventory
    .filter(i => CARDS[i.cardId] && (_invFilter === 'all' || CARDS[i.cardId].slot === _invFilter))
    .sort((a, b) => RARITIES.indexOf(CARDS[b.cardId].rarity) - RARITIES.indexOf(CARDS[a.cardId].rarity));

  const tilesHtml = filtered.length
    ? filtered.map(i => {
        const c = CARDS[i.cardId];
        const qty = availableQty(c.id);
        const totalQty = i.quantity;
        return `
          <div class="inv-tile" onclick="openCardModal('${c.id}')" style="border-color:${RARITY_COLOR[c.rarity]}">
            ${cardImage(c.id, 'small')}
            <div class="inv-tile-name">${c.name}</div>
            <div class="inv-tile-qty">×${totalQty}${qty < totalQty ? ` (${qty} free)` : ''}</div>
          </div>`;
      }).join('')
    : `<p class="dim" style="grid-column:1/-1">No cards${_invFilter !== 'all' ? ` for ${_invFilter}` : ''}</p>`;

  // Modal
  const modalHtml = _modalCard ? buildCardModal(_modalCard) : '';

  return `
    <div class="screen gearup-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'hub'})">← Back</button>
        <h1>Gear Up</h1>
      </div>
      <div class="gearup-layout">
        <div class="gearup-players">
          ${columnHeaderHtml}
          ${playerRowsHtml}
        </div>
        <div class="gearup-inventory">
          <h2>Inventory</h2>
          <p class="inv-context-hint">${contextHint}</p>
          <div class="inv-filter-bar">${filterBarHtml}</div>
          <div class="inv-tile-grid">${tilesHtml}</div>
        </div>
      </div>
      ${modalHtml}
    </div>
  `;
}

function buildCardModal(cardId) {
  const c = CARDS[cardId];
  if (!c) return '';
  const bonuses = Object.entries(c.statBonuses).map(([s, v]) => `+${v} ${s}`).join(' · ') || 'No bonus';
  const qty = availableQty(cardId);
  const totalQty = inventoryCount(cardId);

  // Action buttons
  let actions = '';
  if (_gearSel.playerId && _gearSel.slot) {
    const selPlayer = getPlayer(_gearSel.playerId);
    const equippedInSlot = selPlayer?.gear[_gearSel.slot];
    if (equippedInSlot === cardId) {
      actions += `<button class="btn-small btn-danger" onclick="unequipGearFromModal('${_gearSel.playerId}','${_gearSel.slot}')">Remove</button>`;
    } else if (c.slot === _gearSel.slot && qty > 0) {
      actions += `<button class="btn-primary" onclick="equipGearFromModal('${_gearSel.playerId}','${_gearSel.slot}','${cardId}')">Equip to ${selPlayer?.name}</button>`;
    }
  }
  actions += `<button class="btn-secondary" onclick="closeCardModal()">Close</button>`;

  return `
    <div class="modal-backdrop" onclick="closeCardModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeCardModal()">✕</button>
        ${cardImage(cardId, 'large')}
        ${rarityBadge(c.rarity)}
        <div class="modal-slot-label">${SLOT_LABEL[c.slot]}</div>
        <div class="modal-card-name">${c.name}</div>
        <div class="modal-flavour">${c.flavourText}</div>
        <div class="modal-bonuses">${bonuses}</div>
        <div class="modal-qty">Owned: ${totalQty} · Available: ${qty}</div>
        <div class="modal-actions">${actions}</div>
      </div>
    </div>`;
}

// --- Interaction handlers ---

function selectGearSlot(playerId, slot) {
  _gearSel = { playerId, slot };
  // Auto-set filter to match selected slot
  _invFilter = slot;
  render();
}

function setInvFilter(filter) {
  _invFilter = filter;
  render();
}

function openCardModal(cardId) {
  _modalCard = cardId;
  render();
}

function closeCardModal() {
  _modalCard = null;
  render();
}

function equipGearFromModal(playerId, slot, cardId) {
  _modalCard = null;
  equipGear(playerId, slot, cardId);
}

function unequipGearFromModal(playerId, slot) {
  _modalCard = null;
  unequipGear(playerId, slot);
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
