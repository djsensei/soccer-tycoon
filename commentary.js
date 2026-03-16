// ============================================================
// commentary.js — Match commentary templates + selection logic
// ============================================================
//
// Commentary "rarity" controls the TONE, not frequency of events:
//   common     — straight sports commentary
//   uncommon   — personality and flair
//   rare       — genuinely funny / weird
//   epic       — absurd, over-the-top
//   legendary  — full Gus Johnson / Bill Walton unhinged mode
//
// Context-aware keys (e.g. goal-player-equalizer-late) are tried
// most-specific-first, falling back to the base key.
//
// To add commentary: just append strings to the appropriate
// rarity array in COMMENTARY. That's it.
// ============================================================

// How often each tone tier is selected
const COMMENTARY_RARITY_WEIGHTS = {
  common:    0.50,
  uncommon:  0.25,
  rare:      0.15,
  epic:      0.07,
  legendary: 0.03,
};

const COMMENTARY_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const COMMENTARY = {

  // =============================================================
  // STRUCTURAL EVENTS
  // =============================================================

  'kickoff': {
    common: [
      "The whistle blows — {team} vs {opponent}, here we go.",
      "And we're off! {team} take on {opponent}.",
      "Kickoff! The match is underway.",
    ],
    uncommon: [
      "The ref blows the whistle and {team} vs {opponent} is ON!",
      "HERE WE GO! {team} take on {opponent}!",
      "{opponent} look nervous. {team} look ready. LET'S PLAY!",
    ],
    rare: [
      "The crowd roars as {team} vs {opponent} kicks off! This one's going to be GOOD!",
      "Both teams are on the pitch and the ref has already lost control. KICKOFF!",
    ],
    epic: [
      "Ladies and gentlemen, strap in. {team} vs {opponent}. This is NOT a drill.",
    ],
    legendary: [
      "OH MY GOODNESS the atmosphere is ELECTRIC!! {team}! {opponent}! SOMEBODY HOLD ME!!",
    ],
  },

  'halftime': {
    common: [
      "Half time. The teams head to the tunnel.",
      "The whistle goes — that's the half.",
      "Half time.",
    ],
    uncommon: [
      "HALF TIME! Catch your breath — it's been a ride.",
      "That's the half! Time for some orange slices.",
      "Half time already! That flew by.",
    ],
    rare: [
      "Half time! Someone check on the referee — he looks exhausted.",
      "The players trudge off for half time. The hot dogs are calling.",
    ],
    epic: [
      "HALF TIME! I need a lie down after that first half. And maybe a sandwich.",
    ],
    legendary: [
      "HALF TIME AND I AM BESIDE MYSELF!! I can't feel my legs! What sport is this?!",
    ],
  },

  'fulltime': {
    common: [
      "Full time! That's the match.",
      "The referee blows for full time.",
      "And that's it — full time.",
    ],
    uncommon: [
      "IT'S OVER! What a game!",
      "Full time! The final whistle blows!",
      "That's the final whistle! What a match that was!",
    ],
    rare: [
      "FULL TIME!! Both teams gave everything out there.",
      "It's all over! The crowd is on its feet!",
    ],
    epic: [
      "THE REF SAYS NO MORE! IT'S DONE! IT'S FINISHED! GO HOME EVERYONE!",
    ],
    legendary: [
      "FULL TIME AND MY VOICE IS GONE!! WHAT A SPECTACLE OF HUMAN ACHIEVEMENT!!",
    ],
  },

  // =============================================================
  // PASSES
  // =============================================================

  'pass-success': {
    common: [
      "{player} passes to a teammate.",
      "Good ball from {player}.",
      "{player} finds a teammate with a neat pass.",
      "{player} plays it forward.",
      "Quick pass from {player}.",
      "Tidy work from {player} in possession.",
    ],
    uncommon: [
      "{player} threads it through perfectly!",
      "Lovely ball from {player}!",
      "{player} finds their teammate — great vision!",
      "Crisp pass by {player}. Textbook.",
      "{player} pings it across beautifully!",
    ],
    rare: [
      "That pass from {player} had EYES! How did they see that?",
      "{player}'s pass was so good, even the opposition applauded.",
      "Pass of the match from {player}! Frame that one!",
    ],
    epic: [
      "{player} just split the entire defence with a single pass. Call the police.",
      "Did {player} just bend the laws of physics with that pass?! THE CURVE!",
    ],
    legendary: [
      "OH!! {player}!! THAT PASS!! I've never seen anything like it!! My GRANDMOTHER could've scored from there!! UNBELIEVABLE!!",
    ],
  },

  'pass-fail': {
    common: [
      "{player}'s pass goes astray.",
      "Loose ball from {player}. Intercepted.",
      "{player}'s pass is cut out.",
      "That won't do — {player} gives it away.",
      "{player} misplaces the pass.",
      "Intercepted! {player}'s pass doesn't find its target.",
    ],
    uncommon: [
      "Wayward ball from {player}. Not their finest moment.",
      "{player} tries a through ball... nope!",
      "Oh dear, {player}. That was meant for a teammate.",
      "{player} had options and chose the wrong one.",
    ],
    rare: [
      "{player}'s pass goes straight to the opposition. Did they switch teams?",
      "That pass from {player} was so bad it circled back and apologised.",
      "I've seen better passes in a school cafeteria. Sorry, {player}.",
    ],
    epic: [
      "{player} tried to pass it to next Tuesday. It didn't work.",
      "Was that a pass or a cry for help? Hard to tell with {player} sometimes.",
    ],
    legendary: [
      "OH NO {player}!! WHAT WAS THAT?! That pass had the accuracy of a confused pigeon in a hurricane!!",
    ],
  },

  // =============================================================
  // TACKLES
  // =============================================================

  'tackle-success': {
    common: [
      "{player} wins the ball back.",
      "Good tackle from {player}.",
      "{player} makes a clean challenge.",
      "{player} nicks it away.",
      "Strong challenge from {player}.",
      "{player} dispossesses the attacker.",
    ],
    uncommon: [
      "{player} absolutely ROBS them! Clean tackle!",
      "{player} slides in and wins it!",
      "What a challenge from {player}!",
      "{player} nicks it away — brilliant!",
      "Crunching tackle from {player}! The crowd loves it!",
    ],
    rare: [
      "{player} just committed highway robbery out there!",
      "That tackle from {player} should be in a museum.",
      "{player} timed that so perfectly it's like they can see the future.",
    ],
    epic: [
      "{player} just stole the ball AND the attacker's confidence. Devastating.",
      "THAT TACKLE! {player} came out of NOWHERE like a football ninja!",
    ],
    legendary: [
      "OH MY DAYS!! {player}!! WHAT A TACKLE!! The attacker is still looking for the ball!! IT'S GONE!! {player} TOOK EVERYTHING!!",
    ],
  },

  // =============================================================
  // SHOTS
  // =============================================================

  'shot-miss': {
    common: [
      "{player} shoots wide.",
      "Off target from {player}.",
      "{player} puts it over the bar.",
      "{player} fires wide of the post.",
      "That one's gone well over from {player}.",
    ],
    uncommon: [
      "{player} blasts it over the bar by a mile!",
      "{player} shoots — WIDE! So close yet so far.",
      "{player} skies it! That was optimistic.",
      "Oh! {player} scuffs the shot. Not great.",
    ],
    rare: [
      "{player} puts that one into the stands. The birds are annoyed.",
      "{player}'s shot went so wide it has a different postcode.",
      "I think {player} was aiming for the hot dog stand. Direct hit.",
    ],
    epic: [
      "{player} just blasted that into orbit. NASA is tracking it.",
      "That shot from {player} is still rising. It may never come down.",
    ],
    legendary: [
      "OHHHH {player}!! WHERE WAS THAT GOING?! THAT BALL IS IN ANOTHER DIMENSION!! SOMEONE FILE A MISSING PERSONS REPORT!!",
    ],
  },

  'shot-miss-late': {
    uncommon: [
      "LATE CHANCE! {player} shoots... WIDE! So close!",
      "{player} snatches at it in the dying minutes — off target!",
    ],
    rare: [
      "THAT WAS THE CHANCE! {player} blazes it over with time running out!",
    ],
    epic: [
      "NO!! {player}!! That was THE moment! The last chance! AND IT'S GONE OVER!!",
    ],
  },

  'shot-saved': {
    common: [
      "{player} shoots — saved by the keeper.",
      "The goalkeeper gathers {player}'s effort.",
      "Comfortable save from {player}'s shot.",
      "{player}'s strike is straight at the keeper.",
      "Saved. {player}'s shot lacked the placement.",
    ],
    uncommon: [
      "{player} SHOOTS — the keeper smothers it!",
      "Thunderous effort from {player}! Right at the goalkeeper.",
      "{player} tries their luck. The keeper says no.",
      "Good save! {player}'s shot had power but the keeper was ready.",
    ],
    rare: [
      "The keeper gobbles up {player}'s shot like it's a light snack.",
      "{player} hit it well but the keeper was reading a newspaper and still saved it.",
    ],
    epic: [
      "{player} fires and the keeper just CATCHES it. With one hand. While yawning.",
    ],
    legendary: [
      "SHOT FROM {player}!! THE KEEPER SWALLOWS IT WHOLE!! Did that goalkeeper just EAT the ball?! SOMEONE CHECK!!",
    ],
  },

  'shot-greatSave': {
    common: [
      "Great save! {player}'s shot is denied!",
      "What a stop! The keeper tips {player}'s effort away!",
      "Brilliant save to deny {player}!",
    ],
    uncommon: [
      "INCREDIBLE SAVE!! The keeper denies {player} at point blank!",
      "How did they keep that out?! Phenomenal stop!",
      "{player}'s effort is tipped over brilliantly!",
      "The keeper pulls off a STUNNING save from {player}!",
    ],
    rare: [
      "ARE YOU KIDDING ME?! That save defied the laws of physics!",
      "The keeper just became a brick wall! {player} can't believe it!",
      "That save from the keeper belongs in the Louvre.",
    ],
    epic: [
      "THE KEEPER HAS OCTOPUS ARMS!! {player} had NO chance of scoring past THAT!!",
      "I think the goal just shrank! How did {player}'s shot NOT go in?!",
    ],
    legendary: [
      "OHHHH MYYYYY GOOODNESSSSS!! WHAT A SAVE!! {player} PUT EVERYTHING INTO THAT AND THE KEEPER SAID ABSOLUTELY NOT!! I NEED A MOMENT!!",
    ],
  },

  'shot-greatSave-late': {
    rare: [
      "LATE DRAMA! Incredible save to deny {player} in the dying minutes!",
    ],
    epic: [
      "THE KEEPER SAVES IT IN THE 90TH MINUTE!! {player} is HEARTBROKEN!!",
    ],
    legendary: [
      "SAVE OF THE CENTURYYYY!! IN THE LAST MINUTE!! {player} WILL HAVE NIGHTMARES ABOUT THIS!! THE KEEPER IS NOT HUMAN!!",
    ],
  },

  // =============================================================
  // GOALS — PLAYER
  // =============================================================

  'goal-player': {
    common: [
      "GOAL! {player} scores for {team}!",
      "{player} finishes it! GOAL!",
      "It's in! {player} scores!",
      "GOAL for {team}! {player} finds the net!",
    ],
    uncommon: [
      "{player} GOOOAAAL!! The net is bulging!!",
      "IT'S IN!! {player} scores an absolute SCREAMER!!",
      "{player} FINISHES IT!! The crowd erupts!!",
      "GET IN!! {player} with an absolutely FILTHY finish!!",
      "YESSSSS!! {player} does it!! WHAT A PLAYER!!",
    ],
    rare: [
      "{player} scores and the crowd loses its MIND!",
      "GOOOAAAAL! {player} just broke the sound barrier with that strike!",
      "The net didn't stand a chance! {player} scores with POWER!",
    ],
    epic: [
      "{player} SCORES!! Alert the authorities! That was a CRIME of a finish!!",
      "GOAL!! {player}!! I think the goalkeeper is still looking for the ball!",
    ],
    legendary: [
      "GOOOOOAAAAAALLLLL!! {player}!! OH MY DAYS!! I CAN'T BREATHE!! THE BEAUTIFUL GAME!! ACTUAL TEARS!!",
      "GOAL!! {player} SCORES!! EVERYBODY SCORES!! Wait no just {player}!! BUT WHAT A GOAL!!",
    ],
  },

  'goal-player-opening': {
    common: [
      "GOAL! {player} opens the scoring!",
      "First goal of the match — {player} gives {team} the lead!",
    ],
    uncommon: [
      "{player} breaks the deadlock! GOAL! {team} lead!",
      "FIRST BLOOD! {player} opens the scoring for {team}!",
    ],
    rare: [
      "{player} draws first blood! The flood gates could open here!",
      "And it's {player} who breaks the ice! Get the party started!",
    ],
    epic: [
      "{player} opens the scoring and the opposition already look like they want to go home.",
    ],
    legendary: [
      "THE DEADLOCK IS BROKEN AND {player} DID IT!! FIRST GOAL!! THE CROWD IS GOING BANANAS!! ACTUAL BANANAS!!",
    ],
  },

  'goal-player-equalizer': {
    common: [
      "GOAL! {player} levels it up!",
      "It's level! {player} equalises for {team}!",
    ],
    uncommon: [
      "{player} EQUALISES! We're back in business!",
      "GAME ON! {player} drags {team} back into it!",
    ],
    rare: [
      "{player} says NOT TODAY! EQUALISER! We've got a game again!",
      "BACK FROM THE DEAD! {player} pulls {team} level!",
    ],
    epic: [
      "THEY COUNTED US OUT! {player} DIDN'T GET THE MEMO! EQUALISEEEEEER!!",
    ],
    legendary: [
      "EQUALISEEEEEEEER!! {player}!! THEY THOUGHT IT WAS OVER!! IT IS NEVER OVER!! I TOLD YOU!!",
    ],
  },

  'goal-player-goAhead': {
    common: [
      "GOAL! {player} puts {team} ahead!",
      "{player} gives {team} the lead! Great finish!",
    ],
    uncommon: [
      "{player} puts {team} in front! What a moment!",
      "THE GO-AHEAD GOAL! {player} does it for {team}!",
    ],
    rare: [
      "{player} puts {team} in the driving seat! What a goal to take the lead!",
    ],
    epic: [
      "{player} SNATCHES THE LEAD! The opposition are shellshocked!",
    ],
    legendary: [
      "{player}!! THE GO-AHEAD GOAL!! THE CROWD IS LITERALLY LEVITATING!! I'VE NEVER SEEN ANYTHING LIKE THIS!!",
    ],
  },

  'goal-player-late': {
    common: [
      "LATE GOAL! {player} scores in the dying minutes!",
    ],
    uncommon: [
      "{player} with a HUGE goal late on!",
      "Drama in the dying minutes! {player} scores!",
    ],
    rare: [
      "LAST MINUTE HEROICS from {player}! The timing couldn't be more dramatic!",
    ],
    epic: [
      "IN THE DYING SECONDS! {player} SCORES! You couldn't write this!",
    ],
    legendary: [
      "{player}!! LAST MINUTE!! ABSOLUTE SCENES!! THE STADIUM IS SHAKING!! IS THIS REAL LIFE?! SOMEBODY PINCH ME!!",
    ],
  },

  'goal-player-equalizer-late': {
    rare: [
      "LAST GASP EQUALISER!! {player} saves {team} at the death!!",
    ],
    epic: [
      "IN THE DYING MOMENTS!! {player} EQUALISES!! This is the stuff of LEGENDS!!",
    ],
    legendary: [
      "EQUALISEEEEEER IN THE LAST MINUTE!! {player}!! I'M ON THE FLOOR!! THIS IS THE GREATEST MOMENT IN SPORTING HISTORY!!",
    ],
  },

  'goal-player-goAhead-late': {
    rare: [
      "LATE WINNER!! {player} puts {team} ahead with almost no time left!!",
    ],
    epic: [
      "{player} SNATCHES THE LEAD IN INJURY TIME!! The opposition are FINISHED!!",
    ],
    legendary: [
      "LAST!! MINUTE!! WINNER!! {player}!! I HAVE LOST THE ABILITY TO FORM COHERENT SENTENCES!! AAAAAAAHHHH!!",
    ],
  },

  // =============================================================
  // GOALS — OPPONENT
  // =============================================================

  'goal-opponent': {
    common: [
      "{player} scores for {opponent}.",
      "Goal for {opponent}. {player} finishes.",
      "{opponent} find the net through {player}.",
    ],
    uncommon: [
      "Oh no... {player} scores for {opponent}. That hurts.",
      "{opponent} get one! {player} with the finish. Oof.",
      "THEY SCORE. {player} of {opponent} punishes a mistake.",
    ],
    rare: [
      "Well that's not ideal. {player} scores for {opponent}. Can we rewind?",
      "{opponent} score and it's written all over the faces. {player} did the damage.",
    ],
    epic: [
      "{player} scores for {opponent} and I suddenly feel very cold inside.",
      "THEY SCORE. {player}. I don't want to talk about it.",
    ],
    legendary: [
      "NO. NO NO NO NO. {player} SCORES FOR {opponent}. I REFUSE TO ACCEPT THIS. I'M FILING AN APPEAL.",
    ],
  },

  'goal-opponent-opening': {
    common: [
      "First goal goes to {opponent}. {player} opens the scoring.",
    ],
    uncommon: [
      "{opponent} strike first through {player}. Time to respond.",
      "It's {opponent} who draw first blood. We need to answer.",
    ],
    rare: [
      "{opponent} open the scoring and the fans are nervously checking the exits.",
    ],
  },

  'goal-opponent-equalizer': {
    common: [
      "{opponent} equalise through {player}.",
    ],
    uncommon: [
      "{opponent} are back in it! {player} equalises!",
      "The lead is GONE. {player} equalises for {opponent}.",
    ],
    rare: [
      "Well that didn't last. {opponent} pull level through {player}. Back to square one.",
    ],
    epic: [
      "THE LEAD HAS EVAPORATED. {player} equalises for {opponent}. Everything is terrible.",
    ],
  },

  'goal-opponent-goAhead': {
    common: [
      "{opponent} take the lead. {player} with the goal.",
    ],
    uncommon: [
      "{opponent} go ahead through {player}! We're behind now!",
      "{player} puts {opponent} in front. We need to respond!",
    ],
    rare: [
      "{opponent} take the lead and the mood has completely shifted. {player} did it.",
    ],
    epic: [
      "{opponent} LEAD. {player} scored. I'm choosing to see this as a character-building exercise.",
    ],
  },

  'goal-opponent-late': {
    uncommon: [
      "Late heartbreak. {player} scores for {opponent} in the dying minutes.",
    ],
    rare: [
      "CRUEL. {player} scores for {opponent} with almost no time left. Just cruel.",
    ],
    epic: [
      "LAST MINUTE AGONY! {player} scores for {opponent}! This is a DISASTER!",
    ],
    legendary: [
      "NOOOO!! {player}!! {opponent} SCORE IN THE LAST MINUTE!! THIS IS THE WORST THING THAT HAS EVER HAPPENED!! AND YES I'M INCLUDING DINOSAUR EXTINCTION!!",
    ],
  },

  'goal-opponent-equalizer-late': {
    rare: [
      "LAST GASP from {opponent}! {player} equalises with barely any time left!",
    ],
    epic: [
      "THE LEAD IS GONE IN THE DYING SECONDS! {player} equalises for {opponent}! Heartbreak!",
    ],
    legendary: [
      "{opponent} EQUALISE IN THE LAST MINUTE!! {player}!! I WAS ALREADY CELEBRATING!! WHO AUTHORISED THIS?!",
    ],
  },

  'goal-opponent-goAhead-late': {
    rare: [
      "LATE DAGGER! {player} puts {opponent} ahead in the closing minutes!",
    ],
    epic: [
      "{opponent} TAKE THE LEAD IN INJURY TIME through {player}! THIS CAN'T BE HAPPENING!",
    ],
    legendary: [
      "NO!! {opponent} GO AHEAD IN THE LAST MINUTE!! {player}!! I'M GOING TO NEED THERAPY AFTER THIS MATCH!!",
    ],
  },

  // =============================================================
  // SET PIECES
  // =============================================================

  'corner': {
    common: [
      "Corner kick for {team}.",
      "{team} win a corner.",
      "It's a corner. {team} to deliver.",
    ],
    uncommon: [
      "Corner kick for {team}! Everyone in the box!",
      "{team} win a corner. This could be dangerous...",
      "Corner to {team}! Big moment here.",
    ],
    rare: [
      "Corner for {team}! The goalkeeper is nervously adjusting their gloves.",
    ],
    epic: [
      "Corner for {team}! Eleven players in the box! It's sardines in there!",
    ],
  },

  'throwin': {
    common: [
      "Throw-in for {team}.",
      "Ball out of play. {team}'s throw.",
      "{team} take the throw-in.",
    ],
    uncommon: [
      "It's a throw-in. {team} looking to build.",
      "{team} win a throw-in. Keep it moving.",
    ],
    rare: [
      "{team} with the throw-in. The crowd watches with mild interest.",
    ],
    epic: [
      "Throw-in for {team}. Somewhere, a throw-in coach sheds a single proud tear.",
    ],
  },

  'foul': {
    common: [
      "Free kick. {player} gives away the foul.",
      "Foul by {player}. Free kick.",
      "{player} commits a foul.",
    ],
    uncommon: [
      "{player} goes in a bit too enthusiastically. Free kick.",
      "That's a foul! {player} will be having words with the ref.",
      "Naughty challenge from {player}! Free kick given.",
    ],
    rare: [
      "{player} absolutely CLATTERS into them! The referee is NOT amused.",
      "That from {player} was more enthusiasm than technique. Free kick.",
    ],
    epic: [
      "{player} just tried to tackle the player AND the referee at the same time. Free kick.",
    ],
    legendary: [
      "WHAT WAS THAT {player}?! That wasn't a tackle, that was an ASSAULT ON THE CONCEPT OF FOOTBALL!! Free kick.",
    ],
  },
};


