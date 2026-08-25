// Neon Survivor - Game modes and shared tuning.
// Mirrors the "gameMode" branch in index.html.

export type GameMode = 'normal' | 'dark' | 'frenzy' | 'siege';

export const GAME_MODES: Record<GameMode, { label: string; durationSec: number; desc: string }> = {
  normal: { label: 'NORMAL', durationSec: 0, desc: 'Modo padrão.' },
  dark:   { label: 'DARK WAVE', durationSec: 25, desc: 'Inimigos brilham mais, velocidade +15%.' },
  frenzy: { label: 'FRENZY', durationSec: 25, desc: 'Spawn 2x, dano 1.3x.' },
  siege:  { label: 'SIEGE', durationSec: 25, desc: 'Spawna 3 inimigos extras (sniper + 2 drones).' },
};

export const COLORS = {
  neonCyan: 0x00e0ff,
  neonPink: 0xff00d4,
  neonMagenta: 0xff66e0,
  neonOrange: 0xffaa00,
  neonGreen: 0x66ffaa,
  ground: 0x0a0a18,
  buildingDark: 0x10101e,
  fogNight: 0x0a0a20,
} as const;
