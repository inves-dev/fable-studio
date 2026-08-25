// Neon Survivor - Enemy types & spawn table.
// Migrated from index.html makeEnemy / spawnEnemy.

export type EnemyKind =
  | 'grunt'
  | 'runner'
  | 'tank'
  | 'crawler'
  | 'sniper'
  | 'phantom'
  | 'bruiser'
  | 'shieldbearer'
  | 'bomber'
  | 'swarm'
  | 'apex'
  | 'drone'
  | 'sentinel'
  | 'boss';

export type AttackType = 'melee' | 'ranged' | 'aoe' | 'explode' | 'burst' | 'mixed';

export interface EnemyPalette {
  body: number;
  accent: number;
  glow: number;
  joint: number;
  eye: number;
}

export const ENEMY_PALETTES: Record<EnemyKind, EnemyPalette> = {
  grunt:        { body: 0x3a1a1f, accent: 0x661020, glow: 0xff2266, joint: 0x1a0a10, eye: 0xff3060 },
  runner:       { body: 0x0a1a3a, accent: 0x1444aa, glow: 0x00e0ff, joint: 0x0a0a20, eye: 0x00ffff },
  tank:         { body: 0x3a2810, accent: 0xaa6622, glow: 0xffaa00, joint: 0x1a0a00, eye: 0xffcc44 },
  crawler:      { body: 0x1a3a1a, accent: 0x22aa44, glow: 0x66ff66, joint: 0x0a200a, eye: 0x88ff88 },
  sniper:       { body: 0x2a2a3a, accent: 0x6666aa, glow: 0xff66ff, joint: 0x101020, eye: 0xff88ff },
  phantom:      { body: 0x301a40, accent: 0x8844cc, glow: 0xcc88ff, joint: 0x180020, eye: 0xddaaff },
  bruiser:      { body: 0x3a1a30, accent: 0xcc4488, glow: 0xff44aa, joint: 0x1a0010, eye: 0xff88cc },
  shieldbearer: { body: 0x1a3040, accent: 0x4488cc, glow: 0x66ccff, joint: 0x0a1820, eye: 0x88eeff },
  bomber:       { body: 0x3a2010, accent: 0xaa4422, glow: 0xff6622, joint: 0x1a0a00, eye: 0xffaa44 },
  swarm:        { body: 0x102020, accent: 0x226666, glow: 0x44cccc, joint: 0x0a1010, eye: 0x88ffff },
  apex:         { body: 0x2a0a2a, accent: 0xaa22cc, glow: 0xff00ff, joint: 0x180020, eye: 0xff44ff },
  drone:        { body: 0x2a2a3a, accent: 0x66ffaa, glow: 0x88ffcc, joint: 0x101020, eye: 0xaaffff },
  sentinel:     { body: 0x3a2a1a, accent: 0xffaa66, glow: 0xffcc88, joint: 0x1a1010, eye: 0xffddaa },
  boss:         { body: 0x2a0a3a, accent: 0x6611aa, glow: 0xff00d4, joint: 0x180020, eye: 0xff44ff },
};

export interface EnemyBlueprint {
  scale: number;
  hpBase: number;
  hpPerWave: number;
  speed: number;
  damageBase: number;
  score: number;
  attackType: AttackType;
  attackRange: number;
  flying?: boolean;
}

export const ENEMY_BLUEPRINTS: Record<EnemyKind, EnemyBlueprint> = {
  grunt:        { scale: 1.0, hpBase: 30, hpPerWave: 4,  speed: 3.2, damageBase: 5,  score: 10,  attackType: 'melee',  attackRange: 1.5 },
  runner:       { scale: 1.0, hpBase: 18, hpPerWave: 2,  speed: 5.5, damageBase: 4,  score: 15,  attackType: 'melee',  attackRange: 1.4 },
  tank:         { scale: 1.0, hpBase: 90, hpPerWave: 12, speed: 1.9, damageBase: 10, score: 30,  attackType: 'melee',  attackRange: 1.8 },
  crawler:      { scale: 1.0, hpBase: 50, hpPerWave: 6,  speed: 1.8, damageBase: 6,  score: 25,  attackType: 'ranged', attackRange: 8 },
  sniper:       { scale: 1.0, hpBase: 28, hpPerWave: 3,  speed: 2.4, damageBase: 14, score: 35,  attackType: 'ranged', attackRange: 20 },
  phantom:      { scale: 1.0, hpBase: 60, hpPerWave: 5,  speed: 4.5, damageBase: 9,  score: 50,  attackType: 'melee',  attackRange: 1.4 },
  bruiser:      { scale: 1.0, hpBase: 140, hpPerWave: 15, speed: 2.1, damageBase: 18, score: 40, attackType: 'aoe',    attackRange: 2.5 },
  shieldbearer: { scale: 1.0, hpBase: 80, hpPerWave: 8,  speed: 2.0, damageBase: 7,  score: 35,  attackType: 'melee',  attackRange: 1.5 },
  bomber:       { scale: 1.0, hpBase: 25, hpPerWave: 3,  speed: 3.0, damageBase: 0,  score: 20,  attackType: 'explode', attackRange: 1.2 },
  swarm:        { scale: 0.55, hpBase: 8, hpPerWave: 1, speed: 6.5, damageBase: 3,  score: 5,   attackType: 'melee',  attackRange: 1.0 },
  apex:         { scale: 1.0, hpBase: 220, hpPerWave: 25, speed: 3.4, damageBase: 12, score: 100, attackType: 'burst', attackRange: 15 },
  drone:        { scale: 1.0, hpBase: 40, hpPerWave: 5,  speed: 3.5, damageBase: 10, score: 40,  attackType: 'ranged', attackRange: 16, flying: true },
  sentinel:     { scale: 1.0, hpBase: 35, hpPerWave: 4,  speed: 0,   damageBase: 18, score: 50,  attackType: 'ranged', attackRange: 25 },
  boss:         { scale: 1.0, hpBase: 500, hpPerWave: 60, speed: 2.4, damageBase: 18, score: 250, attackType: 'mixed',  attackRange: 3 },
};

// Returns the eligible enemy pool for a given wave index (1-based).
export function enemyPoolForWave(wave: number): EnemyKind[] {
  if (wave % 5 === 0) return ['boss'];
  const types: EnemyKind[] = ['grunt'];
  if (wave >= 2) types.push('runner', 'runner');
  if (wave >= 3) types.push('crawler', 'crawler');
  if (wave >= 4) types.push('tank', 'sniper');
  if (wave >= 5) types.push('drone');
  if (wave >= 6) types.push('phantom', 'phantom', 'bruiser');
  if (wave >= 7) types.push('shieldbearer', 'shieldbearer', 'sentinel');
  if (wave >= 8) types.push('bomber', 'bomber');
  if (wave >= 10) types.push('swarm', 'swarm', 'swarm', 'apex');
  if (wave >= 15) types.push('apex', 'apex', 'drone', 'sentinel');
  return types;
}

export function pickEnemyType(wave: number): EnemyKind {
  const pool = enemyPoolForWave(wave);
  return pool[Math.floor(Math.random() * pool.length)];
}
