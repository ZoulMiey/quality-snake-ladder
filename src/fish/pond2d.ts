// The bright cartoon pond (owner's pick, like Snake & Ladder), drawn on a 2D canvas. Used by the projector
// and by phones that cannot show 3D. Pond units: 1540 × 960, oval pond in the middle.
import { boatSpot } from "./rules.ts";

export const PW = 1540;
export const PH = 960;
export const CX = PW / 2;
export const CY = PH / 2;
export const RX = 700;
export const RY = 420;

const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const DISP = '"Baloo 2","Trebuchet MS",system-ui,sans-serif';
export const BODY = '"Figtree",system-ui,sans-serif';
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export type Boat = { uid: string; i: number; a: number; x: number; y: number; bx: number; by: number; emoji: string; color: string; name: string };

/** Boats around the pond, in the agreed order (see boatOrder). */
export function layoutBoats(list: { uid: string; emoji: string; color: string; name: string }[]): Boat[] {
  return list.map((p, i) => {
    const { a, r } = boatSpot(i, list.length);
    return { ...p, i, a, x: CX + Math.cos(a) * RX * r, y: CY + Math.sin(a) * RY * r, bx: CX + Math.cos(a) * RX * r * 0.7, by: CY + Math.sin(a) * RY * r * 0.7 };
  });
}

// Scenery, placed once with a fixed seed so every screen looks the same.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
type Decor = { t: "lily" | "reed" | "tree"; x: number; y: number; s: number; a: number };
const DECOR: Decor[] = [];
for (let i = 0; i < 26; i++) {
  const a = rnd() * Math.PI * 2;
  const r = 0.2 + rnd() * 0.42;
  DECOR.push({ t: "lily", x: CX + Math.cos(a) * RX * r, y: CY + Math.sin(a) * RY * r, s: 18 + rnd() * 16, a: rnd() * 6 });
}
for (let i = 0; i < 60; i++) {
  const a = rnd() * Math.PI * 2;
  DECOR.push({ t: "reed", x: CX + Math.cos(a) * (RX + 30 + rnd() * 40), y: CY + Math.sin(a) * (RY + 26 + rnd() * 34), s: 22 + rnd() * 20, a: rnd() });
}
for (let i = 0; i < 40; i++) {
  const x = rnd() * PW;
  const y = rnd() * PH;
  if (((x - CX) / (RX + 90)) ** 2 + ((y - CY) / (RY + 80)) ** 2 > 1) DECOR.push({ t: "tree", x, y, s: 30 + rnd() * 26, a: 0 });
}
const SWIM = Array.from({ length: 24 }, () => ({ a: rnd() * Math.PI * 2, r: 0.1 + rnd() * 0.5, sp: (0.04 + rnd() * 0.06) * (rnd() < 0.5 ? -1 : 1), len: 30 + rnd() * 40, ph: rnd() * 6 }));

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function drawFish(c: CanvasRenderingContext2D, x: number, y: number, len: number, col: string, ang: number, gold = false, wag = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  const h = len * 0.42;
  if (gold) {
    c.shadowColor = "rgba(253,224,71,.9)";
    c.shadowBlur = len * 0.5;
  }
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(-len * 0.38, 0);
  c.lineTo(-len * 0.62, -h * 0.55 + wag);
  c.lineTo(-len * 0.62, h * 0.55 + wag);
  c.closePath();
  c.fill();
  const g = c.createLinearGradient(0, -h / 2, 0, h / 2);
  if (gold) {
    g.addColorStop(0, "#fff3a3");
    g.addColorStop(0.5, "#f5c542");
    g.addColorStop(1, "#b7791f");
  } else {
    g.addColorStop(0, shade(col, 30));
    g.addColorStop(1, shade(col, -25));
  }
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, len * 0.45, h / 2, 0, 0, Math.PI * 2);
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = "rgba(0,0,0,.18)";
  c.beginPath();
  c.moveTo(-len * 0.05, -h * 0.45);
  c.quadraticCurveTo(len * 0.05, -h * 0.85, len * 0.15, -h * 0.42);
  c.fill();
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(len * 0.27, -h * 0.08, len * 0.06, 0, 7);
  c.fill();
  c.fillStyle = "#111";
  c.beginPath();
  c.arc(len * 0.29, -h * 0.08, len * 0.03, 0, 7);
  c.fill();
  c.restore();
}

