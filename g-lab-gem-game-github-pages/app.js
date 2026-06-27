// g-Lab Gem Game v89 — complete flower asset sync
(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestScoreEl = document.getElementById('bestScore');
  const currentGemEl = document.getElementById('currentGem');
  const nextGemEl = document.getElementById('nextGem');
  const dropGuide = document.getElementById('dropGuide');
  const dropBtn = document.getElementById('dropBtn');
  const bgmBtn = document.getElementById('bgmBtn'); // removed in v10
  const soundBtn = document.getElementById('soundBtn'); // removed in v10
  const restartBtn = document.getElementById('restartBtn');
  const difficultyButtons = [...document.querySelectorAll('.difficulty-btn')];
  const gameOverPanel = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const legend = document.getElementById('legend');
  const tapHint = document.getElementById('tapHint');

  const currentGemIcon = document.getElementById('currentGemIcon');
  const nextGemIcon = document.getElementById('nextGemIcon');

  const logoBg = new Image();
  logoBg.src = 'assets/g-lab-logo.jpg';
  let logoBgReady = false;
  logoBg.onload = () => { logoBgReady = true; };

  const boardBg = new Image();
  boardBg.src = 'assets/board-bg-v89.png?v=89';
  let boardBgReady = false;
  boardBg.onload = () => { boardBgReady = true; };

  const gems = [
    { name:'ガーネット', short:'Ga', color:'#8e183a', dark:'#2b0615', shine:'#ffd4df', accent:'#e34369', value:1, radius:14, density:1.30, cut:'roseRound', sides:12, transparency:.64 },
    { name:'アメシスト', short:'Am', color:'#7b37c9', dark:'#250647', shine:'#efe0ff', accent:'#b57cff', value:3, radius:20, density:1.20, cut:'oval', sides:14, transparency:.68 },
    { name:'アクアマリン', short:'Aq', color:'#6fd8ed', dark:'#0e6382', shine:'#f2feff', accent:'#9cf5ff', value:6, radius:28, density:1.10, cut:'cushion', sides:12, transparency:.74 },
    { name:'ダイヤモンド', short:'Di', color:'#dff7ff', dark:'#9cd8ed', shine:'#ffffff', accent:'#bff6ff', value:10, radius:37, density:1.00, cut:'diamond', sides:8, transparency:.82 },
    { name:'エメラルド', short:'Em', color:'#05895f', dark:'#03341f', shine:'#baf7d4', accent:'#24c987', value:15, radius:47, density:.90, cut:'emerald', sides:8, transparency:.70 },
    { name:'真珠', short:'Pe', color:'#fff0f0', dark:'#bba2a4', shine:'#ffffff', accent:'#ffe8f5', value:21, radius:58, density:.80, cut:'pearl', sides:18, transparency:.50 },
    { name:'ルビー', short:'Ru', color:'#c71941', dark:'#460715', shine:'#ffd3dd', accent:'#ff5b82', value:28, radius:70, density:.70, cut:'roseRound', sides:14, transparency:.67 },
    { name:'ペリドット', short:'Pr', color:'#9bcc22', dark:'#3d5b0c', shine:'#f7ffd1', accent:'#d4ff62', value:36, radius:83, density:.61, cut:'oval', sides:14, transparency:.70 },
    { name:'サファイア', short:'Sa', color:'#1246b8', dark:'#061441', shine:'#d8e6ff', accent:'#3e84ff', value:45, radius:97, density:.53, cut:'oval', sides:12, transparency:.69 },
    { name:'オパール', short:'Pt', color:'#ed5bb0', dark:'#60123b', shine:'#ffe1f2', accent:'#ff91ca', value:55, radius:112, density:.46, cut:'tourmaline', sides:10, transparency:.68 },
    { name:'トパーズ', short:'To', color:'#f2c24b', dark:'#8c5710', shine:'#fff5bd', accent:'#ffd86a', value:66, radius:128, density:.40, cut:'emerald', sides:8, transparency:.66 },
    { name:'トルコ石', short:'Tu', color:'#35c5c5', dark:'#11606b', shine:'#bffffa', accent:'#74fff0', value:78, radius:145, density:.35, cut:'turquoise', sides:18, transparency:.45 },
    { name:'ダイヤモンドの指輪', short:'Ring', color:'#f7d77a', dark:'#7a4a12', shine:'#fff3bc', accent:'#ffffff', value:100, radius:164, density:.30, cut:'ring', sides:18, transparency:.80 }
  ];

  const gemImagePaths = [
    'assets/gem-assets/00-garnet.png',
    'assets/gem-assets/01-amethyst.png',
    'assets/gem-assets/02-aquamarine.png',
    'assets/gem-assets/03-diamond.png',
    'assets/gem-assets/04-emerald.png',
    'assets/gem-assets/05-pearl.png',
    'assets/gem-assets/06-ruby.png',
    'assets/gem-assets/07-peridot.png',
    'assets/gem-assets/08-sapphire.png',
    'assets/gem-assets/09-opal.png',
    'assets/gem-assets/10-topaz.png',
    'assets/gem-assets/11-turquoise.png',
    'assets/gem-assets/12-final-ring.png'
  ];

  const gemImages = gemImagePaths.map(src => {
    const image = new Image();
    image.src = src;
    return image;
  });


  // Hard mode only: flowers fall as seeds, bloom after their first landing, and never merge.
  // Current flower set: 梅 / 芍薬 / 菊 / 牡丹 / 斑入り牡丹. They appear only in hard mode.
  // 梅 uses the Aquamarine size level and remains 12% smaller.
  // 芍薬 = Diamond size, 菊 = Emerald size, 牡丹 = Pearl size, 斑入り牡丹 = 牡丹と同サイズ.
  const flowers = [
    { name:'梅',         sizeLevel:2, scale:0.88, seed:'#d7a8ad', seedDark:'#7a5054', petal:'#fff3f2', src:'assets/flower-assets/ume-v89.png?v=89' },
    { name:'芍薬',       sizeLevel:3, scale:1,    seed:'#d9c7b0', seedDark:'#8f7a60', petal:'#fffaf0', src:'assets/flower-assets/shakuyaku-v89.png?v=89' },
    { name:'菊',         sizeLevel:4, scale:1,    seed:'#d6a426', seedDark:'#74520d', petal:'#ffe08a', src:'assets/flower-assets/kiku-v89.png?v=89' },
    { name:'牡丹',       sizeLevel:5, scale:1,    seed:'#9d2b39', seedDark:'#4a0f18', petal:'#e34d57', src:'assets/flower-assets/botan-v89.png?v=89' },
    { name:'斑入り牡丹', sizeLevel:5, scale:1,    seed:'#d06374', seedDark:'#6a1e2f', petal:'#f36d86', src:'assets/flower-assets/botan-variegated-v89.png?v=89' }
  ];

  const flowerImages = flowers.map(flower => {
    const image = new Image();
    image.src = flower.src;
    return image;
  });

  // Hard-mode flowers are permanent obstacles only.
  const COMBO_WINDOW_MS = 1500;

  const state = {
    w: 0,
    h: 0,
    dpr: 1,
    balls: [],
    particles: [],
    fireworks: [],
    score: 0,
    comboCount: 0,
    comboLastAt: 0,
    best: Number(localStorage.getItem('glabGemBest') || 0),
    current: 0,
    next: 1,
    dropX: 0,
    canDrop: true,
    gameOver: false,
    lastTime: performance.now(),
    dangerLine: 106,
    spawnY: 56,
    idCounter: 0,
    soundEnabled: true,
    bgmEnabled: true,
    audio: null,
    bgm: null,
    pointerDown: false,
    moves: 0,
    difficulty: 'normal'
  };

  const physics = {
    gravity: 1750,
    wallBounce: 0.30,
    ballBounce: 0.075,
    friction: 0.988,
    floorFriction: 0.90,
    iterations: 5,
    // Easy mode: stones may overlap slightly more, creating extra packing room.
    overlapFactor: 0.84
  };

  gemImages.forEach(image => {
    image.onload = () => {
      renderGemIcon(currentGemIcon, state.current);
      renderGemIcon(nextGemIcon, state.next);
    };
  });

  flowerImages.forEach(image => {
    image.onload = () => { /* canvas loop will render the finished flower automatically */ };
  });

  const difficultyOptions = {
    easy: {
      // Easy: Garnet, Amethyst and Aquamarine do not appear.
      // Drops begin at Diamond and remain weighted toward the smaller eligible gems.
      bag: [3,3,3,3,4,4,5],
      sizeScale: 1,
      overlapFactor: 0.84,
      gameOverGraceMs: 3500
    },
    normal: {
      // Default: preserve the current normal balance.
      bag: [0,0,0,0,0,1,1,1,2,2],
      sizeScale: 1,
      overlapFactor: 0.84,
      gameOverGraceMs: 3500
    },
    hard: {
      // Hard: identical to normal except that rare permanent flower obstacles can appear (5花種).
      bag: [0,0,0,0,0,1,1,1,2,2],
      sizeScale: 1,
      overlapFactor: 0.84,
      gameOverGraceMs: 3500,
      flowerChance: 1 / 30
    }
  };

  function currentDifficultyOption() {
    return difficultyOptions[state.difficulty] || difficultyOptions.normal;
  }

  function randomStartLevel() {
    const bag = currentDifficultyOption().bag;
    return bag[Math.floor(Math.random() * bag.length)];
  }


  function randomFlowerIndex() {
    const option = currentDifficultyOption();
    if (state.difficulty !== 'hard' || !option.flowerChance) return -1;
    return Math.random() < option.flowerChance ? Math.floor(Math.random() * flowers.length) : -1;
  }

  function flowerRadius(flowerIndex) {
    const flower = flowers[flowerIndex];
    const scale = typeof flower.scale === 'number' ? flower.scale : 1;
    return gemRadius(flower.sizeLevel) * 1.2 * scale;
  }

  function massForRadius(radius, density = 1) {
    return Math.max(0.18, density * Math.pow(radius / 22, 1.10));
  }

  function updateDifficultyButtons() {
    difficultyButtons.forEach(button => {
      const active = button.dataset.difficulty === state.difficulty;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setDifficulty(difficulty) {
    if (!difficultyOptions[difficulty]) return;
    state.difficulty = difficulty;
    reset();
  }

  function initLegend() {
    legend.innerHTML = gems.map((g, i) => `<div class="chip"><span class="swatch" style="background:radial-gradient(circle at 30% 22%,#ffffff 0 12%,${g.shine} 14%,${g.color} 48%,${g.dark} 100%); box-shadow: inset -2px -2px 4px rgba(0,0,0,.28), inset 2px 2px 3px rgba(255,255,255,.55), 0 1px 4px rgba(0,0,0,.22);"></span>${i + 1}. ${g.name}</div>`).join('');
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    state.w = Math.max(300, Math.floor(rect.width));
    state.h = Math.max(430, Math.floor(rect.height));
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    // The dashed DANGER LINE now sits directly under the board ceiling.
    // Touching it is the game-over condition.
    state.dangerLine = 20;
    state.spawnY = Math.max(48, Math.round(state.dangerLine * 0.48));
    state.dropX = state.dropX || state.w / 2;
    updateGuide();
    renderGemIcon(currentGemIcon, state.current);
    renderGemIcon(nextGemIcon, state.next);
  }

  function gemRadius(level) {
    const maxBaseRadius = gems[gems.length - 1].radius;
    const maxAllowed = Math.max(104, (state.w - 34) / 2);
    const scale = Math.min(1, maxAllowed / maxBaseRadius);
    const easyScale = 0.96;
    // Diamond (4th) and later remain smaller for the current balanced mode.
    const diamondAndLaterScale = level >= 3 ? 0.95 : 1;
    // Emerald (5th) and later keep the additional 5% reduction.
    const lateGemScale = level >= 4 ? 0.95 : 1;
    const difficultyScale = currentDifficultyOption().sizeScale || 1;
    return Math.round(gems[level].radius * scale * easyScale * diamondAndLaterScale * lateGemScale * difficultyScale);
  }

  function clampDropX(x) {
    const r = gemRadius(state.current);
    return Math.max(16 + r, Math.min(state.w - 16 - r, x));
  }

  function updateGuide() {
    const x = clampDropX(state.dropX || state.w / 2);
    dropGuide.style.left = `${x}px`;
  }

  function updateHud() {
    scoreEl.textContent = state.score.toLocaleString('ja-JP');
    bestScoreEl.textContent = state.best.toLocaleString('ja-JP');
    currentGemEl.textContent = gems[state.current].name;
    nextGemEl.textContent = gems[state.next].name;
    renderGemIcon(currentGemIcon, state.current);
    renderGemIcon(nextGemIcon, state.next);
    state.bgmEnabled = true;
    state.soundEnabled = true;
    if (bgmBtn) {
      bgmBtn.textContent = 'BGM ON';
      bgmBtn.setAttribute('aria-pressed', 'true');
    }
    if (soundBtn) {
      soundBtn.textContent = '効果音 ON';
      soundBtn.setAttribute('aria-pressed', 'true');
    }
  }

  function newBall(level, x, y, opts = {}) {
    const g = gems[level];
    const r = gemRadius(level);
    return {
      id: ++state.idCounter,
      kind: 'gem',
      level,
      x,
      y,
      r,
      density: g.density || 1,
      mass: massForRadius(r, g.density || 1),
      vx: opts.vx || 0,
      vy: opts.vy || 0,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.55,
      born: performance.now(),
      merging: false,
      settledAboveSince: null,
      ceilingHalfSince: null,
      squash: 0
    };
  }

  function newFlowerBall(flowerIndex, x, y, opts = {}) {
    const targetR = flowerRadius(flowerIndex);
    const seedR = Math.max(6, Math.round(targetR * 0.30));
    const density = 0.96;
    return {
      id: ++state.idCounter,
      kind: 'flower',
      flowerIndex,
      x,
      y,
      r: seedR,
      seedR,
      targetR,
      density,
      mass: massForRadius(seedR, density),
      vx: opts.vx || 0,
      vy: opts.vy || 0,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.10,
      born: performance.now(),
      merging: false,
      settledAboveSince: null,
      ceilingHalfSince: null,
      squash: 0,
      isSeed: true,
      blooming: false,
      bloomStart: 0,
      bloom: 0
    };
  }

  function bloomFlower(flower, now = performance.now()) {
    if (!flower || flower.kind !== 'flower' || !flower.isSeed || flower.blooming) return;
    flower.blooming = true;
    flower.bloomStart = now;
    flower.vr *= 0.42;
    spawnParticles(flower.x, flower.y, flowers[flower.flowerIndex].petal, 7);
    playTone('bloom');
  }

  function stepFlowerBloom(flower, now) {
    if (!flower || flower.kind !== 'flower' || !flower.blooming) return;
    const t = Math.min(1, Math.max(0, (now - flower.bloomStart) / 620));
    const eased = 1 - Math.pow(1 - t, 3);
    flower.bloom = eased;
    flower.r = flower.seedR + (flower.targetR - flower.seedR) * eased;
    flower.mass = massForRadius(flower.r, flower.density || 1);
    if (t >= 1) {
      flower.blooming = false;
      flower.isSeed = false;
      flower.bloom = 1;
      flower.r = flower.targetR;
      flower.mass = massForRadius(flower.r, flower.density || 1);
    }
  }

  function ensureAudio() {
    if (!state.audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      state.audio = new AudioContext();
    }
    if (state.audio.state === 'suspended') state.audio.resume();
    return state.audio;
  }



  function startBgm() {
    if (!state.bgmEnabled || state.bgm) return;
    const audio = ensureAudio();
    if (!audio) return;

    const master = audio.createGain();
    const reverbDelay = audio.createDelay(0.75);
    const reverbFeedback = audio.createGain();
    const reverbFilter = audio.createBiquadFilter();
    const softFilter = audio.createBiquadFilter();

    master.gain.setValueAtTime(0.0001, audio.currentTime);
    master.gain.exponentialRampToValueAtTime(0.36, audio.currentTime + 1.1);

    reverbDelay.delayTime.value = 0.34;
    reverbFeedback.gain.value = 0.22;
    reverbFilter.type = 'lowpass';
    reverbFilter.frequency.value = 3600;

    softFilter.type = 'lowpass';
    softFilter.frequency.value = 5200;

    reverbDelay.connect(reverbFeedback);
    reverbFeedback.connect(reverbDelay);
    reverbDelay.connect(reverbFilter);
    reverbFilter.connect(master);
    softFilter.connect(master);
    master.connect(audio.destination);

    // Classical / luxury feeling: slow baroque-like chord progression.
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C
      [220.00, 261.63, 329.63, 440.00], // Am
      [196.00, 246.94, 293.66, 392.00], // G / D feel
      [174.61, 220.00, 261.63, 349.23], // F
      [196.00, 261.63, 329.63, 392.00], // C/G
      [220.00, 277.18, 329.63, 440.00], // A minor color
      [246.94, 293.66, 392.00, 493.88], // G
      [261.63, 329.63, 392.00, 523.25]  // C
    ];
    const melody = [659.25, 783.99, 880.00, 783.99, 698.46, 659.25, 587.33, 659.25, 783.99, 1046.50, 987.77, 783.99];

    let step = 0;
    const nodes = [];

    function bell(freq, dur, gainValue, destination, delayTime = 0, type = 'triangle') {
      if (!state.bgm || !state.bgmEnabled) return;
      const t = audio.currentTime + delayTime;
      const osc = audio.createOscillator();
      const overtone = audio.createOscillator();
      const g = audio.createGain();
      const og = audio.createGain();

      osc.type = type;
      overtone.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      overtone.frequency.setValueAtTime(freq * 2.01, t);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gainValue, t + 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(gainValue * 0.22, t + 0.025);
      og.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.55);

      osc.connect(g);
      overtone.connect(og);
      g.connect(destination);
      og.connect(destination);

      osc.start(t); overtone.start(t);
      osc.stop(t + dur + 0.06); overtone.stop(t + dur + 0.04);
      nodes.push(osc, overtone, g, og);
    }

    function tick() {
      if (!state.bgm || !state.bgmEnabled) return;

      const chord = chords[Math.floor(step / 8) % chords.length];
      const idx = step % 8;

      // Harp-like arpeggio
      const note = chord[idx % chord.length] * (idx > 3 ? 2 : 1);
      bell(note, 1.10, 0.022, softFilter, 0, idx % 2 ? 'sine' : 'triangle');
      bell(note * 2, 0.55, 0.0065, reverbDelay, 0.02, 'sine');

      // Gentle bass every half measure
      if (idx === 0 || idx === 4) {
        bell(chord[0] * 0.5, 1.85, 0.026, softFilter, 0.01, 'sine');
      }

      // Elegant high melody, less frequent
      if (step % 6 === 0) {
        const m = melody[Math.floor(step / 6) % melody.length];
        bell(m, 1.25, 0.016, reverbDelay, 0.03, 'sine');
      }

      step++;
    }

    tick();
    const interval = setInterval(tick, 430);
    state.bgm = { master, interval, nodes };
  }


  function stopBgm() {
    if (!state.bgm) return;
    const bgm = state.bgm;
    state.bgm = null;
    clearInterval(bgm.timer);
    try {
      bgm.master.gain.exponentialRampToValueAtTime(0.0001, state.audio.currentTime + 0.35);
      setTimeout(() => { try { bgm.master.disconnect(); } catch (_) {} }, 420);
    } catch (_) {}
  }

  function syncBgm() {
    if (state.bgmEnabled) startBgm(); else stopBgm();
  }

  function playTone(kind, level = 0) {
    if (!state.soundEnabled) return;
    const audio = ensureAudio();
    if (!audio) return;

    const now = audio.currentTime;

    const dry = audio.createGain();
    const shimmerDelay = audio.createDelay(0.42);
    const shimmerFeedback = audio.createGain();
    const highPass = audio.createBiquadFilter();
    const sparkleFilter = audio.createBiquadFilter();

    dry.gain.value = 0.52;

    shimmerDelay.delayTime.value = 0.095;
    shimmerFeedback.gain.value = 0.22;

    highPass.type = 'highpass';
    highPass.frequency.value = 1100;

    sparkleFilter.type = 'bandpass';
    sparkleFilter.frequency.value = 3600;
    sparkleFilter.Q.value = 1.4;

    shimmerDelay.connect(shimmerFeedback);
    shimmerFeedback.connect(shimmerDelay);
    shimmerDelay.connect(highPass);
    highPass.connect(sparkleFilter);
    sparkleFilter.connect(audio.destination);
    dry.connect(audio.destination);

    function bell(freq, offset, dur, gainValue, type = 'sine', detune = 0) {
      const t = now + offset;
      const osc = audio.createOscillator();
      const over = audio.createOscillator();
      const g = audio.createGain();
      const og = audio.createGain();

      osc.type = type;
      over.type = 'sine';

      osc.frequency.setValueAtTime(freq, t);
      over.frequency.setValueAtTime(freq * 2.01, t);
      osc.detune.setValueAtTime(detune, t);
      over.detune.setValueAtTime(detune * 0.35, t);

      // Fast attack, elegant long sparkle tail.
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gainValue, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(gainValue * 0.30, t + 0.003);
      og.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.48);

      osc.connect(g);
      over.connect(og);

      g.connect(dry);
      og.connect(dry);
      g.connect(shimmerDelay);
      og.connect(shimmerDelay);

      osc.start(t);
      over.start(t);
      osc.stop(t + dur + 0.03);
      over.stop(t + dur * 0.55 + 0.03);
    }

    function starSweep(baseFreq, offset, gainValue) {
      // Fine crystal-like shimmer made from tiny high notes.
      const steps = [1, 1.26, 1.5, 2, 2.52, 3];
      steps.forEach((m, i) => {
        bell(baseFreq * m, offset + i * 0.018, 0.16 - i * 0.010, gainValue * (1 - i * 0.10), i % 2 ? 'triangle' : 'sine', (i - 2) * 4);
      });
    }

    if (kind === 'drop') {
      // 宝石が落ちた瞬間の「キラッ」
      starSweep(987.77, 0.000, 0.035);
      bell(3520.00, 0.045, 0.11, 0.018, 'sine');
    } else if (kind === 'merge') {
      // 合体時は「キラキラキラッ」と上に抜ける輝き
      const lift = Math.min(level, 12) * 22;
      starSweep(880.00 + lift, 0.000, 0.040);
      starSweep(1174.66 + lift, 0.070, 0.030);
      bell(4186.00 + lift, 0.155, 0.15, 0.020, 'sine');

      // 高レベルほど少し華やかに
      if (level >= 8) {
        bell(2637.02 + lift, 0.050, 0.22, 0.024, 'triangle');
        bell(5274.04 + lift, 0.115, 0.13, 0.014, 'sine');
      }
      if (level >= gems.length - 1) {
        // 最終リング完成時は、花火に合う豪華なグリッサンド風
        starSweep(1318.51, 0.000, 0.050);
        starSweep(1760.00, 0.115, 0.040);
        bell(4698.64, 0.245, 0.22, 0.026, 'sine');
      }
    } else if (kind === 'bloom') {
      // Seed opening: a short, warm harp-like "poron".
      bell(523.25, 0.000, 0.34, 0.040, 'triangle');
      bell(659.25, 0.075, 0.40, 0.034, 'sine');
      bell(783.99, 0.145, 0.46, 0.028, 'sine');
      bell(1046.50, 0.235, 0.42, 0.019, 'triangle');
    } else if (kind === 'gameover') {
      // 終了音は落ち着いたチャイムにしつつ、暗すぎない響き
      bell(783.99, 0.000, 0.36, 0.040, 'triangle');
      bell(659.25, 0.090, 0.42, 0.030, 'sine');
      bell(523.25, 0.180, 0.52, 0.022, 'sine');
      bell(1046.50, 0.260, 0.22, 0.014, 'sine');
    }

    setTimeout(() => {
      try {
        dry.disconnect();
        shimmerDelay.disconnect();
        shimmerFeedback.disconnect();
        highPass.disconnect();
        sparkleFilter.disconnect();
      } catch {}
    }, 1200);
  }


  function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 60,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.7,
        size: 2 + Math.random() * 4,
        color
      });
    }
  }


  function launchCelebrationFireworks() {
    const colors = ['#ffd978', '#ff7ac8', '#7fd6ff', '#8bff9e', '#ffffff', '#ff8a6e'];
    const bursts = [
      [state.w * 0.22, state.h * 0.22, 48],
      [state.w * 0.50, state.h * 0.16, 62],
      [state.w * 0.78, state.h * 0.23, 50],
      [state.w * 0.36, state.h * 0.30, 40],
      [state.w * 0.66, state.h * 0.31, 40]
    ];
    for (const [x, y, count] of bursts) {
      spawnFireworkBurst(x, y, count, colors[Math.floor(Math.random() * colors.length)]);
    }
  }

  function spawnFireworkBurst(x, y, count = 48, mainColor = '#ffd978') {
    const colorPool = [mainColor, '#ffffff', '#ffd978', '#7fd6ff', '#ff7ac8', '#8bff9e'];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.08;
      const speed = 60 + Math.random() * 260;
      const color = colorPool[Math.floor(Math.random() * colorPool.length)];
      state.fireworks.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 1.0 + Math.random() * 0.55,
        maxLife: 1.4 + Math.random() * 0.25,
        size: 1.8 + Math.random() * 3.8,
        color,
        glow: 12 + Math.random() * 16,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  function stepFireworks(dt) {
    for (const f of state.fireworks) {
      f.vy += 28 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vx *= 0.992;
      f.vy *= 0.992;
      f.life -= dt;
    }
    state.fireworks = state.fireworks.filter(f => f.life > 0);
  }

  function drop() {
    if (!state.canDrop || state.gameOver) return;
    ensureAudio();
    syncBgm();
    const level = state.current;
    const x = clampDropX(state.dropX || state.w / 2);
    const flowerIndex = randomFlowerIndex();

    if (flowerIndex >= 0) {
      const seedR = Math.max(6, Math.round(flowerRadius(flowerIndex) * 0.30));
      state.balls.push(newFlowerBall(flowerIndex, x, state.spawnY + seedR * 0.18, { vy: 34 }));
    } else {
      const r = gemRadius(level);
      state.balls.push(newBall(level, x, state.spawnY + r * 0.10, { vy: 34 }));
    }

    state.current = state.next;
    state.next = randomStartLevel();
    state.canDrop = false;
    state.moves++;
    if (state.moves > 1) tapHint.classList.add('hide');
    playTone('drop', level);
    setTimeout(() => { state.canDrop = !state.gameOver; }, 380);
    updateHud();
    updateGuide();
  }

  function reset() {
    state.bgmEnabled = true;
    state.soundEnabled = true;
    ensureAudio();
    syncBgm();
    state.balls = [];
    state.particles = [];
    state.fireworks = [];
    state.score = 0;
    state.comboCount = 0;
    state.comboLastAt = 0;
    state.current = randomStartLevel();
    state.next = randomStartLevel();
    state.dropX = state.w / 2;
    state.canDrop = true;
    state.gameOver = false;
    state.idCounter = 0;
    state.moves = 0;
    gameOverPanel.classList.remove('show');
    tapHint.classList.remove('hide');
    updateHud();
    updateDifficultyButtons();
    updateGuide();
  }

  function updateBest() {
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('glabGemBest', String(state.best));
    }
  }

  function comboMultiplierFor(count) {
    if (count >= 4) return 2;
    if (count === 3) return 1.5;
    if (count === 2) return 1.2;
    return 1;
  }

  function registerCombo(now) {
    if (state.comboLastAt && now - state.comboLastAt <= COMBO_WINDOW_MS) {
      state.comboCount += 1;
    } else {
      state.comboCount = 1;
    }
    state.comboLastAt = now;
    return {
      count: state.comboCount,
      multiplier: comboMultiplierFor(state.comboCount)
    };
  }

  function mergeBalls(a, b, now = performance.now()) {
    if (a.merging || b.merging || a.level !== b.level || a.level >= gems.length - 1) return false;
    a.merging = b.merging = true;
    const nx = (a.x + b.x) / 2;
    const ny = (a.y + b.y) / 2;
    const nvx = (a.vx + b.vx) * 0.22;
    const nextLevel = a.level + 1;
    const nvy = (a.vy + b.vy) * 0.15 - Math.max(52, 118 - nextLevel * 5);
    const mergedRadius = gemRadius(nextLevel);
    const combo = registerCombo(now);
    const baseScore = gems[nextLevel].value * 10;
    const comboScore = Math.round(baseScore * combo.multiplier);
    state.balls = state.balls.filter(ball => ball !== a && ball !== b);
    state.balls.push(newBall(nextLevel, nx, ny, { vx: nvx, vy: nvy }));
    state.score += comboScore;
    updateBest();

    spawnParticles(nx, ny, gems[nextLevel].accent, 8 + Math.min(nextLevel * 2, 22));
    if (nextLevel === gems.length - 1) {
      launchCelebrationFireworks();
      setTimeout(() => spawnFireworkBurst(state.w * 0.18, state.h * 0.20, 44, '#ffd978'), 120);
      setTimeout(() => spawnFireworkBurst(state.w * 0.82, state.h * 0.20, 44, '#ff7ac8'), 220);
      setTimeout(() => spawnFireworkBurst(state.w * 0.50, state.h * 0.14, 58, '#7fd6ff'), 340);
    }
    playTone('merge', nextLevel);
    updateHud();
    return true;
  }

  function stepParticles(dt) {
    for (const p of state.particles) {
      p.vy += 760 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter(p => p.life > 0);

  }

  function findMergePair(now) {
    const balls = state.balls;
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      if (!a || a.kind === 'flower' || a.merging || a.level >= gems.length - 1) continue;
      if (now - a.born < 60) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j];
        if (!b || b.kind === 'flower' || b.merging || a.level !== b.level) continue;
        if (now - b.born < 60) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const mergeDist = a.r + b.r + 5;
        if ((dx * dx + dy * dy) <= mergeDist * mergeDist) return [a, b];
      }
    }
    return null;
  }

  function step(dt) {
    const now = performance.now();
    const balls = state.balls;

    if (state.comboCount > 0 && now - state.comboLastAt > COMBO_WINDOW_MS) {
      state.comboCount = 0;
    }

    for (const b of balls) {
      b.vy += physics.gravity * (b.density || 1) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt;
      b.vx *= physics.friction;
      b.vy *= 0.999;
      b.squash *= 0.9;
      stepFlowerBloom(b, now);

      if (b.x - b.r < 13) {
        b.x = 13 + b.r;
        b.vx = Math.abs(b.vx) * physics.wallBounce;
        b.vr *= -0.7;
      }
      if (b.x + b.r > state.w - 13) {
        b.x = state.w - 13 - b.r;
        b.vx = -Math.abs(b.vx) * physics.wallBounce;
        b.vr *= -0.7;
      }
      if (b.y + b.r > state.h - 13) {
        b.y = state.h - 13 - b.r;
        if (b.kind === 'flower' && b.isSeed) bloomFlower(b, now);
        if (Math.abs(b.vy) > 180) b.squash = Math.min(0.12, Math.abs(b.vy) / 4200);
        b.vy = -Math.abs(b.vy) * physics.wallBounce;
        b.vx *= physics.floorFriction;
      }
    }

    // Merge first. This makes equal stones change immediately when they touch
    // and prevents too many pieces from accumulating and slowing the game down.
    const pair = findMergePair(now);
    if (pair) {
      mergeBalls(pair[0], pair[1], now);
      stepParticles(dt);
      checkGameOver(now);
      return;
    }

    for (let iter = 0; iter < physics.iterations; iter++) {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j];
          if (!a || !b || a.merging || b.merging) continue;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          // Hard mode now preserves the same packing room as normal; flowers alone add the extra challenge.

          const overlapFactor = currentDifficultyOption().overlapFactor ?? physics.overlapFactor ?? 1;

          const minDist = (a.r + b.r) * overlapFactor;
          let distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < minDist * minDist) {
            if (a.kind === 'flower' && a.isSeed) bloomFlower(a, now);
            if (b.kind === 'flower' && b.isSeed) bloomFlower(b, now);
            let dist = Math.sqrt(distSq);
            if (dist < 0.0001) {
              dist = 0.0001;
              dx = 0.0001;
              dy = 0;
            }
            const nx = dx / dist;
            const ny = dy / dist;
            const invMassA = 1 / (a.mass || 1);
            const invMassB = 1 / (b.mass || 1);
            const invMassSum = invMassA + invMassB;
            const overlap = (minDist - dist);
            a.x -= nx * overlap * (invMassA / invMassSum);
            a.y -= ny * overlap * (invMassA / invMassSum);
            b.x += nx * overlap * (invMassB / invMassSum);
            b.y += ny * overlap * (invMassB / invMassSum);

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal < 0) {
              const impulse = -(1 + physics.ballBounce) * velAlongNormal / invMassSum;
              a.vx -= impulse * invMassA * nx;
              a.vy -= impulse * invMassA * ny;
              b.vx += impulse * invMassB * nx;
              b.vy += impulse * invMassB * ny;
            }
          } else if (distSq === 0) {
            // Exact same position fallback: nudge apart slightly.
            a.x -= 0.25;
            b.x += 0.25;
          }
        }
      }
    }

    stepParticles(dt);
    stepFireworks(dt);
    checkGameOver(now);
  }


  // Danger-line detection uses each rendered image's visible alpha contour instead of
  // a simple circle radius. This keeps the timer aligned with the actual stone/flower
  // outline, including oval stones, petals, and rotation.
  const imageContourCache = new WeakMap();

  function getImageContour(image) {
    if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) return null;
    if (imageContourCache.has(image)) return imageContourCache.get(image);

    try {
      const sampleSize = 56;
      const probe = document.createElement('canvas');
      probe.width = sampleSize;
      probe.height = sampleSize;
      const pctx = probe.getContext('2d', { willReadFrequently: true });
      pctx.clearRect(0, 0, sampleSize, sampleSize);
      pctx.drawImage(image, 0, 0, sampleSize, sampleSize);
      const data = pctx.getImageData(0, 0, sampleSize, sampleSize).data;
      const threshold = 72;
      const alphaAt = (x, y) => {
        if (x < 0 || y < 0 || x >= sampleSize || y >= sampleSize) return 0;
        return data[(y * sampleSize + x) * 4 + 3];
      };
      const points = [];

      for (let y = 0; y < sampleSize; y += 1) {
        for (let x = 0; x < sampleSize; x += 1) {
          if (alphaAt(x, y) < threshold) continue;
          const isEdge = alphaAt(x - 1, y) < threshold || alphaAt(x + 1, y) < threshold ||
            alphaAt(x, y - 1) < threshold || alphaAt(x, y + 1) < threshold;
          if (isEdge) {
            points.push({
              x: (x + 0.5) / sampleSize - 0.5,
              y: (y + 0.5) / sampleSize - 0.5
            });
          }
        }
      }

      const contour = points.length ? points : null;
      imageContourCache.set(image, contour);
      return contour;
    } catch (error) {
      // Local files or older browsers may refuse pixel reads. The circle fallback below
      // keeps the game playable in that case.
      imageContourCache.set(image, null);
      return null;
    }
  }

  function gemDrawMetrics(b) {
    const g = gems[b.level];
    const image = gemImages[b.level];
    if (!image || !image.complete || !image.naturalWidth) return null;

    const aspect = image.naturalWidth / image.naturalHeight;
    let drawW;
    let drawH;
    if (g.cut === 'ring') {
      drawW = b.r * 2.35;
      drawH = drawW / aspect;
      if (drawH > b.r * 1.42) {
        drawH = b.r * 1.42;
        drawW = drawH * aspect;
      }
    } else {
      drawH = b.r * 2.10;
      drawW = drawH * aspect;
      if (drawW > b.r * 2.25) {
        drawW = b.r * 2.25;
        drawH = drawW / aspect;
      }
    }
    return {
      image,
      drawW,
      drawH,
      angle: b.rot * (g.cut === 'ring' ? 0.08 : 0.18),
      scaleX: 1 + (b.squash || 0) * 0.65,
      scaleY: 1 - (b.squash || 0)
    };
  }

  function flowerDrawMetrics(b) {
    const image = flowerImages[b.flowerIndex];
    if (!image || !image.complete || !image.naturalWidth) return null;

    const aspect = image.naturalWidth / image.naturalHeight;
    let drawH = b.r * 2.16;
    let drawW = drawH * aspect;
    if (drawW > b.r * 2.34) {
      drawW = b.r * 2.34;
      drawH = drawW / aspect;
    }
    return {
      image,
      drawW,
      drawH,
      angle: b.rot * 0.10,
      scaleX: 1 + (b.squash || 0) * 0.35,
      scaleY: 1 - (b.squash || 0) * 0.55
    };
  }

  function contourBoundsY(b, metrics, transformOrder) {
    const contour = getImageContour(metrics.image);
    if (!contour) return { top: b.y - b.r, bottom: b.y + b.r };

    const cos = Math.cos(metrics.angle);
    const sin = Math.sin(metrics.angle);
    let top = Infinity;
    let bottom = -Infinity;

    for (const point of contour) {
      const localX = point.x * metrics.drawW;
      const localY = point.y * metrics.drawH;
      let y;
      if (transformOrder === 'scale-then-rotate') {
        // drawFlower: translate → rotate → scale
        const scaledX = localX * metrics.scaleX;
        const scaledY = localY * metrics.scaleY;
        y = b.y + sin * scaledX + cos * scaledY;
      } else {
        // drawGem: translate → scale → rotate
        const rotatedY = sin * localX + cos * localY;
        y = b.y + rotatedY * metrics.scaleY;
      }
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }

    return Number.isFinite(top) && Number.isFinite(bottom)
      ? { top, bottom }
      : { top: b.y - b.r, bottom: b.y + b.r };
  }

  function visibleBoundsY(b) {
    if (b.kind === 'flower') {
      if (b.isSeed && !b.blooming) {
        const angle = b.rot * 0.25;
        const rx = b.r * 0.78;
        const ry = b.r;
        const verticalRadius = Math.sqrt(
          Math.pow(rx * Math.sin(angle), 2) + Math.pow(ry * Math.cos(angle), 2)
        );
        return { top: b.y - verticalRadius, bottom: b.y + verticalRadius };
      }
      const flowerMetrics = flowerDrawMetrics(b);
      return flowerMetrics
        ? contourBoundsY(b, flowerMetrics, 'scale-then-rotate')
        : { top: b.y - b.r, bottom: b.y + b.r };
    }

    const gemMetrics = gemDrawMetrics(b);
    return gemMetrics
      ? contourBoundsY(b, gemMetrics, 'rotate-then-scale')
      : { top: b.y - b.r, bottom: b.y + b.r };
  }

  function checkGameOver(now) {
    if (state.gameOver) return;

    // A newly released piece receives a short buffer before it can start the
    // ceiling timer. Once half or more of its visible height is above the
    // ceiling, it must return below that threshold within 1.5 seconds.
    const spawnBufferMs = 480;
    const halfOverGraceMs = 1500;
    let exceedsHalfForTooLong = false;

    for (const b of state.balls) {
      if (!b || b.merging) continue;

      if (now - b.born < spawnBufferMs) {
        b.ceilingHalfSince = null;
        continue;
      }

      const bounds = visibleBoundsY(b);
      const visibleMidpoint = (bounds.top + bounds.bottom) / 2;
      const isMoreThanHalfAboveCeiling = visibleMidpoint <= state.dangerLine;

      if (isMoreThanHalfAboveCeiling) {
        if (b.ceilingHalfSince == null) b.ceilingHalfSince = now;
        if (now - b.ceilingHalfSince >= halfOverGraceMs) {
          exceedsHalfForTooLong = true;
          break;
        }
      } else {
        b.ceilingHalfSince = null;
      }
    }

    if (exceedsHalfForTooLong) {
      state.gameOver = true;
      state.canDrop = false;
      updateBest();
      finalScoreEl.textContent = `Score ${state.score.toLocaleString('ja-JP')}`;
      playTone('gameover');
      updateHud();
      gameOverPanel.classList.add('show');
    }
  }


  function renderGemIcon(canvasEl, level) {
    if (!canvasEl) return;
    const c = canvasEl;
    const ictx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 72;
    if (c.width !== size * dpr || c.height !== size * dpr) {
      c.width = size * dpr;
      c.height = size * dpr;
    }
    ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ictx.clearRect(0, 0, size, size);

    const img = gemImages[level];
    const g = gems[level];

    // soft circular stage
    const bg = ictx.createRadialGradient(size * .36, size * .28, 1, size * .5, size * .52, size * .48);
    bg.addColorStop(0, 'rgba(255,255,255,.96)');
    bg.addColorStop(.62, 'rgba(255,248,235,.52)');
    bg.addColorStop(1, 'rgba(201,164,78,.12)');
    ictx.fillStyle = bg;
    ictx.beginPath();
    ictx.arc(size/2, size/2, size*.42, 0, Math.PI*2);
    ictx.fill();

    if (img && img.complete && img.naturalWidth) {
      const aspect = img.naturalWidth / img.naturalHeight;
      let maxW = g.cut === 'ring' ? 62 : 52;
      let maxH = g.cut === 'ring' ? 42 : 52;
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
      ictx.drawImage(img, (size - w)/2, (size - h)/2, w, h);
    }
  }


  function drawGem(b) {
    const g = gems[b.level];
    const img = gemImages[b.level];

    ctx.save();
    ctx.translate(b.x, b.y);
    const scaleY = 1 - (b.squash || 0);
    const scaleX = 1 + (b.squash || 0) * 0.65;
    ctx.scale(scaleX, scaleY);
    ctx.rotate(b.rot * (g.cut === 'ring' ? 0.08 : 0.18));

    if (img && img.complete && img.naturalWidth) {
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW, drawH;
      if (g.cut === 'ring') {
        drawW = b.r * 2.35;
        drawH = drawW / aspect;
        if (drawH > b.r * 1.42) {
          drawH = b.r * 1.42;
          drawW = drawH * aspect;
        }
      } else {
        drawH = b.r * 2.10;
        drawW = drawH * aspect;
        if (drawW > b.r * 2.25) {
          drawW = b.r * 2.25;
          drawH = drawW / aspect;
        }
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Fallback until image is loaded
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }


  function drawSeed(b) {
    const flower = flowers[b.flowerIndex];
    const r = b.r;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot * 0.25);
    // No shadow: seed is intentionally flat and clean like the gems.
    const grad = ctx.createRadialGradient(-r * .28, -r * .34, r * .10, 0, 0, r);
    grad.addColorStop(0, '#fff1a5');
    grad.addColorStop(.28, flower.seed);
    grad.addColorStop(1, flower.seedDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * .78, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = Math.max(.7, r * .12);
    ctx.beginPath();
    ctx.moveTo(-r * .20, -r * .52);
    ctx.lineTo(r * .14, r * .42);
    ctx.stroke();
    ctx.restore();
  }

  function drawFlower(b) {
    if (b.isSeed && !b.blooming) {
      drawSeed(b);
      return;
    }

    const image = flowerImages[b.flowerIndex];
    const bloom = Math.max(0.16, b.bloom || 0.16);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot * 0.10);
    const scaleY = 1 - (b.squash || 0) * .55;
    const scaleX = 1 + (b.squash || 0) * .35;
    ctx.scale(scaleX, scaleY);

    if (image && image.complete && image.naturalWidth) {
      const aspect = image.naturalWidth / image.naturalHeight;
      let drawH = b.r * 2.16;
      let drawW = drawH * aspect;
      if (drawW > b.r * 2.34) {
        drawW = b.r * 2.34;
        drawH = drawW / aspect;
      }
      // A quick expansion from seed to bloom; no extra shadow is added.
      ctx.globalAlpha = Math.min(1, .52 + bloom * .48);
      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      drawSeed(b);
    }
    ctx.restore();
  }

  function drawBall(b) {
    if (b.kind === 'flower') drawFlower(b);
    else drawGem(b);
  }

  function textColorFor(g) {
    if (g.cut === 'diamond' || g.cut === 'pearl' || g.cut === 'turquoise' || g.name === 'トパーズ') return '#253044';
    return 'rgba(255,255,255,.94)';
  }


  function drawCuteFace(r, g, yOffset = 0) {
    const darkFace = ['ダイヤモンド', '真珠', 'トパーズ', 'トルコ石'].includes(g.name);
    const eyeColor = darkFace ? 'rgba(58,52,44,.92)' : 'rgba(255,255,255,.96)';
    const mouthColor = darkFace ? 'rgba(140,84,92,.92)' : 'rgba(255,229,236,.98)';
    ctx.save();
    ctx.rotate(-0.06);
    ctx.translate(0, yOffset + r * 0.12);
    ctx.globalAlpha = 0.72;

    // cheeks
    ctx.fillStyle = 'rgba(255,170,192,.28)';
    ctx.beginPath();
    ctx.ellipse(-r * .18, r * .08, r * .12, r * .07, -.2, 0, Math.PI * 2);
    ctx.ellipse(r * .18, r * .08, r * .12, r * .07, .2, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(-r * .15, -r * .02, Math.max(2.2, r * .07), Math.max(3.8, r * .11), 0, 0, Math.PI * 2);
    ctx.ellipse(r * .15, -r * .02, Math.max(2.2, r * .07), Math.max(3.8, r * .11), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.beginPath();
    ctx.arc(-r * .17, -r * .05, Math.max(1.2, r * .02), 0, Math.PI * 2);
    ctx.arc(r * .13, -r * .05, Math.max(1.2, r * .02), 0, Math.PI * 2);
    ctx.fill();

    // mouth
    ctx.strokeStyle = mouthColor;
    ctx.lineWidth = Math.max(1.4, r * .035);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * .12, r * .12);
    ctx.quadraticCurveTo(0, r * .22, r * .12, r * .12);
    ctx.stroke();
    ctx.restore();
  }

  function drawSurfaceGlints(r, g) {
    if (g.cut === 'turquoise') return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.lineCap = 'round';

    // Broad glossy reflection.
    const gloss = ctx.createLinearGradient(-r * .75, -r * .72, r * .68, r * .52);
    gloss.addColorStop(0, 'rgba(255,255,255,.38)');
    gloss.addColorStop(.20, 'rgba(255,255,255,.08)');
    gloss.addColorStop(.55, 'rgba(255,255,255,.02)');
    gloss.addColorStop(1, 'rgba(255,255,255,.16)');
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.ellipse(-r * .14, -r * .18, r * .72, r * .25, -.48, 0, Math.PI * 2);
    ctx.fill();

    // Small pin speculars.
    const glints = [
      [-0.33, -0.32, 0.14],
      [0.24, -0.10, 0.085],
      [-0.04, 0.22, 0.065]
    ];
    for (const [gx, gy, size] of glints) {
      ctx.save();
      ctx.translate(r * gx, r * gy);
      ctx.rotate(-0.32 + gx);
      const a = Math.max(2.4, r * size);
      ctx.strokeStyle = 'rgba(255,255,255,.84)';
      ctx.lineWidth = Math.max(0.9, r * .018);
      ctx.beginPath(); ctx.moveTo(-a, 0); ctx.lineTo(a, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -a); ctx.lineTo(0, a); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,245,196,.42)';
      ctx.beginPath(); ctx.moveTo(-a*.52, -a*.52); ctx.lineTo(a*.52, a*.52); ctx.stroke();
      ctx.restore();
    }

    // Rim catchlight.
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = Math.max(1.0, r * .02);
    ctx.beginPath();
    ctx.arc(0, 0, r * .92, -2.65, -1.18);
    ctx.stroke();

    ctx.restore();
  }

  function drawFacetedGem(r, g, sides, cut) {
    const pts = [];
    const xScale = cut === 'oval' ? .82 : cut === 'cushion' ? .96 : 1;
    const yScale = cut === 'oval' ? 1.12 : cut === 'cushion' ? .96 : 1;

    for (let i = 0; i < sides; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / sides;
      const cushion = cut === 'cushion' ? .92 + .08 * Math.pow(Math.abs(Math.cos(2 * a)), .45) : 1;
      const mod = (i % 2 ? .90 : 1.01) * cushion;
      pts.push([Math.cos(a) * r * mod * xScale, Math.sin(a) * r * mod * yScale]);
    }

    // Base body volume.
    const body = ctx.createRadialGradient(-r*.46,-r*.50,r*.06,0,0,r*1.18);
    body.addColorStop(0, g.shine);
    body.addColorStop(.12, mixColor(g.shine, '#ffffff', .35));
    body.addColorStop(.28, mixColor(g.shine, g.accent, .32));
    body.addColorStop(.50, g.accent);
    body.addColorStop(.72, g.color);
    body.addColorStop(1, g.dark);
    drawPolygon(pts, body, 'rgba(255,255,255,.46)', Math.max(1.1, r*.032));

    // Slight halo glow around the stone.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g.accent;
    ctx.globalAlpha = .08;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.06 * xScale, r * 1.03 * yScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.clip();

    // Main facet wedges.
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const midX = (p1[0] + p2[0]) / 2;
      const midY = (p1[1] + p2[1]) / 2;
      const highlight = i % 3 === 0 ? .28 : (i % 3 === 1 ? .10 : .04);
      const shadow = i % 2 === 0 ? .18 : .28;
      const facet = ctx.createLinearGradient(-r, -r, r, r);
      facet.addColorStop(0, `rgba(255,255,255,${highlight + .18})`);
      facet.addColorStop(.42, `rgba(255,255,255,${highlight})`);
      facet.addColorStop(.62, 'rgba(255,255,255,.02)');
      facet.addColorStop(1, `rgba(0,0,0,${shadow})`);
      ctx.fillStyle = facet;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p1[0], p1[1]);
      ctx.quadraticCurveTo(midX * 1.03, midY * 1.03, p2[0], p2[1]);
      ctx.closePath();
      ctx.fill();
    }

    // Table facet.
    const table = [];
    const innerN = Math.min(10, Math.max(6, Math.floor(sides * .62)));
    for (let i = 0; i < innerN; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / innerN;
      table.push([Math.cos(a) * r * .43 * xScale, Math.sin(a) * r * .33 * yScale]);
    }
    const tgrad = ctx.createLinearGradient(-r*.36, -r*.34, r*.36, r*.36);
    tgrad.addColorStop(0, 'rgba(255,255,255,.58)');
    tgrad.addColorStop(.26, 'rgba(255,255,255,.20)');
    tgrad.addColorStop(.56, 'rgba(255,255,255,.05)');
    tgrad.addColorStop(.82, 'rgba(0,0,0,.10)');
    tgrad.addColorStop(1, 'rgba(255,255,255,.32)');
    drawPolygon(table, tgrad, 'rgba(255,255,255,.28)', Math.max(.8, r*.015));

    // Internal reflections / pavilion lines.
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = Math.max(.8, r*.014);
    for (let i = 0; i < pts.length; i += 2) {
      const t = table[i % table.length];
      ctx.beginPath();
      ctx.moveTo(t[0], t[1]);
      ctx.lineTo(pts[i][0] * .92, pts[i][1] * .92);
      ctx.stroke();
    }

    // Broad caustic style light band.
    ctx.globalCompositeOperation = 'screen';
    const band = ctx.createLinearGradient(-r, -r*.78, r*.8, r*.5);
    band.addColorStop(0, 'rgba(255,255,255,.42)');
    band.addColorStop(.34, 'rgba(255,255,255,.06)');
    band.addColorStop(.68, 'rgba(255,255,255,.03)');
    band.addColorStop(1, 'rgba(255,255,255,.22)');
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.ellipse(-r*.15, -r*.22, r*.78, r*.18, -.45, 0, Math.PI*2);
    ctx.fill();

    // Slight color depth on lower half.
    const colorDepth = ctx.createRadialGradient(0, r*.22, r*.05, 0, r*.16, r*.88);
    colorDepth.addColorStop(0, 'rgba(0,0,0,0)');
    colorDepth.addColorStop(.62, 'rgba(0,0,0,.05)');
    colorDepth.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = colorDepth;
    ctx.beginPath();
    ctx.ellipse(0, r*.18, r*.92, r*.74, 0, 0, Math.PI*2);
    ctx.fill();

    // Tiny photographic micro-reflections.
    ctx.globalCompositeOperation = 'screen';
    for (let k = 0; k < 5; k++) {
      const ax = Math.sin((k + 1) * 2.11) * r * .42;
      const ay = Math.cos((k + 2) * 1.73) * r * .34;
      ctx.fillStyle = k % 2 ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.14)';
      ctx.beginPath();
      ctx.ellipse(ax, ay, r * (.06 + k * .008), r * .018, k * .7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function mixColor(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
    const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
    const rr = Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0');
    const rg = Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0');
    const rb = Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0');
    return `#${rr}${rg}${rb}`;
  }

  function drawPolygon(pts, fillStyle, strokeStyle, lineWidth) {
    ctx.beginPath();
    pts.forEach(([x,y], i) => i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function drawEmeraldCut(r, g) {
    const w = r * 1.45, h = r * 1.18, c = r * .22;
    const pts = [[-w*.5+c,-h*.5],[w*.5-c,-h*.5],[w*.5,-h*.5+c],[w*.5,h*.5-c],[w*.5-c,h*.5],[-w*.5+c,h*.5],[-w*.5,h*.5-c],[-w*.5,-h*.5+c]];
    const grad = ctx.createLinearGradient(-w*.5,-h*.5,w*.5,h*.5);
    grad.addColorStop(0, g.shine); grad.addColorStop(.25, g.accent); grad.addColorStop(.65, g.color); grad.addColorStop(1, g.dark);
    drawPolygon(pts, grad, 'rgba(255,255,255,.50)', Math.max(1.3, r*.035));
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.34)'; ctx.lineWidth = Math.max(1, r*.022);
    [-.28,0,.28].forEach(k => { ctx.beginPath(); ctx.rect(-w*.38, -h*.32 + h*k, w*.76, h*.22); ctx.stroke(); });
    ctx.fillStyle = 'rgba(255,255,255,.26)'; ctx.fillRect(-w*.36,-h*.38,w*.33,h*.12);
    ctx.restore();
  }

  function drawLongCut(r, g) {
    ctx.save();
    ctx.scale(.72, 1.18);
    drawFacetedGem(r, g, 10, 'oval');
    ctx.restore();
  }

  function drawTurquoise(r, g) {
    const grad = ctx.createRadialGradient(-r*.30,-r*.36,2,0,0,r*1.02);
    grad.addColorStop(0, g.shine);
    grad.addColorStop(.32, '#89efe6');
    grad.addColorStop(.58, g.color);
    grad.addColorStop(1, g.dark);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.42)';
    ctx.lineWidth = Math.max(1.2, r*.024);
    ctx.stroke();

    ctx.save(); ctx.clip();
    // Natural matrix veins.
    ctx.strokeStyle = 'rgba(55,72,76,.42)';
    ctx.lineWidth = Math.max(0.9, r*.014);
    for (let i = 0; i < 10; i++) {
      const y = -r*.76 + (i / 9) * r * 1.52;
      ctx.beginPath();
      ctx.moveTo(-r, y);
      for (let x = -r; x <= r; x += r*.18) {
        const wobble = Math.sin(x*.052 + i*1.53) * r*.052 + Math.cos(x*.031 + i*.84) * r*.028;
        ctx.lineTo(x, y + wobble);
      }
      ctx.stroke();
    }
    // Polished highlight.
    ctx.fillStyle = 'rgba(255,255,255,.30)';
    ctx.beginPath(); ctx.ellipse(-r*.28,-r*.30,r*.30,r*.14,-.42,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawPearl(r, g) {
    const grad = ctx.createRadialGradient(-r*.34,-r*.44,2,0,0,r*1.08);
    grad.addColorStop(0,'#ffffff');
    grad.addColorStop(.18,'#fffdfa');
    grad.addColorStop(.38,'#fff0f5');
    grad.addColorStop(.58,g.color);
    grad.addColorStop(.78,'#dbcfd2');
    grad.addColorStop(1,g.dark);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();

    // Nacre iridescence.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(221,235,255,.22)';
    ctx.beginPath(); ctx.ellipse(-r*.08, r*.06, r*.72, r*.34, -.26, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,223,239,.18)';
    ctx.beginPath(); ctx.ellipse(r*.18, r*.18, r*.52, r*.20, .42, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,.56)';
    ctx.lineWidth = Math.max(1.0, r*.022);
    ctx.stroke();

    // Specular.
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.beginPath(); ctx.ellipse(-r*.28,-r*.34,r*.26,r*.15,-.45,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.ellipse(-r*.12,-r*.16,r*.40,r*.18,-.40,0,Math.PI*2); ctx.fill();
  }

  function drawDiamondShape(x, y, size, g) {
    const r = size / 2;
    const pts = [[x-r*.72,y-r*.15],[x-r*.38,y-r*.62],[x+r*.38,y-r*.62],[x+r*.72,y-r*.15],[x,y+r*.72]];
    const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(.18, '#f5fdff');
    grad.addColorStop(.42, g.color);
    grad.addColorStop(.58, '#f8ffff');
    grad.addColorStop(.78, '#bcefff');
    grad.addColorStop(1, '#ffffff');
    drawPolygon(pts, grad, 'rgba(255,255,255,.88)', Math.max(1.2, r*.042));

    ctx.save(); ctx.clip();

    // Facet lines.
    const lines = [
      [[x-r*.72,y-r*.15],[x+r*.72,y-r*.15]], [[x-r*.38,y-r*.62],[x,y+r*.72]], [[x+r*.38,y-r*.62],[x,y+r*.72]],
      [[x-r*.38,y-r*.62],[x-r*.18,y-r*.15]], [[x+r*.38,y-r*.62],[x+r*.18,y-r*.15]]
    ];
    ctx.strokeStyle = 'rgba(255,255,255,.70)';
    ctx.lineWidth = Math.max(1, r*.03);
    lines.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();});

    // Prism glow.
    ctx.globalCompositeOperation = 'screen';
    const prism = ctx.createLinearGradient(x-r*.45, y-r*.4, x+r*.4, y+r*.28);
    prism.addColorStop(0, 'rgba(255,255,255,.42)');
    prism.addColorStop(.30, 'rgba(198,238,255,.20)');
    prism.addColorStop(.56, 'rgba(255,214,236,.08)');
    prism.addColorStop(1, 'rgba(255,255,255,.22)');
    ctx.fillStyle = prism;
    ctx.beginPath();
    ctx.ellipse(x-r*.08, y-r*.22, r*.44, r*.12, -.28, 0, Math.PI*2);
    ctx.fill();

    // Intense sparkle.
    ctx.strokeStyle = 'rgba(255,255,255,.92)';
    ctx.lineWidth = Math.max(1, r*.028);
    ctx.beginPath(); ctx.moveTo(x-r*.09, y-r*.41); ctx.lineTo(x+r*.09, y-r*.41); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y-r*.50); ctx.lineTo(x, y-r*.32); ctx.stroke();

    ctx.restore();
  }

  function drawRing(r, g) {
    ctx.save();
    ctx.rotate(-0.08);

    const ringGrad = ctx.createLinearGradient(-r, -r, r, r);
    ringGrad.addColorStop(0, '#6d4310');
    ringGrad.addColorStop(.12, '#f5d57a');
    ringGrad.addColorStop(.30, '#fff1bc');
    ringGrad.addColorStop(.48, '#c78d2f');
    ringGrad.addColorStop(.66, '#fff0b2');
    ringGrad.addColorStop(.82, '#8f5e16');
    ringGrad.addColorStop(1, '#fff3c6');

    // Main shank
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = Math.max(13, r * .15);
    ctx.beginPath();
    ctx.ellipse(0, r * .12, r * .55, r * .47, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner rim
    ctx.lineWidth = Math.max(1.6, r*.024);
    ctx.strokeStyle = 'rgba(255,255,255,.72)';
    ctx.beginPath(); ctx.ellipse(0, r*.12, r*.42, r*.35, 0, 0, Math.PI*2); ctx.stroke();

    // Metal reflection bands
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = Math.max(2, r*.03);
    ctx.beginPath();
    ctx.arc(0, r*.12, r*.50, -2.5, -1.0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, r*.12, r*.50, 0.6, 1.65);
    ctx.stroke();

    ctx.restore();

    // Center stone
    drawDiamondShape(0, -r * .62, r * .74, { color:'#dffaff', dark:'#8ad9f0', shine:'#ffffff' });

    // small brand text on ring
    ctx.save();
    ctx.rotate(-bRotationSafe());
    ctx.fillStyle = 'rgba(31,41,55,.88)';
    ctx.font = `950 ${Math.max(14, r*.22)}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('g-Lab.', 0, r * .14);
    ctx.restore();
  }

  function bRotationSafe() { return 0; }

  function drawPreview() {
    if (state.gameOver) return;
    const x = clampDropX(state.dropX || state.w / 2);
    ctx.save();
    ctx.globalAlpha = state.canDrop ? .88 : .35;
    drawGem({ level: state.current, x, y: state.spawnY, r: gemRadius(state.current), rot:0, squash:0 });
    ctx.restore();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, state.w, state.h);

    // Operation screen background: user-provided floral artwork with the g-Lab. logo centered.
    if (boardBgReady && boardBg.naturalWidth) {
      const imgRatio = boardBg.naturalWidth / boardBg.naturalHeight;
      const canvasRatio = state.w / state.h;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > canvasRatio) {
        drawH = state.h;
        drawW = drawH * imgRatio;
        drawX = (state.w - drawW) / 2;
        drawY = 0;
      } else {
        drawW = state.w;
        drawH = drawW / imgRatio;
        drawX = 0;
        drawY = (state.h - drawH) / 2;
      }
      ctx.drawImage(boardBg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, state.w, state.h);
    }

    if (state.fireworks.length) {
      ctx.save();
      const fireGlow = ctx.createRadialGradient(state.w * 0.5, state.h * 0.22, 10, state.w * 0.5, state.h * 0.24, state.w * 0.7);
      fireGlow.addColorStop(0, 'rgba(255,244,214,.34)');
      fireGlow.addColorStop(.38, 'rgba(255,232,181,.16)');
      fireGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 0, state.w, state.h);
      ctx.restore();
    }

    if (logoBgReady && logoBg.naturalWidth) {
      const maxW = state.w * 0.78;
      const maxH = state.h * 0.26;
      const ratio = Math.min(maxW / logoBg.naturalWidth, maxH / logoBg.naturalHeight);
      const w = logoBg.naturalWidth * ratio;
      const h = logoBg.naturalHeight * ratio;
      const x = (state.w - w) / 2;
      const y = (state.h - h) / 2;

      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.drawImage(logoBg, x, y, w, h);
      ctx.restore();
    }

    ctx.save();
    const frameGrad = ctx.createLinearGradient(0, 0, state.w, state.h);
    frameGrad.addColorStop(0, '#9d6b20');
    frameGrad.addColorStop(.22, '#ffe8a3');
    frameGrad.addColorStop(.48, '#c9932e');
    frameGrad.addColorStop(.72, '#fff0bd');
    frameGrad.addColorStop(1, '#9d6d25');
    ctx.strokeStyle = frameGrad;
    ctx.lineWidth = 4;
    roundRectPath(10, 10, state.w - 20, state.h - 20, 24);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(210,210,210,.58)';
    ctx.lineWidth = 1;
    roundRectPath(18, 18, state.w - 36, state.h - 36, 18);
    ctx.stroke();
    ctx.restore();

  }

  function roundRectPath(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawArtNouveauOrnaments(stroke) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = .46;
    ctx.lineWidth = 2.2;
    const cx = state.w / 2;

    function vine(sign) {
      ctx.beginPath();
      ctx.moveTo(cx, 26);
      ctx.bezierCurveTo(cx + sign * 34, 38, cx + sign * 55, 72, cx + sign * 29, 102);
      ctx.bezierCurveTo(cx + sign * 10, 123, cx + sign * 56, 139, cx + sign * 72, 111);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sign > 0 ? state.w - 28 : 28, state.h - 120);
      ctx.bezierCurveTo(sign > 0 ? state.w - 82 : 82, state.h - 175, sign > 0 ? state.w - 42 : 42, state.h - 238, sign > 0 ? state.w - 88 : 88, state.h - 287);
      ctx.stroke();
    }
    vine(1); vine(-1);

    ctx.globalAlpha = .22;
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i++) {
      const y = 64 + i * 52;
      ctx.beginPath();
      ctx.moveTo(28, y);
      ctx.bezierCurveTo(68, y - 25, 94, y + 25, 130, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(state.w - 28, y);
      ctx.bezierCurveTo(state.w - 68, y - 25, state.w - 94, y + 25, state.w - 130, y);
      ctx.stroke();
    }
    ctx.restore();
  }


  function drawFireworks() {
    for (const f of state.fireworks) {
      const alpha = Math.max(0, f.life / f.maxLife);
      const twinkle = 0.72 + 0.28 * Math.sin((1 - alpha) * 18 + f.twinkle);
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.globalAlpha = alpha * twinkle;

      ctx.shadowColor = f.color;
      ctx.shadowBlur = f.glow * alpha + 2;

      // glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, f.size * 3.6);
      glow.addColorStop(0, f.color);
      glow.addColorStop(.24, f.color + 'cc');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, f.size * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // star sparkle
      ctx.strokeStyle = f.color;
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(0.8, f.size * 0.34);
      const len = f.size * 2.6;
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(0, len); ctx.stroke();
      ctx.lineWidth = Math.max(0.7, f.size * 0.18);
      const d = len * 0.72;
      ctx.beginPath(); ctx.moveTo(-d, -d); ctx.lineTo(d, d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-d, d); ctx.lineTo(d, -d); ctx.stroke();

      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((1 - alpha) * 5);
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size*.42, -p.size*.42);
      ctx.lineTo(p.size, 0);
      ctx.lineTo(p.size*.42, p.size*.42);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size*.42, p.size*.42);
      ctx.lineTo(-p.size, 0);
      ctx.lineTo(-p.size*.42, -p.size*.42);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function render() {
    drawBackground();
    drawFireworks();
    const sorted = [...state.balls].sort((a,b)=>a.r-b.r);
    for (const b of sorted) drawBall(b);
    drawParticles();
    drawPreview();
  }

  function loop(now) {
    const dt = Math.min(0.032, (now - state.lastTime) / 1000 || 0.016);
    state.lastTime = now;
    if (!state.gameOver) step(dt); else { stepParticles(dt); stepFireworks(dt); }
    render();
    requestAnimationFrame(loop);
  }

  function pointerX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) * (state.w / rect.width);
  }

  function setPointer(clientX) {
    state.dropX = clampDropX(pointerX(clientX));
    updateGuide();
  }

  canvas.addEventListener('pointermove', (e) => {
    setPointer(e.clientX);
  });
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio();
    syncBgm();
    state.pointerDown = true;
    setPointer(e.clientX);
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointerup', (e) => {
    state.pointerDown = false;
    setPointer(e.clientX);
    drop();
  });
  canvas.addEventListener('pointercancel', () => { state.pointerDown = false; });

  if (dropBtn) dropBtn.addEventListener('click', drop);
  if (restartBtn) restartBtn.addEventListener('click', reset);
  difficultyButtons.forEach(button => button.addEventListener('click', () => setDifficulty(button.dataset.difficulty)));
  if (bgmBtn) {
    bgmBtn.addEventListener('click', () => {
      state.bgmEnabled = true;
      syncBgm();
      updateHud();
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = true;
      playTone('drop');
      updateHud();
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopBgm();
    else if (state.bgmEnabled && state.audio) syncBgm();
  });
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  initLegend();
  resize();
  reset();
  requestAnimationFrame(loop);
})();
