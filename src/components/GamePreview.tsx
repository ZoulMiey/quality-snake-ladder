// Preview pictures for the games in the projector lobby. They play a short loop of each game (owner, Nov 2026:
// "make the preview bigger, maybe add some gameplay"): pieces hopping on the Snake & Ladder board, carts racing,
// monsters hitting the Titan, fish leaping into boats, and the rope being pulled with a splash.
// Drawn on a 320 × 180 logical canvas; the big preview in the game's page simply uses more pixels.
import { useEffect, useRef } from "react";
import type { GameMode } from "../lib/types.ts";
import { LADDERS, SNAKES, cellOf } from "../lib/board.ts";
import { PATH_POINTS, WORLD_H, WORLD_W } from "../kart/track.ts";
import { sprite } from "../clash/sprites.ts";
import { titan } from "../clash/titan.ts";
import { PW, PH, drawPond, drawBoat, layoutBoats, leapingFish, splash as fishSplash } from "../fish/pond2d.ts";
import { SW, SH, CX, ROPE_Y, RIVER_L, RIVER_R, WATER_Y, FLAG_TRAVEL, drawBackground, drawFlag, drawFrontWater, drawRope, layoutSide, pegDoll, type Pose } from "../rope/scene.ts";
import { drawWheel as drawSpinWheel } from "../spin/wheel.ts";

const W = 320;
const H = 180;
const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------- Snake & Ladder: three pieces hop box by box, climb ladders, slide down snakes ----------
const HOP = 0.45;
const SNAKE_RUNS = [5, 18, 33].map((start, i) => {
  // Each piece's path, worked out once: one box per hop, ladders and snakes taken straight away.
  const seq: number[] = [start];
  let b = start;
  let rnd = 7 + i * 13;
  while (seq.length < 260) {
    rnd = (rnd * 1103515245 + 12345) % 2147483648;
    const roll = 1 + (rnd % 6);
    for (let k = 0; k < roll && seq.length < 260; k++) {
      b = b >= 100 ? 1 : b + 1;
      seq.push(b);
    }
    const to = LADDERS[b] ?? SNAKES[b];
    if (to) {
      b = to;
      seq.push(b);
    }
  }
  return seq;
});

