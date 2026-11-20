// Pull the Rope on a phone: the river view from high behind your team on top (owner's pick P2), the question
// card at the bottom like the other games. Right answer = "PULL!"; wrong = the right answer is shown and you
// wait 3 s. HEAVE! and last-10-seconds countdowns, a round result card in the breaks, vibration on Android.
// Phones only read their own state, the game and the feed (small), so 50 phones stay cheap.
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import Countdown from "../components/Countdown.tsx";
import type { FeedItem, Game, Player } from "../lib/types.ts";
import { fixRope } from "./engine.ts";
import { HEAVE_WARN_MS, POWER_STREAK, QUESTION_MS, READY_QID, ROUND_BANNER_MS, SIDE_NAME, fixRopeState, heaveAt, other, type RopeResult, type RopeState, type Side } from "./rules.ts";
import { drawRopePhone, newPhoneMemory } from "./phone3d.ts";
import { mmss, ropeClock } from "./RopeView.tsx";

const HAPTIC = {
  pull: [40],
  power: [60, 50, 60, 50, 60],
  wrong: [450],
  heave: [80, 80, 80],
  tick: [120],
  win: [200, 100, 200, 100, 400],
  lose: [700],
};
const buzz = (p: number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};
const LETTERS = ["A", "B", "C", "D"];
const WRONG_ALERT_MS = 2_400;
const FINAL_MS = 10_000;

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

type Alert = { kind: "wrong" | "heave"; until: number; r?: RopeResult; answer?: { en: string; ms: string } };

