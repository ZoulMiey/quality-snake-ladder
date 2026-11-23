// Snake & Ladder on a player's phone: the full board is always the main view. The question card pops up
// over the bottom; after an answer the board goes full screen and the player's piece moves. Snakes,
// ladders and wrong answers get big full-screen alerts.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ref, set, isEvent } from "../lib/store.ts";
import { db, serverNow } from "../lib/firebase.ts";
import Countdown from "../components/Countdown.tsx";
import PhoneBoard, { type Camera, type Motion, type OtherPiece } from "../components/PhoneBoard.tsx";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { LADDERS, SNAKES, LAST_BOX } from "../lib/board.ts";
import { BONUS_STREAK } from "../lib/rules.ts";
import { eventById } from "../lib/specials.ts";
import { QUESTION_MS } from "../lib/engine.ts";
import { CLIMB_MS, PENALTY_MS, QUICK_CLIMB_MS, QUICK_DICE_MS, QUICK_VERDICT_MS, SHAKE_MS, SLIDE_MS, VERDICT_MS, WRONG_MS, hopMs, moveTimeline } from "../lib/phoneTiming.ts";
import { DiceRoll } from "../components/Dice.tsx";
import { sfx, unlockAudio } from "../lib/sound.ts";
import { fixStates, type Game, type Player, type PlayerState, type Result } from "../lib/types.ts";

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

/** Vibration patterns (Android; iPhones do not let web pages vibrate, so they get the shake and flash instead). */
const HAPTIC = {
  snake: [400, 120, 400, 120, 400], // three long, heavy buzzes
  ladder: [60, 50, 60, 50, 60], // quick happy taps
  lucky: [70, 60, 70], // two short taps
  bad: [600], // one long buzz
  wrong: [250],
  tick: [120],
};

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
};

/** Date.now() when `key` last changed: the start of the current scene. */
function useSceneStart(key: string) {
  const r = useRef({ key: "", t0: 0 });
  if (r.current.key !== key) r.current = { key, t0: Date.now() };
  return r.current.t0;
}

/** Boxes from `a` to `b`, one by one, either direction (a included). */
function boxesBetween(a: number, b: number) {
  const step = b >= a ? 1 : -1;
  const out: number[] = [];
  for (let n = a; n !== b + step; n += step) out.push(n);
  return out;
}

type Scene = {
  camera: Camera;
  motion: Motion;
  overlay?: React.ReactNode; // full screen
  float?: React.ReactNode; // over the board, not full screen
  sheet?: React.ReactNode; // question card at the bottom
  sheetKey?: string;
  /** No "🗺 Board" button on the sheet (Quick Move: the whole board is already in view). */
  noPeek?: boolean;
  banner?: React.ReactNode;
  dice?: number[] | null;
  shakeUntil?: number;
};

/** Quick Move (event only): what the answered question card says while the piece moves. */
type Done = { icon: string; en: string; ms: string; tone: "good" | "safe" | "bonus" };

