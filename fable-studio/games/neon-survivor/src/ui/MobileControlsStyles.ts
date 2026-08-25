/**
 * Shared styles, constants, and factory helpers for MobileControls.
 * Kept separate to keep MobileControls.ts below 200 lines.
 */

import type { JoystickElements, LookAreaElements } from './MobileControlsTypes';

export const Z_INDEX = 999;

/** Joystick geometry */
export const JOYSTICK_RADIUS = 110;

/** Look zone geometry */
export const LOOK_SIZE = 180;

/** Button geometry */
export const BTN_SIZE = 64;

// ── Button style tokens ───────────────────────────────────────────────────────

export const BUTTON_STYLES = {
  dash: {
    bg: 'rgba(255, 20, 140, 0.55)',
    border: '2px solid #ff148c',
    label: 'DASH',
  },
  shoot: {
    bg: 'rgba(0, 224, 255, 0.55)',
    border: '2px solid #00e0ff',
    label: 'SHOOT',
  },
  reload: {
    bg: 'rgba(255, 220, 0, 0.55)',
    border: '2px solid #ffdc00',
    label: 'RELOAD',
  },
} as const;

// ── Shared base styles ───────────────────────────────────────────────────────

const BASE_BUTTON = `
  pointer-events: auto;
  touch-action: none;
  z-index: ${Z_INDEX};
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
`;

const BASE_KNOB = `
  pointer-events: none;
  z-index: ${Z_INDEX + 1};
`;

// ── Factory helpers ──────────────────────────────────────────────────────────

/** Creates the movement joystick (base + knob) and returns its elements. */
export function createJoystick(): JoystickElements {
  const base = document.createElement('div');
  base.style.cssText = [
    'position: fixed',
    `left: 24px`,
    `bottom: 24px`,
    `width: ${JOYSTICK_RADIUS * 2}px`,
    `height: ${JOYSTICK_RADIUS * 2}px`,
    'border-radius: 50%',
    'background: rgba(255,255,255,0.12)',
    'border: 2px solid rgba(255,255,255,0.3)',
    'pointer-events: auto',
    'touch-action: none',
    'user-select: none',
    `z-index: ${Z_INDEX}`,
  ].join(';');

  const knob = document.createElement('div');
  knob.style.cssText = [
    'position: absolute',
    'left: 50%',
    'top: 50%',
    `width: ${BTN_SIZE}px`,
    `height: ${BTN_SIZE}px`,
    `margin-left: -${BTN_SIZE / 2}px`,
    `margin-top: -${BTN_SIZE / 2}px`,
    'border-radius: 50%',
    'background: rgba(255,255,255,0.5)',
    'border: 2px solid rgba(255,255,255,0.7)',
    'transition: transform 60ms ease-out',
    BASE_KNOB,
  ].join(';');

  base.appendChild(knob);
  return { base, knob, radius: JOYSTICK_RADIUS };
}

/** Creates the invisible look-drag zone (right bottom). */
export function createLookArea(): LookAreaElements {
  const root = document.createElement('div');
  root.style.cssText = [
    'position: fixed',
    `right: 36px`,
    `bottom: 24px`,
    `width: ${LOOK_SIZE}px`,
    `height: ${LOOK_SIZE}px`,
    'border-radius: 12px',
    'pointer-events: auto',
    'touch-action: none',
    `z-index: ${Z_INDEX}`,
    // Invisible by default
    'background: transparent',
    'border: none',
  ].join(';');
  return { root };
}

/** Creates a labelled circular action button. */
export function createActionButton(
  label: string,
  style: (typeof BUTTON_STYLES)[keyof typeof BUTTON_STYLES],
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.style.cssText = [
    BASE_BUTTON,
    `width: ${BTN_SIZE}px`,
    `height: ${BTN_SIZE}px`,
    'border-radius: 50%',
    `background: ${style.bg}`,
    `border: ${style.border}`,
    `color: #fff`,
    `font-size: 10px`,
    `font-weight: 700`,
    `letter-spacing: 0.08em`,
    `font-family: inherit`,
    `outline: none`,
  ].join(';');
  btn.textContent = label;
  return btn;
}

/** Show the overlay (restore pointer-events + visibility). */
export function showOverlay(el: HTMLElement): void {
  el.style.visibility = 'visible';
  el.style.pointerEvents = 'none';
}

/** Hide the overlay completely. */
export function hideOverlay(el: HTMLElement): void {
  el.style.visibility = 'hidden';
  el.style.pointerEvents = 'none';
}
