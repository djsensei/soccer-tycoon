// ============================================================
// screens/match.js — Live match screen (playback and skip)
// ============================================================

// Speed presets: [normalMs, highlightMs]
const PLAYBACK_SPEEDS = {
  slow:    { normal: 300, highlight: 2400, label: '>'   },
  medium:  { normal: 80,  highlight: 1000, label: '>>'  },
  fast:    { normal: 20,  highlight: 400,  label: '>>>' },
};
const SPEED_ORDER = ['slow', 'medium', 'fast'];
let _playbackSpeed = 'medium';  // default
let _playbackPaused = false;
let _scheduleNext = null;       // reference to playback loop for pause/resume

function renderMatchScreen() {
  const m = gameState.currentMatch;
  _playbackSpeed = 'medium';
  _playbackPaused = false;
  return `
    <div class="screen match-screen">
      <div class="match-header">
        <div class="match-team">${gameState.teamName}</div>
        <div class="match-score-block">
          <div class="match-minute" id="match-minute">0'</div>
          <div class="match-score" id="match-score">0 – 0</div>
        </div>
        <div class="match-team">${m.opponentName}</div>
      </div>
      <div class="fan-display" id="fan-display">
        <div class="fan-count-row">
          <span class="fan-icon">👥</span>
          <span class="fan-count-value" id="fan-count-value">${gameState.fans.toLocaleString()}</span>
        </div>
        <div class="fan-deltas" id="fan-deltas"></div>
      </div>
      <div class="match-controls">
        <div class="speed-controls" id="speed-controls">
          <button class="btn-speed" data-action="pause" onclick="togglePause()">⏸</button>
          ${SPEED_ORDER.map(key => `<button class="btn-speed${key === _playbackSpeed ? ' active' : ''}" data-speed="${key}" onclick="setSpeed('${key}')">${PLAYBACK_SPEEDS[key].label}</button>`).join('')}
          <button class="btn-speed btn-speed-skip" onclick="skipToEnd()">Skip</button>
        </div>
      </div>
      <div class="event-log" id="event-log"></div>
      <div id="match-end-btn" style="display:none">
        <button class="btn-primary btn-large" onclick="goToResults()">See Results</button>
      </div>
      ${buildHelpButton('match')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}

function updateSpeedButtons() {
  const container = document.getElementById('speed-controls');
  if (!container) return;
  for (const btn of container.querySelectorAll('.btn-speed[data-speed]')) {
    btn.classList.toggle('active', btn.dataset.speed === _playbackSpeed);
  }
  const pauseBtn = container.querySelector('[data-action="pause"]');
  if (pauseBtn) pauseBtn.classList.toggle('active', _playbackPaused);
}

function setSpeed(key) {
  _playbackSpeed = key;
  _playbackPaused = false;
  updateSpeedButtons();
  // If we were paused, resume
  if (matchPlayback === null && typeof _scheduleNext === 'function') {
    _scheduleNext();
  }
}

function togglePause() {
  _playbackPaused = !_playbackPaused;
  updateSpeedButtons();
  if (!_playbackPaused && matchPlayback === null && typeof _scheduleNext === 'function') {
    _scheduleNext();
  } else if (_playbackPaused && matchPlayback) {
    clearTimeout(matchPlayback);
    matchPlayback = null;
  }
}

function startMatchPlayback() {
  const m = gameState.currentMatch;
  if (!m || !m.events) return;

  let idx = 0;
  let runningFans = gameState.fans;
  const log       = document.getElementById('event-log');
  const scoreEl   = document.getElementById('match-score');
  const minuteEl  = document.getElementById('match-minute');
  const fanVal    = document.getElementById('fan-count-value');
  const fanDeltas = document.getElementById('fan-deltas');

  function showFanDelta(delta) {
    if (!delta || !fanDeltas) return;
    // Update running total
    runningFans = Math.max(50, runningFans + delta);
    if (fanVal) fanVal.textContent = runningFans.toLocaleString();

    // Floating delta badge
    const badge = document.createElement('span');
    const sign = delta >= 0 ? '+' : '';
    badge.className = 'fan-delta-float ' + (delta >= 0 ? 'positive' : 'negative');
    badge.textContent = sign + delta.toLocaleString();
    fanDeltas.appendChild(badge);
    // Remove after animation
    setTimeout(() => badge.remove(), 1200);

    // Flash the fan display on big swings
    if (Math.abs(delta) > 50) {
      const display = document.getElementById('fan-display');
      if (display) {
        display.classList.add('fan-flash');
        setTimeout(() => display?.classList.remove('fan-flash'), 800);
      }
    }
  }

  function eventDiv(event) {
    const text = renderEventText(event);
    if (!text) return null;
    const div = document.createElement('div');
    div.className = `event-line ${event.isHighlight ? 'highlight' : 'subdued'} ${event.team || ''}`;
    const minLabel = (event.minute != null && event.type !== 'kickoff')
      ? `<span class="event-min">${event.minute}'</span>` : '';
    div.innerHTML = `${minLabel}<span class="event-text">${text}</span>`;
    return div;
  }

  // Trim old non-highlight lines to keep the log focused
  function trimLog() {
    const MAX_LINES = 40;
    while (log.children.length > MAX_LINES) {
      log.removeChild(log.firstChild);
    }
  }

  function scheduleNext() {
    if (_playbackPaused) { matchPlayback = null; return; }
    if (idx >= m.events.length) {
      document.getElementById('match-end-btn').style.display = 'block';
      _scheduleNext = null;
      return;
    }

    const event = m.events[idx++];

    // Update minute and score
    if (event.minute != null && minuteEl) minuteEl.textContent = `${event.minute}'`;
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }

    // Fan delta
    showFanDelta(event.fanDelta || 0);

    // Render the event line
    const div = eventDiv(event);
    if (div) {
      log.appendChild(div);
      trimLog();
      log.scrollTop = log.scrollHeight;
    }

    // Schedule next using current speed setting
    const speed = PLAYBACK_SPEEDS[_playbackSpeed] || PLAYBACK_SPEEDS.medium;
    const delay = event.isHighlight ? speed.highlight : speed.normal;
    matchPlayback = setTimeout(scheduleNext, delay);
  }

  // Expose for pause/resume
  _scheduleNext = scheduleNext;

  matchPlayback = setTimeout(scheduleNext, 400);
}

