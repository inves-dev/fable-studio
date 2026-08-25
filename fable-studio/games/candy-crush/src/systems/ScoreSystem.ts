// Candy Crush - Score system.
// Converts match groups into score points and notifies a HUD listener.

import { SCORE_BONUS_PER_EXTRA, SCORE_PER_MATCH } from '../config.js';
import type { GameState } from '../state.js';
import type { MatchGroup } from './MatchSystem.js';

export interface HudUpdate {
  score: number;
  targetScore: number;
  won: boolean;
  delta: number;
}

export type HudListener = (update: HudUpdate) => void;

export class ScoreSystem {
  private listener: HudListener | null = null;

  setHudListener(listener: HudListener): void {
    this.listener = listener;
  }

  // Compute the points awarded for a list of match groups.
  computeScore(matches: MatchGroup[]): number {
    let total = 0;
    for (const m of matches) {
      const base = SCORE_PER_MATCH * m.cells.length;
      const extra = Math.max(0, m.cells.length - 3) * SCORE_BONUS_PER_EXTRA;
      total += base + extra;
    }
    return total;
  }

  // Apply matches to state: add points, check win, fire HUD update.
  apply(state: GameState, matches: MatchGroup[]): number {
    const delta = this.computeScore(matches);
    state.score += delta;

    if (state.score >= state.targetScore && !state.won) {
      state.won = true;
    }

    if (this.listener) {
      this.listener({
        score: state.score,
        targetScore: state.targetScore,
        won: state.won,
        delta,
      });
    }

    return delta;
  }
}
