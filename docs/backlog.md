# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---


## P1 — Core Feel

### ~~Item burning / crafting mechanic~~ *(M5 — done)*

### ~~[Balance] Fan acceleration for late-game~~ *(M5 — deferred to league/season redesign)*

### ~~[UI] Gear Up stat bars & player sprite placeholder~~ *(M5 — done)*

### ~~[Feature] Rename "Height" stat to "Jumping"~~ *(M6 — done)*

### ~~[Feature] Player stat detail modal~~ *(M6 — done)*

### ~~[Feature] Interactive player creation flow~~ *(M6 — done)*

### ~~[UI] Death screen should reference manager name~~ *(M6 — done)*

---

## P0 — Bugs / Urgent

*(none)*

---

## P2 — Polish

### ~~Bench player stats visible on Roster screen~~ *(moot — bench removed in M6)*

### Drag-and-drop gear assignment in Gear Up
Allow dragging items between inventory and player gear slots instead of the current click-to-assign flow.

### ~~Color-coded stat attributes + mini stat bar chart on player rows~~ *(M5 — done)*

### ~~Player stat colours~~ *(superseded)*

### ~~Stat bar layout — gear bonus alignment~~ *(M5 — done, stat bars now fixed-width with cap at 10)*

### Difficulty gap feels too small
Starting team lost 0–4 to Rio Blazers (difficulty 9). The gap should probably be more like 0–8 or 0–10 to feel like a truly impossible wall early on. Review stat generation scaling for high-difficulty opponents.

### ~~Death screen wording — manager not team~~ *(superseded by P1/M6 manager name item)*

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

### ~~[Balance] Lower starting player stats with more variation~~ *(moot — M6 wizard uses fixed 22-point allocation)*

### [Feature] Inventory limit of 15 with forced forge/drop
Cap inventory at 15 items. If a pack opening pushes above 15, items still go in, but the player must forge or drop down to 15 before leaving Gear Up.

### [Graphics] Redo sushi-chef-hands image + update glove prompt for correct finger count
Regenerate sushi-chef-hands card art and update glove image prompts to specify "one thumb and four fingers" to avoid generative image finger bugs.

### [UX] Title screen + "Welcome to the league" post-creation flow *(M9)*
Add a title screen before the creation wizard and a "Welcome to the league" interstitial after roster creation that flows into the Table screen.

### [UI] Unify roster and gear-up stat presentation
Hub roster screen stats should use the same colored bar format as the Gear Up screen instead of acronym text chips. May become moot if roster and gear screens are merged (see P3 combined screen) or reconsidered in M7 with league-based screen flow.

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
