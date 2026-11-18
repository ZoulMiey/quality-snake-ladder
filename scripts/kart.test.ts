// Checks the Quality Cart race rules. Run: npm test
import assert from "node:assert/strict";
import { newWorld, step, useItem, standings, answerEffect, pickItem, BASE_SPEED } from "../src/kart/sim.ts";
import { TRACK_LEN, LAPS, HAZARDS, place, WORLD_W, WORLD_H, PATH_POINTS } from "../src/kart/track.ts";

let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log("ok -", name);
};

t("track fits on the screen and is a sensible length", () => {
  for (let i = 0; i < PATH_POINTS.x.length; i++) {
    assert.ok(PATH_POINTS.x[i] > 60 && PATH_POINTS.x[i] < WORLD_W - 60);
    assert.ok(PATH_POINTS.y[i] > 60 && PATH_POINTS.y[i] < WORLD_H - 60);
  }
  assert.ok(TRACK_LEN > 3000 && TRACK_LEN < 6000, `length ${TRACK_LEN}`);
});

t("road never runs too close to another part of itself", () => {
  const P = PATH_POINTS;
  const N = P.x.length;
  let worst = Infinity;
  for (let i = 0; i < N; i += 3)
    for (let j = 0; j < N; j += 3) {
      const along = Math.min(Math.abs(i - j), N - Math.abs(i - j)) * 4;
      if (along < 400) continue;
      worst = Math.min(worst, Math.hypot(P.x[i] - P.x[j], P.y[i] - P.y[j]));
    }
  assert.ok(worst > 135, `closest approach ${worst.toFixed(0)}`);
});

t("a race of 20 carts finishes 3 laps in about 2½–3 minutes", () => {
  const w = newWorld(Array.from({ length: 20 }, (_, i) => "u" + i));
  const finishes: number[] = [];
  let laps = 0;
  for (let k = 0; k < 20 * 60 * 10 && finishes.length < 20; k++) {
    for (const e of step(w, 1 / 30, {})) {
      if (e.type === "finish") finishes.push(e.time);
      if (e.type === "lap") laps++;
    }
  }
  assert.equal(finishes.length, 20);
  assert.ok(finishes[0] > 120 && finishes[0] < 200, `winner time ${finishes[0].toFixed(0)}s`);
  assert.equal(laps, 20 * (LAPS - 1));
  const ranks = standings(w).map((c) => c.finished);
  assert.ok(ranks.every(Boolean));
});

t("tilting moves the cart across the road, within the edges", () => {
  const w = newWorld(["a"]);
  for (let k = 0; k < 60; k++) step(w, 1 / 30, { a: 1 });
  assert.equal(w.carts[0].d, 1);
  for (let k = 0; k < 120; k++) step(w, 1 / 30, { a: -1 });
  assert.equal(w.carts[0].d, -1);
});

t("driving into a cone spins the cart; a shield blocks it", () => {
  const cone = HAZARDS.find((h) => h.kind === "cone")!;
  const w = newWorld(["a"]);
  const c = w.carts[0];
  c.p = cone.s - 20;
  c.d = cone.d;
  c.v = 0;
  let spun = false;
  for (let k = 0; k < 90 && !spun; k++) spun = step(w, 1 / 30, { a: 0 }).some((e) => e.type === "spin");
  assert.ok(spun);
  const w2 = newWorld(["a"]);
  w2.carts[0].p = cone.s - 20;
  w2.carts[0].d = cone.d;
  w2.carts[0].shieldUntil = 99;
  let blocked = false;
  for (let k = 0; k < 90 && !blocked; k++) blocked = step(w2, 1 / 30, { a: 0 }).some((e) => e.type === "shielded");
  assert.ok(blocked);
});

t("items: turbo speeds up, oil is dropped behind, audit slows the leader", () => {
  const w = newWorld(["a", "b"]);
  w.carts[0].p = 500;
  w.carts[1].p = 300;
  w.carts[1].item = "turbo";
  useItem(w, "b");
  for (let k = 0; k < 30; k++) step(w, 1 / 30, {});
  assert.ok(w.carts[1].v > BASE_SPEED * 1.2);
  w.carts[0].item = "oil";
  useItem(w, "a");
  assert.equal(w.oils.length, 1);
  w.carts[1].item = "audit";
  const use = useItem(w, "b");
  assert.equal(use?.target, "a");
  assert.ok(w.carts[0].slowUntil > w.t);
});

t("right answer = turbo, wrong answer = sputter", () => {
  const w = newWorld(["a"]);
  answerEffect(w, "a", true);
  assert.ok(w.carts[0].boostUntil > w.t);
  answerEffect(w, "a", false);
  assert.ok(w.carts[0].slowUntil > w.t);
});

t("items favour the back of the race", () => {
  let backTurbo = 0;
  let frontTurbo = 0;
  for (let k = 0; k < 4000; k++) {
    if (pickItem(20, 20) === "turbo") backTurbo++;
    if (pickItem(1, 20) === "turbo") frontTurbo++;
  }
  assert.ok(backTurbo > frontTurbo * 2);
});

t("positions on the road are on the screen", () => {
  for (let s = 0; s < TRACK_LEN; s += 50) {
    const a = place(s, 1);
    const b = place(s, -1);
    assert.ok(a.x > 0 && a.x < WORLD_W && b.y > 0 && b.y < WORLD_H);
  }
});
console.log(`\n${n} cart checks passed`);
