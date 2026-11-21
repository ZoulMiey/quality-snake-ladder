import EndButtons, { EndActionsContext, type EndActions } from "../components/EndButtons.tsx";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { get, ref, set, update } from "firebase/database";
import { db, ensureSignedIn, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { winnersNeeded } from "../lib/rules.ts";
import { Engine, QUESTION_MS, playAgain, removePlayer, resetGame } from "../lib/engine.ts";
import { tokenById, MAX_PLAYERS, assignPieces, gameMaxPlayers } from "../lib/tokens.ts";
import { isMuted, setMuted, sfx, unlockAudio } from "../lib/sound.ts";
import Board, { type BoardPiece } from "../components/Board.tsx";
import Header, { GAME_NAMES } from "../components/Header.tsx";
import { KartEngine } from "../kart/engine.ts";
import KartView from "../kart/KartView.tsx";
import { ClashEngine } from "../clash/engine.ts";
import { BossEngine } from "../clash/bossEngine.ts";
import RaidView from "../clash/RaidView.tsx";
import { FishEngine } from "../fish/engine.ts";
import FishView from "../fish/FishView.tsx";
import { RopeEngine } from "../rope/engine.ts";
import RopeView from "../rope/RopeView.tsx";
import { RopeRoster, useRopeSides } from "../rope/RopeLobby.tsx";
import { SpinEngine } from "../spin/engine.ts";
import SpinView from "../spin/SpinView.tsx";
import { SpinRoster, useSpinTeams } from "../spin/SpinLobby.tsx";
import ClashView from "../clash/ClashView.tsx";
import { ClashFormatPick, ClashRoster, useLineUp } from "../clash/ClashLobby.tsx";
import Qr from "../components/Qr.tsx";
import Countdown from "../components/Countdown.tsx";
import Rules from "../components/Rules.tsx";
import GamePreview from "../components/GamePreview.tsx";
import { QSETS, poolFor, type QChoice } from "../lib/questionSets.ts";
import { eventById } from "../lib/specials.ts";
import { DiceRoll } from "../components/Dice.tsx";
import { SL_ALERT_MS } from "../lib/phoneTiming.ts";
import {
  ALERT_TEXT,
  CARD_LINGER_MS,
  MAX_CARDS,
  SPOTLIGHT_MAX_PLAYERS,
  currentMoments,
  isMomentOutcome,
  verdictText,
  verdictTimes,
  type Moment,
  type Verdict,
} from "../lib/moments.ts";
import QuestionManager, { seedQuestionsIfEmpty } from "../components/QuestionManager.tsx";
import { fixStates, type FeedItem, type Game, type GameMode, type Player, type PlayerState, type Question } from "../lib/types.ts";

/** The referee for the chosen game, with sounds on the projector for the race. */
type AnyEngine = Engine | KartEngine | ClashEngine | BossEngine | FishEngine | RopeEngine | SpinEngine;
function makeEngine(mode: GameMode | undefined, tab: string, format?: string): AnyEngine {
  if (mode === "clash") return format === "boss" ? new BossEngine(tab) : new ClashEngine(tab);
  if (mode === "fish") return new FishEngine(tab);
  if (mode === "rope") return new RopeEngine(tab);
  if (mode === "spin") return new SpinEngine(tab);
  if (mode !== "kart") return new Engine(tab);
  const e = new KartEngine(tab);
  e.onEvent = (ev) => {
    if (ev.type === "finish") sfx.win();
    else if (ev.type === "spin") sfx.wrong();
    else if (ev.type === "pickup") sfx.join();
    else if (ev.type === "item") ev.item === "audit" ? sfx.snake() : ev.item === "turbo" ? sfx.ladder() : sfx.join();
  };
  return e;
}

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
  const engine = useRef<AnyEngine | null>(null);
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
      const e = makeEngine(game?.mode, tabId, game?.clashFormat);
      engine.current = e;
      e.resume().catch((err) => {
        console.error("Could not resume the game", err);
        engine.current = null;
      });
    }
    if (!iRun && engine.current) {
      engine.current.stop();
      engine.current = null;
    }
  }, [iRun]);
  useEffect(() => () => engine.current?.stop(), []);

  // Sounds and highlight when pieces move.
  const lastSeq = useRef<Record<string, number>>({});
  // A piece that lands on a quality event box stops there for a moment before moving on.
  const [hop, setHop] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!states) return;
    for (const [uid, st] of Object.entries(states)) {
      const prev = lastSeq.current[uid];
      lastSeq.current[uid] = st.seq;
      if (prev === undefined || prev === st.seq || !st.result) continue;
      setHighlight(uid);
      if (st.result.dice.length) setLastRoll({ uid, seq: st.seq, dice: st.result.dice, bonus: st.result.bonus });
      if (st.result.special && st.result.land) {
        const land = st.result.land;
        const good = (eventById(st.result.special)?.move ?? 0) > 0;
        setHop((h) => ({ ...h, [uid]: land }));
        setTimeout(() => (good ? sfx.correct() : sfx.wrong()), 1100);
        setTimeout(
          () =>
            setHop((h) => {
              const n = { ...h };
              delete n[uid];
              return n;
            }),
          1500,
        );
      }
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

  // Fishing Derby writes the feed one item at a time (feed/{n}); the database then returns a list with gaps.
  const feed: FeedItem[] = (Array.isArray(feedRaw) ? feedRaw : Object.values(feedRaw ?? {})).filter(Boolean);
  const enabledQs = Object.values(questions ?? {}).filter((q) => q.enabled).length;
  const qsetCounts = useMemo(() => Object.fromEntries(QSETS.map((s) => [s.id, poolFor(questions, s.id).length])) as Record<QChoice, number>, [questions]);

  async function start() {
    unlockAudio();
    setMsg("");
    const e = makeEngine(game?.mode, tabId, game?.clashFormat);
    try {
      // Everyone gets a different random piece (players who already have one keep it).
      const pieces = assignPieces(players ?? {});
      if (Object.keys(pieces).length) await update(ref(db), Object.fromEntries(Object.entries(pieces).map(([uid, id]) => [`players/${uid}/token`, id])));
      engine.current = e;
      await e.start();
    } catch (err) {
      engine.current = null;
      setMsg((err as Error).message);
    }
  }
  async function takeOver() {
    unlockAudio();
    const e = makeEngine(game?.mode, tabId, game?.clashFormat);
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
      {status !== "ended" && (
        <button className="btn" onClick={() => setConfirm("reset")}>
          New game
        </button>
      )}
      <button className="btn" onClick={toggleSound} aria-pressed={!muted}>
        {muted ? "🔇 Sound off" : "🔊 Sound on"}
      </button>
      <button className="btn" onClick={fullscreen}>
        ⛶ Full screen
      </button>
    </>
  );

  // End-of-game buttons (owner, Nov 2026): New game = same game with new players; Change game = back to the
  // game list with the same players or with new players.
  const endActions: EndActions = {
    newPlayers: async () => {
      engine.current?.stop();
      engine.current = null;
      await resetGame();
    },
    changeGame: async (samePlayers: boolean) => {
      engine.current?.stop();
      engine.current = null;
      if (samePlayers) await playAgain();
      else await resetGame();
      await update(ref(db, "game"), { mode: null, status: "lobby" });
    },
  };

  if (game === undefined || players === undefined) {
    return (
      <div className="screen">
        <Header />
        <p className="muted gate">Loading…</p>
      </div>
    );
  }

  return (
    <EndActionsContext.Provider value={endActions}>
    <div className="screen">
      <Header mode={game?.mode}>{tools}</Header>
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

      {status === "lobby" && (
        <LobbyView
          players={players ?? {}}
          onStart={start}
          enabledQs={enabledQs}
          mode={game?.mode ?? null}
          onMode={(m) => update(ref(db, "game"), { mode: m, status: game?.status ?? "lobby" })}
          clashFormat={game?.clashFormat ?? "team"}
          onClashFormat={(f) => update(ref(db, "game"), { clashFormat: f, status: game?.status ?? "lobby" })}
          qset={game?.qset ?? "quality"}
          qsetCounts={qsetCounts}
          onQset={(q) => update(ref(db, "game"), { qset: q, status: game?.status ?? "lobby" })}
          bossMode={game?.bossMode ?? "ta"}
          onBossMode={(m) => update(ref(db, "game"), { bossMode: m, status: game?.status ?? "lobby" })}
          spinMins={game?.spinMins === 3 ? 3 : 5}
          onSpinMins={(m) => update(ref(db, "game"), { spinMins: m, status: game?.status ?? "lobby" })}
        />
      )}
      {status !== "lobby" && game?.mode === "kart" && <KartView game={game} players={players ?? {}} feed={feed} onAgain={() => playAgain()} />}
      {status !== "lobby" && game?.mode === "clash" && game.clashFormat === "boss" && <RaidView game={game} players={players ?? {}} onAgain={() => playAgain()} />}
      {status !== "lobby" && game?.mode === "clash" && game.clashFormat !== "boss" && <ClashView game={game} players={players ?? {}} onAgain={() => playAgain()} />}
      {status !== "lobby" && game?.mode === "fish" && <FishView game={game} players={players ?? {}} feed={feed} onAgain={() => playAgain()} />}
      {status !== "lobby" && game?.mode === "rope" && (
        <RopeView game={game} players={players ?? {}} feed={feed} onAgain={() => playAgain()} onStartRound={iRun && engine.current instanceof RopeEngine ? () => void (engine.current as RopeEngine).startRoundNow() : undefined} />
      )}
      {status !== "lobby" && game?.mode === "spin" && <SpinView game={game} players={players ?? {}} onAgain={() => playAgain()} />}
      {status !== "lobby" && game?.mode !== "kart" && game?.mode !== "clash" && game?.mode !== "fish" && game?.mode !== "rope" && game?.mode !== "spin" && (
        <GameView game={game!} players={players ?? {}} states={states ?? {}} feed={feed} highlight={highlight} lastRoll={lastRoll} hop={hop} onAgain={() => playAgain()} />
      )}
      {showQs && <QuestionManager onClose={() => setShowQs(false)} />}
    </div>
    </EndActionsContext.Provider>
  );
}

