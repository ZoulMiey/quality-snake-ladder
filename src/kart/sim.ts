// The Quality Cart race rules, kept free of screens and the database so they can be tested on their own.
import { BOX_LANES, BOX_ROWS, HAZARDS, LAPS, TRACK_LEN, gap, wrap } from "./track.ts";

export type ItemId = "shield" | "turbo" | "oil" | "audit";

export const ITEMS: Record<ItemId, { icon: string; en: string; ms: string }> = {
  shield: { icon: "🛡️", en: "PPE Shield", ms: "Perisai PPE" },
  turbo: { icon: "⚡", en: "Kaizen Turbo", ms: "Turbo Kaizen" },
  oil: { icon: "🛢️", en: "Oil spill", ms: "Tumpahan minyak" },
  audit: { icon: "📋", en: "Audit", ms: "Audit" },
};

export type Cart = {
  uid: string;
  p: number; // total distance driven (negative before the start line); lap = p / TRACK_LEN
  d: number; // -1 (left edge) .. 1 (right edge)
  v: number; // current speed
  boostUntil: number;
  /** SUPER TURBO after 3 right answers in a row: faster than a normal turbo. */
  superUntil?: number;
  slowUntil: number;
  slowFactor: number;
  spinUntil: number;
  shieldUntil: number;
  item: ItemId | null;
  finished: boolean;
  finishT: number;
  hitCooldown: Record<string, number>;
};

export type Oil = { s: number; d: number; until: number; owner: string };
export type Box = { s: number; d: number; hiddenUntil: number };

export type World = { t: number; carts: Cart[]; oils: Oil[]; boxes: Box[]; firstFinishT: number | null };

export type RaceEvent =
  | { type: "pickup"; uid: string; item: ItemId }
  | { type: "spin"; uid: string; cause: "cone" | "pothole" | "oil" }
  | { type: "slow"; uid: string; cause: "oos" | "audit" }
  | { type: "shielded"; uid: string }
  | { type: "lap"; uid: string; lap: number }
  | { type: "finish"; uid: string; rank: number; time: number };

/** Base speed: one lap in about 48 seconds, so 3 laps take roughly 2½–3 minutes. */
export const BASE_SPEED = TRACK_LEN / 48;
const STEER_RATE = 1.7; // how fast tilting moves the cart across the road (road widths per second)
const SPIN_S = 1.1;
export const TURBO_S = 2.5;
/** Right answers in a row for a SUPER TURBO, and how long it lasts. */
export const SUPER_STREAK = 3;
export const SUPER_S = 4;

export function newWorld(uids: string[]): World {
  // 6 abreast (owner, 23 Nov 2026: up to 50 carts = 9 rows; the last row starts ~4 s behind the first).
  const lanes = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];
  const carts = uids.map((uid, i) => ({
    uid,
    p: -(Math.floor(i / lanes.length) + 1) * 34,
    d: lanes[i % lanes.length],
    v: 0,
    boostUntil: 0,
    superUntil: 0,
    slowUntil: 0,
    slowFactor: 1,
    spinUntil: 0,
    shieldUntil: 0,
    item: null,
    finished: false,
    finishT: 0,
    hitCooldown: {},
  }));
  const boxes = BOX_ROWS.flatMap((s) => BOX_LANES.map((d) => ({ s, d, hiddenUntil: 0 })));
  return { t: 0, carts, oils: [], boxes, firstFinishT: null };
}

/** Race order: finished carts by finishing time, then everyone else by distance. */
export function standings(w: World): Cart[] {
  return [...w.carts].sort((a, b) => {
    if (a.finished && b.finished) return a.finishT - b.finishT;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.p - a.p;
  });
}

export const lapOf = (c: Cart) => Math.min(LAPS, Math.max(1, Math.floor(c.p / TRACK_LEN) + 1));

/** Items are fairer for those behind: leaders get more shields and oil, the back gets turbos and audits. */
export function pickItem(rank: number, total: number, rand = Math.random): ItemId {
  const back = total > 1 ? (rank - 1) / (total - 1) : 0.5; // 0 = leader, 1 = last
  const weights: [ItemId, number][] = [
    ["shield", 1.3 - back],
    ["oil", 1.2 - back * 0.8],
    ["turbo", 0.5 + back * 1.4],
    ["audit", 0.2 + back * 1.2],
  ];
  const total2 = weights.reduce((a, [, w]) => a + w, 0);
  let r = rand() * total2;
  for (const [id, w] of weights) {
    r -= w;
    if (r <= 0) return id;
  }
  return "turbo";
}

function hit(w: World, c: Cart, key: string, events: RaceEvent[], effect: () => void) {
  if ((c.hitCooldown[key] ?? -1) > w.t) return;
  c.hitCooldown[key] = w.t + 1.5;
  if (c.shieldUntil > w.t) {
    c.shieldUntil = 0;
    events.push({ type: "shielded", uid: c.uid });
    return;
  }
  effect();
}

