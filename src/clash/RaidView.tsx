// Boss Raid on the projector, plus the live canvas used by phones.
import EndButtons from "../components/EndButtons.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import CreatureImg from "./CreatureImg.tsx";
import { fixRaid, fixRaidEvents, fixResult, type RaidBoard, type RaidEvent, type RaidResult } from "./bossEngine.ts";
import { DEFEAT, DEFEAT_RESULTS_MS, clock, drawRaidTall, drawRaidWide, stompWarning } from "./raidDraw.ts";
import { useStage3D } from "./ClashView.tsx";

/** The raid drawn on a canvas, kept in step with the database. */
export function RaidCanvas({ r, events, game, players, me, className }: { r: RaidBoard | null; events: RaidEvent[]; game: Game; players: Record<string, Player>; me?: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const cv3 = useRef<HTMLCanvasElement>(null);
  const tall = me !== undefined;
  // 3D underneath (look A, 24 Nov 2026); the 2D canvas then only draws the HUD.
  const { stage, mode } = useStage3D(cv3, tall ? 540 : 960, tall ? 960 : 540, tall ? 200 : 170, "raid");
  const live = useRef({ r, events, game, players, me });
  live.current = { r, events, game, players, me };
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const ctx = cv.current?.getContext("2d");
      const v = live.current;
      if (ctx && v.r) {
        const now = v.game.paused && v.game.pausedAt ? v.game.pausedAt : serverNow();
        const st = stage.current;
        try {
          st?.begin();
          if (v.me !== undefined) drawRaidTall(ctx, v.r, v.events, v.players, v.game, now, v.me, st);
          else drawRaidWide(ctx, v.r, v.events, v.players, v.game, now, st);
          st?.end();
        } catch (err) {
          // anything wrong with 3D: carry on in 2D
          if (st) {
            console.warn("3D arena stopped, using 2D:", err);
            stage.current = null;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stage]);
  return (
    <>
      {mode !== "2d" && <canvas ref={cv3} width={tall ? 810 : 1920} height={tall ? 1440 : 1080} className={`${className ?? ""} c3d`} aria-hidden="true" />}
      <canvas ref={cv} width={tall ? 1080 : 1920} height={tall ? 1920 : 1080} className={`${className ?? ""} ${mode === "2d" ? "" : "hud2d"}`} aria-label="Boss Raid battle" />
    </>
  );
}

export function useRaid() {
  const rRaw = useDbValue<RaidBoard>("clash/raid");
  const evRaw = useDbValue<RaidEvent[]>("clash/rev");
  const r = useMemo(() => fixRaid(rRaw), [rRaw]);
  const events = useMemo(() => fixRaidEvents(evRaw), [evRaw]);
  return { r, events };
}

/**
 * Titan defeated (owner, eighth session): the Titan cracks, explodes (BOOM!) and a 3, 2, 1 counts down on the
 * canvas; the results come after that. Plays the boom, the countdown beeps and the win tune at the right moments.
 * Returns true when the results may show (straight away if the Titan won, or the raid ended long ago).
 */
export function useDefeatShow(game: Game, r: RaidBoard | null, phone = false): boolean {
  const won = game.status === "ended" && r?.winner === "players";
  const [ready, setReady] = useState(() => !won || !game.endedAt || serverNow() - game.endedAt >= DEFEAT_RESULTS_MS);
  useEffect(() => {
    if (game.status !== "ended") return setReady(false);
    if (!won || !game.endedAt) {
      setReady(true);
      sfx.win();
      return;
    }
    const age = serverNow() - game.endedAt;
    if (age >= DEFEAT_RESULTS_MS) return setReady(true);
    setReady(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      if (ms >= age) timers.push(setTimeout(fn, ms - age));
    };
    at(DEFEAT.boom * 1000, () => {
      sfx.boom();
      if (phone)
        try {
          navigator.vibrate?.([500, 100, 700]);
        } catch {}
    });
    for (const k of [0, 1, 2]) at((DEFEAT.count + k) * 1000, () => sfx.count());
    at(DEFEAT_RESULTS_MS, () => {
      setReady(true);
      sfx.win();
    });
    return () => timers.forEach(clearTimeout);
  }, [game.status, game.endedAt, won, phone]);
  return ready;
}

export default function RaidView({ game, players, onAgain }: { game: Game; players: Record<string, Player>; onAgain: () => void }) {
  const { r, events } = useRaid();
  const resRaw = useDbValue<RaidResult>(game.status === "ended" ? "clash/result" : null);
  const res = useMemo(() => fixResult(resRaw), [resRaw]);

  // Sounds: hits, misses, the stomp countdown and the stomp.
  const lastN = useRef<number | null>(null);
  useEffect(() => {
    const top = events.reduce((m, e) => Math.max(m, e.n), 0);
    if (lastN.current === null) {
      lastN.current = top;
      return;
    }
    for (const e of events) {
      if (e.n <= lastN.current) continue;
      if (e.kind === "stomp") sfx.snake();
      else if (e.kind === "rage") setTimeout(() => sfx.snake(), Math.max(0, e.at - serverNow()));
      else if (e.kind === "wrong") sfx.wrong();
      else if (e.kind === "revive") (e.ok ? sfx.ladder : sfx.wrong)();
      else if (e.sup) sfx.ladder();
      else sfx.correct();
    }
    lastN.current = top;
  }, [events]);
  const lastWarn = useRef(-1);
  useEffect(() => {
    const iv = setInterval(() => {
      const w = stompWarning(r, game, serverNow());
      if (w > 0 && w !== lastWarn.current) sfx.tick();
      lastWarn.current = w;
    }, 120);
    return () => clearInterval(iv);
  }, [r, game]);
  const showResults = useDefeatShow(game, r);

  return (
    <main className="clash-stage">
      <div className="clash-frame raid-frame">
        <RaidCanvas r={r} events={events} game={game} players={players} className="clash-canvas" />
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {game.status === "ended" && showResults && res && r && (
          <div className="clash-win raid-win">
            <RaidResults res={res} r={r} players={players} />
            <EndButtons onAgain={onAgain} />
          </div>
        )}
      </div>
    </main>
  );
}

/** The end screen, used on the projector and phones. */
export function RaidResults({ res, r, players, me }: { res: RaidResult; r: RaidBoard; players: Record<string, Player>; me?: string }) {
  const won = res.winner === "players";
  const top = res.rank.slice(0, 3);
  const podium = [top[1], top[0], top[2]];
  const myRank = me ? res.rank.findIndex((x) => x.uid === me) : -1;
  const unit = res.mode === "hs" ? "pts" : "dmg";
  return (
    <div className={`raid-res ${won ? "won" : "lost"} ${me ? "phone" : ""}`}>
      <h2>{won ? "TITAN DEFEATED!" : "THE TITAN WINS!"}</h2>
      <div className="raid-sub">
        {won ? "Gergasi Kecacatan tumpas!" : "Gergasi Kecacatan menang kali ini!"}
        {res.mode === "ta" && won && (
          <>
            {" "}
            · Time / Masa <b>{clock(res.ms)}</b>
          </>
        )}
      </div>
      {res.mode === "ta" && won && res.newBest && <div className="raid-best new">★ New best time today! / Masa terbaik hari ini!</div>}
      {res.mode === "ta" && res.best && !res.newBest && (
        <div className="raid-best">
          Best today / Terbaik hari ini: {clock(res.best.ms)} ({res.best.n} {res.best.n === 1 ? "player" : "players"})
        </div>
      )}
      <div className="raid-podium-label">{res.mode === "hs" ? "Top scorers / Pemenang" : "Top damage / Kerosakan tertinggi"}</div>
      <div className="raid-podium">
        {podium.map((x, i) =>
          x ? (
            <div key={x.uid} className={`rp rp${[2, 1, 3][i]} ${x.uid === me ? "me" : ""}`}>
              <div className="rp-name">{players[x.uid]?.name ?? "Player"}</div>
              <CreatureImg id={r.raiders[x.uid]?.c ?? "dragon"} size={me ? 52 : 84} />
              <div className="rp-block">
                <b>#{[2, 1, 3][i]}</b>
                <span>
                  {x.pts.toLocaleString()} {unit}
                </span>
              </div>
            </div>
          ) : (
            <div key={i} className="rp empty" />
          ),
        )}
      </div>
      {me && myRank >= 0 && (
        <p className="raid-mine">
          You: #{myRank + 1} of {res.rank.length} · {res.rank[myRank].pts.toLocaleString()} {unit} / Anda: tempat ke-{myRank + 1}
        </p>
      )}
    </div>
  );
}
