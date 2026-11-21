// Quality Spin on a phone. The captain plays: answer → flick the phone (or swipe up) to spin → pick a consonant
// → spin again, buy a vowel or solve. Teammates see the same screen without buttons (they help the captain);
// everyone else watches both teams. Stuns show a big red countdown. Vibration on Android.
import { useEffect, useMemo, useRef, useState } from "react";
import { ref, set } from "../lib/store.ts";
import { db, serverNow } from "../lib/firebase.ts";
import { useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import Countdown from "../components/Countdown.tsx";
import type { Game, Player } from "../lib/types.ts";
import { drawWheel } from "./wheel.ts";
import { lastText, mmss, spinClock } from "./SpinView.tsx";
import {
  CONSONANTS,
  QUESTION_MS,
  SIDES,
  SIDE_NAME,
  VOWELS,
  VOWEL_COST,
  canBuyVowel,
  encodeAction,
  fixSpin,
  other,
  rowsOf,
  wheelAngle,
  type Action,
  type Side,
  type SpinTeam,
} from "./rules.ts";

const HAPTIC = {
  hit: [60],
  miss: [400],
  defect: [200, 80, 200, 80, 400],
  kaizen: [50, 40, 50, 40, 50, 40, 150],
  solve: [200, 100, 200, 100, 400],
  tick: [100],
  flick: [40],
};
const buzz = (p: number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};
const LETTERS = ["A", "B", "C", "D"];
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fmt = (n: number) => n.toLocaleString("en");

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

async function send(uid: string, a: Action) {
  await set(ref(db, `answers/${uid}`), encodeAction(a));
}

export default function SpinPhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(200);
  const spin = useMemo(() => fixSpin(game.spin), [game.spin]);
  const clock = spinClock(game);
  const mySide: Side | null = spin ? (SIDES.find((s) => spin[s].members.includes(uid)) ?? null) : null;
  const t = mySide && spin ? spin[mySide] : null;
  const isCaptain = !!t && t.captain === uid;

  // Sounds and vibration for my team's events.
  const seen = useRef<number | null>(null);
  useEffect(() => {
    const l = t?.last;
    if (!l) return;
    if (seen.current === null) {
      seen.current = l.at;
      return;
    }
    if (seen.current === l.at) return;
    seen.current = l.at;
    if (l.k === "hit" || l.k === "vowel") {
      sfx.correct();
      buzz(HAPTIC.hit);
    } else if (l.k === "solve") {
      sfx.win();
      buzz(HAPTIC.solve);
    } else if (l.k === "kaizen") {
      sfx.ladder();
      buzz(HAPTIC.kaizen);
    } else if (l.k === "defect") {
      sfx.snake();
      buzz(HAPTIC.defect);
    } else if (l.k === "miss" || l.k === "vmiss" || l.k === "wrong" || l.k === "wrongsolve") {
      sfx.wrong();
      buzz(HAPTIC.miss);
    }
  }, [t?.last?.at]);

  if (!spin) return <p className="card muted">Getting ready… / Bersedia…</p>;
  if (game.status === "ended") return <SpinEnded uid={uid} me={me} spin={spin} mySide={mySide} players={{}} onExit={onExit} />;
  const counting = game.goAt && serverNow() < game.goAt + 900;
  return (
    <div className={`spin-phone ${mySide ?? "watch"}`}>
      <div className="sp-strip">
        {t ? (
          <>
            <span className={`sp-chip ${t.side}`}>
              {isCaptain ? "👑 " : ""}
              {SIDE_NAME[t.side].en.toUpperCase()}
            </span>
            <span className="sp-pts">{fmt(t.score)} pts</span>
            {t.mult > 1 && <span className="sp-x">×{t.mult}</span>}
          </>
        ) : (
          <span className="sp-chip watch">👀 Watching · Menonton</span>
        )}
        <span className={`sp-clock ${clock.left <= 10_000 && clock.started ? "final" : ""}`}>⏱ {mmss(clock.left)}</span>
      </div>
      {game.paused && <div className="paused-bar">Paused by host / Dihentikan seketika</div>}
      {counting ? (
        <div className="sp-count">
          <Countdown goAt={game.goAt!} frozenAt={game.paused ? game.pausedAt : null} className="slp-cd" you={me.token} />
          {t && (
            <div className={`rp-youteam ${t.side}`}>
              Your team / Pasukan anda: <b>{SIDE_NAME[t.side].en.toUpperCase()}</b>
              {isCaptain ? " · 👑 You are the captain!" : ""}
            </div>
          )}
        </div>
      ) : t ? (
        <TeamScreen uid={uid} t={t} captain={isCaptain} paused={game.paused} pausedAt={game.pausedAt} />
      ) : (
        <WatchScreen spin={spin} />
      )}
    </div>
  );
}

