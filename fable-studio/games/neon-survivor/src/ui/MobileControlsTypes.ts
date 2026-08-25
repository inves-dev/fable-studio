/**
 * Shared TypeScript interfaces for MobileControls.
 * Exported so main.ts can import MobileControlsCallbacks without importing
 * the full MobileControls class.
 */

export interface MobileControlsCallbacks {
  /** Movement vector, each axis in -1..1. +y = up (screen-up). */
  onMove(x: number, y: number): void;
  /** Look delta in pixels since the last touch event. */
  onLook(dx: number, dy: number): void;
  /** Shoot: true while held, false on release. */
  onShoot(down: boolean): void;
  /** Dash: fired on tap. */
  onDash(): void;
  /** Reload: fired on tap. */
  onReload(): void;
}

export interface JoystickElements {
  base: HTMLDivElement;
  knob: HTMLDivElement;
  radius: number;
}

export interface LookAreaElements {
  root: HTMLDivElement;
}
