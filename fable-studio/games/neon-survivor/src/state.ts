// Neon Survivor - Top-level game state.
// Central mutable state shared by all systems + the scene bridge.

import type { Entity } from '@nanagames/engine/core/Entity';
import type { Scene } from 'three';
import type { EnemyKind } from './enemies';
import type { GameMode } from './modes';
import type { CardDef } from './cards';
import { createInitialPlayer, type PlayerRuntime } from './playerState';

export type GameStateName = 'menu' | 'playing' | 'paused' | 'gameover' | 'cardselect';

export interface EnemyRuntime {
  entity: Entity | null;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  score: number;
  attackCd: number;
  attackType: string;
  attackRange: number;
  walkT: number;
  attackAnim: number;
  telegraph: number;
  burstShots: number;
  burstTotal: number;
  flyHeight: number;
  isFlying: boolean;
  shieldHp?: number;
  maxShieldHp?: number;
  shieldBroken?: boolean;
  shieldStage?: number;
  perchY?: number;
}

export interface BulletRuntime {
  entity: Entity | null;
  damage: number;
  pierce: number;
  bounces: number;
  life: number;
  explosive: boolean;
  fireDoT: boolean;
  speed: number;
  dir: { x: number; z: number };
  owner: 'player' | 'enemy';
}

export interface PickupRuntime {
  entity: Entity | null;
  kind: 'xp' | 'heal' | 'shield';
  amount: number;
  position: { x: number; y: number; z: number };
  age: number;
}

export interface ParticleRuntime {
  entity: Entity | null;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

export interface CardPick {
  card: CardDef;
  selected: boolean;
}

export interface BuildingRecord {
  entity: Entity;
  position: { x: number; z: number };
  w: number;
  d: number;
  h: number;
}

export interface GameState {
  state: GameStateName;
  arena: { size: number; blocks: number };
  yaw: number;
  pitch: number;
  keys: Record<string, boolean>;
  mouse: { dx: number; dy: number; down: boolean };
  player: Entity | null;
  playerData: PlayerRuntime;
  enemies: EnemyRuntime[];
  bullets: BulletRuntime[];
  pickups: PickupRuntime[];
  particles: ParticleRuntime[];
  buildings: BuildingRecord[];
  // Score / waves
  score: number;
  totalKills: number;
  multiplier: number;
  multTimer: number;
  wave: number;
  waveTimer: number;
  waveEnemiesRemaining: number;
  waveSize: number;
  spawnTimer: number;
  spawnInterval: number;
  // Card system
  lastCardScore: number;
  cardCountdown: number;
  cardCountdownActive: boolean;
  cardLockT: number;
  currentCardPicks: CardPick[];
  cardsApplied: number[];
  // Game mode
  gameMode: GameMode;
  modeTimer: number;
  // Misc runtime
  damageFlashT: number;
  waveAnnounceT: number;
  waveAnnounceText: string;
  fps: number;
  playerPower: number;
  /** @internal Non-reactive; used by lifecycle.ts to pass scene to spawnEnemyRuntime. */
  _scene: Scene | null;
}

export function createInitialState(): GameState {
  return {
    state: 'menu',
    arena: { size: 90, blocks: 7 },
    yaw: 0,
    pitch: 0,
    keys: {},
    mouse: { dx: 0, dy: 0, down: false },
    player: null,
    playerData: createInitialPlayer(),
    enemies: [],
    bullets: [],
    pickups: [],
    particles: [],
    buildings: [],
    score: 0,
    totalKills: 0,
    multiplier: 1.0,
    multTimer: 0,
    wave: 1,
    waveTimer: 0,
    waveEnemiesRemaining: 0,
    waveSize: 4,
    spawnTimer: 1.5,
    spawnInterval: 0.8,
    lastCardScore: 0,
    cardCountdown: 0,
    cardCountdownActive: false,
    cardLockT: 0,
    currentCardPicks: [],
    cardsApplied: [],
    gameMode: 'normal',
    modeTimer: 0,
    damageFlashT: 0,
    waveAnnounceT: 0,
    waveAnnounceText: '',
    fps: 60,
    playerPower: 0,
    _scene: null,
  };
}
