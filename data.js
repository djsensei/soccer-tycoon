// ============================================================
// data.js — Static game content. Never mutated at runtime.
// ============================================================

const TEAM_SIZE = 5;
const POSITIONS = ['GK', 'D', 'M1', 'M2', 'S'];
const STATS = ['jumping', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck'];
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

const STAT_COLORS = {
  jumping: '#e88a3a', speed: '#42b4e8', strength: '#e05555',
  passing: '#6dbf67', shooting: '#f0b429', reflexes: '#b47de8', luck: '#e8d84a',
};
const STAT_ABBR = {
  jumping: 'JMP', speed: 'SPD', strength: 'STR',
  passing: 'PAS', shooting: 'SHO', reflexes: 'REF', luck: 'LCK',
};

const STAT_DESCRIPTIONS = {
  jumping:  'How high you can jump — headers, goalkeeper reach, aerial duels.',
  speed:    'Raw pace — chasing down balls, outrunning defenders.',
  strength: 'Physical power — tackles, holding off opponents, shielding the ball.',
  passing:  'Accuracy and vision — through balls, crosses, key passes.',
  shooting: 'Finishing ability — shot power, placement, long-range strikes.',
  reflexes: 'Reaction speed — saves, quick turns, reading the play.',
  luck:     'Pure randomness — deflections, bounces, last-minute miracles.',
};

// Per-stat milestone thresholds (tuned to event frequency)
const STAT_MILESTONES = {
  goals:       { stat: 'shooting', thresholds: [10, 25, 50, 75, 120, 180] },
  saves:       { stat: 'reflexes', thresholds: [15, 35, 75, 120, 180, 270] },
  tackles:     { stat: 'strength', thresholds: [15, 35, 75, 120, 180, 270] },
  passes:      { stat: 'passing',  thresholds: [200, 600, 1500, 3000, 5000, 7500] },
  shotsMissed: { stat: 'luck',     thresholds: [30, 75, 150, 250, 360, 525] },
};

// --- Gear Cards -------------------------------------------------
// statBonuses only lists non-zero stats. Zero-stat starting gear is valid.
const CARDS = {
  // === STARTING GEAR (sandlot underdog vibes, zero stats) ===
  'busted-sneakers':  { id: 'busted-sneakers',  name: 'Busted Sneakers',  slot: 'feet',   rarity: 'common', flavourText: 'One flap held on with duct tape.',   statBonuses: {} },
  'torn-t-shirt':     { id: 'torn-t-shirt',      name: 'Torn T-Shirt',     slot: 'body',   rarity: 'common', flavourText: "Was white once. Probably.",           statBonuses: {} },
  'ratty-headband':   { id: 'ratty-headband',    name: 'Ratty Headband',   slot: 'head',   rarity: 'common', flavourText: 'Found it behind the bleachers.',      statBonuses: {} },
  'holey-gloves':     { id: 'holey-gloves',      name: 'Holey Gloves',     slot: 'gloves', rarity: 'common', flavourText: 'Half the fingers are missing.',       statBonuses: {} },

  // === LEGENDARY ===
  'clone-jersey':     { id: 'clone-jersey',      name: 'Clone Jersey',     slot: 'body',   rarity: 'legendary', flavourText: 'The player is everywhere at once. Somehow legal.', statBonuses: { speed: 2, strength: 2, shooting: 2, passing: 2 } },
  'blackhole-gloves': { id: 'blackhole-gloves',  name: 'Black Hole Gloves',slot: 'gloves', rarity: 'legendary', flavourText: 'Nothing gets past. Nothing. Ever.',                statBonuses: { reflexes: 5, jumping: 3 } },
  'hyperspeed-cleats':{ id: 'hyperspeed-cleats', name: 'Hyperspeed Cleats',slot: 'feet',   rarity: 'legendary', flavourText: 'You briefly become invisible between steps.',      statBonuses: { speed: 5, shooting: 3 } },
  'crown-of-luck':    { id: 'crown-of-luck',     name: 'Crown of Luck',    slot: 'head',   rarity: 'legendary', flavourText: 'Forged from four-leaf clovers and wishbones.',     statBonuses: { luck: 5, passing: 3 } },

  // === SPECIAL TEAM UNIQUES (Phase 4) ===
  'robo-arm':          { id: 'robo-arm',          name: 'Robo Arm',          slot: 'gloves', rarity: 'legendary', flavourText: 'Catches everything. EVERYTHING.',                       statBonuses: { reflexes: 5, strength: 3 } },
  'gravity-boots':     { id: 'gravity-boots',     name: 'Gravity Boots',     slot: 'feet',   rarity: 'legendary', flavourText: 'Defies physics. Physicists are upset.',                 statBonuses: { speed: 5, shooting: 3 } },
  'dino-stomp-cleats': { id: 'dino-stomp-cleats', name: 'Dino Stomp Cleats', slot: 'feet',   rarity: 'legendary', flavourText: 'Left craters on the pitch. Ref allowed it.',            statBonuses: { strength: 5, jumping: 3 } },
  'lucky-scarf':       { id: 'lucky-scarf',       name: "Grandma's Lucky Scarf", slot: 'head', rarity: 'legendary', flavourText: 'Knitted with love. Radiates pure luck.',            statBonuses: { luck: 5, passing: 3 } },
  'shadow-cloak':      { id: 'shadow-cloak',      name: 'Shadow Cloak',      slot: 'body',   rarity: 'legendary', flavourText: 'Players phase through you. Somehow legal.',           statBonuses: { speed: 4, passing: 4 } },

  // @forge:start — managed by `forge.py export --apply` — do not edit manually
  'zephyr-kicks': { id: 'zephyr-kicks', name: 'Zephyr Kicks', slot: 'feet', rarity: 'common', flavourText: "Channeling the ancient spirit of wind itself.", statBonuses: { speed: 1 } },
  'mammoth-mallets': { id: 'mammoth-mallets', name: 'Mammoth Mallets', slot: 'feet', rarity: 'common', flavourText: "Beast mode: activated.", statBonuses: { strength: 1 } },
  'arrow-arcs': { id: 'arrow-arcs', name: 'Arrow Arcs', slot: 'feet', rarity: 'common', flavourText: "The ball follows where you point.", statBonuses: { passing: 1 } },
  'sonic-strikes': { id: 'sonic-strikes', name: 'Sonic Strikes', slot: 'feet', rarity: 'common', flavourText: "The ball breaks the sound barrier.", statBonuses: { shooting: 1 } },
  'butterfly-booties': { id: 'butterfly-booties', name: 'Butterfly Booties', slot: 'feet', rarity: 'common', flavourText: "Fluttery feet that dodge everything.", statBonuses: { reflexes: 1 } },
  'ninja-neons': { id: 'ninja-neons', name: 'Ninja Neons', slot: 'feet', rarity: 'common', flavourText: "Silent, deadly, and glowing for some reason.", statBonuses: { reflexes: 1 } },
  'rainbow-runners': { id: 'rainbow-runners', name: 'Rainbow Runners', slot: 'feet', rarity: 'common', flavourText: "The luck pot follows your feet.", statBonuses: { luck: 1 } },
  'zephyr-zip-up': { id: 'zephyr-zip-up', name: 'Zephyr Zip-up', slot: 'body', rarity: 'common', flavourText: "Wind spirit captured in a hoodie.", statBonuses: { speed: 1 } },
  'fortress-flannel': { id: 'fortress-flannel', name: 'Fortress Flannel', slot: 'body', rarity: 'common', flavourText: "Cozy AND indestructible.", statBonuses: { strength: 1 } },
  'harmony-jersey': { id: 'harmony-jersey', name: 'Harmony Jersey', slot: 'body', rarity: 'common', flavourText: "Pass, receive, repeat in perfect balance.", statBonuses: { passing: 1 } },
  'shockwave-shirt': { id: 'shockwave-shirt', name: 'Shockwave Shirt', slot: 'body', rarity: 'common', flavourText: "Shots create literal shockwaves.", statBonuses: { shooting: 1 } },
  'prosperity-poncho': { id: 'prosperity-poncho', name: 'Prosperity Poncho', slot: 'body', rarity: 'common', flavourText: "Attracts wealth and goals equally.", statBonuses: { luck: 1 } },
  'giraffe-guard': { id: 'giraffe-guard', name: 'Giraffe Guard', slot: 'head', rarity: 'common', flavourText: "Giraffe necks are long, right?", statBonuses: { jumping: 1 } },
  'vision-visor': { id: 'vision-visor', name: 'Vision Visor', slot: 'head', rarity: 'common', flavourText: "See everything on the field at once.", statBonuses: { passing: 1 } },
  'marksman-mask': { id: 'marksman-mask', name: 'Marksman Mask', slot: 'head', rarity: 'common', flavourText: "Only the finest shooters wear this.", statBonuses: { shooting: 1 } },
  'reflex-reactor-helm': { id: 'reflex-reactor-helm', name: 'Reflex Reactor Helm', slot: 'head', rarity: 'common', flavourText: "Reacts faster than thought.", statBonuses: { reflexes: 1 } },
  'blessing-band': { id: 'blessing-band', name: 'Blessing Band', slot: 'head', rarity: 'common', flavourText: "Blessed by every good luck source.", statBonuses: { luck: 1 } },
  'jellyfish-jetblasts': { id: 'jellyfish-jetblasts', name: 'Jellyfish Jetblasts', slot: 'feet', rarity: 'uncommon', flavourText: "Floats around luck like tentacles of fortune.", statBonuses: { luck: 2 } },
  'ninja-star-slashers': { id: 'ninja-star-slashers', name: 'Ninja Star Slashers', slot: 'feet', rarity: 'uncommon', flavourText: "Silent goal-scoring. Lethal accuracy. Zero mercy.", statBonuses: { shooting: 2 } },
  'forest-flyers': { id: 'forest-flyers', name: 'Forest Flyers', slot: 'feet', rarity: 'uncommon', flavourText: "Grown from enchanted trees. Very eco-friendly.", statBonuses: { passing: 1, speed: 1 } },
  'thunderpaw-boots': { id: 'thunderpaw-boots', name: 'Thunderpaw Boots', slot: 'feet', rarity: 'uncommon', flavourText: "Wild wolf paws with electric claws. Rawr and score!", statBonuses: { shooting: 1, strength: 1 } },
  'phoenix-flame-boots': { id: 'phoenix-flame-boots', name: 'Phoenix Flame Boots', slot: 'feet', rarity: 'uncommon', flavourText: "Rise from defeat with style and very hot feet.", statBonuses: { speed: 1, strength: 1 } },
  'mystic-moonboots': { id: 'mystic-moonboots', name: 'Mystic Moonboots', slot: 'feet', rarity: 'uncommon', flavourText: "Kick with the power of the moon. That is about 1/6 Earth power.", statBonuses: { passing: 1, shooting: 1 } },
  'spring-loaded-bouncy-boots': { id: 'spring-loaded-bouncy-boots', name: 'Spring-Loaded Bouncy Boots', slot: 'feet', rarity: 'uncommon', flavourText: "Your feet bounce before your brain catches up.", statBonuses: { reflexes: 2 } },
  'pizza-stompers': { id: 'pizza-stompers', name: 'Pizza Stompers', slot: 'feet', rarity: 'uncommon', flavourText: "Cheesy passes guaranteed. Grease not mandatory.", statBonuses: { passing: 2 } },
  'timber-beast-cleats': { id: 'timber-beast-cleats', name: 'Timber Beast Cleats', slot: 'feet', rarity: 'uncommon', flavourText: "Carved from a grizzly paw. Splinter-free, somehow.", statBonuses: { passing: 1, strength: 1 } },
  'cheetah-chompers': { id: 'cheetah-chompers', name: 'Cheetah Chompers', slot: 'feet', rarity: 'uncommon', flavourText: "Spotted for excellence, built for pouncing.", statBonuses: { speed: 2 } },
  'meteor-crushers': { id: 'meteor-crushers', name: 'Meteor Crushers', slot: 'feet', rarity: 'uncommon', flavourText: "Your cleats fell from space and hit HARD.", statBonuses: { strength: 2 } },
  'crystal-prism-kicks': { id: 'crystal-prism-kicks', name: 'Crystal Prism Kicks', slot: 'feet', rarity: 'uncommon', flavourText: "Refract light so bright, goalies can't see straight.", statBonuses: { shooting: 1, speed: 1 } },
  'disco-boots-of-destiny': { id: 'disco-boots-of-destiny', name: 'Disco Boots of Destiny', slot: 'feet', rarity: 'uncommon', flavourText: "Your feet are a mirror ball. Goals sparkle.", statBonuses: { luck: 1, shooting: 1 } },
  'valkyrie-jersey': { id: 'valkyrie-jersey', name: 'Valkyrie Jersey', slot: 'body', rarity: 'uncommon', flavourText: "Descends from above to strike the winning goal.", statBonuses: { jumping: 1, shooting: 1 } },
  'banana-bend': { id: 'banana-bend', name: 'Banana Bend', slot: 'body', rarity: 'uncommon', flavourText: "Curved shots that bend like lucky bananas.", statBonuses: { luck: 1, shooting: 1 } },
  'pterodactyl-top': { id: 'pterodactyl-top', name: 'Pterodactyl Top', slot: 'body', rarity: 'uncommon', flavourText: "Extinct everywhere except on the football pitch.", statBonuses: { jumping: 1, speed: 1 } },
  'artemis-vest': { id: 'artemis-vest', name: 'Artemis Vest', slot: 'body', rarity: 'uncommon', flavourText: "Greek goddess of the hunt. And assists. And goals.", statBonuses: { passing: 1, shooting: 1 } },
  'spider-silk': { id: 'spider-silk', name: 'Spider Silk', slot: 'body', rarity: 'uncommon', flavourText: "Webs of passes connecting every player on the pitch.", statBonuses: { passing: 2 } },
  'pony-express': { id: 'pony-express', name: 'Pony Express', slot: 'body', rarity: 'uncommon', flavourText: "Mail on horseback. Passes on fast-back.", statBonuses: { passing: 1, speed: 1 } },
  'hornet-shirt': { id: 'hornet-shirt', name: 'Hornet Shirt', slot: 'body', rarity: 'uncommon', flavourText: "Small, fast, and its sting really hurts.", statBonuses: { shooting: 1, speed: 1 } },
  'wrecking-ball': { id: 'wrecking-ball', name: 'Wrecking Ball', slot: 'body', rarity: 'uncommon', flavourText: "Came in like a... well you know the song.", statBonuses: { shooting: 1, strength: 1 } },
  'leprechaun-top': { id: 'leprechaun-top', name: 'Leprechaun Top', slot: 'body', rarity: 'uncommon', flavourText: "Catches the leprechaun AND the ball. Every time.", statBonuses: { luck: 1, speed: 1 } },
  'rhino-jersey': { id: 'rhino-jersey', name: 'Rhino Jersey', slot: 'body', rarity: 'uncommon', flavourText: "Has a horn on the collar. Yes it's regulation.", statBonuses: { strength: 2 } },
  'gazelle-vest': { id: 'gazelle-vest', name: 'Gazelle Vest', slot: 'body', rarity: 'uncommon', flavourText: "Graceful AND fast — defenders hate this one trick.", statBonuses: { speed: 2 } },
  'redwood-jersey': { id: 'redwood-jersey', name: 'Redwood Jersey', slot: 'body', rarity: 'uncommon', flavourText: "Been growing taller since the dinosaurs played footy.", statBonuses: { jumping: 2 } },
  'train-shirt': { id: 'train-shirt', name: 'Train Shirt', slot: 'body', rarity: 'uncommon', flavourText: "Full steam ahead and no brakes whatsoever.", statBonuses: { speed: 1, strength: 1 } },
  'cat-shirt': { id: 'cat-shirt', name: 'Cat Shirt', slot: 'body', rarity: 'uncommon', flavourText: "Has nine lives and uses them all in one match.", statBonuses: { luck: 2 } },  // ⚠ image pending
  'scorpion-vest': { id: 'scorpion-vest', name: 'Scorpion Vest', slot: 'body', rarity: 'uncommon', flavourText: "The tail strikes when you least expect it.", statBonuses: { shooting: 2 } },
  'laser-cat-visor': { id: 'laser-cat-visor', name: 'Laser Cat Visor', slot: 'head', rarity: 'uncommon', flavourText: "Now you've got cat-like reflexes. Literally. The whiskers help.", statBonuses: { reflexes: 2 } },
  'laser-focus-goggles': { id: 'laser-focus-goggles', name: 'Laser Focus Goggles', slot: 'head', rarity: 'uncommon', flavourText: "Red tinted lenses make everything look like a target. You become unstoppable.", statBonuses: { luck: 1, shooting: 1 } },
  'compass-captains-hat': { id: 'compass-captains-hat', name: 'Compass Captains Hat', slot: 'head', rarity: 'uncommon', flavourText: "Always knows which way the goal is. Even backwards.", statBonuses: { passing: 2 } },
  'comet-helmet': { id: 'comet-helmet', name: 'Comet Helmet', slot: 'head', rarity: 'uncommon', flavourText: "Zooming across the pitch at impossible speeds. Passes blur through air.", statBonuses: { passing: 1, shooting: 1 } },
  'viking-thunderhorn': { id: 'viking-thunderhorn', name: 'Viking Thunderhorn', slot: 'head', rarity: 'uncommon', flavourText: "Twin horns, unbridled confidence, legendary hair volume.", statBonuses: { jumping: 1, strength: 1 } },
  'rainbow-rabbit-ears': { id: 'rainbow-rabbit-ears', name: 'Rainbow Rabbit Ears', slot: 'head', rarity: 'uncommon', flavourText: "Hopping into luck. These ears bring perfect pass accuracy.", statBonuses: { luck: 1, passing: 1 } },  // ⚠ image pending
  'rainbow-sherbet-crown': { id: 'rainbow-sherbet-crown', name: 'Rainbow Sherbet Crown', slot: 'head', rarity: 'uncommon', flavourText: "Tastes like luck. Wait, don't lick it. Please.", statBonuses: { luck: 2 } },  // ⚠ image pending
  'dragons-crown': { id: 'dragons-crown', name: 'Dragons Crown', slot: 'head', rarity: 'uncommon', flavourText: "Made from shed dragon scales. Still a little warm.", statBonuses: { shooting: 2 } },
  'muscle-mushroom': { id: 'muscle-mushroom', name: 'Muscle Mushroom', slot: 'head', rarity: 'uncommon', flavourText: "A magical fungi cap that grows your passes AND your power-ups!", statBonuses: { passing: 1, strength: 1 } },  // ⚠ image pending
  'sniper-sombrero': { id: 'sniper-sombrero', name: 'Sniper Sombrero', slot: 'head', rarity: 'uncommon', flavourText: "Mexican hat of precision. Goal scorer's delight.", statBonuses: { jumping: 1, shooting: 1 } },
  'stargazer-helm': { id: 'stargazer-helm', name: 'Stargazer Helm', slot: 'head', rarity: 'uncommon', flavourText: "Reads the cosmos. Predicts saves three seconds early.", statBonuses: { luck: 1, reflexes: 1 } },
  'volcanic-coconut': { id: 'volcanic-coconut', name: 'Volcanic Coconut', slot: 'head', rarity: 'uncommon', flavourText: "Tropical toughness with explosive power inside.", statBonuses: { strength: 2 } },  // ⚠ image pending
  'owl-crown': { id: 'owl-crown', name: 'Owl Crown', slot: 'head', rarity: 'uncommon', flavourText: "Those giant eyes see everything. Even the sneaky goals.", statBonuses: { jumping: 1, reflexes: 1 } },
  'flamingo-fascinator': { id: 'flamingo-fascinator', name: 'Flamingo Fascinator', slot: 'head', rarity: 'uncommon', flavourText: "Pink, proud, and definitely taller.", statBonuses: { jumping: 2 } },
  'black-cat-boots': { id: 'black-cat-boots', name: 'Black Cat Boots', slot: 'feet', rarity: 'rare', flavourText: "Cross the path of defenders and curse their tackles.", statBonuses: { luck: 4 } },
  'plasma-jet-cleats': { id: 'plasma-jet-cleats', name: 'Plasma Jet Cleats', slot: 'feet', rarity: 'rare', flavourText: "Sci-fi thrusters that make running feel like flying.", statBonuses: { speed: 4 } },
  'jackpot-jammers': { id: 'jackpot-jammers', name: 'Jackpot Jammers', slot: 'gloves', rarity: 'uncommon', flavourText: "Three cherries and the ball is saved. JACKPOT.", statBonuses: { luck: 2 } },
  'slingshot-mitts': { id: 'slingshot-mitts', name: 'Slingshot Mitts', slot: 'gloves', rarity: 'common', flavourText: "Pull back and TWANG the ball downfield.", statBonuses: { passing: 1 } },
  'penny-pinchers': { id: 'penny-pinchers', name: 'Penny Pinchers', slot: 'gloves', rarity: 'common', flavourText: "Find a penny pick it up and save every shot.", statBonuses: { luck: 1 } },
  'phoenix-talons': { id: 'phoenix-talons', name: 'Phoenix Talons', slot: 'gloves', rarity: 'rare', flavourText: "Rise from every near-miss with fiery clutch saves.", statBonuses: { luck: 1, reflexes: 3 } },
  'viper-strikes': { id: 'viper-strikes', name: 'Viper Strikes', slot: 'gloves', rarity: 'uncommon', flavourText: "Two fangs of pure reaction speed in every save.", statBonuses: { reflexes: 2 } },
  'sushi-chef-hands': { id: 'sushi-chef-hands', name: 'Sushi Chef Hands', slot: 'gloves', rarity: 'uncommon', flavourText: "Fastest hands in the kitchen and the goal.", statBonuses: { passing: 1, reflexes: 1 } },
  'cat-paws': { id: 'cat-paws', name: 'Cat Paws', slot: 'gloves', rarity: 'common', flavourText: "Land on your hands every single time.", statBonuses: { reflexes: 1 } },  // ⚠ image pending
  'scorpion-stingers': { id: 'scorpion-stingers', name: 'Scorpion Stingers', slot: 'gloves', rarity: 'uncommon', flavourText: "Quick sting and a crushing grip in one package.", statBonuses: { reflexes: 1, strength: 1 } },  // ⚠ image pending
  'carrier-pigeon-boots': { id: 'carrier-pigeon-boots', name: 'Carrier Pigeon Boots', slot: 'feet', rarity: 'rare', flavourText: "Feathered delivery service right from your talented feet.", statBonuses: { passing: 4 } },
  'mecha-dragon-claws': { id: 'mecha-dragon-claws', name: 'Mecha Dragon Claws', slot: 'gloves', rarity: 'epic', flavourText: "Cybernetic dragon tech for ultimate saves and power.", statBonuses: { reflexes: 4, strength: 2 } },
  'thunder-drum-boots': { id: 'thunder-drum-boots', name: 'Thunder Drum Boots', slot: 'feet', rarity: 'rare', flavourText: "Every shot makes a boom heard three fields away.", statBonuses: { shooting: 4 } },
  'pancake-pressers': { id: 'pancake-pressers', name: 'Pancake Pressers', slot: 'gloves', rarity: 'common', flavourText: "Flatten every shot like Sunday morning breakfast.", statBonuses: { strength: 1 } },
  'mantis-shrimp-smacks': { id: 'mantis-shrimp-smacks', name: 'Mantis Shrimp Smacks', slot: 'gloves', rarity: 'rare', flavourText: "Fastest punch in the ocean now in glove form.", statBonuses: { reflexes: 3, strength: 1 } },  // ⚠ image pending
  'steel-titan-cleats': { id: 'steel-titan-cleats', name: 'Steel Titan Cleats', slot: 'feet', rarity: 'rare', flavourText: "Forged in a giant robot factory last Tuesday.", statBonuses: { strength: 4 } },
  'thunderbird-talons': { id: 'thunderbird-talons', name: 'Thunderbird Talons', slot: 'gloves', rarity: 'epic', flavourText: "Mythical storm bird brings lightning saves and luck.", statBonuses: { reflexes: 3, luck: 2, passing: 1 } },  // ⚠ image pending
  'cannonball-express': { id: 'cannonball-express', name: 'Cannonball Express', slot: 'feet', rarity: 'rare', flavourText: "Fired from a cannon and still running at full speed.", statBonuses: { speed: 3, strength: 1 } },
  'grizzly-bolt-cleats': { id: 'grizzly-bolt-cleats', name: 'Grizzly Bolt Cleats', slot: 'feet', rarity: 'epic', flavourText: "Bear charging at lightning speed is unfair but legal.", statBonuses: { speed: 4, strength: 2 } },
  'hermes-express-kicks': { id: 'hermes-express-kicks', name: 'Hermes Express Kicks', slot: 'feet', rarity: 'epic', flavourText: "Overnight divine delivery service. Passes arrive before you kick.", statBonuses: { passing: 4, speed: 2 } },
  'mako-shark-blitz': { id: 'mako-shark-blitz', name: 'Mako Shark Blitz', slot: 'feet', rarity: 'epic', flavourText: "Fastest shark alive with jaws that score from anywhere.", statBonuses: { speed: 4, shooting: 2 } },
  'catfish-creek-cleats': { id: 'catfish-creek-cleats', name: 'Catfish Creek Cleats', slot: 'feet', rarity: 'rare', flavourText: "Slippery smooth passes gliding through water like catfish whiskers.", statBonuses: { passing: 3, speed: 1 } },
  'koi-fish-drifters': { id: 'koi-fish-drifters', name: 'Koi Fish Drifters', slot: 'feet', rarity: 'rare', flavourText: "Lucky fish swimming upstream faster than the current flows.", statBonuses: { speed: 2, luck: 2 } },
  'ace-of-spades-kicks': { id: 'ace-of-spades-kicks', name: 'Ace of Spades Kicks', slot: 'feet', rarity: 'rare', flavourText: "Always dealt the best shot card in the deck.", statBonuses: { shooting: 3, luck: 1 } },
  'pixie-turbo-kicks': { id: 'pixie-turbo-kicks', name: 'Pixie Turbo Kicks', slot: 'feet', rarity: 'epic', flavourText: "Tiny fairy magic granting turbocharged speed and incredible luck.", statBonuses: { luck: 4, speed: 2 } },
  'basilisk-gaze-kicks': { id: 'basilisk-gaze-kicks', name: 'Basilisk Gaze Kicks', slot: 'feet', rarity: 'epic', flavourText: "One look paralyzes. One shot petrifies every single goalkeeper.", statBonuses: { shooting: 4, passing: 2 } },
  'poseidon-trident-kicks': { id: 'poseidon-trident-kicks', name: 'Poseidon Trident Kicks', slot: 'feet', rarity: 'epic', flavourText: "Three-pronged shots that even the ocean cannot stop today.", statBonuses: { shooting: 6 } },
  'dynamite-kickers': { id: 'dynamite-kickers', name: 'Dynamite Kickers', slot: 'feet', rarity: 'rare', flavourText: "Explosive shots with the strength to demolish any wall.", statBonuses: { shooting: 3, strength: 1 } },
  'peregrine-falcon-mach': { id: 'peregrine-falcon-mach', name: 'Peregrine Falcon Mach', slot: 'feet', rarity: 'epic', flavourText: "Fastest animal on earth now fastest shoe on earth.", statBonuses: { speed: 6 } },
  'chameleon-charm-boots': { id: 'chameleon-charm-boots', name: 'Chameleon Charm Boots', slot: 'feet', rarity: 'rare', flavourText: "Blend in then react with the luckiest color change ever.", statBonuses: { luck: 3, reflexes: 1 } },
  'piranha-strike-vest': { id: 'piranha-strike-vest', name: 'Piranha Strike Vest', slot: 'body', rarity: 'rare', flavourText: "Bites through defenses with razor sharp accuracy.", statBonuses: { shooting: 4 } },
  'kaiju-destroyer-vest': { id: 'kaiju-destroyer-vest', name: 'Kaiju Destroyer Vest', slot: 'body', rarity: 'epic', flavourText: "The monster so big it needs its own postal code.", statBonuses: { jumping: 4, strength: 2 } },
  'waffle-stack-hat': { id: 'waffle-stack-hat', name: 'Waffle Stack Hat', slot: 'head', rarity: 'rare', flavourText: "Twelve waffles high and dripping with maple syrup.", statBonuses: { jumping: 4 } },
  'kraken-fury-shirt': { id: 'kraken-fury-shirt', name: 'Kraken Fury Shirt', slot: 'body', rarity: 'epic', flavourText: "Release the kraken and unleash the ultimate shot.", statBonuses: { shooting: 6 } },
  'spartan-war-helm': { id: 'spartan-war-helm', name: 'Spartan War Helm', slot: 'head', rarity: 'rare', flavourText: "Three hundred headers and counting. No retreat.", statBonuses: { strength: 4 } },
  'adamantium-core-shirt': { id: 'adamantium-core-shirt', name: 'Adamantium Core Shirt', slot: 'body', rarity: 'epic', flavourText: "The hardest material in the universe. Unbreakable.", statBonuses: { strength: 6 } },
  'samurai-archer-vest': { id: 'samurai-archer-vest', name: 'Samurai Archer Vest', slot: 'body', rarity: 'rare', flavourText: "Elegant passes set up deadly precision strikes.", statBonuses: { passing: 2, shooting: 2 } },
  'magic-eight-ball-dome': { id: 'magic-eight-ball-dome', name: 'Magic Eight Ball Dome', slot: 'head', rarity: 'rare', flavourText: "Signs point to yes for every impossible save.", statBonuses: { luck: 2, reflexes: 2 } },
  'sunflower-titan-hat': { id: 'sunflower-titan-hat', name: 'Sunflower Titan Hat', slot: 'head', rarity: 'epic', flavourText: "Grows toward the sun and blocks out the entire sky.", statBonuses: { jumping: 6 } },
  'bullet-ant-blitz-jersey': { id: 'bullet-ant-blitz-jersey', name: 'Bullet Ant Blitz Jersey', slot: 'body', rarity: 'epic', flavourText: "The most painful sting delivered at bullet speed.", statBonuses: { speed: 4, shooting: 2 } },
  'wizard-staff-vest': { id: 'wizard-staff-vest', name: 'Wizard Staff Vest', slot: 'body', rarity: 'rare', flavourText: "Cast pass spells then blast fireball goals.", statBonuses: { shooting: 3, passing: 1 } },
  'archer-tower-visor': { id: 'archer-tower-visor', name: 'Archer Tower Visor', slot: 'head', rarity: 'rare', flavourText: "Elevation advantage plus perfect aim equals pure goals.", statBonuses: { jumping: 2, shooting: 2 } },  // ⚠ image pending
  'fortune-cookie-express': { id: 'fortune-cookie-express', name: 'Fortune Cookie Express', slot: 'body', rarity: 'rare', flavourText: "Delivers lucky fortunes at incredible speed.", statBonuses: { luck: 3, speed: 1 } },
  'wasabi-blast-cap': { id: 'wasabi-blast-cap', name: 'Wasabi Blast Cap', slot: 'head', rarity: 'rare', flavourText: "So spicy it makes the ball swerve into the net.", statBonuses: { shooting: 3, reflexes: 1 } },
  'horseshoe-helmet': { id: 'horseshoe-helmet', name: 'Horseshoe Helmet', slot: 'head', rarity: 'rare', flavourText: "Lucky enough to win every coin toss ever invented.", statBonuses: { luck: 4 } },
  'sequoia-hammer-crown': { id: 'sequoia-hammer-crown', name: 'Sequoia Hammer Crown', slot: 'head', rarity: 'epic', flavourText: "Tallest tree in the forest with a sledgehammer built in.", statBonuses: { jumping: 4, strength: 2 } },
  'wizard-pointy-hat': { id: 'wizard-pointy-hat', name: 'Wizard Pointy Hat', slot: 'head', rarity: 'rare', flavourText: "Casts passing spells that defy the laws of physics.", statBonuses: { passing: 4 } },
  'radar-sweep-band': { id: 'radar-sweep-band', name: 'Radar Sweep Band', slot: 'head', rarity: 'rare', flavourText: "Detects incoming shots before they even happen somehow.", statBonuses: { reflexes: 4 } },
  'northern-star-helm': { id: 'northern-star-helm', name: 'Northern Star Helm', slot: 'head', rarity: 'rare', flavourText: "Follow the star and your passes always find home.", statBonuses: { passing: 3, luck: 1 } },
  'mecha-railgun-visor': { id: 'mecha-railgun-visor', name: 'Mecha Railgun Visor', slot: 'head', rarity: 'epic', flavourText: "Electromagnetic acceleration delivers shots at orbital velocity.", statBonuses: { shooting: 6 } },
  'pirate-cannon-cap': { id: 'pirate-cannon-cap', name: 'Pirate Cannon Cap', slot: 'head', rarity: 'rare', flavourText: "Fires cannonball passes that always find the treasure.", statBonuses: { passing: 2, shooting: 2 } },
  'plasma-vortex-vest': { id: 'plasma-vortex-vest', name: 'Plasma Vortex Vest', slot: 'body', rarity: 'epic', flavourText: "A spinning plasma tornado that obliterates all defenders.", statBonuses: { speed: 6 } },
  'chili-pepper-charge': { id: 'chili-pepper-charge', name: 'Chili Pepper Charge', slot: 'body', rarity: 'rare', flavourText: "Spicy speed with a kick that really burns.", statBonuses: { speed: 3, strength: 1 } },
  'dolphin-pod-vest': { id: 'dolphin-pod-vest', name: 'Dolphin Pod Vest', slot: 'body', rarity: 'rare', flavourText: "Passes leap gracefully through the whole team.", statBonuses: { passing: 4 } },
  'mystic-fox-hood': { id: 'mystic-fox-hood', name: 'Mystic Fox Hood', slot: 'head', rarity: 'epic', flavourText: "Nine-tailed fox spirit dodges destiny and catches everything.", statBonuses: { reflexes: 4, luck: 2 } },  // ⚠ image pending
  'cactus-saguaro-jersey': { id: 'cactus-saguaro-jersey', name: 'Cactus Saguaro Jersey', slot: 'body', rarity: 'rare', flavourText: "Tall, prickly, and nobody wants to tackle it.", statBonuses: { jumping: 3, strength: 1 } },
  'control-tower-crown': { id: 'control-tower-crown', name: 'Control Tower Crown', slot: 'head', rarity: 'epic', flavourText: "Air traffic controller sees everything and directs every pass perfectly.", statBonuses: { passing: 4, jumping: 2 } },  // ⚠ image pending
  'dreamcatcher-jersey': { id: 'dreamcatcher-jersey', name: 'Dreamcatcher Jersey', slot: 'body', rarity: 'rare', flavourText: "Catches bad luck and only lets good goals through.", statBonuses: { luck: 4 } },
  'nacho-supreme-blaster-vest': { id: 'nacho-supreme-blaster-vest', name: 'Nacho Supreme Blaster Vest', slot: 'body', rarity: 'epic', flavourText: "Loaded with extra cheese AND extra firepower.", statBonuses: { luck: 4, shooting: 2 } },
  'taco-truck-armor': { id: 'taco-truck-armor', name: 'Taco Truck Armor', slot: 'body', rarity: 'rare', flavourText: "Protected by layers of cheese, beef, and destiny.", statBonuses: { strength: 4 } },
  'firefly-dash-shirt': { id: 'firefly-dash-shirt', name: 'Firefly Dash Shirt', slot: 'body', rarity: 'rare', flavourText: "Glows with luck and darts through the night.", statBonuses: { speed: 2, luck: 2 } },
  'polar-bear-rush-jersey': { id: 'polar-bear-rush-jersey', name: 'Polar Bear Rush Jersey', slot: 'body', rarity: 'epic', flavourText: "Arctic power at surprising predator speed.", statBonuses: { strength: 4, speed: 2 } },  // ⚠ image pending
  'hot-sauce-bottle-cap': { id: 'hot-sauce-bottle-cap', name: 'Hot Sauce Bottle Cap', slot: 'head', rarity: 'rare', flavourText: "Spicy shots that burn through every net on earth.", statBonuses: { shooting: 4 } },
  'bamboo-warrior-hat': { id: 'bamboo-warrior-hat', name: 'Bamboo Warrior Hat', slot: 'head', rarity: 'rare', flavourText: "Grows tall and hits hard like a bamboo forest.", statBonuses: { jumping: 3, strength: 1 } },
  'cybernetic-reflex-array': { id: 'cybernetic-reflex-array', name: 'Cybernetic Reflex Array', slot: 'head', rarity: 'epic', flavourText: "Neural implants predict shots 3.7 seconds before they happen.", statBonuses: { reflexes: 6 } },
  'samurai-fortune-helm': { id: 'samurai-fortune-helm', name: 'Samurai Fortune Helm', slot: 'head', rarity: 'epic', flavourText: "Bushido discipline plus divine fortune equals perfect strikes.", statBonuses: { shooting: 4, luck: 2 } },
  'beanstalk-king-jersey': { id: 'beanstalk-king-jersey', name: 'Beanstalk King Jersey', slot: 'body', rarity: 'rare', flavourText: "Fee fi fo fum. Headers from the sky are fun.", statBonuses: { jumping: 4 } },  // ⚠ image pending
  'donut-destroyer-hat': { id: 'donut-destroyer-hat', name: 'Donut Destroyer Hat', slot: 'head', rarity: 'epic', flavourText: "Sugar-powered headbutts that flatten everything in sight completely.", statBonuses: { strength: 6 } },  // ⚠ image pending
  'ice-cream-truck-express': { id: 'ice-cream-truck-express', name: 'Ice Cream Truck Express', slot: 'body', rarity: 'epic', flavourText: "Delivers scoops of perfection before they melt.", statBonuses: { passing: 4, speed: 2 } },  // ⚠ image pending
  // @forge:end
};

const STARTING_GEAR = {
  GK:    { head: 'ratty-headband', body: 'torn-t-shirt', feet: 'busted-sneakers', gloves: 'holey-gloves' },
  other: { head: 'ratty-headband', body: 'torn-t-shirt', feet: 'busted-sneakers', gloves: null },
};

// --- Pack Types -------------------------------------------------
// weights array: [common, uncommon, rare, epic, legendary]
const PACK_TYPES = {
  basic:     { id: 'basic',     name: 'Basic Pack',     description: 'Three random cards. Could be anything!',   cardsPerPack: 3, weights: [0.70, 0.25, 0.05, 0.00, 0.00] },
  silver:    { id: 'silver',    name: 'Silver Pack',    description: 'Better odds. Better gear.',                cardsPerPack: 3, weights: [0.40, 0.35, 0.20, 0.05, 0.00] },
  gold:      { id: 'gold',      name: 'Gold Pack',      description: "Now we're talking.",                       cardsPerPack: 3, weights: [0.15, 0.30, 0.35, 0.15, 0.05] },
  special:   { id: 'special',   name: 'Special Pack',   description: 'Only from the weird teams.',               cardsPerPack: 4, weights: [0.05, 0.20, 0.35, 0.28, 0.12] },
  promotion: { id: 'promotion', name: 'Promotion Pack', description: 'Earned by finishing first! Big rewards.',  cardsPerPack: 5, weights: [0.05, 0.25, 0.35, 0.25, 0.10] },
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
  regional:      2500,
  state:         5000,
  national:      10000,
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
  // Special teams — unique card drops, not part of the league system
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
  playerFirst: [
    'Bobbo','Jimbo','Fizzy','Buzzy','Zippy','Plonky','Boingo','Whumpo','Zappy','Dingus',
    'Flumbo','Grumbo','Sploosh','Blorb','Yoink','Kerfuffle','Snazzle','Fumble','Wobble','Zonk',
    'Bongo','Noodle','Sprocket','Waffle','Turbo','Pickles','Nugget','Gizmo','Scooter','Muffin',
    'Toots','Bonk','Squish','Rascal','Blinky','Chomps','Wiggles','Doodle','Spud','Frazzle',
    'Tater','Chonk','Blip','Goober','Twitch','Skipper','Pudding','Binky','Wombat','Crouton',
    'Clonk','Noobert','Zinger','Jellybean','Kazoo','Burrito','Snorkel','Toffee','Dibble','Pistachio',
  ],
  playerLast: [
    'Jenkins','McBonk','Fumblesworth','Kicksalot','Dribbleson','Shooterman','Tackleton','O\'Goalie',
    'Tripsalot','McShooty','Passmore','Headbutt','Goalposts','Nettingham','McWhistle','Offsides',
    'Penaltyson','Redcardigan','Freekick','Yellowstone',
    'McThunder','Bananakick','Von Dribble','Soccerball','Goalsworth','Thunderboot','Tackleberry',
    'Nutmeg','Bouncefield','Crunchtackle','Volley','Offside-Trap','Crossbar','Dribbleton','McHeader',
    'Whistleblower','Longshot','Bicycle','Slidetackle','Hatrick',
    'Fluffington','Von Biscuit','Wobblebottom','Snoozleton','McSnack','Pancake','Giggles',
    'Bumbleton','Noodlearm','Tumbleweed','Dingbat','Snickerdoodle','Cabbagehead','Mudpie','Clodhopper',
    'Butterfingers','Fizzbomb','Splatsworth','Wafflehaus','Pretzelberg',
  ],
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

// --- League System (M7) ----------------------------------------
const LEAGUE_ORDER = ['local', 'regional', 'state', 'national', 'international'];

const LEAGUE_DEFINITIONS = {
  local:         { name: 'Marin County League',    geography: 'Marin County', size: 6,  diffMin: 1, diffMax: 3  },
  regional:      { name: 'Bay Area League',         geography: 'Bay Area',     size: 8,  diffMin: 4, diffMax: 6  },
  state:         { name: 'California League',       geography: 'California',   size: 10, diffMin: 6, diffMax: 9  },
  national:      { name: 'USA League',              geography: 'USA',          size: 12, diffMin: 8, diffMax: 10 },
  international: { name: 'World League',            geography: 'World',        size: 14, diffMin: 10, diffMax: 10 },
};

const LEAGUE_TEAMS = [
  // Local — Marin County (5 NPC teams)
  { id: 'sausalito-seals',     name: 'Sausalito Seals',      league: 'local', difficulty: 1, specialNote: 'Trained by actual seals. Allegedly.' },
  { id: 'tiburon-sharks',      name: 'Tiburon Sharks',       league: 'local', difficulty: 2, specialNote: 'Named after sharks. Play like goldfish.' },
  { id: 'mill-valley-mushrooms', name: 'Mill Valley Mushrooms', league: 'local', difficulty: 2, specialNote: 'They grow on you. Literally.' },
  { id: 'novato-narwhals',     name: 'Novato Narwhals',      league: 'local', difficulty: 3, specialNote: 'Landlocked narwhals. Very confused.' },
  { id: 'larkspur-ladybugs',   name: 'Larkspur Ladybugs',    league: 'local', difficulty: 3, specialNote: 'Small but surprisingly bitey.' },

  // Regional — Bay Area (7 NPC teams)
  { id: 'oakland-ogres',       name: 'Oakland Ogres',        league: 'regional', difficulty: 4, specialNote: 'Big, green, and grumpy about it.' },
  { id: 'sf-fog-machines',     name: 'SF Fog Machines',      league: 'regional', difficulty: 4, specialNote: 'You literally cannot see them.' },
  { id: 'berkeley-brainiacs',  name: 'Berkeley Brainiacs',   league: 'regional', difficulty: 5, specialNote: 'Calculated your defeat in advance.' },
  { id: 'palo-alto-pixels',    name: 'Palo Alto Pixels',     league: 'regional', difficulty: 5, specialNote: 'Buffering... buffering... GOAL.' },
  { id: 'san-jose-jackrabbits', name: 'San Jose Jackrabbits', league: 'regional', difficulty: 5, specialNote: 'Fast and jumpy. Very jumpy.' },
  { id: 'fremont-fireballs',   name: 'Fremont Fireballs',    league: 'regional', difficulty: 6, specialNote: 'Everything they touch burns. Metaphorically.' },
  { id: 'santa-cruz-surfers',  name: 'Santa Cruz Surfers',   league: 'regional', difficulty: 6, specialNote: 'Ride the wave. Score the goal. Hang ten.' },

  // State — California (9 NPC teams)
  { id: 'la-lasers',           name: 'LA Lasers',            league: 'state', difficulty: 6, specialNote: 'Hollywood special effects on the pitch.' },
  { id: 'sacramento-scorpions', name: 'Sacramento Scorpions', league: 'state', difficulty: 7, specialNote: 'Capital punishment for defenders.' },
  { id: 'san-diego-sunburns',  name: 'San Diego Sunburns',   league: 'state', difficulty: 7, specialNote: 'Too much beach. Not enough sunscreen.' },
  { id: 'fresno-falcons',      name: 'Fresno Falcons',       league: 'state', difficulty: 8, specialNote: 'Swooping in from the Central Valley.' },
  { id: 'bakersfield-boulders', name: 'Bakersfield Boulders', league: 'state', difficulty: 8, specialNote: 'Immovable. Unstoppable. Unmotivated.' },
  { id: 'tahoe-yetis',         name: 'Tahoe Yetis',          league: 'state', difficulty: 8, specialNote: 'Spotted on the field. Never confirmed.' },
  { id: 'redding-rattlesnakes', name: 'Redding Rattlesnakes', league: 'state', difficulty: 9, specialNote: 'Listen for the rattle. Then run.' },
  { id: 'stockton-stingrays',  name: 'Stockton Stingrays',   league: 'state', difficulty: 9, specialNote: 'Silent. Deadly. Surprisingly flat.' },
  { id: 'napa-grape-stompers', name: 'Napa Grape Stompers',  league: 'state', difficulty: 9, specialNote: 'Wine connoisseurs. Goal connoisseurs.' },

  // National — USA (11 NPC teams)
  { id: 'nyc-skyscrapers',     name: 'NYC Skyscrapers',      league: 'national', difficulty: 8, specialNote: 'Tall players. Taller buildings. Tallest egos.' },
  { id: 'chicago-cyclones',    name: 'Chicago Cyclones',     league: 'national', difficulty: 8, specialNote: 'The Windy City blows everyone away.' },
  { id: 'miami-flamingos',     name: 'Miami Flamingos',      league: 'national', difficulty: 9, specialNote: 'Standing on one leg is their warm-up.' },
  { id: 'dallas-dust-devils',  name: 'Dallas Dust Devils',   league: 'national', difficulty: 9, specialNote: 'Everything is bigger. Including defeats.' },
  { id: 'seattle-sasquatches', name: 'Seattle Sasquatches',  league: 'national', difficulty: 9, specialNote: 'Large. Hairy. Suspiciously good at headers.' },
  { id: 'denver-avalanche',    name: 'Denver Avalanche',     league: 'national', difficulty: 10, specialNote: 'They come downhill. Fast.' },
  { id: 'boston-brawlers',      name: 'Boston Brawlers',      league: 'national', difficulty: 10, specialNote: 'Wicked strong tackles. Very pahked.' },
  { id: 'phoenix-firebirds',   name: 'Phoenix Firebirds',    league: 'national', difficulty: 10, specialNote: 'Reborn from defeat every single match.' },
  { id: 'detroit-diesel',      name: 'Detroit Diesel',       league: 'national', difficulty: 10, specialNote: 'Built like engines. Run like engines.' },
  { id: 'atlanta-alligators',  name: 'Atlanta Alligators',   league: 'national', difficulty: 10, specialNote: 'Death roll tackles. Totally fair.' },
  { id: 'portland-peculiars',  name: 'Portland Peculiars',   league: 'national', difficulty: 10, specialNote: 'Weird strategy. Somehow works.' },

  // International — World (13 NPC teams)
  { id: 'tokyo-thunder',       name: 'Tokyo Thunder',        league: 'international', difficulty: 10, specialNote: 'Lightning-fast attacks. Anime celebrations.' },
  { id: 'london-legends',      name: 'London Legends',       league: 'international', difficulty: 10, specialNote: 'Drinking tea at halftime. Still winning.' },
  { id: 'paris-phantoms',      name: 'Paris Phantoms',       league: 'international', difficulty: 10, specialNote: 'Oui oui, they scored again.' },
  { id: 'rio-samba-stars',     name: 'Rio Samba Stars',      league: 'international', difficulty: 10, specialNote: 'Dancing while dribbling. HOW?!' },
  { id: 'sydney-stormers',     name: 'Sydney Stormers',      league: 'international', difficulty: 10, specialNote: 'Upside-down football. Still counts.' },
  { id: 'cairo-cobras',        name: 'Cairo Cobras',         league: 'international', difficulty: 10, specialNote: 'Ancient soccer wisdom. Pharaoh-level.' },
  { id: 'berlin-blitz',        name: 'Berlin Blitz',         league: 'international', difficulty: 10, specialNote: 'Precision passes. Zero wasted moves.' },
  { id: 'mexico-city-jaguars', name: 'Mexico City Jaguars',  league: 'international', difficulty: 10, specialNote: 'Jungle speed. Jungle strength. Jungle goals.' },
  { id: 'mumbai-monsoons',     name: 'Mumbai Monsoons',      league: 'international', difficulty: 10, specialNote: 'A torrential flood of goals.' },
  { id: 'toronto-timber-wolves', name: 'Toronto Timber Wolves', league: 'international', difficulty: 10, specialNote: 'Pack hunting formation. No escape.' },
  { id: 'moscow-mammoths',     name: 'Moscow Mammoths',      league: 'international', difficulty: 10, specialNote: 'Prehistoric power. Modern problems.' },
  { id: 'nairobi-nighthawks',  name: 'Nairobi Nighthawks',   league: 'international', difficulty: 10, specialNote: 'Strike under cover of darkness.' },
  { id: 'seoul-strikers',      name: 'Seoul Strikers',       league: 'international', difficulty: 10, specialNote: 'K-pop celebrations after every goal.' },
];

const LEAGUE_PACK_REWARDS = {
  local:         { win: 'basic',  tie: null,     loss: null    },
  regional:      { win: 'silver', tie: 'basic',  loss: null    },
  state:         { win: 'silver', tie: 'basic',  loss: null    },
  national:      { win: 'gold',   tie: 'silver', loss: 'basic' },
  international: { win: 'gold',   tie: 'silver', loss: 'basic' },
};

// --- Fan Tier Progression (Phase 1) ----------------------------
const FAN_TIERS = {
  local:         { label: 'Local',         min: 0,      max: 4999   },
  regional:      { label: 'Regional',      min: 5000,   max: 49999  },
  national:      { label: 'National',      min: 50000,  max: 249999 },
  international: { label: 'International', min: 250000, max: 999999 },
};
const TIER_ORDER = ['local', 'regional', 'national', 'international'];

// Opponent tier -> required fan tier to challenge (legacy — kept for save compat)

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
const FAN_EVENT_TIER_SCALE = { local: 0.5, regional: 0.7, state: 1.0, national: 1.5, international: 2.0, special: 1.5 };

// --- Utility ----------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
