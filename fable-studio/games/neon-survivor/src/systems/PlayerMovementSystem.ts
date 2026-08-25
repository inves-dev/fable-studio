// Neon Survivor - WASD movement, sprint (Shift), dash (Space).
// Reads the player's Transform + the input snapshot on GameState.

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { Components as Core } from '@nanagames/engine/core/Component';
import { NS } from '../components';
import type { GameState } from '../state';
import { ARENA, PLAYER_DEFAULTS } from '../config';

const DASH_DURATION = PLAYER_DEFAULTS.dashDuration;
const DASH_SPEED = PLAYER_DEFAULTS.dashSpeed;
const BASE_SPEED = PLAYER_DEFAULTS.moveSpeed;

export type DashHandler = () => void;

export class PlayerMovementSystem implements System {
  public readonly signature = [NS.PlayerTag];
  public readonly priority = 10;

  private onDash: DashHandler | null = null;

  constructor(private state: GameState) {}

  setOnDash(handler: DashHandler): void { this.onDash = handler; }

  update(_world: World, dt: number): void {
    const { player, playerData, keys, yaw } = this.state;
    if (!player) return;
    const tr = player.get<{ position: { x: number; y: number; z: number }; rotation: { y: number } }>(Core.Transform);
    if (!tr) return;

    const sprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];
    let speedMul = playerData.speedMul * (sprinting ? playerData.sprintMul : 1.0);

    // dash state
    if (playerData.dashTimer > 0) playerData.dashTimer -= dt;
    if (playerData.dashCooldown > 0) playerData.dashCooldown -= dt;

    let dx = 0;
    let dz = 0;
    if (keys['KeyW']) dz -= 1;
    if (keys['KeyS']) dz += 1;
    if (keys['KeyA']) dx -= 1;
    if (keys['KeyD']) dx += 1;
    const len = Math.hypot(dx, dz);
    if (len > 0) { dx /= len; dz /= len; }

    // camera-relative basis: yaw is rotation around Y, +z is forward
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    // rotation: forward = (sin(yaw), cos(yaw)); right = (cos(yaw), -sin(yaw))
    const moveX = (dx * cosY + dz * sinY) * BASE_SPEED * speedMul;
    const moveZ = (dz * cosY - dx * sinY) * BASE_SPEED * speedMul;

    let vx = moveX;
    let vz = moveZ;
    if (playerData.dashTimer > 0) {
      vx = (dx * cosY + dz * sinY) * DASH_SPEED;
      vz = (dz * cosY - dx * sinY) * DASH_SPEED;
    }

    tr.position.x += vx * dt;
    tr.position.z += vz * dt;
    tr.position.y = playerData.dashTimer > 0 ? 0 : 0;

    // arena clamp
    const half = ARENA.size * 0.5 - 1;
    if (tr.position.x < -half) tr.position.x = -half;
    if (tr.position.x > half) tr.position.x = half;
    if (tr.position.z < -half) tr.position.z = -half;
    if (tr.position.z > half) tr.position.z = half;

    // face movement direction while moving
    if (len > 0) {
      const targetYaw = Math.atan2(dx, dz) + yaw;
      const cur = tr.rotation.y;
      let diff = targetYaw - cur;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      tr.rotation.y = cur + diff * Math.min(1, dt * 12);
    }
  }

  tryDash(): void {
    const { playerData } = this.state;
    if (playerData.dashCooldown > 0 || playerData.dashTimer > 0) return;
    playerData.dashTimer = DASH_DURATION;
    playerData.dashCooldown = PLAYER_DEFAULTS.dashCdBase * playerData.dashCdMul;
    this.onDash?.();
  }
}
