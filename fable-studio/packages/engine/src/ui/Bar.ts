import { injectStyles } from './Style';

// Visual bar (e.g. health, mana, xp). setValue takes a ratio 0..1.
export class Bar {
  readonly el: HTMLDivElement;
  private readonly fill: HTMLDivElement;

  constructor(parent: HTMLElement, opts: { color?: string; kind?: 'hp' | 'xp' | 'generic'; label?: string } = {}) {
    injectStyles();
    const kindClass = opts.kind && opts.kind !== 'generic' ? opts.kind : '';
    const wrap = document.createElement('div');
    if (opts.label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'fb-label';
      labelEl.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:3px;';
      const l = document.createElement('span');
      l.className = 'k';
      l.textContent = opts.label;
      labelEl.appendChild(l);
      wrap.appendChild(labelEl);
    }
    const bar = document.createElement('div');
    bar.className = `fb-bar ${kindClass}`;
    const fill = document.createElement('div');
    fill.className = 'fill';
    if (opts.color) fill.style.background = opts.color;
    bar.appendChild(fill);
    wrap.appendChild(bar);
    parent.appendChild(wrap);
    this.el = bar;
    this.fill = fill;
    this.setValue(1);
  }

  setValue(ratio: number): void {
    const r = Math.max(0, Math.min(1, ratio));
    this.fill.style.width = `${(r * 100).toFixed(1)}%`;
  }

  setColor(color: string): void {
    this.fill.style.background = color;
  }

  dispose(): void {
    this.el.parentElement?.remove();
  }
}