// General descriptions (owner, Nov 2026: no modes like "team" or "1 v 1" here; those are on the game's page).
const GAMES: { m: GameMode; desc: string; ms: string }[] = [
  { m: "snake", desc: "Answer to roll the dice. Climb ladders, dodge snakes and race to the top!", ms: "Jawab untuk baling dadu. Panjat tangga, elak ular dan lumba ke atas!" },
  { m: "kart", desc: "Tilt your phone to steer. Right answers give you turbo. Race to the finish!", ms: "Condongkan telefon untuk memandu. Jawapan betul beri turbo. Lumba ke garisan penamat!" },
  { m: "clash", desc: "Monster battles! Right answers make your monster attack.", ms: "Pertarungan raksasa! Jawapan betul membuat raksasa anda menyerang." },
  { m: "fish", desc: "Answer to catch fish. Big fish, golden fish: the heaviest catch wins!", ms: "Jawab untuk tangkap ikan. Ikan besar, ikan emas: tangkapan paling berat menang!" },
  { m: "rope", desc: "Answer right to pull the rope. Pull the other side into the river!", ms: "Jawab betul untuk menarik tali. Tarik pihak lawan ke dalam sungai!" },
  { m: "spin", desc: "Answer, flick your phone to spin the wheel and guess the quality phrase!", ms: "Jawab, lontar telefon untuk memutar roda dan teka frasa kualiti!" },
];

