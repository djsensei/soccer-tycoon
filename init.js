// ============================================================
// init.js — New game creation, league team + season generation
// ============================================================

// Assign gear cards to an NPC player based on league tier
function assignNPCGear(player, leagueKey, isGK) {
  const config = NPC_GEAR_CONFIG[leagueKey];
  if (!config || config.slots === 0) return;

  // Collect unique card IDs to exclude from NPC gear pool
  const uniqueCardIds = new Set(
    OPPONENT_DEFINITIONS.filter(d => d.uniqueCardId).map(d => d.uniqueCardId)
  );

  // Build eligible card pools per slot
  function getPool(slot) {
    return Object.values(CARDS).filter(c =>
      c.slot === slot &&
      config.rarities.includes(c.rarity) &&
      Object.keys(c.statBonuses).length > 0 &&
      !uniqueCardIds.has(c.id)
    );
  }

  const slots = ['head', 'body', 'feet'];
  // Shuffle and pick up to config.slots
  const shuffled = slots.slice().sort(() => Math.random() - 0.5);
  const slotsToFill = shuffled.slice(0, Math.min(config.slots, slots.length));

  for (const slot of slotsToFill) {
    const pool = getPool(slot);
    if (pool.length) player.gear[slot] = pick(pool).id;
  }

  // GK always gets gloves as a bonus slot (if league has gear)
  if (isGK) {
    const glovePool = getPool('gloves');
    if (glovePool.length) player.gear.gloves = pick(glovePool).id;
  }
}

