import { useEffect, useMemo, useState } from "react";
import { ref, set, remove, serverTimestamp } from "firebase/database";
import { auth, db, ensureSignedIn } from "../lib/firebase.ts";
import { signOut } from "firebase/auth";
import Rules from "../components/Rules.tsx";
import KartPhone from "../kart/KartPhone.tsx";
import ClashPhone, { ClashPick } from "../clash/ClashPhone.tsx";
import RaidPhone, { RaidPick } from "../clash/RaidPhone.tsx";
import { useDbValue } from "../lib/useDb.ts";
import SnakePhone from "./SnakePhone.tsx";
import { MAX_PLAYERS, hasPiece, tokenById } from "../lib/tokens.ts";
import { unlockAudio } from "../lib/sound.ts";
import { fixState, type Game, type GameMode, type Player, type PlayerState } from "../lib/types.ts";
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
  const [exited, setExited] = useState(false);
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

  async function exit() {
    setExited(true);
    await signOut(auth).catch(() => {});
  }

  let body;
  if (exited)
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
  } else if (!game || game.status === "lobby")
    body = (
      <>
        {game?.mode === "clash" && game.clashFormat === "boss" && <RaidPick uid={uid} />}
        {game?.mode === "clash" && game.clashFormat !== "boss" && <ClashPick uid={uid} format={game.clashFormat === "solo" ? "solo" : "team"} key={game.clashFormat ?? "team"} />}
        <Lobby uid={uid} me={me} mode={game?.mode} variant={game?.clashFormat} />
      </>
    );
  else if (game.mode === "clash" && game.clashFormat === "boss") body = <RaidPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "clash") body = <ClashPhone uid={uid} me={me} game={game} onExit={exit} />;
  else if (game.mode === "kart") body = <KartPhone uid={uid} me={me} game={game} onExit={exit} />;
  else body = <SnakePhone uid={uid} me={me} game={game} state={state ?? null} onExit={exit} />;

  return (
    <div className="phone">
      <Header small mode={game?.mode} />
      <main className="phone-main">{body}</main>
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
