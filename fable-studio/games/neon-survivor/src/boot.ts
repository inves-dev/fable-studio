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
    const game = (window as unknown as { GAME?: WiredGame }).GAME;
    if (!game || !game.mouse || !game.keys) return false;

    // The original module-scoped fire()/startReload() are not on the global
    // object after bundling — but the rendering loop reads GAME.mouse.down
    // every frame to decide whether to fire. Set that flag instead of trying
    // to call a non-existent GAME.fire().
    setupMobileControls({
      onShootDown: () => { game.mouse.down = true; },
      onShootUp:   () => { game.mouse.down = false; },
      // Dash in the original code consumes GAME.keys['Space'] (one-shot)
      // while the player is moving. Setting it true here is enough — the
      // game loop will clear it on the next tick after triggering.
      onDash:      () => { game.keys['Space'] = true; },
      // Reload is gated by the module-scoped startReload() — the rewrites
      // we apply to the inline source expose it on window, so prefer that
      // if present; otherwise fall back to pressing the R key briefly.
      onReload:    () => {
        const sr = (window as unknown as { startReload?: () => void }).startReload;
        if (typeof sr === 'function') {
          try { sr(); } catch { /* ignore */ }
        } else {
          game.keys['KeyR'] = true;
          setTimeout(() => { game.keys['KeyR'] = false; }, 50);
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
