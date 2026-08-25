import type { ActionState } from "./ActionState";

/**
 * DOM virtual joystick overlay. Drag inside the base to drive the action;
 * magnitude maps to `set(action, magnitude > threshold)`.
 */
export class VirtualJoystick {
  public readonly root: HTMLDivElement;
  public readonly knob: HTMLDivElement;

  private readonly action: string;
  private readonly actions: ActionState;
  private active = false;
  private readonly threshold = 0.25;
  private readonly baseRadius = 60;

  constructor(action: string, actions: ActionState) {
    this.action = action;
    this.actions = actions;

    this.root = document.createElement("div");
    this.root.style.cssText = [
      "position:fixed",
      "left:24px",
      "bottom:24px",
      `width:${this.baseRadius * 2}px`,
      `height:${this.baseRadius * 2}px`,
      "border-radius:50%",
      "background:rgba(255,255,255,0.15)",
      "border:2px solid rgba(255,255,255,0.35)",
      "touch-action:none",
      "user-select:none",
      "z-index:1000",
    ].join(";");

    this.knob = document.createElement("div");
    this.knob.style.cssText = [
      "position:absolute",
      "left:50%",
      "top:50%",
      "width:48px",
      "height:48px",
      "margin-left:-24px",
      "margin-top:-24px",
      "border-radius:50%",
      "background:rgba(255,255,255,0.55)",
      "transition:transform 80ms ease-out",
    ].join(";");
    this.root.appendChild(this.knob);
    document.body.appendChild(this.root);

    this.root.addEventListener("touchstart", this.onStart, { passive: false });
    this.root.addEventListener("touchmove", this.onMove, { passive: false });
    this.root.addEventListener("touchend", this.onEnd, { passive: false });
    this.root.addEventListener("touchcancel", this.onEnd, { passive: false });
    this.root.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  private center(): { x: number; y: number } {
    const rect = this.root.getBoundingClientRect();
    return { x: rect.left + this.baseRadius, y: rect.top + this.baseRadius };
  }

  private applyVector(dx: number, dy: number): void {
    const max = this.baseRadius;
    const dist = Math.min(Math.hypot(dx, dy), max);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * dist;
    const ny = Math.sin(angle) * dist;
    this.knob.style.transform = `translate(${nx}px, ${ny}px)`;
    const mag = dist / max;
    this.actions.set(this.action, mag > this.threshold);
  }

  private readonly onStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.active = true;
    const t = e.touches[0];
    if (!t) return;
    const c = this.center();
    this.applyVector(t.clientX - c.x, t.clientY - c.y);
  };

  private readonly onMove = (e: TouchEvent): void => {
    if (!this.active) return;
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    const c = this.center();
    this.applyVector(t.clientX - c.x, t.clientY - c.y);
  };

  private readonly onEnd = (e: TouchEvent): void => {
    e.preventDefault();
    this.active = false;
    this.knob.style.transform = "translate(0,0)";
    this.actions.set(this.action, false);
  };

  private readonly onMouseDown = (e: MouseEvent): void => {
    this.active = true;
    const c = this.center();
    this.applyVector(e.clientX - c.x, e.clientY - c.y);
  };

  private readonly onMouseMove = (e: MouseEvent): void => {
    if (!this.active) return;
    const c = this.center();
    this.applyVector(e.clientX - c.x, e.clientY - c.y);
  };

  private readonly onMouseUp = (): void => {
    if (!this.active) return;
    this.active = false;
    this.knob.style.transform = "translate(0,0)";
    this.actions.set(this.action, false);
  };

  /** Remove the joystick from the DOM and detach handlers. */
  dispose(): void {
    this.root.removeEventListener("touchstart", this.onStart);
    this.root.removeEventListener("touchmove", this.onMove);
    this.root.removeEventListener("touchend", this.onEnd);
    this.root.removeEventListener("touchcancel", this.onEnd);
    this.root.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.root.remove();
    this.actions.set(this.action, false);
  }
}