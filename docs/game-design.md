# Game Design

## Core Game Loop
1. **Hub** — manage roster, assign gear, view stats, craft cards
2. **League Table** — view standings, matchday progress, play next match
3. **Pre-Match** — story moment, trash talk
4. **Match** — simulator runs; renderer shows play-by-play narrative
5. **Results** — fan count changes, earn card pack(s), NPC results
6. **Back to Table/Hub** — repeat

## Win / Lose Conditions
- **Win**: Finish 1st in the International (World) league
- **Lose**: Finish last in any league (relegated/sacked)
- **Starting fans**: ~1,000 (cosmetic stat, no gameplay impact)

## League System (M7)
5 geographically-themed leagues with increasing difficulty:

| League | Geography | Teams | Difficulty |
|---|---|---|---|
| Local | Marin County | 6 | 1-3 |
| Regional | Bay Area | 8 | 3-5 |
| State | California | 10 | 5-7 |
| National | USA | 12 | 7-9 |
| International | World | 14 | 9-10 |

- **Season**: Round-robin (play each opponent once)
- **NPC games**: Simulated each matchday (Poisson-based scores)
- **Standings**: W/D/L, points (3/1/0), goal difference
- **1st place**: Promotion to next league + Promotion Pack
- **Last place**: Game over (relegated)
- **Mid-table**: Replay same league

## Fan System
Fans are a cosmetic vanity stat. Changes depend on league tier and match events:

| Situation | Fan Change |
|---|---|
| Big win vs tough opponent | +large (base x 2) |
| Narrow win vs tough opponent | +medium (base x 1) |
| Tie vs tough opponent | +small (base x 0.75) |
| Narrow loss vs tough opponent | -tiny (base x 0.25) |
| Win vs weak opponent | +tiny (boring) |
| Lose vs weak opponent | -large (humiliating) |

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
| Jumping | GK, D — aerial duels, headers, goalkeeper reach |
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
