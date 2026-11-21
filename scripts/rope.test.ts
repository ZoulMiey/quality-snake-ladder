// Checks the Pull the Rope rules, and simulates rounds to show the balance numbers. Run: npm test
import assert from "node:assert/strict";
import {
  NEXT_ROUND_MS,
  READY_COUNT_MS,
  HEAVE_AT,
  HEAVE_MS,
  QUESTION_MS,
  ROUND_MS,
  WRONG_MS,
  heaveAt,
  judgeAnswer,
  lineOrder,
  matchWinner,
  mvpOrder,
  pullFor,
  ropeFeedLines,
  roundWinner,
  shoutOuts,
  simulateRound,
  teamsFor,
  type SimTeam,
  type Side,
} from "../src/rope/rules.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const opts = (ms = 6000, heave = false, sideCount = 12, total = 24) => ({ ms, heave, sideCount, total, choice: 0, correctIdx: 0 });

t("3:00 rounds, 15 s questions, 3 s wait after a wrong answer; 5 s countdown + ROUND banner after READY", () => {
  assert.equal(ROUND_MS, 180_000);
  assert.equal(QUESTION_MS, 15_000);
  assert.equal(WRONG_MS, 3_000);
  assert.equal(READY_COUNT_MS, 5_000);
  assert.equal(NEXT_ROUND_MS, 6_500);
});

t("each pull is shared by team size: 2 players pull as hard as 4 in total", () => {
  const four = 4 * pullFor(4, 6, { fast: false, power: false, heave: false });
  const two = 2 * pullFor(2, 6, { fast: false, power: false, heave: false });
  close(four, two);
  // 12 v 12: 0.3 / 12 per right answer.
  close(pullFor(12, 24, { fast: false, power: false, heave: false }), 0.3 / 12);
});

t("bonuses: FAST ×1.25, POWER PULL ×2, HEAVE ×2, all together ×5", () => {
  const b = pullFor(10, 20, { fast: false, power: false, heave: false });
  close(pullFor(10, 20, { fast: true, power: false, heave: false }), b * 1.25);
  close(pullFor(10, 20, { fast: false, power: true, heave: false }), b * 2);
  close(pullFor(10, 20, { fast: false, power: false, heave: true }), b * 2);
  close(pullFor(10, 20, { fast: true, power: true, heave: true }), b * 5);
});

t("every 3rd right answer in a row is a POWER PULL; a wrong answer resets the row", () => {
  let s = 0;
  const powers: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const r = judgeAnswer(s, true, opts());
    powers.push(r.result.power);
    s = r.streak;
  }
  assert.deepEqual(powers, [false, false, true, false, false, true, false]);
  const w = judgeAnswer(2, false, opts());
  assert.equal(w.streak, 0);
  assert.equal(w.result.pull, 0);
  assert.equal(judgeAnswer(w.streak, true, opts()).result.power, false);
});

t("FAST = right within 3 s (plus 0.3 s for the network)", () => {
  assert.equal(judgeAnswer(0, true, opts(2900)).result.fast, true);
  assert.equal(judgeAnswer(0, true, opts(3250)).result.fast, true);
  assert.equal(judgeAnswer(0, true, opts(3400)).result.fast, false);
  assert.equal(judgeAnswer(0, false, opts(1000)).result.fast, false);
});

t("HEAVE! every minute (1:00 and 2:00) for 30 s", () => {
  assert.deepEqual(HEAVE_AT, [60_000, 120_000]);
  assert.equal(HEAVE_MS, 30_000);
  assert.equal(heaveAt(59_999).on, false);
  assert.equal(heaveAt(59_000).nextIn, 1_000);
  assert.equal(heaveAt(60_000).on, true);
  assert.equal(heaveAt(89_999).index, 0);
  assert.equal(heaveAt(90_000).on, false);
  assert.equal(heaveAt(90_000).nextIn, 30_000);
  assert.equal(heaveAt(145_000).index, 1);
  assert.equal(heaveAt(150_000).nextIn, null);
});

t("round winner: a bank; else the flag's side; else more right answers; else a draw", () => {
  assert.equal(roundWinner(1, { red: 0, blue: 0 }, "bank").win, "blue");
  assert.equal(roundWinner(-1.2, { red: 0, blue: 0 }, "bank").win, "red");
  assert.equal(roundWinner(0.3, { red: 9, blue: 1 }, "time").win, "blue");
  assert.equal(roundWinner(-0.01, { red: 1, blue: 9 }, "time").win, "red");
  assert.equal(roundWinner(0, { red: 4, blue: 5 }, "time").win, "blue");
  assert.equal(roundWinner(0, { red: 5, blue: 5 }, "time").win, "draw");
});

t("best of 3; a drawn round adds a round (max 5)", () => {
  assert.equal(matchWinner({ red: 1, blue: 0 }, 1), null);
  assert.equal(matchWinner({ red: 2, blue: 0 }, 2), "red");
  assert.equal(matchWinner({ red: 1, blue: 2 }, 3), "blue");
  assert.equal(matchWinner({ red: 1, blue: 1 }, 3), null);
  assert.equal(matchWinner({ red: 1, blue: 1 }, 5), "draw");
  assert.equal(matchWinner({ red: 1, blue: 0 }, 5), "red");
});