export default function SnakePhone({ uid, me, game, state, onExit }: { uid: string; me: Player; game: Game; state: PlayerState | null; onExit: () => void }) {
  const all = useDbValue<Record<string, PlayerState>>("state");
  const players = useDbValue<Record<string, Player>>("players");
  useNow(100);
  // Quick Move at the event (owner, 23 Nov 2026); the app's solo games and rooms keep the full animation.
  const quick = isEvent();
  const t0 = useSceneStart(`${state?.phase}-${state?.seq}`);
  const [peek, setPeek] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState(0);

  const ended = game.status === "ended";
  // A winner keeps the board (their last move and the trophy) even when their win ends the game.
  const winner = state?.phase === "won";
  const scene = state && (!ended || winner) ? buildScene(uid, game, state, t0, ended ? onExit : undefined, me.token, quick) : null;
  const sheetKey = scene?.sheet ? scene.sheetKey ?? "sheet" : "";
  useEffect(() => setPeek(false), [sheetKey]);

  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return setSheetH(0);
    const measure = () => setSheetH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sheetKey]);

  if (!state) return <p className="card muted">Getting ready… / Bersedia…</p>;
  if (ended && !winner)
    return (
      <>
        <StatusStrip me={me} st={state} />
        <Ended st={state} />
        <button className="big-btn exit-btn" onClick={onExit}>
          Exit / Keluar
        </button>
      </>
    );

  const states = fixStates(all);
  const others: OtherPiece[] = Object.entries(states)
    .filter(([id]) => id !== uid && players?.[id])
    .map(([id, st]) => ({ uid: id, token: players![id].token, pos: st.pos ?? 0 }));
  const sc = scene!;
  const cover = sc.sheet && !peek ? sheetH : 0;

  return (
    <div className="slp-stage">
      <StatusStrip me={me} st={state} />
      <div className="slp-view">
        <PhoneBoard
          className="slp-canvas"
          specials={game.specials}
          others={others}
          myToken={me.token}
          motion={sc.motion}
          hopMs={hopMs(quick)}
          camera={sc.camera}
          coverBottom={cover}
          shakeUntil={sc.shakeUntil}
        />
        {game.paused && game.status === "playing" && <div className="paused-bar slp-paused">Paused by host / Dihentikan seketika</div>}
        {sc.banner && <div className="slp-banner">{sc.banner}</div>}
        {sc.dice && sc.dice.length > 0 && <DiceBox values={sc.dice} seed={state.seq} rollMs={quick ? QUICK_DICE_MS : undefined} />}
        {sc.float && <div className="slp-float">{sc.float}</div>}
        {sc.sheet && (
          <div className={`slp-sheet ${peek ? "peek" : ""}`} ref={sheetRef} key={sheetKey}>
            {!sc.noPeek && (
              <button type="button" className="slp-mapbtn" onClick={() => setPeek((p) => !p)}>
                {peek ? "⬆ Question / Soalan" : "🗺 Board / Papan"}
              </button>
            )}
            {sc.sheet}
          </div>
        )}
      </div>
      {sc.overlay && <div className="slp-overlay">{sc.overlay}</div>}
    </div>
  );
}

