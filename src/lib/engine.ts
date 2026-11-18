// The game engine. It runs in the projector window only, and is the single referee:
// it gives out questions, checks answers, rolls the dice and moves the pieces.
import { ref, get, onValue, update, set } from "firebase/database";
import { db, serverNow } from "./firebase.ts";
import { resolve, pickQuestion, shuffleOptions } from "./rules.ts";
import { LAST_BOX } from "./board.ts";
import { tokenById } from "./tokens.ts";
import { eventById, placeSpecials } from "./specials.ts";
import { fixStates, type FeedItem, type Game, type Player, type PlayerState, type Question, type QuestionKind, type Result } from "./types.ts";

export const QUESTION_MS = 30_000;
/** "Get ready" countdown before the first question. */
export const COUNTDOWN_MS = 5_000;
export const MAX_WINNERS = 5;
const RESULT_MS_DICE = 3_000;
const RESULT_MS_SHORT = 2_200;
/** Waiting time after a wrong answer (always 5 seconds, however many wrong answers). */
export const PENALTY_MS = 5_000;
/** Extra time to read the message after landing on a quality event box. */
const SPECIAL_EXTRA_MS = 2_000;
const GRACE_MS = 800;
const FEED_KEEP = 14;

type Private = { qid: string; correctIdx: number };

const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

export class Engine {
  private players: Record<string, Player> = {};
  private states: Record<string, PlayerState> = {};
  private priv: Record<string, Private> = {};
  private used: Record<string, Record<string, true>> = {};
  private pool: Question[] = [];
  private game: Game | null = null;
  private feed: FeedItem[] = [];
  private busy = new Set<string>();
  private stops: (() => void)[] = [];
  private timer: number | undefined;
  onEvent?: (e: { type: "result"; uid: string; result: Result } | { type: "end" }) => void;

  constructor(readonly tabId: string) {}

