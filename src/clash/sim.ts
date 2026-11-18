// Quality Clash battle rules in one place (no database, no browser), so they can be tested.
// Team 3 v 3: each player has one creature. Single 1 v 1: each player has three creatures.
import { CREATURE_IDS } from "./creatures.ts";

export type Side = "red" | "blue";
export type Format = "team" | "solo";

export const HP = 300;
/** Damage of one normal attack. In 1 v 1 every creature still standing attacks, each with SOLO_DAMAGE. */
export const TEAM_DAMAGE = 20;
export const SOLO_DAMAGE = 10;
/** An answer within this time is FAST: +25% damage. */
export const FAST_MS = 3_000;
export const FAST_MULT = 1.25;
/** Right answers in a row for a super move (×2). The count then restarts. */
export const SUPER_STREAK = 5;
export const SUPER_MULT = 2;
/** Team mode only: every SHIELD_EVERY right answers by the team give SHIELD to the teammate with the lowest HP. */
export const SHIELD = 50;
export const SHIELD_EVERY = 5;
/** Waiting time after a wrong answer or no answer. */
export const STUN_MS = 3_000;
export const TEAM_SIZE = 3;
export const SOLO_CREATURES = 3;

export type Fighter = { id: string; uid: string; side: Side; slot: number; c: string; hp: number; sh: number; lv: number };
export type Battle = {
  format: Format;
  fighters: Record<string, Fighter>;
  /** Right answers in a row, per player. */
  streak: Record<string, number>;
  /** Right answers by each side (for the team shield). */
  rights: Record<Side, number>;
  winner: Side | null;
};
export type Pick = { uid: string; side: Side; c: string[]; at?: number };
/** One creature hitting another: [attacker, target, damage, blocked by shield]. */
export type Hit = [string, string, number, number];
export type RightResult = { hits: Hit[]; fast: boolean; sup: boolean; dmg: number; shieldTo: string | null; fainted: string[] };

export const SIDES: Side[] = ["red", "blue"];
export const other = (s: Side): Side => (s === "red" ? "blue" : "red");

/**
 * Turn the lobby picks into the fighters. Picks are taken in the order they were made.
 * Team: up to 3 players per side, one creature each, no two teammates with the same creature.
 * Single: the first player on each side, with exactly 3 different creatures.
 * Returns the uids that did not get in (they watch).
 */
export function lineUp(format: Format, picks: Pick[]): { fighters: Record<string, Fighter>; watching: string[] } {
  const fighters: Record<string, Fighter> = {};
  const watching: string[] = [];
  const count: Record<Side, number> = { red: 0, blue: 0 };
  const usedOnSide: Record<Side, Set<string>> = { red: new Set(), blue: new Set() };
  const sorted = [...picks].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  for (const p of sorted) {
    if (!SIDES.includes(p.side)) {
      watching.push(p.uid);
      continue;
    }
    const cs = (p.c ?? []).filter((c) => CREATURE_IDS.includes(c));
    if (format === "team") {
      const c = cs[0];
      if (!c || count[p.side] >= TEAM_SIZE || usedOnSide[p.side].has(c)) {
        watching.push(p.uid);
        continue;
      }
      const slot = count[p.side]++;
      usedOnSide[p.side].add(c);
      const id = p.side[0] + slot;
      fighters[id] = { id, uid: p.uid, side: p.side, slot, c, hp: HP, sh: 0, lv: 1 };
    } else {
      const uniq = [...new Set(cs)].slice(0, SOLO_CREATURES);
      if (count[p.side] >= 1 || uniq.length < SOLO_CREATURES) {
        watching.push(p.uid);
        continue;
      }
      count[p.side] = 1;
      uniq.forEach((c, slot) => {
        const id = p.side[0] + slot;
        fighters[id] = { id, uid: p.uid, side: p.side, slot, c, hp: HP, sh: 0, lv: 1 };
      });
    }
  }
  return { fighters, watching };
}

export function newBattle(format: Format, fighters: Record<string, Fighter>): Battle {
  const streak: Record<string, number> = {};
  for (const f of Object.values(fighters)) streak[f.uid] = 0;
  return { format, fighters, streak, rights: { red: 0, blue: 0 }, winner: null };
}

const byHp = (a: Fighter, b: Fighter) => a.hp - b.hp || a.slot - b.slot;
export const aliveOf = (b: Battle, side: Side) => Object.values(b.fighters).filter((f) => f.side === side && f.hp > 0);
export const fightersOf = (b: Battle, uid: string) => Object.values(b.fighters).filter((f) => f.uid === uid).sort((x, y) => x.slot - y.slot);
export const isAlive = (b: Battle, uid: string) => fightersOf(b, uid).some((f) => f.hp > 0);
export const sideOf = (b: Battle, uid: string): Side | null => fightersOf(b, uid)[0]?.side ?? null;
export const players = (b: Battle) => [...new Set(Object.values(b.fighters).map((f) => f.uid))];
/** The opponent with the lowest HP (the left-most one on a tie). */
export const targetFor = (b: Battle, side: Side) => aliveOf(b, other(side)).sort(byHp)[0] ?? null;

/** A right answer: the player's creature(s) attack at once. */
export function right(b: Battle, uid: string, fast: boolean): RightResult {
  const mine = fightersOf(b, uid).filter((f) => f.hp > 0);
  const side = mine[0]?.side;
  const out: RightResult = { hits: [], fast, sup: false, dmg: 0, shieldTo: null, fainted: [] };
  if (!side || b.winner) return out;
  const streak = (b.streak[uid] ?? 0) + 1;
  out.sup = streak >= SUPER_STREAK;
  b.streak[uid] = out.sup ? 0 : streak;
  let dmg = b.format === "solo" ? SOLO_DAMAGE : TEAM_DAMAGE;
  if (fast) dmg *= FAST_MULT;
  if (out.sup) dmg *= SUPER_MULT;
  out.dmg = Math.round(dmg);
  for (const f of mine) {
    f.lv += 1;
    const tg = targetFor(b, side);
    if (!tg) break;
    const blocked = Math.min(tg.sh, out.dmg);
    tg.sh -= blocked;
    tg.hp = Math.max(0, tg.hp - (out.dmg - blocked));
    out.hits.push([f.id, tg.id, out.dmg, blocked]);
    if (tg.hp === 0) out.fainted.push(tg.id);
  }
  b.rights[side] += 1;
  if (b.format === "team" && b.rights[side] % SHIELD_EVERY === 0) {
    const low = aliveOf(b, side).sort(byHp)[0];
    if (low) {
      low.sh += SHIELD;
      out.shieldTo = low.id;
    }
  }
  if (!aliveOf(b, other(side)).length) b.winner = side;
  return out;
}

/** A wrong answer or no answer: the streak restarts (the engine adds the stun). */
export function wrong(b: Battle, uid: string) {
  b.streak[uid] = 0;
}
