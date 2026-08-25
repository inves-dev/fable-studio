import { AudioManager } from '@nanagames/engine/audio/AudioManager';
import { getSfx } from '@nanagames/engine/audio/SfxLibrary';
import { Button } from '@nanagames/engine/ui/Button';
import { HUD } from '@nanagames/engine/ui/HUD';
import { Label } from '@nanagames/engine/ui/Label';

// Placeholder bootstrap for the puzzle game.
export function start(host: HTMLElement): void {
  host.innerHTML = '';
  const hud = new HUD(host);
  hud.setHealth(1);
  hud.setXp(0.6);
  hud.setScore(4200);
  hud.setWave(1);
  hud.setAmmo('∞');
  hud.setMultiplier(2.0);

  const title = new Label(host, 'CANDY CRUSH — coming soon', { align: 'center', size: 22 });
  title.el.style.cssText = 'position:absolute;top:35%;left:0;right:0;text-align:center;letter-spacing:4px;color:#ff66e0;';

  const demo = new Button(host, 'PLAY MATCH SOUND', { variant: 'primary' });
  demo.el.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);';
  demo.onTap(() => AudioManager.playSfx(getSfx('match')));

  const back = new Button(host, '< LAUNCHER', { variant: 'ghost' });
  back.el.style.cssText = 'position:absolute;top:18px;left:50%;transform:translateX(-50%);';
  back.onTap(() => {
    hud.dispose();
    title.dispose();
    demo.dispose();
    back.dispose();
    host.style.display = 'none';
    const menu = document.getElementById('launcher-menu');
    if (menu) menu.style.display = '';
  });
}