// Neon Survivor HUD styles — base + keyframes.
// Injected by NeonStylesInjector.ts. All other rules live in NeonStylePanels,
// NeonStyleBars, and NeonStyleOverlays.

export const NCSS = {
  keyframes: `
@keyframes ns-wave-in {
  from { opacity: 0; transform: translate(-50%, -8px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes ns-wave-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes ns-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ns-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
  `,
  base: `
.ns-root { position:absolute; inset:0; pointer-events:none;
  color:#d6f4ff; font-family:'Consolas','Courier New',monospace;
  z-index:10; user-select:none; -webkit-user-select:none;
}
.ns-root * { box-sizing:border-box; margin:0; padding:0; }
.ns-hidden { display:none !important; }
  `,
  damageFlash: `
.ns-damage-flash {
  position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(circle, transparent 50%, rgba(255,30,80,0.6) 100%);
  opacity:0; transition:opacity .12s; z-index:9;
}
.ns-damage-flash.show { opacity:1; }
  `,
} as const;