/** Work out what the phone shows right now, from the player's state and how long the scene has run. */
function buildScene(uid: string, game: Game, st: PlayerState, t0: number, onExit?: () => void, meToken?: string, quick = false): Scene {
  const still = (pos: number): Motion => ({ kind: "still", pos });
  const now = Date.now();
  const e = now - t0;
  const clock = game.paused && game.pausedAt ? game.pausedAt : serverNow();

  if (st.phase === "wait") {
    if (game.goAt && clock < game.goAt + 900)
      return { camera: "full", motion: still(st.pos), overlay: <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="slp-cd"  you={meToken} /> };
    return { camera: "split", motion: still(st.pos), banner: <Bi en="Get ready…" ms="Bersedia…" /> };
  }

  if (st.phase === "question" && st.q) {
    const sl = st.kind === "snake" || st.kind === "ladder";
    const target = st.kind === "snake" ? (SNAKES[st.pos] ?? st.pos) : (LADDERS[st.pos] ?? st.pos);
    // Quick Move: the whole board above the card, no zoom (SNAKE! / LADDER! is the banner on the card).
    const camera: Camera = sl && !quick ? { focus: [st.pos, target] } : "split";
    if (sl && clock < st.deadline - QUESTION_MS)
      return { camera, motion: still(st.pos), overlay: <SnakeLadderAlert key={st.seq} kind={st.kind as "snake" | "ladder"} at={st.pos} /> };
    return { camera, motion: still(st.pos), sheet: <QuestionCard uid={uid} st={st} paused={game.paused} pausedAt={game.pausedAt} alertSound={quick && sl} />, sheetKey: `q-${st.q.id}-${st.seq}` };
  }

  const r = st.result;
  if (!r) return { camera: "split", motion: still(st.pos) };
  const ra = st.q?.opts[r.correctIdx];
  if (quick && st.q && (r.outcome === "move" || r.outcome === "win" || r.outcome === "climb" || r.outcome === "safe")) return quickScene(uid, game, st, r, t0, e, onExit);

  if (r.outcome === "move" || r.outcome === "win") {
    const tl = moveTimeline(r);
    if (st.phase === "won" && e >= tl.walkEnd + 900)
      return { camera: "full", motion: still(LAST_BOX), overlay: <Won rank={st.rank ?? 0} onExit={onExit} /> };
    const land = r.outcome === "win" ? LAST_BOX : (r.land ?? r.to);
    const banner = <CorrectBanner bonus={r.bonus} />;
    if (e < tl.diceAt) return { camera: "full", motion: still(r.from), banner };
    if (e < tl.walkAt) return { camera: "follow", motion: still(r.from), banner, dice: r.dice };
    if (e < tl.walkEnd || !r.special)
      return {
        camera: e < tl.walkEnd ? "follow" : "full",
        motion: { kind: "walk", boxes: boxesBetween(r.from, land), t0: t0 + tl.walkAt },
        banner: e < tl.walkEnd ? banner : undefined,
        dice: e < tl.walkEnd ? r.dice : null,
      };
    // Quality event box: full-screen alert, zoom back in, move forward or back, then zoom out.
    if (e < tl.specialEnd) return { camera: "follow", motion: still(land), overlay: <SpecialAlert key={st.seq} r={r} /> };
    return {
      camera: e < tl.shiftEnd + 150 ? "follow" : "full",
      motion: { kind: "walk", boxes: boxesBetween(land, r.to), t0: t0 + tl.shiftAt },
    };
  }

  const penaltySheet = (from: number) =>
    e >= from ? { sheet: <Penalty until={st.until} frozenAt={game.paused ? game.pausedAt : null} />, sheetKey: `pen-${st.seq}` } : {};

  if (r.outcome === "noroll") {
    if (e < WRONG_MS)
      return { camera: "split", motion: still(r.to), overlay: <Verdict key={st.seq} type={r.timeout ? "timeout" : "wrong"} answer={ra} then={{ en: "No roll this time.", ms: "Tiada balingan kali ini." }} /> };
    return { camera: "split", motion: still(r.to), ...penaltySheet(WRONG_MS) };
  }
  if (r.outcome === "safe")
    return { camera: { focus: [r.from, SNAKES[r.from] ?? r.from] }, motion: still(r.to), overlay: <Verdict key={st.seq} type="safe" then={{ en: `You stay on box ${r.to}.`, ms: `Anda kekal di petak ${r.to}.` }} /> };
  if (r.outcome === "slide") {
    if (e < VERDICT_MS)
      return { camera: "full", motion: still(r.from), overlay: <Verdict key={st.seq} type={r.timeout ? "timeout" : "wrong"} answer={ra} then={{ en: `You slide down to box ${r.to}.`, ms: `Anda turun ke petak ${r.to}.` }} /> };
    const sliding = e < VERDICT_MS + SLIDE_MS + 300;
    return { camera: sliding ? "full" : "split", motion: { kind: "snake", head: r.from, t0: t0 + VERDICT_MS, dur: SLIDE_MS }, float: sliding ? <SoundOnce play="snake" /> : undefined, ...penaltySheet(VERDICT_MS + SLIDE_MS + 300) };
  }
  if (r.outcome === "climb") {
    if (e < VERDICT_MS)
      return { camera: "full", motion: still(r.from), overlay: <Verdict key={st.seq} type="correct" then={{ en: `Climb up to box ${r.to}!`, ms: `Naik ke petak ${r.to}!` }} /> };
    return { camera: e < VERDICT_MS + CLIMB_MS + 150 ? "follow" : "full", motion: { kind: "ladder", from: r.from, to: r.to, t0: t0 + VERDICT_MS, dur: CLIMB_MS }, float: <SoundOnce play="ladder" /> };
  }
  // nolad: wrong answer at the foot of a ladder
  if (e < VERDICT_MS)
    return { camera: "full", motion: still(r.to), overlay: <Verdict key={st.seq} type={r.timeout ? "timeout" : "wrong"} answer={ra} then={{ en: `You stay on box ${r.to}.`, ms: `Anda kekal di petak ${r.to}.` }} /> };
  const shaking = e < VERDICT_MS + SHAKE_MS + 300;
  return { camera: shaking ? "full" : "split", motion: still(r.to), shakeUntil: t0 + VERDICT_MS + SHAKE_MS, ...penaltySheet(VERDICT_MS + SHAKE_MS + 300) };
}

