// Boss Raid rules in one place (no database, no browser), so they can be tested.
// 1–20 players each have one monster and fight the Defect Titan together.
// Time Attack: beat it as fast as possible. High Score: most damage (points) wins.
// In both modes the Titan stomps every player every 8 seconds; a fainted monster gets one revive question per raid.
import { CREATURE_IDS } from "./creatures.ts";
import { FAST_MULT, SUPER_MULT, SUPER_STREAK } from "./sim.ts";

export type BossMode = "ta" | "hs";
export const RAID_ATTACK = 50;
export const TITAN_BASE = 700;
export const TITAN_PER_PLAYER = 600;
export const RAIDER_BASE = 300;
export const RAIDER_PER_PLAYER = 200;
export const STOMP_BASE = 20;
export const STOMP_PER_PLAYER = 13;
export const STOMP_EVERY_MS = 8_000;
export const STOMP_WARN_MS = 3_000;
export const MAX_RAIDERS = 20;

export const titanHp = (n: number) => TITAN_BASE + TITAN_PER_PLAYER * (Math.max(1, n) - 1);
export const raiderHp = (n: number) => RAIDER_BASE + RAIDER_PER_PLAYER * (Math.max(1, n) - 1);
export const stompDamage = (n: number) => STOMP_BASE + STOMP_PER_PLAYER * (Math.max(1, n) - 1);

/** revive: "ready" until the player has used their one revive question. */
export type Raider = { uid: string; c: string; slot: number; hp: number; max: number; lv: number; pts: number; rights: number; revive: "ready" | "used" };
export type Raid = {
  mode: BossMode;
  titan: { hp: number; max: number };
  raiders: Record<string, Raider>;
  streak: Record<string, number>;
  stomp: number;
  winner: "players" | "titan" | null;
};
export type RaiderState = "alive" | "down" | "out";
/** alive: fighting. down: fainted, waiting for the revive question. out: fainted for good. */
export const raiderState = (x: Raider): RaiderState => (x.hp > 0 ? "alive" : x.revive === "ready" ? "down" : "out");

/** Everyone who picked a monster, in the order they picked (up to 20). */
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
  return { mode, titan: { hp: titanHp(n), max: titanHp(n) }, raiders, streak, stomp: stompDamage(n), winner: null };
}

/** A right answer: the player's monster hits the Titan. */
export function raidHit(r: Raid, uid: string, fast: boolean): { dmg: number; sup: boolean } | null {
  const x = r.raiders[uid];
  if (!x || r.winner || raiderState(x) !== "alive") return null;
  const streak = (r.streak[uid] ?? 0) + 1;
  const sup = streak >= SUPER_STREAK;
  r.streak[uid] = sup ? 0 : streak;
  let dmg = RAID_ATTACK;
  if (fast) dmg *= FAST_MULT;
  if (sup) dmg *= SUPER_MULT;
  dmg = Math.round(dmg);
  r.titan.hp = Math.max(0, r.titan.hp - dmg);
  x.pts += dmg;
  x.rights += 1;
  x.lv += 1;
  if (r.titan.hp === 0) r.winner = "players";
  return { dmg, sup };
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
    x.hp = Math.max(0, x.hp - r.stomp);
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
