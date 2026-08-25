// Candy Crush - Entry point.
// Wires Three.js (OrthographicCamera + WebGLRenderer), the GridBuilder,
// and the per-frame game loop that drives swap -> match -> cascade -> score.

import {
  AmbientLight,
  Clock,
  OrthographicCamera,
  PCFSoftShadowMap,
  PointLight,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GRID_SIZE, CELL_SIZE, WIN_SCORE } from './config.js';
import { GridBuilder } from './scene/GridBuilder.js';
import { InputSystem } from './systems/InputSystem.js';
import { SwapSystem } from './systems/SwapSystem.js';
import { findMatches } from './systems/MatchSystem.js';
import { ScoreSystem } from './systems/ScoreSystem.js';
import {
  applyGravity,
  clearMatches,
  spawnNewCandies,
} from './systems/CascadeSystem.js';
import { updateHud } from './ui/Hud.js';

// ---- Scene + camera setup -------------------------------------------------

function buildScene(canvas: HTMLCanvasElement): {
  scene: Scene;
  camera: OrthographicCamera;
  renderer: WebGLRenderer;
} {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const aspect = window.innerWidth / window.innerHeight;
  const viewSize = GRID_SIZE * CELL_SIZE * 1.1;
  const camera = new OrthographicCamera(
    -viewSize * aspect,
    viewSize * aspect,
    viewSize,
    -viewSize,
    0.1,
    100,
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();
  scene.background = new Vector3(0x0a, 0x0a, 0x14);

  scene.add(new AmbientLight(0xffffff, 0.55));

  const lamp = new PointLight(0xff6b9d, 1.4, 50);
  lamp.position.set(0, 0, 8);
  scene.add(lamp);

  const lamp2 = new PointLight(0x48dbfb, 1.1, 50);
  lamp2.position.set(0, 0, -4);
  scene.add(lamp2);

  return { scene, camera, renderer };
}

// ---- Bootstrap ------------------------------------------------------------

export function startCandyCrush(canvas: HTMLCanvasElement): () => void {
  const { scene, camera, renderer } = buildScene(canvas);

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const grid = new GridBuilder(scene, raycaster);
  const swap = new SwapSystem();
  const score = new ScoreSystem();
  // The InputSystem only needs the camera for raycaster math; OrthographicCamera
  // satisfies the structural shape via duck typing.
  const input = new InputSystem(canvas, camera as never, raycaster, ndc);

  score.setHudListener((u) => updateHud(u.score, u.targetScore, u.won));

  input.setListener((intent) => {
    const state = grid.state;
    if (intent.kind === 'select') {
      state.selected = intent.cell;
      grid.setSelected(intent.cell.row, intent.cell.col);
    } else if (intent.kind === 'deselect') {
      state.selected = null;
      grid.setSelected(null, null);
    } else if (intent.kind === 'swap') {
      grid.setSelected(null, null);
      state.selected = null;
      swap.begin(state, intent.a, intent.b, (valid) => {
        if (valid) resolveBoard();
      });
    }
  });

  // Map raw pointerups to a real raycast hit via the grid.
  canvas.addEventListener('pointerup', (e) => {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const hit = grid.pickCandy(ndc, camera);
    if (hit) input.handlePick(grid.state, hit.row, hit.col);
  });

  // Resolve matches -> gravity -> spawn, looping until the board is quiet.
  function resolveBoard(): void {
    let matches = findMatches(grid.state.grid);
    while (matches.length > 0) {
      score.apply(grid.state, matches);
      clearMatches(grid.state, matches);
      applyGravity(grid.state);
      spawnNewCandies(grid.state);
      grid.tagMeshes();
      matches = findMatches(grid.state.grid);
    }
    grid.snapMeshesToGrid();
  }

  // ---- Render loop --------------------------------------------------------
  const clock = new Clock();
  let raf = 0;

  function tick(): void {
    raf = requestAnimationFrame(tick);
    clock.getDelta(); // advance clock, value unused for now

    swap.update(grid.state);
    renderer.render(scene, camera);
  }

  function onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const viewSize = GRID_SIZE * CELL_SIZE * 1.1;
    camera.left = -viewSize * aspect;
    camera.right = viewSize * aspect;
    camera.top = viewSize;
    camera.bottom = -viewSize;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  raf = requestAnimationFrame(tick);
  updateHud(0, WIN_SCORE, false);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    input.destroy();
  };
}

// Auto-start when this module is imported with a canvas already in the DOM.
if (typeof window !== 'undefined') {
  const existing = document.querySelector<HTMLCanvasElement>(
    'canvas[data-game="candy-crush"]',
  );
  if (existing) startCandyCrush(existing);
}
