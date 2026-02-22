# Data Models

All models are plain JS objects. Content definitions live in `data.js` and are never mutated. Runtime state lives in `GameState`.

## Card
```js
Card = {
  id,           // e.g. "turbo-cleats"
  name,         // "Turbo Cleats"
  flavourText,  // "Guaranteed to go vroom"
  rarity,       // 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  slot,         // 'head' | 'body' | 'feet' | 'gloves'
  statBonuses,  // { speed: 2, shooting: 1, ... } — omit zero-value stats
                // all zeros = valid (starting gear)
}
```

## Player
Same model for the player's team and all opponents.
```js
Player = {
  id,
  name,
  stats: {
    height,    // aerial duels, blocking
    speed,     // breaking through, catching up
    strength,  // tackles, physical duels
    passing,   // distribution success
    shooting,  // shots on target, goals
    reflexes,  // saves (GK primary stat)
    luck,      // wildcard modifier on any event
  },
  gear: {
    head:   cardId | null,
    body:   cardId | null,
    feet:   cardId | null,
    gloves: cardId | null,  // GK slot only — hidden/locked for non-GK positions
  }
}
```

## Team
Same model for the player's team and all opponents.
```js
Team = {
  id,
  name,
  tier,           // 'local' | 'national' | 'international' | 'special'
  players: [Player],
  // opponent-only fields (ignored/undefined for player's team):
  difficulty,     // numeric, used for fan math and pack quality
  fanRewardBase,  // base fan delta before margin multiplier
  specialNote,    // e.g. "Undefeated this season!" shown on match select screen
}
```

## InventoryItem
```js
InventoryItem = {
  cardId,    // references Card.id
  quantity,  // integer ≥ 1
}
```

## EarnedPack
Packs are **fully determined at earn time**, not at open time. The `id` is a
deterministic encoding of the contents — opening a pack is just revealing what
was already decided.

```js
EarnedPack = {
  id,       // deterministic hash of contents, e.g. btoa(cards.join(','))
  typeId,   // 'basic' | 'silver' | 'gold' | 'special' — for display name/art
  cards,    // [cardId, cardId, ...] — already rolled, in order
}
```

`GameState.pendingPacks` is therefore `[EarnedPack]`, not `[packTypeId]`.

## MatchEvent
Output unit of the simulator. Renderer is a pure function over an array of these.
```js
MatchEvent = {
  minute,       // 0–90
  team,         // 'player' | 'opponent'
  type,         // 'pass' | 'shot' | 'goal' | 'save' | 'tackle' | 'foul' |
                //  'corner' | 'throwin' | ...
  player:    { id, name, position },  // who initiated the action
  recipient: {                        // where the ball ended up — always known
    kind:   'player' | 'net' | 'out' | 'keeper' | 'foul',
    player: { id, name, position } | null,  // only when kind === 'player' or 'keeper'
  },
  outcome,      // 'success' | 'fail' | 'goal' | 'saved' | 'blocked' | 'miss' | ...
  isHighlight,  // bool — pre-flagged by simulator; renderer uses for highlights mode
  meta: {
    // intendedRecipient: { id, name, position } | null
    //   — for failed passes: who was targeted (they don't appear in recipient)
    // gearTriggered: cardId | null
    //   — if a gear item visibly influenced the outcome
  }
}
```

## GameState
Root object. Serialised to/from `localStorage` on every mutation.
```js
GameState = {
  teamName,
  fans,
  matchesPlayed,
  players: [Player],     // ALL players — roster + bench
  slots: {               // which player is in each position (bench = absent from slots)
    GK: playerId | null,
    D:  playerId | null,
    M1: playerId | null,
    M2: playerId | null,
    S:  playerId | null,
  },
  inventory: [InventoryItem],
  matchHistory: [
    { opponentId, score, fanDelta, packsEarned: [packId] }
  ],
  unlockedPacks: [packId],  // pack types the player has access to
}
```

## Constants (defined once, referenced everywhere)
```js
TEAM_SIZE = 5
POSITIONS = ['GK', 'D', 'M1', 'M2', 'S']
STATS = ['height', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck']
GEAR_SLOTS = ['head', 'body', 'feet']          // all players
GK_GEAR_SLOTS = ['head', 'body', 'feet', 'gloves']  // GK position only
RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
```
