// Fishing Derby on a phone: the pond on top (3D, camera behind your boat; flat cartoon if the phone cannot
// do 3D), the question card at the bottom like Snake & Ladder, full-screen alerts for BIG FISH, GOLDEN FISH,
// SNAP and FISHING FRENZY, with vibration (Android) and shake/flash (all phones).
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import Countdown from "../components/Countdown.tsx";
import type { FeedItem, Game, Player } from "../lib/types.ts";
import { BIG_STREAK, GOLD_STREAK, QUESTION_MS, RESULT_MS, boatOrder, fixFishState, frenzyAt, type Catch, type FishState } from "./rules.ts";
import type { PondApi } from "./pondApi.ts";
import { PondSide } from "./pondSide.ts";
import { fishClock, mmss } from "./FishView.tsx";

const HAPTIC = {
  fish: [40],
  big: [60, 50, 60, 50, 60, 50, 60],
  gold: [300, 100, 100, 100, 300, 100, 600],
  snap: [600],
  frenzy: [80, 80, 80],
  tick: [120],
};
const buzz = (p: number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};
const LETTERS = ["A", "B", "C", "D"];
const SNAP_ALERT_MS = 2_400;

type Alert = { kind: "big" | "gold" | "snap" | "frenzy"; until: number; r?: Catch; answer?: { en: string; ms: string } };

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

