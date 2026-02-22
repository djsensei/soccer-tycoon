# Architecture

## Web Architecture

### State → Render (one direction)
All game state lives in one `GameState` object. Every mutation goes through a single function:

```js
function updateState(patch) {
  Object.assign(gameState, patch);
  saveToLocalStorage(gameState);
  render();
}
```

No frameworks. No reactivity library. Just a pattern.

### Screens as Render Functions
Each screen (Hub, Match Selection, Match View, Pack Opening) is a function that reads `gameState` and writes HTML into a single `#app` container. Switching screens = calling a different render function.

```js
function showHub() {
  document.getElementById('app').innerHTML = renderHub(gameState);
}
```

### File Responsibilities
| File | Responsibility |
|---|---|
| `index.html` | Shell — loads all scripts, contains `#app` container |
| `style.css` | All styles — card layout, animations, colours |
| `game.js` | `gameState`, `updateState()`, all screen render functions, event handlers |
| `simulator.js` | Match engine — pure functions, **zero DOM dependencies** |
| `data.js` | Static content — gear card definitions, team definitions, narrative templates, pack configs |
| `save.js` | `saveToLocalStorage()`, `loadFromLocalStorage()`, new-game initialisation |

### CSS Approach
- Roster = CSS Grid; player cards are grid items
- Gear slots = nested grid inside each player card
- Pack opening = CSS flip/reveal animation (no JS animation library needed)
- Tablet-friendly sizing throughout

---

## Match Simulator

### Core Principle
**Simulator and renderer are fully decoupled.**

1. Simulator runs the entire match instantly → produces an ordered `MatchEvent[]`
2. Renderer consumes that array → displays it at whatever speed/verbosity/style

This means:
- Result is known before any animation plays
- Simulator is testable in a browser console with no UI
- Renderer can be upgraded (animations, sounds, visuals) without touching simulation logic

### Simulator Contract
```js
// Pure function — no side effects, no DOM
function simulateMatch(playerTeam, opponentTeam) {
  // ...
  return MatchEvent[];
}
```

### How Stats Drive Outcomes
Stats are probability weights, not guarantees. Better stats = better odds, not certainty.

| Stat | Influences |
|---|---|
| Shooting | Probability a shot goes in |
| Reflexes | Probability a save is made |
| Passing | Probability a pass finds its target |
| Strength | Probability of winning a tackle or physical duel |
| Height | Probability of winning headers and corners |
| Speed | Probability of breaking through or catching a run |
| Luck | Small wildcard modifier on any event — upsets live here |

Position slot weights: the simulator applies different stat weights depending on which slot a player occupies. A high-Reflexes player shines in GK; a high-Shooting player shines in S. Any player can play any slot, but the math rewards good fit.

### Renderer v1: Text Log
- Pure function over the event array — no game logic in renderer
- Template strings per event type, filled with player names
- `isHighlight: true` events shown in Highlights mode; all events shown in Full Match mode
- Future renderers (animations, sounds) added without touching simulator

### Event Schema
See [`data-models.md`](data-models.md#matchevent) for the full `MatchEvent` schema.

Key design principle: **the schema is rich enough that the renderer never needs to re-derive what happened.** The renderer is purely presentational.
