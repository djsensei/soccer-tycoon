# Balance Knobs

All tunable parameters that affect game difficulty, progression speed, and outcomes. Use the playtest bot (`node tools/playtest-bot/bot.js --runs 100`) to measure impact of changes.

---

## Match Engine (`simulator.js`)

| Knob | Location | What it does |
|---|---|---|
| `POSITION_WEIGHTS` | simulator.js:6 | How much each stat matters per position — shifts which stats are "meta" |
| `MARKOV_TRANSITIONS` | data.js | Base probabilities for possession flow — controls shot frequency, turnover rate, game tempo |
| `STAT_INFLUENCES` | data.js | How player stats bend the Markov probabilities — the core "stats matter" dial |
| `EVENT_SECONDS_PER_STEP` | simulator.js:285 | Clock tick per Markov step (~10s) — fewer seconds = more steps = more goals |
| `goalProb` (shot_on_atk resolution) | simulator.js:343 | Base goal/save/corner split for on-target shots |

## NPC Match Simulation (`simulator.js`)

| Knob | Location | What it does |
|---|---|---|
| Poisson lambda formula | simulator.js:477-478 | `0.5 + difficulty * 0.15` — controls NPC-NPC scorelines and how often strong NPCs beat weak ones |

## Team Difficulty (`data.js`)

| Knob | Location | What it does |
|---|---|---|
| `LEAGUE_DEFINITIONS[].diffMin/diffMax` | data.js:332 | Difficulty range per league — the raw stat range for NPC players |
| Per-team `difficulty` | data.js:340+ (`LEAGUE_TEAMS`) | Individual NPC difficulty (stat generation uses `d ± 1`) |
| League `size` | data.js:332 | Teams per league — more teams = longer seasons, more chances to recover from bad results |

## Player Progression

| Knob | Location | What it does |
|---|---|---|
| `STAT_MILESTONES` thresholds | data.js:48 | Career stat thresholds for +1 stat bonuses — lower = faster power curve, higher = slower |
| Starting stat budget | screens/newgame.js | 22 points across 7 stats (wizard) — higher budget = easier early game |
| Stat generation range for NPCs | init.js:8,43 | `d + random(3) - 1` — tighter range = more predictable NPC strength |

## Gear & Economy

| Knob | Location | What it does |
|---|---|---|
| `PACK_TYPES[].weights` | data.js:217 | Rarity drop rates per pack type — the core loot economy lever |
| `PACK_TYPES[].cardsPerPack` | data.js:217 | Cards per opening — more cards = faster gear accumulation |
| `LEAGUE_PACK_REWARDS` | data.js:397 | Which pack you earn per win/tie/loss per league — controls reward scaling |
| Card `statBonuses` | data.js:58+ (`CARDS`) | Individual card power levels — epic/legendary bonuses drive late-game power |
| Forge cost (hardcoded 3) | simulator.js:527 | Cards needed to forge up — lower = faster rarity climb |
| Glove weight in packs | simulator.js:581 | Gloves get 1/4 weight — controls GK gear availability |

## Fan System (cosmetic, but tracked)

| Knob | Location | What it does |
|---|---|---|
| `FAN_BASE` | data.js:233 | Base fan reward per league tier |
| `FAN_MULTIPLIERS` | data.js:242 | Outcome multipliers (bigWin 2x, loss -0.5x, etc.) |
| `EVENT_FAN_DELTAS` | data.js:510 | Per-event fan changes (goals, saves, etc.) |
| `FAN_EVENT_TIER_SCALE` | data.js:520 | Tier multiplier on per-event deltas |

## Season Structure

| Knob | Location | What it does |
|---|---|---|
| Promotion = 1st place only | screens/match.js:263 | Strictness of promotion — could allow top-2, etc. |
| Relegation = last place only | screens/match.js:265 | Strictness of relegation — could relegate bottom-2 |
| Mid-table = replay same league | screens/table.js:173 | No penalty for finishing mid — could add fatigue, stat decay, etc. |

---

## Quick-Impact Levers

The five knobs with the most direct effect on overall difficulty:

1. **`STAT_MILESTONES` thresholds** — Most direct control over power curve. Lower thresholds = player gets stronger faster = easier game.
2. **`LEAGUE_DEFINITIONS` difficulty ranges** — Widen the gap between leagues for harder progression, narrow it for smoother.
3. **`PACK_TYPES` weights** — Shift rarity odds to control how fast gear improves.
4. **NPC Poisson lambda** — `0.5 + difficulty * 0.15` is the NPC scoring formula. Higher coefficient = NPC teams score more = harder standings competition.
5. **League size** — Fewer teams = fewer matches to prove yourself = more variance in outcomes.

---

## Baseline (2026-03-09, 100 runs, random bot)

```
Outcomes:       91% game-win, 9% relegated
Matches:        mean 53, median 52, min 5, max 91
Seasons:        mean 6, median 6
Win rate:       local 70%, regional 77%, state 80%, national 75%, international 78%
Milestones:     mean 26 per run
Cards earned:   mean 156, forged 66
```
