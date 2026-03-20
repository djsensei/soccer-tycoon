# Completed Issues

Archive of resolved backlog items, grouped by date.

## 2026-03-19 (M15 playtest batch 1)

### [P0] [UI] Welcome screen font sizes too small
**Fix**: Increased intro slide font sizes ~1.5x: icon 3→4.5rem, headline 1.4→2rem, bullets 1→1.4rem with wider max-width (360→500px). Nav buttons also enlarged (1.2rem, bigger padding). Dots bumped to 12px.

### [P0] [UI] Match Day button width imbalance
**Fix**: Added `.table-split-left .btn-large` rule: `width: 100%; max-width: 280px` so Play Next Match and Gear Up buttons are the same width in the table layout.

### [P0] [UI] Pre-match stat matchup box too wide
**Fix**: Changed tablet prematch grid from `260px 1fr` to `1fr minmax(auto, 520px)`, giving the left column more room. Reduced stats center `min-width` from 180→140px with 220px max. Bumped stat and player name font sizes from 0.7→0.8rem and 0.8→0.9rem.

### [P0] [UI] Training report: left-justify stamina bars
**Fix**: Changed `.training-result-row` from `display: flex` to `display: grid; grid-template-columns: 1fr 70px auto` so the energy bar column is always at a fixed position regardless of outcome text width.

### [P0] [UI] Training report: remove trained-stat acronym from no-improvement rows
**Fix**: Changed no-improvement text from "Trained SPD — no improvement" to just "No improvement" in `renderTrainingResults()`.

### [P0] [UI] Training report: remove "(now X)" parenthetical
**Fix**: Removed the `<span class="training-stat-now">(now ${r.newVal})</span>` from success outcomes in `renderTrainingResults()`. The animated stat bar already shows the current value.

## 2026-03-18 (M15 playtest fixes)

### [P2] [Balance] Tone down first promotion pack rarity
**Fix**: Added `PROMOTION_PACK_WEIGHTS` in `data.js` with per-league rarity tables. Local promotion: best = rare (no epic/legendary). Regional: up to epic. State: original weights. National: heavy epic/legendary. `openPack()` accepts `options.fromLeague` to select the right table. Promotion pack in `table.js` now passes `fromLeague: season.league`. Bot updated to match.

### [P2] Big animations — pack opening, promotion, game win, milestones, training
**Fix**: Five animation systems added:
- **Pack opening**: Rarity-scaled reveals — rare cards get a shake, epic gets slow-mo flip with glow, legendary gets dramatic pause/tremble then burst flip with brightness flash. "NEW!" bouncing badge on first-time cards.
- **Promotion**: Full-screen celebration with animated banner (slide-in + glow) and 30-piece confetti rain in team colors.
- **Game win**: CSS fireworks (6 bursts with radial gradient explosions staggered across the screen) + newspaper slide-up entrance.
- **Milestones**: Stat-colored beam flash behind each card + staggered slide-in from left (0.25s per card).
- **Training stat boost**: Animated stat bar fill-up + number pop with radial color burst in the stat's color.

### [P2] Drag-and-drop gear assignment in Gear Up
**Fix**: Added touch + mouse drag-and-drop to the Gear Up screen. Inventory tiles and equipped gear slots are draggable via `data-drag-*` attributes. Gear slot cells are drop targets via `data-drop-*` attributes. Uses document-level event delegation (survives innerHTML re-renders). 10px movement threshold distinguishes taps from drags — existing click-to-modal flow preserved. Supports: inventory→slot (equip), slot→inventory (unequip), slot→slot (swap between players). Ghost element follows finger/cursor with rarity-colored border. Valid drop targets highlight green. Forge mode and modals suppress drag initiation.

### [P0] [Visual Design] Pre-match screen two-column layout
**Fix**: Restructured prematch into a two-column layout: narrow left column (VS banner, commentary, trash talk, kick-off button), wider right column (player matchups). Stacks to single column on mobile, grid at 768px+. Left column is sticky so kick-off stays visible while scrolling matchups.

