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

## Planning Docs
- [`docs/backlog.md`](docs/backlog.md) — prioritized issue backlog (P0/P1/P2/P3)
- [`docs/completed_issues.md`](docs/completed_issues.md) — archive of resolved items, grouped by date
- [`docs/future_milestones.md`](docs/future_milestones.md) — planned milestones with assigned issues
- [`docs/playtest_feedback.md`](docs/playtest_feedback.md) — raw playtest notes; triage with `/triage`
- [`docs/dev_ideas.md`](docs/dev_ideas.md) — developer/design ideas not yet triaged into backlog

## Skills
- `/fix-p0` — work through all P0 backlog items and commit fixes
- `/triage` — process playtest feedback into the prioritized backlog

## File Structure
```
soccer-tycoon/
  index.html           # Entry point
  style.css            # All styles
  game.js              # State, updateState(), render(), screen functions
  simulator.js         # Match engine — pure functions, zero DOM
  data.js              # Content: teams, gear cards, narrative templates, packs
  save.js              # localStorage save/load helpers
  docs/                # Design documentation
  soccer_game_spec.md  # Original design spec (reference only)
  CLAUDE.md            # This file
```

## Conventions
- Plain JS only — no frameworks, no npm, no bundler
- Game state is one JS object; mutations go through `updateState()` which saves and re-renders
- Separate content (`data.js`) from logic (`game.js`, `simulator.js`)
- Match outcomes are calculated, never scripted
- `simulator.js` must have zero DOM dependencies — it should be testable in a console
- Keep code readable; a future Claude session may need to pick this up mid-build
