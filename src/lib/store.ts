// Where the games keep their data. The same game code (referees, phone screens, lobbies) runs in three places:
//   - "fire" with no prefix: the event (projector + QR), the Firebase database as before;
//   - "fire" with a prefix like "rooms/QK47": a room of friends (Quality Games app), the same paths inside the room;
//   - "local": solo play in the app, everything in this phone's memory (no Firebase while playing).
// The functions have the same names and shapes as firebase/database (ref, get, set, update, remove, onValue,
// serverTimestamp), so the games only import from here instead. The space is chosen once, before a page renders.
import * as fb from "firebase/database";
import { db as fireDb } from "./firebase.ts";

export type Space = { kind: "fire"; prefix: string } | { kind: "local" };
let space: Space = { kind: "fire", prefix: "" };
export const currentSpace = () => space;
export function setSpace(s: Space) {
  space = s;
}
export const isLocal = () => space.kind === "local";

export type SRef = { path: string };
const clean = (p: string) => p.replace(/^\/+|\/+$/g, "");
const join = (a: string, b: string) => [clean(a), clean(b)].filter(Boolean).join("/");

/** Same shape as firebase's ref(db, path); the first argument is ignored. */
export function ref(_db?: unknown, path = ""): SRef {
  return { path: clean(path) };
}
const fireRef = (r: SRef) => {
  const p = join((space as { prefix: string }).prefix, r.path);
  // The whole database is ref(db) with no path (Firebase refuses an empty path).
  return p ? fb.ref(fireDb, p) : fb.ref(fireDb);
};

export function serverTimestamp(): object | number {
  return space.kind === "local" ? Date.now() : fb.serverTimestamp();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Snap = { val: () => any };

// ---------- the phone's memory (solo) ----------
let tree: Record<string, unknown> = {};
type Listener = { path: string; cb: (s: Snap) => void };
const listeners = new Set<Listener>();

const clone = <T,>(v: T): T => (v === undefined || v === null ? (null as T) : (JSON.parse(JSON.stringify(v)) as T));
/** Like Firebase: empty objects and lists, and nulls inside, are dropped. */
function normal(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) {
    const a = v.map(normal);
    return a.every((x) => x === null) ? null : a;
  }
  if (typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      const n = normal(x);
      if (n !== null) o[k] = n;
    }
    return Object.keys(o).length ? o : null;
  }
  return v;
}
function readAt(path: string): unknown {
  let cur: unknown = tree;
  for (const k of path ? path.split("/") : []) {
    if (cur === null || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur ?? null;
}
function writeAt(path: string, value: unknown) {
  const keys = path ? path.split("/") : [];
  const v = normal(clone(value));
  if (!keys.length) {
    tree = (v as Record<string, unknown>) ?? {};
    return;
  }
  const stack: Record<string, unknown>[] = [];
  let cur: Record<string, unknown> = tree;
  for (const k of keys.slice(0, -1)) {
    stack.push(cur);
    if (cur[k] === null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  const last = keys[keys.length - 1];
  if (v === null) delete cur[last];
  else cur[last] = v;
  // Drop parents that became empty.
  for (let i = keys.length - 2; i >= 0; i--) {
    const parent = stack[i];
    const child = parent[keys[i]] as Record<string, unknown>;
    if (child && typeof child === "object" && !Object.keys(child).length) delete parent[keys[i]];
    else break;
  }
}
const related = (a: string, b: string) => !a || !b || a === b || a.startsWith(b + "/") || b.startsWith(a + "/");
function notify(paths: string[]) {
  for (const l of [...listeners]) {
    if (paths.some((p) => related(p, l.path))) {
      const v = clone(readAt(l.path));
      setTimeout(() => listeners.has(l) && l.cb({ val: () => v }), 0);
    }
  }
}
/** Solo: start with an empty memory. */
export function resetLocal(seed: Record<string, unknown> = {}) {
  tree = clone(seed) ?? {};
  notify([""]);
}

// ---------- the functions the games use ----------
export async function get(r: SRef): Promise<Snap> {
  if (space.kind === "local") {
    const v = clone(readAt(r.path));
    return { val: () => v };
  }
  return fb.get(fireRef(r));
}
export async function set(r: SRef, value: unknown): Promise<void> {
  if (space.kind === "local") {
    writeAt(r.path, value);
    notify([r.path]);
    return;
  }
  return fb.set(fireRef(r), value);
}
export async function remove(r: SRef): Promise<void> {
  return set(r, null);
}
export async function update(r: SRef, values: Record<string, unknown>): Promise<void> {
  if (space.kind === "local") {
    const paths = Object.keys(values).map((k) => join(r.path, k));
    Object.entries(values).forEach(([k, v]) => writeAt(join(r.path, k), v));
    notify(paths);
    return;
  }
  return fb.update(fireRef(r), values);
}
export function onValue(r: SRef, cb: (s: Snap) => void, onError?: (e: Error) => void): () => void {
  if (space.kind === "local") {
    const l: Listener = { path: r.path, cb };
    listeners.add(l);
    const v = clone(readAt(r.path));
    setTimeout(() => listeners.has(l) && cb({ val: () => v }), 0);
    return () => listeners.delete(l);
  }
  return fb.onValue(fireRef(r), cb, onError);
}

// Emulator tests only (development build): read the phone's memory, e.g. the right answer in a solo game.
if (import.meta.env.DEV) (globalThis as unknown as { __qslLocal?: (p: string) => unknown }).__qslLocal = (p: string) => clone(readAt(clean(p)));
