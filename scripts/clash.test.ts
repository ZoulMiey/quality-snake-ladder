// Checks the Quality Clash battle rules. Run: npm test
import assert from "node:assert/strict";
import { CREATURES } from "../src/clash/creatures.ts";
import { HP, SHIELD, SOLO_DAMAGE, TEAM_DAMAGE, lineUp, newBattle, right, wrong, aliveOf, isAlive, type Format, type Pick } from "../src/clash/sim.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const team = (picks: Pick[]) => newBattle("team", lineUp("team", picks).fighters);

t("there are 15 creatures with different ids", () => {
  assert.equal(CREATURES.length, 15);
  assert.equal(new Set(CREATURES.map((c) => c.id)).size, 15);
});

t("team line-up: 3 per side, first come first in, no two teammates with the same creature", () => {
  const picks: Pick[] = [
    { uid: "a", side: "red", c: ["dragon"], at: 1 },
    { uid: "b", side: "red", c: ["dragon"], at: 2 },
    { uid: "c", side: "red", c: ["fox"], at: 3 },
    { uid: "d", side: "red", c: ["owl"], at: 4 },
    { uid: "e", side: "red", c: ["bee"], at: 5 },
    { uid: "f", side: "blue", c: ["dragon"], at: 6 },
    { uid: "g", side: "blue", c: ["nothing"], at: 7 },
  ];
  const { fighters, watching } = lineUp("team", picks);
  assert.deepEqual(Object.values(fighters).filter((f) => f.side === "red").map((f) => f.uid), ["a", "c", "d"]);
  assert.deepEqual(Object.values(fighters).filter((f) => f.side === "blue").map((f) => f.c), ["dragon"]);
  assert.deepEqual(watching.sort(), ["b", "e", "g"]);
  for (const f of Object.values(fighters)) assert.equal(f.hp, HP);
});

t("1 v 1 line-up: one player per side with exactly 3 different creatures", () => {
  const { fighters, watching } = lineUp("solo", [
    { uid: "a", side: "red", c: ["dragon", "fox"], at: 1 },
    { uid: "b", side: "red", c: ["dragon", "fox", "owl"], at: 2 },
    { uid: "c", side: "red", c: ["bee", "mole", "golem"], at: 3 },
    { uid: "d", side: "blue", c: ["dragon", "fox", "owl"], at: 4 },
  ]);
  assert.equal(Object.values(fighters).filter((f) => f.uid === "b").length, 3);
  assert.equal(Object.values(fighters).filter((f) => f.uid === "d").length, 3);
  assert.deepEqual(watching.sort(), ["a", "c"]);
});

t("team: right answer = 20 damage to the opponent with the lowest HP", () => {
  const b = team([
    { uid: "a", side: "red", c: ["dragon"], at: 1 },
    { uid: "x", side: "blue", c: ["owl"], at: 2 },
    { uid: "y", side: "blue", c: ["golem"], at: 3 },
  ]);
  b.fighters.b1.hp = 100;
  const r = right(b, "a", false);
  assert.deepEqual(r.hits, [["r0", "b1", TEAM_DAMAGE, 0]]);
  assert.equal(b.fighters.b1.hp, 100 - TEAM_DAMAGE);
  assert.equal(b.fighters.r0.lv, 2);
});

t("FAST is +25% and the 5th right in a row is a super move ×2, then the count restarts", () => {
  const b = team([
    { uid: "a", side: "red", c: ["dragon"] },
    { uid: "x", side: "blue", c: ["owl"] },
  ]);
  assert.equal(right(b, "a", true).dmg, 25);
  for (let i = 0; i < 3; i++) assert.equal(right(b, "a", false).sup, false);
  const s = right(b, "a", false);
  assert.ok(s.sup);
  assert.equal(s.dmg, 40);
  assert.equal(b.streak.a, 0);
  right(b, "a", false);
  wrong(b, "a");
  assert.equal(b.streak.a, 0);
  for (let i = 0; i < 4; i++) right(b, "a", true);
  assert.equal(right(b, "a", true).dmg, 50, "super + fast");
});

