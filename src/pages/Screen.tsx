import { useEffect, useMemo, useRef, useState } from "react";
import { get, ref, set } from "firebase/database";
import { db, ensureSignedIn, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { Engine, MAX_WINNERS, playAgain, removePlayer, resetGame } from "../lib/engine.ts";
import { tokenById, MAX_PLAYERS } from "../lib/tokens.ts";
import { isMuted, setMuted, sfx, unlockAudio } from "../lib/sound.ts";
import Board, { type BoardPiece } from "../components/Board.tsx";
import Header from "../components/Header.tsx";
import Qr from "../components/Qr.tsx";
import { FINAL_ZONE_NEED, FINAL_ZONE_START, LAST_BOX } from "../lib/board.ts";
import Countdown from "../components/Countdown.tsx";
import { DiceRoll } from "../components/Dice.tsx";
import QuestionManager, { seedQuestionsIfEmpty } from "../components/QuestionManager.tsx";
import { fixStates, type FeedItem, type Game, type Player, type PlayerState, type Question } from "../lib/types.ts";

const tabId = (() => {
  try {
    let id = sessionStorage.getItem("qsl-tab");
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem("qsl-tab", id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

export default function Screen() {
  const [host, setHost] = useState<"checking" | "setup" | "pin" | "ok" | "error">("checking");
  useEffect(() => {
    (async () => {
      try {
        await ensureSignedIn();
        const pinSet = (await get(ref(db, "setup/pinSet"))).val();
        if (!pinSet) return setHost("setup");
        try {
          const qs = await get(ref(db, "questions"));
          await seedQuestionsIfEmpty(qs.val());
          setHost("ok");
        } catch {
          setHost("pin");
        }
      } catch {
        setHost("error");
      }
    })();
  }, []);

  if (host === "ok") return <HostScreen />;
  return (
    <div className="screen">
      <Header />
      <main className="gate">
        {host === "checking" && <p className="muted">Connecting…</p>}
        {host === "error" && <p className="error">Cannot connect to the game database. Check the internet connection and reload.</p>}
        {(host === "setup" || host === "pin") && <PinForm first={host === "setup"} onOk={() => setHost("ok")} />}
      </main>
    </div>
  );
}

function PinForm({ first, onOk }: { first: boolean; onOk: () => void }) {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = pin.trim();
    if (p.length < 4 || p.length > 12) return setMsg("The PIN must be 4 to 12 characters.");
    const { uid } = await ensureSignedIn();
    try {
      if (first) await set(ref(db, "secret/pin"), p);
      await set(ref(db, `hosts/${uid}`), p);
      if (first) await set(ref(db, "setup/pinSet"), true);
      const qs = await get(ref(db, "questions"));
      await seedQuestionsIfEmpty(qs.val());
      onOk();
    } catch {
      setMsg(first ? "Could not save the PIN. Reload and try again." : "Wrong PIN. Try again.");
    }
  }
  return (
    <form className="pin-card" onSubmit={submit}>
      <h2>{first ? "Create a host PIN" : "Host PIN"}</h2>
      <p className="muted">
        {first
          ? "This PIN protects the projector screen and the host controls. Keep it to yourself. You will type it once on each computer you use as the projector."
          : "Type the host PIN to open the projector screen and controls."}
      </p>
      <input id="pin" type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" />
      {msg && <p className="error">{msg}</p>}
      <button className="big-btn">{first ? "Save PIN" : "Open"}</button>
    </form>
  );
}

function HostScreen() {
  const game = useDbValue<Game>("game");
  const players = useDbValue<Record<string, Player>>("players");
  const statesRaw = useDbValue<Record<string, PlayerState>>("state");
  const states = useMemo(() => (statesRaw === undefined ? undefined : fixStates(statesRaw)), [statesRaw]);
  const feedRaw = useDbValue<FeedItem[] | Record<string, FeedItem>>("feed");
  const questions = useDbValue<Record<string, Question>>("questions");
  const engine = useRef<Engine | null>(null);
  const [showQs, setShowQs] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [confirm, setConfirm] = useState<null | "reset" | "end">(null);
  const [msg, setMsg] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<{ uid: string; seq: number; dice: number[]; bonus: boolean } | null>(null);

  const status = game?.status ?? "lobby";
  const iRun = status === "playing" && game?.engine === tabId;
  const someoneElseRuns = status === "playing" && game?.engine !== tabId;

  // If this window was running the game and got reloaded, carry on.
  useEffect(() => {
    if (iRun && !engine.current) {
      const e = new Engine(tabId);
      engine.current = e;
      e.resume().catch(() => (engine.current = null));
    }
    if (!iRun && engine.current) {
      engine.current.stop();
      engine.current = null;
    }
  }, [iRun]);
  useEffect(() => () => engine.current?.stop(), []);

  // Sounds and highlight when pieces move.
  const lastSeq = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!states) return;
    for (const [uid, st] of Object.entries(states)) {
      const prev = lastSeq.current[uid];
      lastSeq.current[uid] = st.seq;
      if (prev === undefined || prev === st.seq || !st.result) continue;
      setHighlight(uid);
      if (st.result.dice.length) setLastRoll({ uid, seq: st.seq, dice: st.result.dice, bonus: st.result.bonus });
      const o = st.result.outcome;
      if (o === "win") sfx.win();
      else if (o === "climb") sfx.ladder();
      else if (o === "slide") sfx.snake();
      else if (st.result.dice.length) sfx.dice();
    }
  }, [states]);

  // New players joining: a little sound.
  const lastCount = useRef(0);
  const count = Object.keys(players ?? {}).length;
  useEffect(() => {
    if (count > lastCount.current) sfx.join();
    lastCount.current = count;
  }, [count]);

  const feed: FeedItem[] = Array.isArray(feedRaw) ? feedRaw : Object.values(feedRaw ?? {});
  const enabledQs = Object.values(questions ?? {}).filter((q) => q.enabled).length;

  async function start() {
    unlockAudio();
    setMsg("");
    const e = new Engine(tabId);
    try {
      engine.current = e;
      await e.start();
    } catch (err) {
      engine.current = null;
      setMsg((err as Error).message);
    }
  }
  async function takeOver() {
    unlockAudio();
    const e = new Engine(tabId);
    engine.current = e;
    await e.resume();
  }
  function toggleSound() {
    unlockAudio();
    setMuted(!muted);
    setMutedState(!muted);
  }
  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const tools = (
    <>
      {status === "playing" && iRun && (
        <>
          <button className="btn" onClick={() => (game?.paused ? engine.current?.unpause() : engine.current?.pause())}>
            {game?.paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button className="btn" onClick={() => setConfirm("end")}>
            End game
          </button>
        </>
      )}
      {status === "lobby" && (
        <button className="btn" onClick={() => setShowQs(true)}>
          Questions ({enabledQs})
        </button>
      )}
      <button className="btn" onClick={() => setConfirm("reset")}>
        New game
      </button>
      <button className="btn" onClick={toggleSound} aria-pressed={!muted}>
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </button>
      <button className="btn" onClick={fullscreen}>
        ⛶ Full screen
      </button>
    </>
  );

  if (game === undefined || players === undefined) {
    return (
      <div className="screen">
        <Header />
        <p className="muted gate">Loading…</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <Header>{tools}</Header>
      {confirm && (
        <div className="confirm-bar">
          {confirm === "reset" ? "Start a new game? Everyone will need to scan and join again." : "End the game now? The current order becomes the final result."}
          <button
            className="btn danger"
            onClick={async () => {
              const c = confirm;
              setConfirm(null);
              if (c === "reset") {
                engine.current?.stop();
                engine.current = null;
                await resetGame();
              } else await engine.current?.endNow();
            }}
          >
            Yes
          </button>
          <button className="btn" onClick={() => setConfirm(null)}>
            No
          </button>
        </div>
      )}
      {someoneElseRuns && (
        <div className="confirm-bar">
          The game is being run from another window. This window is only watching.
          <button className="btn" onClick={takeOver}>
            Run it from this window
          </button>
        </div>
      )}
      {msg && <div className="confirm-bar error-bar">{msg}</div>}

      {status === "lobby" && <LobbyView players={players ?? {}} onStart={start} enabledQs={enabledQs} />}
      {status !== "lobby" && (
        <GameView game={game!} players={players ?? {}} states={states ?? {}} feed={feed} highlight={highlight} lastRoll={lastRoll} onAgain={() => playAgain()} />
      )}
      {showQs && <QuestionManager onClose={() => setShowQs(false)} />}
    </div>
  );
}

function LobbyView({ players, onStart, enabledQs }: { players: Record<string, Player>; onStart: () => void; enabledQs: number }) {
  const url = `${location.origin}/join`;
  const list = Object.entries(players).sort((a, b) => (a[1].joinedAt ?? 0) - (b[1].joinedAt ?? 0));
  return (
    <main className="lobby">
      <section className="qr-side">
        <Qr text={url} size={340} />
        <div className="scan">
          <div className="en">Scan to join</div>
          <div className="ms">Imbas untuk menyertai</div>
        </div>
        <div className="url">{url.replace(/^https?:\/\//, "")}</div>
      </section>
      <section className="lobby-side">
        <div className="lobby-head">
          <h2>
            Players <span className="count">{list.length}/{MAX_PLAYERS}</span>
          </h2>
          <button className="big-btn start" disabled={!list.length || !enabledQs} onClick={onStart}>
            ▶ Start game
          </button>
        </div>
        {!list.length && <p className="waiting">Waiting for players to scan the QR code… / Menunggu pemain…</p>}
        <ul className="lobby-players">
          {list.map(([uid, p]) => {
            const t = tokenById(p.token);
            return (
              <li key={uid} style={{ ["--c" as string]: t.color }}>
                <span className="lp-emoji">{t.emoji}</span>
                <span className="lp-name">{p.name}</span>
                <button className="x" aria-label={`Remove ${p.name}`} onClick={() => removePlayer(uid, p.token)}>
                  ×
                </button>
              </li>
            );
          })}
        </ul>
        <div className="rules">
          <h3>How to play / Cara bermain</h3>
          <ul>
            <li>
              Answer on your phone. <b>Right</b> = 2 dice, <b>wrong</b> = 1 die. <b>3 right in a row</b> = 3 dice!
              <small>Jawab di telefon. Betul = 2 dadu, salah = 1 dadu. 3 betul berturut-turut = 3 dadu!</small>
            </li>
            <li>
              🐍 Snake: right = stay, wrong = slide down. 🪜 Ladder: right = climb, wrong = stay.
              <small>Ular: betul = kekal, salah = turun. Tangga: betul = naik, salah = kekal.</small>
            </li>
            <li>
              Boxes {FINAL_ZONE_START}–{LAST_BOX - 1}: roll {FINAL_ZONE_NEED} or more to finish. First {MAX_WINNERS} to box {LAST_BOX} win!
              <small>
                Petak {FINAL_ZONE_START}–{LAST_BOX - 1}: perlu {FINAL_ZONE_NEED} atau lebih untuk tamat. {MAX_WINNERS} pemain pertama ke petak {LAST_BOX} menang!
              </small>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function GameView({
  game,
  players,
  states,
  feed,
  highlight,
  lastRoll,
  onAgain,
}: {
  game: Game;
  players: Record<string, Player>;
  states: Record<string, PlayerState>;
  feed: FeedItem[];
  highlight: string | null;
  lastRoll: { uid: string; seq: number; dice: number[]; bonus: boolean } | null;
  onAgain: () => void;
}) {
  useNow(500);
  const pieces: BoardPiece[] = useMemo(
    () => Object.entries(players).map(([uid, player]) => ({ uid, player, state: states[uid] })),
    [players, states],
  );
  const winners = (game.winners ?? []).filter((u) => players[u]);
  const ranking = [...pieces].sort((a, b) => {
    const ra = a.state?.rank ?? 99;
    const rb = b.state?.rank ?? 99;
    if (ra !== rb) return ra - rb;
    return (b.state?.pos ?? 0) - (a.state?.pos ?? 0);
  });
  const ended = game.status === "ended";

  return (
    <main className={`game ${ended ? "ended" : ""}`}>
      <section className="board-side">
        <Board pieces={pieces} highlight={highlight} />
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {ended && (
          <div className="podium-overlay">
            <div className="podium">
              <h2>🏆 Winners / Pemenang</h2>
              <ol>
                {ranking.slice(0, Math.max(winners.length, Math.min(MAX_WINNERS, ranking.length))).map((p, i) => {
                  const t = tokenById(p.player.token);
                  return (
                    <li key={p.uid} className={`place p${i + 1}`}>
                      <span className="pl-rank">#{i + 1}</span>
                      <span className="pl-emoji">{t.emoji}</span>
                      <span className="pl-name">{p.player.name}</span>
                      <span className="pl-box">{p.state?.rank ? "Finished" : `Box ${p.state?.pos ?? 0}`}</span>
                    </li>
                  );
                })}
              </ol>
              <button className="big-btn" onClick={onAgain}>
                Play again with the same players
              </button>
            </div>
          </div>
        )}
      </section>
      <aside className="side">
        {lastRoll && players[lastRoll.uid] && (
          <div className="panel roll-panel">
            <h3>Latest roll</h3>
            <div className="roll-who" style={{ ["--c" as string]: tokenById(players[lastRoll.uid].token).color }}>
              <span>{tokenById(players[lastRoll.uid].token).emoji}</span>
              <span className="roll-name">{players[lastRoll.uid].name}</span>
              {lastRoll.bonus && <span className="chip hot">🔥 3 dice</span>}
            </div>
            <DiceRoll values={lastRoll.dice} seed={`${lastRoll.uid}-${lastRoll.seq}`} size={58} />
          </div>
        )}
        <div className="panel">
          <h3>
            Players <span className="muted">· {winners.length}/{Math.min(MAX_WINNERS, pieces.length)} finished</span>
          </h3>
          <ul className="ranking">
            {ranking.map((p) => (
              <RankRow key={p.uid} p={p} paused={game.paused} pausedAt={game.pausedAt} />
            ))}
          </ul>
        </div>
        <div className="panel feed-panel">
          <h3>Live</h3>
          <ul className="feed">
            {[...feed].reverse().map((f) => (
              <li key={`${f.at}-${f.uid}-${f.text}`} className={`tone-${f.tone}`}>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}

function RankRow({ p, paused, pausedAt }: { p: BoardPiece; paused: boolean; pausedAt: number | null }) {
  const t = tokenById(p.player.token);
  const st = p.state;
  let chip: React.ReactNode = null;
  if (st?.phase === "won") chip = <span className="chip win">🏆 #{st.rank}</span>;
  else if (st?.phase === "question") {
    const left = Math.max(0, Math.ceil((st.deadline - (paused && pausedAt ? pausedAt : serverNow())) / 1000));
    const label = st.kind === "snake" ? "🐍" : st.kind === "ladder" ? "🪜" : "⏱";
    chip = <span className={`chip ${left <= 5 ? "hot" : ""} ${st.kind}`}>{label} {left}s</span>;
  } else if (st?.phase === "result" && st.result) {
    const r = st.result;
    chip = <span className={`chip ${r.correct ? "ok" : "no"}`}>{r.timeout ? "⏰" : r.correct ? "✔" : "✘"} {r.dice.length ? `🎲 ${r.dice.reduce((a, b) => a + b, 0)}` : ""}</span>;
  }
  return (
    <li style={{ ["--c" as string]: t.color }}>
      <span className="r-emoji">{t.emoji}</span>
      <span className="r-name">{p.player.name}</span>
      <span className="r-streak" title="Right answers in a row">
        {"🔥".repeat(Math.min(3, st?.streak ?? 0))}
      </span>
      <span className="r-box">{st?.pos ?? 0}</span>
      {chip}
    </li>
  );
}
