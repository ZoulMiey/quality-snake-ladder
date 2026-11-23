// Checks the Fishing Derby rules, and simulates 5-minute games. Run: npm test
import assert from "node:assert/strict";
import { SIDE_BEATS } from "../src/fish/pondSide.ts";
import { catchFor, addCatch, newFishState, frenzyAt, rankFishers, shoutOuts, boatOrder, boatSpot, behindPlayers, GAME_MS, QUESTION_MS, FRENZY_MS, RESULT_MS, SNAP_MS, type FishState } from "../src/fish/rules.ts";

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

t("weights: fish 1–6, big 8–12, golden 15–20 kg, 1 normal catch in 8 a lucky fish 15–40 kg; frenzy doubles", () => {
  for (const [streak, lo, hi] of [[0, 1, 6], [2, 8, 12], [4, 15, 20]] as const)
    for (const x of [0.5, 0.9999]) {
      const kg = catchFor(streak, true, opts(false, () => x)).result.kg;
      assert.ok(kg >= lo && kg <= hi, `${kg} in ${lo}-${hi}`);
      assert.equal(catchFor(streak, true, opts(true, () => x)).result.kg, Math.round(kg * 20) / 10);
    }
  // rand() below 1/8 on a normal catch = lucky (BIG and GOLDEN are never lucky)
  const lucky = catchFor(0, true, opts(false, () => 0.05)).result;
  assert.ok(lucky.lucky && lucky.kg >= 15 && lucky.kg <= 40 && lucky.kind === "fish", JSON.stringify(lucky));
  assert.ok(!catchFor(2, true, opts(false, () => 0.05)).result.lucky);
  let n = 0;
  for (let i = 0; i < 8000; i++) if (catchFor(0, true, opts()).result.lucky) n++;
  assert.ok(n > 800 && n < 1200, `lucky ${n}/8000`);
});

t("catch-up: players below the median total catch x2; nobody while everyone is level", () => {
  assert.deepEqual(behindPlayers({ a: 0, b: 0, c: 0 }), {});
  assert.deepEqual(behindPlayers({ a: 50, b: 10 }), { b: true });
  assert.deepEqual(behindPlayers({ a: 50, b: 30, c: 10, d: 5 }), { c: true, d: true });
  assert.deepEqual(behindPlayers({ solo: 3 }), {});
  const x = () => 0.5;
  const normal = catchFor(0, true, opts(false, x)).result;
  const boosted = catchFor(0, true, { ...opts(false, x), behind: true }).result;
  assert.equal(boosted.kg, Math.round(normal.kg * 20) / 10);
  assert.ok(boosted.boost && !normal.boost);
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

t("Quick catch: the next question comes before the fish lands; BIG / GOLDEN alerts stay ~2 s; SNAP 5 s", () => {
  assert.ok(RESULT_MS.fish >= 800 && RESULT_MS.fish < SIDE_BEATS.fish.land);
  assert.ok(RESULT_MS.big >= 1_800 && RESULT_MS.big < SIDE_BEATS.big.land);
  assert.ok(RESULT_MS.gold >= RESULT_MS.big);
  assert.equal(RESULT_MS.snap, 5_000);
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

// A whole pond: 7 weak, 7 average, 7 strong players at once, with the catch-up (behind the median = x2).
t("simulation, 21 players with catch-up: better players still win, the gap is much smaller", () => {
  const kinds = [["weak", 0.5, 4000, 14000], ["avg", 0.7, 3000, 12000], ["strong", 0.9, 2000, 7000]] as const;
  const tot: Record<string, number> = { weak: 0, avg: 0, strong: 0 };
  const G = 150;
  for (let g = 0; g < G; g++) {
    const P = kinds.flatMap(([k, acc, a, b]) => Array.from({ length: 7 }, (_, i) => ({ id: `${k}${i}`, k, acc, a, b, st: newFishState(), next: a + Math.random() * (b - a) })));
    for (;;) {
      const p = P.reduce((m, x) => (x.next < m.next ? x : m));
      if (p.next > GAME_MS) break;
      const behind = !!behindPlayers(Object.fromEntries(P.map((x) => [x.id, x.st.kg])))[p.id];
      const r = catchFor(p.st.streak, Math.random() < p.acc, { ...opts(frenzyAt(p.next).on), behind });
      p.st.streak = r.streak;
      addCatch(p.st, r.result);
      p.next += RESULT_MS[r.result.kind] + p.a + Math.random() * (p.b - p.a);
    }
    for (const p of P) tot[p.k] += p.st.kg / 7 / G;
  }
  console.log(`   21 players: weak ${tot.weak.toFixed(0)} kg, average ${tot.avg.toFixed(0)} kg, strong ${tot.strong.toFixed(0)} kg (strong / weak ${(tot.strong / tot.weak).toFixed(1)}; was 6.5)`);
  assert.ok(tot.weak < tot.avg && tot.avg < tot.strong);
  assert.ok(tot.strong / tot.weak < 3.5);
});

console.log(`\n${n} fishing checks passed`);
