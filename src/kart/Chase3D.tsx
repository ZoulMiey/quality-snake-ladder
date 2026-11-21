// The driver's view on each phone (held sideways): a "pseudo-3D" road seen from behind your own cart,
// drawn at 540 pixels high and smoothed (the "32-bit smooth" look the owner picked), with mixed scenery:
// countryside, then a factory zone. The projector sends every cart's position about 6 times a second;
// this view fills in the movement in between, and applies your own steering straight away.
import { useEffect, useRef, type MutableRefObject } from "react";
import { onValue, ref } from "../lib/store.ts";
import { db } from "../lib/firebase.ts";
import { tokenById } from "../lib/tokens.ts";
import type { Player } from "../lib/types.ts";
import { BOX_LANES, BOX_ROWS, HAZARDS, HALF, TRACK_LEN, TRACK_W, PATH_POINTS } from "./track.ts";
import type { CartPos } from "./engine.ts";
import * as px from "./pixel.ts";
import { BASE_SPEED } from "./sim.ts";

const H = 540; // the width follows the screen's shape (see resize below)
const SEG_TRACK = 20; // track units per road segment
const N = Math.ceil(TRACK_LEN / SEG_TRACK);
const SEG_LEN = 200; // world depth of one segment
const TRACK_Z = N * SEG_LEN;
const ROAD_W = 2000; // half the road width in world units
const CAM_H = 1000;
const DEPTH = 1 / Math.tan(((100 / 2) * Math.PI) / 180);
const PLAYER_Z = CAM_H * DEPTH;
const DRAW = 110;
const LAT = HALF / (TRACK_W / 2); // a cart at the edge of where it can drive (d = ±1) sits this far out
const STEER_RATE = 1.7;

// Road shape: how much each segment bends (from the real track) and gentle hills.
const CURVE = new Float32Array(N);
const HILL = new Float32Array(N + 1);
(() => {
  const P = PATH_POINTS;
  const at = (s: number) => P.h[Math.floor(((s % TRACK_LEN) + TRACK_LEN) % TRACK_LEN / 4) % P.h.length];
  for (let k = 0; k < N; k++) {
    let dh = at((k + 1) * SEG_TRACK) - at(k * SEG_TRACK);
    while (dh > Math.PI) dh -= 2 * Math.PI;
    while (dh < -Math.PI) dh += 2 * Math.PI;
    CURVE[k] = Math.max(-7, Math.min(7, dh * 26));
  }
  for (let k = 0; k <= N; k++) HILL[k] = 420 * Math.sin((2 * Math.PI * k * 3) / N) + 220 * Math.sin((2 * Math.PI * k * 7) / N);
})();

type Sprite = { img: HTMLCanvasElement; offset: number; size: number; flat?: boolean };

/** The factory zone: this stretch of the lap has grey ground, yellow-and-black kerbs and factory buildings. */
const FACTORY_FROM = Math.floor(N * 0.42);
const FACTORY_TO = Math.floor(N * 0.68);
export const inFactory = (k: number) => k >= FACTORY_FROM && k < FACTORY_TO;

const BOARDS: [string, string][] = [
  ["RIGHT FIRST", "TIME"],
  ["ZERO DEFECTS", "QUALITY MONTH 2026"],
  ["SAFETY FIRST", "PPE ON"],
];

