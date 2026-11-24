// Checks the question bank and the question sets. Run: npm test
import assert from "node:assert/strict";
import { DEFAULT_QUESTIONS } from "../src/lib/defaultQuestions.ts";
import { MORE_QUESTIONS } from "../src/lib/moreQuestions.ts";
import { EXTRA_QUESTIONS } from "../src/lib/extraQuestions.ts";
import { SET_IDS, poolFor, setOf } from "../src/lib/questionSets.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const ALL = [...DEFAULT_QUESTIONS, ...MORE_QUESTIONS, ...EXTRA_QUESTIONS];

t("every question has a unique id", () => {
  assert.equal(new Set(ALL.map((q) => q.id)).size, ALL.length);
});

t("every question is complete in English and Malay, with a valid right answer", () => {
  for (const q of ALL) {
    assert.ok(q.q.en.trim() && q.q.ms.trim(), q.id);
    if (q.type === "mc") {
      assert.equal(q.opts?.length, 4, q.id);
      for (const o of q.opts!) assert.ok(o.en.trim() && o.ms.trim(), q.id);
      assert.ok(q.ans >= 0 && q.ans < 4, q.id);
      assert.equal(new Set(q.opts!.map((o) => o.en.toLowerCase())).size, 4, `${q.id}: answers must differ`);
    } else assert.ok(q.ans === 0 || q.ans === 1, q.id);
  }
});

t("each set has 100 questions; old questions without a set count as Quality", () => {
  const count = Object.fromEntries(SET_IDS.map((s) => [s, ALL.filter((q) => setOf(q) === s).length]));
  console.log("  ", JSON.stringify(count));
  for (const s of SET_IDS) assert.equal(count[s], 100, s);
  assert.equal(setOf({}), "quality");
});

t("a game asks only switched-on questions from its set; Mix is every set except Quality", () => {
  const bank = Object.fromEntries(ALL.map((q) => [q.id, { ...q }]));
  bank.w01.enabled = false;
  const world = poolFor(bank, "world");
  assert.ok(world.every((q) => q.set === "world" && q.enabled));
  assert.ok(!world.some((q) => q.id === "w01"));
  const mix = poolFor(bank, "mix");
  assert.ok(mix.length > 300 && mix.every((q) => setOf(q) !== "quality"));
  assert.ok(poolFor(bank, null).every((q) => setOf(q) === "quality"), "no choice = Quality");
});

console.log(`\n${n} question checks passed`);
