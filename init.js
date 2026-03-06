// ============================================================
// init.js — New game creation, league team + season generation
// ============================================================

function buildOpponentTeam(def) {
  const d = def.difficulty;
  const players = def.playerNames.map((name, i) => {
    const stat = () => Math.max(1, Math.min(10, d + Math.floor(Math.random() * 3) - 1));
    return {
      id: `${def.id}-p${i}`,
      name,
      stats: { jumping: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
      gear: { head: null, body: null, feet: null, gloves: null },
    };
  });

  return {
    id:            def.id,
    name:          def.name,
    tier:          def.tier,
    difficulty:    def.difficulty,
    fanRewardBase: FAN_BASE[def.tier],
    specialNote:   def.specialNote,
    players,
    slots: {
      GK: `${def.id}-p0`,
      D:  `${def.id}-p1`,
      M1: `${def.id}-p2`,
      M2: `${def.id}-p3`,
      S:  `${def.id}-p4`,
    },
    appearsForMatches: def.tier === 'special' ? 2 + Math.floor(Math.random() * 2) : null,
    isAvailable: def.tier !== 'special',
  };
}

function buildLeagueTeam(def) {
  const d = def.difficulty;
  const playerNames = [];
  for (let i = 0; i < TEAM_SIZE; i++) playerNames.push(generatePlayerName());

  const players = playerNames.map((name, i) => {
    const stat = () => Math.max(1, Math.min(10, d + Math.floor(Math.random() * 3) - 1));
    return {
      id: `${def.id}-p${i}`,
      name,
      stats: { jumping: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
      gear: { head: null, body: null, feet: null, gloves: null },
    };
  });

  return {
    id:          def.id,
    name:        def.name,
    league:      def.league,
    difficulty:  def.difficulty,
    specialNote: def.specialNote,
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

function makePlayerCharacter(id, name) {
  const stat = () => 3 + Math.floor(Math.random() * 3); // 3-5
  return {
    id,
    name,
    stats: { jumping: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
    gear: { head: null, body: null, feet: null, gloves: null },
    careerStats: { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 },
    statBonuses: {},
  };
}

function createNewGame(teamName, managerName, playerDefs) {
  // playerDefs: array of 5 { name, stats } in slot order [GK, D, M1, M2, S]
  const rosterPlayers = playerDefs.map((def, i) => ({
    id: `player-${i}`,
    name: def.name,
    stats: { ...def.stats },
    gear: { head: null, body: null, feet: null, gloves: null },
    careerStats: { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 },
    statBonuses: {},
  }));

  // Build all league teams upfront
  const leagueTeams = {};
  for (const leagueKey of LEAGUE_ORDER) {
    const defs = LEAGUE_TEAMS.filter(t => t.league === leagueKey);
    leagueTeams[leagueKey] = defs.map(buildLeagueTeam);
  }

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
    screen: 'hub',
    selectedOpponentId: null,
    currentMatch: null,
    pendingPacks: [],
    lastOpenedCards: [],
    lastOpenedPackId: null,
    selectedPlayerId: null,
  };
}
