// Neon Survivor - main game loop helpers, extracted from NeonSurvivorGame
// so that main.ts stays under 200 lines.

import { Group } from 'three';
import type { GameState } from './state';
import type { NeonSurvivorGame } from './main';

export function handleGameOver(game: NeonSurvivorGame): void {
  const { state, gameHUD, restartGame } = game as unknown as {
    state: GameState;
    gameHUD: { showGameOver: (score: number, onRestart: () => void) => void };
    restartGame: () => void;
  };
  if (state.playerData.hp <= 0 && state.state === 'playing') {
    state.state = 'gameover';
    gameHUD.showGameOver(state.score, () => restartGame.call(game));
  }
}

export function flushWaveAnnounce(game: NeonSurvivorGame): void {
  const { state, gameHUD } = game as unknown as {
    state: GameState;
    gameHUD: { setWaveAnnounce: (text: string, t: number) => void };
  };
  if (state.waveAnnounceT > 0 && state.waveAnnounceText) {
    gameHUD.setWaveAnnounce(state.waveAnnounceText, state.waveAnnounceT);
    state.waveAnnounceT = 0;
    state.waveAnnounceText = '';
  }
}

export function updateCameraRig(
  camera: import('three').PerspectiveCamera,
  playerMesh: Group,
  yaw: number,
  pitch: number,
  keys: Record<string, boolean>,
  applyOverShoulderCamera: (
    cam: import('three').PerspectiveCamera,
    yaw: number,
    pitch: number,
    sprinting: boolean,
    pos: { x: number; y: number; z: number },
  ) => void,
): void {
  const sprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];
  applyOverShoulderCamera(camera, yaw, pitch, sprinting, playerMesh.position);
  playerMesh.rotation.y = yaw + Math.PI;
}
