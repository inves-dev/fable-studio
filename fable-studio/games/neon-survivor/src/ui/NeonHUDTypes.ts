// Neon Survivor — shared DOM refs for NeonHUD.ts.
// Mirrors the ID/class names from the original monolithic index.html
// (hpBar / shBar / scoreText / multiText / waveText / enemiesText /
//  ammoText / ammoMaxText / reloadText / fpsText / waveAnnounce /
//  dmgFlash / lockHint / muteBtn / volumePanel / weaponDisplay /
//  cardCountdown / cardRow / finalScore / finalWave / finalKills).

export interface NeonHUDRefs {
  bars: {
    hpFill: HTMLDivElement;
    hpText: HTMLSpanElement;
    shFill: HTMLDivElement;
    shText: HTMLSpanElement;
  };
  scorePanel: {
    scoreText: HTMLSpanElement;
    multiText: HTMLSpanElement;
    waveText: HTMLSpanElement;
    enemiesText: HTMLSpanElement;
  };
  ammoPanel: {
    ammoText: HTMLSpanElement;
    ammoMaxText: HTMLSpanElement;
    reloadText: HTMLSpanElement;
  };
  fps: {
    fpsText: HTMLSpanElement;
  };
  crosshair: HTMLDivElement;
  waveAnnounce: HTMLDivElement;
  damageFlash: HTMLDivElement;
  lockHint: HTMLDivElement;
  weaponDisplay: {
    icon: HTMLDivElement;
    nameEl: HTMLDivElement;
  };
}
