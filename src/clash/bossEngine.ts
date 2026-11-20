// The Boss Raid referee. It runs in the projector window only: it gives each player their own
// question stream, makes their monsters hit the Titan, runs the Titan's stomps and the revive questions.
import { startTicker } from "../lib/ticker.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { get, onValue, ref, set, update } from "firebase/database";
import { db, serverNow } from "../lib/firebase.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import type { FeedItem, Game, Player, Question } from "../lib/types.ts";
import { FAST_MS, STUN_MS } from "./sim.ts";
import { CLASH_QUESTION_MS, type ClashQ } from "./engine.ts";
import { STOMP_EVERY_MS, newRaid, raidHit, raidMiss, raidRanking, raidRevive, raidStomp, raiderState, type BossMode, type Raid } from "./boss.ts";

const RESULT_MS = 1_800;
/** A counter-stomp lands this long after the hit that set it off (more than one: spaced out). */
const COUNTER_DELAY_MS = 1_200;
const COUNTER_GAP_MS = 1_500;
const GRACE_MS = 600;
const EVENTS_KEEP = 24;
const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

/** What the screens see. nextStomp: server time of the next stomp. pausedMs: time spent paused (left out of the clock). */
export type RaidBoard = Raid & { nextStomp: number; stun?: Record<string, number>; pausedMs: number; counters?: number; counterAt?: number | null };
export type RaidEvent =
  | { n: number; at: number; kind: "atk"; uid: string; dmg: number; fast: boolean; sup: boolean; blk?: number }
  | { n: number; at: number; kind: "rage"; sh: number; stomp: number }
  | { n: number; at: number; kind: "wrong"; uid: string; timeout: boolean }
  | { n: number; at: number; kind: "stomp"; dmg: number; hit: string[]; fainted: string[]; counter?: boolean }
  | { n: number; at: number; kind: "revive"; uid: string; ok: boolean };
/** Best Time Attack time, kept until the host presses "Clear records". */
export type RaidBest = { ms: number; n: number; at: number; names: string[] };
/** The finished raid, for the results screens. */
export type RaidResult = { winner: "players" | "titan"; mode: BossMode; ms: number; rank: { uid: string; pts: number; rights: number }[]; newBest: boolean; best: RaidBest | null };
type QState = { open: boolean; qid: string; correctIdx: number; askedAt: number; deadline: number; nextAt: number; seq: number; revive: boolean };

