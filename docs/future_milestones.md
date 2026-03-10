# Future Milestones

Planned milestones for Soccer Tycoon, with assigned backlog issues.

---

## M5 — Gear Depth & Late-Game Loop *(complete)*

Extend the gear system to keep progression meaningful late in the game, when packs frequently drop low-rarity items.

### Assigned issues
- ~~Item burning / crafting mechanic~~ *(done)*
- ~~Fan acceleration for late-game~~ *(deferred to league/season redesign)*
- ~~Gear Up stat bars & player sprite placeholder~~ *(done)*
- ~~Gear Up layout overhaul~~ *(done — compact slots, inventory cleanup, stat bar cap at 10 with star)*

---

## M6 — Onboarding, Stat Rename & Roster Simplification *(complete)*

Redesign the new-game flow to be more interactive, simplify the roster, rename the height stat, and add stat transparency.

### Assigned issues
- ~~Rename "Height" stat to "Jumping"~~ *(done)*
- ~~Remove bench players — roster is starting 5 only~~ *(done)*
- ~~Interactive player creation wizard (step-by-step, stat allocation)~~ *(done)*
- ~~Player stat detail modal (base/gear/milestone breakdown)~~ *(done)*
- ~~Death screen references manager name~~ *(done)*
- ~~Lower starting player stats~~ *(moot — wizard uses fixed 22-point allocation)*

---

## M7 — League Seasons & Progression *(complete)*

Replaced flat opponent list with structured league/season system: 5 leagues (Local through International), round-robin seasons, standings, promotion, and relegation.

### Assigned issues
- ~~45 NPC teams across 5 geographically-themed leagues~~ *(done)*
- ~~Round-robin season schedule with NPC-NPC match simulation~~ *(done)*
- ~~League standings table screen~~ *(done)*
- ~~Promotion (1st place) + Promotion Pack reward~~ *(done)*
- ~~Relegation (last place) = game over~~ *(done)*
- ~~Win International league = game victory~~ *(done)*
- ~~Fan system now cosmetic (no gameplay gating)~~ *(done)*
- ~~Expanded name generator (60x60 combos)~~ *(done)*
- ~~Save migration from old opponent system~~ *(done)*
- ~~Removed matchselect screen~~ *(done)*

---

## M8 — Playtest Bot & Balance Tooling *(V1 complete)*

Automated bot that plays through the game headlessly, collecting stats for balance analysis. Runs in Node.js (no browser needed) by importing the pure-logic modules.

### V1 — Naive random bot
- ~~Bot script (`tools/playtest-bot/bot.js`) that imports data.js, init.js, simulator.js, utils.js~~ *(done — vm sandbox loader)*
- ~~Randomizes all player creation decisions (stat allocation, names)~~ *(done)*
- ~~Plays every match in the season schedule automatically~~ *(done)*
- ~~Gear strategy: equip highest-rarity items available; forge whenever 3 unused same-rarity cards exist for a slot~~ *(done)*
- ~~Collects stats per run~~ *(done)*:
  - ~~Match records (W/D/L per season, goals scored/conceded)~~ *(done)*
  - ~~Season outcomes (promoted/relegated/mid-table, which matchday)~~ *(done)*
  - ~~Player career stats and milestone timing (which match triggered each milestone)~~ *(done)*
  - ~~Inventory state over time (cards earned, forged, equipped)~~ *(done)*
  - ~~Total matches to win the game (or how far the bot got before relegation)~~ *(done)*
- ~~Runs N simulations and outputs aggregate summary (CSV or JSON)~~ *(done — JSON)*
- ~~CLI: `node tools/playtest-bot/bot.js --runs 100 --output results.json`~~ *(done)*

### V2+ — Configurable & comparative (future)
- Parameterize game config: stat milestone thresholds, opponent difficulties, pack weights, Poisson lambda
- Run batches with different configs and compare outcomes
- Smarter bot strategies (e.g. position-aware stat allocation, targeted forging)
- Dashboard or notebook for visualizing balance data

---

## M9 — Cosmetic Improvements

Visual polish pass: backgrounds, extra screens, title screen, and other cosmetic upgrades.

### Assigned issues
- [UX] Title screen + "Welcome to the league" post-creation flow