export default function RopePhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(200);
  const raw = useDbValue<RopeState>(`state/${uid}`);
  const st = useMemo(() => fixRopeState(raw), [raw]);
  const players = useDbValue<Record<string, Player>>("players");
  const feedRaw = useDbValue<FeedItem[] | Record<string, FeedItem>>("feed");
  const rope = useMemo(() => fixRope(game.rope), [game.rope]);
  const clock = ropeClock(game, rope);
  const playing = game.status === "playing" && clock.started && rope?.phase === "play";
  const ended = game.status === "ended";
  const mySide: Side | null = rope?.teams[uid] ?? st?.side ?? null;
  const h = heaveAt(clock.elapsed);

  // The 3D river view.
  const cv = useRef<HTMLCanvasElement>(null);
  const live = useRef({ game, rope, players, mySide, power: {} as Record<string, number>, myPullAt: 0 });
  live.current = { ...live.current, game, rope, players, mySide };
  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const mem = newPhoneMemory();
    let id = 0;
    const draw = () => {
      id = requestAnimationFrame(draw);
      const { game, rope, players, mySide, power, myPullAt } = live.current;
      if (!rope || !mySide || !players) return;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      const c = canvas.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const emojiOf: Record<string, string> = {};
      for (const [u, p] of Object.entries(players)) emojiOf[u] = tokenById(p.token).emoji;
      const order = { red: rope.order.red.filter((u) => players[u]), blue: rope.order.blue.filter((u) => players[u]) };
      const over = rope.phase !== "play" && rope.last && rope.last.win !== "draw" ? { win: rope.last.win as Side, at: rope.last.at } : null;
      const clk = ropeClock(game, rope);
      const t = performance.now();
      const fell = drawRopePhone(c, W, H, { me: uid, mySide, order, emoji: emojiOf, x: game.ropeX ?? 0, over, now: serverNow(), power, myPullAt, heave: rope.phase === "play" && clk.started && heaveAt(clk.elapsed).on }, mem, t);
      if (fell && t - mem.splashAt > 400) {
        mem.splashAt = t;
        sfx.splash();
      }
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [!!st && !!players && !ended, uid]);

  // Power pulls by anyone, from the live feed: that doll leans hard for a moment.
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
      if (f.k === "power" && f.uid) live.current.power[f.uid] = performance.now() + 900;
    });
  }, [feedRaw]);

  // My answers.
  const [alert, setAlert] = useState<Alert | null>(null);
  const [toast, setToast] = useState<{ r: RopeResult; until: number; key: number } | null>(null);
  const lastSeq = useRef<number | null>(null);
  useEffect(() => {
    if (!st) return;
    if (lastSeq.current === null || st.seq === lastSeq.current || !st.result) {
      lastSeq.current = st.seq;
      return;
    }
    lastSeq.current = st.seq;
    const r = st.result;
    if (r.correct) {
      live.current.myPullAt = performance.now();
      setToast({ r, until: Date.now() + 1_400, key: st.seq });
      if (r.power) {
        sfx.ladder();
        buzz(HAPTIC.power);
      } else {
        sfx.correct();
        buzz(HAPTIC.pull);
      }
    } else setAlert({ kind: "wrong", until: Date.now() + WRONG_ALERT_MS, r, answer: st.q?.opts[r.correctIdx] });
  }, [st]);

  // HEAVE!: a short full-screen flash, then an orange pill.
  const lastHeave = useRef(-2);
  useEffect(() => {
    if (!playing) {
      lastHeave.current = -2;
      return;
    }
    if (lastHeave.current === -2) {
      lastHeave.current = h.on ? h.index : -1;
      return;
    }
    if (h.on && h.index !== lastHeave.current) {
      lastHeave.current = h.index;
      setAlert((a) => (a && a.until > Date.now() ? a : { kind: "heave", until: Date.now() + 1_500 }));
    }
  });

  // Round results: buzz once per round.
  const lastRound = useRef("");
  useEffect(() => {
    if (!rope?.last || !mySide) return;
    const k = `${rope.round}-${rope.last.at}`;
    if (lastRound.current === k) return;
    const first = lastRound.current === "";
    lastRound.current = k;
    if (first && rope.phase === "play") return;
    if (rope.last.win === mySide) {
      sfx.win();
      buzz(HAPTIC.win);
    } else if (rope.last.win !== "draw") {
      sfx.snap();
      buzz(HAPTIC.lose);
    }
  }, [rope?.round, rope?.last?.at, mySide]);

  // Alerts belong to the round being played: the round result card replaces them.
  const showAlert = alert && alert.until > Date.now() && rope?.phase === "play" ? alert : null;
  const toastNow = toast && toast.until > Date.now() ? toast : null;
  const heaveSoon = playing && !game.paused && !h.on && h.nextIn !== null && h.nextIn <= HEAVE_WARN_MS ? Math.ceil(h.nextIn / 1000) : null;
  const final = playing && !game.paused && clock.left > 0 && clock.left <= FINAL_MS ? Math.ceil(clock.left / 1000) : null;
  const beep = useRef("");
  useEffect(() => {
    const k = heaveSoon !== null ? `h${heaveSoon}` : final !== null ? `e${final}` : "";
    if (!k || beep.current === k) return;
    beep.current = k;
    if (heaveSoon !== null) sfx.count();
    else sfx.tick();
  }, [heaveSoon, final]);
  const qid = st?.phase === "question" ? `${st.q?.id}-${st.seq}` : "";
  const [peek, setPeek] = useState(false);
  useEffect(() => setPeek(false), [qid]);
  const cardShown = !!st && st.phase === "question" && !!st.q && !showAlert && playing && !game.paused;

  if (!st || !players || !rope) return <p className="card muted">Getting ready… / Bersedia…</p>;
  if (!mySide) return <p className="card muted">You are watching this game. / Anda sedang menonton.</p>;
  if (ended) return <RopeEnded uid={uid} me={me} st={st} game={game} players={players} onExit={onExit} />;

  const col = SIDE_NAME[mySide];
  const x = game.ropeX ?? 0;
  const mine = x * (mySide === "blue" ? 1 : -1);
  return (
    <div className="slp-stage fish-phone rope-phone">
      <div className="status-strip fp-strip rp-strip" style={{ ["--c" as string]: col.color }}>
        <span className={`rp-team ${mySide}`}>
          {col.en.toUpperCase()} · {col.ms.toUpperCase()}
        </span>
        <span className="rp-meter" aria-label={mine > 0.02 ? "Your team is winning" : mine < -0.02 ? "Your team is losing" : "Level"}>
          <span className={`rp-fill ${x < 0 ? "red" : "blue"}`} style={{ left: `${50 + Math.min(0, x) * 50}%`, width: `${Math.abs(x) * 50}%` }} />
          <span className="rp-mid" />
          <span className="rp-flag" style={{ left: `${50 + x * 50}%` }}>
            🚩
          </span>
        </span>
        <span className={`fp-clock ${final ? "final" : ""}`}>⏱ {rope.phase === "play" ? mmss(clock.left) : "0:00"}</span>
      </div>
      <div className="slp-view">
        <canvas ref={cv} className="fp-canvas" aria-label="The rope and the river, seen from behind your team" />
        <div className="fp-streak rp-streak" aria-label={`${st.streak % POWER_STREAK} of ${POWER_STREAK} for a power pull`}>
          {Array.from({ length: POWER_STREAK }, (_, i) => (
            <i key={i} className={`${i < st.streak % POWER_STREAK ? "on" : ""} ${i === POWER_STREAK - 1 ? "big" : ""}`} />
          ))}
          <small>POWER</small>
        </div>
        <div className="fp-msgs" aria-live="polite">
          {toastNow && (
            <div className={`fp-toast rp-toast ${toastNow.r.power ? "power" : ""}`} key={toastNow.key}>
              💪 {toastNow.r.power ? "POWER PULL!" : "PULL!"} <b>TARIK!</b>
              {toastNow.r.fast && <small className="fast">⚡ FAST</small>}
              {toastNow.r.power && <small>×2</small>}
              {toastNow.r.heave && <small className="hv">HEAVE ×2</small>}
            </div>
          )}
          {heaveSoon !== null && (
            <div className="fp-soon rp-soon" key={`soon-${heaveSoon}`}>
              💥 HEAVE IN <b>{heaveSoon}</b>
              <small>Tarik kuat dalam {heaveSoon}</small>
            </div>
          )}
          {h.on && playing && (
            <div className="fp-frpill rp-heave">
              💥 HEAVE ×2 · {Math.ceil(h.endsIn / 1000)}s <small>Setiap tarikan ×2</small>
            </div>
          )}
          {final !== null && (
            <div className="fp-final" key={`final-${final}`}>
              {final}
              <small>Round almost over! / Pusingan hampir tamat!</small>
            </div>
          )}
        </div>
        {game.paused && game.status === "playing" && <div className="paused-bar slp-paused">Paused by host / Dihentikan seketika</div>}
        {st.phase === "result" && st.result && !st.result.correct && !showAlert && playing && (
          <div className="slp-banner fp-wait">
            <Bi en={`Missed · next question in ${Math.max(1, Math.ceil((st.until - serverNow()) / 1000))} s`} ms="Terlepas · soalan seterusnya sebentar lagi" />
          </div>
        )}
        {cardShown && (
          <div className={`slp-sheet ${peek ? "peek" : ""}`} key={qid}>
            <button type="button" className="slp-mapbtn" onClick={() => setPeek((p) => !p)}>
              {peek ? "⬆ Question / Soalan" : "🌊 River / Sungai"}
            </button>
            <RopeQuestion uid={uid} st={st} paused={game.paused} pausedAt={game.pausedAt} />
          </div>
        )}
        {rope.phase === "break" && game.status === "playing" && !rope.breakUntil && <BreakCard uid={uid} rope={rope} mySide={mySide} players={players} />}
      </div>
      {game.goAt && serverNow() < game.goAt + 900 && (
        <div className="slp-overlay">
          <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="slp-cd" you={me.token} />
          <div className={`rp-youteam ${mySide}`}>
            Your team / Pasukan anda: <b>{col.en.toUpperCase()} · {col.ms.toUpperCase()}</b>
          </div>
        </div>
      )}
      {showAlert && (
        <div className="slp-overlay">
          <RopeAlert a={showAlert} />
        </div>
      )}
      {rope.phase === "break" && game.status === "playing" && rope.breakUntil && !game.paused && <NextRoundCount round={rope.round + 1} left={clock.breakLeft} />}
    </div>
  );
}

