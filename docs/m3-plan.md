# M3 — Progression & Simulation: Implementation Plan

## Context

M3 introduces fan-based progression gating and overhauls the match simulation engine. The current simulator (`simulator.js`) uses independent random rolls per event with fixed probabilities. This plan replaces it with a second-order Markov chain where ball position, possession, and recent history drive transitions — with player stats as probability multipliers. Fan tiers gate opponent access, and in-match fan events make dramatic moments move the fan counter live.

Implement in four phases. Each phase produces a working game — no phase depends on a later phase being incomplete.

---

## Phase 1: Fan Tier Progression System

### 1a. Data (`data.js`)

Add constants:

```js
const FAN_TIERS = {
  local:         { label: 'Local',         min: 0,      max: 4999   },
  regional:      { label: 'Regional',      min: 5000,   max: 49999  },
  national:      { label: 'National',      min: 50000,  max: 249999 },
  international: { label: 'International', min: 250000, max: 999999 },
};
const TIER_ORDER = ['local', 'regional', 'national', 'international'];

// Opponent tier -> required fan tier to challenge
const TIER_UNLOCK = { local: 'local', national: 'regional', international: 'national' };
```

Note: fan tiers (local/regional/national/international) are the *player's* progression level. Opponent tiers (`local`/`national`/`international`/`special`) are team categories. They share names but are independent concepts.

### 1b. Helpers (`utils.js`)

Add these functions:

- `currentFanTier(fans)` — returns tier key from fan count
- `requiredTierForOpponent(opponent)` — for regular teams uses `TIER_UNLOCK[opponent.tier]`; for specials: difficulty <=6 -> regional, <=8 -> national, 9+ -> international
- `isOpponentUnlocked(opponent, fans)` — compares player's tier index to required tier index
- `tierProgress(fans)` — returns `{ tier, pct, nextTier }` for progress bar rendering

### 1c. Hub screen (`screens/hub.js`)

- Show current tier badge + progress bar below the fan count display
- Display "Next: {tier} at {threshold}" hint, or "MAX TIER" at international

### 1d. Match select (`screens/matchselect.js`)

- Show **all** available teams (not just unlocked ones)
- Locked teams render greyed out with a lock icon + required tier label
- No click handler on locked cards

### 1e. Styles (`style.css`)

- `.tier-display`, `.tier-progress-bar`, `.tier-progress-fill`
- `.opponent-card.locked` — reduced opacity, no pointer cursor
- `.lock-hint` — small text on locked cards

### Save compatibility

No migration needed. Fan tier is derived at runtime from `fans` via `currentFanTier()`.

---

## Phase 2: Second-Order Markov Chain Simulation Engine

### 2a. State model

States represent ball position. Written from the possessing team's perspective (`atk`/`def`), then resolved to `player`/`opponent` at runtime. This halves the transition table.

| State | Meaning |
|-------|---------|
| `kickoff` | Ball at center, about to be played |
| `poss_gk_atk` | Attacking team's GK has the ball |
| `poss_def_atk` | Attacking team's defender has it |
| `poss_mid_atk` | Attacking team's midfielder has it |
| `poss_str_atk` | Attacking team's striker has it |
| `shot_on_atk` | Shot on target by attacking team |
| `shot_off_atk` | Shot off target (miss) |
| `goal_atk` | Goal scored (terminal -> resets to kickoff) |
| `save_def` | Defending GK saved the shot |
| `dead_corner_atk` | Corner kick for attacking team |
| `dead_throwin_atk` | Throw-in for attacking team |
| `dead_foul_atk` | Free kick for attacking team |
| `dead_goalkick_def` | Goal kick for defending team |

When possession changes (e.g., a state resolves to `poss_mid_def`), the engine swaps which physical team is "atk" and remaps the state to `poss_mid_atk` from the new possessor's perspective.

M1 and M2 share one state (`poss_mid`) since they occupy the same zone. Which specific midfielder is involved is resolved when generating the narrative event, not in the Markov chain.

### 2b. Second-order lookup

The transition table is keyed by `"prevState|currentState"`:

```js
const MARKOV_TRANSITIONS = {
  // Second-order entries: history matters
  "kickoff|poss_mid_atk":           { poss_str_atk: 0.20, poss_mid_atk: 0.25, poss_def_atk: 0.15, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.05 },
  "poss_mid_atk|poss_str_atk":      { shot_on_atk: 0.35, shot_off_atk: 0.15, poss_mid_atk: 0.15, poss_def_def: 0.20, dead_corner_atk: 0.08, dead_foul_atk: 0.07 },
  "poss_def_def|poss_str_atk":      { shot_on_atk: 0.15, shot_off_atk: 0.15, poss_mid_atk: 0.10, poss_def_def: 0.40, dead_foul_atk: 0.15, dead_corner_atk: 0.05 },

  // First-order fallbacks (wildcard prev state)
  "*|poss_mid_atk":                  { poss_str_atk: 0.22, poss_mid_atk: 0.20, poss_def_atk: 0.13, poss_mid_def: 0.25, poss_def_def: 0.12, dead_throwin_atk: 0.04, dead_foul_atk: 0.04 },
  // ... etc
};
```

