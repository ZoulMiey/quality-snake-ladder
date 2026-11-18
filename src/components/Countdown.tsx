import { useEffect, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useNow } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";

/** "Get ready" 5-4-3-2-1-GO! shown on the projector and phones when the game starts. */
export default function Countdown({ goAt, frozenAt, className }: { goAt: number; frozenAt?: number | null; className?: string }) {
  useNow(100);
  const now = frozenAt ?? serverNow();
  const left = goAt - now;
  const label = left > 0 ? String(Math.ceil(left / 1000)) : "GO!";
  const last = useRef("");
  useEffect(() => {
    if (left < -1000 || last.current === label) return;
    last.current = label;
    if (label === "GO!") sfx.go();
    else sfx.count();
  }, [label, left]);
  if (left < -1000) return null;
  return (
    <div className={`countdown ${className ?? ""}`} role="status" aria-live="assertive">
      <div className="cd-ready">
        <span className="en">Get ready!</span>
        <span className="ms">Bersedia!</span>
      </div>
      <div key={label} className={`cd-num ${label === "GO!" ? "go" : ""}`}>
        {label}
      </div>
    </div>
  );
}
