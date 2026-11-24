import EndButtons from "../components/EndButtons.tsx";
import { useEffect, useRef } from "react";
import { onValue, ref } from "../lib/store.ts";
import { db } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { KartCelebration, celebrating } from "./KartFinale.tsx";
import { tokenById } from "../lib/tokens.ts";
import type { FeedItem, Game, Player } from "../lib/types.ts";
import { HAZARDS, LAPS, PATH_POINTS, TRACK_W, WORLD_H, WORLD_W, HALF, place, wrap } from "./track.ts";
import Countdown from "../components/Countdown.tsx";
import { ITEMS, type World } from "./sim.ts";
import { live, type CartMe, type CartResult } from "./engine.ts";

type Fit = { scale: number; ox: number; oy: number; dpr: number };

/** Carts are drawn a bit larger than life so they are easy to see from the back of the room. */
const CART_SCALE = 1.3;

function trace(ctx: CanvasRenderingContext2D) {
  const P = PATH_POINTS;
  ctx.beginPath();
  for (let i = 0; i < P.x.length; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, P.x[i], P.y[i]);
  ctx.closePath();
}

/** The track, grass, kerbs, start line and fixed hazards: drawn once, then reused every frame. */
function drawBackground(fit: Fit, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#2f7a3a";
  ctx.fillRect(0, 0, w, h);
  ctx.setTransform(fit.scale * fit.dpr, 0, 0, fit.scale * fit.dpr, fit.ox * fit.dpr, fit.oy * fit.dpr);
  // mown-grass stripes
  for (let x = -200; x < WORLD_W + 200; x += 80) {
    ctx.fillStyle = (x / 80) % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)";
    ctx.fillRect(x, -200, 40, WORLD_H + 400);
  }
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  trace(ctx);
  ctx.strokeStyle = "rgba(0,0,0,.25)";
  ctx.lineWidth = TRACK_W + 30;
  ctx.stroke();
  trace(ctx);
  ctx.strokeStyle = "#f4f4f4";
  ctx.lineWidth = TRACK_W + 16;
  ctx.stroke();
  trace(ctx);
  ctx.setLineDash([18, 18]);
  ctx.strokeStyle = "#d62828";
  ctx.stroke();
  ctx.setLineDash([]);
  trace(ctx);
  ctx.strokeStyle = "#4a4f57";
  ctx.lineWidth = TRACK_W;
  ctx.stroke();
  trace(ctx);
  ctx.setLineDash([22, 26]);
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);

  // Start / finish line: chequered band across the road
  const s0 = place(0, 0);
  ctx.save();
  ctx.translate(s0.x, s0.y);
  ctx.rotate(s0.h);
  const sq = 9;
  for (let r = 0; r < 2; r++)
    for (let k = -Math.ceil(TRACK_W / 2 / sq); k < Math.ceil(TRACK_W / 2 / sq); k++) {
      ctx.fillStyle = (r + k) % 2 ? "#111" : "#fff";
      ctx.fillRect(r * sq - sq, k * sq, sq, sq);
    }
  ctx.restore();

  // Out-of-spec zones, potholes and cones
  for (const hz of HAZARDS) {
    if (hz.kind === "oos") {
      for (let k = -hz.len / 2; k < hz.len / 2; k += 4) {
        const p = place(hz.s + k, hz.d);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.h);
        ctx.fillStyle = Math.floor((k + hz.len) / 10) % 2 ? "rgba(220,38,38,.55)" : "rgba(250,204,21,.55)";
        ctx.fillRect(-2, -hz.wide * HALF, 5, hz.wide * HALF * 2);
        ctx.restore();
      }
      const m = place(hz.s, hz.d);
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Figtree, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "rgba(0,0,0,.6)";
      ctx.lineWidth = 3;
      ctx.strokeText("OUT OF SPEC", 0, 0);
      ctx.fillText("OUT OF SPEC", 0, 0);
      ctx.restore();
    } else if (hz.kind === "pothole") {
      const p = place(hz.s, hz.d);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.h);
      ctx.fillStyle = "#1f2226";
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else {
      const p = place(hz.s, hz.d);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(11, 10);
      ctx.lineTo(-11, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(-6, -1, 12, 4);
      ctx.restore();
    }
  }
  return c;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFrame(ctx: CanvasRenderingContext2D, bg: HTMLCanvasElement, fit: Fit, w: World, players: Record<string, Player>, clock: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(bg, 0, 0);
  ctx.setTransform(fit.scale * fit.dpr, 0, 0, fit.scale * fit.dpr, fit.ox * fit.dpr, fit.oy * fit.dpr);

  // Item boxes
  for (const b of w.boxes) {
    if (b.hiddenUntil > w.t) continue;
    const p = place(b.s, b.d);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(clock * 1.5);
    roundRect(ctx, -11, -11, 22, 22, 5);
    const g = ctx.createLinearGradient(-11, -11, 11, 11);
    g.addColorStop(0, "#fde68a");
    g.addColorStop(1, "#f59e0b");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(-clock * 1.5);
    ctx.fillStyle = "#7c2d12";
    ctx.font = "bold 14px Baloo 2, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Q", 0, 1);
    ctx.restore();
  }

  // Oil spills
  for (const o of w.oils) {
    if (o.until <= w.t) continue;
    const p = place(o.s, o.d);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "#0b0b0d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 12, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(147,197,253,.35)";
    ctx.beginPath();
    ctx.ellipse(-4, -3, 6, 3, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Carts, drawn back-to-front so the leaders are on top
  const carts = [...w.carts].sort((a, b) => a.p - b.p);
  for (const c of carts) {
    const pl = players[c.uid];
    if (!pl) continue;
    const t = tokenById(pl.token);
    const p = place(wrap(c.p), c.d);
    const spinning = c.spinUntil > w.t;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(CART_SCALE, CART_SCALE);
    ctx.save();
    ctx.rotate(p.h + (spinning ? clock * 14 : 0));
    if (c.boostUntil > w.t && !spinning) {
      const fl = ctx.createLinearGradient(-34, 0, -14, 0);
      fl.addColorStop(0, "rgba(251,191,36,0)");
      fl.addColorStop(1, "rgba(249,115,22,.95)");
      ctx.fillStyle = fl;
      ctx.beginPath();
      ctx.moveTo(-14, -6);
      ctx.lineTo(-34 - Math.random() * 8, 0);
      ctx.lineTo(-14, 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(0,0,0,.3)";
    roundRect(ctx, -15, -9, 32, 20, 6);
    ctx.fill();
    ctx.fillStyle = t.color;
    roundRect(ctx, -16, -10, 32, 20, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(-14, -12, 7, 4);
    ctx.fillRect(-14, 8, 7, 4);
    ctx.fillRect(7, -12, 7, 4);
    ctx.fillRect(7, 8, 7, 4);
    ctx.restore();
    if (c.shieldUntil > w.t) {
      ctx.strokeStyle = "rgba(96,165,250,.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.font = "18px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.emoji, 0, 1);
    ctx.font = "bold 11px Figtree, system-ui, sans-serif";
    const label = pl.name.length > 10 ? pl.name.slice(0, 9) + "…" : pl.name;
    const tw = ctx.measureText(label).width + 8;
    ctx.fillStyle = t.color;
    roundRect(ctx, -tw / 2, -30, tw, 14, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, 0, -23);
    if (c.slowUntil > w.t && !spinning) {
      ctx.font = "14px system-ui";
      ctx.fillText("💨", -20, 12);
    }
    ctx.restore();
  }
}

export default function KartView({ game, players, feed, onAgain }: { game: Game; players: Record<string, Player>; feed: FeedItem[]; onAgain: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const me = useDbValue<Record<string, CartMe>>("kart/me");
  const results = useDbValue<CartResult[]>(game.status === "ended" ? "kart/results" : null);
  // Race over: the same podium celebration and 3, 2, 1 as the phones, full screen, then the winners list + end buttons.
  const ended = game.status === "ended";
  useNow(ended ? 250 : 60000);
  const showing = ended && celebrating(game.endedAt);
  const playersRef = useRef(players);
  playersRef.current = players;

  // A window that only watches the race draws from the saved snapshot instead.
  const snapRef = useRef<World | null>(null);
  useEffect(
    () =>
      onValue(ref(db, "private/kartsim"), (s) => {
        const v = s.val();
        if (v?.world) snapRef.current = { ...v.world, oils: v.world.oils ?? [], boxes: v.world.boxes ?? [], carts: v.world.carts ?? [] };
      }),
    [],
  );

  useEffect(() => {
    const box = wrapRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    let fit: Fit = { scale: 1, ox: 0, oy: 0, dpr: 1 };
    let bg: HTMLCanvasElement | null = null;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = box.clientWidth;
      const ch = box.clientHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      const scale = Math.min(cw / WORLD_W, ch / WORLD_H);
      fit = { scale, ox: (cw - WORLD_W * scale) / 2, oy: (ch - WORLD_H * scale) / 2, dpr };
      bg = drawBackground(fit, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    let raf = 0;
    const loop = (ms: number) => {
      const w = live.world ?? snapRef.current;
      if (w && bg) drawFrame(ctx, bg, fit, w, playersRef.current, ms / 1000);
      else if (bg) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(bg, 0, 0);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const order = Object.entries(me ?? {}).sort((a, b) => a[1].rank - b[1].rank);
  const fmt = (t: number | null) => (t === null ? "" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`);

  return (
    <main className="game">
      <section className="board-side">
        <div className="race-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} className="race-canvas" aria-label="Race track" />
          <div className="race-legend">
            <span>⬜ Q box = item</span>
            <span>🔺 cone · ⚫ pothole = spin</span>
            <span>🟥 out of spec = slow</span>
          </div>
        </div>
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {showing && game.endedAt && <KartCelebration results={results ?? null} players={players} endedAt={game.endedAt} />}
        {ended && !showing && results && (
          <div className="podium-overlay">
            <div className="podium">
              <h2>🏆 Winners / Pemenang</h2>
              <ol>
                {results.slice(0, 5).map((r, i) => {
                  const p = players[r.uid];
                  return (
                    <li key={r.uid} className={`place p${i + 1}`}>
                      <span className="pl-rank">#{i + 1}</span>
                      <span className="pl-name">{p?.name ?? "Player"}</span>
                      <span className="pl-box">{r.finished ? fmt(r.time) : `Lap ${r.lap}`}</span>
                    </li>
                  );
                })}
              </ol>
              <EndButtons onAgain={onAgain} />
            </div>
          </div>
        )}
      </section>
      <aside className="side">
        <div className="panel">
          <h3>
            Positions <span className="muted">· {LAPS} laps</span>
          </h3>
          <ul className={`ranking cart-ranking ${order.length > 10 ? "many" : ""}`}>
            {order.slice(0, 15).map(([uid, m]) => {
              const p = players[uid];
              if (!p) return null;
              const t = tokenById(p.token);
              return (
                <li key={uid} style={{ ["--c" as string]: t.color }}>
                  <span className="r-pos">{m.rank}</span>
                  <span className="r-name">{p.name}</span>
                  <span className="r-item">{m.item ? ITEMS[m.item as keyof typeof ITEMS]?.icon : ""}</span>
                  <span className="r-box">{m.finished ? "🏁" : `L${m.lap}`}</span>
                </li>
              );
            })}
          </ul>
          {order.length > 15 && <p className="more-players small">+ {order.length - 15} more / lagi</p>}
        </div>
        <div className="panel feed-panel">
          <h3>Live</h3>
          <ul className="feed">
            {[...feed].reverse().map((f) => (
              <li key={`${f.at}-${f.text}`} className={`tone-${f.tone}`}>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