export class BossEngine {
  private players: Record<string, Player> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private used: Record<string, Record<string, true>> = {};
  private qs: Record<string, QState> = {};
  private game: Game | null = null;
  private r: RaidBoard | null = null;
  private events: RaidEvent[] = [];
  private evN = 0;
  private stops: (() => void)[] = [];
  private stopTicker: (() => void) | undefined;
  private finishing = false;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, pickSnap, gameSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "clash/pick")), get(ref(db, "game"))]);
    this.players = playersSnap.val() ?? {};
    this.qset = ((gameSnap.val() as Game | null)?.qset as QChoice) || "quality";
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    const mode: BossMode = (gameSnap.val() as Game | null)?.bossMode === "hs" ? "hs" : "ta";
    const picks = Object.entries((pickSnap.val() ?? {}) as Record<string, { c?: string[] | Record<string, string>; at?: number }>)
      .filter(([uid]) => this.players[uid])
      .map(([uid, p]) => ({ uid, c: Array.isArray(p.c) ? p.c : Object.values(p.c ?? {}), at: p.at }));
    const raid = newRaid(mode, picks);
    if (!Object.keys(raid.raiders).length) throw new Error("Boss Raid needs at least one player with a monster.");
    const now = serverNow();
    const goAt = now + COUNTDOWN_MS;
    this.r = { ...raid, nextStomp: goAt + STOMP_EVERY_MS, stun: {}, pausedMs: 0 };
    this.used = {};
    this.qs = Object.fromEntries(Object.keys(raid.raiders).map((u) => [u, blankQ()]));
    this.events = [];
    this.evN = 0;
    const feed: FeedItem[] = [{ at: now, uid: "", text: "👹 The Defect Titan appears!", tone: "info" }];
    this.game = { status: "playing", qset: this.qset, mode: "clash", clashFormat: "boss", bossMode: mode, engine: this.tabId, paused: false, pausedAt: null, startedAt: now, goAt, endedAt: null, winners: [] };
    await update(ref(db), {
      game: this.game,
      feed,
      "clash/raid": this.r,
      "clash/rev": null,
      "clash/q": null,
      "clash/result": null,
      "clash/b": null,
      "clash/ev": null,
      answers: null,
      private: null,
      used: null,
      state: null,
    });
    this.run();
  }

  /** Carry on a raid after the projector page was reloaded. */
  async resume() {
    const [g, raid, ev, priv, qSnap, pSnap, usedSnap] = await Promise.all(
      ["game", "clash/raid", "clash/rev", "private/clash", "questions", "players", "used"].map((p) => get(ref(db, p)).then((s) => s.val())),
    );
    this.players = pSnap ?? {};
    this.qset = ((g as Game | null)?.qset as QChoice) || "quality";
    this.pool = poolFor(qSnap, this.qset);
    this.used = usedSnap ?? {};
    this.r = fixRaid(raid);
    this.events = fixRaidEvents(ev);
    this.evN = this.events.reduce((m, e) => Math.max(m, e.n), 0);
    this.qs = priv?.qs ?? {};
    if (this.r) for (const u of Object.keys(this.r.raiders)) this.qs[u] ??= blankQ();
    this.game = { ...(g as Game), engine: this.tabId };
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
        if (!g || g.engine !== this.tabId) return this.stop();
        this.game = g;
      }),
      onValue(ref(db, "players"), (s) => {
        this.players = s.val() ?? {};
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
    if (!this.game || !this.game.paused || !this.r) return;
    const pausedAt = this.game.pausedAt ?? serverNow();
    const shift = serverNow() - pausedAt;
    const r = this.r;
    const updates: Record<string, unknown> = { "game/paused": false, "game/pausedAt": null };
    if (this.game.goAt && this.game.goAt > pausedAt) updates["game/goAt"] = this.game.goAt + shift;
    else r.pausedMs += shift;
    r.nextStomp += shift;
    if (r.counterAt) r.counterAt += shift;
    for (const uid of Object.keys(r.stun ?? {})) r.stun![uid] += shift;
    for (const [uid, q] of Object.entries(this.qs)) {
      q.nextAt += shift;
      q.askedAt += shift;
      if (q.open) {
        q.deadline += shift;
        updates[`clash/q/${uid}/deadline`] = q.deadline;
      }
    }
    updates["clash/raid"] = r;
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  async endNow() {
    await this.finish();
  }

  private tick() {
    const r = this.r;
    if (!r || !this.game || this.game.status !== "playing" || this.game.paused || this.finishing) return;
    const now = serverNow();
    if (this.game.goAt && now < this.game.goAt) return;
    const updates: Record<string, unknown> = {};
    let changed = false;
    if ((r.counters ?? 0) > 0 && r.counterAt && now >= r.counterAt && !r.winner) {
      const s = raidStomp(r);
      this.push({ n: 0, at: now, kind: "stomp", dmg: r.stomp, hit: s.hit, fainted: s.fainted, counter: true });
      r.counters = (r.counters ?? 1) - 1;
      r.counterAt = r.counters > 0 ? now + COUNTER_GAP_MS : null;
      changed = true;
    }
    if (now >= r.nextStomp && !r.winner) {
      r.nextStomp += STOMP_EVERY_MS;
      const s = raidStomp(r);
      this.push({ n: 0, at: now, kind: "stomp", dmg: r.stomp, hit: s.hit, fainted: s.fainted });
      changed = true;
    }
    for (const uid of Object.keys(r.raiders)) {
      const q = (this.qs[uid] ??= blankQ());
      const st = raiderState(r.raiders[uid]);
      if (st === "out" || !this.players[uid]) {
        if (q.open) {
          q.open = false;
          updates[`clash/q/${uid}`] = null;
        }
        continue;
      }
      if (st === "down") {
        // Fainted: the one revive question replaces whatever was on the phone.
        if (!q.open || !q.revive) this.ask(uid, now, updates, true);
        else if (now > q.deadline + GRACE_MS) changed = this.judge(uid, null, now, updates) || changed;
        continue;
      }
      if (q.open && now > q.deadline + GRACE_MS) changed = this.judge(uid, null, now, updates) || changed;
      else if (!q.open && now >= q.nextAt) this.ask(uid, now, updates, false);
    }
    if (changed) this.writeBoard(updates);
    if (Object.keys(updates).length) this.flush(updates);
  }

  private push(e: RaidEvent) {
    e.n = ++this.evN;
    this.events = [...this.events, e].slice(-EVENTS_KEEP);
  }

  private writeBoard(updates: Record<string, unknown>) {
    updates["clash/raid"] = this.r;
    updates["clash/rev"] = this.events;
    updates["private/clash"] = { qs: this.qs };
  }

  private ask(uid: string, now: number, updates: Record<string, unknown>, revive: boolean) {
    const q = this.qs[uid];
    const pick = pickQuestion(this.pool, new Set(Object.keys(this.used[uid] ?? {})));
    if (!pick) return;
    if (pick.reset) this.used[uid] = {};
    (this.used[uid] ??= {})[pick.q.id] = true;
    const base = pick.q.type === "tf" ? TF_OPTS : pick.q.opts ?? [];
    const sh = pick.q.type === "tf" ? { opts: base, correctIdx: pick.q.ans } : shuffleOptions(base, pick.q.ans);
    Object.assign(q, { open: true, qid: pick.q.id, correctIdx: sh.correctIdx, askedAt: now, deadline: now + CLASH_QUESTION_MS, revive });
    q.seq += 1;
    const pub: ClashQ & { revive?: boolean } = { seq: q.seq, q: { id: pick.q.id, type: pick.q.type, q: pick.q.q, opts: sh.opts }, deadline: q.deadline, result: null, until: 0, revive };
    updates[`clash/q/${uid}`] = pub;
    updates[`answers/${uid}`] = null;
    updates[`used/${uid}`] = this.used[uid];
  }

  private onAnswer(uid: string, a: { qid: string; choice: number }) {
    const q = this.qs[uid];
    if (!this.game || this.game.status !== "playing" || this.game.paused || !q?.open || q.qid !== a.qid) return;
    const updates: Record<string, unknown> = {};
    if (this.judge(uid, a.choice, serverNow(), updates)) this.writeBoard(updates);
    this.flush(updates);
  }

  /** Returns true when the raid changed. */
  private judge(uid: string, choice: number | null, now: number, updates: Record<string, unknown>): boolean {
    const q = this.qs[uid];
    const r = this.r;
    if (!q?.open || !r || r.winner) return false;
    q.open = false;
    const correct = choice !== null && choice === q.correctIdx;
    let result: NonNullable<ClashQ["result"]> & { revive?: boolean };
    if (q.revive) {
      raidRevive(r, uid, correct);
      this.push({ n: 0, at: now, kind: "revive", uid, ok: correct });
      result = { correct, timeout: choice === null, correctIdx: q.correctIdx, revive: true };
      q.nextAt = now + RESULT_MS + (correct ? 0 : 1500);
    } else if (correct) {
      const fast = now - q.askedAt <= FAST_MS;
      const hit = raidHit(r, uid, fast);
      if (!hit) return false;
      this.push({ n: 0, at: now, kind: "atk", uid, dmg: hit.dmg, fast, sup: hit.sup, blk: hit.blocked });
      if (hit.rage) this.push({ n: 0, at: now + 700, kind: "rage", sh: r.titan.sh, stomp: r.stomp });
      if (hit.counter > 0 && !r.winner) {
        r.counters = (r.counters ?? 0) + hit.counter;
        r.counterAt ??= now + COUNTER_DELAY_MS;
      }
      result = { correct: true, timeout: false, correctIdx: q.correctIdx, dmg: hit.dmg, hits: 1, fast, sup: hit.sup };
      q.nextAt = now + RESULT_MS;
    } else {
      raidMiss(r, uid);
      (r.stun ??= {})[uid] = now + STUN_MS;
      this.push({ n: 0, at: now, kind: "wrong", uid, timeout: choice === null });
      result = { correct: false, timeout: choice === null, correctIdx: q.correctIdx };
      q.nextAt = now + STUN_MS;
    }
    q.revive = false;
    updates[`clash/q/${uid}/result`] = result;
    updates[`clash/q/${uid}/until`] = q.nextAt;
    updates[`answers/${uid}`] = null;
    return true;
  }

  private flush(updates: Record<string, unknown>) {
    void update(ref(db), updates).catch(() => {});
    if (this.r?.winner) void this.finish();
  }

  private async finish() {
    if (!this.game || this.game.status === "ended" || !this.r || this.finishing) return;
    this.finishing = true;
    const r = this.r;
    const now = serverNow();
    // Ended by the host before anyone won: the Titan is not defeated.
    if (!r.winner) r.winner = "titan";
    const ms = Math.max(0, now - (this.game.goAt ?? now) - r.pausedMs);
    const rank = raidRanking(r).map((x) => ({ uid: x.uid, pts: x.pts, rights: x.rights }));
    let best = ((await get(ref(db, "clash/records/best")).catch(() => null))?.val() ?? null) as RaidBest | null;
    let newBest = false;
    const updates: Record<string, unknown> = {};
    if (r.mode === "ta" && r.winner === "players" && (!best || ms < best.ms)) {
      best = { ms, n: rank.length, at: now, names: rank.map((x) => this.players[x.uid]?.name ?? "Player").slice(0, 20) };
      newBest = true;
      updates["clash/records/best"] = best;
    }
    const result: RaidResult = { winner: r.winner, mode: r.mode, ms, rank, newBest, best };
    const winners = r.mode === "hs" ? rank.slice(0, 3).map((x) => x.uid) : r.winner === "players" ? rank.map((x) => x.uid) : [];
    this.game = { ...this.game, status: "ended", endedAt: now, paused: false, pausedAt: null, winners };
    const text = r.winner === "players" ? `🏆 The Defect Titan is defeated!` : "👹 The Defect Titan wins this time!";
    const feed: FeedItem[] = [{ at: now, uid: "", text, tone: "win" }];
    Object.assign(updates, { game: this.game, feed, "clash/raid": r, "clash/rev": this.events, "clash/result": result, "clash/q": null, answers: null, "private/clash": { qs: this.qs } });
    await update(ref(db), updates);
    this.stop();
  }
}

const blankQ = (): QState => ({ open: false, qid: "", correctIdx: 0, askedAt: 0, deadline: 0, nextAt: 0, seq: 0, revive: false });

/** Firebase drops empty lists and objects; put them back. */
export function fixRaid(x: unknown): RaidBoard | null {
  if (!x || typeof x !== "object") return null;
  const r = x as Partial<RaidBoard>;
  return {
    mode: r.mode === "hs" ? "hs" : "ta",
    titan: { hp: r.titan?.hp ?? 0, max: r.titan?.max ?? 1, sh: r.titan?.sh ?? 0, rage: !!r.titan?.rage },
    raiders: r.raiders ?? {},
    streak: r.streak ?? {},
    stomp: r.stomp ?? 0,
    mark: r.mark ?? 9,
    winner: r.winner ?? null,
    counters: r.counters ?? 0,
    counterAt: r.counterAt ?? null,
    nextStomp: r.nextStomp ?? 0,
    stun: r.stun ?? {},
    pausedMs: r.pausedMs ?? 0,
  };
}
export function fixRaidEvents(ev: unknown): RaidEvent[] {
  const list = Array.isArray(ev) ? ev : Object.values((ev ?? {}) as Record<string, RaidEvent>);
  return list.filter(Boolean).map((e) => (e.kind === "stomp" ? { ...e, hit: e.hit ?? [], fainted: e.fainted ?? [] } : e));
}
export function fixResult(x: unknown): RaidResult | null {
  if (!x || typeof x !== "object") return null;
  const r = x as Partial<RaidResult>;
  return { winner: r.winner ?? "titan", mode: r.mode ?? "ta", ms: r.ms ?? 0, rank: r.rank ?? [], newBest: !!r.newBest, best: r.best ?? null };
}
