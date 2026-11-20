// Pull the Rope referee. Runs in the projector window only, like the other engines: it gives every player
// their own question stream, checks answers, moves the centre flag and runs the rounds (best of 3).
// It reuses the existing database paths (state, private, used, answers, feed, game), and the sides picked
// in the lobby live in clash/pick/{uid} like Quality Clash, so no new security rules are needed.
// The flag (game/ropeX) is written at most 4 times a second as one small number.
import { ref, get, onValue, update, set } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { tokenById } from "../lib/tokens.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import type { FeedItem, Game, Player, Question, RopeGame } from "../lib/types.ts";
import {
  NEXT_ROUND_MS,
  QUESTION_MS,
  READY_QID,
  RIGHT_MS,
  ROUND_MS,
  SIDE_NAME,
  SIGN,
  WRONG_MS,
  fixRopeState,
  heaveAt,
  judgeAnswer,
  lineOrder,
  matchWinner,
  mvpOrder,
  newRopeState,
  roundWinner,
  teamsFor,
  type RopeResult,
  type RopeState,
  type Side,
} from "./rules.ts";

const GRACE_MS = 800;
const FEED_KEEP = 12;

type Private = { qid: string; correctIdx: number };
type RawPick = { side?: string; at?: number };

const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

/** The database drops empty values: fill game.rope back in. */
export function fixRope(r: Partial<RopeGame> | null | undefined): RopeGame | null {
  if (!r) return null;
  return {
    round: r.round ?? 1,
    wins: { red: r.wins?.red ?? 0, blue: r.wins?.blue ?? 0 },
    phase: r.phase ?? "play",
    endsAt: r.endsAt ?? 0,
    breakUntil: r.breakUntil ?? null,
    ready: r.ready ?? {},
    last: r.last ?? null,
    right: { red: r.right?.red ?? 0, blue: r.right?.blue ?? 0 },
    champion: r.champion ?? null,
    teams: r.teams ?? {},
    order: { red: r.order?.red ?? [], blue: r.order?.blue ?? [] },
  };
}

/** The sides picked in the lobby (clash/pick/{uid}.side). */
export function sidesFrom(raw: Record<string, RawPick> | null | undefined): { side: Record<string, Side>; at: Record<string, number> } {
  const side: Record<string, Side> = {};
  const at: Record<string, number> = {};
  for (const [u, p] of Object.entries(raw ?? {})) {
    if (p?.side === "red" || p?.side === "blue") {
      side[u] = p.side;
      at[u] = p.at ?? 0;
    }
  }
  return { side, at };
}

