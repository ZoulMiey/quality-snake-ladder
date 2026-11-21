// Quality Spin on the projector (owner's layout, draft 2): split screen, Red left and Blue right. Each side:
// team name, captain, score and KAIZEN power-up on top, the hint and the phrase boxes, the used letters, then
// the team's own wheel underneath. While the captain answers, the question shows over the wheel so the room can
// play along. Pop-ups for DEFECT!, KAIZEN, points, SOLVED!; a red tint and countdown while a team is stunned.
import { useEffect, useMemo, useRef } from "react";
import EndButtons from "../components/EndButtons.tsx";
import Countdown from "../components/Countdown.tsx";
import { serverNow } from "../lib/firebase.ts";
import { useNow } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import { drawWheel } from "./wheel.ts";
import { SIDES, SIDE_NAME, STUN_MS, segAt, fixSpin, rowsOf, wheelAngle, type Last, type Side, type SpinTeam } from "./rules.ts";

const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const POP_MS = 1_900;
const FINAL_MS = 10_000;
export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
export function spinClock(game: Game) {
  const now = game.paused && game.pausedAt ? game.pausedAt : serverNow();
  const started = !game.goAt || now >= game.goAt;
  const total = (game.spin?.mins ?? game.spinMins ?? 5) * 60_000;
  const left = game.status === "ended" ? 0 : started ? Math.max(0, (game.endsAt ?? 0) - now) : total;
  return { now, started, left, total };
}
const fmt = (n: number) => n.toLocaleString("en");

/** What a team's last event says (projector pop-up and phones). */
export function lastText(l: Last): { cls: "good" | "bad" | "gold" | "win"; big: string; small: string } | null {
  switch (l.k) {
    case "hit":
      return { cls: "good", big: `+${fmt(l.pts ?? 0)}`, small: `${l.n} × ${l.L}${(l.mult ?? 1) > 1 ? ` · KAIZEN ×${l.mult}` : ""} · ${l.n} huruf ${l.L}` };
    case "miss":
      return { cls: "bad", big: l.timeout ? "TIME'S UP!" : `NO ${l.L}!`, small: `${(l.pts ?? 0) < 0 ? `${fmt(l.pts ?? 0)} · ` : ""}Stunned 5 s · Kaku 5 saat` };
    case "vowel":
      return { cls: "good", big: `${l.n} × ${l.L}`, small: `Vowel bought −300 · Beli huruf vokal` };
    case "vmiss":
      return { cls: "bad", big: `NO ${l.L}!`, small: "−300 · Stunned 5 s · Kaku 5 saat" };
    case "defect":
      return { cls: "bad", big: "DEFECT!", small: `Stunned 5 s${(l.mult ?? 1) > 1 ? " · KAIZEN lost" : ""} · Kaku 5 saat` };
    case "kaizen":
      return { cls: "gold", big: `KAIZEN ×${l.mult}`, small: "Next result counts double! · Flick again!" };
    case "solve":
      return { cls: "win", big: "SOLVED!", small: `+${fmt(l.pts ?? 0)} · BERJAYA!` };
    case "wrongsolve":
      return { cls: "bad", big: "WRONG PHRASE!", small: `${fmt(l.pts ?? 0)} · Stunned 5 s · Salah frasa` };
    case "wrong":
      return { cls: "bad", big: l.timeout ? "TIME'S UP!" : "WRONG!", small: l.ans ? `Answer: ${l.ans.en}` : "Stunned 5 s · Kaku 5 saat" };
    default:
      return null;
  }
}

function useEventSounds(t: SpinTeam | undefined) {
  const seen = useRef<number | null>(null);
  useEffect(() => {
    const l = t?.last;
    if (!l) return;
    if (seen.current === null) {
      seen.current = l.at;
      return;
    }
    if (l.at === seen.current) return;
    seen.current = l.at;
    if (l.k === "hit" || l.k === "vowel") sfx.correct();
    else if (l.k === "solve") sfx.win();
    else if (l.k === "kaizen") sfx.ladder();
    else if (l.k === "defect") sfx.snake();
    else if (l.k === "wrongsolve") sfx.snap();
    else if (l.k === "miss" || l.k === "vmiss" || l.k === "wrong") sfx.wrong();
  }, [t?.last?.at]);
}

