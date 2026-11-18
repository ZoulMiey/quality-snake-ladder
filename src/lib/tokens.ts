/** The 10 player pieces. Each can be taken by only one player. */
export const TOKENS: { id: string; emoji: string; color: string; name: string }[] = [
  { id: "lion", emoji: "🦁", color: "#f59e0b", name: "Lion" },
  { id: "turtle", emoji: "🐢", color: "#16a34a", name: "Turtle" },
  { id: "rocket", emoji: "🚀", color: "#6366f1", name: "Rocket" },
  { id: "star", emoji: "⭐", color: "#eab308", name: "Star" },
  { id: "panda", emoji: "🐼", color: "#64748b", name: "Panda" },
  { id: "clover", emoji: "🍀", color: "#10b981", name: "Clover" },
  { id: "ball", emoji: "⚽", color: "#0ea5e9", name: "Ball" },
  { id: "balloon", emoji: "🎈", color: "#ef4444", name: "Balloon" },
  { id: "bee", emoji: "🐝", color: "#f97316", name: "Bee" },
  { id: "butterfly", emoji: "🦋", color: "#a855f7", name: "Butterfly" },
];
export const tokenById = (id: string | undefined) => TOKENS.find((t) => t.id === id) ?? TOKENS[0];
export const MAX_PLAYERS = TOKENS.length;
