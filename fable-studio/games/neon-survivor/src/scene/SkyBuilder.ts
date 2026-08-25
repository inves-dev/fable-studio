// Neon Survivor - Procedural sky builder.
// Distant gradient + horizon haze + neon star dots.

import {
  BackSide,
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  Scene,
  SphereGeometry,
  AdditiveBlending,
  PointsMaterial,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three';

import { COLORS } from '../modes';

export function buildSky(scene: Scene): void {
  const radius = 200;
  const geo = new SphereGeometry(radius, 32, 16);
  // vertical gradient: black at zenith -> deep purple near horizon
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#02010a');
  grad.addColorStop(0.5, '#0c0428');
  grad.addColorStop(0.85, '#2a063a');
  grad.addColorStop(1, '#ff00d4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new CanvasTexture(canvas);
  const mat = new MeshBasicMaterial({ map: tex, side: BackSide, depthWrite: false });
  const dome = new Mesh(geo, mat);
  dome.userData = { kind: 'sky' };
  scene.add(dome);

  // horizon haze ring
  const hazeCanvas = document.createElement('canvas');
  hazeCanvas.width = 512;
  hazeCanvas.height = 64;
  const hctx = hazeCanvas.getContext('2d')!;
  const hg = hctx.createLinearGradient(0, 0, 0, 64);
  hg.addColorStop(0, 'rgba(255,0,212,0)');
  hg.addColorStop(0.5, 'rgba(255,0,212,0.45)');
  hg.addColorStop(1, 'rgba(255,0,212,0)');
  hctx.fillStyle = hg;
  hctx.fillRect(0, 0, 512, 64);
  const hazeTex = new CanvasTexture(hazeCanvas);
  const hazeMat = new MeshBasicMaterial({ map: hazeTex, transparent: true, depthWrite: false, color: new Color(COLORS.neonPink) });
  const haze = new Mesh(new SphereGeometry(radius * 0.95, 32, 12), hazeMat);
  haze.userData = { kind: 'sky-haze' };
  scene.add(haze);

  // neon stars
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const u = Math.random();
    const v = Math.random() * 0.5 + 0.25; // upper hemisphere
    const theta = u * Math.PI * 2;
    const phi = Math.acos(v);
    positions[i * 3] = radius * 0.95 * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * 0.95 * Math.cos(phi);
    positions[i * 3 + 2] = radius * 0.95 * Math.sin(phi) * Math.sin(theta);
  }
  const sgeo = new BufferGeometry();
  sgeo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  const smat = new PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const stars = new Points(sgeo, smat);
  stars.userData = { kind: 'sky-stars' };
  scene.add(stars);
}
