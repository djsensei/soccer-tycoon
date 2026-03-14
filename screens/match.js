// ============================================================
// screens/match.js — Live match screen (playback and skip)
// ============================================================

function renderMatchScreen() {
  const m = gameState.currentMatch;
  return `
    <div class="screen match-screen">
      <div class="match-header">
        <div class="match-team">${gameState.teamName}</div>
        <div class="match-score" id="match-score">0 – 0</div>
        <div class="match-team">${m.opponentName}</div>
      </div>
      <div class="fan-ticker" id="fan-ticker">
        Fans: <span id="fan-ticker-count">${gameState.fans.toLocaleString()}</span>
        <span id="fan-ticker-delta"></span>
      </div>
      <div class="match-controls">
        <label class="toggle-label">
          <input type="checkbox" id="highlights-toggle" checked>
          Highlights only
        </label>
        <button class="btn-small" onclick="skipToEnd()">Skip</button>
      </div>
      <div class="event-log" id="event-log"></div>
      <div id="match-end-btn" style="display:none">
        <button class="btn-primary btn-large" onclick="goToResults()">See Results</button>
      </div>
    </div>
  `;
}

function startMatchPlayback() {
  const m = gameState.currentMatch;
  if (!m || !m.events) return;

  let idx = 0;
  let runningFanDelta = 0;
  const processedEvents = [];
  const log     = document.getElementById('event-log');
  const scoreEl = document.getElementById('match-score');
  const toggle  = document.getElementById('highlights-toggle');

  function updateFanTicker(delta) {
    const deltaEl = document.getElementById('fan-ticker-delta');
    if (!deltaEl) return;
    if (runningFanDelta === 0) {
      deltaEl.textContent = '';
      deltaEl.className = '';
    } else {
      const sign = runningFanDelta >= 0 ? '+' : '';
      deltaEl.textContent = `(${sign}${runningFanDelta.toLocaleString()})`;
      deltaEl.className = runningFanDelta >= 0 ? 'ticker-positive' : 'ticker-negative';
    }
    if (Math.abs(delta) > 50) {
      const ticker = document.getElementById('fan-ticker');
      if (ticker) {
        ticker.classList.add('fan-flash');
        setTimeout(() => ticker?.classList.remove('fan-flash'), 800);
      }
    }
  }

  function eventDiv(event) {
    const text = renderEventText(event);
    if (!text) return null;
    const div = document.createElement('div');
    div.className = `event-line ${event.isHighlight ? 'highlight' : ''} ${event.team || ''}`;
    const minLabel = (event.minute != null && event.type !== 'kickoff')
      ? `<span class="event-min">${event.minute}'</span> ` : '';
    div.innerHTML = `${minLabel}${text}`;
    return div;
  }

  function rebuildLog() {
    log.innerHTML = '';
    const highlightsOnly = toggle?.checked;
    for (const event of processedEvents) {
      if (highlightsOnly && !event.isHighlight) continue;
      const div = eventDiv(event);
      if (div) log.appendChild(div);
    }
    log.scrollTop = log.scrollHeight;
  }

  toggle?.addEventListener('change', rebuildLog);

  function showNext() {
    if (idx >= m.events.length) {
      document.getElementById('match-end-btn').style.display = 'block';
      if (matchPlayback) clearInterval(matchPlayback);
      return;
    }

    const event = m.events[idx++];
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }

    const delta = event.fanDelta || 0;
    runningFanDelta += delta;
    updateFanTicker(delta);

    processedEvents.push(event);

    if (toggle?.checked && !event.isHighlight) return;

    const div = eventDiv(event);
    if (!div) return;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  matchPlayback = setInterval(showNext, 600);
}

function skipToEnd() {
  if (matchPlayback) { clearInterval(matchPlayback); matchPlayback = null; }
  const m = gameState.currentMatch;
  const log     = document.getElementById('event-log');
  const scoreEl = document.getElementById('match-score');
  log.innerHTML = '';

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
      ? `<span class="event-min">${event.minute}'</span> ` : '';
    div.innerHTML = `${minLabel}${text}`;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;

  const deltaEl = document.getElementById('fan-ticker-delta');
  if (deltaEl && totalDelta !== 0) {
    const sign = totalDelta >= 0 ? '+' : '';
    deltaEl.textContent = `(${sign}${totalDelta.toLocaleString()})`;
    deltaEl.className = totalDelta >= 0 ? 'ticker-positive' : 'ticker-negative';
  }

  document.getElementById('match-end-btn').style.display = 'block';
}

function goToResults() {
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
      const result = simulateNPCMatch(homeTeam, awayTeam);
      updateStandings(standings, match.home, result.homeScore, result.awayScore);
      updateStandings(standings, match.away, result.awayScore, result.homeScore);
      npcResults.push({ home: match.home, away: match.away, homeScore: result.homeScore, awayScore: result.awayScore });
    }
    // Add player result to results display
    npcResults.unshift({ home: 'player', away: m.opponentId, homeScore: m.playerScore, awayScore: m.opponentScore });

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
    currentMatch: { ...m, milestones: newMilestones, seasonResult },
  });
}
