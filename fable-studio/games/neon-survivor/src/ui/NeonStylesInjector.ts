// Neon Survivor HUD style injector — assembles every CSS block and
// injects them into <head>. Idempotent.

import { NCSS } from './NeonStyles';
import { NCSS_BLOCKS } from './NeonStylePanels';
import { NCSS_BARS } from './NeonStyleBars';
import { NCSS_OVERLAYS } from './NeonStyleOverlays';

let stylesInjected = false;

export function injectStyles(): void {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.setAttribute('data-neon-survivor-hud', 'true');
  style.textContent =
    NCSS.base +
    NCSS.keyframes +
    NCSS.damageFlash +
    NCSS_BLOCKS.overlay +
    NCSS_BLOCKS.crosshair +
    NCSS_BLOCKS.gameOverTitle +
    NCSS_BARS.hudFrame +
    NCSS_BARS.bar +
    NCSS_BARS.scorePanel +
    NCSS_BARS.ammoPanel +
    NCSS_BARS.waveAnnounce +
    NCSS_BARS.lockHint +
    NCSS_BARS.muteAndVolume +
    NCSS_BARS.weaponDisplay +
    NCSS_BARS.cardCountdown +
    NCSS_OVERLAYS.cardScreen +
    NCSS_OVERLAYS.pauseVeil;
  document.head.appendChild(style);
}
