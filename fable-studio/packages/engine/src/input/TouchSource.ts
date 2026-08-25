import type { ActionState } from "./ActionState";

/**
 * Touch tap halves: left half of the element = fire, right half = dash.
 * Suitable for mobile prototypes without a virtual joystick.
 */
export function bindTouch(target: HTMLElement, actions: ActionState): () => void {
  const onStart = (e: TouchEvent): void => {
    const rect = target.getBoundingClientRect();
    const t = e.touches[0];
    if (!t) return;
    const x = t.clientX - rect.left;
    const isLeft = x < rect.width / 2;
    actions.set(isLeft ? "fire" : "dash", true);
  };
  const onEnd = (e: TouchEvent): void => {
    const rect = target.getBoundingClientRect();
    const t = e.changedTouches[0];
    if (!t) return;
    const x = t.clientX - rect.left;
    const isLeft = x < rect.width / 2;
    actions.set(isLeft ? "fire" : "dash", false);
  };
  target.addEventListener("touchstart", onStart as EventListener, { passive: true });
  target.addEventListener("touchend", onEnd as EventListener, { passive: true });
  target.addEventListener("touchcancel", onEnd as EventListener, { passive: true });
  return () => {
    target.removeEventListener("touchstart", onStart as EventListener);
    target.removeEventListener("touchend", onEnd as EventListener);
    target.removeEventListener("touchcancel", onEnd as EventListener);
  };
}