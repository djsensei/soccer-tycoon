# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---


## P1 — Core Feel

### "Start Over" button in hub
Add a clearly labelled reset option in the hub (e.g. in a settings area or footer) that clears localStorage and returns to the new game screen. Should require a confirmation click to prevent accidents.



### Starting gear is a placeholder, not a card
Starting gear ("Busted Sneakers" etc.) should not be real inventory cards. It's a grayed-out default state for an empty slot:
- Not in inventory, can't be removed — only replaced
- If real gear is unequipped, the slot returns to the default placeholder
- Implementation: player.gear slot = `cardId | null`; null renders as the grayed-out default. Remove starting gear from CARDS entirely (or keep as display-only constants, never stored in player.gear).

### Gear Up screen redesign
Replace the current per-player gear modal with a dedicated "Gear Up" screen accessible from the hub:
- Players displayed as full-width rows showing all gear slots inline
- Inventory panel on the right, grouped by slot type, ordered by rarity
- Should feel like laying cards out on a table

### Gloves less frequent in packs
Only 1 of 5 players (the GK) can use gloves. Pack weights should reflect this — gloves currently have equal probability to all other slots despite being ~4× less useful.
- Options: reduce gloves weight globally, or filter gloves out of packs for non-GK slots, or make gloves a separate pool.

### No duplicate cards in a single pack *(M2)*
`openPack()` currently samples with replacement, so a single pack can contain the same card more than once. Change to sample without replacement — once a card is drawn, exclude it from remaining draws in the same pack.

### Roster management — position swaps and bench *(M2)*
Players are locked to their starting slot with no way to swap positions or bring a bench player into the starting XI. Add roster management to the hub: allow swapping players between any two slots (including bench), so the manager can experiment with lineups and actually use the bench.

### Deployment — GitHub Pages + soft password *(M2)*
Set up GitHub Pages so family can play via a URL. Add a ~5-line client-side password prompt on page load for soft access control. Not cryptographically secure but fine since data isn't sensitive.

### Fan tier / progression system *(M3)*
Map fan count to tiers (Local → Regional → National → International) that gate which opponents can be challenged. Show locked teams greyed out in opponent select. Tiers may also unlock special play modes (leagues, tournaments).

### In-match fan events *(M3)*
Sim events carry a `fanDelta` value; epic moments (great goals, saves, blunders) move the fan counter during the match, not just at the results screen. Narrative templates already categorise events — tag high/low moments for fan impact.

### Markov chain simulation engine *(M3)*
Replace the current match sim with a second-order Markov chain (last two states influence next outcome). Transition probability tables stored in JSON/YAML; player stats act as multipliers on base probabilities. Cleaner model enables better balancing and underpins the fan event system.

---

## P2 — Polish

### Player stat colours
Stats should be colour-coded by value to give quick visual feedback — e.g. green for high, yellow for mid, red for low. Applies to stat bars and raw numbers.

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