function LobbyView({
  players,
  onStart,
  enabledQs,
  mode,
  onMode,
  clashFormat,
  onClashFormat,
  bossMode,
  onBossMode,
  spinMins,
  onSpinMins,
  qset,
  qsetCounts,
  onQset,
}: {
  players: Record<string, Player>;
  onStart: () => void;
  enabledQs: number;
  mode: GameMode | null;
  onMode: (m: GameMode | null) => void;
  clashFormat: "team" | "solo" | "boss";
  onClashFormat: (f: "team" | "solo" | "boss") => void;
  bossMode: "ta" | "hs";
  onBossMode: (m: "ta" | "hs") => void;
  spinMins: 3 | 5;
  onSpinMins: (m: 3 | 5) => void;
  qset: QChoice;
  qsetCounts: Record<QChoice, number>;
  onQset: (q: QChoice) => void;
}) {
  const url = `${location.origin}/join`;
  const clash = useLineUp(clashFormat, players);
  const ropeSides = useRopeSides(players);
  const spinTeams = useSpinTeams(players);
  const cap = mode ? gameMaxPlayers(mode, clashFormat) : MAX_PLAYERS;
  const tooMany = list0(players).length > cap;
  const canStart = !!mode && !!list0(players).length && !tooMany && !!enabledQs && (qsetCounts[qset] ?? 0) > 0 && (mode !== "clash" || clash.ready) && (mode !== "rope" || ropeSides.ready) && (mode !== "spin" || spinTeams.ready);
  // Only the 15 players who joined last are listed; the counter shows everyone.
  const all = Object.entries(players).sort((a, b) => (b[1].joinedAt ?? 0) - (a[1].joinedAt ?? 0));
  const list = all.slice(0, LIST_MAX);
  const info = GAMES.find((g) => g.m === mode);
  const fitRef = useFitZoom(mode);
  if (!mode) {
    // Game list on one screen, no scrolling (owner's pick A, Nov 2026): a big QR box as tall as the games, 3 × 2 game cards.
    return (
      <main className="lobby-fitbox" ref={fitRef}>
        <div className="lobby lobby-list gl-a">
          <section className="qr-side gl-qr">
            <Qr text={url} />
            <div className="gl-qr-text">
              <div className="scan">
                <div className="en">Scan to join</div>
                <div className="ms">Imbas untuk menyertai</div>
              </div>
              <div className="url">{url.replace(/^https?:\/\//, "")}</div>
            </div>
          </section>
          <section className="gl-main">
            <h2 className="gl-title">
              Choose a game <span>Pilih permainan</span>
            </h2>
            <div className="gl-grid">
              {GAMES.map((g) => (
                <button key={g.m} className="game-card" onClick={() => onMode(g.m)}>
                  <GamePreview mode={g.m} />
                  <span className="gc-text">
                    <span className="gc-name">
                      {GAME_NAMES[g.m].icon} {GAME_NAMES[g.m].en}
                    </span>
                    <span className="gc-ms">{GAME_NAMES[g.m].ms}</span>
                    <span className="gc-desc">{g.desc}</span>
                    <span className="gc-desc ms">{g.ms}</span>
                  </span>
                  <span className="gc-go" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }
  // The game's page fits one projector screen (owner's tweak of B2): top QR | preview, name, Start | questions, mode, how to play;
  // bottom, across the screen: Red team | Blue team, or the list of players.
  return (
    <main className="lobby-fitbox" ref={fitRef}>
    <div className="lobby lobby-game">
      <section className={`qr-side ${mode ? "plain" : ""}`}>
        <Qr text={url} />
        <div className="scan">
          <div className="en">Scan to join</div>
          <div className="ms">Imbas untuk menyertai</div>
        </div>
        <div className="url">{url.replace(/^https?:\/\//, "")}</div>
      </section>
      <section className="gd-mid">
        <div className="gd-prev">
          <GamePreview mode={mode} big />
        </div>
        <div className="gd-info">
          <div className="gd-name">
            <span className="en">
              {GAME_NAMES[mode].icon} {GAME_NAMES[mode].en}
            </span>
            <span className="ms">{GAME_NAMES[mode].ms}</span>
          </div>
          <p className="gd-desc">{info?.desc}</p>
          <p className="gd-desc ms">{info?.ms}</p>
          <div className="gd-actions">
            <button className="btn gd-change" onClick={() => onMode(null)}>
              ← Change game <span>/ Tukar permainan</span>
            </button>
            <button className="big-btn start" disabled={!canStart} onClick={onStart}>
              ▶ Start game
            </button>
          </div>
        </div>
        {(qsetCounts[qset] ?? 0) === 0 && <p className="waiting">No questions are switched on in this set. Open Questions to switch some on. / Tiada soalan dihidupkan dalam set ini.</p>}
        {tooMany && (
          <p className="waiting too-many">
            {GAME_NAMES[mode].en}
            {mode === "clash" ? ` (${clashFormat === "boss" ? "Boss Raid" : "Team"})` : ""}: max {cap} players ({all.length} joined). Remove players or pick another game. / Maksimum {cap} pemain.
          </p>
        )}
        {mode === "spin" && list.length > 0 && !spinTeams.ready && <p className="waiting">Quality Spin needs at least 1 player on Red and 1 on Blue (3 a team). Players pick on their phones; you can move them here. / Perlu sekurang-kurangnya 1 pemain Merah dan 1 Biru.</p>}
        {mode === "rope" && list.length > 0 && !ropeSides.ready && <p className="waiting">Pull the Rope needs at least 1 player on each side. Players pick on their phones; you can move them here. / Perlu sekurang-kurangnya 1 pemain di setiap pihak.</p>}
        {mode === "clash" && list.length > 0 && !clash.ready && (
          <p className="waiting">
            {clashFormat === "boss" ? "Waiting for at least one player to pick a monster." : clashFormat === "solo" ? "Waiting for one player on Red and one on Blue, each with 3 monsters." : "Waiting for at least one player on each team."} Players pick on their phones.
          </p>
        )}
      </section>
      <section className="gd-right">
        <div className="gd-fit">
        <div className="gd-block">
        <div className="qset-pick">
          <div className="lbl">
            <span className="en">Questions</span>
            <span className="ms">Set soalan</span>
          </div>
          <div className="qset-btns" role="radiogroup" aria-label="Question set">
            {QSETS.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={qset === s.id}
                className={`qset-btn ${qset === s.id ? "on" : ""} ${qsetCounts[s.id] ? "" : "empty"}`}
                onClick={() => onQset(s.id)}
              >
                <span className="en">
                  {s.icon} {s.id === "mix" ? "Mix" : s.en} · {qsetCounts[s.id] ?? 0}
                </span>
                <span className="ms">{s.id === "mix" ? "All except Quality / Campuran" : s.ms}</span>
              </button>
            ))}
          </div>
        </div>
        </div>
        {mode === "clash" && (
          <div className="gd-block">
            <div className="gd-sec">
              Game mode <span>Mod permainan</span>
            </div>
            <ClashFormatPick format={clashFormat} onFormat={onClashFormat} bossMode={bossMode} onBossMode={onBossMode} />
          </div>
        )}
        {mode === "fish" && (
          <div className="qset-pick gd-block">
            <div className="lbl">
              <span className="en">Game mode</span>
              <span className="ms">Mod permainan</span>
            </div>
            <div className="qset-btns" role="radiogroup" aria-label="Fishing mode">
              <button role="radio" aria-checked="true" className="qset-btn on">
                <span className="en">🎣 Open play</span>
                <span className="ms">Everyone vs everyone / Semua lawan semua</span>
              </button>
              <button role="radio" aria-checked="false" className="qset-btn empty" disabled>
                <span className="en">👥 Teams</span>
                <span className="ms">Coming soon / Akan datang</span>
              </button>
            </div>
          </div>
        )}
        {mode === "spin" && (
          <div className="qset-pick gd-block">
            <div className="lbl">
              <span className="en">Game time</span>
              <span className="ms">Masa permainan</span>
            </div>
            <div className="qset-btns" role="radiogroup" aria-label="Game time">
              {([3, 5] as const).map((m) => (
                <button key={m} role="radio" aria-checked={spinMins === m} className={`qset-btn ${spinMins === m ? "on" : ""}`} onClick={() => onSpinMins(m)}>
                  <span className="en">⏱ {m} minutes</span>
                  <span className="ms">{m} minit · most points wins / mata tertinggi menang</span>
                </button>
              ))}
              <button role="radio" aria-checked="false" className="qset-btn empty" disabled>
                <span className="en">👤 Solo high score</span>
                <span className="ms">Coming soon / Akan datang</span>
              </button>
            </div>
          </div>
        )}
        <div className="gd-block">
          <div className="gd-sec">
            How to play <span>Cara bermain</span>
          </div>
          <Rules mode={mode} variant={mode === "clash" ? clashFormat : undefined} />
        </div>
        </div>
      </section>
      <section className="gd-players">
        <div className="lobby-head">
          <h2>
            Players <span className="ms">Pemain</span>
          </h2>
          <span className="count">
            {all.length}/{cap}
          </span>
        </div>
        <div className="gd-plist">
        {!list.length && <p className="waiting">Waiting for players to scan the QR code… / Menunggu pemain…</p>}
        {mode === "clash" && list.length > 0 && <ClashRoster format={clashFormat} players={players} />}
        {mode === "rope" && list.length > 0 && <RopeRoster players={players} />}
        {mode === "spin" && list.length > 0 && <SpinRoster players={players} />}
        {mode !== "rope" && mode !== "clash" && mode !== "spin" && (
          <ul className="lobby-players">
            {list.map(([uid, p]) => {
              const t = tokenById(p.token);
              return (
                <li key={uid} style={{ ["--c" as string]: t.color }}>
                  <span className="lp-emoji">{t.emoji}</span>
                  <span className="lp-name">{p.name}</span>
                  <button className="x" aria-label={`Remove ${p.name}`} onClick={() => removePlayer(uid)}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {mode !== "rope" && mode !== "clash" && mode !== "spin" && all.length > list.length && (
          <p className="more-players">
            + {all.length - list.length} more / lagi
          </p>
        )}
        </div>
      </section>
    </div>
    </main>
  );
}

/**
 * Scales the whole game page (CSS zoom) so it exactly fills the screen: bigger on a big screen, smaller
 * on a small one or with many players, so there is no empty space and no scrolling. Refits when players
 * join or leave and when the window changes size.
 */
function useFitZoom(key: unknown) {
  const el = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const box = el.current;
    const inner = box?.firstElementChild as HTMLElement | null;
    if (!box || !inner) return;
    let busy = false;
    const fits = (z: number) => {
      inner.style.zoom = String(z);
      // The page's full height (unzoomed, so × z), including anything that would spill out.
      return Math.max(inner.scrollHeight, inner.offsetHeight) * z <= box.clientHeight + 1;
    };
    const fit = () => {
      if (busy) return;
      busy = true;
      if (window.innerWidth < 1100) {
        inner.style.zoom = "1";
      } else {
        let lo = 0.5;
        let hi = 1.8;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        fits(lo);
      }
      busy = false;
    };
    fit();
    let raf = 0;
    const later = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    const mo = new MutationObserver(later);
    mo.observe(inner, { childList: true, subtree: true, characterData: true });
    const ro = new ResizeObserver(later);
    ro.observe(box);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
    };
  }, [key]);
  return el;
}

const list0 = (players: Record<string, Player>) => Object.keys(players);
/** The projector lists at most this many players (lobby: the latest to join; games: the top). */
const LIST_MAX = 15;

function GameView({
  game,
  players,
  states,
  feed,
  highlight,
  lastRoll,
  hop,
  onAgain,
}: {
  game: Game;
  players: Record<string, Player>;
  states: Record<string, PlayerState>;
  feed: FeedItem[];
  highlight: string | null;
  lastRoll: { uid: string; seq: number; dice: number[]; bonus: boolean } | null;
  hop: Record<string, number>;
  onAgain: () => void;
}) {
  useNow(500);
  const pieces: BoardPiece[] = useMemo(
    () => Object.entries(players).map(([uid, player]) => ({ uid, player, state: states[uid] })),
    [players, states],
  );
  // Snake & ladder moments: spotlight for 1–8 players, glow + side cards for 9–20.
  const verdicts = useVerdicts(states);
  const localNow = Date.now();
  const animating = Object.values(verdicts).some((v) => localNow < verdictTimes(v).doneAt);
  useFrames(animating);
  const clock = game.paused && game.pausedAt ? game.pausedAt : serverNow();
  const moments = game.status === "playing" ? currentMoments(states, verdicts, clock, localNow, QUESTION_MS, SL_ALERT_MS) : [];
  const spotlight = pieces.length <= SPOTLIGHT_MAX_PLAYERS;
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
        <Board pieces={pieces} highlight={highlight} specials={game.specials} posOverride={hop} moments={moments} spotlight={spotlight} />
        {game.paused && <div className="paused-overlay">⏸ Paused / Dihentikan seketika</div>}
        {game.status === "playing" && game.goAt && <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="board-cd" />}
        {ended && (
          <div className="podium-overlay">
            <div className="podium">
              <h2>🏆 Winners / Pemenang</h2>
              <ol>
                {ranking.slice(0, Math.max(winners.length, winnersNeeded(ranking.length))).map((p, i) => {
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
              <EndButtons onAgain={onAgain} />
            </div>
          </div>
        )}
      </section>
      <aside className="side">
        {!spotlight && <MomentCards moments={moments} players={players} />}
        {lastRoll && players[lastRoll.uid] && (
          <div className="panel roll-panel">
            <h3>Latest roll</h3>
            <div className="roll-who" style={{ ["--c" as string]: tokenById(players[lastRoll.uid].token).color }}>
              <span>{tokenById(players[lastRoll.uid].token).emoji}</span>
              <span className="roll-name">{players[lastRoll.uid].name}</span>
              {lastRoll.bonus && <span className="chip hot">🔥 2 dice</span>}
            </div>
            <DiceRoll values={lastRoll.dice} seed={`${lastRoll.uid}-${lastRoll.seq}`} size={44} />
          </div>
        )}
        <div className="panel">
          <h3>
            Players <span className="muted">· {winners.length}/{winnersNeeded(pieces.length)} finished</span>
          </h3>
          <ul className={`ranking ${ranking.length > 10 ? "many" : ""}`}>
            {ranking.slice(0, LIST_MAX).map((p) => (
              <RankRow key={p.uid} p={p} paused={game.paused} pausedAt={game.pausedAt} />
            ))}
          </ul>
          {ranking.length > LIST_MAX && <p className="more-players small">+ {ranking.length - LIST_MAX} more / lagi</p>}
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

/**
 * Snake/ladder answers as they arrive, with this computer's time, so the projector can play the slide or
 * climb in step with the phone. Recorded during render (not in an effect) so the piece never starts its
 * normal straight move first. Answers that were already there when the projector opened are ignored.
 */
function useVerdicts(states: Record<string, PlayerState>): Record<string, Verdict> {
  const seen = useRef<Record<string, number>>({});
  const verdicts = useRef<Record<string, Verdict>>({});
  const now = Date.now();
  for (const [uid, st] of Object.entries(states)) {
    const prev = seen.current[uid];
    if (prev === st.seq) continue;
    seen.current[uid] = st.seq;
    if (prev === undefined) continue;
    const r = st.result;
    if (st.phase === "result" && r && isMomentOutcome(r.outcome) && (r.kind === "snake" || r.kind === "ladder"))
      verdicts.current[uid] = { kind: r.kind, outcome: r.outcome, from: r.from, to: r.to, at: now, seq: st.seq };
  }
  for (const [uid, v] of Object.entries(verdicts.current)) if (now >= verdictTimes(v).doneAt) delete verdicts.current[uid];
  return verdicts.current;
}

/** Re-render every frame while a piece is sliding or climbing (and while its spotlight fades). */
function useFrames(on: boolean) {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    let id = 0;
    const tick = () => {
      setN((n) => n + 1);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on]);
}

/** 9–20 players: alert cards at the top of the side panel, newest first, at most 3. */
function MomentCards({ moments, players }: { moments: Moment[]; players: Record<string, Player> }) {
  const cards = moments
    .filter((m) => m.stage !== "after" || (m.afterMs ?? 0) < CARD_LINGER_MS)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_CARDS);
  if (!cards.length) return null;
  return (
    <div className="m-cards">
      {cards.map((m) => {
        const p = players[m.uid];
        const t = tokenById(p?.token);
        const a = ALERT_TEXT[m.kind];
        const v = m.outcome ? verdictText(m.outcome, m.from!, m.to!) : null;
        const leaving = m.stage === "after" && (m.afterMs ?? 0) > CARD_LINGER_MS - 350;
        return (
          <div key={m.key} className={`m-card ${v ? `tone-${v.tone}` : `ask-${m.kind}`} ${leaving ? "leaving" : ""} ${cards.length > 1 ? "compact" : ""}`}>
            <div className="m-card-head">
              <b>{v ? v.en : `${a.icon} ${a.en}`}</b>
              <small>{v ? v.ms : a.ms}</small>
            </div>
            <div className="m-card-who">
              {t.emoji} {p?.name ?? "Player"} · Box {m.box}
            </div>
            {v ? (
              <div className="m-card-res">
                <b>{v.sub}</b>
                <small>{v.subMs}</small>
              </div>
            ) : (
              <div className="m-card-res">
                <span>
                  {m.stage === "alert" ? "Get ready…" : `Answering… ${m.secs}s`} <small>{m.stage === "alert" ? "Bersedia…" : "Sedang menjawab…"}</small>
                </span>
                <span className="m-bar">
                  <span style={{ width: `${((m.secs ?? 30) / (QUESTION_MS / 1000)) * 100}%` }} />
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RankRow({ p, paused, pausedAt }: { p: BoardPiece; paused: boolean; pausedAt: number | null }) {
  const t = tokenById(p.player.token);
  const st = p.state;
  let chip: React.ReactNode = null;
  if (st?.phase === "won") chip = <span className="chip win">🏆 #{st.rank}</span>;
  else if (st?.phase === "question") {
    const left = Math.min(QUESTION_MS / 1000, Math.max(0, Math.ceil((st.deadline - (paused && pausedAt ? pausedAt : serverNow())) / 1000)));
    const label = st.kind === "snake" ? "🐍" : st.kind === "ladder" ? "🪜" : "⏱";
    chip = <span className={`chip ${left <= 5 ? "hot" : ""} ${st.kind}`}>{label} {left}s</span>;
  } else if (st?.phase === "result" && st.result) {
    const r = st.result;
    if (r.penalty) {
      const wait = Math.max(0, Math.ceil((st.until - (paused && pausedAt ? pausedAt : serverNow())) / 1000));
      chip = <span className="chip no">{r.timeout ? "⏰" : "✘"} ⏳ {wait}s</span>;
    } else chip = <span className={`chip ${r.correct ? "ok" : "no"}`}>{r.timeout ? "⏰" : r.correct ? "✔" : "✘"} {r.dice.length ? `🎲 ${r.dice.reduce((a, b) => a + b, 0)}` : ""}</span>;
  }
  return (
    <li style={{ ["--c" as string]: t.color }}>
      <span className="r-emoji">{t.emoji}</span>
      <span className="r-name">{p.player.name}</span>
      <span className="r-streak" title="Right answers in a row">
        {st?.streak ? `🔥${st.streak}` : ""}
      </span>
      <span className="r-box">{st?.pos ?? 0}</span>
      {chip}
    </li>
  );
}
