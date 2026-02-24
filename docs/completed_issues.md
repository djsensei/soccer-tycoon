# Completed Issues

Archive of resolved backlog items, grouped by date.

## 2026-02-23 (M2 core loop)

### [P1/M2] "Start Over" button in hub
**Fix**: Added `startOver()` to `hub.js` — calls `window.confirm()`, then `deleteSave()`, resets `gameState = { screen: 'newgame' }`, and re-renders. Button lives in a new `hub-footer` area (right-aligned, styled as a small danger button).

### [P1/M2] Starting gear is a placeholder, not a card
**Fix**: `makePlayerCharacter()` in `init.js` now sets all gear slots to `null` instead of assigning starting gear card IDs. Empty slots render as grayed-out "Empty" placeholders throughout the UI.

### [P1/M2] Gear Up screen redesign
**Fix**: Replaced the per-player gear modal with a dedicated "Gear Up" screen (`renderGearUp()` in `gear.js`). All players are shown as full-width rows with inline gear slot chips. Clicking a slot selects it and populates the right-hand inventory panel with available cards for that slot, ordered by rarity. Selection state lives in a module-level `_gearSel` variable (not persisted). The old `openGearScreen` function is removed; gear is accessed via a "Gear Up" button in hub-actions.

### [P1/M2] Gloves less frequent in packs
**Fix**: `openPack()` in `simulator.js` now uses weighted selection within the candidate pool: non-gloves cards get weight 4, gloves cards get weight 1. This gives gloves roughly 1/4 the probability of other slot cards, matching the 1-in-5 players who can equip them.

### [P1/M2] No duplicate cards in a single pack
**Fix**: `openPack()` now samples without replacement. A `drawn` Set tracks card IDs already selected; each subsequent draw filters them out. Falls back to any undrawn card if the chosen rarity is exhausted, and allows repeats only as a last resort if the entire eligible pool is consumed.

### [P1/M2] Roster management — position swaps and bench
**Fix**: Hub player cards now trigger `selectForSwap()` on click instead of opening a gear modal. First click selects a player (highlighted in gold, "Swap Mode" badge appears). Second click on a different player performs the swap: starter↔starter swaps slots, starter↔bench replaces the starter slot, bench↔bench does nothing. `_swapTarget` is a module-level variable in `hub.js` (not persisted).

### [P1/M2] Deployment — GitHub Pages + soft password
**Fix**: Added a soft client-side password gate to `index.html` (password: `soccer`). On page load, checks `localStorage` for a cached auth token; if missing, prompts via `window.prompt`. Wrong code wipes the document and throws to halt further execution. GitHub Pages can be enabled in repo settings pointing to `main` branch root — no build step needed.

## 2026-02-23 (M1 bugfixes)

### [P1/M2] Code structure overhaul
**Fix**: Split monolithic `game.js` (745 lines) into focused files: `state.js` (core state + render router), `utils.js` (shared utilities including `effectiveStats`), `init.js` (new game creation), and a `screens/` folder with one file per screen (9 files). Slimmed `save.js` to persistence only. Removed duplicate `getEffectiveStats` from `simulator.js` — both UI and simulator now share the single `effectiveStats` in `utils.js`. Fixed `renderPackOpening` side-effect: pack opening now happens in a dedicated `openNextPack()` handler, not inside the render function.

### [P0] Highlights toggle is not retroactive
**Fix**: Added a `rebuildLog()` function inside `startMatchPlayback()` that clears and re-renders the event log from the full `processedEvents` array. Attached to the toggle's `change` event, so unchecking "Highlights only" mid-match immediately shows all previously processed events.

### [P0] Same card equippable on multiple players
**Fix**: Added `equippedCount(cardId)` to count how many players have a card equipped across all slots, and `availableQty(cardId)` = inventory quantity minus equipped count. `equipGear()` now only allows equipping when `availableQty > 0`. The inventory list in Manage Gear now filters using only `availableQty(i.cardId) > 0`, so an equipped card (with 0 available copies) no longer appears in the list below its slot.

### [P0] Opponent goal narrative has team names swapped
**Fix**: The simulator now stores both relative names (`teamName`/`opponentName`, attacker/defender perspective) and absolute names (`playerTeamName`/`opponentTeamName`, always the human team vs AI team) in every event's `meta`. `renderEventText()` uses absolute names for `goal-player` and `goal-opponent` events, so "Rio Blazers find the net" always refers to Rio Blazers scoring, regardless of who was listed as attacker/defender.

### [P0] Lose condition not checked after match
**Fix**: `goToResults()` now evaluates `newFans < 100` after computing the post-match fan count and routes to `'gameover'` instead of `'results'` if triggered.

### [P0] bigLoss rewards a pack it shouldn't
**Fix**: `getPackReward()` in `simulator.js` checks `if (outcomeKey === 'bigLoss') return null` before consulting `TIER_PACK_REWARDS`, so a humiliating defeat never awards a pack regardless of opponent tier.
