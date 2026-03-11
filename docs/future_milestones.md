# Future Milestones

Planned milestones for Soccer Tycoon, with assigned backlog issues.

---

## M9 — Cosmetic Improvements

Visual polish pass: backgrounds, extra screens, title screen, and other cosmetic upgrades.

### Assigned issues
- [UX] Title screen + "Welcome to the league" post-creation flow

---

## M10 — Match Engine Rework & Stat Boost Calibration

Rework the match simulation to be less rigid about player roles, and recalibrate the stat milestone system so boosts feel rarer and more exciting.

### Engine flexibility
- Loosen strict role assignments — midfielders and defenders should occasionally shoot, strikers should be involved in buildup play
- Revisit `POSITION_WEIGHTS` and Markov state structure to allow more varied match narratives
- Ensure all positions contribute meaningfully (not just striker = goals, GK = saves)

### Stat boost calibration
- Raise `STAT_MILESTONES` thresholds so boosts are rarer — currently ~26 milestones per full playthrough is too frequent
- Rebalance per-stat thresholds using playtest bot data (goals vs saves vs passes frequency)
- Consider diminishing returns or larger gaps between later thresholds

### UX — milestone presentation
- Make stat boosts feel like a big moment: full-screen celebration, animation, sound cue
- Show milestone progress ("12/25 goals until next shooting boost") somewhere accessible
- Rarer boosts justify flashier presentation — each one should feel like an event

### Match commentary
- Expand `NARRATIVE` templates so the same event type doesn't repeat the same text
- Add context-aware variants (scoreline, minute, player name callbacks)
- More personality and humor in line with the game's silly tone

---

## M11 — NPC Overhaul & Pre-Match Redesign

Full NPC team simulation: real rosters with gear, full match engine for NPC-NPC games, and a redesigned pre-match screen.

### NPC gear
- Assign gear cards to NPC players in `buildLeagueTeam()` based on league tier
- Rarity pool scales up: local = none, regional = common, ... international = rare-epic
- Breaks the stat-10 ceiling for NPCs — effective stats can reach 14+ in upper leagues
- Bot already uses `effectiveStats()` so this flows through simulation automatically

### Adaptive league generation
- Generate NPC rosters (stats + gear) at promotion time, not at game start
- Calibrate to the player's current effective stats — stronger player = tougher league
- Ensures each league is a meaningful step up relative to how the player actually progressed
- Still use league-tier difficulty as a baseline, but scale/jitter around the player's power level
- Per-season jitter (±1) so the same teams aren't always top/bottom in repeat seasons

### Full NPC-NPC match simulation
- Replace Poisson shortcut (`simulateNPCMatch`) with full `simulateMatch()` for NPC-NPC games
- NPC teams have full rosters with stats and gear — real matchups create natural standings separation
- Solves the standings compression problem: no more coin-flip results between uniform-difficulty teams

### Pre-match screen redesign
- Side-by-side roster comparison: player vs opponent, position by position
- Show effective stats (with gear) for both teams — let the player see what they're up against
- Visible gear on NPC players (card names/rarity badges)
- Pre-game commentary: key matchups ("Their striker has 12 shooting vs your GK's 8 reflexes"), form/streaks, notable career stats
- Keep the trash talk — it's fun

---

## M12 — New Gameplay Decisions *(tentative)*

Add meaningful between-match and possibly in-match decisions so the player's choices impact outcomes beyond gear equipping.

### Training focus (between matches)
- After each match, choose a stat to train — gives a small chance for players to permanently improve that stat (not guaranteed, keeps it exciting)
- Alternative: choose to rest instead of training
- Introduces energy/fatigue system that fluctuates over the course of a season — tired players perform worse
- Resting recovers energy; training doesn't (or costs energy)
- Creates a recurring resource tradeoff: push for stat gains vs keep the team fresh for tough upcoming matches
- Season cadence matters: maybe rest before the top-of-table clash, train hard during the easy stretch

### Match tactics cards *(needs more design thinking)*
- Dual-use card system: equip for passive stat bonuses (existing) OR hold in hand for one-time match effects
- Draw a hand of tactic cards before each match from your inventory
- Play cards during the match for powerful one-shot effects (counter attack, defensive wall, lucky bounce, etc.)
- Creates interesting tension: is this epic card better as permanent gear or as a clutch match-winner?
- Builds on existing card/pack infrastructure — no new reward pipeline needed
- **Open questions:** how many cards in hand? When can you play them? Do they get consumed? How does this interact with the auto-playing match?

### Ideas considered but deferred
- **Formation picker:** not enough wiggle room with 4 field players, adds complexity to Markov engine disproportionate to decision depth
- **Transfer market / draft:** may not resonate — players likely get attached to their original roster. Revisit after real playtesting with the target audience

---

## M13 — Playtest Bot V2: Configurable & Comparative

Extend the playtest bot with configurable game parameters and smarter strategies for deeper balance analysis.

### Configurable parameters
- Parameterize game config: stat milestone thresholds, opponent difficulties, pack weights, Poisson lambda
- Run batches with different configs and compare outcomes

### Smarter bot strategies
- Position-aware stat allocation (e.g. prioritize shooting for striker, reflexes for GK)
- Targeted forging (forge cards for weakest positions first)
- Multiple strategy profiles to compare outcomes

### Analysis & visualization
- Dashboard or notebook for visualizing balance data
- Compare win rates, progression speed, and card economy across configs
