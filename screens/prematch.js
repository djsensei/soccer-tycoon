// ============================================================
// screens/prematch.js — Pre-match hype screen
// ============================================================

const TRASH_TALK = [
  "\"We've seen better teams at a car park kickabout.\"",
  "\"Our goalkeeper naps during warm-ups. Still better than you.\"",
  "\"Prepare to lose magnificently.\"",
  "\"We googled your team. Couldn't find anything.\"",
  "\"Our worst player is off sick today. You're welcome.\"",
  "\"We're going to be so nice about this loss. Really. We promise.\"",
];

function renderPreMatch() {
  const opp = getOpponent(gameState.selectedOpponentId);
  if (!opp) return `<div class="screen"><p>Opponent not found.</p></div>`;
  const talk = pick(TRASH_TALK);

  return `
    <div class="screen prematch-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'matchselect'})">← Back</button>
        <h1>Pre-Match</h1>
      </div>
      <div class="prematch-layout">
        <div class="vs-banner">
          <div class="vs-team player-team">${gameState.teamName}</div>
          <div class="vs-divider">VS</div>
          <div class="vs-team opp-team">${opp.name}</div>
        </div>
        <div class="card prematch-card">
          <div class="opp-stars big">${tierStars(opp.difficulty)}</div>
          <p class="opp-note-big">${opp.specialNote}</p>
          <blockquote class="trash-talk">${talk}</blockquote>
        </div>
        <button class="btn-primary btn-large" onclick="kickOff()">🏁 KICK OFF!</button>
      </div>
    </div>
  `;
}

function kickOff() {
  const opp = getOpponent(gameState.selectedOpponentId);
  const playerTeamFull = {
    id: 'player',
    name: gameState.teamName,
    players: gameState.players,
    slots: gameState.slots,
  };
  const result = simulateMatch(playerTeamFull, opp);
  const { delta, outcome } = calculateFanDelta(opp.tier, result.playerScore, result.opponentScore, opp.fanRewardBase);
  const packEarned = getPackReward(opp.tier, outcome);

  updateState({
    screen: 'match',
    currentMatch: {
      opponentId:    opp.id,
      opponentName:  opp.name,
      events:        result.events,
      playerScore:   result.playerScore,
      opponentScore: result.opponentScore,
      fanDelta:      delta,
      outcome,
      packEarned,
    },
  });
}
