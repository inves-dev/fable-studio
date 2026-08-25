// Neon Survivor - Card system.
// Triggers a 3-second warning when score crosses every SCORE.cardEvery threshold,
// then selects 3 weighted-random cards and applies effects when one is picked.

import type { System } from '@nanagames/engine/core/System';
import type { World } from '@nanagames/engine/core/World';
import { CARDS } from '../cards';
import type { CardDef } from '../cards';
import { SCORE, RARITY_WEIGHTS } from '../config';
import type { GameState } from '../state';

export type CardPickHandler = (picks: CardDef[]) => void;
export type CardApplyHandler = (card: CardDef) => void;

export class CardSystem implements System {
  public readonly signature: readonly symbol[] = [];
  public readonly priority = 60;

  private onPick: CardPickHandler | null = null;
  private onApply: CardApplyHandler | null = null;

  constructor(private state: GameState) {}

  setHandlers(pick: CardPickHandler, apply: CardApplyHandler): void {
    this.onPick = pick;
    this.onApply = apply;
  }

  update(_world: World, dt: number): void {
    const s = this.state;
    // countdown phase
    if (s.cardCountdownActive) {
      s.cardCountdown -= dt;
      if (s.cardCountdown <= 0) {
        s.cardCountdownActive = false;
        const picks = this.choosePicks();
        s.currentCardPicks = picks.map((c) => ({ card: c, selected: false }));
        s.state = 'cardselect';
        s.cardLockT = 1.0;
        this.onPick?.(picks);
      }
      return;
    }
    if (s.cardLockT > 0) s.cardLockT -= dt;

    // threshold trigger
    if (s.score - s.lastCardScore >= SCORE.cardEvery) {
      s.lastCardScore = Math.floor(s.score / SCORE.cardEvery) * SCORE.cardEvery;
      s.cardCountdown = SCORE.cardCountdownSec;
      s.cardCountdownActive = true;
    }
  }

  choosePicks(): CardDef[] {
    const pool = [...CARDS];
    const picks: CardDef[] = [];
    for (let i = 0; i < 3; i++) {
      const totalW = pool.reduce((s, c) => s + RARITY_WEIGHTS[c.rarity], 0);
      let r = Math.random() * totalW;
      let chosen = pool[0];
      for (const c of pool) {
        r -= RARITY_WEIGHTS[c.rarity];
        if (r <= 0) { chosen = c; break; }
      }
      picks.push(chosen);
      const idx = pool.indexOf(chosen);
      if (idx >= 0) pool.splice(idx, 1);
    }
    return picks;
  }

  select(pickIndex: number): void {
    const s = this.state;
    if (s.cardLockT > 0) return;
    const pick = s.currentCardPicks[pickIndex];
    if (!pick || pick.selected) return;
    pick.selected = true;
    s.cardsApplied.push(pick.card.id);
    this.applyCard(pick.card);
    this.onApply?.(pick.card);
    s.currentCardPicks = [];
    s.state = 'playing';
  }

