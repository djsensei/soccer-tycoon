# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---

## P0 — Bugs / Urgent

*(none)*

---

## P1 — Core Feel

*(none)*

---

## P2 — Polish

### Difficulty gap feels too small
Starting team lost 0–4 to Rio Blazers (difficulty 9). The gap should probably be more like 0–8 or 0–10 to feel like a truly impossible wall early on. Review stat generation scaling for high-difficulty opponents.

### Fan floor — friends and family never leave
Players should never drop to 0 fans. A minimum of ~50 fans (friends and family) always remains, no matter how badly you lose. Adjust the fan floor in `goToResults`.

### Name generator — no duplicate names on a roster
`generatePlayerName()` can produce the same first or last name more than once in a single generation pass. When building a full roster, ensure no two players share a first name or last name. Same for team name adjective/noun combos — `generateTeamName()` shouldn't repeat either component.

### [QOL] Pack opening → Gear Up shortcut
Add a "Go to Gear Up" button on the pack-opening results screen so players can immediately equip new cards without navigating back to the hub first.

### [UI] Rarity background color instead of border frames
Replace rarity-colored borders/frames on item cards with full background tinting by rarity color, for a more visually distinct look.

### [Architecture] Separate data/text content from screen layer
Extract item/player/team names, stats, and narrative templates into standalone structured content files for easier iteration on larger content sets. Currently `data.js` is already well-separated from DOM code, so this is low urgency — revisit if content authoring becomes a bottleneck.

### [Feature] Inventory limit of 15 with forced forge/drop
Cap inventory at 15 items. If a pack opening pushes above 15, items still go in, but the player must forge or drop down to 15 before leaving Gear Up.

### [Graphics] Redo sushi-chef-hands image + update glove prompt for correct finger count
Regenerate sushi-chef-hands card art and update glove image prompts to specify "one thumb and four fingers" to avoid generative image finger bugs.

### [UX] Title screen + "Welcome to the league" post-creation flow *(M9)*
Add a title screen before the creation wizard and a "Welcome to the league" interstitial after roster creation that flows into the Table screen.

### [QOL] Gear Up inventory filter defaults to "All"
Inventory tab should always start on "All" when entering the Gear Up screen.

### [UI] Unify roster and gear-up stat presentation
Hub roster screen stats should use the same colored bar format as the Gear Up screen instead of acronym text chips. May become moot if roster and gear screens are merged (see P3 combined screen) or reconsidered in M7 with league-based screen flow.

### [UI] Gear Up button visual parity with Play Next Match
Both buttons should have similar brightness/prominence, differentiated by color. Currently Gear Up looks sad and dull in comparison. *(see also P0: Match Day button width imbalance)*

### [UX] Stats allocation screen: Reset button + stat explainer
Add a "Reset" button (sets all stats to 1) next to Randomize. Add a "How?" button that opens a stat explanation popup similar to the Gear Up one.

### [QOL] Stat allocation: "Randomize Remaining" button
Add a "Randomize Remaining" button alongside Randomize that preserves any stats the player has already set and only randomizes unallocated points across the remaining stats.

### [UX] Welcome screen: show don't tell
List all 7 stats in their stat-special colors instead of naming a few. Show pictures/visuals of the inventory and forge screens rather than describing them in text. Use visual elements over paragraphs.

### [Balance] Higher NPC-NPC match scores
NPC game scores feel too low. Likely addressed by M11's full NPC match simulation; defer if so.

---

## P2 — Future / Ideas

### Fan trajectory graph on death screen
A "stock price" style sparkline showing fan count over time (match by match) on the game over screen. Would make the death screen feel more like a post-mortem. Requires storing per-match fan totals in match history.

### Balancing bot
Headless Node.js script that imports `simulator.js` directly and runs N×M matchups across stat ranges and gear loadouts. Outputs win rates, fan delta distributions, and score spreads for tuning.

---

## P3 — Future / Ideas

### Combined Roster + Inventory screen with full drag-and-drop
Merge the Roster and Inventory screens into one. Drag player rows to set positions and starters/bench; drag gear between inventory and player slots. Major UX restructure.

### [UI] Gemstone rarity theming
Map rarity tiers to gemstones (e.g. common=stone, uncommon=jade, rare=sapphire, epic=amethyst, legendary=amber). CSS gradient borders that look faceted, small gem icon in card corners, rarity-driven background textures.

### [Feature] Title screen redesign with kid input
Involve the kids in designing the title screen look and logo. Get their input on what they'd like it to be.

### [QOL] Position-aware player name filtering
Avoid generating position-inappropriate silly names (e.g. "Butterfingers" on a goalkeeper). Filter or weight name components by position context. Low priority — names are fun as-is.

### [Feature] Newspaper flip effect for results screen
Show headline on the front page of the newspaper, then click to flip and see stats, player performances, fans, upgrades on subsequent pages. Saves vertical space and adds a cool interactive effect.
