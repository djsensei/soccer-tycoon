// ============================================================
// data.js — Static game content. Never mutated at runtime.
// ============================================================

const TEAM_SIZE = 5;
const POSITIONS = ['GK', 'D', 'M1', 'M2', 'S'];
const STATS = ['height', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck'];
const GEAR_SLOTS     = ['head', 'body', 'feet'];
const GK_GEAR_SLOTS  = ['head', 'body', 'feet', 'gloves'];
const RARITIES       = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const RARITY_COLOR = {
  common:    '#9e9e9e',
  uncommon:  '#4caf50',
  rare:      '#2196f3',
  epic:      '#9c27b0',
  legendary: '#ff9800',
};

const RARITY_LABEL = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
};

// --- Gear Cards -------------------------------------------------
// statBonuses only lists non-zero stats. Zero-stat starting gear is valid.
const CARDS = {
  // === STARTING GEAR (sandlot underdog vibes, zero stats) ===
  'busted-sneakers':  { id: 'busted-sneakers',  name: 'Busted Sneakers',  slot: 'feet',   rarity: 'common', flavourText: 'One flap held on with duct tape.',   statBonuses: {} },
  'torn-t-shirt':     { id: 'torn-t-shirt',      name: 'Torn T-Shirt',     slot: 'body',   rarity: 'common', flavourText: "Was white once. Probably.",           statBonuses: {} },
  'ratty-headband':   { id: 'ratty-headband',    name: 'Ratty Headband',   slot: 'head',   rarity: 'common', flavourText: 'Found it behind the bleachers.',      statBonuses: {} },
  'holey-gloves':     { id: 'holey-gloves',      name: 'Holey Gloves',     slot: 'gloves', rarity: 'common', flavourText: 'Half the fingers are missing.',       statBonuses: {} },

  // === COMMON ===
  'lucky-headband':   { id: 'lucky-headband',    name: 'Lucky Headband',   slot: 'head',   rarity: 'common',   flavourText: 'Brings luck. Smells weird.',                       statBonuses: { luck: 2 } },
  'basic-shinguards': { id: 'basic-shinguards',  name: 'Basic Shin Guards',slot: 'body',   rarity: 'common',   flavourText: 'Better than nothing. Barely.',                     statBonuses: { strength: 1 } },
  'cotton-gloves':    { id: 'cotton-gloves',     name: 'Cotton Gloves',    slot: 'gloves', rarity: 'common',   flavourText: 'For someone who tried.',                            statBonuses: { reflexes: 1 } },
  'zephyr-kicks': { id: 'zephyr-kicks', name: 'Zephyr Kicks', slot: 'feet', rarity: 'common', flavourText: "Channeling the ancient spirit of wind itself.", statBonuses: { speed: 1 } },
  'mammoth-mallets': { id: 'mammoth-mallets', name: 'Mammoth Mallets', slot: 'feet', rarity: 'common', flavourText: "Beast mode: activated.", statBonuses: { strength: 1 } },  // ⚠ image pending
  'arrow-arcs': { id: 'arrow-arcs', name: 'Arrow Arcs', slot: 'feet', rarity: 'common', flavourText: "The ball follows where you point.", statBonuses: { passing: 1 } },
  'sonic-strikes': { id: 'sonic-strikes', name: 'Sonic Strikes', slot: 'feet', rarity: 'common', flavourText: "The ball breaks the sound barrier.", statBonuses: { shooting: 1 } },  // ⚠ image pending
  'butterfly-booties': { id: 'butterfly-booties', name: 'Butterfly Booties', slot: 'feet', rarity: 'common', flavourText: "Fluttery feet that dodge everything.", statBonuses: { reflexes: 1 } },  // ⚠ image pending
  'ninja-neons': { id: 'ninja-neons', name: 'Ninja Neons', slot: 'feet', rarity: 'common', flavourText: "Silent, deadly, and glowing for some reason.", statBonuses: { reflexes: 1 } },
  'rainbow-runners': { id: 'rainbow-runners', name: 'Rainbow Runners', slot: 'feet', rarity: 'common', flavourText: "The luck pot follows your feet.", statBonuses: { luck: 1 } },

  // === UNCOMMON ===
  'padded-vest':      { id: 'padded-vest',       name: 'Padded Vest',      slot: 'body',   rarity: 'uncommon', flavourText: 'Absorbs tackles like a champ.',                    statBonuses: { strength: 2, height: 1 } },
  'grip-gloves':      { id: 'grip-gloves',       name: 'Grip Gloves',      slot: 'gloves', rarity: 'uncommon', flavourText: 'Sticks to everything.',                            statBonuses: { reflexes: 3 } },
  'sprinting-spikes': { id: 'sprinting-spikes',  name: 'Sprinting Spikes', slot: 'feet',   rarity: 'uncommon', flavourText: 'Leave little holes everywhere.',                   statBonuses: { speed: 2, shooting: 1 } },
  'focus-visor':      { id: 'focus-visor',       name: 'Focus Visor',      slot: 'head',   rarity: 'uncommon', flavourText: 'Everything looks like a target.',                  statBonuses: { passing: 2, shooting: 1 } },

  // === RARE ===
  'rocket-boots':     { id: 'rocket-boots',      name: 'Rocket Boots',     slot: 'feet',   rarity: 'rare',     flavourText: 'Actual small rockets. Safety not guaranteed.',     statBonuses: { speed: 4, shooting: 2 } },
  'gravity-gloves':   { id: 'gravity-gloves',    name: 'Gravity Gloves',   slot: 'gloves', rarity: 'rare',     flavourText: 'The ball just... comes to them.',                  statBonuses: { reflexes: 4, height: 2 } },
  'rock-gloves':      { id: 'rock-gloves',       name: 'Rock Gloves',      slot: 'gloves', rarity: 'rare',     flavourText: 'Chiseled from actual boulders. Punching the ball rules.', statBonuses: { reflexes: 2, strength: 2 } },
  'iron-jersey':      { id: 'iron-jersey',       name: 'Iron Jersey',      slot: 'body',   rarity: 'rare',     flavourText: 'Heavy. Very heavy. Nothing gets through.',         statBonuses: { strength: 4, height: 2 } },
  'eagle-eye-cap':    { id: 'eagle-eye-cap',     name: 'Eagle Eye Cap',    slot: 'head',   rarity: 'rare',     flavourText: 'See the field like a majestic bird.',              statBonuses: { passing: 3, luck: 2 } },

  // === EPIC ===
  'timefreeze-whistle': { id: 'timefreeze-whistle', name: 'Time-Freeze Whistle', slot: 'body', rarity: 'epic', flavourText: 'One blow stops everyone. Except you.',              statBonuses: { shooting: 4, passing: 3, luck: 2 } },
  'invisible-boots':  { id: 'invisible-boots',   name: 'Invisible Boots',  slot: 'feet',   rarity: 'epic',     flavourText: 'WHERE DID THEY GO?',                               statBonuses: { speed: 5, luck: 4 } },
  'mind-helmet':      { id: 'mind-helmet',       name: 'Mind Helmet',      slot: 'head',   rarity: 'epic',     flavourText: "Read the opponent's thoughts. Try not to laugh.",  statBonuses: { passing: 5, reflexes: 3 } },
  'antigrav-gloves':  { id: 'antigrav-gloves',   name: 'Anti-Grav Gloves', slot: 'gloves', rarity: 'epic',     flavourText: 'Every ball floats gently into your hands.',        statBonuses: { reflexes: 5, height: 4 } },

  // === LEGENDARY ===
  'clone-jersey':     { id: 'clone-jersey',      name: 'Clone Jersey',     slot: 'body',   rarity: 'legendary', flavourText: 'The player is everywhere at once. Somehow legal.', statBonuses: { speed: 3, strength: 3, shooting: 3, passing: 3 } },
  'blackhole-gloves': { id: 'blackhole-gloves',  name: 'Black Hole Gloves',slot: 'gloves', rarity: 'legendary', flavourText: 'Nothing gets past. Nothing. Ever.',                statBonuses: { reflexes: 7, height: 5 } },
  'hyperspeed-cleats':{ id: 'hyperspeed-cleats', name: 'Hyperspeed Cleats',slot: 'feet',   rarity: 'legendary', flavourText: 'You briefly become invisible between steps.',      statBonuses: { speed: 7, shooting: 4 } },
  'crown-of-luck':    { id: 'crown-of-luck',     name: 'Crown of Luck',    slot: 'head',   rarity: 'legendary', flavourText: 'Forged from four-leaf clovers and wishbones.',     statBonuses: { luck: 8, passing: 3 } },

  // === SPECIAL TEAM UNIQUES (Phase 4) ===
  'robo-arm':          { id: 'robo-arm',          name: 'Robo Arm',          slot: 'gloves', rarity: 'legendary', flavourText: 'Catches everything. EVERYTHING.',                       statBonuses: { reflexes: 5 } },
  'gravity-boots':     { id: 'gravity-boots',     name: 'Gravity Boots',     slot: 'feet',   rarity: 'legendary', flavourText: 'Defies physics. Physicists are upset.',                 statBonuses: { speed: 4, shooting: 2 } },
  'dino-stomp-cleats': { id: 'dino-stomp-cleats', name: 'Dino Stomp Cleats', slot: 'feet',   rarity: 'legendary', flavourText: 'Left craters on the pitch. Ref allowed it.',            statBonuses: { strength: 5, height: 2 } },
  'lucky-scarf':       { id: 'lucky-scarf',       name: "Grandma's Lucky Scarf", slot: 'head', rarity: 'legendary', flavourText: 'Knitted with love. Radiates pure luck.',            statBonuses: { luck: 6 } },
  'shadow-cloak':      { id: 'shadow-cloak',      name: 'Shadow Cloak',      slot: 'body',   rarity: 'legendary', flavourText: 'Players phase through you. Somehow legal.',           statBonuses: { speed: 4, passing: 3 } },
};

