import { useEffect, useMemo, useRef, useState } from "react";
import { ref, set, remove, serverTimestamp } from "firebase/database";
import { db, ensureSignedIn, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { TOKENS, tokenById } from "../lib/tokens.ts";
import { LADDERS, SNAKES, LAST_BOX, inFinalZone, FINAL_ZONE_NEED } from "../lib/board.ts";
import { QUESTION_MS } from "../lib/engine.ts";
import { DiceRoll } from "../components/Dice.tsx";
import { sfx, unlockAudio } from "../lib/sound.ts";
import { fixState, type Game, type Player, type PlayerState, type Result } from "../lib/types.ts";
import Header from "../components/Header.tsx";

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

export default function Join() {
  const [uid, setUid] = useState<string | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    ensureSignedIn()
      .then((u) => setUid(u.uid))
      .catch(() => setErr("Cannot connect. Check your internet and reload this page."));
  }, []);

  const game = useDbValue<Game>(uid ? "game" : null);
  const me = useDbValue<Player>(uid ? `players/${uid}` : null);
  const tokens = useDbValue<Record<string, string>>(uid ? "tokens" : null);
  const stateRaw = useDbValue<PlayerState>(uid ? `state/${uid}` : null);
  const state = useMemo(() => fixState(stateRaw), [stateRaw]);

  let body;
  if (err) body = <p className="card error">{err}</p>;
  else if (!uid || game === undefined || me === undefined || tokens === undefined) body = <p className="card muted">Connecting… / Menyambung…</p>;
  else if (!me) {
    if (game && game.status !== "lobby")
      body = (
        <div className="card center">
          <Bi en="The game has already started." ms="Permainan sudah bermula." />
          <p className="muted">Please wait for the next game. / Sila tunggu permainan seterusnya.</p>
        </div>
      );
    else body = <JoinForm uid={uid} tokens={tokens ?? {}} />;
  } else if (!game || game.status === "lobby") body = <Lobby uid={uid} me={me} tokens={tokens ?? {}} />;
  else body = <Play uid={uid} me={me} game={game} state={state ?? null} />;

  return (
    <div className="phone">
      <Header small />
      <main className="phone-main">{body}</main>
    </div>
  );
}

function TokenPicker({ uid, tokens, value, onPick }: { uid: string; tokens: Record<string, string>; value: string; onPick: (id: string) => void }) {
  return (
    <div className="token-grid" role="radiogroup" aria-label="Choose your piece">
      {TOKENS.map((t) => {
        const taken = !!tokens[t.id] && tokens[t.id] !== uid;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={value === t.id}
            disabled={taken}
            className={`token-btn ${value === t.id ? "on" : ""}`}
            style={{ ["--c" as string]: t.color }}
            onClick={() => onPick(t.id)}
          >
            <span className="emoji">{t.emoji}</span>
            <span className="tname">{taken ? "Taken" : t.name}</span>
          </button>
        );
      })}
    </div>
  );
}

async function claimToken(uid: string, id: string, old: string | undefined) {
  if (old === id) return;
  await set(ref(db, `tokens/${id}`), uid);
  if (old) await remove(ref(db, `tokens/${old}`)).catch(() => {});
}

function JoinForm({ uid, tokens }: { uid: string; tokens: Record<string, string> }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("qsl-name") ?? "";
    } catch {
      return "";
    }
  });
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const full = TOKENS.every((t) => tokens[t.id] && tokens[t.id] !== uid);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    unlockAudio();
    const n = name.trim().replace(/\s+/g, " ");
    if (!n) return setMsg("Please type your name. / Sila taip nama anda.");
    if (!token) return setMsg("Please choose a piece. / Sila pilih buah anda.");
    setBusy(true);
    setMsg("");
    try {
      await claimToken(uid, token, undefined);
    } catch {
      setBusy(false);
      setToken("");
      return setMsg("Someone just took that piece. Choose another one. / Buah itu sudah diambil. Pilih yang lain.");
    }
    try {
      await set(ref(db, `players/${uid}`), { name: n.slice(0, 20), token, joinedAt: serverTimestamp() });
      try {
        localStorage.setItem("qsl-name", n);
      } catch {}
    } catch {
      await remove(ref(db, `tokens/${token}`)).catch(() => {});
      setMsg("Could not join. The game may have started already. / Tidak dapat menyertai.");
    }
    setBusy(false);
  }

  if (full)
    return (
      <div className="card center">
        <Bi en="The game is full (10 players)." ms="Permainan sudah penuh (10 pemain)." />
      </div>
    );

  return (
    <form className="card join" onSubmit={submit}>
      <Bi en="Join the game" ms="Sertai permainan" className="title" />
      <label className="field">
        <span>Your name / Nama anda</span>
        <input id="name" value={name} maxLength={20} autoComplete="given-name" onChange={(e) => setName(e.target.value)} placeholder="e.g. Aina" />
      </label>
      <div className="field">
        <span>Choose your piece / Pilih buah anda</span>
        <TokenPicker uid={uid} tokens={tokens} value={token} onPick={setToken} />
      </div>
      {msg && <p className="error">{msg}</p>}
      <button className="big-btn" disabled={busy}>
        {busy ? "Joining…" : "Join / Sertai"}
      </button>
    </form>
  );
}

