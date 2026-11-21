// The Quality Clash referee. It runs in the projector window only: it gives each fighter their
// own stream of questions, checks answers, makes the creatures attack and writes what the screens show.
import { startTicker } from "../lib/ticker.ts";
import { noQuestionsMessage, poolFor, type QChoice } from "../lib/questionSets.ts";
import { get, onValue, ref, set, update } from "../lib/store.ts";
import { db, serverNow } from "../lib/firebase.ts";
import { pickQuestion, shuffleOptions } from "../lib/rules.ts";
import { COUNTDOWN_MS } from "../lib/engine.ts";
import type { FeedItem, Game, Player, Question } from "../lib/types.ts";
import { creatureById } from "./creatures.ts";
import {
  FAST_MS,
  STUN_MS,
  fightersOf,
  isAlive,
  lineUp,
  teamSize,
  newBattle,
  other,
  players as battlePlayers,
  right,
  sideOf,
  wrong,
  type Battle,
  type Format,
  type Hit,
  type Pick,
  type Side,
} from "./sim.ts";

export const CLASH_QUESTION_MS = 15_000;
/** How long the "Right!" card stays on the phone before the next question. */
const RESULT_MS = 1_800;
const GRACE_MS = 600;
const EVENTS_KEEP = 16;
const TF_OPTS = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

/** What the projector and phones see of the battle. */
export type ClashBoard = Battle & { stun?: Record<string, number> };
/** Something that happened, for the projector animations. hits: [attacker, target, damage, blocked]. */
export type ClashEvent =
  | { n: number; at: number; kind: "atk"; uid: string; side: Side; hits: Hit[]; fast: boolean; sup: boolean; sh?: string | null }
  | { n: number; at: number; kind: "wrong"; uid: string; side: Side; timeout: boolean };
export type ClashQ = {
  seq: number;
  q: { id: string; type: "mc" | "tf"; q: { en: string; ms: string }; opts: { en: string; ms: string }[] } | null;
  deadline: number;
  result: null | {
    correct: boolean;
    timeout: boolean;
    correctIdx: number;
    dmg?: number;
    hits?: number;
    fast?: boolean;
    sup?: boolean;
    targets?: string[];
    fainted?: string[];
    shield?: string | null;
  };
  until: number;
};
type QState = { open: boolean; qid: string; correctIdx: number; askedAt: number; deadline: number; nextAt: number; seq: number };

export class ClashEngine {
  private players: Record<string, Player> = {};
  private pool: Question[] = [];
  private qset: QChoice = "quality";
  private used: Record<string, Record<string, true>> = {};
  private qs: Record<string, QState> = {};
  private game: Game | null = null;
  private b: ClashBoard | null = null;
  private events: ClashEvent[] = [];
  private evN = 0;
  private stops: (() => void)[] = [];
  private stopTicker: (() => void) | undefined;
  onEvent?: (e: ClashEvent) => void;

  constructor(readonly tabId: string) {}

  async start() {
    const [playersSnap, qSnap, pickSnap, gameSnap] = await Promise.all([get(ref(db, "players")), get(ref(db, "questions")), get(ref(db, "clash/pick")), get(ref(db, "game"))]);
    this.players = playersSnap.val() ?? {};
    this.qset = ((gameSnap.val() as Game | null)?.qset as QChoice) || "quality";
    this.pool = poolFor(qSnap.val(), this.qset);
    if (!this.pool.length) throw new Error(noQuestionsMessage(this.qset));
    const format: Format = (gameSnap.val() as Game | null)?.clashFormat === "solo" ? "solo" : "team";
    const size = teamSize((gameSnap.val() as Game | null)?.clashSize);
    const picks = Object.entries((pickSnap.val() ?? {}) as Record<string, Omit<Pick, "uid">>)
      .filter(([uid]) => this.players[uid])
      .map(([uid, p]) => ({ uid, side: p.side, c: Object.values(p.c ?? {}), at: p.at }));
    const { fighters } = lineUp(format, picks, size);
    const sides = new Set(Object.values(fighters).map((f) => f.side));
    if (!sides.has("red") || !sides.has("blue"))
      throw new Error(format === "solo" ? "1 v 1 needs one player on Red and one on Blue, each with 3 monsters." : "Each team needs at least one player with a monster.");
    const now = serverNow();
    this.b = { ...newBattle(format, fighters, size), stun: {} };
    this.used = {};
    this.qs = Object.fromEntries(battlePlayers(this.b).map((u) => [u, { open: false, qid: "", correctIdx: 0, askedAt: 0, deadline: 0, nextAt: 0, seq: 0 }]));
    this.events = [];
    this.evN = 0;
    const feed: FeedItem[] = [{ at: now, uid: "", text: "⚔️ The battle has started!", tone: "info" }];
    this.game = { status: "playing", qset: this.qset, mode: "clash", clashFormat: format, clashSize: size, engine: this.tabId, paused: false, pausedAt: null, startedAt: now, goAt: now + COUNTDOWN_MS, endedAt: null, winners: [] };
    await update(ref(db), {
      game: this.game,
      feed,
      "clash/b": this.b,
      "clash/ev": null,
      "clash/q": null,
      answers: null,
      private: null,
      used: null,
      state: null,
    });
    this.run();
  }