function buildScenery() {
  const art = {
    pineD: px.pine("#1f6b4a", "#2f8a5e"),
    pineL: px.pine("#3f8f3a", "#5fb04a"),
    autumn: px.roundTree("#c76a12", "#e8941e", "#f7c04a"),
    oak: px.roundTree("#2f7a3a", "#3f9a45", "#6cc35a"),
    rock: px.rock(),
    bush: px.bush(),
    signL: px.arrowSign(-1),
    signR: px.arrowSign(1),
    boards: BOARDS.map(([a, b]) => px.qualityBoard(a, b)),
    lab: px.qcLab(),
    shed: px.warehouse(),
    fence: px.fence(),
  };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const list: Sprite[][] = Array.from({ length: N }, () => []);
  for (let k = 0; k < N; k++) {
    const add = (img: HTMLCanvasElement, offset: number, size: number) => list[k].push({ img, offset, size });
    if (!inFactory(k)) {
      if (k % 3 === 0) add(rnd() < 0.5 ? art.pineD : art.pineL, -(1.45 + rnd() * 1.8), 0.55);
      if (k % 3 === 1) add(rnd() < 0.35 ? art.autumn : rnd() < 0.5 ? art.pineD : art.oak, 1.45 + rnd() * 1.8, 0.6);
      if (k % 7 === 2) add(art.rock, (rnd() < 0.5 ? -1 : 1) * (1.3 + rnd() * 0.4), 0.35);
      if (k % 5 === 3) add(art.bush, (rnd() < 0.5 ? -1 : 1) * (1.35 + rnd() * 0.6), 0.4);
    } else {
      if (k % 4 === 0) add(art.fence, -1.35, 0.6);
      if (k % 4 === 2) add(art.fence, 1.35, 0.6);
      if (k % 24 === 5) add(art.lab, -2.4, 2.2);
      if (k % 24 === 17) add(art.shed, 2.6, 2.6);
      if (k % 30 === 11) add(art.boards[Math.floor(k / 30) % 3], 2.2, 1.3);
      if (k % 30 === 26) add(art.boards[(Math.floor(k / 30) + 1) % 3], -2.2, 1.3);
    }
  }
  // Arrow signs before every bend, on the outside of the turn.
  for (let k = 0; k < N; k++) {
    const prev = CURVE[(k - 1 + N) % N];
    if (Math.abs(CURVE[k]) > 2.5 && Math.abs(prev) <= 2.5) {
      const dir = Math.sign(CURVE[k]);
      for (const back of [9, 3]) list[(k - back + N) % N].push({ img: dir > 0 ? art.signR : art.signL, offset: dir > 0 ? -1.35 : 1.35, size: 0.32 });
    }
  }
  const cone = px.cone();
  const hole = px.pothole();
  const oos = px.oosStripe();
  for (const hz of HAZARDS) {
    if (hz.kind === "oos") {
      for (let s = hz.s - hz.len / 2; s < hz.s + hz.len / 2; s += SEG_TRACK)
        list[Math.floor((((s % TRACK_LEN) + TRACK_LEN) % TRACK_LEN) / SEG_TRACK) % N].push({ img: oos, offset: hz.d * LAT, size: hz.wide * 2 * LAT, flat: true });
    } else {
      list[Math.floor(hz.s / SEG_TRACK) % N].push({ img: hz.kind === "cone" ? cone : hole, offset: hz.d * LAT, size: hz.kind === "cone" ? 0.13 : 0.3, flat: hz.kind === "pothole" });
    }
  }
  return list;
}

type Proj = { sx: number; sy: number; sw: number; scale: number; ok: boolean };

const ZONE = {
  country: { grass: ["#77c24f", "#6ab446"], kerb: ["#d33a3a", "#ffffff"], road: ["#62666e", "#5c6068"], lane: "#ffffff" },
  factory: { grass: ["#a8adb3", "#9da2a8"], kerb: ["#f5c542", "#2b2f36"], road: ["#55595f", "#4f5359"], lane: "#f5c542" },
};

