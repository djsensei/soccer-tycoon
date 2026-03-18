// ============================================================
// screens/training.js — Training & rest screen (M12)
// ============================================================

// Training state
let _trainingChoices = {};  // { playerId: 'train' | 'rest' }
let _trainingStat = null;   // single stat the whole team trains on
let _trainingResults = [];

function initTrainingChoices() {
  _trainingChoices = {};
  for (const p of gameState.players) {
    _trainingChoices[p.id] = 'rest';
  }
  // Default training stat = weakest trainable stat across the team
  const statTotals = {};
  for (const s of STATS) {
    statTotals[s] = gameState.players.reduce((sum, p) => sum + (p.stats[s] || 0), 0);
  }
  const trainable = STATS.filter(s => gameState.players.some(p => (p.stats[s] || 0) < 10));
  _trainingStat = trainable.length
    ? trainable.reduce((a, b) => statTotals[a] <= statTotals[b] ? a : b)
    : STATS[0];
}

function toggleTrainingAction(playerId) {
  _trainingChoices[playerId] = _trainingChoices[playerId] === 'train' ? 'rest' : 'train';
  render();
}

function setTeamTrainingStat(stat) {
  _trainingStat = stat;
  render();
}

function bulkTrainingAction(action) {
  for (const p of gameState.players) {
    _trainingChoices[p.id] = action;
  }
  render();
}

function renderTraining() {
  if (!_trainingChoices || Object.keys(_trainingChoices).length === 0) {
    initTrainingChoices();
  }

  // Stat selector (team-wide)
  const trainable = STATS.filter(s => gameState.players.some(p => (p.stats[s] || 0) < 10));
  const statSelectorHtml = trainable.map(s => {
    const active = s === _trainingStat ? 'btn-active' : 'btn-secondary';
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return `<button class="btn-small ${active}" onclick="setTeamTrainingStat('${s}')" style="border-color:${STAT_COLORS[s]}">${label}</button>`;
  }).join('');

  const rows = gameState.players.map(p => {
    const action = _trainingChoices[p.id] || 'rest';
    const energy = p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy;
    const isTraining = action === 'train';

    // Preview energy change
    const previewEnergy = isTraining
      ? Math.max(0, energy - ENERGY_CONFIG.trainingCost)
      : Math.min(ENERGY_CONFIG.maxEnergy, energy + ENERGY_CONFIG.restRecovery);
    const previewDelta = previewEnergy - energy;
    const previewSign = previewDelta >= 0 ? '+' : '';
    const previewClass = isTraining ? 'preview-train' : 'preview-rest';

    const posLabel = Object.entries(gameState.slots).find(([, id]) => id === p.id)?.[0] || '';
    const canTrain = (p.stats[_trainingStat] || 0) < 10;

    return `<div class="training-player-row" onclick="${canTrain ? `toggleTrainingAction('${p.id}')` : ''}">
      <div class="training-player-name">${slotName(posLabel)} — ${p.name}</div>
      <div class="training-energy-col">${energyBar(energy)}</div>
      <div class="training-action-col">
        <div class="training-toggle ${isTraining ? 'toggle-train' : 'toggle-rest'}">${isTraining ? 'Train' : 'Rest'}</div>
      </div>
      <div class="training-preview ${previewClass}">${previewSign}${previewDelta}</div>
    </div>`;
  }).join('');

  return `
    <div class="screen training-screen">
      <h1>Training Time!</h1>
      <div class="training-subtitle">Pick a stat to train, then choose who trains and who rests</div>
      <div class="training-stat-selector">
        <div class="training-stat-label">Team trains:</div>
        <div class="training-stat-btns">${statSelectorHtml}</div>
      </div>
      <div class="training-bulk-btns">
        <button class="btn-secondary btn-small" onclick="bulkTrainingAction('rest')">Rest All</button>
        <button class="btn-secondary btn-small" onclick="bulkTrainingAction('train')">Train All</button>
      </div>
      ${rows}
      <div class="training-go-btn">
        <button class="btn-primary btn-large" onclick="executeTraining()">Go!</button>
      </div>
      ${buildHelpButton('training')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}

function executeTraining() {
  _trainingResults = [];
  const stat = _trainingStat;

  const updatedPlayers = gameState.players.map(p => {
    const action = _trainingChoices[p.id] || 'rest';
    const updated = { ...p, stats: { ...p.stats } };
    const energy = updated.energy != null ? updated.energy : ENERGY_CONFIG.maxEnergy;

    if (action === 'train' && (updated.stats[stat] || 0) < 10) {
      updated.energy = Math.max(0, energy - noisyCost(ENERGY_CONFIG.trainingCost));
      const success = Math.random() < ENERGY_CONFIG.trainSuccessChance;
      if (success) {
        updated.stats[stat] = (updated.stats[stat] || 1) + 1;
        _trainingResults.push({ playerId: p.id, name: p.name, action: 'train', stat, success: true, newVal: updated.stats[stat] });
      } else {
        _trainingResults.push({ playerId: p.id, name: p.name, action: 'train', stat, success: false });
      }
    } else {
      updated.energy = Math.min(ENERGY_CONFIG.maxEnergy, energy + ENERGY_CONFIG.restRecovery);
      _trainingResults.push({ playerId: p.id, name: p.name, action: 'rest', energyAfter: updated.energy });
    }

    return updated;
  });

  _trainingChoices = {};

  // Clear showTraining so Gear Up back button won't re-enter training
  const cm = gameState.currentMatch ? { ...gameState.currentMatch, showTraining: false } : null;

  updateState({
    screen: 'trainingResults',
    players: updatedPlayers,
    currentMatch: cm,
  });
}

function renderTrainingResults() {
  const rows = _trainingResults.map((r, i) => {
    const p = getPlayer(r.playerId);
    const energy = p ? (p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy) : 100;
    const color = r.stat ? (STAT_COLORS[r.stat] || 'var(--accent)') : '';

    let outcomeHtml;
    if (r.action === 'rest') {
      outcomeHtml = `<span class="training-result-outcome rested">Rested</span>`;
    } else if (r.success) {
      const barPct = Math.min(100, Math.round((r.newVal / 10) * 100));
      outcomeHtml = `
        <span class="training-result-outcome success">
          <span class="training-stat-bar-anim" style="--bar-color:${color}">
            <span class="training-stat-bar-fill-anim" style="width:${barPct}%;background:${color};animation-delay:${i * 0.15}s"></span>
          </span>
          <span class="training-stat-pop" style="--pop-color:${color};animation-delay:${i * 0.15 + 0.3}s">
            ${STAT_ABBR[r.stat]} +1!
          </span>
          <span class="training-stat-now">(now ${r.newVal})</span>
        </span>`;
    } else {
      outcomeHtml = `<span class="training-result-outcome fail">Trained ${STAT_ABBR[r.stat]} — no improvement</span>`;
    }

    return `<div class="training-result-row" style="animation-delay:${i * 0.08}s">
      <div class="training-player-name">${r.name}</div>
      <div class="training-result-energy">${energyBar(energy)}</div>
      ${outcomeHtml}
    </div>`;
  }).join('');

  return `
    <div class="screen training-results-screen">
      <h1>Training Report</h1>
      ${rows}
      <div class="training-go-btn">
        <button class="btn-primary btn-large" onclick="updateState({screen:'table'})">Continue</button>
      </div>
    </div>
  `;
}
