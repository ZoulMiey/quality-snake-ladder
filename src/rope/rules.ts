// Pull the Rope / Tarik Tali rules (owner's spec, Nov 2026; drafts https://claude.ai/artifact/RLvgyFjDMdjX5ZmychENwp
// and https://claude.ai/artifact/CN6FXNQsQbSJseefWpXHeQ). Two teams, Red and Blue, pull across a river.
//   - Players pick their side on the phone (the host can move them). Up to 50 players, no late joining.
//   - Everyone answers their own questions (15 s each). Right = your team pulls. Wrong / time out = no pull,
//     the right answer is shown, wait 3 s.
//   - Each pull is shared out by team size, so a team of 2 is as strong as a team of 4 (owner's question 3).
//     The pull is also scaled by the number of players, so rounds last about as long with 2 or 50 players.
//   - FAST (right within 3 s) ×1.25 · POWER PULL (every 3rd right answer in a row) ×2 · HEAVE! ×2 for 10 s at 1:00 and 2:00.
//   - The centre flag reaching your bank wins the round; otherwise the flag's side at 3:00. Best of 3 rounds,
//     10 s break between rounds. MVP = most right answers.
// Simulation (scripts/rope.test.ts, 3,000 rounds each): even teams reach a bank in ~35% of rounds (~2:00),
// 70% v 80% right in ~80% of rounds (~1:30, the better team wins 95%); 4 v 2 and 20 v 10 are 50/50.
import type { PublicQuestion } from "../lib/types.ts";

export type Side = "red" | "blue";
export const SIDES: Side[] = ["red", "blue"];
/** +1 = towards the Blue bank (right on the projector), −1 = towards the Red bank. */
export const SIGN: Record<Side, 1 | -1> = { red: -1, blue: 1 };
export const SIDE_NAME: Record<Side, { en: string; ms: string; color: string; dark: string; light: string }> = {
  red: { en: "Red", ms: "Merah", color: "#ef4444", dark: "#b91c1c", light: "#fee2e2" },
  blue: { en: "Blue", ms: "Biru", color: "#3b82f6", dark: "#1d4ed8", light: "#dbeafe" },
};
export const other = (s: Side): Side => (s === "red" ? "blue" : "red");

export const ROUND_MS = 180_000;
export const QUESTION_MS = 15_000;
export const WRONG_MS = 3_000;
/** The short "PULL!" moment after a right answer before the next question. */
export const RIGHT_MS = 1_000;
export const BREAK_MS = 10_000;
export const ROUNDS_TO_WIN = 2;
/** Best of 3; a drawn round adds a round, up to 5. */
export const MAX_ROUNDS = 5;

export const PULL_BASE = 0.3;
export const REF_PLAYERS = 24;
export const FAST_MS = 3_000;
/** Allowance for the time the answer takes to reach the projector. */
export const FAST_GRACE_MS = 300;
export const FAST_MULT = 1.25;
export const POWER_STREAK = 3;
export const POWER_MULT = 2;
export const HEAVE_AT = [60_000, 120_000];
export const HEAVE_MS = 10_000;
export const HEAVE_WARN_MS = 5_000;
export const HEAVE_MULT = 2;

export type PullOpts = { fast: boolean; power: boolean; heave: boolean };

/** How far one right answer moves the flag (the flag goes from 0 to ±1 = a bank). */
export function pullFor(sideCount: number, totalPlayers: number, o: PullOpts): number {
  const base = (PULL_BASE * Math.sqrt(Math.max(2, totalPlayers) / REF_PLAYERS)) / Math.max(1, sideCount);
  return base * (o.fast ? FAST_MULT : 1) * (o.power ? POWER_MULT : 1) * (o.heave ? HEAVE_MULT : 1);
}

/** Is a HEAVE! on, `elapsed` ms into the round? */
export function heaveAt(elapsed: number): { on: boolean; index: number; endsIn: number; nextIn: number | null } {
  for (let i = 0; i < HEAVE_AT.length; i++) {
    const a = HEAVE_AT[i];
    if (elapsed >= a && elapsed < a + HEAVE_MS) return { on: true, index: i, endsIn: a + HEAVE_MS - elapsed, nextIn: null };
    if (elapsed < a) return { on: false, index: -1, endsIn: 0, nextIn: a - elapsed };
  }
  return { on: false, index: -1, endsIn: 0, nextIn: null };
}

