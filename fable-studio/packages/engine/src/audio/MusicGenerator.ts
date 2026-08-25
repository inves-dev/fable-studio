import { AudioManager } from './AudioManager';
import type { MusicSpec } from './types';

// Plays a looping procedural music pattern built from a small scale + bass.
export class MusicGenerator {
  private readonly ctx: AudioContext;
  private readonly master: GainNode;
  private readonly destination: AudioNode;
  private readonly masterVolume: number;
  private readonly bpm: number;
  private readonly noteDuration: number;
  private readonly notes: readonly number[];
  private readonly type: OscillatorType;
  private readonly bassOffset: number;

  private noteTimer: number | null = null;
  private bassTimer: number | null = null;
  private step = 0;
  private running = false;

  constructor(spec: MusicSpec) {
    this.ctx = AudioManager.ctx;
    this.master = AudioManager.master;
    this.destination = this.master;
    this.masterVolume = spec.volume;
    this.bpm = spec.bpm;
    this.noteDuration = spec.noteDuration;
    this.notes = spec.notes;
    this.type = spec.type;
    this.bassOffset = spec.bassOffset ?? -12;
    this.loop = spec.loop;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.step = 0;
    const noteMs = (60 / this.bpm) * 4 * this.noteDuration * 1000;
    this.scheduleMelody(noteMs);
    this.scheduleBass(noteMs * 2);
  }

  stop(): void {
    this.running = false;
    if (this.noteTimer !== null) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    if (this.bassTimer !== null) {
      clearTimeout(this.bassTimer);
      this.bassTimer = null;
    }
  }

  private scheduleMelody(intervalMs: number): void {
    const tick = (): void => {
      if (!this.running) return;
      const semitone = this.notes[this.step % this.notes.length];
      const freq = 220 * Math.pow(2, semitone / 12);
      this.playNote(freq, intervalMs / 1000);
      this.step++;
      this.noteTimer = window.setTimeout(tick, intervalMs);
    };
    tick();
  }

  private scheduleBass(intervalMs: number): void {
    const tick = (): void => {
      if (!this.running) return;
      const semitone = this.notes[(this.step * 2) % this.notes.length] + this.bassOffset;
      const freq = 110 * Math.pow(2, semitone / 12);
      this.playNote(freq, intervalMs / 1000, 0.6);
      this.bassTimer = window.setTimeout(tick, intervalMs);
    };
    tick();
  }

  private playNote(freq: number, duration: number, gainScale = 1): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = this.type;
    osc.frequency.value = freq;
    const peak = 0.4 * this.masterVolume * gainScale;
    gain.gain.value = 0;
    const t0 = this.ctx.currentTime;
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(this.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
}

// A minor scale (semitones from root). Reusable presets.
export const MINOR_SCALE: readonly number[] = [0, 2, 3, 5, 7, 8, 10, 12];
export const PHRYGIAN: readonly number[] = [0, 1, 3, 5, 7, 8, 10, 12];

export function defaultNeonMusic(): MusicSpec {
  return {
    notes: MINOR_SCALE,
    bpm: 110,
    noteDuration: 0.25,
    type: 'square',
    volume: 0.18,
    bassOffset: -12,
    loop: true,
  };
}

export function defaultCandyMusic(): MusicSpec {
  return {
    notes: [0, 4, 7, 12, 7, 4],
    bpm: 130,
    noteDuration: 0.5,
    type: 'triangle',
    volume: 0.16,
    bassOffset: -12,
    loop: true,
  };
}