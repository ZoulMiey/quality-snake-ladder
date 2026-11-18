/** The 20 player pieces. Each can be taken by only one player, so this is also the player limit. */
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
  { id: "tiger", emoji: "🐯", color: "#d97706", name: "Tiger" },
  { id: "penguin", emoji: "🐧", color: "#1e3a8a", name: "Penguin" },
  { id: "fox", emoji: "🦊", color: "#c2410c", name: "Fox" },
  { id: "frog", emoji: "🐸", color: "#65a30d", name: "Frog" },
  { id: "octopus", emoji: "🐙", color: "#db2777", name: "Octopus" },
  { id: "unicorn", emoji: "🦄", color: "#c084fc", name: "Unicorn" },
  { id: "sunflower", emoji: "🌻", color: "#ca8a04", name: "Sunflower" },
  { id: "melon", emoji: "🍉", color: "#e11d48", name: "Melon" },
  { id: "car", emoji: "🚗", color: "#0369a1", name: "Car" },
  { id: "dino", emoji: "🦖", color: "#4d7c0f", name: "Dino" },
];
export const tokenById = (id: string | undefined) => TOKENS.find((t) => t.id === id) ?? TOKENS[0];
export const MAX_PLAYERS = TOKENS.length;