function MiniBoard({ t }: { t: SpinTeam }) {
  return (
    <div className="sp-board">
      <div className="sp-hint">💡 {t.hint.en} · {t.hint.ms}</div>
      {rowsOf(t.board, 13).map((r, i) => (
        <div className="sp-row" key={i}>
          {[...r].map((ch, j) => (ch === " " ? <i key={j} className="blank" /> : <i key={`${j}-${ch}`} className={ch === "_" ? "hid" : "show"}>{ch === "_" ? "" : ch}</i>))}
        </div>
      ))}
    </div>
  );
}

function TeamScreen({ uid, t, captain, paused, pausedAt }: { uid: string; t: SpinTeam; captain: boolean; paused: boolean; pausedAt: number | null }) {
  const now = serverNow();
  const recent = t.last && now - t.last.at < 2_200 ? lastText(t.last) : null;
  const helper = !captain;
  if (t.phase === "stun") {
    const left = Math.max(0, Math.ceil((t.until - (paused && pausedAt ? pausedAt : now)) / 1000));
    const l = t.last;
    return (
      <div className="sp-stun" role="alert">
        <div className="sp-stun-icon">💥</div>
        <b>{l ? lastText(l)?.big : "STUNNED"}</b>
        {l?.k === "wrong" && l.ans && (
          <div className="sp-ans">
            Right answer / Jawapan betul: <b>{l.ans.en}</b>
            <span>{l.ans.ms}</span>
          </div>
        )}
        {(l?.pts ?? 0) < 0 && <div className="sp-lost">{fmt(l!.pts!)} pts</div>}
        <div className="sp-stun-n">{left}</div>
        <span>Stunned · Kaku</span>
      </div>
    );
  }
  if (t.phase === "solved")
    return (
      <div className="sp-solved" role="status">
        <div className="sp-stun-icon">🎉</div>
        <b>SOLVED! · BERJAYA!</b>
        <div className="sp-phrase">{t.board}</div>
        <div className="sp-gain">+{fmt(t.last?.pts ?? 0)}</div>
        <span>Next phrase coming… · Frasa seterusnya…</span>
      </div>
    );
  return (
    <div className="sp-body">
      {recent && t.last?.k !== "right" && (
        <div className={`sp-toast ${recent.cls}`} key={t.last!.at}>
          {recent.big} <small>{recent.small}</small>
        </div>
      )}
      {t.phase === "question" && t.q && <SpinQuestion uid={uid} t={t} captain={captain} paused={paused} pausedAt={pausedAt} />}
      {t.phase === "flick" && (captain ? <FlickPad uid={uid} t={t} /> : <Waiting icon="🎡" en="Right! The captain flicks to spin…" ms="Betul! Kapten melontar telefon untuk memutar…" />)}
      {t.phase === "spinning" && <PhoneWheel t={t} />}
      {(t.phase === "letter" || t.phase === "choice") && <MiniBoard t={t} />}
      {t.phase === "letter" && <Keys uid={uid} t={t} mode="consonant" disabled={helper || paused} />}
      {t.phase === "choice" && <Choice uid={uid} t={t} disabled={helper || paused} />}
      {helper && t.phase !== "flick" && <p className="sp-help">👑 Your captain taps. Help them choose! · Kapten yang tekan. Bantu kapten!</p>}
    </div>
  );
}

function Waiting({ icon, en, ms }: { icon: string; en: string; ms: string }) {
  return (
    <div className="sp-wait">
      <b>{icon}</b>
      <Bi en={en} ms={ms} />
    </div>
  );
}

