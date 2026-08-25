import { injectStyles } from './Style';

// Static text label with optional key/value layout.
export class Label {
  readonly el: HTMLDivElement;

  constructor(parent: HTMLElement, text: string, opts: { key?: string; align?: 'left' | 'center' | 'right'; size?: number } = {}) {
    injectStyles();
    const el = document.createElement('div');
    el.className = 'fb-label';
    const align = opts.align ?? 'left';
    el.style.textAlign = align;
    if (opts.size) el.style.fontSize = `${opts.size}px`;
    if (opts.key) {
      const k = document.createElement('span');
      k.className = 'k';
      k.textContent = `${opts.key} `;
      const v = document.createElement('span');
      v.className = 'v';
      v.textContent = text;
      el.appendChild(k);
      el.appendChild(v);
    } else {
      el.textContent = text;
    }
    parent.appendChild(el);
    this.el = el;
  }

  setText(text: string): void {
    if (this.el.children.length === 2) {
      (this.el.children[1] as HTMLElement).textContent = text;
    } else {
      this.el.textContent = text;
    }
  }

  dispose(): void {
    this.el.remove();
  }
}