  private applyCard(card: CardDef): void {
    const p = this.state.playerData;
    if (card.damageMul) p.damageMul *= card.damageMul;
    if (card.fireRateMul) p.fireRateMul *= card.fireRateMul;
    if (card.speedMul) p.speedMul *= card.speedMul;
    if (card.sprintMul) p.sprintMul *= card.sprintMul;
    if (card.maxHpAdd) {
      p.maxHp += card.maxHpAdd;
      if (card.maxHpAdd > 0) p.hp = Math.min(p.maxHp, p.hp + card.maxHpAdd);
    }
    if (card.shieldAdd) {
      p.maxShield += card.shieldAdd;
      p.shield = Math.min(p.maxShield, p.shield + card.shieldAdd);
    }
    if (card.ammoMaxAdd) {
      p.maxAmmo += card.ammoMaxAdd;
      p.ammo = p.maxAmmo;
    }
    if (card.hpRegenPerSec) p.hpRegenPerSec += card.hpRegenPerSec;
    if (card.shieldRegenPerSec) p.shieldRegenPerSec += card.shieldRegenPerSec;
    if (card.reloadMul) p.reloadMul *= card.reloadMul;
    if (card.dashCdMul) p.dashCdMul *= card.dashCdMul;
    if (card.damageReduction) p.damageReduction = Math.min(0.9, p.damageReduction + card.damageReduction);
    if (card.pierce) p.pierce += card.pierce;
    if (card.multishot) p.multishot += card.multishot;
    if (card.explosive) p.explosive = true;
    if (card.lifesteal) p.lifesteal = Math.min(1, p.lifesteal + card.lifesteal);
    if (card.critChance) p.critChance = Math.min(1, p.critChance + card.critChance);
    if (card.critChanceBonus) p.critChance = Math.min(1, p.critChance + card.critChanceBonus);
    if (card.critMul) p.critMul *= card.critMul;
    if (card.bounce) p.bounce = Math.max(p.bounce, card.bounce);
    if (card.executeThreshold) p.executeThreshold = card.executeThreshold;
    if (card.revives) p.revives += card.revives;
    if (card.invulnPeriodic) { p.invulnPeriodic = card.invulnPeriodic; p.invulnT = card.invulnPeriodic; }
    if (card.bossDamageMul) p.bossDamageMul *= card.bossDamageMul;
    if (card.aegis) p.aegis = true;
    if (card.dashExcalibur) p.dashExcalibur = true;
    if (card.dashFireTrail) p.dashFireTrail = true;
    if (card.dashDamageMul) p.dashDamageMul = (p.dashDamageMul || 1) * card.dashDamageMul;
    if (card.fireDoT) p.fireDoT = true;
    if (card.slowEnemies) p.slowEnemies = true;
    if (card.poisonPools) p.poisonPools = true;
    if (card.nightVision) p.nightVision = true;
    if (card.pickupMagnet) p.pickupMagnet = true;
    if (card.tracker) p.tracker = true;
    if (card.frenzy) p.frenzy = true;
    if (card.chaosDamage) p.chaosDamage = true;
    if (card.sanguePorSangue) p.sanguePorSangue = true;
    if (card.explosiveKills) p.explosiveKills = true;
    if (card.weaponUnlockId) {
      if (!p.unlockedWeapons.includes(card.weaponUnlockId)) p.unlockedWeapons.push(card.weaponUnlockId);
    }
    if (card.lowHpDamageMul) p.lowHpDamageMul = card.lowHpDamageMul;

    this.recalcPower();
  }

  recalcPower(): void {
    const p = this.state.playerData;
    let power = 0;
    power += Math.max(0, p.damageMul - 1) * 5;
    power += Math.max(0, p.fireRateMul < 1 ? (1 - p.fireRateMul) * 4 : 0);
    power += Math.max(0, p.speedMul - 1) * 4;
    power += Math.max(0, p.maxHp - 100) * 0.05;
    power += Math.max(0, p.maxShield - 50) * 0.05;
    power += p.pierce * 1.5;
    power += p.multishot * 1.5;
    power += p.critChance * 4;
    power += p.lifesteal * 8;
    power += p.bounce * 0.5;
    if (p.explosive) power += 3;
    if (p.executeThreshold) power += 4;
    if (p.invulnPeriodic) power += 3;
    if (p.aegis) power += 5;
    if (p.dashExcalibur) power += 6;
    if (p.lowHpDamageMul) power += 2;
    if (p.chaosDamage) power += 2;
    if (p.sanguePorSangue) power += 3;
    if (p.explosiveKills) power += 2;
    power += Math.max(0, p.critMul - 1.5) * 2;
    power += Math.max(0, p.hpRegenPerSec) * 0.5;
    this.state.playerPower = power;
  }
}
