import { injectStyles, type Variant } from './Style';

// Lightweight HTML button wrapper. Use programmatic API (`onTap`) instead of
// raw `addEventListener` so the engine can audit interactions.
export class Button {
  readonly el: HTMLButtonElement;
  private listeners: Array<() => void> = [];

  constructor(parent: HTMLElement, label: string, opts: { variant?: Variant; onTap?: () => void; disabled?: boolean } = {}) {
    injectStyles();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `fb-btn ${opts.variant ?? 'secondary'}`;
    btn.textContent = label;
    if (opts.disabled) btn.disabled = true;
    const handler = (): void => {
      if (btn.disabled) return;
      opts.onTap?.();
    };
    btn.addEventListener('click', handler);
    parent.appendChild(btn);
    this.el = btn;
  }

  setText(text: string): void {
    this.el.textContent = text;
  }

  setEnabled(enabled: boolean): void {
    this.el.disabled = !enabled;
  }

  setVariant(variant: Variant): void {
    this.el.className = `fb-btn ${variant}`;
  }

  onTap(handler: () => void): void {
    const fn = (): void => handler();
    this.el.addEventListener('click', fn);
    this.listeners.push(() => this.el.removeEventListener('click', fn));
  }

  dispose(): void {
    for (const off of this.listeners) off();
    this.listeners = [];
    this.el.remove();
  }
}