// Question sets: the host picks one in the lobby, and the game only asks questions from it.
import type { Question } from "./types.ts";

export type QSet = "quality" | "world" | "logo" | "malaysia" | "general" | "manufacturing";
/** "mix" = every set except Quality and Manufacturing (owner, 24 Nov 2026). */
/** "qm" = Quality and Manufacturing together (owner, 24 Nov 2026). */
export type QChoice = QSet | "qm" | "mix";

export const QSETS: { id: QChoice; en: string; ms: string; icon: string }[] = [
  { id: "quality", en: "Quality", ms: "Kualiti", icon: "✅" },
  { id: "world", en: "World", ms: "Dunia", icon: "🌏" },
  { id: "logo", en: "Logo", ms: "Logo", icon: "🏷️" },
  { id: "malaysia", en: "Malaysia", ms: "Malaysia", icon: "🇲🇾" },
  { id: "general", en: "General Knowledge", ms: "Pengetahuan Am", icon: "💡" },
  { id: "manufacturing", en: "Manufacturing", ms: "Pembuatan", icon: "🏭" },
  { id: "qm", en: "Quality + Manufacturing", ms: "Kualiti + Pembuatan", icon: "🔀" },
  { id: "mix", en: "Mix (all except Quality & Manufacturing)", ms: "Campuran (semua kecuali Kualiti & Pembuatan)", icon: "🎲" },
];
export const SET_IDS: QSet[] = ["quality", "world", "logo", "malaysia", "general", "manufacturing"];
/** Sets that are not part of Mix. */
const NOT_IN_MIX: QSet[] = ["quality", "manufacturing"];

/** Questions saved before sets existed belong to Quality. */
export const setOf = (q: { set?: string }): QSet => (SET_IDS.includes(q.set as QSet) ? (q.set as QSet) : "quality");
export const inChoice = (q: { set?: string }, choice: QChoice | undefined | null) =>
  choice === "mix" ? !NOT_IN_MIX.includes(setOf(q)) : choice === "qm" ? NOT_IN_MIX.includes(setOf(q)) : setOf(q) === (choice || "quality");
export const choiceName = (choice: QChoice | undefined | null) => QSETS.find((s) => s.id === (choice || "quality"))!;

/** The questions a game may ask: switched on and in the chosen set. */
export function poolFor(all: Record<string, Question> | null | undefined, choice: QChoice | undefined | null): Question[] {
  return Object.values(all ?? {}).filter((q) => q && q.enabled && inChoice(q, choice));
}
export function noQuestionsMessage(choice: QChoice | undefined | null) {
  return `There are no questions switched on in the "${choiceName(choice).en}" set. Open Questions and switch some on, or pick another set.`;
}
