// Neon Survivor - Component tags.
// Re-uses the core Components enum and adds game-specific payload symbols.

import { Components as Core } from '@nanagames/engine/core/Component';

export const NS = {
  // tag the local player entity so systems can pick it out cheaply.
  PlayerTag: Symbol('NS.PlayerTag'),
  EnemyTag: Symbol('NS.EnemyTag'),
  BulletTag: Symbol('NS.BulletTag'),
  PickupTag: Symbol('NS.PickupTag'),
  ParticleTag: Symbol('NS.ParticleTag'),
  // attack state for enemies
  EnemyAI: Symbol('NS.EnemyAI'),
  WeaponState: Symbol('NS.WeaponState'),
  // entity → typed user data for systems to read without re-walking world
  Runtime: Symbol('NS.Runtime'),
} as const;

// Re-export core for systems to import everything from one place.
export const CoreComponents = Core;
