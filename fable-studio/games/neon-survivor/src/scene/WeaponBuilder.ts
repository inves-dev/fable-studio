// Neon Survivor - Weapon mesh builder.
// Slots 0=pistola, 1=rifle, 2=shotgun (used by WEAPONS[1..3] via applyWeapon mapping).

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';

export function buildWeaponMesh(slot: number): Group {
  switch (slot) {
    case 0: return buildPistolMesh();
    case 1: return buildRifleMesh();
    case 2: return buildShotgunMesh();
    default: return buildRifleMesh();
  }
}

function buildPistolMesh(): Group {
  const g = new Group();
  const bodyMat = new MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.7, roughness: 0.35 });
  const trimMat = new MeshStandardMaterial({
    color: 0x00e0ff,
    emissive: new Color(0x00e0ff),
    emissiveIntensity: 1.2,
  });
  const slide = new Mesh(new BoxGeometry(0.08, 0.10, 0.30), bodyMat);
  slide.position.set(0, 0, -0.20);
  g.add(slide);
  const grip = new Mesh(new BoxGeometry(0.08, 0.18, 0.12), bodyMat);
  grip.position.set(0, -0.13, 0.05);
  g.add(grip);
  const trigger = new Mesh(new BoxGeometry(0.04, 0.06, 0.04), trimMat);
  trigger.position.set(0, -0.05, -0.02);
  g.add(trigger);
  return g;
}

function buildRifleMesh(): Group {
  const g = new Group();
  const bodyMat = new MeshStandardMaterial({ color: 0x222230, metalness: 0.65, roughness: 0.35 });
  const barrelMat = new MeshStandardMaterial({ color: 0x101018, metalness: 0.85, roughness: 0.2 });
  const accent = new MeshStandardMaterial({
    color: 0xff00d4,
    emissive: new Color(0xff00d4),
    emissiveIntensity: 1.0,
  });
  // barrel
  const barrel = new Mesh(new CylinderGeometry(0.05, 0.05, 0.6, 8), barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0, -0.45);
  g.add(barrel);
  // receiver
  const recv = new Mesh(new BoxGeometry(0.12, 0.12, 0.36), bodyMat);
  recv.position.set(0, 0, -0.05);
  g.add(recv);
  // mag
  const mag = new Mesh(new BoxGeometry(0.10, 0.16, 0.10), bodyMat);
  mag.position.set(0, -0.16, 0.05);
  g.add(mag);
  // stock
  const stock = new Mesh(new BoxGeometry(0.08, 0.10, 0.20), bodyMat);
  stock.position.set(0, 0, 0.20);
  g.add(stock);
  // accent strip
  const strip = new Mesh(new BoxGeometry(0.04, 0.02, 0.30), accent);
  strip.position.set(0, 0.065, -0.05);
  g.add(strip);
  return g;
}

function buildShotgunMesh(): Group {
  const g = new Group();
  const bodyMat = new MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.7, roughness: 0.4 });
  const barrelMat = new MeshStandardMaterial({ color: 0x121218, metalness: 0.8, roughness: 0.3 });
  const accent = new MeshStandardMaterial({
    color: 0x66ffaa,
    emissive: new Color(0x66ffaa),
    emissiveIntensity: 0.9,
  });
  // double barrel
  const b1 = new Mesh(new CylinderGeometry(0.06, 0.06, 0.85, 8), barrelMat);
  b1.rotation.x = Math.PI / 2;
  b1.position.set(-0.04, 0, -0.55);
  g.add(b1);
  const b2 = new Mesh(new CylinderGeometry(0.06, 0.06, 0.85, 8), barrelMat);
  b2.rotation.x = Math.PI / 2;
  b2.position.set(0.04, 0, -0.55);
  g.add(b2);
  const pump = new Mesh(new BoxGeometry(0.18, 0.10, 0.14), bodyMat);
  pump.position.set(0, -0.02, -0.20);
  g.add(pump);
  const recv = new Mesh(new BoxGeometry(0.12, 0.14, 0.18), bodyMat);
  recv.position.set(0, 0, 0.05);
  g.add(recv);
  const grip = new Mesh(new BoxGeometry(0.08, 0.18, 0.10), bodyMat);
  grip.position.set(0, -0.16, 0.10);
  g.add(grip);
  const strip = new Mesh(new BoxGeometry(0.14, 0.02, 0.10), accent);
  strip.position.set(0, 0.075, 0.05);
  g.add(strip);
  return g;
}
