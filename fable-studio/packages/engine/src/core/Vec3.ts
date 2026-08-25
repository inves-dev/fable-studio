import { Vector3 } from "three";

/**
 * Thin, allocation-free wrapper around Three.js Vector3.
 * Engine code uses Vec3 instead of allocating new Vector3s every frame.
 */
export class Vec3 {
  public readonly v: Vector3;

  constructor(x = 0, y = 0, z = 0) {
    this.v = new Vector3(x, y, z);
  }

  set(x: number, y: number, z: number): this {
    this.v.set(x, y, z);
    return this;
  }

  copy(other: Vec3): this {
    this.v.copy(other.v);
    return this;
  }

  add(other: Vec3): this {
    this.v.add(other.v);
    return this;
  }

  sub(other: Vec3): this {
    this.v.sub(other.v);
    return this;
  }

  scale(s: number): this {
    this.v.multiplyScalar(s);
    return this;
  }

  length(): number {
    return this.v.length();
  }

  normalize(): this {
    this.v.normalize();
    return this;
  }

  x(): number {
    return this.v.x;
  }

  y(): number {
    return this.v.y;
  }

  z(): number {
    return this.v.z;
  }
}