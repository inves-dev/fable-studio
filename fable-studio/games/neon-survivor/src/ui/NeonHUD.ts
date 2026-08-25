// Neon Survivor — persistent in-game HUD.
// Mirrors the monolithic index.html: HP/Shield bars, Score/Multi/Wave/Enemies,
// Ammo/Reload, FPS, crosshair, wave announce, damage flash, lock hint,
// weapon display. No overlays live here (see NeonMenu.ts).

import { injectStyles } from './NeonStylesInjector';
import { buildHUD } from './NeonHUDBuild';
import { updateHUD } from './NeonHUDUpdate';
import type { GameState } from '../state';
import type { NeonSurvivorGame } from '../main';
import type { NeonHUDRefs } from './NeonHUDTypes';

export class NeonHUD {
  readonly root: HTMLDivElement;
  private readonly refs: NeonHUDRefs;
  private _wbTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement) {
    injectStyles();
    const { root, refs } = buildHUD(parent);
    this.root = root;
    this.refs = refs;
  }

  /** Show or hide the HUD (menu hides it; gameplay shows it). */
  setVisible(v: boolean): void {
    this.root.classList.toggle('ns-hidden', !v);
  }

  /** Touch mode hides the DOM crosshair; a separate SVG one is drawn on the look pad. */
  setTouchMode(enabled: boolean): void {
    this.refs.crosshair.style.display = enabled ? 'none' : '';
  }

  /** Per-frame sync of every HUD element. */
  update(state: GameState, game: NeonSurvivorGame): void {
    updateHUD(this.refs, state, game);
  }

  /** Wave announcement banner with auto fade. */
  setWaveAnnounce(waveNum: number, text: string, duration: number): void {
    if (this._wbTimeout !== null) clearTimeout(this._wbTimeout);
    this.refs.waveAnnounce.textContent = text || `WAVE ${waveNum}`;
    this.refs.waveAnnounce.classList.add('ns-show');
    this._wbTimeout = setTimeout(() => {
      this.refs.waveAnnounce.classList.remove('ns-show');
    }, Math.max(0.4, duration) * 1000);
  }

  /** Brief damage flash on the screen edge. */
  flashDamage(): void {
    this.refs.damageFlash.classList.add('show');
    setTimeout(() => this.refs.damageFlash.classList.remove('show'), 120);
  }

  /** Toggle the lock-cursor hint. */
  setLockHintVisible(visible: boolean): void {
    this.refs.lockHint.classList.toggle('ns-show', visible);
  }

  /** Update the weapon display name + icon. */
  setWeapon(icon: string, name: string): void {
    this.refs.weaponDisplay.icon.textContent = icon;
    this.refs.weaponDisplay.nameEl.textContent = name;
  }

  dispose(): void {
    if (this._wbTimeout !== null) clearTimeout(this._wbTimeout);
    this.root.remove();
  }
}