Lookup order: try `MARKOV_TRANSITIONS[prev + "|" + current]`, fall back to `"*|" + current`.

Estimated size: ~50 explicit second-order entries + ~15 wildcard fallbacks. Each entry has 3-7 possible next states.

### 2c. Stat influences

Player stats act as modifiers on specific transitions. Stored separately in `data.js`:

```js
const STAT_INFLUENCES = {
  "poss_str_atk|shot_on_atk": {
    boost:  { stat: 'shooting', role: 'str_atk', weight: 0.20 },
    resist: { stat: 'strength', role: 'def_def', weight: 0.10 },
  },
  "shot_on_atk|goal_atk": {
    boost:  { stat: 'shooting', role: 'str_atk', weight: 0.15 },
    resist: { stat: 'reflexes', role: 'gk_def', weight: 0.20 },
  },
  "poss_mid_atk|poss_mid_def": {
    boost:  { stat: 'passing', role: 'mid_def', weight: 0.12 },
    resist: { stat: 'passing', role: 'mid_atk', weight: 0.12 },
  },
  // ... etc
};
```

**Formula:** `adjustedProb = baseProb + ((statValue - 5) / 10) * weight` for boosts, minus for resists. Then normalize the full distribution to sum to 1.0.

**Role keys** (`gk_atk`, `def_atk`, `mid_atk`, `str_atk` + `_def` variants) map to position slots via existing `slotPlayer()` + `effectiveStats()`.

### 2d. Event generation from transitions

Each state transition maps to a `MatchEvent` using existing narrative keys:

| Transition | type | outcome | narrative key |
|------------|------|---------|---------------|
| `poss_mid -> poss_str` (same team) | `pass` | `success` | `pass-success` |
| `poss_mid_atk -> poss_mid_def` | `pass` | `fail` | `pass-fail` |
| `poss_* -> poss_def_def` (tackle) | `tackle` | `success` | `tackle-success` |
| `poss_str -> shot_on` | `shot` | (pending) | — |
| `poss_str -> shot_off` | `shot` | `miss` | `shot-miss` |
| `shot_on -> goal` | `goal` | — | `goal-player` / `goal-opponent` |
| `shot_on -> save` | `shot` | `saved`/`greatSave` | `shot-saved` / `shot-greatSave` |
| `* -> dead_corner` | `corner` | — | `corner` |
| `* -> dead_throwin` | `throwin` | — | `throwin` |
| `* -> dead_foul` | `foul` | — | `foul` |

**Great save detection:** if the stat-adjusted goal probability was >55% but save happened, mark `greatSave` and set `isHighlight: true`.

### 2e. Simulator rewrite (`simulator.js`)

**Rewrite:** `simulateMatch()` — replace the random-roll loop with the Markov walker.

**Keep unchanged:** `positionScore()`, `teamStrengths()`, `slotPlayer()`, `roll()` (reused for kickoff possession), `eventNarrativeKey()`, `renderEventText()`, `narrativeFor()`, `calculateFanDelta()` (refactored in Phase 3), `getPackReward()`, `openPack()`.

**New internal functions:**
- `sampleDistribution(dist)` — weighted random pick from a `{ state: prob }` object
- `applyStatModifiers(prevState, currentState, baseDist, atkStats, defStats)` — applies `STAT_INFLUENCES` and normalizes
- `transitionToEvent(minute, prevState, currentState, nextState, possessingTeam, atkTeam, defTeam)` — maps a transition to a `MatchEvent` object

**Algorithm outline:**
1. Pre-compute effective stats for both teams
2. Generate 26-35 event minutes spread across 90 min
3. Start at `kickoff`, determine first possession via midfield `roll()`
4. For each minute: look up `(prev, current)` distribution -> apply stat modifiers -> sample next state -> generate event -> handle goals (reset to kickoff) and possession changes (swap atk/def)
5. Inject halftime/fulltime events at appropriate minutes

### 2f. Files changed
- `data.js` — add `MARKOV_TRANSITIONS`, `STAT_INFLUENCES`
- `simulator.js` — rewrite `simulateMatch()`, add `sampleDistribution()`, `applyStatModifiers()`, `transitionToEvent()`

---

## Phase 3: In-Match Fan Events

### 3a. Fan deltas on events (`data.js`)

