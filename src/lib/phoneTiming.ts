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
/** Full-screen quality event box alert. */
export const SPECIAL_MS = 2_200;
/** Zoom back in on the piece after the event alert, before it moves forward or back. */
export const SPECIAL_ZOOM_MS = 600;
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

// ---------- Quick Move (event only, owner's pick on 23 Nov 2026) ----------
// The question card stays at the bottom and the board above it stays in view: no slide away, no zoom.
// The dice roll in the corner of the board, the piece hops faster, and the next question comes straight away.
// SNAKE! / LADDER! is a banner on the question card (no full-screen alert first). Wrong answers are unchanged:
// full-screen WRONG and the 5-second penalty. The app (solo, rooms) keeps the timings above.
/** Dice roll in the corner of the board before the piece moves. */
export const QUICK_DICE_MS = 800;
/** One box of movement. */
export const QUICK_HOP_MS = 200;
/** Quality event box pop-up over the board (not full screen). */
export const QUICK_SPECIAL_MS = 1_000;
/** Right answer at a ladder: "CORRECT!" on the card, then the climb. */
export const QUICK_VERDICT_MS = 600;
/** Climbing a ladder. */
export const QUICK_CLIMB_MS = 1_000;
/** Right answer at a snake: "SAFE!" on the card. */
export const QUICK_SAFE_MS = 1_000;
/** Short pause after the piece stops, before the next question. */
export const QUICK_AFTER_MS = 300;

/** Full-screen SNAKE! / LADDER! alert before the question (none in Quick Move). */
export const slAlertMs = (quick: boolean) => (quick ? 0 : SL_ALERT_MS);
export const hopMs = (quick: boolean) => (quick ? QUICK_HOP_MS : HOP_MS);
export const climbMs = (quick: boolean) => (quick ? QUICK_CLIMB_MS : CLIMB_MS);
/** After a snake/ladder answer: how long the verdict shows before the piece moves (wrong answers keep the full 2 s). */
export function verdictMs(outcome: "safe" | "slide" | "climb" | "nolad", quick: boolean): number {
  if (!quick) return VERDICT_MS;
  return outcome === "climb" ? QUICK_VERDICT_MS : outcome === "safe" ? QUICK_SAFE_MS : VERDICT_MS;
}

/** Boxes walked after the dice, before any quality event box moves the player. */
export function walkBoxes(r: Pick<Result, "from" | "to" | "land" | "outcome">): number {
  const land = r.outcome === "win" ? LAST_BOX : (r.land ?? r.to);
  return Math.max(0, land - r.from);
}

/** When each part of a right-answer move happens, in ms after the result arrives. */
export function moveTimeline(r: Pick<Result, "from" | "to" | "land" | "outcome" | "special">, quick = false) {
  if (quick) {
    const walkAt = QUICK_DICE_MS;
    const walkEnd = walkAt + walkBoxes(r) * QUICK_HOP_MS;
    const specialEnd = r.special ? walkEnd + QUICK_SPECIAL_MS : walkEnd;
    const shiftAt = specialEnd;
    const shiftEnd = r.special ? shiftAt + Math.abs(r.to - (r.land ?? r.to)) * QUICK_HOP_MS : walkEnd;
    return { diceAt: 0, walkAt, walkEnd, specialEnd, shiftAt, shiftEnd, end: shiftEnd };
  }
  const diceAt = SLIDE_AWAY_MS;
  const walkAt = diceAt + DICE_MS;
  const walkEnd = walkAt + walkBoxes(r) * HOP_MS;
  const specialEnd = r.special ? walkEnd + SPECIAL_MS : walkEnd;
  const shiftAt = r.special ? specialEnd + SPECIAL_ZOOM_MS : walkEnd;
  const shiftEnd = r.special ? shiftAt + Math.abs(r.to - (r.land ?? r.to)) * HOP_MS : walkEnd;
  const end = shiftEnd + ZOOM_OUT_MS;
  return { diceAt, walkAt, walkEnd, specialEnd, shiftAt, shiftEnd, end };
}

/** How long a result stays before the next question (the phone's animation fits inside it). */
export function resultMs(r: Result, quick = false): number {
  if (r.penalty) return PENALTY_MS; // noroll, slide, nolad: all fit inside the 5-second penalty
  if (quick) {
    if (r.outcome === "safe") return QUICK_SAFE_MS + QUICK_AFTER_MS;
    if (r.outcome === "climb") return QUICK_VERDICT_MS + QUICK_CLIMB_MS + QUICK_AFTER_MS;
    if (r.outcome === "move") return moveTimeline(r, true).end + QUICK_AFTER_MS;
    return 2_200;
  }
  if (r.outcome === "safe") return VERDICT_MS + 300;
  if (r.outcome === "climb") return VERDICT_MS + CLIMB_MS + ZOOM_OUT_MS + 300;
  if (r.outcome === "move") return moveTimeline(r).end + 300;
  return 2_200;
}