/**
 * Quick Move after a right answer: the card shrinks to one strip at the bottom ("Correct!" and the right
 * answer), so the whole board shows above it; the dice roll in the corner and the piece hops; then the next
 * question slides up.
 */
function quickScene(uid: string, game: Game, st: PlayerState, r: Result, t0: number, e: number, onExit?: () => void): Scene {
  const still = (pos: number): Motion => ({ kind: "still", pos });
  const done: Done =
    r.outcome === "climb"
      ? { icon: "✅", en: `CORRECT! Climb to box ${r.to}`, ms: `BETUL! Naik ke petak ${r.to}`, tone: "good" }
      : r.outcome === "safe"
        ? { icon: "🛡️", en: `SAFE! You stay on box ${r.to}`, ms: `SELAMAT! Anda kekal di petak ${r.to}`, tone: "safe" }
        : r.bonus
          ? { icon: "🔥", en: "Correct! 2-dice bonus", ms: "Betul! Bonus 2 dadu", tone: "bonus" }
          : { icon: "✔", en: "Correct!", ms: "Betul!", tone: "good" };
  // Same key as the question card it replaces (the answer added 1 to seq), so it shrinks instead of sliding.
  const card = { sheet: <DoneCard done={done} answer={st.q!.opts[r.correctIdx]} />, sheetKey: `q-${st.q!.id}-${st.seq - 1}`, noPeek: true };

  if (r.outcome === "safe") return { camera: "split", motion: still(r.to), ...card };
  if (r.outcome === "climb") {
    if (e < QUICK_VERDICT_MS) return { camera: "split", motion: still(r.from), ...card };
    return { camera: "split", motion: { kind: "ladder", from: r.from, to: r.to, t0: t0 + QUICK_VERDICT_MS, dur: QUICK_CLIMB_MS }, float: <SoundOnce play="ladder" />, ...card };
  }
  const tl = moveTimeline(r, true);
  if (st.phase === "won" && e >= tl.walkEnd + 900) return { camera: "full", motion: still(LAST_BOX), overlay: <Won rank={st.rank ?? 0} onExit={onExit} /> };
  const land = r.outcome === "win" ? LAST_BOX : (r.land ?? r.to);
  const dice = e < tl.walkEnd + 300 ? r.dice : null;
  if (e < tl.walkAt) return { camera: "split", motion: still(r.from), dice, ...card };
  if (e < tl.walkEnd || !r.special) return { camera: "split", motion: { kind: "walk", boxes: boxesBetween(r.from, land), t0: t0 + tl.walkAt }, dice, ...card };
  // Quality event box: a short pop-up over the board, then the piece moves forward or back.
  if (e < tl.specialEnd) return { camera: "split", motion: still(land), float: <SpecialAlert key={st.seq} r={r} mini />, ...card };
  return { camera: "split", motion: { kind: "walk", boxes: boxesBetween(land, r.to), t0: t0 + tl.shiftAt }, ...card };
}

