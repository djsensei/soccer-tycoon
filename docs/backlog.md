# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---


## P1 — Core Feel

### Item burning / crafting mechanic *(M5)*
In the Gear Up screen, allow the player to sacrifice 3 items of the same rarity to craft 1 random item of the next higher rarity. Solves late-game stagnation when packs keep dropping commons. UI: three drop slots below the player list + a "Burn" button → output slot.

### [Balance] Fan acceleration for late-game *(M5)*
At ~287k fans, progression to 1M is too slow. Either accelerate fan outcomes at higher tiers or lower the final threshold so late-game doesn't feel like a grind.

### [UI] Gear Up stat bars & player sprite placeholder *(M5)*
Add colored stat bar graph under position+name in Gear Up player rows. Reserve space for a future player sprite to the right of the name, before gear slots.

### [Feature] Interactive player creation flow *(M6)*
Redesign the New Game screen to create players one at a time: enter (or randomize) a name, view randomly generated stats, then assign positions after all 5 are created. Later: let the user allocate a fixed starting stat point pool. Opens the door for player sprites and light tutorial elements explaining how stats affect gameplay.

---

## P0 — Bugs / Urgent

*(none)*

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

### [UI] Rarity background color instead of border frames
Replace rarity-colored borders/frames on item cards with full background tinting by rarity color, for a more visually distinct look.

### Newspaper treatment for results screen
Use the newspaper visual language (established on the game-over screen) for the post-match results screen. Replace the plain layout with a tabloid-style presentation: match headline, score, and fan delta delivered with flavor text. Would break up the green-screen monotony and give the game a stronger visual identity.

### [Architecture] Separate data/text content from screen layer
Extract item/player/team names, stats, and narrative templates into standalone structured content files for easier iteration on larger content sets. Currently `data.js` is already well-separated from DOM code, so this is low urgency — revisit if content authoring becomes a bottleneck.

### [UI] Tier-based stadium backgrounds
Replace the flat dark green page background with fuzzy stadium art that evolves with fan tier: local = rough pitch with sideline fans, regional = high school stadium, national = large day stadium, international = packed night stadium. Strong visual progression reward.

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

### [UI] Gemstone rarity theming
Map rarity tiers to gemstones (e.g. common=stone, uncommon=jade, rare=sapphire, epic=amethyst, legendary=amber). CSS gradient borders that look faceted, small gem icon in card corners, rarity-driven background textures.
