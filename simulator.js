// ============================================================
// simulator.js — Match engine. Pure functions. Zero DOM.
// ============================================================

// How much each stat contributes per position slot
const POSITION_WEIGHTS = {
  GK: { reflexes: 4, height: 3, strength: 1, luck: 1 },
  D:  { strength: 3, height: 2, speed: 1,    luck: 1 },
  M1: { passing: 3,  speed: 2,  strength: 1, luck: 1 },
  M2: { passing: 3,  speed: 2,  strength: 1, luck: 1 },
  S:  { shooting: 4, speed: 2,  luck: 2 },
};

// Score a player's contribution in a given position slot
function positionScore(player, position) {
  if (!player) return 3; // fallback if slot is empty
  const stats   = effectiveStats(player);
  const weights = POSITION_WEIGHTS[position];
  let total = 0, weightSum = 0;
  for (const [stat, w] of Object.entries(weights)) {
    total += (stats[stat] || 0) * w;
    weightSum += w;
  }
  return total / weightSum;
}

// Look up the player object occupying a given slot
function slotPlayer(team, slot) {
  const id = team.slots[slot];
  return team.players.find(p => p.id === id) || null;
}

// Aggregate team strength across all dimensions
function teamStrengths(team) {
  const gk = positionScore(slotPlayer(team, 'GK'), 'GK');
  const d  = positionScore(slotPlayer(team, 'D'),  'D');
  const m1 = positionScore(slotPlayer(team, 'M1'), 'M1');
  const m2 = positionScore(slotPlayer(team, 'M2'), 'M2');
  const s  = positionScore(slotPlayer(team, 'S'),  'S');
  return {
    attack:   (s * 2 + m1 + m2) / 4,
    midfield: (m1 + m2) / 2,
    defense:  (d + gk * 1.5) / 2.5,
    gk,
    striker:  s,
  };
}

// Weighted coin flip: teamStat vs opponentStat, luck shifts odds slightly
function roll(teamStat, opponentStat, luckBonus = 0) {
  const total  = Math.max(teamStat + opponentStat, 0.1);
  const chance = Math.min(0.93, Math.max(0.07, (teamStat / total) + luckBonus * 0.04));
  return Math.random() < chance;
}

// Fill a narrative template with variables
function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '?');
}

// Pick a random narrative string for an event
function narrativeFor(key, vars) {
  const templates = NARRATIVE[key];
  if (!templates || templates.length === 0) return '';
  return fill(pick(templates), vars);
}

// ---------------------------------------------------------------
// Markov Chain helpers (Phase 2)
// ---------------------------------------------------------------

// Weighted random sample from a { state: probability } distribution
function sampleDistribution(dist) {
  const r = Math.random();
  let cumulative = 0;
  const entries = Object.entries(dist);
  for (const [state, prob] of entries) {
    cumulative += prob;
    if (r < cumulative) return state;
  }
  return entries[entries.length - 1][0]; // fallback to last
}

// Build per-role effective stats for a team (used by stat modifier system)
function buildTeamRoles(team) {
  const gkPlayer  = slotPlayer(team, 'GK');
  const defPlayer = slotPlayer(team, 'D');
  const m1Player  = slotPlayer(team, 'M1');
  const m2Player  = slotPlayer(team, 'M2');
  const strPlayer = slotPlayer(team, 'S');

  const gkStats  = gkPlayer  ? effectiveStats(gkPlayer)  : {};
  const defStats = defPlayer ? effectiveStats(defPlayer) : {};
  const strStats = strPlayer ? effectiveStats(strPlayer) : {};

  // Average midfield stats across M1 and M2
  const m1Stats = m1Player ? effectiveStats(m1Player) : null;
  const m2Stats = m2Player ? effectiveStats(m2Player) : null;
  const midStats = {};
  for (const s of STATS) {
    const v1 = m1Stats ? (m1Stats[s] || 0) : 5;
    const v2 = m2Stats ? (m2Stats[s] || 0) : 5;
    midStats[s] = (v1 + v2) / 2;
  }

  return { gk: gkStats, def: defStats, mid: midStats, str: strStats };
}

