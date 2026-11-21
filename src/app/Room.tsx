// Rooms with friends (owner, Nov 2026): one phone creates a room and is its host; friends join with the code,
// the QR on the host's phone or a shared link, from the same place or anywhere (max 50 players). Everything of
// the room lives under rooms/{CODE}/ with the same paths as the event, so the event's phone page (Join) runs
// unchanged inside the room, and the host's phone runs the referee (it must stay open; the screen is kept on).
// rooms/{CODE}/host = the host's uid; roomsIdx/{CODE} = when it was made (rooms older than a day are removed).
import { useEffect, useMemo, useRef, useState } from "react";
import { get, ref as fref, set as fset, update as fupdate, serverTimestamp } from "firebase/database";
import Join from "../pages/Join.tsx";
import Qr from "../components/Qr.tsx";
import GamePreview from "../components/GamePreview.tsx";
import { GAME_NAMES } from "../components/Header.tsx";
import { db, ensureSignedIn } from "../lib/firebase.ts";
import { setSpace, update, ref } from "../lib/store.ts";
import { useDbValue } from "../lib/useDb.ts";
import { loadQuestions } from "../lib/pubQuestions.ts";
import { assignPieces, gameMaxPlayers } from "../lib/tokens.ts";
import { playAgain } from "../lib/engine.ts";
import { poolFor, type QChoice } from "../lib/questionSets.ts";
import { unlockAudio } from "../lib/sound.ts";
import type { Game, GameMode, Player } from "../lib/types.ts";
import { ClashFormatPick, ClashRoster, useLineUp } from "../clash/ClashLobby.tsx";
import { RopeRoster, useRopeSides } from "../rope/RopeLobby.tsx";
import { SpinRoster, useSpinTeams } from "../spin/SpinLobby.tsx";
import KartView from "../kart/KartView.tsx";
import RaidView from "../clash/RaidView.tsx";
import ClashView from "../clash/ClashView.tsx";
import FishView from "../fish/FishView.tsx";
import RopeView from "../rope/RopeView.tsx";
import SpinView from "../spin/SpinView.tsx";
import { makeEngine, type AnyEngine } from "./engines.ts";
import { APP_GAMES, useNav } from "./App.tsx";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DAY = 86_400_000;
const roomTab = (() => {
  try {
    let t = sessionStorage.getItem("qsl-room-tab");
    if (!t) {
      t = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem("qsl-room-tab", t);
    }
    return t;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

/** Make a new room with a free code; this phone is its host. Old rooms (over a day) are cleared on the way. */
async function createRoom(mode: GameMode, qset: QChoice): Promise<string> {
  const u = await ensureSignedIn();
  // Clear rooms older than a day (the rules only allow that for old ones).
  try {
    const idx = ((await get(fref(db, "roomsIdx"))).val() ?? {}) as Record<string, number>;
    const old = Object.entries(idx).filter(([, at]) => at < Date.now() - DAY).slice(0, 20);
    for (const [c] of old) await fupdate(fref(db), { [`rooms/${c}`]: null, [`roomsIdx/${c}`]: null }).catch(() => {});
  } catch {}
  const questions = await loadQuestions("all");
  for (let i = 0; i < 12; i++) {
    const code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    const taken = (await get(fref(db, `roomsIdx/${code}`))).exists();
    if (taken) continue;
    await fset(fref(db, `roomsIdx/${code}`), serverTimestamp());
    await fset(fref(db, `rooms/${code}/host`), u.uid);
    await fupdate(fref(db, `rooms/${code}`), { questions, game: { status: "lobby", mode, qset, engine: null, paused: false, pausedAt: null, clashFormat: "team", bossMode: "ta", fishMode: "open", spinMins: 5 } });
    return code;
  }
  throw new Error("Could not make a room. Please try again.");
}

export default function Room({ code, nick }: { code: string; nick: string }) {
  const nav = useNav();
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [host, setHost] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  // A new room: make it, then show it under its code.
  useEffect(() => {
    if (code !== "NEW") return;
    const p = new URLSearchParams(location.search);
    const m = (p.get("m") as GameMode) || "snake";
    createRoom(m, p.get("set") === "mix" ? "mix" : "quality").then(
      (c) => {
        history.replaceState({}, "", `/play/room/${c}`);
        window.dispatchEvent(new Event("qsl-nav"));
      },
      (e) => {
        setMsg((e as Error).message);
        setState("error");
      },
    );
  }, [code]);

  // The room's data lives under rooms/{CODE}.
  useMemo(() => code !== "NEW" && setSpace({ kind: "fire", prefix: `rooms/${code}` }), [code]);
  useEffect(() => {
    if (code !== "NEW") setSpace({ kind: "fire", prefix: `rooms/${code}` });
    return () => setSpace({ kind: "fire", prefix: "" });
  }, [code]);
  useEffect(() => {
    if (code === "NEW") return;
    let live = true;
    (async () => {
      try {
        const u = await ensureSignedIn();
        const h = (await get(fref(db, `rooms/${code}/host`))).val() as string | null;
        if (!live) return;
        setUid(u.uid);
        setHost(h);
        setState(h ? "ok" : "missing");
        // Friends join with their nickname straight away (the join form is filled in for them).
        try {
          if (!localStorage.getItem("qsl-name")) localStorage.setItem("qsl-name", nick);
        } catch {}
      } catch {
        if (live) setState("error");
      }
    })();
    return () => {
      live = false;
    };
  }, [code]);

  if (code === "NEW" || state === "loading") return <Wrap><p className="card muted">{state === "error" ? msg : "Opening the room… / Membuka bilik…"}</p></Wrap>;
  if (state === "missing" || state === "error")
    return (
      <Wrap>
        <div className="card center">
          <p className="error">{state === "missing" ? `Room ${code} was not found. Check the code. / Bilik tidak dijumpai.` : msg || "Cannot connect. / Tidak dapat menyambung."}</p>
          <button className="big-btn" onClick={() => nav("/play/join")}>
            Try another code / Cuba kod lain
          </button>
          <button className="link-btn" onClick={() => nav("/play")}>
            🏠 Home
          </button>
        </div>
      </Wrap>
    );
  const isHost = !!uid && uid === host;
  return (
    <div className="room-page">
      <RoomBar code={code} isHost={isHost} />
      {isHost && <HostPanel code={code} uid={uid!} />}
      <Join />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone app">
      <main className="phone-main">{children}</main>
    </div>
  );
}

function RoomBar({ code, isHost }: { code: string; isHost: boolean }) {
  const nav = useNav();
  return (
    <div className="room-bar">
      <button className="link-btn" onClick={() => nav("/play")}>
        ← Leave
      </button>
      <span>
        👥 Room <b>{code}</b>
        {isHost ? " · 👑 you are the host" : ""}
      </span>
    </div>
  );
}

/** Ask the phone to keep its screen on while it runs the room (the referee stops if the phone sleeps). */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    let lock: { release: () => Promise<void> } | null = null;
    const req = () =>
      (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock
        ?.request("screen")
        .then((l) => (lock = l))
        .catch(() => {});
    void req();
    const vis = () => document.visibilityState === "visible" && void req();
    document.addEventListener("visibilitychange", vis);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      void lock?.release().catch(() => {});
    };
  }, [on]);
}

