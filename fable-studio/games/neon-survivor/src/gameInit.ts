// Neon Survivor — NeonSurvivorGame.init() body.
// Extracted from main.ts so the entry file stays under 200 lines.

import { Group } from 'three';

import { wireAudio } from './audio';
import { AudioManager } from '@nanagames/engine/audio/AudioManager';
import { SfxLibrary } from '@nanagames/engine/audio/SfxLibrary';
import { WAVE_CONFIG } from './config';
import { GameHUD } from './ui/GameHUD';
import {
  isTouch,
  setupRendererScene,
  createWorld,
  createPlayer,
} from './lifecycle';
import { setupDesktopInput, setupMobileControls } from './inputWiring';
import type { NeonSurvivorGame } from './main';

export function runInit(game: NeonSurvivorGame, container: HTMLElement): void {
  game.container = container;
  game.state.state = 'menu';
  game.paused = false;

  game.gameHUD?.dispose();
  game.inputManager?.detach();
  game.mobileControls?.dispose();
  game.mobileControls = null;

  if (!game.renderer) {
    const setup = setupRendererScene(container);
    game.renderer = setup.renderer;
    game.scene = setup.scene;
    game.camera = setup.camera;
    window.addEventListener('resize', () => game.onResize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        game.paused = true;
      } else {
        game.paused = false;
        game.clock.last = performance.now();
      }
    });
  }

  // ── Create world + player FIRST so input + HUD can bind to systems. ─────
  const bundle = createWorld(game.state, game.scene, game.waveSystem, game.cardSystem);
  game.world = bundle.world;
  game.moveSystem = bundle.moveSystem;
  game.shootSystem = bundle.shootSystem;
  game.bulletSystem = bundle.bulletSystem;
  game.playerMesh = createPlayer(game.state, game.world, game.scene, (m) => (game.currentWeaponMesh = m), game.currentWeaponMesh);

  // ── Build HUD then wire its handlers into the systems. ──────────────────
  game.gameHUD = new GameHUD(container, game, () => game.restartGame());
  game.gameHUD.update(game.state, game);
  game.gameHUD.onCardPick(() => {
    try { AudioManager.playSfx(SfxLibrary.power); } catch { /* SFX may be locked */ }
  });
  game.cardSystem.setHandlers(
    (cards) => game.gameHUD.showCardSelect(cards, (idx) => game.cardSystem.select(idx)),
    () => game.gameHUD.hideCardSelect(),
  );

  // ── Desktop input (mouse + keyboard). ───────────────────────────────────
  game.inputManager = setupDesktopInput({
    state: game.state,
    playerMesh: game.playerMesh as Group,
    setWeaponMesh: (m) => (game.currentWeaponMesh = m),
    getWeaponMesh: () => game.currentWeaponMesh,
    shoot: () => game.shootSystem.fire(),
    dash: () => game.moveSystem.tryDash(),
    reload: () => game.shootSystem.startReload(),
  });
  game.inputManager.attach();

  // ── Mobile controls (joystick + look pad + shoot/reload/dash). ──────────
  if (isTouch) {
    game.mobileControls = setupMobileControls(container, {
      state: game.state,
      shoot: () => game.shootSystem.fire(),
      dash: () => game.moveSystem.tryDash(),
      reload: () => game.shootSystem.startReload(),
    });
    game.gameHUD.setTouchMode(true);
  }

  game.waveSystem.startWave(1, WAVE_CONFIG.startSize);
  wireAudio(game, AudioManager);
}
