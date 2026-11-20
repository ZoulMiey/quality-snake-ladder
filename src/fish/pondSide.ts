// The phone's pond, seen from the side (owner's pick "A · cartoon cutaway", Nov 2026; draft
// https://claude.ai/artifact/VUt4haXB4DsLVBd9Av9G3t). Your boat floats at the top with your two neighbours
// at the edges; under the water fish swim around your hook. A right answer: a fish swims to the hook, bites,
// is reeled up and flips into your boat. The view never moves; the question card covers the deep water.
// Units: 400 wide; the height follows the phone.
import type { BoatInfo, LeapKind, PondApi } from "./pondApi.ts";

const UW = 400;
const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const DISP = '"Baloo 2","Trebuchet MS",system-ui,sans-serif';
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Beats of my catch, in ms from the answer: swim to the hook, bite, fight, reel up, jump into the boat. */
export const SIDE_BEATS = {
  fish: { bite: 800, reel: 1_100, surface: 1_600, land: 2_200 },
  big: { bite: 1_200, reel: 2_100, surface: 2_800, land: 3_500 },
} as const;

type Swimmer = { x: number; d: number; dir: number; sp: number; len: number; col: string; ph: number };
type MyCatch = { kind: LeapKind; at: number; label?: string; gold?: boolean; floated?: boolean };
type NbLeap = { side: -1 | 1; at: number; kind: LeapKind };

let seed = 5;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const COLS = ["#94a3b8", "#fb923c", "#7dd3fc", "#a3a3a3", "#fca5a5", "#86efac"];

export class PondSide implements PondApi {
  private raf = 0;
  private last = performance.now();
  private me: BoatInfo | null = null;
  private nb: { left: BoatInfo | null; right: BoatInfo | null } = { left: null, right: null };
  private catches: MyCatch[] = [];
  private nbLeaps: NbLeap[] = [];
  private snapped = false;
  private frenzy = false;
  private floats: { text: string; at: number; gold?: boolean }[] = [];
  // Fish depths are fractions of the water (0 = surface, 1 = sand), so any phone height works.
  private fishes: Swimmer[] = [
    ...Array.from({ length: 9 }, (_, i) => ({ x: rnd() * UW, d: i < 4 ? rnd() * 0.12 : 0.15 + rnd() * 0.75, dir: rnd() < 0.5 ? -1 : 1, sp: 18 + rnd() * 26, len: 30 + rnd() * 22, col: COLS[i % COLS.length], ph: rnd() * 6 })),
    { x: 60, d: 0.78, dir: 1, sp: 12, len: 80, col: "#3f6212", ph: 0 },
    { x: 330, d: 0.9, dir: -1, sp: 10, len: 70, col: "#475569", ph: 2 },
  ];
  private weeds = Array.from({ length: 12 }, (_, i) => ({ x: 10 + i * 35 + rnd() * 14, h: 60 + rnd() * 90, ph: rnd() * 6, c: i % 2 ? "#15803d" : "#22c55e" }));
  private bubbles = Array.from({ length: 16 }, () => ({ x: rnd() * UW, f: rnd(), r: 2 + rnd() * 4, sp: 20 + rnd() * 30 }));

