// The question bank for the Quality Games app (solo and rooms), at pub/qs. The projector keeps it up to date:
// whenever the host's questions change, it writes the switched-on questions here. Anyone signed in may read it
// (the app checks answers on the phone), so the right answer is scrambled (owner's choice: same bank, not in
// plain sight). Two sets for the app: Quality, and Mix = every set except Quality.
import { get, ref, set } from "firebase/database";
import { db } from "./firebase.ts";
import type { Question } from "./types.ts";

export type AppSet = "quality" | "mix";
type Pub = { s: string; t: "mc" | "tf"; q: Question["q"]; o?: Question["opts"]; k: number };

function hash(id: string) {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}
const n = (q: { t: string; o?: unknown[] }) => (q.t === "tf" ? 2 : q.o?.length || 4);
const scramble = (id: string, ans: number, len: number) => (ans + hash(id)) % len + len * (1 + (hash(id + "x") % 7));
const unscramble = (id: string, k: number, len: number) => ((((k % len) - (hash(id) % len)) % len) + len) % len;

/** Projector (host): write the switched-on questions for the app, if they changed. */
export async function publishQuestions(qs: Record<string, Question> | null | undefined) {
  if (!qs) return;
  const out: Record<string, Pub> = {};
  for (const [id, q] of Object.entries(qs)) {
    if (!q?.enabled) continue;
    const len = q.type === "tf" ? 2 : q.opts?.length || 4;
    out[id] = { s: q.set ?? "quality", t: q.type, q: q.q, ...(q.opts ? { o: q.opts } : {}), k: scramble(id, q.ans, len) };
  }
  const sig = JSON.stringify(out);
  try {
    if (sessionStorage.getItem("qsl-pub") === sig) return;
  } catch {}
  await set(ref(db, "pub/qs"), out);
  try {
    sessionStorage.setItem("qsl-pub", sig);
  } catch {}
}

/** App: the questions of a set (Quality or Mix), as the referee expects them. Cached for offline play. */
export async function loadQuestions(which: AppSet): Promise<Record<string, Question>> {
  let raw: Record<string, Pub> | null = null;
  try {
    raw = (await get(ref(db, "pub/qs"))).val();
    if (raw) localStorage.setItem("qsl-pubqs", JSON.stringify(raw));
  } catch {
    try {
      raw = JSON.parse(localStorage.getItem("qsl-pubqs") ?? "null");
    } catch {}
  }
  const out: Record<string, Question> = {};
  for (const [id, p] of Object.entries(raw ?? {})) {
    const isQ = (p.s || "quality") === "quality";
    if (which === "quality" ? !isQ : isQ) continue;
    out[id] = { id, cat: "", set: p.s as Question["set"], type: p.t, q: p.q, ...(p.o ? { opts: p.o } : {}), ans: unscramble(id, p.k, n(p)), enabled: true };
  }
  return out;
}
