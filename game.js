// ============================================================
// game.js — State management, screen rendering, event handling
// ============================================================

let gameState = null;
let matchPlayback = null; // holds interval reference during match animation

function updateState(patch) {
  Object.assign(gameState, patch);
  saveGame(gameState);
  render();
}

function render() {
  if (matchPlayback) { clearInterval(matchPlayback); matchPlayback = null; }
  const app = document.getElementById('app');
  switch (gameState.screen) {
    case 'newgame':    app.innerHTML = renderNewGame();      break;
    case 'hub':        app.innerHTML = renderHub();          break;
    case 'managegear': app.innerHTML = renderManageGear();   break;
    case 'matchselect':app.innerHTML = renderMatchSelect();  break;
    case 'prematch':   app.innerHTML = renderPreMatch();     break;
    case 'match':      app.innerHTML = renderMatchScreen();  startMatchPlayback(); break;
    case 'results':    app.innerHTML = renderResults();      break;
    case 'packopen':   app.innerHTML = renderPackOpening();  break;
    default:           app.innerHTML = '<p>Unknown screen.</p>';
  }
}

// ---------------------------------------------------------------
// Utility
// ---------------------------------------------------------------
function getPlayer(id) { return gameState.players.find(p => p.id === id); }
function getOpponent(id) { return gameState.opponentTeams.find(t => t.id === id); }
function slotName(slot) { return ({ GK:'Goalkeeper', D:'Defender', M1:'Midfielder', M2:'Midfielder', S:'Striker' })[slot] || slot; }

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

function inventoryCount(cardId) {
  const item = gameState.inventory.find(i => i.cardId === cardId);
  return item ? item.quantity : 0;
}

function addToInventory(cardId) {
  const existing = gameState.inventory.find(i => i.cardId === cardId);
  if (existing) existing.quantity++;
  else gameState.inventory.push({ cardId, quantity: 1 });
}

