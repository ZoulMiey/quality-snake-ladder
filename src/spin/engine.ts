// Quality Spin referee. Runs in the projector window only, like the other engines. Each team (Red, Blue) has
// its own phrase, question stream and wheel; only the captain's phone sends actions. Everything phones see is
// in game/spin (small: two team objects); the phrases and right answers stay in private/spin (host only).
// Phones send actions through answers/{captain} = { qid, choice } (see encodeAction in rules.ts), and the
// teams and captains are picked in the lobby in clash/pick/{uid} = { side, c: ["spin"] or ["spin", "cap"] },
// so no new security rules are needed.
import { startTicker } from "../lib/ticker.ts";
import { ref, get, onValue, update, set } from "../lib/store.ts";
import { db, serverNow } from "../lib/firebase.ts";
import { readAll } from "../lib/readAll.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import type { Game, Player, Question } from "../lib/types.ts";
import { PHRASES } from "./phrases.ts";
import {
  CONSONANTS,
  QUESTION_MS,
  SIDES,
  WHEEL,
  canBuyVowel,
  decodeAction,
  fixSpin,
  maskOf,
  newTeam,
  onAgain,
  onAnswer,
  onFlick,
  onLand,
  onLetter,
  onSolve,
  onVowel,
  teamsFrom,
  winnerOf,
  type Minutes,
  type Side,
  type SpinGame,
  type SpinSecret,
  type SpinTeam,
} from "./rules.ts";

const GRACE_MS = 800;
const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

type RawPick = { side?: string; at?: number; c?: unknown };

/** Lobby picks for Quality Spin (clash/pick/{uid} with "spin" in c). */
export function spinPicksFrom(raw: Record<string, RawPick> | null | undefined): Record<string, { side: Side; at: number; cap: boolean }> {
  const out: Record<string, { side: Side; at: number; cap: boolean }> = {};
  for (const [u, p] of Object.entries(raw ?? {})) {
    if (p?.side !== "red" && p?.side !== "blue") continue;
    const c = Array.isArray(p.c) ? p.c : Object.values((p.c as Record<string, string>) ?? {});
    if (!c.includes("spin")) continue;
    out[u] = { side: p.side, at: p.at ?? 0, cap: c.includes("cap") };
  }
  return out;
}