function HostPanel({ code, uid }: { code: string; uid: string }) {
  const nav = useNav();
  const game = useDbValue<Game>("game");
  const players = useDbValue<Record<string, Player>>("players") ?? {};
  const questions = useDbValue<Record<string, never>>("questions");
  const engine = useRef<AnyEngine | null>(null);
  const [err, setErr] = useState("");
  const [big, setBig] = useState(false);
  const status = game?.status ?? "lobby";
  const iRun = status === "playing" && game?.engine === roomTab;
  useWakeLock(true);

  // Carry on after this page is reloaded.
  useEffect(() => {
    if (iRun && !engine.current) {
      const e = makeEngine(game?.mode, roomTab, game?.clashFormat);
      engine.current = e;
      e.resume().catch(() => (engine.current = null));
    }
    if (!iRun && engine.current) {
      engine.current.stop();
      engine.current = null;
    }
  }, [iRun]);
  useEffect(() => () => engine.current?.stop(), []);

  const mode = (game?.mode ?? "snake") as GameMode;
  const qset = ((game?.qset as QChoice) === "mix" ? "mix" : "quality") as QChoice;
  const clashFormat = game?.clashFormat ?? "team";
  const clash = useLineUp(clashFormat, players);
  const rope = useRopeSides(players);
  const spin = useSpinTeams(players);
  const n = Object.keys(players).length;
  const cap = gameMaxPlayers(mode, clashFormat);
  const pool = poolFor(questions as never, qset).length;
  const ready = n > 0 && n <= cap && pool > 0 && (mode !== "clash" || clash.ready) && (mode !== "rope" || rope.ready) && (mode !== "spin" || spin.ready);
  const link = `${location.origin}/play/room/${code}`;
  const setGame = (v: Partial<Game>) => update(ref(undefined, "game"), { ...v, status: game?.status ?? "lobby" });

  async function start() {
    unlockAudio();
    setErr("");
    const e = makeEngine(mode, roomTab, clashFormat);
    try {
      const pieces = assignPieces(players);
      if (Object.keys(pieces).length) await update(ref(), Object.fromEntries(Object.entries(pieces).map(([u, id]) => [`players/${u}/token`, id])));
      engine.current = e;
      await e.start();
    } catch (x) {
      engine.current = null;
      setErr((x as Error).message);
    }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: "Quality Games", text: `Join my ${GAME_NAMES[mode].en} room: ${code}`, url: link });
      else {
        await navigator.clipboard.writeText(link);
        setErr("Link copied! / Pautan disalin!");
      }
    } catch {}
  }
  async function closeRoom() {
    engine.current?.stop();
    await fupdate(fref(db), { [`rooms/${code}`]: null, [`roomsIdx/${code}`]: null }).catch(() => {});
    nav("/play");
  }

  if (status === "playing")
    return (
      <div className="host-panel playing">
        <div className="hp-row">
          {iRun ? (
            <>
              <button className="btn" onClick={() => (game?.paused ? engine.current?.unpause() : engine.current?.pause())}>
                {game?.paused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button className="btn" onClick={() => engine.current?.endNow()}>
                ⏹ End game
              </button>
            </>
          ) : (
            <button
              className="btn"
              onClick={async () => {
                const e = makeEngine(game?.mode, roomTab, game?.clashFormat);
                engine.current = e;
                await e.resume();
              }}
            >
              ▶ Run the game from this phone
            </button>
          )}
          {mode !== "snake" && (
            <button className="btn" onClick={() => setBig((b) => !b)} aria-pressed={big}>
              📺 {big ? "My screen" : "Big screen"}
            </button>
          )}
        </div>
        <p className="hp-note">👑 Keep this phone open: it runs the game. · Biarkan telefon ini terbuka.</p>
        {big && game && <BigScreen game={game} players={players} />}
      </div>
    );
  if (status === "ended")
    return (
      <div className="host-panel">
        <div className="hp-row">
          <button className="big-btn" onClick={() => playAgain()}>
            ↻ Play again <small>Same players · Pemain sama</small>
          </button>
        </div>
        <GamePick mode={mode} onPick={(m) => void playAgain().then(() => setGame({ mode: m }))} />
        <button className="link-btn" onClick={() => void closeRoom()}>
          Close the room / Tutup bilik
        </button>
      </div>
    );
  return (
    <div className="host-panel">
      <div className="hp-code">
        <div>
          <small>Room code · Kod bilik</small>
          <b>{code}</b>
          <button className="btn" onClick={() => void share()}>
            🔗 Share link
          </button>
        </div>
        <Qr text={link} />
      </div>
      <GamePick mode={mode} onPick={(m) => setGame({ mode: m })} />
      <div className="seg" role="radiogroup" aria-label="Questions">
        {(["quality", "mix"] as const).map((s) => (
          <button key={s} role="radio" aria-checked={qset === s} className={qset === s ? "on" : ""} onClick={() => setGame({ qset: s })}>
            {s === "quality" ? "✅ Quality" : "🎲 Mix"}
            <small>{s === "quality" ? "Kualiti" : "Campuran"}</small>
          </button>
        ))}
      </div>
      {mode === "clash" && <ClashFormatPick format={clashFormat} onFormat={(f) => setGame({ clashFormat: f })} bossMode={game?.bossMode ?? "ta"} onBossMode={(b) => setGame({ bossMode: b })} />}
      {mode === "spin" && (
        <div className="seg" role="radiogroup" aria-label="Game time">
          {([3, 5] as const).map((t) => (
            <button key={t} role="radio" aria-checked={(game?.spinMins ?? 5) === t} className={(game?.spinMins ?? 5) === t ? "on" : ""} onClick={() => setGame({ spinMins: t })}>
              ⏱ {t} min
            </button>
          ))}
        </div>
      )}
      <div className="hp-players">
        <b>
          Players / Pemain: {n}/{cap}
        </b>
        {mode === "clash" && n > 0 && <ClashRoster format={clashFormat} players={players} />}
        {mode === "rope" && n > 0 && <RopeRoster players={players} />}
        {mode === "spin" && n > 0 && <SpinRoster players={players} />}
        {mode !== "clash" && mode !== "rope" && mode !== "spin" && (
          <div className="rope-chips">
            {Object.entries(players).map(([u, p]) => (
              <span key={u} className="rope-chip">
                {u === uid ? "👑 " : ""}
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
      {err && <p className="error">{err}</p>}
      <button className="big-btn start" disabled={!ready} onClick={() => void start()}>
        ▶ Start game / Mula
      </button>
      {!ready && n > 0 && <p className="muted small">{n > cap ? `Max ${cap} players for this game.` : mode === "clash" || mode === "rope" || mode === "spin" ? "Waiting for teams: players pick on their phones. / Menunggu pasukan." : ""}</p>}
      <p className="hp-note">👑 You are the host and a player. Keep this phone open during the game. · Anda hos dan pemain.</p>
    </div>
  );
}

function GamePick({ mode, onPick }: { mode: GameMode; onPick: (m: GameMode) => void }) {
  return (
    <div className="hp-games" role="radiogroup" aria-label="Game">
      {APP_GAMES.map((g) => (
        <button key={g.m} role="radio" aria-checked={mode === g.m} className={mode === g.m ? "on" : ""} onClick={() => onPick(g.m)}>
          <GamePreview mode={g.m} />
          <span>
            {GAME_NAMES[g.m].icon} {GAME_NAMES[g.m].en}
          </span>
        </button>
      ))}
    </div>
  );
}

/** The projector view, inside the host's phone. */
function BigScreen({ game, players }: { game: Game; players: Record<string, Player> }) {
  const feedRaw = useDbValue<Record<string, never>>("feed");
  const feed = (Array.isArray(feedRaw) ? feedRaw : Object.values(feedRaw ?? {})).filter(Boolean);
  const noop = () => {};
  let v = null;
  if (game.mode === "kart") v = <KartView game={game} players={players} feed={feed} onAgain={noop} />;
  else if (game.mode === "clash") v = game.clashFormat === "boss" ? <RaidView game={game} players={players} onAgain={noop} /> : <ClashView game={game} players={players} onAgain={noop} />;
  else if (game.mode === "fish") v = <FishView game={game} players={players} feed={feed} onAgain={noop} />;
  else if (game.mode === "rope") v = <RopeView game={game} players={players} feed={feed} onAgain={noop} />;
  else if (game.mode === "spin") v = <SpinView game={game} players={players} onAgain={noop} />;
  return <div className="big-screen screen">{v}</div>;
}

/** Type a room code. */
export function JoinRoom() {
  const nav = useNav();
  const [c, setC] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="card join app-joinroom"
      onSubmit={async (e) => {
        e.preventDefault();
        const code = c.trim().toUpperCase();
        if (code.length !== 4) return setErr("The code has 4 letters or numbers. / Kod ada 4 aksara.");
        nav(`/play/room/${code}`);
      }}
    >
      <div className="bi title">
        <div className="en">Join a room</div>
        <div className="ms">Sertai bilik</div>
      </div>
      <label className="field">
        <span>Room code / Kod bilik</span>
        <input className="code-input" value={c} maxLength={4} autoCapitalize="characters" autoComplete="off" inputMode="text" onChange={(e) => setC(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="QK47" />
      </label>
      <p className="muted small-note">Ask the host for the code, or scan the QR on their phone. / Minta kod daripada hos.</p>
      {err && <p className="error">{err}</p>}
      <button className="big-btn">Join / Sertai</button>
    </form>
  );
}

