// ============================================================
// screens/title.js — Title screen (entry point for new/returning players)
// ============================================================

function renderTitle() {
  const hasSave = !!loadGame();

  return `
    <div class="screen title-screen">
      <div class="title-logo">⚽</div>
      <h1 class="title-heading">Soccer Tycoon</h1>
      <p class="title-tagline">Build a team. Win fans. Become a legend.</p>
      <div class="title-actions">
        <button class="btn-primary btn-large" onclick="titleNewGame()">New Game</button>
        ${hasSave ? '<button class="btn-secondary btn-large" onclick="titleContinue()">Continue</button>' : ''}
      </div>
    </div>
  `;
}

function titleNewGame() {
  if (loadGame()) {
    if (!confirm('This will erase your existing save. Continue?')) return;
    deleteSave();
  }
  _resetWizard();
  gameState = { screen: 'newgame' };
  render();
}

function titleContinue() {
  // Save already loaded by bootstrap — just go to table
  updateState({ screen: 'table' });
}
