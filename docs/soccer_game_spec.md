---
name: soccer-game-spec
description: the original game spec from an initial conversation with browser claude
usage: historical curiosity only, not for making design decisions!
---

# Ultimate Soccer Club Challenge - Project Specification

## Project Overview
A browser-based soccer management game for a 10-year-old's birthday gift. Combines tycoon mechanics with silly, unrealistic soccer action. Players manage a team, collect equipment through card packs, and challenge various teams to grow their fanbase.

## Target User
- **Primary**: 10-year-old nephew (birthday gift)
- **Secondary**: Dan's child (wants to play too)
- **Experience level**: Plays Roblox and Minecraft on tablets
- **Interests**: Soccer (plays and plays soccer video games), tycoon games, "who would win" books

## Timeline & Scope
- **Deadline**: Over a month from late February 2025
- **Active development budget**: ~1 week of effort
- **Tech stack**: Web app (HTML/CSS/JavaScript) - runs in any browser, no server needed

## Core Game Concept

### Primary Goal
Reach 1 million fans by winning soccer matches and managing your team wisely.

### Lose Condition
Drop below 100 fans (get sacked as manager).

### Core Gameplay Loop
1. **Hub Screen** - Manage team between matches
2. **Match Selection** - Choose which team to challenge
3. **Pre-Match Scene** - Story moment, trash talk, maybe buy card packs
4. **Match Narrative** - "Who would win" style play-by-play
5. **Results & Consequences** - Fan count changes, unlocks, rewards
6. **Return to Hub** - Repeat

## Game Mechanics

### Fan System (Core Metric)
Fans are the primary scoreboard. Everything revolves around gaining/losing fans.

**Fan Change Calculation:**
- Base value depends on opponent difficulty tier
- Modified by margin of victory/defeat
- Special teams have bonus multipliers

**Examples:**
- Win big against tough opponent: +big fans (base × 2)
- Barely win against tough opponent: +medium fans (base × 1)
- Tie with tough opponent: +small fans (base × 0.75)
- Barely lose to tough opponent: -small fans (base × 0.25) - fans respect the attempt
- Win against weak opponent: +tiny fans (boring)
- Barely win against weak opponent: +very tiny fans (embarrassing)
- Lose to weak opponent: -BIG fans (humiliating)

**Starting Fans**: TBD (something reasonable like 1,000?)

### Match System

**Team Categories:**

1. **Local League** (Easy)
   - Bronze City FC, Riverside Rangers, etc.
   - Low stakes, safe option
   - Low fan rewards

2. **National Teams** (Medium)
   - Capital United, Northern Thunder, etc.
   - Medium risk/reward

3. **International Clubs** (Hard)
   - Europa Phoenix, Tokyo Strikers, etc.
   - High stakes, high rewards

4. **Special Teams** (Rare encounters)
   - The Robo-Kickers (all robots)
   - Alien All-Stars (from space)
   - Dinosaur FC (literally dinosaurs)
   - The Grandmas (surprisingly good)
   - Shadow Squad (play at midnight, mysterious)
   - **Appearance**: After every 3-5 normal matches, one appears
   - **Duration**: Sticks around for 2-3 match cycles, then disappears
   - **Rewards**: Unique bonuses, unlock new card packs, special gear

**Match Display Info:**
- Team name
- Difficulty rating (stars or color-coded)
- Potential fan gain/loss range
- Special notes (e.g., "Undefeated this season!" or "Known for dirty tricks")

**Match Narrative Structure:**
1. Pre-match scene (trash talk, coach advice, maybe shop opportunity)
2. Match play-by-play (narrative "who would win" style highlighting key gear/player moments)
3. Result display (score, fan change, any unlocks)

### Card Pack & Equipment System

**Card Packs:**
Players spend money to buy packs containing random equipment/power-ups.

**Rarity Tiers & Example Items:**
- **Common**: Turbo Cleats, Lucky Headband
- **Rare**: Rocket Boots, Gravity Gloves (for keeper)
- **Epic**: Time-Freeze Whistle, Invisible Ball
- **Legendary**: Clone Jersey (player plays as two!), Black Hole Goal Net (keeper)

