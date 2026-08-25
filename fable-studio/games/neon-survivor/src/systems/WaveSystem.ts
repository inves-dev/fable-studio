// Neon Survivor - Wave manager.
// Pure logic: decides when to spawn, computes next wave size, schedules boss waves.
// The actual entity + mesh creation lives in main.ts (it owns the scene + world).

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { WAVE_CONFIG } from '../config';
import { pickEnemyType } from '../enemies';
import type { EnemyKind } from '../enemies';
import type { GameState } from '../state';

export interface SpawnRequest {
  type: EnemyKind;
  position: { x: number; y: number; z: number };
}

export type SpawnHandler = (req: SpawnRequest) => void;

export class WaveSystem implements System {
  public readonly signature: readonly symbol[] = [];
  public readonly priority = 50;

  private onSpawn: SpawnHandler | null = null;

  constructor(private state: GameState) {}

  setSpawnHandler(handler: SpawnHandler): void {
    this.onSpawn = handler;
  }

  update(_world: World, dt: number): void {
    const s = this.state;
    s.waveTimer += dt;
    s.spawnTimer -= dt;

    if (s.waveEnemiesRemaining > 0 && s.spawnTimer <= 0) {
      this.requestSpawn();
      s.spawnTimer = s.spawnInterval;
      s.waveEnemiesRemaining -= 1;
    }

    const liveCount = s.enemies.filter((e) => e.hp > 0).length;
    if (s.waveEnemiesRemaining <= 0 && liveCount === 0) {
      this.nextWave();
    }

    if (s.modeTimer > 0) {
      s.modeTimer -= dt;
      if (s.modeTimer <= 0) {
        s.gameMode = 'normal';
        s.modeTimer = 0;
      }
    } else if (s.wave > 1 && s.wave % 3 === 1 && s.gameMode === 'normal' && s.waveTimer > 30) {
      const modes: Array<import('../modes').GameMode> = ['dark', 'frenzy', 'siege'];
      s.gameMode = modes[(s.wave - 1) % modes.length];
      s.modeTimer = 25;
      s.waveAnnounceT = 2;
      s.waveAnnounceText = s.gameMode.toUpperCase();
    }
  }

  startWave(waveNumber: number, size: number): void {
    this.state.wave = waveNumber;
    this.state.waveSize = size;
    this.state.waveEnemiesRemaining = size;
    this.state.spawnTimer = 1.5;
    this.state.waveTimer = 0;
    this.state.waveAnnounceT = 2;
    this.state.waveAnnounceText = waveNumber % WAVE_CONFIG.bossEvery === 0
      ? `BOSS WAVE ${waveNumber}`
      : `WAVE ${waveNumber}`;
  }

  private requestSpawn(): void {
    if (!this.onSpawn) return;
    const s = this.state;
    const type = pickEnemyType(s.wave);
    const half = s.arena.size * 0.5 - 4;
    const angle = Math.random() * Math.PI * 2;
    const r = 14 + Math.random() * 8;
    const playerPos = s.player
      ? (s.player.get<{ position: { x: number; y: number; z: number } }>(Symbol.for('Transform'))?.position ?? { x: 0, y: 0, z: 0 })
      : { x: 0, y: 0, z: 0 };
    const pos = {
      x: Math.max(-half, Math.min(half, playerPos.x + Math.cos(angle) * r)),
      y: 0,
      z: Math.max(-half, Math.min(half, playerPos.z + Math.sin(angle) * r)),
    };
    this.onSpawn({ type, position: pos });
  }

  private nextWave(): void {
    const s = this.state;
    const nextWave = s.wave + 1;
    let nextSize = WAVE_CONFIG.startSize + (nextWave - 1) * WAVE_CONFIG.perWaveAdd;
    if (nextWave % 3 === 0) nextSize = Math.round(nextSize * 1.5);
    this.startWave(nextWave, nextSize);
  }
}
