// Neon Survivor - Input adapter.
// Wires keyboard + mouse to GameState + game callbacks (shoot / dash / reload / weapon switch).

import type { GameState } from './state';

export interface InputCallbacks {
  onShoot(down: boolean): void;
  onDash(): void;
  onReload(): void;
  onSwitchWeapon(slot: number): void;
  onMouseMove(dx: number, dy: number): void;
}

export class InputManager {
  private detachers: Array<() => void> = [];

  constructor(private state: GameState, private cb: InputCallbacks) {}

  attach(): void {
    const keys = this.state.keys;
    const onKeyDown = (e: KeyboardEvent): void => {
      keys[e.code] = true;
      if (e.code === 'Space') this.cb.onDash();
      else if (e.code === 'KeyR') this.cb.onReload();
      else if (e.code === 'Digit1') this.cb.onSwitchWeapon(1);
      else if (e.code === 'Digit2') this.cb.onSwitchWeapon(2);
      else if (e.code === 'Digit3') this.cb.onSwitchWeapon(3);
    };
    const onKeyUp = (e: KeyboardEvent): void => { keys[e.code] = false; };
    const onMouseMove = (e: MouseEvent): void => {
      if (document.pointerLockElement) {
        this.cb.onMouseMove(e.movementX || 0, e.movementY || 0);
      }
    };
    const onMouseDown = (e: MouseEvent): void => {
      if (e.button === 0) this.cb.onShoot(true);
    };
    const onMouseUp = (e: MouseEvent): void => {
      if (e.button === 0) this.cb.onShoot(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    this.detachers = [
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('mousemove', onMouseMove),
      () => window.removeEventListener('mousedown', onMouseDown),
      () => window.removeEventListener('mouseup', onMouseUp),
    ];
  }

  detach(): void {
    for (const fn of this.detachers) fn();
    this.detachers = [];
  }
}
