import { Bar } from './Bar';
import { Label } from './Label';
import { injectStyles } from './Style';

// Top-bar HUD: Health bar, score, wave, ammo, multiplier.
export class HUD {
  readonly root: HTMLDivElement;
  private readonly health: Bar;
  private readonly xp: Bar;
  private readonly score: Label;
  private readonly wave: Label;
  private readonly ammo: Label;
  private readonly multiplier: Label;

  constructor(parent: HTMLElement = document.body) {
    injectStyles();
    const root = document.createElement('div');
    root.className = 'fb-root';
    root.style.pointerEvents = 'none';
    root.innerHTML = `
      <div class="hud-top-left" style="position:absolute;top:18px;left:18px;display:flex;flex-direction:column;gap:8px;width:260px;">
        <div data-health></div>
        <div data-xp></div>
      </div>
      <div class="hud-top-right" style="position:absolute;top:18px;right:18px;text-align:right;background:rgba(0,10,20,0.55);border:1px solid rgba(255,0,200,0.35);border-radius:8px;padding:10px 18px;min-width:200px;">
        <div data-rows></div>
      </div>
    `;
    parent.appendChild(root);

    const healthMount = root.querySelector('[data-health]') as HTMLElement;
    const xpMount = root.querySelector('[data-xp]') as HTMLElement;
    const rowsMount = root.querySelector('[data-rows]') as HTMLElement;

    this.health = new Bar(healthMount, { kind: 'hp', label: 'HP' });
    this.xp = new Bar(xpMount, { kind: 'xp', label: 'XP' });

    this.score = new Label(rowsMount, '0', { key: 'SCORE', align: 'right' });
    this.wave = new Label(rowsMount, '1', { key: 'WAVE', align: 'right' });
    this.ammo = new Label(rowsMount, '∞', { key: 'AMMO', align: 'right' });
    this.multiplier = new Label(rowsMount, 'x1.0', { key: 'MULT', align: 'right' });

    this.root = root;
  }

  setHealth(ratio: number): void { this.health.setValue(ratio); }
  setXp(ratio: number): void { this.xp.setValue(ratio); }
  setScore(value: number): void { this.score.setText(String(value)); }
  setWave(value: number): void { this.wave.setText(String(value)); }
  setAmmo(value: number | string): void { this.ammo.setText(String(value)); }
  setMultiplier(value: number): void { this.multiplier.setText(`x${value.toFixed(1)}`); }

  dispose(): void {
    this.root.remove();
  }
}