### [P0] [Visual Design] Results screen column reallocation
**Fix**: Moved fan delta, milestones, season messages, and navigation to the left column under the newspaper. Moved match stats, per-player performance, and training tips to the right column. Reduces page height by grouping actionable items (packs, nav) closer to the newspaper.

### [P0] [UX] Gear Up modal dismiss on backdrop tap
**Fix**: Already implemented — `buildCardModal()` has `onclick="closeCardModal()"` on `.modal-backdrop`, and `.modal-content` uses `event.stopPropagation()`. Verified working; moved to completed.

### [P0] [Balance] Add noise to energy costs
**Fix**: Added `noisyCost(baseCost, variance=3)` helper in `utils.js` that randomizes costs by +/-3 points. Applied to match energy deduction (player + NPC), training energy deduction (player + NPC), and playtest bot. Rest recovery stays flat as specified.

## 2026-03-16 (M12 playtest fixes)

### [P0] [Bug] Gear Up escape loses training session
**Fix**: Added `gearBack()` in `gear.js` that checks `currentMatch.showTraining` before routing — returns to training screen instead of table when training is pending.

### [P0] [UX] Training screen redesign — single team stat, simple toggle
**Fix**: Replaced per-player stat dropdowns with a single team-wide stat selector above the player rows. Each player row is now a simple tap-to-toggle between Rest/Train. Added Rest All / Train All bulk buttons.

### [P0] [UX] Results screen — score more prominent
**Fix**: Added a standalone `.results-scoreline` block above the results columns showing the final score large and centered between team names.

### [P0] [UX] Pre-match — show player's manager name
**Fix**: Added player's manager name below their team name in the VS banner, matching the opponent's format.

### [P0] [UX] Training tips — mention fatigued players
**Fix**: `generateTrainingRecommendations()` now checks player energy and adds a fatigue warning as the first tip if any player is below the fatigue threshold.

## 2026-03-16 (backlog cleanup — M5/M6/M9/M10)

### [P1] Item burning / crafting mechanic *(M5 — done)*

### [P1] [Balance] Fan acceleration for late-game *(M5 — deferred to league/season redesign)*

### [P1] [UI] Gear Up stat bars & player sprite placeholder *(M5 — done)*

### [P1] [Feature] Rename "Height" stat to "Jumping" *(M6 — done)*

### [P1] [Feature] Player stat detail modal *(M6 — done)*

### [P1] [Feature] Interactive player creation flow *(M6 — done)*

### [P1] [UI] Death screen should reference manager name *(M6 — done)*

### [P1] [UX/M10] Match ticker redesign — fast roll with breakout highlights *(M10 Phase 2 — done)*

### [P1] [UX/M10] Fan count live updates with fade-out deltas *(M10 Phase 2 — done)*

### [P1] [UX/M10] Match ticker speed controls with pause *(M10 — done)*

### [P1] [UX] Pack opening: tap-to-clear reveal + simplified card backs *(M10 — done)*

### [P1] [UX] Matchday screen left-right split layout *(M10 — done)*

### [P2] Bench player stats visible on Roster screen *(moot — bench removed in M6)*

### [P2] Color-coded stat attributes + mini stat bar chart on player rows *(M5 — done)*

### [P2] Player stat colours *(superseded)*

### [P2] Stat bar layout — gear bonus alignment *(M5 — done, stat bars now fixed-width with cap at 10)*

### [P2] Death screen wording — manager not team *(superseded by P1/M6 manager name item)*

### [P2] [Balance] Lower starting player stats with more variation *(moot — M6 wizard uses fixed 22-point allocation)*

### [P2] [UX] Live minute clock on match scoreboard *(M10 — done)*

## 2026-03-15

### [P0] [UI] Ticker minute column fixed x-coordinate
**Fix**: Made `.event-line` a flex row. `.event-min` gets `min-width: 2.2em; text-align: right; flex-shrink: 0` for a stable column. Commentary wrapped in `.event-text` with `flex: 1` for natural word wrap.

