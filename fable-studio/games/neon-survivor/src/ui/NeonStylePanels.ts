// Neon Survivor HUD — overlay/panel styles copied from the monolithic
// index.html (NEON SURVIVOR v1) verbatim. Class names use the .ns- prefix
// to avoid clashing with the game canvas.

export const NCSS_BLOCKS = {
  overlay: `
.ns-overlay {
  position:absolute; inset:0; z-index:30;
  display:flex; align-items:center; justify-content:center;
  background:radial-gradient(ellipse at center, rgba(20,10,40,0.6) 0%, rgba(0,0,0,0.95) 100%);
  backdrop-filter:blur(6px);
}
.ns-panel {
  background:linear-gradient(160deg, rgba(15,15,35,0.92), rgba(5,5,15,0.92));
  border:1px solid rgba(0,255,255,0.35);
  box-shadow:0 0 60px rgba(0,180,255,0.25), inset 0 0 30px rgba(120,0,255,0.12);
  border-radius:14px; padding:36px 44px; max-width:640px; width:86%;
  text-align:center; pointer-events:auto;
}
.ns-panel h1 {
  font-size:54px; margin:0 0 6px; letter-spacing:6px; font-weight:900;
  background:linear-gradient(90deg, #00e0ff, #ff00d4, #00e0ff);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  text-shadow:0 0 20px rgba(0,200,255,0.35);
}
.ns-panel h2 {
  font-size:22px; margin:0 0 18px; color:#ff66e0; letter-spacing:4px; text-transform:uppercase;
}
.ns-panel p { line-height:1.6; color:#bcd6e6; margin:6px 0; font-size:15px; }
.ns-panel ul { text-align:left; display:inline-block; margin:10px auto; color:#cfe7f3; line-height:1.7; font-size:14px; }
.ns-panel .ns-kbd { display:inline-block; min-width:28px; padding:2px 8px; margin:0 3px;
  border-radius:6px; background:rgba(0,255,255,0.1); border:1px solid rgba(0,255,255,0.4);
  color:#b6f3ff; font-family:'Consolas',monospace; font-size:13px;
}
.ns-btn {
  pointer-events:auto; cursor:pointer;
  margin-top:18px; padding:12px 36px; font-size:18px; font-weight:700; letter-spacing:3px;
  background:linear-gradient(90deg, #ff00aa, #00d4ff);
  border:none; border-radius:8px; color:#fff;
  box-shadow:0 0 24px rgba(0,200,255,0.4);
  transition:transform .12s, box-shadow .12s;
  font-family:inherit;
}
.ns-btn:hover { transform:scale(1.05); box-shadow:0 0 32px rgba(255,0,200,0.55); }
.ns-btn:active { transform:scale(0.97); }
.ns-hint { margin-top:14px; font-size:12px; color:#6a8aa0; letter-spacing:2px; }
  `,
  crosshair: `
.ns-crosshair {
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:22px; height:22px; pointer-events:none; z-index:5;
}
.ns-crosshair::before, .ns-crosshair::after {
  content:''; position:absolute; background:#00e0ff; box-shadow:0 0 6px #00e0ff;
}
.ns-crosshair::before { left:50%; top:0; width:2px; height:22px; transform:translateX(-50%); }
.ns-crosshair::after  { top:50%; left:0; height:2px; width:22px; transform:translateY(-50%); }
.ns-crosshair .ns-dot {
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  width:4px; height:4px; background:#ff00d4; border-radius:50%;
  box-shadow:0 0 6px #ff00d4;
}
  `,
  gameOverTitle: `
.ns-panel h1.ns-died {
  background:linear-gradient(90deg, #ff003c, #ffae00);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.ns-go-score { color:#ffe066; font-weight:700; }
.ns-go-wave  { color:#6ad9ff; font-weight:700; }
.ns-go-kills { color:#ff6ed8; font-weight:700; }
  `,
} as const;
