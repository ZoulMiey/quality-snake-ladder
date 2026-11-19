import { useEffect, useMemo, useRef, useState } from "react";
import { ref, set, update } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { useDbValue, useNow } from "../lib/useDb.ts";
import { tokenById } from "../lib/tokens.ts";
import { sfx, unlockAudio } from "../lib/sound.ts";
import type { Game, Player } from "../lib/types.ts";
import Countdown from "../components/Countdown.tsx";
import { ITEMS, type ItemId } from "./sim.ts";
import { LAPS } from "./track.ts";
import { CART_QUESTION_MS, type CartMe, type CartQ, type CartResult } from "./engine.ts";
import Chase3D from "./Chase3D.tsx";

type TiltState = "checking" | "need-permission" | "on" | "none";

/** Reads how far the phone is tilted left/right and turns it into steering (-1 .. 1). */
function useTilt() {
  const [state, setState] = useState<TiltState>("checking");
  const steer = useRef(0);
  const got = useRef(false);

  const hasPermissionStep = () =>
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function";

  const listen = () => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      got.current = true;
      const angle = (screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0) as number;
      let tilt = e.gamma;
      if (angle === 90) tilt = e.beta;
      else if (angle === 270 || angle === -90) tilt = -e.beta;
      let s = Math.max(-1, Math.min(1, tilt / 25));
      if (Math.abs(s) < 0.08) s = 0;
      steer.current = steer.current * 0.4 + s * 0.6;
      setState("on");
    };
    window.addEventListener("deviceorientation", onTilt);
    // No tilt readings yet: the phone either needs permission first (iPhone) or has no tilt sensor.
    setTimeout(() => {
      if (!got.current) setState(hasPermissionStep() ? "need-permission" : "none");
    }, 1500);
    return () => window.removeEventListener("deviceorientation", onTilt);
  };

  useEffect(() => {
    if (typeof DeviceOrientationEvent === "undefined") {
      setState("none");
      return;
    }
    return listen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enable() {
    unlockAudio();
    try {
      const req = (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission;
      const r = await req();
      if (r !== "granted") setState("none");
      else
        setTimeout(() => {
          if (!got.current) setState("none");
        }, 1500);
    } catch {
      setState("none");
    }
  }
  return { state, steer, enable };
}

const FX: Record<string, { icon: string; en: string; ms: string; cls: string }> = {
  super: { icon: "🔥", en: "SUPER TURBO!", ms: "Turbo super!", cls: "good" },
  turbo: { icon: "⚡", en: "TURBO!", ms: "Turbo!", cls: "good" },
  spin: { icon: "💫", en: "Spin out!", ms: "Berpusing!", cls: "bad" },
  slow: { icon: "🐢", en: "Slowed down", ms: "Perlahan", cls: "bad" },
  shield: { icon: "🛡️", en: "Shield on", ms: "Perisai aktif", cls: "info" },
};

const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

export default function KartPhone({ uid, me, game, onExit }: { uid: string; me: Player; game: Game; onExit: () => void }) {
  useNow(150);
  const cart = useDbValue<CartMe>(`kart/me/${uid}`);
  const q = useDbValue<CartQ>(`kart/q/${uid}`);
  const results = useDbValue<CartResult[]>(game.status === "ended" ? "kart/results" : null);
  const tilt = useTilt();
  const hold = useRef(0); // -1 / 0 / 1 from the arrow buttons
  const players = useDbValue<Record<string, Player>>("players");
  // Current steering for the driver's view: the arrow buttons win over tilt.
  const steerNow = useMemo(
    () => ({
      get current() {
        return hold.current || tilt.steer.current;
      },
      set current(_v: number) {},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [shownSteer, setShownSteer] = useState(0);
  const useCount = useRef(0);
  const t = tokenById(me.token);

  // Send steering about 10 times a second while it changes.
  useEffect(() => {
    let last = 99;
    let lastAt = 0;
    void set(ref(db, `kart/input/${uid}`), { s: 0, use: 0 }).catch(() => {});
    const iv = setInterval(() => {
      const s = Math.round((hold.current || tilt.steer.current) * 20) / 20;
      setShownSteer(s);
      const now = Date.now();
      if (Math.abs(s - last) >= 0.05 || now - lastAt > 1500) {
        last = s;
        lastAt = now;
        void update(ref(db, `kart/input/${uid}`), { s }).catch(() => {});
      }
    }, 100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Sounds when something happens to my cart
  const lastFx = useRef<string | null>(null);
  const lastItem = useRef<string | null>(null);
  useEffect(() => {
    const fx = cart?.fx ?? null;
    if (fx && fx !== lastFx.current) {
      if (fx === "spin") sfx.wrong();
      if (fx === "turbo" || fx === "super") sfx.ladder();
      try {
        navigator.vibrate?.(fx === "spin" ? 300 : 80);
      } catch {}
    }
    lastFx.current = fx;
    const item = cart?.item ?? null;
    if (item && item !== lastItem.current) sfx.join();
    lastItem.current = item;
  }, [cart?.fx, cart?.item]);

  function useItem() {
    if (!cart?.item) return;
    unlockAudio();
    useCount.current += 1;
    void update(ref(db, `kart/input/${uid}`), { use: useCount.current, s: hold.current || tilt.steer.current }).catch(() => {});
    try {
      navigator.vibrate?.(60);
    } catch {}
  }

  const holdBtn = (dir: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      hold.current = dir;
    },
    onPointerUp: () => (hold.current = 0),
    onPointerLeave: () => (hold.current = 0),
    onPointerCancel: () => (hold.current = 0),
  });

  const now = serverNow();
  const clock = game.paused && game.pausedAt ? game.pausedAt : now;
  const counting = !!game.goAt && now < game.goAt + 1000;
  const ended = game.status === "ended";
  const myResult = results?.find((r) => r.uid === uid);
  const fx = cart?.fx ? FX[cart.fx] : null;

  // Best lap, measured on this phone from the moments the lap number goes up.
  const lapRef = useRef<{ lap: number; at: number; best: number | null }>({ lap: 1, at: 0, best: null });
  if (cart && game.goAt) {
    const L = lapRef.current;
    if (!L.at) L.at = game.goAt;
    if (cart.lap > L.lap) {
      const t2 = clock - L.at;
      L.best = L.best === null ? t2 : Math.min(L.best, t2);
      L.lap = cart.lap;
      L.at = clock;
    }
  }

  if (ended || cart?.finished)
    return (
      <div className="cart-phone">
        <div className="status-strip" style={{ ["--c" as string]: t.color }}>
          <span className="me-mini">{t.emoji}</span>
          <span className="me-name">{me.name}</span>
          <span className="box-pill">{cart ? `${ordinal(cart.rank)}/${cart.of}` : "—"}</span>
          <span className="lap-pill">Lap {cart ? Math.min(cart.lap, LAPS) : 1}/{LAPS}</span>
        </div>
        {ended ? (
          <div className="card center won">
            <div className="trophy">{myResult && myResult.rank <= 3 ? "🏆" : "🏁"}</div>
            <div className="bi title">
              <div className="en">{myResult ? `You finished ${ordinal(myResult.rank)}!` : "Race over!"}</div>
              <div className="ms">{myResult ? `Anda tamat di tempat ke-${myResult.rank}!` : "Perlumbaan tamat!"}</div>
            </div>
            <p className="muted">Thank you for playing! / Terima kasih kerana bermain!</p>
          </div>
        ) : (
          <div className="card center won">
            <div className="trophy">🏁</div>
            <div className="bi title">
              <div className="en">You finished {ordinal(cart!.rank)}!</div>
              <div className="ms">Anda tamat di tempat ke-{cart!.rank}!</div>
            </div>
            <p className="muted">Watch the big screen. / Lihat skrin besar.</p>
          </div>
        )}
        {ended && (
          <button className="big-btn exit-btn" onClick={onExit}>
            Exit / Keluar
          </button>
        )}
      </div>
    );

  const showQ = !counting && q && q.q && (q.result ? q.until > now : q.deadline > now - 600);
  // "Question in 3, 2, 1" before each question, so it never appears out of nowhere.
  const warnSecs = !counting && !showQ && q?.next && q.next > now && !(q.q && !q.result) ? Math.ceil((q.next - now) / 1000) : 0;
  const streak = cart?.streak ?? 0;
  const raceMs = game.goAt ? Math.max(0, clock - game.goAt) : 0;

  return (
    <div className="kr" role="application" aria-label="Quality Cart race">
      <Chase3D uid={uid} players={players ?? {}} steer={steerNow} />
      <div className="kr-hud">
        <div className="kr-rank">
          <span className="kr-big">{cart ? ordinal(cart.rank) : "—"}</span>
          <span className="kr-small">/{cart?.of ?? "—"}</span>
          <div className="kr-lap">
            LAP {cart ? Math.min(cart.lap, LAPS) : 1}/{LAPS}
          </div>
          <div className="kr-streak" aria-label={`${streak} right answers in a row`}>
            {[0, 1, 2].map((i) => (
              <i key={i} className={i < streak ? "on" : ""} />
            ))}
            <span>SUPER</span>
          </div>
        </div>
        {!showQ && !warnSecs && (
          <div className="kr-time">
            {lapTime(raceMs)}
            <small>BEST LAP {lapRef.current.best ? lapTime(lapRef.current.best) : "--"}</small>
          </div>
        )}
        <button className={`kr-item ${cart?.item ? "has" : ""}`} onClick={useItem} disabled={!cart?.item} aria-label={cart?.item ? `Use ${ITEMS[cart.item as ItemId].en}` : "No item"}>
          {cart?.item ? ITEMS[cart.item as ItemId].icon : "🎁"}
          <small>{cart?.item ? "TAP TO USE" : "Q BOX = ITEM"}</small>
        </button>
        <button className="kr-steer l" aria-label="Steer left" {...holdBtn(-1)}>
          ◀
        </button>
        <button className="kr-steer r" aria-label="Steer right" {...holdBtn(1)}>
          ▶
        </button>
        <div className="kr-hint">{tilt.state === "on" ? "Tilt to steer / Condongkan untuk memandu" : "Hold ◀ ▶ to steer / Tekan ◀ ▶"}</div>
      </div>
      {fx && !showQ && (
        <div className={`kr-fx ${fx.cls}`} key={cart?.fx ?? ""}>
          <span className="fx-icon">{fx.icon}</span> {fx.en}
          <small>{fx.ms}</small>
        </div>
      )}
      {showQ && <CartQuestion uid={uid} q={q!} paused={game.paused} pausedAt={game.pausedAt} />}
      {warnSecs > 0 && <QuestionSoon secs={warnSecs} />}
      {counting && game.goAt && (
        <div className="kr-center">
          <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="kr-cd" />
        </div>
      )}
      {tilt.state !== "on" && tilt.state !== "checking" && (
        <div className="kr-tilthelp">
          <TiltHelp state={tilt.state} onEnable={tilt.enable} />
        </div>
      )}
      {game.paused && game.status === "playing" && <div className="paused-bar kr-paused">Paused by host / Dihentikan seketika</div>}
      <TurnSideways />
    </div>
  );
}

/** Banner counting down to the next question, with a tick (and a short buzz on Android) each second. */
function QuestionSoon({ secs }: { secs: number }) {
  useEffect(() => {
    sfx.tick();
    try {
      navigator.vibrate?.(40);
    } catch {}
  }, [secs]);
  return (
    <div className="kr-warn" role="status" aria-live="assertive">
      <span>❓ QUESTION IN</span>
      <b key={secs}>{secs}</b>
      <small>Soalan dalam {secs} saat · Get ready to answer!</small>
    </div>
  );
}

const lapTime = (ms: number) => {
  const s = ms / 1000;
  return `${Math.floor(s / 60)}'${String(Math.floor(s % 60)).padStart(2, "0")}"${String(Math.floor((s % 1) * 100)).padStart(2, "0")}`;
};

/** While the phone is held upright: ask the player to turn it sideways (they can choose to stay upright). */
function TurnSideways() {
  const [upright, setUpright] = useState(() => window.innerHeight > window.innerWidth);
  const [stay, setStay] = useState(false);
  useEffect(() => {
    const check = () => setUpright(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  const canFull = typeof document !== "undefined" && !!document.documentElement.requestFullscreen && !document.fullscreenElement;
  if (!upright || stay) return null;
  return (
    <div className="kr-rotate" role="dialog" aria-label="Turn your phone sideways">
      <div className="kr-rot-phone" aria-hidden="true" />
      <div className="kr-rot-t1">Turn your phone sideways</div>
      <div className="kr-rot-t2">Pusingkan telefon anda ke sisi</div>
      <p className="kr-rot-note">The race shows full screen. Tilt the phone like a steering wheel. / Perlumbaan dipaparkan skrin penuh. Condongkan telefon seperti stereng.</p>
      {canFull && (
        <button
          className="big-btn kr-rot-btn"
          onClick={() => {
            unlockAudio();
            void document.documentElement.requestFullscreen?.().catch(() => {});
            try {
              void (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.("landscape")?.catch(() => {});
            } catch {}
          }}
        >
          ⛶ Full screen / Skrin penuh
        </button>
      )}
      <button className="link-btn kr-rot-stay" onClick={() => setStay(true)}>
        Keep it upright / Kekal menegak
      </button>
    </div>
  );
}

function TiltHelp({ state, onEnable }: { state: TiltState; onEnable: () => void }) {
  if (state === "need-permission")
    return (
      <button className="big-btn tilt-btn" onClick={onEnable}>
        📱 Turn on tilt steering / Hidupkan kawalan condong
      </button>
    );
  if (state === "none") return <p className="muted center small">Tilt is not available on this phone. Use the ◀ ▶ buttons. / Gunakan butang ◀ ▶.</p>;
  return null;
}

const LETTERS = ["A", "B", "C", "D"];

function CartQuestion({ uid, q, paused, pausedAt }: { uid: string; q: CartQ; paused: boolean; pausedAt: number | null }) {
  const [sent, setSent] = useState<{ seq: number; choice: number } | null>(null);
  const qq = q.q!;
  const answered = sent?.seq === q.seq ? sent.choice : null;
  const left = Math.max(0, q.deadline - (paused && pausedAt ? pausedAt : serverNow()));
  const secs = Math.ceil(left / 1000);

  useEffect(() => {
    if (q.result) {
      if (q.result.correct) sfx.correct();
      else sfx.wrong();
    } else {
      try {
        navigator.vibrate?.(40);
      } catch {}
    }
  }, [q.seq, q.result]);

  async function answer(i: number) {
    if (answered !== null || q.result || paused) return;
    setSent({ seq: q.seq, choice: i });
    await set(ref(db, `answers/${uid}`), { qid: qq.id, choice: i }).catch(() => setSent(null));
  }

  if (q.result) {
    const r = q.result;
    return (
      <div className="kr-qres">
        <div className={`kr-fx ${r.super ? "super" : r.correct ? "good" : "bad"}`}>
          {r.super ? "🔥 SUPER TURBO!" : r.correct ? "⚡ TURBO!" : r.timeout ? "⏰ TIME'S UP" : "✘ SLOW DOWN"}
          <small>
            {r.super
              ? "3 right in a row! / 3 betul berturut-turut!"
              : r.correct
                ? (r.streak ?? 0) === 2
                  ? "Correct! One more for SUPER TURBO / Satu lagi untuk turbo super"
                  : "Correct! / Betul!"
                : r.timeout
                  ? "Masa tamat! Perlahan"
                  : "Wrong! / Salah! Perlahan"}
          </small>
        </div>
        {!r.correct && qq.opts[r.correctIdx] && (
          <div className="kr-ra">
            <span className="ra-label">Right answer / Jawapan betul</span>
            <b>{qq.opts[r.correctIdx].en}</b>
            <span>{qq.opts[r.correctIdx].ms}</span>
          </div>
        )}
      </div>
    );
  }
  // Answers sit where the thumbs hold the phone: A B on the left, C D on the right (True left, False right).
  const half = Math.ceil(qq.opts.length / 2);
  const btn = (i: number) => (
    <button key={i} className={`kr-ans ans-${qq.type === "tf" ? (i === 0 ? 3 : 0) : i} ${answered === i ? "picked" : ""} ${answered !== null && answered !== i ? "dim" : ""}`} disabled={answered !== null || left <= 0 || paused} onClick={() => answer(i)}>
      <b>{qq.type === "tf" ? (i === 0 ? "✔" : "✘") : LETTERS[i]}</b>
      <span>
        {qq.opts[i].en}
        <small>{qq.opts[i].ms}</small>
      </span>
    </button>
  );
  return (
    <div className="kr-q">
      <div className="kr-qcard">
        <div className="kr-qhead">
          ❓ Answer for a TURBO! / Jawab untuk turbo! <span>{secs}s</span>
        </div>
        <div className="kr-qen">{qq.q.en}</div>
        <div className="kr-qms">{qq.q.ms}</div>
        <div className="kr-qtimer">
          <i style={{ width: `${(left / CART_QUESTION_MS) * 100}%` }} />
        </div>
      </div>
      <div className="kr-side l">{qq.opts.slice(0, half).map((_, i) => btn(i))}</div>
      <div className="kr-side r">{qq.opts.slice(half).map((_, i) => btn(i + half))}</div>
    </div>
  );
}
