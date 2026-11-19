// The full Snake & Ladder board on a player's phone, drawn on a canvas with a moving camera:
// the whole board, a zoom that follows the player's own piece, or a close-up of one snake or ladder.
import { useEffect, useRef } from "react";
import { COLS, LADDERS, LAST_BOX, ROWS, SNAKES, cellOf } from "../lib/board.ts";
import { tokenById } from "../lib/tokens.ts";
import { eventById, type SpecialBox } from "../lib/specials.ts";

const BW = COLS * 100;
const BOARD_H = ROWS * 100;
const BH = BOARD_H + 100; // + the START strip under box 1

/** Centre of a box in board units. Box 0 = the START strip. */
export function boxCentre(box: number) {
  if (box <= 0) return { x: 70, y: BOARD_H + 50 };
  const { col, row } = cellOf(Math.min(LAST_BOX, box));
  return { x: col * 100 + 50, y: row * 100 + 50 };
}

const SNAKE_COLORS = ["#d9465f", "#7c3aed", "#0d9488", "#ea580c", "#2563eb", "#65a30d", "#db2777", "#0891b2"];
const WOOD = [
  ["#9a6a2f", "#c08a45"],
  ["#7c4a1e", "#a8692f"],
  ["#a5702c", "#d6a35a"],
];

/** The snake's body line from head to tail (same curve as the projector board). */
function snakeLine(head: number, tail: number, i: number) {
  const a = boxCentre(head);
  const b = boxCentre(tail);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const waves = Math.max(1, Math.min(3, Math.round(len / 140))) + (i % 2 ? 0.5 : 0);
  const amp = Math.min(34, 12 + len * 0.05) * (i % 3 === 1 ? -1 : 1);
  const N = 48;
  return Array.from({ length: N + 1 }, (_, k) => {
    const t = k / N;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7);
    const w = amp * Math.sin(t * waves * Math.PI * 2) * env;
    return { x: a.x + dx * t + nx * w, y: a.y + dy * t + ny * w };
  });
}
const snakeIndex = (head: number) => Object.keys(SNAKES).indexOf(String(head));

