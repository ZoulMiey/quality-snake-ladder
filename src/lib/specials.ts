// Quality event boxes: landing on one moves the player forward or back straight away.
import { LADDERS, SNAKES } from "./board.ts";
import type { QChoice, QSet } from "./questionSets.ts";

export type SpecialEvent = { id: string; icon: string; en: string; ms: string; move: number };
export type SpecialBox = { box: number; id: string };

const ev = (id: string, icon: string, en: string, ms: string, move: number): SpecialEvent => ({ id, icon, en, ms, move });

/** 16 event boxes per question set: 8 good, 8 bad, about as many boxes forward as back. */
export const EVENT_SETS: Record<QSet, SpecialEvent[]> = {
  quality: [
    ev("viscosity", "🧪", "Viscosity within range!", "Kelikatan dalam julat!", 2),
    ev("audit", "✅", "Audit with zero findings!", "Audit tanpa penemuan!", 3),
    ev("5s", "🧹", "Great 5S score!", "Skor 5S cemerlang!", 2),
    ev("calibration", "📏", "Calibration done on time!", "Penentukuran siap tepat pada masa!", 1),
    ev("compliment", "🙌", "Customer compliment!", "Pujian daripada pelanggan!", 4),
    ev("kaizen", "💡", "Kaizen idea approved!", "Idea Kaizen diluluskan!", 3),
    ev("ontime", "🚚", "On-time delivery to the customer!", "Penghantaran tepat pada masa kepada pelanggan!", 2),
    ev("zerodefect", "🏅", "Zero defects this shift!", "Sifar kecacatan syif ini!", 2),
    ev("cso", "📄", "New CSO (customer complaint)!", "CSO baharu (aduan pelanggan)!", -3),
    ev("ph", "⚠️", "pH out of spec!", "pH di luar spesifikasi!", -2),
    ev("label", "🏷️", "Wrong label on carton!", "Label salah pada karton!", -3),
    ev("signature", "✍️", "Missing signature on a record!", "Tiada tandatangan pada rekod!", -2),
    ev("rework", "🔁", "Rework needed!", "Kerja semula diperlukan!", -1),
    ev("expired", "📦", "Expired raw material found!", "Bahan mentah tamat tempoh ditemui!", -3),
    ev("breakdown", "🛠️", "Machine breakdown!", "Mesin rosak!", -2),
    ev("onhold", "⏸️", "Batch on hold for retest!", "Kelompok ditahan untuk ujian semula!", -2),
  ],
  manufacturing: [
    ev("mf-speed", "🏎️", "Line running at full speed!", "Talian berjalan pada kelajuan penuh!", 2),
    ev("mf-changeover", "⏱️", "Changeover done in record time!", "Pertukaran siap dalam masa rekod!", 3),
    ev("mf-nobreak", "⚙️", "Zero breakdowns this week!", "Sifar kerosakan minggu ini!", 2),
    ev("mf-target", "🎯", "Production target achieved!", "Sasaran pengeluaran tercapai!", 3),
    ev("mf-pm", "🔧", "Preventive maintenance on schedule!", "Penyelenggaraan pencegahan ikut jadual!", 1),
    ev("mf-safe", "🦺", "1,000 days without an accident!", "1,000 hari tanpa kemalangan!", 4),
    ev("mf-early", "🚛", "Raw materials arrived early!", "Bahan mentah tiba awal!", 2),
    ev("mf-oee", "📈", "OEE above 85%!", "OEE melebihi 85%!", 2),
    ev("mf-jam", "🧱", "Conveyor jam!", "Penghantar tersekat!", -2),
    ev("mf-power", "🔌", "Power trip on the line!", "Bekalan elektrik terputus di talian!", -3),
    ev("mf-short", "📉", "Raw material shortage!", "Kekurangan bahan mentah!", -3),
    ev("mf-leak", "💧", "Leaking bottles found!", "Botol bocor ditemui!", -2),
    ev("mf-cap", "🧴", "Loose caps on the line!", "Penutup longgar di talian!", -1),
    ev("mf-forklift", "🚧", "Forklift blocking the aisle!", "Forklif menghalang laluan!", -2),
    ev("mf-underfill", "⚖️", "Underfilled bottles!", "Botol kurang isian!", -3),
    ev("mf-code", "🖨️", "Wrong batch code printed!", "Kod kelompok salah dicetak!", -3),
  ],
  world: [
    ev("w-upgrade", "✈️", "Free flight upgrade!", "Naik taraf penerbangan percuma!", 3),
    ev("w-visa", "🛂", "Visa approved in one day!", "Visa diluluskan dalam sehari!", 2),
    ev("w-shortcut", "🗺️", "Found a shortcut on the map!", "Jumpa jalan pintas pada peta!", 4),
    ev("w-train", "🚄", "Caught the fast train!", "Sempat naik kereta api laju!", 2),
    ev("w-bag", "🧳", "Your bag comes out first!", "Beg anda keluar dahulu!", 1),
    ev("w-weather", "🌤️", "Perfect weather for travel!", "Cuaca sempurna untuk melancong!", 2),
    ev("w-breakfast", "🥐", "Free hotel breakfast!", "Sarapan hotel percuma!", 1),
    ev("w-holiday", "🏝️", "Won a free holiday!", "Menang percutian percuma!", 4),
    ev("w-passport", "📕", "Passport expired!", "Pasport tamat tempoh!", -3),
    ev("w-luggage", "💼", "Lost luggage!", "Bagasi hilang!", -2),
    ev("w-missed", "⏰", "Missed the flight!", "Terlepas penerbangan!", -4),
    ev("w-storm", "⛈️", "Flight delayed by a storm!", "Penerbangan ditunda kerana ribut!", -2),
    ev("w-wrongturn", "↩️", "Took the wrong turn!", "Tersalah simpang!", -2),
    ev("w-rate", "💱", "Bad exchange rate!", "Kadar tukaran wang teruk!", -1),
    ev("w-plug", "🔌", "Wrong plug adapter!", "Palam penyesuai salah!", -1),
    ev("w-jetlag", "🥱", "Bad jet lag!", "Letih akibat jet lag!", -3),
  ],
  logo: [
    ev("l-viral", "📈", "Your brand goes viral!", "Jenama anda tular!", 3),
    ev("l-award", "🏆", "Logo wins a design award!", "Logo menang anugerah reka bentuk!", 4),
    ev("l-likes", "👍", "One million likes!", "Sejuta tanda suka!", 2),
    ev("l-sponsor", "🤝", "New sponsor signed!", "Penaja baharu dimeterai!", 2),
    ev("l-newlogo", "🎨", "Fresh new logo launched!", "Logo baharu dilancarkan!", 1),
    ev("l-primetime", "📺", "Ad shown on prime-time TV!", "Iklan disiarkan pada waktu perdana!", 2),
    ev("l-soldout", "🛍️", "Product sold out!", "Produk habis dijual!", 3),
    ev("l-reviews", "⭐", "Five-star reviews!", "Ulasan lima bintang!", 2),
    ev("l-fake", "🚫", "Fake product found!", "Produk tiruan ditemui!", -3),
    ev("l-upside", "🙃", "Logo printed upside down!", "Logo dicetak terbalik!", -2),
    ev("l-colour", "🖍️", "Wrong brand colour!", "Warna jenama salah!", -1),
    ev("l-badreview", "📉", "Bad online review!", "Ulasan dalam talian yang buruk!", -2),
    ev("l-dispute", "⚖️", "Trademark dispute!", "Pertikaian tanda dagangan!", -4),
    ev("l-typo", "😬", "Typo on the billboard!", "Salah ejaan pada papan iklan!", -2),
    ev("l-recall", "📦", "Packaging recall!", "Penarikan balik pembungkusan!", -3),
    ev("l-flop", "🔇", "Ad campaign flops!", "Kempen iklan gagal!", -1),
  ],
  malaysia: [
    ev("m-tehtarik", "☕", "Teh tarik break!", "Rehat teh tarik!", 2),
    ev("m-nasilemak", "🍛", "Nasi lemak for breakfast!", "Sarapan nasi lemak!", 1),
    ev("m-lrt", "🚝", "Caught the LRT on time!", "Sempat naik LRT!", 2),
    ev("m-holiday", "🎉", "Public holiday tomorrow!", "Esok cuti umum!", 3),
    ev("m-raya", "🌙", "Balik kampung for Raya!", "Balik kampung beraya!", 4),
    ev("m-badminton", "🏸", "Malaysia wins at badminton!", "Malaysia menang badminton!", 3),
    ev("m-highway", "🛣️", "Clear highway, no jam!", "Lebuh raya lancar, tiada kesesakan!", 2),
    ev("m-pasarmalam", "🍢", "Pasar malam treat!", "Belanja pasar malam!", 2),
    ev("m-jam", "🚗", "Jam on the Federal Highway!", "Kesesakan di Lebuhraya Persekutuan!", -3),
    ev("m-rain", "🌧️", "Sudden monsoon rain!", "Hujan monsun tiba-tiba!", -2),
    ev("m-pothole", "🕳️", "Pothole on the road!", "Lubang di jalan raya!", -2),
    ev("m-mosquito", "🦟", "Mosquito bites!", "Digigit nyamuk!", -1),
    ev("m-toll", "💳", "Toll card balance empty!", "Baki kad tol habis!", -2),
    ev("m-haze", "🌫️", "Haze season!", "Musim jerebu!", -3),
    ev("m-blackout", "🔦", "Blackout at home!", "Bekalan elektrik terputus!", -1),
    ev("m-cows", "🐄", "Cows crossing the road!", "Lembu melintas jalan!", -4),
  ],
  general: [
    ev("g-lucky", "🍀", "Lucky guess!", "Teka bertuah!", 2),
    ev("g-idea", "💡", "Bright idea!", "Idea bernas!", 3),
    ev("g-book", "📚", "Read a great book!", "Baca buku yang hebat!", 1),
    ev("g-brain", "🧠", "Brain power boost!", "Kuasa minda meningkat!", 2),
    ev("g-bullseye", "🎯", "Bullseye!", "Tepat ke sasaran!", 3),
    ev("g-charged", "🔋", "Fully charged!", "Tenaga penuh!", 2),
    ev("g-champion", "🏅", "Quiz champion!", "Juara kuiz!", 4),
    ev("g-morning", "☀️", "Great start to the day!", "Permulaan hari yang hebat!", 2),
    ev("g-wifi", "📶", "Wi-Fi down!", "Wi-Fi terputus!", -2),
    ev("g-battery", "🪫", "Phone battery dead!", "Bateri telefon habis!", -2),
    ev("g-overslept", "😴", "Overslept!", "Terlajak tidur!", -3),
    ev("g-sock", "🧦", "Lost a sock!", "Stokin hilang sebelah!", -1),
    ev("g-freeze", "🥶", "Brain freeze!", "Otak beku!", -2),
    ev("g-banana", "🍌", "Slipped on a banana peel!", "Tergelincir kulit pisang!", -3),
    ev("g-alarm", "⏰", "Alarm didn't ring!", "Jam loceng tidak berbunyi!", -4),
    ev("g-coffee", "☕", "Spilled the coffee!", "Tertumpah kopi!", -1),
  ],
};

/** Every event of every set (to look one up by id). */
export const EVENTS: SpecialEvent[] = Object.values(EVENT_SETS).flat();

/** Event boxes per game. */
export const SPECIAL_COUNT = 16;

/** The 16 events for a game: the chosen set's own, or for Mix 8 good and 8 bad from all sets except Quality. */
export function eventsFor(choice: QChoice | null | undefined, rand = Math.random): SpecialEvent[] {
  if (choice && choice !== "mix") return EVENT_SETS[choice] ?? EVENT_SETS.quality;
  if (!choice) return EVENT_SETS.quality;
  const others = (["world", "logo", "malaysia", "general"] as QSet[]).flatMap((k) => EVENT_SETS[k]);
  const pick = (list: SpecialEvent[]) => [...list].sort(() => rand() - 0.5).slice(0, SPECIAL_COUNT / 2);
  return [...pick(others.filter((e) => e.move > 0)), ...pick(others.filter((e) => e.move < 0))];
}

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

/** Place the game's 16 event boxes at random, at least 3 boxes apart, for a new game. */
export function placeSpecials(choice?: QChoice | null, rand = Math.random): SpecialBox[] {
  const SET = eventsFor(choice, rand).map((e) => e.id);
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
