// Neon Survivor - Enemy spawn bridge.
// Builds an enemy runtime + Three mesh, attaches components, and pushes it onto the scene.

import type { Entity } from '@nanagames/engine/core/Entity';
import { Components as Core } from '@nanagames/engine/core/Component';
import type { Group } from 'three';

import { NS } from './components';
import { makeEnemy } from './entities/Enemy';
import { buildEnemyMesh } from './scene/EnemyBuilder';
import type { EnemyKind } from './enemies';
import type { GameState, EnemyRuntime } from './state';
import type { World } from '@nanagames/engine/core/World';

export interface EnemySpawnArgs {
  type: EnemyKind;
  position: { x: number; y: number; z: number };
}

export function spawnEnemyRuntime(
  args: EnemySpawnArgs,
  state: GameState,
  world: World,
  scene: { add(obj: object): void },
): EnemyRuntime {
  const runtime = makeEnemy(args.type, args.position, state);
  const mesh = buildEnemyMesh(args.type);
  mesh.scale.setScalar(runtime.kind === 'swarm' ? 0.55 : 1.0);
  mesh.position.set(args.position.x, args.position.y, args.position.z);

  const entity = world.spawn();
  entity.set(Core.Transform, {
    position: { x: args.position.x, y: args.position.y, z: args.position.z },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });
  entity.set(Core.Mesh, { object: mesh });
  entity.set(NS.EnemyTag, { runtime, mesh: mesh as unknown as Group });
  scene.add(mesh);

  runtime.entity = entity as Entity;
  state.enemies.push(runtime);
  return runtime;
}
