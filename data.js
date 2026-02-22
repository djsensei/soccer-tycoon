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
  'turbo-cleats':     { id: 'turbo-cleats',      name: 'Turbo Cleats',     slot: 'feet',   rarity: 'common',   flavourText: 'Guaranteed to go vroom.',                          statBonuses: { speed: 2 } },
  'lucky-headband':   { id: 'lucky-headband',    name: 'Lucky Headband',   slot: 'head',   rarity: 'common',   flavourText: 'Brings luck. Smells weird.',                       statBonuses: { luck: 2 } },
  'basic-shinguards': { id: 'basic-shinguards',  name: 'Basic Shin Guards',slot: 'body',   rarity: 'common',   flavourText: 'Better than nothing. Barely.',                     statBonuses: { strength: 1 } },
  'cotton-gloves':    { id: 'cotton-gloves',     name: 'Cotton Gloves',    slot: 'gloves', rarity: 'common',   flavourText: 'For someone who tried.',                            statBonuses: { reflexes: 1 } },

  // === UNCOMMON ===
  'padded-vest':      { id: 'padded-vest',       name: 'Padded Vest',      slot: 'body',   rarity: 'uncommon', flavourText: 'Absorbs tackles like a champ.',                    statBonuses: { strength: 2, height: 1 } },
  'grip-gloves':      { id: 'grip-gloves',       name: 'Grip Gloves',      slot: 'gloves', rarity: 'uncommon', flavourText: 'Sticks to everything.',                            statBonuses: { reflexes: 3 } },
  'sprinting-spikes': { id: 'sprinting-spikes',  name: 'Sprinting Spikes', slot: 'feet',   rarity: 'uncommon', flavourText: 'Leave little holes everywhere.',                   statBonuses: { speed: 2, shooting: 1 } },
  'focus-visor':      { id: 'focus-visor',       name: 'Focus Visor',      slot: 'head',   rarity: 'uncommon', flavourText: 'Everything looks like a target.',                  statBonuses: { passing: 2, shooting: 1 } },

  // === RARE ===
  'rocket-boots':     { id: 'rocket-boots',      name: 'Rocket Boots',     slot: 'feet',   rarity: 'rare',     flavourText: 'Actual small rockets. Safety not guaranteed.',     statBonuses: { speed: 4, shooting: 2 } },
  'gravity-gloves':   { id: 'gravity-gloves',    name: 'Gravity Gloves',   slot: 'gloves', rarity: 'rare',     flavourText: 'The ball just... comes to them.',                  statBonuses: { reflexes: 4, height: 2 } },
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
  { id: 'robo-kickers',      name: 'The Robo-Kickers',  tier: 'special',       difficulty: 7, specialNote: 'All robots. Beep boop. BEEP BOOP.',       playerNames: ['Unit-GK7',        'Defense-Bot',    'Midfield-3000',  'Passing-Unit',   'StrikeBot-X'     ] },
  { id: 'alien-all-stars',   name: 'Alien All-Stars',   tier: 'special',       difficulty: 9, specialNote: 'Eight legs. Four eyes. Zero mercy.',      playerNames: ['Zorbax',          'Glurp',          'Fizznok',        'Blargle',        'Zeeble'          ] },
  { id: 'dinosaur-fc',       name: 'Dinosaur FC',       tier: 'special',       difficulty: 10,specialNote: 'They are DINOSAURS.',                     playerNames: ['Rex Rampage',     'Pterry Swoop',   'Trike Horn',     'Stego Tail',     'Raptor Dash'     ] },
  { id: 'the-grandmas',      name: 'The Grandmas',      tier: 'special',       difficulty: 6, specialNote: 'Surprisingly good. Suspiciously good.',   playerNames: ['Nan Kickhard',    'Gran Tackle',    'Granny Shoot',   'Nanna Goalie',   'Grammy Dribble'  ] },
  { id: 'shadow-squad',      name: 'Shadow Squad',      tier: 'special',       difficulty: 8, specialNote: 'Play at midnight. Very mysterious.',      playerNames: ['The Shadow',      'Dark Presence',  'Night Striker',  'Void Walker',    'Eclipse'         ] },
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

// --- Utility ----------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
