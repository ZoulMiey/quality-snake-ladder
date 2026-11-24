// Quality Cart sounds on the phone: the engine (pitched by speed) and a sound for each thing that happens
// to your own cart. Both race views (Kart3D and the Chase3D fallback) call frame() every frame with
// the cart's live flags (see CartPos in engine.ts: 1 spinning, 2 turbo, 4 shield, 8 slowed, 16 finished, 32 SUPER).
import { makeEngine, sfx } from "../lib/sound.ts";
import { BASE_SPEED } from "./sim.ts";
import { HAZARDS, gap } from "./track.ts";

export function kartSounds() {
  const engine = makeEngine();
  let prev = -1;
  return {
    /** speed in world units a second; p, d = your cart's distance and side (to tell what spun you out). */
    frame(speed: number, flags: number, p: number, d: number) {
      const finished = (flags & 16) !== 0;
      engine.set(speed / BASE_SPEED, (flags & 34) !== 0, !finished);
      if (prev < 0) {
        prev = flags;
        return;
      }
      const on = flags & ~prev; // flags that just switched on
      const off = prev & ~flags;
      prev = flags;
      if (on & 32) sfx.superBoost();
      else if (on & 2) sfx.boost();
      if (on & 4) sfx.shieldUp();
      else if (off & 4 && !(on & 1)) sfx.shieldDown();
      if (on & 1) {
        // What did we hit? The nearest cone or pothole just behind us; otherwise it was oil.
        let hit: string | null = null;
        let best = 60;
        for (const hz of HAZARDS) {
          if (hz.kind === "oos") continue;
          const g = Math.abs(gap(hz.s, p));
          if (g < best && Math.abs(hz.d - d) < 0.6) {
            best = g;
            hit = hz.kind;
          }
        }
        if (hit === "pothole") sfx.pothole();
        else if (hit === "cone") sfx.cone();
        else sfx.oil();
        sfx.screech();
      }
    },
    stop() {
      engine.stop();
    },
  };
}