function drawBoard(specials: SpecialBox[] | null | undefined): HTMLCanvasElement {
  const K = 2;
  const c = document.createElement("canvas");
  c.width = BW * K;
  c.height = BH * K;
  const g = c.getContext("2d")!;
  g.scale(K, K);
  g.fillStyle = "#1b6a4f";
  g.fillRect(0, 0, BW, BH);
  const sp = new Map((specials ?? []).map((s) => [s.box, eventById(s.id)]));
  for (let b = 1; b <= LAST_BOX; b++) {
    const { col, row } = cellOf(b);
    const ev = sp.get(b);
    g.fillStyle = b === LAST_BOX ? "#f5c542" : ev ? (ev.move > 0 ? "#c9f0d3" : "#f9d0d0") : (col + row) % 2 ? "#e3f2e6" : "#fbf6e9";
    g.fillRect(col * 100, row * 100, 100, 100);
    g.strokeStyle = "rgba(13,59,44,.1)";
    g.lineWidth = 1.5;
    g.strokeRect(col * 100, row * 100, 100, 100);
  }
  g.lineCap = "round";
  Object.entries(LADDERS).forEach(([f, t], i) => {
    const [rail, rung] = WOOD[i % WOOD.length];
    const a = boxCentre(+f);
    const b = boxCentre(t);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * 20;
    const ny = (dx / len) * 20;
    const n = Math.max(3, Math.round(len / 34));
    g.strokeStyle = rung;
    g.lineWidth = 7;
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      const x = a.x + dx * u;
      const y = a.y + dy * u;
      g.beginPath();
      g.moveTo(x + nx, y + ny);
      g.lineTo(x - nx, y - ny);
      g.stroke();
    }
    g.strokeStyle = rail;
    g.lineWidth = 9;
    for (const s of [1, -1]) {
      g.beginPath();
      g.moveTo(a.x + nx * s, a.y + ny * s);
      g.lineTo(b.x + nx * s, b.y + ny * s);
      g.stroke();
    }
  });
  Object.entries(SNAKES).forEach(([h, t], i) => {
    const pts = snakeLine(+h, t, i);
    const N = pts.length - 1;
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    pts.forEach((p, k) => {
      const q = pts[Math.min(N, k + 1)];
      const o = pts[Math.max(0, k - 1)];
      const tx = q.x - o.x;
      const ty = q.y - o.y;
      const tl = Math.hypot(tx, ty) || 1;
      const half = (21 * (1 - 0.82 * Math.pow(k / N, 1.25))) / 2;
      left.push([p.x - (ty / tl) * half, p.y + (tx / tl) * half]);
      right.push([p.x + (ty / tl) * half, p.y - (tx / tl) * half]);
    });
    const poly = [...left, ...right.reverse()];
    const path = (ox: number, oy: number) => {
      g.beginPath();
      poly.forEach(([x, y], k) => (k ? g.lineTo(x + ox, y + oy) : g.moveTo(x + ox, y + oy)));
      g.closePath();
    };
    const color = SNAKE_COLORS[i % SNAKE_COLORS.length];
    g.fillStyle = "rgba(0,0,0,.22)";
    path(3, 4);
    g.fill();
    g.fillStyle = color;
    path(0, 0);
    g.fill();
    g.save();
    g.translate(pts[0].x, pts[0].y);
    g.rotate(Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x));
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(0, 0, 19, 14, 0, 0, Math.PI * 2);
    g.fill();
    for (const y of [-7, 7]) {
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(7, y, 4.2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#111";
      g.beginPath();
      g.arc(8.5, y, 2.1, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "#b91c1c";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(18, 0);
    g.lineTo(29, 0);
    g.lineTo(34, -4);
    g.moveTo(29, 0);
    g.lineTo(34, 4);
    g.stroke();
    g.restore();
  });
  g.textBaseline = "top";
  g.lineJoin = "round";
  for (let b = 1; b <= LAST_BOX; b++) {
    const { col, row } = cellOf(b);
    const x = col * 100;
    const y = row * 100;
    g.font = "800 26px 'Baloo 2', 'Trebuchet MS', sans-serif";
    g.lineWidth = 5;
    g.strokeStyle = "rgba(255,255,255,.9)";
    g.strokeText(String(b), x + 7, y + 3);
    g.fillStyle = "rgba(13,59,44,.75)";
    g.fillText(String(b), x + 7, y + 3);
    const ev = sp.get(b);
    if (ev) {
      g.font = "30px sans-serif";
      g.fillText(ev.icon, x + 54, y + 38);
      g.fillStyle = ev.move > 0 ? "#16a34a" : "#dc2626";
      g.beginPath();
      g.roundRect(x + 8, y + 60, 44, 30, 7);
      g.fill();
      g.fillStyle = "#fff";
      g.font = "800 23px 'Baloo 2', 'Trebuchet MS', sans-serif";
      g.fillText((ev.move > 0 ? "+" : "−") + Math.abs(ev.move), x + 15, y + 62);
    }
    if (b === LAST_BOX) {
      g.fillStyle = "#3a2a00";
      g.font = "800 20px 'Baloo 2', 'Trebuchet MS', sans-serif";
      g.fillText("🏆 FINISH", x + 6, y + 66);
    }
  }
  g.fillStyle = "#f5c542";
  g.font = "800 34px 'Baloo 2', 'Trebuchet MS', sans-serif";
  g.fillText("START", 140, BOARD_H + 32);
  return c;
}

/** How the player's own piece moves. Times are Date.now() values. */
export type Motion =
  | { kind: "still"; pos: number }
  | { kind: "walk"; boxes: number[]; t0: number } // box by box: boxes[0] is the start
  | { kind: "snake"; head: number; t0: number; dur: number }
  | { kind: "ladder"; from: number; to: number; t0: number; dur: number };

export type Camera = "split" | "full" | "follow" | { focus: [number, number] };

export type OtherPiece = { uid: string; token: string; pos: number };

type Props = {
  specials: SpecialBox[] | null | undefined;
  others: OtherPiece[];
  myToken: string;
  motion: Motion;
  hopMs: number;
  camera: Camera;
  /** Height in px hidden by the question card at the bottom. */
  coverBottom: number;
  shakeUntil?: number;
  className?: string;
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function piecePos(m: Motion, hopMs: number, now: number): { x: number; y: number; box: number } {
  if (m.kind === "still") return { ...boxCentre(m.pos), box: m.pos };
  if (m.kind === "walk") {
    const n = m.boxes.length - 1;
    if (n <= 0) return { ...boxCentre(m.boxes[0] ?? 0), box: m.boxes[0] ?? 0 };
    const f = Math.max(0, Math.min(n, (now - m.t0) / hopMs));
    const k = Math.min(n - 1, Math.floor(f));
    const u = f - k;
    const a = boxCentre(m.boxes[k]);
    const b = boxCentre(m.boxes[k + 1]);
    const e = ease(u);
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - Math.sin(u * Math.PI) * 28, box: f >= n ? m.boxes[n] : m.boxes[k] };
  }
  const t = Math.max(0, Math.min(1, (now - m.t0) / m.dur));
  if (m.kind === "snake") {
    const pts = snakeLine(m.head, SNAKES[m.head] ?? m.head, Math.max(0, snakeIndex(m.head)));
    const f = ease(t) * (pts.length - 1);
    const k = Math.min(pts.length - 2, Math.floor(f));
    const u = f - k;
    return { x: pts[k].x + (pts[k + 1].x - pts[k].x) * u, y: pts[k].y + (pts[k + 1].y - pts[k].y) * u, box: t >= 1 ? (SNAKES[m.head] ?? m.head) : m.head };
  }
  const a = boxCentre(m.from);
  const b = boxCentre(m.to);
  const e = 1 - Math.pow(1 - t, 3);
  return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, box: t >= 1 ? m.to : m.from };
}

