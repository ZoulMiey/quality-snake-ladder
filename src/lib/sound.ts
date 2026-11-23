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

/** A short burst of noise (explosions). */
function noise(start: number, dur: number, vol = 0.35, lowpass = 900) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lowpass;
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
  frenzy() {
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.12, "square", 0.08));
  },
};
