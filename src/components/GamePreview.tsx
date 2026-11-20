// Small preview pictures for the game cards in the projector lobby.
import { useEffect, useRef } from "react";
import type { GameMode } from "../lib/types.ts";
import { LADDERS, SNAKES, cellOf } from "../lib/board.ts";
import { PATH_POINTS, WORLD_H, WORLD_W } from "../kart/track.ts";
import { sprite } from "../clash/sprites.ts";
import { titan } from "../clash/titan.ts";
import { PW, PH, drawPond, drawBoat, layoutBoats, leapingFish } from "../fish/pond2d.ts";
import { SW, SH, CX, ROPE_Y, drawBackground, drawFlag, drawFrontWater, drawRope, layoutSide, pegDoll } from "../rope/scene.ts";

function fish(c: CanvasRenderingContext2D) {
  const k = Math.max(W / PW, H / PH) * 1.05;
  c.save();
  c.translate(W / 2, H / 2);
  c.scale(k, k);
  c.translate(-PW / 2, -PH / 2);
  drawPond(c, 0, false);
  const people = ["🦁", "🐼", "🦊", "🐳", "🐸", "🚀", "⭐", "🦆"].map((emoji, i) => ({ uid: String(i), emoji, color: ["#f59e0b", "#64748b", "#c2410c", "#2563eb", "#65a30d", "#6366f1", "#eab308", "#0d9488"][i], name: "" }));
  const boats = layoutBoats(people);
  for (const b of boats) drawBoat(c, b, 0, { tags: false, scale: 1.3 });
  leapingFish(c, boats[2], 0.5, 0, "gold", 1.4);
  c.restore();
}

function rope(c: CanvasRenderingContext2D) {
  const k = Math.max(W / SW, H / SH) * 1.05;
  c.save();
  c.translate(W / 2, H / 2);
  c.scale(k, k);
  c.translate(-SW / 2, -SH / 2 - 60);
  drawBackground(c, 0, false);
  const pieces = ["🦁", "🐼", "🦊", "🐳", "🐸", "🚀"];
  const s = 70;
  drawRope(c, 20, SW - 20, ROPE_Y);
  for (const side of ["red", "blue"] as const) {
    const dir = side === "red" ? -1 : 1;
    layoutSide(side, ["a", "b", "c"]).forEach((sp, i) => {
      let x = CX + dir * sp.dist + (dir > 0 ? s * 0.3 : s);
      let gy = sp.gy;
      let pose: "pull" | "wet" = "pull";
      if (side === "red" && i === 0) {
        x = CX - 120;
        gy = 540;
        pose = "wet";
      }
      pegDoll(c, { x, gy, s: sp.s * 1.2, face: side === "red" ? 1 : -1, side, emoji: pieces[i + (side === "red" ? 0 : 3)], pose, i, t: 0, ropeY: ROPE_Y });
    });
  }
  drawFlag(c, CX + s, ROPE_Y + 2);
  drawFrontWater(c, 0);
  c.restore();
}

const W = 320;
const H = 180;

function snake(c: CanvasRenderingContext2D) {
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
    const { col, row } = cellOf(box);
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
    const mx = (x1 + x2) / 2 + 18;
    const my = (y1 + y2) / 2;
    c.quadraticCurveTo(mx, my, x2, y2);
    c.stroke();
    c.fillStyle = "#0f7a35";
    c.beginPath();
    c.arc(x1, y1, 5, 0, 7);
    c.fill();
  }
  const pieces = ["🦁", "🐢", "🚀"];
  pieces.forEach((p, i) => {
    const [x, y] = at([7, 23, 41][i]);
    c.font = "18px system-ui";
    c.textAlign = "center";
    c.fillText(p, x, y + 6);
  });
}

function kart(c: CanvasRenderingContext2D) {
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
  const cols = ["#ef4444", "#3b82f6", "#f59e0b", "#a855f7"];
  cols.forEach((col, k) => {
    const i = Math.floor((P.x.length * (0.1 + k * 0.06)) % P.x.length);
    c.fillStyle = col;
    c.fillRect(P.x[i] * sx - 4, P.y[i] * sy - 4, 8, 8);
  });
}

function clash(c: CanvasRenderingContext2D) {
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
  c.imageSmoothingEnabled = false;
  c.drawImage(titan(), W / 2 - 60, 8, 120, 120);
  ["dragon", "fox", "turtle"].forEach((id, i) => c.drawImage(sprite(id, true), 40 + i * 100, 110, 64, 64));
}

export default function GamePreview({ mode, className }: { mode: GameMode; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current?.getContext("2d");
    if (!c) return;
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.clearRect(0, 0, W, H);
    if (mode === "snake") snake(c);
    else if (mode === "kart") kart(c);
    else if (mode === "fish") fish(c);
    else if (mode === "rope") rope(c);
    else clash(c);
  }, [mode]);
  return <canvas ref={cv} width={W * 2} height={H * 2} className={`game-preview ${className ?? ""}`} aria-hidden="true" />;
}
