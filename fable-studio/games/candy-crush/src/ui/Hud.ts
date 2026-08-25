// Candy Crush - HUD overlay.
// Pure DOM helper that pushes score/win info into a single floating div.

export function updateHud(score: number, target: number, won: boolean): void {
  let hud = document.getElementById('candy-hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'candy-hud';
    Object.assign(hud.style, {
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 18px',
      borderRadius: '10px',
      background: 'rgba(20, 20, 42, 0.85)',
      color: '#feca57',
      font: '600 18px system-ui, sans-serif',
      letterSpacing: '0.04em',
      boxShadow: '0 0 18px rgba(254, 202, 87, 0.25)',
      pointerEvents: 'none',
      zIndex: '10',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(hud);
  }
  hud.textContent = won
    ? `WIN! ${score} / ${target}`
    : `Score: ${score} / ${target}`;
}