function tierStars(difficulty) {
  const full = Math.round(difficulty / 2);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ---------------------------------------------------------------
// NEW GAME
// ---------------------------------------------------------------
function renderNewGame() {
  const slots = ['GK','D','M1','M2','S'];
  const labels = { GK:'Goalkeeper', D:'Defender', M1:'Midfielder 1', M2:'Midfielder 2', S:'Striker' };
  const fields = slots.map(s => `
    <div class="name-field">
      <label>${labels[s]}</label>
      <div class="name-row">
        <input type="text" id="pname-${s}" placeholder="${labels[s]} name" value="${generatePlayerName()}" />
        <button class="btn-small" onclick="document.getElementById('pname-${s}').value = generatePlayerName()">🎲</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="screen newgame-screen">
      <h1>⚽ Soccer Tycoon</h1>
      <p class="subtitle">Build a team. Win fans. Become a legend.</p>
      <div class="card setup-card">
        <h2>Name Your Club</h2>
        <div class="name-field">
          <label>Club Name</label>
          <div class="name-row">
            <input type="text" id="teamname" placeholder="Your team name" value="${generateTeamName()}" />
            <button class="btn-small" onclick="document.getElementById('teamname').value = generateTeamName()">🎲</button>
          </div>
        </div>
        <h2>Name Your Players</h2>
        ${fields}
        <button class="btn-primary" onclick="startNewGame()">⚽ Kick Off!</button>
      </div>
    </div>
  `;
}

function startNewGame() {
  const teamName = document.getElementById('teamname').value.trim() || generateTeamName();
  const slots = ['GK','D','M1','M2','S'];
  const playerNames = slots.map(s => document.getElementById(`pname-${s}`).value.trim() || generatePlayerName());
  gameState = createNewGame(teamName, playerNames);
  saveGame(gameState);
  render();
}

// ---------------------------------------------------------------
// HUB
// ---------------------------------------------------------------
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
          ${STATS.map(s => `<span title="${s}">${s.slice(0,3).toUpperCase()} ${eff[s]}</span>`).join('')}
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

// ---------------------------------------------------------------
// MANAGE GEAR
// ---------------------------------------------------------------
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
      ${eff[s] > base[s] ? `<span class="stat-bonus">+${eff[s]-base[s]}</span>` : ''}
      ${statBar(eff[s])}
    </div>
  `).join('');

  const gearSlotsHtml = gearSlots.map(gs => {
    const equippedId = player.gear[gs];
    const equipped   = equippedId ? CARDS[equippedId] : null;
    const available  = gameState.inventory
      .filter(i => i.quantity > 0 && CARDS[i.cardId]?.slot === gs)
      .map(i => CARDS[i.cardId]);

    const equippedHtml = equipped
      ? `<div class="equipped-card" style="border-color:${RARITY_COLOR[equipped.rarity]}">
           ${rarityBadge(equipped.rarity)}
           <strong>${equipped.name}</strong>
           <em>${equipped.flavourText}</em>
           <div class="bonus-list">${Object.entries(equipped.statBonuses).map(([s,v])=>`+${v} ${s}`).join(' · ') || 'No bonus'}</div>
           <button class="btn-small btn-danger" onclick="unequipGear('${player.id}','${gs}')">Remove</button>
         </div>`
      : `<div class="empty-gear-slot">Empty — nothing equipped</div>`;

    const inventoryHtml = available.length
      ? available.map(c => {
          const qty = inventoryCount(c.id);
          const bonuses = Object.entries(c.statBonuses).map(([s,v])=>`+${v} ${s}`).join(' · ') || 'No bonus';
          return `
            <div class="inventory-card ${equippedId === c.id ? 'equipped' : ''}" onclick="equipGear('${player.id}','${gs}','${c.id}')">
              ${rarityBadge(c.rarity)}
              <strong>${c.name}</strong> <span class="qty">×${qty}</span>
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
    // If this card was equipped in another slot, remove it first
    const newGear = { ...p.gear };
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

// ---------------------------------------------------------------
// MATCH SELECT
// ---------------------------------------------------------------
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
          const base = t.fanRewardBase;
          const minFan = Math.round(base * FAN_MULTIPLIERS.loss);
          const maxFan = Math.round(base * FAN_MULTIPLIERS.bigWin);
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
        }).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="screen matchselect-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'hub'})">← Back</button>
        <h1>Pick Your Opponent</h1>
      </div>
      ${groupsHtml || '<p class="dim">No opponents available.</p>'}
    </div>
  `;
}

function selectOpponent(opponentId) {
  updateState({ screen: 'prematch', selectedOpponentId: opponentId });
}

// ---------------------------------------------------------------
// PRE-MATCH
// ---------------------------------------------------------------
const TRASH_TALK = [
  "\"We've seen better teams at a car park kickabout.\"",
  "\"Our goalkeeper naps during warm-ups. Still better than you.\"",
  "\"Prepare to lose magnificently.\"",
  "\"We googled your team. Couldn't find anything.\"",
  "\"Our worst player is off sick today. You're welcome.\"",
  "\"We're going to be so nice about this loss. Really. We promise.\"",
];

function renderPreMatch() {
  const opp = getOpponent(gameState.selectedOpponentId);
  if (!opp) return `<div class="screen"><p>Opponent not found.</p></div>`;
  const talk = pick(TRASH_TALK);

  return `
    <div class="screen prematch-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'matchselect'})">← Back</button>
        <h1>Pre-Match</h1>
      </div>
      <div class="prematch-layout">
        <div class="vs-banner">
          <div class="vs-team player-team">${gameState.teamName}</div>
          <div class="vs-divider">VS</div>
          <div class="vs-team opp-team">${opp.name}</div>
        </div>
        <div class="card prematch-card">
          <div class="opp-stars big">${tierStars(opp.difficulty)}</div>
          <p class="opp-note-big">${opp.specialNote}</p>
          <blockquote class="trash-talk">${talk}</blockquote>
        </div>
        <button class="btn-primary btn-large" onclick="kickOff()">🏁 KICK OFF!</button>
      </div>
    </div>
  `;
}

function kickOff() {
  const opp = getOpponent(gameState.selectedOpponentId);
  const playerTeamFull = {
    id: 'player',
    name: gameState.teamName,
    players: gameState.players,
    slots: gameState.slots,
  };
  const result = simulateMatch(playerTeamFull, opp);
  const { delta, outcome } = calculateFanDelta(opp.tier, result.playerScore, result.opponentScore, opp.fanRewardBase);
  const packEarned = getPackReward(opp.tier, outcome);

  const currentMatch = {
    opponentId:    opp.id,
    opponentName:  opp.name,
    events:        result.events,
    playerScore:   result.playerScore,
    opponentScore: result.opponentScore,
    fanDelta:      delta,
    outcome,
    packEarned,
  };

  updateState({ screen: 'match', currentMatch });
}

// ---------------------------------------------------------------
// MATCH SCREEN
// ---------------------------------------------------------------
function renderMatchScreen() {
  const m = gameState.currentMatch;
  return `
    <div class="screen match-screen">
      <div class="match-header">
        <div class="match-team">${gameState.teamName}</div>
        <div class="match-score" id="match-score">0 – 0</div>
        <div class="match-team">${m.opponentName}</div>
      </div>
      <div class="match-controls">
        <label class="toggle-label">
          <input type="checkbox" id="highlights-toggle" checked>
          Highlights only
        </label>
        <button class="btn-small" onclick="skipToEnd()">Skip ⏩</button>
      </div>
      <div class="event-log" id="event-log"></div>
      <div id="match-end-btn" style="display:none">
        <button class="btn-primary btn-large" onclick="goToResults()">See Results →</button>
      </div>
    </div>
  `;
}

function startMatchPlayback() {
  const m = gameState.currentMatch;
  if (!m || !m.events) return;

  let idx = 0;
  const log = document.getElementById('event-log');
  const scoreEl = document.getElementById('match-score');

  function showNext() {
    if (idx >= m.events.length) {
      document.getElementById('match-end-btn').style.display = 'block';
      if (matchPlayback) clearInterval(matchPlayback);
      return;
    }

    const event = m.events[idx++];
    const highlightsOnly = document.getElementById('highlights-toggle')?.checked;

    // Update score display from meta
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }

    if (highlightsOnly && !event.isHighlight) return;

    const text = renderEventText(event);
    if (!text) return;

    const div = document.createElement('div');
    div.className = `event-line ${event.isHighlight ? 'highlight' : ''} ${event.team || ''}`;

    const minLabel = (event.minute != null && event.type !== 'kickoff')
      ? `<span class="event-min">${event.minute}'</span> `
      : '';
    div.innerHTML = `${minLabel}${text}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  matchPlayback = setInterval(showNext, 600);
}

function skipToEnd() {
  if (matchPlayback) { clearInterval(matchPlayback); matchPlayback = null; }
  const m = gameState.currentMatch;
  const log = document.getElementById('event-log');
  const scoreEl = document.getElementById('match-score');
  log.innerHTML = '';

  for (const event of m.events) {
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }
    if (!event.isHighlight) continue;
    const text = renderEventText(event);
    if (!text) continue;
    const div = document.createElement('div');
    div.className = `event-line highlight ${event.team || ''}`;
    const minLabel = (event.minute != null && event.type !== 'kickoff') ? `<span class="event-min">${event.minute}'</span> ` : '';
    div.innerHTML = `${minLabel}${text}`;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;
  document.getElementById('match-end-btn').style.display = 'block';
}