export default function FishPhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(200);
  const raw = useDbValue<FishState>(`state/${uid}`);
  const st = useMemo(() => fixFishState(raw), [raw]);
  const players = useDbValue<Record<string, Player>>("players");
  const feedRaw = useDbValue<FeedItem[] | Record<string, FeedItem>>("feed");
  const clock = fishClock(game);
  const fr = frenzyAt(clock.elapsed);
  const playing = game.status === "playing" && clock.started;
  const ended = game.status === "ended";

  // The pond, seen from the side (owner's pick). The view never moves.
  const cv = useRef<HTMLCanvasElement>(null);
  const pond = useRef<PondApi | null>(null);
  const [ready, setReady] = useState(0);
  useEffect(() => {
    if (!cv.current) return;
    const api = new PondSide(cv.current);
    pond.current = api;
    setReady((n) => n + 1);
    return () => {
      api.dispose();
      pond.current = null;
    };
  }, [!!st && !!players && !ended]);

  // Boats around the pond (same order as the projector).
  useEffect(() => {
    if (!pond.current || !players) return;
    pond.current.setBoats(
      boatOrder(players).map((u) => {
        const t = tokenById(players[u]?.token);
        return { uid: u, emoji: t.emoji, color: t.color, name: players[u]?.name ?? "" };
      }),
      uid,
    );
  }, [players, ready, uid]);

  // My catches.
  const [alert, setAlert] = useState<Alert | null>(null);
  const lastSeq = useRef<number | null>(null);
  useEffect(() => {
    if (!st) return;
    if (lastSeq.current === null || st.seq === lastSeq.current || !st.result) {
      lastSeq.current = st.seq;
      return;
    }
    lastSeq.current = st.seq;
    const r = st.result;
    const p = pond.current;
    const now = Date.now();
    if (r.kind === "fish") {
      p?.catchAt(uid, "fish", 0, `+${r.kg} kg`);
      sfx.reel();
      buzz(HAPTIC.fish);
    } else if (r.kind === "big" || r.kind === "gold") {
      // The alert and the catch play at the same time (owner, Nov 2026): the alert card sits in the
      // bottom half while the fish is caught in the top half.
      setAlert({ kind: r.kind, until: now + RESULT_MS[r.kind] - 200, r });
      p?.catchAt(uid, r.kind, 0, `+${r.kg} kg`, r.kind === "gold");
    } else {
      setAlert({ kind: "snap", until: now + SNAP_ALERT_MS, r, answer: st.q?.opts[r.correctIdx] });
    }
  }, [st, uid]);
  useEffect(() => {
    pond.current?.setSnapped(!!st && st.phase === "result" && st.result?.kind === "snap" && st.until > serverNow());
  });

  // Other players' catches, from the live feed.
  const seenFeed = useRef<Set<string> | null>(null);
  useEffect(() => {
    const items: FeedItem[] = Array.isArray(feedRaw) ? feedRaw.filter(Boolean) : Object.values(feedRaw ?? {});
    const keys = items.map((f) => `${f.at}-${f.uid}-${f.k}`);
    if (!seenFeed.current) {
      seenFeed.current = new Set(keys);
      return;
    }
    items.forEach((f, i) => {
      if (seenFeed.current!.has(keys[i])) return;
      seenFeed.current!.add(keys[i]);
      if (f.uid && f.uid !== uid && (f.k === "fish" || f.k === "big" || f.k === "gold")) pond.current?.catchAt(f.uid, f.k);
    });
  }, [feedRaw, uid]);

  // Fishing Frenzy: full-screen for 2 s on every phone, then the pond changes colour.
  const lastFrenzy = useRef(-2);
  useEffect(() => {
    pond.current?.setFrenzy(playing && fr.on);
    if (!playing) return;
    if (lastFrenzy.current === -2) {
      lastFrenzy.current = fr.on ? fr.index : -1;
      return;
    }
    if (fr.on && fr.index !== lastFrenzy.current) {
      lastFrenzy.current = fr.index;
      setAlert((a) => (a && a.until > Date.now() ? a : { kind: "frenzy", until: Date.now() + 2_000 }));
    }
  });

  const showAlert = alert && alert.until > Date.now() ? alert : null;
  const [peek, setPeek] = useState(false);
  const qid = st?.phase === "question" ? `${st.q?.id}-${st.seq}` : "";
  useEffect(() => setPeek(false), [qid]);
  const cardShown = !!st && st.phase === "question" && !!st.q && !showAlert && playing && !game.paused;

  if (!st || !players) return <p className="card muted">Getting ready… / Bersedia…</p>;
  if (ended) return <FishEnded me={me} st={st} rank={game.ranks?.[uid] ?? st.rank} total={Object.keys(players).length} onExit={onExit} />;

  const t = tokenById(me.token);
  const rank = game.ranks?.[uid];
  return (
    <div className="slp-stage fish-phone">
      <div className="status-strip fp-strip" style={{ ["--c" as string]: t.color }}>
        <span className="me-mini">{t.emoji}</span>
        <span className="me-name">
          {rank ? <b>#{rank} </b> : null}
          {me.name}
        </span>
        <span className="fp-kg">{st.kg.toFixed(1)} kg</span>
        <span className={`fp-clock ${fr.on && playing ? "fr" : ""}`}>{fr.on && playing ? `🌀 ×2 · ${Math.ceil(fr.endsIn / 1000)}s` : `⏱ ${mmss(clock.left)}`}</span>
      </div>
      <div className="slp-view">
        <canvas ref={cv} className="fp-canvas" aria-label="Your boat on the pond, seen from the side" />
        <StreakDots streak={st.streak} />
        {game.paused && game.status === "playing" && <div className="paused-bar slp-paused">Paused by host / Dihentikan seketika</div>}
        {st.phase === "result" && st.result?.kind === "snap" && !showAlert && (
          <div className="slp-banner fp-wait">
            <Bi en={`Line snapped · new line in ${Math.max(1, Math.ceil((st.until - serverNow()) / 1000))} s`} ms="Tali putus · tunggu sebentar" />
          </div>
        )}
        {cardShown && (
          <div className={`slp-sheet ${peek ? "peek" : ""}`} key={qid}>
            <button type="button" className="slp-mapbtn" onClick={() => setPeek((p) => !p)}>
              {peek ? "⬆ Question / Soalan" : "🗺 Pond / Kolam"}
            </button>
            <FishQuestion uid={uid} st={st} paused={game.paused} pausedAt={game.pausedAt} />
          </div>
        )}
      </div>
      {game.goAt && serverNow() < game.goAt + 900 && (
        <div className="slp-overlay">
          <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="slp-cd" you={me.token} />
        </div>
      )}
      {showAlert && (showAlert.kind === "big" || showAlert.kind === "gold") && <FishAlert a={showAlert} />}
      {showAlert && showAlert.kind !== "big" && showAlert.kind !== "gold" && (
        <div className="slp-overlay">
          <FishAlert a={showAlert} />
        </div>
      )}
    </div>
  );
}

