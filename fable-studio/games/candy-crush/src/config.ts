// Candy Crush - Configuration
// Cyberpunk neon palette + match-3 tuning constants.

export const GRID_SIZE = 8;

// Cyberpunk neon palette (6 candy types).
export const CANDY_TYPES = [
  { id: 0, name: 'rosa', color: 0xff6b9d },
  { id: 1, name: 'amarelo', color: 0xfeca57 },
  { id: 2, name: 'cyan', color: 0x48dbfb },
  { id: 3, name: 'verde', color: 0x1dd1a1 },
  { id: 4, name: 'roxo', color: 0x5f27cd },
  { id: 5, name: 'magenta', color: 0xff9ff3 },
] as const;

// Score awarded per cleared candy.
export const SCORE_PER_MATCH = 10;

// Bonus applied when more than 3 candies are cleared at once.
export const SCORE_BONUS_PER_EXTRA = 5;

// Win condition: reach this many points.
export const WIN_SCORE = 1000;

// Visual / animation tuning.
export const CELL_SIZE = 1; // world units per cell
export const ANIM_DURATION_MS = 200; // lerp duration for swap
export const SPAWN_HEIGHT = 2; // y where new candies appear
