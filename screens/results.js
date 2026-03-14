// ============================================================
// screens/results.js — Post-match results screen
// ============================================================

function computeMatchStats(events) {
  let playerShots = 0, playerOnTarget = 0;
  let oppShots    = 0, oppOnTarget    = 0;
  let playerTicks = 0, oppTicks       = 0;

  for (const e of events) {
    if (!e.team) continue;
    const mine = e.team === 'player';
    if (mine) playerTicks++; else oppTicks++;

    if (e.type === 'goal') {
      if (mine) { playerShots++; playerOnTarget++; }
      else      { oppShots++;    oppOnTarget++;    }
    }
    if (e.type === 'shot') {
      if (mine) {
        playerShots++;
        if (e.outcome === 'saved' || e.outcome === 'greatSave') playerOnTarget++;
      } else {
        oppShots++;
        if (e.outcome === 'saved' || e.outcome === 'greatSave') oppOnTarget++;
      }
    }
  }

  const total = playerTicks + oppTicks || 1;
  return {
    playerShots, playerOnTarget,
    oppShots,    oppOnTarget,
    playerPoss: Math.round(100 * playerTicks / total),
    oppPoss:    Math.round(100 * oppTicks    / total),
  };
}

function renderResults() {
  const m = gameState.currentMatch;

  const deltaSign  = m.fanDelta >= 0 ? '+' : '';
  const deltaClass = m.fanDelta >= 0 ? 'fan-gain' : 'fan-loss';

  const stats = computeMatchStats(m.events || []);

  // Newspaper headline + flavor
  const outcome = m.outcome || 'tie';
  const headlineTemplates = RESULT_HEADLINES[outcome] || RESULT_HEADLINES.tie;
  const flavorTemplates   = RESULT_FLAVOR[outcome]   || RESULT_FLAVOR.tie;
  const fillTemplate = (t) => t
    .replace(/\{team\}/g, gameState.teamName)
    .replace(/\{opponent\}/g, m.opponentName)
    .replace(/\{manager\}/g, gameState.managerName || 'Coach')
    .replace(/\{score\}/g, `${m.playerScore}–${m.opponentScore}`);

  const headline = fillTemplate(pick(headlineTemplates));
  const flavor   = fillTemplate(pick(flavorTemplates));

  const newspaperHtml = `
    <div class="newspaper results-newspaper">
      <div class="newspaper-header">THE DAILY BOOT</div>
      <div class="newspaper-headline">${headline}</div>
      <div class="newspaper-subhead">${flavor}</div>
      <div class="newspaper-stats">
        <span>${gameState.teamName} ${m.playerScore} – ${m.opponentScore} ${m.opponentName}</span>
      </div>
    </div>`;

  function statRow(pVal, label, oVal) {
    return `<div class="stats-row">
      <span class="stats-val player">${pVal}</span>
      <span class="stats-label">${label}</span>
      <span class="stats-val opponent">${oVal}</span>
    </div>`;
  }

  const statsHtml = `
    <div class="match-stats">
      <div class="stats-header">
        <span>${gameState.teamName}</span>
        <span></span>
        <span>${m.opponentName}</span>
      </div>
      ${statRow(stats.playerShots,    'Shots',        stats.oppShots)}
      ${statRow(stats.playerOnTarget, 'On Target',    stats.oppOnTarget)}
      ${statRow(stats.playerPoss+'%', 'Possession',   stats.oppPoss+'%')}
    </div>`;

  const milestones = m.milestones || [];
  const milestoneHtml = milestones.length ? `
    <div class="milestone-section">
      <h2>Player Upgrades!</h2>
      ${milestones.map(ms => `
        <div class="milestone-card">
          <div class="milestone-player">${ms.playerName}</div>
          <div class="milestone-detail">
            ${ms.threshold} career ${ms.careerStat} -> <strong>+${ms.bonus || 1} ${ms.statUpgrade}</strong>
          </div>
        </div>
      `).join('')}
    </div>` : '';

  // Season status message
  let seasonMsg = '';
  if (m.seasonResult === 'promoted') {
    const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(gameState.currentLeague) + 1];
    const nextName = nextLeague ? LEAGUE_DEFINITIONS[nextLeague]?.name : 'the next league';
    seasonMsg = `<div class="season-msg season-promo">PROMOTED! Moving up to ${nextName}!</div>`;
  } else if (m.seasonResult === 'gameWin') {
    seasonMsg = `<div class="season-msg season-win">YOU WON THE WORLD LEAGUE! CHAMPION!</div>`;
  } else if (m.seasonResult === 'mid') {
    seasonMsg = `<div class="season-msg">Season over. Same league next season.</div>`;
  }

  // Navigation buttons
  let navHtml = '';
  if (m.packEarned) {
    navHtml = `
      <div class="pack-earned">
        You earned a <strong>${PACK_TYPES[m.packEarned]?.name}</strong>!
      </div>
      <button class="btn-primary btn-large" onclick="openNextPack()">Open Pack!</button>`;
  } else if (m.seasonResult === 'promoted' || m.seasonResult === 'gameWin') {
    navHtml = `<button class="btn-primary btn-large" onclick="updateState({screen:'table'})">View Table</button>`;
  } else {
    navHtml = `
      <div class="results-nav">
        <button class="btn-primary" onclick="updateState({screen:'table'})">View Table</button>
        <button class="btn-secondary" onclick="updateState({screen:'managegear'})">Gear Up</button>
      </div>`;
  }

  const fanHtml = `
    <div class="fan-delta ${deltaClass}">${deltaSign}${m.fanDelta.toLocaleString()} fans</div>
    <div class="fans-total">Total: ${gameState.fans.toLocaleString()} fans</div>`;

  return `
    <div class="screen results-screen">
      <div class="results-columns">
        <div class="results-col-left">
          ${newspaperHtml}
          ${statsHtml}
        </div>
        <div class="results-col-right">
          ${fanHtml}
          ${milestoneHtml}
          ${seasonMsg}
          ${navHtml}
        </div>
      </div>
    </div>
  `;
}