function goToResults() {
  const m   = gameState.currentMatch;
  const opp = getOpponent(m.opponentId);

  // Update fan count
  const newFans = Math.max(0, gameState.fans + m.fanDelta);

  // Update match history
  const matchHistory = [...gameState.matchHistory, {
    opponentId: m.opponentId, playerScore: m.playerScore,
    opponentScore: m.opponentScore, fanDelta: m.fanDelta, packEarned: m.packEarned,
  }];

  // Manage special team appearance logic
  let opponentTeams = gameState.opponentTeams.map(t => t.id === opp.id
    ? { ...t, appearsForMatches: t.appearsForMatches != null ? t.appearsForMatches - 1 : null }
    : t
  ).map(t => t.tier === 'special' && t.appearsForMatches != null && t.appearsForMatches <= 0
    ? { ...t, isAvailable: false, appearsForMatches: null }
    : t
  );

  let matchesUntilSpecialCheck = gameState.matchesUntilSpecialCheck - 1;
  if (matchesUntilSpecialCheck <= 0) {
    // Roll for a special team to appear
    const hidden = opponentTeams.filter(t => t.tier === 'special' && !t.isAvailable);
    if (hidden.length > 0) {
      const chosen = pick(hidden);
      opponentTeams = opponentTeams.map(t => t.id === chosen.id
        ? { ...t, isAvailable: true, appearsForMatches: 2 + Math.floor(Math.random() * 2) }
        : t
      );
    }
    matchesUntilSpecialCheck = 3 + Math.floor(Math.random() * 3);
  }

  const pendingPacks = m.packEarned ? [m.packEarned] : [];

  updateState({
    screen: 'results',
    fans: newFans,
    matchesPlayed: gameState.matchesPlayed + 1,
    matchHistory,
    opponentTeams,
    matchesUntilSpecialCheck,
    pendingPacks,
  });
}

