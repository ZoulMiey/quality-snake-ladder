// Quality Cart, race over (owner, 24 Nov 2026): every phone shows the top 3 on a podium with confetti and the
// drivers raising their arms, then a big 3, 2, 1, then the winners dashboard (podium + full results).
// Timed from game.endedAt, so all phones move together and a phone that opens late goes straight to the dashboard.
import { lazy, Suspense, useEffect, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx } from "../lib/sound.ts";
import type { Player } from "../lib/types.ts";
import type { CartResult } from "./engine.ts";
import type { PodiumKart } from "./Kart3D.tsx";

const Podium3D = lazy(() => import("./Kart3D.tsx").then((m) => ({ default: m.Podium3D })));

export const CELEBRATE_MS = 4500;
export const COUNT_MS = 3000;

const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
const raceTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const MEDAL = ["🥇", "🥈", "🥉"];

function FlatPodium({ top }: { top: PodiumKart[] }) {
  // 2D stand-in for phones without 3D: blocks in 2-1-3 order, cheering drivers, CSS confetti.
  const order = [2, 1, 3].map((r) => top.find((t) => t.rank === r)).filter(Boolean) as PodiumKart[];
  return (
    <div className="kf-flat">
      <div className="kf-confetti" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 10) * 0.25}s`, background: ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"][i % 5] }} />
        ))}
      </div>
      <div className="kf-blocks">
        {order.map((t) => (
          <div key={t.rank} className={`kf-block r${t.rank}`}>
            <div className="kf-cheer">🙌</div>
            <div className="kf-bname" style={{ background: t.colour }}>{t.name}</div>
            <div className="kf-step">{t.rank}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KartFinale({ uid, results, players, endedAt, onExit }: { uid: string; results: CartResult[] | null; players: Record<string, Player>; endedAt: number; onExit: () => void }) {
  const age = serverNow() - endedAt;
  const nameOf = (u: string) => players[u]?.name || "Player";
  const colourOf = (u: string) => tokenById(players[u]?.token).color;
  const ranked = [...(results ?? [])].sort((a, b) => a.rank - b.rank);
  const top: PodiumKart[] = ranked.slice(0, 3).map((r) => ({ rank: r.rank, name: nameOf(r.uid), colour: colourOf(r.uid) }));
  const mine = ranked.find((r) => r.uid === uid);
  const count = age >= CELEBRATE_MS && age < CELEBRATE_MS + COUNT_MS ? 3 - Math.floor((age - CELEBRATE_MS) / 1000) : 0;
  const showDash = age >= CELEBRATE_MS + COUNT_MS;

  // Sounds: a fanfare when the celebration starts (only if we are there for it), a beep on each number.
  const played = useRef({ win: false, n: 0 });
  useEffect(() => {
    if (!played.current.win && age < 1500 && results) {
      played.current.win = true;
      sfx.win();
      if (mine && mine.rank <= 3)
        try {
          navigator.vibrate?.([120, 60, 120, 60, 300]);
        } catch {}
    }
    if (count && count !== played.current.n) {
      played.current.n = count;
      sfx.count();
    }
  });

  if (showDash) {
    const order = [2, 1, 3].map((r) => ranked.find((x) => x.rank === r)).filter(Boolean) as CartResult[];
    return (
      <div className="kf-dash">
        <div className="kf-dash-head bi">
          <div className="en">🏆 Race results</div>
          <div className="ms">Keputusan perlumbaan</div>
        </div>
        <div className="kf-dash-body">
          <div className="kf-dash-left">
            <div className="kf-pod">
              {order.map((r) => (
                <div key={r.uid} className={`kf-pod-col r${r.rank} ${r.uid === uid ? "me" : ""}`}>
                  <div className="kf-medal">{MEDAL[r.rank - 1]}</div>
                  <div className="kf-pod-name">{nameOf(r.uid)}</div>
                  <div className="kf-pod-time">{r.finished && r.time !== null ? raceTime(r.time) : `Lap ${r.lap}`}</div>
                  <div className="kf-pod-step" style={{ background: colourOf(r.uid) }}>{r.rank}</div>
                </div>
              ))}
            </div>
            {mine && (
              <div className={`kf-mine ${mine.rank <= 3 ? "top" : ""}`}>
                <div className="en">
                  You finished {ordinal(mine.rank)} of {ranked.length}
                  {mine.finished && mine.time !== null ? ` · ${raceTime(mine.time)}` : ""}
                </div>
                <div className="ms">
                  Anda tamat di tempat ke-{mine.rank} daripada {ranked.length}
                </div>
              </div>
            )}
          </div>
          <ol className="kf-list" aria-label="All results">
            {ranked.map((r) => (
              <li key={r.uid} className={r.uid === uid ? "me" : ""}>
                <span className="kf-rank">{r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}</span>
                <span className="kf-dot" style={{ background: colourOf(r.uid) }} />
                <span className="kf-name">{nameOf(r.uid)}</span>
                <span className="kf-time">{r.finished && r.time !== null ? raceTime(r.time) : `DNF · Lap ${r.lap}`}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="muted kf-thanks">Thank you for playing! / Terima kasih kerana bermain!</p>
        <button className="big-btn exit-btn" onClick={onExit}>
          Exit / Keluar
        </button>
      </div>
    );
  }

  const flat = <FlatPodium top={top} />;
  return (
    <div className="kf-show" role="status">
      {results ? (
        <Suspense fallback={flat}>
          <Podium3D top={top} fallback={flat} />
        </Suspense>
      ) : (
        flat
      )}
      <div className="kf-title bi">
        <div className="en">🏆 WINNERS!</div>
        <div className="ms">PEMENANG!</div>
      </div>
      {mine && mine.rank <= 3 && !count && <div className="kf-you">🎉 You finished {ordinal(mine.rank)}! / Anda tempat ke-{mine.rank}!</div>}
      {count > 0 && (
        <div className="kf-count">
          <div className="kf-num" key={count}>
            {count}
          </div>
          <div className="kf-cap">RESULTS IN</div>
          <div className="kf-cap ms">Keputusan dalam</div>
        </div>
      )}
    </div>
  );
}
