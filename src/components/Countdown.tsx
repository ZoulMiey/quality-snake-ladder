import { useEffect, useRef } from "react";
import { serverNow } from "../lib/firebase.ts";
import { useNow } from "../lib/useDb.ts";
import { sfx } from "../lib/sound.ts";
import { hasPiece, tokenById } from "../lib/tokens.ts";

/**
 * "Get ready" 5-4-3-2-1-GO! shown on the projector and phones when the game starts.
 * On a phone, `you` is the player's piece (given at random at Start): "You are 🦊 Fox".
 */
export default function Countdown({ goAt, frozenAt, className, you }: { goAt: number; frozenAt?: number | null; className?: string; you?: string }) {
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
      {hasPiece(you) && (
        <div className="cd-you" style={{ ["--c" as string]: tokenById(you).color }}>
          <span className="cd-you-lbl">
            You are <span>/ Anda ialah</span>
          </span>
          <span className="cd-you-piece">{tokenById(you).emoji}</span>
          <span className="cd-you-name">{tokenById(you).name}</span>
        </div>
      )}
    </div>
  );
}