// ---------------------------------------------------------------
// RESULTS
// ---------------------------------------------------------------
function renderResults() {
  const m = gameState.currentMatch;
  const opp = getOpponent(m.opponentId);

  const outcomeMessages = {
    bigWin:  '🏆 DOMINANT VICTORY!',
    win:     '✅ VICTORY!',
    tie:     '🤝 IT\'S A DRAW',
    loss:    '😬 Defeat...',
    bigLoss: '💀 HUMILIATING DEFEAT',
  };

  const deltaSign  = m.fanDelta >= 0 ? '+' : '';
  const deltaClass = m.fanDelta >= 0 ? 'fan-gain' : 'fan-loss';

  const packHtml = m.packEarned
    ? `<div class="pack-earned">
         🃏 You earned a <strong>${PACK_TYPES[m.packEarned]?.name}</strong>!
       </div>
       <button class="btn-primary btn-large" onclick="updateState({screen:'packopen'})">Open Pack! 🎁</button>`
    : `<button class="btn-secondary btn-large" onclick="updateState({screen:'hub'})">Back to Hub</button>`;

  return `
    <div class="screen results-screen">
      <h1>${outcomeMessages[m.outcome] || 'Match Over'}</h1>
      <div class="result-score-big">${m.playerScore} – ${m.opponentScore}</div>
      <div class="result-teams">${gameState.teamName} vs ${m.opponentName}</div>
      <div class="fan-delta ${deltaClass}">${deltaSign}${m.fanDelta.toLocaleString()} fans</div>
      <div class="fans-total">Total: 👥 ${gameState.fans.toLocaleString()}</div>
      ${packHtml}
      ${m.packEarned ? '' : ''}
    </div>
  `;
}

// ---------------------------------------------------------------
// PACK OPENING
// ---------------------------------------------------------------
function renderPackOpening() {
  const packId   = gameState.pendingPacks[0];
  const pack     = PACK_TYPES[packId];
  const cardIds  = openPack(packId);

  // Add cards to inventory immediately (render shows what you got)
  const newInventory = [...gameState.inventory];
  for (const cardId of cardIds) {
    const existing = newInventory.find(i => i.cardId === cardId);
    if (existing) existing.quantity++;
    else newInventory.push({ cardId, quantity: 1 });
  }
  // Save without re-rendering (we're mid-render)
  const newPendingPacks = gameState.pendingPacks.slice(1);
  gameState.inventory   = newInventory;
  gameState.pendingPacks = newPendingPacks;
  gameState.lastOpenedCards = cardIds;
  saveGame(gameState);

  const cardsHtml = cardIds.map((cardId, i) => {
    const c       = CARDS[cardId];
    const bonuses = Object.entries(c.statBonuses).map(([s,v])=>`+${v} ${s}`).join(' · ') || 'No stat bonus';
    return `
      <div class="pack-card" style="animation-delay:${i * 0.3}s; border-color:${RARITY_COLOR[c.rarity]}">
        ${rarityBadge(c.rarity)}
        <div class="pack-card-slot">${c.slot.charAt(0).toUpperCase() + c.slot.slice(1)}</div>
        <div class="pack-card-name">${c.name}</div>
        <div class="pack-card-flavour">${c.flavourText}</div>
        <div class="pack-card-bonus">${bonuses}</div>
      </div>`;
  }).join('');

  const nextBtn = newPendingPacks.length > 0
    ? `<button class="btn-primary" onclick="updateState({screen:'packopen'})">Open Next Pack</button>`
    : `<button class="btn-primary btn-large" onclick="updateState({screen:'hub'})">Back to Hub</button>`;

  return `
    <div class="screen packopen-screen">
      <h1>🎁 ${pack?.name || 'Pack Opening'}</h1>
      <div class="pack-cards">${cardsHtml}</div>
      <div class="pack-actions">${nextBtn}</div>
    </div>
  `;
}

// ---------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const saved = loadGame();
  if (saved) {
    gameState = saved;
    // Ensure screen is valid on reload
    if (['match','prematch'].includes(gameState.screen)) gameState.screen = 'hub';
  } else {
    gameState = { screen: 'newgame' };
  }
  render();
});
