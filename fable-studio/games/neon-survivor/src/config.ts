// Neon Survivor - Game configuration.
// Weapon / enemy / card / mode tables migrated from the original HTML prototype.

export const ARENA = {
  size: 90,
  blocks: 7,
} as const;

export const PLAYER_DEFAULTS = {
  maxHp: 100,
  maxShield: 50,
  moveSpeed: 6.5,
  sprintMul: 1.55,
  dashSpeed: 28,
  dashDuration: 0.18,
  dashCdBase: 1.4,
  pickupRadius: 2.5,
} as const;

export const WAVE_CONFIG = {
  startSize: 4,
  perWaveAdd: 2,
  spawnInterval: 0.8,
  bossEvery: 5,
} as const;

export const SCORE = {
  perKillBase: 10,
  cardEvery: 1000,
  cardCountdownSec: 3,
} as const;

export const RARITY_WEIGHTS = {
  common: 50,
  rare: 25,
  epic: 10,
  legendary: 4,
  cursed: 8,
} as const;

// ----- Weapons (1-indexed slot 0 is reserved) -----
export type WeaponKind =
  | 'rifle'
  | 'pistol'
  | 'shotgun'
  | 'bazooka'
  | 'minigun'
  | 'laser'
  | 'railgun'
  | 'flamethrower'
  | 'plasma';

export interface WeaponDef {
  id: WeaponKind;
  name: string;
  icon: string;
  maxAmmo: number;
  fireRate: number;
  damage: number;
  reloadTime: number;
  spread: number;
  autoFire: boolean;
  pellets: number;
  sound: string;
  reloadSound: string;
  desc: string;
  pierce?: number;
  explosive?: boolean;
  fireDoT?: boolean;
}

export const WEAPONS: (WeaponDef | null)[] = [
  null,
  { id: 'rifle', name: 'RIFLE', icon: '🔫', maxAmmo: 30, fireRate: 0.09, damage: 14, reloadTime: 2.0, spread: 0.02, autoFire: true, pellets: 1, sound: 'shoot_rifle', reloadSound: 'reload_rifle', desc: 'Automática. 30 tiros, dano 14.' },
  { id: 'pistol', name: 'PISTOLA', icon: '🔫', maxAmmo: 12, fireRate: 0.20, damage: 22, reloadTime: 1.4, spread: 0, autoFire: false, pellets: 1, sound: 'shoot_pistol', reloadSound: 'reload_pistol', desc: 'Semi-automática. 12 tiros, dano 22.' },
  { id: 'shotgun', name: 'SHOTGUN', icon: '💥', maxAmmo: 6, fireRate: 0.55, damage: 9, reloadTime: 2.4, spread: 0.15, autoFire: false, pellets: 7, sound: 'shoot_shotgun', reloadSound: 'reload_shotgun', desc: '7 projéteis. 6 tiros, dano 9 cada.' },
  { id: 'bazooka', name: 'BAZOOKA', icon: '🚀', maxAmmo: 1, fireRate: 1.0, damage: 80, reloadTime: 2.5, spread: 0.03, autoFire: false, pellets: 1, sound: 'shoot_bazooka', reloadSound: 'reload_bazooka', desc: 'Explosiva. 1 tiro, dano 80, AOE.', explosive: true },
  { id: 'minigun', name: 'MINIGUN', icon: '🔫', maxAmmo: 100, fireRate: 0.05, damage: 8, reloadTime: 4.0, spread: 0.06, autoFire: true, pellets: 1, sound: 'shoot_minigun', reloadSound: 'reload_minigun', desc: 'Rajada absurda. 100 tiros, dano 8.' },
  { id: 'laser', name: 'LASER', icon: '⚡', maxAmmo: 999, fireRate: 0.04, damage: 6, reloadTime: 0.3, spread: 0, autoFire: true, pellets: 1, sound: 'shoot_laser', reloadSound: 'reload_laser', desc: 'Raio contínuo. 999 tiros, dano 6.', pierce: 999 },
  { id: 'railgun', name: 'RAILGUN', icon: '🎯', maxAmmo: 5, fireRate: 0.8, damage: 120, reloadTime: 2.0, spread: 0, autoFire: false, pellets: 1, sound: 'shoot_railgun', reloadSound: 'reload_railgun', desc: 'Atravessa tudo. 5 tiros, dano 120.', pierce: 5 },
  { id: 'flamethrower', name: 'CHAMAS', icon: '🔥', maxAmmo: 50, fireRate: 0.03, damage: 4, reloadTime: 3.0, spread: 0.20, autoFire: true, pellets: 1, sound: 'shoot_flame', reloadSound: 'reload_flame', desc: 'Lança-chamas. 50 tiros, dano 4 contínuo.', fireDoT: true },
  { id: 'plasma', name: 'PLASMA', icon: '⚡', maxAmmo: 40, fireRate: 0.12, damage: 25, reloadTime: 2.2, spread: 0.04, autoFire: true, pellets: 1, sound: 'shoot_plasma', reloadSound: 'reload_plasma', desc: 'Rifle de plasma. 40 tiros, dano 25.', explosive: true },
];

export function getWeapon(idx: number): WeaponDef | null {
  return WEAPONS[idx] ?? null;
}
