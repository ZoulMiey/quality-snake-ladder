// Pull the Rope on the projector: the river crossing seen from the side (owner's pick B2, wider river) with
// wooden peg dolls (owner's pick 5). Front players slip into the river with a SPLASH as the rope moves; at the
// end of a round the whole losing team is dragged in, one after another.
import EndButtons from "../components/EndButtons.tsx";
import { useEffect, useMemo, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import Countdown from "../components/Countdown.tsx";
import type { FeedItem, Game, Player, RopeGame } from "../lib/types.ts";
import { fixRope } from "./engine.ts";
import { HEAVE_MS, ropeFeedLines, ROUND_BANNER_MS, HEAVE_WARN_MS, ROUND_MS, SIDES, SIDE_NAME, fixRopeState, heaveAt, mvpOrder, other, shoutOuts, type RopeState, type Side } from "./rules.ts";
import {
  CX,
  DISP,
  BODY,
  FLAG_TRAVEL,
  RIVER_L,
  RIVER_R,
  ROPE_Y,
  SH,
  SW,
  WATER_Y,
  addSplash,
  clamp,
  drawBackground,
  drawFlag,
  drawFrontWater,
  drawMeter,
  drawRope,
  drawSplashes,
  ease,
  layoutSide,
  pegDoll,
  rr,
  type Drop,
  type Pop,
  type Pose,
} from "./scene.ts";

const LIST_MAX = 15;
/** How the losing team is dragged in after a round: one after another. */
const DRAG_STAGGER_MS = 110;
const DRAG_MS = 900;

export function ropeClock(game: Game, rope: RopeGame | null) {
  const now = game.paused && game.pausedAt ? game.pausedAt : serverNow();
  const started = !game.goAt || now >= game.goAt;
  if (!rope) return { now, left: ROUND_MS, elapsed: 0, started, breakLeft: 0 };
  const left = rope.phase === "play" ? clamp(rope.endsAt - now, 0, ROUND_MS) : 0;
  return { now, left, elapsed: rope.phase === "play" ? ROUND_MS - left : 0, started, breakLeft: rope.breakUntil ? Math.max(0, rope.breakUntil - now) : 0 };
}
export const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function useRopeStates(players: Record<string, Player> | null | undefined) {
  const raw = useDbValue<Record<string, RopeState>>("state");
  return useMemo(() => {
    const out: Record<string, RopeState> = {};
    for (const [u, s] of Object.entries(raw ?? {})) {
      const st = fixRopeState(s);
      if (st && players?.[u]) out[u] = st;
    }
    return out;
  }, [raw, players]);
}

/** Which team the flag/scene treats as "winning" a finished round, and since when. */
function roundOver(rope: RopeGame | null) {
  if (!rope || rope.phase === "play" || !rope.last || rope.last.win === "draw") return null;
  return { win: rope.last.win as Side, at: rope.last.at };
}

export default function RopeView({ game, players, feed, onAgain, onStartRound }: { game: Game; players: Record<string, Player>; feed: FeedItem[]; onAgain: () => void; onStartRound?: () => void }) {
  useNow(250);
  const rope = useMemo(() => fixRope(game.rope), [game.rope]);
  const states = useRopeStates(players);
  const n = Object.keys(states).length;
  const clock = ropeClock(game, rope);
  const playing = game.status === "playing" && clock.started && rope?.phase === "play";
  const h = heaveAt(clock.elapsed);
  const shownFeed = useRopeFeed(feed);

  // Sounds: HEAVE!, round results, power pulls (not too many).
  const lastHeave = useRef(-1);
  useEffect(() => {
    if (playing && h.on && h.index !== lastHeave.current) {
      lastHeave.current = h.index;
      sfx.frenzy();
    }
    if (!h.on && !playing) lastHeave.current = -1;
  }, [playing, h.on, h.index]);
  const lastRound = useRef("");
  useEffect(() => {
    const k = rope?.last ? `${rope.round}-${rope.last.at}` : "";
    if (!k || k === lastRound.current) return;
    const first = lastRound.current === "";
    lastRound.current = k;
    if (!first) sfx.win();
  }, [rope?.round, rope?.last?.at]);
  const seen = useRef<Record<string, number>>({});
  const powerAt = useRef(0);
  useEffect(() => {
    for (const [uid, st] of Object.entries(states)) {
      const prev = seen.current[uid];
      seen.current[uid] = st.seq;
      if (prev === undefined || prev === st.seq || !st.result) continue;
      if (st.result.power && performance.now() - powerAt.current > 600) {
        powerAt.current = performance.now();
        sfx.ladder();
      }
    }
  }, [states]);

  // Canvas drawing loop.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ game, rope, states, players });
  live.current = { game, rope, states, players };
  useEffect(() => {
    const cv = canvasRef.current!;
    let id = 0;
    let shownX = 0;
    let last = performance.now();
    const wet: Record<string, number> = {};
    const drops: Drop[] = [];
    const pops: Pop[] = [];
    let splashSound = 0;
    const draw = () => {
      id = requestAnimationFrame(draw);
      const { game, rope, states, players } = live.current;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const c = cv.getContext("2d")!;
      const t = performance.now();
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const now = serverNow();
      // Fill the screen: the scene is scaled to cover the width; sky and river carry on beyond it.
      const k = Math.min(cv.width / SW, cv.height / SH);
      c.setTransform(1, 0, 0, 1, 0, 0);
      const bg = c.createLinearGradient(0, 0, 0, cv.height);
      bg.addColorStop(0, "#6cc6f5");
      bg.addColorStop(0.62, "#d6f1ff");
      bg.addColorStop(0.64, "#8b5a2b");
      bg.addColorStop(1, "#7a4f24");
      c.fillStyle = bg;
      c.fillRect(0, 0, cv.width, cv.height);
      c.setTransform(k, 0, 0, k, (cv.width - SW * k) / 2, (cv.height - SH * k) / 2);

      const clk = ropeClock(game, rope);
      const heave = game.status === "playing" && rope?.phase === "play" && clk.started && heaveAt(clk.elapsed).on;
      const target = game.ropeX ?? 0;
      shownX += (target - shownX) * Math.min(1, dt * 6);
      if (Math.abs(target - shownX) < 0.0005) shownX = target;
      const over = roundOver(rope);
      const flagX = rope?.phase === "play" || !over ? shownX : clamp(shownX, -1, 1);
      const s = flagX * FLAG_TRAVEL;

      drawBackground(c, t, heave);

      // Everyone's spot.
      type Fig = { uid: string; side: Side; row: number; x: number; gy: number; s: number; pose: Pose; i: number; emoji: string; name: string; wet: boolean };
      const figs: Fig[] = [];
      for (const side of SIDES) {
        const order = (rope?.order[side] ?? []).filter((u) => players[u] && states[u]);
        const dir = side === "red" ? -1 : 1;
        const spots = layoutSide(side, order);
        const loser = over && over.win !== side;
        spots.forEach((sp, idx) => {
          let x = CX + dir * sp.dist;
          // Pulled towards the river: full shift. Pulling away: only a little, so the team stays in view.
          x += dir * s > 0 ? s * 0.3 : s;
          let pose: Pose = "pull";
          const st = states[sp.uid];
          if (st?.phase === "result" && st.result?.power && st.until > now) pose = "power";
          if (over) {
            const e = ease(clamp((now - over.at - idx * DRAG_STAGGER_MS) / DRAG_MS));
            if (loser) {
              // Dragged into the river, spread out across it, front players deepest.
              const span = RIVER_R - RIVER_L - 70;
              const spot = side === "red" ? RIVER_R - 35 - (idx / Math.max(1, order.length - 1)) * span * 0.85 : RIVER_L + 35 + (idx / Math.max(1, order.length - 1)) * span * 0.85;
              x = x + (spot - x) * e;
            } else if (e > 0.3) pose = "win";
          }
          const inRiver = x > RIVER_L + 8 && x < RIVER_R - 8;
          const was = (wet[sp.uid] ??= inRiver ? 1 : 0);
          const goal = inRiver ? 1 : 0;
          wet[sp.uid] = was + (goal - was) * Math.min(1, dt * 9);
          if (inRiver && was < 0.05 && goal === 1) {
            addSplash(drops, pops, x, WATER_Y - 4, 1, !pops.some((q) => Math.abs(q.x - x) < 160 && q.t > 0.4));
            if (t - splashSound > 250) {
              splashSound = t;
              sfx.splash();
            }
          }
          const d = wet[sp.uid];
          if (d > 0.05) pose = "wet";
          const p = players[sp.uid];
          figs.push({ uid: sp.uid, side, row: sp.row, x, gy: sp.gy + (WATER_Y + 26 * sp.s - sp.gy) * d, s: sp.s, pose, i: idx, emoji: "", name: p?.name ?? "", wet: d > 0.05 });
        });
      }
      const maxRow = Math.max(0, ...figs.map((f) => f.row));
      const drawFig = (f: Fig) => pegDoll(c, { x: f.x, gy: f.gy, s: f.s, face: f.side === "red" ? 1 : -1, side: f.side, emoji: f.emoji, pose: f.pose, i: f.i, t, ropeY: f.pose === "win" ? null : ROPE_Y + (f.wet ? 6 : 0) });
      for (let row = maxRow; row >= 1; row--) figs.filter((f) => f.row === row).forEach(drawFig);
      drawRope(c, 20 + Math.min(0, s), SW - 20 + Math.max(0, s), ROPE_Y);
      drawFlag(c, CX + s, ROPE_Y + 2);
      figs.filter((f) => f.row === 0).forEach(drawFig);
      drawFrontWater(c, t);
      for (const f of figs) {
        if (!f.wet) continue;
        c.strokeStyle = "rgba(255,255,255,.85)";
        c.lineWidth = 3;
        c.beginPath();
        c.ellipse(f.x, WATER_Y + 2, (26 + Math.sin(t / 160 + f.i) * 4) * f.s, 6 * f.s, 0, 0, Math.PI * 2);
        c.stroke();
      }
      // Names (hidden above 24 players, like Fishing Derby).
      if (figs.length <= 24) {
        c.font = `700 ${figs.length > 16 ? 12 : 14}px ${BODY}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        for (const f of figs) {
          if (f.wet) continue;
          const w = c.measureText(f.name).width + 12;
          const y = f.gy + 14 + (f.row ? -4 : 0);
          rr(c, f.x - w / 2, y - 9, w, 18, 9);
          c.fillStyle = "rgba(255,255,255,.88)";
          c.fill();
          c.fillStyle = "#1f2a1c";
          c.fillText(f.name, f.x, y + 0.5);
        }
      }
      drawSplashes(c, drops, pops, dt);
      drawMeter(c, CX - 330, 20, 660, 30, flagX);
      c.font = `800 18px ${DISP}`;
      c.textBaseline = "middle";
      c.textAlign = "left";
      c.fillStyle = SIDE_NAME.red.dark;
      c.fillText("RED · MERAH", CX - 330, 66);
      c.textAlign = "right";
      c.fillStyle = SIDE_NAME.blue.dark;
      c.fillText("BLUE · BIRU", CX + 330, 66);
      if (heave) heaveBanner(c, heaveAt(clk.elapsed).endsIn, t);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, []);

  // Countdowns: 5 s before each HEAVE!, the last 10 s of each round, and the break between rounds.
  const heaveSoon = playing && !game.paused && !h.on && h.nextIn !== null && h.nextIn <= HEAVE_WARN_MS ? Math.ceil(h.nextIn / 1000) : null;
  const final = playing && !game.paused && clock.left > 0 && clock.left <= 10_000 ? Math.ceil(clock.left / 1000) : null;
  // Between rounds: 5-second countdown once everyone is ready, then "ROUND 2".
  const counting = game.status === "playing" && rope?.phase === "break" && !!rope.breakUntil && !game.paused;
  const countNum = counting ? (clock.breakLeft > ROUND_BANNER_MS ? Math.ceil((clock.breakLeft - ROUND_BANNER_MS) / 1000) : 0) : null;
  const beep = useRef("");
  useEffect(() => {
    const k = heaveSoon !== null ? `h${heaveSoon}` : final !== null ? `e${final}` : countNum !== null ? `c${countNum}` : "";
    if (!k || beep.current === k) return;
    beep.current = k;
    if (countNum === 0) sfx.go();
    else if (heaveSoon !== null || countNum !== null) sfx.count();
    else sfx.tick();
  }, [heaveSoon, final, countNum]);

  const list = Object.entries(states);
  const order = mvpOrder(list);
  const ended = game.status === "ended";
  const count = { red: list.filter(([, s]) => s.side === "red").length, blue: list.filter(([, s]) => s.side === "blue").length };
  const inBreak = game.status === "playing" && rope?.phase === "break";
  return (
    <main className={`game rope-game ${ended ? "ended" : ""}`}>
      <section className="board-side">
        <div className="fish-stage rope-stage">
          <canvas ref={canvasRef} className="fish-canvas" aria-label="Pull the Rope: two teams pulling across a river" />
          {game.status === "playing" && rope && (
            <div className="fish-hud rope-hud">
              <span className={`fh-clock ${playing && clock.left < 30_000 ? "warn" : ""}`}>⏱ {rope.phase === "play" ? mmss(clock.left) : "0:00"}</span>
              <span className="fh-frenzy">
                Round {rope.round} <small>/ Pusingan {rope.round}</small>
              </span>
              {h.on && playing ? (
                <span className="fh-frenzy on heave">💥 HEAVE ×2 · {Math.ceil(h.endsIn / 1000)}s</span>
              ) : h.nextIn !== null && playing ? (
                <span className="fh-frenzy">
                  HEAVE! in {mmss(h.nextIn)} <small>/ Tarik ×2</small>
                </span>
              ) : null}
            </div>
          )}
          {heaveSoon !== null && (
            <div className="fish-bigmsg soon heave" key={`soon-${heaveSoon}`}>
              💥 HEAVE IN
              <b>{heaveSoon}</b>
              <small>Tarik kuat dalam {heaveSoon} saat · ×2</small>
            </div>
          )}
          {final !== null && (
            <div className="fish-bigmsg final" key={`final-${final}`}>
              Round almost over!
              <b>{final}</b>
              <small>Pusingan hampir tamat!</small>
            </div>
          )}
          {inBreak && rope && !rope.breakUntil && <RoundBanner rope={rope} players={players} states={states} onStartRound={onStartRound} />}
          {inBreak && rope && countNum !== null && (
            <div className={`rope-count ${countNum === 0 ? "go" : ""}`} key={countNum}>
              {countNum > 0 ? (
                <>
                  <small>
                    Round {rope.round + 1} in · Pusingan {rope.round + 1} dalam
                  </small>
                  <b>{countNum}</b>
                </>
              ) : (
                <>
                  <b>ROUND {rope.round + 1}!</b>
                  <small>PUSINGAN {rope.round + 1}! · PULL! TARIK!</small>
                </>
              )}
            </div>
          )}
          {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
          {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
          {ended && rope && <RopePodium rope={rope} states={states} players={players} onAgain={onAgain} />}
        </div>
      </section>
      <aside className="side">
        {rope && (
          <div className="panel rope-score">
            <h3>
              Best of 3 <span className="muted">· Terbaik 3 pusingan</span>
            </h3>
            <div className="rs-row">
              {SIDES.map((side) => (
                <div key={side} className={`rs-team ${side}`}>
                  <b>{SIDE_NAME[side].en.toUpperCase()}</b>
                  <small>{SIDE_NAME[side].ms}</small>
                  <span className="rs-wins">{rope.wins[side]}</span>
                  <span className="rs-meta">
                    {count[side]} {count[side] === 1 ? "player" : "players"} · ✔ {rope.right[side]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="panel">
          <h3>
            Most right answers <span className="muted">· MVP</span>
          </h3>
          <ul className={`ranking fish-ranking rope-ranking ${order.length > 10 ? "many" : ""}`}>
            {order.slice(0, LIST_MAX).map(([uid, st], i) => {
              const p = players[uid];
              return (
                <li key={uid} style={{ ["--c" as string]: SIDE_NAME[st.side].color }}>
                  <span className="r-pos">{i + 1}</span>
                  <span className="r-name">{p?.name}</span>
                  <span className="r-streak">{st.streak >= 2 ? `🔥${st.streak}` : ""}</span>
                  <span className="r-box">✔ {st.correct}</span>
                </li>
              );
            })}
          </ul>
          {order.length > LIST_MAX && <p className="more-players small">+ {order.length - LIST_MAX} more / lagi</p>}
        </div>
        <div className="panel feed-panel">
          <h3>Live · {n} players</h3>
          <ul className="feed">
            {shownFeed.map((f) => (
              <li key={`${f.at}-${f.uid}-${f.text}`} className={`tone-${f.tone}`}>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}

// Live feed (owner, Nov 2026): in a big game the POWER PULL lines filled the list. The projector keeps
// every other line it has seen (the database keeps only the last 12, so power pulls used to push out
// HEAVE! and round lines) and shows only the newest POWER PULL. Phones still get every power line.

function useRopeFeed(feed: FeedItem[]): FeedItem[] {
  const seen = useRef(new Map<string, FeedItem>());
  return useMemo(() => {
    for (const f of feed) seen.current.set(`${f.at}-${f.uid}-${f.text}`, f);
    // Forget old power lines so the memory stays small.
    const all = [...seen.current.entries()];
    const power = all.filter(([, f]) => f.k === "power").sort((a, b) => a[1].at - b[1].at);
    for (const [k] of power.slice(0, -1)) seen.current.delete(k);
    return ropeFeedLines([...seen.current.values()]);
  }, [feed]);
}

function heaveBanner(c: CanvasRenderingContext2D, endsIn: number, t: number) {
  const u = 1 - endsIn / HEAVE_MS;
  const k = 1 + Math.sin(t / 100) * 0.04;
  c.save();
  c.globalAlpha = u < 0.05 ? u / 0.05 : 1;
  c.translate(CX, 150);
  c.scale(k, k);
  rr(c, -300, -46, 600, 92, 26);
  c.fillStyle = "#f97316";
  c.fill();
  c.strokeStyle = "#fff";
  c.lineWidth = 6;
  c.stroke();
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `800 46px ${DISP}`;
  c.fillText("💥 HEAVE! ×2 · TARIK!", 0, -10);
  c.font = `700 19px ${BODY}`;
  c.fillText(`every pull counts double · setiap tarikan ×2 · ${Math.ceil(endsIn / 1000)}s`, 0, 26);
  c.restore();
}

function RoundBanner({ rope, players, states, onStartRound }: { rope: RopeGame; players: Record<string, Player>; states: Record<string, RopeState>; onStartRound?: () => void }) {
  const last = rope.last;
  const win = last?.win;
  const everyone = Object.keys(states);
  const ready = everyone.filter((u) => rope.ready?.[u]);
  const waiting = everyone.filter((u) => !rope.ready?.[u]);
  return (
    <div className={`rope-round ${win ?? "draw"}`}>
      {win && win !== "draw" ? (
        <>
          <b>
            {SIDE_NAME[win].en.toUpperCase()} WINS ROUND {rope.round}!
          </b>
          <span>
            {SIDE_NAME[win].ms.toUpperCase()} MENANG PUSINGAN {rope.round}!
          </span>
          <small>{last?.how === "bank" ? `💦 ${SIDE_NAME[other(win)].en} got pulled into the river! / ${SIDE_NAME[other(win)].ms} jatuh ke sungai!` : "⏱ On time: the flag was on their side. / Masa tamat: bendera di pihak mereka."}</small>
        </>
      ) : (
        <>
          <b>ROUND {rope.round}: A DRAW!</b>
          <span>PUSINGAN {rope.round}: SERI!</span>
        </>
      )}
      <div className="rr-score">
        <i className="red">{rope.wins.red}</i> – <i className="blue">{rope.wins.blue}</i>
      </div>
      <div className="rr-ready">
        <b>
          ✋ Ready for round {rope.round + 1}? Press READY on your phone! · Tekan SEDIA di telefon!
        </b>
        <span className="rr-count">
          {ready.length} / {everyone.length} ready · sedia
        </span>
        {waiting.length > 0 && waiting.length <= 12 && <small>Waiting for / Menunggu: {waiting.map((u) => players[u]?.name ?? "Player").join(", ")}</small>}
        {onStartRound && (
          <button className="btn rr-now" onClick={onStartRound}>
            ▶ Start round now
          </button>
        )}
      </div>
      <div className="rr-bar" style={{ width: `${everyone.length ? (ready.length / everyone.length) * 100 : 0}%` }} />
    </div>
  );
}

function RopePodium({ rope, states, players, onAgain }: { rope: RopeGame; states: Record<string, RopeState>; players: Record<string, Player>; onAgain: () => void }) {
  const list = Object.entries(states);
  const mvp = mvpOrder(list);
  const so = shoutOuts(list);
  const champ = rope.champion;
  const who = (uid: string) => players[uid]?.name ?? "Player";
  const teamTop = (side: Side) => mvp.find(([, s]) => s.side === side);
  return (
    <div className="podium-overlay rope-podium">
      <div className="podium">
        {champ && champ !== "draw" ? (
          <h2 className={`rp-champ ${champ}`}>
            🏆 {SIDE_NAME[champ].en.toUpperCase()} WINS! <small>{SIDE_NAME[champ].ms} menang!</small>
          </h2>
        ) : (
          <h2>🤝 It's a draw! <small>Seri!</small></h2>
        )}
        <div className="rr-score big">
          <i className="red">{rope.wins.red}</i> – <i className="blue">{rope.wins.blue}</i>
        </div>
        {mvp[0] && mvp[0][1].correct > 0 && (
          <ol>
            <li className="place p1">
              <span className="pl-rank">MVP</span>
              <span className="pl-name">{players[mvp[0][0]]?.name ?? "Player"}</span>
              <span className="pl-box">✔ {mvp[0][1].correct}</span>
            </li>
          </ol>
        )}
        <div className="fish-shout">
          {SIDES.map((side) => {
            const top = teamTop(side);
            return top && top[1].correct > 0 ? (
              <div key={side}>
                <b style={{ color: SIDE_NAME[side].color }}>⭐ Best on {SIDE_NAME[side].en}</b>
                <span>
                  {who(top[0])} · ✔ {top[1].correct}
                </span>
                <small>Terbaik pasukan {SIDE_NAME[side].ms}</small>
              </div>
            ) : null;
          })}
          {so.fastest && (
            <div>
              <b>⚡ Fastest answer</b>
              <span>
                {who(so.fastest[0])} · {(so.fastest[1].fastest / 1000).toFixed(1)} s
              </span>
              <small>Jawapan paling pantas</small>
            </div>
          )}
          {so.streak && (
            <div>
              <b>🔥 Longest streak</b>
              <span>
                {who(so.streak[0])} · {so.streak[1].bestStreak} in a row
              </span>
              <small>Paling banyak betul berturut-turut</small>
            </div>
          )}
        </div>
        <EndButtons onAgain={onAgain} />
      </div>
    </div>
  );
}
