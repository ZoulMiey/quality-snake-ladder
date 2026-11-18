// Checks the game rules. Run: npm test
import assert from "node:assert/strict";
import { resolve, pickQuestion, shuffleOptions } from "../src/lib/rules.ts";

const dice = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++];
};
const r = (pos: number, streak: number, kind: "turn" | "snake" | "ladder", correct: boolean, ...d: number[]) =>
  resolve(pos, streak, kind, correct, { correctIdx: 0, rollDie: dice(...d) });

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};

t("correct answer rolls 2 dice", () => {
  const x = r(0, 0, "turn", true, 2, 3);
  assert.deepEqual(x.result.dice, [2, 3]);
  assert.equal(x.pos, 5);
  assert.equal(x.streak, 1);
});
t("wrong answer rolls 1 die and resets streak", () => {
  const x = r(10, 2, "turn", false, 4);
  assert.deepEqual(x.result.dice, [4]);
  assert.equal(x.pos, 14);
  assert.equal(x.streak, 0);
});
t("third correct in a row rolls 3 dice, then streak back to 0", () => {
  const x = r(0, 2, "turn", true, 1, 1, 2);
  assert.equal(x.result.dice.length, 3);
  assert.equal(x.result.bonus, true);
  assert.equal(x.streak, 0);
  assert.equal(x.pos, 4);
});
t("landing on a snake head asks a snake question", () => {
  const x = r(15, 0, "turn", true, 2, 2);
  assert.equal(x.pos, 19);
  assert.equal(x.result.next, "snake");
});
t("snake question right = stay, wrong = slide", () => {
  assert.equal(r(19, 0, "snake", true).pos, 19);
  assert.equal(r(19, 0, "snake", false).pos, 2);
});
t("landing on a ladder asks a ladder question", () => {
  const x = r(0, 0, "turn", true, 1, 2);
  assert.equal(x.pos, 3);
  assert.equal(x.result.next, "ladder");
});
t("ladder question right = climb, wrong = stay", () => {
  assert.equal(r(3, 0, "ladder", true).pos, 18);
  assert.equal(r(3, 0, "ladder", false).pos, 3);
});
t("snake/ladder answers count toward the streak", () => {
  assert.equal(r(3, 1, "ladder", true).streak, 2);
  assert.equal(r(19, 2, "snake", false).streak, 0);
});
t("from box 45, rolling 5 wins", () => {
  const x = r(45, 0, "turn", false, 5);
  assert.equal(x.result.outcome, "win");
  assert.equal(x.pos, 50);
});
t("from box 40, rolling 10 wins; going past 50 also wins", () => {
  assert.equal(r(40, 0, "turn", true, 4, 6).result.outcome, "win");
  assert.equal(r(44, 0, "turn", true, 6, 6).result.outcome, "win");
});
t("final zone: wrong answer = no roll", () => {
  const x = r(47, 1, "turn", false);
  assert.equal(x.result.outcome, "noroll");
  assert.deepEqual(x.result.dice, []);
  assert.equal(x.pos, 47);
});
t("final zone: total 6 or more wins", () => {
  assert.equal(r(46, 0, "turn", true, 3, 3).result.outcome, "win");
  assert.equal(r(49, 0, "turn", true, 6, 6).pos, 50);
});
t("final zone: total below 6 stays", () => {
  const x = r(48, 0, "turn", true, 2, 3);
  assert.equal(x.result.outcome, "stay");
  assert.equal(x.pos, 48);
});
t("questions never repeat for a player until all are used", () => {
  const pool = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const used = new Set<string>();
  for (let i = 0; i < 3; i++) {
    const p = pickQuestion(pool, used)!;
    assert.equal(p.reset, false);
    assert.ok(!used.has(p.q.id));
    used.add(p.q.id);
  }
  assert.equal(pickQuestion(pool, used)!.reset, true);
});
t("shuffling keeps track of the correct answer", () => {
  for (let i = 0; i < 50; i++) {
    const s = shuffleOptions(["A", "B", "C", "D"], 2);
    assert.equal(s.opts[s.correctIdx], "C");
  }
});
console.log(`\n${n} checks passed`);