export type RopeResult = {
  correct: boolean;
  timeout: boolean;
  choice: number | null;
  correctIdx: number;
  fast: boolean;
  power: boolean;
  heave: boolean;
  /** How far this answer moved the flag (0 when wrong). */
  pull: number;
};

export type RopeState = {
  side: Side;
  phase: "wait" | "question" | "result" | "break" | "done";
  q: PublicQuestion | null;
  deadline: number;
  /** When the question was given (for FAST). */
  askedAt: number;
  until: number;
  seq: number;
  /** Right answers in a row (every 3rd is a POWER PULL). Restarts each round. */
  streak: number;
  bestStreak: number;
  correct: number;
  answered: number;
  /** Fastest right answer in ms (0 = none yet). */
  fastest: number;
  /** Sum of this player's pulls (for the projector's "strongest" list). */
  pulled: number;
  result: RopeResult | null;
};

export function newRopeState(side: Side): RopeState {
  return { side, phase: "wait", q: null, deadline: 0, askedAt: 0, until: 0, seq: 0, streak: 0, bestStreak: 0, correct: 0, answered: 0, fastest: 0, pulled: 0, result: null };
}

/** The database drops empty values; fill them back in. */
export function fixRopeState(st: Partial<RopeState> | null | undefined): RopeState | null {
  if (!st || !st.side) return null;
  return { ...newRopeState(st.side), ...st, q: st.q ? { ...st.q, opts: st.q.opts ?? [] } : null, result: st.result ? { ...st.result, choice: st.result.choice ?? null } : null };
}

/** The result of an answer and the player's new row count. */
export function judgeAnswer(streak: number, correct: boolean, o: { ms: number; heave: boolean; sideCount: number; total: number; choice: number | null; correctIdx: number }): { result: RopeResult; streak: number } {
  const base = { correct, timeout: o.choice === null, choice: o.choice, correctIdx: o.correctIdx };
  if (!correct) return { result: { ...base, fast: false, power: false, heave: o.heave, pull: 0 }, streak: 0 };
  const s = streak + 1;
  const fast = o.ms <= FAST_MS + FAST_GRACE_MS;
  const power = s % POWER_STREAK === 0;
  const pull = pullFor(o.sideCount, o.total, { fast, power, heave: o.heave });
  return { result: { ...base, fast, power, heave: o.heave, pull }, streak: s };
}

export type RoundEnd = { win: Side | "draw"; how: "bank" | "time" | "host"; x: number };

/** Who wins a round: a bank, else the flag's side at the end, else more right answers this round. */
export function roundWinner(x: number, right: Record<Side, number>, how: RoundEnd["how"]): RoundEnd {
  if (x >= 1) return { win: "blue", how: "bank", x: 1 };
  if (x <= -1) return { win: "red", how: "bank", x: -1 };
  const win: Side | "draw" = x > 0.0005 ? "blue" : x < -0.0005 ? "red" : right.blue > right.red ? "blue" : right.red > right.blue ? "red" : "draw";
  return { win, how, x };
}

/** Has someone won the match? Best of 3; a drawn round adds a round (max 5, then more wins or a draw). */
export function matchWinner(wins: Record<Side, number>, roundsPlayed: number): Side | "draw" | null {
  if (wins.red >= ROUNDS_TO_WIN) return "red";
  if (wins.blue >= ROUNDS_TO_WIN) return "blue";
  if (roundsPlayed >= MAX_ROUNDS) return wins.red > wins.blue ? "red" : wins.blue > wins.red ? "blue" : "draw";
  return null;
}

export type SidePick = { uid: string; side: Side | null; at: number };

/**
 * The teams at Start: everyone keeps the side they picked; players who did not pick go to the smaller
 * team (in joining order), so nobody is left out.
 */
