/**
 * MobileControls — DOM overlay providing virtual joystick (move) + look drag zone
 * + 3 action buttons (dash / shoot / reload) for Neon Survivor on touch devices.
 * Detection of touch-capable device is done by the caller (main.ts wires it).
 */

import type { MobileControlsCallbacks } from './MobileControlsTypes';
import {
  BUTTON_STYLES,
  createActionButton,
  createJoystick,
  createLookArea,
  hideOverlay,
  showOverlay,
  Z_INDEX,
} from './MobileControlsStyles';

export class MobileControls {
  private readonly overlay: HTMLDivElement;
  private readonly joystick: ReturnType<typeof createJoystick>;
  private readonly lookArea: ReturnType<typeof createLookArea>;
  private readonly btnDash: HTMLButtonElement;
  private readonly btnShoot: HTMLButtonElement;
  private readonly btnReload: HTMLButtonElement;

  /** Last known look touch position, used to compute delta each frame. */
  private lookPrev: { x: number; y: number } | null = null;

  /** Whether the shoot button is currently held down. */
  private shooting = false;

  constructor(_container: HTMLElement, private readonly cb: MobileControlsCallbacks) {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: ${Z_INDEX};
      touch-action: none;
      user-select: none;
    `;

    // ── Left: movement joystick ────────────────────────────────────────────
    this.joystick = createJoystick();
    this.overlay.appendChild(this.joystick.base);

    // ── Right bottom: look drag zone ──────────────────────────────────────
    this.lookArea = createLookArea();
    this.overlay.appendChild(this.lookArea.root);

    // ── Right middle: action buttons ───────────────────────────────────────
    this.btnDash = createActionButton('DASH', BUTTON_STYLES.dash);
    this.btnShoot = createActionButton('SHOOT', BUTTON_STYLES.shoot);
    this.btnReload = createActionButton('RELOAD', BUTTON_STYLES.reload);

    const stack = document.createElement('div');
    stack.style.cssText = [
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'gap: 14px',
      `right: 36px`,
      `bottom: 200px`,
      'position: fixed',
    ].join(';');
    stack.appendChild(this.btnDash);
    stack.appendChild(this.btnShoot);
    stack.appendChild(this.btnReload);
    this.overlay.appendChild(stack);

    document.body.appendChild(this.overlay);
    this.wire();
  }

  // ── public API ──────────────────────────────────────────────────────────────

  /** Show (or hide) the entire overlay. Call with `false` on non-touch. */
  setEnabled(enabled: boolean): void {
    if (enabled) showOverlay(this.overlay);
    else hideOverlay(this.overlay);
  }

  dispose(): void {
    this.overlay.remove();
  }

  // ── private wiring ──────────────────────────────────────────────────────────

  private wire(): void {
    // ── Joystick: movement ───────────────────────────────────────────────
    const jBase = this.joystick.base;
    const jKnob = this.joystick.knob;
    const jRadius = this.joystick.radius;

    let jActive = false;

    const applyJoystick = (cx: number, cy: number): void => {
      const rect = jBase.getBoundingClientRect();
      const bx = rect.left + jRadius;
      const by = rect.top + jRadius;
      const dx = cx - bx;
      const dy = cy - by;
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, jRadius);
      const angle = Math.atan2(dy, dx);
      const nx = (Math.cos(angle) * clamped) / jRadius;
      // screen-up convention: negate DOM Y
      const ny = -(Math.sin(angle) * clamped) / jRadius;
      jKnob.style.transform = `translate(${nx * jRadius}px, ${ny * jRadius}px)`;
      this.cb.onMove(nx, ny);
    };

    const jTouchStart = (e: TouchEvent): void => {
      e.preventDefault();
      jActive = true;
      const t = e.touches[0];
      if (t) applyJoystick(t.clientX, t.clientY);
    };
    const jTouchMove = (e: TouchEvent): void => {
      if (!jActive) return;
      e.preventDefault();
      const t = e.touches[0];
      if (t) applyJoystick(t.clientX, t.clientY);
    };
    const jTouchEnd = (e: TouchEvent): void => {
      e.preventDefault();
      jActive = false;
      jKnob.style.transform = 'translate(0,0)';
      this.cb.onMove(0, 0);
    };

    jBase.addEventListener('touchstart', jTouchStart, { passive: false });
    jBase.addEventListener('touchmove', jTouchMove, { passive: false });
    jBase.addEventListener('touchend', jTouchEnd, { passive: false });
    jBase.addEventListener('touchcancel', jTouchEnd, { passive: false });

    // ── Look area: drag to look ──────────────────────────────────────────
    const lTouchStart = (e: TouchEvent): void => {
      e.preventDefault();
      const t = e.touches[0];
      if (t) this.lookPrev = { x: t.clientX, y: t.clientY };
    };
    const lTouchMove = (e: TouchEvent): void => {
      e.preventDefault();
      const t = e.touches[0];
      if (!t || !this.lookPrev) return;
      const dx = t.clientX - this.lookPrev.x;
      const dy = t.clientY - this.lookPrev.y;
      this.lookPrev = { x: t.clientX, y: t.clientY };
      this.cb.onLook(dx, dy);
    };
    const lTouchEnd = (e: TouchEvent): void => {
      e.preventDefault();
      this.lookPrev = null;
    };

    this.lookArea.root.addEventListener('touchstart', lTouchStart, { passive: false });
    this.lookArea.root.addEventListener('touchmove', lTouchMove, { passive: false });
    this.lookArea.root.addEventListener('touchend', lTouchEnd, { passive: false });
    this.lookArea.root.addEventListener('touchcancel', lTouchEnd, { passive: false });

    // ── Shoot (hold-to-fire) ─────────────────────────────────────────────
    const shootDown = (): void => {
      this.shooting = true;
      this.cb.onShoot(true);
    };
    const shootUp = (): void => {
      this.shooting = false;
      this.cb.onShoot(false);
    };
    this.btnShoot.addEventListener('touchstart', (e) => {
      e.preventDefault();
      shootDown();
    }, { passive: false });
    this.btnShoot.addEventListener('touchend', (e) => {
      e.preventDefault();
      shootUp();
    }, { passive: false });
    this.btnShoot.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      shootUp();
    }, { passive: false });

    // ── Dash (tap) ────────────────────────────────────────────────────────
    this.btnDash.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.cb.onDash();
    }, { passive: false });

    // ── Reload (tap) ──────────────────────────────────────────────────────
    this.btnReload.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.cb.onReload();
    }, { passive: false });
  }
}
