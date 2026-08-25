import type { ComponentKey } from "./Component";

/**
 * Entity = integer id + sparse set of components keyed by symbol.
 * Components are stored as `unknown` to keep the core generic; consumers narrow.
 */
export class Entity {
  public readonly id: number;
  private readonly components: Map<symbol, unknown>;

  constructor(id: number) {
    this.id = id;
    this.components = new Map();
  }

  /** Attach or replace a component by symbol key. */
  set<T>(key: ComponentKey, value: T): this {
    this.components.set(key, value as unknown);
    return this;
  }

  /** Read a component. Returns `undefined` if absent; narrow at call site. */
  get<T>(key: ComponentKey): T | undefined {
    return this.components.get(key) as T | undefined;
  }

  /** True iff this entity currently holds the given component. */
  has(key: ComponentKey): boolean {
    return this.components.has(key);
  }

  /** Remove a component. Returns true if it existed. */
  remove(key: ComponentKey): boolean {
    return this.components.delete(key);
  }

  /** Snapshot of all component keys currently on this entity. */
  keys(): symbol[] {
    return Array.from(this.components.keys());
  }
}