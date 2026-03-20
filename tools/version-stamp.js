#!/usr/bin/env node
// ============================================================
// version-stamp.js — Sync cache-busting query strings in index.html
// with GAME_VERSION from data.js.
//
// Usage:  node tools/version-stamp.js
//
// What it does:
//   1. Reads GAME_VERSION from data.js
//   2. Replaces all ?v=X.Y.Z query strings in index.html with the current version
//   3. Reports what changed
//
// When to run:
//   After bumping GAME_VERSION in data.js, run this before committing.
//   The query strings tell browsers the files have changed, so players
//   get fresh code without needing to clear their cache.
// ============================================================

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data.js');
const htmlPath = path.join(root, 'index.html');

// Extract GAME_VERSION from data.js
const dataContents = fs.readFileSync(dataPath, 'utf8');
const match = dataContents.match(/const GAME_VERSION\s*=\s*'([^']+)'/);
if (!match) {
  console.error('Could not find GAME_VERSION in data.js');
  process.exit(1);
}
const version = match[1];

// Replace ?v=... in src="..." and href="..." attributes only
const html = fs.readFileSync(htmlPath, 'utf8');
const updated = html.replace(/((?:src|href)="[^"?]+)\?v=[^"]+/g, `$1?v=${version}`);

if (html === updated) {
  console.log(`index.html already at v${version} — nothing to do.`);
} else {
  fs.writeFileSync(htmlPath, updated, 'utf8');
  const count = (updated.match(/\?v=/g) || []).length;
  console.log(`Stamped ${count} references in index.html with ?v=${version}`);
}
