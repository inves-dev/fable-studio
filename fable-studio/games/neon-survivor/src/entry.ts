// Neon Survivor — entry point carregado pelo index.html.
// Inicializa o jogo quando o DOM estiver pronto.

import { startNeonSurvivor } from './main';

function boot(): void {
  const host = document.getElementById('game');
  if (!host) {
    console.error('[Neon Survivor] #game element not found');
    return;
  }
  // Garante tamanho cheio mesmo se CSS não pegou
  host.style.position = 'absolute';
  host.style.inset = '0';
  host.style.width = '100%';
  host.style.height = '100%';

  try {
    startNeonSurvivor(host);
    console.log('[Neon Survivor] game started');
  } catch (err) {
    console.error('[Neon Survivor] failed to start:', err);
    host.innerHTML = `<pre style="color:#ff5577;padding:24px;font:14px ui-monospace,monospace;white-space:pre-wrap;">Failed to start game:\n\n${String(err)}\n\n${err instanceof Error ? err.stack : ''}</pre>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Expor pra debug no console
declare global {
  interface Window {
    __neon?: unknown;
  }
}
import { NeonSurvivorGame } from './main';
window.__neon = { startNeonSurvivor, NeonSurvivorGame };