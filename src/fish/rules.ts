// Fishing Derby rules (owner's spec, Nov 2026; drafts https://claude.ai/artifact/ULUpjtsYfFVsYN2chpj1Ah and
// https://claude.ai/artifact/BemgFLNobDesu7PfzxprQq). Open play: everyone vs everyone in one pond.
//   - 5:00 minutes, 20 s per question.
//   - Every right answer = a fish (1–6 kg). 3 right in a row = BIG FISH (10–18 kg).
//     5 right in a row = SUPER BIG GOLDEN FISH (30–45 kg), then the row count restarts.
//   - Wrong or time out = the line snaps: wait 5 s, row count back to 0.
//   - Fishing Frenzy at 1:00, 2:00, 3:00 and 4:00 for 30 s: every fish weighs double.
//   - Heaviest total catch wins (tie: more right answers).
import type { PublicQuestion } from "../lib/types.ts";

export const GAME_MS = 5 * 60_000;
export const QUESTION_MS = 20_000;
export const SNAP_MS = 5_000;
export const FRENZY_AT = [60_000, 120_000, 180_000, 240_000];
export const FRENZY_MS = 30_000;
export const FRENZY_MULT = 2;
export const BIG_STREAK = 3;
export const GOLD_STREAK = 5;
/** 1–8 players: the projector zooms in on big catches. 9 or more: notice cards. */
export const ZOOM_MAX_PLAYERS = 8;

/**
 * How long each result stays before the next question. The phone's side-view catch fits inside
 * (SIDE_BEATS in pondSide.ts): a fish swims to the hook, bites, is reeled up and lands in the boat
 * (2.2 s; big and golden 3.5 s). The BIG / GOLDEN alert shows at the same time as the catch (owner, Nov 2026).
 */
export const RESULT_MS = { fish: 2_600, big: 4_000, gold: 4_200, snap: SNAP_MS } as const;

export type CatchKind = "fish" | "big" | "gold" | "snap";

export const FISH_NAMES: Record<Exclude<CatchKind, "snap">, string[]> = {
  fish: ["Tilapia", "Keli", "Lampam", "Sepat", "Puyu"],
  big: ["Toman", "Patin", "Kelah"],
  gold: ["Kelisa Emas"],
};
const KG: Record<Exclude<CatchKind, "snap">, [number, number]> = { fish: [1, 6], big: [10, 18], gold: [30, 45] };

export type Catch = {
  kind: CatchKind;
  /** Weight added (frenzy included), 0.1 kg steps. */
  kg: number;
  name: string;
  frenzy: boolean;
  correct: boolean;
  timeout: boolean;
  choice: number | null;
  correctIdx: number;
};

export type FishState = {
  phase: "wait" | "question" | "result" | "done";
  q: PublicQuestion | null;
  deadline: number;
  until: number;
  seq: number;
  /** Right answers in a row (3 = big fish, 5 = golden, then back to 0). */
  streak: number;
  kg: number;
  fish: number;
  big: number;
  gold: number;
  /** Heaviest single fish. */
  best: number;
  bestName: string;
  correct: number;
  answered: number;
  result: Catch | null;
  rank: number | null;
};

export function newFishState(): FishState {
  return { phase: "wait", q: null, deadline: 0, until: 0, seq: 0, streak: 0, kg: 0, fish: 0, big: 0, gold: 0, best: 0, bestName: "", correct: 0, answered: 0, result: null, rank: null };
}

/** The database drops empty values; fill them back in. */
export function fixFishState(st: Partial<FishState> | null | undefined): FishState | null {
  if (!st) return null;
  const base = newFishState();
  return { ...base, ...st, q: st.q ? { ...st.q, opts: st.q.opts ?? [] } : null, result: st.result ? { ...st.result, choice: st.result.choice ?? null } : null, rank: st.rank ?? null, bestName: st.bestName ?? "" };
}

