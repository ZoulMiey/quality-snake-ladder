// Boss Raid on the phone: the full arena from your monster's view, with the question popping up over it.
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, serverTimestamp, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import { CREATURES, ELEMENTS, creatureById } from "./creatures.ts";
import CreatureImg from "./CreatureImg.tsx";
import { STUN_MS, SUPER_STREAK } from "./sim.ts";
import { raiderState } from "./boss.ts";
import { fixResult, type RaidResult } from "./bossEngine.ts";
import type { ClashQ } from "./engine.ts";
import { Question } from "./ClashPhone.tsx";
import { RaidCanvas, RaidResults, useRaid } from "./RaidView.tsx";
import { stompWarning } from "./raidDraw.ts";

type RaidQ = ClashQ & { revive?: boolean; result: (NonNullable<ClashQ["result"]> & { revive?: boolean }) | null };

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

export default function RaidPhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(150);
  const { r, events } = useRaid();
  const players = useDbValue<Record<string, Player>>("players");
  const q = useDbValue<RaidQ>(`clash/q/${uid}`);
  const resRaw = useDbValue<RaidResult>(game.status === "ended" ? "clash/result" : null);
  const res = useMemo(() => fixResult(resRaw), [resRaw]);
  const now = game.paused && game.pausedAt ? game.pausedAt : serverNow();

  // Vibrate and tick during the stomp countdown, and buzz on the stomp itself.
  const warn = stompWarning(r, game, now);
  const lastWarn = useRef(-1);
  useEffect(() => {
    if (warn > 0 && warn !== lastWarn.current) {
      sfx.tick();
      try {
        navigator.vibrate?.(warn === 1 ? [120, 60, 120] : 120);
      } catch {}
    }
    lastWarn.current = warn;
  }, [warn]);
  const lastStomp = useRef<number | null>(null);
  useEffect(() => {
    const s = events.filter((e) => e.kind === "stomp").reduce((m, e) => Math.max(m, e.n), 0);
    if (lastStomp.current !== null && s > lastStomp.current) {
      sfx.snake();
      try {
        navigator.vibrate?.([300, 80, 300]);
      } catch {}
    }
    lastStomp.current = s;
  }, [events]);

  if (!r) return <p className="card muted">Getting ready… / Bersedia…</p>;
  const mine = r.raiders[uid];
  const st = mine ? raiderState(mine) : null;
  const counting = game.goAt && now < game.goAt + 1000;

  let sheet: React.ReactNode = null;
  let center: React.ReactNode = null;
  if (game.status === "ended") {
    center = res ? (
      <div className="card center cph-end">
        <RaidResults res={res} r={r} players={players ?? {}} me={uid} />
        <button className="big-btn" onClick={onExit}>
          Exit / Keluar
        </button>
      </div>
    ) : null;
  } else if (counting && game.goAt) {
    center = <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="phone-cd" />;
  } else if (!mine) {
    sheet = <Bi className="cph-note" en="You are watching this raid. Cheer on the big screen!" ms="Anda menonton serangan ini. Sorak di skrin besar!" />;
  } else if (st === "out") {
    sheet = <Bi className="cph-note" en="💫 Out of the raid. Watch and cheer for the others!" ms="Keluar daripada serangan. Tonton dan sorak untuk rakan!" />;
  } else if (q?.result && now < q.until) {
    sheet = <RaidResult q={q} now={now} />;
  } else if (q?.q && !q.result) {
    sheet = (
      <>
        {q.revive && (
          <div className="raid-revive">
            <b>💫 FAINTED · REVIVE QUESTION</b>
            <span>
              One chance! Right = back with {Math.round((mine.max || 0) / 2)} HP. Wrong = out.
              <br />
              Satu peluang! Betul = hidup semula. Salah = keluar.
            </span>
          </div>
        )}
        <Question uid={uid} q={q} paused={game.paused} now={now} key={`q${q.seq}`} streak={q.revive ? 0 : r.streak[uid] ?? 0} />
      </>
    );
  } else sheet = <Bi className="cph-note" en="Next question…" ms="Soalan seterusnya…" />;

  return (
    <div className={`cph-stage raid ${warn > 0 ? "shake" : ""}`}>
      <RaidCanvas r={r} events={events} game={game} players={players ?? {}} me={uid} className="cph-canvas" />
      {game.paused && game.status === "playing" && <div className="paused-bar cph-paused">Paused by host / Dihentikan seketika</div>}
      {center && <div className="cph-center">{center}</div>}
      {sheet && <div className={`cph-sheet ${q?.revive && !q.result ? "revive" : ""}`}>{sheet}</div>}
      <span className="sr-only">{me.name}</span>
    </div>
  );
}

