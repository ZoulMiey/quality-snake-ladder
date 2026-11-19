// Snake & ladder moments on the projector (owner's pick, Nov 2026; draft https://claude.ai/artifact/6xNL7kT8ZfdQN5Dxq5cHqc):
//   1–8 players:  SPOTLIGHT: the board darkens except around that snake or ladder and the player's piece.
//   9–20 players: GLOW + CARD: the snake or ladder glows, words pop up on the board, and an alert card shows in the side panel.
// A moment starts when a player gets a snake or ladder question and ends a little after their piece has
// slid down or climbed. The piece follows the snake's body / the ladder's rungs, at the same time as the phone.
import { LADDERS, SNAKES } from "./board.ts";
import { CLIMB_MS, SLIDE_MS, VERDICT_MS } from "./phoneTiming.ts";
import type { PlayerState } from "./types.ts";

/** Up to this many players the projector uses the spotlight; above it, glow + side-panel cards. */
export const SPOTLIGHT_MAX_PLAYERS = 8;
/** At most this many alert cards in the side panel at once (newest on top). */
export const MAX_CARDS = 3;
/** How long the card stays after the piece has stopped. */
export const CARD_LINGER_MS = 1_500;
/** How long the spotlight stays after the piece has stopped, then how long it takes to fade out. */
export const SPOT_LINGER_MS = 600;
export const SPOT_FADE_MS = 450;
/** The whole moment is forgotten this long after the piece has stopped. */
export const MOMENT_DONE_MS = 2_000;

export type MomentOutcome = "safe" | "slide" | "climb" | "nolad";
export type MomentKind = "snake" | "ladder";

/** A snake/ladder answer seen by the projector, with the local time it arrived. */
export type Verdict = { kind: MomentKind; outcome: MomentOutcome; from: number; to: number; at: number; seq: number };

export type Stage = "alert" | "answer" | "verdict" | "move" | "after";

export type Moment = {
  uid: string;
  kind: MomentKind;
  /** Snake head or ladder foot. */
  box: number;
  /** Where the snake/ladder ends (tail or top). */
  end: number;
  stage: Stage;
  /** Unique per moment, so animations restart for a new one. */
  key: string;
  /** For sorting the side cards: newest first. */
  startedAt: number;
  /** Answering: seconds left (0–30). */
  secs?: number;
  outcome?: MomentOutcome;
  from?: number;
  to?: number;
  /** While moving: 0 → 1 along the snake or ladder. */
  ride?: number;
  /** ms since the piece stopped (stage "after"). */
  afterMs?: number;
};

export function isMomentOutcome(o: string | undefined): o is MomentOutcome {
  return o === "safe" || o === "slide" || o === "climb" || o === "nolad";
}

export function moveMs(outcome: MomentOutcome): number {
  return outcome === "slide" ? SLIDE_MS : outcome === "climb" ? CLIMB_MS : 0;
}

/** When the piece starts and stops moving, in local ms. The phone shows its verdict alert for VERDICT_MS first. */
export function verdictTimes(v: Verdict) {
  const moveAt = v.at + VERDICT_MS;
  const moveEnd = moveAt + moveMs(v.outcome);
  return { moveAt, moveEnd, doneAt: moveEnd + MOMENT_DONE_MS };
}

/**
 * The moments to show right now.
 * - Answering comes straight from the game state (so it survives a projector reload).
 * - What happens after the answer comes from `verdicts`, recorded locally when each answer arrived.
 * `clockMs` is the database clock for question deadlines (the pause time while paused); `localNowMs` is this
 * computer's clock (verdicts).
 */
export function currentMoments(
  states: Record<string, PlayerState>,
  verdicts: Record<string, Verdict>,
  clockMs: number,
  localNowMs: number,
  questionMs: number,
  alertMs: number,
): Moment[] {
  const out: Moment[] = [];
  for (const [uid, st] of Object.entries(states)) {
    const v = verdicts[uid];
    const asked = st.phase === "question" && (st.kind === "snake" || st.kind === "ladder");
    if (v && !(asked && localNowMs >= verdictTimes(v).moveEnd)) {
      const { moveAt, moveEnd, doneAt } = verdictTimes(v);
      if (localNowMs < doneAt) {
        const end = v.kind === "snake" ? SNAKES[v.from] : LADDERS[v.from];
        const base = { uid, kind: v.kind, box: v.from, end: end ?? v.to, key: `${uid}-${v.seq}`, startedAt: v.at, outcome: v.outcome, from: v.from, to: v.to };
        if (localNowMs < moveAt) out.push({ ...base, stage: "verdict" });
        else if (localNowMs < moveEnd) out.push({ ...base, stage: "move", ride: (localNowMs - moveAt) / Math.max(1, moveEnd - moveAt) });
        else out.push({ ...base, stage: "after", afterMs: localNowMs - moveEnd });
        continue;
      }
    }
    if (asked) {
      const kind = st.kind as MomentKind;
      const end = kind === "snake" ? SNAKES[st.pos] : LADDERS[st.pos];
      if (end === undefined) continue;
      const askedAt = st.deadline - questionMs - alertMs;
      out.push({
        uid,
        kind,
        box: st.pos,
        end,
        stage: clockMs < askedAt + alertMs ? "alert" : "answer",
        key: `${uid}-${st.seq}`,
        startedAt: askedAt,
        secs: Math.max(0, Math.min(questionMs / 1000, Math.ceil((st.deadline - clockMs) / 1000))),
      });
    }
  }
  return out;
}

/** Ladder climb: rung by rung (each rung eases in), like the phone. */
export function climbProgress(t: number, rungs: number): number {
  const k = Math.max(0, Math.min(1, t)) * rungs;
  const i = Math.floor(k);
  const f = k - i;
  return Math.min(1, (i + (1 - Math.pow(1 - f, 3))) / rungs);
}

/** Smooth start and stop for sliding down a snake. */
export function slideProgress(t: number): number {
  const u = Math.max(0, Math.min(1, t));
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

export const ALERT_TEXT: Record<MomentKind, { en: string; ms: string; icon: string }> = {
  snake: { en: "SNAKE!", ms: "ULAR!", icon: "🐍" },
  ladder: { en: "LADDER!", ms: "TANGGA!", icon: "🪜" },
};

export function verdictText(o: MomentOutcome, from: number, to: number) {
  switch (o) {
    case "safe":
      return { en: "SAFE!", ms: "SELAMAT!", sub: `Stays on ${from}`, subMs: `Kekal di ${from}`, delta: "", tone: "good" as const };
    case "slide":
      return { en: "SLIDE!", ms: "TERGELINCIR!", sub: `${from} → ${to}`, subMs: `Turun ${from - to} petak`, delta: `−${from - to}`, tone: "bad" as const };
    case "climb":
      return { en: "CLIMB!", ms: "PANJAT!", sub: `${from} → ${to}`, subMs: `Naik ${to - from} petak`, delta: `+${to - from}`, tone: "gold" as const };
    case "nolad":
      return { en: "NO CLIMB", ms: "TIDAK NAIK", sub: `Stays on ${from}`, subMs: `Kekal di ${from}`, delta: "", tone: "grey" as const };
  }
}