export function teamsFor(players: Record<string, { joinedAt?: number }>, picks: Record<string, Side | null | undefined>): Record<string, Side> {
  const out: Record<string, Side> = {};
  const count: Record<Side, number> = { red: 0, blue: 0 };
  const uids = Object.keys(players).sort((a, b) => (players[a].joinedAt ?? 0) - (players[b].joinedAt ?? 0) || (a < b ? -1 : 1));
  for (const u of uids) {
    const s = picks[u];
    if (s === "red" || s === "blue") {
      out[u] = s;
      count[s]++;
    }
  }
  for (const u of uids) {
    if (out[u]) continue;
    const s: Side = count.red <= count.blue ? "red" : "blue";
    out[u] = s;
    count[s]++;
  }
  return out;
}

/** Each team front to back: the first to pick a side stands at the front of the rope. */
export function lineOrder(teams: Record<string, Side>, picks: Record<string, number>, players: Record<string, { joinedAt?: number }>): Record<Side, string[]> {
  const out: Record<Side, string[]> = { red: [], blue: [] };
  const key = (u: string) => picks[u] ?? players[u]?.joinedAt ?? 0;
  for (const u of Object.keys(teams).sort((a, b) => key(a) - key(b) || (a < b ? -1 : 1))) out[teams[u]].push(u);
  return out;
}

/** MVP = most right answers (tie: faster fastest answer, then fewer answers). */
export function mvpOrder<T extends { correct: number; fastest: number; answered: number }>(list: [string, T][]): [string, T][] {
  const f = (x: T) => (x.fastest > 0 ? x.fastest : 1e9);
  return [...list].sort((a, b) => b[1].correct - a[1].correct || f(a[1]) - f(b[1]) || a[1].answered - b[1].answered);
}

/** Shout-outs at the end: fastest right answer and longest run of right answers. */
export function shoutOuts<T extends { fastest: number; bestStreak: number }>(list: [string, T][]) {
  let fastest: [string, T] | null = null;
  let streak: [string, T] | null = null;
  for (const e of list) {
    if (e[1].fastest > 0 && (!fastest || e[1].fastest < fastest[1].fastest)) fastest = e;
    if (e[1].bestStreak > 1 && (!streak || e[1].bestStreak > streak[1].bestStreak)) streak = e;
  }
  return { fastest, streak };
}

// ---------- simulation (used by the tests and to tune the numbers) ----------

export type SimTeam = { n: number; acc: number };

/** One simulated round. Answer times: median 5 s; 1 s "PULL!" after a right answer, 3 s wait after a wrong one. */
export function simulateRound(teams: Record<Side, SimTeam>, rand: () => number = Math.random): { win: Side | "draw"; bank: boolean; ms: number; x: number } {
  const randn = () => {
    let u = 0;
    let v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const ans = () => Math.min(QUESTION_MS + 1000, Math.exp(Math.log(5000) + 0.55 * randn()));
  const total = teams.red.n + teams.blue.n;
  type P = { side: Side; acc: number; next: number; ms: number; streak: number };
  const ps: P[] = [];
  for (const side of SIDES)
    for (let i = 0; i < teams[side].n; i++) {
      const ms = ans();
      ps.push({ side, acc: Math.min(0.97, Math.max(0.2, teams[side].acc + randn() * 0.1)), next: ms, ms, streak: 0 });
    }
  let x = 0;
  const right = { red: 0, blue: 0 };
  for (let t = 0; t < ROUND_MS; t += 50) {
    const heave = heaveAt(t).on;
    for (const p of ps) {
      if (t < p.next) continue;
      const correct = p.ms <= QUESTION_MS && rand() < p.acc;
      const { result, streak } = judgeAnswer(p.streak, correct, { ms: p.ms, heave, sideCount: teams[p.side].n, total, choice: correct ? 0 : 1, correctIdx: 0 });
      p.streak = streak;
      x += SIGN[p.side] * result.pull;
      if (correct) right[p.side]++;
      const ms = ans();
      p.next = t + (correct ? RIGHT_MS : WRONG_MS) + ms;
      p.ms = ms;
      if (Math.abs(x) >= 1) return { win: x > 0 ? "blue" : "red", bank: true, ms: t, x };
    }
  }
  const r = roundWinner(x, right, "time");
  return { win: r.win, bank: false, ms: ROUND_MS, x };
}
