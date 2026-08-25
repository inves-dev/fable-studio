// Mobile on-screen controls for Neon Survivor.
// Provides: left joystick = movement (writes GAME.keys.WASD), right joystick = look (writes GAME.yaw/pitch),
// shoot button = mouse down, dash button = spacebar, reload button = R, hide button = toggles this entire layer.

interface Handlers {
  onShootDown: () => void;
  onShootUp: () => void;
  onDash: () => void;
  onReload: () => void;
}

export function setupMobileControls(handlers: Handlers): { dispose: () => void } {
  // Detect touch
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (!isTouch) return { dispose: () => {} };

  // CSS is bundled by boot.ts (import './mobile/MobileControls.css'), so no
  // <link> injection needed here — and pointing at /src/... would 404 in
  // the production APK.

  let host = document.getElementById('mobileControls');
  if (!host) {
    host = document.createElement('div');
    host.id = 'mobileControls';
    document.body.appendChild(host);
  }

  host.innerHTML = `
    <div class="mc-joystick" id="mcJoystickMove"><div class="stick"></div></div>
    <div class="mc-joystick" id="mcJoystickLook"><div class="stick"></div></div>
    <div class="mc-btn" id="mcShoot">FIRE</div>
    <div class="mc-btn" id="mcDash">DASH</div>
    <div class="mc-btn" id="mcReload">RELOAD</div>
  `;

  const moveEl = host.querySelector('#mcJoystickMove') as HTMLDivElement;
  const moveStick = moveEl.querySelector('.stick') as HTMLDivElement;
  const lookEl = host.querySelector('#mcJoystickLook') as HTMLDivElement;
  const lookStick = lookEl.querySelector('.stick') as HTMLDivElement;
  const shootBtn = host.querySelector('#mcShoot') as HTMLDivElement;
  const dashBtn = host.querySelector('#mcDash') as HTMLDivElement;
  const reloadBtn = host.querySelector('#mcReload') as HTMLDivElement;

  const centerOf = (el: HTMLElement): { x: number; y: number } => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const radiusOf = (el: HTMLElement): number => el.getBoundingClientRect().width / 2;

  // Movement joystick
  const setupJoystick = (
    el: HTMLElement,
    stick: HTMLElement,
    onMove: (dx: number, dy: number) => void,
    onRelease: () => void,
  ): (() => void) => {
    let active = false;
    let pointerId: number | null = null;
    const onDown = (e: PointerEvent): void => {
      active = true;
      pointerId = e.pointerId;
      // WebView on Android can reject setPointerCapture for synthetic events.
      // Best effort: try, ignore failure (the move/up listeners still fire on
      // the element because we attached them there directly).
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      updateFromPointer(e);
    };
    const updateFromPointer = (e: PointerEvent): void => {
      if (!active) return;
      const c = centerOf(el);
      const r = radiusOf(el);
      let dx = (e.clientX - c.x) / r;
      let dy = (e.clientY - c.y) / r;
      const len = Math.hypot(dx, dy);
      if (len > 1) { dx /= len; dy /= len; }
      stick.style.transform = `translate(calc(-50% + ${dx * r * 0.5}px), calc(-50% + ${dy * r * 0.5}px))`;
      onMove(dx, dy);
    };
    const onUp = (e: PointerEvent): void => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      pointerId = null;
      stick.style.transform = 'translate(-50%, -50%)';
      onRelease();
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', updateFromPointer);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', updateFromPointer);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  };

  // The original game reads GAME.keys.{KeyW,KeyA,KeyS,KeyD} for movement.
  // We simulate that by setting the corresponding key codes to true/false.
  // The look joystick updates GAME.yaw / GAME.pitch directly (these are the
  // vars the original uses for camera rotation).
  const game = (window as any).GAME;
  const stats = (window as any).playerStats;
  const camera = (window as any).camera;

  const detachMove = setupJoystick(
    moveEl, moveStick,
    (dx, dy) => {
      // Always read window.GAME fresh on each frame — the GAME object can
      // be replaced across resets, so caching a reference at setup time
      // could leave us writing to a stale dict.
      const dead = 0.18;
      const g = (window as any).GAME;
      if (!g) return;
      const k = g.keys;
      if (!k) return;
      k.KeyW = dy < -dead;
      k.KeyS = dy > dead;
      k.KeyA = dx < -dead;
      k.KeyD = dx > dead;
    },
    () => {
      const g = (window as any).GAME;
      if (!g || !g.keys) return;
      g.keys.KeyW = g.keys.KeyS = g.keys.KeyA = g.keys.KeyD = false;
    },
  );

  let lookAccum = { dx: 0, dy: 0 };
  const detachLook = setupJoystick(
    lookEl, lookStick,
    (dx, dy) => {
      // Direct rotation on camera/yaw — looks like the player is dragging the look around.
      const g = (window as any).GAME;
      const c = (window as any).camera;
      if (!g || !c) return;
      g.yaw   -= dx * 0.06;
      g.pitch -= dy * 0.06;
      const lim = Math.PI / 2 - 0.05;
      if (g.pitch >  lim) g.pitch =  lim;
      if (g.pitch < -lim) g.pitch = -lim;
    },
    () => {},
  );

  const onShootDown = (e: Event): void => { e.preventDefault(); handlers.onShootDown(); };
  const onShootUp = (e: Event): void => { e.preventDefault(); handlers.onShootUp(); };
  const onDashDown = (e: Event): void => { e.preventDefault(); handlers.onDash(); };
  const onReloadDown = (e: Event): void => { e.preventDefault(); handlers.onReload(); };
  shootBtn.addEventListener('pointerdown', onShootDown);
  window.addEventListener('pointerup', onShootUp);
  dashBtn.addEventListener('pointerdown', onDashDown);
  reloadBtn.addEventListener('pointerdown', onReloadDown);

  return {
    dispose: () => {
      detachMove();
      detachLook();
      shootBtn.removeEventListener('pointerdown', onShootDown);
      window.removeEventListener('pointerup', onShootUp);
      dashBtn.removeEventListener('pointerdown', onDashDown);
      reloadBtn.removeEventListener('pointerdown', onReloadDown);
      host?.remove();
    },
  };
}