// Neon Survivor — per-frame HUD update.
// Mirrors the original index.html HUD layout: HP/Shield bars, Score/Multi/Wave/
// Enemies panel, Ammo/Reload panel, FPS counter.

import type { GameState } from '../state';
import type { NeonSurvivorGame } from '../main';
import type { NeonHUDRefs } from './NeonHUDTypes';

/** Per-frame sync. Reads GameState, writes DOM refs. No game logic here. */
export function updateHUD(refs: NeonHUDRefs, state: GameState, _game: NeonSurvivorGame): void {
  updateBars(refs.bars, state);
  updateScorePanel(refs.scorePanel, state);
  updateAmmoPanel(refs.ammoPanel, state);
  refs.fps.fpsText.textContent = String(state.fps || 0);
}

// ── bars ────────────────────────────────────────────────────────────────────

function updateBars(refs: NeonHUDRefs['bars'], state: GameState): void {
  const pd = state.playerData;
  const hpR = Math.max(0, Math.min(1, pd.hp / Math.max(1, pd.maxHp)));
  refs.hpFill.style.width = `${(hpR * 100).toFixed(1)}%`;
  refs.hpFill.classList.toggle('ns-low', hpR < 0.3);
  refs.hpText.textContent = `${Math.max(0, Math.floor(pd.hp))}`;

  const shR = pd.maxShield > 0 ? pd.shield / pd.maxShield : 0;
  refs.shFill.style.width = `${(shR * 100).toFixed(1)}%`;
  refs.shText.textContent = `${Math.max(0, Math.floor(pd.shield))}`;
}

// ── score panel ─────────────────────────────────────────────────────────────

function updateScorePanel(refs: NeonHUDRefs['scorePanel'], state: GameState): void {
  refs.scoreText.textContent = String(state.score | 0);
  if (state.multiplier > 1.0) {
    refs.multiText.textContent = `x${state.multiplier.toFixed(1)}`;
  } else {
    refs.multiText.textContent = 'x1.0';
  }
  refs.waveText.textContent = String(state.wave | 0);
  refs.enemiesText.textContent = String(state.waveEnemiesRemaining | 0);
}

// ── ammo panel ──────────────────────────────────────────────────────────────

function updateAmmoPanel(refs: NeonHUDRefs['ammoPanel'], state: GameState): void {
  const pd = state.playerData;
  refs.ammoText.textContent = String(pd.ammo | 0);
  refs.ammoMaxText.textContent = String(pd.maxAmmo | 0);
  refs.reloadText.textContent = pd.reloading ? '...' : 'R';
}
