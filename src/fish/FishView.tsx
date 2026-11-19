// Fishing Derby on the projector: one big cartoon pond with every player's boat around the edge.
// Small catches splash and show "+3.4 kg". BIG and GOLDEN fish: 1–8 players = the pond zooms in on that
// boat with a banner; 9 or more = a pop-up over the boat and a notice card in the side panel (max 3).
import { useEffect, useMemo, useRef, useState } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx } from "../lib/sound.ts";
import Countdown from "../components/Countdown.tsx";
import type { FeedItem, Game, Player } from "../lib/types.ts";
import { FRENZY_MS, GAME_MS, ZOOM_MAX_PLAYERS, boatOrder, fixFishState, frenzyAt, rankFishers, shoutOuts, type CatchKind, type FishState } from "./rules.ts";
import { BODY, CX, CY, DISP, PH, PW, clamp, drawBoat, drawPond, ease, easeOut, floatText, layoutBoats, leapingFish, rr, splash, star, type Boat } from "./pond2d.ts";

const LIST_MAX = 15;
const ZOOM_MS = 4_600;
const CARD_MS = 7_000;

type Fx = { uid: string; kind: CatchKind; kg: number; name: string; frenzy: boolean; at: number };

export function fishClock(game: Game) {
  const now = game.paused && game.pausedAt ? game.pausedAt : serverNow();
  const left = game.endsAt ? clamp(game.endsAt - now, 0, GAME_MS) : GAME_MS;
  return { now, left, elapsed: GAME_MS - left, started: !game.goAt || now >= game.goAt };
}
export const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function FishView({ game, players, feed, onAgain }: { game: Game; players: Record<string, Player>; feed: FeedItem[]; onAgain: () => void }) {
  useNow(250);
  const raw = useDbValue<Record<string, FishState>>("state");
  const states = useMemo(() => {
    const out: Record<string, FishState> = {};
    for (const [u, s] of Object.entries(raw ?? {})) if (players[u]) out[u] = fixFishState(s)!;
    return out;
  }, [raw, players]);
  const n = Object.keys(players).length;
  const zoomMode = n <= ZOOM_MAX_PLAYERS;
  const boats = useMemo(
    () =>
      layoutBoats(
        boatOrder(players).map((uid) => {
          const t = tokenById(players[uid]?.token);
          return { uid, emoji: t.emoji, color: t.color, name: players[uid]?.name ?? "Player" };
        }),
      ),
    [players],
  );

  // New catches: watch each player's answer counter.
  const seen = useRef<Record<string, number>>({});
  const fx = useRef<Fx[]>([]);
  const zoomQ = useRef<Fx[]>([]);
  const [cards, setCards] = useState<Fx[]>([]);
  useEffect(() => {
    const t = performance.now();
    for (const [uid, st] of Object.entries(states)) {
      const prev = seen.current[uid];
      seen.current[uid] = st.seq;
      if (prev === undefined || prev === st.seq || !st.result) continue;
      const r = st.result;
      const e: Fx = { uid, kind: r.kind, kg: r.kg, name: r.name, frenzy: r.frenzy, at: t };
      fx.current.push(e);
      if (r.kind === "gold") sfx.golden();
      else if (r.kind === "big") sfx.bigFish();
      else if (r.kind === "fish" && n <= 15) sfx.splash();
      else if (r.kind === "snap" && n <= ZOOM_MAX_PLAYERS) sfx.snap();
      if (r.kind === "big" || r.kind === "gold") {
        if (zoomMode) zoomQ.current.push(e);
        else setCards((c) => [e, ...c].slice(0, 3));
      }
    }
  }, [states, n, zoomMode]);
  useEffect(() => {
    if (!cards.length) return;
    const id = setTimeout(() => setCards((c) => c.filter((x) => performance.now() - x.at < CARD_MS)), 500);
    return () => clearTimeout(id);
  });

  // Frenzy jingle on the projector.
  const clock = fishClock(game);
  const fr = frenzyAt(clock.elapsed);
  const playing = game.status === "playing" && clock.started;
  const lastFrenzy = useRef(-1);
  useEffect(() => {
    if (playing && fr.on && fr.index !== lastFrenzy.current) {
      lastFrenzy.current = fr.index;
      sfx.frenzy();
    }
  }, [playing, fr.on, fr.index]);

  // Canvas drawing loop.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ boats, states, game, zoomMode, n });
  live.current = { boats, states, game, zoomMode, n };
  useEffect(() => {
    const cv = canvasRef.current!;
    let id = 0;
    let zoom: Fx | null = null;
    const draw = () => {
      id = requestAnimationFrame(draw);
      const { boats, states, game, zoomMode, n } = live.current;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const c = cv.getContext("2d")!;
      const t = performance.now();
      const now = serverNow();
      const k = Math.min(cv.width / PW, cv.height / PH);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = "#0d3b2c";
      c.fillRect(0, 0, cv.width, cv.height);
      c.setTransform(k, 0, 0, k, (cv.width - PW * k) / 2, (cv.height - PH * k) / 2);
      const clk = fishClock(game);
      const frenzy = game.status === "playing" && clk.started && frenzyAt(clk.elapsed).on;

      if (!zoom && zoomQ.current.length) {
        zoom = zoomQ.current.shift()!;
        zoom.at = t;
      }
      if (zoom && t - zoom.at > ZOOM_MS) zoom = null;
      const zb = zoom ? boats.find((b) => b.uid === zoom!.uid) : null;
      c.save();
      rr(c, 0, 0, PW, PH, 18);
      c.clip();
      let z = 1;
      let fx0 = CX;
      let fy0 = CY;
      if (zoom && zb) {
        const u = (t - zoom.at) / ZOOM_MS;
        const e = u < 0.15 ? ease(u / 0.15) : u > 0.85 ? 1 - ease((u - 0.85) / 0.15) : 1;
        z = 1 + 1.3 * e;
        fx0 = clamp(CX + (zb.x - CX) * e, PW / (2 * z), PW - PW / (2 * z));
        fy0 = clamp(CY + (zb.y - CY) * e, PH / (2 * z), PH - PH / (2 * z));
      }
      c.save();
      c.translate(PW / 2, PH / 2);
      c.scale(z, z);
      c.translate(-fx0, -fy0);
      drawPond(c, t, frenzy);
      const many = n > 24;
      for (const b of boats) {
        const st = states[b.uid];
        const snapped = st?.phase === "result" && st.result?.kind === "snap" && st.until > now ? (st.until - now) / 1000 : 0;
        drawBoat(c, b, t, { snapped, tags: !many, scale: many ? 0.8 : 1, dim: game.status === "ended" });
      }
      fx.current = fx.current.filter((f) => t - f.at < 2_600);
      for (const f of fx.current) {
        const b = boats.find((x) => x.uid === f.uid);
        if (!b) continue;
        drawCatch(c, b, f, t, zoomMode);
      }
      c.restore();
      if (frenzy) frenzyBanner(c, frenzyAt(clk.elapsed).endsIn);
      if (zoom && zb) zoomBanner(c, zoom, zb, (t - zoom.at) / ZOOM_MS);
      c.restore();
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, []);

  const order = rankFishers(Object.entries(states));
  const ended = game.status === "ended";
  return (
    <main className={`game fish-game ${ended ? "ended" : ""}`}>
      <section className="board-side">
        <div className="fish-stage">
          <canvas ref={canvasRef} className="fish-canvas" aria-label="Fishing pond" />
          {game.status === "playing" && (
            <div className="fish-hud">
              <span className={`fh-clock ${clock.left < 30_000 ? "warn" : ""}`}>⏱ {mmss(clock.left)}</span>
              {fr.on ? (
                <span className="fh-frenzy on">🌀 FRENZY ×2 · {Math.ceil(fr.endsIn / 1000)}s</span>
              ) : fr.nextIn !== null && clock.started ? (
                <span className="fh-frenzy">
                  Next frenzy in {mmss(fr.nextIn)} <small>/ Pesta seterusnya</small>
                </span>
              ) : null}
            </div>
          )}
          {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
          {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
          {ended && <FishPodium order={order} players={players} onAgain={onAgain} />}
        </div>
      </section>
      <aside className="side">
        {!zoomMode && cards.length > 0 && (
          <div className="m-cards">
            {cards.map((e, i) => {
              const p = players[e.uid];
              const t = tokenById(p?.token);
              return (
                <div key={`${e.uid}-${e.at}`} className={`m-card fish-card ${e.kind} ${i ? "compact" : ""}`}>
                  <div className="m-card-head">
                    <b>{e.kind === "gold" ? "✨ GOLDEN FISH!" : "🐠 BIG FISH!"}</b>
                    <small>{e.kind === "gold" ? "IKAN EMAS SUPER BESAR!" : "IKAN BESAR!"}</small>
                  </div>
                  <div className="m-card-who">
                    {t.emoji} {p?.name ?? "Player"}
                  </div>
                  <div className="m-card-res">
                    <b>
                      {e.name} · {e.kg} kg
                    </b>
                    {e.frenzy && <small>×2 frenzy / pesta</small>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="panel">
          <h3>
            Total catch <span className="muted">· {n} players</span>
          </h3>
          <ul className={`ranking fish-ranking ${order.length > 10 ? "many" : ""}`}>
            {order.slice(0, LIST_MAX).map(([uid, st], i) => {
              const p = players[uid];
              const t = tokenById(p?.token);
              return (
                <li key={uid} style={{ ["--c" as string]: t.color }}>
                  <span className="r-pos">{i + 1}</span>
                  <span className="r-emoji">{t.emoji}</span>
                  <span className="r-name">{p?.name}</span>
                  <span className="r-streak">{st.gold ? `✨${st.gold}` : st.big ? `🐠${st.big}` : ""}</span>
                  <span className="r-box">{st.kg.toFixed(1)} kg</span>
                </li>
              );
            })}
          </ul>
          {order.length > LIST_MAX && <p className="more-players small">+ {order.length - LIST_MAX} more / lagi</p>}
        </div>
        <div className="panel feed-panel">
          <h3>Live</h3>
          <ul className="feed">
            {[...feed].reverse().map((f) => (
              <li key={`${f.at}-${f.uid}-${f.text}`} className={`tone-${f.k === "gold" ? "win" : f.tone}`}>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}

function drawCatch(c: CanvasRenderingContext2D, b: Boat, f: Fx, t: number, zoomMode: boolean) {
  const age = t - f.at;
  if (f.kind === "snap") {
    floatText(c, "SNAP! ✂️", b.x, b.y - 52, age / 1600, "#dc2626", 28);
    return;
  }
  splash(c, b.bx, b.by, age / 800, f.kind === "fish" ? 1 : 2);
  if (age < 1300) leapingFish(c, b, age / 1200, t, f.kind);
  const col = f.kind === "gold" ? "#b45309" : f.frenzy ? "#7c3aed" : "#0369a1";
  // Big catches without zoom: the name of the catch above the boat, the weight below it.
  const below = !zoomMode && f.kind !== "fish";
  floatText(c, `+${f.kg} kg`, b.x, below ? b.y + 78 : b.y - 56, (age - 500) / 1800, col, f.kind === "fish" ? 30 : 38);
  if (f.kind === "gold") for (let i = 0; i < 8; i++) {
    const a = t / 300 + i * 0.8;
    star(c, b.x + Math.cos(a) * 64, b.y - 30 + Math.sin(a) * 44, 8);
  }
  if (!zoomMode && f.kind !== "fish") floatText(c, f.kind === "gold" ? "GOLDEN FISH!" : "BIG FISH!", b.x, b.y - 100, age / 2400, col, 44, f.kind === "gold" ? "IKAN EMAS!" : "IKAN BESAR!");
}

function frenzyBanner(c: CanvasRenderingContext2D, endsIn: number) {
  const u = 1 - endsIn / FRENZY_MS;
  c.save();
  c.globalAlpha = u < 0.03 ? u / 0.03 : 1;
  rr(c, PW / 2 - 330, 18, 660, 76, 38);
  c.fillStyle = "rgba(109,40,217,.9)";
  c.fill();
  c.strokeStyle = "#fff";
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `800 38px ${DISP}`;
  c.fillText("🌀 FISHING FRENZY ×2", PW / 2, 48);
  c.font = `700 18px ${BODY}`;
  c.fillText(`Pesta Memancing · every fish weighs double · ${Math.ceil(endsIn / 1000)}s`, PW / 2, 78);
  c.restore();
}

function zoomBanner(c: CanvasRenderingContext2D, e: Fx, b: Boat, u: number) {
  if (u < 0.2 || u > 0.92) return;
  const k = u < 0.26 ? easeOut((u - 0.2) / 0.06) : u > 0.86 ? 1 - (u - 0.86) / 0.06 : 1;
  const gold = e.kind === "gold";
  c.save();
  c.translate(PW / 2, PH - 120);
  c.scale(k, k);
  rr(c, -520, -82, 1040, 164, 26);
  c.fillStyle = gold ? "#f5c542" : "#0369a1";
  c.fill();
  c.strokeStyle = "#fff";
  c.lineWidth = 6;
  c.stroke();
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = gold ? "#3a2a00" : "#fff";
  c.font = `800 ${gold ? 50 : 62}px ${DISP}`;
  c.fillText(gold ? "SUPER BIG GOLDEN FISH!" : "BIG FISH!", 0, -30);
  c.font = `700 26px ${DISP}`;
  c.fillText(gold ? "IKAN EMAS SUPER BESAR!" : "IKAN BESAR!", 0, 12);
  c.font = `700 28px ${BODY}`;
  c.fillText(`${b.emoji} ${b.name} · ${e.name} · ${e.kg} kg${e.frenzy ? " (×2 frenzy)" : ""}`, 0, 52);
  c.restore();
}

function FishPodium({ order, players, onAgain }: { order: [string, FishState][]; players: Record<string, Player>; onAgain: () => void }) {
  const so = shoutOuts(order);
  const who = (uid: string) => {
    const t = tokenById(players[uid]?.token);
    return `${t.emoji} ${players[uid]?.name ?? "Player"}`;
  };
  return (
    <div className="podium-overlay">
      <div className="podium">
        <h2>🏆 Winners / Pemenang</h2>
        <ol>
          {order.slice(0, 3).map(([uid, st], i) => {
            const t = tokenById(players[uid]?.token);
            return (
              <li key={uid} className={`place p${i + 1}`}>
                <span className="pl-rank">#{i + 1}</span>
                <span className="pl-emoji">{t.emoji}</span>
                <span className="pl-name">{players[uid]?.name ?? "Player"}</span>
                <span className="pl-box">{st.kg.toFixed(1)} kg</span>
              </li>
            );
          })}
        </ol>
        <div className="fish-shout">
          {so.biggest && (
            <div>
              <b>🐟 Biggest single fish</b>
              <span>
                {who(so.biggest[0])} · {so.biggest[1].bestName} {so.biggest[1].best} kg
              </span>
              <small>Ikan paling besar</small>
            </div>
          )}
          {so.golden && (
            <div>
              <b>✨ Most golden fish</b>
              <span>
                {who(so.golden[0])} · {so.golden[1].gold}
              </span>
              <small>Paling banyak ikan emas</small>
            </div>
          )}
        </div>
        <button className="big-btn" onClick={onAgain}>
          Fish again with the same players
        </button>
      </div>
    </div>
  );
}
