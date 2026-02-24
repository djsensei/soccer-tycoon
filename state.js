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
    case 'newgame':    app.innerHTML = renderNewGame();      break;
    case 'hub':        app.innerHTML = renderHub();          break;
    case 'managegear': app.innerHTML = renderGearUp();       break;
    case 'matchselect':app.innerHTML = renderMatchSelect();  break;
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
    // Reset screens that can't meaningfully resume mid-session
    if (['match', 'prematch', 'packopen'].includes(gameState.screen)) {
      gameState.screen = 'hub';
    }
  } else {
    gameState = { screen: 'newgame' };
  }
  render();
});
