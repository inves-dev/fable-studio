// Public types for the audio subsystem.

export type SfxWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface SfxSpec {
  /** Base frequency in Hz. */
  freq: number;
  /** Duration in seconds. */
  duration: number;
  /** Oscillator waveform. */
  type: SfxWaveform;
  /** Master volume 0..1. */
  volume: number;
  /** Optional frequency slide end (Hz). */
  freqEnd?: number;
  /** Optional attack in seconds (default 0.005). */
  attack?: number;
  /** Optional release in seconds (default 0.05). */
  release?: number;
  /** Detune cents (random spread across voices). */
  detune?: number;
}

export interface MusicSpec {
  /** Notes in semitones relative to a root (e.g. minor scale). */
  notes: readonly number[];
  /** Beats per minute. */
  bpm: number;
  /** Note duration in beats (1 = quarter, 0.5 = eighth). */
  noteDuration: number;
  /** Waveform. */
  type: SfxWaveform;
  /** Master volume 0..1. */
  volume: number;
  /** Bass note offset (semitones below root). */
  bassOffset?: number;
  /** Loop when reaching end. */
  loop: boolean;
}