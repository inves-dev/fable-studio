// Candy Crush - Candy entity.
// Each candy is a small beveled cube with emissive neon material.

import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Group,
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
} from 'three';
import { CANDY_TYPES } from '../config.js';

// Reusable shared geometry across all candy instances (saves memory).
const SHARED_GEOMETRY = new BoxGeometry(0.85, 0.85, 0.85);

// Cache materials per type id so we don't recreate them each swap.
const MATERIAL_CACHE: Map<number, MeshStandardMaterial> = new Map();

function getMaterial(type: number): MeshStandardMaterial {
  const cached = MATERIAL_CACHE.get(type);
  if (cached) return cached;

  const def = CANDY_TYPES[type];
  const color = new Color(def.color);

  const mat = new MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.25,
  });

  MATERIAL_CACHE.set(type, mat);
  return mat;
}

// Create a candy mesh for the given type id. Returns a Group with the cube
// plus a neon outline so it pops against the dark background.
export function createCandy(type: number): Group {
  const group = new Group();
  group.name = `candy-${CANDY_TYPES[type].name}`;

  const cube = new Mesh(SHARED_GEOMETRY, getMaterial(type));
  group.add(cube);

  const edges = new EdgesGeometry(SHARED_GEOMETRY);
  const outlineMat = new LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
  });
  const outline = new LineSegments(edges, outlineMat);
  group.add(outline);

  return group;
}

// Returns the inner Mesh (handy for raycasting).
export function getCandyMesh(group: Group): Mesh {
  return group.children[0] as Mesh;
}

// Pick a random candy type id.
export function randomCandyType(): number {
  return Math.floor(Math.random() * CANDY_TYPES.length);
}
