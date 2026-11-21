// Checks the Boss Raid rules. Run: npm test
import assert from "node:assert/strict";
import { newRaid, raidHit, raidMiss, raidStomp, raidRevive, raiderState, raidRanking, titanHp, raiderHp, stompDamage, STOMP_EVERY_MS, ADAPT, adaptTitan, stompNow, RAID_ATTACK } from "../src/clash/boss.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};
const picks = (k: number) => Array.from({ length: k }, (_, i) => ({ uid: "u" + i, c: ["dragon"], at: i }));

t("HP grows with the group: Titan 700 + 600, players 300 + 200, stomp 11 + 9.8 per extra player", () => {
  assert.deepEqual([1, 2, 5, 20].map(titanHp), [700, 1300, 3100, 12100]);
  assert.deepEqual([1, 2, 5, 20].map(raiderHp), [300, 500, 1100, 4100]);
  assert.deepEqual([1, 2, 5, 20].map(stompDamage), [11, 21, 50, 197]);
  const r = newRaid("hs", picks(5));
  assert.equal(r.titan.hp, 3100);
  assert.ok(Object.values(r.raiders).every((x) => x.hp === 1100));
});

t("anyone with a monster joins (duplicates allowed), up to 30, in the order they picked", () => {
  const r = newRaid("ta", [...picks(32), { uid: "bad", c: ["nothing"], at: -1 }]);
  assert.equal(Object.keys(r.raiders).length, 30);
  assert.ok(!r.raiders.bad && !r.raiders.u31);
  assert.equal(r.raiders.u0.slot, 0);
});