// Look up a specific stat value from the role-based stats object
// Role format: "pos_side" e.g. "str_atk", "gk_def", "mid_atk"
function getStatByRole(stat, role, atkRoles, defRoles) {
  const parts = role.split('_');
  const side  = parts[parts.length - 1]; // 'atk' or 'def'
  const pos   = parts.slice(0, -1).join('_'); // 'gk', 'def', 'mid', 'str'
  const roles = side === 'atk' ? atkRoles : defRoles;
  const playerStats = roles[pos] || {};
  return playerStats[stat] || 5; // default 5 = neutral
}

// Apply STAT_INFLUENCES modifiers to a base distribution and normalise
function applyStatModifiers(prevState, currentState, baseDist, atkRoles, defRoles) {
  const adjusted = {};
  for (const [nextState, baseProb] of Object.entries(baseDist)) {
    const key       = `${currentState}|${nextState}`;
    const influence = STAT_INFLUENCES[key];
    let adj = baseProb;
    if (influence) {
      if (influence.boost) {
        const val = getStatByRole(influence.boost.stat, influence.boost.role, atkRoles, defRoles);
        adj += ((val - 5) / 10) * influence.boost.weight;
      }
      if (influence.resist) {
        const val = getStatByRole(influence.resist.stat, influence.resist.role, atkRoles, defRoles);
        adj -= ((val - 5) / 10) * influence.resist.weight;
      }
    }
    adjusted[nextState] = Math.max(0.005, adj); // prevent zero/negative
  }
  // Normalise so probabilities sum to 1
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  for (const k in adjusted) adjusted[k] /= total;
  return adjusted;
}

// Map a state transition to a MatchEvent object. Returns null for quiet transitions.
function buildEvent(minute, prevState, currentState, nextState,
                    atkTeam, defTeam, playerTeam, opponentTeam,
                    atkIsPlayer, goalProbWhenShotWasTaken,
                    playerScore, opponentScore) {
  const teamKey = atkIsPlayer ? 'player' : 'opponent';

  const atkStriker = slotPlayer(atkTeam, 'S');
  const atkMid     = Math.random() < 0.5 ? slotPlayer(atkTeam, 'M1') : slotPlayer(atkTeam, 'M2');
  const atkDef     = slotPlayer(atkTeam, 'D');
  const atkGK      = slotPlayer(atkTeam, 'GK');
  const defDef     = slotPlayer(defTeam, 'D');

  const baseMeta = {
    teamName:         atkTeam.name,
    opponentName:     defTeam.name,
    playerTeamName:   playerTeam.name,
    opponentTeamName: opponentTeam.name,
    playerScore,
    opponentScore,
  };

  function ev(type, outcome, isHighlight, playerName, extra = {}) {
    return {
      minute, team: teamKey, type, outcome, isHighlight, fanDelta: 0,
      meta: { ...baseMeta, playerName, ...extra },
    };
  }

  // --- Goal ---
  if (nextState === 'goal_atk') {
    return ev('goal', atkIsPlayer ? 'player' : 'opponent', true, atkStriker?.name, { playerId: atkStriker?.id });
  }

  // --- Shot saved (possibly great save) ---
  if (nextState === 'save_def') {
    const defGK = slotPlayer(defTeam, 'GK');
    // Great save: if goal probability was >55% but keeper saved it
    const great = goalProbWhenShotWasTaken != null && goalProbWhenShotWasTaken > 0.55;
    return ev('shot', great ? 'greatSave' : 'saved', great, atkStriker?.name, { playerId: atkStriker?.id, savingPlayerId: defGK?.id });
  }

  // --- Shot off target (miss) ---
  if (nextState === 'shot_off_atk') {
    return ev('shot', 'miss', false, atkStriker?.name, { playerId: atkStriker?.id });
  }

  // --- shot_on_atk as next: quiet state, resolved inline in simulator ---
  if (nextState === 'shot_on_atk') return null;

  // --- Set pieces ---
  if (nextState === 'dead_corner_atk') return ev('corner',  'event', false, null);
  if (nextState === 'dead_throwin_atk') return ev('throwin', 'event', false, null);
  if (nextState === 'dead_foul_atk')   return ev('foul',    'event', false, defDef?.name);

  // --- Tackle (defender wins the ball) ---
  if (nextState === 'poss_def_def') {
    return ev('tackle', 'success', false, defDef?.name, { playerId: defDef?.id });
  }

  // --- Midfield interception (pass fail) ---
  if (nextState === 'poss_mid_def') {
    const passer = currentState === 'poss_str_atk' ? atkStriker
                 : currentState === 'poss_def_atk' ? atkDef
                 : atkMid;
    return ev('pass', 'fail', false, passer?.name, { playerId: passer?.id });
  }

  // --- Possession-change states that don't need events ---
  if (nextState === 'poss_gk_def' || nextState === 'dead_goalkick_def') return null;

  // --- Forward passes within the same team ---
  if (nextState && nextState.endsWith('_atk') && currentState && currentState.endsWith('_atk')
      && !nextState.startsWith('shot') && !nextState.startsWith('goal') && !nextState.startsWith('dead')) {
    const passer = currentState === 'poss_gk_atk'  ? atkGK
                 : currentState === 'poss_def_atk'  ? atkDef
                 : currentState === 'poss_str_atk'  ? atkStriker
                 : atkMid;
    return ev('pass', 'success', false, passer?.name, { playerId: passer?.id });
  }

  return null; // No event for this transition
}

