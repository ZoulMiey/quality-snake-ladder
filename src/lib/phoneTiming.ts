// Timings for the phone's full-board animations. The referee (engine.ts) uses the same numbers to decide
// how long each result stays on screen, so the animation always finishes before the next question.
import { LAST_BOX } from "./board.ts";
import type { Result } from "./types.ts";

/** Full-screen SNAKE! / LADDER! alert before the question. The 30-second answer time starts after it. */
export const SL_ALERT_MS = 2_000;
/** Question card slides away and the board goes full screen. */
export const SLIDE_AWAY_MS = 600;
/** Zoom in on the player's piece while the dice roll. */
export const DICE_MS = 1_400;
/** One box of movement. */
export const HOP_MS = 300;
/** Quality event box card. */
export const SPECIAL_MS = 2_000;
/** Zoom back out after the piece stops. */
export const ZOOM_OUT_MS = 800;
/** Full-screen CORRECT / SAFE / WRONG alerts after a snake or ladder question. */
export const VERDICT_MS = 2_000;
/** Full-screen WRONG / TIME'S UP alert after a normal question. */
export const WRONG_MS = 2_500;
/** Sliding down a snake. */
export const SLIDE_MS = 1_800;
/** Climbing a ladder. */
export const CLIMB_MS = 1_400;
/** The small shake when a wrong ladder answer leaves the piece where it is. */
export const SHAKE_MS = 800;
/** Waiting time after a wrong answer (always 5 seconds). */
export const PENALTY_MS = 5_000;

/** Boxes walked after the dice, before any quality event box moves the player. */
export function walkBoxes(r: Pick<Result, "from" | "to" | "land" | "outcome">): number {
  const land = r.outcome === "win" ? LAST_BOX : (r.land ?? r.to);
  return Math.max(0, land - r.from);
}

/** When each part of a right-answer move happens, in ms after the result arrives. */
export function moveTimeline(r: Pick<Result, "from" | "to" | "land" | "outcome" | "special">) {
  const diceAt = SLIDE_AWAY_MS;
  const walkAt = diceAt + DICE_MS;
  const walkEnd = walkAt + walkBoxes(r) * HOP_MS;
  const specialEnd = r.special ? walkEnd + SPECIAL_MS : walkEnd;
  const shiftEnd = r.special ? specialEnd + Math.abs(r.to - (r.land ?? r.to)) * HOP_MS : walkEnd;
  const end = shiftEnd + ZOOM_OUT_MS;
  return { diceAt, walkAt, walkEnd, specialEnd, shiftEnd, end };
}

/** How long a result stays before the next question (the phone's animation fits inside it). */
export function resultMs(r: Result): number {
  if (r.penalty) return PENALTY_MS; // noroll, slide, nolad: all fit inside the 5-second penalty
  if (r.outcome === "safe") return VERDICT_MS + 300;
  if (r.outcome === "climb") return VERDICT_MS + CLIMB_MS + ZOOM_OUT_MS + 300;
  if (r.outcome === "move") return moveTimeline(r).end + 300;
  return 2_200;
}
