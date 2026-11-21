// Quality Spin rules (owner's spec, 21 Nov 2026; draft https://claude.ai/artifact/Pp6Leae82mRQ5Xa34mXrN8).
// A spin-the-wheel word game, Team mode: Red v Blue, up to 3 players a team, split screen on the projector
// (Red left, Blue right: phrase boxes on top, the team's own wheel underneath). Both teams play at the
// same time, each on its own phrase. The team picks a captain ("I'm the captain", first tap); only the
// captain's phone plays, teammates see the same screen and help, everyone else watches.
//   - Answer a quality question (20 s). Right = flick the phone to spin. Wrong / time out = 5 s stun.
//   - Wheel (12 sections): points 200–500 (9), KAIZEN (1), DEFECT (2).
//   - Points: pick a consonant; each time it is in the phrase = the wheel's points. Not in it = 5 s stun.
//   - After a right letter: spin again (a new question first), buy a vowel (300 points, once the team has
//     300), or solve (type the phrase). Solve = +1,000 and the next phrase at once; wrong = −1,000 and a stun.
//   - KAIZEN: a ×2 power-up and flick again right away; the next result counts double (letter points,
//     a wrong letter costs the wheel's points ×2, solve +2,000, wrong solve −2,000). A second KAIZEN = ×4.
//     DEFECT or a wrong answer to the question loses it; buying a vowel keeps it.
//   - DEFECT: 5 s stun. Points never go below 0.
//   - 3 or 5 minutes (host's pick). Most points wins; tie = more phrases solved; still tied = draw.
// Balance (owner picked +1,000 for solving; simulation in scripts/spin.test.ts).
import type { PublicQuestion, Text } from "../lib/types.ts";

export type Side = "red" | "blue";
export const SIDES: Side[] = ["red", "blue"];
export const SIDE_NAME: Record<Side, { en: string; ms: string; color: string; light: string }> = {
  red: { en: "Red", ms: "Merah", color: "#e3263a", light: "#ff6b7a" },
  blue: { en: "Blue", ms: "Biru", color: "#1d7bf0", light: "#6fb4ff" },
};
export const other = (s: Side): Side => (s === "red" ? "blue" : "red");

export const TEAM_MAX = 3;
export const MINUTES = [3, 5] as const;
export type Minutes = (typeof MINUTES)[number];

export const QUESTION_MS = 20_000;
/** Time to flick after a right answer; then the wheel spins by itself. */
export const FLICK_MS = 15_000;
/** How long the wheel turns. */
export const SPIN_MS = 4_200;
export const LETTER_MS = 20_000;
/** After a right letter: time to choose (spin again, vowel, solve); then "spin again" by itself. */
export const CHOICE_MS = 20_000;
export const STUN_MS = 5_000;
/** The "SOLVED!" moment before the team's next phrase. */
export const SOLVED_MS = 2_500;

export const VOWELS = "AEIOU";
export const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";
export const VOWEL_COST = 300;
export const SOLVE_POINTS = 1_000;
export const WRONG_SOLVE = 1_000;
export const MAX_MULT = 4;

export type Seg = { t: string; v: number; k?: "kaizen" | "defect"; c: string };
/** Clockwise from the top. DEFECTs are apart; 9 point sections, 1 KAIZEN, 2 DEFECT. */
export const WHEEL: Seg[] = [
  { t: "300", v: 300, c: "#1d7bf0" },
  { t: "500", v: 500, c: "#7c3aed" },
  { t: "DEFECT!", v: 0, k: "defect", c: "#c1121f" },
  { t: "250", v: 250, c: "#11b5a5" },
  { t: "400", v: 400, c: "#e3263a" },
  { t: "KAIZEN ×2", v: 0, k: "kaizen", c: "#e8a317" },
  { t: "350", v: 350, c: "#1d7bf0" },
  { t: "200", v: 200, c: "#7c3aed" },
  { t: "DEFECT!", v: 0, k: "defect", c: "#c1121f" },
  { t: "450", v: 450, c: "#11b5a5" },
  { t: "300", v: 300, c: "#e3263a" },
  { t: "400", v: 400, c: "#0a8a5a" },
];
export const SEG_ANGLE = (Math.PI * 2) / WHEEL.length;

