// ============================================================
// screens/welcome.js — "Welcome to the League" post-creation interstitial
// ============================================================

const _WELCOME_HEADLINES = [
  (mgr, team) => `NEW MANAGER TAKES THE REINS`,
  (mgr, team) => `${team.toUpperCase()} ENTER THE LEAGUE: "HOW BAD CAN IT BE?"`,
  (mgr, team) => `LOCAL CLUB HIRES ${mgr.toUpperCase()} — FANS CAUTIOUSLY OPTIMISTIC`,
  (mgr, team) => `${mgr.toUpperCase()} PROMISES ${team.toUpperCase()} FANS "WE'LL BE FINE, PROBABLY"`,
  (mgr, team) => `BREAKING: ${team.toUpperCase()} HAS A MANAGER NOW`,
];

function renderWelcome() {
  if (_introSlide >= 0) return renderIntroSlides();
  const mgr = gameState.managerName || 'Coach';
  const team = gameState.teamName || 'The Team';
  const leagueKey = gameState.currentLeague || 'local';
  const leagueDef = LEAGUE_DEFINITIONS[leagueKey];
  const leagueName = leagueDef ? leagueDef.name : leagueKey;

  const headline = pick(_WELCOME_HEADLINES)(mgr, team);

  // Gather league opponents
  const npcTeams = (gameState.leagueTeams && gameState.leagueTeams[leagueKey]) || [];
  const opponentRows = npcTeams.map(t => {
    const def = LEAGUE_TEAMS.find(d => d.id === t.id);
    const stars = def ? tierStars(def.difficulty) : '';
    const note = def && def.specialNote ? `<span class="welcome-opp-note">${def.specialNote}</span>` : '';
    return `
      <div class="welcome-opp-row">
        <span class="welcome-opp-name">${t.name}</span>
        <span class="welcome-opp-stars">${stars}</span>
        ${note}
      </div>
    `;
  }).join('');

  return `
    <div class="screen welcome-screen">
      <div class="newspaper welcome-newspaper">
        <div class="newspaper-header">THE DAILY BOOT — SPECIAL REPORT</div>
        <div class="newspaper-headline">${headline}</div>
        <div class="newspaper-subhead">
          Fresh-faced manager ${mgr} has taken charge of ${team} and
          enrolled in the ${leagueName}. Local experts give them
          "about a week" before it all falls apart.
        </div>
      </div>

      <div class="welcome-opponents card">
        <h2>Your Opponents</h2>
        <div class="welcome-opp-list">
          ${opponentRows}
        </div>
      </div>

      <button class="btn-primary btn-large" onclick="welcomeStart()">Let's Go!</button>
    </div>
  `;
}

let _introSlide = -1; // -1 = not showing intro yet

const _INTRO_SLIDES = [
  {
    icon: '⚽',
    headline: 'Welcome to Soccer Tycoon!',
    bullets: [
      'You manage a team of 5 players through league seasons.',
      'Win matches, earn fans, and get promoted to tougher leagues!',
      'Finish last and you\'re relegated — game over!',
    ],
  },
  {
    icon: '📊',
    headline: 'Stats & Gear',
    bullets: [
      'Each player has 7 stats like Speed, Shooting, and Luck.',
      'Equip gear cards (Head, Body, Feet, Gloves) to boost stats.',
      'Forge 3 cards of the same rarity into a better one!',
    ],
  },
  {
    icon: '🏟️',
    headline: 'Match Day',
    bullets: [
      'Matches play out automatically — sit back and watch the show!',
      'Win to earn card packs and fans. Lose and fans leave.',
      'After each match, train your players or manage gear.',
    ],
  },
  {
    icon: '💡',
    headline: 'Tips to Win',
    bullets: [
      'Keep your players\' energy up — tired players are weaker!',
      'Check the ? button on any screen for help.',
      'Have fun and don\'t worry about being perfect — just play!',
    ],
  },
];

function welcomeStart() {
  _introSlide = 0;
  render();
}

function introNext() {
  if (_introSlide < _INTRO_SLIDES.length - 1) {
    _introSlide++;
    render();
  } else {
    introFinish();
  }
}

function introPrev() {
  if (_introSlide > 0) {
    _introSlide--;
    render();
  }
}

function introFinish() {
  _introSlide = -1;
  updateState({ screen: 'table' });
}

function renderIntroSlides() {
  const slide = _INTRO_SLIDES[_introSlide];
  const dots = _INTRO_SLIDES.map((_, i) =>
    `<div class="intro-dot ${i === _introSlide ? 'active' : ''}"></div>`
  ).join('');
  const isLast = _introSlide === _INTRO_SLIDES.length - 1;
  return `
    <div class="screen intro-slides">
      <div class="intro-slide-icon">${slide.icon}</div>
      <div class="intro-slide-headline">${slide.headline}</div>
      <ul class="intro-slide-bullets">
        ${slide.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <div class="intro-slide-dots">${dots}</div>
      <div class="intro-slide-nav">
        ${_introSlide > 0 ? '<button class="btn-secondary" onclick="introPrev()">← Back</button>' : ''}
        <button class="btn-primary" onclick="${isLast ? 'introFinish()' : 'introNext()'}">${isLast ? 'Let\'s Play!' : 'Next →'}</button>
        <button class="btn-small" onclick="introFinish()">Skip</button>
      </div>
    </div>
  `;
}
