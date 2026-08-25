// Neon Survivor - Visual bridge.
// Mirrors Entity transforms onto the Three meshes after the ECS step.

import type { Group } from 'three';
import { Components as Core } from '@nanagames/engine/core/Component';
import { NS } from './components';
import type { GameState } from './state';

const MAX_PARTICLES = 200;

export function syncEntityTransforms(state: GameState): void {
  for (const e of state.enemies) {
    if (!e.entity || e.hp <= 0) continue;
    const tr = e.entity.get<{ position: { x: number; y: number; z: number }; rotation: { y: number } }>(Core.Transform);
    const tag = e.entity.get<{ mesh: Group }>(NS.EnemyTag);
    if (!tr || !tag) continue;
    tag.mesh.position.set(tr.position.x, tr.position.y, tr.position.z);
    tag.mesh.rotation.y = tr.rotation.y;
  }
  for (const b of state.bullets) {
    if (!b.entity) continue;
    const tr = b.entity.get<{ position: { x: number; y: number; z: number } }>(Core.Transform);
    const mesh = b.entity.get<{ object: Group }>(Core.Mesh);
    if (!tr || !mesh) continue;
    const obj = mesh.object as Group;
    obj.position.set(tr.position.x, tr.position.y, tr.position.z);
  }
  // sync player mesh rotation from Transform.y
  if (state.player) {
    const ptr = state.player.get<{ rotation: { y: number } }>(Core.Transform);
    // mesh rotation is set in main.updateCamera alongside yaw.
    void ptr;
  }

  // Cap particle count: evict oldest entries and dispose their Three.js meshes
  if (state.particles.length > MAX_PARTICLES) {
    const excess = state.particles.splice(0, state.particles.length - MAX_PARTICLES);
    for (const p of excess) {
      if (!p.entity) continue;
      const mesh = p.entity.get<{ object: unknown }>(Core.Mesh);
      if (!mesh) continue;
      const obj = mesh.object as { geometry?: { dispose?: () => void }; material?: { dispose?: () => void } };
      obj.geometry?.dispose?.();
      obj.material?.dispose?.();
    }
  }
}
