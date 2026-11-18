// Quality Clash on the phone: pick a team and creature(s) in the lobby, then answer questions to attack.
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, remove, serverTimestamp, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import { CREATURES, ELEMENTS, creatureById } from "./creatures.ts";
import CreatureImg from "./CreatureImg.tsx";
import { CLASH_QUESTION_MS, fixBoard, fixEvents, type ClashBoard, type ClashEvent, type ClashQ } from "./engine.ts";
import { ArenaCanvas } from "./ClashView.tsx";
import { SHIELD, SOLO_CREATURES, STUN_MS, SUPER_STREAK, TEAM_SIZE, fightersOf, isAlive, lineUp, type Format, type Side } from "./sim.ts";

type RawPick = { side: Side; c: string[] | Record<string, string>; at?: number };
const cList = (c: RawPick["c"] | undefined) => (Array.isArray(c) ? c : Object.values(c ?? {}));
const SIDE_NAME: Record<Side, { en: string; ms: string }> = { red: { en: "Red", ms: "Merah" }, blue: { en: "Blue", ms: "Biru" } };

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

/** Lobby: choose Red or Blue and your creature (Team) or 3 creatures (1 v 1). */
export function ClashPick({ uid, format }: { uid: string; format: Format }) {
  const picksRaw = useDbValue<Record<string, RawPick>>("clash/pick");
  const players = useDbValue<Record<string, Player>>("players");
  const picks = useMemo(
    () => Object.entries(picksRaw ?? {}).filter(([u]) => players?.[u]).map(([u, p]) => ({ uid: u, side: p.side, c: cList(p.c), at: p.at ?? 0 })),
    [picksRaw, players],
  );
  const mine = picks.find((p) => p.uid === uid);
  const [side, setSide] = useState<Side | null>(mine?.side ?? null);
  const [chosen, setChosen] = useState<string[]>(mine?.c ?? []);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (mine && !side) {
      setSide(mine.side);
      setChosen(mine.c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine?.side]);

  const need = format === "solo" ? SOLO_CREATURES : 1;
  const cap = format === "solo" ? 1 : TEAM_SIZE;
  const { fighters } = lineUp(format, picks);
  const inBattle = Object.values(fighters).some((f) => f.uid === uid);
  const count = (s: Side) => new Set(Object.values(fighters).filter((f) => f.side === s && f.uid !== uid).map((f) => f.uid)).size;
  const teammateHas = new Set(format === "team" ? Object.values(fighters).filter((f) => f.side === side && f.uid !== uid).map((f) => f.c) : []);

  async function save(s: Side | null, cs: string[]) {
    setMsg("");
    try {
      if (!s) await remove(ref(db, `clash/pick/${uid}`));
      else await set(ref(db, `clash/pick/${uid}`), { side: s, c: cs.length ? cs : ["none"], at: mine?.side === s ? mine.at || serverTimestamp() : serverTimestamp() });
    } catch {
      setMsg("Could not save. The game may have started. / Tidak dapat disimpan.");
    }
  }
  function pickSide(s: Side) {
    unlockAudio();
    if (s === side) return;
    if (count(s) >= cap) return setMsg(`${SIDE_NAME[s].en} is full. / ${SIDE_NAME[s].ms} sudah penuh.`);
    const keep = chosen.filter((c) => format === "solo" || !Object.values(fighters).some((f) => f.side === s && f.uid !== uid && f.c === c));
    setSide(s);
    setChosen(keep);
    void save(s, keep);
  }
  function toggle(id: string) {
    unlockAudio();
    if (!side) return setMsg("Choose a team first. / Pilih pasukan dahulu.");
    if (teammateHas.has(id)) return;
    let next: string[];
    if (format === "team") next = [id];
    else if (chosen.includes(id)) next = chosen.filter((c) => c !== id);
    else if (chosen.length >= need) next = [...chosen.slice(1), id];
    else next = [...chosen, id];
    setChosen(next);
    void save(side, next);
  }

  const focus = creatureById(chosen[chosen.length - 1]);
  const ready = side && chosen.filter((c) => c !== "none").length >= need;

  return (
    <div className="clash-pick">
      <Bi en={format === "solo" ? "1 v 1: pick a side and 3 creatures" : "Team battle: pick a team and a creature"} ms={format === "solo" ? "1 lawan 1: pilih pihak dan 3 makhluk" : "Pertempuran pasukan: pilih pasukan dan makhluk"} className="cp-title" />
      <div className="cp-sides">
        {(["red", "blue"] as Side[]).map((s) => {
          const n = count(s) + (side === s && ready ? 1 : 0);
          const full = count(s) >= cap && side !== s;
          return (
            <button key={s} type="button" className={`cp-side ${s} ${side === s ? "on" : ""}`} disabled={full} onClick={() => pickSide(s)} aria-pressed={side === s}>
              <span className="en">{SIDE_NAME[s].en.toUpperCase()}</span>
              <span className="ms">{SIDE_NAME[s].ms}</span>
              <span className="cp-count">{full ? "Full / Penuh" : `${n}/${cap}`}</span>
            </button>
          );
        })}
      </div>
      <div className="cp-grid" role="group" aria-label="Creatures">
        {CREATURES.map((cr) => {
          const taken = teammateHas.has(cr.id);
          const on = chosen.includes(cr.id);
          return (
            <button
              key={cr.id}
              type="button"
              className={`cp-tile ${on ? "on" : ""} ${taken ? "taken" : ""}`}
              style={{ ["--c" as string]: ELEMENTS[cr.type].ui }}
              disabled={taken}
              aria-pressed={on}
              aria-label={`${cr.en}${taken ? " (taken by a teammate)" : ""}`}
              onClick={() => toggle(cr.id)}
            >
              <CreatureImg id={cr.id} size={44} />
              {format === "solo" && on && <span className="cp-num">{chosen.indexOf(cr.id) + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="cp-detail">
        <CreatureImg id={focus.id} size={72} />
        <div>
          <div className="cp-name">{focus.en}</div>
          <div className="ms">{focus.ms}</div>
          <div className="cp-chip" style={{ background: ELEMENTS[focus.type].ui }}>
            {ELEMENTS[focus.type].en} · {ELEMENTS[focus.type].ms}
          </div>
          <div className="cp-move">
            {focus.move.en} / {focus.move.ms}
          </div>
        </div>
      </div>
      {msg && <p className="error">{msg}</p>}
      {ready ? (
        inBattle ? (
          <Bi className="cp-ready" en={`Ready! You are on ${SIDE_NAME[side!].en}. Watch the big screen.`} ms={`Sedia! Anda dalam pasukan ${SIDE_NAME[side!].ms}.`} />
        ) : (
          <Bi className="cp-wait" en="That team is full, or a teammate has that creature. You will watch this battle." ms="Pasukan penuh. Anda akan menonton pertempuran ini." />
        )
      ) : (
        <Bi className="cp-wait" en={format === "solo" ? `Choose ${need - chosen.filter((c) => c !== "none").length} more creature(s).` : "Tap a creature."} ms={format === "solo" ? "Pilih 3 makhluk." : "Tekan satu makhluk."} />
      )}
      {side && (
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setSide(null);
            setChosen([]);
            void save(null, []);
          }}
        >
          Just watch / Tonton sahaja
        </button>
      )}
    </div>
  );
}

const LETTERS = ["A", "B", "C", "D"];

/** During the battle: the full arena from your side, with the question popping up over it. */
export default function ClashPhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(150);
  const bRaw = useDbValue<ClashBoard>("clash/b");
  const b = useMemo(() => fixBoard(bRaw), [bRaw]);
  const evRaw = useDbValue<ClashEvent[]>("clash/ev");
  const events = useMemo(() => fixEvents(evRaw), [evRaw]);
  const players = useDbValue<Record<string, Player>>("players");
  const q = useDbValue<ClashQ>(`clash/q/${uid}`);
  if (!b) return <p className="card muted">Getting ready… / Bersedia…</p>;
  const mine = fightersOf(b, uid);
  const side = mine[0]?.side ?? null;
  const ended = game.status === "ended";
  const now = game.paused && game.pausedAt ? game.pausedAt : serverNow();
  const counting = game.goAt && now < game.goAt + 1000;
  const streak = b.streak[uid] ?? 0;

  let sheet: React.ReactNode = null;
  let center: React.ReactNode = null;
  if (ended) {
    const won = side && b.winner === side;
    const w = b.winner === "red" ? SIDE_NAME.red : SIDE_NAME.blue;
    center = (
      <div className="card center won cph-end">
        <div className="trophy">{won ? "🏆" : side ? "⚔️" : "👀"}</div>
        <Bi className="title" en={side ? (won ? "Your team wins!" : `${w.en} wins. Good fight!`) : `${w.en} wins!`} ms={side ? (won ? "Pasukan anda menang!" : "Lawan menang. Syabas kerana mencuba!") : `${w.ms} menang!`} />
        <p className="muted">Thank you for playing! / Terima kasih kerana bermain!</p>
        <button className="big-btn" onClick={onExit}>
          Exit / Keluar
        </button>
      </div>
    );
  } else if (counting && game.goAt) {
    center = <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="phone-cd" />;
  } else if (!side) {
    sheet = <Bi className="cph-note" en="You are watching this battle. Cheer on the big screen!" ms="Anda menonton pertempuran ini. Sorak untuk pasukan anda!" />;
  } else if (!isAlive(b, uid)) {
    sheet = <Bi className="cph-note" en="💫 Fainted! Watch and cheer for your team." ms="Pengsan! Tonton dan sorak untuk pasukan anda." />;
  } else if (q?.result && now < q.until) {
    sheet = <Result q={q} b={b} now={now} key={`r${q.seq}`} />;
  } else if (q?.q && !q.result) {
    sheet = <Question uid={uid} q={q} paused={game.paused} now={now} key={`q${q.seq}`} streak={streak} />;
  } else sheet = <Bi className="cph-note" en="Next question…" ms="Soalan seterusnya…" />;

  return (
    <div className="cph-stage">
      <ArenaCanvas b={b} events={events} game={game} players={players ?? {}} tall bottom={side ?? "red"} me={uid} className="cph-canvas" />
      <div className="cph-me">
        {me.name}
        {side ? ` · ${SIDE_NAME[side].en.toUpperCase()}` : ""}
      </div>
      {game.paused && game.status === "playing" && <div className="paused-bar cph-paused">Paused by host / Dihentikan seketika</div>}
      {center && <div className="cph-center">{center}</div>}
      {sheet && <div className="cph-sheet">{sheet}</div>}
    </div>
  );
}

function Question({ uid, q, paused, now, streak }: { uid: string; q: ClashQ; paused: boolean; now: number; streak: number }) {
  const qq = q.q!;
  const [sent, setSent] = useState<number | null>(null);
  const lastBeep = useRef(-1);
  const left = Math.max(0, q.deadline - now);
  const secs = Math.ceil(left / 1000);
  const warn = secs <= 5 && sent === null;
  useEffect(() => {
    if (!warn || paused || secs <= 0 || lastBeep.current === secs) return;
    lastBeep.current = secs;
    sfx.tick();
  }, [secs, warn, paused]);
  async function answer(i: number) {
    if (sent !== null || paused || left <= 0) return;
    unlockAudio();
    setSent(i);
    try {
      await set(ref(db, `answers/${uid}`), { qid: qq.id, choice: i });
    } catch {
      setSent(null);
    }
  }
  return (
    <div className="qcard">
      {streak === SUPER_STREAK - 1 && <Bi className="kind bonus" en="🔥 Get this right for a SUPER MOVE!" ms="Jawab betul untuk gerakan super!" />}
      <div className={`timer ${warn ? "warn" : ""}`} aria-label={`${secs} seconds left`}>
        <div className="timer-fill" style={{ width: `${(left / CLASH_QUESTION_MS) * 100}%` }} />
        <span className="timer-num">{secs}s</span>
      </div>
      <div className="question">
        <div className="en">{qq.q.en}</div>
        <div className="ms">{qq.q.ms}</div>
      </div>
      <div className={`answers ${qq.type === "tf" ? "tf" : ""}`}>
        {qq.opts.map((o, i) => (
          <button
            key={i}
            className={`ans ans-${i} ${sent === i ? "picked" : ""} ${sent !== null && sent !== i ? "dim" : ""}`}
            disabled={sent !== null || left <= 0 || paused}
            onClick={() => answer(i)}
          >
            <span className="letter">{qq.type === "tf" ? (i === 0 ? "✔" : "✘") : LETTERS[i]}</span>
            <span className="atext">
              <span className="en">{o.en}</span>
              <span className="ms">{o.ms}</span>
            </span>
          </button>
        ))}
      </div>
      {sent !== null && <p className="muted center">Answer sent… / Jawapan dihantar…</p>}
    </div>
  );
}

function Result({ q, b, now }: { q: ClashQ; b: ClashBoard; now: number }) {
  const r = q.result!;
  useEffect(() => {
    if (r.correct) (r.sup ? sfx.ladder : sfx.correct)();
    else sfx.wrong();
    try {
      navigator.vibrate?.(r.correct ? 60 : [200, 80, 200]);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!r.correct) {
    const left = Math.max(0, q.until - now);
    const right = q.q?.opts[r.correctIdx];
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
  const targets = (r.targets ?? []).map((id) => creatureById(b.fighters[id]?.c).en);
  const total = (r.dmg ?? 0) * (r.hits ?? 1);
  return (
    <div className="rcard good clash-hit">
      <div className="mark">✔</div>
      <Bi en={r.sup ? "SUPER MOVE!" : "Right! Attack!"} ms={r.sup ? "Gerakan super!" : "Betul! Serang!"} className="rhead" />
      <div className="clash-dmg">−{total}</div>
      <div className="muted">→ {targets.join(", ") || "—"}</div>
      <div className="clash-badges">
        {r.fast && <span className="chip ok">FAST +25%</span>}
        {r.sup && <span className="chip hot">SUPER ×2</span>}
        {(r.hits ?? 1) > 1 && <span className="chip">{r.hits} × {r.dmg}</span>}
      </div>
      {(r.fainted ?? []).map((id) => (
        <Bi key={id} en={`${creatureById(b.fighters[id]?.c).en} fainted!`} ms={`${creatureById(b.fighters[id]?.c).ms} pengsan!`} className="clash-ko" />
      ))}
      {r.shield && <Bi en={`Team bonus: +${SHIELD} shield for ${creatureById(b.fighters[r.shield]?.c).en}`} ms={`Bonus pasukan: perisai +${SHIELD}`} className="clash-shield" />}
    </div>
  );
}
