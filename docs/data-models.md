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
  statBonuses,  // { speed: 2, shooting: 1, ... } -- omit zero-value stats
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
    jumping,   // aerial duels, headers, goalkeeper reach
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
    gloves: cardId | null,  // GK slot only
  },
  // Player's team only:
  careerStats: { goals, saves, tackles, passes, shotsMissed },
  statBonuses: { [stat]: bonusInt },  // from milestones
}
```

## Team (League NPC)
```js
LeagueTeam = {
  id,
  name,
  league,       // 'local' | 'regional' | 'state' | 'national' | 'international'
  difficulty,   // 1-10
  specialNote,  // flavor text
  players: [Player],
  slots: { GK, D, M1, M2, S },
}
```

## Season
```js
Season = {
  league,           // league key
  matchday,         // current matchday index (0-based)
  schedule: [{      // one entry per matchday
    matches: [{ home: teamId, away: teamId }],
    completed: bool,
  }],
  standings: {      // keyed by teamId
    [teamId]: { w, d, l, gf, ga, pts },
  },
  lastResults: [{   // most recent matchday results
    home, away, homeScore, awayScore,
  }],
}
```

## InventoryItem
```js
InventoryItem = {
  cardId,    // references Card.id
  quantity,  // integer >= 1
}
```

## MatchEvent
Output unit of the simulator. Renderer is a pure function over an array of these.
```js
MatchEvent = {
  minute,       // 0-90
  second,       // game clock seconds
  team,         // 'player' | 'opponent' | null
  type,         // 'pass' | 'shot' | 'goal' | 'tackle' | 'foul' |
                //  'corner' | 'throwin' | 'kickoff' | 'halftime' | 'fulltime'
  outcome,      // 'success' | 'fail' | 'player' | 'opponent' | 'miss' | 'saved' | 'greatSave' | ...
  isHighlight,  // bool
  fanDelta,     // per-event fan change
  meta: {
    playerName, teamName, opponentName,
    playerTeamName, opponentTeamName,
    playerScore, opponentScore,
    playerId, savingPlayerId,
  }
}
```

## GameState
Root object. Serialised to/from `localStorage` on every mutation.
```js
GameState = {
  teamName,
  managerName,
  fans,
  matchesPlayed,

  players: [Player],     // starting 5 only
  slots: { GK, D, M1, M2, S },

  inventory: [InventoryItem],
  matchHistory: [{ opponentId, playerScore, opponentScore, fanDelta, packEarned }],
  unlockedPacks: [packId],

  // League system (M7)
  currentLeague,         // 'local' | 'regional' | 'state' | 'national' | 'international'
  leagueTeams: {         // keyed by league
    [leagueKey]: [LeagueTeam],
  },
  season: Season,

  // Transient screen state
  screen,
  selectedOpponentId,
  currentMatch,
  pendingPacks,
  lastOpenedCards,
  lastOpenedPackId,
  selectedPlayerId,
}
```

## Constants (defined once, referenced everywhere)
```js
TEAM_SIZE = 5
POSITIONS = ['GK', 'D', 'M1', 'M2', 'S']
STATS = ['jumping', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck']
GEAR_SLOTS = ['head', 'body', 'feet']
GK_GEAR_SLOTS = ['head', 'body', 'feet', 'gloves']
RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
LEAGUE_ORDER = ['local', 'regional', 'state', 'national', 'international']
```
