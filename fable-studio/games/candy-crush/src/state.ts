// Candy Crush - Mutable game state.
// Kept as a plain object so systems can share a single source of truth.

import type { Mesh } from 'three';
import { GRID_SIZE } from './config.js';

// Logical cell: which candy type id sits here (0..5), or -1 for empty.
export interface CandyCell {
  type: number;
}

// World coordinates of a cell (grid index -> world space, centered at origin).
export interface GridPos {
  x: number;
  y: number;
}

// Selected candy used by the input system.
export interface Selected {
  row: number;
  col: number;
}

// Animation phase shared across systems.
export type AnimPhase =
  | 'idle'
  | 'swapping'
  | 'resolving'
  | 'cascading'
  | 'spawning';

// Top-level mutable state. Systems read/mutate this in place.
export interface GameState {
  grid: CandyCell[][]; // [row][col]
  meshes: (Mesh | null)[][]; // [row][col] -> rendered mesh, null if empty
  score: number;
  selected: Selected | null;
  isAnimating: boolean;
  phase: AnimPhase;
  targetScore: number;
  won: boolean;
}

export function createEmptyGrid(): CandyCell[][] {
  const grid: CandyCell[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: CandyCell[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({ type: -1 });
    }
    grid.push(row);
  }
  return grid;
}

export function createEmptyMeshGrid(): (Mesh | null)[][] {
  const grid: (Mesh | null)[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: (Mesh | null)[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(null);
    }
    grid.push(row);
  }
  return grid;
}

export function createInitialState(targetScore: number): GameState {
  return {
    grid: createEmptyGrid(),
    meshes: createEmptyMeshGrid(),
    score: 0,
    selected: null,
    isAnimating: false,
    phase: 'idle',
    targetScore,
    won: false,
  };
}

// Helpers -------------------------------------------------------------------

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

export function isAdjacent(a: Selected, b: Selected): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}
