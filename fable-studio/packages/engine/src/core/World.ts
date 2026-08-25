import { Entity } from "./Entity";
import type { System } from "./System";
import { Components, type VelocityData } from "./Component";

/** Generic event payload for `world.on / world.emit`. */
export type EventMap = Record<string, unknown>;

type EventName = string;
type Listener<T = unknown> = (payload: T) => void;

/**
 * World = entity pool + system registry + event bus.
 * Pure data; no Three.js or DOM coupling lives here.
 */
export class World {
  private readonly entities: Map<number, Entity> = new Map();
  private readonly systems: System[] = [];
  private nextId = 1;
  private readonly listeners: Map<EventName, Set<Listener>> = new Map();
  private readonly pendingDestroy: Set<number> = new Set();

  /** Allocate a new Entity. Caller assigns components. */
  spawn(): Entity {
    const e = new Entity(this.nextId++);
    this.entities.set(e.id, e);
    return e;
  }

  /** Convenience: spawn a bullet at `origin` with `velocity`. */
  spawnBullet(
    origin: { x: number; y: number; z: number },
    velocity: { x: number; y: number; z: number },
    damage = 10,
    lifetime = 2,
  ): Entity {
    const e = this.spawn();
    e.set(Components.Transform, {
      position: { ...origin },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    });
    const vel: VelocityData = { ...velocity };
    e.set(Components.Velocity, vel);
    e.set(Components.Bullet, { damage });
    e.set(Components.Lifetime, { remaining: lifetime });
    return e;
  }

  /** Mark an entity for removal; flushed at end of step. */
  destroy(id: number): void {
    this.pendingDestroy.add(id);
  }

  /** Look up an entity by id. */
  get(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  /** Count of live entities. */
  count(): number {
    return this.entities.size;
  }

  /** Iterate entities that have ALL of the given component keys. */
  query(keys: readonly symbol[]): Entity[] {
    const out: Entity[] = [];
    for (const e of this.entities.values()) {
      let ok = true;
      for (const k of keys) {
        if (!e.has(k)) {
          ok = false;
          break;
        }
      }
      if (ok) out.push(e);
    }
    return out;
  }

  /** Register a system. Sorted by priority on step. */
  register(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  /** Advance the world by `dt` seconds. */
  step(dt: number): void {
    for (const sys of this.systems) {
      sys.update(this, dt);
    }
    this.flushDestroy();
  }

  private flushDestroy(): void {
    if (this.pendingDestroy.size === 0) return;
    for (const id of this.pendingDestroy) {
      this.entities.delete(id);
    }
    this.pendingDestroy.clear();
  }

  /** Subscribe to a named event. Returns an unsubscribe function. */
  on<T = unknown>(name: EventName, fn: Listener<T>): () => void {
    let set = this.listeners.get(name);
    if (!set) {
      set = new Set();
      this.listeners.set(name, set);
    }
    set.add(fn as Listener);
    return () => set!.delete(fn as Listener);
  }

  /** Emit a typed event payload synchronously to all subscribers. */
  emit<T = unknown>(name: EventName, payload: T): void {
    const set = this.listeners.get(name);
    if (!set) return;
    for (const fn of set) {
      (fn as Listener<T>)(payload);
    }
  }
}