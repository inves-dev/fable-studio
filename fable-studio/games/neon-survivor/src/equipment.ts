// Neon Survivor - Weapon swap bridge.
// Keeps the current weapon mesh attached to the player's gunGroup.

import type { Group } from 'three';

import { getWeapon } from './config';
import type { GameState } from './state';
import { buildWeaponMesh } from './scene/WeaponBuilder';

export function equipWeapon(
  slot: number,
  state: GameState,
  gunGroup: Group,
  setCurrent: (mesh: Group | null) => void,
  getCurrent: () => Group | null,
): void {
  const w = getWeapon(slot);
  if (!w) return;
  const p = state.playerData;
  p.currentWeapon = slot;
  p.weaponId = w.id;
  p.maxAmmo = w.maxAmmo;
  p.ammo = w.maxAmmo;
  p.fireRate = w.fireRate;
  p.baseDamage = w.damage;
  p.reloadTime = w.reloadTime;
  p.pellets = w.pellets;
  p.spread = w.spread;
  p.weaponPierce = w.pierce ?? 0;
  p.weaponExplosive = !!w.explosive;
  p.weaponFireDoT = !!w.fireDoT;

  const prev = getCurrent();
  if (prev) gunGroup.remove(prev);
  const builderIdx = slot === 1 ? 1 : slot === 2 ? 0 : 2;
  const mesh = buildWeaponMesh(builderIdx);
  gunGroup.add(mesh);
  setCurrent(mesh);
}
