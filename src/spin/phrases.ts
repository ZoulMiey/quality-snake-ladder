// Quality Spin phrases (owner, Nov 2026: English only, 50 phrases). Each has a hint in English and Malay,
// shown above the phrase boxes. Letters and spaces only; no word longer than 12 letters, so every phrase
// fits the board in at most 3 rows (checked in scripts/spin.test.ts).
export type Phrase = { p: string; en: string; ms: string };

export const PHRASES: Phrase[] = [
  // Problem solving
  { p: "ROOT CAUSE ANALYSIS", en: "Problem solving", ms: "Penyelesaian masalah" },
  { p: "FIVE WHYS", en: "Ask why again and again", ms: "Tanya kenapa berulang kali" },
  { p: "FISHBONE DIAGRAM", en: "Ishikawa tool", ms: "Alat Ishikawa" },
  { p: "PARETO CHART", en: "The 80/20 rule", ms: "Peraturan 80/20" },
  { p: "PLAN DO CHECK ACT", en: "The PDCA cycle", ms: "Kitaran PDCA" },
  { p: "CORRECTIVE ACTION", en: "Fix the problem", ms: "Betulkan masalah" },
  { p: "PREVENTIVE ACTION", en: "Stop it before it happens", ms: "Cegah sebelum berlaku" },
  { p: "PROBLEM STATEMENT", en: "Where problem solving starts", ms: "Permulaan penyelesaian masalah" },
  // Quality goals and customers
  { p: "ZERO DEFECT", en: "Our goal", ms: "Matlamat kita" },
  { p: "RIGHT FIRST TIME", en: "No rework needed", ms: "Tiada kerja semula" },
  { p: "QUALITY IS A HABIT", en: "A daily attitude", ms: "Sikap harian" },
  { p: "CUSTOMER FIRST", en: "Who we work for", ms: "Untuk siapa kita bekerja" },
  { p: "CUSTOMER SATISFACTION", en: "A happy customer", ms: "Pelanggan gembira" },
  { p: "VOICE OF THE CUSTOMER", en: "Listen to the customer", ms: "Dengar suara pelanggan" },
  { p: "POWERING PERFORMANCE", en: "Quality Month 2026 theme", ms: "Tema Bulan Kualiti 2026" },
  { p: "QUALITY MONTH", en: "This November", ms: "November ini" },
  // Kaizen and lean
  { p: "CONTINUOUS IMPROVEMENT", en: "Kaizen", ms: "Penambahbaikan berterusan" },
  { p: "KAIZEN MINDSET", en: "Always a little better", ms: "Sentiasa lebih baik" },
  { p: "LEAN PRODUCTION", en: "Less waste, more value", ms: "Kurang pembaziran" },
  { p: "WASTE ELIMINATION", en: "Remove what adds no value", ms: "Buang yang tiada nilai" },
  { p: "VALUE STREAM MAP", en: "Map of the whole process", ms: "Peta seluruh proses" },
  { p: "GEMBA WALK", en: "Go and see where work happens", ms: "Pergi lihat tempat kerja" },
  { p: "STANDARD WORK", en: "The one best way", ms: "Cara kerja terbaik" },
  { p: "POKA YOKE", en: "Mistake proofing", ms: "Kalis kesilapan" },
  { p: "VISUAL MANAGEMENT", en: "See the status at a glance", ms: "Pengurusan visual" },
  { p: "JUST IN TIME", en: "Make what is needed, when needed", ms: "Tepat pada masanya" },
  // 5S
  { p: "SORT SET SHINE", en: "The first three of 5S", ms: "Tiga S pertama" },
  { p: "STANDARDISE AND SUSTAIN", en: "The last two of 5S", ms: "Dua S terakhir" },
  { p: "A PLACE FOR EVERYTHING", en: "Set in order", ms: "Susun atur" },
  { p: "CLEAN AND TIDY WORKPLACE", en: "5S result", ms: "Hasil 5S" },
  // Inspection and control
  { p: "QUALITY CONTROL", en: "Check the product", ms: "Kawalan kualiti" },
  { p: "QUALITY ASSURANCE", en: "Build quality into the system", ms: "Jaminan kualiti" },
  { p: "INCOMING INSPECTION", en: "Check materials on arrival", ms: "Pemeriksaan bahan masuk" },
  { p: "FINAL INSPECTION", en: "Last check before release", ms: "Pemeriksaan akhir" },
  { p: "STATISTICAL PROCESS CONTROL", en: "SPC", ms: "Kawalan proses statistik" },
  { p: "CONTROL CHART", en: "Watch the process over time", ms: "Carta kawalan" },
  { p: "SAMPLING PLAN", en: "How many to check", ms: "Pelan persampelan" },
  { p: "BATCH RECORD", en: "History of one batch", ms: "Rekod kelompok" },
  { p: "CALIBRATION RECORD", en: "Proof the gauge is accurate", ms: "Rekod kalibrasi" },
  // Systems and compliance
  { p: "GOOD HYGIENE PRACTICE", en: "Clean hands, clean product", ms: "Amalan kebersihan baik" },
  { p: "INTERNAL AUDIT", en: "We check ourselves", ms: "Audit dalaman" },
  { p: "CHANGE CONTROL", en: "Manage every change", ms: "Kawalan perubahan" },
  { p: "RISK ASSESSMENT", en: "What could go wrong", ms: "Penilaian risiko" },
  { p: "STANDARD OPERATING PROCEDURE", en: "SOP", ms: "Prosedur operasi standard" },
  { p: "TRACEABILITY", en: "Track every batch", ms: "Kebolehkesanan" },
  { p: "NON CONFORMANCE", en: "Not meeting the requirement", ms: "Ketidakpatuhan" },
  { p: "CUSTOMER COMPLAINT", en: "Feedback we must act on", ms: "Aduan pelanggan" },
  { p: "PRODUCT RECALL", en: "What we never want", ms: "Penarikan balik produk" },
  { p: "SHELF LIFE", en: "How long the product lasts", ms: "Jangka hayat produk" },
  // Teamwork
  { p: "TEAMWORK MAKES THE DREAM WORK", en: "Together we win", ms: "Bersama kita berjaya" },
];
