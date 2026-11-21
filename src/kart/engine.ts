// The Quality Cart referee. It runs in the projector window only: it moves the carts,
// reads each phone's tilt, hands out questions and items, and writes what each phone needs to show.
import { startTicker } from "../lib/ticker.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { get, onValue, ref, set, update } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { readAll } from "../lib/readAll.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { tokenById } from "../lib/tokens.ts";
import type { FeedItem, Game, Player, Question } from "../lib/types.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import { ITEMS, SUPER_STREAK, answerEffect, effectOf, lapOf, newWorld, standings, step, useItem, type RaceEvent, type World } from "./sim.ts";

export const CART_QUESTION_MS = 12_000;
const RESULT_SHOW_MS = 2_200;
/** After the first cart finishes, the others get this long to finish too. */
const FINISH_WINDOW_S = 60;
const TICK_MS = 33;
const FEED_KEEP = 14;
const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

/** The race the projector is drawing right now (shared with the screen in the same window). */
export const live: { world: World | null } = { world: null };

/** streak = right answers in a row (SUPER TURBO at 3); warned = the "question in 3…" countdown has been sent. */
type QState = { open: boolean; qid: string; correctIdx: number; deadline: number; nextAt: number; seq: number; streak?: number; warned?: boolean };
/** Seconds of "Question in 3, 2, 1" warning before each question. */
const WARN_S = 3;
type Input = { s?: number; use?: number };

export type CartMe = { rank: number; of: number; lap: number; item: string | null; fx: string | null; finished: boolean; time: number | null; streak?: number };
export type CartQ = {
  seq: number;
  q: { id: string; type: "mc" | "tf"; q: { en: string; ms: string }; opts: { en: string; ms: string }[] } | null;
  deadline: number;
  result: { correct: boolean; timeout: boolean; correctIdx: number; super?: boolean; streak?: number } | null;
  until: number;
  /** Server time the next question appears (the phone counts down to it). */
  next?: number;
};
/** Live positions for the phones: c = { uid: [distance, side, speed, flags] }, b = hidden box numbers, o = oil spills [s, d].
 * flags: 1 spinning, 2 turbo, 4 shield, 8 slowed, 16 finished. */
export type CartPos = { t: number; c: Record<string, number[]>; b?: number[]; o?: number[][] };
export type CartResult = { uid: string; rank: number; finished: boolean; time: number | null; lap: number };

