// ============================================================
// loader.js — Load browser-global game files into a Node.js vm sandbox
// ============================================================
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

// Files to load in dependency order (mirrors index.html <script> order,
// minus save.js and all screen/DOM files the bot doesn't need)
const GAME_FILES = [
  'transitions.js',
  'data.js',
  'utils.js',
  'init.js',
  'simulator.js',
];

function createSandbox() {
  // Minimal globals the game code expects
  const sandbox = {
    Math,
    Object,
    Array,
    Set,
    String,
    Number,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    console,
    // gameState will be set by createNewGame(); utils.js reads it at call time
    gameState: null,
  };

  const ctx = vm.createContext(sandbox);

  for (const file of GAME_FILES) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(src, ctx, { filename: file });
  }

  // const/let declarations are script-scoped in vm, not on the context object.
  // Run a helper to expose everything the bot needs as context properties.
  vm.runInContext(`
    this.MARKOV_TRANSITIONS = MARKOV_TRANSITIONS;
    this.STAT_INFLUENCES = STAT_INFLUENCES;
    this.TEAM_SIZE = TEAM_SIZE;
    this.POSITIONS = POSITIONS;
    this.STATS = STATS;
    this.GEAR_SLOTS = GEAR_SLOTS;
    this.GK_GEAR_SLOTS = GK_GEAR_SLOTS;
    this.RARITIES = RARITIES;
    this.CARDS = CARDS;
    this.PACK_TYPES = PACK_TYPES;
    this.STAT_MILESTONES = STAT_MILESTONES;
    this.MILESTONE_BONUSES = MILESTONE_BONUSES;
    this.LEAGUE_ORDER = LEAGUE_ORDER;
    this.LEAGUE_DEFINITIONS = LEAGUE_DEFINITIONS;
    this.LEAGUE_TEAMS = LEAGUE_TEAMS;
    this.LEAGUE_PACK_REWARDS = LEAGUE_PACK_REWARDS;
    this.FAN_BASE = FAN_BASE;
    this.FAN_MULTIPLIERS = FAN_MULTIPLIERS;
    // Functions
    this.pick = pick;
    this.generatePlayerName = generatePlayerName;
    this.generateTeamName = generateTeamName;
    this.createNewGame = createNewGame;
    this.generateSeason = generateSeason;
    this.buildLeagueTeam = buildLeagueTeam;
    this.simulateMatch = simulateMatch;
    this.simulateNPCMatch = simulateNPCMatch;
    this.updateStandings = updateStandings;
    this.computeOutcome = computeOutcome;
    this.getPackReward = getPackReward;
    this.openPack = openPack;
    this.forgeCards = forgeCards;
    this.effectiveStats = effectiveStats;
    this.sortStandings = sortStandings;
    this.findLeagueTeam = findLeagueTeam;
    this.getTeamName = getTeamName;
  `, ctx);

  return ctx;
}

module.exports = { createSandbox };
