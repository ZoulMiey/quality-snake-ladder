// Quality event boxes: landing on one moves the player forward or back straight away.
import { LADDERS, SNAKES } from "./board.ts";

export type SpecialEvent = { id: string; icon: string; en: string; ms: string; move: number };
export type SpecialBox = { box: number; id: string };

export const EVENTS: SpecialEvent[] = [
  { id: "viscosity", icon: "🧪", en: "Viscosity within range!", ms: "Kelikatan dalam julat!", move: 2 },
  { id: "audit", icon: "✅", en: "Audit with zero findings!", ms: "Audit tanpa penemuan!", move: 3 },
  { id: "5s", icon: "🧹", en: "Great 5S score!", ms: "Skor 5S cemerlang!", move: 2 },
  { id: "calibration", icon: "📏", en: "Calibration done on time!", ms: "Penentukuran siap tepat pada masa!", move: 1 },
  { id: "compliment", icon: "🙌", en: "Customer compliment!", ms: "Pujian daripada pelanggan!", move: 4 },
  { id: "cso", icon: "📄", en: "New CSO (customer complaint)!", ms: "CSO baharu (aduan pelanggan)!", move: -3 },
  { id: "ph", icon: "⚠️", en: "pH out of spec!", ms: "pH di luar spesifikasi!", move: -2 },
  { id: "label", icon: "🏷️", en: "Wrong label on carton!", ms: "Label salah pada karton!", move: -3 },
  { id: "signature", icon: "✍️", en: "Missing signature on a record!", ms: "Tiada tandatangan pada rekod!", move: -2 },
  { id: "rework", icon: "🔁", en: "Rework needed!", ms: "Kerja semula diperlukan!", move: -1 },
];

/** The 12 boxes used in each game: every event once, plus the two examples a second time. */
const SET = [...EVENTS.map((e) => e.id), "viscosity", "cso"];

export const eventById = (id: string | undefined) => EVENTS.find((e) => e.id === id);

/** Boxes that may hold a special box: not near the start or the finish, and not part of a snake or ladder. */
function allowedBoxes(): number[] {
  const taken = new Set<number>();
  for (const [a, b] of Object.entries(SNAKES)) taken.add(+a).add(b);
  for (const [a, b] of Object.entries(LADDERS)) taken.add(+a).add(b);
  const out: number[] = [];
  for (let n = 6; n <= 90; n++) if (!taken.has(n)) out.push(n);
  return out;
}

/** Place the 12 special boxes at random, at least 3 boxes apart, for a new game. */
export function placeSpecials(rand = Math.random): SpecialBox[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const pool = allowedBoxes();
    const chosen: number[] = [];
    while (chosen.length < SET.length && pool.length) {
      const i = Math.floor(rand() * pool.length);
      const box = pool.splice(i, 1)[0];
      if (chosen.every((c) => Math.abs(c - box) >= 3)) chosen.push(box);
    }
    if (chosen.length === SET.length) {
      const ids = [...SET].sort(() => rand() - 0.5);
      return chosen.sort((a, b) => a - b).map((box, i) => ({ box, id: ids[i] }));
    }
  }
  return [];
}

export function specialAt(list: SpecialBox[] | null | undefined, box: number): SpecialEvent | undefined {
  return eventById(list?.find((s) => s.box === box)?.id);
}
