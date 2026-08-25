import { ActionState } from "./ActionState";
import { bindKeyboard } from "./KeyboardSource";
import { bindTouch } from "./TouchSource";
import { VirtualJoystick } from "./VirtualJoystick";

/**
 * InputManager = ActionState + a registry of input sources.
 * App code reads actions each frame; InputManager owns DOM/canvas event wiring.
 */
export class InputManager {
  public readonly actions: ActionState = new ActionState();

  /** Attach WASD/Space/Esc keyboard handlers to `target` (default window). */
  bindKeyboard(target: Window | HTMLElement = window): void {
    bindKeyboard(target, this.actions);
  }

  /** Attach left/right tap handlers for fire/dash to `target`. */
  bindTouch(target: HTMLElement): void {
    bindTouch(target, this.actions);
  }

  /** Spawn a DOM virtual joystick bound to the given action. */
  spawnJoystick(action: string): VirtualJoystick {
    return new VirtualJoystick(action, this.actions);
  }

  /** Flush one-shot edge flags. Call once per frame end. */
  flushFrame(): void {
    this.actions.flush();
  }
}