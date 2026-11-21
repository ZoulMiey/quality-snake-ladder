// The referee for a game, for the app (solo on the phone, or the room creator's phone).
import { Engine } from "../lib/engine.ts";
import { KartEngine } from "../kart/engine.ts";
import { ClashEngine } from "../clash/engine.ts";
import { BossEngine } from "../clash/bossEngine.ts";
import { FishEngine } from "../fish/engine.ts";
import { RopeEngine } from "../rope/engine.ts";
import { SpinEngine } from "../spin/engine.ts";
import type { GameMode } from "../lib/types.ts";

export type AnyEngine = Engine | KartEngine | ClashEngine | BossEngine | FishEngine | RopeEngine | SpinEngine;

export function makeEngine(mode: GameMode | null | undefined, tab: string, clashFormat?: string | null): AnyEngine {
  if (mode === "clash") return clashFormat === "boss" ? new BossEngine(tab) : new ClashEngine(tab);
  if (mode === "kart") return new KartEngine(tab);
  if (mode === "fish") return new FishEngine(tab);
  if (mode === "rope") return new RopeEngine(tab);
  if (mode === "spin") return new SpinEngine(tab);
  return new Engine(tab);
}
