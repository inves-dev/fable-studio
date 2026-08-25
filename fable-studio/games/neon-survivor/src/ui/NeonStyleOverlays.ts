// Neon Survivor HUD — card-select overlay + pause veil.
// Copied verbatim from the monolithic index.html (NEON SURVIVOR v1).

export const NCSS_OVERLAYS = {
  cardScreen: `
.ns-card-screen {
  position:absolute; inset:0; z-index:25;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:rgba(0,0,10,0.85); backdrop-filter:blur(6px);
}
.ns-card-screen h2 {
  font-size:32px; letter-spacing:6px; font-weight:900;
  background:linear-gradient(90deg, #00e0ff, #ff00d4);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  text-shadow:0 0 20px rgba(0,200,255,0.4); margin:0 0 8px;
}
.ns-card-screen .ns-subtitle {
  color:#b6f3ff; letter-spacing:3px; font-size:12px; margin-bottom:24px;
}
.ns-card-row { display:flex; gap:24px; align-items:stretch; }
.ns-card {
  width:220px; min-height:340px; padding:18px;
  background:linear-gradient(160deg, rgba(20,15,40,0.95), rgba(5,5,20,0.95));
  border:2px solid; border-radius:12px; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; justify-content:space-between;
  transition:transform .18s, box-shadow .18s; user-select:none; position:relative;
  pointer-events:auto;
}
.ns-card:hover { transform:translateY(-8px) scale(1.04); }
.ns-card.common    { border-color:#6688aa; box-shadow:0 0 12px rgba(102,136,170,0.4); }
.ns-card.rare      { border-color:#00ffaa; box-shadow:0 0 18px rgba(0,255,170,0.5); }
.ns-card.epic      { border-color:#cc66ff; box-shadow:0 0 22px rgba(204,102,255,0.6); }
.ns-card.legendary { border-color:#ffaa00; box-shadow:0 0 30px rgba(255,170,0,0.7); }
.ns-card.cursed    { border-color:#ff2266; box-shadow:0 0 26px rgba(255,34,102,0.7); }
.ns-card .ns-icon { font-size:64px; line-height:1; margin:12px 0 8px; }
.ns-card .ns-name {
  font-size:18px; font-weight:800; letter-spacing:2px; color:#fff;
  text-align:center; margin:6px 0; text-transform:uppercase;
}
.ns-card .ns-rarity {
  font-size:10px; letter-spacing:3px; text-transform:uppercase;
  margin-bottom:8px; padding:2px 8px; border-radius:3px;
}
.ns-card.common .ns-rarity    { color:#6688aa; background:rgba(102,136,170,0.15); }
.ns-card.rare .ns-rarity      { color:#00ffaa; background:rgba(0,255,170,0.15); }
.ns-card.epic .ns-rarity      { color:#cc66ff; background:rgba(204,102,255,0.15); }
.ns-card.legendary .ns-rarity { color:#ffaa00; background:rgba(255,170,0,0.15); }
.ns-card.cursed .ns-rarity    { color:#ff2266; background:rgba(255,34,102,0.15); }
.ns-card .ns-desc {
  font-size:12px; color:#b6f3ff; text-align:center;
  line-height:1.5; padding:0 4px;
}
.ns-card.legendary .ns-name { color:#ffaa00; text-shadow:0 0 10px #ffaa00; }
.ns-card.cursed .ns-name    { color:#ff4488; text-shadow:0 0 10px #ff2266; }
.ns-card.ns-locked { pointer-events:none; opacity:0.5; filter:grayscale(0.5); }
.ns-card-hint {
  margin-top:18px; color:#6a8aa0; letter-spacing:2px; font-size:12px;
}
  `,
  pauseVeil: `
.ns-pause-veil {
  position:absolute; inset:0; background:rgba(0,0,0,0.55); z-index:18;
  display:flex; align-items:center; justify-content:center;
  font-size:64px; letter-spacing:12px; color:#00e0ff;
  text-shadow:0 0 20px #00e0ff;
}
  `,
} as const;
