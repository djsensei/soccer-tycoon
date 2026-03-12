// ============================================================
// state.js — Core game state, render router, and bootstrap
// ============================================================

let gameState = null;
let matchPlayback = null; // holds setInterval reference during match animation

function updateState(patch) {
  Object.assign(gameState, patch);
  saveGame(gameState);
  render();
}

function render() {
  if (matchPlayback) { clearInterval(matchPlayback); matchPlayback = null; }
  const app = document.getElementById('app');
  switch (gameState.screen) {
    case 'title':      app.innerHTML = renderTitle();        break;
    case 'welcome':    app.innerHTML = renderWelcome();      break;
    case 'newgame':    app.innerHTML = renderNewGame();      break;
    case 'hub':        gameState.screen = 'table'; app.innerHTML = renderTable(); break;
    case 'managegear': app.innerHTML = renderGearUp();       break;
    case 'table':      app.innerHTML = renderTable();        break;
    case 'prematch':   app.innerHTML = renderPreMatch();     break;
    case 'match':      app.innerHTML = renderMatchScreen();  startMatchPlayback(); break;
    case 'results':    app.innerHTML = renderResults();      break;
    case 'packopen':   app.innerHTML = renderPackOpening();  break;
    case 'gameover':   app.innerHTML = renderGameOver();     break;
    default:           app.innerHTML = '<p>Unknown screen.</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = loadGame();
  if (saved) {
    gameState = saved;
    // Migrate: ensure players have careerStats and statBonuses (M5)
    if (gameState.players) {
      for (const p of gameState.players) {
        if (!p.careerStats) p.careerStats = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
        if (!p.statBonuses) p.statBonuses = {};
        // M6: rename height -> jumping
        if ('height' in p.stats) { p.stats.jumping = p.stats.height; delete p.stats.height; }
        if ('height' in p.statBonuses) { p.statBonuses.jumping = p.statBonuses.height; delete p.statBonuses.height; }
      }
    }
    // M6: add managerName
    if (!gameState.managerName) gameState.managerName = 'Coach';
    // M6: remove bench players — keep only those in starting slots
    if (gameState.slots) {
      const slotIds = new Set(Object.values(gameState.slots));
      gameState.players = gameState.players.filter(p => slotIds.has(p.id));
    }
    // M6: rename height -> jumping in opponent teams
    if (gameState.opponentTeams) {
      for (const t of gameState.opponentTeams) {
        for (const p of t.players) {
          if ('height' in p.stats) { p.stats.jumping = p.stats.height; delete p.stats.height; }
        }
      }
    }
    // M7: migrate to league system
    if (gameState.opponentTeams && !gameState.currentLeague) {
      // Build all league teams fresh
      const leagueTeams = {};
      for (const leagueKey of LEAGUE_ORDER) {
        const defs = LEAGUE_TEAMS.filter(t => t.league === leagueKey);
        leagueTeams[leagueKey] = defs.map(buildLeagueTeam);
      }
      gameState.leagueTeams = leagueTeams;
      gameState.currentLeague = 'local';
      gameState.season = generateSeason('local', 'player');
      delete gameState.opponentTeams;
      delete gameState.matchesUntilSpecialCheck;
    }
    // Reset screens that can't meaningfully resume mid-session
    if (['match', 'prematch', 'packopen', 'matchselect', 'welcome'].includes(gameState.screen)) {
      gameState.screen = 'table';
    }
  } else {
    gameState = { screen: 'title' };
  }
  render();
});