function SpinQuestion({ uid, t, captain, paused, pausedAt }: { uid: string; t: SpinTeam; captain: boolean; paused: boolean; pausedAt: number | null }) {
  const q = t.q!;
  const [sent, setSent] = useState<{ qid: string; seq: number; choice: number } | null>(null);
  const left = Math.min(QUESTION_MS, Math.max(0, t.until - (paused && pausedAt ? pausedAt : serverNow())));
  const secs = Math.ceil(left / 1000);
  const answered = sent?.qid === q.id && sent.seq === t.seq ? sent.choice : null;
  const lastBeep = useRef(-1);
  useEffect(() => {
    if (!captain || answered !== null || paused || secs > 5 || secs <= 0 || lastBeep.current === secs) return;
    lastBeep.current = secs;
    sfx.tick();
    buzz(HAPTIC.tick);
  }, [secs, answered, paused, captain]);
  async function answer(i: number) {
    if (!captain || answered !== null || paused || left <= 0) return;
    unlockAudio();
    setSent({ qid: q.id, seq: t.seq, choice: i });
    try {
      await send(uid, { k: "answer", qid: q.id, choice: i });
    } catch {
      setSent(null);
    }
  }
  return (
    <div className="qcard sp-q">
      <Bi className="kind" en={captain ? "Answer right to spin the wheel!" : "Your captain answers. Help them!"} ms={captain ? "Jawab betul untuk memutar roda!" : "Kapten menjawab. Bantu kapten!"} />
      <div className={`timer ${secs <= 5 ? "warn" : ""}`} aria-label={`${secs} seconds left`}>
        <div className="timer-fill" style={{ width: `${(left / QUESTION_MS) * 100}%` }} />
        <span className="timer-num">{secs}s</span>
      </div>
      <div className="question">
        <div className="en">{q.q.en}</div>
        <div className="ms">{q.q.ms}</div>
      </div>
      <div className={`answers ${q.type === "tf" ? "tf" : ""}`}>
        {q.opts.map((o, i) => (
          <button key={i} className={`ans ans-${i} ${answered === i ? "picked" : ""} ${answered !== null && answered !== i ? "dim" : ""}`} disabled={!captain || answered !== null || left <= 0 || paused} onClick={() => answer(i)}>
            <span className="letter">{q.type === "tf" ? (i === 0 ? "✔" : "✘") : LETTERS[i]}</span>
            <span className="atext">
              <span className="en">{o.en}</span>
              <span className="ms">{o.ms}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type MotionState = "unknown" | "need-permission" | "on" | "none";
const motionNeedsPermission = () => typeof DeviceMotionEvent !== "undefined" && typeof (DeviceMotionEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";
let motionGranted = false;

/** Flick the phone upwards (or swipe up on the pad) to spin. */
function FlickPad({ uid, t }: { uid: string; t: SpinTeam }) {
  const [sentSeq, setSentSeq] = useState(-1);
  const [motion, setMotion] = useState<MotionState>(() => (typeof DeviceMotionEvent === "undefined" ? "none" : motionNeedsPermission() && !motionGranted ? "need-permission" : "on"));
  const fired = sentSeq === t.seq;
  const fire = useRef<(power: number) => void>(() => {});
  fire.current = (power: number) => {
    if (fired) return;
    setSentSeq(t.seq);
    unlockAudio();
    buzz(HAPTIC.flick);
    sfx.go();
    send(uid, { k: "flick", seq: t.seq, power }).catch(() => setSentSeq(-1));
  };
  // The phone's motion: a quick jerk = a flick.
  useEffect(() => {
    if (motion !== "on") return;
    let armedAt = performance.now() + 400;
    const onMove = (e: DeviceMotionEvent) => {
      const a = e.acceleration ?? null;
      let mag = 0;
      if (a && a.x !== null) mag = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      else {
        const g = e.accelerationIncludingGravity;
        if (!g) return;
        mag = Math.abs(Math.hypot(g.x ?? 0, g.y ?? 0, g.z ?? 0) - 9.81);
      }
      if (performance.now() < armedAt) return;
      if (mag > 14) {
        armedAt = performance.now() + 2000;
        fire.current(Math.min(1, (mag - 12) / 20));
      }
    };
    window.addEventListener("devicemotion", onMove);
    return () => window.removeEventListener("devicemotion", onMove);
  }, [motion]);
  async function enable() {
    unlockAudio();
    try {
      const r = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      motionGranted = r === "granted";
      setMotion(motionGranted ? "on" : "none");
    } catch {
      setMotion("none");
    }
  }
  // Swipe up on the pad.
  const start = useRef<{ y: number; t: number } | null>(null);
  return (
    <div className="sp-flick-wrap">
      {t.last?.k === "kaizen" ? (
        <Bi className="sp-flick-title gold" en={`KAIZEN ×${t.mult}! Flick again!`} ms="Lontar lagi!" />
      ) : (
        <Bi className="sp-flick-title" en="Right! FLICK TO SPIN!" ms="Betul! Lontar telefon untuk memutar!" />
      )}
      <div
        className={`sp-flick ${fired ? "done" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Spin the wheel"
        onPointerDown={(e) => {
          start.current = { y: e.clientY, t: performance.now() };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerUp={(e) => {
          const s = start.current;
          start.current = null;
          if (!s) return;
          const dy = s.y - e.clientY;
          const dt = Math.max(60, performance.now() - s.t);
          if (dy > 40) fire.current(Math.min(1, dy / dt / 2));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fire.current(0.6);
          }
        }}
      >
        {fired ? (
          <div>
            <div className="sp-flick-arrow">🎡</div>
            <b>SPINNING!</b>
            <small>Look at the big screen! · Lihat skrin besar!</small>
          </div>
        ) : (
          <div>
            <div className="sp-flick-arrow">⬆</div>
            <b>FLICK ↑</b>
            <small>
              Flick your phone up, or swipe up here
              <br />
              Lontar telefon ke atas, atau leret ke atas di sini
            </small>
          </div>
        )}
      </div>
      {motion === "need-permission" && !fired && (
        <button className="big-btn sp-motion" onClick={enable}>
          📱 Turn on flick / Hidupkan lontaran
        </button>
      )}
      <p className="sp-help">The wheel spins by itself in 15 s. · Roda berputar sendiri dalam 15 saat.</p>
    </div>
  );
}

function PhoneWheel({ t }: { t: SpinTeam }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const live = useRef(t);
  live.current = t;
  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    let id = 0;
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
      const now = serverNow();
      drawWheel(c, px / 2, px / 2 + px * 0.03, px * 0.44, wheelAngle(live.current.spin, now), now / 1000, 1);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="sp-wheel">
      <canvas ref={cv} aria-label="Your team's wheel" />
      <Bi en="Spinning… look at the big screen!" ms="Sedang berputar… lihat skrin besar!" />
    </div>
  );
}

function Keys({ uid, t, mode, disabled, onDone }: { uid: string; t: SpinTeam; mode: "consonant" | "vowel"; disabled: boolean; onDone?: () => void }) {
  const [sentSeq, setSentSeq] = useState(-1);
  const busy = sentSeq === t.seq;
  async function pick(L: string) {
    if (busy || disabled) return;
    unlockAudio();
    setSentSeq(t.seq);
    try {
      await send(uid, mode === "vowel" ? { k: "vowel", seq: t.seq, L } : { k: "letter", seq: t.seq, L });
      onDone?.();
    } catch {
      setSentSeq(-1);
    }
  }
  const left = Math.max(0, Math.ceil((t.until - serverNow()) / 1000));
  return (
    <div className="sp-keys-wrap">
      {mode === "consonant" && (
        <Bi
          className="sp-keys-title"
          en={`${fmt(t.value)} pts a letter${t.mult > 1 ? ` ×${t.mult}` : ""} · pick a consonant (${left}s)`}
          ms={`${fmt(t.value)} mata setiap huruf · pilih konsonan`}
        />
      )}
      {mode === "vowel" && <Bi className="sp-keys-title" en={`Buy a vowel: ${VOWEL_COST} pts`} ms="Beli huruf vokal" />}
      <div className="sp-keys">
        {[...ABC].map((c) => {
          const v = VOWELS.includes(c);
          const allowed = mode === "vowel" ? v : CONSONANTS.includes(c);
          const used = t.used.includes(c);
          return (
            <button key={c} type="button" className={`${v ? "v" : ""} ${used ? (t.board.includes(c) ? "hit" : "out") : ""}`} disabled={disabled || busy || used || !allowed} onClick={() => pick(c)}>
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Choice({ uid, t, disabled }: { uid: string; t: SpinTeam; disabled: boolean }) {
  const [sub, setSub] = useState<"menu" | "vowel" | "solve">("menu");
  const [text, setText] = useState("");
  const [sentSeq, setSentSeq] = useState(-1);
  useEffect(() => {
    setSub("menu");
    setText("");
  }, [t.seq]);
  const busy = sentSeq === t.seq;
  const left = Math.max(0, Math.ceil((t.until - serverNow()) / 1000));
  async function go(a: Action) {
    if (busy || disabled) return;
    unlockAudio();
    setSentSeq(t.seq);
    try {
      await send(uid, a);
    } catch {
      setSentSeq(-1);
    }
  }
  if (sub === "vowel" && !disabled)
    return (
      <>
        <Keys uid={uid} t={t} mode="vowel" disabled={disabled} />
        <button className="big-btn sp-alt" onClick={() => setSub("menu")}>
          ← Back / Kembali
        </button>
      </>
    );
  if (sub === "solve" && !disabled)
    return (
      <form
        className="sp-solve"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) void go({ k: "solve", seq: t.seq, text: text.trim().toUpperCase() });
        }}
      >
        <Bi className="sp-keys-title" en={`Type the whole phrase${t.mult > 1 ? ` · KAIZEN ×${t.mult}` : ""}`} ms="Taip frasa penuh" />
        <input autoFocus value={text} onChange={(e) => setText(e.target.value.toUpperCase())} placeholder="Type here…" aria-label="The phrase" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
        <p className="sp-help">Right = +{fmt(1000 * t.mult)} · Wrong = −{fmt(1000 * t.mult)} and 5 s stun</p>
        <button className="big-btn" disabled={busy || !text.trim()}>
          ✔ Submit · Hantar
        </button>
        <button type="button" className="big-btn sp-alt" onClick={() => setSub("menu")}>
          ← Back / Kembali
        </button>
      </form>
    );
  const vowelOk = canBuyVowel(t);
  return (
    <div className="sp-choice">
      <Bi className="sp-keys-title" en={`Nice! What next? (${left}s)`} ms="Bagus! Seterusnya?" />
      <button className="big-btn" disabled={disabled || busy} onClick={() => go({ k: "again", seq: t.seq })}>
        🎡 Spin again <small>Answer a question first · Jawab soalan dahulu</small>
      </button>
      <button className="big-btn sp-alt" disabled={disabled || busy || !vowelOk} onClick={() => setSub("vowel")}>
        🔤 Buy a vowel ({VOWEL_COST}) <small>{t.score < VOWEL_COST ? `Needs ${VOWEL_COST} pts · Perlu ${VOWEL_COST} mata` : "Beli huruf vokal"}</small>
      </button>
      <button className="big-btn sp-alt" disabled={disabled || busy} onClick={() => setSub("solve")}>
        💡 Solve the puzzle <small>Selesaikan teka-teki</small>
      </button>
      <p className="sp-help">No choice in time = spin again. · Tiada pilihan = putar lagi.</p>
    </div>
  );
}

function WatchScreen({ spin }: { spin: NonNullable<ReturnType<typeof fixSpin>> }) {
  return (
    <div className="sp-watch">
      <Bi en="You are watching. Look at the big screen!" ms="Anda menonton. Lihat skrin besar!" />
      {SIDES.map((s) => {
        const t = spin[s];
        return (
          <div key={s} className={`sp-watch-team ${s}`}>
            <div className="sp-wt-head">
              <b>{SIDE_NAME[s].en.toUpperCase()}</b>
              <span>{fmt(t.score)} pts · ✔ {t.solved}</span>
            </div>
            <MiniBoard t={t} />
          </div>
        );
      })}
    </div>
  );
}

function SpinEnded({ uid, me, spin, mySide, onExit }: { uid: string; me: Player; spin: NonNullable<ReturnType<typeof fixSpin>>; mySide: Side | null; players: Record<string, Player>; onExit: () => void }) {
  const champ = spin.champion;
  const won = !!mySide && champ === mySide;
  const t = tokenById(me.token);
  return (
    <>
      <div className={`card center fish-ended spin-ended ${won ? "won" : ""}`}>
        <div className="me-piece" style={{ ["--c" as string]: mySide ? SIDE_NAME[mySide].color : t.color }}>
          {t.emoji}
        </div>
        <Bi
          en={champ === "draw" ? "It's a draw!" : won ? "Your team wins! 🎉" : mySide ? `${SIDE_NAME[other(mySide)].en} wins. Good effort!` : `${SIDE_NAME[champ ?? "red"].en} wins!`}
          ms={champ === "draw" ? "Seri!" : won ? "Pasukan anda menang!" : mySide ? `${SIDE_NAME[other(mySide)].ms} menang. Usaha yang baik!` : `${SIDE_NAME[champ ?? "red"].ms} menang!`}
          className="title"
        />
        <div className="sp-end-scores">
          {SIDES.map((s) => (
            <div key={s} className={`sp-card ${s} ${champ === s ? "win" : ""}`}>
              <b>{SIDE_NAME[s].en.toUpperCase()}</b>
              <span>{fmt(spin[s].score)}</span>
              <small>✔ {spin[s].solved} solved</small>
            </div>
          ))}
        </div>
        {mySide && spin[mySide].captain === uid && <p className="muted">👑 Thank you, captain! · Terima kasih, kapten!</p>}
      </div>
      <button className="big-btn exit-btn" onClick={onExit}>
        Exit / Keluar
      </button>
    </>
  );
}