export class RopeEngine {
  private players: Record<string, Player> = {};
  private states: Record<string, RopeState> = {};
  private priv: Record<string, Private> = {};
  private used: Record<string, Record<string, true>> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private game: Game | null = null;
  private rope: RopeGame | null = null;
  private x = 0;
  private xWritten = 0;
  private feedN = 0;
  private busy = new Set<string>();
  private stops: (() => void)[] = [];
  private timer: number | undefined;
  private heaveShown = -1;
  private ending = false;
  onEvent?: (e: { type: "pull"; uid: string; result: RopeResult } | { type: "heave" } | { type: "round"; win: Side | "draw" } | { type: "end" }) => void;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, gSnap, pickSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "game")), get(ref(db, "clash/pick"))]);
    const g0 = (gSnap.val() ?? {}) as Partial<Game>;
    this.qset = (g0.qset as QChoice) || "quality";
    this.players = playersSnap.val() ?? {};
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    if (!Object.keys(this.players).length) throw new Error("Nobody has joined yet.");
    const picks = sidesFrom(pickSnap.val());
    const teams = teamsFor(this.players, picks.side);
    const vals = Object.values(teams);
    if (!vals.includes("red") || !vals.includes("blue")) throw new Error("Pull the Rope needs at least 1 player on each side. / Perlu sekurang-kurangnya 1 pemain di setiap pihak.");

    const now = serverNow();
    this.states = {};
    this.priv = {};
    this.used = {};
    this.feedN = 0;
    this.heaveShown = -1;
    this.x = 0;
    this.xWritten = 0;
    const goAt = now + COUNTDOWN_MS;
    // Players who did not pick are written into a side too, so "Play again" keeps the same teams.
    const pickUpdates: Record<string, unknown> = {};
    for (const [u, s] of Object.entries(teams)) {
      if (picks.side[u] === s) continue;
      picks.at[u] = now + Object.keys(pickUpdates).length;
      pickUpdates[`clash/pick/${u}`] = { side: s, c: ["rope"], at: picks.at[u] };
    }
    this.rope = {
      round: 1,
      wins: { red: 0, blue: 0 },
      phase: "play",
      endsAt: goAt + ROUND_MS,
      breakUntil: null,
      last: null,
      right: { red: 0, blue: 0 },
      champion: null,
      teams,
      order: lineOrder(teams, picks.at, this.players),
    };
    this.game = {
      status: "playing",
      qset: this.qset,
      mode: "rope",
      engine: this.tabId,
      paused: false,
      pausedAt: null,
      startedAt: now,
      goAt,
      endedAt: null,
      winners: [],
      rope: this.rope,
      ropeX: 0,
    };
    for (const [u, s] of Object.entries(teams)) this.states[u] = newRopeState(s);
    await update(ref(db), { answers: null, private: {}, used: {}, state: this.states, feed: null, game: this.game, ...pickUpdates });
    await this.pushFeed({ at: now, uid: "", text: "💪 Pull the Rope! Round 1 of 3. Good luck!", tone: "info" });
    this.run();
  }

  async resume() {
    const all = (await get(ref(db))).val() ?? {};
    this.players = all.players ?? {};
    this.states = {};
    for (const [u, s] of Object.entries(all.state ?? {})) {
      const st = fixRopeState(s as RopeState);
      if (st) this.states[u] = st;
    }
    this.priv = all.private ?? {};
    this.used = all.used ?? {};
    const feed = all.feed ?? {};
    this.feedN = Math.max(0, ...Object.keys(feed).map(Number).filter((n) => !isNaN(n))) + 1;
    this.qset = (all.game?.qset as QChoice) || "quality";
    this.pool = poolFor(all.questions, this.qset);
    this.rope = fixRope(all.game?.rope);
    this.x = all.game?.ropeX ?? 0;
    this.xWritten = this.x;
    this.game = { ...(all.game as Game), winners: all.game?.winners ?? [], engine: this.tabId, rope: this.rope };
    const h = heaveAt(this.elapsed(serverNow()));
    this.heaveShown = h.on ? h.index : -1;
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
        // Keep our own flag and round (written by us); take pause changes from the database.
        this.game = { ...g, rope: this.rope, ropeX: this.x };
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
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  private stopListening() {
    this.stops.forEach((f) => f());
    this.stops = [];
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  stop() {
    this.stopListening();
  }

  /** ms into this round (pauses not counted). */
  private elapsed(now: number) {
    const g = this.game;
    const r = this.rope;
    if (!g || !r || r.phase !== "play") return 0;
    const clock = g.paused && g.pausedAt ? g.pausedAt : now;
    return ROUND_MS - (r.endsAt - clock);
  }

  private counts() {
    const c = { red: 0, blue: 0, total: 0 };
    for (const st of Object.values(this.states)) {
      c[st.side]++;
      c.total++;
    }
    return c;
  }

  async pause() {
    if (!this.game || this.game.paused) return;
    this.game = { ...this.game, paused: true, pausedAt: serverNow() };
    await update(ref(db, "game"), { paused: true, pausedAt: this.game.pausedAt });
  }

  async unpause() {
    if (!this.game || !this.game.paused || !this.rope) return;
    const shift = serverNow() - (this.game.pausedAt ?? serverNow());
    const updates: Record<string, unknown> = { "game/paused": false, "game/pausedAt": null };
    if (this.game.goAt && this.game.goAt > (this.game.pausedAt ?? 0)) {
      this.game.goAt += shift;
      updates["game/goAt"] = this.game.goAt;
    }
    this.rope.endsAt += shift;
    updates["game/rope/endsAt"] = this.rope.endsAt;
    if (this.rope.breakUntil) {
      this.rope.breakUntil += shift;
      updates["game/rope/breakUntil"] = this.rope.breakUntil;
    }
    for (const [uid, st] of Object.entries(this.states)) {
      if (st.phase === "question") {
        st.deadline += shift;
        st.askedAt += shift;
        updates[`state/${uid}/deadline`] = st.deadline;
        updates[`state/${uid}/askedAt`] = st.askedAt;
      } else if (st.phase === "result") {
        st.until += shift;
        updates[`state/${uid}/until`] = st.until;
      }
    }
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  /** Host "End game": more round wins wins; if level, the side the flag is on now. */
  async endNow() {
    if (!this.rope || !this.game || this.game.status === "ended") return;
    const w = this.rope.wins;
    const champion: Side | "draw" = w.red > w.blue ? "red" : w.blue > w.red ? "blue" : this.x > 0.0005 ? "blue" : this.x < -0.0005 ? "red" : "draw";
    await this.finish(champion);
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
    st.askedAt = now;
    updates[`state/${uid}`] = st;
    updates[`private/${uid}`] = this.priv[uid];
    updates[`used/${uid}`] = this.used[uid];
    updates[`answers/${uid}`] = null;
  }

  private onAnswer(uid: string, a: { qid: string; choice: number }) {
    if (a.qid === READY_QID) {
      void this.onReady(uid, a.choice);
      return;
    }
    if (!this.game || this.game.status !== "playing" || this.game.paused || this.rope?.phase !== "play") return;
    const st = this.states[uid];
    const p = this.priv[uid];
    if (!st || !p || st.phase !== "question" || p.qid !== a.qid) return;
    void this.judge(uid, a.choice);
  }

  /** A phone pressed READY between rounds. When everyone still in the game is ready, the countdown starts. */
  private async onReady(uid: string, round: number) {
    const r = this.rope;
    if (!this.game || this.game.status !== "playing" || !r || r.phase !== "break" || r.breakUntil || round !== r.round || !this.states[uid]) return;
    if (r.ready?.[uid]) return;
    r.ready = { ...(r.ready ?? {}), [uid]: true };
    const updates: Record<string, unknown> = { [`game/rope/ready/${uid}`]: true, [`answers/${uid}`]: null };
    if (Object.keys(this.states).every((u) => r.ready?.[u])) {
      r.breakUntil = serverNow() + NEXT_ROUND_MS;
      updates["game/rope/breakUntil"] = r.breakUntil;
    }
    await update(ref(db), updates);
  }

  /** Host: start the next round now, even if not everyone pressed READY. */
  async startRoundNow() {
    const r = this.rope;
    if (!this.game || this.game.status !== "playing" || !r || r.phase !== "break" || r.breakUntil) return;
    r.breakUntil = serverNow() + NEXT_ROUND_MS;
    await set(ref(db, "game/rope/breakUntil"), r.breakUntil);
  }

  private tick() {
    const g = this.game;
    const r = this.rope;
    if (!g || !r || g.status !== "playing" || g.paused || this.ending) return;
    const now = serverNow();
    if (g.goAt && now < g.goAt) return;
    if (r.phase === "break") {
      if (r.breakUntil && now >= r.breakUntil) void this.nextRound();
      // A player removed while the others wait: start once everyone left is ready.
      else if (!r.breakUntil && Object.keys(this.states).length && Object.keys(this.states).every((u) => r.ready?.[u])) {
        r.breakUntil = now + NEXT_ROUND_MS;
        void set(ref(db, "game/rope/breakUntil"), r.breakUntil);
      }
      return;
    }
    if (r.phase !== "play") return;
    if (now >= r.endsAt) {
      void this.endRound("time");
      return;
    }
    const h = heaveAt(this.elapsed(now));
    if (h.on && h.index !== this.heaveShown) {
      this.heaveShown = h.index;
      void this.pushFeed({ at: now, uid: "", text: "💥 HEAVE! Every pull counts double for 30 s", tone: "win", k: "heave" });
      this.onEvent?.({ type: "heave" });
    }
    for (const [uid, st] of Object.entries(this.states)) {
      if (this.busy.has(uid)) continue;
      if (st.phase === "wait") void this.next(uid);
      else if (st.phase === "question" && now > st.deadline + GRACE_MS) void this.judge(uid, null);
      else if (st.phase === "result" && now > st.until) void this.next(uid);
    }
    if (Math.abs(this.x - this.xWritten) > 0.0005) {
      this.xWritten = this.x;
      void set(ref(db, "game/ropeX"), Math.round(this.x * 10000) / 10000);
    }
  }

  private async next(uid: string) {
    const st = this.states[uid];
    if (!st || this.busy.has(uid) || this.rope?.phase !== "play") return;
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
    const r = this.rope;
    if (!st || !p || !r || st.phase !== "question" || this.busy.has(uid) || r.phase !== "play") return;
    this.busy.add(uid);
    try {
      const now = serverNow();
      const correct = choice !== null && choice === p.correctIdx;
      const c = this.counts();
      const heave = heaveAt(this.elapsed(now)).on;
      const ms = Math.max(0, now - st.askedAt);
      const { result, streak } = judgeAnswer(st.streak, correct, { ms, heave, sideCount: c[st.side], total: c.total, choice, correctIdx: p.correctIdx });
      st.streak = streak;
      st.bestStreak = Math.max(st.bestStreak, streak);
      st.result = result;
      st.seq += 1;
      st.answered += 1;
      if (correct) {
        st.correct += 1;
        st.pulled = Math.round((st.pulled + result.pull) * 10000) / 10000;
        if (!st.fastest || ms < st.fastest) st.fastest = Math.round(ms);
        r.right[st.side] += 1;
        this.x = Math.max(-1, Math.min(1, this.x + SIGN[st.side] * result.pull));
      }
      st.phase = "result";
      st.until = now + (correct ? RIGHT_MS : WRONG_MS);
      await update(ref(db), { [`answers/${uid}`]: null, [`state/${uid}`]: st, [`game/rope/right/${st.side}`]: r.right[st.side] });
      if (result.power) await this.pushFeed({ at: now, uid, text: `💪 ${this.who(uid)}: POWER PULL ×2 for ${SIDE_NAME[st.side].en}!`, tone: "good", k: "power" });
      this.onEvent?.({ type: "pull", uid, result });
      if (Math.abs(this.x) >= 1) await this.endRound("bank");
    } finally {
      this.busy.delete(uid);
    }
  }

  private who(uid: string) {
    return `${tokenById(this.players[uid]?.token).emoji} ${this.players[uid]?.name ?? "Player"}`;
  }

  private async endRound(how: "bank" | "time") {
    const r = this.rope;
    if (!r || r.phase !== "play" || this.ending) return;
    this.ending = true;
    try {
      const now = serverNow();
      const end = roundWinner(this.x, r.right, how);
      if (end.win !== "draw") r.wins[end.win] += 1;
      r.last = { ...end, at: now };
      const champion = matchWinner(r.wins, r.round);
      const text =
        end.win === "draw"
          ? `🤝 Round ${r.round} is a draw!`
          : `🏆 ${SIDE_NAME[end.win].en} wins round ${r.round}${end.how === "bank" ? " and pulls the others into the river! 💦" : " on time!"}`;
      if (champion) {
        await this.pushFeed({ at: now, uid: "", text, tone: "win", k: "round" });
        await this.finish(champion);
        return;
      }
      r.phase = "break";
      r.breakUntil = null;
      r.ready = {};
      const updates: Record<string, unknown> = { "game/rope": r, "game/ropeX": Math.round(this.x * 10000) / 10000, answers: null };
      for (const [uid, st] of Object.entries(this.states)) {
        st.phase = "break";
        st.q = null;
        updates[`state/${uid}`] = st;
      }
      this.xWritten = this.x;
      await update(ref(db), updates);
      await this.pushFeed({ at: now, uid: "", text, tone: "win", k: "round" });
      this.onEvent?.({ type: "round", win: end.win });
    } finally {
      this.ending = false;
    }
  }

  private async nextRound() {
    const r = this.rope;
    if (!r || r.phase !== "break") return;
    const now = serverNow();
    r.round += 1;
    r.phase = "play";
    r.breakUntil = null;
    r.ready = {};
    r.endsAt = now + ROUND_MS;
    r.right = { red: 0, blue: 0 };
    this.x = 0;
    this.xWritten = 0;
    this.heaveShown = -1;
    const updates: Record<string, unknown> = { "game/rope": r, "game/ropeX": 0 };
    for (const [uid, st] of Object.entries(this.states)) {
      st.phase = "wait";
      st.streak = 0;
      st.result = null;
      updates[`state/${uid}`] = st;
    }
    await update(ref(db), updates);
    await this.pushFeed({ at: now, uid: "", text: `💪 Round ${r.round}! Pull!`, tone: "info", k: "round" });
  }

  private async pushFeed(item: FeedItem) {
    const n = this.feedN++;
    const updates: Record<string, unknown> = { [`feed/${n}`]: item };
    if (n >= FEED_KEEP) updates[`feed/${n - FEED_KEEP}`] = null;
    await update(ref(db), updates);
  }

  private async finish(champion: Side | "draw") {
    if (!this.game || !this.rope || this.game.status === "ended") return;
    const now = serverNow();
    const r = this.rope;
    r.phase = "done";
    r.champion = champion;
    if (!r.last || r.last.at < now - 1000) r.last = { win: champion, how: "host", x: this.x, at: now };
    const mvp = mvpOrder(Object.entries(this.states));
    this.game = { ...this.game, status: "ended", endedAt: now, paused: false, pausedAt: null, winners: mvp.slice(0, 1).map(([u]) => u), rope: r, ropeX: Math.round(this.x * 10000) / 10000 };
    const updates: Record<string, unknown> = { game: this.game, answers: null };
    for (const [uid, st] of Object.entries(this.states)) {
      st.phase = "done";
      st.q = null;
      updates[`state/${uid}`] = st;
    }
    await update(ref(db), updates);
    await this.pushFeed({ at: now, uid: "", text: champion === "draw" ? "🤝 It's a draw! Thank you for playing." : `🏆 ${SIDE_NAME[champion].en} wins the match! Terima kasih!`, tone: "win", k: "round" });
    this.onEvent?.({ type: "end" });
    this.stop();
  }
}
