import * as THREE from 'three';
import {
  buildCube,
  buildSphere,
  buildCylinder,
  buildTorus,
  clearCache as clearMeshCache,
} from './ProceduralMesh';
import {
  buildGradientTexture,
  clearCache as clearTextureCache,
} from './ProceduralTexture';

// Central asset registry: shorthand factories that wire mesh + texture +
// material into a ready-to-use THREE.Mesh. All resources are cached so
// reuse is cheap.

export interface BuiltAsset {
  mesh: THREE.Mesh;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  texture?: THREE.Texture;
}

export interface CubeOptions {
  width?: number;
  height?: number;
  depth?: number;
  color?: number | string;
  texture?: THREE.Texture;
}

export function buildCubeAsset(opts: CubeOptions = {}): BuiltAsset {
  const geometry = buildCube({ width: opts.width, height: opts.height, depth: opts.depth });
  const material = new THREE.MeshStandardMaterial({
    color: typeof opts.color === 'string' ? new THREE.Color(opts.color) : (opts.color ?? 0x00e0ff),
    map: opts.texture,
    metalness: 0.4,
    roughness: 0.35,
    emissive: 0x220033,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, geometry, material, texture: opts.texture };
}

export interface SphereOptions {
  radius?: number;
  color?: number | string;
  texture?: THREE.Texture;
  emissive?: number | string;
}

export function buildSphereAsset(opts: SphereOptions = {}): BuiltAsset {
  const geometry = buildSphere({ radius: opts.radius });
  const material = new THREE.MeshStandardMaterial({
    color: typeof opts.color === 'string' ? new THREE.Color(opts.color) : (opts.color ?? 0xff00d4),
    map: opts.texture,
    emissive: typeof opts.emissive === 'string' ? new THREE.Color(opts.emissive) : (opts.emissive ?? 0x110022),
    metalness: 0.5,
    roughness: 0.25,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, geometry, material, texture: opts.texture };
}

export function buildCylinderAsset(opts: { radius?: number; height?: number; color?: number | string } = {}): BuiltAsset {
  const geometry = buildCylinder({ radius: opts.radius, height: opts.height });
  const material = new THREE.MeshStandardMaterial({
    color: typeof opts.color === 'string' ? new THREE.Color(opts.color) : (opts.color ?? 0x9b5cff),
    metalness: 0.6,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, geometry, material };
}

export function buildTorusAsset(opts: { radius?: number; tubeRadius?: number; color?: number | string } = {}): BuiltAsset {
  const geometry = buildTorus({ radius: opts.radius, tubeRadius: opts.tubeRadius });
  const material = new THREE.MeshStandardMaterial({
    color: typeof opts.color === 'string' ? new THREE.Color(opts.color) : (opts.color ?? 0xffe066),
    emissive: 0x331100,
    metalness: 0.7,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, geometry, material };
}

// Neon gradient backdrop (frequently used as scene sky or panel).
export function buildNeonGradient(
  from = '#0a0a1a',
  to = '#2a0050',
  direction: 'horizontal' | 'vertical' | 'radial' = 'radial',
  w = 512,
  h = 512,
): THREE.Texture {
  return buildGradientTexture({ width: w, height: h, from, to, direction });
}

export function disposeAll(): void {
  clearMeshCache();
  clearTextureCache();
}