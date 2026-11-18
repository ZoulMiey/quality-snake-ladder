// The 15 Quality Clash creatures. All are equal (300 HP, same damage); the type only sets
// the colours and the attack animation.
export type ElementId = "water" | "fire" | "wind" | "earth" | "elec";

export const ELEMENTS: Record<ElementId, { en: string; ms: string; a: string; l: string; d: string; x: string; ui: string }> = {
  water: { en: "Water", ms: "Air", a: "#3d8fe0", l: "#9ad8ff", d: "#1f4e99", x: "#e8fbff", ui: "#5aa9ff" },
  fire: { en: "Fire", ms: "Api", a: "#e8552d", l: "#ffb347", d: "#9a2a1a", x: "#ffe066", ui: "#ff7a45" },
  wind: { en: "Wind", ms: "Angin", a: "#6cc7a0", l: "#d6f5e6", d: "#2f7a62", x: "#ffffff", ui: "#6fdcb0" },
  earth: { en: "Earth", ms: "Tanah", a: "#a8805a", l: "#dcc29a", d: "#5e4630", x: "#8f97a3", ui: "#d4a373" },
  elec: { en: "Electric", ms: "Elektrik", a: "#f4c531", l: "#fff2a6", d: "#a8740f", x: "#7ae0ff", ui: "#ffd84a" },
};

export type Creature = { id: string; en: string; ms: string; type: ElementId; move: { en: string; ms: string } };

export const CREATURES: Creature[] = [
  { id: "dragon", en: "Kaizen Dragon", ms: "Naga Kaizen", type: "fire", move: { en: "Flame Breath", ms: "Nafas Api" } },
  { id: "bull", en: "Furnace Bull", ms: "Lembu Relau", type: "fire", move: { en: "Furnace Charge", ms: "Rempuhan Relau" } },
  { id: "lizard", en: "Flashpoint Lizard", ms: "Cicak Takat Kilat", type: "fire", move: { en: "Ember Dash", ms: "Luru Bara" } },
  { id: "shark", en: "pH Shark", ms: "Jerung pH", type: "water", move: { en: "Acid Bite", ms: "Gigitan Asid" } },
  { id: "turtle", en: "Viscosity Turtle", ms: "Penyu Kelikatan", type: "water", move: { en: "Thick Wave", ms: "Ombak Pekat" } },
  { id: "otter", en: "Sample Otter", ms: "Memerang Sampel", type: "water", move: { en: "Sample Splash", ms: "Percikan Sampel" } },
  { id: "falcon", en: "Gemba Falcon", ms: "Helang Gemba", type: "wind", move: { en: "Gemba Dive", ms: "Junaman Gemba" } },
  { id: "owl", en: "Audit Owl", ms: "Burung Hantu Audit", type: "wind", move: { en: "Audit Gust", ms: "Tiupan Audit" } },
  { id: "swallow", en: "Kanban Swallow", ms: "Layang-layang Kanban", type: "wind", move: { en: "Kanban Gale", ms: "Ribut Kanban" } },
  { id: "rhino", en: "Root Cause Rhino", ms: "Badak Punca Akar", type: "earth", move: { en: "Root Charge", ms: "Rempuhan Punca" } },
  { id: "golem", en: "Calibration Golem", ms: "Golem Kalibrasi", type: "earth", move: { en: "Calibrate Quake", ms: "Gegaran Kalibrasi" } },
  { id: "mole", en: "5S Mole", ms: "Tikus Mondok 5S", type: "earth", move: { en: "5S Dig", ms: "Korekan 5S" } },
  { id: "fox", en: "Sigma Fox", ms: "Musang Sigma", type: "elec", move: { en: "Sigma Bolt", ms: "Panahan Sigma" } },
  { id: "beetle", en: "Voltmeter Beetle", ms: "Kumbang Voltmeter", type: "elec", move: { en: "Volt Surge", ms: "Lonjakan Volt" } },
  { id: "bee", en: "Sensor Bee", ms: "Lebah Sensor", type: "elec", move: { en: "Buzz Zap", ms: "Sengatan Sensor" } },
];

export const CREATURE_IDS = CREATURES.map((c) => c.id);
export const creatureById = (id: string | undefined) => CREATURES.find((c) => c.id === id) ?? CREATURES[0];
