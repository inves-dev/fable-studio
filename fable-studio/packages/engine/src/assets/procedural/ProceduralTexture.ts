import * as THREE from 'three';
import { randInt } from '../../util/MathUtil';

// Generate Canvas 2D textures and wrap them as Three.js texture objects.
// Cached by spec key so repeated calls return the same texture.

export type GradientDirection = 'horizontal' | 'vertical' | 'radial';

export interface GradientSpec {
  kind: 'gradient';
  width: number;
  height: number;
  from: string;
  to: string;
  direction: GradientDirection;
}

export interface NoiseSpec {
  kind: 'noise';
  width: number;
  height: number;
  base: string;
  spots: string;
  density: number;
}

export interface PatternSpec {
  kind: 'pattern';
  width: number;
  height: number;
  cell: number;
  fg: string;
  bg: string;
}

export type TextureSpec = GradientSpec | NoiseSpec | PatternSpec;

const cache = new Map<string, THREE.Texture>();

function key(spec: TextureSpec): string {
  return JSON.stringify(spec);
}

function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to acquire 2D context');
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function buildGradientTexture(spec: GradientSpec): THREE.Texture {
  const k = key(spec);
  const cached = cache.get(k);
  if (cached) return cached;
  const { canvas, ctx } = makeCanvas(spec.width, spec.height);
  let grad: CanvasGradient;
  if (spec.direction === 'horizontal') {
    grad = ctx.createLinearGradient(0, 0, spec.width, 0);
  } else if (spec.direction === 'vertical') {
    grad = ctx.createLinearGradient(0, 0, 0, spec.height);
  } else {
    grad = ctx.createRadialGradient(
      spec.width / 2, spec.height / 2, 0,
      spec.width / 2, spec.height / 2, Math.max(spec.width, spec.height) / 2,
    );
  }
  grad.addColorStop(0, spec.from);
  grad.addColorStop(1, spec.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, spec.width, spec.height);
  const tex = toTexture(canvas);
  cache.set(k, tex);
  return tex;
}

export function buildNoiseTexture(spec: NoiseSpec): THREE.Texture {
  const k = key(spec);
  const cached = cache.get(k);
  if (cached) return cached;
  const { canvas, ctx } = makeCanvas(spec.width, spec.height);
  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, spec.width, spec.height);
  const count = Math.floor((spec.width * spec.height) * spec.density);
  ctx.fillStyle = spec.spots;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * spec.width;
    const y = Math.random() * spec.height;
    const r = randInt(1, 3);
    ctx.fillRect(x, y, r, r);
  }
  const tex = toTexture(canvas);
  cache.set(k, tex);
  return tex;
}

export function buildPatternTexture(spec: PatternSpec): THREE.Texture {
  const k = key(spec);
  const cached = cache.get(k);
  if (cached) return cached;
  const { canvas, ctx } = makeCanvas(spec.width, spec.height);
  ctx.fillStyle = spec.bg;
  ctx.fillRect(0, 0, spec.width, spec.height);
  ctx.fillStyle = spec.fg;
  for (let y = 0; y < spec.height; y += spec.cell) {
    for (let x = 0; x < spec.width; x += spec.cell) {
      if ((x / spec.cell + y / spec.cell) % 2 === 0) {
        ctx.fillRect(x, y, spec.cell, spec.cell);
      }
    }
  }
  const tex = toTexture(canvas);
  cache.set(k, tex);
  return tex;
}

export function buildTexture(spec: TextureSpec): THREE.Texture {
  switch (spec.kind) {
    case 'gradient': return buildGradientTexture(spec);
    case 'noise':    return buildNoiseTexture(spec);
    case 'pattern':  return buildPatternTexture(spec);
  }
}

export function clearCache(): void {
  for (const tex of cache.values()) tex.dispose();
  cache.clear();
}