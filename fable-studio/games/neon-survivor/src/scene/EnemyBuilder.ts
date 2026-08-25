// Neon Survivor - Humanoid enemy mesh builder.
// Dispatch by kind: drone + sentinel have dedicated silhouettes (see SpecialEnemyBuilder).

import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

import type { EnemyKind } from '../enemies';
import { ENEMY_PALETTES } from '../enemies';
import { ANATOMY } from '../anatomy';
import { buildDroneMesh, buildSentinelMesh } from './SpecialEnemyBuilder';

export function buildEnemyMesh(type: EnemyKind): Group {
  if (type === 'drone') return buildDroneMesh();
  if (type === 'sentinel') return buildSentinelMesh();

  const g = new Group();
  const p = ENEMY_PALETTES[type];
  const a = ANATOMY[type];
  const baseMat: MeshStandardMaterial = new MeshStandardMaterial({
    color: p.body,
    metalness: 0.5,
    roughness: 0.45,
    emissive: p.body,
    emissiveIntensity: 0.25,
  });
  if (type === 'phantom') {
    baseMat.transparent = true;
    baseMat.opacity = 0.6;
  }
  const matAccent = new MeshStandardMaterial({
    color: p.accent, metalness: 0.6, roughness: 0.35,
    emissive: p.glow, emissiveIntensity: 0.5,
  });
  const matJoint = new MeshStandardMaterial({ color: p.joint, metalness: 0.7, roughness: 0.4 });

  const pelvis = new Mesh(new BoxGeometry(a.torsoR * 2.4, 0.16, a.torsoR * 1.6), matJoint);
  pelvis.position.y = a.legLen + 0.08;
  g.add(pelvis);

  const torsoGroup = new Group();
  torsoGroup.position.y = a.legLen + 0.20 + a.torsoH * 0.4;
  g.add(torsoGroup);

  const torso = new Mesh(new CapsuleGeometry(a.torsoR, a.torsoH, 6, 10), baseMat);
  torsoGroup.add(torso);

  const chest = new Mesh(new BoxGeometry(a.torsoR * 1.7, a.torsoH * 0.8, 0.06), matAccent);
  chest.position.set(0, 0, a.torsoR + 0.02);
  torsoGroup.add(chest);

  const back = new Mesh(new BoxGeometry(a.torsoR * 1.8, a.torsoH * 0.9, 0.05), matJoint);
  back.position.set(0, 0, -a.torsoR - 0.01);
  torsoGroup.add(back);

  if (type !== 'runner') {
    const core = new Mesh(new SphereGeometry(0.07, 10, 8), new MeshBasicMaterial({ color: p.glow }));
    core.position.set(0, 0, a.torsoR + 0.08);
    torsoGroup.add(core);
  }

  const head = new Mesh(new SphereGeometry(a.headR, 10, 8), baseMat);
  head.position.y = a.torsoH * 0.5 + a.headR * 0.9;
  head.scale.set(1, 1.05, 1);
  torsoGroup.add(head);

  for (const side of [-1, 1]) {
    const eye = new Mesh(new SphereGeometry(a.headR * 0.18, 6, 4), new MeshBasicMaterial({ color: p.eye }));
    eye.position.set(side * a.headR * 0.55, a.torsoH * 0.5 + a.headR * 0.9, a.headR * 0.85);
    torsoGroup.add(eye);
  }

  for (const side of [-1, 1]) {
    const arm = new Mesh(new CapsuleGeometry(a.armR, a.armLen, 4, 8), baseMat);
    arm.position.set(side * a.shoulderW * 0.5, -a.torsoH * 0.1, 0);
    torsoGroup.add(arm);
  }

  for (const side of [-1, 1]) {
    const leg = new Mesh(new CapsuleGeometry(a.legR, a.legLen, 4, 8), baseMat);
    leg.position.set(side * a.torsoR * 0.7, a.legLen * 0.5, 0);
    g.add(leg);
  }

  g.userData = { kind: 'enemy', enemyType: type, torsoGroup };
  return g;
}
