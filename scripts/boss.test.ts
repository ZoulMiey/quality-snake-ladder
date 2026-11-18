// Checks the Boss Raid rules. Run: npm test
import assert from "node:assert/strict";
import { newRaid, raidHit, raidMiss, raidStomp, raidRevive, raiderState, raidRanking, titanHp, raiderHp, stompDamage, STOMP_EVERY_MS } from "../src/clash/boss.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const picks = (k: number) => Array.from({ length: k }, (_, i) => ({ uid: "u" + i, c: ["dragon"], at: i }));

t("HP grows with the group: Titan 700 + 600, players 300 + 200, stomp 20 + 13 per extra player", () => {
  assert.deepEqual([1, 2, 5, 20].map(titanHp), [700, 1300, 3100, 12100]);
  assert.deepEqual([1, 2, 5, 20].map(raiderHp), [300, 500, 1100, 4100]);
  assert.deepEqual([1, 2, 5, 20].map(stompDamage), [20, 33, 72, 267]);
  const r = newRaid("hs", picks(5));
  assert.equal(r.titan.hp, 3100);
  assert.ok(Object.values(r.raiders).every((x) => x.hp === 1100));
});

t("anyone with a monster joins (duplicates allowed), up to 20, in the order they picked", () => {
  const r = newRaid("ta", [...picks(22), { uid: "bad", c: ["nothing"], at: -1 }]);
  assert.equal(Object.keys(r.raiders).length, 20);
  assert.ok(!r.raiders.bad && !r.raiders.u21);
  assert.equal(r.raiders.u0.slot, 0);
});

t("a right answer hits the Titan for 50; FAST 63; the 5th in a row is a super move (100, or 125 if fast)", () => {
  const r = newRaid("hs", picks(3));
  assert.deepEqual(raidHit(r, "u0", false), { dmg: 50, sup: false });
  assert.equal(raidHit(r, "u0", true)!.dmg, 63);
  raidHit(r, "u0", false);
  raidHit(r, "u0", false);
  assert.deepEqual(raidHit(r, "u0", true), { dmg: 125, sup: true });
  raidHit(r, "u0", false);
  raidMiss(r, "u0");
  assert.equal(r.streak.u0, 0);
  assert.equal(r.raiders.u0.pts, 50 + 63 + 50 + 50 + 125 + 50);
  assert.equal(r.titan.hp, 1900 - r.raiders.u0.pts);
});

t("the stomp hits every monster still standing; a fainted one gets one revive question", () => {
  const r = newRaid("hs", picks(2));
  r.raiders.u1.hp = 20;
  const s = raidStomp(r);
  assert.deepEqual(s.hit.sort(), ["u0", "u1"]);
  assert.deepEqual(s.fainted, ["u1"]);
  assert.equal(r.raiders.u0.hp, 500 - 33);
  assert.equal(raiderState(r.raiders.u1), "down");
  assert.equal(raidHit(r, "u1", false), null, "a fainted monster cannot attack");
  assert.equal(raidRevive(r, "u1", true), true);
  assert.equal(r.raiders.u1.hp, 250, "back with half of the total HP");
  r.raiders.u1.hp = 1;
  raidStomp(r);
  assert.equal(raiderState(r.raiders.u1), "out", "only one revive per raid");
});

t("a wrong revive answer is out for good", () => {
  const r = newRaid("ta", picks(2));
  r.raiders.u0.hp = 1;
  raidStomp(r);
  assert.equal(raidRevive(r, "u0", false), false);
  assert.equal(raiderState(r.raiders.u0), "out");
});

t("players win at Titan 0 HP; the Titan wins when every monster is out", () => {
  const a = newRaid("ta", picks(1));
  a.titan.hp = 40;
  raidHit(a, "u0", false);
  assert.equal(a.winner, "players");
  const b = newRaid("hs", picks(1));
  b.raiders.u0.hp = 5;
  raidStomp(b);
  assert.equal(b.winner, null, "still waiting for the revive answer");
  raidRevive(b, "u0", false);
  assert.equal(b.winner, "titan");
});

t("ranking: most points first, more right answers on a tie", () => {
  const r = newRaid("hs", picks(3));
  r.raiders.u0.pts = 300;
  r.raiders.u1.pts = 500;
  r.raiders.u2.pts = 500;
  r.raiders.u2.rights = 9;
  r.raiders.u1.rights = 8;
  assert.deepEqual(raidRanking(r).map((x) => x.uid), ["u2", "u1", "u0"]);
});

// Raid length: answers take 2-10 s, 70% right; result 1.8 s, stun 3 s; stomp every 8 s.
function raid(k: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const r = newRaid("hs", picks(k));
  const next: Record<string, number> = Object.fromEntries(Object.keys(r.raiders).map((u) => [u, 2 + rnd() * 3]));
  let stomp = STOMP_EVERY_MS / 1000;
  for (let time = 0; time < 1200; time += 0.1) {
    if (time >= stomp) {
      stomp += STOMP_EVERY_MS / 1000;
      for (const u of raidStomp(r).fainted) next[u] = time + 0.5;
    }
    for (const u of Object.keys(r.raiders)) {
      const st = raiderState(r.raiders[u]);
      if (st === "out" || time < next[u]) continue;
      const took = 2 + rnd() * 8;
      const ok = rnd() < 0.7;
      if (st === "down") raidRevive(r, u, ok);
      else if (ok) raidHit(r, u, took < 3);
      else raidMiss(r, u);
      next[u] = time + took + (ok ? 1.8 : 3);
    }
    if (r.winner) return { time, winner: r.winner };
  }
  return { time: 1200, winner: null };
}
t("raids always end, typically in 2–2.5 minutes for any group size", () => {
  for (const k of [1, 3, 8, 20]) {
    const runs = Array.from({ length: 101 }, (_, i) => raid(k, (i + 1) * 7919));
    const times = runs.map((x) => x.time).sort((a, b) => a - b);
    const lost = runs.filter((x) => x.winner === "titan").length;
    console.log(`   ${String(k).padStart(2)} players: median ${(times[50] / 60).toFixed(1)} min, Titan wins ${lost}/101`);
    assert.ok(runs.every((x) => x.winner), "every raid ends");
    assert.ok(times[50] / 60 > 1.6 && times[50] / 60 < 3, `median ${times[50]}`);
  }
});

console.log(`\n${n} boss raid checks passed`);
