// ============================================================
// screens/newgame.js — New game setup screen
// ============================================================

function renderNewGame() {
  const slots = ['GK', 'D', 'M1', 'M2', 'S'];
  const labels = { GK: 'Goalkeeper', D: 'Defender', M1: 'Midfielder 1', M2: 'Midfielder 2', S: 'Striker' };
  const fields = slots.map(s => `
    <div class="name-field">
      <label>${labels[s]}</label>
      <div class="name-row">
        <input type="text" id="pname-${s}" placeholder="${labels[s]} name" value="${generatePlayerName()}" />
        <button class="btn-small" onclick="document.getElementById('pname-${s}').value = generatePlayerName()">🎲</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="screen newgame-screen">
      <h1>⚽ Soccer Tycoon</h1>
      <p class="subtitle">Build a team. Win fans. Become a legend.</p>
      <div class="card setup-card">
        <h2>Name Your Club</h2>
        <div class="name-field">
          <label>Club Name</label>
          <div class="name-row">
            <input type="text" id="teamname" placeholder="Your team name" value="${generateTeamName()}" />
            <button class="btn-small" onclick="document.getElementById('teamname').value = generateTeamName()">🎲</button>
          </div>
        </div>
        <h2>Name Your Players</h2>
        ${fields}
        <button class="btn-primary" onclick="startNewGame()">⚽ Kick Off!</button>
      </div>
    </div>
  `;
}

function startNewGame() {
  const teamName = document.getElementById('teamname').value.trim() || generateTeamName();
  const slots = ['GK', 'D', 'M1', 'M2', 'S'];
  const playerNames = slots.map(s => document.getElementById(`pname-${s}`).value.trim() || generatePlayerName());
  gameState = createNewGame(teamName, playerNames);
  saveGame(gameState);
  render();
}