function StreakDots({ streak }: { streak: number }) {
  return (
    <div className="fp-streak" aria-label={`${streak} right in a row`}>
      {Array.from({ length: GOLD_STREAK }, (_, i) => (
        <i key={i} className={`${i < streak ? "on" : ""} ${i === BIG_STREAK - 1 ? "big" : ""} ${i === GOLD_STREAK - 1 ? "gold" : ""}`} />
      ))}
    </div>
  );
}

function FishAlert({ a }: { a: Alert }) {
  useEffect(() => {
    if (a.kind === "big") {
      sfx.bigFish();
      buzz(HAPTIC.big);
    } else if (a.kind === "gold") {
      sfx.golden();
      buzz(HAPTIC.gold);
    } else if (a.kind === "snap") {
      sfx.snap();
      buzz(HAPTIC.snap);
    } else {
      sfx.frenzy();
      buzz(HAPTIC.frenzy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (a.kind === "snap")
    return (
      <div className="slp-alert a-bad fa-snap" role="alert">
        <div className="a-icon">✂️</div>
        <div className="a-t1">SNAP!</div>
        <div className="a-t2">TALI PUTUS!</div>
        {a.answer && (
          <div className="a-ra">
            <small>{a.r?.timeout ? "Time's up · Masa tamat" : "Wrong answer · Jawapan salah"} — Right answer / Jawapan betul</small>
            <b>{a.answer.en}</b>
            <span>{a.answer.ms}</span>
          </div>
        )}
        <p className="a-sub">
          Wait 5 seconds for a new line.
          <br />
          Tunggu 5 saat untuk tali baharu.
        </p>
      </div>
    );
  if (a.kind === "frenzy")
    return (
      <div className="slp-alert a-good fa-frenzy" role="alert">
        <div className="a-icon">🌀🐟</div>
        <div className="a-t1">FISHING FRENZY!</div>
        <div className="a-t2">PESTA MEMANCING!</div>
        <p className="a-sub">
          Every fish weighs double for 30 s!
          <br />
          Berat ikan berganda selama 30 saat!
        </p>
      </div>
    );
  const gold = a.kind === "gold";
  return (
    <div className={`slp-alert a-good fp-bigcard ${gold ? "fa-gold" : "fa-big"}`} role="alert">
      <div className="a-icon">{gold ? "✨🐟✨" : "🐠"}</div>
      <div className="a-t1">{gold ? "SUPER BIG GOLDEN FISH!" : "BIG FISH!"}</div>
      <div className="a-t2">{gold ? "IKAN EMAS SUPER BESAR!" : "IKAN BESAR!"}</div>
      <div className="fa-kg">
        {a.r?.name} · {a.r?.kg} kg{a.r?.frenzy ? " (×2)" : ""}
      </div>
      <p className="a-sub">{gold ? "5 right in a row! · 5 betul berturut-turut!" : "3 right in a row! · 3 betul berturut-turut!"}</p>
    </div>
  );
}

function FishQuestion({ uid, st, paused, pausedAt }: { uid: string; st: FishState; paused: boolean; pausedAt: number | null }) {
  const q = st.q!;
  const [sent, setSent] = useState<{ qid: string; choice: number } | null>(null);
  const lastBeep = useRef(-1);
  const left = Math.min(QUESTION_MS, Math.max(0, st.deadline - (paused && pausedAt ? pausedAt : serverNow())));
  const secs = Math.ceil(left / 1000);
  const answered = sent?.qid === q.id ? sent.choice : null;
  const warn = secs <= 5 && answered === null;
  useEffect(() => {
    if (!warn || paused || secs <= 0 || lastBeep.current === secs) return;
    lastBeep.current = secs;
    sfx.tick();
    buzz(HAPTIC.tick);
  }, [secs, warn, paused]);
  async function answer(i: number) {
    if (answered !== null || paused || left <= 0) return;
    unlockAudio();
    setSent({ qid: q.id, choice: i });
    try {
      await set(ref(db, `answers/${uid}`), { qid: q.id, choice: i });
    } catch {
      setSent(null);
    }
  }
  const next = st.streak + 1;
  return (
    <div className="qcard slp-q fp-q">
      {next === GOLD_STREAK ? (
        <Bi className="kind bonus fp-hint gold" en="✨ Get this right for the GOLDEN FISH!" ms="Jawab betul untuk IKAN EMAS!" />
      ) : next === BIG_STREAK ? (
        <Bi className="kind bonus fp-hint" en="🐠 Get this right for a BIG FISH!" ms="Jawab betul untuk IKAN BESAR!" />
      ) : null}
      <div className={`timer ${warn ? "warn" : ""}`} aria-label={`${secs} seconds left`}>
        <div className="timer-fill" style={{ width: `${(left / QUESTION_MS) * 100}%` }} />
        <span className="timer-num">{secs}s</span>
      </div>
      <div className="question">
        <div className="en">{q.q.en}</div>
        <div className="ms">{q.q.ms}</div>
      </div>
      <div className={`answers ${q.type === "tf" ? "tf" : ""}`}>
        {q.opts.map((o, i) => (
          <button key={i} className={`ans ans-${i} ${answered === i ? "picked" : ""} ${answered !== null && answered !== i ? "dim" : ""}`} disabled={answered !== null || left <= 0 || paused} onClick={() => answer(i)}>
            <span className="letter">{q.type === "tf" ? (i === 0 ? "✔" : "✘") : LETTERS[i]}</span>
            <span className="atext">
              <span className="en">{o.en}</span>
              <span className="ms">{o.ms}</span>
            </span>
          </button>
        ))}
      </div>
      {answered !== null && <p className="muted center">Answer sent… / Jawapan dihantar…</p>}
    </div>
  );
}

function FishEnded({ me, st, rank, total, onExit }: { me: Player; st: FishState; rank: number | null | undefined; total: number; onExit: () => void }) {
  const t = tokenById(me.token);
  return (
    <>
      <div className="card center fish-ended">
        <div className="me-piece" style={{ ["--c" as string]: t.color }}>
          {t.emoji}
        </div>
        <Bi en="Time's up! Thank you for fishing." ms="Masa tamat! Terima kasih kerana memancing." className="title" />
        {rank ? (
          <div className="fe-rank">
            #{rank} <small>of {total} / daripada {total}</small>
          </div>
        ) : null}
        <div className="fe-kg">{st.kg.toFixed(1)} kg</div>
        <ul className="fe-list">
          <li>🐟 {st.fish} fish / ikan</li>
          <li>🐠 {st.big} big / besar</li>
          <li>✨ {st.gold} golden / emas</li>
        </ul>
        {st.best > 0 && (
          <p>
            Biggest fish / Ikan paling besar: <b>{st.bestName}</b> {st.best} kg
          </p>
        )}
        <p className="muted">
          Right answers / Jawapan betul: {st.correct} / {st.answered}
        </p>
      </div>
      <button className="big-btn exit-btn" onClick={onExit}>
        Exit / Keluar
      </button>
    </>
  );
}