const STARTING_GEAR = {
  GK:    { head: 'ratty-headband', body: 'torn-t-shirt', feet: 'busted-sneakers', gloves: 'holey-gloves' },
  other: { head: 'ratty-headband', body: 'torn-t-shirt', feet: 'busted-sneakers', gloves: null },
};

// --- Pack Types -------------------------------------------------
// weights array: [common, uncommon, rare, epic, legendary]
const PACK_TYPES = {
  basic:   { id: 'basic',   name: 'Basic Pack',   description: 'Three random cards. Could be anything!',   cardsPerPack: 3, weights: [0.70, 0.25, 0.05, 0.00, 0.00] },
  silver:  { id: 'silver',  name: 'Silver Pack',  description: 'Better odds. Better gear.',                cardsPerPack: 3, weights: [0.40, 0.35, 0.20, 0.05, 0.00] },
  gold:    { id: 'gold',    name: 'Gold Pack',    description: "Now we're talking.",                       cardsPerPack: 3, weights: [0.15, 0.30, 0.35, 0.15, 0.05] },
  special: { id: 'special', name: 'Special Pack', description: 'Only from the weird teams.',               cardsPerPack: 4, weights: [0.05, 0.20, 0.35, 0.28, 0.12] },
};

const TIER_PACK_REWARDS = {
  local:         { win: 'basic',  tie: null,     loss: null    },
  national:      { win: 'silver', tie: 'basic',  loss: null    },
  international: { win: 'gold',   tie: 'silver', loss: 'basic' },
  special:       { win: 'special',tie: 'silver', loss: 'basic' },
};

