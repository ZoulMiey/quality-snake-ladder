// Quality Games app (owner, Nov 2026; draft https://claude.ai/artifact/F2eyqM2djvd5u3BGS1M9av, home option A).
// /play = the games; /play/{game} = the game's page (Play solo, Play with friends, high scores);
// /play/{game}/solo = a solo game on this phone; /play/room/{CODE} = a room with friends.
// The event (projector "/" and "/join") is separate and unchanged.
import { useEffect, useState } from "react";
import Header, { GAME_NAMES } from "../components/Header.tsx";
import GamePreview from "../components/GamePreview.tsx";
import Rules from "../components/Rules.tsx";
import { unlockAudio } from "../lib/sound.ts";
import type { GameMode } from "../lib/types.ts";
import type { AppSet } from "../lib/pubQuestions.ts";
import { getNick, googleSignIn, googleSignOut, setNick, useAccount } from "./profile.ts";
import { SCORE_LABEL, fmtScore, personalBest, topScores, type Entry, type ScoreKey } from "./scores.ts";
import Solo from "./Solo.tsx";
import Room, { JoinRoom } from "./Room.tsx";

export const APP_GAMES: { m: GameMode; en: string; ms: string }[] = [
  { m: "snake", en: "Answer to roll the dice. Climb ladders, dodge snakes and race to box 100!", ms: "Jawab untuk baling dadu. Panjat tangga, elak ular dan lumba ke petak 100!" },
  { m: "kart", en: "Tilt your phone to steer. Right answers give you turbo. Race 3 laps!", ms: "Condongkan telefon untuk memandu. Jawapan betul beri turbo. Lumba 3 pusingan!" },
  { m: "clash", en: "Monster battles! Right answers make your monster attack.", ms: "Pertarungan raksasa! Jawapan betul membuat raksasa anda menyerang." },
  { m: "fish", en: "Answer to catch fish. Big fish, golden fish: the heaviest catch wins!", ms: "Jawab untuk tangkap ikan. Tangkapan paling berat menang!" },
  { m: "rope", en: "Answer right to pull the rope. Beat the river current to your bank!", ms: "Jawab betul untuk menarik tali. Lawan arus sungai ke tebing anda!" },
  { m: "spin", en: "Answer, flick your phone to spin the wheel and guess the quality phrase!", ms: "Jawab, lontar telefon untuk memutar roda dan teka frasa kualiti!" },
];
const MODES = APP_GAMES.map((g) => g.m);
/** What a solo game is, per game (shown on the game's page). */
const SOLO_WHAT: Record<GameMode, { en: string; ms: string }> = {
  snake: { en: "Race to box 100 alone: as fast as you can.", ms: "Lumba ke petak 100 sendirian, sepantas mungkin." },
  kart: { en: "Time trial: 3 laps of Coastal Wave.", ms: "Cubaan masa: 3 pusingan Coastal Wave." },
  clash: { en: "Boss Raid alone: defeat the Defect Titan as fast as you can.", ms: "Serangan Bos sendirian: kalahkan Gergasi Kecacatan sepantas mungkin." },
  fish: { en: "5 minutes: catch the heaviest load.", ms: "5 minit: tangkap seberat mungkin." },
  rope: { en: "Beat the current: the river pulls harder each minute. Reach your bank!", ms: "Lawan arus: sungai menarik makin kuat setiap minit. Sampai ke tebing anda!" },
  spin: { en: "Your own wheel and phrases: most points in 3 or 5 minutes.", ms: "Roda dan frasa anda sendiri: mata tertinggi dalam 3 atau 5 minit." },
};
export const scoreKey = (m: GameMode, mins: 3 | 5): ScoreKey => (m === "spin" ? (mins === 3 ? "spin3" : "spin5") : (m as ScoreKey));

type Route = { page: "home" } | { page: "game"; m: GameMode } | { page: "solo"; m: GameMode; set: AppSet; mins: 3 | 5 } | { page: "room"; code: string } | { page: "join" };
function parse(path: string, search = location.search): Route {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean); // ["play", ...]
  const p = new URLSearchParams(search);
  if (parts[1] === "room" && parts[2]) return { page: "room", code: parts[2].toUpperCase() };
  if (parts[1] === "join") return { page: "join" };
  const m = parts[1] as GameMode;
  if (MODES.includes(m) && parts[2] === "solo") return { page: "solo", m, set: p.get("set") === "mix" ? "mix" : "quality", mins: p.get("mins") === "3" ? 3 : 5 };
  if (MODES.includes(m)) return { page: "game", m };
  return { page: "home" };
}

