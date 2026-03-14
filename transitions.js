// ============================================================
// transitions.js — Markov chain transition probabilities
// Separated from data.js for cleaner diffs when tuning probabilities.
// Loaded before data.js in index.html.
// ============================================================

// --- Markov Chain Transitions (Phase 2) ------------------------
// Keys: "prevState|currentState" for second-order, "*|currentState" for wildcard fallbacks
// Possession-change destinations (ending in _def) trigger atkIsPlayer swap in simulator
const MARKOV_TRANSITIONS = {
  // ===== SECOND-ORDER ENTRIES =====
  // After kickoff → midfield with fresh possession
  'kickoff|poss_mid_atk':          { poss_str_atk: 0.20, poss_mid_atk: 0.25, poss_def_atk: 0.15, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.05 },
  // Counter-attack after turnover in mid
  'poss_mid_def|poss_mid_atk':     { poss_str_atk: 0.28, poss_mid_atk: 0.22, poss_def_atk: 0.08, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.03 },
  // Sustained midfield possession
  'poss_mid_atk|poss_mid_atk':     { poss_str_atk: 0.28, poss_mid_atk: 0.18, poss_def_atk: 0.10, poss_mid_def: 0.24, poss_def_def: 0.09, dead_throwin_atk: 0.04, dead_foul_atk: 0.04, dead_corner_atk: 0.03 },
  // Striker lays off to mid, then mid builds again
  'poss_str_atk|poss_mid_atk':     { poss_str_atk: 0.30, poss_mid_atk: 0.20, poss_def_atk: 0.12, poss_mid_def: 0.20, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.04 },
  // After set piece → mid build-up
  'dead_corner_atk|poss_mid_atk':  { poss_str_atk: 0.25, poss_mid_atk: 0.20, poss_def_atk: 0.15, poss_mid_def: 0.20, poss_def_def: 0.12, dead_corner_atk: 0.04, dead_throwin_atk: 0.04 },
  'dead_foul_atk|poss_mid_atk':    { poss_str_atk: 0.28, poss_mid_atk: 0.22, poss_def_atk: 0.12, poss_mid_def: 0.22, poss_def_def: 0.10, dead_throwin_atk: 0.03, dead_foul_atk: 0.03 },

  // GK distributes → defender builds
  'poss_gk_atk|poss_def_atk':      { poss_mid_atk: 0.50, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  // Defender keeps ball
  'poss_def_atk|poss_def_atk':     { poss_mid_atk: 0.45, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.22, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  // Defender after winning the ball under pressure
  'poss_mid_def|poss_def_atk':     { poss_mid_atk: 0.40, poss_gk_atk: 0.20, poss_def_atk: 0.08, poss_mid_def: 0.24, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  // After corner cleared → defender has it
  'dead_corner_atk|poss_def_atk':  { poss_mid_atk: 0.45, poss_gk_atk: 0.20, poss_def_atk: 0.12, poss_mid_def: 0.18, dead_throwin_atk: 0.05 },

  // GK after save → build from back
  'save_def|poss_gk_atk':          { poss_def_atk: 0.40, poss_mid_atk: 0.35, poss_mid_def: 0.15, dead_throwin_atk: 0.10 },
  // GK after goal kick
  'dead_goalkick_def|poss_gk_atk': { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  // GK after restart (kickoff → GK gets ball somehow)
  'kickoff|poss_gk_atk':           { poss_def_atk: 0.40, poss_mid_atk: 0.40, poss_mid_def: 0.15, dead_throwin_atk: 0.05 },
  // GK after shot off target
  'shot_off_atk|poss_gk_atk':      { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },

  // Good through-ball to striker from mid
  'poss_mid_atk|poss_str_atk':     { shot_on_atk: 0.35, shot_off_atk: 0.15, poss_mid_atk: 0.15, poss_def_def: 0.20, dead_corner_atk: 0.08, dead_foul_atk: 0.07 },
  // Striker under pressure after defender had ball
  'poss_def_def|poss_str_atk':     { shot_on_atk: 0.15, shot_off_atk: 0.15, poss_mid_atk: 0.10, poss_def_def: 0.40, dead_foul_atk: 0.15, dead_corner_atk: 0.05 },
  // Counter-attack – striker with space
  'poss_mid_def|poss_str_atk':     { shot_on_atk: 0.30, shot_off_atk: 0.20, poss_mid_atk: 0.15, poss_def_def: 0.18, dead_corner_atk: 0.10, dead_foul_atk: 0.07 },
  // Striker holds up play and gets ball again
  'poss_str_atk|poss_str_atk':     { shot_on_atk: 0.25, shot_off_atk: 0.18, poss_mid_atk: 0.15, poss_def_def: 0.28, dead_corner_atk: 0.08, dead_foul_atk: 0.06 },
  // Header chance from corner
  'dead_corner_atk|poss_str_atk':  { shot_on_atk: 0.40, shot_off_atk: 0.20, poss_mid_atk: 0.10, poss_def_def: 0.20, dead_corner_atk: 0.05, dead_foul_atk: 0.05 },
  // Free kick to striker
  'dead_foul_atk|poss_str_atk':    { shot_on_atk: 0.38, shot_off_atk: 0.22, poss_mid_atk: 0.15, poss_def_def: 0.15, dead_corner_atk: 0.05, dead_foul_atk: 0.05 },

  // Shot on target after corner (header)
  'dead_corner_atk|shot_on_atk':   { goal_atk: 0.30, save_def: 0.50, dead_corner_atk: 0.20 },
  // Second shot on target (rebound situation)
  'shot_on_atk|shot_on_atk':       { goal_atk: 0.45, save_def: 0.40, dead_corner_atk: 0.15 },

  // Repeated corners (sustained pressure)
  'dead_corner_atk|dead_corner_atk': { shot_on_atk: 0.25, poss_str_atk: 0.30, poss_def_def: 0.25, dead_goalkick_def: 0.10, poss_mid_atk: 0.10 },
  // Foul in striker zone
  'poss_str_atk|dead_foul_atk':    { poss_str_atk: 0.25, shot_on_atk: 0.25, poss_mid_atk: 0.30, poss_def_def: 0.20 },
  // Foul in midfield zone
  'poss_mid_atk|dead_foul_atk':    { poss_mid_atk: 0.40, poss_str_atk: 0.25, poss_def_def: 0.20, shot_on_atk: 0.15 },

  // ===== WILDCARD FALLBACKS (first-order) =====
  '*|kickoff':             { poss_mid_atk: 1.0 },
  '*|poss_gk_atk':         { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  '*|poss_def_atk':        { poss_mid_atk: 0.45, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.22, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  '*|poss_mid_atk':        { poss_str_atk: 0.22, poss_mid_atk: 0.20, poss_def_atk: 0.13, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.04, dead_corner_atk: 0.02 },
  '*|poss_str_atk':        { shot_on_atk: 0.28, shot_off_atk: 0.14, poss_mid_atk: 0.18, poss_def_def: 0.24, dead_corner_atk: 0.08, dead_foul_atk: 0.08 },
  '*|shot_on_atk':         { goal_atk: 0.35, save_def: 0.48, dead_corner_atk: 0.17 },
  '*|shot_off_atk':        { dead_goalkick_def: 1.0 },
  '*|goal_atk':            { kickoff: 1.0 },
  '*|save_def':            { poss_gk_atk: 1.0 },
  '*|dead_corner_atk':     { shot_on_atk: 0.20, poss_str_atk: 0.28, poss_def_def: 0.28, dead_goalkick_def: 0.12, poss_mid_atk: 0.12 },
  '*|dead_throwin_atk':    { poss_mid_atk: 0.50, poss_def_atk: 0.20, poss_mid_def: 0.22, dead_throwin_atk: 0.08 },
  '*|dead_foul_atk':       { poss_mid_atk: 0.35, poss_str_atk: 0.22, poss_def_def: 0.22, shot_on_atk: 0.18, dead_corner_atk: 0.03 },
  '*|dead_goalkick_def':   { poss_gk_atk: 1.0 },
};

// Stat modifiers for specific transitions (Phase 2)
// Each key is "currentState|nextState". boost raises the probability, resist lowers it.
// Formula: adjustedProb = baseProb ± ((statValue - 5) / 10) * weight
const STAT_INFLUENCES = {
  'poss_str_atk|shot_on_atk':  { boost: { stat: 'shooting', role: 'str_atk', weight: 0.20 }, resist: { stat: 'strength', role: 'def_def', weight: 0.10 } },
  'shot_on_atk|goal_atk':      { boost: { stat: 'shooting', role: 'str_atk', weight: 0.15 }, resist: { stat: 'reflexes', role: 'gk_def',  weight: 0.20 } },
  'shot_on_atk|save_def':      { boost: { stat: 'reflexes', role: 'gk_def',  weight: 0.18 }, resist: { stat: 'shooting', role: 'str_atk', weight: 0.12 } },
  'poss_str_atk|shot_off_atk': { resist: { stat: 'shooting', role: 'str_atk', weight: 0.15 } },
  'poss_mid_atk|poss_mid_def': { boost: { stat: 'passing',  role: 'mid_def', weight: 0.12 }, resist: { stat: 'passing',  role: 'mid_atk', weight: 0.12 } },
  'poss_mid_atk|poss_mid_atk': { boost: { stat: 'passing',  role: 'mid_atk', weight: 0.10 } },
  'poss_mid_atk|poss_str_atk': { boost: { stat: 'passing',  role: 'mid_atk', weight: 0.10 } },
  'poss_str_atk|poss_def_def': { boost: { stat: 'strength', role: 'def_def', weight: 0.15 }, resist: { stat: 'speed',    role: 'str_atk', weight: 0.10 } },
  'poss_def_atk|poss_mid_def': { boost: { stat: 'passing',  role: 'mid_def', weight: 0.10 }, resist: { stat: 'passing',  role: 'def_atk', weight: 0.08 } },
  'poss_gk_atk|poss_mid_def':  { boost: { stat: 'passing',  role: 'mid_def', weight: 0.08 } },
};
