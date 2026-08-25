import * as THREE from 'three';

// Builder helpers that return Three.js BufferGeometry primitives, all cached
// per spec so repeated calls share the same GPU geometry.

interface MeshSpec {
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;
  tubeRadius?: number;
  radialSegments?: number;
  tubularSegments?: number;
}

const cache = new Map<string, THREE.BufferGeometry>();

function key(prefix: string, spec: MeshSpec): string {
  return `${prefix}:${JSON.stringify(spec)}`;
}

export function buildCube(spec: MeshSpec = {}): THREE.BufferGeometry {
  const k = key('cube', spec);
  let geo = cache.get(k);
  if (!geo) {
    geo = new THREE.BoxGeometry(spec.width ?? 1, spec.height ?? 1, spec.depth ?? 1);
    cache.set(k, geo);
  }
  return geo;
}

export function buildSphere(spec: MeshSpec = {}): THREE.BufferGeometry {
  const k = key('sphere', spec);
  let geo = cache.get(k);
  if (!geo) {
    geo = new THREE.SphereGeometry(
      spec.radius ?? 0.5,
      spec.segments ?? 24,
      spec.segments ?? 16,
    );
    cache.set(k, geo);
  }
  return geo;
}

export function buildCylinder(spec: MeshSpec = {}): THREE.BufferGeometry {
  const k = key('cyl', spec);
  let geo = cache.get(k);
  if (!geo) {
    geo = new THREE.CylinderGeometry(
      spec.radius ?? 0.5,
      spec.radius ?? 0.5,
      spec.height ?? 1,
      spec.segments ?? 20,
    );
    cache.set(k, geo);
  }
  return geo;
}

export function buildTorus(spec: MeshSpec = {}): THREE.BufferGeometry {
  const k = key('torus', spec);
  let geo = cache.get(k);
  if (!geo) {
    geo = new THREE.TorusGeometry(
      spec.radius ?? 0.5,
      spec.tubeRadius ?? 0.18,
      spec.radialSegments ?? 12,
      spec.tubularSegments ?? 48,
    );
    cache.set(k, geo);
  }
  return geo;
}

export function clearCache(): void {
  for (const geo of cache.values()) geo.dispose();
  cache.clear();
}