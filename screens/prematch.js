// ============================================================
// screens/prematch.js — Pre-match hype screen (M11 redesign)
// ============================================================

const TRASH_TALK = [
  "\"We've seen better teams at a car park kickabout.\"",
  "\"Our goalkeeper naps during warm-ups. Still better than you.\"",
  "\"Prepare to lose magnificently.\"",
  "\"We googled your team. Couldn't find anything.\"",
  "\"Our worst player is off sick today. You're welcome.\"",
  "\"We're going to be so nice about this loss. Really. We promise.\"",
];

// Key stats to show per position
const POSITION_KEY_STATS = {
  GK: ['reflexes', 'jumping', 'strength'],
  D:  ['strength', 'jumping', 'speed'],
  M1: ['passing', 'speed', 'shooting'],
  M2: ['passing', 'speed', 'shooting'],
  S:  ['shooting', 'speed', 'passing'],
};

function generatePreMatchCommentary(playerTeam, oppTeam, standings) {
  const lines = [];

  // Overall power comparison
  const playerPower = playerTeam.players.reduce((sum, p) => {
    const es = effectiveStats(p);
    return sum + STATS.reduce((s, stat) => s + (es[stat] || 0), 0);
  }, 0) / (playerTeam.players.length * STATS.length);

  const oppPower = oppTeam.players.reduce((sum, p) => {
    const es = effectiveStats(p);
    return sum + STATS.reduce((s, stat) => s + (es[stat] || 0), 0);
  }, 0) / (oppTeam.players.length * STATS.length);

  if (oppPower > playerPower + 1.5) {
    lines.push(`${oppTeam.name} look significantly stronger on paper. This will be a tough test.`);
  } else if (oppPower > playerPower + 0.5) {
    lines.push(`${oppTeam.name} have a slight edge in overall quality. Stay sharp out there.`);
  } else if (playerPower > oppPower + 1.5) {
    lines.push(`Your squad outclasses ${oppTeam.name} across the board. Time to put on a show!`);
  } else if (playerPower > oppPower + 0.5) {
    lines.push(`You hold a narrow advantage over ${oppTeam.name}. Don't get complacent.`);
  } else {
    lines.push(`This one looks evenly matched — could go either way!`);
  }

  // Key matchup callout
  const oppStriker = oppTeam.players.find(p => p.id === oppTeam.slots.S);
  const playerGK = playerTeam.players.find(p => p.id === playerTeam.slots.GK);
  if (oppStriker && playerGK) {
    const strikerShot = effectiveStats(oppStriker).shooting || 0;
    const gkReflex = effectiveStats(playerGK).reflexes || 0;
    if (strikerShot >= 7) {
      lines.push(`Watch out for ${oppStriker.name} — their shooting (${strikerShot}) will test your keeper.`);
    } else if (gkReflex >= 7) {
      lines.push(`Your keeper ${playerGK.name} looks well-equipped to handle their attack.`);
    }
  }

  // Opponent form from standings
  if (standings) {
    const oppRec = standings[oppTeam.id];
    if (oppRec && (oppRec.w + oppRec.d + oppRec.l) > 0) {
      const total = oppRec.w + oppRec.d + oppRec.l;
      if (oppRec.w >= 3 && oppRec.w / total >= 0.6) {
        lines.push(`${oppTeam.name} are in strong form with ${oppRec.w} wins from ${total} matches.`);
      } else if (oppRec.l >= 3 && oppRec.l / total >= 0.6) {
        lines.push(`${oppTeam.name} have been struggling — ${oppRec.l} losses from ${total} matches.`);
      }
    }
  }

  return lines;
}