  private canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.raf = requestAnimationFrame(this.frame);
  }

  setBoats(list: BoatInfo[], me: string) {
    const order = list.map((b) => b.uid);
    const i = order.indexOf(me);
    this.me = list[i] ?? null;
    if (i < 0 || list.length < 2) this.nb = { left: null, right: null };
    else this.nb = { right: list[(i + 1) % list.length], left: list.length > 2 ? list[(i - 1 + list.length) % list.length] : null };
  }
  catchAt(uid: string, kind: LeapKind, delayMs = 0, label?: string, gold?: boolean) {
    const at = performance.now() + delayMs;
    if (this.me && uid === this.me.uid) this.catches = [{ kind, at, label, gold }];
    else if (this.nb.right?.uid === uid) this.nbLeaps.push({ side: 1, at, kind });
    else if (this.nb.left?.uid === uid) this.nbLeaps.push({ side: -1, at, kind });
  }
  setSnapped(on: boolean) {
    this.snapped = on;
  }
  setFrenzy(on: boolean) {
    this.frenzy = on;
  }
  dispose() {
    cancelAnimationFrame(this.raf);
  }

  private frame = (t: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(50, t - this.last) / 1000;
    this.last = t;
    const cv = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cv.clientWidth * dpr);
    const H = Math.round(cv.clientHeight * dpr);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const c = cv.getContext("2d")!;
    const k = W / UW;
    const VH = H / k;
    // The question card covers about the bottom 55%. The boat sits in the middle of the part above it
    // (owner, Nov 2026), with the hook not too deep so the whole catch stays in view.
    const SURF = clamp(VH * 0.27, 120, 230);
    const HOOK = { x: 292, y: SURF + 78 };
    const BOAT = { x: 172, y: SURF };
    const SAND = VH - 40;
    const depthY = (d: number) => SURF + 30 + d * (SAND - SURF - 60);
    c.setTransform(k, 0, 0, k, 0, 0);
    const frenzy = this.frenzy;

    // Sky and the far bank.
    const sky = c.createLinearGradient(0, 0, 0, SURF);
    sky.addColorStop(0, "#7cc7f0");
    sky.addColorStop(1, "#d6f1fd");
    c.fillStyle = sky;
    c.fillRect(0, 0, UW, SURF);
    c.fillStyle = "#4f9a3f";
    c.beginPath();
    c.moveTo(0, SURF - 14);
    for (let x = 0; x <= UW; x += 20) c.lineTo(x, SURF - 18 - Math.sin(x / 50) * 5);
    c.lineTo(UW, SURF);
    c.lineTo(0, SURF);
    c.fill();
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 46;
      const y = SURF - 24;
      c.fillStyle = "#2f7d32";
      c.beginPath();
      c.moveTo(x, y - 28);
      c.lineTo(x - 11, y + 4);
      c.lineTo(x + 11, y + 4);
      c.fill();
    }
    // Water, light rays, sand, weeds, rocks, bubbles.
    const w = c.createLinearGradient(0, SURF, 0, VH);
    if (frenzy) {
      w.addColorStop(0, "#5eead4");
      w.addColorStop(0.5, "#0e7490");
      w.addColorStop(1, "#3b0764");
    } else {
      w.addColorStop(0, "#5cc3ec");
      w.addColorStop(0.45, "#1f78b4");
      w.addColorStop(1, "#0b3a5a");
    }
    c.fillStyle = w;
    c.fillRect(0, SURF, UW, VH - SURF);
    c.save();
    c.globalAlpha = 0.12;
    c.fillStyle = "#fff";
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 90 + Math.sin(t / 2000 + i) * 10;
      c.beginPath();
      c.moveTo(x, SURF);
      c.lineTo(x + 30, SURF);
      c.lineTo(x + 110, VH);
      c.lineTo(x + 60, VH);
      c.fill();
    }
    c.restore();
    c.fillStyle = "#e6cf98";
    c.beginPath();
    c.moveTo(0, VH);
    for (let x = 0; x <= UW; x += 20) c.lineTo(x, SAND + Math.sin(x / 40) * 8);
    c.lineTo(UW, VH);
    c.fill();
    c.lineCap = "round";
    for (const wd of this.weeds) {
      c.strokeStyle = wd.c;
      c.lineWidth = 7;
      c.beginPath();
      c.moveTo(wd.x, SAND + 20);
      c.quadraticCurveTo(wd.x + Math.sin(t / 700 + wd.ph) * 18, SAND + 20 - wd.h / 2, wd.x + Math.sin(t / 600 + wd.ph) * 10, SAND + 20 - wd.h);
      c.stroke();
    }
    c.fillStyle = "#78716c";
    c.beginPath();
    c.ellipse(120, SAND + 20, 30, 16, 0, 0, 7);
    c.ellipse(300, SAND + 25, 22, 12, 0, 0, 7);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 1.5;
    for (const b of this.bubbles) {
      b.f -= (b.sp * dt) / (SAND - SURF);
      if (b.f < 0) b.f = 1;
      const y = SURF + b.f * (SAND - SURF);
      c.beginPath();
      c.arc(b.x + Math.sin(t / 500 + y / 30) * 3, y, b.r, 0, 7);
      c.stroke();
    }

    // Fish swimming around (a school around the hook in a frenzy).
    for (let e = 0; e < (frenzy ? 2 : 1); e++)
      for (const f of this.fishes) {
        if (!e) {
          f.x += f.dir * f.sp * dt * (frenzy ? 1.8 : 1);
          if (f.x > UW + 60) f.x = -60;
          if (f.x < -60) f.x = UW + 60;
        }
        const x = e ? UW - f.x : f.x;
        const y = e ? depthY(clamp(f.d - 0.3)) + Math.sin(t / 900 + f.ph) * 30 : depthY(f.d) + Math.sin(t / 800 + f.ph) * 8;
        fishShape(c, x, y, f.len, f.col, e ? -f.dir : f.dir, Math.sin(t / 120 + f.ph) * 3, false, false);
      }
    if (frenzy)
      for (let i = 0; i < 10; i++) {
        const a = t / 700 + i * 0.63;
        const r = 50 + 8 * Math.sin(t / 300 + i);
        fishShape(c, HOOK.x + Math.cos(a) * r, HOOK.y + Math.sin(a) * r * 0.6, 24, COLS[i % COLS.length], Math.sin(a) > 0 ? -1 : 1, Math.sin(t / 90 + i) * 3, false, false);
      }

    // Neighbours at the edges, and their small catches.
    if (this.nb.left) boat(c, 34, SURF, 0.45, t + 900, 0.75, this.nb.left.emoji, this.nb.left.color);
    if (this.nb.right) boat(c, 372, SURF, 0.45, t + 400, 0.75, this.nb.right.emoji, this.nb.right.color);
    this.nbLeaps = this.nbLeaps.filter((l) => t - l.at < 1_400);
    for (const l of this.nbLeaps) {
      const u = (t - l.at) / 1_000;
      if (u < 0) continue;
      const bx = l.side > 0 ? 372 : 34;
      const wx = bx - l.side * 50;
      splashAt(c, wx, SURF, u * 1.6, 0.7);
      if (u <= 1) {
        const p = easeOut(u);
        fishShape(c, lerp(wx, bx, p), lerp(SURF, SURF - 30, p) - Math.sin(Math.PI * p) * 50, l.kind === "fish" ? 22 : 36, l.kind === "gold" ? "#f5c542" : l.kind === "big" ? "#3f6212" : "#94a3b8", l.side, Math.sin(t / 60) * 3, l.kind === "gold", true);
      }
    }

    // My catch: swim to the hook, bite, fight, reel up, jump into the boat.
    let hook = { x: HOOK.x, y: HOOK.y + Math.sin(t / 700) * 5 };
    let tipDrop = 0;
    let shake = 0;
    let bobUnder = false;
    let caught: { x: number; y: number; dir: number; open: boolean; rot?: number } | null = null;
    let showBang = false;
    const cur = this.catches[0];
    let len = 40;
    let col = "#94a3b8";
    let gold = false;
    if (cur) {
      const age = t - cur.at;
      const big = cur.kind !== "fish";
      const B = big ? SIDE_BEATS.big : SIDE_BEATS.fish;
      len = cur.kind === "gold" ? 90 : big ? 84 : 40;
      col = cur.kind === "big" ? "#3f6212" : "#94a3b8";
      gold = cur.kind === "gold";
      const sx = big ? HOOK.x - 40 : -40;
      const sy = big ? depthY(0.9) : HOOK.y;
      if (age < 0) {
        /* not yet */
      } else if (age < B.bite) {
        const u = ease(clamp(age / B.bite));
        caught = { x: lerp(sx, hook.x - len * 0.45, u), y: lerp(sy, hook.y, u) + Math.sin(u * 9) * 6 * (1 - u), dir: 1, open: u > 0.8 };
      } else if (age < B.reel) {
        showBang = age < B.bite + 450;
        shake = big ? 8 : 3;
        bobUnder = true;
        hook.y += Math.sin(t / 40) * shake;
        tipDrop = (big ? 26 : 10) + Math.sin(t / 45) * shake;
        caught = { x: hook.x - len * 0.45 + Math.sin(t / 50) * shake, y: hook.y, dir: 1, open: true };
      } else if (age < B.surface) {
        const u = easeOut((age - B.reel) / (B.surface - B.reel));
        hook.y = lerp(hook.y, SURF, u);
        tipDrop = (big ? 18 : 8) * (1 - u);
        bobUnder = true;
        caught = { x: hook.x - len * 0.45 + Math.sin(t / 50) * 3, y: hook.y, dir: 1, open: true };
      } else if (age < B.land) {
        const u = (age - B.surface) / (B.land - B.surface);
        const p = easeOut(u);
        const x = lerp(HOOK.x, BOAT.x + 10, p);
        const y = lerp(SURF, BOAT.y - 34, p) - Math.sin(Math.PI * p) * (big ? 110 : 75);
        hook = { x, y };
        caught = { x: x - 6, y, dir: -1, open: true, rot: -1.2 + p * 2.4 };
        if (u < 0.5) splashAt(c, HOOK.x, SURF, u * 2, big ? 1.8 : 1);
      } else {
        if (!cur.floated && cur.label) {
          cur.floated = true;
          this.floats.push({ text: cur.label, at: t, gold: cur.gold });
        }
        if (age < B.land + 1_000) caught = { x: BOAT.x - 4, y: BOAT.y - 66 - Math.sin((age - B.land) / 150) * 4, dir: -1, open: false, rot: -0.4 };
        hook = { x: HOOK.x, y: lerp(BOAT.y - 30, HOOK.y, clamp((age - B.land - 500) / 800)) };
        if (age > B.land + 1_400) this.catches = [];
      }
    }

    // My boat, rod and line (no line while it is snapped).
    boat(c, BOAT.x, BOAT.y, 1, t, 1, this.me?.emoji ?? "🎣", this.me?.color ?? "#c2410c");
    const tip = { x: 300, y: SURF - 98 + tipDrop };
    c.strokeStyle = "#3b2a1a";
    c.lineWidth = 5;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(BOAT.x + 8, BOAT.y - 38);
    c.quadraticCurveTo(tip.x - 40, (BOAT.y - 38 + tip.y) / 2 - 20 + tipDrop, tip.x, tip.y);
    c.stroke();
    if (!this.snapped) {
      const bob = { x: hook.x + 4, y: bobUnder ? SURF + 8 : SURF - 2 + Math.sin(t / 420) * 2 };
      c.strokeStyle = "rgba(255,255,255,.9)";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      if (hook.y > SURF + 4) {
        c.quadraticCurveTo(tip.x + 4, (tip.y + bob.y) / 2 + 10, bob.x, bob.y);
        c.lineTo(hook.x + Math.sin(t / 60) * shake * 0.3, hook.y);
      } else c.lineTo(hook.x, hook.y);
      c.stroke();
      if (hook.y > SURF + 4) {
        c.fillStyle = "#ef4444";
        c.beginPath();
        c.arc(bob.x, bob.y - 3, 7, Math.PI, 0);
        c.fill();
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(bob.x, bob.y - 3, 7, 0, Math.PI);
        c.fill();
      }
      c.strokeStyle = "#cbd5e1";
      c.lineWidth = 2.5;
      c.beginPath();
      c.arc(hook.x, hook.y + 8, 7, 0, Math.PI);
      c.stroke();
      if (!caught) {
        c.strokeStyle = "#f472b6";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(hook.x - 6, hook.y + 10);
        c.quadraticCurveTo(hook.x, hook.y + 18 + Math.sin(t / 200) * 3, hook.x + 7, hook.y + 10);
        c.stroke();
      }
    } else {
      c.strokeStyle = "rgba(255,255,255,.9)";
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.quadraticCurveTo(tip.x + 20, tip.y + 30, tip.x + 6, tip.y + 46);
      c.stroke();
    }
    if (caught) {
      c.save();
      c.translate(caught.x, caught.y);
      if (caught.rot) c.rotate(caught.rot);
      fishShape(c, 0, 0, len, col, caught.dir, Math.sin(t / 60) * 4, gold, caught.open);
      c.restore();
      if (gold)
        for (let i = 0; i < 8; i++) {
          const a = t / 300 + i * 0.8;
          star(c, caught.x + Math.cos(a) * 60, caught.y + Math.sin(a) * 40, 7);
        }
    }
    if (showBang) {
      c.font = `800 30px ${DISP}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#facc15";
      c.strokeStyle = "#3a2a00";
      c.lineWidth = 5;
      c.strokeText("!", hook.x + 22, hook.y - 30);
      c.fillText("!", hook.x + 22, hook.y - 30);
    }
    // The surface on top, so hulls sit in the water.
    c.fillStyle = "rgba(92,195,236,.45)";
    c.beginPath();
    c.moveTo(0, SURF);
    for (let x = 0; x <= UW; x += 10) c.lineTo(x, SURF + Math.sin(x / 22 + t / 400) * 3);
    c.lineTo(UW, SURF + 20);
    c.lineTo(0, SURF + 20);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.8)";
    c.lineWidth = 2;
    c.beginPath();
    for (let x = 0; x <= UW; x += 10) c.lineTo(x, SURF + Math.sin(x / 22 + t / 400) * 3);
    c.stroke();
    // "+3.4 kg" over my boat.
    this.floats = this.floats.filter((f) => t - f.at < 1_800);
    for (const f of this.floats) {
      const u = (t - f.at) / 1_800;
      c.save();
      c.globalAlpha = u > 0.75 ? (1 - u) / 0.25 : 1;
      const y = BOAT.y - 100 - easeOut(u) * 30;
      c.font = `800 ${f.gold ? 34 : 28}px ${DISP}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.lineJoin = "round";
      c.strokeStyle = "#fff";
      c.lineWidth = 8;
      c.strokeText(f.text, BOAT.x, y);
      c.fillStyle = f.gold ? "#b45309" : frenzy ? "#7c3aed" : "#0369a1";
      c.fillText(f.text, BOAT.x, y);
      c.restore();
    }
  };
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${clamp((n >> 16) + amt, 0, 255)},${clamp(((n >> 8) & 255) + amt, 0, 255)},${clamp((n & 255) + amt, 0, 255)})`;
}

function fishShape(c: CanvasRenderingContext2D, x: number, y: number, len: number, col: string, dir: number, wag: number, gold: boolean, open: boolean) {
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  const h = len * 0.42;
  if (gold) {
    c.shadowColor = "rgba(253,224,71,.95)";
    c.shadowBlur = len * 0.6;
  }
  c.fillStyle = gold ? "#f5c542" : col;
  c.beginPath();
  c.moveTo(-len * 0.38, 0);
  c.lineTo(-len * 0.64, -h * 0.6 + wag);
  c.lineTo(-len * 0.64, h * 0.6 + wag);
  c.closePath();
  c.fill();
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
  if (gold) {
    g.addColorStop(0, "#fff7b0");
    g.addColorStop(0.5, "#f5c542");
    g.addColorStop(1, "#b7791f");
  } else {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.25, col);
    g.addColorStop(1, shade(col, -40));
  }
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, len * 0.46, h / 2, 0, 0, 7);
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = "rgba(0,0,0,.15)";
  c.beginPath();
  c.moveTo(-len * 0.08, -h * 0.45);
  c.quadraticCurveTo(len * 0.05, -h * 0.95, len * 0.18, -h * 0.42);
  c.fill();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(len * 0.28, -h * 0.1, len * 0.07, 0, 7);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(len * 0.3, -h * 0.1, len * 0.035, 0, 7);
  c.fill();
  if (open) {
    c.fillStyle = "#7f1d1d";
    c.beginPath();
    c.ellipse(len * 0.45, h * 0.05, len * 0.05, len * 0.04, 0, 0, 7);
    c.fill();
  }
  c.restore();
}

function boat(c: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, alpha: number, emoji: string, col: string) {
  c.save();
  c.globalAlpha = alpha;
  c.translate(x, y + Math.sin(t / 600) * 2);
  c.scale(s, s);
  c.rotate(Math.sin(t / 900) * 0.03);
  c.fillStyle = "#8b5a2b";
  c.beginPath();
  c.moveTo(-62, -14);
  c.lineTo(66, -14);
  c.quadraticCurveTo(60, 18, 34, 20);
  c.lineTo(-40, 20);
  c.quadraticCurveTo(-60, 14, -62, -14);
  c.fill();
  c.fillStyle = "#c08a45";
  c.fillRect(-62, -18, 128, 8);
  c.fillStyle = "#6b4423";
  for (let i = -40; i <= 40; i += 26) c.fillRect(i, -10, 3, 26);
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(-4, -42, 24, 0, 7);
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = col;
  c.stroke();
  c.font = `28px ${EMO}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#000";
  c.fillText(emoji, -4, -40);
  c.restore();
}

function splashAt(c: CanvasRenderingContext2D, x: number, y: number, u: number, s: number) {
  if (u < 0 || u > 1) return;
  c.save();
  c.globalAlpha = 1 - u;
  c.fillStyle = "#e0f2fe";
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI * (0.1 + (0.8 * i) / 7);
    c.beginPath();
    c.arc(x + Math.cos(a) * u * 40 * s, y + Math.sin(a) * u * 50 * s + u * u * 40, 4 * s, 0, 7);
    c.fill();
  }
  c.restore();
}

function star(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.save();
  c.translate(x, y);
  c.fillStyle = "#fde047";
  c.strokeStyle = "#fff";
  c.lineWidth = 2;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 ? r * 0.4 : r;
    c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  c.closePath();
  c.stroke();
  c.fill();
  c.restore();
}

