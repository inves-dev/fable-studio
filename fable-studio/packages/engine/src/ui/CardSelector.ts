import { Button } from './Button';
import { injectStyles, tokens } from './Style';

// 3 side-by-side cards. Caller provides title/desc/onPick for each; onPick(index) fires.

export interface CardOption {
  title: string;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onPick?: () => void;
}

let cardStylesInjected = false;
function ensureCardStyles(): void {
  if (cardStylesInjected) return;
  cardStylesInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-fable-cards', 'true');
  style.textContent = `
    .fb-card-overlay {
      position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
      background: radial-gradient(ellipse at center, rgba(20,10,40,0.65) 0%, rgba(0,0,0,0.92) 100%);
      z-index:30; backdrop-filter: blur(6px);
    }
    .fb-card-overlay .head {
      font-size:24px; letter-spacing:4px; color:#ff66e0; margin-bottom:14px;
      text-shadow:0 0 12px rgba(255,0,200,0.5);
    }
    .fb-card-grid {
      display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:16px;
      padding:20px; pointer-events:auto; max-width:900px; width:90%;
    }
    .fb-card {
      background: linear-gradient(160deg, rgba(15,15,35,0.92), rgba(5,5,15,0.92));
      border:1px solid ${tokens.color.border}; border-radius:${tokens.radius.lg};
      padding:18px; color:#d6f4ff; display:flex; flex-direction:column; gap:10px;
      box-shadow: ${tokens.shadow.panel}; transition: transform .12s, box-shadow .12s;
    }
    .fb-card:hover { transform: translateY(-4px); box-shadow: ${tokens.shadow.glowMagenta}; }
    .fb-card.rare    { border-color: ${tokens.color.cyan}; }
    .fb-card.epic    { border-color: ${tokens.color.magenta}; }
    .fb-card.legendary { border-color: ${tokens.color.yellow}; box-shadow: 0 0 40px rgba(255,224,102,0.35); }
    .fb-card .title { font-size:18px; letter-spacing:2px; color:#fff; }
    .fb-card .desc { font-size:13px; color:#bcd6e6; line-height:1.5; flex:1; }
    .fb-card .rarity { font-size:11px; letter-spacing:2px; text-transform:uppercase; }
    .fb-card .rarity.common    { color:#bcd6e6; }
    .fb-card .rarity.rare      { color:${tokens.color.cyan}; }
    .fb-card .rarity.epic      { color:${tokens.color.magenta}; }
    .fb-card .rarity.legendary { color:${tokens.color.yellow}; }
  `;
  document.head.appendChild(style);
}

export class CardSelector {
  readonly root: HTMLDivElement;
  private readonly buttons: Button[] = [];

  constructor(parent: HTMLElement, options: readonly CardOption[]) {
    injectStyles();
    ensureCardStyles();
    const root = document.createElement('div');
    root.className = 'fb-card-overlay';
    const grid = document.createElement('div');
    grid.className = 'fb-card-grid';
    options.slice(0, 3).forEach((opt) => {
      const card = document.createElement('div');
      const rarity = opt.rarity ?? 'common';
      card.className = `fb-card ${rarity}`;
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = opt.title;
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = opt.description;
      const rarityLabel = document.createElement('div');
      rarityLabel.className = `rarity ${rarity}`;
      rarityLabel.textContent = rarity;
      const btn = new Button(card, 'CHOOSE', { variant: 'primary', onTap: () => opt.onPick?.() });
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(rarityLabel);
      card.appendChild(btn.el);
      grid.appendChild(card);
      this.buttons.push(btn);
    });
    root.appendChild(grid);
    parent.appendChild(root);
    this.root = root;
  }

  setTitle(text: string): void {
    let head = this.root.querySelector('.head') as HTMLElement | null;
    if (!head) {
      head = document.createElement('div');
      head.className = 'head';
      this.root.insertBefore(head, this.root.firstChild);
    }
    head.textContent = text;
  }

  dispose(): void {
    for (const b of this.buttons) b.dispose();
    this.root.remove();
  }
}