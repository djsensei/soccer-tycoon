// ============================================================
// strategies.js — Bot decision-making (random V1)
// ============================================================

// Random stat allocation: distribute TOTAL_POINTS across STATS randomly
function randomStatAllocation(ctx) {
  const stats = ctx.STATS; // ['jumping', 'speed', 'strength', 'passing', 'shooting', 'reflexes', 'luck']
  const totalPoints = 22;
  const minPerStat = 1;
  const maxPerStat = 7;

  // Start everyone at minimum
  const alloc = {};
  for (const s of stats) alloc[s] = minPerStat;
  let remaining = totalPoints - stats.length * minPerStat;

  // Randomly distribute remaining points
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  for (const s of shuffled) {
    if (remaining <= 0) break;
    const add = Math.min(remaining, Math.floor(Math.random() * (maxPerStat - minPerStat)) + 1);
    alloc[s] = Math.min(maxPerStat, alloc[s] + add);
    remaining -= (alloc[s] - minPerStat - (alloc[s] - minPerStat - add < 0 ? 0 : 0));
  }

  // If we still have remaining (due to max cap), spread evenly
  while (remaining > 0) {
    for (const s of stats) {
      if (remaining <= 0) break;
      if (alloc[s] < maxPerStat) {
        alloc[s]++;
        remaining--;
      }
    }
  }

  return alloc;
}

// Create 5 random player definitions for the creation wizard
function randomPlayerDefs(ctx) {
  const defs = [];
  for (let i = 0; i < ctx.TEAM_SIZE; i++) {
    defs.push({
      name: ctx.generatePlayerName(),
      stats: randomStatAllocation(ctx),
    });
  }
  return defs;
}

// Equip strategy: for each slot, equip the highest-rarity card available
function equipBestGear(ctx) {
  const gs = ctx.gameState;
  const rarityRank = {};
  ctx.RARITIES.forEach((r, i) => { rarityRank[r] = i; });

  // Build available card pool (inventory minus already-equipped)
  function getAvailable() {
    const equipped = new Map(); // cardId → count equipped
    for (const p of gs.players) {
      for (const cid of Object.values(p.gear)) {
        if (cid) equipped.set(cid, (equipped.get(cid) || 0) + 1);
      }
    }
    const available = new Map(); // cardId → available qty
    for (const item of gs.inventory) {
      const avail = item.quantity - (equipped.get(item.cardId) || 0);
      if (avail > 0) available.set(item.cardId, avail);
    }
    return available;
  }

  for (const player of gs.players) {
    const isGK = player.id === gs.slots.GK;
    const slots = isGK ? [...ctx.GEAR_SLOTS, 'gloves'] : [...ctx.GEAR_SLOTS];

    for (const slot of slots) {
      const available = getAvailable();
      // Find best card for this slot
      let bestId = null;
      let bestRank = -1;
      for (const [cardId, qty] of available) {
        const card = ctx.CARDS[cardId];
        if (!card || card.slot !== slot) continue;
        if (Object.keys(card.statBonuses).length === 0) continue; // skip zero-stat starting gear
        const rank = rarityRank[card.rarity] || 0;
        if (rank > bestRank) {
          bestRank = rank;
          bestId = cardId;
        }
      }
      if (bestId) {
        player.gear[slot] = bestId;
      }
    }
  }
}

// Forge strategy: if 3+ unused same-rarity cards exist, forge them
function forgeAvailable(ctx) {
  const gs = ctx.gameState;
  let forged = 0;

  // Count equipped cards
  function equippedCounts() {
    const counts = new Map();
    for (const p of gs.players) {
      for (const cid of Object.values(p.gear)) {
        if (cid) counts.set(cid, (counts.get(cid) || 0) + 1);
      }
    }
    return counts;
  }

  // Keep forging until no more triples
  let changed = true;
  while (changed) {
    changed = false;
    const equipped = equippedCounts();

    // Group available cards by rarity
    const byRarity = {};
    for (const item of gs.inventory) {
      const card = ctx.CARDS[item.cardId];
      if (!card || Object.keys(card.statBonuses).length === 0) continue;
      const avail = item.quantity - (equipped.get(item.cardId) || 0);
      if (avail <= 0) continue;
      if (!byRarity[card.rarity]) byRarity[card.rarity] = [];
      for (let i = 0; i < avail; i++) {
        byRarity[card.rarity].push(item.cardId);
      }
    }

    // Try to forge (skip legendary — can't forge up from legendary)
    for (const rarity of ctx.RARITIES.slice(0, -1)) {
      const pool = byRarity[rarity];
      if (!pool || pool.length < 3) continue;

      // Pick 3 cards to sacrifice
      const toForge = pool.slice(0, 3);
      const result = ctx.forgeCards(toForge);
      if (!result.ok) continue;

      // Remove sacrificed cards from inventory
      for (const cardId of toForge) {
        const item = gs.inventory.find(i => i.cardId === cardId);
        if (item) {
          item.quantity--;
          if (item.quantity <= 0) {
            gs.inventory.splice(gs.inventory.indexOf(item), 1);
          }
        }
      }

      // Add result card
      const existing = gs.inventory.find(i => i.cardId === result.resultCardId);
      if (existing) existing.quantity++;
      else gs.inventory.push({ cardId: result.resultCardId, quantity: 1 });

      forged++;
      changed = true;
      break; // restart scan after mutation
    }
  }

  return forged;
}

// Bot training decision: rest if energy < 40, else train weakest stat
function botTrainingDecision(ctx) {
  const gs = ctx.gameState;
  const cfg = ctx.ENERGY_CONFIG;
  for (const p of gs.players) {
    const energy = p.energy != null ? p.energy : cfg.maxEnergy;
    if (energy < 40) {
      // Rest
      p.energy = Math.min(cfg.maxEnergy, energy + cfg.restRecovery);
    } else {
      // Train weakest stat
      p.energy = Math.max(0, energy - ctx.noisyCost(cfg.trainingCost));
      const trainable = ctx.STATS.filter(s => (p.stats[s] || 0) < 10);
      if (trainable.length > 0) {
        const weakest = trainable.reduce((a, b) => (p.stats[a] || 0) <= (p.stats[b] || 0) ? a : b);
        if (Math.random() < cfg.trainSuccessChance) {
          p.stats[weakest] = Math.min(10, (p.stats[weakest] || 1) + 1);
        }
      }
    }
  }
}

module.exports = { randomStatAllocation, randomPlayerDefs, equipBestGear, forgeAvailable, botTrainingDecision };
