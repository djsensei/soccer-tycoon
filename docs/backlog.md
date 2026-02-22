# Backlog

Priority: **P0** (bug) → **P1** (core feel) → **P2** (polish) → **P3** (future)

---

## P0 — Bugs

### Highlights toggle is not retroactive
When unchecked mid-match, previously skipped events should appear in the log immediately. Currently the toggle only affects future events as they stream in.

### Same card equippable on multiple players
Equipping a card doesn't check whether another player already has it equipped. A card with quantity 1 should only be equippable on one player at a time. The equipped card also still appears as available in the inventory list below the equipped slot — it should be hidden there too.

### Opponent goal narrative has team names swapped
`goal-opponent` templates use `{opponent}` to mean the scoring team, but the simulator stores `opponentName` as the *defending* team (relative to attacker/defender). Result: "The Sleepy Platypuses find the net" for a Rio Blazers goal. Fix: store `playerTeamName` / `opponentTeamName` as absolute references in event meta, independent of who's attacking.

### Lose condition not checked after match
When fans hit 0 (or below 100) after a match, the game continues normally to the results screen. The lose condition needs to be evaluated in `goToResults()` and route to a lose screen if triggered.

### bigLoss rewards a pack it shouldn't
Losing by 3+ goals to an International team currently awards a Basic Pack. A humiliating defeat should give no pack reward. Update `TIER_PACK_REWARDS` so `bigLoss` always returns `null`.

---

## P1 — Core Feel

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

---

## P2 — Polish

### Player stat colours
Stats should be colour-coded by value to give quick visual feedback — e.g. green for high, yellow for mid, red for low. Applies to stat bars and raw numbers.

### Difficulty gap feels too small
Starting team lost 0–4 to Rio Blazers (difficulty 9). The gap should probably be more like 0–8 or 0–10 to feel like a truly impossible wall early on. Review stat generation scaling for high-difficulty opponents.

---

## P3 — Future / Ideas

### Death screen
A fun "you got sacked" screen when fans drop below 100. Newspaper headline style, over-the-top drama.