export class KartEngine {
  private players: Record<string, Player> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private used: Record<string, Record<string, true>> = {};
  private qs: Record<string, QState> = {};
  private inputs: Record<string, Input> = {};
  private lastUse: Record<string, number> = {};
  private lastMe: Record<string, string> = {};
  private game: Game | null = null;
  private feed: FeedItem[] = [];
  private world: World | null = null;
  private stops: (() => void)[] = [];
  private stopTicker: (() => void) | undefined;
  private lastTick = 0;
  private lastSync = 0;
  private lastSnap = 0;
  private lastPos = 0;
  private feedDirty = false;
  onEvent?: (e: RaceEvent | { type: "item"; uid: string; item: string }) => void;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, qsetSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "game/qset"))]);
    this.qset = (qsetSnap.val() as QChoice) || "quality";
    this.players = playersSnap.val() ?? {};
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    const uids = Object.keys(this.players).sort((a, b) => (this.players[a].joinedAt ?? 0) - (this.players[b].joinedAt ?? 0));
    if (!uids.length) throw new Error("Nobody has joined yet.");
    const now = serverNow();
    this.world = newWorld(uids);
    this.used = {};
    this.qs = Object.fromEntries(uids.map((u) => [u, { open: false, qid: "", correctIdx: 0, deadline: 0, nextAt: 4 + Math.random() * 5, seq: 0 }]));
    this.feed = [{ at: now, uid: "", text: "🏁 The race has started! Good luck everyone.", tone: "info" }];
    this.game = { status: "playing", qset: this.qset, mode: "kart", engine: this.tabId, paused: false, pausedAt: null, startedAt: now, goAt: now + COUNTDOWN_MS, endedAt: null, winners: [] };
    await update(ref(db), { game: this.game, feed: this.feed, kart: null, answers: null, private: null, used: null, state: null });
    this.run();
  }

  /** Carry on a race after the projector page was reloaded. */
  async resume() {
    const all = await readAll();
    this.players = all.players ?? {};
    this.qset = (all.game?.qset as QChoice) || "quality";
    this.pool = poolFor(all.questions, this.qset);
    this.feed = all.feed ?? [];
    this.used = all.used ?? {};
    const snap = all.private?.kartsim;
    if (snap?.world) {
      const w = snap.world as World;
      this.world = { ...w, oils: w.oils ?? [], boxes: w.boxes ?? [], carts: (w.carts ?? []).map((c) => ({ ...c, hitCooldown: c.hitCooldown ?? {}, item: c.item ?? null })) };
      this.qs = snap.qs ?? {};
    } else {
      this.world = newWorld(Object.keys(this.players));
      this.qs = {};
    }
    for (const c of this.world.carts) this.qs[c.uid] ??= { open: false, qid: "", correctIdx: 0, deadline: 0, nextAt: this.world.t + 5, seq: 0 };
    this.game = { ...(all.game as Game), engine: this.tabId };
    await set(ref(db, "game/engine"), this.tabId);
    this.run();
  }

  private run() {
    this.stopListening();
    live.world = this.world;
    this.stops.push(
      onValue(ref(db, "kart/input"), (s) => {
        this.inputs = s.val() ?? {};
        for (const [uid, inp] of Object.entries(this.inputs)) {
          const use = inp.use ?? 0;
          if (this.lastUse[uid] === undefined) this.lastUse[uid] = use;
          else if (use > this.lastUse[uid]) {
            this.lastUse[uid] = use;
            this.useItem(uid);
          }
        }
      }),
      onValue(ref(db, "answers"), (s) => {
        const answers = (s.val() ?? {}) as Record<string, { qid: string; choice: number }>;
        for (const [uid, a] of Object.entries(answers)) this.onAnswer(uid, a);
      }),
      onValue(ref(db, "game"), (s) => {
        const g = s.val() as Game | null;
        if (!g || g.engine !== this.tabId) return this.stop();
        this.game = g;
      }),
      onValue(ref(db, "players"), (s) => {
        this.players = s.val() ?? {};
        if (this.world) this.world.carts = this.world.carts.filter((c) => this.players[c.uid]);
      }),
    );
    this.lastTick = performance.now();
    this.stopTicker = startTicker(() => this.tick(), TICK_MS);
  }

  private stopListening() {
    this.stops.forEach((f) => f());
    this.stops = [];
    this.stopTicker?.();
    this.stopTicker = undefined;
  }

  stop() {
    this.stopListening();
  }

  async pause() {
    if (!this.game || this.game.paused) return;
    this.game = { ...this.game, paused: true, pausedAt: serverNow() };
    await update(ref(db, "game"), { paused: true, pausedAt: this.game.pausedAt });
  }

  async unpause() {
    if (!this.game || !this.game.paused) return;
    const shift = serverNow() - (this.game.pausedAt ?? serverNow());
    const updates: Record<string, unknown> = { "game/paused": false, "game/pausedAt": null };
    if (this.game.goAt && this.game.goAt > (this.game.pausedAt ?? 0)) updates["game/goAt"] = this.game.goAt + shift;
    for (const [uid, q] of Object.entries(this.qs)) {
      if (q.open) {
        q.deadline += shift;
        updates[`kart/q/${uid}/deadline`] = q.deadline;
      }
    }
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  async endNow() {
    await this.finish();
  }

  private tick() {
    const nowMs = performance.now();
    const dt = Math.min(0.1, (nowMs - this.lastTick) / 1000);
    this.lastTick = nowMs;
    const w = this.world;
    if (!w || !this.game || this.game.status !== "playing" || this.game.paused) return;
    const now = serverNow();
    if (this.game.goAt && now < this.game.goAt) return;

    const steer: Record<string, number> = {};
    for (const [uid, inp] of Object.entries(this.inputs)) steer[uid] = Math.max(-1, Math.min(1, Number(inp.s) || 0));
    for (const e of step(w, dt, steer)) this.onRaceEvent(e);

    // Questions: one pops up every 6–12 seconds per cart while racing.
    const updates: Record<string, unknown> = {};
    for (const c of w.carts) {
      const q = (this.qs[c.uid] ??= { open: false, qid: "", correctIdx: 0, deadline: 0, nextAt: w.t + 5, seq: 0 });
      if (c.finished) {
        if (q.open) {
          q.open = false;
          updates[`kart/q/${c.uid}`] = null;
        }
        continue;
      }
      if (q.open && now > q.deadline + 600) this.judge(c.uid, null, updates);
      else if (!q.open && w.t >= q.nextAt && c.p > 0) this.ask(c.uid, now, updates);
      else if (!q.open && !q.warned && w.t >= q.nextAt - WARN_S && c.p > 0) {
        q.warned = true;
        updates[`kart/q/${c.uid}/next`] = now + Math.max(0, q.nextAt - w.t) * 1000;
      }
    }

    // Every cart's position, about 6 times a second, for the drivers' view on the phones.
    if (nowMs - this.lastPos > 160) {
      this.lastPos = nowMs;
      const c: Record<string, number[]> = {};
      for (const k of w.carts) {
        const flags = (k.spinUntil > w.t ? 1 : 0) | (k.boostUntil > w.t ? 2 : 0) | (k.shieldUntil > w.t ? 4 : 0) | (k.slowUntil > w.t ? 8 : 0) | (k.finished ? 16 : 0) | ((k.superUntil ?? 0) > w.t ? 32 : 0);
        c[k.uid] = [Math.round(k.p * 10) / 10, Math.round(k.d * 100) / 100, Math.round(k.v * 10) / 10, flags];
      }
      const pos: CartPos = {
        t: Math.round(w.t * 100) / 100,
        c,
        b: w.boxes.map((b, i) => (b.hiddenUntil > w.t ? i : -1)).filter((i) => i >= 0),
        o: w.oils.map((o) => [Math.round(o.s), Math.round(o.d * 100) / 100]),
      };
      updates["kart/pos"] = pos;
    }

    if (nowMs - this.lastSync > 250) {
      this.lastSync = nowMs;
      const order = standings(w);
      order.forEach((c, i) => {
        const me: CartMe = {
          rank: i + 1,
          of: order.length,
          lap: lapOf(c),
          item: c.item,
          fx: effectOf(w, c),
          finished: c.finished,
          time: c.finished ? Math.round(c.finishT * 10) / 10 : null,
          streak: this.qs[c.uid]?.streak ?? 0,
        };
        const key = JSON.stringify(me);
        if (this.lastMe[c.uid] !== key) {
          this.lastMe[c.uid] = key;
          updates[`kart/me/${c.uid}`] = me;
        }
      });
      if (this.feedDirty) {
        updates.feed = this.feed;
        this.feedDirty = false;
      }
    }
    if (nowMs - this.lastSnap > 1500) {
      this.lastSnap = nowMs;
      updates["private/kartsim"] = { world: w, qs: this.qs };
    }
    if (Object.keys(updates).length) void update(ref(db), updates).catch(() => {});

    const allDone = w.carts.length > 0 && w.carts.every((c) => c.finished);
    if (allDone || (w.firstFinishT !== null && w.t - w.firstFinishT > FINISH_WINDOW_S)) void this.finish();
  }

  private name(uid: string) {
    const p = this.players[uid];
    return `${tokenById(p?.token).emoji} ${p?.name ?? "Player"}`;
  }

  private pushFeed(text: string, tone: FeedItem["tone"] = "info") {
    this.feed = [...this.feed, { at: serverNow(), uid: "", text, tone }].slice(-FEED_KEEP);
    this.feedDirty = true;
  }

  private onRaceEvent(e: RaceEvent) {
    this.onEvent?.(e);
    if (e.type === "finish") {
      const m = Math.floor(e.time / 60);
      const s = Math.floor(e.time % 60);
      this.pushFeed(`🏁 ${this.name(e.uid)} finished #${e.rank} (${m}:${String(s).padStart(2, "0")})`, "win");
    } else if (e.type === "spin" && e.cause === "oil") this.pushFeed(`🛢️ ${this.name(e.uid)} slipped on oil!`, "bad");
    else if (e.type === "lap" && e.lap === 3) {
      const order = standings(this.world!);
      if (order[0]?.uid === e.uid) this.pushFeed(`🔔 Final lap! ${this.name(e.uid)} is leading`, "info");
    }
  }

  private useItem(uid: string) {
    const w = this.world;
    if (!w || !this.game || this.game.status !== "playing" || this.game.paused) return;
    const use = useItem(w, uid);
    if (!use) return;
    this.onEvent?.({ type: "item", uid, item: use.item });
    const it = ITEMS[use.item];
    if (use.item === "audit" && use.target)
      this.pushFeed(
        use.blocked ? `📋 ${this.name(uid)} sent an Audit to ${this.name(use.target)}, but the PPE Shield blocked it!` : `📋 ${this.name(uid)} sent an Audit to ${this.name(use.target)}! Slowed down`,
        "bad",
      );
    else if (use.item !== "shield") this.pushFeed(`${it.icon} ${this.name(uid)} used ${it.en}`);
  }

  private ask(uid: string, now: number, updates: Record<string, unknown>) {
    const q = this.qs[uid];
    const pick = pickQuestion(this.pool, new Set(Object.keys(this.used[uid] ?? {})));
    if (!pick) return;
    if (pick.reset) this.used[uid] = {};
    (this.used[uid] ??= {})[pick.q.id] = true;
    const base = pick.q.type === "tf" ? TF_OPTS : pick.q.opts ?? [];
    const sh = pick.q.type === "tf" ? { opts: base, correctIdx: pick.q.ans } : shuffleOptions(base, pick.q.ans);
    q.open = true;
    q.warned = false;
    q.qid = pick.q.id;
    q.correctIdx = sh.correctIdx;
    q.deadline = now + CART_QUESTION_MS;
    q.seq += 1;
    const pub: CartQ = { seq: q.seq, q: { id: pick.q.id, type: pick.q.type, q: pick.q.q, opts: sh.opts }, deadline: q.deadline, result: null, until: 0 };
    updates[`kart/q/${uid}`] = pub;
    updates[`answers/${uid}`] = null;
    updates[`used/${uid}`] = this.used[uid];
  }

  private onAnswer(uid: string, a: { qid: string; choice: number }) {
    const q = this.qs[uid];
    if (!this.game || this.game.status !== "playing" || this.game.paused || !q?.open || q.qid !== a.qid) return;
    const updates: Record<string, unknown> = {};
    this.judge(uid, a.choice, updates);
    void update(ref(db), updates).catch(() => {});
  }

  private judge(uid: string, choice: number | null, updates: Record<string, unknown>) {
    const q = this.qs[uid];
    const w = this.world;
    if (!q?.open || !w) return;
    q.open = false;
    const correct = choice !== null && choice === q.correctIdx;
    let streak = correct ? (q.streak ?? 0) + 1 : 0;
    const superBoost = streak >= SUPER_STREAK;
    if (superBoost) {
      streak = 0;
      this.pushFeed(`🔥 ${this.name(uid)}: 3 right in a row, SUPER TURBO!`, "good");
    }
    q.streak = streak;
    answerEffect(w, uid, correct, superBoost);
    q.nextAt = w.t + 6 + Math.random() * 6;
    updates[`kart/q/${uid}/result`] = { correct, timeout: choice === null, correctIdx: q.correctIdx, super: superBoost, streak };
    updates[`kart/q/${uid}/until`] = serverNow() + RESULT_SHOW_MS;
    updates[`answers/${uid}`] = null;
  }

  private async finish() {
    if (!this.game || this.game.status === "ended" || !this.world) return;
    const w = this.world;
    const results: CartResult[] = standings(w).map((c, i) => ({
      uid: c.uid,
      rank: i + 1,
      finished: c.finished,
      time: c.finished ? Math.round(c.finishT * 10) / 10 : null,
      lap: lapOf(c),
    }));
    this.game = { ...this.game, status: "ended", endedAt: serverNow(), paused: false, pausedAt: null, winners: results.filter((r) => r.finished).map((r) => r.uid) };
    this.pushFeed("🏆 Race over! Thank you for playing.", "win");
    await update(ref(db), { game: this.game, feed: this.feed, "kart/results": results, "private/kartsim": { world: w, qs: this.qs } });
    this.stop();
  }
}
