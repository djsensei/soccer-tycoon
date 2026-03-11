// ============================================================
// stats.js — Per-run and aggregate stat collection
// ============================================================

function createRunStats() {
  return {
    teamName: '',
    totalMatches: 0,
    seasons: [],          // per-season summaries
    finalLeague: '',
    finalOutcome: '',     // 'gameWin', 'relegated', or league key if max seasons hit
    milestones: [],       // { match, playerId, playerName, careerStat, statUpgrade, threshold }
    inventory: {
      totalEarned: 0,
      totalForged: 0,
      finalCount: 0,
    },
  };
}

function createSeasonStats() {
  return {
    league: '',
    seasonNumber: 0,
    matches: {
      w: 0, d: 0, l: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    },
    finalStandings: [],   // [{ teamId, teamName, w, d, l, gf, ga, pts }]
    playerRank: 0,
    outcome: '',          // 'promoted', 'relegated', 'mid', 'gameWin'
    packsEarned: [],      // pack type ids
  };
}

function aggregateRuns(allRuns) {
  const n = allRuns.length;
  if (n === 0) return { runs: 0 };

  // Outcome distribution
  const outcomes = {};
  for (const run of allRuns) {
    outcomes[run.finalOutcome] = (outcomes[run.finalOutcome] || 0) + 1;
  }

  // Matches played
  const matchCounts = allRuns.map(r => r.totalMatches);
  const totalSeasons = allRuns.map(r => r.seasons.length);

  // Furthest league reached
  const leagueOrder = ['local', 'regional', 'state', 'national', 'international'];
  const leagueCounts = {};
  for (const run of allRuns) {
    const league = run.finalLeague;
    leagueCounts[league] = (leagueCounts[league] || 0) + 1;
  }

  // How many reached each league (cumulative)
  const leagueReached = {};
  for (const league of leagueOrder) {
    const idx = leagueOrder.indexOf(league);
    leagueReached[league] = allRuns.filter(r => leagueOrder.indexOf(r.finalLeague) >= idx).length;
  }

  // Win rate per league
  const leagueMatchStats = {};
  for (const run of allRuns) {
    for (const season of run.seasons) {
      if (!leagueMatchStats[season.league]) {
        leagueMatchStats[season.league] = { w: 0, d: 0, l: 0, gf: 0, ga: 0, seasons: 0 };
      }
      const ls = leagueMatchStats[season.league];
      ls.w += season.matches.w;
      ls.d += season.matches.d;
      ls.l += season.matches.l;
      ls.gf += season.matches.goalsFor;
      ls.ga += season.matches.goalsAgainst;
      ls.seasons++;
    }
  }

  // Milestone stats
  const milestoneCountPerRun = allRuns.map(r => r.milestones.length);

  // Inventory
  const inventoryStats = {
    avgEarned: mean(allRuns.map(r => r.inventory.totalEarned)),
    avgForged: mean(allRuns.map(r => r.inventory.totalForged)),
    avgFinal:  mean(allRuns.map(r => r.inventory.finalCount)),
  };

  return {
    runs: n,
    outcomes,
    matches: {
      mean: mean(matchCounts),
      median: median(matchCounts),
      min: Math.min(...matchCounts),
      max: Math.max(...matchCounts),
      stddev: stddev(matchCounts),
    },
    seasons: {
      mean: mean(totalSeasons),
      median: median(totalSeasons),
      min: Math.min(...totalSeasons),
      max: Math.max(...totalSeasons),
    },
    leagueCounts,
    leagueReached,
    leagueMatchStats,
    milestones: {
      mean: mean(milestoneCountPerRun),
      median: median(milestoneCountPerRun),
      min: Math.min(...milestoneCountPerRun),
      max: Math.max(...milestoneCountPerRun),
    },
    inventory: inventoryStats,
  };
}

function formatSummary(agg) {
  const lines = [];
  lines.push('=== PLAYTEST BOT AGGREGATE RESULTS ===');
  lines.push(`Runs: ${agg.runs}`);
  lines.push('');

  lines.push('--- Outcomes ---');
  for (const [outcome, count] of Object.entries(agg.outcomes)) {
    lines.push(`  ${outcome}: ${count} (${pct(count, agg.runs)})`);
  }
  lines.push('');

  lines.push('--- Matches Played ---');
  lines.push(`  Mean: ${agg.matches.mean.toFixed(1)}  Median: ${agg.matches.median}  Min: ${agg.matches.min}  Max: ${agg.matches.max}  StdDev: ${agg.matches.stddev.toFixed(1)}`);
  lines.push('');

  lines.push('--- Seasons Played ---');
  lines.push(`  Mean: ${agg.seasons.mean.toFixed(1)}  Median: ${agg.seasons.median}  Min: ${agg.seasons.min}  Max: ${agg.seasons.max}`);
  lines.push('');

  lines.push('--- Final League Reached ---');
  for (const [league, count] of Object.entries(agg.leagueCounts)) {
    lines.push(`  ${league}: ${count} (${pct(count, agg.runs)})`);
  }
  lines.push('');

  lines.push('--- League Reach (cumulative) ---');
  for (const [league, count] of Object.entries(agg.leagueReached)) {
    lines.push(`  Reached ${league}: ${count} (${pct(count, agg.runs)})`);
  }
  lines.push('');

  lines.push('--- Win Rate by League ---');
  for (const [league, s] of Object.entries(agg.leagueMatchStats)) {
    const total = s.w + s.d + s.l;
    lines.push(`  ${league}: ${s.w}W ${s.d}D ${s.l}L (${pct(s.w, total)} win) | GF: ${s.gf} GA: ${s.ga} | ${s.seasons} seasons`);
  }
  lines.push('');

  lines.push('--- Milestones per Run ---');
  lines.push(`  Mean: ${agg.milestones.mean.toFixed(1)}  Median: ${agg.milestones.median}  Min: ${agg.milestones.min}  Max: ${agg.milestones.max}`);
  lines.push('');

  lines.push('--- Inventory ---');
  lines.push(`  Avg cards earned: ${agg.inventory.avgEarned.toFixed(1)}  Avg forged: ${agg.inventory.avgForged.toFixed(1)}  Avg final count: ${agg.inventory.avgFinal.toFixed(1)}`);

  return lines.join('\n');
}

// --- Math helpers ---
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1));
}
function pct(n, total) { return total ? `${((n / total) * 100).toFixed(1)}%` : '0%'; }

module.exports = { createRunStats, createSeasonStats, aggregateRuns, formatSummary };
