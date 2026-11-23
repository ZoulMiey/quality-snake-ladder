import { useEffect, useMemo, useState } from "react";
import { ref, set, remove, serverTimestamp, isEvent } from "../lib/store.ts";
import { db, ensureSignedIn } from "../lib/firebase.ts";
import Rules from "../components/Rules.tsx";
import KartPhone from "../kart/KartPhone.tsx";
import ClashPhone, { ClashPick } from "../clash/ClashPhone.tsx";
import RaidPhone, { RaidPick } from "../clash/RaidPhone.tsx";
import { useDbValue } from "../lib/useDb.ts";
import SnakePhone from "./SnakePhone.tsx";
import FishPhone from "../fish/FishPhone.tsx";
import RopePhone from "../rope/RopePhone.tsx";
import { RopePick } from "../rope/RopeLobby.tsx";
import SpinPhone from "../spin/SpinPhone.tsx";
import { SpinPick } from "../spin/SpinLobby.tsx";
import { MAX_PLAYERS, hasPiece, tokenById } from "../lib/tokens.ts";
import { unlockAudio } from "../lib/sound.ts";
import { fixState, type Game, type GameMode, type Player, type PlayerState } from "../lib/types.ts";
import Header, { GAME_NAMES } from "../components/Header.tsx";
import { leaveFullscreen } from "../lib/fullscreen.ts";
import GamePreview from "../components/GamePreview.tsx";

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
  const [exited, setExited] = useState(false);
  // The game this phone exited (its goAt): "Back to the game" stays until the host starts another one.
  const [exitedFor, setExitedFor] = useState<number | null>(null);
  // 🏠 Home (event phones): the game this phone left to wait for the host (its goAt), and the "are you sure?" box.
  const [homeFor, setHomeFor] = useState<number | null>(null);
  const [ask, setAsk] = useState<"home" | "exit" | null>(null);
  useEffect(() => {
    ensureSignedIn()
      .then((u) => setUid(u.uid))
      .catch(() => setErr("Cannot connect. Check your internet and reload this page."));
  }, []);

  const game = useDbValue<Game>(uid ? "game" : null);
  const me = useDbValue<Player>(uid ? `players/${uid}` : null);
  const players = useDbValue<Record<string, Player>>(uid ? "players" : null);
  const stateRaw = useDbValue<PlayerState>(uid ? `state/${uid}` : null);
  const state = useMemo(() => fixState(stateRaw), [stateRaw]);

  // Exit keeps this phone's sign-in, so joining again is the same player (signing out made a second copy of
  // the player after "Play again", which keeps the players). Back in the lobby, Exit also leaves the game;
  // the database only allows that in the lobby, so on the end screen the player stays listed until the next game.
  async function exit() {
    leaveFullscreen();
    setExited(true);
    setExitedFor(game && game.status !== "lobby" ? (game.goAt ?? 0) : null);
    if (uid && (!game || game.status === "lobby")) {
      await remove(ref(db, `clash/pick/${uid}`)).catch(() => {});
      await remove(ref(db, `players/${uid}`)).catch(() => {});
    }
  }

  const gameKey = game?.goAt ?? 0;
  const inGame = !!(uid && me && game && game.status !== "lobby" && !exited);
  const atHome = inGame && homeFor === gameKey;
  const showBar = inGame && !atHome && isEvent();
  // While a game is running, Home and ✕ ask first; on the end screen they go straight away.
  const playing = game?.status === "playing";
  const home = () => {
    leaveFullscreen();
    setHomeFor(gameKey);
  };
  const goHome = () => (playing ? setAsk("home") : home());
  const goExit = () => (playing ? setAsk("exit") : void exit());

  // Thank-you screen at the event (owner, 23 Nov 2026): Back to the game while it is still on, Home = wait for the host.
  const canBack = !!(me && game && game.status !== "lobby" && exitedFor !== null && (game.goAt ?? 0) === exitedFor);
  let body;
  if (exited && isEvent())
    body = (
      <div className="card center won bye">
        <div className="trophy">👋</div>
        <Bi en="Thank you for playing!" ms="Terima kasih kerana bermain!" className="title" />
        {canBack && (
          <button
            className="big-btn"
            onClick={() => {
              setExited(false);
              setHomeFor(null);
            }}
          >
            ↩ Back to the game / Kembali ke permainan
          </button>
        )}
        <button
          className={`big-btn ${canBack ? "alt" : ""}`}
          onClick={() => {
            setExited(false);
            setHomeFor(game && game.status !== "lobby" ? (game.goAt ?? 0) : null);
          }}
        >
          🏠 Home / Utama
        </button>
        <p className="muted small-note">You can close this page now. / Anda boleh tutup halaman ini.</p>
      </div>
    );
  else if (exited)
    body = (
      <div className="card center won">
        <div className="trophy">👋</div>
        <Bi en="Thank you for playing!" ms="Terima kasih kerana bermain!" className="title" />
        <p className="muted">You can close this page now. / Anda boleh tutup halaman ini.</p>
        <button className="big-btn" onClick={() => location.reload()}>
          Join a new game / Sertai permainan baharu
        </button>
      </div>
    );
  else if (err) body = <p className="card error">{err}</p>;
  else if (!uid || game === undefined || me === undefined || players === undefined) body = <p className="card muted">Connecting… / Menyambung…</p>;
  else if (!me) {
    if (game && game.status !== "lobby")
      body = (
        <div className="card center">
          <Bi en="The game has already started." ms="Permainan sudah bermula." />
          <p className="muted">Please wait for the next game. / Sila tunggu permainan seterusnya.</p>
        </div>
      );
    else body = <JoinForm count={Object.keys(players ?? {}).length} />;
  } else if (atHome)
    body = <HomeWait me={me} game={game!} onBack={game!.status === "playing" ? () => setHomeFor(null) : undefined} />;
  else if (!game || game.status === "lobby")
    body = (
      <>
        {game?.mode === "clash" && game.clashFormat === "boss" && <RaidPick uid={uid} />}
        {game?.mode === "rope" && <RopePick uid={uid} />}
        {game?.mode === "spin" && <SpinPick uid={uid} />}
        {game?.mode === "clash" && game.clashFormat !== "boss" && <ClashPick uid={uid} format={game.clashFormat === "solo" ? "solo" : "team"} key={game.clashFormat ?? "team"} />}
        <Lobby uid={uid} me={me} mode={game?.mode} variant={game?.clashFormat} />
      </>
    );
  else if (game.mode === "clash" && game.clashFormat === "boss") body = <RaidPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "clash") body = <ClashPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "kart") body = <KartPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "fish") body = <FishPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "rope") body = <RopePhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "spin") body = <SpinPhone uid={uid} me={me} game={game} onExit={exit} />;
  else body = <SnakePhone uid={uid} me={me} game={game} state={state ?? null} onExit={exit} />;

  return (
    <div className="phone">
      <Header small mode={game?.mode} onHome={showBar ? goHome : undefined} onExit={showBar ? goExit : undefined} />
      {showBar && game?.mode === "kart" && (
        <button type="button" className="gb-btn gb-kart" onClick={goHome} aria-label="Home / Utama">
          🏠
        </button>
      )}
      <main className="phone-main">{body}</main>
      {ask && (
        <div className="modal-back gb-ask" role="dialog" aria-modal="true">
          <div className="gb-card">
            <Bi en={ask === "home" ? "Leave this game?" : "Exit the game?"} ms={ask === "home" ? "Tinggalkan permainan ini?" : "Keluar dari permainan?"} className="title" />
            <p className="muted">
              {ask === "home"
                ? "You will wait for the host and join the next game. / Anda akan menunggu hos dan menyertai permainan seterusnya."
                : "You will leave the games. / Anda akan keluar dari permainan."}
            </p>
            <button
              className="big-btn"
              onClick={() => {
                const a = ask;
                setAsk(null);
                if (a === "home") home();
                else void exit();
              }}
            >
              {ask === "home" ? "🏠 Yes, go Home / Ya, ke Utama" : "✕ Yes, exit / Ya, keluar"}
            </button>
            <button className="link-btn" onClick={() => setAsk(null)}>
              Stay in the game / Kekal dalam permainan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** 🏠 Home during or after a game: the phone waits for the host's next game (the player stays in the list). */
function HomeWait({ me, game, onBack }: { me: Player; game: Game; onBack?: () => void }) {
  const t = tokenById(me.token);
  return (
    <div className="card center lobby-me">
      <LobbyPreview />
      <div className="me-piece" style={{ ["--c" as string]: t.color }}>
        {t.emoji}
      </div>
      <h2>{me.name}</h2>
      <Bi en="Waiting for the host to start the next game…" ms="Menunggu hos memulakan permainan seterusnya…" />
      <p className="muted">
        {game.status === "playing" ? "A game is being played. Watch the big screen. / Permainan sedang berlangsung. Lihat skrin besar." : "Watch the big screen. / Lihat skrin besar."}
      </p>
      {onBack && (
        <button className="big-btn" onClick={onBack}>
          ↩ Back to the game / Kembali ke permainan
        </button>
      )}
    </div>
  );
}

function JoinForm({ count }: { count: number }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("qsl-name") ?? "";
    } catch {
      return "";
    }
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const full = count >= MAX_PLAYERS;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    unlockAudio();
    const n = name.trim().replace(/\s+/g, " ");
    if (!n) return setMsg("Please type your name. / Sila taip nama anda.");
    setBusy(true);
    setMsg("");
    try {
      const { uid } = await ensureSignedIn();
      // No piece yet: the projector gives everyone a random piece when the game starts.
      await set(ref(db, `players/${uid}`), { name: n.slice(0, 20), token: "", joinedAt: serverTimestamp() });
      try {
        localStorage.setItem("qsl-name", n);
      } catch {}
    } catch {
      setMsg("Could not join. The game may have started already. / Tidak dapat menyertai.");
    }
    setBusy(false);
  }

  if (full)
    return (
      <div className="card center">
        <Bi en={`The game is full (${MAX_PLAYERS} players).`} ms={`Permainan sudah penuh (${MAX_PLAYERS} pemain).`} />
      </div>
    );

  return (
    <form className="card join" onSubmit={submit}>
      <Bi en="Join the game" ms="Sertai permainan" className="title" />
      <label className="field">
        <span>Your name / Nama anda</span>
        <input id="name" value={name} maxLength={20} autoComplete="given-name" onChange={(e) => setName(e.target.value)} placeholder="e.g. Aina" />
      </label>
      <p className="muted small-note">You get a random piece when the game starts. / Anda akan diberi buah secara rawak apabila permainan bermula.</p>
      {msg && <p className="error">{msg}</p>}
      <button className="big-btn" disabled={busy}>
        {busy ? "Joining…" : "Join / Sertai"}
      </button>
    </form>
  );
}

function Lobby({ uid, me, mode, variant }: { uid: string; me: Player; mode?: GameMode; variant?: string }) {
  const got = hasPiece(me.token);
  const t = tokenById(me.token);
  async function leave() {
    await remove(ref(db, `players/${uid}`)).catch(() => {});
  }
  return (
    <div className="card center lobby-me">
      <LobbyPreview mode={mode} />
      <div className={`me-piece ${got ? "" : "unknown"}`} style={{ ["--c" as string]: t.color }}>
        {t.emoji}
      </div>
      <h2>{me.name}</h2>
      {!got && <Bi en="Your piece is given at random when the game starts." ms="Buah anda diberi secara rawak apabila permainan bermula." className="piece-note" />}
      {mode ? (
        <>
          <Bi en="You're in! Watch the big screen. The game starts soon." ms="Anda sudah masuk! Lihat skrin besar. Permainan akan bermula." />
          <Rules compact mode={mode} variant={variant} />
        </>
      ) : (
        <Bi en="You're in! Waiting for the host to choose a game…" ms="Anda sudah masuk! Menunggu hos memilih permainan…" />
      )}
      <div className="row-btns">
        <button className="link-btn" onClick={leave}>
          Leave
        </button>
      </div>
    </div>
  );
}

/**
 * The game's moving preview on the phone (owner, Nov 2026). Before the host picks a game, the phone shows
 * each game in turn, about 4 seconds each.
 */
const ALL_GAMES = Object.keys(GAME_NAMES) as GameMode[];
function LobbyPreview({ mode }: { mode?: GameMode }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (mode) return;
    const id = setInterval(() => setI((n) => (n + 1) % ALL_GAMES.length), 4000);
    return () => clearInterval(id);
  }, [mode]);
  const show = mode ?? ALL_GAMES[i];
  const name = GAME_NAMES[show];
  return (
    <div className={`lobby-preview ${mode ? "" : "cycling"}`}>
      {!mode && <div className="lp-label">Games today · Permainan hari ini</div>}
      <GamePreview mode={show} key={show} />
      <div className="lp-name">
        <b>
          {name.icon} {name.en}
        </b>
        <span>{name.ms}</span>
      </div>
    </div>
  );
}