// Compute fan delta for a single event
function computeEventFanDelta(event, atkIsPlayer, tierScale) {
  let key = null;
  if (event.type === 'goal')   key = event.outcome === 'player' ? 'goal_player' : 'goal_opponent';
  if (event.type === 'shot' && event.outcome === 'greatSave') {
    key = atkIsPlayer ? 'greatSave_opponent' : 'greatSave_player'; // atkIsPlayer = attacker who was denied
  }
  if (event.type === 'tackle' && event.outcome === 'success' && !atkIsPlayer) key = 'tackle_success';
  if (event.type === 'shot' && event.outcome === 'miss' && atkIsPlayer) key = 'shot_miss_player';

  const spec = key ? EVENT_FAN_DELTAS[key] : null;
  if (!spec) return 0;
  const raw = spec.base + (Math.random() * 2 - 1) * spec.variance;
  return Math.round(raw * tierScale);
}

// Derive outcome key from final score
function computeOutcome(playerScore, opponentScore) {
  const diff = playerScore - opponentScore;
  if      (diff >= 3)  return 'bigWin';
  else if (diff > 0)   return 'win';
  else if (diff === 0) return 'tie';
  else if (diff >= -2) return 'loss';
  else                 return 'bigLoss';
}

// ---------------------------------------------------------------
// Main simulation function — Markov chain (Phase 2+3)
// Returns { events: MatchEvent[], playerScore, opponentScore }
// ---------------------------------------------------------------
function simulateMatch(playerTeam, opponentTeam) {
  const events = [];
  let playerScore   = 0;
  let opponentScore = 0;

  // Pre-compute role stats for both teams
  const playerRoles   = buildTeamRoles(playerTeam);
  const opponentRoles = buildTeamRoles(opponentTeam);

  // Kickoff possession determined by midfield strength
  const ps = teamStrengths(playerTeam);
  const os = teamStrengths(opponentTeam);
  let atkIsPlayer = roll(ps.midfield, os.midfield);

  // State tracking
  let prevState    = 'kickoff';
  let currentState = 'poss_mid_atk';
  let halfAdded    = false;

  // Tier scale for per-event fan deltas
  const tierScale = FAN_EVENT_TIER_SCALE[opponentTeam.tier] || 1.0;

  // Game clock — each Markov step advances by a random duration.
  // Tune EVENT_SECONDS_PER_STEP to control match pacing / average score.
  const MATCH_SECONDS          = 5400; // 90 min × 60 s
  const EVENT_SECONDS_PER_STEP = 10;   // mean seconds per step (~540 steps/match)
  let gameClockSeconds = 0;

  // Kickoff event
  events.push({
    minute: 0, second: 0, team: 'player', type: 'kickoff', outcome: 'start',
    isHighlight: false, fanDelta: 0,
    meta: {
      playerName: null,
      teamName:         playerTeam.name,
      opponentName:     opponentTeam.name,
      playerTeamName:   playerTeam.name,
      opponentTeamName: opponentTeam.name,
      playerScore: 0, opponentScore: 0,
    },
  });

  while (gameClockSeconds < MATCH_SECONDS) {
    // Advance clock: uniform jitter ±3 s around the mean (min 1 s)
    const stepSeconds    = Math.max(1, EVENT_SECONDS_PER_STEP + Math.floor(Math.random() * 7) - 3);
    gameClockSeconds     = Math.min(MATCH_SECONDS, gameClockSeconds + stepSeconds);
    const minute         = Math.min(90, Math.round(gameClockSeconds / 60));

    // Inject halftime marker at the 45-minute boundary
    if (!halfAdded && gameClockSeconds >= 2700) {
      events.push({
        minute: 45, second: 2700, team: null, type: 'halftime', outcome: null,
        isHighlight: false, fanDelta: 0,
        meta: { playerScore, opponentScore },
      });
      halfAdded = true;
    }

    const atkTeam  = atkIsPlayer ? playerTeam  : opponentTeam;
    const defTeam  = atkIsPlayer ? opponentTeam : playerTeam;
    const atkRoles = atkIsPlayer ? playerRoles  : opponentRoles;
    const defRoles = atkIsPlayer ? opponentRoles : playerRoles;

    // Look up base distribution (second-order, then wildcard fallback)
    const baseDist = MARKOV_TRANSITIONS[`${prevState}|${currentState}`]
                  || MARKOV_TRANSITIONS[`*|${currentState}`];
    if (!baseDist) {
      // Safety fallback
      prevState = currentState;
      currentState = 'poss_mid_atk';
      continue;
    }

    // Apply stat modifiers to distribution
    const modDist  = applyStatModifiers(prevState, currentState, baseDist, atkRoles, defRoles);

    // Sample next state
    let nextState  = sampleDistribution(modDist);
    let goalProb   = null;

    // Inline shot resolution: if shot lands on target, resolve immediately
    // This avoids a "quiet" event slot and creates better drama
    if (nextState === 'shot_on_atk') {
      const shotOnBase = MARKOV_TRANSITIONS['*|shot_on_atk'] || { goal_atk: 0.35, save_def: 0.48, dead_corner_atk: 0.17 };
      const shotOnMod  = applyStatModifiers('poss_str_atk', 'shot_on_atk', shotOnBase, atkRoles, defRoles);
      goalProb  = shotOnMod['goal_atk'] || 0;
      nextState = sampleDistribution(shotOnMod);
      prevState = 'shot_on_atk'; // update prev context for event generation
    }

    // Build event
    const event = buildEvent(
      minute, prevState, currentState, nextState,
      atkTeam, defTeam, playerTeam, opponentTeam,
      atkIsPlayer, goalProb, playerScore, opponentScore
    );

    if (event) {
      event.second = gameClockSeconds;

      // Attach per-event fan delta (Phase 3)
      event.fanDelta = computeEventFanDelta(event, atkIsPlayer, tierScale);

      // Update running score for goal events
      if (event.type === 'goal') {
        if (event.outcome === 'player') playerScore++;
        else opponentScore++;
        event.meta.playerScore   = playerScore;
        event.meta.opponentScore = opponentScore;
      }

      events.push(event);
    }

    // --- Handle state transitions ---
    if (nextState === 'goal_atk') {
      // Team that conceded kicks off next
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'goal_atk';
      currentState = 'kickoff';
    } else if (nextState === 'save_def') {
      // Defending GK has ball → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'save_def';
      currentState = 'poss_gk_atk';
    } else if (nextState === 'shot_off_atk') {
      // Miss → defending GK goal kick → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'shot_off_atk';
      currentState = 'poss_gk_atk';
    } else if (nextState === 'dead_goalkick_def') {
      // Defending team's goal kick → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'dead_goalkick_def';
      currentState = 'poss_gk_atk';
    } else if (nextState === 'poss_def_def') {
      // Defender wins ball → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'poss_def_def';
      currentState = 'poss_def_atk';
    } else if (nextState === 'poss_mid_def') {
      // Midfield turnover → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'poss_mid_def';
      currentState = 'poss_mid_atk';
    } else if (nextState === 'poss_gk_def') {
      // GK intercepts → swap possession
      atkIsPlayer  = !atkIsPlayer;
      prevState    = 'poss_gk_def';
      currentState = 'poss_gk_atk';
    } else {
      prevState    = currentState;
      currentState = nextState;
    }
  }

  // Full time — compute margin-based fan bonus and attach to fulltime event
  const { delta: marginBonus } = calculateFanDelta(
    opponentTeam.tier, playerScore, opponentScore, opponentTeam.fanRewardBase
  );
  events.push({
    minute: 90, second: MATCH_SECONDS, team: null, type: 'fulltime', outcome: null,
    isHighlight: true, fanDelta: marginBonus,
    meta: { playerScore, opponentScore },
  });

  return { events, playerScore, opponentScore };
}

