// ============================================================
// screens/results.js — Post-match results screen
// ============================================================

function computeMatchStats(events) {
  let playerShots = 0, playerOnTarget = 0;
  let oppShots    = 0, oppOnTarget    = 0;
  let playerTicks = 0, oppTicks       = 0;
  let playerPasses = 0, playerPassSuccess = 0;
  let oppPasses    = 0, oppPassSuccess    = 0;
  let playerTackles = 0, oppTackles = 0;
  let playerSaves   = 0, oppSaves   = 0;

  // Per-player stat tracking (player team only)
  const perPlayer = {};

  for (const e of events) {
    if (!e.team) continue;
    const mine = e.team === 'player';
    if (mine) playerTicks++; else oppTicks++;

    // Track per-player stats for player's team
    if (mine && e.meta?.playerId) {
      const pid = e.meta.playerId;
      if (!perPlayer[pid]) perPlayer[pid] = { goals: 0, shots: 0, shotsOnTarget: 0, passes: 0, passSuccess: 0, tackles: 0, saves: 0 };
    }

    if (e.type === 'goal') {
      if (mine) {
        playerShots++; playerOnTarget++;
        if (e.meta?.playerId && perPlayer[e.meta.playerId]) {
          perPlayer[e.meta.playerId].goals++;
          perPlayer[e.meta.playerId].shots++;
          perPlayer[e.meta.playerId].shotsOnTarget++;
        }
      } else {
        oppShots++; oppOnTarget++;
      }
    }
    if (e.type === 'shot') {
      const onTarget = e.outcome === 'saved' || e.outcome === 'greatSave';
      if (mine) {
        playerShots++;
        if (onTarget) playerOnTarget++;
        if (e.meta?.playerId && perPlayer[e.meta.playerId]) {
          perPlayer[e.meta.playerId].shots++;
          if (onTarget) perPlayer[e.meta.playerId].shotsOnTarget++;
        }
      } else {
        oppShots++;
        if (onTarget) oppOnTarget++;
        // Track player team saves
        if ((e.outcome === 'saved' || e.outcome === 'greatSave') && e.meta?.savingPlayerId) {
          playerSaves++;
          if (!perPlayer[e.meta.savingPlayerId]) perPlayer[e.meta.savingPlayerId] = { goals: 0, shots: 0, shotsOnTarget: 0, passes: 0, passSuccess: 0, tackles: 0, saves: 0 };
          perPlayer[e.meta.savingPlayerId].saves++;
        }
      }
    }
    if (e.type === 'pass') {
      if (mine) {
        playerPasses++;
        if (e.outcome === 'success') playerPassSuccess++;
        if (e.meta?.playerId && perPlayer[e.meta.playerId]) {
          perPlayer[e.meta.playerId].passes++;
          if (e.outcome === 'success') perPlayer[e.meta.playerId].passSuccess++;
        }
      } else {
        oppPasses++;
        if (e.outcome === 'success') oppPassSuccess++;
      }
    }
    if (e.type === 'tackle' && e.outcome === 'success') {
      if (mine) {
        playerTackles++;
        if (e.meta?.playerId && perPlayer[e.meta.playerId]) {
          perPlayer[e.meta.playerId].tackles++;
        }
      } else {
        oppTackles++;
      }
    }
    // Opponent shots saved by player GK
    if (!mine && e.type === 'shot' && (e.outcome === 'saved' || e.outcome === 'greatSave')) {
      oppSaves++; // opponent's keeper made a save when player shot
    }
  }

  const total = playerTicks + oppTicks || 1;
  const shootPct = playerShots ? Math.round(100 * playerOnTarget / playerShots) : 0;
  const oppShootPct = oppShots ? Math.round(100 * oppOnTarget / oppShots) : 0;
  const passPct = playerPasses ? Math.round(100 * playerPassSuccess / playerPasses) : 0;
  const oppPassPct = oppPasses ? Math.round(100 * oppPassSuccess / oppPasses) : 0;

  return {
    playerShots, playerOnTarget, shootPct,
    oppShots, oppOnTarget, oppShootPct,
    playerPasses, playerPassSuccess, passPct,
    oppPasses, oppPassSuccess, oppPassPct,
    playerTackles, oppTackles,
    playerSaves, oppSaves,
    playerPoss: Math.round(100 * playerTicks / total),
    oppPoss:    Math.round(100 * oppTicks    / total),
    perPlayer,
  };
}

