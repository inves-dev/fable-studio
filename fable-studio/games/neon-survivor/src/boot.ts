import * as THREE from 'three';
import { GAME_SOURCE } from './game-source';
import { setupMobileControls } from './mobile/MobileControls';
// Importing the CSS here makes Vite bundle it as an asset (hashed .css in
// dist/assets/). Without this import, the runtime <link> injected by
// MobileControls.ts points to /src/mobile/MobileControls.css, which only
// exists in dev — in the Capacitor APK that path 404s and the controls
// render as unstyled DOM (invisible).
import './mobile/MobileControls.css';

// Expose the bundled THREE namespace so the rewritten inline game source
// (which no longer has an `import` statement) can reference it as `THREE`.
// We set this on `window` before the rewritten source runs so any
// top-level `THREE.X` access resolves to the same namespace Vite bundled.
(window as unknown as { THREE_NS: typeof THREE }).THREE_NS = THREE;

// Stash a native-platform flag on `window` BEFORE we run the game source.
// The source decides renderer perf knobs (antialias, pixelRatio, toneMapping)
// at top-level, and we want it to pick the mobile variants when running in
// the Capacitor WebView rather than the desktop defaults.
type NativeWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean; platform?: string };
  __NATIVE__?: boolean;
};
const isNative = ((): boolean => {
  try {
    const w = window as unknown as NativeWindow;
    return !!w.Capacitor?.isNativePlatform?.();
  } catch { return false; }
})();
(window as unknown as NativeWindow).__NATIVE__ = isNative;
if (isNative) document.body.classList.add('is-mobile');

// The original game code imports three via the importmap:
//   import * as THREE from 'three';
// `new Function()` cannot parse ES `import` statements, and the import has
// already been stripped from GAME_SOURCE during extraction. We prepend a
// `const THREE = window.THREE_NS;` so every `THREE.X` access in the
// inlined source resolves to the same namespace Vite bundled.
//
// We also append a tiny epilogue that publishes the module-scoped helpers
// the mobile controls need (`startReload`, `startDash`) onto `window`,
// since after the inline source runs inside `new Function()` those
// declarations are not visible to boot.ts otherwise.
const EPILOGUE = `
;window.startReload = (typeof startReload === 'function') ? startReload : undefined;
window.startDash = (typeof startDash === 'function') ? startDash : undefined;
`;

const rewritten = `const THREE = window.THREE_NS;\n${GAME_SOURCE}`.replace(/\s+$/, '') + EPILOGUE;

interface WiredGame {
  mouse: { down: boolean };
  keys: Record<string, boolean>;
  fire?: (down: boolean) => void;
  startDash?: () => void;
  tryDash?: () => void;
  startReload?: () => void;
}

function boot(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(rewritten)();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Neon Survivor boot] inline source threw:', e);
    throw e;
  }

  // Poll for the game to populate window.GAME. The original top-level script
  // assigns window.GAME synchronously mid-execution, but other code paths
  // (some via setTimeout) may also assign it — poll briefly to be safe.
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  const POLL_MS = 100;

  const wire = (): boolean => {
    // Probe that GAME is ready, but DO NOT cache the reference in handlers
    // below — GAME may be reassigned during a game reset (startGame() rebuilds
    // the world). Each handler reads window.GAME fresh on invocation.
    const probe = (window as unknown as { GAME?: WiredGame }).GAME;
    if (!probe || !probe.mouse || !probe.keys) return false;

    setupMobileControls({
      onShootDown: () => {
        const g = (window as unknown as { GAME?: WiredGame }).GAME;
        if (g?.mouse) g.mouse.down = true;
      },
      onShootUp:   () => {
        const g = (window as unknown as { GAME?: WiredGame }).GAME;
        if (g?.mouse) g.mouse.down = false;
      },
      // Dash: in game-source.ts:3020, the dash is gated on
      // GAME.keys['Space'] && playerStats.dashCooldown <= 0 && moveDir.lengthSq() > 0.
      // The mobile UX is "tap to dash regardless of movement", so we set
      // both Space (for the original handler) AND clear the dash cooldown
      // by writing a 0 via playerStats. We also pre-pad the cooldown to 0
      // via the side channel startDash() if the game exposed one.
      onDash:      () => {
        const g = (window as unknown as { GAME?: WiredGame }).GAME;
        if (g?.keys) g.keys['Space'] = true;
        // Try the game-exposed startDash() helper (boot.ts epilogue publishes it).
        const sd = (window as unknown as { startDash?: () => void }).startDash;
        if (typeof sd === 'function') {
          try { sd(); } catch { /* ignore */ }
        }
      },
      onReload:    () => {
        // Prefer the game-exposed startReload() (published on window by the
        // boot.ts epilogue). Fall back to briefly pressing the R key.
        const sr = (window as unknown as { startReload?: () => void }).startReload;
        if (typeof sr === 'function') {
          try { sr(); } catch { /* ignore */ }
          return;
        }
        const g = (window as unknown as { GAME?: WiredGame }).GAME;
        if (g?.keys) {
          g.keys['KeyR'] = true;
          setTimeout(() => {
            const g2 = (window as unknown as { GAME?: WiredGame }).GAME;
            if (g2?.keys) g2.keys['KeyR'] = false;
          }, 50);
        }
      },
    });
    return true;
  };

  const tryWire = (): void => {
    if (wire()) return;
    if (attempts++ < MAX_ATTEMPTS) {
      setTimeout(tryWire, POLL_MS);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[Neon Survivor boot] window.GAME never appeared; mobile controls disabled');
    }
  };
  tryWire();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// On native, lock the viewport further (no rubber-band, no tap-hold selection).
