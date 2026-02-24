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
  const processedEvents = [];
  const log     = document.getElementById('event-log');
  const scoreEl = document.getElementById('match-score');
  const toggle  = document.getElementById('highlights-toggle');

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

  for (const event of m.events) {
    if (event.meta?.playerScore !== undefined) {
      scoreEl.textContent = `${event.meta.playerScore} – ${event.meta.opponentScore}`;
    }
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

  updateState({
    screen: nextScreen,
    fans: newFans,
    matchesPlayed: gameState.matchesPlayed + 1,
    matchHistory,
    opponentTeams,
    matchesUntilSpecialCheck,
    pendingPacks: m.packEarned ? [m.packEarned] : [],
  });
}
