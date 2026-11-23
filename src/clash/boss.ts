// Boss Raid rules in one place (no database, no browser), so they can be tested.
// 1–50 players each have one monster and fight the Defect Titan together.
// Time Attack: beat it as fast as possible. High Score: most damage (points) wins.
// In both modes the Titan stomps every player every 8 seconds; a fainted monster gets one revive question per raid.
// At 30% HP it becomes ENRAGED: a shield (10% of its HP) that must be broken first, and harder stomps.
// The Titan ADAPTS (owner's pick "always close", Nov 2026): at every timed stomp it forecasts how long until it
// falls and how long until the raiders are wiped out, and nudges its toughness `d` (armour and stomp) so the
// race stays close. Simulated (1-50 players): Titan wins 30-43% against groups answering 70% right,
// 54-80% at 50% right, 15-25% at 80%, 4-9% at 90% right; raids last about 2-3.5 minutes.
import { CREATURE_IDS } from "./creatures.ts";
import { FAST_MULT, SUPER_MULT, SUPER_STREAK } from "./sim.ts";

export type BossMode = "ta" | "hs";
export const RAID_ATTACK = 50;
export const TITAN_BASE = 700;
export const TITAN_PER_PLAYER = 600;
export const RAIDER_BASE = 300;
export const RAIDER_PER_PLAYER = 200;
export const STOMP_BASE = 11;
export const STOMP_PER_PLAYER = 9.8;
/** The Titan strikes back: an extra stomp every time it loses another 10% of its HP. */
export const COUNTER_STEP = 10;
/** At 30% HP the Titan is ENRAGED: a shield of 10% of its total HP, and stomps 30% harder. */
export const RAGE_AT = 0.3;
export const RAGE_SHIELD = 0.1;
export const RAGE_STOMP = 1.3;
export const STOMP_EVERY_MS = 8_000;
export const STOMP_WARN_MS = 3_000;
export const MAX_RAIDERS = 50;

export const titanHp = (n: number) => TITAN_BASE + TITAN_PER_PLAYER * (Math.max(1, n) - 1);
export const raiderHp = (n: number) => RAIDER_BASE + RAIDER_PER_PLAYER * (Math.max(1, n) - 1);
export const stompDamage = (n: number) => Math.round(STOMP_BASE + STOMP_PER_PLAYER * (Math.max(1, n) - 1));

/** revive: "ready" until the player has used their one revive question. */
export type Raider = { uid: string; c: string; slot: number; hp: number; max: number; lv: number; pts: number; rights: number; revive: "ready" | "used" };
export type Raid = {
  mode: BossMode;
  /** sh: the enraged shield still left. rage: true once the Titan is enraged. */
  titan: { hp: number; max: number; sh: number; rage: boolean };
  raiders: Record<string, Raider>;
  streak: Record<string, number>;
  stomp: number;
  /** The next counter-stomp comes when the Titan's HP drops to mark × 10% (9 = 90%, … 1 = 10%). */
  mark: number;
  winner: "players" | "titan" | null;
  /** The adaptive Titan's toughness: hits on it are ÷ √d and its stomps × √d. 1 = normal. */
  d?: number;
};

/** Adaptive Titan settings (simulated in scripts/boss.test.ts). */
export const ADAPT = {
  /** Aim: the Titan's forecast time to fall ÷ the raiders' forecast time to be wiped out. 1 = an even race. */
  target: 1.0,
  /** How strongly each stomp reacts, and the most it can change at one stomp (×e^±0.2 ≈ ±22%). */
  gain: 0.6,
  step: 0.2,
  /**
   * Lowest and highest toughness. Re-tuned for 50 raiders (eighth session): with 1.6, a 90%-right group of 50
   * lost 45% of raids (more than a 70% group); with 1.45 better groups always win more often (simulated, 301 raids
   * each, 1-50 players): Titan wins ~60-75% at 50% right, ~30-40% at 70%, ~15-25% at 80%, ~5-9% at 90%.
   */
  min: 0.35,
  max: 1.45,
  /** Seconds of recent damage used to measure the raiders' damage rate. */
  window: 24,
};
const toughness = (r: Raid) => r.d ?? 1;
/** Stomp damage right now (the adaptive Titan's toughness included). */
export const stompNow = (r: Raid) => Math.round(r.stomp * Math.sqrt(toughness(r)));

/**
 * The adaptive Titan, called before each timed stomp. rate: the raiders' damage per second lately.
 * Forecast: seconds until the Titan falls (HP + shield ÷ rate) and until half of the monsters still standing
 * have fainted (their middle HP ÷ the stomp, × 8 s). If the raiders are well ahead it toughens, if well behind it eases.
 */
