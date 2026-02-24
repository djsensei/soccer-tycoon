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
// Main simulation function
// Returns { events: MatchEvent[], playerScore, opponentScore }
// ---------------------------------------------------------------
function simulateMatch(playerTeam, opponentTeam) {
  const events = [];
  const ps = teamStrengths(playerTeam);
  const os = teamStrengths(opponentTeam);

  let playerScore   = 0;
  let opponentScore = 0;

  const totalEvents = 26 + Math.floor(Math.random() * 10); // 26–35 events
  const minutes = Array.from({ length: totalEvents }, (_, i) =>
    Math.min(89, Math.floor((i / totalEvents) * 90) + Math.floor(Math.random() * 4))
  ).sort((a, b) => a - b);

  // Kickoff
  events.push({
    minute: 0, team: 'player', type: 'kickoff', outcome: 'start', isHighlight: false,
    meta: { playerName: null, opponentName: null },
  });

  let halfAdded = false;

  for (const minute of minutes) {
    if (!halfAdded && minute >= 45) {
      events.push({ minute: 45, team: null, type: 'halftime', outcome: null, isHighlight: false, meta: {} });
      halfAdded = true;
    }

    // Possession weighted by midfield
    const playerAttacks = roll(ps.midfield, os.midfield);
    const ats = playerAttacks ? ps : os;
    const dts = playerAttacks ? os : ps;
    const attackingTeam  = playerAttacks ? playerTeam  : opponentTeam;
    const defendingTeam  = playerAttacks ? opponentTeam : playerTeam;
    const teamKey        = playerAttacks ? 'player'    : 'opponent';

    const attStriker = slotPlayer(attackingTeam, 'S');
    const attMid     = slotPlayer(attackingTeam, Math.random() < 0.5 ? 'M1' : 'M2');
    const defGK      = slotPlayer(defendingTeam, 'GK');
    const defD       = slotPlayer(defendingTeam, 'D');

    const aStr = attStriker ? effectiveStats(attStriker) : {};
    const aMid = attMid     ? effectiveStats(attMid)     : {};
    const dGK  = defGK      ? effectiveStats(defGK)      : {};
    const dDef = defD       ? effectiveStats(defD)       : {};

    const actionRoll = Math.random();
    let type, outcome, isHighlight = false, actingPlayer, meta = {};

    if (actionRoll < 0.30) {
      // --- Pass ---
      type = 'pass';
      actingPlayer = Math.random() < 0.6 ? attMid : attStriker;
      const success = roll(aMid.passing || 5, dts.midfield, aMid.luck || 0);
      outcome = success ? 'success' : 'fail';
      meta = { playerName: actingPlayer?.name };

    } else if (actionRoll < 0.50) {
      // --- Tackle ---
      type = 'tackle';
      actingPlayer = defD;
      const success = roll(dDef.strength || 5, ats.attack, dDef.luck || 0);
      outcome = success ? 'success' : 'fail';
      meta = { playerName: actingPlayer?.name };

    } else if (actionRoll < 0.62) {
      // --- Set piece ---
      type = Math.random() < 0.55 ? 'corner' : 'throwin';
      outcome = 'event';
      actingPlayer = null;
      meta = {};

    } else if (actionRoll < 0.68) {
      // --- Foul ---
      type = 'foul';
      outcome = 'event';
      actingPlayer = defD;
      meta = { playerName: actingPlayer?.name };

    } else {
      // --- SHOT ---
      actingPlayer = attStriker;
      const shotOnTarget = roll(
        (aStr.shooting || 5) + (aStr.speed || 5),
        (dDef.strength || 5) + (dDef.height || 5),
        aStr.luck || 0
      );

      if (shotOnTarget) {
        const isGoal = roll(
          (aStr.shooting || 5) + (aStr.luck || 0),
          (dGK.reflexes || 5) + (dGK.height || 5)
        );

        if (isGoal) {
          type = 'goal';
          outcome = playerAttacks ? 'player' : 'opponent';
          isHighlight = true;
          if (playerAttacks) playerScore++;
          else opponentScore++;
        } else {
          type = 'shot';
          const great = Math.random() < 0.4;
          outcome = great ? 'greatSave' : 'saved';
          isHighlight = great;
        }
      } else {
        type = 'shot';
        outcome = 'miss';
      }
      meta = { playerName: actingPlayer?.name };
    }

    events.push({
      minute,
      team: teamKey,
      type,
      outcome,
      isHighlight,
      meta: {
        ...meta,
        teamName:         attackingTeam.name,   // relative: who's attacking
        opponentName:     defendingTeam.name,   // relative: who's defending
        playerTeamName:   playerTeam.name,      // absolute: always the human's team
        opponentTeamName: opponentTeam.name,    // absolute: always the AI team
        playerScore,
        opponentScore,
      },
    });
  }

  // Full time
  events.push({ minute: 90, team: null, type: 'fulltime', outcome: null, isHighlight: true, meta: { playerScore, opponentScore } });

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

  // goal templates use absolute names: {opponent} = the AI team, {team} = the human team
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

// Open a pack — returns array of card ids
function openPack(packTypeId) {
  const pack = PACK_TYPES[packTypeId];
  if (!pack) return [];

  // Eligible cards: anything with actual stat bonuses (exclude zero-stat starting gear)
  const eligible = Object.values(CARDS).filter(c => Object.keys(c.statBonuses).length > 0);

  return Array.from({ length: pack.cardsPerPack }, () => {
    const r = Math.random();
    let cumulative = 0;
    let chosenRarity = 'common';
    for (let i = 0; i < RARITIES.length; i++) {
      cumulative += pack.weights[i];
      if (r < cumulative) { chosenRarity = RARITIES[i]; break; }
    }
    const pool = eligible.filter(c => c.rarity === chosenRarity);
    const fallback = eligible.filter(c => c.rarity === 'common');
    return pick(pool.length ? pool : fallback).id;
  });
}