// Narrative text for an event (called by renderer, not simulator)
function eventNarrativeKey(event) {
  if (['kickoff','halftime','fulltime','corner','throwin','foul'].includes(event.type)) return event.type;
  if (event.type === 'pass')   return `pass-${event.outcome}`;
  if (event.type === 'tackle') return `tackle-${event.outcome}`;
  if (event.type === 'shot' && event.outcome === 'miss')      return 'shot-miss';
  if (event.type === 'shot' && event.outcome === 'saved')     return 'shot-saved';
  if (event.type === 'shot' && event.outcome === 'greatSave') return 'shot-greatSave';
  if (event.type === 'goal' && event.outcome === 'player')    return 'goal-player';
  if (event.type === 'goal' && event.outcome === 'opponent')  return 'goal-opponent';
  return null;
}

function renderEventText(event) {
  const key = eventNarrativeKey(event);
  if (!key) return null;
  const m = event.meta;

  // goal templates use absolute names
  if (key === 'goal-player' || key === 'goal-opponent') {
    return narrativeFor(key, {
      player:   m.playerName        || 'Someone',
      team:     m.playerTeamName    || 'Your team',
      opponent: m.opponentTeamName  || 'Them',
    });
  }

  // kickoff uses absolute names too
  if (key === 'kickoff') {
    return narrativeFor(key, {
      team:     m.playerTeamName   || 'Your team',
      opponent: m.opponentTeamName || 'Them',
    });
  }

  // all other events: relative to attacker/defender
  return narrativeFor(key, {
    player:   m.playerName   || 'Someone',
    team:     m.teamName     || 'Your team',
    opponent: m.opponentName || 'Them',
  });
}

