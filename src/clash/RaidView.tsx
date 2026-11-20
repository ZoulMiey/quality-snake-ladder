// Boss Raid on the projector, plus the live canvas used by phones.
import EndButtons from "../components/EndButtons.tsx";
import { useEffect, useMemo, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import CreatureImg from "./CreatureImg.tsx";
import { fixRaid, fixRaidEvents, fixResult, type RaidBoard, type RaidEvent, type RaidResult } from "./bossEngine.ts";
import { clock, drawRaidTall, drawRaidWide, stompWarning } from "./raidDraw.ts";

/** The raid drawn on a canvas, kept in step with the database. */
export function RaidCanvas({ r, events, game, players, me, className }: { r: RaidBoard | null; events: RaidEvent[]; game: Game; players: Record<string, Player>; me?: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const live = useRef({ r, events, game, players, me });
  live.current = { r, events, game, players, me };
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const ctx = cv.current?.getContext("2d");
      const v = live.current;
      if (ctx && v.r) {
        const now = v.game.paused && v.game.pausedAt ? v.game.pausedAt : serverNow();
        if (v.me !== undefined) drawRaidTall(ctx, v.r, v.events, v.players, v.game, now, v.me);
        else drawRaidWide(ctx, v.r, v.events, v.players, v.game, now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const tall = me !== undefined;
  return <canvas ref={cv} width={tall ? 1080 : 1920} height={tall ? 1920 : 1080} className={className} aria-label="Boss Raid battle" />;
}

export function useRaid() {
  const rRaw = useDbValue<RaidBoard>("clash/raid");
  const evRaw = useDbValue<RaidEvent[]>("clash/rev");
  const r = useMemo(() => fixRaid(rRaw), [rRaw]);
  const events = useMemo(() => fixRaidEvents(evRaw), [evRaw]);
  return { r, events };
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
  useEffect(() => {
    if (game.status === "ended") sfx.win();
  }, [game.status]);

  return (
    <main className="clash-stage">
      <div className="clash-frame raid-frame">
        <RaidCanvas r={r} events={events} game={game} players={players} className="clash-canvas" />
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {game.status === "ended" && res && r && (
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