// ---------------------------------------------------------------
// Selection logic
// ---------------------------------------------------------------

// Fill a narrative template with variables
function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '?');
}

// Pick a rarity tier from available buckets, using weighted random
function pickRarity(bucket) {
  const available = [];
  for (const r of COMMENTARY_RARITIES) {
    if (bucket[r] && bucket[r].length > 0) {
      available.push({ rarity: r, weight: COMMENTARY_RARITY_WEIGHTS[r] });
    }
  }
  if (!available.length) return null;

  const total = available.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of available) {
    r -= a.weight;
    if (r <= 0) return a.rarity;
  }
  return available[available.length - 1].rarity;
}

// Derive context tags from a match event (ordered: situational first, timing last)
function getContextTags(event) {
  const tags = [];
  const m = event.meta || {};

  // --- Situational tags (for goals) ---
  if (event.type === 'goal') {
    const ps = m.playerScore ?? 0;
    const os = m.opponentScore ?? 0;
    // Scores BEFORE this goal
    const psBefore = event.outcome === 'player' ? ps - 1 : ps;
    const osBefore = event.outcome === 'player' ? os : os - 1;

    if (psBefore === 0 && osBefore === 0) {
      tags.push('opening');
    } else if (event.outcome === 'player') {
      if (osBefore > psBefore && ps === os)  tags.push('equalizer');
      if (psBefore === osBefore && ps > os)  tags.push('goAhead');
    } else {
      if (psBefore > osBefore && os === ps)  tags.push('equalizer');
      if (osBefore === psBefore && os > ps)  tags.push('goAhead');
    }
  }

  // --- Timing tags (lower priority) ---
  if (event.minute >= 80) tags.push('late');

  return tags;
}

