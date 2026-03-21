// ============================================================
// screens/results.js — Post-match results (newspaper flip-through)
// ============================================================

let _resultsPage = 0;
const _RESULTS_TOTAL_PAGES = 4;

function resultsNextPage() {
  if (_resultsPage < _RESULTS_TOTAL_PAGES - 1) {
    _resultsPage++;
    render();
  }
}

function resultsPrevPage() {
  if (_resultsPage > 0) {
    _resultsPage--;
    render();
  }
}

// ---- Stat helpers (unchanged) ----

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

// ---- Page builders ----

function _resultsPageNav(m) {
  const dots = Array.from({ length: _RESULTS_TOTAL_PAGES }, (_, i) =>
    `<div class="results-dot ${i === _resultsPage ? 'active' : ''}"></div>`
  ).join('');

  const isFirst = _resultsPage === 0;
  const isLast = _resultsPage === _RESULTS_TOTAL_PAGES - 1;

  let rightBtn;
  if (isLast) {
    rightBtn = _resultsDestinationButton(m);
  } else {
    rightBtn = `<button class="btn-primary" onclick="resultsNextPage()">Turn Page &gt;</button>`;
  }

  return `
    <div class="results-page-nav">
      ${isFirst ? '<div class="results-page-nav-spacer"></div>' : `<button class="btn-secondary" onclick="resultsPrevPage()">&lt; Back</button>`}
      <div class="results-page-dots">${dots}</div>
      ${rightBtn}
    </div>`;
}

function _resultsDestinationButton(m) {
  if (m.packEarned) {
    return `<button class="btn-primary" onclick="openNextPack()">Open Pack!</button>`;
  } else if (m.seasonResult === 'promoted' || m.seasonResult === 'gameWin') {
    return `<button class="btn-primary" onclick="updateState({screen:'table'})">View Table</button>`;
  } else if (m.showTraining) {
    return `<button class="btn-primary" onclick="initTrainingChoices(); updateState({screen:'training'})">Training!</button>`;
  } else {
    return `<button class="btn-primary" onclick="updateState({screen:'table'})">Continue</button>`;
  }
}

function _renderResultsPage1(m) {
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

  return `
    <div class="newspaper results-newspaper">
      <div class="newspaper-header">THE DAILY BOOT</div>
      <div class="newspaper-headline">${headline}</div>
      <div class="newspaper-scoreline">
        <span class="np-team">${gameState.teamName}</span>
        <span class="np-score">${m.playerScore} – ${m.opponentScore}</span>
        <span class="np-team">${m.opponentName}</span>
      </div>
      <div class="newspaper-subhead">${flavor}</div>
    </div>`;
}

function _renderResultsPage2(m, stats) {
  function statRow(pVal, label, oVal) {
    return `<div class="np-stat-row">
      <span class="np-stat-val np-left">${pVal}</span>
      <span class="np-stat-label">${label}</span>
      <span class="np-stat-val np-right">${oVal}</span>
    </div>`;
  }

  return `
    <div class="newspaper results-newspaper">
      <div class="newspaper-header">THE DAILY BOOT — MATCH REPORT</div>
      <div class="np-stats-header">
        <span>${gameState.teamName}</span>
        <span></span>
        <span>${m.opponentName}</span>
      </div>
      ${statRow(stats.playerPoss + '%', 'Possession', stats.oppPoss + '%')}
      ${statRow(stats.playerShots, 'Shots', stats.oppShots)}
      ${statRow(stats.playerOnTarget, 'On Target', stats.oppOnTarget)}
      ${statRow(stats.shootPct + '%', 'Shot Accuracy', stats.oppShootPct + '%')}
      ${statRow(stats.passPct + '%', 'Pass Completion', stats.oppPassPct + '%')}
      ${statRow(stats.playerTackles, 'Tackles Won', stats.oppTackles)}
      ${statRow(stats.playerSaves, 'Saves', stats.oppSaves)}
    </div>`;
}

