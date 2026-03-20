// ============================================================
// screens/table.js — League standings & matchday screen (M7)
// ============================================================

function renderTable() {
  const season = gameState.season;
  if (!season) return '<div class="screen"><p>No season data.</p></div>';

  const leagueDef = LEAGUE_DEFINITIONS[season.league];
  const totalMatchdays = season.schedule.length;
  const currentMD = season.matchday;
  const seasonOver = currentMD >= totalMatchdays;

  // Sort standings
  const sorted = sortStandings(season.standings);
  const playerRank = sorted.findIndex(([id]) => id === 'player') + 1;

  // Standings table
  const rows = sorted.map(([teamId, rec], i) => {
    const rank = i + 1;
    const gd = rec.gf - rec.ga;
    const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
    const name = getTeamName(teamId);
    const isPlayer = teamId === 'player';
    const isFirst = rank === 1;
    const isLast = rank === sorted.length;
    let rowClass = isPlayer ? 'tbl-player' : '';
    if (currentMD > 0 && isFirst) rowClass += ' tbl-promo';
    if (currentMD > 0 && isLast) rowClass += ' tbl-danger';
    return `<tr class="${rowClass}">
      <td>${rank}</td>
      <td class="tbl-team-name">${name}${isPlayer ? ' (You)' : ''}</td>
      <td>${rec.w}</td><td>${rec.d}</td><td>${rec.l}</td>
      <td>${gdStr}</td><td><strong>${rec.pts}</strong></td>
    </tr>`;
  }).join('');

  const tableHtml = `
    <div class="league-table-wrap">
      <table class="league-table">
        <thead><tr><th>#</th><th>Team</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  // Latest NPC results
  const lastResults = season.lastResults || [];
  const resultsHtml = lastResults.length ? `
    <div class="npc-results">
      <h3>Latest Results</h3>
      ${lastResults.map(r => `<div class="npc-result-row">${getTeamName(r.home)} ${r.homeScore} - ${r.awayScore} ${getTeamName(r.away)}</div>`).join('')}
    </div>` : '';

  // Next fixture or season-end message
  let actionHtml = '';
  if (seasonOver) {
    const finalRank = playerRank;
    if (finalRank === 1 && season.league === 'international') {
      actionHtml = `
        <div class="season-end-msg season-win">You finished 1st and WON THE WORLD LEAGUE!</div>
        <button class="btn-primary btn-large" onclick="handleSeasonEnd()">Celebrate!</button>`;
    } else if (finalRank === 1) {
      const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(season.league) + 1];
      const nextName = LEAGUE_DEFINITIONS[nextLeague]?.name || nextLeague;
      actionHtml = `
        <div class="season-end-msg season-promo">PROMOTED! You're moving up to the ${nextName}!</div>
        <button class="btn-primary btn-large" onclick="handleSeasonEnd()">Onward!</button>`;
    } else if (finalRank === sorted.length) {
      actionHtml = `
        <div class="season-end-msg season-relegated">Last place... you've been relegated.</div>
        <button class="btn-primary btn-large" onclick="handleSeasonEnd()">Face the Music</button>`;
    } else {
      actionHtml = `
        <div class="season-end-msg">Season over! You finished ${ordinal(finalRank)}. Same league, new season.</div>
        <button class="btn-primary btn-large" onclick="handleSeasonEnd()">Next Season</button>`;
    }
  } else {
    // Find player's next match
    const matchday = season.schedule[currentMD];
    const playerMatch = matchday.matches.find(m => m.home === 'player' || m.away === 'player');
    if (playerMatch) {
      const oppId = playerMatch.home === 'player' ? playerMatch.away : playerMatch.home;
      const oppTeam = findLeagueTeam(oppId);
      const oppName = oppTeam ? oppTeam.name : oppId;
      const oppDiff = oppTeam ? oppTeam.difficulty : 5;
      const oppRec = season.standings[oppId] || { w: 0, d: 0, l: 0 };
      actionHtml = `
        <div class="next-fixture">
          <h3>Next Match (Matchday ${currentMD + 1})</h3>
          <div class="next-opp-name">${oppName}</div>
          <div class="next-opp-info">
            <span class="opp-stars">${tierStars(oppDiff)}</span>
            <span class="next-opp-record">${oppRec.w}W ${oppRec.d}D ${oppRec.l}L</span>
          </div>
        </div>
        <button class="btn-primary btn-large" onclick="playNextLeagueMatch()">Play Next Match</button>`;
    }
  }

  const invCount = gameState.inventory.reduce((sum, i) => sum + i.quantity, 0);

  return `
    <div class="screen table-screen">
      <header class="hub-header">
        <div class="hub-title">
          <h1>${gameState.teamName}</h1>
          <div class="fans-display">Fans: ${gameState.fans.toLocaleString()}</div>
          ${renderLeagueIndicator()}
        </div>
        <div class="hub-meta">
          <span>Match ${gameState.matchesPlayed}</span>
          <span>Cards: ${invCount}</span>
        </div>
      </header>
      <div class="matchday-label">Matchday ${Math.min(currentMD, totalMatchdays)} of ${totalMatchdays}${seasonOver ? ' — Season Complete' : ''}</div>
      <div class="table-split">
        <div class="table-split-left">
          ${resultsHtml}
          ${actionHtml}
          <div class="table-bottom-actions">
            <button class="btn-secondary btn-large" onclick="updateState({screen:'managegear'})">Gear Up</button>
          </div>
        </div>
        <div class="table-split-right">
          ${tableHtml}
        </div>
      </div>
      <div class="hub-footer">
        <button class="btn-small btn-danger" onclick="startOver()">Start Over</button>
        <span class="version-label">v${GAME_VERSION}</span>
      </div>
      ${buildHelpButton('table')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
    </div>
  `;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function playNextLeagueMatch() {
  const season = gameState.season;
  const matchday = season.schedule[season.matchday];
  const playerMatch = matchday.matches.find(m => m.home === 'player' || m.away === 'player');
  if (!playerMatch) return;

  const oppId = playerMatch.home === 'player' ? playerMatch.away : playerMatch.home;
  updateState({ screen: 'prematch', selectedOpponentId: oppId });
}

function handleSeasonEnd() {
  const season = gameState.season;
  const sorted = sortStandings(season.standings);
  const playerRank = sorted.findIndex(([id]) => id === 'player') + 1;

  // Reset all player energy at season end
  for (const p of gameState.players) {
    p.energy = ENERGY_CONFIG.maxEnergy;
  }

  if (playerRank === sorted.length) {
    // Relegated — game over
    updateState({ screen: 'gameover' });
    return;
  }

  if (playerRank === 1) {
    if (season.league === 'international') {
      // Game win!
      const cm = gameState.currentMatch || {};
      updateState({ screen: 'gameover', currentMatch: { ...cm, gameWin: true } });
      return;
    }
    // Promotion — advance league, generate new league teams adaptively
    const nextLeague = LEAGUE_ORDER[LEAGUE_ORDER.indexOf(season.league) + 1];
    const playerTeam = {
      players: gameState.players,
      slots: gameState.slots,
    };
    gameState.leagueTeams[nextLeague] = generateLeagueTeams(nextLeague, playerTeam);
    const newSeason = generateSeason(nextLeague, 'player');
    gameState.currentLeague = nextLeague;
    gameState.season = newSeason;
    gameState.pendingPacks = [{ packId: 'promotion', opponentId: null, fromLeague: season.league }];
    saveGame(gameState);
    openNextPack();
    return;
  }

  // Mid-table — replay same league with refreshed teams
  refreshLeagueTeams(season.league);
  const newSeason = generateSeason(season.league, 'player');
  updateState({
    season: newSeason,
    screen: 'table',
  });
}