/** Is a frenzy on, `elapsed` ms after the start (the "get ready" countdown not counted)? */
export function frenzyAt(elapsed: number): { on: boolean; index: number; endsIn: number; nextIn: number | null } {
  for (let i = 0; i < FRENZY_AT.length; i++) {
    const a = FRENZY_AT[i];
    if (elapsed >= a && elapsed < a + FRENZY_MS) return { on: true, index: i, endsIn: a + FRENZY_MS - elapsed, nextIn: null };
    if (elapsed < a) return { on: false, index: -1, endsIn: 0, nextIn: a - elapsed };
  }
  return { on: false, index: -1, endsIn: 0, nextIn: null };
}

const round1 = (x: number) => Math.round(x * 10) / 10;

/** What a player catches for this answer, and their new row count. */
export function catchFor(streak: number, correct: boolean, opts: { frenzy: boolean; timeout: boolean; choice: number | null; correctIdx: number; rand?: () => number }): { result: Catch; streak: number } {
  const rand = opts.rand ?? Math.random;
  const base = { frenzy: opts.frenzy, correct, timeout: opts.timeout, choice: opts.choice, correctIdx: opts.correctIdx };
  if (!correct) return { result: { ...base, kind: "snap", kg: 0, name: "" }, streak: 0 };
  let s = streak + 1;
  let kind: Exclude<CatchKind, "snap"> = "fish";
  if (s >= GOLD_STREAK) {
    kind = "gold";
    s = 0;
  } else if (s === BIG_STREAK) kind = "big";
  const [lo, hi] = KG[kind];
  const names = FISH_NAMES[kind];
  const kg = round1((lo + rand() * (hi - lo)) * (opts.frenzy ? FRENZY_MULT : 1));
  return { result: { ...base, kind, kg, name: names[Math.floor(rand() * names.length)] }, streak: s };
}

/** Add a result to a player's totals. */
export function addCatch(st: FishState, r: Catch): void {
  st.answered += 1;
  if (!r.correct) return;
  st.correct += 1;
  st.kg = round1(st.kg + r.kg);
  if (r.kind === "big") st.big += 1;
  else if (r.kind === "gold") st.gold += 1;
  else st.fish += 1;
  if (r.kg > st.best) {
    st.best = r.kg;
    st.bestName = r.name;
  }
}

/** Final order: heaviest total first; a tie goes to more right answers. */
export function rankFishers<T extends { kg: number; correct: number }>(list: [string, T][]): [string, T][] {
  return [...list].sort((a, b) => b[1].kg - a[1].kg || b[1].correct - a[1].correct);
}

/** Shout-outs at the end: biggest single fish and most golden fish (none if nobody caught one). */
export function shoutOuts<T extends { best: number; bestName: string; gold: number }>(list: [string, T][]) {
  let biggest: [string, T] | null = null;
  let golden: [string, T] | null = null;
  for (const e of list) {
    if (e[1].best > 0 && (!biggest || e[1].best > biggest[1].best)) biggest = e;
    if (e[1].gold > 0 && (!golden || e[1].gold > golden[1].gold)) golden = e;
  }
  return { biggest, golden };
}

/** Where each player's boat sits on the pond: everyone agrees on the order (joining order). */
export function boatOrder(players: Record<string, { joinedAt?: number }>): string[] {
  return Object.entries(players)
    .sort((a, b) => (a[1].joinedAt ?? 0) - (b[1].joinedAt ?? 0) || (a[0] < b[0] ? -1 : 1))
    .map(([u]) => u);
}

/** Boat i of n around the oval pond (unit pond: x and y from −1 to 1). Two rings when the pond is busy. */
export function boatSpot(i: number, n: number): { a: number; r: number } {
  const a = (i / Math.max(1, n)) * Math.PI * 2 + Math.PI / 2; // the first boat at the front (bottom)
  const r = n > 24 ? (i % 2 ? 0.74 : 0.88) : 0.86;
  return { a, r };
}