function skipToEnd() {
  if (matchPlayback) { clearTimeout(matchPlayback); matchPlayback = null; }
  _scheduleNext = null;
  _playbackPaused = false;
  const m = gameState.currentMatch;
  const log      = document.getElementById('event-log');
  const scoreEl  = document.getElementById('match-score');
  const minuteEl = document.getElementById('match-minute');
  if (minuteEl) minuteEl.textContent = "90'";
  const fanVal  = document.getElementById('fan-count-value');
  const fanDeltas = document.getElementById('fan-deltas');
  log.innerHTML = '';
  if (fanDeltas) fanDeltas.innerHTML = '';

  let totalDelta = 0;
  for (const event of m.events) {
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }
    totalDelta += event.fanDelta || 0;
    if (!event.isHighlight) continue;
    const text = renderEventText(event);
    if (!text) continue;
    const div = document.createElement('div');
    div.className = `event-line highlight ${event.team || ''}`;
    const minLabel = (event.minute != null && event.type !== 'kickoff')
      ? `<span class="event-min">${event.minute}'</span>` : '';
    div.innerHTML = `${minLabel}<span class="event-text">${text}</span>`;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;

  // Update fan count to final value
  const finalFans = Math.max(50, gameState.fans + totalDelta);
  if (fanVal) fanVal.textContent = finalFans.toLocaleString();

  // Show net delta
  if (fanDeltas && totalDelta !== 0) {
    const badge = document.createElement('span');
    const sign = totalDelta >= 0 ? '+' : '';
    badge.className = 'fan-delta-float ' + (totalDelta >= 0 ? 'positive' : 'negative');
    badge.style.animation = 'none';
    badge.style.opacity = '1';
    badge.textContent = `Net: ${sign}${totalDelta.toLocaleString()}`;
    fanDeltas.appendChild(badge);
  }

  document.getElementById('match-end-btn').style.display = 'block';
}

