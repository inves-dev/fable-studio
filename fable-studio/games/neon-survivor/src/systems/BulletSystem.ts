// Neon Survivor - Bullet system.
// Advances bullets (player + enemy), detects hits, applies damage, expires.

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { Components as Core } from '@nanagames/engine/core/Component';
import type { GameState } from '../state';
import type { EnemyRuntime } from '../state';

const MAX_BULLETS = 100;

export type HitHandler = () => void;
export type KillHandler = (kind: EnemyRuntime['kind']) => void;

export class BulletSystem implements System {
  public readonly signature: readonly symbol[] = [];
  public readonly priority = 40;

  private onHit: HitHandler | null = null;
  private onKill: KillHandler | null = null;

  constructor(private state: GameState, private world: World) {}

  setOnHit(handler: HitHandler): void { this.onHit = handler; }
  setOnKill(handler: KillHandler): void { this.onKill = handler; }

  update(_world: World, dt: number): void {
    const { player, bullets, enemies } = this.state;
    const playerTr = player?.get<{ position: { x: number; y: number; z: number } }>(Core.Transform);

    const survivors: typeof bullets = [];
    for (const b of bullets) {
      b.life -= dt;
      if (b.life <= 0) continue;

      if (!b.entity) {
        // pure data bullet (enemy projectile); just advance position
        if (playerTr) {
          const dx = playerTr.position.x;
          const dz = playerTr.position.z;
          const d = Math.hypot(dx, dz);
          if (d < 0.8) {
            const dmg = Math.round(b.damage * (1 - this.state.playerData.damageReduction));
            this.state.playerData.hp = Math.max(0, this.state.playerData.hp - dmg);
            this.state.damageFlashT = 0.2;
            continue;
          }
        }
        continue;
      }

      const tr = b.entity.get<{ position: { x: number; y: number; z: number } }>(Core.Transform);
      const vel = b.entity.get<{ x: number; y: number; z: number }>(Core.Velocity);
      if (!tr || !vel) continue;
      tr.position.x += vel.x * dt;
      tr.position.y += vel.y * dt;
      tr.position.z += vel.z * dt;

      // hit detection against enemies (player-owned bullets only)
      if (b.owner === 'player') {
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          const etr = e.entity?.get<{ position: { x: number; y: number; z: number } }>(Core.Transform);
          if (!etr) continue;
          const r = 0.7 + e.kind === 'swarm' ? -0.1 : 0; // simple radius
          const dx = tr.position.x - etr.position.x;
          const dz = tr.position.z - etr.position.z;
          const dist2 = dx * dx + dz * dz;
          if (dist2 < r * r) {
            const killed = this.damageEnemy(e, b.damage);
            this.onHit?.();
            if (killed) this.onKill?.(e.kind);
            if (b.pierce > 0) {
              b.pierce -= 1;
              if (killed) break;
              continue;
            }
            // expired bullet
            this.world.destroy(b.entity.id);
            break;
          }
        }
      }

      // arena clamp — bullets expire on edge
      if (Math.abs(tr.position.x) > 50 || Math.abs(tr.position.z) > 50) {
        this.world.destroy(b.entity.id);
        continue;
      }

      survivors.push(b);
    }

    // Cap bullet count: evict oldest entries and dispose their Three.js meshes
    if (survivors.length > MAX_BULLETS) {
      const excess = survivors.splice(0, survivors.length - MAX_BULLETS);
      for (const b of excess) {
        if (!b.entity) continue;
        const mesh = b.entity.get<{ object: unknown }>(Core.Mesh);
        if (!mesh) continue;
        const obj = mesh.object as { geometry?: { dispose?: () => void }; material?: { dispose?: () => void } };
        obj.geometry?.dispose?.();
        obj.material?.dispose?.();
        this.world.destroy(b.entity.id);
      }
    }

    this.state.bullets = survivors;
  }

  private damageEnemy(e: EnemyRuntime, dmg: number): boolean {
    const { playerData } = this.state;
    let final = dmg * playerData.damageMul;
    if (playerData.chaosDamage) final *= 0.5 + Math.random() * 2.5;
    if (playerData.frenzy) final *= 1 + playerData.frenzyKills * 0.05;
    if (playerData.executeThreshold && e.hp / e.maxHp < playerData.executeThreshold) final = e.hp;
    if (e.kind === 'boss') final *= playerData.bossDamageMul;
    e.hp = Math.max(0, e.hp - final);
    return e.hp <= 0;
  }
}