function shuffled<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export class SpinEngine {
  private players: Record<string, Player> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private game: Game | null = null;
  private spin: SpinGame | null = null;
  private secret: Record<Side, SpinSecret> = { red: { phrase: 0, qid: "", correctIdx: 0, order: [], next: 0 }, blue: { phrase: 0, qid: "", correctIdx: 0, order: [], next: 0 } };
  private used: Record<Side, Set<string>> = { red: new Set(), blue: new Set() };
  private busy = new Set<Side>();
  private stops: (() => void)[] = [];
  private stopTicker: (() => void) | undefined;
  private ending = false;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, gSnap, pickSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "game")), get(ref(db, "clash/pick"))]);
    const g0 = (gSnap.val() ?? {}) as Partial<Game>;
    this.qset = (g0.qset as QChoice) || "quality";
    const mins: Minutes = g0.spinMins === 3 ? 3 : 5;
    this.players = playersSnap.val() ?? {};
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    // App solo: the one player is Red's captain; there is no Blue team.
    const solo = !!g0.spinSolo;
    const teams = solo
      ? { red: { members: Object.keys(this.players).slice(0, 1), extra: [], captain: Object.keys(this.players)[0] ?? "" }, blue: { members: [] as string[], extra: [], captain: "" } }
      : teamsFrom(spinPicksFrom(pickSnap.val()), (u) => !!this.players[u]);
    if (!solo && (!teams.red.members.length || !teams.blue.members.length)) throw new Error("Quality Spin needs at least 1 player on Red and 1 on Blue. / Perlu sekurang-kurangnya 1 pemain Merah dan 1 Biru.");

    const now = serverNow();
    const goAt = now + COUNTDOWN_MS;
    // Each team gets its own phrases, never the same one in a game.
    const order = shuffled(PHRASES.map((_, i) => i));
    this.secret = {
      red: { phrase: 0, qid: "", correctIdx: 0, order: order.filter((_, i) => i % 2 === 0), next: 0 },
      blue: { phrase: 0, qid: "", correctIdx: 0, order: order.filter((_, i) => i % 2 === 1), next: 0 },
    };
    this.used = { red: new Set(), blue: new Set() };
    this.spin = {
      mins,
      red: newTeam("red", teams.red.members, teams.red.captain),
      blue: newTeam("blue", teams.blue.members, teams.blue.captain),
      champion: null,
    };
    for (const s of SIDES) {
      const t = this.spin[s];
      if (!t.members.length) {
        t.phase = "done";
        continue;
      }
      this.newPhrase(s);
      this.ask(s, goAt);
      // The spin starts with the wheel at rest.
      t.spin = null;
    }
    this.game = {
      status: "playing",
      qset: this.qset,
      mode: "spin",
      engine: this.tabId,
      paused: false,
      pausedAt: null,
      startedAt: now,
      goAt,
      endedAt: null,
      winners: [],
      endsAt: goAt + mins * 60_000,
      spinMins: mins,
      ...(solo ? { spinSolo: true } : {}),
      spin: this.spin,
    };
    // Captains chosen at Start (nobody tapped) are written back, so "Play again" keeps them.
    const pickUpdates: Record<string, unknown> = {};
    for (const s of SIDES) {
      const cap = this.spin[s].captain;
      if (cap && !solo) pickUpdates[`clash/pick/${cap}/c`] = ["spin", "cap"];
    }
    await update(ref(db), { answers: null, state: null, feed: null, used: null, game: this.game, "private/spin": this.secret, ...pickUpdates });
    this.run();
  }

  async resume() {
    const all = await readAll();
    this.players = all.players ?? {};
    this.qset = (all.game?.qset as QChoice) || "quality";
    this.pool = poolFor(all.questions, this.qset);
    this.spin = fixSpin(all.game?.spin);
    const sec = all.private?.spin ?? {};
    for (const s of SIDES) {
      const x = sec[s] ?? {};
      this.secret[s] = { phrase: x.phrase ?? 0, qid: x.qid ?? "", correctIdx: x.correctIdx ?? 0, order: x.order ?? PHRASES.map((_, i) => i), next: x.next ?? 0 };
    }
    this.game = { ...(all.game as Game), winners: all.game?.winners ?? [], engine: this.tabId, spin: this.spin };
    await set(ref(db, "game/engine"), this.tabId);
    this.run();
  }

  private run() {
    this.stopListening();
    this.stops.push(
      onValue(ref(db, "answers"), (s) => {
        const answers = (s.val() ?? {}) as Record<string, { qid: string; choice: number }>;
        for (const [uid, a] of Object.entries(answers)) void this.onAction(uid, a);
      }),
      onValue(ref(db, "game"), (s) => {
        const g = s.val() as Game | null;
        if (!g || g.engine !== this.tabId) {
          this.stop();
          return;
        }
        // Keep our own teams (written by us); take pause changes from the database.
        this.game = { ...g, spin: this.spin };
      }),
      onValue(ref(db, "players"), (s) => {
        this.players = s.val() ?? {};
        // A captain who was removed: the next teammate takes over.
        if (!this.spin) return;
        for (const side of SIDES) {
          const t = this.spin[side];
          if (t.captain && !this.players[t.captain]) {
            const next = t.members.find((u) => this.players[u]) ?? "";
            if (next !== t.captain) {
              t.captain = next;
              void set(ref(db, `game/spin/${side}/captain`), next);
            }
          }
        }
      }),
      onValue(ref(db, "questions"), (s) => {
        const pool = poolFor(s.val(), this.qset);
        if (pool.length) this.pool = pool;
      }),
    );
    this.stopTicker = startTicker(() => this.tick(), 200);
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
    if (!this.game || !this.game.paused || !this.spin) return;
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
    for (const s of SIDES) {
      const t = this.spin[s];
      t.until += shift;
      if (t.spin) t.spin.at += shift;
      updates[`game/spin/${s}`] = t;
    }
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  async endNow() {
    await this.finish();
  }

  /** The team's next phrase. */
  private newPhrase(side: Side) {
    const t = this.spin![side];
    const sec = this.secret[side];
    if (sec.next >= sec.order.length) {
      sec.order = shuffled(sec.order);
      sec.next = 0;
    }
    sec.phrase = sec.order[sec.next++];
    const ph = PHRASES[sec.phrase];
    t.used = "";
    t.board = maskOf(ph.p, "");
    t.hint = { en: ph.en, ms: ph.ms };
    t.puzzle += 1;
    t.mult = 1;
  }

  /** A new question for the team; the clock starts at `from` (the end of the countdown at the start). */
  private ask(side: Side, from: number) {
    const t = this.spin![side];
    const pick = pickQuestion(this.pool, this.used[side]);
    if (!pick) return;
    if (pick.reset) this.used[side] = new Set();
    const q = pick.q;
    this.used[side].add(q.id);
    const base = q.type === "tf" ? TF_OPTS : q.opts ?? [];
    const sh = q.type === "tf" ? { opts: base, correctIdx: q.ans } : shuffleOptions(base, q.ans);
    this.secret[side].qid = q.id;
    this.secret[side].correctIdx = sh.correctIdx;
    t.q = { id: q.id, type: q.type, q: q.q, opts: sh.opts };
    t.phase = "question";
    t.until = from + QUESTION_MS;
    t.seq++;
  }

  private phrase(side: Side) {
    return PHRASES[this.secret[side].phrase].p;
  }

  private async save(side: Side, uid?: string) {
    const updates: Record<string, unknown> = { [`game/spin/${side}`]: this.spin![side], [`private/spin/${side}`]: this.secret[side] };
    if (uid) updates[`answers/${uid}`] = null;
    await update(ref(db), updates);
  }

  private async onAction(uid: string, raw: { qid: string; choice: number }) {
    const g = this.game;
    const sp = this.spin;
    if (!g || !sp || g.status !== "playing" || g.paused || this.ending) return;
    const now = serverNow();
    if (g.goAt && now < g.goAt) return;
    const side = SIDES.find((s) => sp[s].captain === uid);
    if (!side) {
      // Not a captain (or an old tap): just clear it.
      void set(ref(db, `answers/${uid}`), null);
      return;
    }
    if (this.busy.has(side)) return;
    const t = sp[side];
    const a = decodeAction(raw);
    this.busy.add(side);
    try {
      let ok = false;
      if (a?.k === "answer") {
        if (t.phase === "question" && a.qid === this.secret[side].qid) {
          const correct = a.choice === this.secret[side].correctIdx;
          onAnswer(t, correct, now, correct ? null : t.q?.opts[this.secret[side].correctIdx] ?? null);
          ok = true;
        }
      } else if (a && a.seq === t.seq) {
        if (a.k === "flick" && t.phase === "flick") {
          onFlick(t, Math.floor(Math.random() * WHEEL.length), now, a.power, Math.random() * 2 - 1);
          ok = true;
        } else if (a.k === "letter" && t.phase === "letter" && CONSONANTS.includes(a.L) && !t.used.includes(a.L)) {
          onLetter(t, this.phrase(side), a.L, now);
          ok = true;
        } else if (a.k === "vowel" && t.phase === "choice" && canBuyVowel(t) && !t.used.includes(a.L)) {
          onVowel(t, this.phrase(side), a.L, now);
          ok = true;
        } else if (a.k === "solve" && t.phase === "choice" && a.text.trim()) {
          onSolve(t, this.phrase(side), a.text, now);
          ok = true;
        } else if (a.k === "again" && t.phase === "choice") {
          onAgain(t);
          this.ask(side, now);
          ok = true;
        }
      }
      if (ok) await this.save(side, uid);
      else await set(ref(db, `answers/${uid}`), null);
    } finally {
      this.busy.delete(side);
    }
  }

  private tick() {
    const g = this.game;
    const sp = this.spin;
    if (!g || !sp || g.status !== "playing" || g.paused || this.ending) return;
    const now = serverNow();
    if (g.goAt && now < g.goAt) return;
    if (g.endsAt && now >= g.endsAt) {
      void this.finish();
      return;
    }
    for (const side of SIDES) {
      if (this.busy.has(side)) continue;
      const t = sp[side];
      let changed = false;
      if (t.phase === "question" && now > t.until + GRACE_MS) {
        onAnswer(t, false, now, t.q?.opts[this.secret[side].correctIdx] ?? null, true);
        changed = true;
      } else if (t.phase === "flick" && now > t.until) {
        onFlick(t, Math.floor(Math.random() * WHEEL.length), now, 0.5, Math.random() * 2 - 1);
        changed = true;
      } else if (t.phase === "spinning" && now >= t.until) {
        onLand(t, now, [...CONSONANTS].some((c) => !t.used.includes(c)));
        changed = true;
      } else if (t.phase === "letter" && now > t.until + GRACE_MS) {
        onLetter(t, this.phrase(side), null, now);
        changed = true;
      } else if (t.phase === "choice" && now > t.until) {
        onAgain(t);
        this.ask(side, now);
        changed = true;
      } else if (t.phase === "stun" && now >= t.until) {
        this.ask(side, now);
        changed = true;
      } else if (t.phase === "solved" && now >= t.until) {
        this.newPhrase(side);
        this.ask(side, now);
        changed = true;
      }
      if (changed) {
        this.busy.add(side);
        void this.save(side).finally(() => this.busy.delete(side));
      }
    }
  }

  private async finish() {
    if (!this.game || !this.spin || this.game.status === "ended" || this.ending) return;
    this.ending = true;
    try {
      const now = serverNow();
      const sp = this.spin;
      const champion = winnerOf(sp.red, sp.blue);
      sp.champion = champion;
      for (const s of SIDES) {
        sp[s].phase = "done";
        sp[s].q = null;
        // The phrase they were on is shown at the end.
        sp[s].reveal = this.phrase(s);
      }
      const winners = champion === "draw" ? [] : sp[champion].members;
      this.game = { ...this.game, status: "ended", endedAt: now, paused: false, pausedAt: null, winners, spin: sp };
      await update(ref(db), { game: this.game, answers: null });
    } finally {
      this.ending = false;
      this.stop();
    }
  }
}

export type { SpinTeam };