function snake(c: CanvasRenderingContext2D, t: number) {
  const cw = W / 10;
  const ch = H / 10;
  for (let r = 0; r < 10; r++)
    for (let k = 0; k < 10; k++) {
      c.fillStyle = (r + k) % 2 ? "#e3f2e6" : "#fbf6e9";
      c.fillRect(k * cw, r * ch, cw, ch);
    }
  const { col: fc, row: fr } = cellOf(100);
  c.fillStyle = "#f5c542";
  c.fillRect(fc * cw, fr * ch, cw, ch);
  const at = (box: number): [number, number] => {
    const { col, row } = cellOf(Math.max(1, Math.min(100, box)));
    return [(col + 0.5) * cw, (row + 0.5) * ch];
  };
  c.lineCap = "round";
  for (const [a, b] of Object.entries(LADDERS)) {
    const [x1, y1] = at(Number(a));
    const [x2, y2] = at(b);
    c.strokeStyle = "#9a6a2f";
    c.lineWidth = 4;
    for (const off of [-4, 4]) {
      c.beginPath();
      c.moveTo(x1 + off, y1);
      c.lineTo(x2 + off, y2);
      c.stroke();
    }
  }
  for (const [a, b] of Object.entries(SNAKES)) {
    const [x1, y1] = at(Number(a));
    const [x2, y2] = at(b);
    c.strokeStyle = "#16a34a";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo((x1 + x2) / 2 + 18, (y1 + y2) / 2, x2, y2);
    c.stroke();
    c.fillStyle = "#0f7a35";
    c.beginPath();
    c.arc(x1, y1, 5, 0, 7);
    c.fill();
  }
  ["🦁", "🐢", "🚀"].forEach((p, i) => {
    const seq = SNAKE_RUNS[i];
    const pos = (t / HOP + i * 0.33) % (seq.length - 1);
    const k = Math.floor(pos);
    const u = pos - k;
    const a = seq[k];
    const b = seq[k + 1];
    const [x1, y1] = at(a);
    const [x2, y2] = at(b);
    const jumpBox = Math.abs(b - a) === 1 || (a === 100 && b === 1);
    const e = ease(u);
    const x = x1 + (x2 - x1) * e;
    const y = y1 + (y2 - y1) * e - (jumpBox ? Math.sin(u * Math.PI) * 8 : 0);
    c.fillStyle = "rgba(0,0,0,.18)";
    c.beginPath();
    c.ellipse(x, y + 8, 7, 2.5, 0, 0, 7);
    c.fill();
    c.font = `20px ${EMO}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#000";
    c.fillText(p, x, y);
    if (!jumpBox && u < 0.9) {
      c.font = `800 11px "Baloo 2",sans-serif`;
      c.fillStyle = b > a ? "#15803d" : "#b91c1c";
      c.fillText(b > a ? "LADDER!" : "SNAKE!", Math.max(24, Math.min(W - 24, x)), Math.max(8, y - 16));
    }
  });
}

// ---------- Quality Cart: carts racing round the circuit ----------
function kart(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = "#3f8f4a";
  c.fillRect(0, 0, W, H);
  const sx = W / WORLD_W;
  const sy = H / WORLD_H;
  const P = PATH_POINTS;
  const path = () => {
    c.beginPath();
    for (let i = 0; i < P.x.length; i += 4) {
      const x = P.x[i] * sx;
      const y = P.y[i] * sy;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.closePath();
  };
  c.lineJoin = "round";
  c.strokeStyle = "#e5e7eb";
  c.lineWidth = 22;
  path();
  c.stroke();
  c.strokeStyle = "#555b66";
  c.lineWidth = 17;
  path();
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,.7)";
  c.setLineDash([5, 6]);
  c.lineWidth = 1.5;
  path();
  c.stroke();
  c.setLineDash([]);
  const n = P.x.length;
  ["#ef4444", "#3b82f6", "#f59e0b", "#a855f7"].forEach((col, k) => {
    // Slightly different speeds, with a turbo now and then.
    const speed = 0.075 + k * 0.006;
    const turbo = Math.sin(t * 0.9 + k * 2) > 0.85;
    const f = (t * speed + Math.sin(t * 0.5 + k) * 0.01 + 0.08 * k) % 1;
    const i = Math.floor(f * n) % n;
    c.save();
    c.translate(P.x[i] * sx, P.y[i] * sy);
    c.rotate(P.h[i]);
    c.scale(1.6, 1.6);
    if (turbo) {
      c.fillStyle = "rgba(251,146,60,.85)";
      c.beginPath();
      c.moveTo(-6, -3);
      c.lineTo(-14, 0);
      c.lineTo(-6, 3);
      c.fill();
    }
    c.fillStyle = col;
    c.fillRect(-6, -4, 12, 8);
    c.fillStyle = "#1f2937";
    c.fillRect(-4, -5, 3, 2);
    c.fillRect(2, -5, 3, 2);
    c.fillRect(-4, 3, 3, 2);
    c.fillRect(2, 3, 3, 2);
    c.restore();
  });
}

// ---------- Quality Clash: monsters take turns hitting the Titan ----------
function clash(c: CanvasRenderingContext2D, t: number) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1030");
  g.addColorStop(0.55, "#4a1d3a");
  g.addColorStop(0.56, "#3a3550");
  g.addColorStop(1, "#5d5a7c");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  for (let x = -10; x < W; x += 16) {
    c.fillStyle = "#ffcf40";
    c.beginPath();
    c.moveTo(x, H * 0.55 - 6);
    c.lineTo(x + 8, H * 0.55 - 6);
    c.lineTo(x + 13, H * 0.55);
    c.lineTo(x + 5, H * 0.55);
    c.fill();
  }
  const turn = Math.floor(t / 1.1) % 3;
  const u = (t / 1.1) % 1;
  const hit = u > 0.35 && u < 0.6;
  c.imageSmoothingEnabled = false;
  const bob = Math.sin(t * 2) * 3;
  c.drawImage(titan(hit ? "white" : ""), W / 2 - 60 + (hit ? Math.sin(t * 60) * 3 : 0), 8 + bob, 120, 120);
  // Titan HP bar, going down over the loop.
  const hp = 1 - ((t / 1.1) % 30) / 30;
  c.fillStyle = "rgba(0,0,0,.5)";
  c.fillRect(W / 2 - 60, 4, 120, 6);
  c.fillStyle = hp > 0.3 ? "#22c55e" : "#ef4444";
  c.fillRect(W / 2 - 60, 4, 120 * hp, 6);
  ["dragon", "fox", "turtle"].forEach((id, i) => {
    const me = i === turn;
    const lunge = me ? Math.sin(clamp(u / 0.6) * Math.PI) * 26 : 0;
    const x = 40 + i * 100 + (me ? (W / 2 - 72 - (40 + i * 100)) * (lunge / 26) * 0.35 : 0);
    c.drawImage(sprite(id, true), x, 110 - lunge, 64, 64);
  });
  if (u > 0.4 && u < 0.95) {
    c.save();
    c.globalAlpha = 1 - (u - 0.4) / 0.55;
    c.font = `800 20px "Baloo 2",sans-serif`;
    c.textAlign = "center";
    c.lineWidth = 4;
    c.strokeStyle = "#3a0d0d";
    const s = turn === 1 ? "-63 FAST!" : "-50";
    const y = 60 - (u - 0.4) * 40;
    c.strokeText(s, W / 2 + 34, y);
    c.fillStyle = turn === 1 ? "#facc15" : "#fff";
    c.fillText(s, W / 2 + 34, y);
    c.restore();
  }
}

// ---------- Fishing Derby: boats bob, fish leap in, now and then a golden one ----------
const FISH_PEOPLE = ["🎣", "🎣", "🎣", "🎣", "🎣", "🎣", "🎣", "🎣"].map((emoji, i) => ({ uid: String(i), emoji, color: ["#f59e0b", "#64748b", "#c2410c", "#2563eb", "#65a30d", "#6366f1", "#eab308", "#0d9488"][i], name: "" }));
const FISH_BOATS = layoutBoats(FISH_PEOPLE);
function fish(c: CanvasRenderingContext2D, t: number) {
  const k = Math.max(W / PW, H / PH) * 1.05;
  const ms = t * 1000;
  c.save();
  c.translate(W / 2, H / 2);
  c.scale(k, k);
  c.translate(-PW / 2, -PH / 2);
  drawPond(c, ms, false);
  for (const b of FISH_BOATS) drawBoat(c, b, ms, { tags: false, scale: 1.3 });
  // Two catches at a time, on different boats.
  for (const lane of [0, 1]) {
    const step = Math.floor(t / 1.6 + lane * 0.5);
    const u = ((t / 1.6 + lane * 0.5) % 1) * 1.3;
    const b = FISH_BOATS[(step * 3 + lane * 4) % FISH_BOATS.length];
    const kind = step % 5 === 4 ? "gold" : step % 3 === 2 ? "big" : "fish";
    fishSplash(c, b.bx, b.by, u * 1.2, kind === "fish" ? 1 : 2);
    if (u < 1) leapingFish(c, b, u, ms, kind, 1.4);
  }
  c.restore();
}

// ---------- Pull the Rope: the flag swings, a front player slips in with a splash ----------
function rope(c: CanvasRenderingContext2D, t: number) {
  // Closer than the projector: the players and the river fill the picture.
  const k = (W / SW) * 1.55;
  const ms = t * 1000;
  c.save();
  c.translate(W / 2, H / 2);
  c.scale(k, k);
  c.translate(-CX, -455);
  // Flag: sways, then each 8 s one side wins a tug and the other's front player falls in.
  const cyc = (t % 8) / 8;
  const side = Math.floor(t / 8) % 2 ? -1 : 1;
  const x = cyc < 0.55 ? Math.sin(t * 1.3) * 0.15 : side * (0.15 + ease(clamp((cyc - 0.55) / 0.3)) * 0.55);
  const s = x * FLAG_TRAVEL;
  const heave = cyc > 0.55 && cyc < 0.9;
  drawBackground(c, ms, heave);
  drawRope(c, 20, SW - 20, ROPE_Y);
  for (const team of ["red", "blue"] as const) {
    const dir = team === "red" ? -1 : 1;
    layoutSide(team, ["a", "b", "c", "d"]).forEach((sp, i) => {
      let px = CX + dir * sp.dist;
      px += dir * s > 0 ? s * 0.3 : s;
      const inRiver = px > RIVER_L + 8 && px < RIVER_R - 8;
      const pose: Pose = inRiver ? "wet" : heave && i % 2 === 0 ? "power" : "pull";
      pegDoll(c, { x: px, gy: inRiver ? WATER_Y + 30 : sp.gy, s: sp.s * 1.15, face: team === "red" ? 1 : -1, side: team, emoji: "", pose, i, t: ms, ropeY: ROPE_Y });
    });
  }
  drawFlag(c, CX + s, ROPE_Y + 2);
  drawFrontWater(c, ms);
  c.restore();
}

// Quality Spin: the split screen, both wheels spinning in turn and letters lighting up on the boards.
const SPIN_PREV = { red: "ZERO DEFECT", blue: "GEMBA WALK" };
function spinPrev(c: CanvasRenderingContext2D, t: number) {
  (["red", "blue"] as const).forEach((side, i) => {
    const x0 = i * (W / 2);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, side === "red" ? "#3a0b1c" : "#0b2f80");
    g.addColorStop(1, side === "red" ? "#120414" : "#04133a");
    c.fillStyle = g;
    c.fillRect(x0, 0, W / 2, H);
    c.fillStyle = side === "red" ? "#ff6b7a" : "#6fb4ff";
    c.font = "900 10px Orbitron, Arial Black, sans-serif";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.fillText(side.toUpperCase(), x0 + 8, 11);
    // Tiles: one more letter shows every 0.8 s (each side on its own beat), then the loop starts again.
    const phrase = SPIN_PREV[side];
    const order = [...new Set(phrase.replace(/ /g, ""))];
    const shownN = Math.floor(((t + i * 1.7) % 9) / 0.8);
    const shown = new Set(order.slice(0, shownN));
    const tw = 11;
    const total = phrase.length * (tw + 1.5);
    let x = x0 + W / 4 - total / 2;
    for (const ch of phrase) {
      if (ch !== " ") {
        c.fillStyle = shown.has(ch) ? "#ffffff" : "#c9daf5";
        c.fillRect(x, 24, tw, 15);
        if (shown.has(ch)) {
          c.fillStyle = "#0b2a66";
          c.font = "900 9px Orbitron, Arial Black, sans-serif";
          c.textAlign = "center";
          c.fillText(ch, x + tw / 2, 32);
        }
      }
      x += tw + 1.5;
    }
    // The wheel spins for 3 s, then rests, in turn.
    const cyc = (t + i * 2.5) % 5;
    const u = Math.min(1, cyc / 3);
    const rot = (Math.floor((t + i * 2.5) / 5) * 2.3 + (1 - Math.pow(1 - u, 4)) * 14) % (Math.PI * 2);
    drawSpinWheel(c, x0 + W / 4, 112, 56, rot, cyc < 3 ? t : 0, cyc < 3 ? 1 : 0);
  });
  c.fillStyle = "#f5c542";
  c.fillRect(W / 2 - 1, 0, 2, H);
}

const DRAW: Record<GameMode, (c: CanvasRenderingContext2D, t: number) => void> = { snake, kart, clash, fish, rope, spin: spinPrev };

/** A game's preview. `big` = the large one on the game's lobby page (more pixels). */
export default function GamePreview({ mode, className, big }: { mode: GameMode; className?: string; big?: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const scale = big ? 4 : 2;
  useEffect(() => {
    const canvas = cv.current;
    const c = canvas?.getContext("2d");
    if (!canvas || !c) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let id = 0;
    let visible = true;
    const io = new IntersectionObserver((es) => (visible = es[0]?.isIntersecting ?? true));
    io.observe(canvas);
    const t0 = performance.now();
    const frame = (now: number) => {
      id = requestAnimationFrame(frame);
      if (!visible) return;
      const t = reduce ? 0 : (now - t0) / 1000;
      c.setTransform(scale, 0, 0, scale, 0, 0);
      c.clearRect(0, 0, W, H);
      try {
        DRAW[mode](c, t);
      } catch {
        // A drawing problem must never break the lobby.
      }
    };
    id = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
    };
  }, [mode, scale]);
  return <canvas ref={cv} width={W * scale} height={H * scale} className={`game-preview ${big ? "big" : ""} ${className ?? ""}`} aria-hidden="true" />;
}
