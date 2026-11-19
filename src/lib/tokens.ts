/**
 * The 50 player pieces. Players only type their name; when the host presses Start, everyone gets a
 * different random piece (owner's request, Nov 2026). "Play again" keeps the pieces.
 * Emoji are from 2018 or earlier so older phones and Windows PCs can show them.
 */
export type Token = { id: string; emoji: string; color: string; name: string };

export const TOKENS: Token[] = [
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
  { id: "duck", emoji: "🦆", color: "#0d9488", name: "Duck" },
  { id: "crab", emoji: "🦀", color: "#b91c1c", name: "Crab" },
  { id: "whale", emoji: "🐳", color: "#2563eb", name: "Whale" },
  { id: "croc", emoji: "🐊", color: "#15803d", name: "Crocodile" },
  { id: "shell", emoji: "🐚", color: "#be185d", name: "Shell" },
  { id: "blowfish", emoji: "🐡", color: "#a16207", name: "Blowfish" },
  { id: "dolphin", emoji: "🐬", color: "#0284c7", name: "Dolphin" },
  { id: "owl", emoji: "🦉", color: "#92400e", name: "Owl" },
  { id: "koala", emoji: "🐨", color: "#6b7280", name: "Koala" },
  { id: "monkey", emoji: "🐵", color: "#a0522d", name: "Monkey" },
  { id: "pig", emoji: "🐷", color: "#ec4899", name: "Pig" },
  { id: "rabbit", emoji: "🐰", color: "#f472b6", name: "Rabbit" },
  { id: "dog", emoji: "🐶", color: "#b45309", name: "Dog" },
  { id: "chick", emoji: "🐥", color: "#facc15", name: "Chick" },
  { id: "shark", emoji: "🦈", color: "#475569", name: "Shark" },
  { id: "ladybug", emoji: "🐞", color: "#dc2626", name: "Ladybug" },
  { id: "mushroom", emoji: "🍄", color: "#9f1239", name: "Mushroom" },
  { id: "cactus", emoji: "🌵", color: "#4ade80", name: "Cactus" },
  { id: "rainbow", emoji: "🌈", color: "#8b5cf6", name: "Rainbow" },
  { id: "apple", emoji: "🍎", color: "#f43f5e", name: "Apple" },
  { id: "pineapple", emoji: "🍍", color: "#eab308", name: "Pineapple" },
  { id: "cherry", emoji: "🍒", color: "#be123c", name: "Cherry" },
  { id: "grapes", emoji: "🍇", color: "#7c3aed", name: "Grapes" },
  { id: "donut", emoji: "🍩", color: "#c026d3", name: "Donut" },
  { id: "pizza", emoji: "🍕", color: "#ea580c", name: "Pizza" },
  { id: "guitar", emoji: "🎸", color: "#9a3412", name: "Guitar" },
  { id: "heli", emoji: "🚁", color: "#0f766e", name: "Helicopter" },
  { id: "boat", emoji: "⛵", color: "#0891b2", name: "Sailboat" },
  { id: "diamond", emoji: "💎", color: "#06b6d4", name: "Diamond" },
  { id: "robot", emoji: "🤖", color: "#334155", name: "Robot" },
];

/** Shown in the lobby before the game gives out the pieces. */
export const NO_PIECE: Token = { id: "", emoji: "❔", color: "#94a3b8", name: "Piece at start" };

const BY_ID = new Map(TOKENS.map((t) => [t.id, t]));
export const tokenById = (id: string | undefined): Token => (id && BY_ID.get(id)) || NO_PIECE;
export const hasPiece = (id: string | undefined) => !!id && BY_ID.has(id);

/** The room limit: how many can join. Each game may allow fewer (see gameMaxPlayers). */
export const MAX_PLAYERS = TOKENS.length;

/** How many players a game can start with (owner, Nov 2026): Quality Cart 30, Clash Team and Boss Raid 30. */
export function gameMaxPlayers(mode: string | null | undefined, clashFormat?: string | null): number {
  if (mode === "kart") return 30;
  if (mode === "clash") return clashFormat === "solo" ? MAX_PLAYERS : 30;
  return MAX_PLAYERS;
}

/**
 * Random pieces for everyone who has none yet (or a duplicate). Players who already have one keep it
 * ("Play again with the same players"). Returns uid → piece id for the players that need a new one.
 */
export function assignPieces(players: Record<string, { token?: string; joinedAt?: number }>, random: () => number = Math.random): Record<string, string> {
  const used = new Set<string>();
  const need: string[] = [];
  const order = Object.entries(players).sort((a, b) => (a[1].joinedAt ?? 0) - (b[1].joinedAt ?? 0) || (a[0] < b[0] ? -1 : 1));
  for (const [uid, p] of order) {
    if (hasPiece(p.token) && !used.has(p.token!)) used.add(p.token!);
    else need.push(uid);
  }
  const free = TOKENS.filter((t) => !used.has(t.id)).map((t) => t.id);
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  const out: Record<string, string> = {};
  need.forEach((uid, i) => {
    if (i < free.length) out[uid] = free[i];
  });
  return out;
}
