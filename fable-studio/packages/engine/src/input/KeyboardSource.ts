import type { ActionState } from "./ActionState";

/** Standard keyboard action mapping. */
const KEYMAP: Record<string, string> = {
  KeyW: "move.forward",
  KeyA: "move.left",
  KeyS: "move.backward",
  KeyD: "move.right",
  ArrowUp: "move.forward",
  ArrowDown: "move.backward",
  ArrowLeft: "move.left",
  ArrowRight: "move.right",
  Space: "jump",
  KeyJ: "fire",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  Escape: "menu",
};

/**
 * Wire global keyboard events into the given ActionState.
 * Returns an unbind function. Default action names: move.{forward,left,backward,right}, jump, fire, dash, menu.
 */
export function bindKeyboard(
  target: Window | HTMLElement,
  actions: ActionState,
): () => void {
  const onDown = (e: KeyboardEvent): void => {
    const action = KEYMAP[e.code];
    if (action) {
      actions.set(action, true);
      e.preventDefault();
    }
  };
  const onUp = (e: KeyboardEvent): void => {
    const action = KEYMAP[e.code];
    if (action) {
      actions.set(action, false);
      e.preventDefault();
    }
  };
  target.addEventListener("keydown", onDown as EventListener);
  target.addEventListener("keyup", onUp as EventListener);
  return () => {
    target.removeEventListener("keydown", onDown as EventListener);
    target.removeEventListener("keyup", onUp as EventListener);
  };
}