// --- Fan Math ---------------------------------------------------
const FAN_BASE = {
  local:         1000,
  national:      5000,
  international: 20000,
  special:       15000,
};

const FAN_MULTIPLIERS = {
  bigWin:  2.0,
  win:     1.0,
  tie:     0.25,
  loss:   -0.5,
  bigLoss: -2.0,
};

// --- Opponent Teams ---------------------------------------------
const OPPONENT_DEFINITIONS = [
  // Local League
  { id: 'bronze-city-fc',    name: 'Bronze City FC',    tier: 'local',         difficulty: 2, specialNote: "Haven't won in three seasons.",           playerNames: ['Gary Fumble',     'Pete Trips',     'Dave Wobble',    'Norm Huffpuff',  'Barry Misses'    ] },
  { id: 'riverside-rangers', name: 'Riverside Rangers', tier: 'local',         difficulty: 3, specialNote: 'Play next to a swamp. Smells.',           playerNames: ['Bog McSwamp',     'Muddy Rivers',   'Slimy Green',    'Wet Socks',      'Damp Trousers'   ] },
  { id: 'mudfield-united',   name: 'Mudfield United',   tier: 'local',         difficulty: 3, specialNote: 'Always muddy. Always.',                   playerNames: ['Clods McGee',     'Earl Muckface',  'Grim Splotch',   'Clump Hopper',   'Dirt Magnet'     ] },
  // National
  { id: 'capital-united',    name: 'Capital United',    tier: 'national',      difficulty: 5, specialNote: 'Very serious. Very boring.',               playerNames: ['Frederick Posh',  'Reginald Smart', 'Edmund Proper',  'Algernon Stiff', 'Cornelius Starch'] },
  { id: 'northern-thunder',  name: 'Northern Thunder',  tier: 'national',      difficulty: 5, specialNote: 'Loud fans. Very loud.',                   playerNames: ['Big Tam',         'Huge Hamish',    'Massive Morag',  'Enormous Ewan',  'Gigantic Graeme' ] },
  { id: 'coastal-storm-fc',  name: 'Coastal Storm FC',  tier: 'national',      difficulty: 6, specialNote: 'Undefeated at home. This is away.',       playerNames: ['Squall McGale',   'Breeze Windson', 'Gust Tempest',   'Storm Warning',  'Typhoon Terry'   ] },
  // International
  { id: 'europa-phoenix',    name: 'Europa Phoenix',    tier: 'international', difficulty: 8, specialNote: 'Champions three years running.',           playerNames: ['Blaz Flicker',    'Ember Hotfoot',  'Scorch Blazer',  'Inferno Kick',   'Ash Riser'       ] },
  { id: 'tokyo-strikers',    name: 'Tokyo Strikers',    tier: 'international', difficulty: 8, specialNote: 'Known for lightning-fast attacks.',        playerNames: ['Zap Thunderfoot', 'Bolt Quickstep', 'Flash Zipkick',  'Blitz Dashrun',  'Spark Turboleg'  ] },
  { id: 'rio-blazers',       name: 'Rio Blazers',       tier: 'international', difficulty: 9, specialNote: "They're dancing while playing. HOW?!",    playerNames: ['Samba Footwork',  'Bossa Kickspin', 'Tango Dribble',  'Rumba Goalie',   'Salsa Flick'     ] },
  // Special
  { id: 'robo-kickers',      name: 'The Robo-Kickers',  tier: 'special',       difficulty: 7, specialNote: 'All robots. Beep boop. BEEP BOOP.',       playerNames: ['Unit-GK7',        'Defense-Bot',    'Midfield-3000',  'Passing-Unit',   'StrikeBot-X'     ], uniqueCardId: 'robo-arm'          },
  { id: 'alien-all-stars',   name: 'Alien All-Stars',   tier: 'special',       difficulty: 9, specialNote: 'Eight legs. Four eyes. Zero mercy.',      playerNames: ['Zorbax',          'Glurp',          'Fizznok',        'Blargle',        'Zeeble'          ], uniqueCardId: 'gravity-boots'     },
  { id: 'dinosaur-fc',       name: 'Dinosaur FC',       tier: 'special',       difficulty: 10,specialNote: 'They are DINOSAURS.',                     playerNames: ['Rex Rampage',     'Pterry Swoop',   'Trike Horn',     'Stego Tail',     'Raptor Dash'     ], uniqueCardId: 'dino-stomp-cleats' },
  { id: 'the-grandmas',      name: 'The Grandmas',      tier: 'special',       difficulty: 6, specialNote: 'Surprisingly good. Suspiciously good.',   playerNames: ['Nan Kickhard',    'Gran Tackle',    'Granny Shoot',   'Nanna Goalie',   'Grammy Dribble'  ], uniqueCardId: 'lucky-scarf'       },
  { id: 'shadow-squad',      name: 'Shadow Squad',      tier: 'special',       difficulty: 8, specialNote: 'Play at midnight. Very mysterious.',      playerNames: ['The Shadow',      'Dark Presence',  'Night Striker',  'Void Walker',    'Eclipse'         ], uniqueCardId: 'shadow-cloak'      },
];