export function adaptTitan(r: Raid, rate: number) {
  const alive = Object.values(r.raiders).filter((x) => x.hp > 0).map((x) => x.hp).sort((a, b) => a - b);
  if (!alive.length || rate <= 0 || r.winner) return;
  const tTitan = (r.titan.hp + r.titan.sh) / rate;
  const tRaiders = (alive[Math.floor(alive.length / 2)] / Math.max(1, stompNow(r))) * (STOMP_EVERY_MS / 1000);
  const step = Math.min(ADAPT.step, Math.max(-ADAPT.step, ADAPT.gain * Math.log(ADAPT.target / (tTitan / tRaiders))));
  r.d = Math.min(ADAPT.max, Math.max(ADAPT.min, toughness(r) * Math.exp(step)));
}
export type RaiderState = "alive" | "down" | "out";
/** alive: fighting. down: fainted, waiting for the revive question. out: fainted for good. */
export const raiderState = (x: Raider): RaiderState => (x.hp > 0 ? "alive" : x.revive === "ready" ? "down" : "out");

/** Everyone who picked a monster, in the order they picked (up to MAX_RAIDERS = 50). */
export function newRaid(mode: BossMode, picks: { uid: string; c: string[]; at?: number }[]): Raid {
  const ok = [...picks]
    .filter((p) => CREATURE_IDS.includes(p.c?.[0] ?? ""))
    .sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
    .slice(0, MAX_RAIDERS);
  const n = ok.length;
  const raiders: Record<string, Raider> = {};
  const streak: Record<string, number> = {};
  ok.forEach((p, slot) => {
    raiders[p.uid] = { uid: p.uid, c: p.c[0], slot, hp: raiderHp(n), max: raiderHp(n), lv: 1, pts: 0, rights: 0, revive: "ready" };
    streak[p.uid] = 0;
  });
  return { mode, titan: { hp: titanHp(n), max: titanHp(n), sh: 0, rage: false }, raiders, streak, stomp: stompDamage(n), mark: 100 / COUNTER_STEP - 1, winner: null };
}

/**
 * A right answer: the player's monster hits the Titan (the enraged shield takes the damage first).
 * rage: this hit enraged it. counter: how many counter-stomps this hit set off (one per 10% of HP lost).
 */
export function raidHit(r: Raid, uid: string, fast: boolean): { dmg: number; sup: boolean; blocked: number; rage: boolean; counter: number } | null {
  const x = r.raiders[uid];
  if (!x || r.winner || raiderState(x) !== "alive") return null;
  const streak = (r.streak[uid] ?? 0) + 1;
  const sup = streak >= SUPER_STREAK;
  r.streak[uid] = sup ? 0 : streak;
  let dmg = RAID_ATTACK;
  if (fast) dmg *= FAST_MULT;
  if (sup) dmg *= SUPER_MULT;
  // the adaptive Titan's armour
  dmg = Math.max(1, Math.round(dmg / Math.sqrt(toughness(r))));
  const blocked = Math.min(r.titan.sh, dmg);
  r.titan.sh -= blocked;
  r.titan.hp = Math.max(0, r.titan.hp - (dmg - blocked));
  x.pts += dmg;
  x.rights += 1;
  x.lv += 1;
  let rage = false;
  let counter = 0;
  while (r.titan.hp > 0 && r.mark >= 1 && r.titan.hp * 100 <= r.titan.max * r.mark * COUNTER_STEP) {
    counter++;
    r.mark--;
  }
  if (r.titan.hp === 0) r.winner = "players";
  else if (!r.titan.rage && r.titan.hp <= r.titan.max * RAGE_AT) {
    rage = true;
    r.titan.rage = true;
    r.titan.sh = Math.round(r.titan.max * RAGE_SHIELD);
    r.stomp = Math.round(stompDamage(Object.keys(r.raiders).length) * RAGE_STOMP);
  }
  return { dmg, sup, blocked, rage, counter };
}

/** A wrong answer or no answer (the engine adds the stun). */
export function raidMiss(r: Raid, uid: string) {
  r.streak[uid] = 0;
}

/** The Titan stomps: every monster still standing takes the stomp damage. */
export function raidStomp(r: Raid): { hit: string[]; fainted: string[] } {
  const hit: string[] = [];
  const fainted: string[] = [];
  if (r.winner) return { hit, fainted };
  for (const x of Object.values(r.raiders)) {
    if (raiderState(x) !== "alive") continue;
    x.hp = Math.max(0, x.hp - stompNow(r));
    hit.push(x.uid);
    if (x.hp === 0) {
      fainted.push(x.uid);
      r.streak[x.uid] = 0;
    }
  }
  checkTitanWin(r);
  return { hit, fainted };
}

/** The answer to the one revive question: right = back with half of the total HP, wrong = out. */
export function raidRevive(r: Raid, uid: string, correct: boolean): boolean {
  const x = r.raiders[uid];
  if (!x || r.winner || raiderState(x) !== "down") return false;
  x.revive = "used";
  if (correct) x.hp = Math.round(x.max / 2);
  checkTitanWin(r);
  return correct;
}

function checkTitanWin(r: Raid) {
  const all = Object.values(r.raiders);
  if (!r.winner && all.length && all.every((x) => raiderState(x) === "out")) r.winner = "titan";
}

/** Highest points first; on a tie, more right answers. */
export const raidRanking = (r: Raid) => Object.values(r.raiders).sort((a, b) => b.pts - a.pts || b.rights - a.rights || a.slot - b.slot);
