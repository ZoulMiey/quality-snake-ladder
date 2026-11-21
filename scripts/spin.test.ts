// Checks the Quality Spin rules, and simulates games with the real rule functions for the balance numbers.
// Run: npm test
import assert from "node:assert/strict";
import { PHRASES } from "../src/spin/phrases.ts";
import {
  CONSONANTS,
  SOLVE_POINTS,
  STUN_MS,
  VOWELS,
  VOWEL_COST,
  WHEEL,
  canBuyVowel,
  decodeAction,
  encodeAction,
  maskOf,
  newTeam,
  onAnswer,
  onFlick,
  onLand,
  onLetter,
  onSolve,
  onVowel,
  rowsOf,
  segAt,
  spinTarget,
  teamsFrom,
  wheelAngle,
  winnerOf,
  type SpinTeam,
} from "../src/spin/rules.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};

/** A team ready to pick a letter after landing on `v` points. */
function atLetter(v: number, score = 0, mult = 1): SpinTeam {
  const x = newTeam("red", ["a"], "a");
  x.value = v;
  x.score = score;
  x.mult = mult;
  x.phase = "letter";
  return x;
}

t("50 phrases, letters only, every phrase fits the board in 3 rows", () => {
  assert.equal(PHRASES.length, 50);
  assert.equal(new Set(PHRASES.map((p) => p.p)).size, 50);
  for (const p of PHRASES) {
    assert.match(p.p, /^[A-Z]+( [A-Z]+)*$/, p.p);
    assert.ok(p.p.split(" ").every((w) => w.length <= 12), p.p);
    assert.ok(rowsOf(p.p, 13).length <= 3, p.p);
    assert.ok(p.en && p.ms, p.p);
  }
});

t("wheel: 12 sections, points 200–500, 1 KAIZEN, 2 DEFECT", () => {
  assert.equal(WHEEL.length, 12);
  assert.equal(WHEEL.filter((s) => s.k === "kaizen").length, 1);
  assert.equal(WHEEL.filter((s) => s.k === "defect").length, 2);
  for (const s of WHEEL.filter((s) => !s.k)) assert.ok(s.v >= 200 && s.v <= 500);
});

t("the wheel stops on the section the referee picked", () => {
  for (let k = 0; k < WHEEL.length; k++) {
    for (const from of [0, 1.3, -7.9, 42]) {
      for (const j of [-1, 0, 1]) {
        const to = spinTarget(from, k, 4, j);
        assert.equal(segAt(to), k);
        assert.ok(to > from + 4 * Math.PI * 2 - 0.0001);
        assert.equal(segAt(wheelAngle({ from, to, at: 0, seg: k }, 10_000)), k);
      }
    }
  }
});

t("mask hides letters, keeps spaces", () => {
  assert.equal(maskOf("ZERO DEFECT", ""), "____ ______");
  assert.equal(maskOf("ZERO DEFECT", "ET"), "_E__ _E_E_T");
});

t("right answer = flick; wrong = 5 s stun and KAIZEN lost", () => {
  const x = newTeam("red", ["a"], "a");
  onAnswer(x, true, 1000, null);
  assert.equal(x.phase, "flick");
  x.mult = 2;
  onAnswer(x, false, 2000, { en: "Check", ms: "Semak" });
  assert.equal(x.phase, "stun");
  assert.equal(x.until, 2000 + STUN_MS);
  assert.equal(x.mult, 1);
});

t("right letter = points × times in the phrase; wrong letter = stun, no points lost", () => {
  const x = atLetter(300, 500);
  onLetter(x, "ZERO DEFECT", "T", 0);
  assert.equal(x.score, 800);
  assert.equal(x.phase, "choice");
  const y = atLetter(300, 500);
  onLetter(y, "ZERO DEFECT", "Z", 0);
  onLetter(Object.assign(y, { phase: "letter" }), "ZERO DEFECT", "S", 0);
  assert.equal(y.score, 500 + 300);
  assert.equal(y.phase, "stun");
});