function Lobby({ uid, me, tokens }: { uid: string; me: Player; tokens: Record<string, string> }) {
  const [changing, setChanging] = useState(false);
  const t = tokenById(me.token);
  async function pick(id: string) {
    try {
      await claimToken(uid, id, me.token);
      await set(ref(db, `players/${uid}/token`), id);
      setChanging(false);
    } catch {
      /* taken meanwhile; the list updates by itself */
    }
  }
  async function leave() {
    await remove(ref(db, `players/${uid}`)).catch(() => {});
    await remove(ref(db, `tokens/${me.token}`)).catch(() => {});
  }
  return (
    <div className="card center lobby-me">
      <div className="me-piece" style={{ ["--c" as string]: t.color }}>
        {t.emoji}
      </div>
      <h2>{me.name}</h2>
      <Bi en="You're in! Watch the big screen. The game starts soon." ms="Anda sudah masuk! Lihat skrin besar. Permainan akan bermula." />
      <HowTo />
      {changing ? (
        <TokenPicker uid={uid} tokens={tokens} value={me.token} onPick={pick} />
      ) : (
        <div className="row-btns">
          <button className="link-btn" onClick={() => setChanging(true)}>
            Change piece
          </button>
          <button className="link-btn" onClick={leave}>
            Leave
          </button>
        </div>
      )}
    </div>
  );
}

function HowTo() {
  return (
    <ul className="howto">
      <li>
        <b>Right answer</b> → roll 2 dice. <b>Wrong</b> → roll 1 die.
        <small>Betul → 2 dadu. Salah → 1 dadu.</small>
      </li>
      <li>
        <b>3 right in a row</b> → 3 dice!
        <small>3 betul berturut-turut → 3 dadu!</small>
      </li>
      <li>
        🐍 <b>Snake:</b> right = stay, wrong = slide down. 🪜 <b>Ladder:</b> right = climb, wrong = stay.
        <small>Ular: betul = kekal, salah = turun. Tangga: betul = naik, salah = kekal.</small>
      </li>
      <li>
        <b>Boxes 46–49:</b> you need 6 or more to finish. Wrong answer = no roll.
        <small>Petak 46–49: perlu 6 atau lebih untuk tamat. Salah = tiada balingan.</small>
      </li>
    </ul>
  );
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
        {[0, 1, 2].map((i) => (
          <i key={i} className={i < streak ? "on" : ""} />
        ))}
      </span>
    </div>
  );
}

function Play({ uid, me, game, state }: { uid: string; me: Player; game: Game; state: PlayerState | null }) {
  if (!state) return <p className="card muted">Getting ready… / Bersedia…</p>;
  let inner;
  if (state.phase === "won") inner = <Won rank={state.rank ?? 0} />;
  else if (game.status === "ended") inner = <Ended st={state} />;
  else if (state.phase === "question") inner = <QuestionCard uid={uid} st={state} paused={game.paused} pausedAt={game.pausedAt} />;
  else if (state.phase === "result" && state.result) inner = <ResultCard r={state.result} seq={state.seq} />;
  else inner = <p className="card muted">Get ready… / Bersedia…</p>;
  return (
    <>
      <StatusStrip me={me} st={state} />
      {game.paused && game.status === "playing" && <div className="paused-bar">Paused by host / Dihentikan seketika</div>}
      {inner}
    </>
  );
}

function kindIntro(st: PlayerState) {
  if (st.kind === "snake")
    return (
      <Bi
        className="kind snake"
        en={`🐍 Snake question! Right = stay safe. Wrong = slide to box ${SNAKES[st.pos]}.`}
        ms={`Soalan ular! Betul = selamat. Salah = turun ke petak ${SNAKES[st.pos]}.`}
      />
    );
  if (st.kind === "ladder")
    return (
      <Bi
        className="kind ladder"
        en={`🪜 Ladder question! Right = climb to box ${LADDERS[st.pos]}. Wrong = stay.`}
        ms={`Soalan tangga! Betul = naik ke petak ${LADDERS[st.pos]}. Salah = kekal.`}
      />
    );
  if (inFinalZone(st.pos))
    return (
      <Bi
        className="kind final"
        en={`🏁 Final zone! Right = roll, need ${FINAL_ZONE_NEED}+ to finish. Wrong = no roll.`}
        ms={`Zon akhir! Betul = baling, perlu ${FINAL_ZONE_NEED}+ untuk tamat. Salah = tiada balingan.`}
      />
    );
  if (st.streak === 2) return <Bi className="kind bonus" en="🔥 Get this right for a 3-dice bonus!" ms="Jawab betul untuk bonus 3 dadu!" />;
  return null;
}

