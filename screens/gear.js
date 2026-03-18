// ============================================================
// screens/gear.js — Gear Up screen (all players, inventory panel)
// ============================================================

// Module-level selection state (not persisted)
let _gearSel = { playerId: null, slot: null };
let _invFilter = 'all';   // 'all' | 'head' | 'body' | 'feet' | 'gloves'
let _modalCard = null;     // cardId or null

// Forge mode state
let _forgeMode = false;
let _forgeSlots = [null, null, null];
let _forgeResult = null;
let _forgeResultIsNew = false;

// Drag-and-drop state
let _drag = null;          // { cardId, sourceType, sourcePlayerId, sourceSlot, ghost, startX, startY, started }
let _dragJustEnded = false; // suppress click after drag
const DRAG_THRESHOLD = 10; // px before drag activates

const SLOT_LABEL = { head: 'Head', body: 'Body', feet: 'Feet', gloves: 'Gloves' };
const SLOT_ORDER = ['head', 'body', 'feet', 'gloves'];

function gearBack() {
  if (gameState.currentMatch && gameState.currentMatch.showTraining) {
    initTrainingChoices();
    updateState({ screen: 'training' });
  } else {
    updateState({ screen: 'table' });
  }
}

function renderGearUp() {
  const startingEntries = POSITIONS.map(posSlot => ({
    p: getPlayer(gameState.slots[posSlot]),
    posSlot,
  })).filter(x => x.p);

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
    const dragAttrs = card
      ? `data-drag-card="${equippedId}" data-drag-source="equipped" data-drag-player="${p.id}" data-drag-slot="${gs}"`
      : '';
    return `
      <div class="gear-slot-cell ${isSelected ? 'gsc-selected' : ''} ${card ? '' : 'gsc-empty'}"
           data-drop-player="${p.id}" data-drop-slot="${gs}"
           ${dragAttrs}
           onclick="${onclick}">
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
      <div class="gch-stats-spacer"></div>
      <div class="gch-slots">
        ${SLOT_ORDER.map(s => `<div class="gch-slot">${SLOT_LABEL[s]}</div>`).join('')}
      </div>
    </div>`;

  const playerRowsHtml = startingEntries.map(({ p, posSlot }) => {
    const isGK = gameState.slots.GK === p.id;
    const isRowSelected = _gearSel.playerId === p.id;
    // All rows render in SLOT_ORDER; non-GK get invisible gloves placeholder
    const slotsHtml = SLOT_ORDER.map(gs => {
      if (gs === 'gloves' && !isGK) return gearSlotCell(p, gs, true);
      return gearSlotCell(p, gs, false);
    }).join('');
    const pStats = effectiveStats(p);
    const statBarsHtml = STATS.map(s =>
      `<div class="pgr-stat-row">
         <span class="pgr-stat-abbr">${STAT_ABBR[s]}</span>
         ${statBar(pStats[s], 10, STAT_COLORS[s])}
       </div>`
    ).join('');
    const statsClickable = `onclick="openStatModal('${p.id}', event)"`;

    return `
      <div class="player-gear-row ${isRowSelected ? 'pgr-selected' : ''}">
        <div class="pgr-identity">
          <div class="pgr-pos">${posSlot ? slotName(posSlot) : 'Bench'}</div>
          <div class="pgr-name">${p.name}</div>
        </div>
        <div class="pgr-stats" ${statsClickable} style="cursor:pointer">${statBarsHtml}</div>
        <div class="pgr-slots">
          ${slotsHtml}
        </div>
      </div>`;
  }).join('');

  // Inventory panel — always visible
  const forgeBtnLabel = _forgeMode ? 'Back to Inventory' : 'Forge';
  let inventoryBodyHtml;

  if (_forgeMode) {
    inventoryBodyHtml = buildForgePanel();
  } else {
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

    // Filter inventory to only available (unequipped) items, expand duplicates into separate tiles
    const filtered = gameState.inventory
      .filter(i => CARDS[i.cardId] && (_invFilter === 'all' || CARDS[i.cardId].slot === _invFilter))
      .sort((a, b) => RARITIES.indexOf(CARDS[b.cardId].rarity) - RARITIES.indexOf(CARDS[a.cardId].rarity));

    const expandedTiles = [];
    for (const i of filtered) {
      const qty = availableQty(i.cardId);
      for (let n = 0; n < qty; n++) expandedTiles.push(i.cardId);
    }

    const tilesHtml = expandedTiles.length
      ? expandedTiles.map(cardId => {
          const c = CARDS[cardId];
          return `
            <div class="inv-tile" data-drag-card="${c.id}" data-drag-source="inventory"
                 onclick="openCardModal('${c.id}')" style="border-color:${RARITY_COLOR[c.rarity]}" title="${c.name}">
              ${cardImage(c.id, 'small')}
            </div>`;
        }).join('')
      : `<p class="dim" style="grid-column:1/-1">No cards${_invFilter !== 'all' ? ` for ${_invFilter}` : ''}</p>`;

    inventoryBodyHtml = `
      <p class="inv-context-hint">${contextHint}</p>
      <div class="inv-filter-bar">${filterBarHtml}</div>
      <div class="inv-tile-grid">${tilesHtml}</div>`;
  }

  // Modal
  const modalHtml = _modalCard ? buildCardModal(_modalCard) : '';

  return `
    <div class="screen gearup-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="gearBack()">← Back</button>
        <h1>Gear Up</h1>
      </div>
      <div class="gearup-layout">
        <div class="gearup-players">
          ${columnHeaderHtml}
          ${playerRowsHtml}
        </div>
        <div class="gearup-inv-col">
          <div class="inv-header">
            <h2>${_forgeMode ? 'Forge' : 'Inventory'}</h2>
            <button class="btn-small" onclick="toggleForgeMode()">${forgeBtnLabel}</button>
          </div>
          <div class="gearup-inventory">
            ${inventoryBodyHtml}
          </div>
        </div>
      </div>
      ${modalHtml}
      ${buildStatDetailModal()}
      ${buildHelpButton('managegear')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
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
  if (_dragJustEnded) return;
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
  if (_dragJustEnded) return;
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

// --- Forge ---

function buildForgePanel() {
  // If showing result, display it
  if (_forgeResult) {
    const rc = CARDS[_forgeResult];
    const newBadge = _forgeResultIsNew ? '<div class="reveal-new-badge">NEW!</div>' : '';
    return `
      <div class="forge-result">
        <div class="forge-result-label">You forged:</div>
        <div class="forge-result-card" style="animation: cardReveal 0.5s ease both; position:relative">
          ${newBadge}
          ${cardImage(_forgeResult, 'large')}
          ${rarityBadge(rc.rarity)}
          <div class="modal-card-name">${rc.name}</div>
          <div class="modal-flavour">${rc.flavourText}</div>
          <div class="modal-bonuses">${Object.entries(rc.statBonuses).map(([s,v]) => `+${v} ${s}`).join(' · ')}</div>
        </div>
        <button class="btn-primary" onclick="dismissForgeResult()">Nice!</button>
      </div>`;
  }

  const firstCard = _forgeSlots[0] ? CARDS[_forgeSlots[0]] : null;
  const selectedRarity = firstCard ? firstCard.rarity : null;
  const nextRarityIdx = selectedRarity ? RARITIES.indexOf(selectedRarity) + 1 : null;
  const nextRarity = nextRarityIdx != null && nextRarityIdx < RARITIES.length ? RARITIES[nextRarityIdx] : null;

  // Hint text
  let hintText;
  if (selectedRarity && nextRarity) {
    hintText = `3 ${RARITY_LABEL[selectedRarity]} → 1 ${RARITY_LABEL[nextRarity]}`;
  } else {
    hintText = 'Select 3 same-rarity cards to forge a higher-rarity card';
  }

  // Forge slots
  const slotsHtml = _forgeSlots.map((cardId, idx) => {
    if (cardId) {
      const c = CARDS[cardId];
      return `
        <div class="forge-slot forge-slot-filled" onclick="removeFromForge(${idx})" style="border-color:${RARITY_COLOR[c.rarity]}" title="${c.name}">
          ${cardImage(cardId, 'small')}
        </div>`;
    }
    return `<div class="forge-slot forge-slot-empty">?</div>`;
  }).join('');

  const filledCount = _forgeSlots.filter(s => s).length;
  const canForge = filledCount === 3;
  const forgeBtnClass = canForge ? 'btn-primary' : 'btn-primary btn-disabled';

  // Forgeable card grid: non-legendary, has stat bonuses, available qty > forgeSlotCount, same rarity as first
  const forgeSlotCounts = {};
  for (const id of _forgeSlots) { if (id) forgeSlotCounts[id] = (forgeSlotCounts[id] || 0) + 1; }

  const forgeable = gameState.inventory
    .filter(i => {
      const c = CARDS[i.cardId];
      if (!c || Object.keys(c.statBonuses).length === 0) return false;
      if (c.rarity === 'legendary') return false;
      if (selectedRarity && c.rarity !== selectedRarity) return false;
      const used = forgeSlotCounts[c.id] || 0;
      return availableQty(c.id) - used > 0;
    })
    .sort((a, b) => RARITIES.indexOf(CARDS[b.cardId].rarity) - RARITIES.indexOf(CARDS[a.cardId].rarity));

  const expandedForgeTiles = [];
  for (const i of forgeable) {
    const c = CARDS[i.cardId];
    const used = forgeSlotCounts[c.id] || 0;
    const free = availableQty(c.id) - used;
    for (let n = 0; n < free; n++) expandedForgeTiles.push(c.id);
  }

  const forgeGridHtml = expandedForgeTiles.length
    ? expandedForgeTiles.map(cardId => {
        const c = CARDS[cardId];
        return `
          <div class="inv-tile" onclick="addToForge('${c.id}')" style="border-color:${RARITY_COLOR[c.rarity]}" title="${c.name}">
            ${cardImage(c.id, 'small')}
          </div>`;
      }).join('')
    : `<p class="dim" style="grid-column:1/-1">No forgeable cards${selectedRarity ? ' at this rarity' : ''}</p>`;

  return `
    <p class="inv-context-hint">${hintText}</p>
    <div class="forge-slots">${slotsHtml}</div>
    <div style="text-align:center;margin:0.5rem 0">
      <button class="${forgeBtnClass}" ${canForge ? 'onclick="executeForge()"' : 'disabled'}>Forge!</button>
    </div>
    <div class="inv-tile-grid">${forgeGridHtml}</div>`;
}

function toggleForgeMode() {
  _forgeMode = !_forgeMode;
  _forgeSlots = [null, null, null];
  _forgeResult = null;
  _forgeResultIsNew = false;
  if (_forgeMode) _gearSel = { playerId: null, slot: null };
  render();
}

function addToForge(cardId) {
  const emptyIdx = _forgeSlots.indexOf(null);
  if (emptyIdx === -1) return;
  const c = CARDS[cardId];
  if (!c) return;
  // Enforce same rarity
  const firstCard = _forgeSlots[0] ? CARDS[_forgeSlots[0]] : null;
  if (firstCard && c.rarity !== firstCard.rarity) return;
  // Check available qty
  const forgeSlotCounts = {};
  for (const id of _forgeSlots) { if (id) forgeSlotCounts[id] = (forgeSlotCounts[id] || 0) + 1; }
  const used = forgeSlotCounts[cardId] || 0;
  if (availableQty(cardId) - used <= 0) return;
  _forgeSlots[emptyIdx] = cardId;
  render();
}

function removeFromForge(slotIdx) {
  _forgeSlots[slotIdx] = null;
  // Compact: shift remaining to left
  const compacted = _forgeSlots.filter(s => s !== null);
  _forgeSlots = [...compacted, ...Array(3 - compacted.length).fill(null)];
  render();
}

function executeForge() {
  const cardIds = _forgeSlots.filter(id => id);
  if (cardIds.length !== 3) return;
  const result = forgeCards(cardIds);
  if (!result.ok) return;

  // Update inventory: decrement sacrificed cards
  let inv = [...gameState.inventory];
  for (const id of cardIds) {
    const entry = inv.find(i => i.cardId === id);
    if (entry) {
      entry.quantity--;
      if (entry.quantity <= 0) inv = inv.filter(i => i !== entry);
    }
  }
  // Add result card
  const existing = inv.find(i => i.cardId === result.resultCardId);
  _forgeResultIsNew = !existing;
  if (existing) { existing.quantity++; }
  else { inv.push({ cardId: result.resultCardId, quantity: 1 }); }

  _forgeSlots = [null, null, null];
  _forgeResult = result.resultCardId;
  updateState({ inventory: inv });
}

function dismissForgeResult() {
  _forgeResult = null;
  _forgeResultIsNew = false;
  render();
}

// ============================================================
// Drag-and-drop gear assignment (touch + mouse)
// ============================================================

function _canDrag() {
  return gameState.screen === 'managegear' && !_forgeMode && !_modalCard && !_statModalPlayerId;
}

function _getCoords(e) {
  if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function _findDraggable(target) {
  return target.closest?.('[data-drag-card]');
}

function _findDropTarget(x, y, ghost) {
  // Hide ghost so elementFromPoint sees what's beneath
  if (ghost) ghost.style.display = 'none';
  const el = document.elementFromPoint(x, y);
  if (ghost) ghost.style.display = '';
  if (!el) return null;
  // Check for gear slot drop target
  const slotEl = el.closest('[data-drop-slot]');
  if (slotEl) return { type: 'slot', playerId: slotEl.dataset.dropPlayer, slot: slotEl.dataset.dropSlot, el: slotEl };
  // Check for inventory panel (unequip target)
  const invEl = el.closest('.gearup-inventory');
  if (invEl) return { type: 'inventory', el: invEl };
  return null;
}

function _createGhost(cardId, x, y) {
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  const card = CARDS[cardId];
  if (card) ghost.style.borderColor = RARITY_COLOR[card.rarity];
  ghost.innerHTML = cardImage(cardId, 'small');
  ghost.style.left = (x - 28) + 'px';
  ghost.style.top = (y - 28) + 'px';
  document.body.appendChild(ghost);
  return ghost;
}

function _clearHighlights() {
  for (const el of document.querySelectorAll('.gsc-drop-valid')) el.classList.remove('gsc-drop-valid');
  for (const el of document.querySelectorAll('.drop-target-active')) el.classList.remove('drop-target-active');
}

function _highlightValidTargets(cardId, x, y, ghost) {
  _clearHighlights();
  const card = CARDS[cardId];
  if (!card) return;
  const target = _findDropTarget(x, y, ghost);
  if (!target) return;
  if (target.type === 'slot' && target.slot === card.slot) {
    target.el.classList.add('gsc-drop-valid');
  } else if (target.type === 'inventory') {
    target.el.classList.add('drop-target-active');
  }
}

function _startDrag(el, x, y) {
  if (!_canDrag()) return;
  const cardId = el.dataset.dragCard;
  const sourceType = el.dataset.dragSource;
  if (!cardId || !CARDS[cardId]) return;
  _drag = {
    cardId,
    sourceType,
    sourcePlayerId: el.dataset.dragPlayer || null,
    sourceSlot: el.dataset.dragSlot || null,
    ghost: null,
    startX: x, startY: y,
    started: false,
    sourceEl: el,
  };
}

function _moveDrag(x, y, e) {
  if (!_drag) return;
  const dx = x - _drag.startX;
  const dy = y - _drag.startY;
  if (!_drag.started) {
    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    _drag.started = true;
    _drag.ghost = _createGhost(_drag.cardId, x, y);
    _drag.sourceEl?.classList.add('drag-source');
    document.body.classList.add('drag-active');
  }
  if (e) e.preventDefault(); // suppress scroll during drag
  _drag.ghost.style.left = (x - 28) + 'px';
  _drag.ghost.style.top = (y - 28) + 'px';
  _highlightValidTargets(_drag.cardId, x, y, _drag.ghost);
}

function _endDrag(x, y, e) {
  if (!_drag) return;
  if (!_drag.started) {
    // Was a tap, not a drag — let onclick fire
    _drag = null;
    return;
  }
  // Suppress the synthesized click that follows touchend
  if (e) e.preventDefault();
  _dragJustEnded = true;
  setTimeout(() => { _dragJustEnded = false; }, 50);

  const target = _findDropTarget(x, y, _drag.ghost);
  _executeDrop(_drag, target);

  // Cleanup
  if (_drag.ghost) _drag.ghost.remove();
  _clearHighlights();
  document.body.classList.remove('drag-active');
  // Remove drag-source class (may not exist if DOM re-rendered)
  _drag.sourceEl?.classList.remove('drag-source');
  _drag = null;
}

function _executeDrop(drag, target) {
  if (!target) return;
  const card = CARDS[drag.cardId];
  if (!card) return;

  if (target.type === 'slot') {
    // Validate slot type matches
    if (card.slot !== target.slot) return;

    if (drag.sourceType === 'inventory') {
      // Inventory -> gear slot: equip
      if (availableQty(drag.cardId) <= 0) return;
      equipGear(target.playerId, target.slot, drag.cardId);
    } else if (drag.sourceType === 'equipped') {
      // Equipped -> another slot: move/swap
      if (drag.sourcePlayerId === target.playerId && drag.sourceSlot === target.slot) return; // same slot, no-op

      // Batch update to avoid double render
      const targetPlayer = getPlayer(target.playerId);
      const existingInTarget = targetPlayer?.gear[target.slot];

      const players = gameState.players.map(p => {
        const newGear = { ...p.gear };
        // Remove from source
        if (p.id === drag.sourcePlayerId && newGear[drag.sourceSlot] === drag.cardId) {
          // If target slot had a card, swap it to source
          newGear[drag.sourceSlot] = (drag.sourcePlayerId === target.playerId)
            ? existingInTarget || null
            : null;
        }
        // Place in target
        if (p.id === target.playerId) {
          newGear[target.slot] = drag.cardId;
        }
        // If different players and target had a card, put it on source player's slot
        if (existingInTarget && drag.sourcePlayerId !== target.playerId && p.id === drag.sourcePlayerId) {
          newGear[drag.sourceSlot] = existingInTarget;
        }
        if (p.gear.head === newGear.head && p.gear.body === newGear.body &&
            p.gear.feet === newGear.feet && p.gear.gloves === newGear.gloves) return p;
        return { ...p, gear: newGear };
      });
      updateState({ players });
    }
  } else if (target.type === 'inventory') {
    // Dropping on inventory = unequip
    if (drag.sourceType === 'equipped' && drag.sourcePlayerId && drag.sourceSlot) {
      unequipGear(drag.sourcePlayerId, drag.sourceSlot);
    }
  }
}

// --- Event listeners (document-level delegation) ---
document.addEventListener('touchstart', function(e) {
  if (!_canDrag()) return;
  const el = _findDraggable(e.target);
  if (!el) return;
  const { x, y } = _getCoords(e);
  _startDrag(el, x, y);
}, { passive: true });

document.addEventListener('touchmove', function(e) {
  if (!_drag) return;
  const { x, y } = _getCoords(e);
  _moveDrag(x, y, e);
}, { passive: false });

document.addEventListener('touchend', function(e) {
  if (!_drag) return;
  const { x, y } = _getCoords(e);
  _endDrag(x, y, e);
});

document.addEventListener('mousedown', function(e) {
  if (!_canDrag()) return;
  const el = _findDraggable(e.target);
  if (!el) return;
  _startDrag(el, e.clientX, e.clientY);
});

document.addEventListener('mousemove', function(e) {
  if (!_drag) return;
  _moveDrag(e.clientX, e.clientY, e);
});

document.addEventListener('mouseup', function(e) {
  if (!_drag) return;
  _endDrag(e.clientX, e.clientY, e);
});
