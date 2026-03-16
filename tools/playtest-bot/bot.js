#!/usr/bin/env node
// ============================================================
// bot.js — Playtest bot CLI: runs N headless games, outputs stats
//
// Usage: node tools/playtest-bot/bot.js [--runs N] [--output FILE] [--verbose]
// ============================================================
const fs = require('node:fs');
const path = require('node:path');
const { createSandbox } = require('./loader');
const { randomPlayerDefs, equipBestGear, forgeAvailable } = require('./strategies');
const { createRunStats, createSeasonStats, aggregateRuns, formatSummary } = require('./stats');

// --- CLI args ---
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return defaultVal;
  return args[idx + 1];
}
const NUM_RUNS = parseInt(getArg('--runs', '100'), 10);
const OUTPUT_FILE = getArg('--output', null);
const VERBOSE = args.includes('--verbose');
const MAX_SEASONS = 50; // safety cap to prevent infinite loops

// ============================================================
// Single run
// ============================================================
function runOnce(runIndex) {
  const ctx = createSandbox();

  // --- Create new game with random players ---
  const teamName = ctx.generateTeamName();
  const managerName = ctx.generatePlayerName();
  const playerDefs = randomPlayerDefs(ctx);
  ctx.gameState = ctx.createNewGame(teamName, managerName, playerDefs);
  const gs = ctx.gameState;

  const runStats = createRunStats();
  runStats.teamName = teamName;

  let seasonCount = 0;
  let gameOver = false;

  while (!gameOver && seasonCount < MAX_SEASONS) {
    const season = gs.season;
    const seasonStats = createSeasonStats();
    seasonStats.league = season.league;
    seasonStats.seasonNumber = seasonCount + 1;

    // --- Play through every matchday ---
    while (season.matchday < season.schedule.length) {
      const matchdayIdx = season.matchday;
      const matchday = season.schedule[matchdayIdx];

      // Find player's match
      const playerMatch = matchday.matches.find(m => m.home === 'player' || m.away === 'player');
      if (!playerMatch) break;

      const oppId = playerMatch.home === 'player' ? playerMatch.away : playerMatch.home;
      const oppTeam = ctx.findLeagueTeam(oppId);
      if (!oppTeam) break;

      // Build player team object (mirrors prematch.js kickOff())
      const playerTeamFull = {
        id: 'player',
        name: gs.teamName,
        league: gs.currentLeague,
        players: gs.players,
        slots: gs.slots,
      };
      const oppWithLeague = { ...oppTeam, league: oppTeam.league || gs.currentLeague };

      // --- Simulate match ---
      const result = ctx.simulateMatch(playerTeamFull, oppWithLeague);
      const outcome = ctx.computeOutcome(result.playerScore, result.opponentScore);
      const totalFanDelta = result.events.reduce((sum, e) => sum + (e.fanDelta || 0), 0);
      const packEarned = ctx.getPackReward(gs.currentLeague, outcome);

      // --- Tally career stats (mirrors goToResults in match.js) ---
      const careerDeltas = {};
      for (const e of result.events) {
        const pid = e.meta?.playerId;
        if (e.team === 'player' && pid) {
          if (!careerDeltas[pid]) careerDeltas[pid] = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
          if (e.type === 'goal' && e.outcome === 'player') careerDeltas[pid].goals++;
          if (e.type === 'tackle' && e.outcome === 'success') careerDeltas[pid].tackles++;
          if (e.type === 'pass' && e.outcome === 'success') careerDeltas[pid].passes++;
          if (e.type === 'shot' && e.outcome === 'miss') careerDeltas[pid].shotsMissed++;
        }
        if (e.team === 'opponent' && e.type === 'shot' && (e.outcome === 'saved' || e.outcome === 'greatSave')) {
          const gkId = e.meta?.savingPlayerId;
          if (gkId && gs.players.some(p => p.id === gkId)) {
            if (!careerDeltas[gkId]) careerDeltas[gkId] = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
            careerDeltas[gkId].saves++;
          }
        }
      }

      // Apply career stats + check milestones
      for (const p of gs.players) {
        const deltas = careerDeltas[p.id];
        if (!deltas) continue;
        if (!p.careerStats) p.careerStats = { goals: 0, saves: 0, tackles: 0, passes: 0, shotsMissed: 0 };
        if (!p.statBonuses) p.statBonuses = {};
        for (const [careerKey, count] of Object.entries(deltas)) {
          if (count <= 0) continue;
          const oldVal = p.careerStats[careerKey] || 0;
          const newVal = oldVal + count;
          p.careerStats[careerKey] = newVal;
          const mileDef = ctx.STAT_MILESTONES[careerKey];
          if (!mileDef) continue;
          for (let ti = 0; ti < mileDef.thresholds.length; ti++) {
            const threshold = mileDef.thresholds[ti];
            if (oldVal < threshold && newVal >= threshold) {
              const bonus = ctx.MILESTONE_BONUSES[ti] || 1;
              p.statBonuses[mileDef.stat] = (p.statBonuses[mileDef.stat] || 0) + bonus;
              runStats.milestones.push({
                match: gs.matchesPlayed + 1,
                playerId: p.id,
                playerName: p.name,
                careerStat: careerKey,
                statUpgrade: mileDef.stat,
                bonus,
                threshold,
              });
            }
          }
        }
      }

      // Update fans
      gs.fans = Math.max(50, gs.fans + totalFanDelta);
      gs.matchesPlayed++;

      // Track season match stats
      seasonStats.matches.goalsFor += result.playerScore;
      seasonStats.matches.goalsAgainst += result.opponentScore;
      if (result.playerScore > result.opponentScore) seasonStats.matches.w++;
      else if (result.playerScore === result.opponentScore) seasonStats.matches.d++;
      else seasonStats.matches.l++;

      // --- Update standings ---
      const standings = season.standings;
      ctx.updateStandings(standings, 'player', result.playerScore, result.opponentScore);
      ctx.updateStandings(standings, oppId, result.opponentScore, result.playerScore);

      // Simulate NPC-NPC matches (M11: full Markov engine)
      for (const match of matchday.matches) {
        if (match.home === 'player' || match.away === 'player') continue;
        const homeTeam = ctx.findLeagueTeam(match.home);
        const awayTeam = ctx.findLeagueTeam(match.away);
        if (!homeTeam || !awayTeam) continue;
        const npcResult = ctx.simulateNPCMatchFull(homeTeam, awayTeam, season.league);
        ctx.updateStandings(standings, match.home, npcResult.homeScore, npcResult.awayScore);
        ctx.updateStandings(standings, match.away, npcResult.awayScore, npcResult.homeScore);
      }

      // Mark matchday complete, advance
      season.schedule[matchdayIdx].completed = true;
      season.matchday = matchdayIdx + 1;

      // --- Open pack if earned ---
      if (packEarned) {
        const cardIds = ctx.openPack(packEarned);
        seasonStats.packsEarned.push(packEarned);
        for (const cardId of cardIds) {
          const existing = gs.inventory.find(i => i.cardId === cardId);
          if (existing) existing.quantity++;
          else gs.inventory.push({ cardId, quantity: 1 });
          runStats.inventory.totalEarned++;
        }
      }

      // --- Forge + equip after every match ---
      const forged = forgeAvailable(ctx);
      runStats.inventory.totalForged += forged;
      equipBestGear(ctx);
    }

    // --- Season end ---
    const sorted = ctx.sortStandings(season.standings);
    const playerRank = sorted.findIndex(([id]) => id === 'player') + 1;

    // Record final standings
    seasonStats.finalStandings = sorted.map(([teamId, rec]) => ({
      teamId,
      teamName: teamId === 'player' ? gs.teamName : ctx.getTeamName(teamId),
      ...rec,
    }));
    seasonStats.playerRank = playerRank;

    if (playerRank === 1 && season.league === 'international') {
      seasonStats.outcome = 'gameWin';
      runStats.finalLeague = 'international';
      runStats.finalOutcome = 'gameWin';
      gameOver = true;
    } else if (playerRank === 1) {
      seasonStats.outcome = 'promoted';
      // Advance to next league — generate teams adaptively (M11)
      const leagueOrder = ctx.LEAGUE_ORDER;
      const nextLeague = leagueOrder[leagueOrder.indexOf(season.league) + 1];
      const playerTeam = { players: gs.players, slots: gs.slots };
      gs.leagueTeams[nextLeague] = ctx.generateLeagueTeams(nextLeague, playerTeam);
      gs.currentLeague = nextLeague;
      gs.season = ctx.generateSeason(nextLeague, 'player');

      // Promotion pack
      const promoCards = ctx.openPack('promotion');
      for (const cardId of promoCards) {
        const existing = gs.inventory.find(i => i.cardId === cardId);
        if (existing) existing.quantity++;
        else gs.inventory.push({ cardId, quantity: 1 });
        runStats.inventory.totalEarned++;
      }
      seasonStats.packsEarned.push('promotion');
    } else if (playerRank === sorted.length) {
      seasonStats.outcome = 'relegated';
      runStats.finalLeague = season.league;
      runStats.finalOutcome = 'relegated';
      gameOver = true;
    } else {
      seasonStats.outcome = 'mid';
      // Replay same league with refreshed teams (M11)
      ctx.refreshLeagueTeams(season.league);
      gs.season = ctx.generateSeason(season.league, 'player');
    }

    runStats.seasons.push(seasonStats);
    seasonCount++;
  }

  if (!gameOver) {
    // Hit max seasons safety cap
    runStats.finalLeague = gs.currentLeague;
    runStats.finalOutcome = `maxSeasons_${gs.currentLeague}`;
  }

  runStats.totalMatches = gs.matchesPlayed;
  runStats.inventory.finalCount = gs.inventory.reduce((sum, i) => sum + i.quantity, 0);

  if (VERBOSE) {
    console.log(`  Run ${runIndex + 1}: ${runStats.totalMatches} matches, ${runStats.seasons.length} seasons → ${runStats.finalOutcome} (${runStats.finalLeague})`);
  }

  return runStats;
}

// ============================================================
// Main
// ============================================================
function main() {
  console.log(`Running ${NUM_RUNS} simulation(s)...`);
  const startTime = Date.now();

  const allRuns = [];
  for (let i = 0; i < NUM_RUNS; i++) {
    allRuns.push(runOnce(i));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Completed ${NUM_RUNS} runs in ${elapsed}s\n`);

  // Aggregate
  const aggregate = aggregateRuns(allRuns);

  // Print summary
  console.log(formatSummary(aggregate));

  // Write full output
  if (OUTPUT_FILE) {
    const outputPath = path.resolve(OUTPUT_FILE);
    const output = {
      meta: {
        runs: NUM_RUNS,
        elapsedSeconds: parseFloat(elapsed),
        timestamp: new Date().toISOString(),
      },
      aggregate,
      runs: allRuns,
    };
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nFull results written to ${outputPath}`);
  }
}

main();
