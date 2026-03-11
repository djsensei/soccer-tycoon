// ============================================================
// screens/welcome.js — "Welcome to the League" post-creation interstitial
// ============================================================

const _WELCOME_HEADLINES = [
  (mgr, team) => `NEW MANAGER TAKES THE REINS`,
  (mgr, team) => `${team.toUpperCase()} ENTERS THE LEAGUE: "HOW BAD CAN IT BE?"`,
  (mgr, team) => `LOCAL CLUB HIRES ${mgr.toUpperCase()} — FANS CAUTIOUSLY OPTIMISTIC`,
  (mgr, team) => `${mgr.toUpperCase()} PROMISES ${team.toUpperCase()} FANS "WE'LL BE FINE, PROBABLY"`,
  (mgr, team) => `BREAKING: ${team.toUpperCase()} HAS A MANAGER NOW`,
];

function renderWelcome() {
  const mgr = gameState.managerName || 'Coach';
  const team = gameState.teamName || 'The Team';
  const leagueKey = gameState.currentLeague || 'local';
  const leagueDef = LEAGUE_DEFINITIONS[leagueKey];
  const leagueName = leagueDef ? leagueDef.name : leagueKey;

  const headline = pick(_WELCOME_HEADLINES)(mgr, team);

  // Gather league opponents
  const npcTeams = (gameState.leagueTeams && gameState.leagueTeams[leagueKey]) || [];
  const opponentRows = npcTeams.map(t => {
    const def = LEAGUE_TEAMS.find(d => d.id === t.id);
    const stars = def ? tierStars(def.difficulty) : '';
    const note = def && def.specialNote ? `<span class="welcome-opp-note">${def.specialNote}</span>` : '';
    return `
      <div class="welcome-opp-row">
        <span class="welcome-opp-name">${t.name}</span>
        <span class="welcome-opp-stars">${stars}</span>
        ${note}
      </div>
    `;
  }).join('');

  return `
    <div class="screen welcome-screen">
      <div class="newspaper welcome-newspaper">
        <div class="newspaper-header">THE DAILY BOOT — SPECIAL REPORT</div>
        <div class="newspaper-headline">${headline}</div>
        <div class="newspaper-subhead">
          Fresh-faced manager ${mgr} has taken charge of ${team} and
          enrolled in the ${leagueName}. Local experts give them
          "about a week" before it all falls apart.
        </div>
      </div>

      <div class="welcome-opponents card">
        <h2>Your Opponents</h2>
        <div class="welcome-opp-list">
          ${opponentRows}
        </div>
      </div>

      <button class="btn-primary btn-large" onclick="welcomeStart()">Let's Go!</button>
    </div>
  `;
}

function welcomeStart() {
  updateState({ screen: 'table' });
}
