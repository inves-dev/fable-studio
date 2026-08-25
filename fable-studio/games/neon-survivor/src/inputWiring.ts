// Neon Survivor - input wiring helpers (keyboard/mouse desktop + touch mobile).
// Extracted from main.ts to keep that file under 200 lines.

import type { Group } from 'three';
import { InputManager } from './input';
import { MobileControls } from './ui/MobileControls';
import { equipWeapon } from './equipment';
import type { GameState } from './state';

export interface DesktopInputDeps {
  state: GameState;
  playerMesh: Group;
  setWeaponMesh: (m: Group | null) => void;
  getWeaponMesh: () => Group | null;
  shoot: () => void;
  dash: () => void;
  reload: () => void;
}

export function setupDesktopInput(deps: DesktopInputDeps): InputManager {
  return new InputManager(deps.state, {
    onShoot: (down) => {
      if (deps.state.state === 'playing' && down) deps.shoot();
    },
    onDash: () => deps.dash(),
    onReload: () => deps.reload(),
    onSwitchWeapon: (slot) => {
      const gunGroup = deps.playerMesh.userData['gunGroup'] as Group;
      equipWeapon(slot, deps.state, gunGroup, deps.setWeaponMesh, deps.getWeaponMesh);
    },
    onMouseMove: (dx, dy) => {
      if (deps.state.state !== 'playing') return;
      deps.state.yaw -= dx * 0.0025;
      deps.state.pitch -= dy * 0.0025;
      deps.state.pitch = Math.max(-0.8, Math.min(0.8, deps.state.pitch));
    },
  });
}

export interface TouchInputDeps {
  state: GameState;
  shoot: () => void;
  dash: () => void;
  reload: () => void;
}

export function setupMobileControls(container: HTMLElement, deps: TouchInputDeps): MobileControls {
  return new MobileControls(container, {
    onMove: (nx, ny) => {
      const k = deps.state.keys;
      k['KeyW'] = ny > 0.1;
      k['KeyS'] = ny < -0.1;
      k['KeyA'] = nx < -0.1;
      k['KeyD'] = nx > 0.1;
    },
    onLook: (dx, dy) => {
      if (deps.state.state !== 'playing') return;
      deps.state.yaw -= dx * 0.004;
      deps.state.pitch -= dy * 0.004;
      deps.state.pitch = Math.max(-0.8, Math.min(0.8, deps.state.pitch));
    },
    onShoot: (down) => {
      if (deps.state.state === 'playing' && down) deps.shoot();
    },
    onDash: () => deps.dash(),
    onReload: () => deps.reload(),
  });
}