/** Sky, distant mountains and green hills with a tree line; drawn once per screen size, then slid sideways in bends. */
function buildBackground(W: number) {
  const mk = (w: number, draw: (g: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = H;
    draw(c.getContext("2d")!);
    return c;
  };
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sky = mk(W, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, H * 0.6);
    gr.addColorStop(0, "#5aa7e6");
    gr.addColorStop(1, "#bfe3f7");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#ffffff";
    for (let k = 0; k < 7; k++) {
      const x = rnd() * W;
      const y = H * 0.07 + rnd() * H * 0.18;
      const s = H * 0.03 + rnd() * H * 0.03;
      for (let j = 0; j < 4; j++) g.fillRect(Math.round(x + j * s * 0.9), Math.round(y - (j % 2) * s * 0.5), Math.round(s * 1.6), Math.round(s * 0.8));
    }
  });
  const mountains = mk(W * 2, (g) => {
    const base = H * 0.5;
    const pts: [number, number][] = [];
    for (let x = 0; x <= W * 2; x += W * (0.05 + rnd() * 0.07)) pts.push([x, base - H * (0.08 + rnd() * 0.14)]);
    pts.push([W * 2, pts[0][1]]);
    g.fillStyle = "#6a7fc0";
    g.beginPath();
    g.moveTo(0, H);
    for (const [a, b] of pts) g.lineTo(a, b);
    g.lineTo(W * 2, H);
    g.fill();
    g.fillStyle = "#eef3ff";
    for (const [a, b] of pts) {
      g.beginPath();
      g.moveTo(a, b);
      g.lineTo(a - H * 0.025, b + H * 0.03);
      g.lineTo(a + H * 0.025, b + H * 0.03);
      g.fill();
    }
  });
  const hills = mk(W * 2, (g) => {
    const base = H * 0.5;
    g.fillStyle = "#5fae4a";
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W * 2; x += 2) g.lineTo(x, base - H * 0.04 - H * 0.035 * Math.sin((x / W) * Math.PI * 4) - H * 0.02 * Math.sin((x / W) * Math.PI * 10));
    g.lineTo(W * 2, H);
    g.fill();
    const t = Math.round(H * 0.022);
    for (let x = 0; x < W * 2; x += t * 1.6) {
      const y = base - H * 0.02 - rnd() * H * 0.03;
      g.fillStyle = rnd() < 0.5 ? "#2f7a4a" : "#3a8f50";
      for (let k = 0; k < t * 2; k++) {
        const hw = Math.max(1, Math.round(k * 0.45));
        g.fillRect(Math.round(x + t - hw), Math.round(y + k * 0.7), hw * 2, 1);
      }
    }
  });
  return { sky, mountains, hills };
}

