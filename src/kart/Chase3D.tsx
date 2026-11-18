// The driver's view on each phone: a retro "pseudo-3D" road seen from behind your own cart.
// The projector sends every cart's position about 6 times a second; this view fills in the movement
// in between, and applies your own steering straight away so it feels responsive.
import { useEffect, useRef, type MutableRefObject } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../lib/firebase.ts";
import { tokenById } from "../lib/tokens.ts";
import type { Player } from "../lib/types.ts";
import { BOX_LANES, BOX_ROWS, HAZARDS, HALF, TRACK_LEN, TRACK_W, PATH_POINTS } from "./track.ts";
import type { CartPos } from "./engine.ts";
import * as px from "./pixel.ts";

const W = 320; // low resolution on purpose: scaled up, it looks like a 16-bit console
const H = 200;
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

const BILLBOARDS: [string, string][] = [
  ["QUALITY MONTH", "2026"],
  ["RIGHT FIRST", "TIME"],
  ["ZERO DEFECTS", "ZERO WASTE"],
  ["SAFETY FIRST", "PPE ON"],
];

function buildScenery() {
  const palm = px.palm();
  const fac = px.factory();
  const boards = BILLBOARDS.map(([a, b]) => px.billboard(a, b));
  const list: Sprite[][] = Array.from({ length: N }, () => []);
  for (let k = 0; k < N; k++) {
    if (k % 4 === 0) list[k].push({ img: palm, offset: k % 8 === 0 ? -1.45 : 1.45, size: 0.75 });
    if (k % 19 === 7) list[k].push({ img: fac, offset: k % 38 === 7 ? 2.6 : -2.6, size: 1.7 });
    if (k % 29 === 13) list[k].push({ img: boards[Math.floor(k / 29) % boards.length], offset: k % 58 === 13 ? -1.9 : 1.9, size: 1.1 });
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
    ctx.imageSmoothingEnabled = false;
    const scenery = buildScenery();
    const qbox = px.qbox();
    const oil = px.oilSpill();
    const carts = new Map<string, HTMLCanvasElement>();
    const cartImg = (u: string) => {
      const color = tokenById(playersRef.current[u]?.token).color;
      const key = u + color;
      if (!carts.has(key)) carts.set(key, px.cartRear(color));
      return carts.get(key)!;
    };
    let pMe = 0;
    let dMe = 0;
    let skyX = 0;
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
      skyX += CURVE[playerIdx] * speed * dt * 0.02;

      // Sky, sun and a distant skyline that slides as the road bends
      const sky = ctx.createLinearGradient(0, 0, 0, H / 2);
      sky.addColorStop(0, "#3b82f6");
      sky.addColorStop(1, "#bfe3ff");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff4b0";
      ctx.fillRect(W - 60, 18, 14, 14);
      for (let layer = 0; layer < 2; layer++) {
        ctx.fillStyle = layer ? "#5b8a72" : "#7ea892";
        const off = ((skyX * (layer ? 1 : 0.5)) % 64 + 64) % 64;
        for (let x = -64; x < W + 64; x += 8) {
          const hgt = 10 + ((Math.sin((x + 1000) * 0.07 + layer * 3) + 1) * (layer ? 9 : 14)) | 0;
          ctx.fillRect(Math.round(x - off), H / 2 - hgt + (layer ? 6 : 0), 8, hgt + 40);
        }
      }

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
        ctx.fillStyle = band ? "#e8c27a" : "#dcb468";
        ctx.fillRect(0, p2.sy, W, p1.sy - p2.sy);
        quad(p1.sx, p1.sy, p1.sw * 1.15, p2.sx, p2.sy, p2.sw * 1.15, band ? "#b91c1c" : "#f3f4f6");
        quad(p1.sx, p1.sy, p1.sw, p2.sx, p2.sy, p2.sw, band ? "#4b5059" : "#474c55");
        if (band) {
          const lw1 = Math.max(1, p1.sw / 40);
          const lw2 = Math.max(1, p2.sw / 40);
          for (const lane of [-1 / 3, 1 / 3]) quad(p1.sx + p1.sw * lane, p1.sy, lw1, p2.sx + p2.sw * lane, p2.sy, lw2, "#f8fafc");
        }
        if (idx === 0) quad(p1.sx, p1.sy, p1.sw, p2.sx, p2.sy, p2.sw, "#f8fafc");
        maxY = p2.sy;
      }

      // Things on and beside the road, from far to near
      const others = live ? Object.entries(live.pos.c).filter(([u]) => u !== uid) : [];
      const hidden = new Set(live?.pos.b ?? []);
      const drawSprite = (img: HTMLCanvasElement, sx: number, sy: number, scale: number, size: number, clip: number, flat = false) => {
        const dw = size * scale * ROAD_W * (W / 2);
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
          drawSprite(cartImg(u), sx, sg.p1.sy, sg.p1.scale, 0.42, sg.clip);
          if (sg.p1.scale * ROAD_W * (W / 2) > 40) {
            const name = playersRef.current[u]?.name ?? "";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center";
            const tw = ctx.measureText(name).width + 4;
            const ny = sg.p1.sy - 0.42 * sg.p1.scale * ROAD_W * (W / 2) * 0.6 - 4;
            if (ny < sg.clip) {
              ctx.fillStyle = tokenById(playersRef.current[u]?.token).color;
              ctx.fillRect(Math.round(sx - tw / 2), Math.round(ny - 7), Math.round(tw), 8);
              ctx.fillStyle = "#fff";
              ctx.fillText(name, Math.round(sx), Math.round(ny));
            }
          }
        }
      }

      // My cart
      const my = cartImg(uid);
      const bounce = speed > 5 ? Math.round(now / 90) % 2 : 0;
      const lean = Math.round(steer.current * 6);
      const cw = 96;
      const chh = 56;
      const cx = W / 2 - cw / 2 + lean;
      const cy = H - chh - 4 + bounce;
      ctx.save();
      if (spinning && Math.round(now / 90) % 2) {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(my, W - cx - cw, cy, cw, chh);
      } else ctx.drawImage(my, cx, cy, cw, chh);
      ctx.restore();
      if (flags & 2) {
        const f = px.flame(Math.round(now / 60));
        ctx.drawImage(f, cx + 38, cy + chh - 2, 8, 12);
        ctx.drawImage(f, cx + 50, cy + chh - 2, 8, 12);
      }
      if (flags & 4) {
        ctx.strokeStyle = "rgba(96,165,250,.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(W / 2 + lean, cy + chh / 2, cw / 2 + 8, chh / 2 + 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (flags & 8 && Math.round(now / 120) % 2) {
        ctx.fillStyle = "rgba(229,231,235,.8)";
        ctx.fillRect(cx + 30, cy + chh - 6, 6, 6);
        ctx.fillRect(cx + 58, cy + chh - 8, 8, 8);
      }
      // speedometer bar
      const pct = Math.min(1, speed / ((TRACK_LEN / 48) * 1.6));
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(6, H - 60, 10, 54);
      ctx.fillStyle = flags & 2 ? "#f97316" : "#22c55e";
      ctx.fillRect(8, H - 8 - Math.round(50 * pct), 6, Math.round(50 * pct));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [uid, steer]);

  return <canvas ref={canvasRef} className="chase" width={W} height={H} aria-label="Your view of the race" />;
}
