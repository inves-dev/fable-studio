import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  Color,
} from "three";
import { World } from "./World";

/** Tunables for Engine construction. All optional. */
export interface EngineOptions {
  backgroundHex?: number;
  pixelRatioCap?: number;
  fov?: number;
  near?: number;
  far?: number;
}

/**
 * Engine = Three.js scene + World + main loop. Public surface for app code.
 * One Engine per canvas. Construct, register systems, then `start()`.
 */
export class Engine {
  public readonly scene: Scene;
  public readonly camera: PerspectiveCamera;
  public readonly renderer: WebGLRenderer;
  public readonly world: World;

  private readonly canvas: HTMLCanvasElement;
  private readonly pixelRatioCap: number;
  private readonly clock: Clock;
  private running = false;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions = {}) {
    this.canvas = canvas;
    this.pixelRatioCap = opts.pixelRatioCap ?? 1.5;

    this.scene = new Scene();
    if (typeof opts.backgroundHex === "number") {
      this.scene.background = new Color(opts.backgroundHex);
    }

    this.camera = new PerspectiveCamera(
      opts.fov ?? 60,
      1,
      opts.near ?? 0.1,
      opts.far ?? 1000,
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.pixelRatioCap));

    this.world = new World();
    this.clock = new Clock();

    this.onResize();
    window.addEventListener("resize", this.onResize);
  }

  /** Start the game loop. Idempotent. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = (): void => {
      if (!this.running) return;
      const dt = Math.min(this.clock.getDelta(), 0.1);
      this.world.step(dt);
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** Stop the game loop. Render will halt. */
  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Resume after stop. */
  resume(): void {
    if (this.running) return;
    this.start();
  }

  /** Match canvas to its CSS size and cap pixel ratio. */
  public readonly onResize = (): void => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.pixelRatioCap));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  /** Dispose Three.js resources and detach listeners. */
  dispose(): void {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
  }
}