// Build candidate keys from most-specific to least-specific
// e.g. ['goal-player-equalizer-late', 'goal-player-equalizer', 'goal-player-late', 'goal-player']
function commentaryCandidateKeys(baseKey, tags) {
  const candidates = [];

  // Full combination (all tags joined)
  if (tags.length >= 2) {
    candidates.push(`${baseKey}-${tags.join('-')}`);
  }

  // Individual tags in priority order
  for (const tag of tags) {
    candidates.push(`${baseKey}-${tag}`);
  }

  // Base fallback
  candidates.push(baseKey);
  return candidates;
}

// Map a MatchEvent to its base narrative key
function eventNarrativeKey(event) {
  if (['kickoff', 'halftime', 'fulltime', 'corner', 'throwin', 'foul'].includes(event.type)) return event.type;
  if (event.type === 'pass')   return `pass-${event.outcome}`;
  if (event.type === 'tackle') return `tackle-${event.outcome}`;
  if (event.type === 'shot' && event.outcome === 'miss')      return 'shot-miss';
  if (event.type === 'shot' && event.outcome === 'saved')     return 'shot-saved';
  if (event.type === 'shot' && event.outcome === 'greatSave') return 'shot-greatSave';
  if (event.type === 'goal' && event.outcome === 'player')    return 'goal-player';
  if (event.type === 'goal' && event.outcome === 'opponent')  return 'goal-opponent';
  return null;
}

