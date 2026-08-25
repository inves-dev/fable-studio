/**
 * Component tag symbols. Use `Components.Transform` etc. as Map keys on an Entity.
 * Symbols guarantee uniqueness across modules without runtime cost.
 */
export const Components = {
  Transform: Symbol("Transform"),
  Velocity: Symbol("Velocity"),
  Health: Symbol("Health"),
  Mesh: Symbol("Mesh"),
  Collider: Symbol("Collider"),
  Weapon: Symbol("Weapon"),
  PlayerTag: Symbol("PlayerTag"),
  EnemyTag: Symbol("EnemyTag"),
  Bullet: Symbol("Bullet"),
  Lifetime: Symbol("Lifetime"),
} as const;

export type ComponentKey = (typeof Components)[keyof typeof Components];

/** Marker for any component payload. The world stores `unknown`; consumers narrow. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ComponentData {}

/** Concrete component payload shapes. Strongly typed. */
export interface TransformData extends ComponentData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface VelocityData extends ComponentData {
  x: number;
  y: number;
  z: number;
}

export interface HealthData extends ComponentData {
  current: number;
  max: number;
}

export interface MeshData extends ComponentData {
  // Opaque handle to a Three.Object3D created by MeshSystem.
  object: unknown;
}

export interface ColliderData extends ComponentData {
  radius: number;
}

export interface WeaponData extends ComponentData {
  damage: number;
  cooldown: number;
  lastFired: number;
}

export interface LifetimeData extends ComponentData {
  remaining: number;
}

export interface BulletData extends ComponentData {
  damage: number;
}