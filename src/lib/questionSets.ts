// Question sets: the host picks one in the lobby, and the game only asks questions from it.
import type { Question } from "./types.ts";

export type QSet = "quality" | "world" | "logo" | "malaysia" | "general";
/** "mix" = every set except Quality. */
export type QChoice = QSet | "mix";

export const QSETS: { id: QChoice; en: string; ms: string; icon: string }[] = [
  { id: "quality", en: "Quality", ms: "Kualiti", icon: "✅" },
  { id: "world", en: "World", ms: "Dunia", icon: "🌏" },
  { id: "logo", en: "Logo", ms: "Logo", icon: "🏷️" },
  { id: "malaysia", en: "Malaysia", ms: "Malaysia", icon: "🇲🇾" },
  { id: "general", en: "General Knowledge", ms: "Pengetahuan Am", icon: "💡" },
  { id: "mix", en: "Mix (all except Quality)", ms: "Campuran (semua kecuali Kualiti)", icon: "🎲" },
];
export const SET_IDS: QSet[] = ["quality", "world", "logo", "malaysia", "general"];

/** Questions saved before sets existed belong to Quality. */
export const setOf = (q: { set?: string }): QSet => (SET_IDS.includes(q.set as QSet) ? (q.set as QSet) : "quality");
export const inChoice = (q: { set?: string }, choice: QChoice | undefined | null) => (choice === "mix" ? setOf(q) !== "quality" : setOf(q) === (choice || "quality"));
export const choiceName = (choice: QChoice | undefined | null) => QSETS.find((s) => s.id === (choice || "quality"))!;

/** The questions a game may ask: switched on and in the chosen set. */
export function poolFor(all: Record<string, Question> | null | undefined, choice: QChoice | undefined | null): Question[] {
  return Object.values(all ?? {}).filter((q) => q && q.enabled && inChoice(q, choice));
}
export function noQuestionsMessage(choice: QChoice | undefined | null) {
  return `There are no questions switched on in the "${choiceName(choice).en}" set. Open Questions and switch some on, or pick another set.`;
}
