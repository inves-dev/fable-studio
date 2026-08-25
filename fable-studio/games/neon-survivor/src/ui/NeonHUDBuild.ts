// Neon Survivor — DOM builders for the persistent in-game HUD.
// Mirrors the structure of the original monolithic index.html.

import type { NeonHUDRefs } from './NeonHUDTypes';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  parent: HTMLElement,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  parent.appendChild(node);
  return node;
}

/** Build the HUD root and every persistent in-game element. */
export function buildHUD(parent: HTMLElement): {
  root: HTMLDivElement;
  refs: NeonHUDRefs;
} {
  const root = el('div', 'ns-hud ns-hidden', parent);
  // Hidden by default; the game unhides it on startGame().

  const refs = buildAll(root);
  return { root, refs };
}

function buildAll(root: HTMLElement): NeonHUDRefs {
  return {
    ...buildBars(root),
    ...buildScorePanel(root),
    ...buildAmmoPanel(root),
    ...buildFps(root),
    ...buildCrosshair(root),
    ...buildWaveAnnounce(root),
    ...buildDamageFlash(root),
    ...buildLockHint(root),
    ...buildWeaponDisplay(root),
  };
}

// ── HP + Shield bars (top-left) ─────────────────────────────────────────────

function buildBars(root: HTMLElement): Pick<NeonHUDRefs, 'bars'> {
  const tl = el('div', 'ns-hud-tl', root);

  // HP bar
  const hpWrap = el('div', 'ns-bar-wrap', tl);
  const hpLabel = el('div', 'ns-bar-label', hpWrap);
  el('span', '', hpLabel).textContent = 'HEALTH';
  const hpText = el('span', '', hpLabel); hpText.id = 'hpText'; hpText.textContent = '100';
  const hpBar = el('div', 'ns-bar', hpWrap);
  const hpFill = el('div', 'ns-bar-fill ns-hp', hpBar);
  hpFill.id = 'hpBar'; hpFill.style.width = '100%';

  // Shield bar
  const shWrap = el('div', 'ns-bar-wrap', tl);
  const shLabel = el('div', 'ns-bar-label', shWrap);
  el('span', '', shLabel).textContent = 'SHIELD';
  const shText = el('span', '', shLabel); shText.id = 'shText'; shText.textContent = '0';
  const shBar = el('div', 'ns-bar', shWrap);
  const shFill = el('div', 'ns-bar-fill', shBar);
  shFill.id = 'shBar'; shFill.style.width = '0%';

  return { bars: { hpFill, hpText, shFill, shText } };
}

// ── Score panel (top-right) ─────────────────────────────────────────────────

function buildScorePanel(root: HTMLElement): Pick<NeonHUDRefs, 'scorePanel'> {
  const tr = el('div', 'ns-hud-tr', root);

  function row(keyText: string, valueId: string, alt = false): HTMLSpanElement {
    const rowEl = el('div', 'ns-row', tr);
    el('span', 'ns-k', rowEl).textContent = keyText;
    const v = el('span', alt ? 'ns-v ns-alt' : 'ns-v', rowEl);
    v.id = valueId; v.textContent = '0';
    return v;
  }

  const scoreText = row('SCORE', 'scoreText');
  const multiText = row('MULTI', 'multiText', true);
  multiText.textContent = 'x1.0';
  const waveText = row('WAVE', 'waveText');
  waveText.textContent = '1';
  const enemiesText = row('ENEMIES', 'enemiesText');

  return { scorePanel: { scoreText, multiText, waveText, enemiesText } };
}

// ── Ammo panel (bottom-left) ────────────────────────────────────────────────

function buildAmmoPanel(root: HTMLElement): Pick<NeonHUDRefs, 'ammoPanel'> {
  const bl = el('div', 'ns-hud-bl', root);

  const ammoRow = el('div', 'ns-row', bl);
  el('span', 'ns-k', ammoRow).textContent = 'AMMO';
  const ammoV = el('span', 'ns-v', ammoRow);
  const ammoText = el('span', '', ammoV); ammoText.id = 'ammoText'; ammoText.textContent = '30';
  ammoV.appendChild(document.createTextNode(' / '));
  const ammoMaxText = el('span', '', ammoV); ammoMaxText.id = 'ammoMaxText'; ammoMaxText.textContent = '30';

  const reloadRow = el('div', 'ns-row', bl);
  el('span', 'ns-k', reloadRow).textContent = 'RELOAD';
  const reloadText = el('span', 'ns-v', reloadRow);
  reloadText.id = 'reloadText'; reloadText.textContent = 'R';

  return { ammoPanel: { ammoText, ammoMaxText, reloadText } };
}

// ── FPS counter (bottom-right) ──────────────────────────────────────────────

function buildFps(root: HTMLElement): Pick<NeonHUDRefs, 'fps'> {
  const br = el('div', 'ns-hud-br', root);
  br.appendChild(document.createTextNode('FPS '));
  const fpsText = el('span', '', br); fpsText.id = 'fpsText'; fpsText.textContent = '60';
  return { fps: { fpsText } };
}

// ── Crosshair (center) ──────────────────────────────────────────────────────

function buildCrosshair(root: HTMLElement): Pick<NeonHUDRefs, 'crosshair'> {
  const xh = el('div', 'ns-crosshair', root);
  el('div', 'ns-dot', xh);
  return { crosshair: xh };
}

// ── Wave announce banner (top-center) ───────────────────────────────────────

function buildWaveAnnounce(root: HTMLElement): Pick<NeonHUDRefs, 'waveAnnounce'> {
  const wa = el('div', 'ns-wave-announce', root);
  wa.id = 'waveAnnounce'; wa.textContent = 'WAVE 1';
  return { waveAnnounce: wa };
}

// ── Damage flash overlay ────────────────────────────────────────────────────

function buildDamageFlash(root: HTMLElement): Pick<NeonHUDRefs, 'damageFlash'> {
  const dmg = el('div', 'ns-damage-flash', root);
  dmg.id = 'dmgFlash';
  return { damageFlash: dmg };
}

// ── Lock-hint pill ──────────────────────────────────────────────────────────

function buildLockHint(root: HTMLElement): Pick<NeonHUDRefs, 'lockHint'> {
  const lh = el('div', 'ns-lock-hint', root);
  lh.id = 'lockHint';
  lh.innerHTML = 'CLICK TO LOCK CURSOR — or hold <b>Q / E</b> to rotate 360°';
  return { lockHint: lh };
}

// ── Weapon display (right-center) ───────────────────────────────────────────

function buildWeaponDisplay(root: HTMLElement): Pick<NeonHUDRefs, 'weaponDisplay'> {
  const wrap = el('div', 'ns-weapon-display', root);
  wrap.id = 'weaponDisplay';
  const icon = el('div', 'ns-weapon-icon', wrap); icon.id = 'weaponIcon'; icon.textContent = '🔫';
  const nameEl = el('div', 'ns-weapon-name', wrap); nameEl.id = 'weaponName'; nameEl.textContent = 'PISTOLA';
  el('div', 'ns-weapon-hint', wrap).textContent = '1 / 2 / 3';
  return { weaponDisplay: { icon, nameEl } };
}