function RopeAlert({ a }: { a: Alert }) {
  useEffect(() => {
    if (a.kind === "wrong") {
      sfx.wrong();
      buzz(HAPTIC.wrong);
    } else {
      sfx.frenzy();
      buzz(HAPTIC.heave);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (a.kind === "heave")
    return (
      <div className="slp-alert a-good rp-heave-alert" role="alert">
        <div className="a-icon">💥💪</div>
        <div className="a-t1">HEAVE!</div>
        <div className="a-t2">TARIK KUAT!</div>
        <p className="a-sub">
          Every pull counts double for 30 s!
          <br />
          Setiap tarikan ×2 selama 30 saat!
        </p>
      </div>
    );
  return (
    <div className="slp-alert a-bad" role="alert">
      <div className="a-icon">✘</div>
      <div className="a-t1">{a.r?.timeout ? "TIME'S UP!" : "WRONG!"}</div>
      <div className="a-t2">{a.r?.timeout ? "MASA TAMAT!" : "SALAH!"}</div>
      {a.answer && (
        <div className="a-ra">
          <small>Right answer / Jawapan betul</small>
          <b>{a.answer.en}</b>
          <span>{a.answer.ms}</span>
        </div>
      )}
      <p className="a-sub">
        No pull this time. Wait 3 seconds.
        <br />
        Tiada tarikan. Tunggu 3 saat.
      </p>
    </div>
  );
}

/** 5, 4, 3, 2, 1, then "ROUND 2!" (owner's tweak), full screen on every phone. */
function NextRoundCount({ round, left }: { round: number; left: number }) {
  const n = left > ROUND_BANNER_MS ? Math.ceil((left - ROUND_BANNER_MS) / 1000) : 0;
  const last = useRef(-1);
  useEffect(() => {
    if (last.current === n) return;
    last.current = n;
    if (n === 0) {
      sfx.go();
      buzz(HAPTIC.heave);
    } else sfx.count();
  }, [n]);
  return (
    <div className="slp-overlay">
      <div className={`countdown slp-cd rp-count ${n === 0 ? "go" : ""}`} role="status" aria-live="assertive">
        {n > 0 ? (
          <>
            <div className="cd-ready">
              <span className="en">Round {round} in</span>
              <span className="ms">Pusingan {round} dalam</span>
            </div>
            <div key={n} className="cd-num">
              {n}
            </div>
          </>
        ) : (
          <>
            <div key="go" className="rp-round">
              ROUND <b>{round}!</b>
            </div>
            <div className="cd-ready">
              <span className="en">PULL!</span>
              <span className="ms">PUSINGAN {round} · TARIK!</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BreakCard({ uid, rope, mySide, players }: { uid: string; rope: NonNullable<ReturnType<typeof fixRope>>; mySide: Side; players: Record<string, Player> }) {
  const win = rope.last?.win;
  const won = win === mySide;
  const everyone = Object.keys(rope.teams).filter((u) => players[u]);
  const readyN = everyone.filter((u) => rope.ready?.[u]).length;
  const [sent, setSent] = useState(false);
  const iAmReady = !!rope.ready?.[uid] || sent;
  async function ready() {
    unlockAudio();
    setSent(true);
    buzz(HAPTIC.pull);
    try {
      await set(ref(db, `answers/${uid}`), { qid: READY_QID, choice: rope.round });
    } catch {
      setSent(false);
    }
  }
  return (
    <div className={`rp-break ${won ? "won" : win === "draw" ? "draw" : "lost"}`}>
      <b>{win === "draw" ? "A DRAW! · SERI!" : won ? "YOUR TEAM WINS THE ROUND! 🎉" : "SPLASH! 💦"}</b>
      <span>{win === "draw" ? `Round ${rope.round} / Pusingan ${rope.round}` : won ? "Pasukan anda menang pusingan ini!" : `${SIDE_NAME[other(mySide)].en} wins round ${rope.round} · ${SIDE_NAME[other(mySide)].ms} menang`}</span>
      <div className="rr-score">
        <i className="red">{rope.wins.red}</i> – <i className="blue">{rope.wins.blue}</i>
      </div>
      {iAmReady ? (
        <div className="rp-ready done">
          ✔ You're ready! Waiting for the others… <small>Anda sudah sedia! Menunggu yang lain… ({readyN}/{everyone.length})</small>
        </div>
      ) : (
        <button type="button" className="big-btn rp-ready" onClick={ready}>
          ✋ READY for round {rope.round + 1} <small>SEDIA untuk pusingan {rope.round + 1}</small>
        </button>
      )}
      <small>
        {readyN} / {everyone.length} ready · sedia
      </small>
    </div>
  );
}

function RopeQuestion({ uid, st, paused, pausedAt }: { uid: string; st: RopeState; paused: boolean; pausedAt: number | null }) {
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
  const fastLeft = QUESTION_MS - left < 3_000;
  return (
    <div className="qcard slp-q fp-q">
      {next % POWER_STREAK === 0 ? <Bi className="kind bonus fp-hint" en="💪 Get this right for a POWER PULL ×2!" ms="Jawab betul untuk TARIKAN KUAT ×2!" /> : null}
      <div className={`timer ${warn ? "warn" : ""} ${fastLeft ? "fast" : ""}`} aria-label={`${secs} seconds left`}>
        <div className="timer-fill" style={{ width: `${(left / QUESTION_MS) * 100}%` }} />
        <span className="timer-num">{fastLeft ? "⚡ " : ""}{secs}s</span>
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

function RopeEnded({ uid, me, st, game, players, onExit }: { uid: string; me: Player; st: RopeState; game: Game; players: Record<string, Player>; onExit: () => void }) {
  const rope = fixRope(game.rope);
  const t = tokenById(me.token);
  const champ = rope?.champion;
  const won = champ === st.side;
  const mvpUid = game.winners?.[0];
  const mvp = mvpUid ? players[mvpUid] : null;
  return (
    <>
      <div className={`card center fish-ended rope-ended ${won ? "won" : ""}`}>
        <div className="me-piece" style={{ ["--c" as string]: SIDE_NAME[st.side].color }}>
          {t.emoji}
        </div>
        <Bi
          en={champ === "draw" ? "It's a draw!" : won ? "Your team wins! 🎉" : `${SIDE_NAME[champ ?? other(st.side)].en} wins. Good effort!`}
          ms={champ === "draw" ? "Seri!" : won ? "Pasukan anda menang!" : `${SIDE_NAME[champ ?? other(st.side)].ms} menang. Usaha yang baik!`}
          className="title"
        />
        {rope && (
          <div className="rr-score big">
            <i className="red">{rope.wins.red}</i> – <i className="blue">{rope.wins.blue}</i>
          </div>
        )}
        <ul className="fe-list">
          <li>✔ {st.correct} right / betul</li>
          <li>⚡ {st.fastest ? `${(st.fastest / 1000).toFixed(1)} s` : "–"} fastest / terpantas</li>
          <li>🔥 {st.bestStreak} in a row / berturut</li>
        </ul>
        {mvp && (
          <p>
            ⭐ MVP: <b>{tokenById(mvp.token).emoji} {mvp.name}</b>
            {mvpUid === uid ? " (you! / anda!)" : ""}
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