const LETTERS = ["A", "B", "C", "D"];

function QuestionCard({ uid, st, paused, pausedAt }: { uid: string; st: PlayerState; paused: boolean; pausedAt: number | null }) {
  useNow(200);
  const q = st.q!;
  const [sent, setSent] = useState<{ qid: string; choice: number } | null>(null);
  const lastBeep = useRef(-1);
  const left = Math.max(0, st.deadline - (paused && pausedAt ? pausedAt : serverNow()));
  const secs = Math.ceil(left / 1000);
  const answered = sent?.qid === q.id ? sent.choice : null;
  const warn = secs <= 5 && answered === null;

  useEffect(() => {
    if (!warn || paused || secs <= 0 || lastBeep.current === secs) return;
    lastBeep.current = secs;
    sfx.tick();
    try {
      navigator.vibrate?.(120);
    } catch {}
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
    <div className="qcard" key={`${q.id}-${st.seq}`}>
      {kindIntro(st)}
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

function outcomeText(r: Result): { en: string; ms: string } {
  switch (r.outcome) {
    case "move":
      if (r.next === "snake") return { en: `Box ${r.from} → ${r.to}. 🐍 A snake! Answer to stay safe.`, ms: `Petak ${r.from} → ${r.to}. Ular! Jawab untuk selamat.` };
      if (r.next === "ladder") return { en: `Box ${r.from} → ${r.to}. 🪜 A ladder! Answer to climb.`, ms: `Petak ${r.from} → ${r.to}. Tangga! Jawab untuk naik.` };
      return { en: `Box ${r.from} → ${r.to}`, ms: `Petak ${r.from} → ${r.to}` };
    case "win":
      return { en: `You reached box ${LAST_BOX}!`, ms: `Anda sampai ke petak ${LAST_BOX}!` };
    case "stay":
      return { en: `Total under ${FINAL_ZONE_NEED}. Stay at box ${r.to}. Next question!`, ms: `Jumlah kurang ${FINAL_ZONE_NEED}. Kekal di petak ${r.to}. Soalan seterusnya!` };
    case "noroll":
      return { en: "No roll in the final zone. Next question!", ms: "Tiada balingan di zon akhir. Soalan seterusnya!" };
    case "climb":
      return { en: `You climbed to box ${r.to}!`, ms: `Anda naik ke petak ${r.to}!` };
    case "nolad":
      return { en: `No climb. Stay at box ${r.to}.`, ms: `Tidak naik. Kekal di petak ${r.to}.` };
    case "safe":
      return { en: `Safe! You stay at box ${r.to}.`, ms: `Selamat! Anda kekal di petak ${r.to}.` };
    case "slide":
      return { en: `Oh no! Slid down to box ${r.to}.`, ms: `Alamak! Turun ke petak ${r.to}.` };
  }
}

function ResultCard({ r, seq }: { r: Result; seq: number }) {
  const [rolled, setRolled] = useState(r.dice.length === 0);
  useEffect(() => {
    if (r.timeout || !r.correct) sfx.wrong();
    else sfx.correct();
    if (r.dice.length) setTimeout(() => sfx.dice(), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);
  const head = r.timeout
    ? { icon: "⏰", en: "Time's up!", ms: "Masa tamat!", cls: "bad" }
    : r.correct
      ? { icon: "✔", en: "Correct!", ms: "Betul!", cls: "good" }
      : { icon: "✘", en: "Wrong", ms: "Salah", cls: "bad" };
  const out = outcomeText(r);
  return (
    <div className={`rcard ${head.cls}`} key={seq}>
      <div className="mark">{head.icon}</div>
      <Bi en={head.en} ms={head.ms} className="rhead" />
      {r.bonus && <div className="bonus-badge">🔥 3 in a row! 3-dice bonus / Bonus 3 dadu</div>}
      {r.dice.length > 0 && <DiceRoll values={r.dice} seed={seq} size={72} onDone={() => setRolled(true)} />}
      {rolled && <Bi en={out.en} ms={out.ms} className="outcome" />}
    </div>
  );
}

function Won({ rank }: { rank: number }) {
  useEffect(() => sfx.win(), []);
  return (
    <div className="card center won">
      <div className="trophy">🏆</div>
      <Bi en={`You finished #${rank}!`} ms={`Anda tamat di tempat #${rank}!`} className="title" />
      <p className="muted">Well done! Watch the big screen. / Syabas! Lihat skrin besar.</p>
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