export function drawPond(c: CanvasRenderingContext2D, t: number, frenzy: boolean) {
  const g = c.createLinearGradient(0, 0, 0, PH);
  g.addColorStop(0, "#5fae4e");
  g.addColorStop(1, "#3f8f3a");
  c.fillStyle = g;
  c.fillRect(-600, -600, PW + 1200, PH + 1200);
  for (const d of DECOR)
    if (d.t === "tree") {
      c.fillStyle = "rgba(0,0,0,.15)";
      c.beginPath();
      c.ellipse(d.x + 6, d.y + 10, d.s, d.s * 0.6, 0, 0, 7);
      c.fill();
      c.fillStyle = "#2f7d32";
      c.beginPath();
      c.arc(d.x, d.y, d.s, 0, 7);
      c.fill();
      c.fillStyle = "#43a047";
      c.beginPath();
      c.arc(d.x - d.s * 0.25, d.y - d.s * 0.25, d.s * 0.6, 0, 7);
      c.fill();
    }
  c.fillStyle = "#e6cf98";
  c.beginPath();
  c.ellipse(CX, CY, RX + 34, RY + 30, 0, 0, 7);
  c.fill();
  const w = c.createRadialGradient(CX, CY - 60, 40, CX, CY, RX);
  if (frenzy) {
    w.addColorStop(0, "#5eead4");
    w.addColorStop(1, "#1d4ed8");
  } else {
    w.addColorStop(0, "#5cc3ec");
    w.addColorStop(1, "#1f78b4");
  }
  c.fillStyle = w;
  c.beginPath();
  c.ellipse(CX, CY, RX, RY, 0, 0, 7);
  c.fill();
  c.save();
  c.beginPath();
  c.ellipse(CX, CY, RX, RY, 0, 0, 7);
  c.clip();
  c.strokeStyle = "rgba(255,255,255,.18)";
  c.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const x = (i * 211) % PW;
    const y = 120 + ((i * 97) % 700);
    const o = Math.sin(t / 900 + i) * 12;
    c.beginPath();
    c.moveTo(x - 40 + o, y);
    c.quadraticCurveTo(x + o, y - 8, x + 40 + o, y);
    c.stroke();
  }
  for (let k = 0; k < (frenzy ? 2 : 1); k++)
    for (const s of SWIM) {
      const a = s.a + (t / 1000) * s.sp * (frenzy ? 2.2 : 1) + k * 1.7;
      c.globalAlpha = 0.28;
      drawFish(c, CX + Math.cos(a) * RX * s.r, CY + Math.sin(a) * RY * s.r, s.len, "#0b3a5a", a + (s.sp > 0 ? Math.PI / 2 : -Math.PI / 2), false, Math.sin(t / 150 + s.ph) * 4);
      c.globalAlpha = 1;
    }
  c.restore();
  for (const d of DECOR) {
    if (d.t === "lily") {
      c.fillStyle = "#3f9d4a";
      c.beginPath();
      c.moveTo(d.x, d.y);
      c.arc(d.x, d.y, d.s, d.a, d.a + Math.PI * 1.75);
      c.closePath();
      c.fill();
      if (d.s > 28) {
        c.fillStyle = "#f9a8d4";
        c.beginPath();
        c.arc(d.x + 4, d.y - 3, 6, 0, 7);
        c.fill();
      }
    } else if (d.t === "reed") {
      const sway = Math.sin(t / 700 + d.a * 6) * 4;
      c.strokeStyle = "#2e6b2a";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(d.x, d.y);
      c.quadraticCurveTo(d.x + 6, d.y - d.s / 2, d.x + 2 + sway, d.y - d.s);
      c.stroke();
      c.fillStyle = "#7c4a1e";
      c.fillRect(d.x - 2 + sway, d.y - d.s - 10, 6, 14);
    }
  }
}

export type BoatLook = { snapped?: number; bite?: boolean; tags?: boolean; scale?: number; dim?: boolean };

