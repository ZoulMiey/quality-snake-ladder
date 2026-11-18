import { useEffect, useRef, useState } from "react";
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
      if (fx === "turbo") sfx.ladder();
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
  const counting = game.goAt && now < game.goAt + 1000;
  const ended = game.status === "ended";
  const myResult = results?.find((r) => r.uid === uid);
  const fx = cart?.fx ? FX[cart.fx] : null;

  return (
    <div className="cart-phone">
      <div className="status-strip" style={{ ["--c" as string]: t.color }}>
        <span className="me-mini">{t.emoji}</span>
        <span className="me-name">{me.name}</span>
        <span className="box-pill">{cart ? `${ordinal(cart.rank)}/${cart.of}` : "—"}</span>
        <span className="lap-pill">Lap {cart ? Math.min(cart.lap, LAPS) : 1}/{LAPS}</span>
      </div>
      {game.paused && game.status === "playing" && <div className="paused-bar">Paused by host / Dihentikan seketika</div>}

      {ended ? (
        <div className="card center won">
          <div className="trophy">{myResult && myResult.rank <= 3 ? "🏆" : "🏁"}</div>
          <div className="bi title">
            <div className="en">{myResult ? `You finished ${ordinal(myResult.rank)}!` : "Race over!"}</div>
            <div className="ms">{myResult ? `Anda tamat di tempat ke-${myResult.rank}!` : "Perlumbaan tamat!"}</div>
          </div>
          <p className="muted">Thank you for playing! / Terima kasih kerana bermain!</p>
        </div>
      ) : cart?.finished ? (
        <div className="card center won">
          <div className="trophy">🏁</div>
          <div className="bi title">
            <div className="en">You finished {ordinal(cart.rank)}!</div>
            <div className="ms">Anda tamat di tempat ke-{cart.rank}!</div>
          </div>
          <p className="muted">Watch the big screen. / Lihat skrin besar.</p>
        </div>
      ) : counting && game.goAt ? (
        <>
          <Countdown goAt={game.goAt} frozenAt={game.paused ? game.pausedAt : null} className="phone-cd" />
          <TiltHelp state={tilt.state} onEnable={tilt.enable} />
        </>
      ) : (
        <>
          {fx && (
            <div className={`fx-banner ${fx.cls}`} key={cart?.fx ?? ""}>
              <span className="fx-icon">{fx.icon}</span>
              <span className="en">{fx.en}</span>
              <span className="ms">{fx.ms}</span>
            </div>
          )}
          {q && q.q && (q.result ? q.until > now : q.deadline > now - 600) ? (
            <CartQuestion uid={uid} q={q} paused={game.paused} pausedAt={game.pausedAt} />
          ) : (
            <div className="wheel-card">
              <div className="wheel" style={{ transform: `rotate(${shownSteer * 70}deg)` }} aria-hidden="true">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="10" />
                  <circle cx="50" cy="50" r="9" fill="currentColor" />
                  <path d="M50 50 L10 46 M50 50 L90 46 M50 50 L50 92" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
                </svg>
              </div>
              <div className="bi center">
                <div className="en">{tilt.state === "on" ? "Tilt your phone to steer" : "Hold ◀ ▶ to steer"}</div>
                <div className="ms">{tilt.state === "on" ? "Condongkan telefon untuk memandu" : "Tekan ◀ ▶ untuk memandu"}</div>
              </div>
              <TiltHelp state={tilt.state} onEnable={tilt.enable} />
            </div>
          )}
          <button className={`item-btn ${cart?.item ? "has" : ""}`} onClick={useItem} disabled={!cart?.item}>
            <span className="item-icon">{cart?.item ? ITEMS[cart.item as ItemId].icon : "🎁"}</span>
            <span className="item-text">
              <span className="en">{cart?.item ? `Use ${ITEMS[cart.item as ItemId].en}` : "Drive through a Q box to get an item"}</span>
              <span className="ms">{cart?.item ? `Guna ${ITEMS[cart.item as ItemId].ms}` : "Lalu kotak Q untuk dapat item"}</span>
            </span>
          </button>
          <div className="steer-btns">
            <button aria-label="Steer left" {...holdBtn(-1)}>
              ◀
            </button>
            <button aria-label="Steer right" {...holdBtn(1)}>
              ▶
            </button>
          </div>
        </>
      )}
      {ended && (
        <button className="big-btn exit-btn" onClick={onExit}>
          Exit / Keluar
        </button>
      )}
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
      <div className={`cart-result ${r.correct ? "good" : "bad"}`}>
        <div className="cr-mark">{r.timeout ? "⏰" : r.correct ? "✔" : "✘"}</div>
        <div className="bi">
          <div className="en">{r.correct ? "Correct! TURBO ⚡" : r.timeout ? "Time's up! Sputter 🐢" : "Wrong! Sputter 🐢"}</div>
          <div className="ms">{r.correct ? "Betul! Turbo" : r.timeout ? "Masa tamat! Perlahan" : "Salah! Perlahan"}</div>
        </div>
        {!r.correct && qq.opts[r.correctIdx] && (
          <div className="right-answer">
            <span className="ra-label">Right answer / Jawapan betul</span>
            <span className="en">{qq.opts[r.correctIdx].en}</span>
            <span className="ms">{qq.opts[r.correctIdx].ms}</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="cart-q">
      <div className="cq-head">
        <span>❓ Answer for a TURBO! / Jawab untuk turbo!</span>
        <span className="cq-secs">{secs}s</span>
      </div>
      <div className="timer slim">
        <div className="timer-fill" style={{ width: `${(left / CART_QUESTION_MS) * 100}%` }} />
      </div>
      <div className="question compact">
        <div className="en">{qq.q.en}</div>
        <div className="ms">{qq.q.ms}</div>
      </div>
      <div className={`answers compact ${qq.type === "tf" ? "tf" : ""}`}>
        {qq.opts.map((o, i) => (
          <button key={i} className={`ans ans-${i} ${answered === i ? "picked" : ""} ${answered !== null && answered !== i ? "dim" : ""}`} disabled={answered !== null || left <= 0 || paused} onClick={() => answer(i)}>
            <span className="letter">{qq.type === "tf" ? (i === 0 ? "✔" : "✘") : LETTERS[i]}</span>
            <span className="atext">
              <span className="en">{o.en}</span>
              <span className="ms">{o.ms}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
