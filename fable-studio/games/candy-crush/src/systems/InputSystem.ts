// Candy Crush - Input system.
// Translates pointer/touch events on the canvas into grid cell selections
// and emits swap intents when two adjacent cells are tapped.

import type { Camera, Raycaster, Vector2 } from 'three';
import type { GameState, Selected } from '../state.js';
import { isAdjacent, inBounds } from '../state.js';
import { cellToWorld, worldToCell } from './GridBuilder.js';

export type InputListener = (intent: InputIntent) => void;

export type InputIntent =
  | { kind: 'select'; cell: Selected }
  | { kind: 'swap'; a: Selected; b: Selected }
  | { kind: 'deselect' };

export class InputSystem {
  private raycaster: Raycaster;
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  private listener: InputListener | null = null;
  private ndc: Vector2;
  private activePointerId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    camera: Camera,
    raycaster: Raycaster,
    ndc: Vector2,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.raycaster = raycaster;
    this.ndc = ndc;

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
  }

  setListener(listener: InputListener): void {
    this.listener = listener;
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (this.activePointerId !== e.pointerId) return;
    this.activePointerId = null;

    const cell = this.pickCell(e.clientX, e.clientY);
    if (!cell) {
      this.emit({ kind: 'deselect' });
      return;
    }

    this.emit({ kind: 'select', cell });
  };

  private onPointerCancel = (e: PointerEvent): void => {
    if (this.activePointerId === e.pointerId) {
      this.activePointerId = null;
    }
  };

  // Convert client coords to NDC, raycast, then map hit to grid cell.
  pickCell(clientX: number, clientY: number): Selected | null {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.ndc, this.camera);
    // The caller wires actual mesh picking via GridBuilder. Here we use
    // worldToCell on the world ray intersect with z=0 plane done in caller.
    return null;
  }

  // Called by GridBuilder after a real raycast hit on a candy mesh.
  handlePick(state: GameState, row: number, col: number): void {
    if (state.isAnimating) return;
    if (!inBounds(row, col)) return;
    if (state.grid[row][col].type < 0) return;

    const cell: Selected = { row, col };

    if (!state.selected) {
      this.emit({ kind: 'select', cell });
      return;
    }

    if (state.selected.row === row && state.selected.col === col) {
      // Tap same cell again -> deselect.
      this.emit({ kind: 'deselect' });
      return;
    }

    if (isAdjacent(state.selected, cell)) {
      const a = state.selected;
      this.emit({ kind: 'swap', a, b: cell });
      this.emit({ kind: 'deselect' });
    } else {
      // Non-adjacent: start a new selection.
      this.emit({ kind: 'deselect' });
      this.emit({ kind: 'select', cell });
    }
  }

  // For testing / debug: programmatic swap.
  programmaticSwap(state: GameState, a: Selected, b: Selected): void {
    if (state.isAnimating) return;
    if (!inBounds(a.row, a.col) || !inBounds(b.row, b.col)) return;
    this.emit({ kind: 'swap', a: cellCopy(a), b: cellCopy(b) });
  }

  private emit(intent: InputIntent): void {
    if (this.listener) this.listener(intent);
  }
}

function cellCopy(c: Selected): Selected {
  return { row: c.row, col: c.col };
}

// Re-export so callers don't need to import from GridBuilder separately.
export { cellToWorld, worldToCell };