function renderPreMatch() {
  const opp = findLeagueTeam(gameState.selectedOpponentId) || getOpponent(gameState.selectedOpponentId);
  if (!opp) return `<div class="screen"><p>Opponent not found.</p></div>`;
  const talk = pick(TRASH_TALK);

  const playerTeam = {
    id: 'player',
    name: gameState.teamName,
    players: gameState.players,
    slots: gameState.slots,
  };

  const commentary = generatePreMatchCommentary(playerTeam, opp, gameState.season?.standings);

  // Build roster comparison rows
  const rosterRows = POSITIONS.map(pos => {
    const playerPlayerId = gameState.slots[pos];
    const playerPlayer = gameState.players.find(p => p.id === playerPlayerId);
    const oppPlayerId = opp.slots[pos];
    const oppPlayer = opp.players.find(p => p.id === oppPlayerId);

    const keyStats = POSITION_KEY_STATS[pos];
    const pStats = playerPlayer ? effectiveStats(playerPlayer) : {};
    const oStats = oppPlayer ? effectiveStats(oppPlayer) : {};

    // Gear thumbnails
    function gearThumbs(player) {
      if (!player) return '';
      const gearSlots = pos === 'GK' ? GK_GEAR_SLOTS : GEAR_SLOTS;
      const thumbs = gearSlots.map(slot => {
        const cardId = player.gear[slot];
        if (!cardId || !CARDS[cardId]) return '';
        const card = CARDS[cardId];
        return `<div class="prematch-gear-thumb" style="border-color:${RARITY_COLOR[card.rarity]}" title="${card.name}">
          <img src="img/cards/processed/${cardId}.png" alt="${card.name}"
               onerror="this.parentElement.style.display='none'">
        </div>`;
      }).join('');
      return thumbs ? `<div class="prematch-gear-row">${thumbs}</div>` : '';
    }

    // Stat comparison bars
    const statRows = keyStats.map(stat => {
      const pVal = pStats[stat] || 0;
      const oVal = oStats[stat] || 0;
      const pAdv = pVal > oVal ? 'stat-advantage' : pVal < oVal ? 'stat-disadvantage' : '';
      const oAdv = oVal > pVal ? 'stat-advantage' : oVal < pVal ? 'stat-disadvantage' : '';
      return `<div class="prematch-stat-row">
        <div class="prematch-stat-val ${pAdv}">${pVal}</div>
        <div class="prematch-stat-bar-left">${statBar(pVal, 10, STAT_COLORS[stat])}</div>
        <div class="prematch-stat-label" style="color:${STAT_COLORS[stat]}">${STAT_ABBR[stat]}</div>
        <div class="prematch-stat-bar-right">${statBar(oVal, 10, STAT_COLORS[stat])}</div>
        <div class="prematch-stat-val ${oAdv}">${oVal}</div>
      </div>`;
    }).join('');

    // Energy bars
    const pEnergy = playerPlayer ? (playerPlayer.energy != null ? playerPlayer.energy : ENERGY_CONFIG.maxEnergy) : 100;
    const oEnergy = oppPlayer ? (oppPlayer.energy != null ? oppPlayer.energy : ENERGY_CONFIG.maxEnergy) : 100;

    return `<div class="prematch-position-row">
      <div class="prematch-pos-label">${slotName(pos)}</div>
      <div class="prematch-comparison">
        <div class="prematch-player-side">
          <div class="prematch-player-name">${playerPlayer?.name || '???'}</div>
          <div class="prematch-player-energy">${energyBar(pEnergy)}</div>
          ${gearThumbs(playerPlayer)}
        </div>
        <div class="prematch-stats-center">
          ${statRows}
        </div>
        <div class="prematch-player-side prematch-opp-side">
          <div class="prematch-player-name">${oppPlayer?.name || '???'}</div>
          <div class="prematch-player-energy">${energyBar(oEnergy)}</div>
          ${gearThumbs(oppPlayer)}
        </div>
      </div>
    </div>`;
  }).join('');

  const commentaryHtml = commentary.length
    ? `<div class="prematch-commentary">${commentary.map(l => `<p>${l}</p>`).join('')}</div>`
    : '';

  // Fatigue warning
  const fatiguedPlayers = gameState.players.filter(p => (p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy) < ENERGY_CONFIG.fatigueThreshold);
  const fatigueHtml = fatiguedPlayers.length
    ? `<div class="fatigue-warning">Warning: ${fatiguedPlayers.map(p => p.name).join(', ')} ${fatiguedPlayers.length === 1 ? 'is' : 'are'} fatigued! Stats will be reduced.</div>`
    : '';

  // Opponent manager
  const oppManagerHtml = opp.managerName ? `<div class="vs-manager">Manager: ${opp.managerName}</div>` : '';

  return `
    <div class="screen prematch-screen">
      <div class="screen-header">
        <button class="btn-back" onclick="updateState({screen:'table'})">← Back</button>
        <h1>Pre-Match</h1>
      </div>
      ${fatigueHtml}
      <div class="prematch-two-col">
        <div class="prematch-col-left">
          <div class="vs-banner">
            <div class="vs-team player-team">${gameState.teamName}<div class="vs-manager">Manager: ${gameState.managerName || 'Coach'}</div></div>
            <div class="vs-divider">VS</div>
            <div class="vs-team opp-team">${opp.name}${oppManagerHtml}</div>
          </div>
          ${commentaryHtml}
          <div class="card prematch-card">
            <blockquote class="trash-talk">${talk}</blockquote>
          </div>
          <button class="btn-primary btn-large" onclick="kickOff()">KICK OFF!</button>
        </div>
        <div class="prematch-col-right">
          <div class="prematch-roster">
            <div class="prematch-roster-header">
              <span>${gameState.teamName}</span>
              <span>Matchup</span>
              <span>${opp.name}</span>
            </div>
            ${rosterRows}
          </div>
        </div>
      </div>
      ${buildHelpButton('prematch')}
      ${_helpModalScreen ? buildHelpModal(_helpModalScreen) : ''}
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
