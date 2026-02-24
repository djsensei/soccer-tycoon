# Completed Issues

Archive of resolved backlog items, grouped by date.

## 2026-02-23

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
