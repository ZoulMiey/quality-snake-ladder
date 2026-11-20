// Pull the Rope on a phone: camera high behind your own team (owner's pick P2), looking along the rope across
// the river at the other team. Simple 3D projection on a 2D canvas; the peg dolls are flat cut-outs.
// The camera stays fixed behind you (no zoom); the field slides as the rope moves.
// World units: the rope runs along u; your bank is at +u, the river from −RH to +RH; z = across the field.
import { SIDE_NAME, other, type Side } from "./rules.ts";
import { addSplash, clamp, drawSplashes, ease, EMO, type Drop, type Pop } from "./scene.ts";

const RH = 1.6;
const LEAD = 2.05;
const CAM_OFF: [number, number, number] = [4.4, 3.7, 0.2];
const CAM_TGT: [number, number, number] = [-7, 0, 0];
const WOOD = "#e9c891";
const HAIR = ["#2b1d14", "#7c2d12", "#111827", "#a16207", "#4a2f1f"];

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

export type PhoneScene = {
  me: string;
  mySide: Side;
  order: Record<Side, string[]>;
  emoji: Record<string, string>;
  /** Flag position, −1 (Red bank) … +1 (Blue bank). */
  x: number;
  /** The round just ended: who won and when (server time), or null while playing. */
  over: { win: Side; at: number } | null;
  now: number;
  /** Players who just did a POWER PULL (from the live feed), uid → until (performance.now()). */
  power: Record<string, number>;
  /** My own last pull (performance.now()), for a quick extra lean. */
  myPullAt: number;
  heave: boolean;
};

/** Things the phone keeps between frames. */
export type PhoneMemory = { shownX: number; wet: Record<string, number>; drops: Drop[]; pops: Pop[]; last: number; splashAt: number };
export const newPhoneMemory = (): PhoneMemory => ({ shownX: 0, wet: {}, drops: [], pops: [], last: 0, splashAt: 0 });