export function drawBoat(c: CanvasRenderingContext2D, b: Boat, t: number, look: BoatLook = {}) {
  const k = look.scale ?? 1;
  const bob = Math.sin(t / 500 + b.i) * 3;
  const x = b.x;
  const y = b.y + bob;
  if (!look.snapped) {
    const bx = b.bx;
    const by = b.by + Math.sin(t / 380 + b.i * 2) * 4 + (look.bite ? 10 * Math.sin(t / 50) : 0);
    c.strokeStyle = "rgba(255,255,255,.75)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y - 6);
    c.quadraticCurveTo((x + bx) / 2, (y + by) / 2 - 30, bx, by);
    c.stroke();
    c.fillStyle = "#ef4444";
    c.beginPath();
    c.arc(bx, by - 3, 7, Math.PI, 0);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(bx, by - 3, 7, 0, Math.PI);
    c.fill();
  }
  c.save();
  c.translate(x, y);
  c.rotate(b.a + Math.PI / 2);
  c.scale(k, k);
  c.fillStyle = "rgba(0,0,0,.18)";
  c.beginPath();
  c.ellipse(4, 6, 46, 20, 0, 0, 7);
  c.fill();
  c.fillStyle = "#8b5a2b";
  c.beginPath();
  c.moveTo(-46, 0);
  c.quadraticCurveTo(-30, -22, 30, -18);
  c.quadraticCurveTo(52, 0, 30, 18);
  c.quadraticCurveTo(-30, 22, -46, 0);
  c.fill();
  c.fillStyle = "#c08a45";
  c.beginPath();
  c.moveTo(-38, 0);
  c.quadraticCurveTo(-26, -14, 26, -11);
  c.quadraticCurveTo(42, 0, 26, 11);
  c.quadraticCurveTo(-26, 14, -38, 0);
  c.fill();
  c.restore();
  c.save();
  c.globalAlpha = look.snapped || look.dim ? 0.55 : 1;
  const r = 26 * k;
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(x, y - 4, r, 0, 7);
  c.fill();
  c.strokeStyle = b.color;
  c.lineWidth = 5 * Math.max(0.7, k);
  c.stroke();
  c.font = `${r * 1.2}px ${EMO}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#000";
  c.fillText(b.emoji, x, y - 2);
  if (look.tags !== false) {
    c.font = `700 ${16 * Math.max(0.85, k)}px ${BODY}`;
    const w = c.measureText(b.name).width + 12;
    rr(c, x - w / 2, y + r - 6, w, 21, 6);
    c.fillStyle = b.color;
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(b.name, x, y + r + 5);
  }
  c.restore();
  if (look.snapped) {
    c.fillStyle = "#dc2626";
    c.beginPath();
    c.arc(x + 24 * k, y - 28 * k, 15, 0, 7);
    c.fill();
    c.font = `800 18px ${DISP}`;
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(String(Math.ceil(look.snapped)), x + 24 * k, y - 27 * k);
  }
}

export function splash(c: CanvasRenderingContext2D, x: number, y: number, u: number, s = 1) {
  if (u < 0 || u > 1) return;
  c.save();
  c.globalAlpha = 1 - u;
  c.strokeStyle = "#fff";
  c.lineWidth = 4;
  for (const r of [1, 1.6]) {
    c.beginPath();
    c.ellipse(x, y, (14 + u * 40 * r) * s, (6 + u * 14 * r) * s, 0, 0, 7);
    c.stroke();
  }
  c.fillStyle = "#e0f2fe";
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.1 + (0.8 * i) / 6);
    c.beginPath();
    c.arc(x + Math.cos(a) * u * 40 * s, y + Math.sin(a) * u * 50 * s + u * u * 40, 4 * s, 0, 7);
    c.fill();
  }
  c.restore();
}

export function outlined(c: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, w = 800, line = 9) {
  c.font = `${w} ${size}px ${DISP}, ${EMO}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.lineJoin = "round";
  c.strokeStyle = "#fff";
  c.lineWidth = line;
  c.strokeText(s, x, y);
  c.fillStyle = col;
  c.fillText(s, x, y);
}

export function floatText(c: CanvasRenderingContext2D, s: string, x: number, y: number, u: number, col: string, size: number, ms?: string) {
  if (u < 0 || u > 1) return;
  c.save();
  c.globalAlpha = u > 0.75 ? (1 - u) / 0.25 : 1;
  const pop = u < 0.12 ? easeOut(u / 0.12) : 1;
  c.translate(x, y - easeOut(u) * 30);
  c.scale(pop, pop);
  outlined(c, s, 0, 0, size, col);
  if (ms) outlined(c, ms, 0, size * 0.75, size * 0.5, col, 700, 7);
  c.restore();
}

export function star(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
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

/** A fish jumping from the bobber into the boat (u = 0 → 1). */
export function leapingFish(c: CanvasRenderingContext2D, b: Boat, u: number, t: number, kind: "fish" | "big" | "gold", lift = 1) {
  const p = easeOut(clamp(u));
  const big = kind !== "fish";
  const h = (big ? 130 : 70) * lift;
  const x = b.bx + (b.x - b.bx) * p;
  const y = b.by + (b.y - b.by) * p - Math.sin(Math.PI * p) * h - (p >= 1 && big ? 30 + Math.sin(t / 200) * 6 : 0);
  drawFish(c, x, y, kind === "gold" ? 92 : kind === "big" ? 74 : 36, kind === "gold" ? "#f5c542" : kind === "big" ? "#0e7490" : "#94a3b8", b.a + Math.PI, kind === "gold", Math.sin(t / 55) * 5);
}
