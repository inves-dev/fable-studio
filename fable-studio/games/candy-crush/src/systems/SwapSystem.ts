// Candy Crush - Swap system.
// Handles swap animations (lerp two meshes between grid cells), validates
// whether the swap produces a match, and reverts if it doesn't.

import type { Mesh } from 'three';
import { GRID_SIZE, ANIM_DURATION_MS } from '../config.js';
import type { GameState, Selected } from '../state.js';
import { findMatches } from './MatchSystem.js';
import { cellToWorld } from '../scene/GridBuilder.js';

export type SwapPhase = 'forward' | 'revert' | 'done';

export interface SwapResult {
  phase: SwapPhase;
  valid: boolean;
}

export class SwapSystem {
  private startTime = 0;
  private fromPos = { x: 0, y: 0 };
  private toPos = { x: 0, y: 0 };
  private active = false;
  private a: Selected | null = null;
  private b: Selected | null = null;
  private revert = false;
  private onComplete: ((valid: boolean) => void) | null = null;

  // Begin a swap. Caller supplies state, the two cells, and a completion
  // callback fired when the animation phase ends.
  begin(
    state: GameState,
    a: Selected,
    b: Selected,
    onComplete: (valid: boolean) => void,
  ): void {
    if (state.isAnimating) return;
    if (
      a.row < 0 ||
      a.row >= GRID_SIZE ||
      a.col < 0 ||
      a.col >= GRID_SIZE
    )
      return;
    if (
      b.row < 0 ||
      b.row >= GRID_SIZE ||
      b.col < 0 ||
      b.col >= GRID_SIZE
    )
      return;

    state.isAnimating = true;
    state.phase = 'swapping';

    this.startTime = performance.now();
    this.a = { ...a };
    this.b = { ...b };
    this.revert = false;
    this.onComplete = onComplete;
    this.fromPos = cellToWorld(a.row, a.col);
    this.toPos = cellToWorld(b.row, b.col);
    this.active = true;
  }

  // Per-frame update. Mutates mesh positions and finishes the swap
  // by either committing or reverting depending on match validity.
  update(state: GameState): void {
    if (!this.active || this.a === null || this.b === null) return;

    const now = performance.now();
    const t = Math.min(1, (now - this.startTime) / ANIM_DURATION_MS);

    const meshA = state.meshes[this.a.row][this.a.col];
    const meshB = state.meshes[this.b.row][this.b.col];

    if (this.revert) {
      // Animating back to original positions.
      const ax = lerp(this.toPos.x, this.fromPos.x, t);
      const ay = lerp(this.toPos.y, this.fromPos.y, t);
      const bx = lerp(this.fromPos.x, this.toPos.x, t);
      const by = lerp(this.fromPos.y, this.toPos.y, t);
      if (meshA) setMeshPos(meshA, ax, ay);
      if (meshB) setMeshPos(meshB, bx, by);

      if (t >= 1) {
        this.finishRevert(state);
      }
    } else {
      // Animating swap forward.
      const ax = lerp(this.fromPos.x, this.toPos.x, t);
      const ay = lerp(this.fromPos.y, this.toPos.y, t);
      const bx = lerp(this.toPos.x, this.fromPos.x, t);
      const by = lerp(this.toPos.y, this.fromPos.y, t);
      if (meshA) setMeshPos(meshA, ax, ay);
      if (meshB) setMeshPos(meshB, bx, by);

      if (t >= 1) {
        this.commitOrCheckMatches(state);
      }
    }
  }

  private commitOrCheckMatches(state: GameState): void {
    if (this.a === null || this.b === null) return;

    // Swap the logical types + meshes in the grid arrays.
    const aRow = this.a.row;
    const aCol = this.a.col;
    const bRow = this.b.row;
    const bCol = this.b.col;

    const typeA = state.grid[aRow][aCol].type;
    const typeB = state.grid[bRow][bCol].type;
    state.grid[aRow][aCol].type = typeB;
    state.grid[bRow][bCol].type = typeA;

    const meshA = state.meshes[aRow][aCol];
    const meshB = state.meshes[bRow][bCol];
    state.meshes[aRow][aCol] = meshB;
    state.meshes[bRow][bCol] = meshA;

    const matches = findMatches(state.grid);
    if (matches.length > 0) {
      // Swap is valid: animation done, leave cells committed.
      this.active = false;
      this.a = null;
      this.b = null;
      state.isAnimating = false;
      state.phase = 'idle';
      if (this.onComplete) this.onComplete(true);
      this.onComplete = null;
    } else {
      // Invalid: kick off a reverse animation.
      this.revert = true;
      this.startTime = performance.now();
    }
  }

  private finishRevert(state: GameState): void {
    if (this.a === null || this.b === null) return;

    // Snap meshes back to their original world positions.
    const meshA = state.meshes[this.a.row][this.a.col];
    const meshB = state.meshes[this.b.row][this.b.col];
    const posA = cellToWorld(this.a.row, this.a.col);
    const posB = cellToWorld(this.b.row, this.b.col);
    if (meshA) setMeshPos(meshA, posA.x, posA.y);
    if (meshB) setMeshPos(meshB, posB.x, posB.y);

    this.active = false;
    this.a = null;
    this.b = null;
    state.isAnimating = false;
    state.phase = 'idle';
    if (this.onComplete) this.onComplete(false);
    this.onComplete = null;
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function setMeshPos(mesh: Mesh, x: number, y: number): void {
  mesh.position.x = x;
  mesh.position.y = y;
}
