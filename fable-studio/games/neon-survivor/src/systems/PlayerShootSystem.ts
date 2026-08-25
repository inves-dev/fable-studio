// Neon Survivor - Player shooting + reload.
// fire() spawns bullets into the World using the camera yaw + weapon spread.

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { Components as Core } from '@nanagames/engine/core/Component';
import { NS } from '../components';
import { getWeapon } from '../config';
import type { BulletRuntime, GameState } from '../state';

const RELOAD_SOUND = 'reload';

export type FireHandler = () => void;
export type ReloadCompleteHandler = () => void;

export class PlayerShootSystem implements System {
  public readonly signature: readonly symbol[] = [];
  public readonly priority = 20;

  private onFire: FireHandler | null = null;
  private onReloadComplete: ReloadCompleteHandler | null = null;

  constructor(private state: GameState, private world: World) {}

  setOnFire(handler: FireHandler): void { this.onFire = handler; }
  setOnReloadComplete(handler: ReloadCompleteHandler): void { this.onReloadComplete = handler; }

  update(_world: World, dt: number): void {
    const { playerData } = this.state;
    if (playerData.fireCooldown > 0) playerData.fireCooldown -= dt;
    if (playerData.reloading) {
      playerData.reloadT -= dt;
      if (playerData.reloadT <= 0) {
        playerData.reloading = false;
        playerData.ammo = playerData.maxAmmo;
        this.onReloadComplete?.();
      }
    }
  }

  /** Returns true if a shot was fired (so caller can play sfx). */
  fire(): boolean {
    const { playerData } = this.state;
    const weapon = getWeapon(playerData.currentWeapon);
    if (!weapon) return false;
    if (playerData.reloading) return false;
    if (playerData.ammo <= 0) return false;
    const effFireRate = weapon.fireRate * playerData.fireRateMul;
    if (playerData.fireCooldown > 0) return false;

    playerData.ammo -= 1;
    playerData.fireCooldown = effFireRate;

    const pellets = weapon.pellets + (playerData.multishot || 0);
    for (let i = 0; i < pellets; i++) {
      const spreadJitter = (Math.random() - 0.5) * weapon.spread * 2;
      const yaw = this.state.yaw + spreadJitter;
      const dx = Math.sin(yaw);
      const dz = Math.cos(yaw);
      this.spawnBullet({
        x: dx, z: dz,
      }, weapon.damage);
    }
    this.onFire?.();
    return true;
  }

  startReload(): void {
    const { playerData } = this.state;
    const weapon = getWeapon(playerData.currentWeapon);
    if (!weapon) return;
    if (playerData.reloading) return;
    if (playerData.ammo >= playerData.maxAmmo) return;
    playerData.reloading = true;
    playerData.reloadT = weapon.reloadTime * playerData.reloadMul;
  }

  private spawnBullet(dir: { x: number; z: number }, damage: number): void {
    const { player } = this.state;
    if (!player) return;
    const tr = player.get<{ position: { x: number; y: number; z: number } }>(Core.Transform);
    if (!tr) return;
    const origin = { x: tr.position.x, y: 0.9, z: tr.position.z };
    const speed = 70;
    const velocity = { x: dir.x * speed, y: 0, z: dir.z * speed };
    const entity = this.world.spawnBullet(origin, velocity, damage, 2.0);
    const runtime: BulletRuntime = {
      entity,
      damage,
      pierce: this.state.playerData.pierce + (this.state.playerData.weaponPierce ?? 0),
      bounces: this.state.playerData.bounce,
      life: 2.0,
      explosive: this.state.playerData.weaponExplosive || this.state.playerData.explosive,
      fireDoT: this.state.playerData.weaponFireDoT || this.state.playerData.fireDoT,
      speed,
      dir: { x: dir.x, z: dir.z },
      owner: 'player',
    };
    entity.set(NS.BulletTag, { runtime });
    this.state.bullets.push(runtime);
  }
}

export function getReloadSoundId(): string {
  return RELOAD_SOUND;
}
