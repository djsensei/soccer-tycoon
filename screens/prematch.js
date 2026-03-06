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
  const opp = findLeagueTeam(gameState.selectedOpponentId) || getOpponent(gameState.selectedOpponentId);
  if (!opp) return `<div class="screen"><p>Opponent not found.</p></div>`;
  const talk = pick(TRASH_TALK);

  return `
    <div class="screen prematch-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'table'})">← Back</button>
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
        <button class="btn-primary btn-large" onclick="kickOff()">KICK OFF!</button>
      </div>
    </div>
  `;
}

function kickOff() {
  const opp = findLeagueTeam(gameState.selectedOpponentId) || getOpponent(gameState.selectedOpponentId);
  const leagueKey = gameState.currentLeague || opp.league || opp.tier || 'local';

  const playerTeamFull = {
    id: 'player',
    name: gameState.teamName,
    league: leagueKey,
    players: gameState.players,
    slots: gameState.slots,
  };

  // Add league to opponent for tier scale
  const oppWithLeague = { ...opp, league: opp.league || leagueKey };
  const result  = simulateMatch(playerTeamFull, oppWithLeague);
  const outcome = computeOutcome(result.playerScore, result.opponentScore);

  // Total fan delta: sum of all per-event deltas (including fulltime margin bonus)
  const totalFanDelta = result.events.reduce((sum, e) => sum + (e.fanDelta || 0), 0);
  const packEarned    = getPackReward(leagueKey, outcome);

  updateState({
    screen: 'match',
    currentMatch: {
      opponentId:    opp.id,
      opponentName:  opp.name,
      events:        result.events,
      playerScore:   result.playerScore,
      opponentScore: result.opponentScore,
      fanDelta:      totalFanDelta,
      outcome,
      packEarned,
    },
  });
}