t("KAIZEN: next letter ×2 (and a second KAIZEN ×4); wrong letter costs points ×2; DEFECT loses it", () => {
  const x = newTeam("red", ["a"], "a");
  const k = WHEEL.findIndex((s) => s.k === "kaizen");
  x.spin = { from: 0, to: 0, at: 0, seg: k };
  onLand(x, 0, true);
  assert.equal(x.mult, 2);
  assert.equal(x.phase, "flick");
  onLand(x, 0, true);
  assert.equal(x.mult, 4);
  const hit = atLetter(200, 0, 2);
  onLetter(hit, "ZERO DEFECT", "E", 0);
  assert.equal(hit.score, 200 * 3 * 2);
  assert.equal(hit.mult, 1);
  const miss = atLetter(200, 1000, 2);
  onLetter(miss, "ZERO DEFECT", "S", 0);
  assert.equal(miss.score, 1000 - 400);
  const poor = atLetter(500, 300, 4);
  onLetter(poor, "ZERO DEFECT", "S", 0);
  assert.equal(poor.score, 0, "points never go below 0");
  const d = newTeam("red", ["a"], "a");
  d.mult = 2;
  d.spin = { from: 0, to: 0, at: 0, seg: WHEEL.findIndex((s) => s.k === "defect") };
  onLand(d, 0, true);
  assert.equal(d.mult, 1);
  assert.equal(d.phase, "stun");
});

t("vowel: needs 300, costs 300, keeps KAIZEN; a missing vowel stuns", () => {
  const x = newTeam("red", ["a"], "a");
  x.score = 299;
  assert.equal(canBuyVowel(x), false);
  x.score = 300;
  x.mult = 2;
  assert.equal(canBuyVowel(x), true);
  onVowel(x, "ZERO DEFECT", "E", 0);
  assert.equal(x.score, 0);
  assert.equal(x.mult, 2);
  assert.equal(x.phase, "choice");
  x.score = 600;
  onVowel(x, "ZERO DEFECT", "A", 0);
  assert.equal(x.phase, "stun");
  assert.equal(x.score, 300);
});

t("solve +1,000 (×2 with KAIZEN); wrong −1,000 (×2), stun, never below 0", () => {
  const x = newTeam("red", ["a"], "a");
  x.score = 400;
  assert.equal(onSolve(x, "ZERO DEFECT", "zero  defect", 0), true);
  assert.equal(x.score, 400 + SOLVE_POINTS);
  assert.equal(x.solved, 1);
  const y = newTeam("red", ["a"], "a");
  y.score = 2500;
  y.mult = 2;
  assert.equal(onSolve(y, "ZERO DEFECT", "ZERO EFFECT", 0), false);
  assert.equal(y.score, 500);
  assert.equal(y.phase, "stun");
  const z = newTeam("red", ["a"], "a");
  z.score = 300;
  onSolve(z, "ZERO DEFECT", "NO", 0);
  assert.equal(z.score, 0);
});

t("winner: most points, then phrases solved, else draw", () => {
  const r = newTeam("red", [], "");
  const b = newTeam("blue", [], "");
  r.score = 900;
  b.score = 800;
  assert.equal(winnerOf(r, b), "red");
  b.score = 900;
  b.solved = 1;
  assert.equal(winnerOf(r, b), "blue");
  r.solved = 1;
  assert.equal(winnerOf(r, b), "draw");
});

t("teams: first 3 a side play, the first to tap captain leads (else the first member)", () => {
  const picks = {
    a: { side: "red" as const, at: 1, cap: false },
    b: { side: "red" as const, at: 2, cap: true },
    c: { side: "red" as const, at: 3, cap: false },
    d: { side: "red" as const, at: 4, cap: false },
    e: { side: "blue" as const, at: 5, cap: false },
  };
  const tm = teamsFrom(picks, () => true);
  assert.deepEqual(tm.red.members, ["a", "b", "c"]);
  assert.deepEqual(tm.red.extra, ["d"]);
  assert.equal(tm.red.captain, "b");
  assert.equal(tm.blue.captain, "e");
});

t("phone actions go through answers/{uid} and come back the same", () => {
  for (const a of [
    { k: "answer", qid: "q12", choice: 2 },
    { k: "flick", seq: 7, power: 0.5 },
    { k: "letter", seq: 8, L: "T" },
    { k: "vowel", seq: 9, L: "E" },
    { k: "solve", seq: 10, text: "ZERO DEFECT" },
    { k: "again", seq: 11 },
  ] as const)
    assert.deepEqual(decodeAction(encodeAction(a)), a);
  assert.equal(decodeAction({ qid: "!L3:1", choice: 0 }), null);
});

