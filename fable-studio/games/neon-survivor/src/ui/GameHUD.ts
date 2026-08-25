// Neon Survivor — GameHUD
// Wraps NeonHUD + menu/pause/gameover/card overlays + mute/volume panel +
// card countdown. Mirrors the original monolithic index.html layout.

import { NeonHUD } from './NeonHUD';
import { NeonMenu, NeonPause, NeonGameOver, NeonCardSelect } from './NeonMenu';
import { injectStyles } from './NeonStylesInjector';
import type { GameState } from '../state';
import type { CardPick } from '../state';
import type { NeonSurvivorGame } from '../main';

export class GameHUD {
  private readonly hud: NeonHUD;
  private readonly menu: NeonMenu;
  private readonly pause: NeonPause;
  private readonly gameOver: NeonGameOver;
  private readonly cardSelect: NeonCardSelect;

  // Mute + volume panel + card countdown (extra DOM elements the original
  // monolith shows during gameplay but no other component owns).
  private readonly _muteBtn: HTMLButtonElement;
  private readonly _volumePanel: HTMLDivElement;
  private readonly _musicSlider: HTMLInputElement;
  private readonly _sfxSlider: HTMLInputElement;
  private readonly _cardCountdown: HTMLDivElement;
  private readonly _cardCountdownT: HTMLDivElement;
  private readonly _cardCountdownBar: HTMLDivElement;

  private _onMute: () => void = () => {};
  private _onMusicVol: (v: number) => void = () => {};
  private _onSfxVol: (v: number) => void = () => {};
  private _onCardPick: () => void = () => {};
  private _stateRef: GameState | null = null;
  private _cdInterval: ReturnType<typeof setInterval> | null = null;

  private readonly _onPointerLockChange = (): void => {
    if (!document.pointerLockElement && this._stateRef?.state === 'playing') {
      this.pause.show();
    }
  };

