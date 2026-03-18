// ============================================================
// screens/gameover.js — Game over / game win newspaper screen
// ============================================================

function renderGameOver() {
  const m = gameState.currentMatch;
  const mgr = gameState.managerName || 'Coach';
  const leagueKey = gameState.currentLeague || 'local';
  const leagueName = LEAGUE_DEFINITIONS[leagueKey]?.name || leagueKey;

  // Check for game win
  if (m && m.gameWin) {
    return renderGameWin();
  }

  const headlines = [
    `${gameState.teamName} RELEGATED IN HISTORIC DISGRACE`,
    `LAST PLACE! ${mgr.toUpperCase()} GETS THE BOOT`,
    `${mgr.toUpperCase()} SACKED AFTER ${leagueName.toUpperCase()} HUMILIATION`,
    `BOTTOM OF THE TABLE: ${gameState.teamName.toUpperCase()} DONE`,
    `${gameState.teamName.toUpperCase()}: FROM BAD TO RELEGATED`,
  ];
  const headline = pick(headlines);
  const score    = m ? `${m.playerScore} – ${m.opponentScore}` : '??';
  const opponent = m ? m.opponentName : 'someone';

  return `
    <div class="screen gameover-screen">
      <div class="newspaper">
        <div class="newspaper-header">THE DAILY BOOT</div>
        <div class="newspaper-headline">${headline}</div>
        <div class="newspaper-subhead">
          After finishing last in the ${leagueName}, manager ${mgr} has been
          sacked from ${gameState.teamName}.
          Final match: a ${score} result against ${opponent}.
          Witnesses described the scenes as "genuinely sad."
        </div>
        <div class="newspaper-stats">
          <span>Matches played: ${gameState.matchesPlayed}</span>
          <span>Fans: ${gameState.fans.toLocaleString()}</span>
        </div>
      </div>
      <button class="btn-primary btn-large" onclick="restartGame()">Try Again</button>
    </div>
  `;
}

function renderGameWin() {
  const mgr = gameState.managerName || 'Coach';
  const headlines = [
    `${gameState.teamName} CONQUER THE WORLD!`,
    `${mgr.toUpperCase()} LEADS ${gameState.teamName.toUpperCase()} TO GLOBAL GLORY`,
    `WORLD CHAMPIONS! ${gameState.teamName.toUpperCase()} DID IT!`,
    `FROM MARIN COUNTY TO THE WORLD: THE ${gameState.teamName.toUpperCase()} STORY`,
  ];
  const headline = pick(headlines);

  const fireworks = Array.from({length: 6}, (_, i) =>
    `<div class="firework" style="--fx:${15 + (i % 3) * 35}vw;--fy:${15 + Math.floor(i / 3) * 30}vh;--fd:${0.3 + i * 0.4}s;--fc:${['var(--gold)','#e05555','#42b4e8','var(--accent)','#9c27b0','#ff9800'][i]}"></div>`
  ).join('');

  return `
    <div class="screen gameover-screen game-win">
      <div class="fireworks-container">${fireworks}</div>
      <div class="newspaper game-win-newspaper">
        <div class="newspaper-header">THE DAILY BOOT — SPECIAL EDITION</div>
        <div class="newspaper-headline">${headline}</div>
        <div class="newspaper-subhead">
          In a fairy-tale journey from local parks to the world stage,
          manager ${mgr} and ${gameState.teamName} have won the World League!
          The crowd is going absolutely bananas!
        </div>
        <div class="newspaper-stats">
          <span>Total matches: ${gameState.matchesPlayed}</span>
          <span>Final fans: ${gameState.fans.toLocaleString()}</span>
        </div>
      </div>
      <button class="btn-primary btn-large" onclick="restartGame()">Play Again!</button>
    </div>
  `;
}

function restartGame() {
  deleteSave();
  gameState = { screen: 'title' };
  render();
}