if (isNative) {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
}

// Debug overlay: shows GAME state + input flags. Cheap text-only updates
// every 200ms, no canvas. Tap to dismiss.
function installDebugOverlay(): void {
  const el = document.createElement('div');
  el.id = 'debugOverlay';
  el.style.cssText = [
    'position:fixed', 'top:8px', 'left:8px', 'z-index:60',
    'background:rgba(0,0,0,0.7)', 'color:#0f0', 'font:11px monospace',
    'padding:6px 8px', 'border-radius:4px', 'white-space:pre',
    'pointer-events:auto', 'min-width:160px',
  ].join(';');
  document.body.appendChild(el);
  let dismissed = false;
  el.addEventListener('click', () => { dismissed = true; el.remove(); });
  setInterval(() => {
    if (dismissed) return;
    const g = (window as any).GAME;
    if (!g) { el.textContent = 'GAME: null'; return; }
    const k = g.keys || {};
    el.textContent = [
      'state: ' + g.state,
      'mouse.down: ' + !!g.mouse?.down,
      'keys: W' + (k.KeyW?'1':'0') + ' A' + (k.KeyA?'1':'0') +
        ' S' + (k.KeyS?'1':'0') + ' D' + (k.KeyD?'1':'0') +
        ' Sp' + (k.Space?'1':'0'),
      'yaw: ' + (g.yaw?.toFixed(2) ?? '?'),
      'ammo: ' + (window as any).playerStats?.ammo ?? '?',
      'p.cool: ' + (window as any).playerStats?.fireCooldown?.toFixed(2) ?? '?',
    ].join('\n');
  }, 200);
}
// Auto-install on native (mobile) for this debug session; remove for release.
if (isNative) installDebugOverlay();

// Reveal the splash screen → menu transition. We wait one rAF (or 1.5s as
// fallback) so the user sees the "NanaGames" logo and a brief loading bar
// before the menu fades in. The CSS in index.html handles the 2s opacity
// transition; we just need to flip body.ready.
function revealAfterBoot(): void {
  const el = document.getElementById('splashScreen');
  // Ensure the splash is at least visible for 1.2s (feels intentional, not
  // a flash). If rAF fires earlier we still wait the minimum.
  const MIN_VISIBLE_MS = 1200;
  const t0 = performance.now();
  const flip = (): void => {
    const elapsed = performance.now() - t0;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      document.body.classList.add('ready');
      // Remove from DOM after the 2s CSS fade completes, so it doesn't
      // intercept future taps or paint cycles.
      setTimeout(() => el?.remove(), 2200);
    }, wait);
  };
  // Two rAFs is the standard "first frame rendered" idiom, but we already
  // gate by MIN_VISIBLE_MS above so a single rAF is enough.
  requestAnimationFrame(flip);
}
revealAfterBoot();
