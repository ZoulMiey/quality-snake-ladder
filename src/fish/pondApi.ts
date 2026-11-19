// What the phone's pond view can do. Two versions: 3D (pondScene.ts, three.js, loaded only by Fishing
// phones) and a flat cartoon fallback (pondFlat.ts) for phones that cannot show 3D.
export type BoatInfo = { uid: string; emoji: string; color: string; name: string };
export type LeapKind = "fish" | "big" | "gold";

export interface PondApi {
  /** Everyone's boat, in the agreed order (boatOrder), and which one is mine. */
  setBoats(list: BoatInfo[], me: string): void;
  /** A fish leaps out of the water into this player's boat, after `delayMs`. `label` floats over my boat ("+3.4 kg"). */
  catchAt(uid: string, kind: LeapKind, delayMs?: number, label?: string, gold?: boolean): void;
  /** My line snapped (no line, the bobber sinks). */
  setSnapped(on: boolean): void;
  setFrenzy(on: boolean): void;
  dispose(): void;
}