function goToResults() {
  _resultsPage = 0;
  const m   = gameState.currentMatch;

  // --- Tally career stats from match events ---
  const careerDeltas = {};
  for (const e of m.events) {
    const pid = e.meta?.playerId;
    if (e.team === 'player' && pid) {
      if (!careerDeltas[pid]) careerDeltas[pid] = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
      if (e.type === 'goal' && e.outcome === 'player') careerDeltas[pid].goals++;
      if (e.type === 'tackle' && e.outcome === 'success') careerDeltas[pid].tackles++;
      if (e.type === 'pass' && e.outcome === 'success') careerDeltas[pid].passes++;
      if (e.type === 'shot' && e.outcome === 'miss') careerDeltas[pid].shotsMissed++;
    }
    if (e.team === 'opponent' && e.type === 'shot' && (e.outcome === 'saved' || e.outcome === 'greatSave')) {
      const gkId = e.meta?.savingPlayerId;
      if (gkId && gameState.players.some(p => p.id === gkId)) {
        if (!careerDeltas[gkId]) careerDeltas[gkId] = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
        careerDeltas[gkId].saves++;
      }
    }
  }

  // --- Check milestones ---
  const newMilestones = [];
  const updatedPlayers = gameState.players.map(p => {
    const deltas = careerDeltas[p.id];
    if (!deltas) return p;
    const newCareer = { ...(p.careerStats || { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 }) };
    const newBonuses = { ...(p.statBonuses || {}) };
    for (const [careerKey, count] of Object.entries(deltas)) {
      if (count <= 0) continue;
      const oldVal = newCareer[careerKey] || 0;
      const newVal = oldVal + count;
      newCareer[careerKey] = newVal;
      const mileDef = STAT_MILESTONES[careerKey];
      if (!mileDef) continue;
      for (let ti = 0; ti < mileDef.thresholds.length; ti++) {
        const threshold = mileDef.thresholds[ti];
        if (oldVal < threshold && newVal >= threshold) {
          const bonus = MILESTONE_BONUSES[ti] || 1;
          newBonuses[mileDef.stat] = (newBonuses[mileDef.stat] || 0) + bonus;
          newMilestones.push({
            playerId: p.id, playerName: p.name,
            careerStat: careerKey, statUpgrade: mileDef.stat,
            bonus, newTotal: newVal, threshold,
          });
        }
      }
    }
    return { ...p, careerStats: newCareer, statBonuses: newBonuses };
  });

  // --- Deduct energy from all players after match (with noise) ---
  for (const p of updatedPlayers) {
    p.energy = Math.max(0, (p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy) - noisyCost(ENERGY_CONFIG.matchCost));
  }

  const newFans = Math.max(50, gameState.fans + m.fanDelta);

  const matchHistory = [...gameState.matchHistory, {
    opponentId:    m.opponentId,
    playerScore:   m.playerScore,
    opponentScore: m.opponentScore,
    fanDelta:      m.fanDelta,
    packEarned:    m.packEarned,
  }];

  // --- League season updates (M7) ---
  const season = gameState.season ? { ...gameState.season } : null;
  let seasonEnded = false;
  let seasonResult = null; // 'promoted', 'relegated', 'mid', 'gameWin'

  if (season && season.matchday < season.schedule.length) {
    const matchdayIdx = season.matchday;
    const matchday = season.schedule[matchdayIdx];

    // Deep copy standings
    const standings = {};
    for (const [id, rec] of Object.entries(season.standings)) {
      standings[id] = { ...rec };
    }

    // Update standings with player match result
    updateStandings(standings, 'player', m.playerScore, m.opponentScore);
    updateStandings(standings, m.opponentId, m.opponentScore, m.playerScore);

    // Simulate all NPC-NPC games for this matchday
    const npcResults = [];
    for (const match of matchday.matches) {
      if (match.home === 'player' || match.away === 'player') continue;
      const homeTeam = findLeagueTeam(match.home);
      const awayTeam = findLeagueTeam(match.away);
      if (!homeTeam || !awayTeam) continue;
      const result = simulateNPCMatchFull(homeTeam, awayTeam, season.league);
      updateStandings(standings, match.home, result.homeScore, result.awayScore);
      updateStandings(standings, match.away, result.awayScore, result.homeScore);
      npcResults.push({ home: match.home, away: match.away, homeScore: result.homeScore, awayScore: result.awayScore });
    }
    // Add player result to results display
    npcResults.unshift({ home: 'player', away: m.opponentId, homeScore: m.playerScore, awayScore: m.opponentScore });

    // Deduct energy from all NPC teams that played + run NPC training
    const leagueNPCTeams = gameState.leagueTeams[season.league] || [];
    const playedTeamIds = new Set();
    for (const match of matchday.matches) {
      if (match.home !== 'player') playedTeamIds.add(match.home);
      if (match.away !== 'player') playedTeamIds.add(match.away);
    }
    // Also add the opponent the player faced
    playedTeamIds.add(m.opponentId);
    for (const npcTeam of leagueNPCTeams) {
      if (playedTeamIds.has(npcTeam.id)) {
        for (const p of npcTeam.players) {
          p.energy = Math.max(0, (p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy) - noisyCost(ENERGY_CONFIG.matchCost));
        }
      }
      applyNPCTraining(npcTeam);
    }

    // Update season state
    const newSchedule = season.schedule.map((md, i) =>
      i === matchdayIdx ? { ...md, completed: true } : md
    );
    season.schedule = newSchedule;
    season.standings = standings;
    season.lastResults = npcResults;
    season.matchday = matchdayIdx + 1;

    // Check if season is over
    if (season.matchday >= season.schedule.length) {
      seasonEnded = true;
      const sorted = sortStandings(standings);
      const playerRank = sorted.findIndex(([id]) => id === 'player') + 1;
      if (playerRank === 1 && season.league === 'international') {
        seasonResult = 'gameWin';
      } else if (playerRank === 1) {
        seasonResult = 'promoted';
      } else if (playerRank === sorted.length) {
        seasonResult = 'relegated';
      } else {
        seasonResult = 'mid';
      }
    }
  }

  // Determine next screen
  let nextScreen = 'results';
  if (seasonResult === 'relegated') {
    nextScreen = 'gameover';
  }

  const pendingPacks = m.packEarned
    ? [{ packId: m.packEarned, opponentId: m.opponentId }]
    : [];

  updateState({
    screen: nextScreen,
    fans: newFans,
    matchesPlayed: gameState.matchesPlayed + 1,
    matchHistory,
    pendingPacks,
    players: updatedPlayers,
    season,
    currentMatch: { ...m, milestones: newMilestones, seasonResult, showTraining: !seasonEnded },
  });
}
