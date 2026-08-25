// Neon Survivor - Procedural city builder.
// Ground plane + scattered block buildings + neon trim + lamp posts.

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from 'three';

import { ARENA } from '../config';
import { COLORS } from '../modes';

export interface BuildingRecord {
  position: { x: number; z: number };
  w: number;
  d: number;
  h: number;
  mesh: Group;
}

export interface CityResult {
  buildings: BuildingRecord[];
  lampPosts: Group[];
}

const TRIM_COLORS = [0x00e0ff, 0xff00d4, 0x6600ff, 0x00ffaa, 0xff2266];

function rng(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function buildCity(scene: Scene): CityResult {
  // ground
  const groundGeo = new BoxGeometry(ARENA.size + 80, 0.4, ARENA.size + 80);
  const groundMat = new MeshStandardMaterial({
    color: new Color(COLORS.ground),
    metalness: 0.4,
    roughness: 0.85,
  });
  const ground = new Mesh(groundGeo, groundMat);
  ground.position.y = -0.2;
  ground.userData = { kind: 'ground' };
  scene.add(ground);

  const buildings: BuildingRecord[] = [];
  const lampPosts: Group[] = [];

  // sparse grid of buildings, avoiding the center spawn
  const cellSize = (ARENA.size - 12) / ARENA.blocks;
  const centerClear = 14;

  for (let gx = 0; gx < ARENA.blocks; gx++) {
    for (let gz = 0; gz < ARENA.blocks; gz++) {
      const cx = -ARENA.size / 2 + 6 + (gx + 0.5) * cellSize;
      const cz = -ARENA.size / 2 + 6 + (gz + 0.5) * cellSize;
      if (Math.hypot(cx, cz) < centerClear) continue;
      // skip some cells for streets
      if (Math.random() < 0.18) continue;

      const w = rng(3.0, 5.5);
      const d = rng(3.0, 5.5);
      const h = rng(4, 12);
      const trimColor = TRIM_COLORS[Math.floor(Math.random() * TRIM_COLORS.length)];

      const group = new Group();
      const body = new Mesh(
        new BoxGeometry(w, h, d),
        new MeshStandardMaterial({
          color: new Color(COLORS.buildingDark),
          metalness: 0.45,
          roughness: 0.55,
          emissive: new Color(trimColor),
          emissiveIntensity: 0.08,
        }),
      );
      body.position.y = h / 2;
      body.castShadow = false;
      group.add(body);

      // glowing trim lines at base + top
      const edges = new EdgesGeometry(body.geometry);
      const edgeMat = new LineBasicMaterial({ color: new Color(trimColor), transparent: true, opacity: 0.85 });
      const edgeLines = new LineSegments(edges, edgeMat);
      edgeLines.position.y = h / 2;
      group.add(edgeLines);

      // top trim
      const topTrim = new Mesh(
        new BoxGeometry(w + 0.2, 0.08, d + 0.2),
        new MeshStandardMaterial({
          color: new Color(trimColor),
          emissive: new Color(trimColor),
          emissiveIntensity: 1.4,
        }),
      );
      topTrim.position.y = h;
      group.add(topTrim);

      // small antenna / light spire
      if (Math.random() < 0.5) {
        const spire = new Mesh(
          new CylinderGeometry(0.04, 0.04, 1.4, 6),
          new MeshStandardMaterial({ color: 0x202028, emissive: new Color(trimColor), emissiveIntensity: 0.4 }),
        );
        spire.position.y = h + 0.7;
        group.add(spire);
        const orb = new Mesh(
          new CylinderGeometry(0.10, 0.10, 0.02, 8),
          new MeshStandardMaterial({ color: new Color(trimColor), emissive: new Color(trimColor), emissiveIntensity: 2.5 }),
        );
        orb.position.y = h + 1.4;
        group.add(orb);
      }

      group.position.set(cx, 0, cz);
      group.userData = { kind: 'building', w, d, h };
      scene.add(group);

      buildings.push({ position: { x: cx, z: cz }, w, d, h, mesh: group });
    }
  }

  // lamp posts on outer ring
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = ARENA.size / 2 - 1;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const post = new Group();
    const pole = new Mesh(
      new CylinderGeometry(0.06, 0.08, 4, 8),
      new MeshStandardMaterial({ color: 0x222233, metalness: 0.7, roughness: 0.3 }),
    );
    pole.position.y = 2;
    post.add(pole);
    const lamp = new Mesh(
      new CylinderGeometry(0.20, 0.20, 0.18, 12),
      new MeshStandardMaterial({
        color: 0xffeeaa,
        emissive: 0xffeeaa,
        emissiveIntensity: 1.6,
      }),
    );
    lamp.position.y = 4.05;
    post.add(lamp);
    post.position.set(x, 0, z);
    post.userData = { kind: 'lamp' };
    scene.add(post);
    lampPosts.push(post);
  }

  return { buildings, lampPosts };
}
