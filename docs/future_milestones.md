# Future Milestones

Planned milestones for Soccer Tycoon, with assigned backlog issues.

---

## M3 — Progression & Simulation

Introduce fan-based progression gating and overhaul the match simulation engine. These three features are tightly coupled — the fan tier system, in-match events, and Markov sim all build on each other.

### Assigned issues
- Fan tier / progression system
- In-match fan events
- Markov chain simulation engine

---

## M4 — Card Art & Visual Identity

Give each gear card a unique illustration generated via Stable Diffusion. Establish a reusable card component — large for pack opening, small/pixelated for inventory — with rarity-driven border colors and glow effects. Lay groundwork for a full visual refresh including tablet layout.

### Assigned issues
- Card image infrastructure (file naming convention, `cardImage` helper, CSS component, graceful fallback)
- Pack opening — large card art with rarity border and glow
- Gear/inventory screens — small pixelated card thumbnails
- Card sizing standard — settle on source/display dimensions, document art guide
- iPad/tablet layout — landscape orientation, responsive sizing for key screens
- Gear Up slot alignment — right-justify slots, fixed-size, GK Gloves positioning

---

## M5 — Gear Depth & Late-Game Loop

Extend the gear system to keep progression meaningful late in the game, when packs frequently drop low-rarity items.

### Assigned issues
- Item burning / crafting mechanic
- Fan acceleration for late-game
- Gear Up stat bars & player sprite placeholder
