// Candy Crush - Cascade system.
// Applies gravity (candies fall into empty cells) and spawns new candies
// from the top to fill any remaining gaps.

import { GRID_SIZE, SPAWN_HEIGHT } from '../config.js';
import type { GameState } from '../state.js';
import { createCandy, randomCandyType } from '../entities/Candy.js';
import type { MatchGroup } from './MatchSystem.js';

// Remove the matched cells from the grid and scene.
export function clearMatches(
  state: GameState,
  matches: MatchGroup[],
): void {
  for (const group of matches) {
    for (const cell of group.cells) {
      const { row, col } = cell;
      state.grid[row][col].type = -1;
      const mesh = state.meshes[row][col];
      if (mesh) {
        mesh.parent?.remove(mesh);
      }
      state.meshes[row][col] = null;
    }
  }
}

// Apply gravity column by column: pull non-empty cells down, leave -1 gaps at top.
export function applyGravity(state: GameState): void {
  for (let c = 0; c < GRID_SIZE; c++) {
    let writeRow = GRID_SIZE - 1;
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const t = state.grid[r][c].type;
      if (t >= 0) {
        if (writeRow !== r) {
          state.grid[writeRow][c].type = t;
          state.grid[r][c].type = -1;

          const mesh = state.meshes[r][c];
          state.meshes[writeRow][c] = mesh;
          state.meshes[r][c] = null;
        }
        writeRow--;
      }
    }
  }
}

// Fill empty cells with new random candies spawned above the grid.
export function spawnNewCandies(state: GameState): void {
  for (let c = 0; c < GRID_SIZE; c++) {
    let spawnIndex = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (state.grid[r][c].type < 0) {
        const type = randomCandyType();
        state.grid[r][c].type = type;
        const mesh = createCandy(type);
        // Will be positioned by the caller (GridBuilder knows the scene).
        mesh.userData.targetRow = r;
        mesh.userData.targetCol = c;
        mesh.userData.spawnOffset = spawnIndex;
        spawnIndex++;
        state.meshes[r][c] = mesh;
      }
    }
  }
}

// Mark every mesh with its current grid target world position so a render
// loop can lerp them. The actual world coords are computed by GridBuilder
// because that module owns the scene.
export function getSpawnOffset(): number {
  return SPAWN_HEIGHT;
}

// Helper used by main.ts: position a freshly spawned mesh above the grid,
// stacked by spawn order so cascades look natural.
export function positionSpawnHelper(
  mesh: { position: { set: (x: number, y: number, z: number) => void } },
  row: number,
  col: number,
  spawnIndex: number,
  cellToWorld: (r: number, c: number) => { x: number; y: number },
): void {
  const pos = cellToWorld(row, col);
  mesh.position.set(pos.x, pos.y + SPAWN_HEIGHT + spawnIndex * 1, 0);
}

// Linear interpolation utility reused across systems.
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
