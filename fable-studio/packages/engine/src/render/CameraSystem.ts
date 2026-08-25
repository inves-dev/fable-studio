import type { PerspectiveCamera } from "three";
import type { System } from "../core/System";
import type { World } from "../core/World";
import { Components, type TransformData } from "../core/Component";

/**
 * Third-person follow camera. Trails the first entity tagged Components.PlayerTag.
 * Back-offset and height are configurable; defaults work for a 1.7m character.
 */
export class CameraSystem implements System {
  public readonly signature = [Components.PlayerTag, Components.Transform] as const;
  public readonly priority = 100;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly offset = { x: 0, y: 4, z: 8 },
    private readonly smoothing = 0.12,
  ) {}

  public update(world: World, _dt: number): void {
    const players = world.query(this.signature);
    if (players.length === 0) return;
    const t = players[0].get<TransformData>(Components.Transform);
    if (!t) return;

    const targetX = t.position.x + this.offset.x;
    const targetY = t.position.y + this.offset.y;
    const targetZ = t.position.z + this.offset.z;

    this.camera.position.x += (targetX - this.camera.position.x) * this.smoothing;
    this.camera.position.y += (targetY - this.camera.position.y) * this.smoothing;
    this.camera.position.z += (targetZ - this.camera.position.z) * this.smoothing;
    this.camera.lookAt(t.position.x, t.position.y, t.position.z);
  }
}