  constructor(
    container: HTMLElement,
    private readonly game: NeonSurvivorGame,
    restartFn: () => void,
  ) {
    injectStyles();

    this.hud = new NeonHUD(container);

    this.menu = new NeonMenu(container, () => {
      // First-time PLAY: start the game; do not run restart (restartFn) —
      // restartFn is for game-over and would loop us back to the menu.
      game.startGame();
    });

    this.gameOver = new NeonGameOver(container, () => {
      restartFn();
      if (!window.Capacitor?.isNativePlatform?.()) container.requestPointerLock?.();
    });

    this.pause = new NeonPause(container, () => {
      if (!window.Capacitor?.isNativePlatform?.()) container.requestPointerLock?.();
    });

    this.cardSelect = new NeonCardSelect(container);

    // ── Mute button (top-center) + volume panel (top-right) ──────────────────
    this._muteBtn = document.createElement('button');
    this._muteBtn.className = 'ns-mute-btn';
    this._muteBtn.id = 'muteBtn';
    this._muteBtn.textContent = '🔊';
    container.appendChild(this._muteBtn);
    this._muteBtn.addEventListener('click', () => this._onMute());

    this._volumePanel = document.createElement('div');
    this._volumePanel.className = 'ns-volume-panel';
    this._volumePanel.id = 'volumePanel';
    this._volumePanel.innerHTML = `
      <div class="ns-volume-row">
        <span class="ns-vlabel">🎵</span>
        <input type="range" min="0" max="100" value="50" id="musicVol" class="ns-vol-slider">
      </div>
      <div class="ns-volume-row">
        <span class="ns-vlabel">🔊</span>
        <input type="range" min="0" max="100" value="100" id="sfxVol" class="ns-vol-slider">
      </div>`;
    container.appendChild(this._volumePanel);
    this._musicSlider = this._volumePanel.querySelector('#musicVol') as HTMLInputElement;
    this._sfxSlider = this._volumePanel.querySelector('#sfxVol') as HTMLInputElement;
    this._musicSlider.addEventListener('input', () =>
      this._onMusicVol(Number(this._musicSlider.value) / 100));
    this._sfxSlider.addEventListener('input', () =>
      this._onSfxVol(Number(this._sfxSlider.value) / 100));

    // ── Card countdown (top-center, shown briefly before card screen) ────────
    this._cardCountdown = document.createElement('div');
    this._cardCountdown.className = 'ns-card-countdown';
    this._cardCountdown.id = 'cardCountdown';
    this._cardCountdown.innerHTML = `
      <div class="ns-label">UPGRADE INCOMING</div>
      <div class="ns-timer" id="cardCountdownT">3</div>
      <div class="ns-bar"><div class="ns-bar-fill" id="cardCountdownBar" style="width:100%"></div></div>`;
    container.appendChild(this._cardCountdown);
    this._cardCountdownT = this._cardCountdown.querySelector('#cardCountdownT') as HTMLDivElement;
    this._cardCountdownBar = this._cardCountdown.querySelector('#cardCountdownBar') as HTMLDivElement;

    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  // ── public API ─────────────────────────────────────────────────────────────

  update(state: GameState, game: NeonSurvivorGame): void {
    this._stateRef = state;
    this.hud.update(state, game);
  }

  hideMenu(): void { this.menu.hide(); this.hud.setVisible(true); }
  showMenu(): void { this.menu.show(); this.hud.setVisible(false); }

  showGameOver(score: number, _onRestart: () => void): void {
    this.gameOver.show(score, this._stateRef?.wave ?? 0, this._stateRef?.totalKills ?? 0);
    this.hud.setVisible(false);
  }
  hideGameOver(): void { this.gameOver.hide(); }

  showPause(): void { this.pause.show(); }
  hidePause(): void { this.pause.hide(); }

  showCardSelect(cards: CardPick[], onPick: (idx: number) => void): void {
    const score = this._stateRef?.score ?? 0;
    this.cardSelect.show(score, cards, (idx) => {
      this._onCardPick();
      onPick(idx);
    });
  }
  hideCardSelect(): void { this.cardSelect.hide(); }

  setTouchMode(enabled: boolean): void {
    this.hud.setTouchMode(enabled);
  }

  setWaveAnnounce(text: string, duration: number): void {
    const wave = this._stateRef?.wave ?? 0;
    this.hud.setWaveAnnounce(wave, text, duration);
  }

  flashDamage(): void { this.hud.flashDamage(); }
  setLockHintVisible(v: boolean): void { this.hud.setLockHintVisible(v); }
  setWeapon(icon: string, name: string): void { this.hud.setWeapon(icon, name); }

  setMuted(muted: boolean): void { this._muteBtn.textContent = muted ? '🔇' : '🔊'; }
  setMusicVolumeUI(v: number): void { this._musicSlider.value = String(Math.round(v * 100)); }
  setSfxVolumeUI(v: number): void { this._sfxSlider.value = String(Math.round(v * 100)); }

  onMute(fn: () => void): void { this._onMute = fn; }
  onMusicVol(fn: (v: number) => void): void { this._onMusicVol = fn; }
  onSfxVol(fn: (v: number) => void): void { this._onSfxVol = fn; }
  onCardPick(fn: () => void): void { this._onCardPick = fn; }

  /** Called by CardSystem-driven flow when player picks a card. */
  notifyCardPick(): void { this._onCardPick(); }

  /** Show the "UPGRADE INCOMING" 3-second countdown. */
  startCardCountdown(seconds: number, onComplete: () => void): void {
    this._stopCountdown();
    let t = seconds;
    this._cardCountdownT.textContent = String(Math.ceil(t));
    this._cardCountdownBar.style.width = '100%';
    this._cardCountdown.classList.add('ns-show');
    this._cdInterval = setInterval(() => {
      t -= 0.1;
      if (t <= 0) { this._stopCountdown(); this._cardCountdown.classList.remove('ns-show'); onComplete(); return; }
      this._cardCountdownT.textContent = String(Math.max(0, Math.ceil(t)));
      this._cardCountdownBar.style.width = `${(t / seconds) * 100}%`;
    }, 100);
  }
  private _stopCountdown(): void {
    if (this._cdInterval !== null) { clearInterval(this._cdInterval); this._cdInterval = null; }
  }

  dispose(): void {
    this._stopCountdown();
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    this.hud.dispose();
    this.menu.dispose();
    this.pause.dispose();
    this.gameOver.dispose();
    this.cardSelect.dispose();
    this._muteBtn.remove();
    this._volumePanel.remove();
    this._cardCountdown.remove();
  }
}