/** Move the race on by dt seconds. steer: the latest tilt of each phone (-1 .. 1). */
export function step(w: World, dt: number, steer: Record<string, number>, rand = Math.random): RaceEvent[] {
  const events: RaceEvent[] = [];
  w.t += dt;
  const order = standings(w);
  for (const c of w.carts) {
    if (c.finished) {
      c.v *= 0.97;
      c.p += c.v * dt;
      continue;
    }
    const spinning = c.spinUntil > w.t;
    if (!spinning) c.d = Math.max(-1, Math.min(1, c.d + (steer[c.uid] ?? 0) * STEER_RATE * dt));
    let target = BASE_SPEED;
    if (spinning) target *= 0.2;
    else {
      if ((c.superUntil ?? 0) > w.t) target *= 1.9;
      else if (c.boostUntil > w.t) target *= 1.6;
      if (c.slowUntil > w.t) target *= c.slowFactor;
      if (Math.abs(c.d) > 0.9) target *= 0.75; // driving on the edge
    }
    c.v += (target - c.v) * Math.min(1, dt * 3);
    const before = c.p;
    c.p += c.v * dt;

    // Laps and finishing
    const lapBefore = Math.floor(before / TRACK_LEN);
    const lapNow = Math.floor(c.p / TRACK_LEN);
    if (lapNow > lapBefore && lapNow >= 1 && lapNow < LAPS) events.push({ type: "lap", uid: c.uid, lap: lapNow + 1 });
    if (c.p >= LAPS * TRACK_LEN) {
      c.finished = true;
      c.finishT = w.t;
      w.firstFinishT ??= w.t;
      const rank = w.carts.filter((x) => x.finished).length;
      events.push({ type: "finish", uid: c.uid, rank, time: w.t });
      continue;
    }
    if (c.p < 0) continue; // still behind the start line
    const s = wrap(c.p);

    // Hazards
    HAZARDS.forEach((hz, i) => {
      if (Math.abs(gap(s, hz.s)) < hz.len / 2 + 8 && Math.abs(c.d - hz.d) < hz.wide) {
        hit(w, c, `h${i}`, events, () => {
          if (hz.kind === "oos") {
            c.slowUntil = w.t + 1.5;
            c.slowFactor = 0.5;
            events.push({ type: "slow", uid: c.uid, cause: "oos" });
          } else {
            c.spinUntil = w.t + SPIN_S;
            events.push({ type: "spin", uid: c.uid, cause: hz.kind as "cone" | "pothole" });
          }
        });
      }
    });

    // Oil spills dropped by other carts
    for (const oil of w.oils) {
      if (oil.until > w.t && oil.owner !== c.uid && Math.abs(gap(s, oil.s)) < 14 && Math.abs(c.d - oil.d) < 0.3) {
        oil.until = 0;
        hit(w, c, "oil", events, () => {
          c.spinUntil = w.t + SPIN_S + 0.3;
          events.push({ type: "spin", uid: c.uid, cause: "oil" });
        });
      }
    }

    // Item boxes
    if (!c.item) {
      for (const b of w.boxes) {
        if (b.hiddenUntil <= w.t && Math.abs(gap(s, b.s)) < 14 && Math.abs(c.d - b.d) < 0.3) {
          b.hiddenUntil = w.t + 1.5;
          c.item = pickItem(order.indexOf(c) + 1, w.carts.length, rand);
          events.push({ type: "pickup", uid: c.uid, item: c.item });
          break;
        }
      }
    }
  }
  w.oils = w.oils.filter((o) => o.until > w.t);
  return events;
}

export type ItemUse = { item: ItemId; uid: string; target?: string; blocked?: boolean };

/** Use the item a cart is holding. */
export function useItem(w: World, uid: string): ItemUse | null {
  const c = w.carts.find((x) => x.uid === uid);
  if (!c || !c.item || c.finished || c.p < 0) return null;
  const item = c.item;
  c.item = null;
  if (item === "turbo") {
    c.boostUntil = w.t + TURBO_S;
    return { item, uid };
  }
  if (item === "shield") {
    c.shieldUntil = w.t + 15;
    return { item, uid };
  }
  if (item === "oil") {
    w.oils.push({ s: wrap(c.p - 26), d: c.d, until: w.t + 25, owner: uid });
    return { item, uid };
  }
  // Audit: slows down the leader (or the cart in front, if you are the leader there is no one to audit).
  const leader = standings(w).find((x) => !x.finished && x.uid !== uid);
  if (!leader) return { item, uid };
  if (leader.shieldUntil > w.t) {
    leader.shieldUntil = 0;
    return { item, uid, target: leader.uid, blocked: true };
  }
  leader.slowUntil = w.t + 3;
  leader.slowFactor = 0.5;
  return { item, uid, target: leader.uid };
}

/** A right answer gives a short turbo (a SUPER TURBO on the 3rd in a row), a wrong one makes the cart sputter. */
export function answerEffect(w: World, uid: string, correct: boolean, superBoost = false) {
  const c = w.carts.find((x) => x.uid === uid);
  if (!c || c.finished) return;
  if (correct && superBoost) {
    c.superUntil = w.t + SUPER_S;
    c.boostUntil = Math.max(c.boostUntil, w.t + SUPER_S);
  } else if (correct) c.boostUntil = Math.max(c.boostUntil, w.t) + 2;
  else {
    c.slowUntil = w.t + 2;
    c.slowFactor = 0.55;
  }
}

/** What a phone needs to know about its own cart. */
export function effectOf(w: World, c: Cart): "super" | "turbo" | "spin" | "slow" | "shield" | null {
  if (c.spinUntil > w.t) return "spin";
  if ((c.superUntil ?? 0) > w.t) return "super";
  if (c.boostUntil > w.t) return "turbo";
  if (c.slowUntil > w.t) return "slow";
  if (c.shieldUntil > w.t) return "shield";
  return null;
}