// --- Narrative Templates ----------------------------------------
// Keys are "type-outcome". Renderer picks randomly and fills {player}, {team}, {opponent}.
const NARRATIVE = {
  'kickoff':          ["The whistle blows! {team} vs {opponent} is UNDERWAY!", "And we are OFF! {opponent} looks nervous. Good.", "HERE WE GO! The crowd goes wild!"],
  'halftime':         ["HALF TIME! The teams head to the tunnel.", "The whistle goes! Half time already!", "HALF TIME. Catch your breath. It's been a ride."],
  'fulltime':         ["FULL TIME! That's the match!", "And that's it! The referee blows for full time!", "IT'S OVER! What a game!"],
  'pass-success':     ["{player} threads it through perfectly.", "Lovely ball from {player}!", "{player} finds their teammate — great vision!", "Crisp pass by {player}."],
  'pass-fail':        ["{player}'s pass goes straight to the opposition. Oops.", "Wayward ball from {player}. Not their finest moment.", "{player} tries a through ball... intercepted!"],
  'tackle-success':   ["{player} absolutely ROBS them! Clean tackle!", "{player} slides in and wins it!", "What a challenge from {player}!", "{player} nicks it away — brilliant!"],
  'tackle-fail':      ["{player} goes in hard but misses completely.", "{player} couldn't get a touch. It slipped right past."],
  'shot-miss':        ["{player} blasts it... over the bar by a mile!", "Oh! {player} puts that one into the stands. The birds are annoyed.", "{player} shoots — WIDE! So close and yet so not close at all.", "{player} skies it! That was optimistic."],
  'shot-saved':       ["{player} SHOOTS — the keeper smothers it!", "Thunderous effort from {player}! Right at the goalkeeper.", "{player} tries their luck from distance. Comfortable save."],
  'shot-greatSave':   ["INCREDIBLE SAVE!! The keeper denies {player} at point blank!", "How did they keep that out?! Phenomenal stop!", "{player}'s effort is tipped over brilliantly! Unbelievable!"],
  'goal-player':      ["{player} GOOOOOAAAAAALLLLL!! THE NET IS BULGING!!", "IT'S IN!! {player} scores an absolute SCREAMER!!", "{player} FINISHES IT!! The crowd erupts!!", "GET IN!! {player} with an absolutely FILTHY finish!!", "YESSSSS!! {player} does it!! WHAT A PLAYER!!"],
  'goal-opponent':    ["Oh no... {player} scores for {opponent}. That hurts.", "{opponent} find the net. {player} with the finish. Oof.", "THEY SCORE. {player} of {opponent} punishes a mistake. Painful."],
  'corner':           ["Corner kick for {team}! Everyone in the box!", "{team} win a corner. This could be dangerous..."],
  'throwin':          ["Ball out of play. Throw-in for {team}.", "It's a throw-in. {team} looking to build."],
  'foul':             ["{player} goes in a bit too enthusiastically. Free kick.", "Oh, that's a foul! {player} will be having words with the ref."],
};