t("teams: picked sides are kept; the rest fill the smaller team in joining order", () => {
  const players = { a: { joinedAt: 1 }, b: { joinedAt: 2 }, c: { joinedAt: 3 }, d: { joinedAt: 4 }, e: { joinedAt: 5 } };
  const teams = teamsFor(players, { a: "red", b: "red", c: "red" });
  assert.deepEqual(teams, { a: "red", b: "red", c: "red", d: "blue", e: "blue" });
  const all = teamsFor(players, {});
  assert.deepEqual(Object.values(all).filter((s) => s === "red").length, 3);
  const order = lineOrder(teams, { c: 1, a: 2, b: 3 }, players);
  assert.deepEqual(order, { red: ["c", "a", "b"], blue: ["d", "e"] });
});

t("MVP = most right answers (tie: faster); shout-outs: fastest answer, longest streak", () => {
  const s = (correct: number, fastest: number, bestStreak: number, answered = 20) => ({ correct, fastest, bestStreak, answered });
  const list: [string, ReturnType<typeof s>][] = [
    ["a", s(10, 2500, 4)],
    ["b", s(12, 4000, 3)],
    ["c", s(12, 1800, 7)],
    ["d", s(0, 0, 0)],
  ];
  assert.deepEqual(mvpOrder(list).map(([u]) => u), ["c", "b", "a", "d"]);
  const so = shoutOuts(list);
  assert.equal(so.fastest?.[0], "c");
  assert.equal(so.streak?.[0], "c");
  assert.equal(shoutOuts([["d", s(0, 0, 1)]]).fastest, null);
});

// Seeded random numbers so the numbers are the same every run.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
function stats(red: SimTeam, blue: SimTeam, rounds = 1500, seed = 7) {
  const rand = rng(seed);
  let bank = 0;
  let blueWins = 0;
  const times: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const r = simulateRound({ red, blue } as Record<Side, SimTeam>, rand);
    if (r.bank) {
      bank++;
      times.push(r.ms);
    }
    if (r.win === "blue") blueWins++;
  }
  times.sort((a, b) => a - b);
  const med = times.length ? times[times.length >> 1] : NaN;
  return { bank: bank / rounds, blue: blueWins / rounds, med };
}
const mmss = (ms: number) => (isNaN(ms) ? "–" : `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000)).padStart(2, "0")}`);
const show = (label: string, s: ReturnType<typeof stats>) => console.log(`   ${label.padEnd(28)} bank ${Math.round(s.bank * 100)}% (~${mmss(s.med)}), Blue wins ${Math.round(s.blue * 100)}%`);

t("simulation: even teams are a coin toss; about half the rounds go to time", () => {
  const s = stats({ n: 12, acc: 0.7 }, { n: 12, acc: 0.7 });
  show("12 v 12, both 70%", s);
  assert.ok(s.blue > 0.42 && s.blue < 0.58);
  assert.ok(s.bank > 0.2 && s.bank < 0.55);
});

t("simulation: the better team wins, and pulls the others in sooner", () => {
  const s = stats({ n: 12, acc: 0.7 }, { n: 12, acc: 0.8 });
  show("12 v 12, 70% v 80%", s);
  assert.ok(s.blue > 0.88);
  assert.ok(s.bank > 0.6);
  assert.ok(s.med < 120_000);
  const big = stats({ n: 25, acc: 0.7 }, { n: 25, acc: 0.8 }, 600);
  show("25 v 25, 70% v 80%", big);
  assert.ok(big.blue > 0.9);
});

t("simulation: team size does not matter (4 v 2, 20 v 10 at the same skill)", () => {
  const a = stats({ n: 4, acc: 0.7 }, { n: 2, acc: 0.7 });
  show("4 v 2 (Blue 2), both 70%", a);
  assert.ok(a.blue > 0.42 && a.blue < 0.58);
  const b = stats({ n: 20, acc: 0.7 }, { n: 10, acc: 0.7 }, 800);
  show("20 v 10 (Blue 10), both 70%", b);
  assert.ok(b.blue > 0.42 && b.blue < 0.58);
});

t("simulation: small games don't end too fast (1 v 1 still ~2 minutes)", () => {
  const s = stats({ n: 1, acc: 0.7 }, { n: 1, acc: 0.8 });
  show("1 v 1, 70% v 80%", s);
  assert.ok(isNaN(s.med) || s.med > 80_000);
});

t("projector feed: only the newest POWER PULL, HEAVE! and round lines kept", () => {
  const f = (at: number, k: string | undefined, text: string) => ({ at, uid: "", text, tone: "good", ...(k ? { k } : {}) }) as never;
  const lines = ropeFeedLines([f(1, "round", "Round 1"), ...Array.from({ length: 20 }, (_, i) => f(10 + i, "power", `power ${i}`)), f(15, "heave", "HEAVE!")]);
  assert.deepEqual(lines.map((x: { text: string }) => x.text), ["power 19", "HEAVE!", "Round 1"]);
});

console.log(`\n${n} pull-the-rope checks passed`);
