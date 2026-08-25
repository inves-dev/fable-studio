import type { World } from "./World";

/**
 * A System runs each `step(dt)` and reads/writes entities through the World.
 * `signature` declares which components an entity must have to be visited.
 * `priority` orders execution; lower runs first. Default 0.
 */
export abstract class System {
  /** Required component keys; world filters entities using this set. */
  public abstract readonly signature: readonly symbol[];

  /** Lower runs earlier in the frame. Default 0. */
  public readonly priority: number;

  constructor(priority = 0) {
    this.priority = priority;
  }

  /** Called every fixed/variable step. */
  public abstract update(world: World, dt: number): void;
}