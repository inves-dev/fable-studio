// Neon Survivor - launcher entry.
// Hosts `start(host)` consumed by the launcher router.

import { startNeonSurvivor, NeonSurvivorGame } from './main';

export { startNeonSurvivor, NeonSurvivorGame };

export function start(host: HTMLElement): void {
  host.innerHTML = '';
  host.style.position = 'absolute';
  host.style.inset = '0';
  startNeonSurvivor(host);
}
