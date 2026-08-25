// Neon Survivor — overlay panels (menu, pause, game-over, card-select).
// Texts and structure mirror the original monolithic index.html verbatim.

import { injectStyles } from './NeonStylesInjector';
import type { CardPick } from '../state';
import type { Rarity } from '../cards';

type RarityKey = Rarity;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, cls: string, parent: HTMLElement,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag); n.className = cls; parent.appendChild(n); return n;
}

// ── Menu (start screen) ─────────────────────────────────────────────────────

export class NeonMenu {
  readonly root: HTMLDivElement;
  private readonly _btn: HTMLButtonElement;

  constructor(parent: HTMLElement, onPlay: () => void) {
    injectStyles();
    const root = el('div', 'ns-overlay', parent);
    const panel = el('div', 'ns-panel', root);
    const h1 = el('h1', '', panel); h1.textContent = 'NEON SURVIVOR';
    const h2 = el('h2', '', panel); h2.textContent = '// survive the night //';
    const intro = el('p', '', panel); intro.textContent = 'Cyberpunk arena. Endless waves. How long can you last?';
    const ul = el('ul', '', panel);
    const keys: Array<[string, string]> = [
      ['W A S D', 'move'],
      ['MOUSE', 'aim camera (or Q E for 360°)'],
      ['LMB', 'shoot'],
      ['1 / 2 / 3', 'switch weapon'],
      ['SHIFT', 'sprint'],
      ['SPACE', 'dash'],
      ['R', 'reload'],
      ['ESC', 'pause'],
    ];
    for (const [k, v] of keys) {
      const li = el('li', '', ul);
      const kbd = el('span', 'ns-kbd', li); kbd.textContent = k;
      li.appendChild(document.createTextNode(' ' + v));
    }
    const btn = el('button', 'ns-btn', panel); btn.id = 'playBtn'; btn.textContent = 'PLAY';
    const hint = el('div', 'ns-hint', panel); hint.textContent = 'click to lock pointer';
    btn.addEventListener('click', () => { root.style.display = 'none'; onPlay(); });
    this.root = root;
    this._btn = btn;
  }

  hide(): void { this.root.style.display = 'none'; }
  show(): void { this.root.style.display = 'flex'; }
  dispose(): void { this.root.remove(); }
}

// ── Pause overlay ────────────────────────────────────────────────────────────

export class NeonPause {
  readonly root: HTMLDivElement;
  private readonly _btn: HTMLButtonElement;

  constructor(parent: HTMLElement, onResume: () => void) {
    injectStyles();
    const root = el('div', 'ns-overlay', parent);
    root.style.display = 'none';
    const panel = el('div', 'ns-panel', root);
    const h1 = el('h1', '', panel); h1.textContent = 'PAUSED';
    const p = el('p', '', panel); p.textContent = 'Press ESC to resume';
    const btn = el('button', 'ns-btn', panel); btn.id = 'resumeBtn'; btn.textContent = 'RESUME';
    const hint = el('p', 'ns-hint', panel); hint.style.marginTop = '18px';
    hint.textContent = 'or click anywhere';
    btn.addEventListener('click', () => { root.style.display = 'none'; onResume(); });
    root.addEventListener('click', (e) => { if (e.target === root) { root.style.display = 'none'; onResume(); } });
    this.root = root;
    this._btn = btn;
  }

  show(): void { this.root.style.display = 'flex'; }
  hide(): void { this.root.style.display = 'none'; }
  dispose(): void { this.root.remove(); }
}

// ── Game-over overlay ────────────────────────────────────────────────────────

export class NeonGameOver {
  readonly root: HTMLDivElement;
  private readonly _scoreEl: HTMLSpanElement;
  private readonly _waveEl: HTMLSpanElement;
  private readonly _killsEl: HTMLSpanElement;