/** The wheel's turn that puts section `k` under the pointer at the top, a few full turns on from `from`. */
export function spinTarget(from: number, k: number, turns: number, jitter: number): number {
  const want = -k * SEG_ANGLE + jitter * SEG_ANGLE * 0.36;
  const base = from + turns * Math.PI * 2;
  const tau = Math.PI * 2;
  const d = (((want - base) % tau) + tau) % tau;
  return base + d;
}
/** Which section is under the pointer when the wheel has turned `rot`. */
export function segAt(rot: number): number {
  const tau = Math.PI * 2;
  const a = (((-rot) % tau) + tau) % tau;
  return Math.round(a / SEG_ANGLE) % WHEEL.length;
}
/** Where the wheel is `now`: eases from `from` to `to` over SPIN_MS. */
export function wheelAngle(spin: SpinMove | null | undefined, now: number): number {
  if (!spin) return 0;
  const u = Math.min(1, Math.max(0, (now - spin.at) / SPIN_MS));
  return spin.from + (spin.to - spin.from) * (1 - Math.pow(1 - u, 4));
}

/** The phrase with hidden letters as "_" (what phones and the projector see). */
export function maskOf(phrase: string, shown: string): string {
  return [...phrase].map((c) => (c === " " || shown.includes(c) ? c : "_")).join("");
}
/** Board rows: whole words, at most `max` characters a row. */
export function rowsOf(board: string, max = 13): string[] {
  const rows: string[] = [];
  let cur = "";
  for (const w of board.split(" ")) {
    if (cur && (cur + " " + w).length > max) {
      rows.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  rows.push(cur);
  return rows;
}
export const lettersIn = (phrase: string) => phrase.replace(/[^A-Z]/g, "");
export const norm = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");

export type SpinMove = { from: number; to: number; at: number; seg: number };

export type LastKind =
  | "right" // right answer: flick
  | "wrong" // wrong answer or time out: stun
  | "defect"
  | "kaizen"
  | "hit" // right letter
  | "miss" // letter not in the phrase (or time out): stun
  | "vowel" // bought a vowel that is in the phrase
  | "vmiss" // bought a vowel that is not: stun
  | "solve"
  | "wrongsolve";
export type Last = {
  k: LastKind;
  at: number;
  /** The letter picked. */
  L?: string;
  /** How many times it is in the phrase. */
  n?: number;
  /** Points won (+) or lost (−). */
  pts?: number;
  /** The multiplier that applied (KAIZEN). */
  mult?: number;
  timeout?: boolean;
  /** Wrong answer: the right answer. */
  ans?: Text | null;
  /** Solved: the phrase. */
  text?: string;
};

export type SpinTeam = {
  side: Side;
  /** Up to 3 uids, in picking order. */
  members: string[];
  captain: string;
  score: number;
  solved: number;
  phase: "question" | "flick" | "spinning" | "letter" | "choice" | "stun" | "solved" | "done";
  q: PublicQuestion | null;
  /** When this phase runs out (question, flick, letter, choice, stun, solved). */
  until: number;
  /** The phrase with hidden letters as "_". */
  board: string;
  hint: Text;
  /** Letters picked for this phrase (right and wrong). */
  used: string;
  /** Which phrase this is for the team (1, 2, 3…). */
  puzzle: number;
  /** KAIZEN multiplier for the next result: 1, 2 or 4. */
  mult: number;
  /** Points a letter from the last spin. */
  value: number;
  spin: SpinMove | null;
  last: Last | null;
  /** Counts every action, so a phone's old tap is ignored. */
  seq: number;
  /** Stats for the end screen. */
  rights: number;
  answered: number;
  hits: number;
  defects: number;
  kaizens: number;
  /** At the end: the phrase the team was on. */
  reveal?: string;
};

export function newTeam(side: Side, members: string[], captain: string): SpinTeam {
  return {
    side,
    members,
    captain,
    score: 0,
    solved: 0,
    phase: "question",
    q: null,
    until: 0,
    board: "",
    hint: { en: "", ms: "" },
    used: "",
    puzzle: 0,
    mult: 1,
    value: 0,
    spin: null,
    last: null,
    seq: 0,
    rights: 0,
    answered: 0,
    hits: 0,
    defects: 0,
    kaizens: 0,
  };
}

/** The database drops empty values; fill them back in. */
export function fixTeam(t: Partial<SpinTeam> | null | undefined, side: Side): SpinTeam {
  const base = newTeam(side, [], "");
  if (!t) return base;
  return {
    ...base,
    ...t,
    side,
    members: t.members ?? [],
    q: t.q ? { ...t.q, opts: t.q.opts ?? [] } : null,
    hint: t.hint ?? base.hint,
    used: t.used ?? "",
    board: t.board ?? "",
    spin: t.spin ?? null,
    last: t.last ?? null,
  };
}

export type SpinGame = {
  mins: Minutes;
  red: SpinTeam;
  blue: SpinTeam;
  champion: Side | "draw" | null;
};
export function fixSpin(g: Partial<SpinGame> | null | undefined): SpinGame | null {
  if (!g) return null;
  return { mins: g.mins === 3 ? 3 : 5, red: fixTeam(g.red, "red"), blue: fixTeam(g.blue, "blue"), champion: g.champion ?? null };
}

/** What the referee keeps secret for a team (private/spin/{side}). */
export type SpinSecret = { phrase: number; qid: string; correctIdx: number; order: number[]; next: number };

const floor0 = (n: number) => Math.max(0, n);
const stun = (t: SpinTeam, now: number) => {
  t.phase = "stun";
  t.until = now + STUN_MS;
};

/** The captain answered the question (choice null = time out). */
export function onAnswer(t: SpinTeam, correct: boolean, now: number, ans: Text | null, timeout = false) {
  t.seq++;
  t.answered++;
  if (correct) {
    t.rights++;
    t.phase = "flick";
    t.until = now + FLICK_MS;
    t.last = { k: "right", at: now };
  } else {
    // A wrong answer loses KAIZEN (owner).
    t.mult = 1;
    t.last = { k: "wrong", at: now, ans, timeout };
    stun(t, now);
  }
  t.q = null;
}

/** The flick: the wheel starts turning towards section `seg`. */
export function onFlick(t: SpinTeam, seg: number, now: number, power: number, jitter: number) {
  t.seq++;
  const from = t.spin ? t.spin.to : 0;
  const turns = 3 + Math.round(Math.max(0, Math.min(1, power)) * 2);
  t.spin = { from, to: spinTarget(from, seg, turns, jitter), at: now, seg };
  t.phase = "spinning";
  t.until = now + SPIN_MS;
}

/** The wheel stopped. */
export function onLand(t: SpinTeam, now: number, consonantsLeft: boolean) {
  const seg = WHEEL[t.spin?.seg ?? 0];
  t.seq++;
  if (seg.k === "defect") {
    t.defects++;
    t.last = { k: "defect", at: now, mult: t.mult };
    t.mult = 1;
    stun(t, now);
  } else if (seg.k === "kaizen") {
    t.kaizens++;
    t.mult = Math.min(MAX_MULT, t.mult * 2);
    t.last = { k: "kaizen", at: now, mult: t.mult };
    // Flick again right away (owner).
    t.phase = "flick";
    t.until = now + FLICK_MS;
  } else {
    t.value = seg.v;
    if (consonantsLeft) {
      t.phase = "letter";
      t.until = now + LETTER_MS;
    } else {
      // Every consonant has been tried: straight to the choice (vowel or solve).
      t.phase = "choice";
      t.until = now + CHOICE_MS;
    }
  }
}

/** A consonant (L = null: time ran out, counted as a wrong letter). Returns the new board. */
export function onLetter(t: SpinTeam, phrase: string, L: string | null, now: number) {
  t.seq++;
  const mult = t.mult;
  t.mult = 1;
  const n = L ? [...phrase].filter((c) => c === L).length : 0;
  if (L) t.used += L;
  if (n > 0) {
    const pts = t.value * n * mult;
    t.score += pts;
    t.hits++;
    t.last = { k: "hit", at: now, L: L!, n, pts, mult };
    t.phase = "choice";
    t.until = now + CHOICE_MS;
  } else {
    // A wrong letter only stuns; with KAIZEN it also costs the wheel's points × the multiplier (owner).
    const lost = mult > 1 ? Math.min(t.score, t.value * mult) : 0;
    t.score = floor0(t.score - lost);
    t.last = { k: "miss", at: now, L: L ?? undefined, n: 0, pts: -lost, mult, timeout: !L };
    stun(t, now);
  }
  t.board = maskOf(phrase, t.used);
}

/** Buy a vowel: 300 points; KAIZEN stays (owner). */
export function canBuyVowel(t: SpinTeam): boolean {
  return t.score >= VOWEL_COST && [...VOWELS].some((v) => !t.used.includes(v));
}
export function onVowel(t: SpinTeam, phrase: string, V: string, now: number) {
  t.seq++;
  t.score = floor0(t.score - VOWEL_COST);
  t.used += V;
  const n = [...phrase].filter((c) => c === V).length;
  if (n > 0) {
    t.last = { k: "vowel", at: now, L: V, n, pts: -VOWEL_COST };
    t.phase = "choice";
    t.until = now + CHOICE_MS;
  } else {
    t.last = { k: "vmiss", at: now, L: V, n: 0, pts: -VOWEL_COST };
    stun(t, now);
  }
  t.board = maskOf(phrase, t.used);
}

/** Solve: returns true when right (the engine then gives the next phrase after SOLVED_MS). */
export function onSolve(t: SpinTeam, phrase: string, text: string, now: number): boolean {
  t.seq++;
  const mult = t.mult;
  t.mult = 1;
  if (norm(text) === norm(phrase)) {
    const pts = SOLVE_POINTS * mult;
    t.score += pts;
    t.solved++;
    t.board = phrase;
    t.last = { k: "solve", at: now, pts, mult, text: phrase };
    t.phase = "solved";
    t.until = now + SOLVED_MS;
    return true;
  }
  const lost = Math.min(t.score, WRONG_SOLVE * mult);
  t.score = floor0(t.score - lost);
  t.last = { k: "wrongsolve", at: now, pts: -lost, mult, text: text.toUpperCase().slice(0, 40) };
  stun(t, now);
  return false;
}

/** Spin again: back to a question (the engine asks it). */
export function onAgain(t: SpinTeam) {
  t.seq++;
}

/** Most points wins; tie = more phrases solved; still tied = draw. */
export function winnerOf(red: SpinTeam, blue: SpinTeam): Side | "draw" {
  if (red.score !== blue.score) return red.score > blue.score ? "red" : "blue";
  if (red.solved !== blue.solved) return red.solved > blue.solved ? "red" : "blue";
  return "draw";
}

/** The captain is the first member who tapped "I'm the captain"; nobody = the first member. */
export function captainOf(members: string[], wantsCap: Record<string, boolean>): string {
  return members.find((u) => wantsCap[u]) ?? members[0] ?? "";
}

/**
 * Teams from the lobby picks: each side's first 3 by picking time play; the rest of that side watch.
 * `picks`: uid → { side, at, cap }.
 */
export function teamsFrom(picks: Record<string, { side: Side; at: number; cap: boolean }>, present: (uid: string) => boolean) {
  const out: Record<Side, { members: string[]; extra: string[]; captain: string }> = { red: { members: [], extra: [], captain: "" }, blue: { members: [], extra: [], captain: "" } };
  const order = Object.entries(picks)
    .filter(([u]) => present(u))
    .sort((a, b) => a[1].at - b[1].at || (a[0] < b[0] ? -1 : 1));
  for (const [u, p] of order) {
    const t = out[p.side];
    if (t.members.length < TEAM_MAX) t.members.push(u);
    else t.extra.push(u);
  }
  for (const s of SIDES) out[s].captain = captainOf(out[s].members, Object.fromEntries(order.map(([u, p]) => [u, p.cap])));
  return out;
}

/** Phone → referee actions, written to answers/{captain} as { qid, choice } (no new security rules). */
export type Action =
  | { k: "answer"; qid: string; choice: number }
  | { k: "flick"; seq: number; power: number }
  | { k: "letter"; seq: number; L: string }
  | { k: "vowel"; seq: number; L: string }
  | { k: "solve"; seq: number; text: string }
  | { k: "again"; seq: number };
export function encodeAction(a: Action): { qid: string; choice: number } {
  switch (a.k) {
    case "answer":
      return { qid: a.qid, choice: a.choice };
    case "flick":
      return { qid: `!F${a.seq}`, choice: Math.round(Math.max(0, Math.min(1, a.power)) * 100) };
    case "letter":
      return { qid: `!L${a.seq}:${a.L}`, choice: 0 };
    case "vowel":
      return { qid: `!V${a.seq}:${a.L}`, choice: 0 };
    case "solve":
      return { qid: `!S${a.seq}:${a.text.slice(0, 60)}`, choice: 0 };
    case "again":
      return { qid: `!A${a.seq}`, choice: 0 };
  }
}
export function decodeAction(x: { qid: string; choice: number }): Action | null {
  if (!x || typeof x.qid !== "string") return null;
  const m = /^!([FLVSA])(\d+)(?::([\s\S]*))?$/.exec(x.qid);
  if (!m) return { k: "answer", qid: x.qid, choice: x.choice };
  const seq = Number(m[2]);
  const rest = m[3] ?? "";
  if (m[1] === "F") return { k: "flick", seq, power: (Number(x.choice) || 0) / 100 };
  if (m[1] === "L") return /^[A-Z]$/.test(rest) ? { k: "letter", seq, L: rest } : null;
  if (m[1] === "V") return /^[AEIOU]$/.test(rest) ? { k: "vowel", seq, L: rest } : null;
  if (m[1] === "S") return { k: "solve", seq, text: rest };
  return { k: "again", seq };
}
