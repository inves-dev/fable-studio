// Neon Survivor - Shared anatomy table for humanoid enemies.
// Each kind maps to per-bone dimensions used by EnemyBuilder.

import type { EnemyKind } from './enemies';

export interface Anatomy {
  torsoR: number;
  torsoH: number;
  headR: number;
  legLen: number;
  legR: number;
  armLen: number;
  armR: number;
  shoulderW: number;
  posture: number;
}

export const ANATOMY: Record<EnemyKind, Anatomy> = {
  grunt:        { torsoR: 0.34, torsoH: 0.38, headR: 0.20, legLen: 0.42, legR: 0.10, armLen: 0.38, armR: 0.10, shoulderW: 0.46, posture: 1.0 },
  runner:       { torsoR: 0.22, torsoH: 0.42, headR: 0.14, legLen: 0.62, legR: 0.07, armLen: 0.46, armR: 0.07, shoulderW: 0.30, posture: 0.85 },
  tank:         { torsoR: 0.46, torsoH: 0.50, headR: 0.22, legLen: 0.42, legR: 0.14, armLen: 0.40, armR: 0.13, shoulderW: 0.62, posture: 1.0 },
  crawler:      { torsoR: 0.32, torsoH: 0.28, headR: 0.16, legLen: 0.28, legR: 0.10, armLen: 0.20, armR: 0.08, shoulderW: 0.55, posture: 0.7 },
  sniper:       { torsoR: 0.20, torsoH: 0.50, headR: 0.14, legLen: 0.60, legR: 0.07, armLen: 0.50, armR: 0.07, shoulderW: 0.28, posture: 1.0 },
  phantom:      { torsoR: 0.24, torsoH: 0.46, headR: 0.18, legLen: 0.58, legR: 0.08, armLen: 0.50, armR: 0.08, shoulderW: 0.30, posture: 0.95 },
  bruiser:      { torsoR: 0.54, torsoH: 0.56, headR: 0.24, legLen: 0.44, legR: 0.16, armLen: 0.46, armR: 0.16, shoulderW: 0.72, posture: 1.05 },
  shieldbearer: { torsoR: 0.32, torsoH: 0.46, headR: 0.18, legLen: 0.46, legR: 0.12, armLen: 0.36, armR: 0.11, shoulderW: 0.50, posture: 1.0 },
  bomber:       { torsoR: 0.28, torsoH: 0.40, headR: 0.18, legLen: 0.40, legR: 0.10, armLen: 0.32, armR: 0.10, shoulderW: 0.44, posture: 0.95 },
  swarm:        { torsoR: 0.20, torsoH: 0.24, headR: 0.10, legLen: 0.20, legR: 0.06, armLen: 0.20, armR: 0.06, shoulderW: 0.26, posture: 0.8 },
  apex:         { torsoR: 0.36, torsoH: 0.48, headR: 0.20, legLen: 0.52, legR: 0.11, armLen: 0.46, armR: 0.11, shoulderW: 0.46, posture: 1.0 },
  boss:         { torsoR: 0.52, torsoH: 0.60, headR: 0.28, legLen: 0.62, legR: 0.16, armLen: 0.58, armR: 0.15, shoulderW: 0.80, posture: 1.2 },
  drone:        { torsoR: 0.20, torsoH: 0.16, headR: 0.18, legLen: 0,    legR: 0.04, armLen: 0.30, armR: 0.04, shoulderW: 0.30, posture: 1.0 },
  sentinel:     { torsoR: 0.20, torsoH: 0.30, headR: 0.18, legLen: 0.40, legR: 0.04, armLen: 0.20, armR: 0.04, shoulderW: 0.30, posture: 1.0 },
};
