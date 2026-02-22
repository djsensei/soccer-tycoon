# Game Design

## Core Game Loop
1. **Hub** — manage roster, assign gear, view stats, craft cards
2. **Match Selection** — choose an opponent from available teams
3. **Pre-Match** — story moment, trash talk
4. **Match** — simulator runs; renderer shows play-by-play narrative
5. **Results** — fan count changes, earn card pack(s)
6. **Back to Hub** — repeat

## Win / Lose Conditions
- **Win**: Reach 1,000,000 fans
- **Lose**: Drop below 100 fans (get sacked as manager)
- **Starting fans**: ~1,000

## Fan System
Fans are the primary score. Changes depend on opponent difficulty and match margin:

| Situation | Fan Change |
|---|---|
| Big win vs tough opponent | +large (base × 2) |
| Narrow win vs tough opponent | +medium (base × 1) |
| Tie vs tough opponent | +small (base × 0.75) |
| Narrow loss vs tough opponent | −tiny (base × 0.25) — fans respect the effort |
| Win vs weak opponent | +tiny (boring) |
| Lose vs weak opponent | −large (humiliating) |

## Opponent Tiers
1. **Local League** (Easy) — low risk, low reward, lower pack quality
2. **National Teams** (Medium) — balanced risk/reward
3. **International Clubs** (Hard) — high stakes, high reward, better packs
4. **Special Teams** (Rare) — appear every 3–5 matches, stick around 2–3 cycles
   - Examples: The Robo-Kickers, Alien All-Stars, Dinosaur FC, The Grandmas, Shadow Squad
   - Unique rewards, unlock special card packs

## Card Pack & Equipment System

### Gear Slots
Each player has **3 typed gear slots** (head, body, feet). GKs get a 4th: **gloves**.
No two items can share a slot — can't equip two pairs of Rocket Boots.

### Rarity Tiers
| Rarity | Example Items |
|---|---|
| Common | Turbo Cleats (feet), Lucky Headband (head) |
| Uncommon | Padded Vest (body), Grip Gloves (gloves) |
| Rare | Rocket Boots (feet), Gravity Gloves (gloves) |
| Epic | Time-Freeze Whistle (body), Invisible Ball (feet) |
| Legendary | Clone Jersey (body), Black Hole Goal Net (gloves) |

### Card Crafting
Duplicates can be burned upward: e.g. 3× Common → 1× Uncommon.
Exact ratios TBD via playtesting.

### Starting Gear
Every player starts with zero-stat gear — sandlot underdog vibes:
- "Busted Sneakers" (feet), "Torn T-Shirt" (body), "Ratty Headband" (head), "Holey Gloves" (gloves/GK)
- Gear always has a name and flavour text even when `statBonuses` are all zero
- First real pack earned after a win is the moment things start to feel real

## Economy
- **No money, no shop** — card packs are match rewards only
- Pack quality scales with opponent difficulty
- Core progression: play match → earn pack → open cards → improve roster → repeat

## Team & Roster

### Size & Positions
- `TEAM_SIZE = 5` — GK, D, M, M, S (named constant, never hardcoded)
- Any player can fill any slot — no hard locks
- Stats create natural roles; match engine weights stats by position slot

### Player Stats
| Stat | Best For |
|---|---|
| Height | GK, D — aerial duels, blocking |
| Speed | M, S — breaking through, catching up |
| Strength | D, M — tackles, physical duels |
| Passing | M — successful distribution |
| Shooting | S — shots on target, goals |
| Reflexes | GK — saves |
| Luck | Everyone — wildcard modifier; upsets live here |

### Naming & Personalization
- Player names their team and each player at game start
- Name generator provided (silly, age-appropriate suggestions)
- Designed to accept real family member names easily
- Inside jokes can be slotted into team names and special moves
- Protagonist manager name, family names: fill in before shipping (TBD)

### Bench & Roster Changes
- Bench exists as a first-class concept — players not assigned to a slot
- Gaining/losing players is a planned future feature (p2)

## Tone & Style
- Silly and unrealistic — NOT a serious sim
- Absurd gear, ridiculous special teams, fun trash talk
- Writing aimed at a 10-year-old; energetic, not dry
- Narrative flavour lives in match text, not character state
