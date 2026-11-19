// Checks the Fishing Derby rules, and simulates 5-minute games. Run: npm test
import assert from "node:assert/strict";
import { SIDE_BEATS } from "../src/fish/pondSide.ts";
import { catchFor, addCatch, newFishState, frenzyAt, rankFishers, shoutOuts, boatOrder, boatSpot, GAME_MS, QUESTION_MS, FRENZY_MS, RESULT_MS, SNAP_MS, type FishState } from "../src/fish/rules.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const opts = (frenzy = false, rand?: () => number) => ({ frenzy, timeout: false, choice: 0, correctIdx: 0, rand });

t("5:00 game, 20 s questions, 5 s snap, 30 s frenzies", () => {
  assert.equal(GAME_MS, 300_000);
  assert.equal(QUESTION_MS, 20_000);
  assert.equal(SNAP_MS, 5_000);
  assert.equal(FRENZY_MS, 30_000);
});

t("right answers in a row: fish, fish, BIG, fish, GOLDEN, then the count restarts", () => {
  let s = 0;
  const kinds: string[] = [];
  for (let i = 0; i < 7; i++) {
    const r = catchFor(s, true, opts());
    kinds.push(r.result.kind);
    s = r.streak;
  }
  assert.deepEqual(kinds, ["fish", "fish", "big", "fish", "gold", "fish", "fish"]);
});

t("a wrong answer snaps the line and resets the row count", () => {
  const r = catchFor(4, false, opts());
  assert.equal(r.result.kind, "snap");
  assert.equal(r.result.kg, 0);
  assert.equal(r.streak, 0);
  assert.equal(catchFor(r.streak, true, opts()).result.kind, "fish");
});

t("weights: fish 1–6, big 10–18, golden 30–45 kg; frenzy doubles", () => {
  for (const [streak, lo, hi] of [[0, 1, 6], [2, 10, 18], [4, 30, 45]] as const)
    for (const x of [0, 0.5, 0.9999]) {
      const kg = catchFor(streak, true, opts(false, () => x)).result.kg;
      assert.ok(kg >= lo && kg <= hi, `${kg} in ${lo}-${hi}`);
      assert.equal(catchFor(streak, true, opts(true, () => x)).result.kg, Math.round(kg * 20) / 10);
    }
});

t("frenzy windows at 1:00, 2:00, 3:00, 4:00 for 30 s", () => {
  assert.equal(frenzyAt(59_999).on, false);
  assert.equal(frenzyAt(59_999).nextIn, 1);
  assert.equal(frenzyAt(60_000).on, true);
  assert.equal(frenzyAt(89_999).on, true);
  assert.equal(frenzyAt(90_000).on, false);
  assert.equal(frenzyAt(250_000).index, 3);
  assert.equal(frenzyAt(280_000).nextIn, null);
});

t("totals, ranking (tie = more right answers) and shout-outs", () => {
  const a = newFishState();
  const b = newFishState();
  addCatch(a, { kind: "gold", kg: 40, name: "Kelisa Emas", frenzy: false, correct: true, timeout: false, choice: 0, correctIdx: 0 });
  addCatch(b, { kind: "big", kg: 20, name: "Toman", frenzy: false, correct: true, timeout: false, choice: 0, correctIdx: 0 });
  addCatch(b, { kind: "big", kg: 20, name: "Patin", frenzy: false, correct: true, timeout: false, choice: 0, correctIdx: 0 });
  assert.equal(a.kg, 40);
  assert.equal(b.kg, 40);
  assert.deepEqual(rankFishers([["a", a], ["b", b]]).map(([u]) => u), ["b", "a"], "tie: b has more right answers");
  const so = shoutOuts([["a", a], ["b", b]]);
  assert.equal(so.biggest?.[0], "a");
  assert.equal(so.golden?.[0], "a");
  assert.equal(shoutOuts([["x", newFishState()]]).golden, null);
});

t("result times leave room for the phone's side-view catch", () => {
  assert.ok(RESULT_MS.fish >= SIDE_BEATS.fish.land + 300);
  assert.ok(RESULT_MS.big >= SIDE_BEATS.big.land + 400);
  assert.ok(RESULT_MS.gold >= RESULT_MS.big);
});

t("boats: everyone agrees on the order; two rings above 24 players", () => {
  assert.deepEqual(boatOrder({ b: { joinedAt: 2 }, a: { joinedAt: 2 }, c: { joinedAt: 1 } }), ["c", "a", "b"]);
  assert.equal(boatSpot(0, 10).r, boatSpot(1, 10).r);
  assert.notEqual(boatSpot(0, 30).r, boatSpot(1, 30).r);
});

// Simulation with the engine's rules: answer times, result times, frenzies.
function play(acc: number, tmin: number, tmax: number) {
  const st: FishState = newFishState();
  let time = 0;
  for (;;) {
    time += tmin + Math.random() * (tmax - tmin);
    if (time > GAME_MS) break;
    const ok = Math.random() < acc;
    const r = catchFor(st.streak, ok, opts(frenzyAt(time).on));
    st.streak = r.streak;
    addCatch(st, r.result);
    time += RESULT_MS[r.result.kind];
  }
  return st;
}
t("simulation: better players catch clearly more", () => {
  const avg = (acc: number, a: number, b: number) => {
    let kg = 0;
    for (let i = 0; i < 2000; i++) kg += play(acc, a, b).kg;
    return kg / 2000;
  };
  const weak = avg(0.5, 4000, 14000);
  const mid = avg(0.7, 3000, 12000);
  const strong = avg(0.9, 2000, 7000);
  console.log(`   average total: weak ${weak.toFixed(0)} kg, average ${mid.toFixed(0)} kg, strong ${strong.toFixed(0)} kg`);
  assert.ok(weak < mid && mid < strong);
  assert.ok(strong > 2 * mid);
});

console.log(`\n${n} fishing checks passed`);