export function useNav() {
  return (to: string) => {
    history.pushState({}, "", to);
    window.dispatchEvent(new Event("qsl-nav"));
  };
}

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parse(location.pathname));
  const [nick, setNickState] = useState(getNick());
  useEffect(() => {
    const on = () => setRoute(parse(location.pathname));
    window.addEventListener("popstate", on);
    window.addEventListener("qsl-nav", on);
    return () => {
      window.removeEventListener("popstate", on);
      window.removeEventListener("qsl-nav", on);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  if (!nick)
    return (
      <Shell>
        <NickForm
          onDone={(n) => {
            setNick(n);
            setNickState(getNick());
          }}
        />
      </Shell>
    );
  if (route.page === "solo") return <Solo m={route.m} set={route.set} mins={route.mins} nick={nick} />;
  if (route.page === "room") return <Room code={route.code} nick={nick} />;
  return (
    <Shell nick={nick} onNick={(n) => (setNick(n), setNickState(getNick()))}>
      {route.page === "home" && <Home />}
      {route.page === "game" && <GamePage m={route.m} nick={nick} />}
      {route.page === "join" && <JoinRoom />}
    </Shell>
  );
}

function Shell({ children, nick, onNick }: { children: React.ReactNode; nick?: string; onNick?: (n: string) => void }) {
  const acc = useAccount();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signErr, setSignErr] = useState("");
  const nav = useNav();
  return (
    <div className="phone app">
      <Header small>
        {nick && (
          <div className="app-me">
            <button className="app-chip" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
              {acc.google ? "✅" : "👤"} {nick} ✎
            </button>
          </div>
        )}
      </Header>
      {editing && nick && onNick && (
        <div className="app-profile">
          <NickForm
            initial={nick}
            small
            onDone={(n) => {
              onNick(n);
              setEditing(false);
            }}
          />
          {acc.google ? (
            <p className="app-acc">
              ✅ Signed in: your scores go on the high score lists. <button className="link-btn" onClick={() => void googleSignOut()}>Sign out / Log keluar</button>
            </p>
          ) : (
            <div className="app-acc">
              <p>👤 Guest: you keep your personal records. Sign in to go on the high score lists. / Tetamu: log masuk untuk senarai markah tertinggi.</p>
              <button
                className="big-btn google-btn"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setSignErr("");
                  try {
                    await googleSignIn();
                  } catch {
                    setSignErr("Could not sign in. Please try again. / Tidak dapat log masuk.");
                  }
                  setBusy(false);
                }}
              >
                <span className="g">G</span> Sign in with Google
              </button>
              {signErr && <p className="error">{signErr}</p>}
            </div>
          )}
        </div>
      )}
      <main className="phone-main app-main">
        {children}
        <button className="link-btn app-home" onClick={() => nav("/play")}>
          🏠 Quality Games
        </button>
      </main>
    </div>
  );
}

