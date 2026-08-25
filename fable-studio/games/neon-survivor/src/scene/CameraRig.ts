// Neon Survivor - Over-the-shoulder camera rig.
// Computes the camera transform each frame from player yaw/pitch + sprint sway.

import type { PerspectiveCamera } from 'three';

const CAM_DIST = 4.0;
const CAM_HEIGHT = 2.2;
const SHOULDER_OFFSET = 1.2;
const VERTICAL_LIFT = 0.40;
const SPRINT_SWAY_HZ = 0.01;

export function applyOverShoulderCamera(
  camera: PerspectiveCamera,
  yaw: number,
  pitch: number,
  isSprinting: boolean,
  playerPos: { x: number; y: number; z: number },
): void {
  const sway = isSprinting ? Math.sin(performance.now() * SPRINT_SWAY_HZ) * 0.05 : 0;
  const backX = Math.sin(yaw);
  const backZ = Math.cos(yaw);
  const rightX = Math.cos(yaw);
  const rightZ = -Math.sin(yaw);
  const lift = -pitch + VERTICAL_LIFT + sway;
  camera.position.set(
    playerPos.x - backX * CAM_DIST + rightX * SHOULDER_OFFSET,
    playerPos.y + CAM_HEIGHT + lift,
    playerPos.z - backZ * CAM_DIST + rightZ * SHOULDER_OFFSET,
  );
  camera.lookAt(
    playerPos.x + rightX * 0.3,
    playerPos.y + 1.0,
    playerPos.z + rightZ * 0.3,
  );
}
