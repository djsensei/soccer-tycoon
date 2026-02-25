# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---


## P1 — Core Feel

### Fan tier / progression system *(M3)*
Map fan count to tiers (Local → Regional → National → International) that gate which opponents can be challenged. Show locked teams greyed out in opponent select. Tiers may also unlock special play modes (leagues, tournaments).

### In-match fan events *(M3)*
Sim events carry a `fanDelta` value; epic moments (great goals, saves, blunders) move the fan counter during the match, not just at the results screen. Narrative templates already categorise events — tag high/low moments for fan impact.

### Markov chain simulation engine *(M3)*
Replace the current match sim with a second-order Markov chain (last two states influence next outcome). Transition probability tables stored in JSON/YAML; player stats act as multipliers on base probabilities. Cleaner model enables better balancing and underpins the fan event system.

### Item burning / crafting mechanic *(M5)*
In the Gear Up screen, allow the player to sacrifice 3 items of the same rarity to craft 1 random item of the next higher rarity. Solves late-game stagnation when packs keep dropping commons. UI: three drop slots below the player list + a "Burn" button → output slot.

### [Balance] Fan acceleration for late-game *(M5)*
At ~287k fans, progression to 1M is too slow. Either accelerate fan outcomes at higher tiers or lower the final threshold so late-game doesn't feel like a grind.

### [UI] Gear Up stat bars & player sprite placeholder *(M5)*
Add colored stat bar graph under position+name in Gear Up player rows. Reserve space for a future player sprite to the right of the name, before gear slots.

---

## P0 — Bugs / Urgent

### [Balance] Gear stat scaling by rarity
Total stat point boosts must always increase with rarity: 1pt common, 2pt uncommon, 4pt rare, 6pt epic, 8pt legendary. Currently some legendaries have the same total stats as rares (e.g. Gravity Boots = Rocket Boots).

### [UI] Remove pixelated rendering for gear-up thumbnails
`image-rendering: pixelated` looks bad at inventory/gear-slot thumbnail size. Use normal (smooth) scaling; reserve pixelated for intentional retro contexts only.

---

## P1 — Core Feel *(M4)*

### Card image infrastructure *(M4)*
File naming convention: `img/cards/[card-id].png` — matches card IDs in `data.js` so no mapping table is needed. Add `cardImage(cardId, size)` helper to `utils.js` returning a `.card-img-wrap` div with an `<img>` and graceful fallback (dark placeholder square with rarity color) when the image file is absent. Layout must not break during rollout as images are added incrementally.

### Pack opening — large card art with rarity glow *(M4)*
Add large card image (~160×160px) to each revealed card in the pack-open screen. Add `rarity-${rarity}` CSS class to `.pack-card` for rarity-driven styling: colored border (already inline), no glow for common/uncommon, `box-shadow` glow for rare, stronger for epic, pulsing keyframe animation for legendary.

### Gear/inventory — small pixelated card thumbnails *(M4)*
Add small (48×48px) card thumbnail to the left of each `.inventory-card` row and in each `.gear-slot-cell` in the Gear Up screen. Use `image-rendering: pixelated` for an intentional crunchy look at small sizes.

### Card sizing standard *(M4)*
Settle on source image dimensions (recommended: 512×512 generated, displayed at 160×160 large / 48×48 small). Document in an `docs/art-guide.md`. Update screen layouts to accommodate the fixed card dimensions.

### iPad/tablet layout *(M4)*
Redesign screen layouts for landscape tablet (target: iPad, 1024×768). Currently all screens are single-column mobile-first. Key screens to update: hub, gear up, match select, pack opening.

### Gear Up slot alignment *(M4)*
Right-justify Head/Body/Feet gear slots in player rows so they are vertically aligned and fixed-size whether or not an item is equipped. For GK, Gloves slot appears left of Head.

### Image processing pipeline *(M4)*
Python script (`tools/img-pipeline/`) that takes raw SD outputs (white background, any size) and produces game-ready transparent PNGs in `img/cards/`. Steps: background removal via `rembg`, resize/pad to 512×512, save as `[card-id].png`. User renames raw SD outputs to match card IDs before running. Use `uv` for dependency management.

---

## P2 — Polish

### Bench player stats visible on Roster screen
Bench player rows currently show no stats. Display stats the same way starter rows do.

### Drag-and-drop gear assignment in Gear Up
Allow dragging items between inventory and player gear slots instead of the current click-to-assign flow.

### Color-coded stat attributes + mini stat bar chart on player rows
Color-code each stat type consistently across all screens. In Gear Up, show a small bar chart between the player name and their gear slots using the same colors. Supersedes the standalone "Player stat colours" item below.

### ~~Player stat colours~~
~~Stats should be colour-coded by value to give quick visual feedback — e.g. green for high, yellow for mid, red for low. Applies to stat bars and raw numbers.~~ *Superseded by "Color-coded stat attributes + mini stat bar chart" above.*

### Stat bar layout — gear bonus alignment
When gear boosts a stat, the base+bonus numbers push the stat bar out of alignment. Need more horizontal room between the numbers column and the bars column. Likely a CSS grid column-width fix.

### Difficulty gap feels too small
Starting team lost 0–4 to Rio Blazers (difficulty 9). The gap should probably be more like 0–8 or 0–10 to feel like a truly impossible wall early on. Review stat generation scaling for high-difficulty opponents.

### Death screen wording — manager not team
Headlines currently say e.g. "THE SLEEPY NARWHALS COLLAPSE IN DISGRACE" — should say the manager was sacked, not the team. Reframe headlines to be about the manager's dismissal.

### Fan floor — friends and family never leave
Players should never drop to 0 fans. A minimum of ~50 fans (friends and family) always remains, no matter how badly you lose. Adjust the fan floor in `goToResults`.

### Name generator — no duplicate names on a roster
`generatePlayerName()` can produce the same first or last name more than once in a single generation pass. When building a full roster, ensure no two players share a first name or last name. Same for team name adjective/noun combos — `generateTeamName()` shouldn't repeat either component.

### [QOL] Pack opening → Gear Up shortcut
Add a "Go to Gear Up" button on the pack-opening results screen so players can immediately equip new cards without navigating back to the hub first.

### Newspaper treatment for results screen
Use the newspaper visual language (established on the game-over screen) for the post-match results screen. Replace the plain layout with a tabloid-style presentation: match headline, score, and fan delta delivered with flavor text. Would break up the green-screen monotony and give the game a stronger visual identity.

---

## P2 — Future / Ideas

### Fan trajectory graph on death screen
A "stock price" style sparkline showing fan count over time (match by match) on the game over screen. Would make the death screen feel more like a post-mortem. Requires storing per-match fan totals in match history.

### Balancing bot
Headless Node.js script that imports `simulator.js` directly and runs N×M matchups across stat ranges and gear loadouts. Outputs win rates, fan delta distributions, and score spreads for tuning.

### Big animations
High-impact animations for pack opening, tier advancement, and achievements. Makes milestone moments feel special — kids love that stuff.

---

## P3 — Future / Ideas

### Combined Roster + Inventory screen with full drag-and-drop
Merge the Roster and Inventory screens into one. Drag player rows to set positions and starters/bench; drag gear between inventory and player slots. Major UX restructure.
