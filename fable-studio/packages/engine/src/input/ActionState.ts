/**
 * ActionState tracks per-action boolean state across frames.
 * Use `read` for current held, `wasPressed` for one-frame edge (consumed after).
 */
export class ActionState {
  private readonly held: Map<string, boolean> = new Map();
  private readonly pressed: Set<string> = new Set();

  /** True while the action is held down. */
  read(action: string): boolean {
    return this.held.get(action) ?? false;
  }

  /** True only on the frame the action transitioned to down. */
  wasPressed(action: string): boolean {
    return this.pressed.has(action);
  }

  /** Mark an action as held. Called by input sources. */
  set(action: string, down: boolean): void {
    const prev = this.held.get(action) ?? false;
    this.held.set(action, down);
    if (down && !prev) {
      this.pressed.add(action);
    }
  }

  /** End-of-frame: clear one-shot edge flags. */
  flush(): void {
    this.pressed.clear();
  }
}