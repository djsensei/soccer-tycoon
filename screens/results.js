// ============================================================
// screens/results.js — Post-match results screen
// ============================================================

function renderResults() {
  const m = gameState.currentMatch;

  const outcomeMessages = {
    bigWin:  '🏆 DOMINANT VICTORY!',
    win:     '✅ VICTORY!',
    tie:     '🤝 IT\'S A DRAW',
    loss:    '😬 Defeat...',
    bigLoss: '💀 HUMILIATING DEFEAT',
  };

  const deltaSign  = m.fanDelta >= 0 ? '+' : '';
  const deltaClass = m.fanDelta >= 0 ? 'fan-gain' : 'fan-loss';

  const packHtml = m.packEarned
    ? `<div class="pack-earned">
         🃏 You earned a <strong>${PACK_TYPES[m.packEarned]?.name}</strong>!
       </div>
       <button class="btn-primary btn-large" onclick="openNextPack()">Open Pack! 🎁</button>`
    : `<button class="btn-secondary btn-large" onclick="updateState({screen:'hub'})">Back to Hub</button>`;

  return `
    <div class="screen results-screen">
      <h1>${outcomeMessages[m.outcome] || 'Match Over'}</h1>
      <div class="result-score-big">${m.playerScore} – ${m.opponentScore}</div>
      <div class="result-teams">${gameState.teamName} vs ${m.opponentName}</div>
      <div class="fan-delta ${deltaClass}">${deltaSign}${m.fanDelta.toLocaleString()} fans</div>
      <div class="fans-total">Total: 👥 ${gameState.fans.toLocaleString()}</div>
      ${packHtml}
    </div>
  `;
}
