// Everything a referee needs to carry on after the projector page is reloaded. The security rules do not
// allow reading the whole database at once (there is no read rule at the top), so each part the host may
// read is fetched on its own and put together. (Found in the seventh session: get(ref(db)) was refused,
// so a reloaded projector could not resume Snake & Ladder, Quality Cart, Fishing Derby or Pull the Rope.)
import { get, ref } from "./store.ts";
import { db } from "./firebase.ts";

const PARTS = ["game", "players", "state", "private", "used", "feed", "questions", "kart", "clash", "answers"] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readAll(): Promise<Record<string, any>> {
  const snaps = await Promise.all(PARTS.map((p) => get(ref(db, p)).catch(() => null)));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {};
  PARTS.forEach((p, i) => {
    const v = snaps[i]?.val();
    if (v !== null && v !== undefined) out[p] = v;
  });
  return out;
}

/** The questions every player has had in earlier games (kept across games so they are not asked again soon). */
export async function readUsed(): Promise<Record<string, Record<string, true>>> {
  return ((await get(ref(db, "used")).catch(() => null))?.val() ?? {}) as Record<string, Record<string, true>>;
}