```js
const EVENT_FAN_DELTAS = {
  'goal_player':        { base: 150, variance: 50 },   // +100 to +200
  'goal_opponent':      { base: -100, variance: 30 },   // -70 to -130
  'greatSave_player':   { base: 80,  variance: 20 },    // player's GK great save
  'greatSave_opponent': { base: -40, variance: 10 },    // opponent GK denies us
  'tackle_success':     { base: 15,  variance: 10 },    // small boost
  'shot_miss_player':   { base: -10, variance: 5 },     // mild disappointment
};

const FAN_EVENT_TIER_SCALE = { local: 0.5, national: 1.0, international: 2.0, special: 1.5 };
```

The simulator attaches `fanDelta` to events (still pure — just a number). The fulltime event gets a margin bonus (refactored from current `calculateFanDelta()`).

### 3b. Total fan delta replaces post-match calculation

Currently `goToResults()` calls `calculateFanDelta(tier, pScore, oScore, base)`. Replace with:

```js
const totalFanDelta = result.events.reduce((sum, e) => sum + (e.fanDelta || 0), 0);
```

Refactor `calculateFanDelta()` to compute only the fulltime margin bonus (which gets attached to the fulltime event's `fanDelta` inside the simulator).

### 3c. Live fan ticker (`screens/match.js`)

- Add a `fan-ticker` element to the match header showing running fan count + cumulative delta
- Update on each event during `startMatchPlayback()` — accumulate `runningFanDelta`
- Flash animation on events with `|fanDelta| > 50`
- `skipToEnd()` totals all deltas at once

### 3d. Files changed
- `data.js` — add `EVENT_FAN_DELTAS`, `FAN_EVENT_TIER_SCALE`
- `simulator.js` — attach `fanDelta` to events in `transitionToEvent()`; refactor `calculateFanDelta()` into margin-only bonus for fulltime event
- `screens/match.js` — fan ticker UI + live updates during playback
- `screens/prematch.js` / `screens/results.js` — use summed event deltas instead of `calculateFanDelta()`
- `style.css` — fan ticker styles, flash animation

---

## Phase 4: Special Team Unique Rewards

### 4a. Unique cards (`data.js`)

Add 5 new legendary cards, one per special team:

| Special Team | Unique Card | Slot | Key Bonus |
|---|---|---|---|
| Robo-Kickers | Robo Arm | gloves | reflexes +5 |
| Alien All-Stars | Gravity Boots | feet | speed +4, shooting +2 |
| Dinosaur FC | Dino Stomp Cleats | feet | strength +5, height +2 |
| The Grandmas | Grandma's Lucky Scarf | head | luck +6 |
| Shadow Squad | Shadow Cloak | body | speed +4, passing +3 |

(Names/stats are suggestions — tune as desired.)

### 4b. Special team data

Add a `uniqueCardId` field to each special team definition in `OPPONENT_TEAMS` (in `data.js`).

### 4c. Pack logic (`simulator.js`)

In `openPack()`: if the pack was earned by defeating a special team, replace one rolled card with the team's `uniqueCardId`. Track this by passing the defeated opponent's ID through `getPackReward()` to `openPack()`.

### 4d. Files changed
- `data.js` — 5 new cards in `CARDS`, `uniqueCardId` on special team entries
- `simulator.js` — modify `openPack()` to inject unique card on special team defeat

---

## Verification checklist

After each phase, open `index.html` in browser and test:

1. **Phase 1:** Start new game -> hub shows tier + progress bar -> match select shows locked teams greyed out -> gain fans -> tier unlocks new opponents
2. **Phase 2:** Play a match -> events display correctly with narrative text -> scores are reasonable (1-4 goals typical) -> no console errors -> `simulateMatch()` works in console
3. **Phase 3:** During match, fan ticker updates live -> dramatic moments flash -> results screen shows correct total delta matching sum of event deltas
4. **Phase 4:** Beat a special team -> pack contains unique card -> card equippable from inventory

## Key files reference

| File | Role |
|------|------|
| `simulator.js` | Match engine — pure functions, zero DOM. **Core rewrite target.** |
| `data.js` | Static content. **4 new data structures added.** |
| `utils.js` | Shared helpers. **Tier functions added.** |
| `state.js` | `gameState`, `updateState()`, render router. Unchanged. |
| `init.js` | New game creation, opponent generation. Unchanged. |
| `screens/hub.js` | Hub screen. **Tier display added.** |
| `screens/matchselect.js` | Opponent picker. **Locked team rendering.** |
| `screens/match.js` | Match playback. **Fan ticker added.** |
| `screens/prematch.js` | Pre-match. **Fan delta source changed.** |
| `screens/results.js` | Results. **Fan delta source changed.** |
| `style.css` | Styles. **Tier + ticker + locked card styles.** |
| `docs/data-models.md` | Schemas. **Update MatchEvent with fanDelta field.** |