/** Speedometer dial for the bottom-right corner. */
function drawSpeedo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, kmh: number, turbo: boolean) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1d2733";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  const a0 = Math.PI * 0.75;
  const span = Math.PI * 1.5;
  const arc = (from: number, to: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.13;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, a0 + span * from, a0 + span * to);
    ctx.stroke();
  };
  arc(0, 0.4, "#4fb3ff");
  arc(0.4, 0.75, "#5fcf80");
  arc(0.75, 1, "#ff6b6b");
  const a = a0 + span * Math.min(1, kmh / 220);
  ctx.strokeStyle = turbo ? "#ff7a1a" : "#f5c542";
  ctx.lineWidth = r * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${Math.round(r * 0.3)}px 'Press Start 2P', monospace`;
  ctx.fillText(String(Math.round(kmh)), cx, cy + r * 0.62);
  ctx.font = `${Math.round(r * 0.15)}px 'Press Start 2P', monospace`;
  ctx.fillText("KM/H", cx, cy + r * 0.84);
}

export default function Chase3D({ uid, players, steer }: { uid: string; players: Record<string, Player>; steer: MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef<{ pos: CartPos; at: number } | null>(null);
  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => onValue(ref(db, "kart/pos"), (s) => s.val() && (posRef.current = { pos: s.val() as CartPos, at: performance.now() })), []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    // The canvas is always 540 pixels high; its width follows the screen's shape so the view fills it.
    let W = 960;
    let bg = buildBackground(W);
    const resize = () => {
      const r = cv.getBoundingClientRect();
      const aspect = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
      const w = Math.max(360, Math.min(1280, Math.round(H * aspect)));
      if (w !== W || cv.width !== w) {
        W = w;
        cv.width = W;
        cv.height = H;
        bg = buildBackground(W);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const scenery = buildScenery();
    const qbox = px.qbox();
    const oil = px.oilSpill();
    const carts = new Map<string, HTMLCanvasElement>();
    const cartImg = (u: string) => {
      const color = tokenById(playersRef.current[u]?.token).color;
      const key = u + color;
      if (!carts.has(key)) carts.set(key, px.racerRear(color));
      return carts.get(key)!;
    };
    let pMe = 0;
    let dMe = 0;
    let skyX = 0;
    const myCarts = new Map<number, HTMLCanvasElement>();
    const myCart = (lean: number) => {
      const color = tokenById(playersRef.current[uid]?.token).color;
      const key = lean * 1000 + parseInt(color.slice(1), 16) % 997;
      if (!myCarts.has(key)) myCarts.set(key, px.racerRear(color, lean));
      return myCarts.get(key)!;
    };
    let last = performance.now();
    let raf = 0;

    const project = (wx: number, wy: number, wz: number, camX: number, camY: number, camZ: number): Proj => {
      const cz = wz - camZ;
      if (cz <= 1) return { sx: 0, sy: 0, sw: 0, scale: 0, ok: false };
      const scale = DEPTH / cz;
      return { sx: Math.round(W / 2 + scale * (wx - camX) * (W / 2)), sy: Math.round(H / 2 - scale * (wy - camY) * (H / 2)), sw: Math.round(scale * ROAD_W * (W / 2)), scale, ok: true };
    };
    const quad = (x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1);
      ctx.lineTo(x2 - w2, y2);
      ctx.lineTo(x2 + w2, y2);
      ctx.lineTo(x1 + w1, y1);
      ctx.closePath();
      ctx.fill();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const live = posRef.current;
      const mine = live?.pos.c[uid];
      const since = live ? Math.min(0.5, (now - live.at) / 1000) : 0;
      const flags = mine?.[3] ?? 0;
      const spinning = (flags & 1) !== 0;
      const speed = mine?.[2] ?? 0;
      if (mine) {
        const predicted = mine[0] + speed * since;
        pMe += speed * dt;
        if (Math.abs(predicted - pMe) > 150) pMe = predicted;
        else pMe += (predicted - pMe) * 0.12;
        if (!spinning && !(flags & 16)) dMe = Math.max(-1, Math.min(1, dMe + steer.current * STEER_RATE * dt));
        dMe += (mine[1] - dMe) * 0.08;
      }

      // Camera follows my cart
      const zMe = (pMe / SEG_TRACK) * SEG_LEN;
      const position = (((zMe - PLAYER_Z) % TRACK_Z) + TRACK_Z) % TRACK_Z;
      const baseIdx = Math.floor(position / SEG_LEN) % N;
      const basePct = (position % SEG_LEN) / SEG_LEN;
      const playerIdx = Math.floor((position + PLAYER_Z) / SEG_LEN) % N;
      const playerPct = ((position + PLAYER_Z) % SEG_LEN) / SEG_LEN;
      const playerY = HILL[playerIdx] + (HILL[playerIdx + 1] - HILL[playerIdx]) * playerPct;
      const camY = playerY + CAM_H;
      const camX = dMe * LAT * ROAD_W;
      skyX += CURVE[playerIdx] * speed * dt * 0.02 * (W / 320);

      // Sky, then mountains and hills that slide sideways as the road bends
      ctx.drawImage(bg.sky, 0, 0);
      const layer = (img: HTMLCanvasElement, f: number) => {
        const off = ((((skyX * f) % (W * 2)) + W * 2) % (W * 2));
        ctx.drawImage(img, -Math.round(off), 0);
        ctx.drawImage(img, Math.round(W * 2 - off), 0);
      };
      layer(bg.mountains, 0.6);
      layer(bg.hills, 1.2);

      // Road, from near to far
      let x = 0;
      let dx = -(CURVE[baseIdx] * basePct);
      let maxY = H;
      const segs: { p1: Proj; p2: Proj; clip: number; idx: number; z: number }[] = [];
      for (let n = 0; n < DRAW; n++) {
        const idx = (baseIdx + n) % N;
        const looped = idx < baseIdx ? TRACK_Z : 0;
        const z1 = idx * SEG_LEN + looped;
        const p1 = project(0, HILL[idx], z1, camX - x, camY, position);
        const p2 = project(0, HILL[idx + 1], z1 + SEG_LEN, camX - x - dx, camY, position);
        x += dx;
        dx += CURVE[idx];
        segs.push({ p1, p2, clip: maxY, idx, z: z1 });
        if (!p1.ok || !p2.ok || p2.sy >= p1.sy || p2.sy >= maxY) continue;
        const band = Math.floor(idx / 3) % 2;
        const z = inFactory(idx) ? ZONE.factory : ZONE.country;
        ctx.fillStyle = z.grass[band];
        ctx.fillRect(0, p2.sy, W, p1.sy - p2.sy + 1);
        quad(p1.sx, p1.sy, p1.sw * 1.16, p2.sx, p2.sy, p2.sw * 1.16, z.kerb[band]);
        quad(p1.sx, p1.sy, p1.sw, p2.sx, p2.sy, p2.sw, z.road[band]);
        if (band) {
          const lw1 = Math.max(1, p1.sw / 40);
          const lw2 = Math.max(1, p2.sw / 40);
          for (const lane of [-1 / 3, 1 / 3]) quad(p1.sx + p1.sw * lane, p1.sy, lw1, p2.sx + p2.sw * lane, p2.sy, lw2, z.lane);
        }
        if (idx === 0) quad(p1.sx, p1.sy, p1.sw, p2.sx, p2.sy, p2.sw, "#f8fafc");
        maxY = p2.sy;
      }

      // Things on and beside the road, from far to near
      const others = live ? Object.entries(live.pos.c).filter(([u]) => u !== uid) : [];
      const hidden = new Set(live?.pos.b ?? []);
      const myW = H * 0.36; // my own cart's width on screen: nothing on the road is drawn bigger than it
      const drawSprite = (img: HTMLCanvasElement, sx: number, sy: number, scale: number, size: number, clip: number, flat = false, cap = Infinity) => {
        const dw = Math.min(cap, size * scale * ROAD_W * (W / 2));
        const dh = flat ? dw * (img.height / img.width) * 0.5 : dw * (img.height / img.width);
        const top = sy - dh;
        if (dw < 1 || top >= clip) return;
        const visibleH = Math.min(dh, clip - top);
        ctx.drawImage(img, 0, 0, img.width, img.height * (visibleH / dh), Math.round(sx - dw / 2), Math.round(top), Math.round(dw), Math.round(visibleH));
      };
      for (let n = segs.length - 1; n > 2; n--) {
        // (the 3 nearest segments are skipped: scenery that close to the camera would fill the screen)
        const sg = segs[n];
        if (!sg.p1.ok) continue;
        const at = (offset: number) => sg.p1.sx + sg.p1.scale * offset * ROAD_W * (W / 2);
        for (const sp of scenery[sg.idx]) drawSprite(sp.img, at(sp.offset), sg.p1.sy, sg.p1.scale, sp.size, sg.clip, sp.flat);
        BOX_ROWS.forEach((row, r) => {
          if (Math.floor(row / SEG_TRACK) % N !== sg.idx) return;
          BOX_LANES.forEach((lane, l) => {
            if (!hidden.has(r * BOX_LANES.length + l)) drawSprite(qbox, at(lane * LAT), sg.p1.sy, sg.p1.scale, 0.17, sg.clip);
          });
        });
        for (const [s, d] of live?.pos.o ?? []) if (Math.floor(s / SEG_TRACK) % N === sg.idx) drawSprite(oil, at(d * LAT), sg.p1.sy, sg.p1.scale, 0.32, sg.clip, true);
        for (const [u, c] of others) {
          const p = c[0] + c[2] * since;
          const s = ((p % TRACK_LEN) + TRACK_LEN) % TRACK_LEN;
          if (Math.floor(s / SEG_TRACK) % N !== sg.idx) continue;
          const sx = at(c[1] * LAT);
          drawSprite(cartImg(u), sx, sg.p1.sy, sg.p1.scale, 0.42, sg.clip, false, myW * 0.9);
          if (sg.p1.scale * ROAD_W * (W / 2) > 110) {
            const name = playersRef.current[u]?.name ?? "";
            const fs = Math.round(H * 0.032);
            ctx.font = `bold ${fs}px Figtree, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            const tw = ctx.measureText(name).width + fs * 0.8;
            const ny = sg.p1.sy - 0.42 * sg.p1.scale * ROAD_W * (W / 2) * 0.6 - fs * 0.6;
            if (ny < sg.clip) {
              ctx.fillStyle = tokenById(playersRef.current[u]?.token).color;
              ctx.fillRect(Math.round(sx - tw / 2), Math.round(ny - fs), Math.round(tw), Math.round(fs * 1.25));
              ctx.fillStyle = "#fff";
              ctx.fillText(name, Math.round(sx), Math.round(ny));
            }
          }
        }
      }

      // My cart (leans into turns), turbo flames, shield bubble, smoke when slowed or steering hard
      const st = steer.current;
      const lean = Math.max(-2, Math.min(2, Math.round(st * 2)));
      const my = myCart(lean);
      const cw = Math.round(H * 0.36);
      const chh = Math.round((cw * my.height) / my.width);
      const bounce = speed > 5 ? Math.round(Math.sin(now / 60) * H * 0.004) : 0;
      const cx = Math.round(W / 2 - cw / 2 + st * H * 0.02);
      const cy = Math.round(H - chh - H * 0.035 + bounce);
      const unit = cw / 48;
      if ((Math.abs(st) > 0.6 && speed > 5) || flags & 8) {
        ctx.fillStyle = "rgba(255,255,255,.75)";
        for (let k = 0; k < 3; k++) {
          const s2 = Math.round(unit * (3 + k));
          const ox = ((now / 40 + k * 7) % 14) * unit;
          const side = st >= 0 ? 1 : -1;
          ctx.fillRect(Math.round(side > 0 ? cx + unit * 2 - ox : cx + cw - unit * 8 + ox), cy + chh - s2, s2, s2);
        }
      }
      ctx.save();
      if (spinning) {
        ctx.translate(cx + cw / 2, cy + chh / 2);
        ctx.rotate(Math.sin(now / 70) * 0.35);
        ctx.drawImage(my, -cw / 2, -chh / 2, cw, chh);
      } else ctx.drawImage(my, cx, cy, cw, chh);
      ctx.restore();
      if (flags & 32) {
        // SUPER TURBO: big flames and speed lines down both sides of the screen
        const f = px.flame(Math.round(now / 50));
        ctx.drawImage(f, cx + unit * 12, cy + chh - unit * 3, unit * 10, unit * 16);
        ctx.drawImage(f, cx + unit * 26, cy + chh - unit * 3, unit * 10, unit * 16);
        ctx.strokeStyle = "rgba(255,255,255,.55)";
        ctx.lineWidth = Math.max(2, H * 0.006);
        for (let k = 0; k < 10; k++) {
          const y = ((k * 97 + now * 1.4) % (H * 0.9)) + H * 0.05;
          const side = k % 2 ? 1 : -1;
          const x0 = side > 0 ? W - (k % 3) * H * 0.04 : (k % 3) * H * 0.04;
          ctx.beginPath();
          ctx.moveTo(x0, y);
          ctx.lineTo(x0 - side * H * 0.12, y + H * 0.04);
          ctx.stroke();
        }
      } else if (flags & 2) {
        const f = px.flame(Math.round(now / 60));
        ctx.drawImage(f, cx + unit * 15, cy + chh - unit * 2, unit * 6, unit * 9);
        ctx.drawImage(f, cx + unit * 27, cy + chh - unit * 2, unit * 6, unit * 9);
      }
      if (flags & 4) {
        ctx.strokeStyle = `rgba(90,200,255,${0.6 + 0.25 * Math.sin(now / 90)})`;
        ctx.lineWidth = H * 0.012;
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, cy + chh * 0.55, cw * 0.65, chh * 0.95, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Speedometer (bottom right). Base speed shows as about 120 km/h; turbo goes past 180.
      drawSpeedo(ctx, W - H * 0.15, H - H * 0.15, H * 0.13, (speed / BASE_SPEED) * 120, (flags & 34) !== 0);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [uid, steer]);

  return <canvas ref={canvasRef} className="chase" width={960} height={H} aria-label="Your view of the race" />;
}
