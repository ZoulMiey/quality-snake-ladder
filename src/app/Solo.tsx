// A solo game in the app: the game's referee runs on this phone (store space "local"), the phone screen is the
// same as at the event, and at the end the score goes to the personal record and (Google players) the lists.
import { useEffect, useMemo, useRef, useState } from "react";
import Header, { GAME_NAMES } from "../components/Header.tsx";
import { setSpace, resetLocal } from "../lib/store.ts";
import { useDbValue } from "../lib/useDb.ts";
import { ensureSignedIn } from "../lib/firebase.ts";
import { loadQuestions, type AppSet } from "../lib/pubQuestions.ts";
import { assignPieces } from "../lib/tokens.ts";
import { unlockAudio } from "../lib/sound.ts";
import { fixState, type Game, type GameMode, type Player, type PlayerState } from "../lib/types.ts";
import SnakePhone from "../pages/SnakePhone.tsx";
import KartPhone from "../kart/KartPhone.tsx";
import RaidPhone, { RaidPick } from "../clash/RaidPhone.tsx";
import FishPhone from "../fish/FishPhone.tsx";
import RopePhone from "../rope/RopePhone.tsx";
import SpinPhone from "../spin/SpinPhone.tsx";
import { makeEngine, type AnyEngine } from "./engines.ts";
import { fmtScore, submitScore, type ScoreKey, type Submitted, isGoogle } from "./scores.ts";
import { scoreKey, useNav } from "./App.tsx";

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

/** The finished game's score, or null when there is none (did not finish, lost to the Titan or the river). */
function readScore(m: GameMode, all: { game: Game | null; state?: Record<string, unknown>; kart?: { me?: Record<string, { finished?: boolean; time?: number | null }> }; clash?: { result?: { winner?: string; ms?: number } } }, uid: string): number | null {
  const g = all.game;
  if (!g || g.status !== "ended") return null;
  if (m === "snake") {
    const st = fixState(all.state?.[uid] as PlayerState);
    return st?.phase === "won" && g.goAt && g.endedAt ? g.endedAt - g.goAt : null;
  }
  if (m === "kart") {
    const me = all.kart?.me?.[uid];
    return me?.finished && me.time ? Math.round(me.time * 1000) : null;
  }
  if (m === "clash") {
    const r = all.clash?.result;
    return r?.winner === "players" && r.ms ? r.ms : null;
  }
  if (m === "fish") {
    const st = all.state?.[uid] as { kg?: number } | undefined;
    return st?.kg ? Math.round(st.kg * 10) : 0;
  }
  if (m === "rope") {
    const r = g.rope;
    return r?.champion === "red" && r.last?.how === "bank" && g.goAt ? r.last.at - g.goAt : null;
  }
  if (m === "spin") return g.spin?.red?.score ?? 0;
  return null;
}

