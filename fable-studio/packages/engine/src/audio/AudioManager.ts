import type { MusicSpec, SfxSpec } from './types';

// Singleton wrapper around Web Audio API.
// Lazy AudioContext (created after first user gesture on browsers that gate it).
export class AudioManagerClass {
  private _ctx: AudioContext | null = null;
  private _master: GainNode | null = null;
  private _musicGain: GainNode | null = null;
  private _sfxGain: GainNode | null = null;
  private muted = false;
  private masterVolume = 1;

  /** Lazy initialize and return the AudioContext. */
  get ctx(): AudioContext {
    if (!this._ctx) this.init();
    return this._ctx as AudioContext;
  }

  get master(): GainNode {
    if (!this._master) this.init();
    return this._master as GainNode;
  }

  private get musicGain(): GainNode {
    if (!this._musicGain) this.init();
    return this._musicGain as GainNode;
  }

  private get sfxGain(): GainNode {
    if (!this._sfxGain) this.init();
    return this._sfxGain as GainNode;
  }

  init(): void {
    if (this._ctx) return;
    const Ctor =
      (window.AudioContext as typeof AudioContext) ||
      ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.masterVolume;
    master.connect(ctx.destination);

    const sfx = ctx.createGain();
    sfx.gain.value = 1;
    sfx.connect(master);

    const music = ctx.createGain();
    music.gain.value = 0.6;
    music.connect(master);

    this._ctx = ctx;
    this._master = master;
    this._sfxGain = sfx;
    this._musicGain = music;
  }

  /** Browsers gate AudioContext until user interaction; call from a tap handler. */
  async unlock(): Promise<void> {
    this.init();
    if (this._ctx && this._ctx.state === 'suspended') {
      try { await this._ctx.resume(); } catch { /* ignore */ }
    }
  }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this._master) this._master.gain.value = this.muted ? 0 : this.masterVolume;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this._master) this._master.gain.value = m ? 0 : this.masterVolume;
  }

  /** Play a one-shot procedural SFX from a spec. */
  playSfx(spec: SfxSpec): void {
    if (!this._ctx || this.muted) return;
    const ctx = this._ctx;
    const dest = this.sfxGain;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freq, t0);
    if (spec.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(0.0001, spec.freqEnd),
        t0 + spec.duration,
      );
    }
    const attack = spec.attack ?? 0.005;
    const release = spec.release ?? 0.05;
    const peak = spec.volume;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + attack);
    gain.gain.setValueAtTime(peak, t0 + Math.max(attack, spec.duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + spec.duration);
    osc.connect(gain).connect(dest);
    osc.start(t0);
    osc.stop(t0 + spec.duration + 0.02);
  }

  /** Music routing target (separate gain so SFX/music volumes can differ). */
  getMusicDestination(): AudioNode {
    return this.musicGain;
  }

  /** Convenience: start a music spec and return a handle for later stop. */
  async playMusic(spec: MusicSpec): Promise<{ stop: () => void }> {
    const { MusicGenerator } = await import('./MusicGenerator');
    const gen = new MusicGenerator(spec);
    gen.start();
    const handle = { stop: () => gen.stop() };
    this.registerMusic(handle);
    return handle;
  }

  dispose(): void {
    this.stopAllMusic();
    if (this._ctx) {
      try { this._ctx.close(); } catch { /* ignore */ }
    }
    this._ctx = null;
    this._master = null;
    this._sfxGain = null;
    this._musicGain = null;
  }

  // Music handles are tracked externally; this is a no-op placeholder for future registry.
  private musicHandles: Array<{ stop: () => void }> = [];

  registerMusic(handle: { stop: () => void }): void {
    this.musicHandles.push(handle);
  }

  stopAllMusic(): void {
    for (const h of this.musicHandles) h.stop();
    this.musicHandles = [];
  }
}

export const AudioManager = new AudioManagerClass();