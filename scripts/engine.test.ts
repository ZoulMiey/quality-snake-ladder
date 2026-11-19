// Checks the game rules. Run: npm test
import assert from "node:assert/strict";
import { resolve, pickQuestion, shuffleOptions, winnersNeeded } from "../src/lib/rules.ts";
import { SNAKES, LADDERS, LAST_BOX } from "../src/lib/board.ts";
import { placeSpecials, EVENTS, EVENT_SETS, eventById } from "../src/lib/specials.ts";
import { resultMs, moveTimeline, PENALTY_MS, VERDICT_MS, WRONG_MS, SLIDE_MS, SHAKE_MS, CLIMB_MS, ZOOM_OUT_MS } from "../src/lib/phoneTiming.ts";

// A snake head and a ladder bottom that can be reached with two small dice from a plain box.
const [HEAD, TAIL] = Object.entries(SNAKES).map(([a, b]) => [+a, b])[0];
const [FOOT, TOP] = Object.entries(LADDERS).map(([a, b]) => [+a, b])[0];

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

t("right answer rolls 1 dice", () => {
  const x = r(0, 0, "turn", true, 5);
  assert.deepEqual(x.result.dice, [5]);
  assert.equal(x.pos, 5);
  assert.equal(x.streak, 1);
  assert.equal(x.result.penalty, false);
});
t("wrong answer: no roll, penalty, streak back to 0", () => {
  const x = r(10, 3, "turn", false);
  assert.deepEqual(x.result.dice, []);
  assert.equal(x.result.outcome, "noroll");
  assert.equal(x.result.penalty, true);
  assert.equal(x.pos, 10);
  assert.equal(x.streak, 0);
});
t("time out counts as wrong", () => {
  const x = resolve(10, 2, "turn", false, { timeout: true, correctIdx: 0 });
  assert.equal(x.result.penalty, true);
  assert.equal(x.result.timeout, true);
});
t("4 right in a row still rolls 1 dice", () => {
  const x = r(0, 3, "turn", true, 2);
  assert.equal(x.result.dice.length, 1);
  assert.equal(x.streak, 4);
});
t("5th right in a row rolls 2 dice, then the count restarts", () => {
  const x = r(0, 4, "turn", true, 1, 2);
  assert.equal(x.result.dice.length, 2);
  assert.equal(x.result.bonus, true);
  assert.equal(x.streak, 0);
  assert.equal(x.pos, 3);
});
t("landing on a snake head asks a snake question", () => {
  const x = r(HEAD - 3, 0, "turn", true, 3);
  assert.equal(x.pos, HEAD);
  assert.equal(x.result.next, "snake");
});
t("snake question: right = stay, wrong = slide + penalty", () => {
  assert.equal(r(HEAD, 0, "snake", true).pos, HEAD);
  const w = r(HEAD, 0, "snake", false);
  assert.equal(w.pos, TAIL);
  assert.equal(w.result.penalty, true);
});
t("landing on a ladder asks a ladder question", () => {
  const x = r(FOOT - 2, 0, "turn", true, 2);
  assert.equal(x.pos, FOOT);
  assert.equal(x.result.next, "ladder");
});
t("ladder question: right = climb, wrong = stay + penalty", () => {
  assert.equal(r(FOOT, 0, "ladder", true).pos, TOP);
  const w = r(FOOT, 0, "ladder", false);
  assert.equal(w.pos, FOOT);
  assert.equal(w.result.penalty, true);
});
t("snake/ladder answers count toward the streak", () => {
  assert.equal(r(FOOT, 1, "ladder", true).streak, 2);
  assert.equal(r(HEAD, 4, "snake", false).streak, 0);
});
t("reaching box 100 wins (from 96 a 4 wins, from 99 any roll wins)", () => {
  assert.equal(r(96, 0, "turn", true, 4).result.outcome, "win");
  assert.equal(r(96, 0, "turn", true, 3).pos, 99);
  assert.equal(r(99, 0, "turn", true, 1).result.outcome, "win");
  assert.equal(r(97, 0, "turn", true, 6).pos, LAST_BOX);
});
t("special box: forward or back at once", () => {
  const specials = [{ box: 33, id: "viscosity" }, { box: 38, id: "cso" }];
  const f = resolve(30, 0, "turn", true, { correctIdx: 0, rollDie: () => 3, specials });
  assert.equal(f.result.land, 33);
  assert.equal(f.result.special, "viscosity");
  assert.equal(f.pos, 35);
  const b = resolve(35, 0, "turn", true, { correctIdx: 0, rollDie: () => 3, specials });
  assert.equal(b.pos, 35); // 38 - 3
});
t("special box that sends you to a snake head asks the snake question", () => {
  const head = Number(Object.keys(SNAKES)[0]);
  const specials = [{ box: head - 2, id: "viscosity" }];
  const x = resolve(head - 5, 0, "turn", true, { correctIdx: 0, rollDie: () => 3, specials });
  assert.equal(x.pos, head);
  assert.equal(x.result.next, "snake");
});
t("a special box leading to another special box does nothing more", () => {
  const specials = [{ box: 33, id: "viscosity" }, { box: 35, id: "cso" }];
  const x = resolve(30, 0, "turn", true, { correctIdx: 0, rollDie: () => 3, specials });
  assert.equal(x.pos, 35);
});
t("16 event boxes, placed away from snakes, ladders, start and finish, from the game's question set", () => {
  const ends = new Set([...Object.entries(SNAKES), ...Object.entries(LADDERS)].flat().map(Number));
  for (const qset of ["quality", "world", "logo", "malaysia", "general", "mix"] as const)
    for (let k = 0; k < 300; k++) {
      const list = placeSpecials(qset);
      assert.equal(list.length, 16, `${qset}: ${list.length} boxes`);
      for (const s of list) {
        assert.ok(s.box >= 6 && s.box <= 90, `box ${s.box}`);
        assert.ok(!ends.has(s.box), `box ${s.box} is a snake/ladder end`);
        const ev = eventById(s.id)!;
        assert.ok(ev, s.id);
        if (qset === "mix") assert.ok(!EVENT_SETS.quality.includes(ev), "Mix uses no Quality events");
        else assert.ok(EVENT_SETS[qset].includes(ev), `${s.id} is not a ${qset} event`);
      }
      assert.equal(new Set(list.map((s) => s.box)).size, 16);
      assert.equal(new Set(list.map((s) => s.id)).size, 16, "each event once");
      if (qset === "mix") assert.equal(list.filter((s) => eventById(s.id)!.move > 0).length, 8, "Mix: 8 good, 8 bad");
    }
});
t("every set has 16 events, 8 good and 8 bad, roughly balanced, complete in both languages", () => {
  assert.equal(new Set(EVENTS.map((e) => e.id)).size, EVENTS.length, "unique ids");
  for (const [k, list] of Object.entries(EVENT_SETS)) {
    assert.equal(list.length, 16, k);
    assert.equal(list.filter((e) => e.move > 0).length, 8, k);
    const net = list.reduce((a, e) => a + e.move, 0);
    assert.ok(Math.abs(net) <= 2, `${k} net move ${net}`);
    for (const e of list) assert.ok(e.en && e.ms && e.icon && e.move !== 0 && Math.abs(e.move) <= 4, e.id);
  }
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
t("the game ends after one winner fewer than the players, at most 5", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 10, 20].map(winnersNeeded), [1, 1, 2, 3, 4, 5, 5, 5, 5]);
});
t("shuffling keeps track of the correct answer", () => {
  for (let i = 0; i < 50; i++) {
    const s = shuffleOptions(["A", "B", "C", "D"], 2);
    assert.equal(s.opts[s.correctIdx], "C");
  }
});
t("the phone's animations always finish before the next question", () => {
  for (let pos = 0; pos < LAST_BOX; pos++)
    for (const streak of [0, 4])
      for (let d = 1; d <= 6; d++) {
        for (const specials of [null, placeSpecials()]) {
          const x = resolve(pos, streak, "turn", true, { correctIdx: 0, rollDie: dice(d, 7 - d), specials });
          if (x.result.outcome === "move") assert.ok(resultMs(x.result) >= moveTimeline(x.result).end, `move from ${pos}`);
        }
      }
  assert.ok(resultMs(r(FOOT, 0, "ladder", true).result) >= VERDICT_MS + CLIMB_MS + ZOOM_OUT_MS);
  assert.ok(VERDICT_MS + SLIDE_MS + 300 < PENALTY_MS, "snake slide fits in the penalty");
  assert.ok(VERDICT_MS + SHAKE_MS + 300 < PENALTY_MS && WRONG_MS < PENALTY_MS, "wrong-answer screens fit in the penalty");
  assert.equal(resultMs(r(HEAD, 0, "snake", false).result), PENALTY_MS);
  assert.equal(resultMs(r(5, 0, "turn", false).result), PENALTY_MS);
});
console.log(`\n${n} checks passed`);
