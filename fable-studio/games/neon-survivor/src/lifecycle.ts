// Neon Survivor — setup & restart helpers.
// Extracted from main.ts to keep it under 200 lines.

import { World } from '@nanagames/engine/core/World';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { PlayerMovementSystem } from './systems/PlayerMovementSystem';
import { PlayerShootSystem } from './systems/PlayerShootSystem';
import { EnemyAISystem } from './systems/EnemyAISystem';
import { BulletSystem } from './systems/BulletSystem';
import { WaveSystem } from './systems/WaveSystem';
import { CardSystem } from './systems/CardSystem';
import { spawnEnemyRuntime } from './spawn';
import { buildPlayerMesh, attachPlayerComponents } from './entities/Player';
import { equipWeapon } from './equipment';
import { WAVE_CONFIG } from './config';
import { COLORS } from './modes';
import { buildCity } from './scene/CityBuilder';
import { buildSky } from './scene/SkyBuilder';
import type { GameState } from './state';
import type { Group } from 'three';

declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
  }
}

export const isTouch: boolean =
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (window.Capacitor?.isNativePlatform?.() === true);

export function setupRendererScene(
  container: HTMLElement,
): { renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera } {
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(new Color(COLORS.fogNight), 1);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  scene.fog = new Fog(COLORS.fogNight, 30, 130);
  scene.add(new AmbientLight(0x222244, 0.65));
  const d1 = new DirectionalLight(0xff66e0, 0.55);
  d1.position.set(20, 30, 10);
  scene.add(d1);
  const d2 = new DirectionalLight(0x00e0ff, 0.45);
  d2.position.set(-20, 25, -10);
  scene.add(d2);
  buildSky(scene);
  buildCity(scene);

  const camera = new PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.1, 400);
  camera.position.set(0, 2.2, 4);
  camera.lookAt(0, 1, 0);

  return { renderer, scene, camera };
}

export interface WorldBundle {
  world: World;
  moveSystem: PlayerMovementSystem;
  shootSystem: PlayerShootSystem;
  bulletSystem: BulletSystem;
}

export function createWorld(
  state: GameState,
  scene: Scene,
  waveSystem: WaveSystem,
  cardSystem: CardSystem,
): WorldBundle {
  const world = new World();
  const moveSystem = new PlayerMovementSystem(state);
  const shootSystem = new PlayerShootSystem(state, world);
  const bulletSystem = new BulletSystem(state, world);
  world.register(moveSystem);
  world.register(shootSystem);
  world.register(new EnemyAISystem(state));
  world.register(bulletSystem);
  world.register(waveSystem);
  world.register(cardSystem);

  waveSystem.setSpawnHandler((req) => {
    spawnEnemyRuntime(req, state, world, scene);
  });

  return { world, moveSystem, shootSystem, bulletSystem };
}

export function createPlayer(
  state: GameState,
  world: World,
  scene: Scene,
  setCurrentWeaponMesh: (m: Group | null) => void,
  currentWeaponMesh: Group | null,
): Group {
  const mesh = buildPlayerMesh();
  const entity = world.spawn();
  attachPlayerComponents(entity, mesh);
  scene.add(mesh);
  state.player = entity;
  const gunGroup = mesh.userData['gunGroup'] as Group;
  equipWeapon(1, state, gunGroup, setCurrentWeaponMesh, () => currentWeaponMesh);
  return mesh;
}

export function restartGame(
  state: GameState,
  scene: Scene,
  waveSystem: WaveSystem,
  cardSystem: CardSystem,
  setCurrentWeaponMesh: (m: Group | null) => void,
): { bundle: WorldBundle; playerMesh: Group } {
  const bundle = createWorld(state, scene, waveSystem, cardSystem);
  const playerMesh = createPlayer(state, bundle.world, scene, setCurrentWeaponMesh, null);
  waveSystem.startWave(1, WAVE_CONFIG.startSize);
  return { bundle, playerMesh };
}
