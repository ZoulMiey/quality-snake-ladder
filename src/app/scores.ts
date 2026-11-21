// Quality Games app high scores (owner, Nov 2026). Each game has two lists, Quality and Mix (every set except
// Quality); Quality Spin also by time (3 or 5 min). "Today" (Malaysia date) and "All time", top 10. Only players
// signed in with Google go on the lists, under their nickname (nothing from Google is shown). Everyone, guests
// too, keeps a personal record on the phone.
// Data: hs/{key}/{set}/all/{uid} and hs/{key}/{set}/d/{yyyymmdd}/{uid} = { n: nickname, v: score, at }.
import { get, limitToFirst, limitToLast, orderByChild, query, ref, set } from "firebase/database";
import { db, auth } from "../lib/firebase.ts";
import type { AppSet } from "../lib/pubQuestions.ts";

export type ScoreKey = "snake" | "kart" | "clash" | "fish" | "rope" | "spin3" | "spin5";
/** Times: lower is better. */
export const LOWER_BETTER: Record<ScoreKey, boolean> = { snake: true, kart: true, clash: true, rope: true, fish: false, spin3: false, spin5: false };
export const SCORE_LABEL: Record<ScoreKey, { en: string; ms: string }> = {
  snake: { en: "Fastest to box 100", ms: "Paling pantas ke petak 100" },
  kart: { en: "Fastest 3 laps", ms: "3 pusingan paling pantas" },
  clash: { en: "Fastest Titan defeat", ms: "Kalahkan Gergasi paling pantas" },
  fish: { en: "Heaviest catch in 5 min", ms: "Tangkapan paling berat" },
  rope: { en: "Fastest to your bank", ms: "Paling pantas ke tebing" },
  spin3: { en: "Most points in 3 min", ms: "Mata tertinggi dalam 3 minit" },
  spin5: { en: "Most points in 5 min", ms: "Mata tertinggi dalam 5 minit" },
};

/** How a score reads: times as m:ss.s, Fishing in kg (stored in tenths), Spin in points. */
export function fmtScore(key: ScoreKey, v: number): string {
  if (key === "fish") return `${(v / 10).toFixed(1)} kg`;
  if (key === "spin3" || key === "spin5") return v.toLocaleString("en");
  const s = v / 1000;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
}
export const better = (key: ScoreKey, a: number, b: number | null | undefined) => b === null || b === undefined || (LOWER_BETTER[key] ? a < b : a > b);

/** Today's date in Malaysia (UTC+8), e.g. "20261124". */
export function dayKey(t = Date.now()) {
  const d = new Date(t + 8 * 3600_000);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export const isGoogle = () => !!auth.currentUser?.providerData.some((p) => p.providerId === "google.com");

// ---------- personal record (this phone) ----------
const pbKey = (key: ScoreKey, s: AppSet) => `qsl-best-${key}-${s}`;
export function personalBest(key: ScoreKey, s: AppSet): number | null {
  try {
    const v = localStorage.getItem(pbKey(key, s));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}
function savePersonal(key: ScoreKey, s: AppSet, v: number): boolean {
  const old = personalBest(key, s);
  if (!better(key, v, old)) return false;
  try {
    localStorage.setItem(pbKey(key, s), String(v));
  } catch {}
  return true;
}

export type Entry = { uid: string; n: string; v: number; at: number };
export async function topScores(key: ScoreKey, s: AppSet, which: "today" | "all"): Promise<Entry[]> {
  const path = which === "all" ? `hs/${key}/${s}/all` : `hs/${key}/${s}/d/${dayKey()}`;
  const q = query(ref(db, path), orderByChild("v"), LOWER_BETTER[key] ? limitToFirst(10) : limitToLast(10));
  const snap = await get(q);
  const out: Entry[] = [];
  snap.forEach((c) => {
    out.push({ uid: c.key!, ...(c.val() as Omit<Entry, "uid">) });
  });
  out.sort((a, b) => (LOWER_BETTER[key] ? a.v - b.v : b.v - a.v) || a.at - b.at);
  return out;
}

export type Submitted = { personal: boolean; listed: boolean; rankToday: number | null; rankAll: number | null };
/** Save a finished game's score: the personal record always; the lists only for Google players. */
export async function submitScore(key: ScoreKey, s: AppSet, v: number, nick: string): Promise<Submitted> {
  const personal = savePersonal(key, s, v);
  const res: Submitted = { personal, listed: false, rankToday: null, rankAll: null };
  const uid = auth.currentUser?.uid;
  if (!uid || !isGoogle()) return res;
  const entry = { n: nick.slice(0, 20), v, at: Date.now() };
  for (const [path, which] of [[`hs/${key}/${s}/all/${uid}`, "all"], [`hs/${key}/${s}/d/${dayKey()}/${uid}`, "today"]] as const) {
    try {
      const old = (await get(ref(db, path))).val() as Entry | null;
      if (better(key, v, old?.v)) {
        await set(ref(db, path), entry);
        res.listed = true;
      }
      const top = await topScores(key, s, which);
      const i = top.findIndex((e) => e.uid === uid);
      if (which === "all") res.rankAll = i >= 0 ? i + 1 : null;
      else res.rankToday = i >= 0 ? i + 1 : null;
    } catch {
      // Rules not published yet, or offline: the personal record is still kept.
    }
  }
  return res;
}
