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
        👥 <span id="fan-ticker-count">${gameState.fans.toLocaleString()}</span>
        <span id="fan-ticker-delta"></span>
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
    // Flash ticker for large single-event swings
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

    // Update fan ticker
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

  // Update ticker to show final total
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
  const opp = getOpponent(m.opponentId);

  const newFans = Math.max(0, gameState.fans + m.fanDelta);

  const matchHistory = [...gameState.matchHistory, {
    opponentId:    m.opponentId,
    playerScore:   m.playerScore,
    opponentScore: m.opponentScore,
    fanDelta:      m.fanDelta,
    packEarned:    m.packEarned,
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

  const nextScreen = newFans < 100 ? 'gameover' : 'results';

  // Phase 4: store opponentId with pack so openPack() can inject unique card
  const pendingPacks = m.packEarned
    ? [{ packId: m.packEarned, opponentId: m.opponentId }]
    : [];

  updateState({
    screen: nextScreen,
    fans: newFans,
    matchesPlayed: gameState.matchesPlayed + 1,
    matchHistory,
    opponentTeams,
    matchesUntilSpecialCheck,
    pendingPacks,
  });
}
