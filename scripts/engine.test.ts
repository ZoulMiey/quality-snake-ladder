// Checks the game rules. Run: npm test
import assert from "node:assert/strict";
import { resolve, pickQuestion, shuffleOptions } from "../src/lib/rules.ts";
import { SNAKES, LADDERS, LAST_BOX, FINAL_ZONE_START } from "../src/lib/board.ts";

// A snake head and a ladder bottom that can be reached with two small dice from a plain box.
const [HEAD, TAIL] = Object.entries(SNAKES).map(([a, b]) => [+a, b])[0];
const [FOOT, TOP] = Object.entries(LADDERS).map(([a, b]) => [+a, b])[0];
const Z = FINAL_ZONE_START;

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
  const x = r(0, 2, "turn", true, 1, 1, 1);
  assert.equal(x.result.dice.length, 3);
  assert.equal(x.result.bonus, true);
  assert.equal(x.streak, 0);
  assert.equal(x.pos, 3);
});
t("landing on a snake head asks a snake question", () => {
  const x = r(HEAD - 4, 0, "turn", true, 2, 2);
  assert.equal(x.pos, HEAD);
  assert.equal(x.result.next, "snake");
});
t("snake question right = stay, wrong = slide", () => {
  assert.equal(r(HEAD, 0, "snake", true).pos, HEAD);
  assert.equal(r(HEAD, 0, "snake", false).pos, TAIL);
});
t("landing on a ladder asks a ladder question", () => {
  const x = r(FOOT - 3, 0, "turn", true, 1, 2);
  assert.equal(x.pos, FOOT);
  assert.equal(x.result.next, "ladder");
});
t("ladder question right = climb, wrong = stay", () => {
  assert.equal(r(FOOT, 0, "ladder", true).pos, TOP);
  assert.equal(r(FOOT, 0, "ladder", false).pos, FOOT);
});
t("snake/ladder answers count toward the streak", () => {
  assert.equal(r(FOOT, 1, "ladder", true).streak, 2);
  assert.equal(r(HEAD, 2, "snake", false).streak, 0);
});
t("from box 95, rolling 5 wins", () => {
  const x = r(Z - 1, 0, "turn", false, 5);
  assert.equal(x.result.outcome, "win");
  assert.equal(x.pos, LAST_BOX);
});
t("from box 90, rolling 10 wins; going past 100 also wins", () => {
  assert.equal(r(LAST_BOX - 10, 0, "turn", true, 4, 6).result.outcome, "win");
  assert.equal(r(Z - 2, 0, "turn", true, 6, 6).result.outcome, "win");
});
t("final zone: wrong answer = no roll", () => {
  const x = r(Z + 1, 1, "turn", false);
  assert.equal(x.result.outcome, "noroll");
  assert.deepEqual(x.result.dice, []);
  assert.equal(x.pos, Z + 1);
});
t("final zone: total 6 or more wins", () => {
  assert.equal(r(Z, 0, "turn", true, 3, 3).result.outcome, "win");
  assert.equal(r(LAST_BOX - 1, 0, "turn", true, 6, 6).pos, LAST_BOX);
});
t("final zone: total below 6 stays", () => {
  const x = r(Z + 2, 0, "turn", true, 2, 3);
  assert.equal(x.result.outcome, "stay");
  assert.equal(x.pos, Z + 2);
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
