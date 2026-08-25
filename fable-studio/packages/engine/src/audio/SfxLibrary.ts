import type { SfxSpec } from './types';

// Curated procedural SFX presets. Each spec is self-contained.
export const SFX_LIBRARY = {
  laser: { freq: 880, freqEnd: 220, duration: 0.18, type: 'square', volume: 0.35 } satisfies SfxSpec,
  hit:   { freq: 180, freqEnd: 60,  duration: 0.14, type: 'sawtooth', volume: 0.45 } satisfies SfxSpec,
  pickup:{ freq: 660, freqEnd: 1320,duration: 0.22, type: 'triangle', volume: 0.4 } satisfies SfxSpec,
  explode:{ freq: 120, freqEnd: 30, duration: 0.6, type: 'sawtooth', volume: 0.55 } satisfies SfxSpec,
  jump:  { freq: 320, freqEnd: 640, duration: 0.16, type: 'sine', volume: 0.35 } satisfies SfxSpec,
  click: { freq: 1200, duration: 0.05, type: 'square', volume: 0.25 } satisfies SfxSpec,
  power: { freq: 220, freqEnd: 1760, duration: 0.5, type: 'sawtooth', volume: 0.5 } satisfies SfxSpec,
  match: { freq: 880, freqEnd: 1320, duration: 0.18, type: 'triangle', volume: 0.45 } satisfies SfxSpec,
} as const;

export type SfxId = keyof typeof SFX_LIBRARY;

export function getSfx(id: SfxId): SfxSpec {
  return SFX_LIBRARY[id];
}

// Friendly namespace alias so game code can write `SfxLibrary.laser()`.
export const SfxLibrary = SFX_LIBRARY;