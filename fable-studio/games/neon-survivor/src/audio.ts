// Neon Survivor - audio wiring.
// Plugs the procedural AudioManager + SfxLibrary into game events without
// modifying the AudioManager API. Each wire* function hooks one event.

import { AudioManager } from '@nanagames/engine/audio/AudioManager';
import { SfxLibrary } from '@nanagames/engine/audio/SfxLibrary';
import { defaultNeonMusic } from '@nanagames/engine/audio/MusicGenerator';
import type { GameState } from './state';
import type { NeonSurvivorGame } from './main';
import type { PlayerMovementSystem } from './systems/PlayerMovementSystem';
import type { PlayerShootSystem } from './systems/PlayerShootSystem';
import type { BulletSystem } from './systems/BulletSystem';
import type { CardSystem } from './systems/CardSystem';

type Audio = typeof AudioManager;

/** Start looping background music. */
export function wireMusic(audio: Audio): void {
  void audio.unlock().then(() => {
    void audio.playMusic(defaultNeonMusic());
  });
}

/** Laser SFX each time the player fires (only when a shot is actually emitted). */
export function wireFireAudio(
  shootSystem: PlayerShootSystem,
  audio: Audio,
): void {
  shootSystem.setOnFire(() => audio.playSfx(SfxLibrary.laser));
}

/** Sine whoosh on dash start. */
export function wireDashAudio(
  moveSystem: PlayerMovementSystem,
  audio: Audio,
): void {
  moveSystem.setOnDash(() => audio.playSfx(SfxLibrary.jump));
}

/** Click when the reload bar finishes. */
export function wireReloadAudio(
  shootSystem: PlayerShootSystem,
  audio: Audio,
): void {
  shootSystem.setOnReloadComplete(() => audio.playSfx(SfxLibrary.click));
}

/** Hit thump + explode on enemy kill, all routed through BulletSystem. */
export function wireHitAudio(
  _state: GameState,
  bulletSystem: BulletSystem,
  audio: Audio,
): void {
  bulletSystem.setOnHit(() => audio.playSfx(SfxLibrary.hit));
  bulletSystem.setOnKill((kind) => {
    audio.playSfx(kind === 'boss' ? SfxLibrary.explode : SfxLibrary.pickup);
  });
}

/** Power-up chime when the player picks a card.
 *  The SFX is fired by NeonCardSelect via the `onPick` callback chain
 *  (HUD calls AudioManager.playSfx before forwarding the choice to the
 *  CardSystem), so this is a no-op kept for API symmetry. */
export function wireCardAudio(_cardSystem: CardSystem, _audio: Audio): void {
  /* no-op: power-up SFX is handled in GameHUD's card pick flow. */
}

/** Wires all Neon Survivor audio events in one shot. */
export function wireAudio(game: NeonSurvivorGame, audio: Audio): void {
  wireMusic(audio);
  wireFireAudio(game.shootSystem, audio);
  wireDashAudio(game.moveSystem, audio);
  wireReloadAudio(game.shootSystem, audio);
  wireHitAudio(game.state, game.bulletSystem, audio);
  wireCardAudio(game.cardSystem, audio);
  wireMuteAndVolume(game, audio);
}

/** Wire HUD mute button + volume sliders into the AudioManager. */
function wireMuteAndVolume(game: NeonSurvivorGame, audio: Audio): void {
  const hud = game.gameHUD;
  if (!hud) return;

  let muted = false;
  let musicVol = 0.5;
  let sfxVol = 1.0;
  try {
    muted = localStorage.getItem('neon_muted') === '1';
    musicVol = parseFloat(localStorage.getItem('neon_music_vol') || '0.5');
    sfxVol = parseFloat(localStorage.getItem('neon_sfx_vol') || '1.0');
  } catch { /* localStorage may be unavailable */ }

  const apply = (): void => {
    if (typeof audio.setMusicVolume === 'function') audio.setMusicVolume(muted ? 0 : musicVol);
    if (typeof audio.setSfxVolume === 'function') audio.setSfxVolume(muted ? 0 : sfxVol);
    hud.setMuted(muted);
    hud.setMusicVolumeUI(musicVol);
    hud.setSfxVolumeUI(sfxVol);
  };
  apply();

  hud.onMute(() => {
    muted = !muted;
    try { localStorage.setItem('neon_muted', muted ? '1' : '0'); } catch { /* ignore */ }
    apply();
  });
  hud.onMusicVol((v) => {
    musicVol = Math.max(0, Math.min(1, v));
    try { localStorage.setItem('neon_music_vol', String(musicVol)); } catch { /* ignore */ }
    apply();
  });
  hud.onSfxVol((v) => {
    sfxVol = Math.max(0, Math.min(1, v));
    try { localStorage.setItem('neon_sfx_vol', String(sfxVol)); } catch { /* ignore */ }
    apply();
  });
}