function DoneCard({ done, answer }: { done: Done; answer?: { en: string; ms: string } }) {
  useEffect(() => sfx.correct(), []);
  return (
    <div className="slp-donecard">
      <div className={`slp-done tone-${done.tone}`} role="status">
        <span aria-hidden="true">{done.icon}</span>
        <span>
          {done.en}
          <small>{done.ms}</small>
        </span>
      </div>
      {answer && (
        <div className="slp-done-ans">
          <b>✔ {answer.en}</b>
          <span>{answer.ms}</span>
        </div>
      )}
    </div>
  );
}

function CorrectBanner({ bonus }: { bonus: boolean }) {
  useEffect(() => sfx.correct(), []);
  return <span className="slp-ok">{bonus ? "🔥 Correct! 2-dice bonus / Bonus 2 dadu" : "✔ Correct! / Betul!"}</span>;
}

function DiceBox({ values, seed, rollMs }: { values: number[]; seed: number; rollMs?: number }) {
  useEffect(() => {
    const t = setTimeout(() => sfx.dice(), 200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="slp-dice">
      <DiceRoll values={values} seed={seed} size={54} rollMs={rollMs} />
    </div>
  );
}

function SoundOnce({ play }: { play: "snake" | "ladder" }) {
  useEffect(() => {
    sfx[play]();
    buzz(play === "snake" ? HAPTIC.snake : HAPTIC.ladder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function StatusStrip({ me, st }: { me: Player; st: PlayerState | null }) {
  const t = tokenById(me.token);
  const streak = st?.streak ?? 0;
  return (
    <div className="status-strip" style={{ ["--c" as string]: t.color }}>
      <span className="me-mini">{t.emoji}</span>
      <span className="me-name">{me.name}</span>
      <span className="box-pill">Box {st?.pos ?? 0}</span>
      <span className="streak" title="Right answers in a row">
        {Array.from({ length: BONUS_STREAK }, (_, i) => i).map((i) => (
          <i key={i} className={i < streak ? "on" : ""} />
        ))}
      </span>
    </div>
  );
}

/** Full-screen SNAKE! / LADDER! alert when the piece stops on a snake head or the foot of a ladder. */
function SnakeLadderAlert({ kind, at }: { kind: "snake" | "ladder"; at: number }) {
  const snake = kind === "snake";
  useEffect(() => {
    if (snake) sfx.snake();
    else sfx.ladder();
    buzz(snake ? HAPTIC.snake : HAPTIC.ladder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const right = snake ? { en: `Stay on box ${at}`, ms: `Kekal di petak ${at}` } : { en: `Climb to box ${LADDERS[at]}`, ms: `Naik ke petak ${LADDERS[at]}` };
  const wrong = snake ? { en: `Slide down to box ${SNAKES[at]}`, ms: `Turun ke petak ${SNAKES[at]}` } : { en: `Stay on box ${at}`, ms: `Kekal di petak ${at}` };
  return (
    <div className={`slp-alert ${snake ? "a-snake" : "a-ladder"}`} role="alert">
      <div className="a-icon">{snake ? "🐍" : "🪜"}</div>
      <div className="a-t1">{snake ? "SNAKE!" : "LADDER!"}</div>
      <div className="a-t2">{snake ? "ULAR!" : "TANGGA!"}</div>
      <p className="a-sub">{snake ? "Answer right to stay safe. / Jawab betul untuk selamat." : "Answer right to climb. / Jawab betul untuk naik."}</p>
      <div className="a-chips">
        <div className="a-chip">
          ✔ Right: {right.en}
          <small>Betul: {right.ms}</small>
        </div>
        <div className="a-chip">
          ✘ Wrong: {wrong.en}
          <small>Salah: {wrong.ms}</small>
        </div>
      </div>
    </div>
  );
}

const VERDICTS = {
  wrong: { cls: "a-wrong", icon: "❌", t1: "WRONG ANSWER", t2: "JAWAPAN SALAH", sound: "wrong" },
  timeout: { cls: "a-wrong", icon: "⏰", t1: "TIME'S UP!", t2: "MASA TAMAT!", sound: "wrong" },
  safe: { cls: "a-safe", icon: "🛡️", t1: "SAFE!", t2: "SELAMAT!", sound: "correct" },
  correct: { cls: "a-correct", icon: "✅", t1: "CORRECT!", t2: "BETUL!", sound: "correct" },
} as const;

/** Full-screen result after an answer: wrong, time's up, safe from the snake, or correct at a ladder. */
function Verdict({ type, answer, then }: { type: keyof typeof VERDICTS; answer?: { en: string; ms: string }; then: { en: string; ms: string } }) {
  const v = VERDICTS[type];
  useEffect(() => {
    if (v.sound === "wrong") {
      sfx.wrong();
      buzz(HAPTIC.wrong);
    } else sfx.correct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={`slp-alert ${v.cls}`} role="alert">
      <div className="a-icon">{v.icon}</div>
      <div className="a-t1">{v.t1}</div>
      <div className="a-t2">{v.t2}</div>
      {answer && (
        <div className="a-ra">
          <small>Right answer / Jawapan betul</small>
          <b>{answer.en}</b>
          <span>{answer.ms}</span>
        </div>
      )}
      <p className="a-sub">
        {then.en}
        <br />
        {then.ms}
      </p>
    </div>
  );
}

/** Snake or ladder banner on top of the question card (the full-screen alert came first). */
function SnakeLadderBanner({ st }: { st: PlayerState }) {
  const snake = st.kind === "snake";
  return (
    <div className={`slp-qhead ${snake ? "snake" : "ladder"}`}>
      <span aria-hidden="true">{snake ? "🐍" : "🪜"}</span>
      <span>
        {snake ? `SNAKE! Box ${st.pos}` : `LADDER! Box ${st.pos}`}
        <small>
          {snake ? `Right = stay on ${st.pos} · Wrong = slide to ${SNAKES[st.pos]}` : `Right = climb to ${LADDERS[st.pos]} · Wrong = stay on ${st.pos}`}
        </small>
      </span>
    </div>
  );
}

const LETTERS = ["A", "B", "C", "D"];

function QuestionCard({ uid, st, paused, pausedAt, alertSound }: { uid: string; st: PlayerState; paused: boolean; pausedAt: number | null; alertSound?: boolean }) {
  useNow(200);
  // Quick Move has no full-screen SNAKE! / LADDER! alert, so the card plays its sound and buzz.
  useEffect(() => {
    if (!alertSound) return;
    const snake = st.kind === "snake";
    if (snake) sfx.snake();
    else sfx.ladder();
    buzz(snake ? HAPTIC.snake : HAPTIC.ladder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className={`qcard slp-q ${st.kind !== "turn" ? `framed ${st.kind}` : ""}`}>
      {st.kind === "snake" || st.kind === "ladder" ? (
        <SnakeLadderBanner st={st} />
      ) : (
        st.streak === BONUS_STREAK - 1 && <Bi className="kind bonus" en="🔥 Get this right for a 2-dice bonus!" ms="Jawab betul untuk bonus 2 dadu!" />
      )}
      <div className={`timer ${warn ? "warn" : ""}`} aria-label={`${secs} seconds left`}>
        <div className="timer-fill" style={{ width: `${(left / QUESTION_MS) * 100}%` }} />
        <span className="timer-num">{secs}s</span>
      </div>
      {warn && secs > 0 && <div className="hurry">⏰ {secs} seconds left! / {secs} saat lagi!</div>}
      <div className="question">
        <div className="en">{q.q.en}</div>
        <div className="ms">{q.q.ms}</div>
      </div>
      <div className={`answers ${q.type === "tf" ? "tf" : ""}`}>
        {q.opts.map((o, i) => (
          <button
            key={i}
            className={`ans ans-${i} ${answered === i ? "picked" : ""} ${answered !== null && answered !== i ? "dim" : ""}`}
            disabled={answered !== null || left <= 0 || paused}
            onClick={() => answer(i)}
          >
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

/** Full-screen alert when the dice land on a quality event box. */
function SpecialAlert({ r, mini }: { r: Result; mini?: boolean }) {
  const ev = eventById(r.special);
  useEffect(() => {
    if (!ev) return;
    if (ev.move > 0) sfx.ladder();
    else sfx.snake();
    buzz(ev.move > 0 ? HAPTIC.lucky : HAPTIC.bad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!ev) return null;
  const good = ev.move > 0;
  const n = Math.abs(ev.move);
  const then =
    r.next === "snake"
      ? { en: `Then 🐍 a snake at box ${r.to}!`, ms: `Kemudian ular di petak ${r.to}!` }
      : r.next === "ladder"
        ? { en: `Then 🪜 a ladder at box ${r.to}!`, ms: `Kemudian tangga di petak ${r.to}!` }
        : null;
  return (
    <div className={`slp-alert ${good ? "a-good" : "a-bad"} ${mini ? "mini" : ""}`} role="alert">
      <div className="a-tag">{good ? "LUCKY BOX! / KOTAK BERTUAH!" : "OH NO! / ALAMAK!"}</div>
      <div className="a-icon">{ev.icon}</div>
      <div className="a-t3">{ev.en}</div>
      <div className="a-t4">{ev.ms}</div>
      <div className="a-move">
        <b>
          {good ? `Move forward ${n}` : `Move back ${n}`} → box {r.to}
        </b>
        <span>
          {good ? `Maju ${n} petak` : `Undur ${n} petak`} → petak {r.to}
        </span>
      </div>
      {then && (
        <p className="a-sub">
          {then.en}
          <br />
          {then.ms}
        </p>
      )}
    </div>
  );
}

/** The rest of the 5-second wait after a wrong answer. */
function Penalty({ until, frozenAt }: { until: number; frozenAt: number | null }) {
  useNow(100);
  const left = Math.max(0, until - (frozenAt ?? serverNow()));
  const secs = Math.ceil(left / 1000);
  return (
    <div className="penalty slp-pen" role="timer" aria-live="polite">
      <div className="pen-num">{secs}</div>
      <div className="pen-bar">
        <div className="pen-fill" style={{ width: `${(left / PENALTY_MS) * 100}%` }} />
      </div>
      <Bi en={`Next question in ${secs} s`} ms={`Soalan seterusnya dalam ${secs} saat`} />
    </div>
  );
}

function Won({ rank, onExit }: { rank: number; onExit?: () => void }) {
  useEffect(() => sfx.win(), []);
  return (
    <div className="slp-alert a-won" role="alert">
      <div className="a-icon">🏆</div>
      <div className="a-t1">#{rank}</div>
      <Bi en={`You finished #${rank}!`} ms={`Anda tamat di tempat #${rank}!`} className="a-t2" />
      <p className="a-sub">Well done! Watch the big screen. / Syabas! Lihat skrin besar.</p>
      {onExit && (
        <button className="big-btn a-exit" onClick={onExit}>
          Exit / Keluar
        </button>
      )}
    </div>
  );
}

function Ended({ st }: { st: PlayerState }) {
  return (
    <div className="card center">
      <Bi en="Game over! Thank you for playing." ms="Permainan tamat! Terima kasih kerana bermain." className="title" />
      <p>
        You reached box <b>{st.pos}</b>. Right answers: <b>{st.correct}</b> of {st.answered}.
      </p>
      <p className="muted">
        Anda sampai ke petak {st.pos}. Jawapan betul: {st.correct} daripada {st.answered}.
      </p>
    </div>
  );
}
