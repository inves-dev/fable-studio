// Neon Survivor HUD — every persistent in-game element (HP, shield, score,
// multi, wave, enemies, ammo, reload, FPS, crosshair, wave announce, damage
// flash, lock hint, mute, volume panel, weapon display, card countdown).
// All rules copied verbatim from the monolithic index.html (NEON SURVIVOR v1).

export const NCSS_BARS = {
  hudFrame: `
.ns-hud { position:absolute; inset:0; pointer-events:none; z-index:10;
  color:#d6f4ff; font-family:'Consolas','Courier New',monospace; }

.ns-hud-tl { position:absolute; top:18px; left:18px;
  display:flex; flex-direction:column; gap:8px; }
.ns-hud-tr { position:absolute; top:18px; right:18px; text-align:right;
  background:rgba(0,10,20,0.55); border:1px solid rgba(255,0,200,0.35);
  border-radius:8px; padding:10px 18px; min-width:180px; }
.ns-hud-bl { position:absolute; bottom:18px; left:18px;
  display:flex; flex-direction:column; gap:4px;
  background:rgba(0,10,20,0.55); border:1px solid rgba(0,200,255,0.3);
  border-radius:8px; padding:10px 16px; min-width:200px; }
.ns-hud-br { position:absolute; bottom:18px; right:18px;
  background:rgba(0,10,20,0.55); border:1px solid rgba(0,255,180,0.35);
  border-radius:8px; padding:8px 14px; font-size:12px; letter-spacing:2px;
  color:#6effce; }
  `,
  bar: `
.ns-bar-wrap { width:240px; }
.ns-bar-label {
  display:flex; justify-content:space-between;
  font-size:12px; letter-spacing:2px; color:#6ad9ff; margin-bottom:3px;
}
.ns-bar {
  width:100%; height:12px;
  background:rgba(0,30,50,0.6); border:1px solid rgba(0,200,255,0.4);
  border-radius:4px; overflow:hidden; position:relative;
}
.ns-bar-fill {
  height:100%; width:100%;
  background:linear-gradient(90deg, #00e0ff, #ff00d4);
  transition:width .18s;
}
.ns-bar-fill.ns-hp { background:linear-gradient(90deg, #ff2e7a, #ffae00); }
.ns-bar-fill.ns-low { animation:ns-pulse 0.6s ease-in-out infinite; }
  `,
  scorePanel: `
.ns-hud-tr .ns-row { display:flex; justify-content:space-between; font-size:13px; }
.ns-hud-tr .ns-row .ns-k { color:#ff6ed8; }
.ns-hud-tr .ns-row .ns-v { color:#fff; font-weight:700; }
.ns-hud-tr .ns-row .ns-v.ns-alt { color:#ffe066; }
  `,
  ammoPanel: `
.ns-hud-bl .ns-row { display:flex; justify-content:space-between; font-size:13px; letter-spacing:1px; }
.ns-hud-bl .ns-row .ns-k { color:#6ad9ff; }
.ns-hud-bl .ns-row .ns-v { color:#fff; font-weight:700; }
  `,
  waveAnnounce: `
.ns-wave-announce {
  position:absolute; left:50%; top:22%; transform:translateX(-50%);
  font-size:36px; letter-spacing:8px; font-weight:900; color:#ff00d4;
  text-shadow:0 0 18px #ff00d4, 0 0 40px #00e0ff;
  opacity:0; transition:opacity .4s; pointer-events:none; z-index:11;
}
.ns-wave-announce.ns-show { opacity:1; }
  `,
  lockHint: `
.ns-lock-hint {
  position:absolute; left:50%; bottom:16%; transform:translateX(-50%);
  background:rgba(0,10,20,0.85); border:1px solid rgba(0,200,255,0.5);
  padding:8px 20px; border-radius:6px; color:#b6f3ff; font-size:12px;
  letter-spacing:2px; z-index:12; opacity:0; transition:opacity .3s;
  pointer-events:none;
}
.ns-lock-hint.ns-show { opacity:1; }
.ns-lock-hint b { color:#00e0ff; }
  `,
  muteAndVolume: `
.ns-mute-btn {
  position:absolute; top:18px; left:50%; transform:translateX(-50%);
  background:rgba(0,10,20,0.7); border:1px solid rgba(0,200,255,0.4);
  border-radius:6px; padding:6px 12px; color:#b6f3ff; font-size:18px;
  cursor:pointer; pointer-events:auto; z-index:11; user-select:none;
  font-family:inherit;
}
.ns-mute-btn:hover { background:rgba(0,30,50,0.9); border-color:#00e0ff; }
.ns-volume-panel {
  position:absolute; right:18px; top:70px;
  background:rgba(0,10,20,0.8); border:1px solid rgba(0,200,255,0.4);
  border-radius:6px; padding:6px 10px; z-index:11;
  display:flex; flex-direction:column; gap:4px;
  pointer-events:auto;
}
.ns-volume-row { display:flex; align-items:center; gap:6px; }
.ns-vlabel { font-size:14px; width:16px; }
.ns-vol-slider { width:80px; accent-color:#00e0ff; cursor:pointer; }
  `,
  weaponDisplay: `
.ns-weapon-display {
  position:absolute; right:18px; top:50%; transform:translateY(-50%);
  background:rgba(0,10,20,0.7); border:1px solid rgba(0,200,255,0.4);
  border-radius:8px; padding:12px 16px; color:#b6f3ff;
  text-align:center; z-index:11; min-width:110px;
}
.ns-weapon-icon { font-size:28px; margin-bottom:4px; }
.ns-weapon-name { font-size:13px; letter-spacing:3px; font-weight:800; }
.ns-weapon-hint { font-size:10px; color:#6a8aa0; margin-top:4px; letter-spacing:1px; }
  `,
  cardCountdown: `
.ns-card-countdown {
  position:absolute; left:50%; top:35%; transform:translateX(-50%);
  text-align:center; z-index:13; pointer-events:none; opacity:0;
  transition:opacity .3s;
}
.ns-card-countdown.ns-show { opacity:1; }
.ns-card-countdown .ns-label {
  color:#ff00d4; font-size:14px; letter-spacing:4px;
  text-shadow:0 0 8px #ff00d4; margin-bottom:8px;
}
.ns-card-countdown .ns-timer {
  color:#fff; font-size:48px; font-weight:900;
  text-shadow:0 0 20px #00e0ff, 0 0 40px #00e0ff;
}
.ns-card-countdown .ns-bar {
  margin:8px auto 0; width:200px; height:4px;
  background:rgba(255,255,255,0.15); border-radius:2px; overflow:hidden;
}
.ns-card-countdown .ns-bar-fill {
  height:100%; background:linear-gradient(90deg, #00e0ff, #ff00d4);
  transition:width .1s linear;
}
  `,
} as const;