function RaidResult({ q, now }: { q: RaidQ; now: number }) {
  const r = q.result!;
  useEffect(() => {
    if (r.correct) (r.sup || r.revive ? sfx.ladder : sfx.correct)();
    else sfx.wrong();
    try {
      navigator.vibrate?.(r.correct ? 60 : [200, 80, 200]);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const right = q.q?.opts[r.correctIdx];
  if (r.revive)
    return r.correct ? (
      <div className="rcard good">
        <div className="mark">✔</div>
        <Bi en="REVIVED! Back in the fight." ms="Hidup semula! Kembali bertarung." className="rhead" />
      </div>
    ) : (
      <div className="rcard bad">
        <div className="mark">✘</div>
        <Bi en="Not this time. You are out of the raid." ms="Bukan kali ini. Anda keluar daripada serangan." className="rhead" />
        {right && (
          <div className="right-answer">
            <span className="ra-label">Right answer / Jawapan betul</span>
            <span className="en">{right.en}</span>
            <span className="ms">{right.ms}</span>
          </div>
        )}
      </div>
    );
  if (!r.correct) {
    const left = Math.max(0, q.until - now);
    return (
      <div className="rcard bad">
        <div className="mark">{r.timeout ? "⏰" : "✘"}</div>
        <Bi en={r.timeout ? "Time's up!" : "Wrong"} ms={r.timeout ? "Masa tamat!" : "Salah"} className="rhead" />
        {right && (
          <div className="right-answer">
            <span className="ra-label">Right answer / Jawapan betul</span>
            <span className="en">{right.en}</span>
            <span className="ms">{right.ms}</span>
          </div>
        )}
        <div className="penalty" role="timer">
          <div className="pen-num">{Math.ceil(left / 1000)}</div>
          <div className="pen-bar">
            <div className="pen-fill" style={{ width: `${(left / STUN_MS) * 100}%` }} />
          </div>
          <Bi en="Stunned! Streak back to 0." ms="Pening! Rentetan kembali 0." />
        </div>
      </div>
    );
  }
  return (
    <div className="rcard good clash-hit">
      <div className="mark">✔</div>
      <Bi en={r.sup ? "SUPER MOVE!" : "Right! Hit the Titan!"} ms={r.sup ? "Gerakan super!" : "Betul! Serang Titan!"} className="rhead" />
      <div className="clash-dmg">−{r.dmg}</div>
      <div className="clash-badges">
        {r.fast && <span className="chip ok">FAST +25%</span>}
        {r.sup && <span className="chip hot">SUPER ×2</span>}
      </div>
    </div>
  );
}

void SUPER_STREAK;

/** Lobby for Boss Raid: just pick a monster (two players may pick the same one). */
export function RaidPick({ uid }: { uid: string }) {
  const picks = useDbValue<Record<string, { c?: string[] | Record<string, string> }>>("clash/pick");
  const players = useDbValue<Record<string, Player>>("players");
  const mineRaw = picks?.[uid]?.c;
  const mine = (Array.isArray(mineRaw) ? mineRaw : Object.values(mineRaw ?? {}))[0];
  const count = Object.keys(picks ?? {}).filter((u) => players?.[u]).length;
  const [msg, setMsg] = useState("");
  async function pick(id: string) {
    unlockAudio();
    setMsg("");
    try {
      await set(ref(db, `clash/pick/${uid}`), { side: "red", c: [id], at: picks?.[uid] ? (picks[uid] as { at?: number }).at ?? serverTimestamp() : serverTimestamp() });
    } catch {
      setMsg("Could not save. The raid may have started. / Tidak dapat disimpan.");
    }
  }
  const focus = creatureById(mine);
  return (
    <div className="clash-pick">
      <Bi en="Boss Raid: pick your monster" ms="Serangan Bos: pilih raksasa anda" className="cp-title" />
      <p className="muted cp-raid-note">Everyone fights the Defect Titan together. Two players may pick the same monster. / Semua melawan Gergasi Kecacatan bersama.</p>
      <div className="cp-grid" role="group" aria-label="Monsters">
        {CREATURES.map((cr) => (
          <button
            key={cr.id}
            type="button"
            className={`cp-tile ${mine === cr.id ? "on" : ""}`}
            style={{ ["--c" as string]: ELEMENTS[cr.type].ui }}
            aria-pressed={mine === cr.id}
            aria-label={cr.en}
            onClick={() => pick(cr.id)}
          >
            <CreatureImg id={cr.id} size={44} />
          </button>
        ))}
      </div>
      {mine && (
        <div className="cp-detail">
          <CreatureImg id={focus.id} size={72} />
          <div>
            <div className="cp-name">{focus.en}</div>
            <div className="ms">{focus.ms}</div>
            <div className="cp-move">
              {focus.move.en} / {focus.move.ms}
            </div>
          </div>
        </div>
      )}
      {msg && <p className="error">{msg}</p>}
      {mine ? (
        <Bi className="cp-ready" en={`Ready! ${count} ${count === 1 ? "raider" : "raiders"} so far. Watch the big screen.`} ms="Sedia! Lihat skrin besar." />
      ) : (
        <Bi className="cp-wait" en="Tap a monster to join the raid." ms="Tekan raksasa untuk menyertai." />
      )}
    </div>
  );
}
