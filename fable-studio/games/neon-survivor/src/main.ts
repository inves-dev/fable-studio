// Neon Survivor - Game entry point.

import { Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import { createInitialState, type GameState } from './state';
import { applyOverShoulderCamera } from './scene/CameraRig';
import { WaveSystem } from './systems/WaveSystem';
import { CardSystem } from './systems/CardSystem';
import { GameHUD } from './ui/GameHUD';
import { MobileControls } from './ui/MobileControls';
import { restartGame, isTouch } from './lifecycle';
import { syncEntityTransforms } from './visualSync';
import { handleGameOver, flushWaveAnnounce, updateCameraRig } from './gameLoop';
import { runInit } from './gameInit';
import { wireAudio } from './audio';
import { AudioManager } from '@nanagames/engine/audio/AudioManager';
import { setupMobileControls } from './inputWiring';

// ─────────────────────────────────────────────────────────────────────────────

export class NeonSurvivorGame {
  public readonly state: GameState;
  public moveSystem!: import('./systems/PlayerMovementSystem').PlayerMovementSystem;
  public shootSystem!: import('./systems/PlayerShootSystem').PlayerShootSystem;
  public bulletSystem!: import('./systems/BulletSystem').BulletSystem;
  public readonly cardSystem: CardSystem;
  public readonly waveSystem: WaveSystem;

  public renderer!: WebGLRenderer;
  public scene!: Scene;
  public camera!: PerspectiveCamera;
  public world!: import('@nanagames/engine/core/World').World;
  public container!: HTMLElement;
  public playerMesh: Group | null = null;
  public currentWeaponMesh: Group | null = null;
  public gameHUD!: GameHUD;
  public inputManager!: import('./input').InputManager;
  public mobileControls: MobileControls | null = null;
  public clock = { last: 0 };
  public paused = false;
  public readonly isTouch: boolean = isTouch;

  constructor() {
    this.state = createInitialState();
    this.waveSystem = new WaveSystem(this.state);
    this.cardSystem = new CardSystem(this.state);
  }

  init(container: HTMLElement, _restartFn?: () => void): void {
    runInit(this, container);
  }

  start(): void {
    this.clock.last = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }

  selectCard(idx: number): void {
    this.cardSystem.select(idx);
  }

  getState(): GameState {
    return this.state;
  }

  private tick(t: number): void {
    const dt = Math.min(0.1, (t - this.clock.last) / 1000);
    this.clock.last = t;
    this.state.fps = Math.round(1 / Math.max(0.001, dt));

    if (this.state.state === 'playing' && !this.paused) {
      this.world.step(dt);
    }

    this.gameHUD.update(this.state, this);
    handleGameOver(this);
    flushWaveAnnounce(this);

    syncEntityTransforms(this.state);
    if (this.playerMesh) {
      updateCameraRig(this.camera, this.playerMesh, this.state.yaw, this.state.pitch, this.state.keys, applyOverShoulderCamera);
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((tt) => this.tick(tt));
  }

  startGame(): void {
    this.state.state = 'playing';
    this.gameHUD.hideMenu();
    this.gameHUD.hideGameOver();
    this.gameHUD.setLockHintVisible(!window.Capacitor?.isNativePlatform?.());
    if (!window.Capacitor?.isNativePlatform?.()) {
      this.container.requestPointerLock?.();
    }
  }

  restartGame(): void {
    document.exitPointerLock?.();
    this.mobileControls?.dispose();
    this.mobileControls = null;
    this.state.state = 'menu';
    if (this.playerMesh) this.playerMesh.removeFromParent();
    this.currentWeaponMesh = null;
    const result = restartGame(
      this.state,
      this.scene,
      this.waveSystem,
      this.cardSystem,
      (m) => (this.currentWeaponMesh = m),
    );
    this.world = result.bundle.world;
    this.moveSystem = result.bundle.moveSystem;
    this.shootSystem = result.bundle.shootSystem;
    this.bulletSystem = result.bundle.bulletSystem;
    this.playerMesh = result.playerMesh;
    if (this.isTouch && this.container) {
      this.mobileControls = setupMobileControls(this.container, {
        state: this.state,
        shoot: () => this.shootSystem.fire(),
        dash: () => this.moveSystem.tryDash(),
        reload: () => this.shootSystem.startReload(),
      });
      this.gameHUD.setTouchMode(true);
    }
    this.gameHUD.hideGameOver();
    this.gameHUD.showMenu();
    wireAudio(this, AudioManager);
  }

  onResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}

export function startNeonSurvivor(container: HTMLElement): NeonSurvivorGame {
  const game = new NeonSurvivorGame();
  game.init(container);
  game.start();
  return game;
}
