import { useEffect, useState } from "react";
import { onValue, ref } from "./store.ts";
import { db } from "./firebase.ts";

/** Live value at a database path. `undefined` while loading. */
export function useDbValue<T>(path: string | null): T | null | undefined {
  const [val, setVal] = useState<T | null | undefined>(undefined);
  useEffect(() => {
    if (!path) return;
    setVal(undefined);
    return onValue(
      ref(db, path),
      (s) => setVal(s.val() as T | null),
      () => setVal(null),
    );
  }, [path]);
  return val;
}

/** Ticks every `ms` so countdowns re-render. */
export function useNow(ms = 200) {
  const [, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}
