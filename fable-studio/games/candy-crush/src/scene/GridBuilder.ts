// Candy Crush - GridBuilder.
// Owns the Three.js scene contents for the match-3 board: cell backgrounds,
// candy meshes, hit picking, and grid <-> world coordinate mapping.

import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
} from 'three';
import {
  CANDY_TYPES,
  CELL_SIZE,
  GRID_SIZE,
  SPAWN_HEIGHT,
  WIN_SCORE,
} from '../config.js';
import { createCandy, randomCandyType } from '../entities/Candy.js';
import { createInitialState, type GameState } from '../state.js';

const BG_COLOR = 0x0a0a14;
const CELL_BG_COLOR = 0x14142a;
const CELL_BG_HIGHLIGHT = 0x2a2a55;

// World coords are centered at (0,0). Convert (row,col) -> world (x,y).
export function cellToWorld(row: number, col: number): { x: number; y: number } {
  const x = (col - (GRID_SIZE - 1) / 2) * CELL_SIZE;
  const y = ((GRID_SIZE - 1) / 2 - row) * CELL_SIZE;
  return { x, y };
}

export function worldToCell(x: number, y: number): { row: number; col: number } {
  const col = Math.round(x / CELL_SIZE + (GRID_SIZE - 1) / 2);
  const row = Math.round((GRID_SIZE - 1) / 2 - y / CELL_SIZE);
  return { row, col };
}

export class GridBuilder {
  readonly state: GameState;
  readonly scene: Scene;
  readonly root: Group;
  readonly candyGroup: Group;
  readonly cellGroup: Group;
  private cellMeshes: Mesh[][] = [];
  private raycaster: Raycaster;

  constructor(scene: Scene, raycaster: Raycaster) {
    this.scene = scene;
    this.raycaster = raycaster;
    this.root = new Group();
    this.root.name = 'candy-crush-root';
    this.scene.add(this.root);

    this.cellGroup = new Group();
    this.cellGroup.name = 'cells';
    this.root.add(this.cellGroup);

    this.candyGroup = new Group();
    this.candyGroup.name = 'candies';
    this.root.add(this.candyGroup);

    this.state = createInitialState(WIN_SCORE);
    this.buildCellBackgrounds();
    this.populateInitialBoard();
  }

  private buildCellBackgrounds(): void {
    const geom = new PlaneGeometry(CELL_SIZE * 0.92, CELL_SIZE * 0.92);
    const mat = new MeshBasicMaterial({
      color: CELL_BG_COLOR,
      transparent: true,
      opacity: 0.6,
    });

    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Mesh[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = new Mesh(geom, mat.clone());
        const pos = cellToWorld(r, c);
        cell.position.set(pos.x, pos.y, -0.1);
        cell.userData.row = r;
        cell.userData.col = c;
        this.cellGroup.add(cell);
        row.push(cell);
      }
      this.cellMeshes.push(row);
    }
  }

  private populateInitialBoard(): void {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = randomCandyType();
        const mesh = createCandy(type);
        const pos = cellToWorld(r, c);
        mesh.position.set(pos.x, pos.y, 0);
        this.candyGroup.add(mesh);
        this.state.grid[r][c] = { type };
        this.state.meshes[r][c] = mesh;
      }
    }
  }

  // Highlight / unhighlight the selected cell's background.
  setSelected(row: number | null, col: number | null): void {
    if (this.state.selected) {
      const prev = this.cellMeshes[this.state.selected.row][this.state.selected.col];
      if (prev) {
        const mat = prev.material as MeshBasicMaterial;
        mat.color.setHex(CELL_BG_COLOR);
        mat.opacity = 0.6;
      }
    }
    if (row !== null && col !== null) {
      const cell = this.cellMeshes[row][col];
      if (cell) {
        const mat = cell.material as MeshBasicMaterial;
        mat.color.setHex(CELL_BG_HIGHLIGHT);
        mat.opacity = 0.9;
      }
    }
  }

  // Find which candy mesh was clicked (if any) using raycaster.
  pickCandy(ndc: Vector2, camera: { project: (v: Vector3) => Vector3 } & object): {
    row: number;
    col: number;
  } | null {
    this.raycaster.setFromCamera(ndc, camera as never);
    const hits = this.raycaster.intersectObjects(this.candyGroup.children, true);
    if (hits.length === 0) return null;

    const hit = hits[0].object as Mesh;
    // Walk up parents to find the candy group with userData.row/col.
    let cur: object | null = hit;
    while (cur) {
      const ud = (cur as { userData?: { row?: number; col?: number } }).userData;
      if (ud && typeof ud.row === 'number' && typeof ud.col === 'number') {
        return { row: ud.row, col: ud.col };
      }
      cur = (cur as { parent?: object | null }).parent ?? null;
    }
    return null;
  }

  // Tag every candy mesh with its row/col for raycast lookup.
  tagMeshes(): void {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const m = this.state.meshes[r][c];
        if (m) (m as Mesh).userData = { row: r, col: c };
      }
    }
  }

  // Resync mesh positions to their grid target (used after gravity/spawn).
  snapMeshesToGrid(): void {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const m = this.state.meshes[r][c];
        if (m) {
          const pos = cellToWorld(r, c);
          m.position.set(pos.x, pos.y, 0);
        }
      }
    }
  }

  // Place a freshly spawned candy above the grid (animated down by caller).
  positionSpawn(row: number, col: number, spawnIndex: number, mesh: Mesh): void {
    const pos = cellToWorld(row, col);
    mesh.position.set(pos.x, pos.y + SPAWN_HEIGHT + spawnIndex * CELL_SIZE, 0);
  }

  // Return the candy mesh at (row,col) for animation tweens.
  getCandyMeshAt(row: number, col: number): Mesh | null {
    return this.state.meshes[row][col];
  }

  getCellMeshAt(row: number, col: number): Mesh | null {
    return this.cellMeshes[row]?.[col] ?? null;
  }

  // Get a reference to a color (for HUD particles later).
  candyColor(type: number): number {
    return CANDY_TYPES[type]?.color ?? 0xffffff;
  }

  getRaycaster(): Raycaster {
    return this.raycaster;
  }
}

// Re-export inner mesh helper so SwapSystem can use it.
// (getCandyMesh is intentionally not re-exported here; consumers can import
// directly from ../entities/Candy.js.)