function _renderResultsPage3(m, stats) {
  const playerLines = gameState.players.map(p => {
    const pp = stats.perPlayer[p.id];
    if (!pp) return '';
    const parts = [];
    if (pp.goals) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.shooting}">${pp.goals} goal${pp.goals !== 1 ? 's' : ''}</span>`);
    if (pp.passes) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.passing}">${pp.passSuccess}/${pp.passes} passes</span>`);
    if (pp.tackles) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.strength}">${pp.tackles} tackle${pp.tackles !== 1 ? 's' : ''}</span>`);
    if (pp.saves) parts.push(`<span class="psl-chip" style="color:${STAT_COLORS.reflexes}">${pp.saves} save${pp.saves !== 1 ? 's' : ''}</span>`);
    if (!parts.length) return '';
    return `<div class="np-player-line"><span class="np-player-name">${p.name}</span><span class="np-player-stats">${parts.join('<span class="psl-sep">|</span>')}</span></div>`;
  }).filter(Boolean).join('');

  const milestones = m.milestones || [];
  const milestoneHtml = milestones.length ? `
    <div class="np-section-divider"></div>
    <div class="np-section-title">Player Upgrades!</div>
    ${milestones.map((ms, i) => {
      const color = STAT_COLORS[ms.statUpgrade] || 'var(--accent)';
      return `
      <div class="np-milestone">
        <span class="np-milestone-beam" style="background:${color}"></span>
        <span class="np-milestone-name">${ms.playerName}</span>
        <span class="np-milestone-detail">${ms.threshold} career ${ms.careerStat} &rarr; <strong style="color:${color}">+${ms.bonus || 1} ${ms.statUpgrade}</strong></span>
      </div>`;
    }).join('')}` : '';

  const recs = m.seasonResult ? [] : generateTrainingRecommendations(stats, gameState.players);
  const recsHtml = recs.length ? `
    <div class="np-section-divider"></div>
    <div class="np-section-title">Training Tips</div>
    ${recs.map(r => `<div class="np-tip">${r}</div>`).join('')}` : '';

  return `
    <div class="newspaper results-newspaper">
      <div class="newspaper-header">THE DAILY BOOT — PLAYER WATCH</div>
      ${playerLines ? `<div class="np-section-title">Performance</div>${playerLines}` : '<div class="np-section-title">No standout performances today.</div>'}
      ${milestoneHtml}
      ${recsHtml}
    </div>`;
}

function _renderResultsPage4(m) {
  const deltaSign  = m.fanDelta >= 0 ? '+' : '';
  const deltaClass = m.fanDelta >= 0 ? 'np-fan-gain' : 'np-fan-loss';

  let packHtml = '';
  if (m.packEarned) {
    packHtml = `<div class="np-pack-earned">Pack Earned: <strong>${PACK_TYPES[m.packEarned]?.name}</strong></div>`;
  }

  let seasonHtml = '';
  if (m.seasonResult === 'promoted') {
    const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(gameState.currentLeague) + 1];
    const nextName = nextLeague ? LEAGUE_DEFINITIONS[nextLeague]?.name : 'the next league';
    seasonHtml = `
      <div class="np-section-divider"></div>
      <div class="np-promo-banner">PROMOTED!</div>
      <div class="np-promo-league">Next stop: ${nextName}</div>
      <div class="promo-celebration">
        <div class="confetti-container">${Array.from({length: 30}, (_, i) =>
          `<div class="confetti-piece" style="--i:${i};--x:${Math.random()*100}vw;--r:${Math.random()*360}deg;--d:${1.5+Math.random()*2}s;--c:${['var(--accent)','var(--gold)','#42b4e8','#9c27b0','#e05555'][i%5]}"></div>`
        ).join('')}</div>
      </div>`;
  } else if (m.seasonResult === 'gameWin') {
    seasonHtml = `
      <div class="np-section-divider"></div>
      <div class="np-promo-banner" style="color:var(--gold)">WORLD CHAMPIONS!</div>`;
  } else if (m.seasonResult === 'mid') {
    seasonHtml = `
      <div class="np-section-divider"></div>
      <div class="np-season-mid">Season over. Same league next season.</div>`;
  }

  // Extra nav row (Gear Up shortcut) when training is the main action
  let extraNav = '';
  if (!m.packEarned && m.showTraining) {
    extraNav = `<div class="np-extra-nav"><button class="btn-secondary btn-small" onclick="updateState({screen:'managegear'})">Gear Up</button></div>`;
  }

  return `
    <div class="newspaper results-newspaper">
      <div class="newspaper-header">THE DAILY BOOT — FANS &amp; REWARDS</div>
      <div class="np-fan-delta ${deltaClass}">${deltaSign}${m.fanDelta.toLocaleString()} fans</div>
      <div class="np-fans-total">Total: ${gameState.fans.toLocaleString()} fans</div>
      ${packHtml}
      ${seasonHtml}
      ${extraNav}
    </div>`;
}

// ---- Main render ----

function renderResults() {
  const m = gameState.currentMatch;
  const stats = computeMatchStats(m.events || []);

  const pages = [
    _renderResultsPage1(m),
    _renderResultsPage2(m, stats),
    _renderResultsPage3(m, stats),
    _renderResultsPage4(m),
  ];

  return `
    <div class="screen results-screen">
      ${pages[_resultsPage]}
      ${_resultsPageNav(m)}
      ${buildHelpButton('results')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}
