// Pull the Rope drawing: the wooden peg dolls (owner's pick, character draft 5) and the river crossing seen
// from the side (projector draft B2, wider river). Plain 2D canvas, no libraries.
import { SIDE_NAME, type Side } from "./rules.ts";

export const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const DISP = '"Baloo 2","Trebuchet MS",system-ui,sans-serif';
export const BODY = '"Figtree",system-ui,sans-serif';
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

/** The projector scene in logical pixels; it is scaled to fit the screen. */
export const SW = 1200;
export const SH = 680;
export const CX = SW / 2;
/** River banks: the flag reaching a bank edge wins the round. */
export const RIVER_L = CX - 210;
export const RIVER_R = CX + 210;
export const FLAG_TRAVEL = RIVER_R - CX;
export const GRASS_TOP = 438;
export const GRASS_EDGE = 488;
export const WATER_Y = 506;
export const ROPE_Y = 426;

export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}
function circ(c: CanvasRenderingContext2D, x: number, y: number, r: number, fill?: string, stroke?: string, lw = 2) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.stroke();
  }
}
function line(c: CanvasRenderingContext2D, a: [number, number], b: [number, number], w: number, col: string) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(a[0], a[1]);
  c.lineTo(b[0], b[1]);
  c.stroke();
}
/** An emoji that is never drawn mirrored. */
export function emoji(c: CanvasRenderingContext2D, e: string, x: number, y: number, size: number, mirror = 1) {
  c.save();
  c.translate(x, y);
  c.scale(mirror, 1);
  c.font = `${size}px ${EMO}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(e, 0, size * 0.05);
  c.restore();
}

export type Pose = "pull" | "power" | "wet" | "win" | "stand";
const WOOD = "#e9c891";
const HAIR = ["#2b1d14", "#7c2d12", "#111827", "#a16207", "#4a2f1f"];

/**
 * A wooden peg doll, side view. (x, gy) = the foot of the peg; `face` = +1 facing right (towards the rope's
 * other end), −1 facing left. `ropeY` = where the hands hold the rope (null = no rope, e.g. cheering).
 */
export function pegDoll(c: CanvasRenderingContext2D, o: { x: number; gy: number; s: number; face: 1 | -1; side: Side; emoji: string; pose: Pose; i: number; t: number; ropeY: number | null; you?: boolean }) {
  const { s, face, pose, t, i } = o;
  const col = SIDE_NAME[o.side];
  let lean = { pull: 0.4, power: 0.6, wet: 0.08, win: 0, stand: 0.05 }[pose];
  if (pose === "power") lean += Math.sin(t / 36 + i) * 0.025;
  if (pose === "wet") lean += Math.sin(t / 330 + i) * 0.08;
  if (pose === "pull") lean += Math.sin(t / 500 + i) * 0.02;
  const jump = pose === "win" ? -Math.abs(Math.sin(t / 200 + i)) * 16 : 0;
  if (pose !== "wet") {
    c.fillStyle = "rgba(0,0,0,.14)";
    c.beginPath();
    c.ellipse(o.x - face * 6 * s, o.gy + 2, 22 * s, 5 * s, 0, 0, Math.PI * 2);
    c.fill();
  }
  const outer = c.getTransform();
  c.save();
  c.translate(o.x, o.gy + jump * s);
  c.scale(face * s, s);
  c.rotate(-lean);
  let hand: [number, number] = [22, -48];
  if (o.ropeY !== null) {
    // The rope point in this doll's own (leaning, mirrored) coordinates.
    const p = c.getTransform().invertSelf().transformPoint(outer.transformPoint(new DOMPoint(o.x + face * 24 * s, o.ropeY)));
    hand = [p.x, p.y];
  }
  let hands: [number, number][];
  if (pose === "win") hands = [[-16 + Math.sin(t / 100) * 3, -100], [16 - Math.sin(t / 100) * 3, -100]];
  else if (pose === "wet") hands = [hand, [-8 + Math.sin(t / 70 + i) * 10, -104]];
  else if (pose === "stand") hands = [[10, -30], [-4, -30]];
  else hands = [hand, [hand[0] - 7, hand[1] + 3]];

  // base and body
  c.fillStyle = "#d4a86a";
  c.beginPath();
  c.ellipse(0, -3, 13, 4, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = WOOD;
  c.beginPath();
  c.moveTo(-12, -4);
  c.lineTo(12, -4);
  c.lineTo(10, -14);
  c.lineTo(-10, -14);
  c.fill();
  c.fillStyle = col.color;
  c.beginPath();
  c.moveTo(-10, -14);
  c.lineTo(10, -14);
  c.quadraticCurveTo(13, -40, 8, -56);
  c.lineTo(-8, -56);
  c.quadraticCurveTo(-13, -40, -10, -14);
  c.fill();
  c.fillStyle = col.dark;
  c.fillRect(-10, -20, 20, 3);
  // The badge on the belly: no pieces outside Snake & Ladder (owner, eighth session), so it is left off when empty.
  if (o.emoji) {
    circ(c, 1, -36, 8.5, "#fff");
    emoji(c, o.emoji, 1, -36, 11.5, face);
  }
  for (const h of hands) {
    line(c, [0, -52], h, 5, "#d9b277");
    circ(c, h[0], h[1], 3.5, WOOD);
  }
  c.fillStyle = WOOD;
  c.fillRect(-4, -62, 8, 8);
  const hy = -74;
  const r = 15;
  circ(c, 0, hy, r, WOOD, "#c9a46b", 1.5);
  c.fillStyle = HAIR[i % HAIR.length];
  c.beginPath();
  c.arc(0, hy, r + 0.5, Math.PI * 0.9, Math.PI * 1.95);
  c.quadraticCurveTo(0, hy - 6, -6, hy);
  c.closePath();
  c.fill();
  // painted face
  c.fillStyle = "#1f2937";
  c.strokeStyle = "#1f2937";
  if (pose === "win") {
    c.lineWidth = 2;
    for (const ex of [3, 10]) {
      c.beginPath();
      c.arc(ex, hy + 1, 2.5, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    }
    c.beginPath();
    c.arc(7, hy + 6, 4, 0.2, Math.PI - 0.2);
    c.stroke();
  } else if (pose === "wet") {
    for (const ex of [3, 10]) circ(c, ex, hy, 2.6, "#1f2937");
    c.beginPath();
    c.ellipse(7, hy + 7, 2.2, 3, 0, 0, Math.PI * 2);
    c.fill();
  } else if (pose === "power") {
    for (const ex of [3, 10]) line(c, [ex - 2, hy], [ex + 2, hy], 1.8, "#1f2937");
    line(c, [4, hy + 7], [10, hy + 7], 1.8, "#1f2937");
  } else {
    for (const ex of [3, 10]) circ(c, ex, hy, 1.8, "#1f2937");
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(7, hy + 5, 3, 0.3, Math.PI - 0.3);
    c.stroke();
  }
  c.fillStyle = "rgba(239,68,68,.35)";
  c.beginPath();
  c.arc(12, hy + 4, 2.5, 0, Math.PI * 2);
  c.fill();
  if (pose === "power" && Math.sin(t / 110) > 0) {
    c.fillStyle = "#7dd3fc";
    c.beginPath();
    c.ellipse(-18, -88, 2.5, 4, 0, 0, Math.PI * 2);
    c.ellipse(-24, -80, 2, 3.5, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  if (o.you) {
    const ay = o.gy - 100 * s + jump * s;
    c.fillStyle = "#facc15";
    c.strokeStyle = "#713f12";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(o.x - 9, ay - 10);
    c.lineTo(o.x + 9, ay - 10);
    c.lineTo(o.x, ay + 3);
    c.closePath();
    c.fill();
    c.stroke();
  }
}

// ---------- the river scene ----------

export function drawBackground(c: CanvasRenderingContext2D, t: number, heave: boolean) {
  const g = c.createLinearGradient(0, 0, 0, GRASS_TOP);
  g.addColorStop(0, heave ? "#fb923c" : "#6cc6f5");
  g.addColorStop(1, heave ? "#fde68a" : "#d6f1ff");
  c.fillStyle = g;
  c.fillRect(0, 0, SW, GRASS_TOP + 2);
  circ(c, 1040, 110, 50, "#fff3a3");
  const cloud = (x: number, y: number, k: number) => {
    c.fillStyle = "rgba(255,255,255,.95)";
    for (const [a, b, r] of [
      [0, 0, 30],
      [28, -12, 34],
      [60, 0, 28],
      [30, 8, 30],
    ])
      circ(c, x + a * k, y + b * k, r * k, "rgba(255,255,255,.95)");
  };
  const d = (t / 120) % (SW + 200);
  cloud(((160 + d) % (SW + 200)) - 100, 150, 1);
  cloud(((700 + d * 0.6) % (SW + 200)) - 100, 92, 0.8);
  // hills and trees
  c.fillStyle = "#9ad37a";
  c.beginPath();
  c.moveTo(0, GRASS_TOP);
  for (let x = 0; x <= SW; x += 40) c.lineTo(x, GRASS_TOP - 60 - Math.sin(x / 130) * 24);
  c.lineTo(SW, GRASS_TOP);
  c.fill();
  c.fillStyle = "#83c564";
  c.beginPath();
  c.moveTo(0, GRASS_TOP);
  for (let x = 0; x <= SW; x += 40) c.lineTo(x, GRASS_TOP - 34 - Math.sin(x / 90 + 2) * 14);
  c.lineTo(SW, GRASS_TOP);
  c.fill();
  for (let i = 0; i < 20; i++) {
    const x = 20 + i * 62;
    c.fillStyle = "#7c4a1e";
    c.fillRect(x - 4, GRASS_TOP - 34, 8, 30);
    circ(c, x, GRASS_TOP - 44, 24, i % 3 ? "#2f7d32" : "#3a8f3c");
  }
  // water (the far part is seen between the banks)
  const wg = c.createLinearGradient(0, GRASS_TOP, 0, SH);
  wg.addColorStop(0, "#5cc3ec");
  wg.addColorStop(1, "#1f78b4");
  c.fillStyle = wg;
  c.fillRect(RIVER_L - 40, GRASS_TOP, RIVER_R - RIVER_L + 80, SH - GRASS_TOP);
  c.strokeStyle = "rgba(255,255,255,.55)";
  c.lineWidth = 3;
  for (let k = 0; k < 6; k++) {
    const y = GRASS_TOP + 18 + k * 34;
    const o = (t / 33 + k * 20) % 40;
    c.beginPath();
    for (let x = RIVER_L + 20; x < RIVER_R - 20; x += 4) c.lineTo(x, y + Math.sin((x + o) / 11) * 3);
    c.stroke();
  }
  // banks
  const bank = (x0: number, edge: number, dir: 1 | -1) => {
    c.fillStyle = "#8b5a2b";
    c.beginPath();
    c.moveTo(x0, GRASS_EDGE);
    c.lineTo(edge, GRASS_EDGE);
    c.lineTo(edge + dir * 46, SH);
    c.lineTo(x0, SH);
    c.fill();
    c.fillStyle = "#7a4f24";
    for (let k = 0; k < 3; k++) c.fillRect(Math.min(x0, edge), GRASS_EDGE + 50 + k * 50, Math.abs(edge - x0) - 10, 5);
    c.fillStyle = "#6fc24d";
    c.beginPath();
    c.moveTo(x0, GRASS_TOP);
    c.lineTo(edge, GRASS_TOP);
    c.lineTo(edge + dir * 6, GRASS_EDGE);
    c.lineTo(x0, GRASS_EDGE);
    c.fill();
    c.fillStyle = "#62b443";
    c.fillRect(Math.min(x0, edge + dir * 3), GRASS_TOP + 16, Math.abs(edge - x0), 8);
  };
  bank(0, RIVER_L, 1);
  bank(SW, RIVER_R, -1);
  // win posts on each bank edge
  for (const side of ["red", "blue"] as Side[]) {
    const x = side === "red" ? RIVER_L - 10 : RIVER_R + 10;
    const dir = side === "red" ? 1 : -1;
    c.fillStyle = "#7c4a1e";
    c.fillRect(x - 3, GRASS_TOP - 62, 6, 70);
    c.fillStyle = SIDE_NAME[side].color;
    c.beginPath();
    c.moveTo(x + 3 * dir, GRASS_TOP - 60);
    c.lineTo(x + dir * 34, GRASS_TOP - 50);
    c.lineTo(x + 3 * dir, GRASS_TOP - 38);
    c.fill();
  }
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const side of ["red", "blue"] as Side[]) {
    const x = side === "red" ? RIVER_L - 140 : RIVER_R + 140;
    rr(c, x - 110, SH - 46, 220, 34, 17);
    c.fillStyle = SIDE_NAME[side].color;
    c.fill();
    c.font = `800 17px ${DISP}`;
    c.fillStyle = "#fff";
    c.fillText(`${SIDE_NAME[side].en.toUpperCase()} WINS · ${SIDE_NAME[side].ms.toUpperCase()} MENANG`, x, SH - 28);
  }
}

/** The water in front of anyone standing in the river (covers their legs). */
export function drawFrontWater(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = "rgba(31,120,180,.9)";
  c.beginPath();
  c.moveTo(RIVER_L + 4, SH);
  for (let x = RIVER_L + 4; x <= RIVER_R - 4; x += 6) c.lineTo(x, WATER_Y + Math.sin(x / 14 + t / 330) * 4);
  c.lineTo(RIVER_R - 4, SH);
  c.fill();
  c.fillStyle = "rgba(224,242,254,.9)";
  c.font = `800 22px ${DISP}`;
  c.textAlign = "center";
  c.fillText("RIVER · SUNGAI", CX, SH - 26);
}

export function drawRope(c: CanvasRenderingContext2D, x1: number, x2: number, y: number) {
  c.lineCap = "round";
  c.strokeStyle = "#7c4a1e";
  c.lineWidth = 11;
  c.beginPath();
  c.moveTo(x1, y);
  c.quadraticCurveTo((x1 + x2) / 2, y + 8, x2, y);
  c.stroke();
  c.strokeStyle = "#c08a45";
  c.lineWidth = 7;
  c.stroke();
}

export function drawFlag(c: CanvasRenderingContext2D, x: number, y: number) {
  c.strokeStyle = "#7c5a00";
  c.lineWidth = 2;
  c.fillStyle = SIDE_NAME.red.color;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x - 12, y + 40);
  c.lineTo(x, y + 35);
  c.fill();
  c.fillStyle = SIDE_NAME.blue.color;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x + 12, y + 40);
  c.lineTo(x, y + 35);
  c.fill();
  circ(c, x, y, 8, "#fde047", "#7c5a00", 2);
}

/** The tug meter: the flag between the two banks, filled from the centre in the leading team's colour. */
export function drawMeter(c: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, x: number) {
  rr(c, x0, y0, w, h, h / 2);
  c.fillStyle = "#fff";
  c.fill();
  c.save();
  rr(c, x0 + 3, y0 + 3, w - 6, h - 6, (h - 6) / 2);
  c.clip();
  c.fillStyle = "#e5e7eb";
  c.fillRect(x0, y0, w, h);
  const mid = x0 + w / 2 + x * (w / 2 - 3);
  c.fillStyle = x < 0 ? SIDE_NAME.red.color : SIDE_NAME.blue.color;
  c.fillRect(Math.min(mid, x0 + w / 2), y0, Math.abs(mid - x0 - w / 2), h);
  c.restore();
  c.fillStyle = "#fff";
  c.fillRect(x0 + w / 2 - 1.5, y0 - 4, 3, h + 8);
  circ(c, mid, y0 + h / 2, h * 0.62, "#fde047", "#7c5a00", 3);
  emoji(c, "🚩", mid, y0 + h / 2, h * 0.6);
}

// ---------- team layout on the projector ----------

export type Spot = { uid: string; side: Side; row: number; dist: number; s: number; gy: number; index: number };

/** Where each player stands: front to back from the river, in 1–3 rows depending on team size. */
export function layoutSide(side: Side, uids: string[]): Spot[] {
  const n = uids.length;
  const rows = n <= 8 ? 1 : n <= 16 ? 2 : 3;
  const cols = Math.ceil(n / rows);
  const front = RIVER_R - CX + 30;
  const room = CX - 40 - front;
  const sp = Math.min(62, room / Math.max(1, cols - 0.5));
  const s0 = rows === 1 ? 1.35 : rows === 2 ? 1.15 : 1.0;
  return uids.map((uid, i) => {
    const row = i % rows;
    const col = Math.floor(i / rows);
    return { uid, side, row, dist: front + col * sp + row * sp * 0.5, s: s0 * (1 - row * 0.09), gy: GRASS_EDGE - 6 - row * 17, index: i };
  });
}

// ---------- splashes ----------

export type Drop = { x: number; y: number; vx: number; vy: number; r: number; life: number; white: boolean };
export type Pop = { x: number; y: number; t: number; k: number };

export function addSplash(drops: Drop[], pops: Pop[], x: number, y: number, k = 1, label = true) {
  for (let n = 0; n < 24; n++) drops.push({ x: x + (Math.random() - 0.5) * 30 * k, y, vx: (Math.random() - 0.5) * 360 * k, vy: -(150 + Math.random() * 320) * k, r: (3 + Math.random() * 5) * k, life: 1, white: Math.random() < 0.3 });
  if (label) pops.push({ x, y: y - 50 * k, t: 1, k });
}

export function drawSplashes(c: CanvasRenderingContext2D, drops: Drop[], pops: Pop[], dt: number, gravity = 900) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const q = drops[i];
    q.vy += gravity * dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.life -= dt * 1.1;
    if (q.life <= 0) {
      drops.splice(i, 1);
      continue;
    }
    c.globalAlpha = Math.min(1, q.life * 1.5);
    circ(c, q.x, q.y, q.r, q.white ? "#ffffff" : "#bfe9ff");
  }
  c.globalAlpha = 1;
  for (let i = pops.length - 1; i >= 0; i--) {
    const q = pops[i];
    q.t -= dt * 0.8;
    if (q.t <= 0) {
      pops.splice(i, 1);
      continue;
    }
    c.save();
    c.globalAlpha = Math.min(1, q.t * 2);
    c.translate(q.x, q.y - (1 - q.t) * 40 * q.k);
    const z = (1 + (1 - q.t) * 0.3) * q.k;
    c.scale(z, z);
    c.font = `800 34px ${DISP}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 5;
    c.strokeStyle = "#0e7490";
    c.strokeText("SPLASH!", 0, 0);
    c.fillStyle = "#fff";
    c.fillText("SPLASH!", 0, 0);
    c.restore();
  }
}
