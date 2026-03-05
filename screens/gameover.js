// ============================================================
// screens/gameover.js — Game over newspaper screen
// ============================================================

function renderGameOver() {
  const m = gameState.currentMatch;
  const mgr = gameState.managerName || 'Coach';
  const headlines = [
    `${gameState.teamName} COLLAPSE IN HISTORIC DISGRACE`,
    `FANS FLEE AS ${gameState.teamName.toUpperCase()} HIT ROCK BOTTOM`,
    `${mgr.toUpperCase()} ESCORTED FROM STADIUM`,
    `LOCAL SOURCES CONFIRM: ${mgr.toUpperCase()} BLEW IT`,
    `${gameState.teamName.toUpperCase()}: A CAUTIONARY TALE`,
  ];
  const headline = pick(headlines);
  const score    = m ? `${m.playerScore} – ${m.opponentScore}` : '??';
  const opponent = m ? m.opponentName : 'someone';

  return `
    <div class="screen gameover-screen">
      <div class="newspaper">
        <div class="newspaper-header">⚽ THE DAILY BOOT ⚽</div>
        <div class="newspaper-headline">${headline}</div>
        <div class="newspaper-subhead">
          Following a ${score} defeat to ${opponent}, manager ${mgr} has been
          sacked from ${gameState.teamName} with just ${gameState.fans.toLocaleString()} fans remaining.
          Witnesses described the scenes as "genuinely sad."
        </div>
        <div class="newspaper-stats">
          <span>Matches played: ${gameState.matchesPlayed}</span>
          <span>Peak fans: ${Math.max(...gameState.matchHistory.map((_, i) =>
            gameState.matchHistory.slice(0, i + 1).reduce((f, h) => f + h.fanDelta, 1000)
          ), 1000).toLocaleString()}</span>
        </div>
      </div>
      <button class="btn-primary btn-large" onclick="restartGame()">Try Again</button>
    </div>
  `;
}

function restartGame() {
  deleteSave();
  gameState = { screen: 'newgame' };
  render();
}
