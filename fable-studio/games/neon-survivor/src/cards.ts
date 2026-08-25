// Neon Survivor - Upgrade cards table.
// Migrated from index.html CARDS list. Effects are stored as raw property deltas;
// CardSystem applies them onto PlayerStats at selection time.

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'cursed';

export interface CardDef {
  id: number;
  name: string;
  icon: string;
  rarity: Rarity;
  desc: string;
  // Stat effects (optional, applied additively or multiplicatively by CardSystem).
  speedMul?: number;
  sprintMul?: number;
  damageMul?: number;
  fireRateMul?: number;
  reloadMul?: number;
  critChance?: number;
  critChanceBonus?: number;
  critMul?: number;
  maxHpAdd?: number;
  shieldAdd?: number;
  ammoMaxAdd?: number;
  hpRegenPerSec?: number;
  shieldRegenPerSec?: number;
  dashCdMul?: number;
  damageReduction?: number;
  pierce?: number;
  multishot?: number;
  bounce?: number;
  lifesteal?: number;
  executeThreshold?: number;
  revives?: number;
  invulnPeriodic?: number;
  bossDamageMul?: number;
  dashDamageMul?: number;
  lowHpDamageMul?: number;
  weaponUnlockId?: number;
  // Toggle flags (boolean abilities).
  fireDoT?: boolean;
  explosive?: boolean;
  aegis?: boolean;
  dashExcalibur?: boolean;
  dashFireTrail?: boolean;
  slowEnemies?: boolean;
  poisonPools?: boolean;
  nightVision?: boolean;
  pickupMagnet?: boolean;
  tracker?: boolean;
  frenzy?: boolean;
  chaosDamage?: boolean;
  sanguePorSangue?: boolean;
  explosiveKills?: boolean;
}