### [P0] [UI] Newspaper brightness + stadium background tint
**Fix**: Darkened newspaper background from `#f5f0e8` to `#d5d0c8` (greyer). Reduced stadium overlay green tint from `rgba(13,31,13,0.78)` to `rgba(16,24,16,0.72)` — less green, slightly more transparent so photos show through better.

## 2026-03-12

### [P0] [Bug] Welcome screen grammar: "enters" → "enter" for plural team names
**Fix**: Changed "ENTERS THE LEAGUE" to "ENTER THE LEAGUE" in `_WELCOME_HEADLINES` in `screens/welcome.js`.

### [P0] [UX] Pack reveal should use card flip animation on tap
**Fix**: Added `_showingRevealed` state to pack reveal flow. Tapping a cardback now shows the full card with the `cardReveal` scale+rotateY animation (0.7s), then after 0.8s advances to the next cardback. Blocks double-taps during animation.

### [P1] [UX] Pack opening card-by-card reveal
**Fix**: Cards sorted common→legendary, shown as rarity-colored cardback with silhouette, tap to flip, skip button, thumbnail trail of previously revealed cards.

### [P1] [UI] Results screen two-column landscape layout
**Fix**: Results wrapped in `.results-columns` grid — newspaper + stats left, fan delta + milestones + nav right. Single column on mobile, `1fr 1fr` grid at 768px+.

### [P2] Newspaper treatment for results screen
**Fix**: Post-match results now show a "THE DAILY BOOT" newspaper with randomized headline and flavor text keyed by outcome (bigWin/win/tie/loss/bigLoss), reusing `.newspaper-*` CSS from gameover.

### [P2] [UI] Tier-based stadium backgrounds
**Fix**: League-based blurred/tinted stadium photos (5 tiers: local→international) applied via `body[data-tier]` CSS selectors. Background pipeline tools for generating candidates. iOS touch fallback for `background-attachment`.

### [P0] [Bug/UX] iPad double-tap zoom on stat buttons
**Fix**: Added `touch-action: manipulation` CSS rule to all interactive elements (buttons, inputs, cards, tiles, slots). This disables double-tap zoom on iOS/iPad while preserving normal tap and scroll behavior.

### [P0] [UX] Match ticker too tall on iPad
**Fix**: Added `max-height: 50vh` to `.event-log` in the 768px+ tablet media query, so the ticker doesn't push the "See Results" button off-screen on iPad landscape.

### [P0] [UI] Promotion pack should contain 4 cards
**Fix**: Changed `cardsPerPack` from 5 to 4 in `PACK_TYPES.promotion` in `data.js`. Eliminates the awkward 4+1 layout that blocked buttons below.

## 2026-03-08

### [P0] [Bug] Table screen missing "Gear Up" button; remove Hub as intermediary
**Fix**: Made Table the main screen instead of Hub. Added team header (name, fans, league indicator, match count, card count), "Gear Up" button, and "Start Over" button to the Table screen. Changed all `screen:'hub'` navigation targets to `screen:'table'` (Gear Up back button, pack opening fallback, init, save migration, matchselect). Hub render case in router now redirects to Table. Hub.js retained for `renderLeagueIndicator()` and `startOver()` which are called from the Table screen.

### [P0] [UI] Table screen shouldn't show promotion/relegation colors at 0 points
**Fix**: Added `currentMD > 0` guard to the `tbl-promo` and `tbl-danger` class assignments in `renderTable()`. Zone colors only appear after at least 1 matchday has been completed.

## 2026-03-04 (M6 playtest)

### [P0] [Bug] Player name resets when allocating stats in creation wizard
**Fix**: Added `_currentPlayerName` module-level variable to preserve the player name across re-renders. Name is read from the DOM input before each render, restored when going back, and reset only when advancing to a new player step or clicking the dice button.

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