// ---------- Simulation: a team alone against the clock, with the real rule functions ----------
// Time model: the captain answers in ~8 s (team discusses), flicks in ~2 s, picks a letter in ~5 s,
// solves in ~10 s. Skill: right answers, and how often the team picks a letter that is really in the phrase.
const T_Q = 8_000, T_FLICK = 2_000, T_PICK = 5_000, T_SOLVE = 10_000, T_CHOOSE = 2_000;
function play(acc: number, smart: number, mins: number): { pts: number; solved: number } {
  const team = newTeam("red", ["a"], "a");
  const order = [...PHRASES].sort(() => Math.random() - 0.5);
  let p = 0;
  let phrase = order[0].p;
  const next = () => {
    phrase = order[++p % order.length].p;
    team.used = "";
    team.board = maskOf(phrase, "");
  };
  team.board = maskOf(phrase, "");
  const END = mins * 60_000;
  let now = 0;
  const FREQ = "TNSRHLDCMFPGWYBVKXJQZ";
  const pick = (pool: string) => {
    const left = [...pool].filter((c) => !team.used.includes(c));
    if (Math.random() < smart) {
      const good = left.filter((c) => phrase.includes(c));
      if (good.length) return good[0];
    }
    return [...FREQ, ...VOWELS].find((c) => left.includes(c) && Math.random() < 0.6) ?? left[0];
  };
  const frac = () => {
    const L = phrase.replace(/ /g, "");
    return [...L].filter((c) => team.used.includes(c)).length / L.length;
  };
  while (now < END) {
    now += T_Q;
    if (now >= END) break;
    onAnswer(team, Math.random() < acc, now, null);
    if (team.phase === "stun") {
      now += STUN_MS;
      continue;
    }
    // Flick (again after KAIZEN).
    let landed = false;
    while (!landed && now < END) {
      now += T_FLICK;
      onFlick(team, Math.floor(Math.random() * WHEEL.length), now, 0.5, 0);
      now += 4_200;
      onLand(team, now, [...CONSONANTS].some((c) => !team.used.includes(c)));
      landed = team.phase !== "flick";
    }
    if (team.phase === "stun") {
      now += STUN_MS;
      continue;
    }
    if (team.phase === "letter") {
      now += T_PICK;
      onLetter(team, phrase, pick(CONSONANTS), now);
      if (team.phase === "stun") {
        now += STUN_MS;
        continue;
      }
    }
    // Choice: solve when enough is showing, sometimes buy a vowel first.
    while (team.phase === "choice" && now < END) {
      const f = frac();
      if (f >= 0.45 + (1 - smart) * 0.3) {
        now += T_SOLVE;
        if (now >= END) break;
        const right = Math.random() < Math.min(1, ((f - 0.25) / 0.45) * (0.6 + 0.4 * smart));
        if (onSolve(team, phrase, right ? phrase : "WRONG", now)) {
          now += 2_500;
          next();
        } else now += STUN_MS;
        break;
      }
      if (canBuyVowel(team) && Math.random() < 0.4) {
        now += T_CHOOSE;
        onVowel(team, phrase, pick(VOWELS), now);
        if (team.phase === "stun") now += STUN_MS;
        continue;
      }
      now += T_CHOOSE;
      break; // spin again
    }
  }
  return { pts: team.score, solved: team.solved };
}

t("simulation: even teams are 50/50, better teams win more, a few phrases solved in 5 min", () => {
  const GOOD: [number, number] = [0.85, 0.7], AVG: [number, number] = [0.7, 0.5], WEAK: [number, number] = [0.55, 0.3];
  const N = 3000;
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  for (const mins of [3, 5]) {
    console.log(`  ${mins} minutes:`);
    for (const [name, s] of [["good (85% right)", GOOD], ["average (70%)", AVG], ["weak (55%)", WEAK]] as const) {
      const r = Array.from({ length: N }, () => play(s[0], s[1], mins));
      console.log(`    ${name.padEnd(17)} phrases solved ${avg(r.map((x) => x.solved)).toFixed(1)} · points ${Math.round(avg(r.map((x) => x.pts)))}`);
    }
    const vs = (A: [number, number], B: [number, number]) => {
      let w = 0;
      for (let i = 0; i < N; i++) {
        const a = play(A[0], A[1], mins).pts, b = play(B[0], B[1], mins).pts;
        w += a > b ? 1 : a === b ? 0.5 : 0;
      }
      return w / N;
    };
    const even = vs(AVG, AVG), ga = vs(GOOD, AVG), gw = vs(GOOD, WEAK);
    console.log(`    even teams ${(even * 100).toFixed(0)}% · good beats average ${(ga * 100).toFixed(0)}% · good beats weak ${(gw * 100).toFixed(0)}%`);
    assert.ok(even > 0.44 && even < 0.56);
    assert.ok(ga > 0.55 && gw > ga);
  }
});

console.log(`\n${n} quality-spin checks passed`);