// --- Post-match calculations ------------------------------------
function calculateFanDelta(tier, playerScore, opponentScore, fanRewardBase) {
  const base = fanRewardBase || FAN_BASE[tier] || FAN_BASE.local;
  const diff = playerScore - opponentScore;
  let outcomeKey;
  if      (diff >= 3)  outcomeKey = 'bigWin';
  else if (diff > 0)   outcomeKey = 'win';
  else if (diff === 0) outcomeKey = 'tie';
  else if (diff >= -2) outcomeKey = 'loss';
  else                 outcomeKey = 'bigLoss';
  return {
    delta:   Math.round(base * FAN_MULTIPLIERS[outcomeKey]),
    outcome: outcomeKey,
  };
}

function getPackReward(tier, outcomeKey) {
  if (outcomeKey === 'bigLoss') return null; // humiliating defeat, no reward
  const rewards = TIER_PACK_REWARDS[tier];
  if (!rewards) return null;
  if (outcomeKey === 'bigWin' || outcomeKey === 'win') return rewards.win;
  if (outcomeKey === 'tie')                             return rewards.tie;
  return rewards.loss;
}

// Forge: sacrifice 3 same-rarity cards for 1 higher-rarity card
function forgeCards(cardIds) {
  if (!cardIds || cardIds.length !== 3) return { ok: false, error: 'Select exactly 3 cards.' };
  const cards = cardIds.map(id => CARDS[id]);
  if (cards.some(c => !c)) return { ok: false, error: 'Invalid card.' };
  const rarity = cards[0].rarity;
  if (!cards.every(c => c.rarity === rarity)) return { ok: false, error: 'All 3 cards must be the same rarity.' };
  const rarIdx = RARITIES.indexOf(rarity);
  if (rarIdx < 0 || rarIdx >= RARITIES.length - 1) return { ok: false, error: 'Cannot forge legendary cards.' };
  const nextRarity = RARITIES[rarIdx + 1];

  // Eligible: has stat bonuses, not a special unique, matches next rarity
  const uniqueCardIds = new Set(OPPONENT_DEFINITIONS.filter(d => d.uniqueCardId).map(d => d.uniqueCardId));
  const pool = Object.values(CARDS).filter(c =>
    c.rarity === nextRarity && Object.keys(c.statBonuses).length > 0 && !uniqueCardIds.has(c.id)
  );
  if (!pool.length) return { ok: false, error: 'No cards available at the next rarity.' };

  const resultCard = pick(pool);
  return { ok: true, resultCardId: resultCard.id };
}

