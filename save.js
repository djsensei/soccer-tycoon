// ============================================================
// save.js — Persistence and new-game initialisation
// ============================================================

const SAVE_KEY = 'soccer-tycoon-v1';

function saveGame(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

// Build an opponent team from a definition object
function buildOpponentTeam(def) {
  const d = def.difficulty;
  const players = def.playerNames.map((name, i) => {
    const stat = () => Math.max(1, Math.min(10, d + Math.floor(Math.random() * 3) - 1));
    const isGK = i === 0;
    return {
      id: `${def.id}-p${i}`,
      name,
      stats: { height: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
      gear: isGK
        ? { head: null, body: null, feet: null, gloves: null }
        : { head: null, body: null, feet: null, gloves: null },
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
    // Special team appearance tracking (only used for special tier)
    appearsForMatches: def.tier === 'special' ? 2 + Math.floor(Math.random() * 2) : null,
    isAvailable: def.tier !== 'special', // special teams start hidden
  };
}

// Create a fresh player for the player's own team
function makePlayerCharacter(id, name, isGK) {
  const stat = () => 3 + Math.floor(Math.random() * 3); // 3–5
  return {
    id,
    name,
    stats: { height: stat(), speed: stat(), strength: stat(), passing: stat(), shooting: stat(), reflexes: stat(), luck: stat() },
    gear: isGK
      ? { ...STARTING_GEAR.GK }
      : { ...STARTING_GEAR.other },
  };
}

function createNewGame(teamName, playerNames) {
  // playerNames: array of 5 strings in slot order [GK, D, M1, M2, S]
  const rosterPlayers = playerNames.map((name, i) =>
    makePlayerCharacter(`player-${i}`, name, i === 0)
  );

  // One bench player generated with random name
  const benchPlayer = makePlayerCharacter('player-bench-0', generatePlayerName(), false);

  const allPlayers = [...rosterPlayers, benchPlayer];

  return {
    teamName,
    fans: 1000,
    matchesPlayed: 0,

    players: allPlayers,
    slots: { GK: 'player-0', D: 'player-1', M1: 'player-2', M2: 'player-3', S: 'player-4' },

    inventory: [], // [{ cardId, quantity }]

    matchHistory: [], // [{ opponentId, playerScore, opponentScore, fanDelta, packEarned }]
    unlockedPacks: ['basic'],

    opponentTeams: OPPONENT_DEFINITIONS.map(buildOpponentTeam),

    // Special team scheduling
    matchesUntilSpecialCheck: 3 + Math.floor(Math.random() * 3),

    // Transient screen state (not meaningful on load, but safe to persist)
    screen: 'hub',
    selectedOpponentId: null,
    currentMatch: null,   // { events, playerScore, opponentScore, fanDelta, outcome, packEarned }
    pendingPacks: [],     // packTypeIds waiting to be opened
    lastOpenedCards: [],  // cardIds from the most recent pack opening
    selectedPlayerId: null,
  };
}