t("team shield: every 5 team rights give +50 to the teammate with the lowest HP, and it takes damage first", () => {
  const b = team([
    { uid: "a", side: "red", c: ["dragon"], at: 1 },
    { uid: "c", side: "red", c: ["fox"], at: 2 },
    { uid: "x", side: "blue", c: ["owl"], at: 3 },
  ]);
  b.fighters.r1.hp = 90;
  let got: string | null = null;
  for (let i = 0; i < 5; i++) got = right(b, i % 2 ? "c" : "a", false).shieldTo ?? got;
  assert.equal(got, "r1");
  assert.equal(b.fighters.r1.sh, SHIELD);
  const hit = right(b, "x", false);
  assert.deepEqual(hit.hits[0], ["b0", "r1", 20, 20]);
  assert.equal(b.fighters.r1.hp, 90);
  assert.equal(b.fighters.r1.sh, 30);
});

t("1 v 1: every creature still standing attacks for 10, with no shield", () => {
  const { fighters } = lineUp("solo", [
    { uid: "a", side: "red", c: ["dragon", "fox", "owl"], at: 1 },
    { uid: "x", side: "blue", c: ["bee", "mole", "golem"], at: 2 },
  ]);
  const b = newBattle("solo", fighters);
  const r = right(b, "a", false);
  assert.equal(r.hits.length, 3);
  assert.ok(r.hits.every((h) => h[2] === SOLO_DAMAGE));
  b.fighters.r1.hp = 0;
  assert.equal(right(b, "a", false).hits.length, 2);
  for (let i = 0; i < 10; i++) assert.equal(right(b, "a", false).shieldTo, null);
});

t("the last hit ends the battle: the other side is eliminated", () => {
  const b = team([
    { uid: "a", side: "red", c: ["dragon"] },
    { uid: "x", side: "blue", c: ["owl"] },
  ]);
  b.fighters.b0.hp = 15;
  const r = right(b, "a", false);
  assert.deepEqual(r.fainted, ["b0"]);
  assert.equal(b.winner, "red");
  assert.ok(!isAlive(b, "x"));
  assert.equal(aliveOf(b, "blue").length, 0);
  assert.equal(right(b, "a", false).hits.length, 0, "no attacks after the end");
});

// Average battle length: each player answers every few seconds, about 70% right.
function battleSeconds(format: Format, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const picks: Pick[] =
    format === "team"
      ? ["a", "b", "c", "x", "y", "z"].map((u, i) => ({ uid: u, side: i < 3 ? "red" : "blue", c: [CREATURES[i].id], at: i }))
      : [
          { uid: "a", side: "red", c: ["dragon", "fox", "owl"], at: 1 },
          { uid: "x", side: "blue", c: ["bee", "mole", "golem"], at: 2 },
        ];
  const b = newBattle(format, lineUp(format, picks).fighters);
  const next: Record<string, number> = Object.fromEntries(picks.map((p) => [p.uid, 2 + rnd() * 3]));
  for (let time = 0; time < 1800; time += 0.1) {
    for (const p of picks) {
      if (time < next[p.uid] || !isAlive(b, p.uid)) continue;
      const took = 2 + rnd() * 8;
      if (rnd() < 0.7) {
        right(b, p.uid, took < 3);
        next[p.uid] = time + took + 1.8;
      } else {
        wrong(b, p.uid);
        next[p.uid] = time + took + 3;
      }
      if (b.winner) return time;
    }
  }
  return 1800;
}
for (const f of ["team", "solo"] as Format[]) {
  t(`${f} battles always end (median within 2–8 minutes)`, () => {
    const times = Array.from({ length: 101 }, (_, i) => battleSeconds(f, (i + 1) * 7919)).sort((x, y) => x - y);
    const median = times[50] / 60;
    console.log(`   ${f}: median ${median.toFixed(1)} min, longest ${(times[100] / 60).toFixed(1)} min`);
    assert.ok(times[100] < 1800, "every battle ends");
    assert.ok(median > 2 && median < 8, `median ${median}`);
  });
}

console.log(`\n${n} clash checks passed`);
