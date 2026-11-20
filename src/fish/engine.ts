// Fishing Derby referee. Runs in the projector window only, like the Snake & Ladder engine: it gives every
// player their own question stream, checks answers, decides the catch and keeps the 5-minute clock.
// It reuses the same database paths as Snake & Ladder (state, private, used, answers, feed), so no
// new security rules are needed. The feed is written one item at a time (feed/{n}) so 50 phones only
// download what is new.
import { startTicker } from "../lib/ticker.ts";
import { ref, get, onValue, update, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { tokenById } from "../lib/tokens.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import type { FeedItem, Game, Player, Question } from "../lib/types.ts";
import { GAME_MS, QUESTION_MS, RESULT_MS, addCatch, catchFor, fixFishState, frenzyAt, newFishState, rankFishers, type Catch, type FishState } from "./rules.ts";

const GRACE_MS = 800;
const FEED_KEEP = 12;
const RANKS_EVERY_MS = 3_000;

type Private = { qid: string; correctIdx: number };

const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

export class FishEngine {
  private players: Record<string, Player> = {};
  private states: Record<string, FishState> = {};
  private priv: Record<string, Private> = {};
  private used: Record<string, Record<string, true>> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private game: Game | null = null;
  private feedN = 0;
  private busy = new Set<string>();
  private stops: (() => void)[] = [];
  private stopTicker: (() => void) | undefined;
  private lastRanks = "";
  private ranksAt = 0;
  private frenzyShown = -1;
  onEvent?: (e: { type: "catch"; uid: string; result: Catch } | { type: "frenzy" } | { type: "end" }) => void;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, gSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "game"))]);
    const g0 = (gSnap.val() ?? {}) as Partial<Game>;
    this.qset = (g0.qset as QChoice) || "quality";
    this.players = playersSnap.val() ?? {};
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    if (!Object.keys(this.players).length) throw new Error("Nobody has joined yet.");

    const now = serverNow();
    this.states = {};
    this.priv = {};
    this.used = {};
    this.feedN = 0;
    this.frenzyShown = -1;
    this.game = {
      status: "playing",
      qset: this.qset,
      mode: "fish",
      fishMode: "open",
      engine: this.tabId,
      paused: false,
      pausedAt: null,
      startedAt: now,
      goAt: now + COUNTDOWN_MS,
      endsAt: now + COUNTDOWN_MS + GAME_MS,
      endedAt: null,
      winners: [],
      ranks: null,
    };
    for (const uid of Object.keys(this.players)) this.states[uid] = newFishState();
    await update(ref(db), { answers: null, private: {}, used: {}, state: this.states, feed: null, game: this.game });
    await this.pushFeed({ at: now, uid: "", text: "🎣 Fishing Derby started! Good luck everyone.", tone: "info" });
    this.run();
  }

  async resume() {
    const all = (await get(ref(db))).val() ?? {};
    this.players = all.players ?? {};
    this.states = {};
    for (const [u, s] of Object.entries(all.state ?? {})) this.states[u] = fixFishState(s as FishState)!;
    this.priv = all.private ?? {};
    this.used = all.used ?? {};
    const feed = all.feed ?? {};
    this.feedN = Math.max(0, ...Object.keys(feed).map(Number).filter((n) => !isNaN(n))) + 1;
    this.qset = (all.game?.qset as QChoice) || "quality";
    this.pool = poolFor(all.questions, this.qset);
    this.game = { ...(all.game as Game), winners: all.game?.winners ?? [], engine: this.tabId };
    const el = this.elapsed(serverNow());
    const f = frenzyAt(el);
    this.frenzyShown = f.on ? f.index : -1;
    await set(ref(db, "game/engine"), this.tabId);
    this.run();
  }

  private run() {
    this.stopListening();
    this.stops.push(
      onValue(ref(db, "answers"), (s) => {
        const answers = (s.val() ?? {}) as Record<string, { qid: string; choice: number }>;
        for (const [uid, a] of Object.entries(answers)) this.onAnswer(uid, a);
      }),
      onValue(ref(db, "game"), (s) => {
        const g = s.val() as Game | null;
        if (!g || g.engine !== this.tabId) {
          this.stop();
          return;
        }
        this.game = g;
      }),
      onValue(ref(db, "players"), (s) => {
        this.players = s.val() ?? {};
        for (const uid of Object.keys(this.states)) if (!this.players[uid]) delete this.states[uid];
      }),
      onValue(ref(db, "questions"), (s) => {
        const pool = poolFor(s.val(), this.qset);
        if (pool.length) this.pool = pool;
      }),
    );
    this.stopTicker = startTicker(() => this.tick(), 250);
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

  /** ms of fishing so far (the countdown not counted; pauses not counted). */
  private elapsed(now: number) {
    const g = this.game;
    if (!g?.endsAt) return 0;
    const clock = g.paused && g.pausedAt ? g.pausedAt : now;
    return GAME_MS - (g.endsAt - clock);
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
    if (this.game.goAt && this.game.goAt > (this.game.pausedAt ?? 0)) {
      this.game.goAt += shift;
      updates["game/goAt"] = this.game.goAt;
    }
    if (this.game.endsAt) {
      this.game.endsAt += shift;
      updates["game/endsAt"] = this.game.endsAt;
    }
    for (const [uid, st] of Object.entries(this.states)) {
      if (st.phase === "question") {
        st.deadline += shift;
        updates[`state/${uid}/deadline`] = st.deadline;
      } else if (st.phase === "result") {
        st.until += shift;
        updates[`state/${uid}/until`] = st.until;
      }
    }
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  async endNow() {
    await this.finish();
  }

  private ask(uid: string, now: number, updates: Record<string, unknown>) {
    const st = this.states[uid];
    const pick = pickQuestion(this.pool, new Set(Object.keys(this.used[uid] ?? {})));
    if (!pick) return;
    if (pick.reset) this.used[uid] = {};
    const q = pick.q;
    (this.used[uid] ??= {})[q.id] = true;
    const base = q.type === "tf" ? TF_OPTS : q.opts ?? [];
    const shuffled = q.type === "tf" ? { opts: base, correctIdx: q.ans } : shuffleOptions(base, q.ans);
    this.priv[uid] = { qid: q.id, correctIdx: shuffled.correctIdx };
    st.phase = "question";
    st.q = { id: q.id, type: q.type, q: q.q, opts: shuffled.opts };
    st.deadline = now + QUESTION_MS;
    updates[`state/${uid}`] = st;
    updates[`private/${uid}`] = this.priv[uid];
    updates[`used/${uid}`] = this.used[uid];
    updates[`answers/${uid}`] = null;
  }

  private onAnswer(uid: string, a: { qid: string; choice: number }) {
    if (!this.game || this.game.status !== "playing" || this.game.paused) return;
    const st = this.states[uid];
    const p = this.priv[uid];
    if (!st || !p || st.phase !== "question" || p.qid !== a.qid) return;
    void this.judge(uid, a.choice);
  }

  private tick() {
    if (!this.game || this.game.status !== "playing" || this.game.paused) return;
    const now = serverNow();
    if (this.game.goAt && now < this.game.goAt) return;
    if (this.game.endsAt && now >= this.game.endsAt) {
      void this.finish();
      return;
    }
    const f = frenzyAt(this.elapsed(now));
    if (f.on && f.index !== this.frenzyShown) {
      this.frenzyShown = f.index;
      void this.pushFeed({ at: now, uid: "", text: "🌀 FISHING FRENZY! Every fish weighs double for 30 s", tone: "win", k: "frenzy" });
      this.onEvent?.({ type: "frenzy" });
    }
    for (const [uid, st] of Object.entries(this.states)) {
      if (this.busy.has(uid)) continue;
      if (st.phase === "wait") void this.next(uid);
      else if (st.phase === "question" && now > st.deadline + GRACE_MS) void this.judge(uid, null);
      else if (st.phase === "result" && now > st.until) void this.next(uid);
    }
    if (now - this.ranksAt > RANKS_EVERY_MS) {
      this.ranksAt = now;
      const ranks = this.ranks();
      const key = JSON.stringify(ranks);
      if (key !== this.lastRanks) {
        this.lastRanks = key;
        void set(ref(db, "game/ranks"), ranks);
      }
    }
  }

  private ranks(): Record<string, number> {
    const out: Record<string, number> = {};
    rankFishers(Object.entries(this.states)).forEach(([u], i) => (out[u] = i + 1));
    return out;
  }

  private async next(uid: string) {
    const st = this.states[uid];
    if (!st || this.busy.has(uid)) return;
    this.busy.add(uid);
    try {
      const updates: Record<string, unknown> = {};
      this.ask(uid, serverNow(), updates);
      await update(ref(db), updates);
    } finally {
      this.busy.delete(uid);
    }
  }

  private async judge(uid: string, choice: number | null) {
    const st = this.states[uid];
    const p = this.priv[uid];
    if (!st || !p || st.phase !== "question" || this.busy.has(uid)) return;
    this.busy.add(uid);
    try {
      const now = serverNow();
      const correct = choice !== null && choice === p.correctIdx;
      const frenzy = frenzyAt(this.elapsed(now)).on;
      const { result, streak } = catchFor(st.streak, correct, { frenzy, timeout: choice === null, choice, correctIdx: p.correctIdx });
      st.streak = streak;
      st.result = result;
      st.seq += 1;
      addCatch(st, result);
      st.q = st.q ? { ...st.q } : null;
      st.phase = "result";
      st.until = now + RESULT_MS[result.kind];
      await update(ref(db), { [`answers/${uid}`]: null, [`state/${uid}`]: st });
      const who = `${tokenById(this.players[uid]?.token).emoji} ${this.players[uid]?.name ?? "Player"}`;
      await this.pushFeed(feedFor(now, uid, who, result));
      this.onEvent?.({ type: "catch", uid, result });
    } finally {
      this.busy.delete(uid);
    }
  }

  private async pushFeed(item: FeedItem) {
    const n = this.feedN++;
    const updates: Record<string, unknown> = { [`feed/${n}`]: item };
    if (n >= FEED_KEEP) updates[`feed/${n - FEED_KEEP}`] = null;
    await update(ref(db), updates);
  }

  private async finish() {
    if (!this.game || this.game.status === "ended") return;
    const now = serverNow();
    const order = rankFishers(Object.entries(this.states));
    const winners = order.slice(0, 3).map(([u]) => u);
    const ranks = this.ranks();
    this.game = { ...this.game, status: "ended", endedAt: now, paused: false, pausedAt: null, winners, ranks };
    const updates: Record<string, unknown> = { game: this.game, answers: null };
    for (const [uid, st] of Object.entries(this.states)) {
      st.phase = "done";
      st.rank = ranks[uid] ?? null;
      updates[`state/${uid}`] = st;
    }
    await update(ref(db), updates);
    await this.pushFeed({ at: now, uid: "", text: "🏁 Time's up! Thank you for fishing.", tone: "win" });
    this.onEvent?.({ type: "end" });
    this.stop();
  }
}

function feedFor(at: number, uid: string, who: string, r: Catch): FeedItem {
  const x2 = r.frenzy ? " (×2)" : "";
  if (r.kind === "snap") return { at, uid, text: `${who}: line snapped ✂️${r.timeout ? " (time up)" : ""}`, tone: "bad", k: "snap" };
  if (r.kind === "gold") return { at, uid, text: `✨ ${who} caught a SUPER BIG GOLDEN FISH: ${r.name} · ${r.kg} kg${x2}`, tone: "win", k: "gold", kg: r.kg, name: r.name };
  if (r.kind === "big") return { at, uid, text: `🐠 ${who} caught a BIG FISH: ${r.name} · ${r.kg} kg${x2}`, tone: "good", k: "big", kg: r.kg, name: r.name };
  return { at, uid, text: `🐟 ${who} caught a ${r.name} · ${r.kg} kg${x2}`, tone: "info", k: "fish", kg: r.kg, name: r.name };
}