function NickForm({ onDone, initial = "", small }: { onDone: (n: string) => void; initial?: string; small?: boolean }) {
  const [n, setN] = useState(initial);
  const [err, setErr] = useState("");
  return (
    <form
      className={`card join app-nick ${small ? "small" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        unlockAudio();
        const v = n.trim();
        if (!v) return setErr("Please type a nickname. / Sila taip nama panggilan.");
        onDone(v);
      }}
    >
      {!small && <Bi en="Welcome to Quality Games!" ms="Selamat datang ke Permainan Kualiti!" className="title" />}
      <label className="field">
        <span>Your nickname / Nama panggilan</span>
        <input value={n} maxLength={20} onChange={(e) => setN(e.target.value)} placeholder="e.g. Aina" autoComplete="nickname" />
      </label>
      <p className="muted small-note">Shown on the high score lists. / Dipaparkan pada senarai markah tertinggi.</p>
      {err && <p className="error">{err}</p>}
      <button className="big-btn">{small ? "Save / Simpan" : "Let's play! / Jom main!"}</button>
    </form>
  );
}

/** Install the app: Android shows the browser's prompt; iPhone gets the Share → Add to Home Screen tip. */
function InstallTip() {
  const [evt, setEvt] = useState<Event & { prompt?: () => void } | null>(null);
  const [hidden, setHidden] = useState(() => matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true);
  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault();
      setEvt(e as Event & { prompt?: () => void });
    };
    window.addEventListener("beforeinstallprompt", on);
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);
  if (hidden) return null;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <div className="app-install">
      <b>📲</b>
      {evt ? (
        <button
          className="link-btn"
          onClick={() => {
            evt.prompt?.();
            setHidden(true);
          }}
        >
          Install the app · Pasang aplikasi
        </button>
      ) : (
        <span>{ios ? "Install: tap Share, then “Add to Home Screen”." : "Install: open the browser menu, then “Add to Home screen”."} · Pasang aplikasi</span>
      )}
      <button className="app-x" aria-label="Hide" onClick={() => setHidden(true)}>
        ×
      </button>
    </div>
  );
}

function Home() {
  const nav = useNav();
  return (
    <>
      <InstallTip />
      <div className="app-title">
        <h1>
          Choose a game <span>Pilih permainan</span>
        </h1>
        <button className="btn app-joinbtn" onClick={() => nav("/play/join")}>
          👥 Join a room
        </button>
      </div>
      <div className="app-list">
        {APP_GAMES.map((g) => (
          <button key={g.m} className="app-card" onClick={() => nav(`/play/${g.m}`)}>
            <GamePreview mode={g.m} />
            <span className="ac-text">
              <b>
                {GAME_NAMES[g.m].icon} {GAME_NAMES[g.m].en}
              </b>
              <small>{GAME_NAMES[g.m].ms}</small>
              <span>{g.en}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function GamePage({ m, nick }: { m: GameMode; nick: string }) {
  const nav = useNav();
  const acc = useAccount();
  const info = APP_GAMES.find((g) => g.m === m)!;
  const [set, setSet] = useState<AppSet>(() => (localStorage.getItem("qsl-set") === "mix" ? "mix" : "quality"));
  const [mins, setMins] = useState<3 | 5>(5);
  const [which, setWhich] = useState<"today" | "all">("today");
  const key = scoreKey(m, mins);
  const [list, setList] = useState<Entry[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true;
    setList(null);
    setErr(false);
    topScores(key, set, which)
      .then((l) => live && setList(l))
      .catch(() => live && (setErr(true), setList([])));
    return () => {
      live = false;
    };
  }, [key, set, which]);
  const pb = personalBest(key, set);
  const [creating, setCreating] = useState(false);
  return (
    <div className="app-game">
      <button className="link-btn app-back" onClick={() => nav("/play")}>
        ← All games / Semua permainan
      </button>
      <div className="app-hero">
        <GamePreview mode={m} big />
      </div>
      <h1 className="app-gname">
        {GAME_NAMES[m].icon} {GAME_NAMES[m].en} <span>{GAME_NAMES[m].ms}</span>
      </h1>
      <p className="app-desc">
        {info.en}
        <br />
        <span className="muted">{info.ms}</span>
      </p>
      <div className="app-opts">
        <div className="seg" role="radiogroup" aria-label="Questions">
          {(["quality", "mix"] as const).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={set === s}
              className={set === s ? "on" : ""}
              onClick={() => {
                setSet(s);
                try {
                  localStorage.setItem("qsl-set", s);
                } catch {}
              }}
            >
              {s === "quality" ? "✅ Quality" : "🎲 Mix"}
              <small>{s === "quality" ? "Kualiti" : "Campuran"}</small>
            </button>
          ))}
        </div>
        {m === "spin" && (
          <div className="seg" role="radiogroup" aria-label="Time">
            {([3, 5] as const).map((t) => (
              <button key={t} role="radio" aria-checked={mins === t} className={mins === t ? "on" : ""} onClick={() => setMins(t)}>
                ⏱ {t} min
                <small>{t} minit</small>
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="big-btn app-solo" onClick={() => nav(`/play/${m}/solo?set=${set}&mins=${mins}`)}>
        👤 Play solo · Main sendiri
        <small>{SOLO_WHAT[m].en}</small>
      </button>
      <div className="app-friends">
        <button className="big-btn alt" disabled={creating} onClick={() => (setCreating(true), nav(`/play/room/NEW?m=${m}&set=${set}`))}>
          👥 Create a room
          <small>Play with friends · Main dengan kawan</small>
        </button>
        <button className="big-btn alt" onClick={() => nav("/play/join")}>
          🔑 Join a room
          <small>Have a code? · Ada kod?</small>
        </button>
      </div>
      <section className="app-hs">
        <h2>
          🏆 High scores <span>Markah tertinggi</span>
        </h2>
        <p className="muted small">
          {SCORE_LABEL[key].en} · {set === "quality" ? "Quality" : "Mix"}
        </p>
        <div className="seg small" role="tablist">
          {(["today", "all"] as const).map((w) => (
            <button key={w} role="tab" aria-selected={which === w} className={which === w ? "on" : ""} onClick={() => setWhich(w)}>
              {w === "today" ? "Today · Hari ini" : "All time · Sepanjang masa"}
            </button>
          ))}
        </div>
        {list === null ? (
          <p className="muted">Loading… / Memuatkan…</p>
        ) : list.length ? (
          <ol className="app-top">
            {list.map((e, i) => (
              <li key={e.uid} className={e.uid === acc.uid ? "me" : ""}>
                <span>{i + 1}</span>
                <span>{e.n}</span>
                <b>{fmtScore(key, e.v)}</b>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">{err ? "High scores are not available right now." : "No scores yet. Be the first! / Belum ada markah. Jadilah yang pertama!"}</p>
        )}
        <p className="app-pb">
          ⭐ Your record / Rekod anda: <b>{pb === null ? "–" : fmtScore(key, pb)}</b>
        </p>
        {!acc.google && <p className="muted small">👤 Guests keep a personal record only. Tap your name ({nick} ✎) to sign in with Google and join the lists.</p>}
      </section>
      <section className="app-rules">
        <h2>
          How to play <span>Cara bermain</span>
        </h2>
        <Rules compact mode={m} variant={m === "clash" ? "boss" : undefined} />
      </section>
    </div>
  );
}