/** Draws one frame. Returns true when someone just fell in (for a splash sound). */
export function drawRopePhone(c: CanvasRenderingContext2D, W: number, H: number, sc: PhoneScene, mem: PhoneMemory, t: number): boolean {
  const dt = mem.last ? Math.min(0.05, (t - mem.last) / 1000) : 0;
  mem.last = t;
  mem.shownX += (sc.x - mem.shownX) * Math.min(1, dt * 6);
  const sign = sc.mySide === "blue" ? 1 : -1;
  const s = mem.shownX * sign * RH;
  const myCol = SIDE_NAME[sc.mySide];
  const opCol = SIDE_NAME[other(sc.mySide)];
  let fell = false;

  // Where everyone stands (u along the rope, my team on +u).
  type Fig = { uid: string; mine: boolean; u: number; z: number; i: number; wet: number; pose: "pull" | "power" | "wet" | "win" };
  const figs: Fig[] = [];
  const place = (side: Side) => {
    const mine = side === sc.mySide;
    const dir = mine ? 1 : -1;
    const ids = sc.order[side];
    const n = ids.length;
    const gap = n <= 6 ? 1.35 : Math.max(0.42, 8 / (n - 1));
    const loser = sc.over && sc.over.win !== side;
    ids.forEach((uid, i) => {
      let u = dir * (LEAD + i * gap);
      u += dir * s > 0 ? s * 0.3 : s;
      let pose: Fig["pose"] = (sc.power[uid] ?? 0) > t || (uid === sc.me && t - sc.myPullAt < 700) ? "power" : "pull";
      if (sc.over) {
        const e = ease(clamp((sc.now - sc.over.at - i * 110) / 900));
        if (loser) {
          const frac = n > 1 ? i / (n - 1) : 0;
          const spot = mine ? -RH + 0.35 + frac * (2 * RH - 0.7) * 0.85 : RH - 0.35 - frac * (2 * RH - 0.7) * 0.85;
          u += (spot - u) * e;
        } else if (e > 0.3) pose = "win";
      }
      const inRiver = Math.abs(u) < RH - 0.05;
      const was = (mem.wet[uid] ??= inRiver ? 1 : 0);
      mem.wet[uid] = was + ((inRiver ? 1 : 0) - was) * Math.min(1, dt * 9);
      if (inRiver && was < 0.05) fell = true;
      if (mem.wet[uid] > 0.05) pose = "wet";
      figs.push({ uid, mine, u, z: i % 2 ? -0.32 : 0.32, i, wet: mem.wet[uid], pose });
    });
  };
  place(sc.mySide);
  place(other(sc.mySide));
  const me = figs.find((f) => f.uid === sc.me) ?? { u: LEAD, z: 0.32 };

  // Camera behind me.
  const C: V3 = [me.u + CAM_OFF[0], CAM_OFF[1], CAM_OFF[2]];
  const T: V3 = [me.u + CAM_TGT[0], CAM_TGT[1], CAM_TGT[2]];
  const f = norm(sub(T, C));
  const r = norm(cross(f, [0, 1, 0]));
  const up = cross(r, f);
  const F = W * 1.0;
  const cx = W / 2;
  const cy = H * 0.3;
  const P = (p: V3) => {
    const d = sub(p, C);
    const z = dot(d, f);
    if (z < 0.25) return null;
    return { x: cx + (F * dot(d, r)) / z, y: cy - (F * dot(d, up)) / z, z, k: F / z };
  };

  // Sky, far bank, crowd.
  const far = P([C[0] + f[0] * 900, 0, C[2] + f[2] * 900]);
  const hy = far ? far.y : H * 0.15;
  const g = c.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, sc.heave ? "#fb923c" : "#6cc6f5");
  g.addColorStop(1, sc.heave ? "#fde68a" : "#d6f1ff");
  c.fillStyle = g;
  c.fillRect(0, 0, W, hy + 1);
  c.fillStyle = "#9ad37a";
  c.beginPath();
  c.moveTo(0, hy);
  for (let x = 0; x <= W; x += 20) c.lineTo(x, hy - 10 - Math.sin(x / 40) * 7);
  c.lineTo(W, hy);
  c.fill();
  c.fillStyle = "#2f7d32";
  for (let i = 0; i < 12; i++) {
    c.beginPath();
    c.arc(14 + i * (W / 11), hy - 10, 11, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = "#6fc24d";
  c.fillRect(0, hy, W, H - hy);
  const quad = (pts: V3[], col: string) => {
    const q = pts.map(P);
    if (q.some((v) => !v)) return;
    c.fillStyle = col;
    c.beginPath();
    q.forEach((v, i) => (i ? c.lineTo(v!.x, v!.y) : c.moveTo(v!.x, v!.y)));
    c.fill();
  };
  for (let x = -24; x < 30; x += 2) if (Math.round(x / 2) % 2 === 0) quad([[x, 0, -9], [x + 2, 0, -9], [x + 2, 0, 9], [x, 0, 9]], "#62b443");
  quad([[-RH - 0.3, 0, -14], [RH + 0.3, 0, -14], [RH + 0.3, 0, 14], [-RH - 0.3, 0, 14]], "#8b5a2b");
  quad([[-RH, 0, -14], [RH, 0, -14], [RH, 0, 14], [-RH, 0, 14]], "#3aa6dc");
  for (let k = 0; k < 5; k++) {
    const xw = -RH + 0.3 + k * 0.65;
    const zo = ((t / 1600 + k * 0.7) % 4) - 2;
    quad([[xw, 0, zo - 0.5], [xw + 0.04, 0, zo - 0.5], [xw + 0.04, 0, zo + 0.5], [xw, 0, zo + 0.5]], "rgba(255,255,255,.55)");
  }
  // Win lines: the bank edges in each team's colour (their own bank: the flag reaching it wins).
  quad([[RH, 0, -3.6], [RH + 0.14, 0, -3.6], [RH + 0.14, 0, 3.6], [RH, 0, 3.6]], myCol.color);
  quad([[-RH - 0.14, 0, -3.6], [-RH, 0, -3.6], [-RH, 0, 3.6], [-RH - 0.14, 0, 3.6]], opCol.color);

  // The rope.
  const ropeTo = Math.max(...figs.filter((x) => x.mine).map((x) => x.u), LEAD) + 0.3;
  const ropeFrom = Math.min(...figs.filter((x) => !x.mine).map((x) => x.u), -LEAD) - 0.3;
  const rp: ({ x: number; y: number; k: number } | null)[] = [];
  for (let u = ropeFrom; u <= ropeTo; u += 0.2) rp.push(P([u, 1.0 - 0.08 * Math.sin((Math.PI * (u - ropeFrom)) / (ropeTo - ropeFrom)), 0]));
  c.lineCap = "round";
  for (let i = 1; i < rp.length; i++) {
    const a = rp[i - 1];
    const b = rp[i];
    if (!a || !b) continue;
    c.strokeStyle = "#7c4a1e";
    c.lineWidth = Math.max(1.5, b.k * 0.09);
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
    c.strokeStyle = "#c08a45";
    c.lineWidth = Math.max(1, b.k * 0.06);
    c.stroke();
  }

  // Figures and the flag, far to near.
  type Item = { d: number; draw: () => void };
  const items: Item[] = [];
  const myDepth = P([me.u, 0, me.z])?.z ?? 0;
  for (const fg of figs) {
    const ft = P([fg.u, 0, fg.z]);
    if (!ft) continue;
    // Teammates behind you would stand between you and the camera: leave them out (the projector shows them).
    if (fg.mine && fg.uid !== sc.me && ft.z < myDepth - 0.2) continue;
    items.push({ d: ft.z, draw: () => drawPeg(c, P, C, fg, sc, t, myCol.color, opCol.color, ft) });
  }
  const fl = P([s, 1.0, 0]);
  if (fl)
    items.push({
      d: fl.z,
      draw: () => {
        const k = fl.k;
        c.fillStyle = SIDE_NAME.red.color;
        c.beginPath();
        c.moveTo(fl.x, fl.y);
        c.lineTo(fl.x - 0.14 * k, fl.y + 0.5 * k);
        c.lineTo(fl.x, fl.y + 0.42 * k);
        c.fill();
        c.fillStyle = SIDE_NAME.blue.color;
        c.beginPath();
        c.moveTo(fl.x, fl.y);
        c.lineTo(fl.x + 0.14 * k, fl.y + 0.5 * k);
        c.lineTo(fl.x, fl.y + 0.42 * k);
        c.fill();
        c.beginPath();
        c.arc(fl.x, fl.y, Math.max(4, 0.1 * k), 0, Math.PI * 2);
        c.fillStyle = "#fde047";
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = "#7c5a00";
        c.stroke();
      },
    });
  items.sort((a, b) => b.d - a.d).forEach((it) => it.draw());
  if (fell) {
    for (const fg of figs) {
      if (fg.wet > 0.05 && fg.wet < 0.3) {
        const p = P([fg.u, 0, fg.z]);
        if (p) addSplash(mem.drops, mem.pops, p.x, p.y, Math.max(0.35, Math.min(0.8, p.k / 90)), mem.pops.length < 2);
      }
    }
  }
  drawSplashes(c, mem.drops, mem.pops, dt, 500);
  return fell;
}

function drawPeg(
  c: CanvasRenderingContext2D,
  P: (p: V3) => { x: number; y: number; z: number; k: number } | null,
  C: V3,
  fg: { uid: string; mine: boolean; u: number; z: number; i: number; wet: number; pose: "pull" | "power" | "wet" | "win" },
  sc: PhoneScene,
  t: number,
  myColor: string,
  opColor: string,
  foot: { x: number; y: number; z: number; k: number },
) {
  const b = fg.mine ? 1 : -1; // leans away from the river
  const L = fg.pose === "power" ? 1.6 : fg.pose === "win" || fg.pose === "wet" ? 0.15 : 1 + Math.sin(t / 500 + fg.i) * 0.06;
  const yo = -0.75 * fg.wet;
  const jump = fg.pose === "win" ? Math.abs(Math.sin(t / 200 + fg.i)) * 0.25 : 0;
  const u = fg.u;
  const z = fg.z;
  const base = P([u, yo + jump, z]);
  const neck = P([u + b * 0.42 * L, 1.18 + yo + jump, z]);
  const head = P([u + b * 0.52 * L, 1.45 + yo + jump, z]);
  const sh = P([u + b * 0.38 * L, 1.1 + yo + jump, z]);
  if (!base || !neck || !head || !sh) return;
  const color = fg.mine ? myColor : opColor;
  const front = dot([-b, 0, 0], sub(C, [u, 1, z])) > 0;
  const k = base.k;
  c.save();
  if (fg.wet > 0.05) {
    // Only what is above the water shows.
    c.beginPath();
    c.rect(0, 0, c.canvas.width, foot.y);
    c.clip();
  } else {
    c.fillStyle = "rgba(0,0,0,.15)";
    c.beginPath();
    c.ellipse(foot.x, foot.y, Math.max(0.5, 0.3 * k), Math.max(0.5, 0.08 * k), 0, 0, Math.PI * 2);
    c.fill();
  }
  const hands: { x: number; y: number }[] = [];
  if (fg.pose === "win") {
    for (const dz of [-0.22, 0.22]) {
      const h = P([u + b * 0.5, 2.0 + yo + jump, z + dz]);
      if (h) hands.push(h);
    }
  } else {
    const h = P([u - b * 0.3, 1.0, z * 0.15]);
    if (h) hands.push(h);
    if (fg.pose === "wet") {
      const h2 = P([u + b * 0.3, 2.0 + yo + Math.sin(t / 70 + fg.i) * 0.15, z + 0.2]);
      if (h2) hands.push(h2);
    }
  }
  const arm = () => {
    c.strokeStyle = "#d9b277";
    c.lineCap = "round";
    c.lineWidth = Math.max(1.2, 0.07 * k);
    for (const h of hands) {
      c.beginPath();
      c.moveTo(sh.x, sh.y);
      c.lineTo(h.x, h.y);
      c.stroke();
    }
  };
  if (!front) arm();
  // body: a tapered peg
  const ax = neck.x - base.x;
  const ay = neck.y - base.y;
  const len = Math.hypot(ax, ay) || 1;
  const nx = -ay / len;
  const ny = ax / len;
  const wb = 0.24 * k;
  const wn = 0.15 * neck.k;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(base.x + nx * wb, base.y + ny * wb);
  c.lineTo(neck.x + nx * wn, neck.y + ny * wn);
  c.lineTo(neck.x - nx * wn, neck.y - ny * wn);
  c.lineTo(base.x - nx * wb, base.y - ny * wb);
  c.closePath();
  c.fill();
  c.fillStyle = WOOD;
  c.beginPath();
  c.ellipse(base.x, base.y, wb * 1.05, wb * 0.35, 0, 0, Math.PI * 2);
  c.fill();
  // the piece: on the belly (front) or on the back
  const mx = base.x + ax * 0.55;
  const my = base.y + ay * 0.55;
  const br = Math.max(4, 0.12 * k);
  c.beginPath();
  c.arc(mx, my, br, 0, Math.PI * 2);
  c.fillStyle = "#fff";
  c.fill();
  c.font = `${br * 1.4}px ${EMO}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(sc.emoji[fg.uid] ?? "❔", mx, my + br * 0.07);
  if (front) arm();
  // head
  const hr = Math.max(3, 0.2 * head.k);
  c.beginPath();
  c.arc(head.x, head.y, hr, 0, Math.PI * 2);
  c.fillStyle = WOOD;
  c.fill();
  c.fillStyle = HAIR[fg.i % HAIR.length];
  c.beginPath();
  if (front) c.arc(head.x, head.y, hr + 0.5, Math.PI * 1.05, Math.PI * 1.95);
  else c.arc(head.x, head.y, hr, 0, Math.PI * 2);
  c.fill();
  if (!front) {
    c.fillStyle = WOOD;
    c.beginPath();
    c.ellipse(head.x, head.y + hr * 0.75, hr * 0.55, hr * 0.25, 0, 0, Math.PI * 2);
    c.fill();
  } else if (hr > 5) {
    c.fillStyle = "#1f2937";
    const ey = head.y - hr * 0.05;
    if (fg.pose === "wet") {
      c.beginPath();
      c.arc(head.x - hr * 0.3, ey, hr * 0.14, 0, Math.PI * 2);
      c.arc(head.x + hr * 0.3, ey, hr * 0.14, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(head.x, head.y + hr * 0.45, hr * 0.13, hr * 0.18, 0, 0, Math.PI * 2);
      c.fill();
    } else {
      c.beginPath();
      c.arc(head.x - hr * 0.3, ey, hr * 0.1, 0, Math.PI * 2);
      c.arc(head.x + hr * 0.3, ey, hr * 0.1, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#1f2937";
      c.lineWidth = Math.max(1, hr * 0.1);
      c.beginPath();
      c.arc(head.x, head.y + hr * 0.25, hr * 0.25, 0.3, Math.PI - 0.3);
      c.stroke();
    }
  }
  c.restore();
  if (fg.wet > 0.05) {
    c.strokeStyle = "rgba(255,255,255,.85)";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(foot.x, foot.y, Math.max(1, 0.4 * k + Math.sin(t / 160 + fg.i) * Math.min(2, 0.05 * k)), Math.max(0.5, 0.1 * k), 0, 0, Math.PI * 2);
    c.stroke();
  }
  if (fg.uid === sc.me) {
    const ay2 = head.y - hr - 16;
    c.fillStyle = "#facc15";
    c.strokeStyle = "#713f12";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(head.x - 10, ay2 - 10);
    c.lineTo(head.x + 10, ay2 - 10);
    c.lineTo(head.x, ay2 + 4);
    c.closePath();
    c.fill();
    c.stroke();
    c.beginPath();
    c.roundRect(head.x - 46, ay2 - 34, 92, 22, 11);
    c.fill();
    c.stroke();
    c.fillStyle = "#713f12";
    c.font = `800 13px "Baloo 2",system-ui,sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("YOU · ANDA", head.x, ay2 - 22.5);
  }
}