t("a right answer hits the Titan for 50; FAST 63; the 5th in a row is a super move (100, or 125 if fast)", () => {
  const r = newRaid("hs", picks(3));
  assert.deepEqual(raidHit(r, "u0", false), { dmg: 50, sup: false, blocked: 0, rage: false, counter: 0 });
  assert.equal(raidHit(r, "u0", true)!.dmg, 63);
  raidHit(r, "u0", false);
  raidHit(r, "u0", false);
  const s5 = raidHit(r, "u0", true)!;
  assert.deepEqual([s5.dmg, s5.sup], [125, true]);
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
  assert.equal(r.raiders.u0.hp, 500 - 21);
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

t("at 30% HP the Titan is ENRAGED: a shield of 10% of its HP takes damage first, and stomps hit 30% harder", () => {
  const r = newRaid("hs", picks(2)); // Titan 1300 HP, stomp 21
  r.titan.hp = 400;
  r.mark = 0;
  const h = raidHit(r, "u0", false)!;
  assert.equal(h.rage, true);
  assert.equal(r.titan.hp, 350);
  assert.deepEqual([r.titan.rage, r.titan.sh, r.stomp], [true, 130, 27]);
  const b = raidHit(r, "u1", false)!;
  assert.deepEqual([b.blocked, b.rage, r.titan.sh, r.titan.hp], [50, false, 80, 350]);
  r.titan.sh = 20;
  raidHit(r, "u1", false);
  assert.deepEqual([r.titan.sh, r.titan.hp], [0, 320], "the rest goes through once the shield breaks");
  raidStomp(r);
  assert.equal(r.raiders.u0.hp, 500 - 27);
});

t("the Titan strikes back: one counter-stomp for every 10% of its HP lost", () => {
  const r = newRaid("ta", picks(1)); // Titan 700 HP: marks at 630, 560, 490, …
  assert.equal(raidHit(r, "u0", false)!.counter, 0); // 650
  assert.equal(raidHit(r, "u0", false)!.counter, 1); // 600: passed 90%
  r.titan.hp = 570;
  assert.equal(raidHit(r, "u0", false)!.counter, 1); // 520: passed 80%
  r.titan.hp = 230;
  assert.equal(raidHit(r, "u0", false)!.counter, 5, "a big drop counts every 10% passed (70, 60, 50, 40, 30)"); // 180
  r.titan.hp = 60;
  const last = raidHit(r, "u0", false)!;
  assert.equal(r.winner, null);
  assert.equal(last.counter, 2); // 10 HP: passed 20% and 10%
  assert.equal(raidHit(r, "u0", false)!.counter, 0, "no counter on the final blow");
});

t("players win at Titan 0 HP; the Titan wins when every monster is out", () => {
  const a = newRaid("ta", picks(1));
  a.titan.hp = 40;
  a.titan.rage = true;
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

// Raid length: answers take 2-10 s, right with chance acc; result 1.8 s, stun 3 s; stomp every 8 s.
// Mirrors the engine, including the adaptive Titan (adaptTitan before each timed stomp, damage rate over ADAPT.window).
function raid(k: number, seed: number, acc = 0.7) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const r = newRaid("hs", picks(k));
  const log: [number, number][] = [];
  const next: Record<string, number> = Object.fromEntries(Object.keys(r.raiders).map((u) => [u, 2 + rnd() * 3]));
  let stomp = STOMP_EVERY_MS / 1000;
  for (let time = 0; time < 1200; time += 0.1) {
    if (time >= stomp) {
      stomp += STOMP_EVERY_MS / 1000;
      while (log.length && log[0][0] < time - ADAPT.window) log.shift();
      adaptTitan(r, log.reduce((a, x) => a + x[1], 0) / Math.min(ADAPT.window, Math.max(8, time)));
      for (const u of raidStomp(r).fainted) next[u] = time + 0.5;
    }
    for (const u of Object.keys(r.raiders)) {
      const st = raiderState(r.raiders[u]);
      if (st === "out" || time < next[u]) continue;
      const took = 2 + rnd() * 8;
      const ok = rnd() < acc;
      if (st === "down") raidRevive(r, u, ok);
      else if (ok) {
        const h = raidHit(r, u, took < 3);
        if (h) log.push([time, h.dmg]);
        for (let c = 0; c < (h?.counter ?? 0); c++) for (const f of raidStomp(r).fainted) next[f] = time + 0.5;
      } else raidMiss(r, u);
      next[u] = time + took + (ok ? 1.8 : 3);
    }
    if (r.winner) return { time, winner: r.winner };
  }
  return { time: 1200, winner: null };
}
const runRaids = (k: number, acc: number) => {
  const runs = Array.from({ length: 101 }, (_, i) => raid(k, (i + 1) * 7919, acc));
  const times = runs.map((x) => x.time).sort((a, b) => a - b);
  return { median: times[50] / 60, lost: runs.filter((x) => x.winner === "titan").length, all: runs.every((x) => x.winner) };
};
t("adaptive Titan: a 70% group loses about 1 raid in 3 at any size (1-30), raids last about 2-3.5 minutes", () => {
  for (const k of [1, 3, 8, 20, 30]) {
    const { median, lost, all } = runRaids(k, 0.7);
    console.log(`   ${String(k).padStart(2)} players, 70% right: median ${median.toFixed(1)} min, Titan wins ${lost}/101`);
    assert.ok(all, "every raid ends");
    assert.ok(median > 1.8 && median < 3.6, `median ${median}`);
    assert.ok(lost >= 18 && lost <= 50, `Titan wins ${lost}/101`);
  }
});
t("adaptive Titan: no group always wins or always loses (50% and 90% right, 30 players)", () => {
  for (const acc of [0.5, 0.9]) {
    const { median, lost } = runRaids(30, acc);
    console.log(`   30 players, ${acc * 100}% right: median ${median.toFixed(1)} min, Titan wins ${lost}/101`);
    assert.ok(lost >= 5 && lost <= 97, `Titan wins ${lost}/101`);
  }
});
t("adaptive Titan: toughness rises when the raiders race ahead, falls when they lag, within its limits", () => {
  const r = newRaid("ta", picks(10));
  for (let i = 0; i < 30; i++) adaptTitan(r, 5000);
  assert.equal(r.d, ADAPT.max);
  assert.ok(stompNow(r) > r.stomp);
  const hit = raidHit(r, "u0", false)!;
  assert.equal(hit.dmg, Math.round(RAID_ATTACK / Math.sqrt(ADAPT.max)));
  for (let i = 0; i < 40; i++) adaptTitan(r, 1);
  assert.equal(r.d, ADAPT.min);
  assert.ok(stompNow(r) < r.stomp);
});

console.log(`\n${n} boss raid checks passed`);
