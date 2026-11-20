// Projector screen for Quality Clash: Blue on top facing the room, Red at the bottom seen from behind.
// Drawn on a canvas from the battle state and the recent events in the database.
import EndButtons from "../components/EndButtons.tsx";
import { useEffect, useMemo, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import { ELEMENTS, creatureById } from "./creatures.ts";
import { sprite } from "./sprites.ts";
import { fixBoard, fixEvents, type ClashBoard, type ClashEvent } from "./engine.ts";
import { HP, SHIELD, SHIELD_EVERY, SUPER_STREAK, other, type Fighter, type Side } from "./sim.ts";

/** Seconds from the answer to the hit landing on the target. */
const HIT = 0.75;
const SHIELD_AT = HIT + 1.1;

/** Where everything goes: "wide" for the projector (16:9), "tall" for phones (9:16). */
type Row = { y: number; s: number; plat: [number, number]; box: { y: number; w: number }; xs: number[][] };
type Layout = { VW: number; VH: number; wall: number; dash: number; top: Row; bot: Row; msg: { y: number; w: number; h: number }; banner: number; meters: { top: [number, number]; bot: [number, number] }; clock: [number, number]; fz: number };
const WIDE: Layout = {
  VW: 960, VH: 540, wall: 150, dash: 335,
  top: { y: 226, s: 2.6, plat: [72, 17], box: { y: 8, w: 170 }, xs: [[480], [390, 570], [300, 480, 660]] },
  bot: { y: 452, s: 4.4, plat: [112, 27], box: { y: 470, w: 200 }, xs: [[480], [330, 630], [190, 480, 770]] },
  msg: { y: 64, w: 600, h: 54 }, banner: 270, meters: { top: [16, 22], bot: [808, 62] }, clock: [848, 10], fz: 1,
};
const TALL: Layout = {
  VW: 540, VH: 960, wall: 180, dash: 380,
  top: { y: 290, s: 2.2, plat: [60, 14], box: { y: 64, w: 168 }, xs: [[270], [180, 360], [92, 270, 448]] },
  bot: { y: 470, s: 3.2, plat: [78, 20], box: { y: 490, w: 168 }, xs: [[270], [180, 360], [92, 270, 448]] },
  msg: { y: 120, w: 520, h: 54 }, banner: 360, meters: { top: [12, 22], bot: [392, 22] }, clock: [221, 8], fz: 1.2,
};
// The layout and the side shown at the bottom for the frame being drawn.
let Lay = WIDE;
let VW = 960;
let VH = 540;
let BOTTOM: Side = "red";
let ME = "";

type Slot = { x: number; y: number; s: number; back: boolean; top: boolean };
function slotOf(f: Fighter, count: number): Slot {
  const top = f.side !== BOTTOM;
  const row = top ? Lay.top : Lay.bot;
  const xs = row.xs[Math.max(0, Math.min(2, count - 1))];
  const x = xs[Math.min(f.slot, xs.length - 1)];
  return { x, y: row.y, s: row.s, back: !top, top };
}

/** The battle drawn on a canvas, kept in step with the database. */
export function ArenaCanvas({ b, events, game, players, tall = false, bottom = "red", me = "", className }: { b: ClashBoard | null; events: ClashEvent[]; game: Game; players: Record<string, Player>; tall?: boolean; bottom?: Side; me?: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const live = useRef({ b, events, game, players, tall, bottom, me });
  live.current = { b, events, game, players, tall, bottom, me };
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const ctx = cv.current?.getContext("2d");
      if (ctx) {
        const v = live.current;
        Lay = v.tall ? TALL : WIDE;
        VW = Lay.VW;
        VH = Lay.VH;
        BOTTOM = v.bottom;
        ME = v.me;
        const now = v.game.paused && v.game.pausedAt ? v.game.pausedAt : serverNow();
        draw(ctx, v.b, v.events, v.game, v.players, now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const lay = tall ? TALL : WIDE;
  return <canvas ref={cv} width={lay.VW * 2} height={lay.VH * 2} className={className} aria-label="Quality Clash battle" />;
}

export default function ClashView({ game, players, onAgain }: { game: Game; players: Record<string, Player>; onAgain: () => void }) {
  const bRaw = useDbValue<ClashBoard>("clash/b");
  const evRaw = useDbValue<ClashEvent[]>("clash/ev");
  const b = useMemo(() => fixBoard(bRaw), [bRaw]);
  const events = useMemo(() => fixEvents(evRaw), [evRaw]);

  // Sounds for new events.
  const lastN = useRef<number | null>(null);
  useEffect(() => {
    const top = events.reduce((m, e) => Math.max(m, e.n), 0);
    if (lastN.current === null) {
      lastN.current = top;
      return;
    }
    for (const e of events) {
      if (e.n <= lastN.current) continue;
      if (e.kind === "wrong") sfx.wrong();
      else if (e.sup) sfx.ladder();
      else sfx.correct();
    }
    lastN.current = top;
  }, [events]);
  useEffect(() => {
    if (game.status === "ended") sfx.win();
  }, [game.status]);

  const ended = game.status === "ended";
  const winner = b?.winner ?? null;
  const winNames = (game.winners ?? []).map((u) => players[u]?.name ?? "Player");

  return (
    <main className="clash-stage">
      <div className="clash-frame">
        <ArenaCanvas b={b} events={events} game={game} players={players} className="clash-canvas" />
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {ended && (
          <div className="clash-win">
            <div className={`clash-win-card ${winner ?? ""}`}>
              <h2>{winner === "red" ? "RED WINS!" : winner === "blue" ? "BLUE WINS!" : "Battle over"}</h2>
              <div className="ms">{winner === "red" ? "Merah menang!" : winner === "blue" ? "Biru menang!" : "Pertempuran tamat"}</div>
              <p className="clash-win-names">{winNames.join(" · ")}</p>
              <EndButtons onAgain={onAgain} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- drawing ---------------- */

type Ctx = CanvasRenderingContext2D;
const PX = '"Press Start 2P", ui-monospace, monospace';
const BODY = '"Figtree", system-ui, sans-serif';

function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
/** "600 Figtree" + 12 → "600 12px Figtree" (the weight must come before the size). */
function setFont(c: Ctx, size: number, font: string) {
  const m = font.match(/^(\d+)\s+(.*)$/);
  c.font = m ? `${m[1]} ${size}px ${m[2]}` : `${size}px ${font}`;
}
function txt(c: Ctx, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left", font = PX) {
  setFont(c, size, font);
  c.textAlign = align;
  c.fillStyle = color;
  c.fillText(s, x, y);
}
function stxt(c: Ctx, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left", font = PX) {
  setFont(c, size, font);
  c.textAlign = align;
  c.fillStyle = "#000";
  c.fillText(s, x + 2, y + 2);
  c.fillStyle = color;
  c.fillText(s, x, y);
}
function fit(c: Ctx, s: string, max: number, size: number, min: number, font = PX) {
  let fs = size;
  setFont(c, fs, font);
  while (fs > min && c.measureText(s).width > max) {
    fs -= 0.5;
    setFont(c, fs, font);
  }
  return fs;
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hpColor = (f: number) => (f > 0.5 ? "#4ade80" : f > 0.2 ? "#facc15" : "#ef4444");

/** What each fighter looks like right now: HP still to drop for hits in flight, faint progress, flash. */
type Look = { hp: number; sh: number; faint: number; flash: boolean; shake: number; hop: number; shPop: number };

function looks(b: ClashBoard, events: ClashEvent[], now: number): Record<string, Look> {
  const out: Record<string, Look> = {};
  for (const f of Object.values(b.fighters)) out[f.id] = { hp: f.hp, sh: f.sh, faint: f.hp > 0 ? 0 : 1, flash: false, shake: 0, hop: 0, shPop: -1 };
  const t = now / 1000;
  for (const e of events) {
    if (e.kind !== "atk") continue;
    const age = t - e.at / 1000;
    e.hits.forEach(([a, tg, dmg, blk], i) => {
      const L = out[tg];
      const A = out[a];
      if (A) {
        const u = (age - i * 0.08) / 0.3;
        if (u > 0 && u < 1) A.hop = Math.max(A.hop, Math.sin(u * Math.PI));
      }
      if (!L) return;
      const k = clamp01((age - HIT) / 0.5);
      L.hp += (dmg - blk) * (1 - k);
      L.sh += blk * (1 - k);
      if (age >= HIT && age < HIT + 0.45) {
        L.flash = Math.floor((age - HIT) * 14) % 2 === 0;
        L.shake = Math.sin((age - HIT) * 70) * 6;
      }
      if (b.fighters[tg]?.hp === 0) L.faint = Math.min(L.faint, clamp01((age - HIT - 0.6) / 0.7));
    });
    if (e.sh && out[e.sh]) {
      const k = clamp01((age - SHIELD_AT) / 0.4);
      out[e.sh].sh -= SHIELD * (1 - k);
      if (age >= SHIELD_AT && age < SHIELD_AT + 1.2) out[e.sh].shPop = age - SHIELD_AT;
    }
  }
  for (const L of Object.values(out)) {
    L.hp = Math.min(HP, Math.max(0, L.hp));
    L.sh = Math.max(0, L.sh);
  }
  return out;
}

function drawBg(c: Ctx) {
  const W = Lay.wall;
  const g = c.createLinearGradient(0, 0, 0, W);
  g.addColorStop(0, "#1a1840");
  g.addColorStop(1, "#2c2a5e");
  c.fillStyle = g;
  c.fillRect(0, 0, VW, W);
  c.fillStyle = "#24224f";
  for (let x = 0; x < VW; x += 80) c.fillRect(x, W - 80, 2, 80);
  for (let x = -20; x < VW; x += 24) {
    c.fillStyle = "#ffcf40";
    c.beginPath();
    c.moveTo(x, W - 10);
    c.lineTo(x + 12, W - 10);
    c.lineTo(x + 20, W);
    c.lineTo(x + 8, W);
    c.fill();
  }
  const fg = c.createLinearGradient(0, W, 0, VH);
  fg.addColorStop(0, "#3a4770");
  fg.addColorStop(1, "#5a6c9c");
  c.fillStyle = fg;
  c.fillRect(0, W, VW, VH - W);
  c.strokeStyle = "rgba(255,255,255,.08)";
  c.lineWidth = 2;
  for (let i = -12; i <= 12; i++) {
    c.beginPath();
    c.moveTo(VW / 2 + i * 40, W);
    c.lineTo(VW / 2 + i * 160, VH);
    c.stroke();
  }
  let y = W;
  let step = 10;
  while (y < VH) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(VW, y);
    c.stroke();
    y += step;
    step *= 1.25;
  }
  c.strokeStyle = "rgba(255,207,64,.5)";
  c.setLineDash([10, 8]);
  c.beginPath();
  c.moveTo(0, Lay.dash);
  c.lineTo(VW, Lay.dash);
  c.stroke();
  c.setLineDash([]);
}

function platform(c: Ctx, s: Slot, side: Side) {
  const [rx, ry] = (s.top ? Lay.top : Lay.bot).plat;
  c.fillStyle = "#1d2340";
  c.beginPath();
  c.ellipse(s.x, s.y + 4, rx + 6, ry + 6, 0, 0, 7);
  c.fill();
  c.fillStyle = "#c9d3ea";
  c.beginPath();
  c.ellipse(s.x, s.y, rx, ry, 0, 0, 7);
  c.fill();
  c.fillStyle = side === "red" ? "rgba(255,90,95,.35)" : "rgba(74,168,255,.35)";
  c.beginPath();
  c.ellipse(s.x, s.y, rx * 0.72, ry * 0.66, 0, 0, 7);
  c.fill();
  c.strokeStyle = "#8f9cc0";
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(s.x, s.y, rx, ry, 0, 0, 7);
  c.stroke();
}

function creature(c: Ctx, f: Fighter, s: Slot, L: Look, stunned: boolean, t: number) {
  if (L.faint >= 1) return;
  const w = 40 * s.s;
  const dy = -L.hop * (s.top ? 10 : 14) + Math.sin(t * 3 + s.x) * 1.2;
  let y = s.y - 37 * s.s + dy;
  const x = s.x - w / 2 + L.shake;
  c.save();
  c.imageSmoothingEnabled = false;
  if (L.faint > 0) {
    c.globalAlpha = 1 - L.faint;
    y += L.faint * 30;
  }
  c.fillStyle = "rgba(0,0,0,.25)";
  c.beginPath();
  c.ellipse(s.x, s.y, w * 0.28, w * 0.06, 0, 0, 7);
  c.fill();
  if (stunned) c.filter = "grayscale(0.7)";
  c.drawImage(sprite(f.c, s.back, L.flash ? "white" : ""), x, y, w, w);
  c.restore();
  if (L.sh > 0.5) {
    c.save();
    c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 6);
    c.strokeStyle = "#7ae0ff";
    c.lineWidth = 4;
    c.fillStyle = "rgba(122,224,255,.12)";
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      const px = s.x + Math.cos(a) * w * 0.48;
      const py = s.y - w * 0.42 + Math.sin(a) * w * 0.5;
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }
  if (ME && f.uid === ME) {
    const ax = s.x;
    const ay = y - 4 + Math.sin(t * 5) * 3;
    c.fillStyle = "#ffcf40";
    c.beginPath();
    c.moveTo(ax - 9, ay - 12);
    c.lineTo(ax + 9, ay - 12);
    c.lineTo(ax, ay);
    c.fill();
    stxt(c, "YOU", ax, ay - 16, 10, "#ffcf40", "center");
  }
  if (L.shPop >= 0) stxt(c, `+${SHIELD} SHIELD`, s.x, y - 6 - L.shPop * 20, 12, "#7ae0ff", "center");
  if (stunned) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + i * 2.1;
      const sx = s.x + Math.cos(a) * w * 0.25;
      const sy = y + 8 + Math.sin(a) * 6;
      c.fillStyle = "#ffcf40";
      c.fillRect(sx - 4, sy - 4, 8, 8);
      c.fillStyle = "#fff";
      c.fillRect(sx - 1, sy - 1, 2, 2);
    }
  }
}

function box(c: Ctx, f: Fighter, L: Look, x: number, y: number, w: number, players: Record<string, Player>, streak: number, showNums: boolean) {
  const cr = creatureById(f.c);
  const T = ELEMENTS[cr.type];
  c.globalAlpha = L.faint >= 1 ? 0.5 : 1;
  rr(c, x, y, w, 52, 6);
  c.fillStyle = "#f6f1e3";
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = "#1b1530";
  c.stroke();
  c.fillStyle = f.side === "red" ? "#ff5a5f" : "#4aa8ff";
  c.fillRect(x + 3, y + 3, 7, 46);
  const name = cr.en.toUpperCase();
  const fz = Lay.fz;
  txt(c, name, x + 16, y + 17, fit(c, name, w - 66, 8 * fz, 5), "#1b1530");
  txt(c, `Lv${f.lv}`, x + w - 8, y + 17, 8, "#1b1530", "right");
  const pn = players[f.uid]?.name ?? "Player";
  txt(c, pn, x + 16, y + 32, fit(c, pn, w - 80, 13 * fz, 9, `700 ${BODY}`), "#4a4470", "left", `700 ${BODY}`);
  for (let i = 0; i < SUPER_STREAK; i++) {
    c.fillStyle = i < streak ? "#e0a000" : "#d6cfba";
    c.fillRect(x + w - 58 + i * 10, y + 24, 8, 8);
  }
  const bx = x + 38;
  const bw = w - 48;
  txt(c, "HP", x + 16, y + 46, 7, "#e0a000");
  c.fillStyle = "#1b1530";
  c.fillRect(bx - 2, y + 38, bw + 4, 10);
  c.fillStyle = "#3a3560";
  c.fillRect(bx, y + 40, bw, 6);
  const fr = L.hp / HP;
  c.fillStyle = hpColor(fr);
  c.fillRect(bx, y + 40, bw * fr, 6);
  if (L.sh > 0.5) {
    c.fillStyle = "#7ae0ff";
    c.fillRect(bx, y + 40, bw * Math.min(1, L.sh / HP), 3);
  }
  if (showNums) txt(c, `${Math.ceil(L.hp)}/${HP}${L.sh > 0.5 ? `  +${Math.ceil(L.sh)} shield` : ""}`, x + w - 8, y + 64, 9 * Lay.fz, "#f4efe4", "right");
  c.globalAlpha = 1;
}

function shot(c: Ctx, from: [number, number], to: [number, number], type: string, age: number, big: number, t: number) {
  const u = (age - 0.15) / 0.6;
  if (u < 0 || u > 1.05) return;
  const [ax, ay] = from;
  const [bx, by] = to;
  const T = ELEMENTS[type as keyof typeof ELEMENTS];
  const L = (k: number): [number, number] => [ax + (bx - ax) * k, ay + (by - ay) * k];
  if (type === "fire") {
    for (let i = 0; i < 18; i++) {
      const k = u - i * 0.035;
      if (k < 0 || k > 1) continue;
      const [x, y] = L(k);
      const j = Math.sin(i * 7 + t * 30) * 8 * big;
      const sz = (14 - i * 0.5) * big;
      c.fillStyle = ["#ffe066", "#ffb347", "#e8552d"][i % 3];
      c.fillRect(x + j - sz / 2, y - j * 0.5 - sz / 2, sz, sz);
    }
  } else if (type === "elec") {
    const k = Math.min(1, u * 1.4);
    const [ex, ey] = L(k);
    const seed = Math.floor(t * 24);
    for (const [lw, col] of [[9 * big, "#ffd84a"], [3 * big, "#ffffff"]] as [number, string][]) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(ax, ay);
      for (let i = 1; i < 9; i++) {
        const q = i / 9;
        const r = Math.sin(seed * 13.1 + i * 7.7) * 18 * big;
        c.lineTo(ax + (ex - ax) * q + r, ay + (ey - ay) * q + r * 0.4);
      }
      c.lineTo(ex, ey);
      c.stroke();
    }
  } else if (type === "water") {
    for (let i = 0; i < 4; i++) {
      const k = u - i * 0.09;
      if (k < 0 || k > 1) continue;
      const [x, y] = L(k);
      const h = -Math.sin(k * Math.PI) * 40;
      const sz = (16 - i * 2) * big;
      c.fillStyle = T.a;
      c.fillRect(x - sz / 2, y + h - sz / 2, sz, sz);
      c.fillStyle = T.l;
      c.fillRect(x - sz / 2 + 2, y + h - sz / 2 + 2, sz / 3, sz / 3);
    }
  } else if (type === "wind") {
    for (let i = 0; i < 3; i++) {
      const k = u - i * 0.12;
      if (k < 0 || k > 1) continue;
      const [x, y] = L(k);
      c.save();
      c.translate(x, y);
      c.rotate(t * 14 + i);
      c.strokeStyle = i % 2 ? "#ffffff" : T.ui;
      c.lineWidth = 6 * big;
      c.beginPath();
      c.arc(0, 0, 18 * big, 0, Math.PI * 1.2);
      c.stroke();
      c.restore();
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const k = u - i * 0.06;
      if (k < 0 || k > 1) continue;
      const [x, y] = L(k);
      const h = -Math.sin(k * Math.PI) * 70;
      const sz = (14 - i) * big;
      c.save();
      c.translate(x + (i - 2) * 8, y + h);
      c.rotate(t * 8 + i);
      c.fillStyle = i % 2 ? "#8f97a3" : "#a8805a";
      c.fillRect(-sz / 2, -sz / 2, sz, sz);
      c.fillStyle = "#1b1530";
      c.fillRect(-sz / 2, sz / 2 - 3, sz, 3);
      c.restore();
    }
  }
  if (u > 0.9) {
    const r = (u - 0.9) * 10;
    c.strokeStyle = "#fff";
    c.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      c.beginPath();
      c.moveTo(bx + Math.cos(a) * 20 * r, by + Math.sin(a) * 20 * r);
      c.lineTo(bx + Math.cos(a) * 45 * r, by + Math.sin(a) * 45 * r);
      c.stroke();
    }
  }
}

function message(c: Ctx, b: ClashBoard, events: ClashEvent[], players: Record<string, Player>, game: Game, now: number) {
  const last = [...events].reverse().find((e) => now - e.at < 3500);
  let en = "Answer on your phone! The faster, the sooner you attack.";
  let ms = "Jawab di telefon anda! Lebih cepat, lebih awal menyerang.";
  if (game.status === "ended") return;
  if (last) {
    const age = (now - last.at) / 1000;
    const nm = players[last.uid]?.name ?? "Player";
    if (last.kind === "wrong") {
      if (b.format === "solo") {
        en = `${nm} ${last.timeout ? "ran out of time" : "answered wrong"}. All monsters stunned!`;
        ms = `${nm} ${last.timeout ? "kehabisan masa" : "salah"}. Semua raksasa pening!`;
      } else {
        const f = Object.values(b.fighters).find((x) => x.uid === last.uid);
        const cr = creatureById(f?.c);
        en = `${nm} ${last.timeout ? "ran out of time" : "answered wrong"}. ${cr.en} is stunned!`;
        ms = `${cr.ms} pening!`;
      }
    } else {
      const f = b.fighters[last.hits[0]?.[0] ?? ""];
      const cr = creatureById(f?.c);
      if (b.format === "solo") {
        en = `${nm} answered right! ${last.hits.length} monster${last.hits.length === 1 ? "" : "s"} attack!`;
        ms = `${nm} betul! ${last.hits.length} raksasa menyerang!`;
      } else {
        en = `${nm}'s ${cr.en} used ${cr.move.en}!`;
        ms = `${cr.ms} guna ${cr.move.ms}!`;
      }
      if (age > HIT + 0.1) {
        const tot = last.hits.reduce((a, h) => a + h[2], 0);
        const blk = last.hits.reduce((a, h) => a + h[3], 0);
        en = blk > 0 ? `Shield blocked ${blk}! ${tot - blk} damage.` : `${tot} damage!`;
        ms = blk > 0 ? `Perisai menahan ${blk}!` : `${tot} kerosakan!`;
      }
      const dead = last.hits.find((h) => b.fighters[h[1]]?.hp === 0);
      if (dead && age > HIT + 0.9) {
        const ct = creatureById(b.fighters[dead[1]]?.c);
        en = `${ct.en} fainted!`;
        ms = `${ct.ms} pengsan!`;
      }
      if (last.sh && age >= SHIELD_AT) {
        const cs = creatureById(b.fighters[last.sh]?.c);
        en = `Team ${last.side === "red" ? "Red" : "Blue"}: ${SHIELD_EVERY} right answers! ${cs.en} gets +${SHIELD} shield`;
        ms = `Pasukan ${last.side === "red" ? "Merah" : "Biru"}: ${SHIELD_EVERY} jawapan betul! Perisai +${SHIELD}`;
      }
    }
  }
  const w = Lay.msg.w;
  const x = (VW - w) / 2;
  const y = Lay.msg.y;
  rr(c, x, y, w, Lay.msg.h, 8);
  c.fillStyle = "rgba(16,14,40,.92)";
  c.fill();
  c.strokeStyle = "#ffcf40";
  c.lineWidth = 3;
  c.stroke();
  txt(c, en, VW / 2, y + 22, fit(c, en, w - 24, 11 * Lay.fz, 6.5), "#ffffff", "center");
  txt(c, ms, VW / 2, y + 44, fit(c, ms, w - 24, 16 * Lay.fz, 10, `600 ${BODY}`), "#cfc8f0", "center", `600 ${BODY}`);
}

function draw(c: Ctx, b: ClashBoard | null, events: ClashEvent[], game: Game, players: Record<string, Player>, now: number) {
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.clearRect(0, 0, VW, VH);
  drawBg(c);
  if (!b) return;
  const t = now / 1000;
  const all = Object.values(b.fighters);
  const count: Record<Side, number> = { red: all.filter((f) => f.side === "red").length, blue: all.filter((f) => f.side === "blue").length };
  const slots: Record<string, Slot> = {};
  for (const f of all) slots[f.id] = slotOf(f, count[f.side]);
  const L = looks(b, events, now);
  const stun = b.stun ?? {};
  const center = (id: string): [number, number] => {
    const s = slots[id];
    return s ? [s.x, s.y - 18 * s.s] : [VW / 2, VH / 2];
  };
  // walkway between the platforms
  c.strokeStyle = "#2a3150";
  c.lineWidth = 16;
  c.lineCap = "round";
  for (const side of ["blue", "red"] as Side[]) {
    const xs = all.filter((f) => f.side === side).map((f) => slots[f.id].x);
    if (!xs.length) continue;
    const y = side === BOTTOM ? Lay.bot.y : Lay.top.y;
    c.beginPath();
    c.moveTo(Math.min(...xs), y);
    c.lineTo(Math.max(...xs), y);
    c.stroke();
  }
  c.beginPath();
  c.moveTo(VW / 2, Lay.top.y);
  c.lineTo(VW / 2, Lay.bot.y);
  c.stroke();
  for (const f of all) platform(c, slots[f.id], f.side);

  const recent = events.filter((e) => e.kind === "atk" && now - e.at < 2000) as Extract<ClashEvent, { kind: "atk" }>[];
  const drawShots = (side: Side) => {
    for (const e of recent) {
      if (e.side !== side) continue;
      const age = (now - e.at) / 1000;
      e.hits.forEach(([a, tg], i) => {
        const f = b.fighters[a];
        if (f) shot(c, center(a), center(tg), creatureById(f.c).type, age - i * 0.08, e.sup ? 2 : 1, t);
      });
    }
  };
  const TOP = other(BOTTOM);
  for (const f of all.filter((x) => x.side === TOP)) creature(c, f, slots[f.id], L[f.id], (stun[f.uid] ?? 0) > now && f.hp > 0, t);
  drawShots(BOTTOM);
  for (const f of all.filter((x) => x.side === BOTTOM)) creature(c, f, slots[f.id], L[f.id], (stun[f.uid] ?? 0) > now && f.hp > 0, t);
  drawShots(TOP);

  // damage numbers
  for (const e of recent) {
    const age = (now - e.at) / 1000 - HIT;
    if (age < 0 || age > 1.3) continue;
    const sum: Record<string, number> = {};
    for (const h of e.hits) sum[h[1]] = (sum[h[1]] ?? 0) + h[2];
    for (const [tg, d] of Object.entries(sum)) {
      const s = slots[tg];
      if (!s) continue;
      const [x, y] = center(tg);
      const yy = (s.top ? y + 10 : y - 30) - age * 40;
      c.globalAlpha = Math.min(1, (1.3 - age) * 3);
      stxt(c, `-${d}`, x, yy, e.sup ? 26 : 18, "#ffffff", "center");
      if (e.fast) stxt(c, "FAST +25%", x, yy + 26, 10, "#7ae0ff", "center");
      c.globalAlpha = 1;
    }
  }

  // HP boxes
  for (const f of all) {
    const row = slots[f.id].top ? Lay.top : Lay.bot;
    const w = row.box.w;
    const x = Math.max(4, Math.min(VW - w - 4, slots[f.id].x - w / 2));
    box(c, f, L[f.id], x, row.box.y, w, players, b.streak[f.uid] ?? 0, !slots[f.id].top);
  }

  // team labels / shield meters, and the battle clock (no time limit: it only counts up)
  const meter = (side: Side, x: number, y: number) => {
    const col = side === "red" ? "#ff5a5f" : "#4aa8ff";
    if (b.format === "team") {
      stxt(c, side === "red" ? "RED TEAM" : "BLUE TEAM", x, y, 9, col);
      txt(c, side === "red" ? "Pasukan Merah" : "Pasukan Biru", x, y + 17, 13, "#cfc8f0", "left", `600 ${BODY}`);
      const n = b.rights[side] % SHIELD_EVERY;
      for (let i = 0; i < SHIELD_EVERY; i++) {
        c.fillStyle = i < n ? "#7ae0ff" : "#2c2a5e";
        c.fillRect(x + i * 13, y + 26, 10, 10);
      }
      txt(c, `+${SHIELD}`, x + 70, y + 35, 8, "#7ae0ff");
    } else {
      const owner = all.find((f) => f.side === side);
      stxt(c, `${side === "red" ? "RED" : "BLUE"} · ${(players[owner?.uid ?? ""]?.name ?? "").toUpperCase()}`.slice(0, 18), x, y, 9, col);
      txt(c, "3 monsters / raksasa", x, y + 17, 12, "#cfc8f0", "left", `600 ${BODY}`);
    }
  };
  meter(TOP, ...Lay.meters.top);
  meter(BOTTOM, ...Lay.meters.bot);
  if (game.goAt) {
    const end = game.status === "ended" && game.endedAt ? game.endedAt : now;
    const el = Math.max(0, (end - game.goAt) / 1000);
    const [cx, cy] = Lay.clock;
    rr(c, cx, cy, 98, 36, 6);
    c.fillStyle = "#10102a";
    c.fill();
    txt(c, `${Math.floor(el / 60)}:${String(Math.floor(el % 60)).padStart(2, "0")}`, cx + 49, cy + 26, 14, "#ffcf40", "center");
  }

  message(c, b, events, players, game, now);

  // super move banner
  const sup = [...recent].reverse().find((e) => e.sup && now - e.at < 1400);
  if (sup) {
    const k = (now - sup.at) / 1000;
    if (k < 0.25) {
      c.fillStyle = `rgba(255,255,255,${0.5 * (1 - k / 0.25)})`;
      c.fillRect(0, 0, VW, VH);
    }
    const sl = Math.min(1, k * 5);
    c.fillStyle = sup.side === "red" ? "rgba(255,90,95,.92)" : "rgba(74,168,255,.92)";
    const by = Lay.banner;
    c.fillRect(0, by, VW * sl, 64);
    if (sl >= 1) {
      stxt(c, "SUPER MOVE!", VW / 2, by + 30, 22, "#ffffff", "center");
      const who = b.format === "solo" ? players[sup.uid]?.name ?? "" : creatureById(b.fighters[sup.hits[0]?.[0] ?? ""]?.c).en;
      txt(c, `GERAKAN SUPER! · ${who.toUpperCase()}`, VW / 2, by + 52, 9 * Lay.fz, "#1b1530", "center");
    }
  }
}