**Pack Types:** TBD (Bronze, Silver, Gold packs with different costs and card counts)

**Equipment Assignment:**
Players can assign gear to team members before matches.

### Team Management

**Team Structure:**
- Players have roster of team members
- Each member can be equipped with gear
- Gear affects match outcomes

**Pending Decisions:**
- Should gear be permanent or consumable (one-time use)?
- How many players on the team?
- Do players have base stats or is everything gear-driven?

### Economy

**Money Sources:**
- Win matches (amount varies by opponent difficulty and margin)
- Special achievements/milestones?

**Money Sinks:**
- Card packs
- Potentially other purchases TBD

## User Experience

### Tone & Style
- **Silly and unrealistic** - not a serious management sim
- **Fun and lighthearted** - absurd equipment and special teams
- **Personal touches** - family member names as characters

### Personal Customization
- Nephew's name as protagonist/manager
- Family member names for players, coaches, rivals, or sponsors
- Inside jokes as team names or special moves
- Team naming (player chooses at start? or pre-named?)

### Potential Story Characters (TBD)
- A coach who gives advice?
- A rival manager?
- A reporter covering your rise?

## Technical Approach

### Platform
Single-page web application (HTML/CSS/JavaScript)

### Key Features Needed
- Display story text and choices as clickable buttons/interface
- Track game state (fans, money, team roster, gear inventory, match history)
- Save progress locally (localStorage) so players can continue later
- Show different scenes based on choices and game state
- Card pack opening mechanic with random rewards
- Match outcome calculation based on team composition and gear
- Visual polish (images optional but nice, animations optional, sound effects optional)

### Development Environment
- Text editor (VS Code recommended)
- Web browser for testing
- No complex setup or server needed

## Open Questions to Resolve

1. **Team naming**: Does player name their team at start, or is it pre-named?
2. **Story characters**: Do we want recurring NPCs (coach, rival, reporter)?
3. **Gear persistence**: Permanent equipment or consumable one-time power-ups?
4. **Team size**: How many players on the roster?
5. **Player stats**: Do team members have base stats, or is everything gear-driven?
6. **Starting resources**: Initial fans count, starting money, initial gear?
7. **Pack economy**: Specific pack types, costs, and contents?
8. **Puzzle elements**: Original spec mentioned puzzles - should we include:
   - Pack strategy puzzles (budget optimization)?
   - Match tactics riddles (formation challenges)?
   - Secret codes for hidden merchants?

## Design Philosophy

### What Makes This Special as a Birthday Gift
- Personalized with family names and inside jokes
- Unique gameplay (not a clone of existing games)
- Age-appropriate complexity (10-year-old can understand and enjoy)
- Replayability (different strategies, try different special teams)
- Polished presentation (feels "real" not like a school project)
- Works across devices (browser-based)
- Easy to share (just send files or host)

### Scope Management
- Focus on core loop first (hub → match → results → hub)
- Card packs and special teams are key differentiators - prioritize these
- Visual polish is nice-to-have but secondary to gameplay
- Keep it achievable in ~1 week of active development

## Next Steps for Implementation

1. **Finalize open questions** (team naming, gear system, story characters)
2. **Create detailed content lists** (all teams, all gear items, match narratives)
3. **Design UI mockups** (hub screen, match selection, match view, shop)
4. **Build core game engine** (state management, save/load, match calculation)
5. **Implement card pack system** (randomization, rarity weights)
6. **Write match narratives** (templates that incorporate gear and teams)
7. **Add personal touches** (family names, inside jokes)
8. **Polish and test** (play through multiple times, get feedback)
9. **Package for delivery** (simple way to run/share)

## References
- Target user plays Roblox and Minecraft (familiar with digital games)
- Loves "who would win" books (narrative match style)
- Into soccer and tycoon games (core mechanics)
- Game should be fun for replay (nephew AND Dan's kid will play multiple times)
