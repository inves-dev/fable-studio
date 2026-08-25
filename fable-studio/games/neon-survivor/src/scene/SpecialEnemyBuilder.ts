// Neon Survivor - Special-shape enemy meshes (drone + sentinel).
// These have bespoke silhouettes so they live outside the humanoid builder.

import {
  CapsuleGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

import { ENEMY_PALETTES } from '../enemies';

export function buildDroneMesh(): Group {
  const p = ENEMY_PALETTES.drone;
  const g = new Group();
  const bodyMat = new MeshStandardMaterial({
    color: p.body, metalness: 0.7, roughness: 0.3,
    emissive: p.body, emissiveIntensity: 0.3,
  });
  const accentMat = new MeshStandardMaterial({
    color: p.accent, metalness: 0.5, roughness: 0.4,
    emissive: p.glow, emissiveIntensity: 0.7,
  });
  const body = new Mesh(new SphereGeometry(0.4, 8, 6), bodyMat);
  body.scale.set(1, 0.5, 1);
  g.add(body);
  const cockpit = new Mesh(new SphereGeometry(0.18, 8, 6), new MeshBasicMaterial({ color: p.glow }));
  cockpit.position.set(0, 0.05, 0.2);
  g.add(cockpit);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const arm = new Mesh(new CylinderGeometry(0.02, 0.02, 0.6, 4), bodyMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
    arm.lookAt(0, 0, 0);
    g.add(arm);
    const rotor = new Mesh(new CylinderGeometry(0.18, 0.18, 0.02, 6), accentMat);
    rotor.position.set(Math.cos(a) * 0.6, 0.08, Math.sin(a) * 0.6);
    g.add(rotor);
  }
  g.userData = { kind: 'enemy', enemyType: 'drone' };
  return g;
}

export function buildSentinelMesh(): Group {
  const p = ENEMY_PALETTES.sentinel;
  const g = new Group();
  const mat = new MeshStandardMaterial({
    color: p.body, metalness: 0.6, roughness: 0.4,
    emissive: p.body, emissiveIntensity: 0.3,
  });
  const accent = new MeshStandardMaterial({
    color: p.accent, metalness: 0.5, roughness: 0.3,
    emissive: p.glow, emissiveIntensity: 0.6,
  });
  const torso = new Mesh(new CapsuleGeometry(0.20, 0.30, 6, 10), mat);
  torso.position.y = 0.85;
  g.add(torso);
  const head = new Mesh(new SphereGeometry(0.18, 10, 8), mat);
  head.scale.set(1, 0.85, 1);
  head.position.y = 1.30;
  g.add(head);
  const lens = new Mesh(new CylinderGeometry(0.10, 0.10, 0.20, 8), accent);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 1.30, 0.22);
  g.add(lens);
  const eye = new Mesh(new SphereGeometry(0.04, 6, 4), new MeshBasicMaterial({ color: p.eye }));
  eye.position.set(0, 1.30, 0.32);
  g.add(eye);
  const legMat = new MeshStandardMaterial({ color: p.joint, metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new Mesh(new CylinderGeometry(0.04, 0.04, 0.8, 4), legMat);
    leg.position.set(Math.cos(a) * 0.3, 0.4, Math.sin(a) * 0.3);
    leg.rotation.z = Math.cos(a) * 0.3;
    leg.rotation.x = -Math.sin(a) * 0.3;
    g.add(leg);
  }
  g.userData = { kind: 'enemy', enemyType: 'sentinel' };
  return g;
}