export const CARDS: CardDef[] = [
  // COMMON (1-20)
  { id: 1,  name: 'Surto de Adrenalina',     icon: '⚡', rarity: 'common',    desc: '+15% velocidade de movimento',        speedMul: 1.15 },
  { id: 2,  name: 'Kit Médico',             icon: '🩹', rarity: 'common',    desc: '+25 HP máximo',                       maxHpAdd: 25 },
  { id: 3,  name: 'Pente Estendido',         icon: '🔫', rarity: 'common',    desc: '+10 tamanho do pente',                ammoMaxAdd: 10 },
  { id: 4,  name: 'Escudo Reforçado',       icon: '🛡️', rarity: 'common',    desc: '+15 escudo máximo',                  shieldAdd: 15 },
  { id: 5,  name: 'Regeneração',            icon: '💊', rarity: 'common',    desc: 'Recupera 1 HP por segundo',           hpRegenPerSec: 1 },
  { id: 6,  name: 'Calibração',             icon: '⚙️', rarity: 'common',    desc: '+10% dano',                            damageMul: 1.10 },
  { id: 7,  name: 'Mira Laser',             icon: '🎯', rarity: 'common',    desc: '10% chance de crítico',                critChance: 0.10 },
  { id: 8,  name: 'Propulsão',              icon: '🚀', rarity: 'common',    desc: '-30% cooldown do dash',               dashCdMul: 0.7 },
  { id: 9,  name: 'Munição Incendiária',    icon: '🔥', rarity: 'common',    desc: '+15% dano (fogo no impacto)',         damageMul: 1.15, fireDoT: true },
  { id: 10, name: 'Munição Congelante',     icon: '❄️', rarity: 'common',    desc: '+15% dano (inimigos mais lentos)',    damageMul: 1.15, slowEnemies: true },
  { id: 11, name: 'Colete',                 icon: '🦺', rarity: 'common',    desc: '10% redução de dano',                  damageReduction: 0.10 },
  { id: 12, name: 'Força Bruta',            icon: '💪', rarity: 'common',    desc: '+20% dano',                            damageMul: 1.20 },
  { id: 13, name: 'Velocidade de Sprint',   icon: '🏃', rarity: 'common',    desc: '+20% sprint',                          sprintMul: 1.20 },
  { id: 14, name: 'Recarga Rápida',         icon: '🔋', rarity: 'common',    desc: '-30% tempo de reload',                reloadMul: 0.7 },
  { id: 15, name: 'Visão Noturna',          icon: '👁️', rarity: 'common',    desc: 'Inimigos visíveis através de prédios', nightVision: true },
  { id: 16, name: 'Ímã de XP',              icon: '🧲', rarity: 'common',    desc: 'Pickups em raio 50% maior',            pickupMagnet: true },
  { id: 17, name: 'Sorte',                  icon: '🎲', rarity: 'common',    desc: 'Crítico dobra de chance',              critChanceBonus: 0.05 },
  { id: 18, name: 'Tiro Certeiro',          icon: '🏹', rarity: 'common',    desc: '+80% multiplicador de crítico',       critMul: 1.8 },
  { id: 19, name: 'Cristal de Dano',        icon: '💎', rarity: 'common',    desc: '+25% dano',                            damageMul: 1.25 },
  { id: 20, name: 'Frenesi',                icon: '🩸', rarity: 'common',    desc: 'Cada kill recente aumenta o dano',     frenzy: true },
  // RARE (21-35)
  { id: 21, name: 'Pente Duplo',            icon: '⚡', rarity: 'rare',      desc: 'Dispara 2 projéteis por tiro',         multishot: 1 },
  { id: 22, name: 'Perfurante',             icon: '🔪', rarity: 'rare',      desc: 'Projéteis atravessam 2 inimigos',      pierce: 2 },
  { id: 23, name: 'Explosivo',              icon: '💥', rarity: 'rare',      desc: 'Projéteis explodem em AOE',            explosive: true },
  { id: 24, name: 'Vampirismo',             icon: '🧛', rarity: 'rare',      desc: '15% do dano vira HP',                  lifesteal: 0.15 },
  { id: 25, name: 'Ricochete',              icon: '🌀', rarity: 'rare',      desc: 'Projéteis quicam 3 vezes',             bounce: 3 },
  { id: 26, name: 'Arco Triplo',            icon: '🏹', rarity: 'rare',      desc: 'Dispara 3 projéteis por tiro',         multishot: 2 },
  { id: 27, name: 'Espadas',                icon: '⚔️', rarity: 'rare',      desc: '+50% dano de dash (dash mata)',         dashDamageMul: 1.5 },
  { id: 28, name: 'Fortaleza',              icon: '🏰', rarity: 'rare',      desc: '25% redução de dano + 50 HP',          damageReduction: 0.25, maxHpAdd: 50 },
  { id: 29, name: 'Chamas Ete',             icon: '🔥', rarity: 'rare',      desc: 'Dash deixa rastro de fogo',            dashFireTrail: true },
  { id: 30, name: 'Cristal Duplo',          icon: '💎', rarity: 'rare',      desc: '+30% dano, -15% cadência',             damageMul: 1.30, fireRateMul: 1.15 },
  { id: 31, name: 'Braço Metálico',         icon: '🦾', rarity: 'rare',      desc: 'Dash mais rápido e mais forte',        dashCdMul: 0.6, dashDamageMul: 1.3 },
  { id: 32, name: 'Adrenalina Máxima',      icon: '💉', rarity: 'rare',      desc: '+30% velocidade, dash -50% cd',      speedMul: 1.30, dashCdMul: 0.5 },
  { id: 33, name: 'Campo de Força',         icon: '🛡️', rarity: 'rare',      desc: 'Escudo regenera 2/s',                  shieldRegenPerSec: 2 },
  { id: 34, name: 'Rastreador',             icon: '🐍', rarity: 'rare',      desc: 'Inimigos próximos são marcados',       tracker: true },
  { id: 35, name: 'Química',                icon: '⚗️', rarity: 'rare',      desc: 'Projéteis deixam poças de veneno',    poisonPools: true },
  // EPIC (36-45)
  { id: 36, name: 'Rajada de Plasma',       icon: '⚡', rarity: 'epic',      desc: 'Cadência 2x, mas -30% dano',          fireRateMul: 0.5, damageMul: 0.7 },
  { id: 37, name: 'Bombardeio',             icon: '💥', rarity: 'epic',      desc: 'Dispara 4 projéteis, dano -50%',      multishot: 3, damageMul: 0.5 },
  { id: 38, name: 'Imortal',                icon: '🧛', rarity: 'epic',      desc: 'Revive 1 vez com 50% HP',              revives: 1 },
  { id: 39, name: 'Arco Quádruplo',         icon: '🏹', rarity: 'epic',      desc: '4 projéteis + atravessam 1 inimigo', multishot: 3, pierce: 1 },
  { id: 40, name: 'Diamante',               icon: '💎', rarity: 'epic',      desc: 'Crítico 25% chance, 3x dano',          critChance: 0.25, critMul: 3.0 },
  { id: 41, name: 'Invuln. Periódica',      icon: '🛡️', rarity: 'epic',      desc: '1s invencível a cada 10s',             invulnPeriodic: 10 },
  { id: 42, name: 'Dragão',                 icon: '🐉', rarity: 'epic',      desc: 'Dano de fogo + explosão',              fireDoT: true, explosive: true },
  { id: 43, name: 'Velocidade da Luz',      icon: '⚡', rarity: 'epic',      desc: '+50% velocidade e cadência',          speedMul: 1.5, fireRateMul: 0.66 },
  { id: 44, name: 'Ceifador',               icon: '💀', rarity: 'epic',      desc: 'Executa instantaneamente < 15% HP',  executeThreshold: 0.15 },
  { id: 45, name: 'Super Sayajin',          icon: '🦸', rarity: 'epic',      desc: 'Abaixo de 30% HP, dano dobra',        lowHpDamageMul: 2.0 },
  // LEGENDARY (46-50)
  { id: 46, name: 'Deus do Trovão',         icon: '⚡', rarity: 'legendary', desc: 'Atravessa tudo, 100% crítico 5x',      pierce: 999, critChance: 1.0, critMul: 5.0 },
  { id: 47, name: 'Fênix',                  icon: '🔥', rarity: 'legendary', desc: 'Revive 3x com HP cheio',               revives: 3, fireDoT: true },
  { id: 48, name: 'Caçador de Deuses',      icon: '🏹', rarity: 'legendary', desc: 'Boss toma 3x de dano',                  bossDamageMul: 3.0 },
  { id: 49, name: 'Aegis',                  icon: '🛡️', rarity: 'legendary', desc: '2s invencível após tomar dano',         aegis: true },
  { id: 50, name: 'Excalibur',              icon: '⚔️', rarity: 'legendary', desc: 'Dash atravessa e mata tudo',           dashExcalibur: true },
  // CURSED (51-55)
  { id: 51, name: 'Sacrifício',             icon: '💀', rarity: 'cursed',    desc: '3x dano, mas -50 HP máximo',          damageMul: 3.0, maxHpAdd: -50 },
  { id: 52, name: 'Sangue por Sangue',      icon: '🩸', rarity: 'cursed',    desc: '100% lifesteal, +50% dano recebido',   lifesteal: 1.0, sanguePorSangue: true },
  { id: 53, name: 'Cronomancia',            icon: '⏳', rarity: 'cursed',    desc: 'Dash cd 70% menor, mov 40% menor',    dashCdMul: 0.3, speedMul: 0.6 },
  { id: 54, name: 'Caos',                   icon: '🌀', rarity: 'cursed',    desc: 'Dano aleatório entre 0.5x e 3x',      chaosDamage: true },
  { id: 55, name: 'Morte Lenta',            icon: '☠️', rarity: 'cursed',    desc: 'Cada kill explode (dano em você)',    explosiveKills: true },
  // WEAPON UNLOCKS (56-61)
  { id: 56, name: 'Bazooka',                icon: '🚀', rarity: 'rare',      desc: 'Desbloqueia BAZOOKA no slot 3',       weaponUnlockId: 3 },
  { id: 57, name: 'Minigun',                icon: '🔫', rarity: 'epic',      desc: 'Desbloqueia MINIGUN no slot 3',       weaponUnlockId: 4 },
  { id: 58, name: 'Laser',                  icon: '⚡', rarity: 'epic',      desc: 'Desbloqueia LASER no slot 3',         weaponUnlockId: 5 },
  { id: 59, name: 'Railgun',                icon: '🎯', rarity: 'epic',      desc: 'Desbloqueia RAILGUN no slot 3',       weaponUnlockId: 6 },
  { id: 60, name: 'Lança-Chamas',           icon: '🔥', rarity: 'rare',      desc: 'Desbloqueia LANÇA-CHAMAS no slot 3',  weaponUnlockId: 7 },
  { id: 61, name: 'Rifle Plasma',           icon: '⚡', rarity: 'legendary', desc: 'Desbloqueia RIFLE PLASMA no slot 3',  weaponUnlockId: 8 },
];
