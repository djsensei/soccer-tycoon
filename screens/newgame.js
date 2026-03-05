// ============================================================
// screens/newgame.js — Multi-step new game wizard
// ============================================================

// Module-level wizard state (not persisted)
let _creationStep = 0;  // 0 = team+manager, 1–5 = player creation by position
let _creationData = {
  teamName: '',
  managerName: '',
  playerDefs: [],  // { name, stats } for each completed player
};
// Current player's stat allocation and name (reset each step)
let _allocStats = {};
let _currentPlayerName = '';
const _POINTS_PER_PLAYER = 15;
const _STAT_MAX = 5;
const _STAT_BASE = 1;

function _resetWizard() {
  _creationStep = 0;
  _creationData = { teamName: '', managerName: '', playerDefs: [] };
  _allocStats = {};
  _currentPlayerName = '';
}

function _initAllocStats() {
  _allocStats = {};
  for (const s of STATS) _allocStats[s] = _STAT_BASE;
}

function _allocRemaining() {
  const used = Object.values(_allocStats).reduce((a, b) => a + b, 0);
  return _POINTS_PER_PLAYER - (used - STATS.length * _STAT_BASE);
}

function _randomizeAlloc() {
  _initAllocStats();
  let pts = _POINTS_PER_PLAYER;
  // Distribute points randomly, respecting max
  const stats = [...STATS];
  while (pts > 0) {
    // Shuffle to avoid bias
    const eligible = stats.filter(s => _allocStats[s] < _STAT_MAX + _STAT_BASE);
    if (!eligible.length) break;
    const s = eligible[Math.floor(Math.random() * eligible.length)];
    _allocStats[s]++;
    pts--;
  }
}

const _POSITION_LABELS = {
  GK: 'Your Goalkeeper',
  D:  'Your Defender',
  M1: 'Your Midfielder',
  M2: 'Your Second Midfielder',
  S:  'Your Striker',
};

function renderNewGame() {
  if (_creationStep === 0) return _renderTeamStep();
  return _renderPlayerStep();
}

function _renderTeamStep() {
  const teamVal = _creationData.teamName || generateTeamName();
  const mgrVal  = _creationData.managerName || generatePlayerName();
  return `
    <div class="screen newgame-screen">
      <h1>Soccer Tycoon</h1>
      <p class="subtitle">Build a team. Win fans. Become a legend.</p>
      <div class="card setup-card">
        <h2>Name Your Club</h2>
        <div class="name-field">
          <label>Club Name</label>
          <div class="name-row">
            <input type="text" id="wiz-team" placeholder="Your team name" value="${teamVal}" />
            <button class="btn-small" onclick="document.getElementById('wiz-team').value = generateTeamName()">🎲</button>
          </div>
        </div>
        <div class="name-field">
          <label>Manager Name</label>
          <div class="name-row">
            <input type="text" id="wiz-manager" placeholder="Your name" value="${mgrVal}" />
            <button class="btn-small" onclick="document.getElementById('wiz-manager').value = generatePlayerName()">🎲</button>
          </div>
        </div>
        <button class="btn-primary" onclick="wizNextFromTeam()">Next →</button>
      </div>
    </div>
  `;
}