  /** Start a new game with everyone in the lobby. */
  async start() {
    const [playersSnap, qSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions"))]);
    this.players = playersSnap.val() ?? {};
    this.pool = Object.values((qSnap.val() ?? {}) as Record<string, Question>).filter((q) => q.enabled);
    if (!this.pool.length) throw new Error("There are no questions switched on. Open Questions and switch some on.");
    if (!Object.keys(this.players).length) throw new Error("Nobody has joined yet.");

    const now = serverNow();
    this.states = {};
    this.priv = {};
    this.used = {};
    this.feed = [{ at: now, uid: "", text: "Game started! Good luck everyone.", tone: "info" }];
    this.game = { status: "playing", engine: this.tabId, paused: false, pausedAt: null, startedAt: now, goAt: now + COUNTDOWN_MS, endedAt: null, winners: [], specials: placeSpecials() };

    const updates: Record<string, unknown> = {
      answers: null,
      private: null,
      used: null,
      state: null,
      feed: this.feed,
      game: this.game,
    };
    for (const uid of Object.keys(this.players)) {
      this.states[uid] = {
        pos: 0,
        streak: 0,
        phase: "wait",
        kind: "turn",
        q: null,
        deadline: 0,
        until: 0,
        result: null,
        seq: 0,
        rank: null,
        correct: 0,
        answered: 0,
      };
    }
    // The first questions go out when the countdown ends (see tick).
    // One write for each section (Firebase refuses a section and an item inside it in the same update).
    for (const k of Object.keys(updates)) if (k.includes("/")) delete updates[k];
    updates.state = this.states;
    updates.private = this.priv;
    updates.used = this.used;
    await update(ref(db), updates);
    this.run();
  }

  /** Take over a game already running (for example after the projector page was reloaded). */
  async resume() {
    const snap = await get(ref(db));
    const all = snap.val() ?? {};
    this.players = all.players ?? {};
    this.states = fixStates(all.state);
    this.priv = all.private ?? {};
    this.used = all.used ?? {};
    this.feed = all.feed ?? [];
    this.pool = Object.values((all.questions ?? {}) as Record<string, Question>).filter((q) => q.enabled);
    this.game = { ...(all.game as Game), winners: all.game?.winners ?? [], engine: this.tabId };
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
          // Another window took over, or the game was reset.
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
        const pool = Object.values((s.val() ?? {}) as Record<string, Question>).filter((q) => q.enabled);
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

  private ask(uid: string, kind: QuestionKind, now: number, updates: Record<string, unknown>) {
    const st = this.states[uid];
    const used = new Set(Object.keys(this.used[uid] ?? {}));
    const pick = pickQuestion(this.pool, used);
    if (!pick) return;
    if (pick.reset) this.used[uid] = {};
    const q = pick.q;
    (this.used[uid] ??= {})[q.id] = true;
    const base = q.type === "tf" ? TF_OPTS : q.opts ?? [];
    const shuffled = q.type === "tf" ? { opts: base, correctIdx: q.ans } : shuffleOptions(base, q.ans);
    this.priv[uid] = { qid: q.id, correctIdx: shuffled.correctIdx };
    st.phase = "question";
    st.kind = kind;
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
    for (const [uid, st] of Object.entries(this.states)) {
      if (this.busy.has(uid)) continue;
      if (st.phase === "wait") {
        void this.next(uid);
        continue;
      }
      if (st.phase === "question" && now > st.deadline + GRACE_MS) void this.judge(uid, null);
      else if (st.phase === "result" && now > st.until) void this.next(uid);
    }
  }

  private async next(uid: string) {
    const st = this.states[uid];
    if (!st || this.busy.has(uid)) return;
    this.busy.add(uid);
    try {
      const updates: Record<string, unknown> = {};
      this.ask(uid, st.result?.next ?? "turn", serverNow(), updates);
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
      const { result, pos, streak } = resolve(st.pos, st.streak, st.kind, correct, {
        timeout: choice === null,
        choice,
        correctIdx: p.correctIdx,
        specials: this.game?.specials,
      });
      st.pos = pos;
      st.streak = streak;
      st.result = result;
      st.seq += 1;
      st.answered += 1;
      if (correct) st.correct += 1;
      st.q = { ...(st.q as NonNullable<PlayerState["q"]>) };

      const updates: Record<string, unknown> = { [`answers/${uid}`]: null };
      const name = this.players[uid]?.name ?? "Player";
      const icon = tokenById(this.players[uid]?.token).emoji;
      this.pushFeed(now, uid, describe(icon, name, result), result.special ? ((eventById(result.special)?.move ?? 0) > 0 ? "good" : "bad") : undefined);

      if (result.outcome === "win") {
        const winners = [...(this.game?.winners ?? []), uid];
        st.rank = winners.length;
        st.phase = "won";
        this.game = { ...(this.game as Game), winners };
        updates["game/winners"] = winners;
        this.pushFeed(now, uid, `🏆 ${icon} ${name} finished #${st.rank}!`, "win");
      } else {
        st.phase = "result";
        st.until = now + (result.penalty ? PENALTY_MS : result.dice.length ? RESULT_MS_DICE : RESULT_MS_SHORT) + (result.special ? SPECIAL_EXTRA_MS : 0);
      }
      updates[`state/${uid}`] = st;
      updates.feed = this.feed;
      await update(ref(db), updates);
      this.onEvent?.({ type: "result", uid, result });

      const total = Object.keys(this.players).length;
      const winners = this.game?.winners?.length ?? 0;
      if (winners >= Math.min(MAX_WINNERS, total)) await this.finish();
    } finally {
      this.busy.delete(uid);
    }
  }

  private pushFeed(at: number, uid: string, text: string, tone?: FeedItem["tone"]) {
    this.feed = [...this.feed, { at, uid, text, tone: tone ?? "info" }].slice(-FEED_KEEP);
  }

  private async finish() {
    if (!this.game || this.game.status === "ended") return;
    const now = serverNow();
    this.game = { ...this.game, status: "ended", endedAt: now, paused: false, pausedAt: null };
    this.pushFeed(now, "", "Game over! Thank you for playing.", "win");
    const updates: Record<string, unknown> = { game: this.game, feed: this.feed, answers: null };
    for (const [uid, st] of Object.entries(this.states)) {
      if (st.phase !== "won") {
        st.phase = "wait";
        updates[`state/${uid}`] = st;
      }
    }
    await update(ref(db), updates);
    this.onEvent?.({ type: "end" });
    this.stop();
  }
}

function describe(icon: string, name: string, r: Result): string {
  const who = `${icon} ${name}`;
  const mark = r.timeout ? "⏰" : r.correct ? "✔" : "✘";
  const roll = r.dice.length ? ` rolled ${r.dice.join("+")}${r.bonus ? " (2-dice bonus!)" : ""}` : "";
  switch (r.outcome) {
    case "move": {
      const tail = r.next === "snake" ? " 🐍" : r.next === "ladder" ? " 🪜" : "";
      const ev = eventById(r.special);
      if (ev)
        return `${who} ${mark}${roll} → box ${r.land} ${ev.icon} ${ev.en} ${ev.move > 0 ? "Forward" : "Back"} ${Math.abs(ev.move)} → box ${r.to}${tail}`;
      return `${who} ${mark}${roll} → box ${r.to}${tail}`;
    }
    case "win":
      return `${who} ${mark}${roll} → box ${LAST_BOX}!`;
    case "noroll":
      return `${who} ${mark} no roll, waits 5 seconds`;
    case "climb":
      return `🪜 ${who} ✔ climbed the ladder to box ${r.to}`;
    case "nolad":
      return `${who} ${mark} missed the ladder, stays at box ${r.to}`;
    case "safe":
      return `${who} ✔ escaped the snake at box ${r.to}`;
    case "slide":
      return `🐍 ${who} ${mark} slid down to box ${r.to}`;
  }
}

/** Remove everything from the last game. Players will need to join again. */
export async function resetGame() {
  await update(ref(db), {
    game: { status: "lobby", engine: null, paused: false, pausedAt: null, startedAt: null, goAt: null, endedAt: null, winners: [] },
    players: null,
    tokens: null,
    state: null,
    private: null,
    used: null,
    answers: null,
    feed: null,
  });
}

/** Back to the lobby with the same players (they don't need to scan again). */
export async function playAgain() {
  await update(ref(db), {
    game: { status: "lobby", engine: null, paused: false, pausedAt: null, startedAt: null, goAt: null, endedAt: null, winners: [] },
    state: null,
    private: null,
    used: null,
    answers: null,
    feed: null,
  });
}

export async function removePlayer(uid: string, token: string | undefined) {
  const updates: Record<string, unknown> = {
    [`players/${uid}`]: null,
    [`state/${uid}`]: null,
    [`private/${uid}`]: null,
    [`answers/${uid}`]: null,
  };
  if (token) updates[`tokens/${token}`] = null;
  await update(ref(db), updates);
}

