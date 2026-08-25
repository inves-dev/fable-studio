// Neon Survivor - Enemy entity.
// makeEnemy(type, position) returns an EnemyRuntime + its Three mesh.
// Uses the per-kind palette and blueprints (config-driven, matches HTML makeEnemy).

import type { Entity } from '@nanagames/engine/core/Entity';
import { ENEMY_BLUEPRINTS } from '../enemies';
import type { EnemyKind, EnemyBlueprint } from '../enemies';
import type { EnemyRuntime, GameState } from '../state';

export function makeEnemy(
  type: EnemyKind,
  position: { x: number; y: number; z: number },
  state: GameState,
): EnemyRuntime {
  const wave = state.wave;
  const blueprint: EnemyBlueprint = ENEMY_BLUEPRINTS[type];
  const pl = state.playerPower;
  const scaleMul = 1 + pl * 0.02;
  const dmgMul = 1 + pl * 0.015;

  let hp = blueprint.hpBase + wave * blueprint.hpPerWave;
  hp = Math.round(hp * scaleMul);
  const scale = blueprint.scale * (1 + (scaleMul - 1) * 0.5);

  const damage = type === 'bomber' ? 0 : Math.round(blueprint.damageBase * dmgMul);

  const runtime: EnemyRuntime = {
    entity: null as unknown as Entity,
    kind: type,
    hp,
    maxHp: hp,
    speed: blueprint.speed,
    damage,
    score: blueprint.score,
    attackCd: 0,
    walkT: Math.random() * 10,
    attackAnim: 0,
    attackType: blueprint.attackType,
    attackRange: blueprint.attackRange,
    telegraph: 0,
    burstShots: 0,
    burstTotal: 0,
    flyHeight: type === 'drone' ? 4 + Math.random() * 2 : position.y,
    isFlying: type === 'drone',
  };

  if (type === 'shieldbearer') {
    runtime.shieldHp = 60 + wave * 8;
    runtime.maxShieldHp = runtime.shieldHp;
    runtime.shieldBroken = false;
    runtime.shieldStage = 0;
  }
  if (type === 'sentinel') runtime.perchY = position.y;

  void scale;
  return runtime;
}