// Main entry point — get rendered narrative text for a match event
function renderEventText(event) {
  const baseKey = eventNarrativeKey(event);
  if (!baseKey) return null;

  const tags = getContextTags(event);
  const candidates = commentaryCandidateKeys(baseKey, tags);

  // Try each candidate key; first one with templates wins
  let bucket = null;
  for (const key of candidates) {
    if (COMMENTARY[key]) { bucket = COMMENTARY[key]; break; }
  }
  if (!bucket) return null;

  // Pick a rarity tier and select a random template
  const rarity = pickRarity(bucket);
  if (!rarity) return null;
  const template = pick(bucket[rarity]);

  // Build template variables
  const m = event.meta || {};
  let vars;

  if (baseKey === 'goal-player' || baseKey === 'goal-opponent') {
    vars = {
      player:   m.playerName       || 'Someone',
      team:     m.playerTeamName   || 'Your team',
      opponent: m.opponentTeamName || 'Them',
    };
  } else if (baseKey === 'kickoff') {
    vars = {
      team:     m.playerTeamName   || 'Your team',
      opponent: m.opponentTeamName || 'Them',
    };
  } else {
    vars = {
      player:   m.playerName   || 'Someone',
      team:     m.teamName     || 'Your team',
      opponent: m.opponentName || 'Them',
    };
  }

  return fill(template, vars);
}