function buildLeagueTeam(def, overrideDifficulty) {
  const d = overrideDifficulty != null ? overrideDifficulty : def.difficulty;
  const leagueKey = def.league;
  const playerNames = [];
  for (let i = 0; i < TEAM_SIZE; i++) playerNames.push(generatePlayerName());

  const players = playerNames.map((name, i) => {
    const stat = () => Math.max(1, Math.min(10, d + Math.floor(Math.random() * 3) - 1));
    const p = {
      id: `${def.id}-p${i}`,
      name,
      stats: { jumping: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
      gear: { head: null, body: null, feet: null, gloves: null },
      energy: ENERGY_CONFIG.maxEnergy,
    };
    assignNPCGear(p, leagueKey, i === 0); // p0 = GK
    return p;
  });

  return {
    id:          def.id,
    name:        def.name,
    league:      def.league,
    difficulty:  d,
    specialNote: def.specialNote,
    managerName: pick(NPC_MANAGER_NAMES),
    personality: pick(NPC_MANAGER_PERSONALITIES),
    players,
    slots: {
      GK: `${def.id}-p0`,
      D:  `${def.id}-p1`,
      M1: `${def.id}-p2`,
      M2: `${def.id}-p3`,
      S:  `${def.id}-p4`,
    },
  };
}

// Generate league teams with adaptive difficulty based on player power
function generateLeagueTeams(leagueKey, playerTeam) {
  resetNameTracking();
  const leagueDef = LEAGUE_DEFINITIONS[leagueKey];
  const defs = LEAGUE_TEAMS.filter(t => t.league === leagueKey);

  // Compute player power = average effective stat across all 5 players
  let playerPower = 5; // default if no player team
  if (playerTeam && playerTeam.players) {
    let totalStat = 0, statCount = 0;
    for (const p of playerTeam.players) {
      const es = effectiveStats(p);
      for (const s of STATS) {
        totalStat += es[s] || 0;
        statCount++;
      }
    }
    if (statCount > 0) playerPower = totalStat / statCount;
  }

  // Adaptive center clamped to league's difficulty range
  const adaptiveCenter = Math.max(leagueDef.diffMin, Math.min(leagueDef.diffMax, Math.round(playerPower)));

  return defs.map(def => {
    // Per-team jitter of ±1 around adaptive center (clamped to league range)
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    const overrideDiff = Math.max(leagueDef.diffMin, Math.min(leagueDef.diffMax, adaptiveCenter + jitter));
    return buildLeagueTeam(def, overrideDiff);
  });
}

// Refresh existing NPC teams for a new season (mid-table replay)
function refreshLeagueTeams(leagueKey) {
  const teams = gameState.leagueTeams[leagueKey];
  if (!teams) return;
  const config = NPC_GEAR_CONFIG[leagueKey];

  for (const team of teams) {
    for (let i = 0; i < team.players.length; i++) {
      const p = team.players[i];
      // Jitter each base stat by ±1 (clamped 1-10)
      for (const s of STATS) {
        const jitter = Math.floor(Math.random() * 3) - 1;
        p.stats[s] = Math.max(1, Math.min(10, p.stats[s] + jitter));
      }
      // Reset energy
      p.energy = ENERGY_CONFIG.maxEnergy;
      // Re-roll gear from the same rarity pool
      p.gear = { head: null, body: null, feet: null, gloves: null };
      assignNPCGear(p, leagueKey, i === 0);
    }
  }
}

// Round-robin schedule using circle method (all league sizes are even)
function generateSeason(leagueKey, playerTeamId) {
  const leagueDef = LEAGUE_DEFINITIONS[leagueKey];
  const npcIds = LEAGUE_TEAMS.filter(t => t.league === leagueKey).map(t => t.id);
  const teamIds = [playerTeamId, ...npcIds];
  const n = teamIds.length;

  // Circle method: fix team 0, rotate the rest
  const rounds = [];
  const rotating = teamIds.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const matches = [];
    // First match: fixed team vs rotating[0]
    const home = teamIds[0];
    const away = rotating[0];
    matches.push({ home, away });

    // Remaining matches pair from ends of rotating array
    for (let i = 1; i < n / 2; i++) {
      const h = rotating[i];
      const a = rotating[n - 1 - i];
      matches.push({ home: h, away: a });
    }
    rounds.push({ matches, completed: false });

    // Rotate: move last to front
    rotating.unshift(rotating.pop());
  }

  // Shuffle matchday order for variety
  for (let i = rounds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
  }

  // Build initial standings
  const standings = {};
  for (const id of teamIds) {
    standings[id] = { w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  }

  return {
    league: leagueKey,
    matchday: 0,
    schedule: rounds,
    standings,
    lastResults: [],
  };
}

function createNewGame(teamName, managerName, playerDefs) {
  resetNameTracking();
  // playerDefs: array of 5 { name, stats } in slot order [GK, D, M1, M2, S]
  const rosterPlayers = playerDefs.map((def, i) => ({
    id: `player-${i}`,
    name: def.name,
    stats: { ...def.stats },
    gear: { head: null, body: null, feet: null, gloves: null },
    careerStats: { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 },
    statBonuses: {},
    energy: ENERGY_CONFIG.maxEnergy,
  }));

  // Only build local league teams upfront (higher leagues generated at promotion)
  const leagueTeams = {};
  const localDefs = LEAGUE_TEAMS.filter(t => t.league === 'local');
  leagueTeams.local = localDefs.map(def => buildLeagueTeam(def));

  // Generate first season
  const season = generateSeason('local', 'player');

  return {
    teamName,
    managerName,
    fans: 1000,
    matchesPlayed: 0,

    players: rosterPlayers,
    slots: { GK: 'player-0', D: 'player-1', M1: 'player-2', M2: 'player-3', S: 'player-4' },

    inventory: [],     // [{ cardId, quantity }]
    matchHistory: [],  // [{ opponentId, playerScore, opponentScore, fanDelta, packEarned }]
    unlockedPacks: ['basic'],

    // League system (M7)
    currentLeague: 'local',
    leagueTeams,
    season,

    // Transient screen state
    screen: 'table',
    selectedOpponentId: null,
    currentMatch: null,
    pendingPacks: [],
    lastOpenedCards: [],
    lastOpenedPackId: null,
    selectedPlayerId: null,
  };
}

// NPC training decisions based on manager personality.
// Pure logic — returns array of { playerId, action: 'train'|'rest', stat? }
function npcTrainingDecisions(team) {
  const personality = team.personality || 'balanced';
  const thresholds = { taskmaster: 20, driven: 40, balanced: 50, relaxed: 75 };
  const minEnergy = thresholds[personality] || 50;

  return team.players.map(p => {
    const energy = p.energy != null ? p.energy : ENERGY_CONFIG.maxEnergy;
    if (energy >= minEnergy) {
      // Train weakest stat (capped at 10)
      const trainable = STATS.filter(s => (p.stats[s] || 0) < 10);
      if (trainable.length > 0) {
        const weakest = trainable.reduce((a, b) => (p.stats[a] || 0) <= (p.stats[b] || 0) ? a : b);
        return { playerId: p.id, action: 'train', stat: weakest };
      }
    }
    return { playerId: p.id, action: 'rest' };
  });
}

// Apply NPC training decisions to a team (mutates players in place)
function applyNPCTraining(team) {
  const decisions = npcTrainingDecisions(team);
  for (const dec of decisions) {
    const p = team.players.find(pl => pl.id === dec.playerId);
    if (!p) continue;
    if (dec.action === 'train') {
      p.energy = Math.max(0, (p.energy || ENERGY_CONFIG.maxEnergy) - noisyCost(ENERGY_CONFIG.trainingCost));
      if (Math.random() < ENERGY_CONFIG.trainSuccessChance) {
        p.stats[dec.stat] = Math.min(10, (p.stats[dec.stat] || 1) + 1);
      }
    } else {
      p.energy = Math.min(ENERGY_CONFIG.maxEnergy, (p.energy || ENERGY_CONFIG.maxEnergy) + ENERGY_CONFIG.restRecovery);
    }
  }
}