type Cam = { cx: number; cy: number; s: number; ox: number; oy: number };

function cameraFor(c: Camera, vw: number, vh: number, cover: number, me: { x: number; y: number }): Cam {
  const ah = Math.max(80, vh - cover);
  if (c === "full") {
    const s = Math.min(vw / BW, vh / BH) * 0.97;
    return { cx: BW / 2, cy: BH / 2, s, ox: vw / 2, oy: vh / 2 };
  }
  if (c === "follow") {
    const s = (vw / BW) * 2.1;
    const hx = vw / 2 / s;
    const hy = vh / 2 / s;
    return { cx: Math.max(hx, Math.min(BW - hx, me.x)), cy: Math.max(hy, Math.min(BH - hy, me.y)), s, ox: vw / 2, oy: vh / 2 };
  }
  if (typeof c === "object") {
    const ps = c.focus.map(boxCentre);
    const x0 = Math.min(...ps.map((p) => p.x)) - 90;
    const x1 = Math.max(...ps.map((p) => p.x)) + 90;
    const y0 = Math.min(...ps.map((p) => p.y)) - 90;
    const y1 = Math.max(...ps.map((p) => p.y)) + 90;
    const s = Math.min((2.4 * vw) / BW, vw / (x1 - x0), (ah - 10) / (y1 - y0));
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s, ox: vw / 2, oy: ah / 2 };
  }
  // split: the whole width of the board, scrolled so the player's piece is in the visible part
  const s = (vw / BW) * 0.97;
  const half = ah / 2 / s;
  const cy = BH * s <= ah ? BH / 2 : Math.max(half - 30, Math.min(BH - half + 70, me.y)); // a little room past the edges so a piece on START is never cut off
  return { cx: BW / 2, cy, s, ox: vw / 2, oy: ah / 2 };
}