// --- Name Generator --------------------------------------------
const NAME_GEN = {
  teamAdjectives: ['Wobbly','Muddy','Rusty','Dizzy','Sleepy','Sneaky','Bouncy','Wiggly','Lumpy','Grumpy','Chompy','Zippy','Floppy','Squishy','Wacky','Blobby','Soggy','Crusty','Frizzy','Gangly'],
  teamNouns:      ['Narwhals','Capybaras','Wombats','Penguins','Badgers','Hedgehogs','Llamas','Platypuses','Sloths','Ferrets','Otters','Raccoons','Armadillos','Axolotls','Blobfish','Echidnas','Quokkas','Tapirs','Manatees','Numbats'],
  playerFirst:    ['Bobbo','Jimbo','Fizzy','Buzzy','Zippy','Plonky','Boingo','Whumpo','Zappy','Dingus','Flumbo','Grumbo','Sploosh','Blorb','Yoink','Kerfuffle','Snazzle','Fumble','Wobble','Zonk'],
  playerLast:     ['Jenkins','McBonk','Fumblesworth','Kicksalot','Dribbleson','Shooterman','Tackleton','O\'Goalie','Tripsalot','McShooty','Passmore','Headbutt','Goalposts','Nettingham','McWhistle','Offsides','Penaltyson','Redcardigan','Freekick','Yellowstone'],
};

