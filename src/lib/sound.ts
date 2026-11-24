// Small sound effects made in the browser, so there are no sound files to load.
let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem("qsl-muted") === "1";
} catch {}

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("qsl-muted", m ? "1" : "0");
  } catch {}
}

/** Call from a click so the browser allows sound later. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {}
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.18, endFreq?: number) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

/** A short burst of noise (explosions, tyres, whooshes). `to` sweeps the filter; `band` uses a band-pass filter. */
function noise(start: number, dur: number, vol = 0.35, lowpass = 900, to?: number, band = false) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = band ? "bandpass" : "lowpass";
  f.frequency.setValueAtTime(lowpass, t0);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  if (band) f.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

export const sfx = {
  /** The Defect Titan explodes. */
  boom() {
    noise(0, 1.4, 0.5, 700);
    noise(0.05, 0.5, 0.3, 2400);
    tone(110, 0, 0.9, "sawtooth", 0.18, 30);
    tone(60, 0, 1.2, "sine", 0.3, 25);
  },
  dice() {
    for (let i = 0; i < 6; i++) tone(180 + Math.random() * 260, i * 0.06, 0.05, "square", 0.06);
  },
  correct() {
    tone(660, 0, 0.12, "triangle");
    tone(990, 0.1, 0.18, "triangle");
  },
  wrong() {
    tone(220, 0, 0.25, "sawtooth", 0.09, 140);
  },
  ladder() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.14, "triangle"));
  },
  snake() {
    tone(900, 0, 0.7, "sawtooth", 0.06, 120);
  },
  tick() {
    tone(1000, 0, 0.07, "square", 0.08);
  },
  win() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.22, "triangle", 0.2));
  },
  count() {
    tone(660, 0, 0.15, "square", 0.1);
  },
  go() {
    tone(880, 0, 0.12, "square", 0.12);
    tone(1320, 0.1, 0.35, "square", 0.12);
  },
  join() {
    tone(784, 0, 0.1, "triangle", 0.12);
  },
  // Fishing Derby
  splash() {
    tone(500, 0, 0.18, "sine", 0.12, 160);
    tone(1200, 0.02, 0.08, "triangle", 0.05, 600);
  },
  reel() {
    for (let i = 0; i < 5; i++) tone(1400 - i * 90, i * 0.05, 0.035, "square", 0.04);
    tone(880, 0.3, 0.16, "triangle", 0.14);
  },
  bigFish() {
    tone(330, 0, 0.18, "sawtooth", 0.08, 220);
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15 + i * 0.08, 0.16, "triangle", 0.16));
  },
  golden() {
    [784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => tone(f, i * 0.07, 0.35, "sine", 0.12));
    [1047, 1319, 1568].forEach((f) => tone(f, 0.5, 0.6, "triangle", 0.1));
  },
  snap() {
    tone(1600, 0, 0.06, "square", 0.08, 400);
    tone(180, 0.05, 0.3, "sawtooth", 0.08, 90);
  },
  // Quality Cart
  /** Kaizen Turbo / right answer: a whoosh that rises. */
  boost() {
    noise(0, 0.7, 0.5, 400, 3200, true);
    tone(160, 0, 0.6, "sawtooth", 0.07, 620);
  },
  /** SUPER TURBO: a bigger whoosh, a roar and a chime. */
  superBoost() {
    noise(0, 1.1, 0.6, 300, 4200, true);
    tone(110, 0, 0.9, "sawtooth", 0.09, 700);
    [784, 1047, 1568].forEach((f, i) => tone(f, 0.25 + i * 0.07, 0.25, "triangle", 0.1));
  },
  /** PPE Shield switches on: a shimmering chime. */
  shieldUp() {
    [880, 1175, 1568, 2093].forEach((f, i) => tone(f, i * 0.05, 0.5, "sine", 0.08));
    noise(0, 0.5, 0.12, 6000, 2500, true);
  },
  /** The shield runs out. */
  shieldDown() {
    tone(1175, 0, 0.25, "sine", 0.06, 500);
  },
  /** Hit a pothole: a heavy thud and a rattle. */
  pothole() {
    tone(120, 0, 0.35, "sine", 0.35, 45);
    noise(0, 0.25, 0.5, 500);
    noise(0.12, 0.18, 0.25, 900);
    tone(220, 0.12, 0.08, "square", 0.05, 160);
  },
  /** Knock a cone: a hollow plastic bonk. */
  cone() {
    tone(700, 0, 0.12, "triangle", 0.18, 320);
    tone(520, 0.14, 0.1, "triangle", 0.1, 300);
  },
  /** Spinning out: tyres screech. */
  screech() {
    noise(0, 0.9, 0.35, 2600, 1500, true);
    tone(900, 0, 0.8, "sawtooth", 0.025, 600);
  },
  /** Slide on oil: a slippery wobble. */
  oil() {
    tone(500, 0, 0.5, "sine", 0.12, 180);
    noise(0, 0.6, 0.2, 1200, 600, true);
  },
  frenzy() {
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.12, "square", 0.08));
  },
};

/**
 * A running engine for Quality Cart: two buzzy tones through a soft filter, pitched by speed.
 * Call set() every frame (it starts itself once sound is allowed) and stop() when the race view closes.
 */
export function makeEngine() {
  let nodes: { o1: OscillatorNode; o2: OscillatorNode; lfo: OscillatorNode; f: BiquadFilterNode; g: GainNode } | null = null;
  return {
    /** ratio: speed / normal speed (0 = stopped); boost: turbo or SUPER on. */
    set(ratio: number, boost: boolean, on = true) {
      if (!ctx || ctx.state !== "running") return;
      if (!nodes) {
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoG = ctx.createGain();
        const f = ctx.createBiquadFilter();
        const g = ctx.createGain();
        o1.type = "sawtooth";
        o2.type = "square";
        lfo.frequency.value = 18;
        lfoG.gain.value = 3;
        lfo.connect(lfoG);
        lfoG.connect(o1.frequency);
        lfoG.connect(o2.frequency);
        f.type = "lowpass";
        f.Q.value = 2;
        g.gain.value = 0;
        o1.connect(f);
        o2.connect(f);
        f.connect(g).connect(ctx.destination);
        o1.start();
        o2.start();
        lfo.start();
        nodes = { o1, o2, lfo, f, g };
      }
      const t = ctx.currentTime;
      const r = Math.max(0, Math.min(2, ratio));
      const hz = 48 + r * 62 + (boost ? 22 : 0);
      nodes.o1.frequency.setTargetAtTime(hz, t, 0.08);
      nodes.o2.frequency.setTargetAtTime(hz * 0.5, t, 0.08);
      nodes.f.frequency.setTargetAtTime(380 + r * 520 + (boost ? 500 : 0), t, 0.1);
      nodes.g.gain.setTargetAtTime(on && !muted ? 0.035 + r * 0.02 : 0, t, 0.12);
    },
    stop() {
      if (!nodes || !ctx) return;
      const n = nodes;
      nodes = null;
      const t = ctx.currentTime;
      n.g.gain.setTargetAtTime(0, t, 0.1);
      for (const o of [n.o1, n.o2, n.lfo]) o.stop(t + 0.6);
    },
  };
}
