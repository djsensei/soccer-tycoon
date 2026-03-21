# Soccer Tycoon - Project Instructions

## What This Is
A browser-based soccer management game built as a birthday gift for a 10-year-old nephew. Silly, unrealistic, fun — "who would win" books meets tycoon mechanics. No server required; runs entirely in the browser.

## Tech Stack
- Single-page web app: plain HTML + CSS + JavaScript, no framework, no bundler
- Persistence via `localStorage`
- Target: any modern browser, works on tablets

## Design Docs
- [`docs/game-design.md`](docs/game-design.md) — game loop, fan system, opponents, cards, economy, tone
- [`docs/data-models.md`](docs/data-models.md) — all data schemas
- [`docs/architecture.md`](docs/architecture.md) — simulator/renderer split, web architecture, state management

## Planning Docs (local only, not in repo)
- [`docs/internal/backlog.md`](docs/internal/backlog.md) — prioritized issue backlog (P0/P1/P2/P3)
- [`docs/internal/completed_issues.md`](docs/internal/completed_issues.md) — archive of resolved items, grouped by date
- [`docs/internal/future_milestones.md`](docs/internal/future_milestones.md) — planned milestones with assigned issues
- [`docs/internal/playtest_feedback.md`](docs/internal/playtest_feedback.md) — raw playtest notes; triage with `/triage`
- [`docs/internal/dev_ideas.md`](docs/internal/dev_ideas.md) — developer/design ideas not yet triaged into backlog

## Skills
- `/fix-p0` — work through all P0 backlog items and commit fixes
- `/triage` — process playtest feedback into the prioritized backlog

## File Structure
```
soccer-tycoon/
  index.html           # Entry point
  style.css            # All styles
  state.js             # gameState, updateState(), render(), bootstrap + save migrations
  simulator.js         # Match engine — pure functions, zero DOM
  transitions.js       # Markov chain probabilities + stat influences (loaded before data.js)
  data.js              # Content: teams, leagues, gear cards, packs, version constant
  commentary.js        # Match commentary templates (rarity-bucketed) + selection logic
  init.js              # New game creation, league team + season generation, NPC gear assignment
  utils.js             # Shared utilities (effectiveStats, UI helpers, findLeagueTeam)
  save.js              # localStorage save/load helpers
  screens/
    title.js           # Title screen (new game / continue)
    welcome.js         # "Welcome to the League" post-creation interstitial
    newgame.js         # Multi-step creation wizard
    hub.js             # Main hub (roster, league indicator, navigation)
    gear.js            # Gear Up + forge mode
    table.js           # League standings, matchday, NPC results, season-end handling
    prematch.js        # Pre-match roster comparison + commentary
    match.js           # Live match playback + goToResults()
    results.js         # Post-match results + season-end messaging
    packopen.js        # Card pack opening
    gameover.js        # Game over (relegation) + game win
  tools/
    playtest-bot/      # Headless simulation bot (Node.js)
      bot.js           # CLI entry: node tools/playtest-bot/bot.js [--runs N] [--verbose]
      loader.js        # vm sandbox that loads game files without a browser
      strategies.js    # Bot decision-making (random stats, equip best gear, auto-forge)
      stats.js         # Per-run and aggregate stat collection + formatting
    markov-editor/     # Visual Markov graph editor dev tool
    bg-pipeline/       # Card art background generation pipeline
  docs/                # Design documentation
  CLAUDE.md            # This file
```

## Playtest Bot
Run headless simulations to check game balance:
```
node tools/playtest-bot/bot.js --runs 100 --verbose
node tools/playtest-bot/bot.js --runs 50 --output tools/playtest-bot/results.json
```
The bot creates a random team, plays through all seasons (equipping gear, forging cards), and reports outcome distributions, win rates per league, milestone stats, and more.

**Important:** The playtest bot mirrors game logic from `screens/match.js` (goToResults), `screens/table.js` (handleSeasonEnd), and `screens/prematch.js` (kickOff). If you change match simulation, season-end handling, NPC generation, or pack/forge logic, update `bot.js` and `loader.js` to match — they won't pick up screen-layer changes automatically.

## Conventions
- Plain JS only — no frameworks, no npm, no bundler
- Game state is one JS object; mutations go through `updateState()` which saves and re-renders
- Separate content (`data.js`) from logic (`state.js`, `simulator.js`)
- Match outcomes are calculated, never scripted
- `simulator.js` must have zero DOM dependencies — it should be testable in a console
- Keep code readable; a future Claude session may need to pick this up mid-build

## Git Instructions
- Only commit changes to a feature branch, PRs are required to merge to main
- Check which folder you are in before executing git commands - you probably don't need to `cd` and trigger a user approval
- **Before creating a PR**, bump `GAME_VERSION` in `data.js` and run `node tools/version-stamp.js` to update cache-busting query strings in `index.html`. Commit this as part of the branch.