  constructor(parent: HTMLElement, onRestart: () => void) {
    injectStyles();
    const root = el('div', 'ns-overlay', parent);
    root.style.display = 'none';
    const panel = el('div', 'ns-panel', root);
    const h1 = el('h1', 'ns-died', panel); h1.textContent = 'YOU DIED';
    const h2 = el('h2', '', panel); h2.textContent = 'the city falls silent';
    const ps = el('p', '', panel); ps.textContent = 'Final Score: ';
    this._scoreEl = el('span', 'ns-go-score', ps); this._scoreEl.id = 'finalScore'; this._scoreEl.textContent = '0';
    const pw = el('p', '', panel); pw.textContent = 'Waves Survived: ';
    this._waveEl = el('span', 'ns-go-wave', pw); this._waveEl.id = 'finalWave'; this._waveEl.textContent = '0';
    const pk = el('p', '', panel); pk.textContent = 'Enemies Slain: ';
    this._killsEl = el('span', 'ns-go-kills', pk); this._killsEl.id = 'finalKills'; this._killsEl.textContent = '0';
    const btn = el('button', 'ns-btn', panel); btn.id = 'restartBtn'; btn.textContent = 'PLAY AGAIN';
    btn.addEventListener('click', () => { root.style.display = 'none'; onRestart(); });
    this.root = root;
  }

  show(score: number, wave: number, kills: number): void {
    this._scoreEl.textContent = String(score | 0);
    this._waveEl.textContent = String(wave | 0);
    this._killsEl.textContent = String(kills | 0);
    this.root.style.display = 'flex';
    document.exitPointerLock?.();
  }

  hide(): void { this.root.style.display = 'none'; }
  dispose(): void { this.root.remove(); }
}

// ── Card select (3 random upgrades) ─────────────────────────────────────────

export class NeonCardSelect {
  readonly root: HTMLDivElement;
  private readonly _rowEl: HTMLDivElement;
  private readonly _subtitleEl: HTMLParagraphElement;
  private readonly _hintEl: HTMLParagraphElement;
  private _onPick: ((idx: number) => void) | null = null;
  private readonly _cardEls: HTMLDivElement[] = [];

  constructor(parent: HTMLElement) {
    injectStyles();
    const root = el('div', 'ns-card-screen', parent);
    root.style.display = 'none';
    const h2 = el('h2', '', root); h2.textContent = 'CHOOSE YOUR UPGRADE';
    this._subtitleEl = el('p', 'ns-subtitle', root);
    this._subtitleEl.id = 'cardScoreLabel'; this._subtitleEl.textContent = 'SCORE 0';
    this._rowEl = el('div', 'ns-card-row', root);
    this._rowEl.id = 'cardRow';
    this._hintEl = el('p', 'ns-card-hint', root);
    this._hintEl.textContent = 'click a card to select';
    this.root = root;
  }

  show(score: number, cards: CardPick[], onPick: (idx: number) => void): void {
    this._onPick = onPick;
    this._subtitleEl.textContent = `SCORE ${score | 0}`;
    this._cardEls.forEach((c) => c.remove());
    this._cardEls.length = 0;
    cards.slice(0, 3).forEach((cp, i) => {
      const r = cp.card.rarity as RarityKey;
      const card = el('div', `ns-card ${r}`, this._rowEl);
      const icon = el('div', 'ns-icon', card); icon.textContent = cp.card.icon;
      const name = el('div', 'ns-name', card); name.textContent = cp.card.name;
      const rarity = el('div', 'ns-rarity', card); rarity.textContent = r.toUpperCase();
      const desc = el('div', 'ns-desc', card); desc.textContent = cp.card.desc;
      card.addEventListener('click', () => this._onPick?.(i));
      this._cardEls.push(card);
    });
    this.root.style.display = 'flex';
  }

  hide(): void {
    this.root.style.display = 'none';
    this._cardEls.forEach((c) => c.remove());
    this._cardEls.length = 0;
    this._onPick = null;
  }

  dispose(): void { this.root.remove(); }
}
