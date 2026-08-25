// Neon Survivor - Enemy AI: chase + attack dispatch by attackType.
// Sentinel uses a separate perch-and-sniper tick.

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { Components as Core } from '@nanagames/engine/core/Component';
import type { EnemyRuntime, GameState } from '../state';
import type { PlayerRuntime } from '../playerState';

const MELEE_CD = 1.0;
const RANGED_CD = 1.4;
const BURST_INTERVAL = 0.18;
const AOE_CD = 2.4;

type Tr = { position: { x: number; y: number; z: number }; rotation: { y: number } };

export class EnemyAISystem implements System {
  public readonly signature: readonly symbol[] = [];
  public readonly priority = 30;

  constructor(private state: GameState) {}

  update(_world: World, dt: number): void {
    const { player, enemies } = this.state;
    if (!player) return;
    const pt = player.get<Tr>(Core.Transform);
    if (!pt) return;
    for (const e of enemies) {
      if (!e.entity) continue;
      const tr = e.entity.get<Tr>(Core.Transform);
      if (!tr) continue;
      if (e.kind === 'sentinel') {
        this.tickSentinel(e, tr, dt, pt.position.x, pt.position.z);
      } else {
        this.tickGroundEnemy(e, tr, dt, pt.position.x, pt.position.z);
      }
    }
  }

  private tickGroundEnemy(e: EnemyRuntime, tr: Tr, dt: number, px: number, pz: number): void {
    const dx = px - tr.position.x;
    const dz = pz - tr.position.z;
    const dist = Math.hypot(dx, dz);
    tr.rotation.y = Math.atan2(dx, dz);
    e.walkT += dt;
    if (e.attackCd > 0) e.attackCd -= dt;
    if (e.attackAnim > 0) e.attackAnim -= dt;
    if (e.isFlying) {
      const flyY = e.flyHeight;
      tr.position.y += (flyY - tr.position.y) * Math.min(1, dt * 4);
    }
    switch (e.attackType) {
      case 'melee':   this.tickApproachThenAttack(e, tr, dx, dz, dist, MELEE_CD, 0.18, () => this.damagePlayer(e.damage)); break;
      case 'ranged':  this.tickApproachThenAttack(e, tr, dx, dz, dist, RANGED_CD, 0, () => this.enemyShoot(e, dx, dz, dist)); break;
      case 'aoe':     this.tickApproachThenAttack(e, tr, dx, dz, dist, AOE_CD, 0.30, () => this.damagePlayer(e.damage)); break;
      case 'explode': this.tickExplode(e, tr, dx, dz, dist); break;
      case 'burst':   this.tickBurst(e, tr, dx, dz, dist); break;
      case 'mixed':   this.tickBoss(e, tr, dx, dz, dist); break;
    }
  }

  private tickBoss(e: EnemyRuntime, tr: Tr, dx: number, dz: number, dist: number): void {
    const triggerRange = e.attackRange * 1.4;
    if (dist <= triggerRange && e.attackCd <= 0) {
      this.enemyShoot(e, dx, dz, dist);
      e.attackCd = RANGED_CD;
    } else if (dist > e.attackRange) {
      this.approach(tr, dx, dz, dist, e.speed, 1 / 60);
    }
  }

  private approach(tr: Tr, dx: number, dz: number, dist: number, speed: number, dt: number): void {
    if (dist <= 0.001) return;
    const inv = 1 / dist;
    tr.position.x += dx * inv * speed * dt;
    tr.position.z += dz * inv * speed * dt;
  }

  private tickApproachThenAttack(
    e: EnemyRuntime, tr: Tr, dx: number, dz: number, dist: number,
    cd: number, anim: number, attack: () => void,
  ): void {
    if (dist <= e.attackRange && e.attackCd <= 0) {
      attack();
      e.attackCd = cd;
      e.attackAnim = anim;
    } else if (dist > e.attackRange) {
      this.approach(tr, dx, dz, dist, e.speed, 1 / 60);
    }
  }

  private tickExplode(e: EnemyRuntime, tr: Tr, dx: number, dz: number, dist: number): void {
    if (dist <= e.attackRange && e.attackCd <= 0) {
      this.damagePlayer(40);
      e.attackCd = 99;
      e.hp = 0;
    } else {
      this.approach(tr, dx, dz, dist, e.speed * 1.6, 1 / 60);
    }
  }

  private tickBurst(e: EnemyRuntime, tr: Tr, dx: number, dz: number, dist: number): void {
    if (e.burstShots > 0) {
      e.burstShots -= 1;
      this.enemyShoot(e, dx, dz, dist);
      e.attackCd = BURST_INTERVAL;
    } else if (dist <= e.attackRange && e.attackCd <= 0) {
      e.burstShots = 3;
      e.burstTotal = 3;
      e.attackCd = BURST_INTERVAL;
    } else if (dist > e.attackRange) {
      this.approach(tr, dx, dz, dist, e.speed, 1 / 60);
    }
  }

  private tickSentinel(e: EnemyRuntime, tr: Tr, dt: number, px: number, pz: number): void {
    const dx = px - tr.position.x;
    const dz = pz - tr.position.z;
    const dist = Math.hypot(dx, dz);
    tr.rotation.y = Math.atan2(dx, dz);
    if (e.attackCd > 0) e.attackCd -= dt;
    if (dist <= e.attackRange && e.attackCd <= 0) {
      this.enemyShoot(e, dx, dz, dist);
      e.attackCd = RANGED_CD;
    }
  }

  private damagePlayer(dmg: number): void {
    const pd: PlayerRuntime = this.state.playerData;
    const reduction = 1 - Math.min(0.9, pd.damageReduction);
    let final = Math.max(1, Math.round(dmg * reduction));
    if (pd.sanguePorSangue) final = Math.round(final * 1.5);
    if (pd.shield > 0) {
      const absorbed = Math.min(pd.shield, final);
      pd.shield -= absorbed;
      final -= absorbed;
    }
    pd.hp = Math.max(0, pd.hp - final);
    this.state.damageFlashT = 0.25;
  }

  private enemyShoot(e: { damage: number }, dx: number, dz: number, dist: number): void {
    if (dist < 0.001) return;
    const inv = 1 / dist;
    this.state.bullets.push({
      entity: null,
      damage: e.damage,
      pierce: 0, bounces: 0,
      life: 1.6,
      explosive: false, fireDoT: false,
      speed: 30,
      dir: { x: dx * inv, z: dz * inv },
      owner: 'enemy',
    });
  }
}