function drawPiece(g: CanvasRenderingContext2D, x: number, y: number, r: number, emoji: string, color: string, mine: boolean, now: number) {
  g.save();
  if (mine) {
    g.fillStyle = "rgba(245,197,66,.4)";
    g.beginPath();
    g.arc(x, y, r * (1.45 + 0.12 * Math.sin(now / 220)), 0, Math.PI * 2);
    g.fill();
  }
  g.shadowColor = "rgba(0,0,0,.35)";
  g.shadowBlur = 6;
  g.shadowOffsetY = 3;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  g.shadowColor = "transparent";
  g.lineWidth = Math.max(2, r * 0.22);
  g.strokeStyle = color;
  g.stroke();
  g.font = `${Math.round(r * 1.15)}px sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(emoji, x, y + r * 0.06);
  if (mine) {
    const ay = y - r - 10 - 4 * Math.abs(Math.sin(now / 260));
    g.fillStyle = "#f5c542";
    g.strokeStyle = "#3a2a00";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, ay + 8);
    g.lineTo(x - 9, ay - 2);
    g.lineTo(x + 9, ay - 2);
    g.closePath();
    g.fill();
    g.stroke();
    g.beginPath();
    g.roundRect(x - 18, ay - 19, 36, 17, 5);
    g.fill();
    g.stroke();
    g.fillStyle = "#3a2a00";
    g.font = "800 13px 'Baloo 2', 'Trebuchet MS', sans-serif";
    g.fillText("YOU", x, ay - 10);
  }
  g.restore();
}

export default function PhoneBoard(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef(props);
  live.current = props;
  const specialsKey = JSON.stringify(props.specials ?? []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d")!;
    let board: HTMLCanvasElement | null = null;
    let alive = true;
    const build = () => {
      board = drawBoard(live.current.specials);
    };
    build();
    // Redraw once the game's fonts have loaded so the box numbers use them.
    document.fonts?.ready.then(() => alive && build()).catch(() => {});

    let vw = 0;
    let vh = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      vw = r.width;
      vh = r.height;
      const d = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(vw * d));
      cv.height = Math.max(1, Math.round(vh * d));
      g.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    let cam: Cam | null = null;
    const shown = new Map<string, { x: number; y: number }>();
    let last = performance.now();
    let raf = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!vw || !vh || !board) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const p = live.current;
      const now = Date.now();
      const me = piecePos(p.motion, p.hopMs, now);
      const target = cameraFor(p.camera, vw, vh, p.coverBottom, me);
      if (!cam) cam = target;
      else {
        const k = 1 - Math.exp(-dt * 5.5);
        for (const key of Object.keys(target) as (keyof Cam)[]) cam[key] += (target[key] - cam[key]) * k;
      }
      const c = cam;
      const toScreen = (q: { x: number; y: number }) => ({ x: (q.x - c.cx) * c.s + c.ox, y: (q.y - c.cy) * c.s + c.oy });
      g.fillStyle = "#12503b";
      g.fillRect(0, 0, vw, vh);
      const o = toScreen({ x: 0, y: 0 });
      g.drawImage(board, o.x, o.y, BW * c.s, BH * c.s);

      // Other players: small pieces, gliding to their new box. Pieces on the same box sit side by side.
      const rOther = Math.max(7, 25 * c.s);
      const groups = new Map<number, OtherPiece[]>();
      for (const op of p.others) {
        if (!groups.has(op.pos)) groups.set(op.pos, []);
        groups.get(op.pos)!.push(op);
      }
      for (const [box, list] of groups) {
        const base = boxCentre(box);
        list.forEach((op, i) => {
          const spread = box <= 0 ? 52 : list.length > 1 ? 30 : 0;
          const per = box <= 0 ? 99 : Math.ceil(Math.sqrt(list.length));
          const gx = box <= 0 ? i + 1.4 : (i % per) - (per - 1) / 2;
          const gy = box <= 0 ? 0 : Math.floor(i / per) - (Math.ceil(list.length / per) - 1) / 2;
          const want = { x: base.x + gx * spread, y: base.y + gy * spread * 0.9 };
          const cur = shown.get(op.uid) ?? want;
          const k = 1 - Math.exp(-dt * 4);
          const next = { x: cur.x + (want.x - cur.x) * k, y: cur.y + (want.y - cur.y) * k };
          shown.set(op.uid, next);
          const s = toScreen(next);
          const tk = tokenById(op.token);
          drawPiece(g, s.x, s.y, rOther, tk.emoji, tk.color, false, now);
        });
      }
      const mine = tokenById(p.myToken);
      const ms = toScreen(me);
      if (p.shakeUntil && now < p.shakeUntil) ms.x += Math.sin(now / 28) * 6;
      drawPiece(g, ms.x, ms.y, Math.max(13, 38 * c.s), mine.emoji, mine.color, true, now);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialsKey]);

  return <canvas ref={canvasRef} className={props.className} aria-label="Game board" role="img" />;
}
