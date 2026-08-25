// Neon Survivor - Player entity.
// Builds the player entity (Transform + Health + Mesh + PlayerTag)
// and the visual humanoid body. The gun slot lives at userData.gunGroup.

import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

import { Components as Core } from '@nanagames/engine/core/Component';
import type { Entity } from '@nanagames/engine/core/Entity';
import { NS } from '../components';
import { PLAYER_DEFAULTS } from '../config';

const BODY = 0x202840;
const ACCENT = 0x00e0ff;
const GLOW = 0x66f0ff;
const HEAD = 0xeaf6ff;

export function buildPlayerMesh(): Group {
  const root = new Group();
  root.name = 'player';

  const bodyMat = new MeshStandardMaterial({
    color: BODY, metalness: 0.55, roughness: 0.45,
    emissive: BODY, emissiveIntensity: 0.25,
  });
  const accentMat = new MeshStandardMaterial({
    color: ACCENT, metalness: 0.65, roughness: 0.35,
    emissive: new Color(GLOW), emissiveIntensity: 0.8,
  });
  const headMat = new MeshStandardMaterial({
    color: HEAD, metalness: 0.2, roughness: 0.55,
  });

  const pelvis = new Mesh(new BoxGeometry(0.40, 0.18, 0.26), bodyMat);
  pelvis.position.y = 0.45;
  root.add(pelvis);
  const torso = new Mesh(new CapsuleGeometry(0.22, 0.30, 6, 10), bodyMat);
  torso.position.y = 0.78;
  root.add(torso);
  const chest = new Mesh(new BoxGeometry(0.36, 0.34, 0.04), accentMat);
  chest.position.set(0, 0.78, 0.22);
  root.add(chest);
  const core = new Mesh(new SphereGeometry(0.06, 10, 8), accentMat);
  core.position.set(0, 0.78, 0.25);
  root.add(core);
  const head = new Mesh(new SphereGeometry(0.18, 14, 12), headMat);
  head.position.y = 1.12;
  head.scale.set(1, 1.05, 1);
  root.add(head);
  const visor = new Mesh(new BoxGeometry(0.30, 0.08, 0.04), accentMat);
  visor.position.set(0, 1.13, 0.16);
  root.add(visor);
  for (const side of [-1, 1]) {
    const leg = new Mesh(new CapsuleGeometry(0.10, 0.50, 4, 8), bodyMat);
    leg.position.set(side * 0.13, 0.25, 0);
    root.add(leg);
  }
  for (const side of [-1, 1]) {
    const arm = new Mesh(new CapsuleGeometry(0.08, 0.36, 4, 8), bodyMat);
    arm.position.set(side * 0.34, 0.78, 0);
    root.add(arm);
  }

  // gun group sits at the right hand so weapons can swap cleanly.
  const gunGroup = new Group();
  gunGroup.position.set(0.30, 0.78, 0.30);
  root.add(gunGroup);

  root.userData = { kind: 'player', gunGroup };
  return root;
}

export function attachPlayerComponents(entity: Entity, mesh: Group): Group {
  const gunGroup = mesh.userData['gunGroup'] as Group;
  entity.set(Core.Transform, {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });
  entity.set(Core.Health, {
    current: PLAYER_DEFAULTS.maxHp,
    max: PLAYER_DEFAULTS.maxHp,
  });
  entity.set(Core.Mesh, { object: mesh });
  entity.set(NS.PlayerTag, { gunGroup });
  return gunGroup;
}
