import { LADDERS, LAST_BOX, SNAKES } from "./board.ts";
import type { QuestionKind, Result } from "./types.ts";
import { specialAt, type SpecialBox } from "./specials.ts";

/** Right answers in a row needed for the 2-dice bonus. */
export const BONUS_STREAK = 5;

/** Most winners a game can have. */
export const MAX_WINNERS = 5;

/**
 * How many players must finish before the game ends: one less than the number playing, at most 5.
 * 2 players = 1 winner, 3 = 2, 4 = 3, 5 = 4, 6 or more = 5. A player on their own still plays to the finish.
 */
export function winnersNeeded(players: number): number {
  return Math.max(1, Math.min(MAX_WINNERS, players - 1));
}

export type Resolved = { result: Result; pos: number; streak: number };

/**
 * The game rules in one place. Given where a player stands and whether they answered correctly,
 * work out the dice, the new box and what comes next.
 * - Right answer: roll 1 dice (2 dice on the 5th right answer in a row, then the count restarts).
 * - Wrong answer or no answer: no roll, and a 5-second penalty before the next question.
 * - Snake question: right = stay, wrong = slide down (+ penalty).
 * - Ladder question: right = climb, wrong = stay (+ penalty).
 * - Landing on a special (quality event) box moves the player forward or back at once.
 *   A snake or ladder at the new box then asks its question; another special box does nothing.
 * - Reaching or passing the last box wins.
 */
export function resolve(
  pos: number,
  streak: number,
  kind: QuestionKind,
  correct: boolean,
  opts: { timeout?: boolean; choice?: number | null; correctIdx: number; rollDie?: () => number; specials?: SpecialBox[] | null },
): Resolved {
  const rollDie = opts.rollDie ?? (() => 1 + Math.floor(Math.random() * 6));
  let newStreak = correct ? streak + 1 : 0;
  const base = {
    kind,
    correct,
    timeout: !!opts.timeout,
    choice: opts.choice ?? null,
    correctIdx: opts.correctIdx,
    from: pos,
    bonus: false,
    penalty: !correct,
    next: null as QuestionKind | null,
    dice: [] as number[],
  };

  if (kind === "snake") {
    const to = correct ? pos : SNAKES[pos] ?? pos;
    return { result: { ...base, to, outcome: correct ? "safe" : "slide" }, pos: to, streak: newStreak };
  }
  if (kind === "ladder") {
    const to = correct ? LADDERS[pos] ?? pos : pos;
    return { result: { ...base, to, outcome: correct ? "climb" : "nolad" }, pos: to, streak: newStreak };
  }

  // A normal turn. Wrong = no roll (the penalty is applied by the engine).
  if (!correct) return { result: { ...base, to: pos, outcome: "noroll" }, pos, streak: newStreak };

  let count = 1;
  let bonus = false;
  if (newStreak >= BONUS_STREAK) {
    count = 2;
    bonus = true;
    newStreak = 0;
  }
  const dice = Array.from({ length: count }, rollDie);
  const land = pos + dice.reduce((a, b) => a + b, 0);
  if (land >= LAST_BOX) {
    return { result: { ...base, dice, bonus, to: LAST_BOX, outcome: "win" }, pos: LAST_BOX, streak: newStreak };
  }
  let to = land;
  const special = specialAt(opts.specials, land);
  if (special) to = Math.max(1, Math.min(LAST_BOX - 1, land + special.move));
  const next: QuestionKind | null = SNAKES[to] ? "snake" : LADDERS[to] ? "ladder" : null;
  const extra = special ? { special: special.id, land } : {};
  return { result: { ...base, ...extra, dice, bonus, to, outcome: "move", next }, pos: to, streak: newStreak };
}

/** Pick a question for a player: never one they already had, until they have had them all. */
export function pickQuestion<T extends { id: string }>(pool: T[], used: Set<string>, rand = Math.random): { q: T; reset: boolean } | null {
  if (!pool.length) return null;
  let fresh = pool.filter((q) => !used.has(q.id));
  let reset = false;
  if (!fresh.length) {
    fresh = pool;
    reset = true;
  }
  return { q: fresh[Math.floor(rand() * fresh.length)], reset };
}

/** Questions each player has had, kept across games: `used/{uid}/{questionId} = true`. */
export type UsedMap = Record<string, Record<string, true>>;

/**
 * Pick a question for one player (or a whole Quality Spin team) that none of them has had, in this
 * game or an earlier one. When they have had every question in the pool, only this pool is forgotten
 * for them (other sets keep their memory). Marks the question as had for each of them.
 */
export function takeQuestion<T extends { id: string }>(pool: T[], used: UsedMap, uids: string[], rand = Math.random): T | null {
  const seen = new Set<string>();
  for (const u of uids) for (const id of Object.keys(used[u] ?? {})) seen.add(id);
  const pick = pickQuestion(pool, seen, rand);
  if (!pick) return null;
  for (const u of uids) {
    const mine = { ...(used[u] ?? {}) };
    if (pick.reset) for (const q of pool) delete mine[q.id];
    mine[pick.q.id] = true;
    used[u] = mine;
  }
  return pick.q;
}

/** Shuffle the options for one player; returns the new order and where the correct answer went. */
export function shuffleOptions<T>(opts: T[], ans: number, rand = Math.random): { opts: T[]; correctIdx: number } {
  const order = opts.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { opts: order.map((i) => opts[i]), correctIdx: order.indexOf(ans) };
}