export default function Solo({ m, set, mins, nick }: { m: GameMode; set: AppSet; mins: 3 | 5; nick: string }) {
  const nav = useNav();
  const [uid, setUid] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "pick" | "playing" | "error">("loading");
  const [err, setErr] = useState("");
  const engine = useRef<AnyEngine | null>(null);
  const key: ScoreKey = scoreKey(m, mins);

  // Everything of this game lives in the phone's memory.
  useMemo(() => setSpace({ kind: "local" }), []);
  useEffect(() => {
    setSpace({ kind: "local" });
    return () => {
      engine.current?.stop();
      setSpace({ kind: "fire", prefix: "" });
    };
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const u = await ensureSignedIn().catch(() => null);
        const me = u?.uid ?? "me";
        const questions = await loadQuestions(set);
        if (!Object.keys(questions).length) throw new Error("No questions yet. Please connect to the internet once. / Tiada soalan. Sila sambung ke internet.");
        const players: Record<string, Player> = { [me]: { name: nick, token: "", joinedAt: Date.now() } };
        const pieces = assignPieces(players);
        players[me].token = pieces[me] ?? "";
        const game: Partial<Game> = {
          status: "lobby",
          mode: m,
          qset: set === "mix" ? "mix" : "quality",
          engine: null,
          paused: false,
          pausedAt: null,
          clashFormat: "boss",
          bossMode: "ta",
          fishMode: "open",
          spinMins: mins,
          ...(m === "spin" ? { spinSolo: true } : {}),
          ...(m === "rope" ? { ropeSolo: true } : {}),
        };
        resetLocal({ players, questions, game });
        if (!live) return;
        setUid(me);
        if (m === "clash") setPhase("pick");
        else await start(me);
      } catch (e) {
        if (!live) return;
        setErr((e as Error).message);
        setPhase("error");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  async function start(_me: string) {
    unlockAudio();
    const e = makeEngine(m, "solo", m === "clash" ? "boss" : null);
    engine.current = e;
    await e.start();
    setPhase("playing");
  }

  const game = useDbValue<Game>(uid ? "game" : null);
  const me = useDbValue<Player>(uid ? `players/${uid}` : null);
  const stateRaw = useDbValue<PlayerState>(uid && m === "snake" ? `state/${uid}` : null);
  const state = useMemo(() => fixState(stateRaw), [stateRaw]);
  const kartMe = useDbValue<Record<string, { finished?: boolean; time?: number | null }>>(uid && m === "kart" ? "kart/me" : null);
  const clashResult = useDbValue<{ winner?: string; ms?: number }>(uid && m === "clash" ? "clash/result" : null);
  const fishState = useDbValue<{ kg?: number }>(uid && m === "fish" ? `state/${uid}` : null);

  // The end: work out the score once, save it, then show the result.
  const [result, setResult] = useState<{ v: number | null; sub: Submitted | null } | null>(null);
  const done = useRef(false);
  useEffect(() => {
    if (!uid || !game || game.status !== "ended" || done.current) return;
    done.current = true;
    const v = readScore(m, { game, state: { [uid]: m === "snake" ? stateRaw : fishState }, kart: { me: kartMe ?? {} }, clash: { result: clashResult ?? undefined } }, uid);
    const show = (sub: Submitted | null) => setTimeout(() => setResult({ v, sub }), 1800);
    if (v === null) show(null);
    else submitScore(key, set, v, nick).then(show, () => show(null));
  }, [game?.status]);

  const exit = () => nav(`/play/${m}`);
  if (phase === "error")
    return (
      <Frame m={m}>
        <div className="card center">
          <p className="error">{err}</p>
          <button className="big-btn" onClick={exit}>
            ← Back / Kembali
          </button>
        </div>
      </Frame>
    );
  if (!uid || !me || (phase === "playing" && !game)) return <Frame m={m}><p className="card muted">Getting ready… / Bersedia…</p></Frame>;
  if (phase === "pick")
    return (
      <Frame m={m}>
        <RaidPick uid={uid} />
        <button className="big-btn" onClick={() => void start(uid)}>
          ▶ Start the raid / Mula
        </button>
        <button className="link-btn" onClick={exit}>
          ← Back / Kembali
        </button>
      </Frame>
    );
  if (result) return <Frame m={m}><SoloResult k={key} v={result.v} sub={result.sub} m={m} onAgain={() => location.reload()} onExit={exit} /></Frame>;
  if (!game) return null;
  let body;
  if (m === "snake") body = <SnakePhone uid={uid} me={me} game={game} state={state ?? null} onExit={exit} />;
  else if (m === "kart") body = <KartPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (m === "clash") body = <RaidPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (m === "fish") body = <FishPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (m === "rope") body = <RopePhone uid={uid} me={me} game={game} onExit={exit} />;
  else body = <SpinPhone uid={uid} me={me} game={game} onExit={exit} />;
  return (
    <Frame m={m}>
      {body}
      {game.status === "playing" && (
        <button className="link-btn solo-quit" onClick={exit}>
          ✕ Quit / Berhenti
        </button>
      )}
    </Frame>
  );
}

function Frame({ m, children }: { m: GameMode; children: React.ReactNode }) {
  return (
    <div className={`phone app solo-${m}`}>
      <Header small mode={m} />
      <main className="phone-main">{children}</main>
    </div>
  );
}

function SoloResult({ k, v, sub, m, onAgain, onExit }: { k: ScoreKey; v: number | null; sub: Submitted | null; m: GameMode; onAgain: () => void; onExit: () => void }) {
  const lost = v === null;
  const newPb = !!sub?.personal;
  return (
    <div className={`card center solo-result ${newPb ? "pb" : ""} ${lost ? "lost" : ""}`}>
      <div className="trophy">{lost ? "💪" : newPb ? "🏆" : "⭐"}</div>
      {lost ? (
        <Bi en={m === "clash" ? "The Titan won this time!" : m === "rope" ? "The river won this time!" : "Not finished this time!"} ms="Cuba lagi!" className="title" />
      ) : (
        <>
          <Bi en={newPb ? "NEW PERSONAL RECORD!" : "Well played!"} ms={newPb ? "Rekod peribadi baharu!" : "Syabas!"} className="title" />
          <div className="solo-score">{fmtScore(k, v!)}</div>
          {sub?.rankToday && <p className="solo-rank">🏆 #{sub.rankToday} today · hari ini{sub.rankAll ? ` · #${sub.rankAll} all time` : ""}</p>}
          {!isGoogle() && <p className="muted small">Sign in with Google (tap your name on the games page) to go on the high score lists.</p>}
        </>
      )}
      <button className="big-btn" onClick={onAgain}>
        ↻ Play again / Main lagi
      </button>
      <button className="big-btn alt" onClick={onExit}>
        🏆 High scores / Markah tertinggi
      </button>
      <p className="muted small">{GAME_NAMES[m].en}</p>
    </div>
  );
}