function generateTrainingRecommendations(stats, players) {
  const recs = [];
  // Fatigue warnings first
  const fatigued = players.filter(p => (p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy) < ENERGY_CONFIG.fatigueThreshold);
  if (fatigued.length > 0) {
    const names = fatigued.map(p => p.name).join(', ');
    recs.push(`${names} ${fatigued.length === 1 ? 'is' : 'are'} exhausted — consider resting!`);
  }
  // Check per-player performance
  for (const p of players) {
    const pp = stats.perPlayer[p.id];
    if (!pp) continue;
    if (pp.shots >= 3 && pp.goals === 0) {
      recs.push(`${p.name} took ${pp.shots} shots but didn't score — train Shooting`);
    }
    if (pp.passes >= 5 && pp.passSuccess / pp.passes < 0.5) {
      recs.push(`${p.name} lost too many passes — train Passing`);
    }
  }
  // Team-level
  if (stats.playerTackles < 2 && stats.oppShots >= 5) {
    recs.push(`Defense looked shaky — consider training Strength`);
  }
  if (stats.playerSaves >= 4) {
    recs.push(`Your keeper was busy! Keep training Reflexes`);
  }
  return recs.slice(0, 4); // max 4 recommendations
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
      ${statRow(stats.playerShots,    'Shots',           stats.oppShots)}
      ${statRow(stats.playerOnTarget, 'On Target',       stats.oppOnTarget)}
      ${statRow(stats.shootPct+'%',   'Shot Accuracy',   stats.oppShootPct+'%')}
      ${statRow(stats.passPct+'%',    'Pass Completion', stats.oppPassPct+'%')}
      ${statRow(stats.playerTackles,  'Tackles Won',     stats.oppTackles)}
      ${statRow(stats.playerSaves,    'Saves',           stats.oppSaves)}
      ${statRow(stats.playerPoss+'%', 'Possession',      stats.oppPoss+'%')}
    </div>`;

  // Per-player stat lines with spelled-out labels and color coding
  const playerLines = gameState.players.map(p => {
    const pp = stats.perPlayer[p.id];
    if (!pp) return '';
    const parts = [];
    if (pp.goals) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.shooting}">${pp.goals} goal${pp.goals !== 1 ? 's' : ''}</span>`);
    if (pp.passes) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.passing}">${pp.passSuccess}/${pp.passes} passes</span>`);
    if (pp.tackles) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.strength}">${pp.tackles} tackle${pp.tackles !== 1 ? 's' : ''}</span>`);
    if (pp.saves) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.reflexes}">${pp.saves} save${pp.saves !== 1 ? 's' : ''}</span>`);
    if (!parts.length) return '';
    return `<div class="player-stat-line"><span class="psl-name">${p.name}</span><span class="psl-stats">${parts.join('<span class="psl-sep">|</span>')}</span></div>`;
  }).filter(Boolean).join('');

  const perPlayerHtml = playerLines ? `<div class="results-per-player"><h3>Player Performance</h3>${playerLines}</div>` : '';

  // Training recommendations (skip if season just ended — no training coming)
  const recs = m.seasonResult ? [] : generateTrainingRecommendations(stats, gameState.players);
  const recsHtml = recs.length ? `<div class="training-recs"><h3>Training Tips</h3>${recs.map(r => `<div class="training-rec-item">${r}</div>`).join('')}</div>` : '';

  const milestones = m.milestones || [];
  const milestoneHtml = milestones.length ? `
    <div class="milestone-section">
      <h2>Player Upgrades!</h2>
      ${milestones.map((ms, i) => {
        const color = STAT_COLORS[ms.statUpgrade] || 'var(--accent)';
        return `
        <div class="milestone-card" style="animation-delay:${i * 0.25}s">
          <div class="milestone-beam" style="--beam-color:${color}"></div>
          <div class="milestone-player">${ms.playerName}</div>
          <div class="milestone-detail">
            ${ms.threshold} career ${ms.careerStat} -> <strong style="color:${color}">+${ms.bonus || 1} ${ms.statUpgrade}</strong>
          </div>
        </div>`;
      }).join('')}
    </div>` : '';

  // Season status message
  let seasonMsg = '';
  if (m.seasonResult === 'promoted') {
    const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(gameState.currentLeague) + 1];
    const nextName = nextLeague ? LEAGUE_DEFINITIONS[nextLeague]?.name : 'the next league';
    seasonMsg = `
      <div class="promo-celebration">
        <div class="confetti-container">${Array.from({length: 30}, (_, i) =>
          `<div class="confetti-piece" style="--i:${i};--x:${Math.random()*100}vw;--r:${Math.random()*360}deg;--d:${1.5+Math.random()*2}s;--c:${['var(--accent)','var(--gold)','#42b4e8','#9c27b0','#e05555'][i%5]}"></div>`
        ).join('')}</div>
        <div class="promo-banner">
          <div class="promo-label">PROMOTED!</div>
          <div class="promo-league">${nextName}</div>
        </div>
      </div>`;
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
  } else if (m.showTraining) {
    navHtml = `
      <div class="results-nav">
        <button class="btn-primary btn-large" onclick="initTrainingChoices(); updateState({screen:'training'})">Training Time!</button>
        <button class="btn-secondary" onclick="updateState({screen:'managegear'})">Gear Up</button>
      </div>`;
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

  const scoreHtml = `
    <div class="results-scoreline">
      <span class="results-team-name">${gameState.teamName}</span>
      <span class="results-score">${m.playerScore} – ${m.opponentScore}</span>
      <span class="results-team-name">${m.opponentName}</span>
    </div>`;

  return `
    <div class="screen results-screen">
      ${scoreHtml}
      ${fanHtml}
      ${navHtml}
      <div class="results-columns">
        <div class="results-col-left">
          ${newspaperHtml}
          ${milestoneHtml}
          ${seasonMsg}
        </div>
        <div class="results-col-right">
          ${statsHtml}
          ${perPlayerHtml}
          ${recsHtml}
        </div>
      </div>
      ${buildHelpButton('results')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}