  /** Carry on a battle after the projector page was reloaded. */
  async resume() {
    const [g, b, ev, priv, qSnap, pSnap, usedSnap] = await Promise.all(
      ["game", "clash/b", "clash/ev", "private/clash", "questions", "players", "used"].map((p) => get(ref(db, p)).then((s) => s.val())),
    );
    this.players = pSnap ?? {};
    this.qset = ((g as Game | null)?.qset as QChoice) || "quality";
    this.pool = poolFor(qSnap, this.qset);
    this.used = usedSnap ?? {};
    this.b = fixBoard(b);
    this.events = fixEvents(ev);
    this.evN = this.events.reduce((m, e) => Math.max(m, e.n), 0);
    this.qs = priv?.qs ?? {};
    if (this.b) for (const u of battlePlayers(this.b)) this.qs[u] ??= { open: false, qid: "", correctIdx: 0, askedAt: 0, deadline: 0, nextAt: 0, seq: 0 };
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
    if (!this.game || !this.game.paused || !this.b) return;
    const shift = serverNow() - (this.game.pausedAt ?? serverNow());
    const updates: Record<string, unknown> = { "game/paused": false, "game/pausedAt": null };
    if (this.game.goAt && this.game.goAt > (this.game.pausedAt ?? 0)) updates["game/goAt"] = this.game.goAt + shift;
    for (const [uid, q] of Object.entries(this.qs)) {
      q.nextAt += shift;
      q.askedAt += shift;
      if (q.open) {
        q.deadline += shift;
        updates[`clash/q/${uid}/deadline`] = q.deadline;
      }
    }
    const stun = this.b.stun ?? {};
    for (const uid of Object.keys(stun)) stun[uid] += shift;
    updates["clash/b/stun"] = stun;
    this.game = { ...this.game, paused: false, pausedAt: null };
    await update(ref(db), updates);
  }

  async endNow() {
    await this.finish();
  }

  private tick() {
    const b = this.b;
    if (!b || !this.game || this.game.status !== "playing" || this.game.paused) return;
    const now = serverNow();
    if (this.game.goAt && now < this.game.goAt) return;
    const updates: Record<string, unknown> = {};
    for (const uid of battlePlayers(b)) {
      const q = (this.qs[uid] ??= { open: false, qid: "", correctIdx: 0, askedAt: 0, deadline: 0, nextAt: 0, seq: 0 });
      if (!isAlive(b, uid) || !this.players[uid]) {
        if (q.open) {
          q.open = false;
          updates[`clash/q/${uid}`] = null;
        }
        continue;
      }
      if (q.open && now > q.deadline + GRACE_MS) this.judge(uid, null, now, updates);
      else if (!q.open && now >= q.nextAt) this.ask(uid, now, updates);
    }
    if (Object.keys(updates).length) this.flush(updates);
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
    q.qid = pick.q.id;
    q.correctIdx = sh.correctIdx;
    q.askedAt = now;
    q.deadline = now + CLASH_QUESTION_MS;
    q.seq += 1;
    const pub: ClashQ = { seq: q.seq, q: { id: pick.q.id, type: pick.q.type, q: pick.q.q, opts: sh.opts }, deadline: q.deadline, result: null, until: 0 };
    updates[`clash/q/${uid}`] = pub;
    updates[`answers/${uid}`] = null;
    updates[`used/${uid}`] = this.used[uid];
  }

  private onAnswer(uid: string, a: { qid: string; choice: number }) {
    const q = this.qs[uid];
    if (!this.game || this.game.status !== "playing" || this.game.paused || !q?.open || q.qid !== a.qid) return;
    const updates: Record<string, unknown> = {};
    this.judge(uid, a.choice, serverNow(), updates);
    this.flush(updates);
  }

