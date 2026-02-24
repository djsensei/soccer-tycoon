// ============================================================
// save.js — Persistence only (localStorage read/write)
// ============================================================

const SAVE_KEY = 'soccer-tycoon-v1';

function saveGame(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}
