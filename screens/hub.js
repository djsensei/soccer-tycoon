// ============================================================
// screens/hub.js — Main hub screen (roster, stats, navigation)
// ============================================================

// Module-level swap state (not persisted)
let _swapTarget = null;

function renderLeagueIndicator() {
  const leagueKey = gameState.currentLeague || 'local';
  const leagueDef = LEAGUE_DEFINITIONS[leagueKey];
  const season = gameState.season;
  const leagueIdx = LEAGUE_ORDER.indexOf(leagueKey);
  const totalLeagues = LEAGUE_ORDER.length;

  let seasonProgress = '';
  if (season) {
    const totalMD = season.schedule.length;
    const currentMD = Math.min(season.matchday, totalMD);
    seasonProgress = `Matchday ${currentMD} / ${totalMD}`;
  }

  return `
    <div class="league-indicator">
      <span class="league-badge">${leagueDef ? leagueDef.name : leagueKey}</span>
      <span class="league-progress">${seasonProgress}</span>
      <span class="league-level">League ${leagueIdx + 1} of ${totalLeagues}</span>
    </div>
  `;
}

function selectForSwap(playerId) {
  if (_swapTarget === null) {
    _swapTarget = playerId;
    render();
  } else if (_swapTarget === playerId) {
    // Deselect
    _swapTarget = null;
    render();
  } else {
    // Perform swap
    const slots = { ...gameState.slots };
    const sourceSlot = Object.entries(slots).find(([, id]) => id === _swapTarget)?.[0] ?? null;
    const targetSlot = Object.entries(slots).find(([, id]) => id === playerId)?.[0] ?? null;

    if (sourceSlot && targetSlot) {
      // Both are starters — swap their slots
      slots[sourceSlot] = playerId;
      slots[targetSlot] = _swapTarget;
    }

    _swapTarget = null;
    updateState({ slots });
  }
}

function startOver() {
  if (confirm('Start over? All progress will be lost.')) {
    deleteSave();
    gameState = { screen: 'newgame' };
    render();
  }
}