function TeamSide({ t, players, paused, started }: { t: SpinTeam; players: Record<string, Player>; paused: boolean; started: boolean }) {
  useEventSounds(t);
  const cv = useRef<HTMLCanvasElement>(null);
  const live = useRef(t);
  live.current = t;
  // The wheel: drawn every frame, eased from the spin's start to its stop.
  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    let id = 0;
    let lastSeg = -1;
    const draw = () => {
      id = requestAnimationFrame(draw);
      const W = canvas.clientWidth;
      if (!W) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const px = Math.round(W * dpr);
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      const c = canvas.getContext("2d")!;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, px, px);
      const tt = live.current;
      const now = serverNow();
      const rot = wheelAngle(tt.spin, now);
      const spinning = tt.phase === "spinning";
      drawWheel(c, px / 2, px / 2 + px * 0.03, px * 0.44, rot, spinning ? now / 1000 : 0, spinning ? 1 : tt.phase === "flick" ? 0.6 : 0);
      if (spinning) {
        const s = segAt(rot);
        if (s !== lastSeg && lastSeg !== -1) sfx.tick();
        lastSeg = s;
      } else lastSeg = -1;
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, []);

  const now = serverNow();
  const col = SIDE_NAME[t.side];
  const pop = t.last && now - t.last.at < POP_MS && !paused ? lastText(t.last) : null;
  const stunLeft = t.phase === "stun" ? Math.max(0, Math.ceil((t.until - now) / 1000)) : 0;
  const cap = players[t.captain]?.name ?? "—";
  const others = t.members.filter((u) => u !== t.captain && players[u]).map((u) => players[u].name);
  const rows = rowsOf(t.board, 13);
  let msg: { en: string; ms: string };
  switch (t.phase) {
    case "question":
      msg = { en: `👑 ${cap} answers the question…`, ms: "Kapten menjawab soalan…" };
      break;
    case "flick":
      msg = { en: `Right! 👑 ${cap}: flick your phone to spin!`, ms: "Betul! Lontar telefon untuk memutar!" };
      break;
    case "spinning":
      msg = { en: "Spinning…", ms: "Sedang berputar…" };
      break;
    case "letter":
      msg = { en: `${fmt(t.value)} pts a letter${t.mult > 1 ? ` ×${t.mult}` : ""} — pick a consonant!`, ms: `${fmt(t.value)} mata setiap huruf — pilih konsonan!` };
      break;
    case "choice":
      msg = { en: "Spin again, buy a vowel or solve?", ms: "Putar lagi, beli huruf vokal atau selesaikan?" };
      break;
    case "stun":
      msg = { en: `💥 STUNNED · ${stunLeft}s`, ms: `Kaku ${stunLeft} saat` };
      break;
    case "solved":
      msg = { en: "🎉 SOLVED! Next phrase coming…", ms: "Berjaya! Frasa seterusnya…" };
      break;
    default:
      msg = { en: "", ms: "" };
  }
  // Not before GO: the question would give the room a head start during the countdown.
  const q = t.phase === "question" && started ? t.q : null;
  return (
    <div className={`sv-side ${t.side} ${t.phase === "stun" ? "stun" : ""}`}>
      <div className="sv-head">
        <div className="sv-team" style={{ color: col.light }}>
          {col.en.toUpperCase()}
          <small>
            {col.ms} · 👑 {cap}
            {others.length ? ` · ${others.join(", ")}` : ""}
          </small>
        </div>
        {t.mult > 1 && <div className="sv-mult">KAIZEN ×{t.mult}</div>}
        <div className="sv-score">
          {fmt(t.score)}
          <small>
            points · mata · ✔ {t.solved} solved
          </small>
        </div>
      </div>
      <div className="sv-hint">
        HINT: {t.hint.en} · {t.hint.ms}
      </div>
      <div className="sv-board" aria-label={`${col.en} phrase`}>
        {rows.map((r, i) => (
          <div className="sv-row" key={i}>
            {[...r].map((ch, j) =>
              ch === " " ? <div key={j} className="sv-tile blank" /> : <div key={`${j}-${ch}`} className={`sv-tile ${ch === "_" ? "hid" : "show"}`}>{ch === "_" ? "" : ch}</div>,
            )}
          </div>
        ))}
      </div>
      <div className="sv-used">
        {[...ABC].map((c) => (
          <span key={c} className={t.used.includes(c) ? (t.board.includes(c) ? "hit" : "out") : ""}>
            {c}
          </span>
        ))}
      </div>
      <div className="sv-wheel">
        <canvas ref={cv} aria-label={`${col.en} wheel`} />
        {q && (
          <div className="sv-q">
            <b>{q.q.en}</b>
            <span>{q.q.ms}</span>
            <ol>
              {q.opts.map((o, i) => (
                <li key={i}>
                  <i>{"ABCD"[i]}</i> {o.en}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      <div className="sv-msg">
        {msg.en}
        <small>{msg.ms}</small>
      </div>
      {t.phase === "stun" && !paused && (
        <div className="sv-stun" aria-live="polite">
          <b>{stunLeft}</b>
          <div className="sv-stun-bar" style={{ width: `${Math.min(100, ((t.until - now) / STUN_MS) * 100)}%` }} />
        </div>
      )}
      {pop && (
        <div className={`sv-pop ${pop.cls}`} key={t.last!.at}>
          {pop.big}
          <small>{pop.small}</small>
        </div>
      )}
    </div>
  );
}

export default function SpinView({ game, players, onAgain }: { game: Game; players: Record<string, Player>; onAgain: () => void }) {
  useNow(150);
  const spin = useMemo(() => fixSpin(game.spin), [game.spin]);
  const clock = spinClock(game);
  const final = game.status === "playing" && clock.started && !game.paused && clock.left > 0 && clock.left <= FINAL_MS ? Math.ceil(clock.left / 1000) : null;
  const beep = useRef(-1);
  useEffect(() => {
    if (final === null || beep.current === final) return;
    beep.current = final;
    sfx.tick();
  }, [final]);
  if (!spin) return <p className="muted gate">Getting ready… / Bersedia…</p>;
  return (
    <main className="spin-wrap">
      <div className="spin-stage">
        {SIDES.map((s) => (
          <TeamSide key={s} t={spin[s]} players={players} paused={game.paused} started={clock.started} />
        ))}
        <div className="sv-mid" />
        <div className={`sv-clock ${final ? "final" : ""}`}>
          ⏱ {mmss(clock.left)}
          <small>{spin.mins} MIN · QUALITY SPIN</small>
        </div>
        {final !== null && (
          <div className="sv-final" key={final}>
            {final}
          </div>
        )}
        {game.paused && game.status === "playing" && <div className="sv-paused">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && serverNow() < game.goAt + 900 && (
          <div className="sv-count">
            <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />
          </div>
        )}
        {game.status === "ended" && <SpinPodium spin={spin} players={players} onAgain={onAgain} />}
      </div>
    </main>
  );
}

function SpinPodium({ spin, players, onAgain }: { spin: NonNullable<ReturnType<typeof fixSpin>>; players: Record<string, Player>; onAgain: () => void }) {
  const champ = spin.champion;
  const names = (t: SpinTeam) => t.members.map((u) => `${u === t.captain ? "👑 " : ""}${players[u]?.name ?? "Player"}`).join(" · ");
  return (
    <div className="podium-overlay spin-podium">
      <div className="podium">
        {champ && champ !== "draw" ? (
          <h2 className={`sp-champ ${champ}`}>
            🏆 {SIDE_NAME[champ].en.toUpperCase()} WINS! <small>{SIDE_NAME[champ].ms} menang!</small>
          </h2>
        ) : (
          <h2>
            🤝 It's a draw! <small>Seri!</small>
          </h2>
        )}
        <div className="sp-final">
          {SIDES.map((s: Side) => {
            const t = spin[s];
            return (
              <div key={s} className={`sp-card ${s} ${champ === s ? "win" : ""}`}>
                <b>{SIDE_NAME[s].en.toUpperCase()}</b>
                <span className="sp-pts">{fmt(t.score)}</span>
                <small>{names(t)}</small>
                <ul>
                  <li>✔ {t.solved} phrases solved · frasa diselesaikan</li>
                  <li>
                    ❓ {t.rights}/{t.answered} right answers · 🎯 {t.hits} right letters
                  </li>
                  <li>
                    🌟 {t.kaizens} KAIZEN · 💥 {t.defects} DEFECT
                  </li>
                  {t.reveal && <li className="sp-reveal">Last phrase: {t.reveal}</li>}
                </ul>
              </div>
            );
          })}
        </div>
        <EndButtons onAgain={onAgain} />
      </div>
    </div>
  );
}
