import { LADDERS, LAST_BOX, SNAKES, FINAL_ZONE_NEED, inFinalZone } from "./board.ts";
import type { QuestionKind, Result } from "./types.ts";

export const BONUS_STREAK = 3;

export type Resolved = { result: Result; pos: number; streak: number };

/**
 * The game rules in one place. Given where a player stands and whether they answered correctly,
 * work out the dice, the new box and what comes next.
 */
export function resolve(
  pos: number,
  streak: number,
  kind: QuestionKind,
  correct: boolean,
  opts: { timeout?: boolean; choice?: number | null; correctIdx: number; rollDie?: () => number },
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

  // A normal turn.
  if (inFinalZone(pos) && !correct) {
    return { result: { ...base, to: pos, outcome: "noroll" }, pos, streak: newStreak };
  }

  let count = 1;
  let bonus = false;
  if (correct) {
    if (newStreak >= BONUS_STREAK) {
      count = 3;
      bonus = true;
      newStreak = 0;
    } else count = 2;
  }
  const dice = Array.from({ length: count }, rollDie);
  const sum = dice.reduce((a, b) => a + b, 0);

  if (inFinalZone(pos)) {
    const win = sum >= FINAL_ZONE_NEED;
    const to = win ? LAST_BOX : pos;
    return { result: { ...base, dice, bonus, to, outcome: win ? "win" : "stay" }, pos: to, streak: newStreak };
  }

  const land = pos + sum;
  if (land >= LAST_BOX) {
    return { result: { ...base, dice, bonus, to: LAST_BOX, outcome: "win" }, pos: LAST_BOX, streak: newStreak };
  }
  const next: QuestionKind | null = SNAKES[land] ? "snake" : LADDERS[land] ? "ladder" : null;
  return { result: { ...base, dice, bonus, to: land, outcome: "move", next }, pos: land, streak: newStreak };
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

/** Shuffle the options for one player; returns the new order and where the correct answer went. */
export function shuffleOptions<T>(opts: T[], ans: number, rand = Math.random): { opts: T[]; correctIdx: number } {
  const order = opts.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { opts: order.map((i) => opts[i]), correctIdx: order.indexOf(ans) };
}
