import { injectStyles, tokens } from './Style';

// Mobile touch controls: virtual joystick (left), DASH + FIRE buttons (right).
// Joystick reports a normalized Vec2 (-1..1) and a magnitude 0..1.

export interface JoystickState {
  x: number;
  y: number;
  magnitude: number;
  active: boolean;
}

let touchStylesInjected = false;
function ensureTouchStyles(): void {
  if (touchStylesInjected) return;
  touchStylesInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-fable-touch', 'true');
  style.textContent = `
    .fb-touch {
      position:absolute; inset:0; pointer-events:none;
    }
    .fb-touch .joystick {
      position:absolute; left:24px; bottom:24px; width:130px; height:130px;
      border-radius:50%; background: rgba(0,10,20,0.4);
      border:2px solid ${tokens.color.border};
      pointer-events:auto; touch-action:none;
    }
    .fb-touch .joystick .knob {
      position:absolute; left:50%; top:50%; width:54px; height:54px; margin:-27px 0 0 -27px;
      border-radius:50%; background: linear-gradient(135deg, ${tokens.color.cyan}, ${tokens.color.magenta});
      box-shadow: ${tokens.shadow.glow}; transition: transform .05s linear;
    }
    .fb-touch .action {
      position:absolute; right:24px; bottom:24px; display:flex; gap:18px;
      pointer-events:auto;
    }
    .fb-touch .act-btn {
      width:84px; height:84px; border-radius:50%;
      border:2px solid ${tokens.color.border};
      background: rgba(0,10,20,0.55); color:#fff;
      font-family: ${tokens.font.mono}; font-size:12px; letter-spacing:2px;
      cursor:pointer; pointer-events:auto;
    }
    .fb-touch .act-btn.fire { border-color: ${tokens.color.magenta}; box-shadow: 0 0 18px rgba(255,0,200,0.4); }
    .fb-touch .act-btn.dash { border-color: ${tokens.color.yellow}; box-shadow: 0 0 18px rgba(255,224,102,0.3); }
    .fb-touch .act-btn:active { transform: scale(0.92); }
  `;
  document.head.appendChild(style);
}

export class TouchControls {
  readonly root: HTMLDivElement;
  readonly joystick: JoystickState = { x: 0, y: 0, magnitude: 0, active: false };

  private readonly knob: HTMLDivElement;
  private readonly baseRadius = 65;
  private readonly knobRadius = 27;
  private pointerId: number | null = null;

  constructor(parent: HTMLElement, opts: { onFire?: () => void; onDash?: () => void } = {}) {
    injectStyles();
    ensureTouchStyles();
    const root = document.createElement('div');
    root.className = 'fb-touch';
    const stick = document.createElement('div');
    stick.className = 'joystick';
    const knob = document.createElement('div');
    knob.className = 'knob';
    stick.appendChild(knob);
    root.appendChild(stick);

    const actions = document.createElement('div');
    actions.className = 'action';

    const dash = document.createElement('button');
    dash.type = 'button';
    dash.className = 'act-btn dash';
    dash.textContent = 'DASH';
    dash.addEventListener('click', () => opts.onDash?.());

    const fire = document.createElement('button');
    fire.type = 'button';
    fire.className = 'act-btn fire';
    fire.textContent = 'FIRE';
    fire.addEventListener('click', () => opts.onFire?.());

    actions.appendChild(dash);
    actions.appendChild(fire);
    root.appendChild(actions);

    parent.appendChild(root);
    this.root = root;
    this.knob = knob;
    this.bindJoystick(stick);
  }

  private bindJoystick(stick: HTMLElement): void {
    const onDown = (e: PointerEvent): void => {
      if (this.pointerId !== null) return;
      this.pointerId = e.pointerId;
      stick.setPointerCapture(e.pointerId);
      this.joystick.active = true;
      this.updateFrom(e);
    };
    const onMove = (e: PointerEvent): void => {
      if (e.pointerId !== this.pointerId) return;
      this.updateFrom(e);
    };
    const onUp = (e: PointerEvent): void => {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.joystick.active = false;
      this.joystick.x = 0;
      this.joystick.y = 0;
      this.joystick.magnitude = 0;
      this.knob.style.transform = 'translate(0,0)';
    };
    stick.addEventListener('pointerdown', onDown);
    stick.addEventListener('pointermove', onMove);
    stick.addEventListener('pointerup', onUp);
    stick.addEventListener('pointercancel', onUp);
  }

  private updateFrom(e: PointerEvent): void {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const max = this.baseRadius - this.knobRadius;
    if (dist > max) {
      const k = max / dist;
      dx *= k;
      dy *= k;
    }
    this.joystick.x = dx / max;
    this.joystick.y = dy / max;
    this.joystick.magnitude = Math.min(1, dist / max);
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  dispose(): void {
    this.root.remove();
  }
}