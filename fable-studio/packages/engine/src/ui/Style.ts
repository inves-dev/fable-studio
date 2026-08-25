// Design tokens for the cyberpunk/neon look. Style sheets (StyleTag)
// produce shared CSS strings; UI classes reuse them.

export const tokens = {
  color: {
    cyan:    '#00e0ff',
    magenta: '#ff00d4',
    pink:    '#ff2e7a',
    yellow:  '#ffe066',
    green:   '#00ffa3',
    purple:  '#9b5cff',
    bg:      '#0a0a1a',
    panel:   'rgba(10,10,26,0.85)',
    border:  'rgba(0,255,255,0.4)',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '14px',
    pill: '999px',
  },
  shadow: {
    glow:  '0 0 24px rgba(0,200,255,0.4)',
    glowMagenta: '0 0 32px rgba(255,0,200,0.55)',
    panel: '0 0 60px rgba(0,180,255,0.25), inset 0 0 30px rgba(120,0,255,0.12)',
  },
  font: {
    body: "'Segoe UI', Tahoma, sans-serif",
    mono: "'Consolas', 'Courier New', monospace",
  },
  size: {
    buttonMd: '14px',
    buttonLg: '18px',
    label: '13px',
    title: '22px',
  },
} as const;

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

// Shared StyleSheet applied once on engine init.
let injected = false;
export function injectStyles(): void {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.setAttribute('data-fable-styles', 'true');
  style.textContent = `
    .fb-root { position:absolute; inset:0; pointer-events:none; font-family: ${tokens.font.mono}; color:#d6f4ff; }
    .fb-root * { box-sizing: border-box; }
    .fb-btn {
      pointer-events:auto; cursor:pointer; font-family: ${tokens.font.mono};
      padding: 10px 22px; font-size: ${tokens.size.buttonMd}; letter-spacing: 2px;
      border-radius: ${tokens.radius.md}; transition: transform .12s, box-shadow .12s;
      border: 1px solid ${tokens.color.border}; background: ${tokens.color.panel};
      color: ${tokens.color.cyan};
    }
    .fb-btn.primary { background: linear-gradient(90deg, ${tokens.color.magenta}, ${tokens.color.cyan}); color:#fff; border:none; box-shadow: ${tokens.shadow.glow}; }
    .fb-btn.secondary { background: ${tokens.color.panel}; color: ${tokens.color.cyan}; border-color: ${tokens.color.border}; }
    .fb-btn.ghost { background: transparent; border-color: rgba(255,255,255,0.2); color:#bcd6e6; }
    .fb-btn.danger { background: linear-gradient(90deg, ${tokens.color.pink}, #ff8800); color:#fff; border:none; }
    .fb-btn:hover { transform: scale(1.05); box-shadow: ${tokens.shadow.glowMagenta}; }
    .fb-btn:active { transform: scale(0.97); }
    .fb-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }

    .fb-bar {
      position:relative; width:100%; height:12px; background: rgba(0,30,50,0.6);
      border:1px solid ${tokens.color.border}; border-radius: ${tokens.radius.sm}; overflow:hidden;
    }
    .fb-bar > .fill {
      height:100%; width:100%; background: linear-gradient(90deg, ${tokens.color.cyan}, ${tokens.color.magenta});
      transition: width .18s ease-out;
    }
    .fb-bar.hp > .fill { background: linear-gradient(90deg, ${tokens.color.pink}, ${tokens.color.yellow}); }
    .fb-bar.xp > .fill { background: linear-gradient(90deg, ${tokens.color.green}, ${tokens.color.cyan}); }

    .fb-label { font-family: ${tokens.font.mono}; font-size: ${tokens.size.label}; letter-spacing: 1px; color:#d6f4ff; }
    .fb-label .k { color: ${tokens.color.cyan}; }
    .fb-label .v { color:#fff; font-weight:700; }
  `;
  document.head.appendChild(style);
}