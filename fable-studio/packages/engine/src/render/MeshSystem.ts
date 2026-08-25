import { Object3D } from "three";
import type { System } from "../core/System";
import type { World } from "../core/World";
import { Components, type MeshData, type TransformData } from "../core/Component";

/**
 * Mirror Component.Transform + Component.Mesh into Three.js Object3D positions.
 * Systems adding visual entities set Component.Mesh with a pre-built Object3D.
 */
export class MeshSystem implements System {
  public readonly signature = [Components.Transform, Components.Mesh] as const;
  public readonly priority = 10;

  public update(world: World, _dt: number): void {
    const ents = world.query(this.signature);
    for (const e of ents) {
      const t = e.get<TransformData>(Components.Transform);
      const m = e.get<MeshData>(Components.Mesh);
      if (!t || !m) continue;
      const obj = m.object as Object3D | undefined;
      if (!obj) continue;
      obj.position.set(t.position.x, t.position.y, t.position.z);
      obj.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
      obj.scale.set(t.scale.x, t.scale.y, t.scale.z);
    }
  }
}