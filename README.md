# Soccer Tycoon

A silly, over-the-top soccer management game. Collect gear cards, equip your squad, and climb through five leagues from your local park to the world stage.

## Running Locally

No build step, no dependencies. Just open `index.html` in a browser.

```
git clone https://github.com/djsensei/soccer-tycoon.git
cd soccer-tycoon
open index.html    # or just double-click it
```

Game state saves to `localStorage` automatically.

## Technical Details

Built with plain HTML, CSS, and JavaScript — no frameworks, no bundler, no server. Runs entirely in the browser.

A few things under the hood that were fun to build:

- **Markov chain match engine** — matches play out as a state machine (midfield → attack → shot → goal/save/corner), with player stats bending transition probabilities rather than determining outcomes directly. Every match is calculated, never scripted.
- **Simulator/renderer split** — the match engine is a pure function that returns an event log. The renderer consumes that log for playback. The simulator has zero DOM dependencies and is testable in a console.
- **Single-object state** — all game state lives in one JS object. Every mutation goes through `updateState()`, which saves and re-renders. No reactivity library, just a pattern.
- **NPC league simulation** — other teams play each other using Poisson-distributed scorelines scaled by difficulty ratings. Full round-robin seasons with standings, promotion, and relegation.
- **Card forge economy** — a 3-to-1 rarity upgrade system with stat rerolls, creating real trade-off decisions about when to forge vs. when to keep.
- **Automated balance testing** — a headless playtest bot (`tools/playtest-bot/bot.js`) runs hundreds of full seasons to validate difficulty curves and progression pacing.

## Docs

- [Game Design](docs/game-design.md) — game loop, systems, and tone
- [Architecture](docs/architecture.md) — simulator/renderer split, state management, file structure
- [Data Models](docs/data-models.md) — schemas for game state, cards, matches, leagues
- [Balance Knobs](docs/balance.md) — all tunable parameters and how to test them
- [Art Guide](docs/art-guide.md) — card art pipeline and style reference
