// AUTO-GENERATED from /Users/mac/Documents/Joguinho/Fable/index.html
// Do not edit by hand. Regenerate via the extraction script.
/* eslint-disable */
export const GAME_SOURCE: string = `
/* ===========================================================
   NEON SURVIVOR - single-file 3D top-down survivor shooter
   =========================================================== */

const GAME = {
  state: 'menu', // menu | playing | paused | gameover
  arena: { size: 130, blocks: 6 },   // wider arena, fewer buildings
  player: null,
  enemies: [],
  bullets: [],
  pickups: [],
  particles: [],
  buildings: [],
  lampPosts: [],
  score: 0,
  totalKills: 0,
  multiplier: 1.0,
  multTimer: 0,
  wave: 1,
  waveTimer: 0,
  waveEnemiesRemaining: 0,
  waveSize: 6,
  spawnTimer: 0,
  spawnInterval: 0.8,
  pointerLocked: false,
  pointerLockDisabled: false,
  pointerLockGrace: true,
  // input
  keys: {},
  mouse: { dx: 0, dy: 0, down: false },
  yaw: 0, pitch: 0,
  // stats
  fps: 60, fpsCounter: 0, fpsTime: 0,
  damageFlashT: 0,
  waveAnnounceT: 0, waveAnnounceText: '',
  lastCardScore: 0,
  cardsApplied: [],
  cardCountdown: 0,       // 3 segundos de aviso antes da tela de cartas
  cardCountdownActive: false,
  cardLockT: 0,           // 1s de bloqueio de input após mostrar
  gameMode: 'normal',     // 'normal', 'dark', 'frenzy', 'siege'
  modeTimer: 0,           // tempo restante do modo atual
};

// ----- Audio (procedural via Web Audio API) -----
let audioCtx = null;
let audioMuted = false;
let musicGain = null, sfxGain = null;
let musicTimer = null;
let musicStep = 0;
let musicVolume = 0.5;
let sfxVolume = 1.0;

function ensureAudio() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = audioCtx.createGain();
    sfxGain = audioCtx.createGain();
    musicGain.connect(audioCtx.destination);
    sfxGain.connect(audioCtx.destination);
    audioMuted = localStorage.getItem('neon_muted') === '1';
    musicVolume = parseFloat(localStorage.getItem('neon_music_vol') || '0.5');
    sfxVolume = parseFloat(localStorage.getItem('neon_sfx_vol') || '1.0');
    applyMuteState();
  } catch (e) { audioCtx = null; }
  return audioCtx;
}

function applyMuteState() {
  if (!audioCtx) return;
  musicGain.gain.setValueAtTime(musicVolume * (audioMuted ? 0 : 1), audioCtx.currentTime);
  sfxGain.gain.setValueAtTime(sfxVolume * (audioMuted ? 0 : 1), audioCtx.currentTime);
  const btn = document.getElementById('muteBtn');
  if (btn) btn.textContent = audioMuted ? '🔇' : '🔊';
}

function toggleMute() {
  audioMuted = !audioMuted;
  localStorage.setItem('neon_muted', audioMuted ? '1' : '0');
  applyMuteState();
}

function setMusicVolume(v) {
  musicVolume = Math.max(0, Math.min(1, v));
  localStorage.setItem('neon_music_vol', musicVolume.toString());
  if (audioCtx) musicGain.gain.setValueAtTime(musicVolume * (audioMuted ? 0 : 1), audioCtx.currentTime);
  const slider = document.getElementById('musicVol');
  if (slider) slider.value = Math.round(musicVolume * 100);
}

function setSfxVolume(v) {
  sfxVolume = Math.max(0, Math.min(1, v));
  localStorage.setItem('neon_sfx_vol', sfxVolume.toString());
  if (audioCtx) sfxGain.gain.setValueAtTime(sfxVolume * (audioMuted ? 0 : 1), audioCtx.currentTime);
  const slider = document.getElementById('sfxVol');
  if (slider) slider.value = Math.round(sfxVolume * 100);
}

function playSfx(kind) {
  if (!audioCtx || audioMuted) return;
  const t = audioCtx.currentTime;
  if (kind === 'shoot') {
    // tiro: ruído curto com tom descendo
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.08);
    // ruído branco para o "crack"
    const buf = audioCtx.createBuffer(1, 800, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 800; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 800);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.1, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    noise.connect(ng); ng.connect(sfxGain);
    noise.start(t);
  } else if (kind === 'hit') {
    // impacto: ruído curto
    const buf = audioCtx.createBuffer(1, 1500, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 1500; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 1500);
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(g); g.connect(sfxGain);
    noise.start(t);
  } else if (kind === 'kill') {
    // kill: tom ascendente rápido + ruído
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.2);
  } else if (kind === 'hurt') {
    // dano no player: tom grave
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.3);
  } else if (kind === 'reload') {
    // reload genérico (pistola) — 2 cliques curtos
    [0, 0.08].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 600;
      g.gain.setValueAtTime(0.06, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.04);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.04);
    });
  } else if (kind === 'reload_pistol') {
    // pistola: clack clack + slide
    [0, 0.12, 0.18, 0.55, 1.10].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = i < 2 ? 800 : 1200;
      g.gain.setValueAtTime(0.05, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.06);
    });
  } else if (kind === 'reload_rifle') {
    // rifle: magazine out, magazine in, bolt pull, bolt release
    [0, 0.4, 0.85, 1.30, 1.75].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 500 + Math.random() * 100;
      g.gain.setValueAtTime(0.05, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.07);
    });
  } else if (kind === 'reload_shotgun') {
    // shotgun: shell shells shells + pump action (mais lento e mais pesado)
    const buf = audioCtx.createBuffer(1, 2400, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 2400; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 2400) * 0.4;
    [0, 0.35, 0.70, 1.10, 1.80].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 350;
      g.gain.setValueAtTime(0.06, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.10);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.11);
    });
    // pump action
    const pump = audioCtx.createBufferSource();
    pump.buffer = buf;
    const pg = audioCtx.createGain();
    pg.gain.setValueAtTime(0.10, t + 2.10);
    pg.gain.exponentialRampToValueAtTime(0.001, t + 2.30);
    pump.connect(pg); pg.connect(sfxGain);
    pump.start(t + 2.10);
  } else if (kind === 'shoot_pistol') {
    // tiro pistola: square wave curto e agudo
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);
    g.gain.setValueAtTime(0.10, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.11);
  } else if (kind === 'shoot_rifle') {
    // tiro rifle: mais rápido e mais agudo
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.07);
  } else if (kind === 'shoot_shotgun') {
    // tiro shotgun: BOOM grave + ruído
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.20);
    g.gain.setValueAtTime(0.20, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.26);
    // ruído de spread
    const buf = audioCtx.createBuffer(1, 2000, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 2000; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 2000) * 0.6;
    const n = audioCtx.createBufferSource();
    n.buffer = buf;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    n.connect(ng); ng.connect(sfxGain);
    n.start(t);
  } else if (kind === 'shoot_bazooka') {
    // bazooka: foguete whoosh + BOOM
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.6);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.61);
  } else if (kind === 'reload_bazooka') {
    // bazooka reload: clique mecânico + inserção
    [0, 0.3, 0.7, 1.5, 2.0].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 200 + Math.random() * 80;
      g.gain.setValueAtTime(0.10, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.10);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.11);
    });
  } else if (kind === 'shoot_minigun') {
    // minigun: rajada rápida
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.06);
    // whine do motor (sai junto)
    const m = audioCtx.createOscillator();
    const mg = audioCtx.createGain();
    m.type = 'sawtooth';
    m.frequency.setValueAtTime(200, t);
    m.frequency.linearRampToValueAtTime(400, t + 0.5);
    mg.gain.setValueAtTime(0.06, t);
    mg.gain.linearRampToValueAtTime(0.001, t + 0.5);
    m.connect(mg); mg.connect(sfxGain);
    m.start(t); m.stop(t + 0.5);
  } else if (kind === 'reload_minigun') {
    // minigun reload: spin down + clack + spin up
    const spin = audioCtx.createBuffer(1, 3000, audioCtx.sampleRate);
    const sd = spin.getChannelData(0);
    for (let i = 0; i < 3000; i++) sd[i] = (Math.random() * 2 - 1) * (1 - i / 3000);
    const sp = audioCtx.createBufferSource();
    sp.buffer = spin;
    const sg = audioCtx.createGain();
    sg.gain.setValueAtTime(0.12, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
    sp.connect(sg); sg.connect(sfxGain);
    sp.start(t);
    // clack em t=2.0
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1500;
    g.gain.setValueAtTime(0.10, t + 2.0);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.1);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t + 2.0); osc.stop(t + 2.1);
  } else if (kind === 'shoot_laser') {
    // laser: raio fino agudo
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.10);
  } else if (kind === 'reload_laser') {
    // laser: recarga instantânea (beep curto)
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2000;
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.16);
  } else if (kind === 'shoot_railgun') {
    // railgun: ZAP elétrico
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3500, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.33);
    // ruído de eletricidade
    const buf = audioCtx.createBuffer(1, 1500, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 1500; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 1500) * 0.5;
    const n = audioCtx.createBufferSource();
    n.buffer = buf;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.10, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
    n.connect(ng); ng.connect(sfxGain);
    n.start(t);
  } else if (kind === 'reload_railgun') {
    // railgun: click de carga
    [0, 0.5, 1.0, 1.6].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, t + delay);
      osc.frequency.exponentialRampToValueAtTime(80, t + delay + 0.2);
      g.gain.setValueAtTime(0.10, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.21);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.22);
    });
  } else if (kind === 'shoot_flame') {
    // lança-chamas: rugido contínuo
    const buf = audioCtx.createBuffer(1, 1500, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 1500; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 1500) * 0.7;
    const n = audioCtx.createBufferSource();
    n.buffer = buf;
    const f = audioCtx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 800;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.10, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    n.connect(f); f.connect(ng); ng.connect(sfxGain);
    n.start(t);
  } else if (kind === 'reload_flame') {
    // lança-chamas: hiss de gás
    const buf = audioCtx.createBuffer(1, 2400, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 2400; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 2400) * 0.3;
    const n = audioCtx.createBufferSource();
    n.buffer = buf;
    const f = audioCtx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2000;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.06, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    n.connect(f); f.connect(ng); ng.connect(sfxGain);
    n.start(t);
  } else if (kind === 'shoot_plasma') {
    // plasma: zap musical
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    g.gain.setValueAtTime(0.10, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.14);
  } else if (kind === 'reload_plasma') {
    // plasma: hiss de recarregamento
    [0, 0.4, 0.8, 1.4, 1.8].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.sin(delay * 3) * 200;
      g.gain.setValueAtTime(0.06, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.10);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.11);
    });
  } else if (kind === 'weapon_switch') {
    // som de troca de arma: beep duplo
    [0, 0.08].forEach((delay) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = delay === 0 ? 800 : 1100;
      g.gain.setValueAtTime(0.06, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.07);
    });
  } else if (kind === 'wave') {
    // wave start: tom épico ascendente
    [0, 0.12, 0.24].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 * (1 + i * 0.25), t + delay);
      osc.frequency.exponentialRampToValueAtTime(440 * (1 + i * 0.25), t + delay + 0.18);
      g.gain.setValueAtTime(0.1, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.2);
    });
  } else if (kind === 'card') {
    // card select: shimmer
    [0, 0.08, 0.16].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 600 + i * 200;
      g.gain.setValueAtTime(0.08, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
      osc.connect(g); g.connect(sfxGain);
      osc.start(t + delay); osc.stop(t + delay + 0.15);
    });
  } else if (kind === 'pickup') {
    // pickup: tom rápido ascendente
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.12);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 0.15);
  } else if (kind === 'dash') {
    // dash: whoosh
    const buf = audioCtx.createBuffer(1, 1200, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 1200; i++) {
      const env = Math.sin(Math.PI * i / 1200);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(2000, t);
    filt.frequency.exponentialRampToValueAtTime(200, t + 0.12);
    noise.connect(filt); filt.connect(g); g.connect(sfxGain);
    noise.start(t);
  } else if (kind === 'gameover') {
    // game over: tom descendente dramático
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(g); g.connect(sfxGain);
    osc.start(t); osc.stop(t + 1.2);
  }
}

function startMusic() {
  if (!audioCtx || musicTimer) return;
  // escolher faixa aleatória para esta sessão (10-15 opções)
  startMusicTrack(currentMusicTrack);
}

let currentMusicTrack = 0;
let savedMusicTrack = 0; // para voltar após a boss music
let bossMusicActive = false;

function startMusicTrack(trackIdx) {
  stopMusic();
  if (!audioCtx) return;
  // biblioteca de músicas: cada uma tem escala, BPM, padrão de bass e melodia
  const TRACKS = [
    { name: 'Cyber Strike',  scale: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440], bpm: 130, bass: [220, 0, 220, 261.63, 0, 329.63, 0, 220], melody: [329.63, 440, 329.63, 392, 329.63, 0, 440, 0], lead: [880, 0, 880, 0, 988, 0, 880, 0], arp: [329, 440, 523, 440, 329, 440, 523, 440] },
    { name: 'Dark Bass',     scale: [164.81, 185, 196, 220, 246.94, 261.63, 293.66, 329.63], bpm: 140, bass: [164.81, 196, 164.81, 220, 164.81, 196, 246.94, 0], melody: [246.94, 0, 329.63, 293.66, 246.94, 0, 220, 0], lead: [0, 740, 0, 0, 740, 0, 0, 0], arp: [329, 0, 440, 329, 0, 440, 329, 0] },
    { name: 'Pulse Drive',   scale: [146.83, 164.81, 174.61, 196, 220, 233.08, 261.63, 293.66], bpm: 150, bass: [146.83, 174.61, 146.83, 220, 146.83, 174.61, 220, 0], melody: [220, 293.66, 220, 261.63, 220, 0, 261.63, 0], lead: [880, 988, 880, 0, 0, 988, 0, 0], arp: [220, 261, 329, 261, 220, 261, 329, 261] },
    { name: 'Minor Storm',   scale: [130.81, 146.83, 155.56, 174.61, 196, 207.65, 233.08, 261.63], bpm: 120, bass: [130.81, 0, 155.56, 196, 0, 196, 174.61, 0], melody: [196, 233.08, 261.63, 233.08, 196, 0, 174.61, 0], lead: [784, 0, 880, 0, 0, 880, 784, 0], arp: [196, 233, 261, 233, 196, 233, 261, 233] },
    { name: 'Gear Shift',    scale: [196, 220, 233.08, 261.63, 293.66, 311.13, 349.23, 392.00], bpm: 160, bass: [196, 233.08, 196, 293.66, 196, 233.08, 293.66, 0], melody: [293.66, 392, 349.23, 311.13, 293.66, 0, 349.23, 0], lead: [1175, 0, 1318, 1175, 0, 0, 1318, 0], arp: [293, 349, 392, 349, 293, 349, 392, 349] },
    { name: 'Heavy Metal',   scale: [123.47, 138.59, 146.83, 164.81, 185, 196, 220, 246.94], bpm: 145, bass: [123.47, 164.81, 123.47, 185, 123.47, 164.81, 185, 0], melody: [185, 246.94, 220, 196, 185, 0, 220, 0], lead: [740, 0, 880, 740, 0, 0, 880, 740], arp: [185, 220, 247, 220, 185, 220, 247, 220] },
    { name: 'Synth Wave',    scale: [174.61, 196, 207.65, 233.08, 261.63, 277.18, 311.13, 349.23], bpm: 135, bass: [174.61, 207.65, 174.61, 261.63, 174.61, 207.65, 261.63, 0], melody: [261.63, 349.23, 311.13, 277.18, 261.63, 0, 311.13, 0], lead: [1046, 0, 1175, 1046, 0, 0, 1175, 0], arp: [261, 311, 349, 311, 261, 311, 349, 311] },
    { name: 'Neon Hop',      scale: [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440], bpm: 125, bass: [220, 261.63, 329.63, 220, 220, 261.63, 329.63, 220], melody: [392, 440, 392, 349.23, 392, 0, 440, 392], lead: [0, 880, 988, 0, 0, 880, 988, 880], arp: [329, 440, 523, 440, 329, 440, 523, 440] },
    { name: 'Bass Drop',     scale: [164.81, 185, 196, 220, 246.94, 261.63, 293.66, 329.63], bpm: 140, bass: [82.4, 0, 82.4, 98, 82.4, 0, 98, 0], melody: [246.94, 329.63, 293.66, 246.94, 220, 0, 246.94, 0], lead: [0, 740, 0, 0, 740, 0, 0, 0], arp: [329, 0, 440, 329, 0, 440, 329, 0] },
    { name: 'Acid Pulse',    scale: [130.81, 146.83, 155.56, 174.61, 196, 207.65, 233.08, 261.63], bpm: 150, bass: [130.81, 0, 174.61, 0, 196, 0, 174.61, 0], melody: [196, 233.08, 196, 174.61, 196, 0, 233.08, 0], lead: [784, 880, 784, 0, 0, 880, 0, 0], arp: [196, 233, 261, 196, 196, 233, 261, 196] },
    { name: 'Hazard Beat',   scale: [196, 220, 246.94, 261.63, 293.66, 329.63, 369.99, 392], bpm: 155, bass: [196, 246.94, 196, 293.66, 196, 246.94, 293.66, 0], melody: [293.66, 369.99, 329.63, 293.66, 261.63, 0, 329.63, 0], lead: [1175, 0, 1318, 1175, 0, 0, 1318, 0], arp: [293, 369, 440, 369, 293, 369, 440, 369] },
    { name: 'Grind Mode',    scale: [146.83, 164.81, 174.61, 185, 196, 220, 246.94, 261.63], bpm: 165, bass: [146.83, 220, 146.83, 196, 146.83, 220, 196, 0], melody: [196, 261.63, 220, 196, 185, 0, 220, 0], lead: [784, 0, 880, 0, 0, 880, 0, 0], arp: [196, 220, 247, 220, 196, 220, 247, 220] },
    { name: 'Rush Hour',     scale: [220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33], bpm: 150, bass: [220, 0, 293.66, 329.63, 0, 392, 0, 329.63], melody: [329.63, 440, 493.88, 440, 392, 0, 440, 0], lead: [880, 0, 988, 880, 0, 0, 1175, 0], arp: [329, 440, 587, 440, 329, 440, 587, 440] },
    { name: 'Burning Edge',  scale: [164.81, 185, 207.65, 246.94, 277.18, 311.13, 369.99, 415.30], bpm: 145, bass: [164.81, 207.65, 164.81, 246.94, 164.81, 207.65, 246.94, 0], melody: [246.94, 311.13, 277.18, 246.94, 207.65, 0, 277.18, 0], lead: [988, 0, 1108, 988, 0, 0, 1108, 0], arp: [246, 311, 370, 311, 246, 311, 370, 311] },
    { name: 'Hunter Mode',    scale: [110, 123.47, 138.59, 164.81, 185, 196, 220, 246.94], bpm: 130, bass: [110, 0, 138.59, 164.81, 0, 196, 0, 164.81], melody: [185, 220, 246.94, 220, 185, 0, 220, 0], lead: [740, 0, 830, 740, 0, 0, 830, 0], arp: [185, 220, 247, 220, 185, 220, 247, 220] },
  ];
  const BOSS_TRACK = {
    name: 'Boss Battle', scale: [110, 116.54, 130.81, 146.83, 164.81, 174.61, 196, 220],
    bpm: 140,
    bass: [110, 110, 0, 130.81, 0, 146.83, 0, 196],
    melody: [220, 0, 196, 174.61, 196, 0, 220, 196],
    type: 'boss'
  };

  let track;
  if (bossMusicActive) {
    track = BOSS_TRACK;
  } else {
    if (trackIdx === undefined) trackIdx = Math.floor(Math.random() * TRACKS.length);
    currentMusicTrack = trackIdx;
    track = TRACKS[trackIdx];
  }

  const scale = track.scale;
  const bpm = track.bpm;
  const beat = 60 / bpm;
  const stepTime = beat / 2;
  const bassLine = track.bass;
  const melody = track.melody;
  const lead = track.lead || melody;
  const arp = track.arp || melody;

  const playStep = () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const step = musicStep % 16;
    const sub = musicStep % 4;
    const sextuplet = musicStep % 8;
    // === KICK (EDM punchy com click + body) ===
    const kickOn1 = bossMusicActive || sub === 0;
    const kickOn3 = bossMusicActive || (sub === 2 && (step % 4 === 2));
    if (kickOn1) {
      // click inicial agudo
      const click = audioCtx.createOscillator();
      const cg = audioCtx.createGain();
      click.frequency.setValueAtTime(1800, t);
      click.frequency.exponentialRampToValueAtTime(60, t + 0.005);
      cg.gain.setValueAtTime(bossMusicActive ? 0.5 : 0.4, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
      click.connect(cg); cg.connect(musicGain);
      click.start(t); click.stop(t + 0.012);
      // body grave
      const body = audioCtx.createOscillator();
      const bg = audioCtx.createGain();
      body.frequency.setValueAtTime(bossMusicActive ? 110 : 140, t);
      body.frequency.exponentialRampToValueAtTime(35, t + 0.15);
      bg.gain.setValueAtTime(bossMusicActive ? 0.6 : 0.5, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      body.connect(bg); bg.connect(musicGain);
      body.start(t); body.stop(t + 0.26);
    }
    if (kickOn3 && sub === 2) {
      const click = audioCtx.createOscillator();
      const cg = audioCtx.createGain();
      click.frequency.setValueAtTime(2200, t);
      click.frequency.exponentialRampToValueAtTime(70, t + 0.005);
      cg.gain.setValueAtTime(0.4, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
      click.connect(cg); cg.connect(musicGain);
      click.start(t); click.stop(t + 0.012);
      const body = audioCtx.createOscillator();
      const bg = audioCtx.createGain();
      body.frequency.setValueAtTime(160, t);
      body.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      bg.gain.setValueAtTime(0.4, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
      body.connect(bg); bg.connect(musicGain);
      body.start(t); body.stop(t + 0.21);
    }
    // === SNARE/HAT no 2 e 4 ===
    if (sub === 2) {
      const isSnare = step % 4 === 2;
      const buf = audioCtx.createBuffer(1, 1500, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < 1500; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 1500);
      const n = audioCtx.createBufferSource();
      n.buffer = buf;
      const f = audioCtx.createBiquadFilter();
      f.type = isSnare ? 'bandpass' : 'highpass';
      f.frequency.value = isSnare ? 1800 : 7500;
      f.Q.value = isSnare ? 1.0 : 0.6;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(isSnare ? 0.20 : 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + (isSnare ? 0.15 : 0.06));
      n.connect(f); f.connect(g); g.connect(musicGain);
      n.start(t);
      // snare: adicionar tom grave
      if (isSnare) {
        const o = audioCtx.createOscillator();
        const og = audioCtx.createGain();
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(110, t + 0.08);
        og.gain.setValueAtTime(0.10, t);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
        o.connect(og); og.connect(musicGain);
        o.start(t); o.stop(t + 0.11);
      }
    }
    // === OFF-BEAT HAT ===
    if (sextuplet === 7) {
      const buf = audioCtx.createBuffer(1, 800, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < 800; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / 800);
      const n = audioCtx.createBufferSource();
      n.buffer = buf;
      const f = audioCtx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 8500;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      n.connect(f); f.connect(g); g.connect(musicGain);
      n.start(t);
    }
    // === BASSLINE (sawtooth + filtro lowpass para EDM) ===
    if (step % 2 === 0 && bassLine[step / 2]) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const f = audioCtx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 800;
      f.Q.value = 4;
      o.type = bossMusicActive ? 'sawtooth' : 'sawtooth';
      o.frequency.value = bassLine[step / 2] / 2;
      // envelope ADSR-like
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(bossMusicActive ? 0.18 : 0.14, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
      o.connect(f); f.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 0.31);
    }
    // === ARP (square wave rápido com filter envelope) ===
    if (arp[step]) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const f = audioCtx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(200, t);
      f.frequency.exponentialRampToValueAtTime(4000, t + 0.05);
      f.frequency.exponentialRampToValueAtTime(400, t + 0.10);
      f.Q.value = 6;
      o.type = 'square';
      o.frequency.value = arp[step];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
      o.connect(f); f.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 0.11);
    }
    // === MELODY (sawtooth com filtro, estilo supersaw EDM) ===
    if (step % 2 === 0 && melody[step / 2]) {
      // supersaw: 3 oscillators detuned
      for (let d = -1; d <= 1; d++) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 4500;
        f.Q.value = 2;
        o.type = 'sawtooth';
        o.frequency.value = melody[step / 2] * (1 + d * 0.005);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(bossMusicActive ? 0.025 : 0.015, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        if (bossMusicActive && Math.random() < 0.3) {
          o.detune.value = d * 25;
        }
        o.connect(f); f.connect(g); g.connect(musicGain);
        o.start(t); o.stop(t + 0.19);
      }
    }
    // === LEAD (square com filter sweep) ===
    if (step % 4 === 0 && lead[(step / 4) % lead.length]) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const f = audioCtx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(800, t);
      f.frequency.exponentialRampToValueAtTime(5000, t + 0.05);
      f.frequency.exponentialRampToValueAtTime(2000, t + 0.20);
      f.Q.value = 5;
      o.type = 'square';
      o.frequency.value = lead[(step / 4) % lead.length];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(f); f.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 0.23);
    }
    // fill (transição a cada 16 steps)
    if (step === 14 && musicStep > 0) {
      for (let i = 0; i < 4; i++) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'square';
        o.frequency.value = scale[i % scale.length] * 4;
        g.gain.setValueAtTime(0.04, t + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.05);
        o.connect(g); g.connect(musicGain);
        o.start(t + i * 0.04); o.stop(t + i * 0.04 + 0.06);
      }
    }
    // boss: grito agudo a cada 4 compassos
    if (bossMusicActive && step === 0 && musicStep > 0) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(440, t);
      o.frequency.exponentialRampToValueAtTime(880, t + 0.4);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 0.5);
    }
    // pad suave — varia o acorde a cada 8 compassos
    if (step === 0) {
      const chordRoot = (musicStep / 16) % 4; // alterna entre 4 acordes
      const chord = [scale[chordRoot], scale[(chordRoot + 2) % 7], scale[(chordRoot + 4) % 7]];
      chord.forEach((freq) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freq / (bossMusicActive ? 1 : 2);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(bossMusicActive ? 0.04 : 0.025, t + 0.3);
        g.gain.linearRampToValueAtTime(0, t + beat * 4);
        o.connect(g); g.connect(musicGain);
        o.start(t); o.stop(t + beat * 4);
      });
    }
    musicStep++;
  };
  musicTimer = setInterval(playStep, stepTime * 1000);
}

function startBossMusic() {
  // salvar faixa atual e tocar boss music
  savedMusicTrack = currentMusicTrack;
  bossMusicActive = true;
  startMusicTrack();
}

function endBossMusic() {
  // voltar para a música salva
  bossMusicActive = false;
  startMusicTrack(savedMusicTrack);
}

function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  musicStep = 0;
}

function resumeAudioCtx() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}


const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
// Pixel ratio: cap 1.25 on mobile (Capacitor WebView) for ~30% fewer fragments
// vs the 1.5 we used on desktop. boot.ts sets window.__NATIVE__ before this
// code runs (see boot.ts top-level).
const _isNativeRender = !!(typeof window !== 'undefined' && window.__NATIVE__);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, _isNativeRender ? 1.25 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;   // perf: 40+ buildings * PCF = expensive
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// ReinhardToneMapping is ~5-10% cheaper than ACESFilmic per fragment on mobile
// GPUs and still preserves the neon look. ACES was the desktop default; we
// switch to Reinhard globally so the experience matches.
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1238);
scene.fog = new THREE.FogExp2(0x25204a, 0.0075);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 400);

// ----- Sky / stars -----
function buildSky() {
  const geo = new THREE.SphereGeometry(300, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: \`
      varying vec3 vPos;
      void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    \`,
    fragmentShader: \`
      varying vec3 vPos;
      uniform float uTime;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float hash3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      void main(){
        vec3 dir = normalize(vPos);
        // vertical gradient: mais claro e realista (noite urbana clara)
        float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 colTop = vec3(0.06, 0.10, 0.22);
        vec3 colMid = vec3(0.18, 0.14, 0.32);
        vec3 colHor = vec3(0.35, 0.20, 0.38);
        vec3 col;
        if (t < 0.5) col = mix(colHor, colMid, t * 2.0);
        else col = mix(colMid, colTop, (t - 0.5) * 2.0);
        // soft city glow on horizon
        float glow = pow(1.0 - abs(dir.y), 4.0) * 0.9;
        col += vec3(0.45, 0.20, 0.45) * glow;
        // band of warm light near horizon (city light pollution)
        float band = smoothstep(0.0, 0.15, abs(dir.y));
        col += vec3(0.30, 0.18, 0.25) * (1.0 - band) * 0.5;
        // stars
        vec2 uv = vec2(atan(dir.z, dir.x)*0.5, asin(dir.y));
        vec2 g = floor(uv * 280.0);
        float h = hash(g);
        if (h > 0.992){
          float s = (h - 0.992) / 0.008;
          col += vec3(0.85, 0.92, 1.0) * s * 0.9;
        }
        // milky way band (nebula sutil)
        float mw = noise(uv * 4.0) * 0.15 * smoothstep(0.0, 0.3, dir.y);
        col += vec3(0.30, 0.20, 0.40) * mw;
        // distant moon
        vec3 moonDir = normalize(vec3(0.6, 0.5, -0.3));
        float md = max(dot(dir, moonDir), 0.0);
        col += vec3(0.95, 0.97, 1.0) * pow(md, 800.0) * 1.8;
        col += vec3(0.50, 0.55, 0.80) * pow(md, 12.0) * 0.10;
        gl_FragColor = vec4(col, 1.0);
      }
    \`
  });
  const sky = new THREE.Mesh(geo, mat);
  sky.userData.shader = mat;
  return sky;
}
const sky = buildSky();
scene.add(sky);

// ----- Ground -----
function buildGround() {
  const size = GAME.arena.size;
  const geo = new THREE.PlaneGeometry(size * 3, size * 3, 40, 40);
  // displacement for slight terrain
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d = Math.sqrt(x*x + y*y);
    if (d > size * 0.5) {
      pos.setZ(i, Math.sin(x*0.1) * 0.4 + Math.cos(y*0.1) * 0.3 - 1.5);
    }
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({
    color: 0x2a2438, emissive: 0x1a1430, emissiveIntensity: 0.5
  });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // neon grid lines on ground
  const grid = new THREE.GridHelper(size * 3, 60, 0x00ffff, 0x3300aa);
  grid.material.transparent = true; grid.material.opacity = 0.18;
  grid.position.y = 0.01;
  scene.add(grid);

  // center marker
  const center = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.0, 48),
    new THREE.MeshBasicMaterial({ color: 0xff00d4, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  center.rotation.x = -Math.PI / 2; center.position.y = 0.02;
  scene.add(center);
  return ground;
}
buildGround();

// ----- City buildings -----
function buildCity() {
  const size = GAME.arena.size;

  // Textura completa da fachada: base cinza claro, estrutura de painéis,
  // janelas acesas com cores neon, letreiros no topo.
  // O fundo é claro o suficiente para o prédio ser visível mesmo na sombra.
  // Textura de EMISSIVE: só as janelas acesas brilham (resto é preto)
  function buildingEmissiveTex(seed) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 128, 256);
    const neonCols = ['#00e0ff', '#ff00d4', '#ffae00', '#6effce', '#ffe066', '#ff6644', '#88aaff'];
    // usar seed determinístico baseado em seed+offset para casar com a fachada
    const rng = (n) => { const x = Math.sin(seed * 9301 + n * 49297) * 233280; return x - Math.floor(x); };
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = 8 + col * 28;
        const wy = 8 + row * 32;
        // mesmo padrão de "aceso" da fachada (mesma seed)
        if (rng(row * 7 + col * 3) < 0.75) {
          const col1 = neonCols[Math.floor(rng(row * 11 + col * 5) * neonCols.length)];
          const col2 = neonCols[Math.floor(rng(row * 13 + col * 7) * neonCols.length)];
          const grd = ctx.createLinearGradient(wx, wy, wx, wy + 12);
          grd.addColorStop(0, col1);
          grd.addColorStop(1, col2);
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = grd;
          ctx.fillRect(wx + 1, wy + 1, 18, 10);
        }
      }
    }
    if (seed % 3 === 0) {
      const yTop = 8;
      const col1 = neonCols[Math.floor(rng(99) * neonCols.length)];
      ctx.fillStyle = col1;
      ctx.fillRect(10, yTop, 108, 5);
      ctx.fillStyle = neonCols[Math.floor(rng(100) * neonCols.length)];
      ctx.fillRect(20, yTop + 9, 88, 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function buildingFacadeTex(seed) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256;
    const ctx = c.getContext('2d');
    // base: cinza bem claro (quase branco) — o prédio sempre fica visível
    ctx.fillStyle = '#a8a0b8'; ctx.fillRect(0, 0, 128, 256);
    // textura sutil de concreto/metal
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = \`rgba(\${80 + Math.random() * 50}, \${75 + Math.random() * 50}, \${95 + Math.random() * 50}, \${0.05 + Math.random() * 0.18})\`;
      ctx.fillRect(Math.random() * 128, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    // estrutura de painéis verticais
    for (let x = 0; x < 128; x += 16) {
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.fillRect(x, 0, 1, 256);
    }
    // linhas horizontais (andares)
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, y, 128, 1);
    }
    // janelas — todas acesas em cores neon
    const neonCols = ['#00e0ff', '#ff00d4', '#ffae00', '#6effce', '#ffe066', '#ff6644', '#88aaff'];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = 8 + col * 28;
        const wy = 8 + row * 32;
        // moldura escura
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(wx - 1, wy - 1, 22, 14);
        // 75% acesa
        if (Math.random() < 0.75) {
          const col1 = neonCols[Math.floor(Math.random() * neonCols.length)];
          const col2 = neonCols[Math.floor(Math.random() * neonCols.length)];
          const grd = ctx.createLinearGradient(wx, wy, wx, wy + 12);
          grd.addColorStop(0, col1);
          grd.addColorStop(1, col2);
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = grd;
          ctx.fillRect(wx + 1, wy + 1, 18, 10);
          ctx.globalAlpha = 1;
          // reflexo
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(wx + 2, wy + 2, 6, 1);
        } else {
          ctx.fillStyle = '#1a1820';
          ctx.fillRect(wx, wy, 20, 12);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(wx + 9, wy, 1, 12);
      }
    }
    // letreiros no topo
    if (seed % 3 === 0) {
      const yTop = 8;
      const col1 = neonCols[Math.floor(Math.random() * neonCols.length)];
      ctx.fillStyle = col1;
      ctx.fillRect(10, yTop, 108, 5);
      ctx.fillStyle = neonCols[Math.floor(Math.random() * neonCols.length)];
      ctx.fillRect(20, yTop + 9, 88, 3);
    }
    // HVAC/antenas no topo
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < 3; i++) {
      const x = 20 + i * 30;
      ctx.fillRect(x, 240, 12, 8);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // Gerar 5 texturas diferentes (variação por prédio)
  const facadeTextures = [];
  const emissiveTextures = [];
  // texturas geradas a cada nova sessão (com seed diferente para variedade)
  for (let i = 0; i < 10; i++) {
    facadeTextures.push(buildingFacadeTex(i));
    emissiveTextures.push(buildingEmissiveTex(i));
  }
  // paleta de cores base para os prédios — varia por sessão
  const buildingColorPalettes = [
    [0x808898, 0x706880, 0x9080a0, 0x7888a0], // azul-acinzentado
    [0x908870, 0x806875, 0xa08075, 0x707068], // terra
    [0x758090, 0x6080a0, 0x8890a8, 0x687888], // azul-petróleo
    [0x888880, 0x787878, 0xa09890, 0x687070], // cinza-quente
    [0x9c7088, 0x805c80, 0xb48898, 0x7c6080], // magenta-pálido
  ];
  const buildingPalette = buildingColorPalettes[Math.floor(Math.random() * buildingColorPalettes.length)];

  // MeshBasicMaterial ignora iluminação — a textura sempre aparece com cor total
  const arr = [];
  const half = size * 0.5;
  for (let gx = -3; gx <= 3; gx++) {
    for (let gz = -3; gz <= 3; gz++) {
      if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue;
        // 35% dos lotes ficam vazios — cidade mais arejada
        if (Math.random() < 0.35) continue;
      const cx = gx * 12 + (Math.random() - 0.5) * 3;
      const cz = gz * 12 + (Math.random() - 0.5) * 3;
      if (Math.abs(cx) > half - 4 || Math.abs(cz) > half - 4) continue;

      // cada prédio tem tamanho único — variação maior
      const w = 3 + Math.random() * 5;
      const d = 3 + Math.random() * 5;
      const h = 4 + Math.random() * 16;
      // 20% dos prédios são torres finas e altas, 20% são largos e baixos
      let wMod = w, dMod = d, hMod = h;
      const r = Math.random();
      if (r < 0.2) { wMod = w * 0.6; dMod = d * 0.6; hMod = h * 1.5; }
      else if (r < 0.4) { wMod = w * 1.4; dMod = d * 1.4; hMod = h * 0.7; }

      const texIdx = Math.floor(Math.random() * facadeTextures.length);
      const facade = facadeTextures[texIdx];
      const emissiveT = emissiveTextures[texIdx];
      // Reuse the SAME texture across all buildings — Vite/three will upload once.
      const texClone = facade;
      const emClone = emissiveT;
      texClone.needsUpdate = true;
      emClone.needsUpdate = true;
      texClone.wrapS = texClone.wrapT = THREE.RepeatWrapping;
      emClone.wrapS = emClone.wrapT = THREE.RepeatWrapping;
      // repetir a textura proporcionalmente ao aspect ratio do prédio (textura 128x256, ratio 1:2)
      const aspectRepeat = hMod / Math.max(0.5, wMod);
      texClone.repeat.set(1, aspectRepeat);
      emClone.repeat.set(1, aspectRepeat);
      texClone.colorSpace = THREE.SRGBColorSpace;
      emClone.colorSpace = THREE.SRGBColorSpace;
      // MeshStandardMaterial: aceita emissiveMap (para janelas brilharem)
      const mat = new THREE.MeshLambertMaterial({
        map: texClone,
        emissiveMap: emClone,
        emissive: 0xffffff,
        emissiveIntensity: 1.0,});
      const geo = new THREE.BoxGeometry(wMod, hMod, dMod);
      const b = new THREE.Mesh(geo, mat);
      b.position.set(cx, hMod / 2, cz);
      b.receiveShadow = false;
      b.userData = { w: wMod, d: dMod, h: hMod, type: 'building' };
      scene.add(b);
      arr.push(b);

      // top antenna
      if (Math.random() < 0.5) {
        const aH = 2 + Math.random() * 3;
        const ant = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, aH, 6),
          new THREE.MeshBasicMaterial({ color: 0xff00d4 })
        );
        ant.position.set(cx, h + aH / 2, cz);
        scene.add(ant);
        GAME.lampPosts.push({ mesh: ant, baseColor: new THREE.Color(0xff00d4), pos: new THREE.Vector3(cx, h + aH, cz), isAntenna: true });
      }
    }
  }

  // street edges - neon strips along the grid
  for (let i = -3; i <= 3; i++) {
    const stripA = new THREE.Mesh(
      new THREE.BoxGeometry(size, 0.1, 0.4),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e0ff : 0xff00d4 })
    );
    stripA.position.set(0, 0.05, i * 12);
    scene.add(stripA);
    const stripB = stripA.clone();
    stripB.rotation.y = Math.PI / 2;
    stripB.position.set(i * 12, 0.05, 0);
    scene.add(stripB);
  }
  GAME.buildings = arr;
}
buildCity();

// ----- Lamp posts with point lights -----
function buildLamps() {
  const size = GAME.arena.size;
  let count = 0;
  for (let i = -3; i <= 3; i += 2) {
    for (let j = -3; j <= 3; j += 2) {
      if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
      const x = i * 12 + 6;
      const z = j * 12 + 6;
      if (Math.abs(x) > size * 0.5 - 4 || Math.abs(z) > size * 0.5 - 4) continue;
      const color = Math.random() < 0.5 ? 0x00e0ff : 0xff00d4;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 4.5, 8),
        new THREE.MeshLambertMaterial({ color: 0x222233,})
      );
      post.position.set(x, 2.25, z);
      post.castShadow = false;
      scene.add(post);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 12, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      bulb.position.set(x, 4.6, z);
      scene.add(bulb);

      // only add point light to a subset for perf
      let light = null;
      if (count % 2 === 0) {
        light = new THREE.PointLight(color, 1.2, 6, 1.8);
        light.position.set(x, 4.5, z);
        light.castShadow = false;
        scene.add(light);
      }
      GAME.lampPosts.push({ mesh: bulb, baseColor: new THREE.Color(color), pos: new THREE.Vector3(x, 4.5, z), isAntenna: false, light });
      count++;
    }
  }
}
buildLamps();

// Ambient + hemisphere
scene.add(new THREE.AmbientLight(0x5060a0, 2.0));
const hemi = new THREE.HemisphereLight(0xa0b8e8, 0x301040, 1.2);
scene.add(hemi);

// Directional moonlight (shadow map is disabled globally; we leave castShadow
// false to skip shadow frustum computation each frame).
const moon = new THREE.DirectionalLight(0xa0b0e0, 1.3);
moon.position.set(40, 60, 20);
scene.add(moon);

function buildWeaponMesh(weaponIdx) {
  const g = new THREE.Group();
  if (weaponIdx === 0) {
    // PISTOLA — compacta, cano curto
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.12, 0.30),
      new THREE.MeshLambertMaterial({ color: 0x202028, emissive: 0x00d4ff, emissiveIntensity: 0.4 })
    );
    g.add(body);
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.20, 8),
      new THREE.MeshLambertMaterial({ color: 0x101018,})
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 0.22);
    g.add(barrel);
    const muzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0, 0.33);
    g.add(muzzle);
    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.10),
      new THREE.MeshLambertMaterial({ color: 0x1a1a22,})
    );
    grip.position.set(0, -0.14, -0.05);
    g.add(grip);
    const mag = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.12, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x00aacc, emissive: 0x00d4ff, emissiveIntensity: 0.6 })
    );
    mag.position.set(0, -0.04, 0.05);
    g.add(mag);
  } else if (weaponIdx === 1) {
    // RIFLE — longo, cano estendido, magazine grande
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.12, 0.55),
      new THREE.MeshLambertMaterial({ color: 0x252028, emissive: 0xff00d4, emissiveIntensity: 0.4 })
    );
    g.add(body);
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.025, 0.35, 8),
      new THREE.MeshLambertMaterial({ color: 0x101015,})
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0, 0.42);
    g.add(barrel);
    const muzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0, 0.62);
    g.add(muzzle);
    const mag = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 0.10),
      new THREE.MeshLambertMaterial({ color: 0x1a1a20, emissive: 0xff00aa, emissiveIntensity: 0.5 })
    );
    mag.position.set(0, -0.16, 0.05);
    g.add(mag);
    // mira holográfica em cima
    const sight = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0xff00d4 })
    );
    sight.position.set(0, 0.09, 0.1);
    g.add(sight);
    // coronha
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.12, 0.18),
      new THREE.MeshLambertMaterial({ color: 0x15151a,})
    );
    stock.position.set(0, 0, -0.32);
    g.add(stock);
  } else if (weaponIdx === 2) {
    // SHOTGUN — grossa, dois canos, pesada
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.50),
      new THREE.MeshLambertMaterial({ color: 0x2a1a10, emissive: 0xffaa00, emissiveIntensity: 0.4 })
    );
    g.add(body);
    // dois canos
    for (let i = 0; i < 2; i++) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.04, 0.40, 8),
        new THREE.MeshLambertMaterial({ color: 0x1a0a05,})
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(i === 0 ? -0.035 : 0.035, 0, 0.35);
      g.add(barrel);
    }
    const muzzle = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.04, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    muzzle.position.set(0, 0, 0.56);
    g.add(muzzle);
    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.18, 0.10),
      new THREE.MeshLambertMaterial({ color: 0x1a0a05,})
    );
    grip.position.set(0, -0.18, -0.05);
    g.add(grip);
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.14, 0.20),
      new THREE.MeshLambertMaterial({ color: 0x1a0a05,})
    );
    stock.position.set(0, 0, -0.32);
    g.add(stock);
  }
  return g;
}
// Meshes para armas obtidas por cartas
function buildBazookaMesh() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.10, 0.55, 8),
    new THREE.MeshLambertMaterial({ color: 0x4a3520, emissive: 0x00ff00, emissiveIntensity: 0.3 })
  );
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.10, 0.15, 8),
    new THREE.MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000, emissiveIntensity: 0.5 })
  );
  tip.rotation.x = Math.PI / 2;
  tip.position.z = 0.30;
  g.add(tip);
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.14, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x2a1a0a,})
  );
  handle.position.set(0, -0.16, -0.05);
  g.add(handle);
  return g;
}

function buildMinigunMesh() {
  const g = new THREE.Group();
  // 6 canos rotativos
  for (let i = 0; i < 6; i++) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6),
      new THREE.MeshLambertMaterial({ color: 0x303040,})
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.rotation.z = (i / 6) * Math.PI * 2;
    g.add(barrel);
  }
  // corpo central
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.20, 0.20, 0.30),
    new THREE.MeshLambertMaterial({ color: 0x404050, emissive: 0xff6600, emissiveIntensity: 0.5 })
  );
  body.position.z = -0.05;
  g.add(body);
  // coronha
  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.16, 0.22),
    new THREE.MeshLambertMaterial({ color: 0x202028,})
  );
  stock.position.set(0, 0, -0.32);
  g.add(stock);
  return g;
}

function buildLaserMesh() {
  const g = new THREE.Group();
  // arma futurística longa
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.10, 0.55),
    new THREE.MeshLambertMaterial({ color: 0x001a22, emissive: 0x00ffff, emissiveIntensity: 1.0 })
  );
  g.add(body);
  // emissor brilhante na ponta
  const emitter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.10, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ffff })
  );
  emitter.rotation.x = Math.PI / 2;
  emitter.position.z = 0.30;
  g.add(emitter);
  const lt = new THREE.PointLight(0x00ffff, 0.8, 2, 2);
  lt.position.set(0, 0, 0.35);
  g.add(lt);
  return g;
}

function buildRailgunMesh() {
  const g = new THREE.Group();
  // rifle grosso e longo
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.14, 0.70),
    new THREE.MeshLambertMaterial({ color: 0x2a2a40, emissive: 0xaaaaff, emissiveIntensity: 0.4 })
  );
  g.add(body);
  const rails = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.04, 0.70),
    new THREE.MeshLambertMaterial({ color: 0xff0080, emissive: 0xff00ff, emissiveIntensity: 1.5 })
  );
  rails.position.y = 0.10;
  g.add(rails);
  return g;
}

function buildFlamethrowerMesh() {
  const g = new THREE.Group();
  // tanque nas costas
  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.30, 8),
    new THREE.MeshLambertMaterial({ color: 0x552200,})
  );
  tank.position.set(0, -0.05, -0.30);
  g.add(tank);
  // lança-chamas
  const lance = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.10, 0.50, 8),
    new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0xff4400, emissiveIntensity: 0.6 })
  );
  lance.rotation.x = Math.PI / 2;
  lance.position.z = 0.30;
  g.add(lance);
  // bico de fogo
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.08, 8),
    new THREE.MeshBasicMaterial({ color: 0xff8800 })
  );
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = 0.55;
  g.add(nozzle);
  return g;
}

function buildPlasmaMesh() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.12, 0.50),
    new THREE.MeshLambertMaterial({ color: 0x220044, emissive: 0x8800ff, emissiveIntensity: 0.6 })
  );
  g.add(body);
  // bobinas de plasma
  for (let i = 0; i < 3; i++) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 12),
      new THREE.MeshBasicMaterial({ color: 0xcc44ff })
    );
    coil.position.z = -0.15 + i * 0.18;
    coil.rotation.y = Math.PI / 2;
    g.add(coil);
  }
  return g;
}

// ----- Player -----
function buildPlayer() {
  const root = new THREE.Group();

  // materials
  const skin = new THREE.MeshLambertMaterial({ color: 0x6b5a4a,});
  const armorDark = new THREE.MeshLambertMaterial({ color: 0x1c1d28, emissive: 0x0a0a20, emissiveIntensity: 0.4 });
  const armorAccent = new THREE.MeshLambertMaterial({ color: 0x14152a, emissive: 0x00d4ff, emissiveIntensity: 0.5 });
  const armorMagenta = new THREE.MeshLambertMaterial({ color: 0x1a0a1a, emissive: 0xff00d4, emissiveIntensity: 0.7 });
  const cloth = new THREE.MeshLambertMaterial({ color: 0x0e0a1a,});
  const boot = new THREE.MeshLambertMaterial({ color: 0x0a0a14,});
  const visorMat = new THREE.MeshLambertMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1.4,});
  const gunDark = new THREE.MeshLambertMaterial({ color: 0x15151c, emissive: 0x00d4ff, emissiveIntensity: 0.3 });
  const gunAccent = new THREE.MeshLambertMaterial({ color: 0x222236, emissive: 0xff00aa, emissiveIntensity: 0.5 });

  // ----- PELVIS (raiz do corpo) -----
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.28), armorDark);
  pelvis.position.y = 0.92;
  pelvis.castShadow = false;
  root.add(pelvis);

  // ----- TORSO (peitoral/armadura) -----
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.18;
  root.add(torsoGroup);
  // tronco principal (capsule para forma anatômica)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.35, 8, 14), armorDark);
  torso.castShadow = false; torso.receiveShadow = false;
  torsoGroup.add(torso);
  // peitoral (placa frontal)
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.08), armorAccent);
  chestPlate.position.set(0, 0.08, 0.22);
  chestPlate.castShadow = true;
  torsoGroup.add(chestPlate);
  // núcleo brilhante no peito (luz)
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x00ffff })
  );
  core.position.set(0, 0.08, 0.28);
  torsoGroup.add(core);
  // colar/área do pescoço
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 10), armorDark);
  collar.position.y = 0.30;
  torsoGroup.add(collar);
  // costas (placa com detalhes)
  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.06), armorDark);
  backPlate.position.set(0, 0.05, -0.22);
  torsoGroup.add(backPlate);
  // jetpack
  const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.18), armorMagenta);
  packBody.position.set(0, 0.0, -0.32);
  packBody.castShadow = true;
  torsoGroup.add(packBody);
  // nozzles do jetpack
  const nozzleL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 8), gunDark);
  nozzleL.position.set(-0.12, -0.18, -0.4);
  nozzleL.rotation.x = Math.PI / 2;
  torsoGroup.add(nozzleL);
  const nozzleR = nozzleL.clone();
  nozzleR.position.x = 0.12;
  torsoGroup.add(nozzleR);
  // luz do jato (point light no jetpack)
  const packLight = new THREE.PointLight(0xff00d4, 0.8, 2, 2);
  packLight.position.set(0, -0.18, -0.5);
  torsoGroup.add(packLight);

  // ----- OMBROS -----
  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), armorDark);
  shoulderL.position.set(-0.38, 0.30, 0);
  shoulderL.castShadow = true;
  torsoGroup.add(shoulderL);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x = 0.38;
  torsoGroup.add(shoulderR);
  // ombreiras (pauldrons) - peças angulares sobre os ombros
  const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), armorAccent);
  pauldronL.position.set(-0.38, 0.36, 0);
  torsoGroup.add(pauldronL);
  const pauldronR = pauldronL.clone();
  pauldronR.position.x = 0.38;
  torsoGroup.add(pauldronR);

  // ----- BRAÇOS (capsules + mãos) -----
  // braço esquerdo
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.38, 0.30, 0);
  root.add(armLGroup);
  const upperArmL = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 6, 10), armorDark);
  upperArmL.castShadow = true;
  armLGroup.add(upperArmL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), skin);
  handL.position.y = -0.30;
  armLGroup.add(handL);

  // braço direito (segura arma)
  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.38, 0.30, 0);
  root.add(armRGroup);
  const upperArmR = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 6, 10), armorDark);
  upperArmR.castShadow = true;
  armRGroup.add(upperArmR);
  const forearmR = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 6, 10), armorAccent);
  forearmR.position.y = -0.20;
  forearmR.castShadow = true;
  armRGroup.add(forearmR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), skin);
  handR.position.y = -0.42;
  armRGroup.add(handR);

  // ----- CABEÇA/CAPACETE -----
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.78;
  root.add(headGroup);
  // pescoço
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8), skin);
  neck.position.y = -0.10;
  headGroup.add(neck);
  // cabeça (skin)
  const headSkin = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), skin);
  headSkin.scale.set(1, 1.1, 0.95);
  headSkin.position.y = 0.04;
  headGroup.add(headSkin);
  // capacete
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), armorDark);
  helmet.position.y = 0.06;
  helmet.scale.set(1.05, 1.1, 1.1);
  headGroup.add(helmet);
  // topo do capacete (mais alto atrás)
  const helmetTop = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), armorAccent);
  helmetTop.position.y = 0.10;
  helmetTop.scale.set(1.05, 0.6, 1.05);
  headGroup.add(helmetTop);
  // visor (horizontal, brilhante)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.04), visorMat);
  visor.position.set(0, 0.05, 0.16);
  headGroup.add(visor);
  // pequena antena
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 4), armorAccent);
  antenna.position.set(0.10, 0.30, -0.05);
  headGroup.add(antenna);
  // luz na ponta da antena
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff00d4 }));
  antennaTip.position.set(0.10, 0.40, -0.05);
  headGroup.add(antennaTip);

  // ----- CINTURA -----
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.10, 0.34), armorAccent);
  belt.position.y = 0.82;
  belt.castShadow = true;
  root.add(belt);
  // coldre lateral
  const holster = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.16, 0.10), boot);
  holster.position.set(0.18, 0.62, 0.10);
  root.add(holster);

  // ----- PERNAS -----
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.13, 0.78, 0);
  root.add(legLGroup);
  const upperLegL = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.28, 6, 10), armorDark);
  upperLegL.castShadow = true;
  legLGroup.add(upperLegL);
  const lowerLegL = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.28, 6, 10), cloth);
  lowerLegL.position.y = -0.28;
  lowerLegL.castShadow = true;
  legLGroup.add(lowerLegL);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), boot);
  bootL.position.set(0, -0.50, 0.04);
  bootL.castShadow = true;
  legLGroup.add(bootL);
  const kneeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), armorAccent);
  kneeL.position.y = -0.10;
  legLGroup.add(kneeL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.13, 0.78, 0);
  root.add(legRGroup);
  const upperLegR = upperLegL.clone();
  legRGroup.add(upperLegR);
  const lowerLegR = lowerLegL.clone();
  lowerLegR.position.y = -0.28;
  legRGroup.add(lowerLegR);
  const bootR = bootL.clone();
  bootR.position.set(0, -0.50, 0.04);
  legRGroup.add(bootR);
  const kneeR = kneeL.clone();
  kneeR.position.y = -0.10;
  legRGroup.add(kneeR);

  // ----- CAPA (pequena, sobre os ombros) -----
  const cape = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.6, 4, 6),
    new THREE.MeshLambertMaterial({ color: 0x14102a, side: THREE.DoubleSide, emissive: 0x080418, emissiveIntensity: 0.4 })
  );
  cape.position.set(0, 0.10, -0.28);
  cape.rotation.x = 0.2;
  root.add(cape);

  // ----- ARMA (rifle composto) -----
  const gunGroup = new THREE.Group();
  // arma inicial (pistola) — substituível via applyWeapon()
  const initialWeapon = buildWeaponMesh(0);
  gunGroup.add(initialWeapon);
  // luz da arma
  const gunLight = new THREE.PointLight(0x00d4ff, 0.6, 2, 2);
  gunLight.position.set(0, 0, 0.5);
  gunGroup.add(gunLight);
  // posicionar a arma na mão direita
  gunGroup.position.set(0.45, 1.35, 0.30);
  gunGroup.rotation.y = 0;
  root.add(gunGroup);

  // muzzle flash light (separado, dinâmico)
  const flash = new THREE.PointLight(0x00ffff, 0, 5, 2);
  flash.position.set(0, 0, 0);
  root.add(flash);

  root.userData = {
    armLGroup, armRGroup, legLGroup, legRGroup,
    torsoGroup, headGroup, gunGroup, cape,
    chestPlate, flash, walkT: 0, muzzleT: 0, fireKick: 0,
    currentWeaponMesh: initialWeapon,
  };
  scene.add(root);
  return root;
}
GAME.player = buildPlayer();
GAME.player.position.set(0, 0, 0);

// player stats — munição infinita (reload sempre restaura o pente, sem consumir reserva)
const playerStats = {
  hp: 100, maxHp: 100,
  shield: 0, maxShield: 50,
  ammo: 12, maxAmmo: 12,
  fireRate: 0.20, fireCooldown: 0,
  baseDamage: 22,
  damageMul: 1.0,
  fireRateMul: 1.0,
  speedMul: 1.0,
  baseSpeed: 8,
  reloading: false, reloadTime: 1.4, reloadT: 0, reloadMul: 1.0,
  sprintMul: 1.55,
  dashCooldown: 0, dashTimer: 0, dashSpeed: 24, dashCdMul: 1.0,
  damageFlashT: 0,
  invincible: 0,
  // arma atual
  currentWeapon: 1, // slot 1=rifle, 2=pistola, 3=shotgun, 4+=cartas
  // estado da arma (preenchido por applyWeapon)
  pellets: 1,
  spread: 0,
  weaponPierce: 0,
  weaponExplosive: false,
  weaponFireDoT: false,
  weaponId: 'rifle',
  unlockedWeapons: [],
  // efeitos
  pierce: 0,
  multishot: 0,
  explosive: false,
  lifesteal: 0,
  critChance: 0,
  critMul: 1.5,
  bounce: 0,
  damageReduction: 0,
  hpRegenPerSec: 0,
  hpRegenT: 0,
  shieldRegenPerSec: 0,
  shieldRegenT: 0,
  // status
  revives: 0,
  invulnPeriodic: 0,
  explosiveKills: false,
  chaosDamage: false,
  executeThreshold: 0,
  frenzyKills: 0,
  frenzyT: 0,
};

// Definições das armas
// Slots 1 e 2 são armas iniciais (RIFLE=1, PISTOLA=2).
// Slot 3+ são armas obtidas por cartas (BAZOOKA, MINIGUN, LASER, etc).
const WEAPONS = [
  null, // slot 0 reservado (1-indexed)
  {
    id: 'rifle', name: 'RIFLE', icon: '🔫',
    maxAmmo: 30, fireRate: 0.09, damage: 14, reloadTime: 2.0,
    spread: 0.02, autoFire: true, pellets: 1,
    sound: 'shoot_rifle', reloadSound: 'reload_rifle',
    desc: 'Automática. 30 tiros, dano 14.',
  },
  {
    id: 'pistol', name: 'PISTOLA', icon: '🔫',
    maxAmmo: 12, fireRate: 0.20, damage: 22, reloadTime: 1.4,
    spread: 0, autoFire: false, pellets: 1,
    sound: 'shoot_pistol', reloadSound: 'reload_pistol',
    desc: 'Semi-automática. 12 tiros, dano 22.',
  },
  {
    id: 'shotgun', name: 'SHOTGUN', icon: '💥',
    maxAmmo: 6, fireRate: 0.55, damage: 9, reloadTime: 2.4,
    spread: 0.15, autoFire: false, pellets: 7,
    sound: 'shoot_shotgun', reloadSound: 'reload_shotgun',
    desc: '7 projéteis. 6 tiros, dano 9 cada.',
  },
  // armas de carta (slot 3+)
  {
    id: 'bazooka', name: 'BAZOOKA', icon: '🚀',
    maxAmmo: 1, fireRate: 1.0, damage: 80, reloadTime: 2.5,
    spread: 0.03, autoFire: false, pellets: 1,
    sound: 'shoot_bazooka', reloadSound: 'reload_bazooka',
    desc: 'Explosiva. 1 tiro, dano 80, AOE.',
    explosive: true,
    buildMesh: buildBazookaMesh,
  },
  {
    id: 'minigun', name: 'MINIGUN', icon: '🔫',
    maxAmmo: 100, fireRate: 0.05, damage: 8, reloadTime: 4.0,
    spread: 0.06, autoFire: true, pellets: 1,
    sound: 'shoot_minigun', reloadSound: 'reload_minigun',
    desc: 'Rajada absurda. 100 tiros, dano 8.',
    buildMesh: buildMinigunMesh,
  },
  {
    id: 'laser', name: 'LASER', icon: '⚡',
    maxAmmo: 999, fireRate: 0.04, damage: 6, reloadTime: 0.3,
    spread: 0, autoFire: true, pellets: 1,
    sound: 'shoot_laser', reloadSound: 'reload_laser',
    desc: 'Raio contínuo. 999 tiros, dano 6.',
    pierce: 999,
    buildMesh: buildLaserMesh,
  },
  {
    id: 'railgun', name: 'RAILGUN', icon: '🎯',
    maxAmmo: 5, fireRate: 0.8, damage: 120, reloadTime: 2.0,
    spread: 0, autoFire: false, pellets: 1,
    sound: 'shoot_railgun', reloadSound: 'reload_railgun',
    desc: 'Atravessa tudo. 5 tiros, dano 120.',
    pierce: 5,
    buildMesh: buildRailgunMesh,
  },
  {
    id: 'flamethrower', name: 'CHAMAS', icon: '🔥',
    maxAmmo: 50, fireRate: 0.03, damage: 4, reloadTime: 3.0,
    spread: 0.20, autoFire: true, pellets: 1,
    sound: 'shoot_flame', reloadSound: 'reload_flame',
    desc: 'Lança-chamas. 50 tiros, dano 4 contínuo.',
    fireDoT: true,
    buildMesh: buildFlamethrowerMesh,
  },
  {
    id: 'plasma', name: 'PLASMA', icon: '⚡',
    maxAmmo: 40, fireRate: 0.12, damage: 25, reloadTime: 2.2,
    spread: 0.04, autoFire: true, pellets: 1,
    sound: 'shoot_plasma', reloadSound: 'reload_plasma',
    desc: 'Rifle de plasma. 40 tiros, dano 25.',
    explosive: true,
    buildMesh: buildPlasmaMesh,
  },
];

function getWeapon(idx) {
  return WEAPONS[idx] || null;
}

function applyWeapon(idx) {
  const w = getWeapon(idx);
  if (!w) return;
  playerStats.currentWeapon = idx;
  playerStats.maxAmmo = w.maxAmmo;
  playerStats.ammo = w.maxAmmo;
  playerStats.fireRate = w.fireRate;
  playerStats.baseDamage = w.damage;
  playerStats.reloadTime = w.reloadTime;
  playerStats.pellets = w.pellets || 1;
  playerStats.spread = w.spread || 0;
  playerStats.weaponPierce = w.pierce || 0;
  playerStats.weaponExplosive = w.explosive || false;
  playerStats.weaponFireDoT = w.fireDoT || false;
  playerStats.weaponId = w.id;
  // reconstruir mesh da arma
  if (GAME.player.userData.currentWeaponMesh) {
    const old = GAME.player.userData.currentWeaponMesh;
    old.traverse(o => { if (o.isMesh) o.geometry?.dispose(); });
    GAME.player.userData.gunGroup.remove(old);
  }
  let mesh;
  if (w.buildMesh) {
    mesh = w.buildMesh();
  } else {
    // slot 1=rifle, 2=pistola, 3=shotgun — mapear para buildWeaponMesh (0=pistola, 1=rifle, 2=shotgun)
    let builderIdx = 2; // default shotgun
    if (w.id === 'rifle') builderIdx = 1;
    else if (w.id === 'pistol') builderIdx = 0;
    else if (w.id === 'shotgun') builderIdx = 2;
    mesh = buildWeaponMesh(builderIdx);
  }
  GAME.player.userData.gunGroup.add(mesh);
  GAME.player.userData.currentWeaponMesh = mesh;
  playSfx('weapon_switch');
  // atualizar HUD
  document.getElementById('weaponName').textContent = w.name;
  document.getElementById('weaponIcon').textContent = w.icon;
}

// ----- Enemies -----
// Calcula o "power level" do jogador baseado nas cartas coletadas.
// Quanto mais upgrades, mais fortes ficam os inimigos para escalar o desafio.
function getPlayerPowerLevel() {
  let power = 0;
  power += Math.max(0, playerStats.damageMul - 1) * 5;
  power += Math.max(0, playerStats.fireRateMul < 1 ? (1 - playerStats.fireRateMul) * 4 : 0);
  power += Math.max(0, playerStats.speedMul - 1) * 4;
  power += Math.max(0, playerStats.maxHp - 100) * 0.05;
  power += Math.max(0, playerStats.maxShield - 50) * 0.05;
  power += playerStats.pierce * 1.5;
  power += playerStats.multishot * 1.5;
  power += playerStats.critChance * 4;
  power += playerStats.lifesteal * 8;
  power += playerStats.bounce * 0.5;
  if (playerStats.explosive) power += 3;
  if (playerStats.executeThreshold) power += 4;
  if (playerStats.invulnPeriodic) power += 3;
  if (playerStats.aegis) power += 5;
  if (playerStats.dashExcalibur) power += 6;
  if (playerStats.lowHpDamageMul) power += 2;
  if (playerStats.chaosDamage) power += 2;
  if (playerStats.sanguePorSangue) power += 3;
  if (playerStats.explosiveKills) power += 2;
  power += Math.max(0, playerStats.critMul - 1.5) * 2;
  power += Math.max(0, playerStats.hpRegenPerSec) * 0.5;
  return power;
}

function makeEnemy(type) {
  let mesh, hp, speed, damage, scale, color, score, attackType = 'melee', attackRange = 1.5;
  const w = GAME.wave;
  // escalonamento baseado no power level do jogador (a cada 1 ponto de power = +2% hp/dano)
  const pl = getPlayerPowerLevel();
  const scaleMul = 1 + pl * 0.02;
  const dmgMul = 1 + pl * 0.015;
  if (type === 'grunt') {
    scale = 1.0; hp = 30 + w * 4; speed = 3.2; damage = (5 * dmgMul) | 0; score = 10;
    attackType = 'melee'; attackRange = 1.5;
    mesh = buildEnemyMesh('grunt');
  } else if (type === 'runner') {
    scale = 1.0; hp = 18 + w * 2; speed = 5.5; damage = (4 * dmgMul) | 0; score = 15;
    attackType = 'melee'; attackRange = 1.4;
    mesh = buildEnemyMesh('runner');
  } else if (type === 'tank') {
    scale = 1.0; hp = 90 + w * 12; speed = 1.9; damage = (10 * dmgMul) | 0; score = 30;
    attackType = 'melee'; attackRange = 1.8;
    mesh = buildEnemyMesh('tank');
  } else if (type === 'crawler') {
    scale = 1.0; hp = 50 + w * 6; speed = 1.8; damage = (6 * dmgMul) | 0; score = 25;
    attackType = 'ranged'; attackRange = 8;
    mesh = buildEnemyMesh('crawler');
  } else if (type === 'sniper') {
    scale = 1.0; hp = 28 + w * 3; speed = 2.4; damage = (14 * dmgMul) | 0; score = 35;
    attackType = 'ranged'; attackRange = 20;
    mesh = buildEnemyMesh('sniper');
  } else if (type === 'phantom') {
    scale = 1.0; hp = 60 + w * 5; speed = 4.5; damage = (9 * dmgMul) | 0; score = 50;
    attackType = 'melee'; attackRange = 1.4;
    mesh = buildEnemyMesh('phantom');
  } else if (type === 'bruiser') {
    scale = 1.0; hp = 140 + w * 15; speed = 2.1; damage = (18 * dmgMul) | 0; score = 40;
    attackType = 'aoe'; attackRange = 2.5;
    mesh = buildEnemyMesh('bruiser');
  } else if (type === 'shieldbearer') {
    scale = 1.0; hp = 80 + w * 8; speed = 2.0; damage = (7 * dmgMul) | 0; score = 35;
    attackType = 'melee'; attackRange = 1.5;
    mesh = buildEnemyMesh('shieldbearer');
  } else if (type === 'bomber') {
    scale = 1.0; hp = 25 + w * 3; speed = 3.0; damage = 0; score = 20;
    attackType = 'explode'; attackRange = 1.2;
    mesh = buildEnemyMesh('bomber');
  } else if (type === 'swarm') {
    scale = 0.55; hp = 8 + w * 1; speed = 6.5; damage = (3 * dmgMul) | 0; score = 5;
    attackType = 'melee'; attackRange = 1.0;
    mesh = buildEnemyMesh('swarm');
  } else if (type === 'apex') {
    scale = 1.0; hp = 220 + w * 25; speed = 3.4; damage = (12 * dmgMul) | 0; score = 100;
    attackType = 'burst'; attackRange = 15;
    mesh = buildEnemyMesh('apex');
  } else if (type === 'drone') {
    // drone voador — flutua e atira
    scale = 1.0; hp = 40 + w * 5; speed = 3.5; damage = (10 * dmgMul) | 0; score = 40;
    attackType = 'ranged'; attackRange = 16;
    mesh = buildEnemyMesh('drone');
  } else if (type === 'sentinel') {
    // sniper em cima de prédios
    scale = 1.0; hp = 35 + w * 4; speed = 0; damage = (18 * dmgMul) | 0; score = 50;
    attackType = 'ranged'; attackRange = 25;
    mesh = buildEnemyMesh('sentinel');
  } else { // boss
    scale = 1.0; hp = 500 + w * 60; speed = 2.4; damage = (18 * dmgMul) | 0; score = 250;
    attackType = 'mixed'; attackRange = 3;
    mesh = buildEnemyMesh('boss');
  }
  // aplicar scaleMul no hp e no scale do mesh
  hp = Math.round(hp * scaleMul);
  scale = scale * (1 + (scaleMul - 1) * 0.5);
  mesh.scale.setScalar(scale);
  const result = {
    type, mesh, hp, maxHp: hp, speed, damage, score, scale,
    attackCd: 0, walkT: Math.random() * 10, attackAnim: 0,
    attackType, attackRange, telegraph: 0, burstShots: 0, burstTotal: 0,
    teleportT: 4 + Math.random() * 2, dashT: 0,
    flyHeight: type === 'drone' ? 4 + Math.random() * 2 : 0,
    isFlying: type === 'drone',
    perchBuilding: null, // para sentinels
  };
  // shieldbearer tem escudo extra que pode ser quebrado
  if (type === 'shieldbearer') {
    result.shieldHp = 60 + w * 8;
    result.maxShieldHp = result.shieldHp;
    result.faceTarget = mesh.rotation.y;
    result.shieldBroken = false;
    result.shieldStage = 0; // 0=intacto(azul), 1=dano(laranja), 2=quebrando(vermelho), 3=quebrado
  }
  return result;
}

function buildDroneMesh() {
  const p = { body: 0x2a2a3a, accent: 0x66ffaa, glow: 0x88ffcc, joint: 0x101020, eye: 0xaaffff };
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: p.body, emissive: p.body, emissiveIntensity: 0.3 });
  const matAccent = new THREE.MeshLambertMaterial({ color: p.accent, emissive: p.glow, emissiveIntensity: 0.7 });
  // corpo central (nave/OVNI)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), mat);
  body.scale.set(1, 0.5, 1);
  body.castShadow = false;
  g.add(body);
  // cockpit brilhante
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: p.glow }));
  cockpit.position.set(0, 0.05, 0.2);
  g.add(cockpit);
  // 4 hélices (esferas pequenas)
  const rotorMat = new THREE.MeshLambertMaterial({ color: p.joint,});
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), rotorMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
    arm.lookAt(0, 0, 0);
    g.add(arm);
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 6), matAccent);
    rotor.position.set(Math.cos(a) * 0.6, 0.08, Math.sin(a) * 0.6);
    g.add(rotor);
  }
  // luz brilhante embaixo
  const lt = new THREE.PointLight(p.glow, 0.6, 2, 2);
  lt.position.set(0, -0.3, 0);
  g.add(lt);
  g.userData = { type: 'drone', rotors: g.children.filter(c => c.material && c.material.emissiveIntensity > 0.5) };
  return g;
}

function buildSentinelMesh() {
  const p = { body: 0x3a2a1a, accent: 0xffaa66, glow: 0xffcc88, joint: 0x1a1010, eye: 0xffddaa };
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: p.body, emissive: p.body, emissiveIntensity: 0.3 });
  const matAccent = new THREE.MeshLambertMaterial({ color: p.accent, emissive: p.glow, emissiveIntensity: 0.6 });
  // base/tronco
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.20, 0.30, 6, 10), mat);
  torso.castShadow = false;
  torso.position.y = 0.85;
  g.add(torso);
  // cabeça (cúpula do sniper)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), mat);
  head.scale.set(1, 0.85, 1);
  head.position.y = 1.30;
  head.castShadow = false;
  g.add(head);
  // visor/lente do sniper
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.20, 8), matAccent);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 1.30, 0.22);
  g.add(lens);
  // luz vermelha do visor
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: p.eye }));
  eye.position.set(0, 1.30, 0.32);
  g.add(eye);
  // tripé (3 pernas)
  const legMat = new THREE.MeshLambertMaterial({ color: p.joint,});
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4), legMat);
    leg.position.set(Math.cos(a) * 0.3, 0.4, Math.sin(a) * 0.3);
    leg.rotation.z = Math.cos(a) * 0.3;
    leg.rotation.x = -Math.sin(a) * 0.3;
    leg.castShadow = false;
    g.add(leg);
  }
  // luz do sniper
  const lt = new THREE.PointLight(p.glow, 0.8, 2, 2);
  lt.position.set(0, 1.3, 0.3);
  g.add(lt);
  g.userData = { type: 'sentinel', legLGroup: null, legRGroup: null };
  return g;
}

function buildEnemyMesh(type) {
  // Tipos especiais: drone (voador) e sentinel (snipers em prédios)
  if (type === 'drone') return buildDroneMesh();
  if (type === 'sentinel') return buildSentinelMesh();
  const g = new THREE.Group();

  // paletas por tipo
  const palettes = {
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
    boss:         { body: 0x2a0a3a, accent: 0x6611aa, glow: 0xff00d4, joint: 0x180020, eye: 0xff44ff },
    drone:        { body: 0x2a2a3a, accent: 0x66ffaa, glow: 0x88ffcc, joint: 0x101020, eye: 0xaaffff },
    sentinel:     { body: 0x3a2a1a, accent: 0xffaa66, glow: 0xffcc88, joint: 0x1a1010, eye: 0xffddaa },
  };
  const p = palettes[type] || palettes.grunt;
  // material — phantom é translúcido
  const matBase = { color: p.body, metalness: 0.5, roughness: 0.45, emissive: p.body, emissiveIntensity: 0.25 };
  if (type === 'phantom') { matBase.transparent = true; matBase.opacity = 0.6; }
  const mat = new THREE.MeshLambertMaterial(matBase);
  const matAccent = new THREE.MeshLambertMaterial({ color: p.accent, emissive: p.glow, emissiveIntensity: 0.5 });
  const matJoint = new THREE.MeshLambertMaterial({ color: p.joint,});

  // anatomia base (varia por tipo)
  let torsoR = 0.30, torsoH = 0.40, headR = 0.18, legLen = 0.50, legR = 0.09, armLen = 0.40, armR = 0.08;
  let shoulderW = 0.40, posture = 1.0;

  if (type === 'grunt')  { torsoR = 0.34; torsoH = 0.38; headR = 0.20; legLen = 0.42; legR = 0.10; armLen = 0.38; armR = 0.10; shoulderW = 0.46; posture = 1.0; }
  if (type === 'runner') { torsoR = 0.22; torsoH = 0.42; headR = 0.14; legLen = 0.62; legR = 0.07; armLen = 0.46; armR = 0.07; shoulderW = 0.30; posture = 0.85; }
  if (type === 'tank')   { torsoR = 0.46; torsoH = 0.50; headR = 0.22; legLen = 0.42; legR = 0.14; armLen = 0.40; armR = 0.13; shoulderW = 0.62; posture = 1.0; }
  if (type === 'crawler')  { torsoR = 0.32; torsoH = 0.28; headR = 0.16; legLen = 0.28; legR = 0.10; armLen = 0.20; armR = 0.08; shoulderW = 0.55; posture = 0.7; }
  if (type === 'sniper')  { torsoR = 0.20; torsoH = 0.50; headR = 0.14; legLen = 0.60; legR = 0.07; armLen = 0.50; armR = 0.07; shoulderW = 0.28; posture = 1.0; }
  if (type === 'phantom') { torsoR = 0.24; torsoH = 0.46; headR = 0.18; legLen = 0.58; legR = 0.08; armLen = 0.50; armR = 0.08; shoulderW = 0.30; posture = 0.95; }
  if (type === 'bruiser')  { torsoR = 0.54; torsoH = 0.56; headR = 0.24; legLen = 0.44; legR = 0.16; armLen = 0.46; armR = 0.16; shoulderW = 0.72; posture = 1.05; }
  if (type === 'shieldbearer') { torsoR = 0.32; torsoH = 0.46; headR = 0.18; legLen = 0.46; legR = 0.12; armLen = 0.36; armR = 0.11; shoulderW = 0.50; posture = 1.0; }
  if (type === 'bomber')  { torsoR = 0.28; torsoH = 0.40; headR = 0.18; legLen = 0.40; legR = 0.10; armLen = 0.32; armR = 0.10; shoulderW = 0.44; posture = 0.95; }
  if (type === 'apex')    { torsoR = 0.36; torsoH = 0.48; headR = 0.20; legLen = 0.52; legR = 0.11; armLen = 0.46; armR = 0.11; shoulderW = 0.46; posture = 1.0; }
  if (type === 'boss')   { torsoR = 0.52; torsoH = 0.60; headR = 0.28; legLen = 0.62; legR = 0.16; armLen = 0.58; armR = 0.15; shoulderW = 0.80; posture = 1.2; }

  // ----- PELVIS -----
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(torsoR * 2.4, 0.16, torsoR * 1.6), matJoint);
  pelvis.position.y = legLen + 0.08;
  pelvis.castShadow = false;
  g.add(pelvis);

  // ----- TORSO -----
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = legLen + 0.20 + torsoH * 0.4;
  g.add(torsoGroup);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(torsoR, torsoH, 6, 10), mat);
  torso.castShadow = false; torso.receiveShadow = false;
  torsoGroup.add(torso);
  // placa peitoral (com cor do accent)
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(torsoR * 1.7, torsoH * 0.8, 0.06), matAccent);
  chestPlate.position.set(0, 0, torsoR + 0.02);
  chestPlate.castShadow = false;
  torsoGroup.add(chestPlate);
  // costas reforçadas
  const backPlate = new THREE.Mesh(new THREE.BoxGeometry(torsoR * 1.8, torsoH * 0.9, 0.05), matJoint);
  backPlate.position.set(0, 0, -torsoR - 0.01);
  torsoGroup.add(backPlate);
  // núcleo brilhante no peito (exceto runner que tem mais sutil)
  if (type !== 'runner') {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      new THREE.MeshBasicMaterial({ color: p.glow })
    );
    core.position.set(0, 0, torsoR + 0.08);
    torsoGroup.add(core);
  }
  // tank: blindagem hexagonal
  if (type === 'tank') {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(torsoR * 1.1, torsoR * 1.1, 0.08, 6), matAccent);
    shield.rotation.x = Math.PI / 2;
    shield.position.set(0, -torsoH * 0.1, torsoR + 0.06);
    torsoGroup.add(shield);
  }
  // boss: coroa de spikes
  if (type === 'boss') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.40, 5), matJoint);
      spike.position.set(Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55);
      spike.lookAt(0, 0.20, 0);
      torsoGroup.add(spike);
    }
  }

  // ----- OMBROS -----
  const shoulderY = torsoH * 0.4;
  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(armR * 1.3, 8, 6), mat);
  shoulderL.position.set(-shoulderW / 2, shoulderY, 0);
  shoulderL.castShadow = false;
  torsoGroup.add(shoulderL);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x = shoulderW / 2;
  torsoGroup.add(shoulderR);

  // ----- BRAÇOS -----
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-shoulderW / 2, shoulderY, 0);
  g.add(armLGroup);
  const upperArmL = new THREE.Mesh(new THREE.CapsuleGeometry(armR, armLen * 0.7, 4, 8), mat);
  upperArmL.castShadow = false;
  armLGroup.add(upperArmL);
  // mãos como garras (3 dedos)
  const handL = new THREE.Mesh(new THREE.SphereGeometry(armR * 1.1, 8, 6), matAccent);
  handL.position.y = -armLen * 0.6;
  armLGroup.add(handL);
  if (type === 'boss' || type === 'tank') {
    for (let i = 0; i < 3; i++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), matAccent);
      const ang = (i - 1) * 0.3;
      claw.position.set(Math.sin(ang) * 0.08, -armLen * 0.6 - 0.10, Math.cos(ang) * 0.08);
      claw.rotation.x = Math.PI;
      armLGroup.add(claw);
    }
  }

  const armRGroup = new THREE.Group();
  armRGroup.position.set(shoulderW / 2, shoulderY, 0);
  g.add(armRGroup);
  const upperArmR = new THREE.Mesh(new THREE.CapsuleGeometry(armR, armLen * 0.7, 4, 8), mat);
  upperArmR.castShadow = false;
  armRGroup.add(upperArmR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(armR * 1.1, 8, 6), matAccent);
  handR.position.y = -armLen * 0.6;
  armRGroup.add(handR);
  if (type === 'boss' || type === 'tank') {
    for (let i = 0; i < 3; i++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), matAccent);
      const ang = (i - 1) * 0.3;
      claw.position.set(Math.sin(ang) * 0.08, -armLen * 0.6 - 0.10, Math.cos(ang) * 0.08);
      claw.rotation.x = Math.PI;
      armRGroup.add(claw);
    }
  }

  // ----- CABEÇA -----
  const headGroup = new THREE.Group();
  headGroup.position.y = legLen + 0.20 + torsoH * 0.8 + headR * 0.6;
  g.add(headGroup);
  // pescoço
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.10, 6), matJoint);
  neck.position.y = -0.08;
  headGroup.add(neck);
  // cabeça
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(headR, 10, 8), mat);
  headMesh.scale.set(1, 0.95, 1);
  headMesh.castShadow = false;
  headGroup.add(headMesh);
  // olhos brilhantes (na frente da face)
  const eyeMat = new THREE.MeshBasicMaterial({ color: p.eye });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.18, 8, 6), eyeMat);
  eyeL.position.set(-headR * 0.35, headR * 0.1, headR * 0.85);
  headGroup.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = headR * 0.35;
  headGroup.add(eyeR);
  // "boca" ou fenda
  if (type === 'tank' || type === 'boss') {
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(headR * 0.8, 0.04, 0.04), matAccent);
    mouth.position.set(0, -headR * 0.3, headR * 0.9);
    headGroup.add(mouth);
  }
  // tank: "antenas" na cabeça
  if (type === 'tank') {
    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.20, 4), matJoint);
    antL.position.set(-headR * 0.6, headR * 0.6, 0);
    antL.rotation.z = 0.2;
    headGroup.add(antL);
    const antR = antL.clone();
    antR.position.x = headR * 0.6;
    antR.rotation.z = -0.2;
    headGroup.add(antR);
  }
  // boss: chifres
  if (type === 'boss') {
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.40, 6), matAccent);
    hornL.position.set(-headR * 0.8, headR * 0.7, 0);
    hornL.rotation.z = -0.4;
    headGroup.add(hornL);
    const hornR = hornL.clone();
    hornR.position.x = headR * 0.8;
    hornR.rotation.z = 0.4;
    headGroup.add(hornR);
  }
  // runner: cabeça angular
  if (type === 'runner') {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(headR * 1.8, headR * 0.5, 0.04), matAccent);
    visor.position.set(0, headR * 0.15, headR * 0.9);
    headGroup.add(visor);
  }

  // ----- CINTURA -----
  const belt = new THREE.Mesh(new THREE.BoxGeometry(torsoR * 2.5, 0.10, torsoR * 1.8), matJoint);
  belt.position.y = legLen + 0.04;
  belt.castShadow = false;
  g.add(belt);

  // ----- PERNAS -----
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-torsoR * 0.7, legLen + 0.08, 0);
  g.add(legLGroup);
  const upperLegL = new THREE.Mesh(new THREE.CapsuleGeometry(legR, legLen * 0.6, 4, 8), mat);
  upperLegL.castShadow = false;
  legLGroup.add(upperLegL);
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(legR * 2.2, 0.10, legR * 3), matJoint);
  bootL.position.set(0, -legLen * 0.7, 0.04);
  bootL.castShadow = false;
  legLGroup.add(bootL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(torsoR * 0.7, legLen + 0.08, 0);
  g.add(legRGroup);
  const upperLegR = upperLegL.clone();
  legRGroup.add(upperLegR);
  const bootR = bootL.clone();
  bootR.position.set(0, -legLen * 0.7, 0.04);
  legRGroup.add(bootR);

  // ----- detalhe extra: brilho no chão do tank/boss -----
  if (type === 'tank' || type === 'boss') {
    const glow = new THREE.PointLight(p.glow, 0.6, 2, 2);
    glow.position.set(0, legLen + 0.20, torsoR + 0.2);
    g.add(glow);
  }

  // ----- ESCUDO do shieldbearer (peça hexagonal brilhante na frente) -----
  let shieldMesh = null;
  if (type === 'shieldbearer') {
    shieldMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.06, 6),
      new THREE.MeshLambertMaterial({
        color: 0x66ccff,
        emissive: 0x4488cc, emissiveIntensity: 0.7,
        transparent: true, opacity: 0.85, side: THREE.DoubleSide
      })
    );
    shieldMesh.rotation.x = Math.PI / 2;
    shieldMesh.position.set(0, legLen + 0.30, torsoR + 0.30);
    g.add(shieldMesh);
    // borda do escudo
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x88eeff })
    );
    ring.position.copy(shieldMesh.position);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }

  // postura final
  g.scale.y = posture;

  g.userData = { armLGroup, armRGroup, legLGroup, legRGroup, torsoGroup, headGroup, type, shieldMesh };
  return g;
}

function spawnEnemy() {
  // Perf cap: on mobile, AI flanking/grouping (O(n^2) below) and draw
  // calls both grow quadratically with active enemies. Capping at 35
  // protects the framerate on Android low/mid-end. PC keeps the larger cap
  // for the existing chaos experience.
  const ENEMY_CAP = (typeof window !== 'undefined' && window.__NATIVE__) ? 35 : 80;
  if (GAME.enemies.length >= ENEMY_CAP) return;
  const half = GAME.arena.size * 0.5 - 4;
  let type;
  if (GAME.wave % 5 === 0) {
    type = 'boss';
  } else {
    const types = ['grunt'];
    if (GAME.wave >= 2) types.push('runner', 'runner');
    if (GAME.wave >= 3) types.push('crawler', 'crawler');
    if (GAME.wave >= 4) types.push('tank', 'sniper');
    if (GAME.wave >= 5) types.push('drone');
    if (GAME.wave >= 6) types.push('phantom', 'phantom', 'bruiser');
    if (GAME.wave >= 7) types.push('shieldbearer', 'shieldbearer', 'sentinel');
    if (GAME.wave >= 8) types.push('bomber', 'bomber');
    if (GAME.wave >= 10) types.push('swarm', 'swarm', 'swarm', 'apex');
    if (GAME.wave >= 15) types.push('apex', 'apex', 'drone', 'sentinel');
    type = types[Math.floor(Math.random() * types.length)];
  }
  const e = makeEnemy(type);
  // posicionar próximo do player (14-22 unidades)
  let x = 0, z = 0, y = 0, found = false;
  // Tentar várias posições até encontrar uma válida
  for (let attempt = 0; attempt < 16; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 14 + Math.random() * 8;
    const tx = Math.max(-half, Math.min(half, GAME.player.position.x + Math.cos(angle) * r));
    const tz = Math.max(-half, Math.min(half, GAME.player.position.z + Math.sin(angle) * r));
    if (type === 'drone') {
      x = tx; z = tz;
      y = 4 + Math.random() * 2;
      found = true;
      break;
    }
    if (type === 'sentinel') {
      // posicionar em cima de prédio próximo ao player
      if (GAME.buildings.length > 0) {
        let bestBld = null, bestDist = Infinity;
        for (const b of GAME.buildings) {
          const d = Math.hypot(b.position.x - GAME.player.position.x, b.position.z - GAME.player.position.z);
          if (d < bestDist && d < 25) { bestDist = d; bestBld = b; }
        }
        if (bestBld) {
          x = bestBld.position.x;
          z = bestBld.position.z;
          y = bestBld.position.y + bestBld.userData.h * 0.4;
          e.perchY = y;
          found = true;
          break;
        } else {
          // fallback: fora da arena
          x = tx; z = tz;
          y = 8;
          e.perchY = y;
          found = true;
          break;
        }
      }
      continue; // sentinel sem prédio: tentar de novo
    }
    // inimigo terrestre: verificar colisão com prédios E com player
    let clear = true;
    // longe do player (pelo menos 8 unidades)
    const distFromPlayer = Math.hypot(tx - GAME.player.position.x, tz - GAME.player.position.z);
    if (distFromPlayer < 8) { clear = false; }
    // fora dos prédios
    for (const b of GAME.buildings) {
      const hw = b.userData.w / 2, hd = b.userData.d / 2;
      if (Math.abs(tx - b.position.x) < hw + 0.6 && Math.abs(tz - b.position.z) < hd + 0.6) {
        clear = false; break;
      }
    }
    // fora de outros inimigos (espalhar)
    for (const o of GAME.enemies) {
      const dist = Math.hypot(tx - o.mesh.position.x, tz - o.mesh.position.z);
      if (dist < 2) { clear = false; break; }
    }
    if (clear) {
      x = tx; z = tz;
      found = true;
      break;
    }
  }
  // se não achou posição válida, usar fallback no perímetro
  if (!found) {
    // fallback: keep trying angles until we find a spot clear of buildings
    let placed = false;
    for (let fa = 0; fa < 32 && !placed; fa++) {
      const angle = Math.random() * Math.PI * 2;
      x = GAME.player.position.x + Math.cos(angle) * 18;
      z = GAME.player.position.z + Math.sin(angle) * 18;
      x = Math.max(-half, Math.min(half, x));
      z = Math.max(-half, Math.min(half, z));
      let bad = false;
      for (const b of GAME.buildings) {
        const hw = b.userData.w / 2 + 0.6;
        const hd = b.userData.d / 2 + 0.6;
        if (Math.abs(x - b.position.x) < hw && Math.abs(z - b.position.z) < hd) { bad = true; break; }
      }
      if (!bad) placed = true;
    }
    if (!placed) { x = 0; z = 0; }   // absolute last resort — arena center
    y = 0;
  }
  if (type === 'drone') {
    y = 4 + Math.random() * 2;
  } else if (type === 'sentinel') {
    // posicionar em cima de um prédio próximo
    if (GAME.buildings.length > 0) {
      // encontrar prédio próximo ao player
      let bestBld = null, bestDist = Infinity;
      for (const b of GAME.buildings) {
        const d = Math.hypot(b.position.x - GAME.player.position.x, b.position.z - GAME.player.position.z);
        if (d < bestDist && d < 25) { bestDist = d; bestBld = b; }
      }
      if (bestBld) {
        x = bestBld.position.x;
        z = bestBld.position.z;
        y = bestBld.position.y + bestBld.userData.h * 0.4;
        e.perchY = y;
      } else {
        y = 8;
        e.perchY = y;
      }
    } else {
      y = 8;
      e.perchY = y;
    }
  }
  e.mesh.position.set(x, y, z);
  scene.add(e.mesh);
  GAME.enemies.push(e);
  GAME.waveEnemiesRemaining = Math.max(0, GAME.waveEnemiesRemaining - 1);
}

// ----- Bullets -----
// Geometria e material de bullet compartilhados (evita criar novos cada tiro)
const SHARED_BULLET_GEO = new THREE.SphereGeometry(0.14, 5, 4);
const SHARED_CRIT_GEO = new THREE.SphereGeometry(0.20, 5, 4);
const SHARED_TRAIL_POS = new Float32Array(20 * 3);

function spawnBullet(origin, dir, dmg = 18, crit = false, flags = {}) {
  spawnBulletFast(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, dmg, crit, flags.pierce || 0, flags.bounce || 0, flags.explosive || false);
}

// Versão otimizada que recebe coordenadas escalares (evita criar Vector3)
function spawnBulletFast(ox, oy, oz, dx, dy, dz, dmg, crit, pierce, bounce, explosive) {
  if (GAME.bullets.length > 200) return;   // hard cap — prevents GC spikes
  const color = crit ? 0xffaa00 : 0x00ffff;
  const m = new THREE.Mesh(crit ? SHARED_CRIT_GEO : SHARED_BULLET_GEO, new THREE.MeshBasicMaterial({ color }));
  m.position.set(ox, oy, oz);
  scene.add(m);
  // sem PointLight individual para economizar GPU
  // trail
  const positions = new Float32Array(SHARED_TRAIL_POS.length);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
  scene.add(trail);
  const velX = dx * 60, velY = dy * 60, velZ = dz * 60;
  GAME.bullets.push({
    mesh: m, light: null, trail, trailPositions: positions, trailIndex: 0,
    vel: { x: velX, y: velY, z: velZ },
    life: 1.0, dmg, fromPlayer: true, crit,
    pierce: pierce || 0, hitsLeft: (pierce || 0) + 1,
    bounce: bounce || 0, bouncesLeft: bounce || 0,
    explosive: explosive || false,
  });
}

function spawnEnemyBullet(origin, dir) {
  if (GAME.bullets.length > 200) return;   // hard cap — prevents GC spikes
  const geo = new THREE.SphereGeometry(0.18, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff2266 });
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(origin);
  scene.add(m);
  const lt = new THREE.PointLight(0xff2266, 0.8, 5, 2);
  m.add(lt);
  GAME.bullets.push({
    mesh: m, light: lt, trail: null, trailPositions: null,
    vel: dir.clone().multiplyScalar(22), life: 2.5, dmg: 10, fromPlayer: false,
  });
}

// ----- Pickups -----
function spawnPickup(pos) {
  // Apenas pickups de vida (munição é infinita)
  const color = 0xff66e0;
  const g = new THREE.Group();
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.8,})
  );
  g.add(cube);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.05, 8, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  const lt = new THREE.PointLight(color, 1.0, 2, 2);
  g.add(lt);
  g.position.copy(pos);
  g.position.y = 0.5;
  scene.add(g);
  GAME.pickups.push({ type: 'health', mesh: g, life: 14, baseY: 0.5 });
}

// ----- Particles -----
// Geometria compartilhada para todas as partículas (evita criar/descartar buffers)
const SHARED_PARTICLE_GEO = new THREE.SphereGeometry(0.1, 4, 4);

// Perf: pre-allocate a pool of meshes + materials so spawnParticleBurst and
// spawnMuzzleFlashFast don't allocate per-particle at runtime. The old
// code did allocate a MeshBasicMaterial + Mesh inside the burst loop,
// which caused GC pauses every time the player shot/killed something.
// Each pool entry has a pre-built material whose color is mutated via
// setHex() and a mesh that's added to the scene once with visible=false.
const PARTICLE_POOL_SIZE = 320;
const _particlePool = [];
for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
  const m = new THREE.Mesh(SHARED_PARTICLE_GEO, mat);
  m.visible = false;
  m.scale.setScalar(1);
  scene.add(m);
  _particlePool.push({ mesh: m, mat, vel: { x: 0, y: 0, z: 0 }, life: 0, maxLife: 1, isFlash: false });
}

function _particleTake() {
  for (let i = 0; i < _particlePool.length; i++) {
    const p = _particlePool[i];
    if (p.life <= 0) return p;
  }
  return null;
}

function spawnParticleBurst(pos, color, count = 14, speed = 8) {
  if (GAME.particles.length > 300) return;
  for (let i = 0; i < count; i++) {
    const p = _particleTake();
    if (!p) break;
    p.mesh.visible = true;
    p.mesh.position.copy(pos);
    p.mesh.scale.setScalar(0.8 + Math.random() * 0.5);
    p.mat.color.setHex(color);
    p.mat.opacity = 1;
    p.vel.x = (Math.random() - 0.5) * speed;
    p.vel.y = Math.random() * speed * 0.8;
    p.vel.z = (Math.random() - 0.5) * speed;
    p.life = 0.6 + Math.random() * 0.2;
    p.maxLife = p.life;
    p.isFlash = false;
    GAME.particles.push(p);
  }
}

function spawnMuzzleFlash(origin) {
  spawnMuzzleFlashFast(origin.x, origin.y, origin.z);
}

function spawnMuzzleFlashFast(x, y, z) {
  const p = _particleTake();
  if (!p) return;
  p.mesh.visible = true;
  p.mesh.position.set(x, y, z);
  p.mesh.scale.setScalar(2.5);
  p.mat.color.setHex(0x00ffff);
  p.mat.opacity = 0.9;
  p.vel.x = 0; p.vel.y = 0; p.vel.z = 0;
  p.life = 0.08;
  p.maxLife = p.life;
  p.isFlash = true;
  GAME.particles.push(p);
}

// ----- Damage flash overlay -----
function triggerDamageFlash() {
  const f = document.getElementById('dmgFlash');
  f.style.opacity = '1';
  playerStats.damageFlashT = 0.25;
}

function triggerWaveAnnounce(text) {
  const el = document.getElementById('waveAnnounce');
  el.textContent = text;
  el.style.opacity = '1';
  GAME.waveAnnounceT = 2.0;
  GAME.waveAnnounceText = text;
}

// ----- Collisions -----
function collideWithBuildings(pos, radius) {
  for (const b of GAME.buildings) {
    const hw = b.userData.w / 2, hd = b.userData.d / 2;
    const minX = b.position.x - hw, maxX = b.position.x + hw;
    const minZ = b.position.z - hd, maxZ = b.position.z + hd;
    if (pos.x + radius > minX && pos.x - radius < maxX &&
        pos.z + radius > minZ && pos.z - radius < maxZ) {
      // push out along smallest axis
      const overlapX = Math.min(pos.x + radius - minX, maxX - (pos.x - radius));
      const overlapZ = Math.min(pos.z + radius - minZ, maxZ - (pos.z - radius));
      if (overlapX < overlapZ) {
        if (pos.x < b.position.x) pos.x = minX - radius; else pos.x = maxX + radius;
      } else {
        if (pos.z < b.position.z) pos.z = minZ - radius; else pos.z = maxZ + radius;
      }
    }
  }
  // arena walls
  const half = GAME.arena.size * 0.5 - 1;
  if (pos.x < -half) pos.x = -half;
  if (pos.x > half) pos.x = half;
  if (pos.z < -half) pos.z = -half;
  if (pos.z > half) pos.z = half;
}

function circleCircleHit(ax, az, ar, bx, bz, br) {
  const dx = ax - bx, dz = az - bz;
  return (dx * dx + dz * dz) < (ar + br) * (ar + br);
}

// ----- Input -----
window.addEventListener('keydown', (e) => {
  GAME.keys[e.code] = true;
  // tentar pointer lock em qualquer tecla (caso o usuário tenha perdido)
  if (GAME.state === 'playing' && !GAME.pointerLocked) {
    requestPointerLock();
  }
  if (e.code === 'KeyR' && GAME.state === 'playing' && !playerStats.reloading && playerStats.ammo < playerStats.maxAmmo) {
    startReload();
  }
  // troca de arma com números 1, 2 (RIFLE=1, PISTOLA=2). Slot 3+ são armas de carta.
  if (e.code === 'Digit1' && GAME.state === 'playing') applyWeapon(1);
  if (e.code === 'Digit2' && GAME.state === 'playing') applyWeapon(2);
  // slot 3 só disponível se o player desbloqueou a arma via carta
  if (e.code === 'Digit3' && GAME.state === 'playing' && playerStats.unlockedWeapons && playerStats.unlockedWeapons.includes(3)) applyWeapon(3);
  if (e.code === 'Escape') {
    if (GAME.state === 'playing') pauseGame();
    else if (GAME.state === 'paused') resumeGame();
  }
});
window.addEventListener('keyup', (e) => { GAME.keys[e.code] = false; });

// qualquer clique no canvas durante o jogo: reativar pointer lock
renderer.domElement.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    GAME.mouse.down = true;
    if (GAME.state === 'playing' && !GAME.pointerLocked) {
      requestPointerLock();
    }
  }
});
window.addEventListener('mouseup', (e) => {
  if (e.button === 0) GAME.mouse.down = false;
});

document.addEventListener('pointerlockchange', () => {
  GAME.pointerLocked = document.pointerLockElement === renderer.domElement;
  if (GAME.pointerLocked) {
    // pointer lock ativado: resetar tracking de fallback mouse
    lastMouseX = -1; lastMouseY = -1;
  }
});

let lastMouseX = -1, lastMouseY = -1;
renderer.domElement.addEventListener('mousemove', (e) => {
  if (GAME.state !== 'playing') return;
  if (GAME.pointerLocked) {
    // com pointer lock, movementX/Y dão o delta preciso (rotação 360° livre)
    GAME.mouse.dx += e.movementX;
    GAME.mouse.dy += e.movementY;
    return;
  }
  // sem pointer lock: tentar reativar a cada movimento (em browsers que
  // suportam pointer lock em resposta a mousemove) — funciona em alguns
  // navegadores como fallback
  if (GAME.pointerLockDisabled === false) {
    requestPointerLock();
  }
  // usar deltas brutos como fallback final
  if (lastMouseX < 0) { lastMouseX = e.clientX; lastMouseY = e.clientY; return; }
  GAME.mouse.dx += (e.clientX - lastMouseX);
  GAME.mouse.dy += (e.clientY - lastMouseY);
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});
renderer.domElement.addEventListener('mouseleave', () => { lastMouseX = -1; lastMouseY = -1; });
renderer.domElement.addEventListener('mouseenter', () => { lastMouseX = -1; lastMouseY = -1; });

// UI buttons
document.getElementById('playBtn').addEventListener('click', () => { ensureAudio(); startGame(); });
document.getElementById('restartBtn').addEventListener('click', () => { ensureAudio(); startGame(); });
document.getElementById('resumeBtn').addEventListener('click', () => resumeGame());
document.getElementById('muteBtn').addEventListener('click', () => { ensureAudio(); toggleMute(); });
document.getElementById('musicVol').addEventListener('input', (e) => { ensureAudio(); setMusicVolume(e.target.value / 100); });
document.getElementById('sfxVol').addEventListener('input', (e) => { ensureAudio(); setSfxVolume(e.target.value / 100); });

let swallowNextClick = false;
window.addEventListener('mousedown', (e) => {
  if (swallowNextClick) {
    swallowNextClick = false;
    e.stopPropagation();
  }
}, true);   // capture phase — runs BEFORE the renderer canvas listener

function startReload() {
  if (playerStats.ammo >= playerStats.maxAmmo || playerStats.reloading) return;
  playerStats.reloading = true;
  playerStats.reloadT = playerStats.reloadTime * playerStats.reloadMul;
  // som específico da arma
  const weapon = WEAPONS[playerStats.currentWeapon];
  if (weapon) {
    // arma atual tem reloadSound próprio — atrasar para sincronizar com a animação
    setTimeout(() => playSfx(weapon.reloadSound), 0);
  } else {
    playSfx('reload');
  }
  // iniciar animação visual de reload (braço direito do player se move)
  if (GAME.player && GAME.player.userData) {
    GAME.player.userData.reloadT = 0;
  }
}

// ----- Game flow -----
// ----- Game modes -----
function activateGameMode(mode) {
  GAME.gameMode = mode;
  GAME.modeTimer = 25; // 25 segundos por wave
  if (mode === 'dark') {
    // wave escura: iluminação reduzida mas não excessiva
    renderer.toneMappingExposure = 1.2;
    // inimigos com leve brilho extra (não excessivo para não ficar invencível visualmente)
    GAME.enemies.forEach(e => {
      if (e.mesh && e.mesh.userData.torsoGroup) {
        const t = e.mesh.userData.torsoGroup;
        if (t.children) {
          t.children.forEach(c => {
            if (c.material && c.material.emissive) {
              c.material.emissiveIntensity = (c.material.emissiveIntensity || 0) + 0.5;
            }
          });
        }
      }
    });
    triggerWaveAnnounce('DARK WAVE');
  } else if (mode === 'frenzy') {
    // wave frenética: 2x inimigos, dano 1.3x
    GAME.waveSize *= 2;
    GAME.waveEnemiesRemaining = GAME.waveSize;
    triggerWaveAnnounce('FRENZY');
  } else if (mode === 'siege') {
    // cerco: 1 sniper + 2 drones spawnam adicionalmente
    for (let i = 0; i < 3; i++) {
      spawnEnemy();
    }
    triggerWaveAnnounce('SIEGE');
  }
}

function updateGameMode(dt) {
  if (GAME.gameMode === 'normal' || GAME.modeTimer <= 0) return;
  GAME.modeTimer -= dt;
  if (GAME.modeTimer <= 0) {
    // fim do modo — restaurar
    if (GAME.gameMode === 'dark') {
      renderer.toneMappingExposure = 1.5;
    }
    GAME.gameMode = 'normal';
    GAME.modeTimer = 0;
    triggerWaveAnnounce('MODE ENDED');
  }
}

function clearWorld() {
  // remove enemies, bullets, pickups, particles
  for (const e of GAME.enemies) scene.remove(e.mesh);
  GAME.enemies.length = 0;
  for (const b of GAME.bullets) {
    scene.remove(b.mesh);
    if (b.trail) scene.remove(b.trail);
  }
  GAME.bullets.length = 0;
  for (const p of GAME.pickups) scene.remove(p.mesh);
  GAME.pickups.length = 0;
  // Pool-backed: just hide; the meshes stay in the scene permanently.
  for (const p of GAME.particles) p.mesh.visible = false;
  GAME.particles.length = 0;
}

function startGame() {
  clearWorld();
  // reset state
  GAME.score = 0;
  GAME.totalKills = 0;
  GAME.multiplier = 1.0;
  GAME.multTimer = 0;
  GAME.wave = 1;
  GAME.waveSize = 4;
  GAME.spawnTimer = 1.5;
  GAME.spawnInterval = 0.8;
  GAME.waveEnemiesRemaining = GAME.waveSize;
  playerStats.hp = playerStats.maxHp;
  playerStats.shield = 0;
  playerStats.reloading = false;
  playerStats.fireCooldown = 0;
  playerStats.dashCooldown = 0;
  playerStats.dashTimer = 0;
  // inicializar com RIFLE (slot 1) como arma padrão
  applyWeapon(1);
  GAME.player.position.set(0, 0, 0);
  GAME.player.rotation.y = Math.PI; // virar para a cena (yaw + π)
  GAME.yaw = 0; GAME.pitch = 0;
  // resetar stats de carta
  resetCardStats();
  document.getElementById('menuScreen').classList.add('hidden');
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('pauseScreen').classList.add('hidden');
  document.getElementById('cardScreen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  GAME.state = 'playing';
  setTimeout(() => { GAME.pointerLockGrace = false; }, 1500);
  triggerWaveAnnounce('WAVE 1');
  playSfx('wave');
  requestPointerLock();
  // iniciar música procedural com track aleatória
  ensureAudio();
  resumeAudioCtx();
  bossMusicActive = false;
  currentMusicTrack = Math.floor(Math.random() * 15); // 15 faixas normais
  startMusicTrack(currentMusicTrack);
}

function pauseGame() {
  if (GAME.state !== 'playing') return;
  GAME.state = 'paused';
  document.getElementById('pauseScreen').classList.remove('hidden');
  if (document.pointerLockElement) document.exitPointerLock();
  // Swallow the next mousedown so the click that broke pointer lock
  // does not also fire on the canvas underneath the resume button.
  swallowNextClick = true;
}

function resumeGame() {
  if (GAME.state !== 'paused') return;
  document.getElementById('pauseScreen').classList.add('hidden');
  GAME.state = 'playing';
  swallowNextClick = true;     // swallow the mousedown that will exit the pause UI
  requestPointerLock();
}

function gameOver() {
  GAME.state = 'gameover';
  document.getElementById('finalScore').textContent = GAME.score;
  document.getElementById('finalWave').textContent = GAME.wave;
  document.getElementById('finalKills').textContent = GAME.totalKills;
  document.getElementById('gameOverScreen').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
  if (document.pointerLockElement) document.exitPointerLock();
  playSfx('gameover');
  stopMusic();
}

function requestPointerLock() {
  if (GAME.pointerLockDisabled) return;
  try {
    const el = renderer.domElement;
    const p = el.requestPointerLock ? el.requestPointerLock() :
              el.mozRequestPointerLock ? el.mozRequestPointerLock() : null;
    if (p && typeof p.then === 'function') {
      p.then(() => {
        GAME.pointerLockGrace = false;
        GAME.pointerLocked = true;
      })
       .catch(() => {
         // se pointer lock falhar, NÃO marcar como permanentemente desabilitado
         // — o usuário pode clicar de novo para tentar
         GAME.pointerLockDisabled = false;
       });
    }
  } catch (e) { /* ignore */ }
}

// ----- Update -----
let lastT = performance.now();
// Perf: shared scratch Vector3s to avoid per-frame allocations in the
// update hot loop. 3 allocations saved per frame = ~180/sec at 60fps.
const moveDir = new THREE.Vector3();
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const _tmpBurstPos = new THREE.Vector3();
// Helper to set _tmpBurstPos from a src Vector3 + offset, so the burst
// helpers don't allocate (clone + new Vector3) each call. The src
// position is the enemy/player mesh position.
function _burstPosAt(src, dy, dz) {
  _tmpBurstPos.copy(src);
  _tmpBurstPos.y += dy;
  if (dz) _tmpBurstPos.z += dz;
  return _tmpBurstPos;
}
function update(dt) {
  // FPS counter
  GAME.fpsCounter++;
  GAME.fpsTime += dt;
  if (GAME.fpsTime > 0.5) {
    GAME.fps = Math.round(GAME.fpsCounter / GAME.fpsTime);
    GAME.fpsCounter = 0; GAME.fpsTime = 0;
  }

  if (GAME.state !== 'playing') return;

  // ---- camera/mouse ----
  const sens = 0.005;
  // Apply accumulated mouse delta to yaw/pitch (works with or without pointer lock)
  // Convention: mouse DOWN (movementY > 0) -> aim goes DOWN -> pitch becomes negative
  // Therefore: pitch -= dy. Mouse RIGHT (movementX > 0) -> yaw turns right -> yaw -= dx
  GAME.yaw -= GAME.mouse.dx * sens;
  GAME.pitch -= GAME.mouse.dy * sens;
  // rotação contínua por teclado: Q/E giram a câmera 360° sem limite
  // (funciona mesmo SEM pointer lock)
  const turnSpeed = 1.8;
  if (GAME.keys['KeyQ']) GAME.yaw += turnSpeed * dt;
  if (GAME.keys['KeyE']) GAME.yaw -= turnSpeed * dt;
  if (!GAME.pointerLocked) {
    // keyboard fallback aim (arrow keys) when pointer lock unavailable
    const aimSpeed = 1.5;
    if (GAME.keys['ArrowLeft']) GAME.yaw += aimSpeed * dt;
    if (GAME.keys['ArrowRight']) GAME.yaw -= aimSpeed * dt;
    if (GAME.keys['ArrowUp']) GAME.pitch -= aimSpeed * dt;     // Up arrow -> aim up
    if (GAME.keys['ArrowDown']) GAME.pitch += aimSpeed * dt;   // Down arrow -> aim down
  }
  // Normalizar yaw para o range [-PI, PI] para evitar overflow numérico e
  // garantir interpolação angular correta em 360°
  while (GAME.yaw > Math.PI) GAME.yaw -= 2 * Math.PI;
  while (GAME.yaw < -Math.PI) GAME.yaw += 2 * Math.PI;
  // pitch clamp amplo — permite olhar totalmente para cima e para baixo
  GAME.pitch = Math.max(-1.5, Math.min(1.5, GAME.pitch));
  GAME.mouse.dx = 0; GAME.mouse.dy = 0;

  // dica de pointer lock — aparece quando o cursor não está travado
  const lockHintEl = document.getElementById('lockHint');
  if (lockHintEl) {
    if (GAME.pointerLocked) lockHintEl.classList.remove('show');
    else lockHintEl.classList.add('show');
  }

  // ---- player movement ----
  // Perf: reuse module-scoped Vector3s instead of allocating 3 per frame.
  // At 60fps that's 180 Vector3s/sec saved from the GC.
  moveDir.set(0, 0, 0);
  fwd.set(-Math.sin(GAME.yaw), 0, -Math.cos(GAME.yaw));
  right.set(Math.cos(GAME.yaw), 0, -Math.sin(GAME.yaw));
  if (GAME.keys['KeyW']) moveDir.add(fwd);
  if (GAME.keys['KeyS']) moveDir.sub(fwd);
  if (GAME.keys['KeyA']) moveDir.sub(right);
  if (GAME.keys['KeyD']) moveDir.add(right);
  const isSprinting = GAME.keys['ShiftLeft'] || GAME.keys['ShiftRight'];
  const speed = playerStats.baseSpeed * playerStats.speedMul * (isSprinting ? playerStats.sprintMul : 1) * (playerStats.dashTimer > 0 ? 2.0 : 1);

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    GAME.player.position.x += moveDir.x * speed * dt;
    GAME.player.position.z += moveDir.z * speed * dt;
  }
  // dash
  // Mobile UX: allow dash even when not actively moving (the joystick can
  // be idle when the user taps DASH). On desktop, the original gate
  // (moveDir.lengthSq > 0) still applies because the keyboard doesn't
  // have an idle-but-dash use case.
  if (GAME.keys['Space'] && playerStats.dashCooldown <= 0) {
    const isMobile = !!(typeof window !== 'undefined' && window.__NATIVE__);
    if (!isMobile && moveDir.lengthSq() <= 0) {
      // PC keyboard: skip dash if no movement
    } else {
      playerStats.dashTimer = 0.25;
      playerStats.dashCooldown = 1.0;
      GAME.keys['Space'] = false; // single press; we'll re-trigger via keydown
      spawnParticleBurst(_burstPosAt(GAME.player.position, 0.5, 0), 0x00ffff, 8, 6);
    }
  }
  if (playerStats.dashTimer > 0) playerStats.dashTimer -= dt;
  if (playerStats.dashCooldown > 0) playerStats.dashCooldown -= dt;

  // collision with buildings
  const ppos = GAME.player.position;
  collideWithBuildings(ppos, 0.5);
  // keep on ground
  ppos.y = 0;

  // face direction of movement or camera yaw
  // O player mesh tem a frente (arma) em +Z local.
  // A câmera está ATRÁS do player (em +Z) e olha para a cena (-Z).
  // Para o player "encarar" a cena, sua frente (+Z) deve apontar para onde a câmera olha (-Z).
  // Em yaw=0, a câmera olha para -Z, então a frente do player deve estar em -Z → rotation.y = π.
  if (moveDir.lengthSq() > 0.01) {
    // enquanto se move, vira gradualmente para a direção do movimento
    const targetYaw = Math.atan2(moveDir.x, moveDir.z);
    const currentYaw = GAME.player.rotation.y;
    const curNorm = Math.atan2(Math.sin(currentYaw), Math.cos(currentYaw));
    GAME.player.rotation.y = THREE.MathUtils.lerp(curNorm, targetYaw, 0.18);
  } else {
    // quando parado, player encara a direção da CENA (oposto à câmera = yaw + π)
    const currentYaw = GAME.player.rotation.y;
    const curNorm = Math.atan2(Math.sin(currentYaw), Math.cos(currentYaw));
    const desiredYaw = GAME.yaw + Math.PI;
    let diff = desiredYaw - curNorm;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const target = curNorm + diff;
    // interpolação rápida para seguir a câmera
    GAME.player.rotation.y = THREE.MathUtils.lerp(curNorm, target, 0.30);
  }

  // procedural walk anim
  const u = GAME.player.userData;
  const walkSpeed = moveDir.lengthSq() > 0 ? (isSprinting ? 14 : 9) : 0;
  u.walkT += dt * walkSpeed;
  const sw = Math.sin(u.walkT) * 0.5;
  u.legLGroup.rotation.x = sw; u.legRGroup.rotation.x = -sw;
  u.armLGroup.rotation.x = -sw * 0.4; u.armRGroup.rotation.x = sw * 0.6;
  // bobbing do torso
  u.torsoGroup.position.y = 1.18 + Math.abs(Math.sin(u.walkT)) * 0.04;
  if (playerStats.dashTimer > 0) {
    u.torsoGroup.rotation.x = -0.25;
  } else {
    u.torsoGroup.rotation.x = THREE.MathUtils.lerp(u.torsoGroup.rotation.x, 0, 0.2);
  }
  // recoil da arma
  if (u.fireKick > 0) u.fireKick = Math.max(0, u.fireKick - dt * 4);
  if (u.gunGroup) {
    u.gunGroup.position.z = 0.30 - u.fireKick * 0.15;
    u.gunGroup.rotation.x = -u.fireKick * 0.3;
  }
  // animação de reload — varía por tipo de arma
  if (playerStats.reloading && u.armRGroup && u.gunGroup) {
    const progress = 1 - (playerStats.reloadT / (playerStats.reloadTime * playerStats.reloadMul));
    const weaponId = playerStats.weaponId;
    let armDown = 0;
    let gunY = 0;
    let gunZ = 0;
    let gunTilt = 0;
    if (weaponId === 'pistol') {
      // PISTOLA: 4 etapas
      // 0-0.15: braço desce + arma inclina para baixo
      // 0.15-0.35: magazine removido (arma inclinada para frente)
      // 0.35-0.55: magazine inserido
      // 0.55-0.75: slide puxado para trás
      // 0.75-1.0: braço sobe
      if (progress < 0.15) { armDown = progress / 0.15; gunTilt = armDown * 0.4; }
      else if (progress < 0.35) { armDown = 1; gunTilt = 0.4 + (progress - 0.15) / 0.20 * 0.3; gunZ = 0.15; }
      else if (progress < 0.55) { armDown = 1; gunTilt = 0.7 - (progress - 0.35) / 0.20 * 0.3; gunZ = 0.15 - (progress - 0.35) / 0.20 * 0.15; }
      else if (progress < 0.75) { armDown = 1; gunTilt = 0.4; gunZ = -0.10 + (progress - 0.55) / 0.20 * 0.10; }
      else { armDown = 1 - (progress - 0.75) / 0.25; gunTilt = (1 - (progress - 0.75) / 0.25) * 0.4; gunZ = 0; }
    } else if (weaponId === 'rifle') {
      // RIFLE: 4 etapas — magazine out, magazine in, bolt pull, bolt release
      if (progress < 0.20) { armDown = progress / 0.20; gunTilt = armDown * 0.3; }
      else if (progress < 0.45) { armDown = 1; gunTilt = 0.3 + (progress - 0.20) / 0.25 * 0.2; }
      else if (progress < 0.70) { armDown = 1; gunTilt = 0.5 - (progress - 0.45) / 0.25 * 0.5; }
      else { armDown = 1 - (progress - 0.70) / 0.30; gunTilt = (1 - (progress - 0.70) / 0.30) * 0.3; }
    } else if (weaponId === 'shotgun') {
      // SHOTGUN: shells + pump action
      if (progress < 0.25) { armDown = progress / 0.25; gunTilt = armDown * 0.5; }
      else if (progress < 0.55) { armDown = 1; gunTilt = 0.5; gunZ = -0.15 + (progress - 0.25) / 0.30 * 0.15; }
      else if (progress < 0.75) { armDown = 1; gunTilt = 0.5 - (progress - 0.55) / 0.20 * 0.5; }
      else { armDown = 1 - (progress - 0.75) / 0.25; gunTilt = (1 - (progress - 0.75) / 0.25) * 0.5; }
    } else if (weaponId === 'bazooka') {
      // BAZOOKA: arma pesada, movimento lento
      armDown = progress < 0.5 ? progress * 2 : 2 - progress * 2;
      gunTilt = armDown * 0.6;
      gunZ = armDown * 0.2;
    } else if (weaponId === 'minigun') {
      // MINIGUN: spinar continua
      // enquanto recarrega, arma fica parada apontada para baixo
      armDown = progress < 0.3 ? progress / 0.3 : 1;
      gunTilt = armDown * 0.5;
    } else if (weaponId === 'railgun') {
      // RAILGUN: arma pesada com carga elétrica
      armDown = progress < 0.5 ? progress * 2 : 2 - progress * 2;
      gunTilt = armDown * 0.4;
      gunZ = armDown * 0.15;
    } else if (weaponId === 'flamethrower') {
      // LANÇA-CHAMAS: tanque atrás
      armDown = 1;
      gunTilt = 0.3 * Math.sin(progress * Math.PI * 2);
    } else if (weaponId === 'laser') {
      // LASER: recarga quase instantânea
      armDown = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      gunTilt = armDown * 0.3;
    } else if (weaponId === 'plasma') {
      // PLASMA: bobinas pulsando
      armDown = 1;
      gunTilt = 0.2 * Math.sin(progress * Math.PI * 4);
    } else {
      // fallback genérico
      armDown = progress < 0.5 ? progress * 2 : 2 - progress * 2;
      gunTilt = armDown * 0.4;
    }
    // aplicar no player
    u.armRGroup.rotation.x = THREE.MathUtils.lerp(u.armRGroup.rotation.x, -0.5 - armDown * 0.8, 0.3);
    u.gunGroup.position.y = THREE.MathUtils.lerp(u.gunGroup.position.y, 1.35 - armDown * 0.20, 0.25);
    u.gunGroup.position.z = THREE.MathUtils.lerp(u.gunGroup.position.z, 0.30 - gunZ * 0.3, 0.25);
    u.gunGroup.rotation.x = THREE.MathUtils.lerp(u.gunGroup.rotation.x, -gunTilt * 0.5, 0.25);
  } else if (u.armRGroup && u.gunGroup) {
    // restaurar posição padrão
    u.armRGroup.rotation.x = THREE.MathUtils.lerp(u.armRGroup.rotation.x, 0, 0.2);
    u.gunGroup.position.y = THREE.MathUtils.lerp(u.gunGroup.position.y, 1.35, 0.2);
    u.gunGroup.position.z = THREE.MathUtils.lerp(u.gunGroup.position.z, 0.30, 0.2);
    u.gunGroup.rotation.x = THREE.MathUtils.lerp(u.gunGroup.rotation.x, 0, 0.2);
  }
  // sway da capa
  if (u.cape) {
    u.cape.rotation.x = 0.2 + Math.sin(u.walkT * 0.5) * 0.04;
    u.cape.rotation.z = Math.sin(u.walkT * 0.3) * 0.05;
  }
  // cabeça segue levemente a mira (pitch positivo = mira para cima = cabeça olha para cima)
  if (u.headGroup) {
    u.headGroup.rotation.x = THREE.MathUtils.lerp(u.headGroup.rotation.x, GAME.pitch * 0.3, 0.15);
    u.headGroup.rotation.y = THREE.MathUtils.lerp(u.headGroup.rotation.y, -GAME.mouse.dx * 0.001, 0.1);
  }

  // shoot
  if (playerStats.fireCooldown > 0) playerStats.fireCooldown -= dt;
  if (GAME.mouse.down && !playerStats.reloading && playerStats.ammo > 0 && playerStats.fireCooldown <= 0) {
    fire();
  }
  if (GAME.mouse.down && playerStats.ammo <= 0 && !playerStats.reloading) {
    startReload();
  }
  // reload — sempre restaura todo o pente (munição infinita)
  if (playerStats.reloading) {
    playerStats.reloadT -= dt;
    if (playerStats.reloadT <= 0) {
      playerStats.ammo = playerStats.maxAmmo;
      playerStats.reloading = false;
    }
  }
  if (u.flash) u.flash.intensity *= 0.85;
  if (u.muzzleT > 0) u.muzzleT -= dt;

  // damage flash decay
  if (playerStats.damageFlashT > 0) {
    playerStats.damageFlashT -= dt;
    if (playerStats.damageFlashT <= 0) document.getElementById('dmgFlash').style.opacity = '0';
  }
  if (playerStats.invincible > 0) playerStats.invincible -= dt;
  if (GAME.waveAnnounceT > 0) {
    GAME.waveAnnounceT -= dt;
    if (GAME.waveAnnounceT <= 0) document.getElementById('waveAnnounce').style.opacity = '0';
  }
  if (GAME.multTimer > 0) {
    GAME.multTimer -= dt;
    if (GAME.multTimer <= 0) GAME.multiplier = 1.0;
  }

  // ---- card countdown (3s aviso + 1s lock) ----
  if (GAME.cardCountdownActive && GAME.state === 'playing') {
    GAME.cardCountdown -= dt;
    if (GAME.cardCountdown <= 0) {
      GAME.cardCountdownActive = false;
      // abrir tela de cartas com lock de 1s para evitar click acidental
      GAME.cardLockT = 1.0;
      showCardSelection();
    }
  }
  if (GAME.cardLockT > 0) GAME.cardLockT -= dt;

  // ---- game mode timer ----
  updateGameMode(dt);

  // ---- enemy spawning / wave ----
  GAME.spawnTimer -= dt;
  // se restar 1 inimigo solitário, acelerar spawns para não haver downtime
  let effectiveInterval = GAME.spawnInterval;
  if (GAME.waveEnemiesRemaining === 1 && GAME.enemies.length === 0) {
    effectiveInterval = Math.min(effectiveInterval, 0.6);
  }
  if (GAME.spawnTimer <= 0 && GAME.waveEnemiesRemaining > 0) {
    spawnEnemy();
    GAME.spawnTimer = effectiveInterval;
  }
  // next wave when no enemies remain
  if (GAME.enemies.length === 0 && GAME.waveEnemiesRemaining <= 0) {
    GAME.wave++;
    GAME.waveSize = 5 + GAME.wave * 2;
    if (GAME.wave % 5 === 0) GAME.waveSize = 1; // boss wave: só 1 boss
    GAME.waveEnemiesRemaining = GAME.waveSize;
    GAME.spawnInterval = Math.max(0.25, 0.8 - GAME.wave * 0.05);
    triggerWaveAnnounce('WAVE ' + GAME.wave);
    playSfx('wave');
    // recompensa de wave: vida e escudo
    playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 20);
    playerStats.shield = Math.min(playerStats.maxShield, playerStats.shield + 25);
    // game modes aleatórios (a cada 3 waves, muda o modo)
    if (GAME.wave >= 3 && GAME.wave % 3 === 0) {
      const modes = ['dark', 'frenzy', 'siege'];
      const m = modes[Math.floor(Math.random() * modes.length)];
      activateGameMode(m);
    } else {
      GAME.gameMode = 'normal';
      GAME.modeTimer = 0;
      // restaurar iluminação normal
      renderer.toneMappingExposure = 1.5;
    }
    // trocar música para boss wave (5/10/15/...)
    if (GAME.wave % 5 === 0) {
      startBossMusic();
    } else if (bossMusicActive) {
      // wave de boss acabou, voltar para a música normal
      endBossMusic();
    }
  }

  // ---- enemies AI ----
  for (let i = GAME.enemies.length - 1; i >= 0; i--) {
    const e = GAME.enemies[i];
    const dx = GAME.player.position.x - e.mesh.position.x;
    const dz = GAME.player.position.z - e.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 0.001;
    const dirX = dx / dist, dirZ = dz / dist;
    const eu = e.mesh.userData;

    // ---- comportamentos por tipo ----
    let moveX = 0, moveZ = 0;
    let isMoving = false;

    if (e.type === 'phantom') {
      // teleporta a cada few segundos
      e.teleportT -= dt;
      if (e.teleportT <= 0 && dist > 3) {
        const ang = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 4;
        e.mesh.position.x = GAME.player.position.x + Math.cos(ang) * r;
        e.mesh.position.z = GAME.player.position.z + Math.sin(ang) * r;
        e.teleportT = 3 + Math.random() * 2;
        spawnParticleBurst(_burstPosAt(e.mesh.position, 0.8, 0), 0xcc88ff, 16, 6);
      }
      moveX = dirX; moveZ = dirZ; isMoving = true;
    } else if (e.type === 'drone') {
      // drone: flutua acima do solo, segue o player à distância
      // oscila levemente o flyHeight
      e.flyHeight += Math.sin(performance.now() * 0.002) * dt * 0.5;
      // manter distância média (8-12)
      if (dist > 12) { moveX = dirX; moveZ = dirZ; isMoving = true; }
      else if (dist < 6) { moveX = -dirX; moveZ = -dirZ; isMoving = true; }
      else {
        // strafe lateral
        moveX = -dirZ; moveZ = dirX;
        isMoving = Math.random() < 0.3;
      }
    } else if (e.type === 'sentinel') {
      // sentinel: fica parado em cima do prédio, só atira
      moveX = 0; moveZ = 0; isMoving = false;
    } else if (e.type === 'sniper') {
      // mantém distância ideal (15-22 unidades)
      if (dist > 22) { moveX = dirX; moveZ = dirZ; isMoving = true; }
      else if (dist < 14) { moveX = -dirX; moveZ = -dirZ; isMoving = true; }
      else {
        // strafe lateral
        moveX = -dirZ; moveZ = dirX;
        isMoving = Math.random() < 0.3;
      }
    } else if (e.type === 'bruiser') {
      // quando perto, prepara ataque AOE (telegraph)
      if (dist < e.attackRange * 1.5 && e.attackCd <= 0) {
        // parar e preparar
        e.telegraph = 1.0;
      }
      if (e.telegraph > 0) {
        e.telegraph -= dt * 1.2;
        if (e.telegraph <= 0) {
          // AOE explosion
          spawnExplosion(_burstPosAt(e.mesh.position, 0.5, 0), 3.5, e.damage);
          e.attackCd = 2.5;
        }
      } else {
        moveX = dirX; moveZ = dirZ; isMoving = true;
      }
    } else if (e.type === 'crawler') {
      // anda devagar, dispara projéteis
      moveX = dirX; moveZ = dirZ; isMoving = true;
    } else if (e.type === 'shieldbearer') {
      // shieldbearer: gira lentamente para o player (delay na rotação)
      if (e.faceTarget === undefined) e.faceTarget = e.mesh.rotation.y;
      const targetYaw = Math.atan2(dirX, dirZ);
      let cur = e.faceTarget;
      let diff = targetYaw - cur;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      const turnRate = 0.6; // ~34°/s, dá tempo de mirar nas costas
      if (Math.abs(diff) < turnRate * dt) e.faceTarget = targetYaw;
      else e.faceTarget = cur + Math.sign(diff) * turnRate * dt;
      e.mesh.rotation.y = e.faceTarget;
      moveX = dirX; moveZ = dirZ; isMoving = true;
    } else {
      // IA estratégica para melee padrão: coordena com队友
      // 1) FLANQUEAR: se há um teammate na frente, tenta ir pelos lados
      // Perf: skip the O(n^2) scan when the field is crowded. Below 20
      // active enemies, the visual benefit of flanking is worth the cost;
      // above that, enemies just rush straight at the player and it's fine.
      const _aiScan = GAME.enemies.length <= 20;
      let flanked = false;
      if (_aiScan) for (const o of GAME.enemies) {
        if (o === e) continue;
        const od = Math.hypot(o.mesh.position.x - GAME.player.position.x, o.mesh.position.z - GAME.player.position.z);
        if (od < dist && od > 0.5) {
          // há alguém mais perto do player: flanquear pelos lados
          const side = (o.mesh.position.x * dirZ - o.mesh.position.z * dirX) > 0 ? 1 : -1;
          moveX = dirX * 0.4 + (-dirZ) * side * 0.8;
          moveZ = dirZ * 0.4 + dirX * side * 0.8;
          isMoving = true;
          flanked = true;
          break;
        }
      }
      // 2) AVANÇAR COORDENADO: se há teammate próximo (4 unidades), avança em grupo
      if (!flanked && _aiScan) {
        let grouped = false;
        for (const o of GAME.enemies) {
          if (o === e) continue;
          const od = Math.hypot(o.mesh.position.x - e.mesh.position.x, o.mesh.position.z - e.mesh.position.z);
          if (od < 4 && od > 0.5) {
            // há teammate próximo: atacar em grupo
            moveX = dirX; moveZ = dirZ;
            isMoving = true;
            grouped = true;
            break;
          }
        }
        if (!grouped) {
          // sozinho: avanço direto
          moveX = dirX; moveZ = dirZ;
          isMoving = true;
        }
      }
    }

    // aplicar movimento
    const spd = e.speed * (e.telegraph && e.telegraph > 0 ? 0.3 : 1) * (e.type === 'phantom' && e.teleportT < 0.3 ? 0.5 : 1);
    e.mesh.position.x += moveX * spd * dt;
    e.mesh.position.z += moveZ * spd * dt;
    // drone: ajustar altura
    if (e.type === 'drone') {
      e.mesh.position.y = e.flyHeight + Math.sin(performance.now() * 0.003 + e.walkT) * 0.3;
      // rotacionar hélices
      if (eu.rotors) {
        for (const r of eu.rotors) r.rotation.y += dt * 30;
      }
    }
    // sentinel: ajustar altura se em cima de prédio
    if (e.type === 'sentinel' && e.perchY) {
      e.mesh.position.y = e.perchY;
    }
    // collide with buildings
    collideWithBuildings(e.mesh.position, e.scale * 0.5);
    // não sobrepor o player
    const minDist = 1.0 * e.scale;
    if (dist < minDist) {
      const push = (minDist - dist);
      e.mesh.position.x -= dirX * push;
      e.mesh.position.z -= dirZ * push;
    }
    // face player (ou direção de movimento) — exceto shieldbearer (já tem rotação própria)
    if (e.type !== 'shieldbearer') {
      const faceX = moveX !== 0 || moveZ !== 0 ? moveX : dirX;
      const faceZ = moveX !== 0 || moveZ !== 0 ? moveZ : dirZ;
      e.mesh.rotation.y = Math.atan2(faceX, faceZ);
    }

    // walk anim
    const esw = Math.sin(e.walkT) * 0.55;
    if (isMoving) {
      if (eu.legLGroup) { eu.legLGroup.rotation.x = esw; eu.legRGroup.rotation.x = -esw; }
      if (eu.armLGroup) { eu.armLGroup.rotation.x = -esw * 0.4; eu.armRGroup.rotation.x = esw * 0.5; }
    }
    e.walkT += dt * (e.speed * 1.4);

    // ---- ataques por tipo ----
    if (e.attackCd > 0) e.attackCd -= dt;

    if (e.type === 'ranged' || e.type === 'crawler' || e.type === 'sniper') {
      // atira de longe
      if (dist < e.attackRange && e.attackCd <= 0 && dist > 2) {
        if (e.telegraph === undefined) e.telegraph = 0;
        if (e.telegraph <= 0) e.telegraph = 0.35; // pequeno telegraph
      }
      if (e.telegraph && e.telegraph > 0) {
        e.telegraph -= dt;
        if (e.telegraph <= 0 && e.attackCd <= 0) {
          // disparar projétil inimigo
          const sd = new THREE.Vector3(dirX, 0.05, dirZ).normalize();
          const origin = _burstPosAt(e.mesh.position, 0.9, 0);
          spawnEnemyBullet(origin, sd);
          e.attackCd = e.type === 'sniper' ? 2.0 : 1.5;
        }
      }
    } else if (e.type === 'apex') {
      // rajada de 3 tiros
      if (dist < e.attackRange && e.attackCd <= 0 && dist > 3) {
        if (e.burstTotal === 0) { e.burstTotal = 3; e.burstShots = 0; e.attackCd = 0.15; }
      }
      if (e.burstTotal > 0) {
        if (e.attackCd <= 0) {
          const sd = new THREE.Vector3(dirX, 0, dirZ).normalize();
          const sd2 = sd.clone(); sd2.x += (Math.random() - 0.5) * 0.05; sd2.z += (Math.random() - 0.5) * 0.05;
          spawnEnemyBullet(_burstPosAt(e.mesh.position, 0.9, 0), sd2);
          e.burstShots++;
          if (e.burstShots >= e.burstTotal) {
            e.burstTotal = 0; e.attackCd = 2.0;
          } else {
            e.attackCd = 0.15;
          }
        }
      }
    } else if (e.type === 'bomber') {
      // corre para o player e explode ao chegar perto
      if (dist < 2 && e.attackCd <= 0) {
        spawnExplosion(_burstPosAt(e.mesh.position, 0.5, 0), 3, 18);
        e.hp = 0;
        // killEnemy vai ser chamado no loop de bullet/dano
      } else {
        e.attackCd = 0.5;
      }
    } else if (e.type === 'boss') {
      // boss: ataca em cone à frente
      if (dist < e.attackRange && e.attackCd <= 0) {
        if (e.burstTotal === 0) { e.burstTotal = 5; e.burstShots = 0; e.attackCd = 0.2; }
      }
      if (e.burstTotal > 0) {
        if (e.attackCd <= 0) {
          const sd = new THREE.Vector3(dirX, 0, dirZ).normalize();
          const sd2 = sd.clone(); sd2.x += (Math.random() - 0.5) * 0.1; sd2.z += (Math.random() - 0.5) * 0.1;
          spawnEnemyBullet(_burstPosAt(e.mesh.position, 1.2, 0), sd2);
          e.burstShots++;
          if (e.burstShots >= e.burstTotal) {
            e.burstTotal = 0; e.attackCd = 2.5;
          } else {
            e.attackCd = 0.2;
          }
        }
      }
    } else {
      // melee padrão
      if (dist < e.attackRange) {
        if (e.attackAnim < 1) e.attackAnim = Math.min(1, e.attackAnim + dt * 3);
        if (e.attackCd <= 0) {
          damagePlayer(e.damage);
          e.attackCd = 1.4;
        }
      } else {
        if (e.attackAnim > 0) e.attackAnim = Math.max(0, e.attackAnim - dt * 3);
      }
    }
    // apply attack pose
    const atkRaise = e.attackAnim || 0;
    if (eu.armLGroup) eu.armLGroup.rotation.x = THREE.MathUtils.lerp(eu.armLGroup.rotation.x, -1.2, atkRaise * 0.5);
    if (eu.armRGroup) eu.armRGroup.rotation.x = THREE.MathUtils.lerp(eu.armRGroup.rotation.x, -1.2, atkRaise * 0.5);

    // bomber explode foi marcado com hp=0; mata aqui
    if (e.hp <= 0) {
      killEnemy(i, e);
    }
  }

  // ---- bullets ----
  for (let i = GAME.bullets.length - 1; i >= 0; i--) {
    const b = GAME.bullets[i];
    b.mesh.position.x += b.vel.x * dt;
    b.mesh.position.y += b.vel.y * dt;
    b.mesh.position.z += b.vel.z * dt;
    b.life -= dt;
    if (b.life <= 0) {
      scene.remove(b.mesh);
      if (b.trail) scene.remove(b.trail);
      GAME.bullets.splice(i, 1); continue;
    }
    // trail update
    if (b.trail && b.trailPositions) {
      const idx = b.trailIndex;
      b.trailPositions[idx * 3] = b.mesh.position.x;
      b.trailPositions[idx * 3 + 1] = b.mesh.position.y;
      b.trailPositions[idx * 3 + 2] = b.mesh.position.z;
      b.trailIndex = (b.trailIndex + 1) % 20;
      const arr = b.trail.geometry.attributes.position.array;
      arr.fill(0);
      for (let k = 0; k < 20; k++) {
        const j = (b.trailIndex + k) % 20;
        arr[k * 3] = b.trailPositions[j * 3];
        arr[k * 3 + 1] = b.trailPositions[j * 3 + 1];
        arr[k * 3 + 2] = b.trailPositions[j * 3 + 2];
      }
      b.trail.geometry.attributes.position.needsUpdate = true;
    }
    // collisions
    let hit = false;
    // wall bounds
    const half = GAME.arena.size * 0.5;
    if (Math.abs(b.mesh.position.x) > half || Math.abs(b.mesh.position.z) > half) hit = true;
    // building collision
    for (const bld of GAME.buildings) {
      const hw = bld.userData.w / 2, hd = bld.userData.d / 2;
      if (b.mesh.position.x > bld.position.x - hw && b.mesh.position.x < bld.position.x + hw &&
          b.mesh.position.z > bld.position.z - hd && b.mesh.position.z < bld.position.z + hd) {
        hit = true; break;
      }
    }
    if (hit) {
      spawnParticleBurst(b.mesh.position.clone(), b.fromPlayer ? 0x00ffff : 0xff66cc, 6, 5);
      scene.remove(b.mesh);
      if (b.trail) scene.remove(b.trail);
      GAME.bullets.splice(i, 1);
      continue;
    }
    // enemy/player hits
    if (b.fromPlayer) {
      for (let j = GAME.enemies.length - 1; j >= 0; j--) {
        const e = GAME.enemies[j];
        if (circleCircleHit(b.mesh.position.x, b.mesh.position.z, 0.3, e.mesh.position.x, e.mesh.position.z, e.scale * 0.5)) {
          // shieldbearer: escudo frontal absorve dano
          if (e.type === 'shieldbearer' && !isBehind(e, GAME.player.position) && !e.shieldBroken) {
            // consumir escudo em vez de HP
            e.shieldHp -= b.dmg;
            // atualizar estágio visual
            const ratio = e.maxShieldHp > 0 ? e.shieldHp / e.maxShieldHp : 0;
            let newStage = 0;
            if (ratio < 0.30) newStage = 2;       // vermelho (quebrando)
            else if (ratio < 0.65) newStage = 1;  // laranja (dano)
            // se escudo quebrar
            if (e.shieldHp <= 0) {
              e.shieldBroken = true;
              e.shieldStage = 3;
              // esconder escudo
              const sm = e.mesh.userData.shieldMesh;
              if (sm) sm.visible = false;
              spawnParticleBurst(_burstPosAt(e.mesh.position, 0.8, 0.3), 0xff8844, 18, 8);
              playSfx('kill');
            } else {
              // atualizar cor do escudo baseado no estágio
              const sm = e.mesh.userData.shieldMesh;
              if (sm) {
                if (newStage !== e.shieldStage) {
                  e.shieldStage = newStage;
                  const colors = [
                    { mat: 0x66ccff, em: 0x4488cc, emI: 0.7, op: 0.85 },  // azul
                    { mat: 0xffaa44, em: 0xcc6622, emI: 0.8, op: 0.78 },  // laranja
                    { mat: 0xff4444, em: 0xcc1111, emI: 1.0, op: 0.7 },   // vermelho
                  ];
                  const c = colors[newStage];
                  sm.material.color.setHex(c.mat);
                  sm.material.emissive.setHex(c.em);
                  sm.material.emissiveIntensity = c.emI;
                  sm.material.opacity = c.op;
                }
              }
              spawnParticleBurst(b.mesh.position.clone(), 0x00aaff, 6, 4);
              playSfx('hit');
            }
            // projétil sempre é consumido (não atravessa escudo)
            scene.remove(b.mesh);
            if (b.trail) scene.remove(b.trail);
            GAME.bullets.splice(i, 1);
            break;
          }
          // Ceifador: executa abaixo de 15% HP
          if (playerStats.executeThreshold > 0 && e.hp < e.maxHp * 0.15) {
            e.hp = 0;
          } else {
            e.hp -= b.dmg;
          }
          // Super Sayajin: dano dobra abaixo de 30% HP
          if (playerStats.hp < playerStats.maxHp * 0.3 && playerStats.executeThreshold < 0) {
            // flag negativa usada pelo Sayajin (carta 45) — aplicado via executeThreshold negativo
          }
          // dano de fogo
          if (e.onFire) e.hp -= b.dmg * 0.05; // dano de tick (burnDoT)
          spawnParticleBurst(b.mesh.position.clone(), b.crit ? 0xffaa00 : 0xff2266, b.crit ? 10 : 6, 4);
          playSfx('hit');
          // lifesteal
          if (playerStats.lifesteal > 0) {
            const heal = b.dmg * playerStats.lifesteal;
            playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + heal);
          }
          // explosivo
          if (b.explosive) {
            spawnExplosion(b.mesh.position.clone(), 3, 15);
          }
          // pierce
          b.hitsLeft--;
          if (b.hitsLeft > 0) {
            // atravessa, continua
            e.mesh.scale.setScalar(e.scale * 1.05);
          } else {
            // bounce: quica antes de morrer
            if (b.bouncesLeft > 0 && !b.explosive) {
              b.bouncesLeft--;
              // inverte velocidade no eixo XZ aleatório
              const nrm = new THREE.Vector3((Math.random() - 0.5), 0, (Math.random() - 0.5)).normalize();
              b.vel.reflect(nrm);
            } else {
              scene.remove(b.mesh);
              if (b.trail) scene.remove(b.trail);
              GAME.bullets.splice(i, 1);
            }
          }
          if (e.hp <= 0) {
            killEnemy(j, e);
          } else {
            // hit flash
            e.mesh.scale.setScalar(e.scale * 1.08);
            setTimeout(() => { if (e.mesh) e.mesh.scale.setScalar(e.scale); }, 80);
          }
          if (b.hitsLeft > 0) continue; // bullet continua, testa próximo inimigo
          break;
        }
      }
    } else {
      // enemy bullet hitting player
      const ppos2 = GAME.player.position;
      if (circleCircleHit(b.mesh.position.x, b.mesh.position.z, 0.3, ppos2.x, ppos2.z, 0.6)) {
        spawnParticleBurst(b.mesh.position.clone(), 0xff2266, 10, 5);
        scene.remove(b.mesh);
        GAME.bullets.splice(i, 1);
        damagePlayer(b.dmg);
      }
    }
  }

  // ---- pickups ----
  for (let i = GAME.pickups.length - 1; i >= 0; i--) {
    const p = GAME.pickups[i];
    p.life -= dt;
    p.mesh.rotation.y += dt * 2;
    p.mesh.position.y = p.baseY + Math.sin(performance.now() * 0.003) * 0.15;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      GAME.pickups.splice(i, 1);
      continue;
    }
    if (circleCircleHit(p.mesh.position.x, p.mesh.position.z, 0.6, GAME.player.position.x, GAME.player.position.z, 0.6)) {
      playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + 30);
      spawnParticleBurst(p.mesh.position.clone(), 0xff66e0, 10, 4);
      playSfx('pickup');
      scene.remove(p.mesh);
      GAME.pickups.splice(i, 1);
    }
  }

  // ---- particles ----
  // Pool-backed: each particle is reused. We just toggle visible=false when
  // it dies — no scene.remove, no material.dispose, no array.splice. This
  // is the main fix for the 1-2s GC pauses during heavy bursts.
  for (let i = GAME.particles.length - 1; i >= 0; i--) {
    const p = GAME.particles[i];
    p.life -= dt;
    if (!p.isFlash) {
      p.vel.y -= 9.8 * dt * 0.4;
      p.mesh.position.x += p.vel.x * dt;
      p.mesh.position.y += p.vel.y * dt;
      p.mesh.position.z += p.vel.z * dt;
    }
    p.mat.opacity = Math.max(0, p.life * 1.6);
    if (p.life <= 0 || p.mesh.position.y < -0.5) {
      p.mesh.visible = false;
      // Compact the active list in place. We swap-pop instead of splice
      // to keep this O(1) per removal (splice is O(n)).
      const last = GAME.particles.length - 1;
      if (i !== last) GAME.particles[i] = GAME.particles[last];
      GAME.particles.length = last;
    }
  }
  // limite duro de partículas para evitar acúmulo
  while (GAME.particles.length > 250) {
    const p = GAME.particles.pop();
    if (p) p.mesh.visible = false;
  }
  // limite duro de projéteis
  while (GAME.bullets.length > 80) {
    const b = GAME.bullets.shift();
    scene.remove(b.mesh);
    if (b.trail) scene.remove(b.trail);
  }
  // regeneração de HP/shield
  if (playerStats.hpRegenPerSec > 0) {
    playerStats.hpRegenT += dt;
    while (playerStats.hpRegenT >= 1) {
      playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + playerStats.hpRegenPerSec);
      playerStats.hpRegenT -= 1;
    }
  }
  if (playerStats.shieldRegenPerSec > 0) {
    playerStats.shieldRegenT += dt;
    while (playerStats.shieldRegenT >= 1) {
      playerStats.shield = Math.min(playerStats.maxShield, playerStats.shield + playerStats.shieldRegenPerSec);
      playerStats.shieldRegenT -= 1;
    }
  }
  // invencibilidade periódica
  if (playerStats.invulnPeriodic > 0) {
    playerStats.invulnT = (playerStats.invulnT || 0) - dt;
    if (playerStats.invulnT <= 0) {
      playerStats.invincible = 1.0;
      playerStats.invulnT = playerStats.invulnPeriodic;
    }
  }
  // aegis: invencível 2s após tomar dano
  if (playerStats.aegis && playerStats.invincible > 0) {
    // já está sendo tratado pelo damagePlayer
  }
  // frenzy timer
  if (playerStats.frenzyT > 0) {
    playerStats.frenzyT -= dt;
    if (playerStats.frenzyT <= 0) playerStats.frenzyKills = 0;
  }

  // ---- update HUD ----
  updateHUD();
}

function fire() {
  if (playerStats.reloading) return;
  if (playerStats.ammo <= 0) {
    // tentar reload automático
    startReload();
    return;
  }
  const weapon = WEAPONS[playerStats.currentWeapon];
  playerStats.fireCooldown = playerStats.fireRate * playerStats.fireRateMul;
  playerStats.ammo--;
  // Direção do tiro baseada no yaw da câmera (player.rotation.y = yaw + π é só visual)
// O player mesh está rotacionado para a cena, mas a direção do tiro segue a mira da câmera
  const dx = -Math.sin(GAME.yaw) * Math.cos(GAME.pitch);
  const dy = Math.sin(GAME.pitch);
  const dz = -Math.cos(GAME.yaw) * Math.cos(GAME.pitch);
  // origem do tiro: usa a rotação visual do player (que aponta para a cena)
  const shoulder = new THREE.Vector3(0.45, 1.45, 0.35);
  shoulder.applyEuler(new THREE.Euler(0, GAME.player.rotation.y, 0));
  const ox = GAME.player.position.x + shoulder.x + dx * 0.5;
  const oy = GAME.player.position.y + shoulder.y + dy * 0.5;
  const oz = GAME.player.position.z + shoulder.z + dz * 0.5;
  // calcular dano
  let dmg = playerStats.baseDamage * playerStats.damageMul;
  if (playerStats.frenzyT > 0) dmg *= 1 + 0.1 * playerStats.frenzyKills;
  if (playerStats.chaosDamage) dmg *= 0.5 + Math.random() * 2.5;
  if (playerStats.lowHpDamageMul > 0 && playerStats.hp < playerStats.maxHp * 0.3) dmg *= playerStats.lowHpDamageMul;
  const crit = Math.random() < playerStats.critChance;
  if (crit) dmg *= playerStats.critMul;
  // pellets (shotgun dispara vários) + multishot da carta
  const pellets = Math.min(12, weapon.pellets * (1 + playerStats.multishot));
  for (let i = 0; i < pellets; i++) {
    // spread do arma + spread do multishot
    const spreadAngle = (Math.random() - 0.5) * weapon.spread * 2;
    const spreadAngle2 = (Math.random() - 0.5) * weapon.spread * 2;
    // aplicar rotação ao redor do eixo forward
    const cosA = Math.cos(spreadAngle), sinA = Math.sin(spreadAngle);
    const cosB = Math.cos(spreadAngle2), sinB = Math.sin(spreadAngle2);
    let sdx = dx * cosA + dz * sinA;
    let sdz = -dx * sinA + dz * cosA;
    // pitch spread
    const sdy = dy * cosB + Math.sqrt(sdx*sdx + sdz*sdz) * sinB * 0.3;
    const len = Math.hypot(sdx, sdy, sdz) || 1;
    spawnBulletFast(ox + sdx/len * 0.05, oy + sdy/len * 0.05, oz + sdz/len * 0.05,
      sdx/len, sdy/len, sdz/len, dmg, crit,
      Math.max(playerStats.pierce, playerStats.weaponPierce || 0),
      playerStats.bounce,
      playerStats.explosive || playerStats.weaponExplosive);
  }
  // muzzle flash
  spawnMuzzleFlashFast(ox + dx * 0.4, oy + dy * 0.4, oz + dz * 0.4);
  // som específico da arma
  playSfx(weapon.sound);
  // recoil diferenciado
  const u = GAME.player.userData;
  if (u) {
    u.fireKick = 1.0 + weapon.spread * 2;
    if (u.flash) u.flash.intensity = 2.5;
  }
}

function killEnemy(idx, e) {
  spawnParticleBurst(_burstPosAt(e.mesh.position, 0.8, 0), 0xff00d4, 18, 8);
  spawnParticleBurst(_burstPosAt(e.mesh.position, 0.8, 0), 0x00e0ff, 12, 6);
  scene.remove(e.mesh);
  GAME.enemies.splice(idx, 1);
  GAME.totalKills++;
  GAME.multiplier = Math.min(8, GAME.multiplier + 0.1);
  GAME.multTimer = 4;
  GAME.score += Math.round(e.score * GAME.multiplier);
  // frenzy: incrementa contador de kills recentes
  if (playerStats.frenzy) {
    playerStats.frenzyKills++;
    playerStats.frenzyT = 5;
  }
  // explosive kills (carta Morte Lenta): cada kill explode
  if (playerStats.explosiveKills) {
    spawnExplosion(_burstPosAt(e.mesh.position, 0.5, 0), 2.5, 8);
  }
  // boss damage multiplier
  if (e.type === 'boss' && playerStats.bossDamageMul) {
    GAME.score += Math.round(e.score * (playerStats.bossDamageMul - 1) * GAME.multiplier);
  }
  // chance to drop pickup
  if (Math.random() < 0.25) spawnPickup(e.mesh.position.clone());
  // som de morte
  playSfx('kill');
  // trigger de cartas a cada 1000 pontos — iniciar countdown de 3s primeiro
  if (GAME.state === 'playing' && Math.floor(GAME.score / 1000) > Math.floor(GAME.lastCardScore / 1000)) {
    GAME.lastCardScore = GAME.score;
    if (!GAME.cardCountdownActive) {
      GAME.cardCountdown = 3.0;
      GAME.cardCountdownActive = true;
    }
  } else {
    GAME.lastCardScore = GAME.score;
  }
}

function damagePlayer(dmg) {
  if (playerStats.invincible > 0) return;
  // aplicar redução de dano
  dmg *= (1 - playerStats.damageReduction);
  if (playerStats.shield > 0) {
    const absorbed = Math.min(playerStats.shield, dmg);
    playerStats.shield -= absorbed;
    dmg -= absorbed;
  }
  // carta "Sangue por Sangue" aumenta dano em 50%
  if (playerStats.sanguePorSangue) dmg *= 1.5;
  playerStats.hp -= dmg;
  triggerDamageFlash();
  playSfx('hurt');
  playerStats.invincible = 0.25;
  if (playerStats.hp <= 0) {
    // reviver (carta Imortal / Fênix)
    if (playerStats.revives > 0) {
      playerStats.revives--;
      playerStats.hp = playerStats.maxHp * 0.5;
      playerStats.invincible = 3.0;
      spawnParticleBurst(_burstPosAt(GAME.player.position, 1, 0), 0xffaa00, 40, 12);
      return;
    }
    playerStats.hp = 0;
    spawnParticleBurst(_burstPosAt(GAME.player.position, 1, 0), 0xff2266, 30, 10);
    gameOver();
  }
}

// Inimigo está com as costas viradas para o ponto?
function isBehind(enemy, refPos) {
  const fx = Math.sin(enemy.mesh.rotation.y);
  const fz = Math.cos(enemy.mesh.rotation.y);
  const dx = refPos.x - enemy.mesh.position.x;
  const dz = refPos.z - enemy.mesh.position.z;
  const dot = fx * dx + fz * dz;
  return dot < -0.2; // atrás = dot negativo
}

// Explosão AOE
function spawnExplosion(pos, radius, damage) {
  spawnParticleBurst(pos, 0xff8800, 24, 10);
  spawnParticleBurst(pos, 0xffff44, 16, 6);
  // dano em área
  GAME.enemies.forEach(e => {
    const d = Math.hypot(e.mesh.position.x - pos.x, e.mesh.position.z - pos.z);
    if (d < radius) {
      e.hp -= damage * (1 - d / radius);
    }
  });
  // também pode acertar o player
  const dp = Math.hypot(GAME.player.position.x - pos.x, GAME.player.position.z - pos.z);
  if (dp < radius) {
    damagePlayer(damage * 0.5 * (1 - dp / radius));
  }
  playSfx('kill');
}

// ----- Cards system -----
const CARDS = [
  // COMUM (1-20) — cor base cyan
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
  // RARA (21-35) — cor verde
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
  // ÉPICA (36-45) — cor roxa
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
  // LENDÁRIA (46-50) — cor dourada
  { id: 46, name: 'Deus do Trovão',         icon: '⚡', rarity: 'legendary', desc: 'Atravessa tudo, 100% crítico 5x',      pierce: 999, critChance: 1.0, critMul: 5.0 },
  { id: 47, name: 'Fênix',                  icon: '🔥', rarity: 'legendary', desc: 'Revive 3x com HP cheio',               revives: 3, fireDoT: true },
  { id: 48, name: 'Caçador de Deuses',      icon: '🏹', rarity: 'legendary', desc: 'Boss toma 3x de dano',                  bossDamageMul: 3.0 },
  { id: 49, name: 'Aegis',                  icon: '🛡️', rarity: 'legendary', desc: '2s invencível após tomar dano',         aegis: true },
  { id: 50, name: 'Excalibur',              icon: '⚔️', rarity: 'legendary', desc: 'Dash atravessa e mata tudo',           dashExcalibur: true },
  // AMALDIÇOADA (51-55) — cor vermelha
  { id: 51, name: 'Sacrifício',             icon: '💀', rarity: 'cursed',    desc: '3x dano, mas -50 HP máximo',          damageMul: 3.0, maxHpAdd: -50 },
  { id: 52, name: 'Sangue por Sangue',      icon: '🩸', rarity: 'cursed',    desc: '100% lifesteal, +50% dano recebido',   lifesteal: 1.0, sanguePorSangue: true },
  { id: 53, name: 'Cronomancia',            icon: '⏳', rarity: 'cursed',    desc: 'Dash cd 70% menor, mov 40% menor',    dashCdMul: 0.3, speedMul: 0.6 },
  { id: 54, name: 'Caos',                   icon: '🌀', rarity: 'cursed',    desc: 'Dano aleatório entre 0.5x e 3x',      chaosDamage: true },
  { id: 55, name: 'Morte Lenta',            icon: '☠️', rarity: 'cursed',    desc: 'Cada kill explode (dano em você)',    explosiveKills: true },
  // ARMAS (56-70) — cor especial verde-laser
  { id: 56, name: 'Bazooka',                icon: '🚀', rarity: 'rare',      desc: 'Desbloqueia BAZOOKA no slot 3',       weaponUnlockId: 3 },
  { id: 57, name: 'Minigun',                icon: '🔫', rarity: 'epic',      desc: 'Desbloqueia MINIGUN no slot 3',       weaponUnlockId: 4 },
  { id: 58, name: 'Laser',                  icon: '⚡', rarity: 'epic',      desc: 'Desbloqueia LASER no slot 3',         weaponUnlockId: 5 },
  { id: 59, name: 'Railgun',                icon: '🎯', rarity: 'epic',      desc: 'Desbloqueia RAILGUN no slot 3',       weaponUnlockId: 6 },
  { id: 60, name: 'Lança-Chamas',           icon: '🔥', rarity: 'rare',      desc: 'Desbloqueia LANÇA-CHAMAS no slot 3',  weaponUnlockId: 7 },
  { id: 61, name: 'Rifle Plasma',           icon: '⚡', rarity: 'legendary', desc: 'Desbloqueia RIFLE PLASMA no slot 3',  weaponUnlockId: 8 },
];

function showCardSelection() {
  // pausar o jogo
  GAME.state = 'cardselect';
  if (document.pointerLockElement) document.exitPointerLock();
  // escolher 3 cartas com peso por raridade
  const weights = { common: 50, rare: 25, epic: 10, legendary: 4, cursed: 8 };
  const pool = [...CARDS];
  const picks = [];
  for (let i = 0; i < 3; i++) {
    const totalW = pool.reduce((s, c) => s + weights[c.rarity], 0);
    let r = Math.random() * totalW;
    let chosen = pool[0];
    for (const c of pool) {
      r -= weights[c.rarity];
      if (r <= 0) { chosen = c; break; }
    }
    picks.push(chosen);
    pool.splice(pool.indexOf(chosen), 1);
  }
  // renderizar na DOM
  const row = document.getElementById('cardRow');
  row.innerHTML = '';
  for (let i = 0; i < picks.length; i++) {
    const c = picks[i];
    const div = document.createElement('div');
    div.className = 'card ' + c.rarity + ' locked';
    div.dataset.idx = i;
    div.innerHTML = \`
      <div class="icon">\${c.icon}</div>
      <div class="rarity">\${c.rarity}</div>
      <div class="name">\${c.name}</div>
      <div class="desc">\${c.desc}</div>
    \`;
    div.addEventListener('click', () => {
      // bloquear click durante o lock de 1s
      if (GAME.cardLockT > 0) return;
      applyCard(c, picks);
    });
    row.appendChild(div);
  }
  document.getElementById('cardScoreLabel').textContent = \`SCORE \${GAME.score} — CHOOSE\`;
  document.getElementById('cardScreen').classList.remove('hidden');
  // desbloquear cartas após 1s
  setTimeout(() => {
    if (GAME.state === 'cardselect') {
      GAME.cardLockT = 0;
      const cards = document.querySelectorAll('.card');
      cards.forEach(c => c.classList.remove('locked'));
    }
  }, 1000);
  playSfx('card');
}

function applyCard(card, allThree) {
  playSfx('card');
  GAME.cardsApplied.push(card.id);
  // aplicar efeitos
  if (card.damageMul) playerStats.damageMul *= card.damageMul;
  if (card.fireRateMul) playerStats.fireRateMul *= card.fireRateMul;
  if (card.speedMul) playerStats.speedMul *= card.speedMul;
  if (card.sprintMul) playerStats.sprintMul *= card.sprintMul;
  if (card.maxHpAdd) {
    playerStats.maxHp += card.maxHpAdd;
    if (card.maxHpAdd > 0) playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + card.maxHpAdd);
  }
  if (card.shieldAdd) {
    playerStats.maxShield += card.shieldAdd;
    playerStats.shield = Math.min(playerStats.maxShield, playerStats.shield + card.shieldAdd);
  }
  if (card.ammoMaxAdd) {
    playerStats.maxAmmo += card.ammoMaxAdd;
    playerStats.ammo = playerStats.maxAmmo;
  }
  if (card.hpRegenPerSec) playerStats.hpRegenPerSec += card.hpRegenPerSec;
  if (card.shieldRegenPerSec) playerStats.shieldRegenPerSec += card.shieldRegenPerSec;
  if (card.reloadMul) playerStats.reloadMul *= card.reloadMul;
  if (card.dashCdMul) playerStats.dashCdMul *= card.dashCdMul;
  if (card.damageReduction) playerStats.damageReduction = Math.min(0.9, playerStats.damageReduction + card.damageReduction);
  if (card.pierce) playerStats.pierce += card.pierce;
  if (card.multishot) playerStats.multishot += card.multishot;
  if (card.explosive) playerStats.explosive = true;
  if (card.lifesteal) playerStats.lifesteal = Math.min(1, playerStats.lifesteal + card.lifesteal);
  if (card.critChance) playerStats.critChance = Math.min(1, playerStats.critChance + card.critChance);
  if (card.critMul) playerStats.critMul *= card.critMul;
  if (card.bounce) playerStats.bounce = Math.max(playerStats.bounce, card.bounce);
  if (card.executeThreshold) playerStats.executeThreshold = card.executeThreshold;
  if (card.revives) playerStats.revives += card.revives;
  if (card.invulnPeriodic) playerStats.invulnPeriodic = card.invulnPeriodic;
  if (card.invulnPeriodic) playerStats.invulnT = card.invulnPeriodic;
  if (card.bossDamageMul) playerStats.bossDamageMul = (playerStats.bossDamageMul || 1) * card.bossDamageMul;
  if (card.aegis) playerStats.aegis = true;
  if (card.dashExcalibur) playerStats.dashExcalibur = true;
  if (card.dashFireTrail) playerStats.dashFireTrail = true;
  if (card.dashDamageMul) playerStats.dashDamageMul = (playerStats.dashDamageMul || 1) * card.dashDamageMul;
  if (card.fireDoT) playerStats.fireDoT = true;
  if (card.slowEnemies) playerStats.slowEnemies = true;
  if (card.poisonPools) playerStats.poisonPools = true;
  if (card.nightVision) playerStats.nightVision = true;
  if (card.pickupMagnet) playerStats.pickupMagnet = true;
  if (card.tracker) playerStats.tracker = true;
  if (card.critChanceBonus) playerStats.critChance = Math.min(1, playerStats.critChance + card.critChanceBonus);
  if (card.frenzy) playerStats.frenzy = true;
  if (card.chaosDamage) playerStats.chaosDamage = true;
  if (card.sanguePorSangue) playerStats.sanguePorSangue = true;
  if (card.explosiveKills) playerStats.explosiveKills = true;
  if (card.weaponUnlockId) {
    if (!playerStats.unlockedWeapons) playerStats.unlockedWeapons = [];
    if (!playerStats.unlockedWeapons.includes(card.weaponUnlockId)) {
      playerStats.unlockedWeapons.push(card.weaponUnlockId);
    }
    // trocar para a arma nova imediatamente
    applyWeapon(card.weaponUnlockId);
  }
  if (card.lowHpDamageMul) playerStats.lowHpDamageMul = card.lowHpDamageMul;
  // fechar tela
  document.getElementById('cardScreen').classList.add('hidden');
  // voltar ao jogo
  GAME.state = 'playing';
  setTimeout(() => {
    GAME.pointerLockGrace = false;
    requestPointerLock();
  }, 200);
}

function resetCardStats() {
  // resetar todos os stats de cartas
  playerStats.damageMul = 1.0;
  playerStats.fireRateMul = 1.0;
  playerStats.speedMul = 1.0;
  playerStats.sprintMul = 1.55;
  playerStats.maxHp = 100;
  playerStats.maxShield = 50;
  playerStats.shield = 0;
  playerStats.maxAmmo = 30;
  playerStats.hpRegenPerSec = 0;
  playerStats.shieldRegenPerSec = 0;
  playerStats.reloadMul = 1.0;
  playerStats.dashCdMul = 1.0;
  playerStats.damageReduction = 0;
  playerStats.pierce = 0;
  playerStats.multishot = 0;
  playerStats.explosive = false;
  playerStats.lifesteal = 0;
  playerStats.critChance = 0;
  playerStats.critMul = 1.5;
  playerStats.bounce = 0;
  playerStats.executeThreshold = 0;
  playerStats.revives = 0;
  playerStats.invulnPeriodic = 0;
  playerStats.bossDamageMul = 1;
  playerStats.aegis = false;
  playerStats.dashExcalibur = false;
  playerStats.dashFireTrail = false;
  playerStats.dashDamageMul = 1;
  playerStats.fireDoT = false;
  playerStats.slowEnemies = false;
  playerStats.poisonPools = false;
  playerStats.nightVision = false;
  playerStats.pickupMagnet = false;
  playerStats.tracker = false;
  playerStats.frenzy = false;
  playerStats.frenzyKills = 0;
  playerStats.frenzyT = 0;
  playerStats.chaosDamage = false;
  playerStats.sanguePorSangue = false;
  playerStats.explosiveKills = false;
  playerStats.lowHpDamageMul = 0;
  GAME.cardsApplied = [];
}

function updateHUD() {
  document.getElementById('hpText').textContent = Math.round(playerStats.hp);
  document.getElementById('hpBar').style.width = (playerStats.hp / playerStats.maxHp * 100) + '%';
  document.getElementById('shText').textContent = Math.round(playerStats.shield);
  document.getElementById('shBar').style.width = (playerStats.shield / playerStats.maxShield * 100) + '%';
  document.getElementById('ammoText').textContent = playerStats.ammo;
  document.getElementById('ammoMaxText').textContent = playerStats.maxAmmo;
  document.getElementById('reloadText').textContent = playerStats.reloading ? Math.ceil(playerStats.reloadT) + 's' : 'R';
  document.getElementById('scoreText').textContent = GAME.score;
  document.getElementById('multiText').textContent = 'x' + GAME.multiplier.toFixed(1);
  document.getElementById('waveText').textContent = GAME.wave;
  document.getElementById('enemiesText').textContent = GAME.enemies.length;
  document.getElementById('fpsText').textContent = GAME.fps;
  // card countdown display
  const cd = document.getElementById('cardCountdown');
  if (cd) {
    if (GAME.cardCountdownActive && GAME.state === 'playing') {
      cd.classList.add('show');
      const t = Math.max(0, Math.ceil(GAME.cardCountdown));
      const tEl = document.getElementById('cardCountdownT');
      const bEl = document.getElementById('cardCountdownBar');
      if (tEl) tEl.textContent = t;
      if (bEl) bEl.style.width = (GAME.cardCountdown / 3 * 100) + '%';
    } else {
      cd.classList.remove('show');
    }
  }
}

// ----- Render loop -----
// Perf: shared scratch Vector3s for the camera math. The render loop
// previously allocated back, right, and camTargetPos every frame —
// 3 more allocations/frame, ~180/sec wasted on GC.
const back = new THREE.Vector3();
const camRight = new THREE.Vector3();
const camTargetPos = new THREE.Vector3();
function loop() {
  const now = performance.now();
  let dt = (now - lastT) / 1000;
  lastT = now;
  if (dt > 0.1) dt = 0.1;

  update(dt);

// Camera over-the-shoulder (God of War / RE4 style) — bem deslocada para o ombro direito
  // para deixar o jogador no canto da tela e o crosshair livre no centro
  // Mobile cam: pull back further and raise higher so more arena is visible
  // (the joystick area + larger HUD takes a chunk of the screen on phones).
  const _isMobileCam = !!(typeof window !== 'undefined' && window.__NATIVE__);
  const camDist = _isMobileCam ? 5.4 : 4.0;
  const camBaseHeight = _isMobileCam ? 2.6 : 2.2;
  const shoulderOffset = 1.2;   // lateral média
  const verticalLift = 0.40;    //俯瞰 para ver bem a cena

  // Perf: reuse module-scoped Vector3s instead of allocating per frame.
  back.set(Math.sin(GAME.yaw), 0, Math.cos(GAME.yaw));
  camRight.set(Math.cos(GAME.yaw), 0, -Math.sin(GAME.yaw));

  // pitch afeta a altura da câmera (mouse para baixo = câmera sobe)
  const pitchLift = -GAME.pitch * 1.0 + verticalLift;
  // leve sway no sprint
  const isSprinting = GAME.keys['ShiftLeft'] || GAME.keys['ShiftRight'];
  const sway = isSprinting ? Math.sin(now * 0.012) * 0.05 : 0;

  const camY = GAME.player.position.y + camBaseHeight + pitchLift;
  camTargetPos.set(
    GAME.player.position.x + back.x * camDist + camRight.x * (shoulderOffset + sway),
    camY,
    GAME.player.position.z + back.z * camDist + camRight.z * (shoulderOffset + sway)
  );

  // FOV dinâmico: abre no sprint (sensação de velocidade).
  // Mobile cap is tighter to avoid fisheye distortion on small screens.
  const fovBase = _isMobileCam ? 62 : 65;
  const fovTarget = fovBase + (isSprinting ? (_isMobileCam ? 5 : 10) : 0) + (playerStats.dashTimer > 0 ? (_isMobileCam ? 3 : 7) : 0);
  camera.fov += (fovTarget - camera.fov) * 0.12;
  camera.updateProjectionMatrix();

  // suavização da posição (mais responsivo, menos atraso)
  if (!GAME._camInit) {
    camera.position.copy(camTargetPos);
    GAME._camInit = true;
  } else {
    camera.position.lerp(camTargetPos, 0.35);
  }

  // olhar à frente do jogador, na direção da mira
  // (yaw=0 → câmera em +Z, olhar para -Z onde está a cena)
  const lookAhead = new THREE.Vector3(
    -Math.sin(GAME.yaw) * Math.cos(GAME.pitch),
    Math.sin(GAME.pitch) * 0.85,
    -Math.cos(GAME.yaw) * Math.cos(GAME.pitch)
  );
  // offset lateral no lookAt: como a câmera está à direita do jogador, o ponto
  // focado também se desloca para a direita — isso mantém o CROSSHAIR centralizado
  // enquanto o jogador aparece deslocado para o canto esquerdo da tela
  const lookSideOffset = new THREE.Vector3(
    right.x * (shoulderOffset * 0.4),
    0,
    right.z * (shoulderOffset * 0.4)
  );
  const lookTarget = new THREE.Vector3(
    GAME.player.position.x + lookAhead.x * 5 + lookSideOffset.x,
    GAME.player.position.y + 1.55 + lookAhead.y * 5,
    GAME.player.position.z + lookAhead.z * 5 + lookSideOffset.z
  );
  // suavizar o lookAt também
  if (!GAME._camLookAt) GAME._camLookAt = lookTarget.clone();
  if (!GAME._camInit) {
    GAME._camLookAt.copy(lookTarget);
  } else {
    GAME._camLookAt.lerp(lookTarget, 0.40);
  }
  camera.lookAt(GAME._camLookAt);

  // sky shader time
  if (sky.userData.shader) sky.userData.shader.uniforms.uTime.value = now * 0.001;

  // lamp flicker
  for (const lp of GAME.lampPosts) {
    if (lp.isAntenna) continue;
    const t = now * 0.001;
    const f = 0.9 + Math.sin(t * 4 + lp.pos.x) * 0.05 + Math.sin(t * 7 + lp.pos.z) * 0.04;
    if (lp.light) lp.light.intensity = 1.2 * f;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Prevent context menu on right click
window.addEventListener('contextmenu', (e) => e.preventDefault());

// Expose state for testing/debugging
window.GAME = GAME;
window.playerStats = playerStats;
window.camera = camera;

loop();
`;