function generateTeamName() {
  const adj  = NAME_GEN.teamAdjectives[Math.floor(Math.random() * NAME_GEN.teamAdjectives.length)];
  const noun = NAME_GEN.teamNouns[Math.floor(Math.random() * NAME_GEN.teamNouns.length)];
  return `The ${adj} ${noun}`;
}

function generatePlayerName() {
  const first = NAME_GEN.playerFirst[Math.floor(Math.random() * NAME_GEN.playerFirst.length)];
  const last  = NAME_GEN.playerLast[Math.floor(Math.random() * NAME_GEN.playerLast.length)];
  return `${first} ${last}`;
}

// --- Fan Tier Progression (Phase 1) ----------------------------
const FAN_TIERS = {
  local:         { label: 'Local',         min: 0,      max: 4999   },
  regional:      { label: 'Regional',      min: 5000,   max: 49999  },
  national:      { label: 'National',      min: 50000,  max: 249999 },
  international: { label: 'International', min: 250000, max: 999999 },
};
const TIER_ORDER = ['local', 'regional', 'national', 'international'];

// Opponent tier -> required fan tier to challenge
const TIER_UNLOCK = { local: 'local', national: 'regional', international: 'national' };

// --- Markov Chain Transitions (Phase 2) ------------------------
// Keys: "prevState|currentState" for second-order, "*|currentState" for wildcard fallbacks
// Possession-change destinations (ending in _def) trigger atkIsPlayer swap in simulator
const MARKOV_TRANSITIONS = {
  // ===== SECOND-ORDER ENTRIES =====
  // After kickoff → midfield with fresh possession
  'kickoff|poss_mid_atk':          { poss_str_atk: 0.20, poss_mid_atk: 0.25, poss_def_atk: 0.15, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.05 },
  // Counter-attack after turnover in mid
  'poss_mid_def|poss_mid_atk':     { poss_str_atk: 0.28, poss_mid_atk: 0.22, poss_def_atk: 0.08, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.03 },
  // Sustained midfield possession
  'poss_mid_atk|poss_mid_atk':     { poss_str_atk: 0.28, poss_mid_atk: 0.18, poss_def_atk: 0.10, poss_mid_def: 0.24, poss_def_def: 0.09, dead_throwin_atk: 0.04, dead_foul_atk: 0.04, dead_corner_atk: 0.03 },
  // Striker lays off to mid, then mid builds again
  'poss_str_atk|poss_mid_atk':     { poss_str_atk: 0.30, poss_mid_atk: 0.20, poss_def_atk: 0.12, poss_mid_def: 0.20, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.04 },
  // After set piece → mid build-up
  'dead_corner_atk|poss_mid_atk':  { poss_str_atk: 0.25, poss_mid_atk: 0.20, poss_def_atk: 0.15, poss_mid_def: 0.20, poss_def_def: 0.12, dead_corner_atk: 0.04, dead_throwin_atk: 0.04 },
  'dead_foul_atk|poss_mid_atk':    { poss_str_atk: 0.28, poss_mid_atk: 0.22, poss_def_atk: 0.12, poss_mid_def: 0.22, poss_def_def: 0.10, dead_throwin_atk: 0.03, dead_foul_atk: 0.03 },

  // GK distributes → defender builds
  'poss_gk_atk|poss_def_atk':      { poss_mid_atk: 0.50, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  // Defender keeps ball
  'poss_def_atk|poss_def_atk':     { poss_mid_atk: 0.45, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.22, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  // Defender after winning the ball under pressure
  'poss_mid_def|poss_def_atk':     { poss_mid_atk: 0.40, poss_gk_atk: 0.20, poss_def_atk: 0.08, poss_mid_def: 0.24, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  // After corner cleared → defender has it
  'dead_corner_atk|poss_def_atk':  { poss_mid_atk: 0.45, poss_gk_atk: 0.20, poss_def_atk: 0.12, poss_mid_def: 0.18, dead_throwin_atk: 0.05 },

  // GK after save → build from back
  'save_def|poss_gk_atk':          { poss_def_atk: 0.40, poss_mid_atk: 0.35, poss_mid_def: 0.15, dead_throwin_atk: 0.10 },
  // GK after goal kick
  'dead_goalkick_def|poss_gk_atk': { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  // GK after restart (kickoff → GK gets ball somehow)
  'kickoff|poss_gk_atk':           { poss_def_atk: 0.40, poss_mid_atk: 0.40, poss_mid_def: 0.15, dead_throwin_atk: 0.05 },
  // GK after shot off target
  'shot_off_atk|poss_gk_atk':      { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },

  // Good through-ball to striker from mid
  'poss_mid_atk|poss_str_atk':     { shot_on_atk: 0.35, shot_off_atk: 0.15, poss_mid_atk: 0.15, poss_def_def: 0.20, dead_corner_atk: 0.08, dead_foul_atk: 0.07 },
  // Striker under pressure after defender had ball
  'poss_def_def|poss_str_atk':     { shot_on_atk: 0.15, shot_off_atk: 0.15, poss_mid_atk: 0.10, poss_def_def: 0.40, dead_foul_atk: 0.15, dead_corner_atk: 0.05 },
  // Counter-attack – striker with space
  'poss_mid_def|poss_str_atk':     { shot_on_atk: 0.30, shot_off_atk: 0.20, poss_mid_atk: 0.15, poss_def_def: 0.18, dead_corner_atk: 0.10, dead_foul_atk: 0.07 },
  // Striker holds up play and gets ball again
  'poss_str_atk|poss_str_atk':     { shot_on_atk: 0.25, shot_off_atk: 0.18, poss_mid_atk: 0.15, poss_def_def: 0.28, dead_corner_atk: 0.08, dead_foul_atk: 0.06 },
  // Header chance from corner
  'dead_corner_atk|poss_str_atk':  { shot_on_atk: 0.40, shot_off_atk: 0.20, poss_mid_atk: 0.10, poss_def_def: 0.20, dead_corner_atk: 0.05, dead_foul_atk: 0.05 },
  // Free kick to striker
  'dead_foul_atk|poss_str_atk':    { shot_on_atk: 0.38, shot_off_atk: 0.22, poss_mid_atk: 0.15, poss_def_def: 0.15, dead_corner_atk: 0.05, dead_foul_atk: 0.05 },

  // Shot on target after corner (header)
  'dead_corner_atk|shot_on_atk':   { goal_atk: 0.30, save_def: 0.50, dead_corner_atk: 0.20 },
  // Second shot on target (rebound situation)
  'shot_on_atk|shot_on_atk':       { goal_atk: 0.45, save_def: 0.40, dead_corner_atk: 0.15 },

  // Repeated corners (sustained pressure)
  'dead_corner_atk|dead_corner_atk': { shot_on_atk: 0.25, poss_str_atk: 0.30, poss_def_def: 0.25, dead_goalkick_def: 0.10, poss_mid_atk: 0.10 },
  // Foul in striker zone
  'poss_str_atk|dead_foul_atk':    { poss_str_atk: 0.25, shot_on_atk: 0.25, poss_mid_atk: 0.30, poss_def_def: 0.20 },
  // Foul in midfield zone
  'poss_mid_atk|dead_foul_atk':    { poss_mid_atk: 0.40, poss_str_atk: 0.25, poss_def_def: 0.20, shot_on_atk: 0.15 },

  // ===== WILDCARD FALLBACKS (first-order) =====
  '*|kickoff':             { poss_mid_atk: 1.0 },
  '*|poss_gk_atk':         { poss_def_atk: 0.35, poss_mid_atk: 0.40, poss_mid_def: 0.20, dead_throwin_atk: 0.05 },
  '*|poss_def_atk':        { poss_mid_atk: 0.45, poss_gk_atk: 0.15, poss_def_atk: 0.10, poss_mid_def: 0.22, dead_throwin_atk: 0.05, dead_foul_atk: 0.03 },
  '*|poss_mid_atk':        { poss_str_atk: 0.22, poss_mid_atk: 0.20, poss_def_atk: 0.13, poss_mid_def: 0.25, poss_def_def: 0.10, dead_throwin_atk: 0.04, dead_foul_atk: 0.04, dead_corner_atk: 0.02 },
  '*|poss_str_atk':        { shot_on_atk: 0.28, shot_off_atk: 0.14, poss_mid_atk: 0.18, poss_def_def: 0.24, dead_corner_atk: 0.08, dead_foul_atk: 0.08 },
  '*|shot_on_atk':         { goal_atk: 0.35, save_def: 0.48, dead_corner_atk: 0.17 },
  '*|shot_off_atk':        { dead_goalkick_def: 1.0 },
  '*|goal_atk':            { kickoff: 1.0 },
  '*|save_def':            { poss_gk_atk: 1.0 },
  '*|dead_corner_atk':     { shot_on_atk: 0.20, poss_str_atk: 0.28, poss_def_def: 0.28, dead_goalkick_def: 0.12, poss_mid_atk: 0.12 },
  '*|dead_throwin_atk':    { poss_mid_atk: 0.50, poss_def_atk: 0.20, poss_mid_def: 0.22, dead_throwin_atk: 0.08 },
  '*|dead_foul_atk':       { poss_mid_atk: 0.35, poss_str_atk: 0.22, poss_def_def: 0.22, shot_on_atk: 0.18, dead_corner_atk: 0.03 },
  '*|dead_goalkick_def':   { poss_gk_atk: 1.0 },
};

// Stat modifiers for specific transitions (Phase 2)
// Each key is "currentState|nextState". boost raises the probability, resist lowers it.
// Formula: adjustedProb = baseProb ± ((statValue - 5) / 10) * weight
const STAT_INFLUENCES = {
  'poss_str_atk|shot_on_atk':  { boost: { stat: 'shooting', role: 'str_atk', weight: 0.20 }, resist: { stat: 'strength', role: 'def_def', weight: 0.10 } },
  'shot_on_atk|goal_atk':      { boost: { stat: 'shooting', role: 'str_atk', weight: 0.15 }, resist: { stat: 'reflexes', role: 'gk_def',  weight: 0.20 } },
  'shot_on_atk|save_def':      { boost: { stat: 'reflexes', role: 'gk_def',  weight: 0.18 }, resist: { stat: 'shooting', role: 'str_atk', weight: 0.12 } },
  'poss_str_atk|shot_off_atk': { resist: { stat: 'shooting', role: 'str_atk', weight: 0.15 } },
  'poss_mid_atk|poss_mid_def': { boost: { stat: 'passing',  role: 'mid_def', weight: 0.12 }, resist: { stat: 'passing',  role: 'mid_atk', weight: 0.12 } },
  'poss_mid_atk|poss_mid_atk': { boost: { stat: 'passing',  role: 'mid_atk', weight: 0.10 } },
  'poss_mid_atk|poss_str_atk': { boost: { stat: 'passing',  role: 'mid_atk', weight: 0.10 } },
  'poss_str_atk|poss_def_def': { boost: { stat: 'strength', role: 'def_def', weight: 0.15 }, resist: { stat: 'speed',    role: 'str_atk', weight: 0.10 } },
  'poss_def_atk|poss_mid_def': { boost: { stat: 'passing',  role: 'mid_def', weight: 0.10 }, resist: { stat: 'passing',  role: 'def_atk', weight: 0.08 } },
  'poss_gk_atk|poss_mid_def':  { boost: { stat: 'passing',  role: 'mid_def', weight: 0.08 } },
};

// Per-event fan deltas (Phase 3) — base values before tier scaling
const EVENT_FAN_DELTAS = {
  'goal_player':        { base: 150, variance: 50  },
  'goal_opponent':      { base: -100, variance: 30 },
  'greatSave_player':   { base: 80,  variance: 20  },
  'greatSave_opponent': { base: -40, variance: 10  },
  'tackle_success':     { base: 15,  variance: 10  },
  'shot_miss_player':   { base: -10, variance: 5   },
};

// Opponent tier → fan delta multiplier for per-event deltas
const FAN_EVENT_TIER_SCALE = { local: 0.5, national: 1.0, international: 2.0, special: 1.5 };

// --- Utility ----------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
