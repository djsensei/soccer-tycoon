# Completed Issues

Archive of resolved backlog items, grouped by date.

## 2026-03-01 (playtest balance & polish)

### [P0] [Balance] Double simulation action durations
**Fix**: Doubled `EVENT_SECONDS_PER_STEP` in `simulator.js` from 5 to 10, halving the number of Markov steps per match (~1080 → ~540). Lowers scores and stat accumulation across the board.

### [P0] [Balance] ~3x player stat milestone thresholds
**Fix**: Approximately tripled all thresholds in `STAT_MILESTONES` in `data.js`, keeping round numbers. E.g. goals: [3,8,15,25,40,60] → [10,25,50,75,120,180], passes: [30,80,150,250,400,600] → [90,250,450,750,1200,1800].

### [P0] [UX] Slow pack opening animation by 0.5x
**Fix**: Doubled card reveal animation duration from 0.5s to 1s in `style.css`, and doubled the per-card stagger delay from 0.3s to 0.6s in `packopen.js`. Legendary pulse delay updated to match.

### [P0] [Stats] Change Shooting abbreviation from SHT to SHO
**Fix**: Updated `STAT_ABBR.shooting` from `'SHT'` to `'SHO'` in `data.js`.

## 2026-02-25 (M5 gear depth)

### [P0] GK row layout breaks with stat bars
**Fix**: Tightened player row layout — reduced row padding and gap (1rem → 0.5rem), shrunk `.pgr-identity` min-width (100px → 80px), removed `flex-wrap` from `.pgr-slots` so gloves no longer wrap to a second line, made `.pgr-stats` flexible (60–90px) instead of rigid. Updated column headers to match. GK row now fits all 4 gear slots + stat bars without overflow.

### [UI] Gear Up layout overhaul
**Fix**: Removed redundant per-slot labels (HEAD/BODY/FEET) from gear cells — column headers suffice. Shrunk gear slot cells and inventory tiles to card-thumbnail size. Inventory now shows only unequipped items as individual tiles (no quantity text — duplicates shown separately to encourage forging). Moved Inventory heading above the box. Fixed horizontal overflow with auto-width players column. Inventory grid fixed to 3 columns.

### [UI] Stat bar cap with star indicator
**Fix**: Stat bars in Gear Up now cap visually at 10 (was scaling to 15). Stats above 10 show a colored star (matching the stat color) with a thin gold border after a full bar. Gives clearer visual feedback on boosted players without bars stretching disproportionately.

## 2026-02-25 (M4 card art & visual identity)

### [P0] Gear stat scaling by rarity
**Fix**: Audited all cards in `data.js` and adjusted `statBonuses` so total stat points always increase with rarity: 1pt common, 2pt uncommon, 4pt rare, 6pt epic, 8pt legendary. Fixed legendaries that previously had the same totals as rares.

### [P0] Remove pixelated rendering for gear-up thumbnails
**Fix**: Removed `image-rendering: pixelated` from gear-slot and inventory thumbnail CSS. Normal (smooth) scaling is now used at small sizes; pixelated rendering reserved for intentional retro contexts only.

### [P0] New Club screen landscape layout
**Fix**: Wrapped player name fields in a `<div class="player-name-grid">` with flex-column base layout. At 768px+ breakpoint, switches to a 2-column CSS grid with the Striker field spanning full width. `.setup-card` max-width bumped to 720px on tablet.

### [P1/M4] Card image infrastructure
**Fix**: Added `cardImage(cardId, size)` helper to `utils.js` returning a `.card-img-wrap` div with `<img>` and graceful fallback (dark placeholder with `?` icon when image is missing). File naming convention: `img/cards/[card-id].png`. Layout doesn't break when images are absent.

### [P1/M4] Pack opening — large card art with rarity glow
**Fix**: Added large card image (160×160) to each revealed card in the pack-open screen via `cardImage(cardId, 'large')`. Added `rarity-${rarity}` CSS class to `.pack-card` for rarity-driven styling: no glow for common/uncommon, `box-shadow` glow for rare/epic, pulsing keyframe animation for legendary.

### [P1/M4] Gear/inventory — small card thumbnails
**Fix**: Added 48×48 card thumbnails to `.inventory-card` rows and `.gear-slot-cell` in the Gear Up screen via `cardImage(cardId, 'small')`.

### [P1/M4] Card sizing standard
**Fix**: Created `docs/art-guide.md` documenting source image dimensions (512×512 generated, displayed at 160×160 large / 48×48 small), naming conventions, and the image processing pipeline.

### [P1/M4] iPad/tablet layout
**Fix**: Added 768px+ CSS breakpoint with wider `.screen` max-width (1024px), wider layout grids for hub roster, gear up, match select, and pack opening. Touch-friendly tap targets for buttons and gear slots.

### [P1/M4] Gear Up slot alignment
**Fix**: Right-justified gear slot cells in player rows using `margin-left: auto` on `.pgr-slots`. All slots are fixed-width (72px base, 80px tablet). GK row uses consistent `['head','body','feet','gloves']` order with column headers aligned above.

### [P1/M4] Gear Up inventory tile view with slot filters
**Fix**: Replaced the conditional "tap a slot" empty state with an always-visible inventory panel. Added filter toggle buttons (All/Head/Body/Feet/Gloves), tile grid sorted by rarity, and column headers above player rows. Selecting a gear slot auto-sets the filter to match. Tiles show card thumbnail, name, and quantity.

### [P1/M4] Gear Up item detail modal
**Fix**: Added a centered modal overlay (`buildCardModal()` in `gear.js`) triggered by clicking any inventory tile or equipped gear slot. Shows large card image, rarity badge, slot label, name, flavour text, bonuses, and quantity. Context-sensitive Equip/Remove buttons appear when a gear slot is selected and the card matches. Dismissed via X button or clicking the backdrop. Modal state managed by `_modalCard` module variable; wrapper functions (`equipGearFromModal`/`unequipGearFromModal`) clear modal before state update to avoid double-render.

### [P1/M4] Image processing pipeline
**Fix**: Created `tools/img-pipeline/process.py` — takes raw SD outputs from `input/`, removes background via `rembg`, resizes/pads to 512×512 transparent PNG, and saves to `img/cards/[card-id].png`. Managed with `uv`.

## 2026-02-23 (M3 fan tiers, Markov sim, match events)

### [P1/M3] Fan tier / progression system
**Fix**: Added `FAN_TIERS` and `TIER_ORDER` to `data.js` mapping fan count to Local/Regional/National/International tiers. `currentFanTier()`, `tierProgress()`, and `isOpponentUnlocked()` helpers in `utils.js`. Locked opponents greyed out in match select with tier requirement hint. Tier badge + progress bar shown in hub header.

### [P1/M3] In-match fan events
**Fix**: Sim events now carry `fanDelta` values via `EVENT_FAN_DELTAS` in `data.js`, scaled by opponent tier (`FAN_EVENT_TIER_SCALE`). Epic moments (goals, great saves, blunders) move the fan counter live during the match. A fan ticker bar at the top of the match screen flashes on changes.

### [P1/M3] Markov chain simulation engine
**Fix**: Replaced the linear match sim with a second-order Markov chain in `simulator.js`. `MARKOV_TRANSITIONS` table uses `"prevState|currentState"` keys with wildcard fallbacks. `STAT_INFLUENCES` table applies player stat bonuses/penalties to transition probabilities. Match stats (shots, possession, passes) tracked and displayed on results screen.

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