// Open a pack — returns array of card ids (no duplicates; gloves weighted lower)
// Phase 4: if defeatedOpponentId is provided and that opponent has a uniqueCardId,
// inject the unique card in place of the last drawn card.
function openPack(packTypeId, defeatedOpponentId = null) {
  const pack = PACK_TYPES[packTypeId];
  if (!pack) return [];

  // Eligible cards: anything with actual stat bonuses (exclude zero-stat starting gear)
  // Also exclude special unique cards from the general pool
  const uniqueCardIds = new Set(OPPONENT_DEFINITIONS.filter(d => d.uniqueCardId).map(d => d.uniqueCardId));
  const eligible = Object.values(CARDS).filter(c =>
    Object.keys(c.statBonuses).length > 0 && !uniqueCardIds.has(c.id)
  );
  const drawn = new Set();
  const result = [];

  for (let i = 0; i < pack.cardsPerPack; i++) {
    // Select rarity tier
    const r = Math.random();
    let cumulative = 0;
    let chosenRarity = 'common';
    for (let j = 0; j < RARITIES.length; j++) {
      cumulative += pack.weights[j];
      if (r < cumulative) { chosenRarity = RARITIES[j]; break; }
    }

    // Candidate pool for chosen rarity, excluding already-drawn cards
    let pool = eligible.filter(c => c.rarity === chosenRarity && !drawn.has(c.id));
    if (!pool.length) pool = eligible.filter(c => !drawn.has(c.id));
    if (!pool.length) pool = eligible; // edge case: all drawn

    // Weighted selection: gloves get 1/4 the weight (only GK can use them)
    const weighted = [];
    for (const card of pool) {
      const weight = card.slot === 'gloves' ? 1 : 4;
      for (let w = 0; w < weight; w++) weighted.push(card);
    }

    const card = pick(weighted);
    drawn.add(card.id);
    result.push(card.id);
  }

  // Phase 4: inject unique card for special team defeats
  if (defeatedOpponentId) {
    const oppDef = OPPONENT_DEFINITIONS.find(d => d.id === defeatedOpponentId);
    if (oppDef && oppDef.uniqueCardId && CARDS[oppDef.uniqueCardId]) {
      result[result.length - 1] = oppDef.uniqueCardId; // replace last card
    }
  }

  return result;
}
