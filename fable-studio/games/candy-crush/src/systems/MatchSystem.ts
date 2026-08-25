// Candy Crush - Match detection.
// Pure logic, no Three.js. Given the grid, returns all cells that form
// horizontal or vertical runs of 3+ identical candies.

import { GRID_SIZE } from '../config.js';

export interface MatchGroup {
  cells: Array<{ row: number; col: number }>;
  type: number;
}

// Find all match-3+ groups (horizontal and vertical) in the grid.
// Duplicates are not an issue because every cell in a match belongs to
// exactly one matched set (matches along one axis are disjoint).
export function findMatches(
  grid: Array<Array<{ type: number }>>,
): MatchGroup[] {
  const matches: MatchGroup[] = [];
  const seen = new Set<string>();

  const key = (r: number, c: number) => `${r},${c}`;

  // Horizontal scan
  for (let r = 0; r < GRID_SIZE; r++) {
    let runStart = 0;
    for (let c = 1; c <= GRID_SIZE; c++) {
      const prev = grid[r][c - 1];
      const cur = c < GRID_SIZE ? grid[r][c] : null;
      const sameType =
        prev.type >= 0 && cur !== null && cur.type === prev.type;
      if (!sameType) {
        const runLen = c - runStart;
        if (runLen >= 3) {
          const cells: Array<{ row: number; col: number }> = [];
          for (let k = runStart; k < c; k++) {
            const kk = key(r, k);
            if (!seen.has(kk)) {
              seen.add(kk);
              cells.push({ row: r, col: k });
            }
          }
          if (cells.length > 0) {
            matches.push({ cells, type: prev.type });
          }
        }
        runStart = c;
      }
    }
  }

  // Vertical scan
  for (let c = 0; c < GRID_SIZE; c++) {
    let runStart = 0;
    for (let r = 1; r <= GRID_SIZE; r++) {
      const prev = grid[r - 1][c];
      const cur = r < GRID_SIZE ? grid[r][c] : null;
      const sameType =
        prev.type >= 0 && cur !== null && cur.type === prev.type;
      if (!sameType) {
        const runLen = r - runStart;
        if (runLen >= 3) {
          const cells: Array<{ row: number; col: number }> = [];
          for (let k = runStart; k < r; k++) {
            const kk = key(k, c);
            if (!seen.has(kk)) {
              seen.add(kk);
              cells.push({ row: k, col: c });
            }
          }
          if (cells.length > 0) {
            matches.push({ cells, type: prev.type });
          }
        }
        runStart = r;
      }
    }
  }

  return matches;
}

// Convenience: count cells cleared by a match list.
export function totalCellsCleared(matches: MatchGroup[]): number {
  let total = 0;
  for (const m of matches) total += m.cells.length;
  return total;
}