function _renderPlayerStep() {
  // Preserve name from DOM if it exists (re-render during stat allocation)
  const nameInput = document.getElementById('wiz-pname');
  if (nameInput) _currentPlayerName = nameInput.value;

  const posIdx = _creationStep - 1;
  const pos = POSITIONS[posIdx];
  const label = _POSITION_LABELS[pos];
  const nameVal = _currentPlayerName || generatePlayerName();
  const remaining = _allocRemaining();

  // If stats not initialized for this step, init them
  if (Object.keys(_allocStats).length === 0) _initAllocStats();

  const statRowsHtml = STATS.map(s => {
    const val = _allocStats[s];
    const canDec = val > _STAT_BASE;
    const canInc = val < _STAT_MAX + _STAT_BASE && remaining > 0;
    return `
      <div class="alloc-stat-row">
        <span class="alloc-stat-label" style="color:${STAT_COLORS[s]}">${STAT_ABBR[s]}</span>
        <button class="btn-alloc ${canDec ? '' : 'btn-disabled'}" onclick="allocStat('${s}', -1)" ${canDec ? '' : 'disabled'}>−</button>
        <div class="alloc-stat-bar">
          <div class="alloc-stat-fill" style="width:${(val / (_STAT_MAX + _STAT_BASE)) * 100}%;background:${STAT_COLORS[s]}"></div>
          <span class="alloc-stat-val">${val}</span>
        </div>
        <button class="btn-alloc ${canInc ? '' : 'btn-disabled'}" onclick="allocStat('${s}', 1)" ${canInc ? '' : 'disabled'}>+</button>
      </div>
    `;
  }).join('');

  const stepIndicator = POSITIONS.map((p, i) => {
    const done = i < posIdx;
    const current = i === posIdx;
    return `<span class="wiz-step ${done ? 'wiz-step-done' : ''} ${current ? 'wiz-step-current' : ''}">${p}</span>`;
  }).join('');

  const isLast = _creationStep === 5;
  const btnLabel = isLast ? 'Kick Off!' : 'Next →';

  return `
    <div class="screen newgame-screen">
      <div class="wiz-steps">${stepIndicator}</div>
      <div class="card setup-card">
        <h2>${label}</h2>
        <div class="name-field">
          <label>Player Name</label>
          <div class="name-row">
            <input type="text" id="wiz-pname" placeholder="Player name" value="${nameVal}" />
            <button class="btn-small" onclick="wizRandomizeName()">🎲</button>
          </div>
        </div>
        <div class="alloc-section">
          <div class="alloc-header">
            <h3>Allocate Stats</h3>
            <div class="alloc-remaining ${remaining === 0 ? 'alloc-done' : ''}">
              ${remaining} point${remaining !== 1 ? 's' : ''} left
            </div>
            <button class="btn-small" onclick="wizRandomize()">🎲 Randomize</button>
          </div>
          ${statRowsHtml}
        </div>
        <div class="wiz-nav">
          <button class="btn-secondary" onclick="wizBack()">← Back</button>
          <button class="btn-primary ${remaining > 0 ? 'btn-disabled' : ''}" onclick="wizNextFromPlayer()" ${remaining > 0 ? 'disabled' : ''}>${btnLabel}</button>
        </div>
      </div>
    </div>
  `;
}

// --- Interaction handlers ---

function wizNextFromTeam() {
  _creationData.teamName = document.getElementById('wiz-team').value.trim() || generateTeamName();
  _creationData.managerName = document.getElementById('wiz-manager').value.trim() || 'Coach';
  _creationStep = 1;
  _currentPlayerName = '';
  _initAllocStats();
  render();
}

function wizBack() {
  if (_creationStep <= 1) {
    _creationStep = 0;
    render();
    return;
  }
  // Pop the last player def and restore their stats
  _creationStep--;
  const prev = _creationData.playerDefs.pop();
  if (prev) {
    _allocStats = { ...prev.stats };
    _currentPlayerName = prev.name;
  } else {
    _initAllocStats();
    _currentPlayerName = '';
  }
  render();
}

function wizNextFromPlayer() {
  if (_allocRemaining() > 0) return;
  const name = document.getElementById('wiz-pname').value.trim() || generatePlayerName();
  _creationData.playerDefs.push({ name, stats: { ..._allocStats } });

  if (_creationStep >= 5) {
    // All players created — start the game
    gameState = createNewGame(
      _creationData.teamName,
      _creationData.managerName,
      _creationData.playerDefs,
    );
    _resetWizard();
    saveGame(gameState);
    render();
    return;
  }

  _creationStep++;
  _currentPlayerName = '';
  _initAllocStats();
  render();
}

function allocStat(stat, delta) {
  const newVal = _allocStats[stat] + delta;
  if (newVal < _STAT_BASE || newVal > _STAT_MAX + _STAT_BASE) return;
  if (delta > 0 && _allocRemaining() <= 0) return;
  _allocStats[stat] = newVal;
  render();
}

function wizRandomize() {
  _randomizeAlloc();
  render();
}

function wizRandomizeName() {
  _currentPlayerName = generatePlayerName();
  document.getElementById('wiz-pname').value = _currentPlayerName;
}

function startNewGame() {
  // Legacy entry point — redirect to wizard
  _resetWizard();
  render();
}
