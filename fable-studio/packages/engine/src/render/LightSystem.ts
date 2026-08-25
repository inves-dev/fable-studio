import { AmbientLight, DirectionalLight, Scene } from "three";

/**
 * Lighting rig: ambient fill + a key directional light with simple shadows.
 * Pure side-effect system — call once on scene setup.
 */
export class LightSystem {
  public readonly ambient: AmbientLight;
  public readonly directional: DirectionalLight;

  constructor(scene: Scene) {
    this.ambient = new AmbientLight(0xffffff, 0.55);
    scene.add(this.ambient);

    this.directional = new DirectionalLight(0xffffff, 0.9);
    this.directional.position.set(8, 12, 6);
    this.directional.castShadow = true;
    this.directional.shadow.mapSize.set(1024, 1024);
    this.directional.shadow.camera.near = 0.5;
    this.directional.shadow.camera.far = 50;
    this.directional.shadow.camera.left = -20;
    this.directional.shadow.camera.right = 20;
    this.directional.shadow.camera.top = 20;
    this.directional.shadow.camera.bottom = -20;
    scene.add(this.directional);
  }
}