  private judge(uid: string, choice: number | null, now: number, updates: Record<string, unknown>) {
    const q = this.qs[uid];
    const b = this.b;
    if (!q?.open || !b || b.winner) return;
    q.open = false;
    const correct = choice !== null && choice === q.correctIdx;
    const side = sideOf(b, uid) as Side;
    let ev: ClashEvent;
    let result: NonNullable<ClashQ["result"]>;
    if (correct) {
      const fast = now - q.askedAt <= FAST_MS;
      const r = right(b, uid, fast);
      ev = { n: ++this.evN, at: now, kind: "atk", uid, side, hits: r.hits, fast, sup: r.sup, sh: r.shieldTo };
      result = {
        correct: true,
        timeout: false,
        correctIdx: q.correctIdx,
        dmg: r.dmg,
        hits: r.hits.length,
        fast,
        sup: r.sup,
        targets: [...new Set(r.hits.map((h) => h[1]))],
        fainted: r.fainted,
        shield: r.shieldTo,
      };
      q.nextAt = now + RESULT_MS;
    } else {
      wrong(b, uid);
      (b.stun ??= {})[uid] = now + STUN_MS;
      ev = { n: ++this.evN, at: now, kind: "wrong", uid, side, timeout: choice === null };
      result = { correct: false, timeout: choice === null, correctIdx: q.correctIdx };
      q.nextAt = now + STUN_MS;
    }
    this.events = [...this.events, ev].slice(-EVENTS_KEEP);
    this.onEvent?.(ev);
    updates[`clash/q/${uid}/result`] = result;
    updates[`clash/q/${uid}/until`] = q.nextAt;
    updates[`answers/${uid}`] = null;
    updates["clash/b"] = b;
    updates["clash/ev"] = this.events;
    updates["private/clash"] = { qs: this.qs };
  }

  private flush(updates: Record<string, unknown>) {
    // A path and its own child cannot be in one update.
    if ("clash/b" in updates) for (const k of Object.keys(updates)) if (k.startsWith("clash/b/")) delete updates[k];
    void update(ref(db), updates).catch(() => {});
    if (this.b?.winner) void this.finish();
  }

  private async finish() {
    if (!this.game || this.game.status === "ended" || !this.b) return;
    const b = this.b;
    // Ended by the host before anyone won: the side with more HP + shield left wins.
    if (!b.winner) {
      const left = (s: Side) => Object.values(b.fighters).filter((f) => f.side === s).reduce((a, f) => a + f.hp + f.sh, 0);
      b.winner = left("red") >= left("blue") ? "red" : "blue";
    }
    const winners = battlePlayers(b).filter((u) => sideOf(b, u) === b.winner);
    this.game = { ...this.game, status: "ended", endedAt: serverNow(), paused: false, pausedAt: null, winners };
    const names = winners.map((u) => this.players[u]?.name ?? "Player").join(", ");
    const feed: FeedItem[] = [{ at: serverNow(), uid: "", text: `🏆 ${b.winner === "red" ? "Red" : "Blue"} wins! ${names}`, tone: "win" }];
    await update(ref(db), { game: this.game, feed, "clash/b": b, "clash/q": null, answers: null, "private/clash": { qs: this.qs } });
    this.stop();
  }
}

/** Firebase drops empty objects; put them back. */
export function fixBoard(b: unknown): ClashBoard | null {
  if (!b || typeof b !== "object") return null;
  const x = b as Partial<ClashBoard>;
  return {
    format: x.format === "solo" ? "solo" : "team",
    size: x.format === "solo" ? 3 : teamSize(x.size),
    fighters: x.fighters ?? {},
    streak: x.streak ?? {},
    rights: { red: x.rights?.red ?? 0, blue: x.rights?.blue ?? 0 },
    winner: x.winner ?? null,
    stun: x.stun ?? {},
  };
}
export function fixEvents(ev: unknown): ClashEvent[] {
  const list = Array.isArray(ev) ? ev : Object.values((ev ?? {}) as Record<string, ClashEvent>);
  return list.filter(Boolean).map((e) => (e.kind === "atk" ? { ...e, hits: e.hits ?? [] } : e));
}

/** Short text for a fighter: "Aina's Kaizen Dragon". */
export function fighterName(b: ClashBoard, id: string, players: Record<string, Player>) {
  const f = b.fighters[id];
  if (!f) return "";
  return `${players[f.uid]?.name ?? "Player"}'s ${creatureById(f.c).en}`;
}
export { other, fightersOf };
