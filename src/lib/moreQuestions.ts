// Question sets added in November 2026: 17 more Quality questions, plus World, Logo, Malaysia and General Knowledge.
// The right answer is listed first (ans 0); the game shuffles the answers for every player.
import type { Question } from "./types.ts";

export const MORE_QUESTIONS: Question[] = [
 {
  "id": "qx01",
  "cat": "Lean",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "What does 'poka-yoke' mean?",
   "ms": "Apakah maksud 'poka-yoke'?"
  },
  "opts": [
   {
    "en": "Mistake-proofing",
    "ms": "Kalis kesilapan"
   },
   {
    "en": "Quick changeover",
    "ms": "Pertukaran pantas"
   },
   {
    "en": "Daily cleaning",
    "ms": "Pembersihan harian"
   },
   {
    "en": "Final inspection",
    "ms": "Pemeriksaan akhir"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx02",
  "cat": "Lean",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "What does 'gemba' mean?",
   "ms": "Apakah maksud 'gemba'?"
  },
  "opts": [
   {
    "en": "The real place where the work is done",
    "ms": "Tempat sebenar kerja dilakukan"
   },
   {
    "en": "The manager's office",
    "ms": "Pejabat pengurus"
   },
   {
    "en": "The warehouse",
    "ms": "Gudang"
   },
   {
    "en": "The meeting room",
    "ms": "Bilik mesyuarat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx03",
  "cat": "Lean",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "An 'andon' is…",
   "ms": "'Andon' ialah…"
  },
  "opts": [
   {
    "en": "A signal (often a light) to call for help when there is a problem",
    "ms": "Isyarat (biasanya lampu) untuk meminta bantuan apabila ada masalah"
   },
   {
    "en": "A type of spare part",
    "ms": "Sejenis alat ganti"
   },
   {
    "en": "A monthly report",
    "ms": "Laporan bulanan"
   },
   {
    "en": "A safety shoe",
    "ms": "Kasut keselamatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx04",
  "cat": "Lean",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "A 'kanban' card is used to…",
   "ms": "Kad 'kanban' digunakan untuk…"
  },
  "opts": [
   {
    "en": "Signal when to make or move more material",
    "ms": "Memberi isyarat bila perlu membuat atau memindahkan bahan"
   },
   {
    "en": "Record staff attendance",
    "ms": "Merekod kehadiran pekerja"
   },
   {
    "en": "Label waste for disposal",
    "ms": "Melabel sisa untuk dibuang"
   },
   {
    "en": "Approve a deviation",
    "ms": "Meluluskan sisihan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx05",
  "cat": "Tools",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "What does FMEA stand for?",
   "ms": "Apakah maksud FMEA?"
  },
  "opts": [
   {
    "en": "Failure Mode and Effects Analysis",
    "ms": "Analisis Mod Kegagalan dan Kesan"
   },
   {
    "en": "Final Manufacturing Error Audit",
    "ms": "Audit Ralat Pembuatan Akhir"
   },
   {
    "en": "Factory Material Evaluation Area",
    "ms": "Kawasan Penilaian Bahan Kilang"
   },
   {
    "en": "First Machine Efficiency Assessment",
    "ms": "Penilaian Kecekapan Mesin Pertama"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx06",
  "cat": "Tools",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "In FMEA, the Risk Priority Number (RPN) is Severity × Occurrence × …",
   "ms": "Dalam FMEA, Nombor Keutamaan Risiko (RPN) ialah Keterukan × Kekerapan × …"
  },
  "opts": [
   {
    "en": "Detection",
    "ms": "Pengesanan"
   },
   {
    "en": "Cost",
    "ms": "Kos"
   },
   {
    "en": "Time",
    "ms": "Masa"
   },
   {
    "en": "Quantity",
    "ms": "Kuantiti"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx07",
  "cat": "Tools",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "Cp and Cpk are used to measure…",
   "ms": "Cp dan Cpk digunakan untuk mengukur…"
  },
  "opts": [
   {
    "en": "Process capability",
    "ms": "Keupayaan proses"
   },
   {
    "en": "Staff performance",
    "ms": "Prestasi pekerja"
   },
   {
    "en": "Customer satisfaction",
    "ms": "Kepuasan pelanggan"
   },
   {
    "en": "Machine speed",
    "ms": "Kelajuan mesin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx08",
  "cat": "Tools",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "A point outside the control limits on a control chart usually means…",
   "ms": "Satu titik di luar had kawalan pada carta kawalan biasanya bermaksud…"
  },
  "opts": [
   {
    "en": "Something unusual happened; check the process",
    "ms": "Sesuatu yang luar biasa berlaku; semak proses"
   },
   {
    "en": "The process is perfect",
    "ms": "Proses itu sempurna"
   },
   {
    "en": "The chart is wrong",
    "ms": "Carta itu salah"
   },
   {
    "en": "Nothing; ignore it",
    "ms": "Tiada apa-apa; abaikan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx09",
  "cat": "Tools",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "Six Sigma quality means about how many defects per million opportunities?",
   "ms": "Kualiti Six Sigma bermaksud kira-kira berapa kecacatan bagi setiap sejuta peluang?"
  },
  "opts": [
   {
    "en": "3.4",
    "ms": "3.4"
   },
   {
    "en": "34",
    "ms": "34"
   },
   {
    "en": "340",
    "ms": "340"
   },
   {
    "en": "6",
    "ms": "6"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx10",
  "cat": "Basics",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "What does TQM stand for?",
   "ms": "Apakah maksud TQM?"
  },
  "opts": [
   {
    "en": "Total Quality Management",
    "ms": "Pengurusan Kualiti Menyeluruh"
   },
   {
    "en": "Total Quantity Measurement",
    "ms": "Pengukuran Kuantiti Menyeluruh"
   },
   {
    "en": "Technical Quality Manual",
    "ms": "Manual Kualiti Teknikal"
   },
   {
    "en": "Team Quality Meeting",
    "ms": "Mesyuarat Kualiti Pasukan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx11",
  "cat": "Basics",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "Who is famous for the '14 Points' for management and the PDCA cycle?",
   "ms": "Siapakah yang terkenal dengan '14 Perkara' pengurusan dan kitaran PDCA?"
  },
  "opts": [
   {
    "en": "W. Edwards Deming",
    "ms": "W. Edwards Deming"
   },
   {
    "en": "Henry Ford",
    "ms": "Henry Ford"
   },
   {
    "en": "Thomas Edison",
    "ms": "Thomas Edison"
   },
   {
    "en": "Peter Drucker",
    "ms": "Peter Drucker"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx12",
  "cat": "Basics",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "The Juran Trilogy is quality planning, quality control and quality…",
   "ms": "Trilogi Juran ialah perancangan kualiti, kawalan kualiti dan … kualiti"
  },
  "opts": [
   {
    "en": "Improvement",
    "ms": "Penambahbaikan"
   },
   {
    "en": "Inspection",
    "ms": "Pemeriksaan"
   },
   {
    "en": "Marketing",
    "ms": "Pemasaran"
   },
   {
    "en": "Reporting",
    "ms": "Pelaporan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx13",
  "cat": "Basics",
  "set": "quality",
  "type": "tf",
  "q": {
   "en": "'Right First Time' means doing the job correctly the first time, without rework.",
   "ms": "'Right First Time' bermaksud melakukan kerja dengan betul pada kali pertama, tanpa kerja semula."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx14",
  "cat": "Basics",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "Traceability means…",
   "ms": "Kebolehkesanan bermaksud…"
  },
  "opts": [
   {
    "en": "Being able to follow a product's history, materials and batches",
    "ms": "Boleh menjejak sejarah, bahan dan kelompok sesuatu produk"
   },
   {
    "en": "Tracking staff by GPS",
    "ms": "Menjejak pekerja melalui GPS"
   },
   {
    "en": "Drawing lines on a chart",
    "ms": "Melukis garisan pada carta"
   },
   {
    "en": "Counting finished goods",
    "ms": "Mengira barang siap"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx15",
  "cat": "Basics",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "If measurements are very close to each other, they are…",
   "ms": "Jika ukuran sangat hampir antara satu sama lain, ia adalah…"
  },
  "opts": [
   {
    "en": "Precise",
    "ms": "Persis"
   },
   {
    "en": "Always accurate",
    "ms": "Sentiasa tepat"
   },
   {
    "en": "Wrong",
    "ms": "Salah"
   },
   {
    "en": "Random",
    "ms": "Rawak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx16",
  "cat": "GMP",
  "set": "quality",
  "type": "tf",
  "q": {
   "en": "Any deviation from a procedure must be recorded and investigated.",
   "ms": "Sebarang sisihan daripada prosedur mesti direkodkan dan disiasat."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qx17",
  "cat": "GMP",
  "set": "quality",
  "type": "mc",
  "q": {
   "en": "A batch record is used to…",
   "ms": "Rekod kelompok digunakan untuk…"
  },
  "opts": [
   {
    "en": "Show how each batch was made and checked",
    "ms": "Menunjukkan bagaimana setiap kelompok dibuat dan diperiksa"
   },
   {
    "en": "List staff holidays",
    "ms": "Menyenaraikan cuti pekerja"
   },
   {
    "en": "Plan next year's budget",
    "ms": "Merancang bajet tahun depan"
   },
   {
    "en": "Order office supplies",
    "ms": "Memesan bekalan pejabat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w01",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇯🇵",
   "ms": "Bendera negara manakah ini? 🇯🇵"
  },
  "opts": [
   {
    "en": "Japan",
    "ms": "Jepun"
   },
   {
    "en": "South Korea",
    "ms": "Korea Selatan"
   },
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "Bangladesh",
    "ms": "Bangladesh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w02",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇧🇷",
   "ms": "Bendera negara manakah ini? 🇧🇷"
  },
  "opts": [
   {
    "en": "Brazil",
    "ms": "Brazil"
   },
   {
    "en": "Portugal",
    "ms": "Portugal"
   },
   {
    "en": "Argentina",
    "ms": "Argentina"
   },
   {
    "en": "Colombia",
    "ms": "Colombia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w03",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇨🇦",
   "ms": "Bendera negara manakah ini? 🇨🇦"
  },
  "opts": [
   {
    "en": "Canada",
    "ms": "Kanada"
   },
   {
    "en": "United States",
    "ms": "Amerika Syarikat"
   },
   {
    "en": "Switzerland",
    "ms": "Switzerland"
   },
   {
    "en": "Austria",
    "ms": "Austria"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w04",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇩🇪",
   "ms": "Bendera negara manakah ini? 🇩🇪"
  },
  "opts": [
   {
    "en": "Germany",
    "ms": "Jerman"
   },
   {
    "en": "Belgium",
    "ms": "Belgium"
   },
   {
    "en": "Spain",
    "ms": "Sepanyol"
   },
   {
    "en": "Netherlands",
    "ms": "Belanda"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w05",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇮🇹",
   "ms": "Bendera negara manakah ini? 🇮🇹"
  },
  "opts": [
   {
    "en": "Italy",
    "ms": "Itali"
   },
   {
    "en": "Ireland",
    "ms": "Ireland"
   },
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "France",
    "ms": "Perancis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w06",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇰🇷",
   "ms": "Bendera negara manakah ini? 🇰🇷"
  },
  "opts": [
   {
    "en": "South Korea",
    "ms": "Korea Selatan"
   },
   {
    "en": "Japan",
    "ms": "Jepun"
   },
   {
    "en": "Taiwan",
    "ms": "Taiwan"
   },
   {
    "en": "Mongolia",
    "ms": "Mongolia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w07",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇮🇳",
   "ms": "Bendera negara manakah ini? 🇮🇳"
  },
  "opts": [
   {
    "en": "India",
    "ms": "India"
   },
   {
    "en": "Niger",
    "ms": "Niger"
   },
   {
    "en": "Ireland",
    "ms": "Ireland"
   },
   {
    "en": "Sri Lanka",
    "ms": "Sri Lanka"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w08",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇦🇺",
   "ms": "Bendera negara manakah ini? 🇦🇺"
  },
  "opts": [
   {
    "en": "Australia",
    "ms": "Australia"
   },
   {
    "en": "New Zealand",
    "ms": "New Zealand"
   },
   {
    "en": "United Kingdom",
    "ms": "United Kingdom"
   },
   {
    "en": "Fiji",
    "ms": "Fiji"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w09",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇹🇭",
   "ms": "Bendera negara manakah ini? 🇹🇭"
  },
  "opts": [
   {
    "en": "Thailand",
    "ms": "Thailand"
   },
   {
    "en": "Costa Rica",
    "ms": "Costa Rica"
   },
   {
    "en": "Cambodia",
    "ms": "Kemboja"
   },
   {
    "en": "Laos",
    "ms": "Laos"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w10",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇮🇩",
   "ms": "Bendera negara manakah ini? 🇮🇩"
  },
  "opts": [
   {
    "en": "Indonesia",
    "ms": "Indonesia"
   },
   {
    "en": "Poland",
    "ms": "Poland"
   },
   {
    "en": "Austria",
    "ms": "Austria"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w11",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇸🇬",
   "ms": "Bendera negara manakah ini? 🇸🇬"
  },
  "opts": [
   {
    "en": "Singapore",
    "ms": "Singapura"
   },
   {
    "en": "Indonesia",
    "ms": "Indonesia"
   },
   {
    "en": "Turkey",
    "ms": "Turkiye"
   },
   {
    "en": "Malaysia",
    "ms": "Malaysia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w12",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇵🇭",
   "ms": "Bendera negara manakah ini? 🇵🇭"
  },
  "opts": [
   {
    "en": "Philippines",
    "ms": "Filipina"
   },
   {
    "en": "Czechia",
    "ms": "Czechia"
   },
   {
    "en": "Cuba",
    "ms": "Cuba"
   },
   {
    "en": "Thailand",
    "ms": "Thailand"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w13",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇻🇳",
   "ms": "Bendera negara manakah ini? 🇻🇳"
  },
  "opts": [
   {
    "en": "Vietnam",
    "ms": "Vietnam"
   },
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "Turkey",
    "ms": "Turkiye"
   },
   {
    "en": "Myanmar",
    "ms": "Myanmar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w14",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇨🇳",
   "ms": "Bendera negara manakah ini? 🇨🇳"
  },
  "opts": [
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "Vietnam",
    "ms": "Vietnam"
   },
   {
    "en": "Hong Kong",
    "ms": "Hong Kong"
   },
   {
    "en": "North Korea",
    "ms": "Korea Utara"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w15",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇬🇧",
   "ms": "Bendera negara manakah ini? 🇬🇧"
  },
  "opts": [
   {
    "en": "United Kingdom",
    "ms": "United Kingdom"
   },
   {
    "en": "Australia",
    "ms": "Australia"
   },
   {
    "en": "United States",
    "ms": "Amerika Syarikat"
   },
   {
    "en": "Norway",
    "ms": "Norway"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w16",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇫🇷",
   "ms": "Bendera negara manakah ini? 🇫🇷"
  },
  "opts": [
   {
    "en": "France",
    "ms": "Perancis"
   },
   {
    "en": "Netherlands",
    "ms": "Belanda"
   },
   {
    "en": "Russia",
    "ms": "Rusia"
   },
   {
    "en": "Italy",
    "ms": "Itali"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w17",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇪🇸",
   "ms": "Bendera negara manakah ini? 🇪🇸"
  },
  "opts": [
   {
    "en": "Spain",
    "ms": "Sepanyol"
   },
   {
    "en": "Portugal",
    "ms": "Portugal"
   },
   {
    "en": "Colombia",
    "ms": "Colombia"
   },
   {
    "en": "Germany",
    "ms": "Jerman"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w18",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇲🇽",
   "ms": "Bendera negara manakah ini? 🇲🇽"
  },
  "opts": [
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "Italy",
    "ms": "Itali"
   },
   {
    "en": "Ireland",
    "ms": "Ireland"
   },
   {
    "en": "Hungary",
    "ms": "Hungary"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w19",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇦🇷",
   "ms": "Bendera negara manakah ini? 🇦🇷"
  },
  "opts": [
   {
    "en": "Argentina",
    "ms": "Argentina"
   },
   {
    "en": "Uruguay",
    "ms": "Uruguay"
   },
   {
    "en": "Greece",
    "ms": "Greece"
   },
   {
    "en": "Finland",
    "ms": "Finland"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w20",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇹🇷",
   "ms": "Bendera negara manakah ini? 🇹🇷"
  },
  "opts": [
   {
    "en": "Turkey",
    "ms": "Turkiye"
   },
   {
    "en": "Tunisia",
    "ms": "Tunisia"
   },
   {
    "en": "Pakistan",
    "ms": "Pakistan"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w21",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇸🇦",
   "ms": "Bendera negara manakah ini? 🇸🇦"
  },
  "opts": [
   {
    "en": "Saudi Arabia",
    "ms": "Arab Saudi"
   },
   {
    "en": "Pakistan",
    "ms": "Pakistan"
   },
   {
    "en": "Iran",
    "ms": "Iran"
   },
   {
    "en": "United Arab Emirates",
    "ms": "Emiriah Arab Bersatu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w22",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇪🇬",
   "ms": "Bendera negara manakah ini? 🇪🇬"
  },
  "opts": [
   {
    "en": "Egypt",
    "ms": "Mesir"
   },
   {
    "en": "Iraq",
    "ms": "Iraq"
   },
   {
    "en": "Yemen",
    "ms": "Yaman"
   },
   {
    "en": "Syria",
    "ms": "Syria"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w23",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇿🇦",
   "ms": "Bendera negara manakah ini? 🇿🇦"
  },
  "opts": [
   {
    "en": "South Africa",
    "ms": "Afrika Selatan"
   },
   {
    "en": "Kenya",
    "ms": "Kenya"
   },
   {
    "en": "Jamaica",
    "ms": "Jamaica"
   },
   {
    "en": "Nigeria",
    "ms": "Nigeria"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w24",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇨🇭",
   "ms": "Bendera negara manakah ini? 🇨🇭"
  },
  "opts": [
   {
    "en": "Switzerland",
    "ms": "Switzerland"
   },
   {
    "en": "Denmark",
    "ms": "Denmark"
   },
   {
    "en": "Austria",
    "ms": "Austria"
   },
   {
    "en": "Canada",
    "ms": "Kanada"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w25",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇸🇪",
   "ms": "Bendera negara manakah ini? 🇸🇪"
  },
  "opts": [
   {
    "en": "Sweden",
    "ms": "Sweden"
   },
   {
    "en": "Finland",
    "ms": "Finland"
   },
   {
    "en": "Norway",
    "ms": "Norway"
   },
   {
    "en": "Ukraine",
    "ms": "Ukraine"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w26",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇬🇷",
   "ms": "Bendera negara manakah ini? 🇬🇷"
  },
  "opts": [
   {
    "en": "Greece",
    "ms": "Greece"
   },
   {
    "en": "Argentina",
    "ms": "Argentina"
   },
   {
    "en": "Finland",
    "ms": "Finland"
   },
   {
    "en": "Israel",
    "ms": "Israel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w27",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇵🇹",
   "ms": "Bendera negara manakah ini? 🇵🇹"
  },
  "opts": [
   {
    "en": "Portugal",
    "ms": "Portugal"
   },
   {
    "en": "Spain",
    "ms": "Sepanyol"
   },
   {
    "en": "Brazil",
    "ms": "Brazil"
   },
   {
    "en": "Morocco",
    "ms": "Maghribi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w28",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇳🇿",
   "ms": "Bendera negara manakah ini? 🇳🇿"
  },
  "opts": [
   {
    "en": "New Zealand",
    "ms": "New Zealand"
   },
   {
    "en": "Australia",
    "ms": "Australia"
   },
   {
    "en": "Fiji",
    "ms": "Fiji"
   },
   {
    "en": "United Kingdom",
    "ms": "United Kingdom"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w29",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇵🇰",
   "ms": "Bendera negara manakah ini? 🇵🇰"
  },
  "opts": [
   {
    "en": "Pakistan",
    "ms": "Pakistan"
   },
   {
    "en": "Turkey",
    "ms": "Turkiye"
   },
   {
    "en": "Algeria",
    "ms": "Algeria"
   },
   {
    "en": "Saudi Arabia",
    "ms": "Arab Saudi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w30",
  "cat": "Flags",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇧🇳",
   "ms": "Bendera negara manakah ini? 🇧🇳"
  },
  "opts": [
   {
    "en": "Brunei",
    "ms": "Brunei"
   },
   {
    "en": "Malaysia",
    "ms": "Malaysia"
   },
   {
    "en": "Indonesia",
    "ms": "Indonesia"
   },
   {
    "en": "Philippines",
    "ms": "Filipina"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w31",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Japan?",
   "ms": "Apakah ibu negara Jepun?"
  },
  "opts": [
   {
    "en": "Tokyo",
    "ms": "Tokyo"
   },
   {
    "en": "Osaka",
    "ms": "Osaka"
   },
   {
    "en": "Kyoto",
    "ms": "Kyoto"
   },
   {
    "en": "Hiroshima",
    "ms": "Hiroshima"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w32",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Australia?",
   "ms": "Apakah ibu negara Australia?"
  },
  "opts": [
   {
    "en": "Canberra",
    "ms": "Canberra"
   },
   {
    "en": "Sydney",
    "ms": "Sydney"
   },
   {
    "en": "Melbourne",
    "ms": "Melbourne"
   },
   {
    "en": "Perth",
    "ms": "Perth"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w33",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Canada?",
   "ms": "Apakah ibu negara Kanada?"
  },
  "opts": [
   {
    "en": "Ottawa",
    "ms": "Ottawa"
   },
   {
    "en": "Toronto",
    "ms": "Toronto"
   },
   {
    "en": "Vancouver",
    "ms": "Vancouver"
   },
   {
    "en": "Montreal",
    "ms": "Montreal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w34",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Thailand?",
   "ms": "Apakah ibu negara Thailand?"
  },
  "opts": [
   {
    "en": "Bangkok",
    "ms": "Bangkok"
   },
   {
    "en": "Phuket",
    "ms": "Phuket"
   },
   {
    "en": "Chiang Mai",
    "ms": "Chiang Mai"
   },
   {
    "en": "Pattaya",
    "ms": "Pattaya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w35",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of the Philippines?",
   "ms": "Apakah ibu negara Filipina?"
  },
  "opts": [
   {
    "en": "Manila",
    "ms": "Manila"
   },
   {
    "en": "Cebu",
    "ms": "Cebu"
   },
   {
    "en": "Davao",
    "ms": "Davao"
   },
   {
    "en": "Quezon City",
    "ms": "Quezon City"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w36",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Vietnam?",
   "ms": "Apakah ibu negara Vietnam?"
  },
  "opts": [
   {
    "en": "Hanoi",
    "ms": "Hanoi"
   },
   {
    "en": "Ho Chi Minh City",
    "ms": "Bandar Ho Chi Minh"
   },
   {
    "en": "Da Nang",
    "ms": "Da Nang"
   },
   {
    "en": "Hue",
    "ms": "Hue"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w37",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of South Korea?",
   "ms": "Apakah ibu negara Korea Selatan?"
  },
  "opts": [
   {
    "en": "Seoul",
    "ms": "Seoul"
   },
   {
    "en": "Busan",
    "ms": "Busan"
   },
   {
    "en": "Incheon",
    "ms": "Incheon"
   },
   {
    "en": "Pyongyang",
    "ms": "Pyongyang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w38",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Turkey?",
   "ms": "Apakah ibu negara Turkiye?"
  },
  "opts": [
   {
    "en": "Ankara",
    "ms": "Ankara"
   },
   {
    "en": "Istanbul",
    "ms": "Istanbul"
   },
   {
    "en": "Izmir",
    "ms": "Izmir"
   },
   {
    "en": "Antalya",
    "ms": "Antalya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w39",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Brazil?",
   "ms": "Apakah ibu negara Brazil?"
  },
  "opts": [
   {
    "en": "Brasília",
    "ms": "Brasília"
   },
   {
    "en": "Rio de Janeiro",
    "ms": "Rio de Janeiro"
   },
   {
    "en": "São Paulo",
    "ms": "São Paulo"
   },
   {
    "en": "Salvador",
    "ms": "Salvador"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w40",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Egypt?",
   "ms": "Apakah ibu negara Mesir?"
  },
  "opts": [
   {
    "en": "Cairo",
    "ms": "Kaherah"
   },
   {
    "en": "Alexandria",
    "ms": "Iskandariah"
   },
   {
    "en": "Luxor",
    "ms": "Luxor"
   },
   {
    "en": "Giza",
    "ms": "Giza"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w41",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Germany?",
   "ms": "Apakah ibu negara Jerman?"
  },
  "opts": [
   {
    "en": "Berlin",
    "ms": "Berlin"
   },
   {
    "en": "Munich",
    "ms": "Munich"
   },
   {
    "en": "Frankfurt",
    "ms": "Frankfurt"
   },
   {
    "en": "Hamburg",
    "ms": "Hamburg"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w42",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Spain?",
   "ms": "Apakah ibu negara Sepanyol?"
  },
  "opts": [
   {
    "en": "Madrid",
    "ms": "Madrid"
   },
   {
    "en": "Barcelona",
    "ms": "Barcelona"
   },
   {
    "en": "Seville",
    "ms": "Seville"
   },
   {
    "en": "Valencia",
    "ms": "Valencia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w43",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Italy?",
   "ms": "Apakah ibu negara Itali?"
  },
  "opts": [
   {
    "en": "Rome",
    "ms": "Rom"
   },
   {
    "en": "Milan",
    "ms": "Milan"
   },
   {
    "en": "Venice",
    "ms": "Venice"
   },
   {
    "en": "Naples",
    "ms": "Naples"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w44",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of New Zealand?",
   "ms": "Apakah ibu negara New Zealand?"
  },
  "opts": [
   {
    "en": "Wellington",
    "ms": "Wellington"
   },
   {
    "en": "Auckland",
    "ms": "Auckland"
   },
   {
    "en": "Christchurch",
    "ms": "Christchurch"
   },
   {
    "en": "Queenstown",
    "ms": "Queenstown"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w45",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Switzerland?",
   "ms": "Apakah ibu negara Switzerland?"
  },
  "opts": [
   {
    "en": "Bern",
    "ms": "Bern"
   },
   {
    "en": "Zurich",
    "ms": "Zurich"
   },
   {
    "en": "Geneva",
    "ms": "Geneva"
   },
   {
    "en": "Basel",
    "ms": "Basel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w46",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Brunei?",
   "ms": "Apakah ibu negara Brunei?"
  },
  "opts": [
   {
    "en": "Bandar Seri Begawan",
    "ms": "Bandar Seri Begawan"
   },
   {
    "en": "Kuala Belait",
    "ms": "Kuala Belait"
   },
   {
    "en": "Tutong",
    "ms": "Tutong"
   },
   {
    "en": "Seria",
    "ms": "Seria"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w47",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Saudi Arabia?",
   "ms": "Apakah ibu negara Arab Saudi?"
  },
  "opts": [
   {
    "en": "Riyadh",
    "ms": "Riyadh"
   },
   {
    "en": "Jeddah",
    "ms": "Jeddah"
   },
   {
    "en": "Makkah",
    "ms": "Makkah"
   },
   {
    "en": "Madinah",
    "ms": "Madinah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w48",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of China?",
   "ms": "Apakah ibu negara China?"
  },
  "opts": [
   {
    "en": "Beijing",
    "ms": "Beijing"
   },
   {
    "en": "Shanghai",
    "ms": "Shanghai"
   },
   {
    "en": "Hong Kong",
    "ms": "Hong Kong"
   },
   {
    "en": "Guangzhou",
    "ms": "Guangzhou"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w49",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of India?",
   "ms": "Apakah ibu negara India?"
  },
  "opts": [
   {
    "en": "New Delhi",
    "ms": "New Delhi"
   },
   {
    "en": "Mumbai",
    "ms": "Mumbai"
   },
   {
    "en": "Kolkata",
    "ms": "Kolkata"
   },
   {
    "en": "Chennai",
    "ms": "Chennai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w50",
  "cat": "Capitals",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the capital city of the United States?",
   "ms": "Apakah ibu negara Amerika Syarikat?"
  },
  "opts": [
   {
    "en": "Washington, D.C.",
    "ms": "Washington, D.C."
   },
   {
    "en": "New York",
    "ms": "New York"
   },
   {
    "en": "Los Angeles",
    "ms": "Los Angeles"
   },
   {
    "en": "Chicago",
    "ms": "Chicago"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w51",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which city is the Eiffel Tower?",
   "ms": "Di bandar manakah terletaknya Menara Eiffel?"
  },
  "opts": [
   {
    "en": "Paris",
    "ms": "Paris"
   },
   {
    "en": "London",
    "ms": "London"
   },
   {
    "en": "Rome",
    "ms": "Rom"
   },
   {
    "en": "Berlin",
    "ms": "Berlin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w52",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which city is the Statue of Liberty?",
   "ms": "Di bandar manakah terletaknya Patung Liberty?"
  },
  "opts": [
   {
    "en": "New York",
    "ms": "New York"
   },
   {
    "en": "Washington, D.C.",
    "ms": "Washington, D.C."
   },
   {
    "en": "Boston",
    "ms": "Boston"
   },
   {
    "en": "San Francisco",
    "ms": "San Francisco"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w53",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which city is the Colosseum?",
   "ms": "Di bandar manakah terletaknya Colosseum?"
  },
  "opts": [
   {
    "en": "Rome",
    "ms": "Rom"
   },
   {
    "en": "Athens",
    "ms": "Athens"
   },
   {
    "en": "Madrid",
    "ms": "Madrid"
   },
   {
    "en": "Istanbul",
    "ms": "Istanbul"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w54",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which city is the clock tower known as Big Ben?",
   "ms": "Di bandar manakah terletaknya menara jam Big Ben?"
  },
  "opts": [
   {
    "en": "London",
    "ms": "London"
   },
   {
    "en": "Paris",
    "ms": "Paris"
   },
   {
    "en": "Dublin",
    "ms": "Dublin"
   },
   {
    "en": "Edinburgh",
    "ms": "Edinburgh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w55",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which country is the Taj Mahal?",
   "ms": "Di negara manakah terletaknya Taj Mahal?"
  },
  "opts": [
   {
    "en": "India",
    "ms": "India"
   },
   {
    "en": "Pakistan",
    "ms": "Pakistan"
   },
   {
    "en": "Bangladesh",
    "ms": "Bangladesh"
   },
   {
    "en": "Iran",
    "ms": "Iran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w56",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "In which country is Machu Picchu?",
   "ms": "Di negara manakah terletaknya Machu Picchu?"
  },
  "opts": [
   {
    "en": "Peru",
    "ms": "Peru"
   },
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "Chile",
    "ms": "Chile"
   },
   {
    "en": "Brazil",
    "ms": "Brazil"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w57",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Pyramids of Giza are in which country?",
   "ms": "Piramid Giza terletak di negara mana?"
  },
  "opts": [
   {
    "en": "Egypt",
    "ms": "Mesir"
   },
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "Sudan",
    "ms": "Sudan"
   },
   {
    "en": "Morocco",
    "ms": "Maghribi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w58",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The famous Opera House by the harbour is in which city?",
   "ms": "Rumah Opera terkenal di tepi pelabuhan terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "Sydney",
    "ms": "Sydney"
   },
   {
    "en": "Melbourne",
    "ms": "Melbourne"
   },
   {
    "en": "Auckland",
    "ms": "Auckland"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w59",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Burj Khalifa, the world's tallest building, is in which city?",
   "ms": "Burj Khalifa, bangunan tertinggi di dunia, terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "Dubai",
    "ms": "Dubai"
   },
   {
    "en": "Abu Dhabi",
    "ms": "Abu Dhabi"
   },
   {
    "en": "Doha",
    "ms": "Doha"
   },
   {
    "en": "Riyadh",
    "ms": "Riyadh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w60",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Christ the Redeemer statue stands above which city?",
   "ms": "Patung Christ the Redeemer berdiri di atas bandar mana?"
  },
  "opts": [
   {
    "en": "Rio de Janeiro",
    "ms": "Rio de Janeiro"
   },
   {
    "en": "Lisbon",
    "ms": "Lisbon"
   },
   {
    "en": "Buenos Aires",
    "ms": "Buenos Aires"
   },
   {
    "en": "Mexico City",
    "ms": "Mexico City"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w61",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Leaning Tower is in which Italian city?",
   "ms": "Menara Condong terletak di bandar Itali yang mana?"
  },
  "opts": [
   {
    "en": "Pisa",
    "ms": "Pisa"
   },
   {
    "en": "Venice",
    "ms": "Venice"
   },
   {
    "en": "Florence",
    "ms": "Florence"
   },
   {
    "en": "Milan",
    "ms": "Milan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w62",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Sagrada Família church is in which city?",
   "ms": "Gereja Sagrada Família terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "Barcelona",
    "ms": "Barcelona"
   },
   {
    "en": "Madrid",
    "ms": "Madrid"
   },
   {
    "en": "Lisbon",
    "ms": "Lisbon"
   },
   {
    "en": "Rome",
    "ms": "Rom"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w63",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Angkor Wat is in which country?",
   "ms": "Angkor Wat terletak di negara mana?"
  },
  "opts": [
   {
    "en": "Cambodia",
    "ms": "Kemboja"
   },
   {
    "en": "Thailand",
    "ms": "Thailand"
   },
   {
    "en": "Laos",
    "ms": "Laos"
   },
   {
    "en": "Myanmar",
    "ms": "Myanmar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w64",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Mount Fuji is in which country?",
   "ms": "Gunung Fuji terletak di negara mana?"
  },
  "opts": [
   {
    "en": "Japan",
    "ms": "Jepun"
   },
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "South Korea",
    "ms": "Korea Selatan"
   },
   {
    "en": "Nepal",
    "ms": "Nepal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w65",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Merlion statue is a symbol of which country?",
   "ms": "Patung Merlion ialah simbol negara mana?"
  },
  "opts": [
   {
    "en": "Singapore",
    "ms": "Singapura"
   },
   {
    "en": "Malaysia",
    "ms": "Malaysia"
   },
   {
    "en": "Thailand",
    "ms": "Thailand"
   },
   {
    "en": "Indonesia",
    "ms": "Indonesia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w66",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Golden Gate Bridge is in which city?",
   "ms": "Jambatan Golden Gate terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "San Francisco",
    "ms": "San Francisco"
   },
   {
    "en": "New York",
    "ms": "New York"
   },
   {
    "en": "Seattle",
    "ms": "Seattle"
   },
   {
    "en": "Chicago",
    "ms": "Chicago"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w67",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Acropolis is in which city?",
   "ms": "Acropolis terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "Athens",
    "ms": "Athens"
   },
   {
    "en": "Rome",
    "ms": "Rom"
   },
   {
    "en": "Cairo",
    "ms": "Kaherah"
   },
   {
    "en": "Istanbul",
    "ms": "Istanbul"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w68",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Red Square and the Kremlin are in which city?",
   "ms": "Dataran Merah dan Kremlin terletak di bandar mana?"
  },
  "opts": [
   {
    "en": "Moscow",
    "ms": "Moscow"
   },
   {
    "en": "Kyiv",
    "ms": "Kyiv"
   },
   {
    "en": "Warsaw",
    "ms": "Warsaw"
   },
   {
    "en": "Prague",
    "ms": "Prague"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w69",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Great Wall is in which country?",
   "ms": "Tembok Besar terletak di negara mana?"
  },
  "opts": [
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "Mongolia",
    "ms": "Mongolia"
   },
   {
    "en": "Japan",
    "ms": "Jepun"
   },
   {
    "en": "India",
    "ms": "India"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w70",
  "cat": "Landmarks",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Borobudur temple is in which country?",
   "ms": "Candi Borobudur terletak di negara mana?"
  },
  "opts": [
   {
    "en": "Indonesia",
    "ms": "Indonesia"
   },
   {
    "en": "Cambodia",
    "ms": "Kemboja"
   },
   {
    "en": "Thailand",
    "ms": "Thailand"
   },
   {
    "en": "Myanmar",
    "ms": "Myanmar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w71",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the largest ocean in the world?",
   "ms": "Apakah lautan terbesar di dunia?"
  },
  "opts": [
   {
    "en": "Pacific Ocean",
    "ms": "Lautan Pasifik"
   },
   {
    "en": "Atlantic Ocean",
    "ms": "Lautan Atlantik"
   },
   {
    "en": "Indian Ocean",
    "ms": "Lautan Hindi"
   },
   {
    "en": "Arctic Ocean",
    "ms": "Lautan Artik"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w72",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the largest continent?",
   "ms": "Apakah benua terbesar?"
  },
  "opts": [
   {
    "en": "Asia",
    "ms": "Asia"
   },
   {
    "en": "Africa",
    "ms": "Afrika"
   },
   {
    "en": "Europe",
    "ms": "Eropah"
   },
   {
    "en": "North America",
    "ms": "Amerika Utara"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w73",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which country is the largest by land area?",
   "ms": "Negara manakah yang terbesar dari segi keluasan tanah?"
  },
  "opts": [
   {
    "en": "Russia",
    "ms": "Rusia"
   },
   {
    "en": "Canada",
    "ms": "Kanada"
   },
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "United States",
    "ms": "Amerika Syarikat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w74",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the tallest mountain above sea level?",
   "ms": "Apakah gunung tertinggi dari aras laut?"
  },
  "opts": [
   {
    "en": "Mount Everest",
    "ms": "Gunung Everest"
   },
   {
    "en": "K2",
    "ms": "K2"
   },
   {
    "en": "Mount Kilimanjaro",
    "ms": "Gunung Kilimanjaro"
   },
   {
    "en": "Mount Kinabalu",
    "ms": "Gunung Kinabalu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w75",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "Which river flows through Cairo?",
   "ms": "Sungai manakah yang mengalir melalui Kaherah?"
  },
  "opts": [
   {
    "en": "Nile",
    "ms": "Sungai Nil"
   },
   {
    "en": "Amazon",
    "ms": "Sungai Amazon"
   },
   {
    "en": "Ganges",
    "ms": "Sungai Ganges"
   },
   {
    "en": "Danube",
    "ms": "Sungai Danube"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w76",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "The Amazon rainforest is mainly on which continent?",
   "ms": "Hutan hujan Amazon terletak terutamanya di benua mana?"
  },
  "opts": [
   {
    "en": "South America",
    "ms": "Amerika Selatan"
   },
   {
    "en": "Africa",
    "ms": "Afrika"
   },
   {
    "en": "Asia",
    "ms": "Asia"
   },
   {
    "en": "Australia",
    "ms": "Australia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w77",
  "cat": "Geography",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "How many continents are there?",
   "ms": "Berapakah bilangan benua?"
  },
  "opts": [
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "8",
    "ms": "8"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w78",
  "cat": "Currency",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the currency of Japan?",
   "ms": "Apakah mata wang Jepun?"
  },
  "opts": [
   {
    "en": "Yen",
    "ms": "Yen"
   },
   {
    "en": "Won",
    "ms": "Won"
   },
   {
    "en": "Yuan",
    "ms": "Yuan"
   },
   {
    "en": "Baht",
    "ms": "Baht"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w79",
  "cat": "Currency",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the currency of Thailand?",
   "ms": "Apakah mata wang Thailand?"
  },
  "opts": [
   {
    "en": "Baht",
    "ms": "Baht"
   },
   {
    "en": "Rupiah",
    "ms": "Rupiah"
   },
   {
    "en": "Peso",
    "ms": "Peso"
   },
   {
    "en": "Dong",
    "ms": "Dong"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w80",
  "cat": "Currency",
  "set": "world",
  "type": "mc",
  "q": {
   "en": "What is the currency of Indonesia?",
   "ms": "Apakah mata wang Indonesia?"
  },
  "opts": [
   {
    "en": "Rupiah",
    "ms": "Rupiah"
   },
   {
    "en": "Ringgit",
    "ms": "Ringgit"
   },
   {
    "en": "Rupee",
    "ms": "Rupee"
   },
   {
    "en": "Riyal",
    "ms": "Riyal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l01",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a black prancing horse on a yellow shield?",
   "ms": "Logo jenama kereta manakah ialah kuda hitam melompat di atas perisai kuning?"
  },
  "opts": [
   {
    "en": "Ferrari",
    "ms": "Ferrari"
   },
   {
    "en": "Porsche",
    "ms": "Porsche"
   },
   {
    "en": "Lamborghini",
    "ms": "Lamborghini"
   },
   {
    "en": "Mustang",
    "ms": "Mustang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l02",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a charging golden bull?",
   "ms": "Logo jenama kereta manakah ialah seekor lembu jantan emas yang menerkam?"
  },
  "opts": [
   {
    "en": "Lamborghini",
    "ms": "Lamborghini"
   },
   {
    "en": "Ferrari",
    "ms": "Ferrari"
   },
   {
    "en": "Maserati",
    "ms": "Maserati"
   },
   {
    "en": "Bugatti",
    "ms": "Bugatti"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l03",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a three-pointed star in a circle?",
   "ms": "Logo jenama kereta manakah ialah bintang tiga bucu dalam bulatan?"
  },
  "opts": [
   {
    "en": "Mercedes-Benz",
    "ms": "Mercedes-Benz"
   },
   {
    "en": "Subaru",
    "ms": "Subaru"
   },
   {
    "en": "Chrysler",
    "ms": "Chrysler"
   },
   {
    "en": "Volvo",
    "ms": "Volvo"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l04",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is four overlapping silver rings?",
   "ms": "Logo jenama kereta manakah ialah empat gelang perak bertindih?"
  },
  "opts": [
   {
    "en": "Audi",
    "ms": "Audi"
   },
   {
    "en": "Toyota",
    "ms": "Toyota"
   },
   {
    "en": "Volkswagen",
    "ms": "Volkswagen"
   },
   {
    "en": "Opel",
    "ms": "Opel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l05",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a circle split into blue and white quarters inside a black ring?",
   "ms": "Logo jenama kereta manakah ialah bulatan berbahagi empat biru dan putih di dalam gelang hitam?"
  },
  "opts": [
   {
    "en": "BMW",
    "ms": "BMW"
   },
   {
    "en": "Volkswagen",
    "ms": "Volkswagen"
   },
   {
    "en": "Ford",
    "ms": "Ford"
   },
   {
    "en": "Mini",
    "ms": "Mini"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l06",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is made of three overlapping ovals?",
   "ms": "Logo jenama kereta manakah terdiri daripada tiga bujur bertindih?"
  },
  "opts": [
   {
    "en": "Toyota",
    "ms": "Toyota"
   },
   {
    "en": "Honda",
    "ms": "Honda"
   },
   {
    "en": "Nissan",
    "ms": "Nissan"
   },
   {
    "en": "Mazda",
    "ms": "Mazda"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l07",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo shows six stars on a blue oval?",
   "ms": "Logo jenama kereta manakah menunjukkan enam bintang di atas bujur biru?"
  },
  "opts": [
   {
    "en": "Subaru",
    "ms": "Subaru"
   },
   {
    "en": "Mitsubishi",
    "ms": "Mitsubishi"
   },
   {
    "en": "Suzuki",
    "ms": "Suzuki"
   },
   {
    "en": "Isuzu",
    "ms": "Isuzu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l08",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is three red diamonds?",
   "ms": "Logo jenama kereta manakah ialah tiga berlian merah?"
  },
  "opts": [
   {
    "en": "Mitsubishi",
    "ms": "Mitsubishi"
   },
   {
    "en": "Mazda",
    "ms": "Mazda"
   },
   {
    "en": "Renault",
    "ms": "Renault"
   },
   {
    "en": "Hyundai",
    "ms": "Hyundai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l09",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which French car brand's logo is a lion?",
   "ms": "Logo jenama kereta Perancis manakah ialah seekor singa?"
  },
  "opts": [
   {
    "en": "Peugeot",
    "ms": "Peugeot"
   },
   {
    "en": "Renault",
    "ms": "Renault"
   },
   {
    "en": "Citroën",
    "ms": "Citroën"
   },
   {
    "en": "Bugatti",
    "ms": "Bugatti"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l10",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a golden 'bowtie' shape?",
   "ms": "Logo jenama kereta manakah ialah bentuk 'tali leher kupu-kupu' keemasan?"
  },
  "opts": [
   {
    "en": "Chevrolet",
    "ms": "Chevrolet"
   },
   {
    "en": "Ford",
    "ms": "Ford"
   },
   {
    "en": "Dodge",
    "ms": "Dodge"
   },
   {
    "en": "Cadillac",
    "ms": "Cadillac"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l11",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a leaping wild cat?",
   "ms": "Logo jenama kereta manakah ialah kucing liar yang melompat?"
  },
  "opts": [
   {
    "en": "Jaguar",
    "ms": "Jaguar"
   },
   {
    "en": "Puma",
    "ms": "Puma"
   },
   {
    "en": "Peugeot",
    "ms": "Peugeot"
   },
   {
    "en": "Proton",
    "ms": "Proton"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l12",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a trident (three-pronged spear)?",
   "ms": "Logo jenama kereta manakah ialah serampang tiga?"
  },
  "opts": [
   {
    "en": "Maserati",
    "ms": "Maserati"
   },
   {
    "en": "Alfa Romeo",
    "ms": "Alfa Romeo"
   },
   {
    "en": "Ferrari",
    "ms": "Ferrari"
   },
   {
    "en": "Lancia",
    "ms": "Lancia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l13",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which Malaysian car brand's logo is a tiger's head?",
   "ms": "Logo jenama kereta Malaysia manakah ialah kepala harimau?"
  },
  "opts": [
   {
    "en": "Proton",
    "ms": "Proton"
   },
   {
    "en": "Perodua",
    "ms": "Perodua"
   },
   {
    "en": "Inokom",
    "ms": "Inokom"
   },
   {
    "en": "Naza",
    "ms": "Naza"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l14",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a 'V' above a 'W' inside a circle?",
   "ms": "Logo jenama kereta manakah ialah huruf 'V' di atas 'W' dalam bulatan?"
  },
  "opts": [
   {
    "en": "Volkswagen",
    "ms": "Volkswagen"
   },
   {
    "en": "Volvo",
    "ms": "Volvo"
   },
   {
    "en": "Wuling",
    "ms": "Wuling"
   },
   {
    "en": "Vauxhall",
    "ms": "Vauxhall"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l15",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a slanted letter 'H' in an oval?",
   "ms": "Logo jenama kereta manakah ialah huruf 'H' condong dalam bujur?"
  },
  "opts": [
   {
    "en": "Hyundai",
    "ms": "Hyundai"
   },
   {
    "en": "Honda",
    "ms": "Honda"
   },
   {
    "en": "Haval",
    "ms": "Haval"
   },
   {
    "en": "Hino",
    "ms": "Hino"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l16",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which luxury car brand's logo is a stylised letter 'L' in an oval?",
   "ms": "Logo jenama kereta mewah manakah ialah huruf 'L' bergaya dalam bujur?"
  },
  "opts": [
   {
    "en": "Lexus",
    "ms": "Lexus"
   },
   {
    "en": "Lincoln",
    "ms": "Lincoln"
   },
   {
    "en": "Land Rover",
    "ms": "Land Rover"
   },
   {
    "en": "Lotus",
    "ms": "Lotus"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l17",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is two upside-down 'V' shapes (double chevrons)?",
   "ms": "Logo jenama kereta manakah ialah dua bentuk 'V' terbalik (cevron berganda)?"
  },
  "opts": [
   {
    "en": "Citroën",
    "ms": "Citroën"
   },
   {
    "en": "Renault",
    "ms": "Renault"
   },
   {
    "en": "Chevrolet",
    "ms": "Chevrolet"
   },
   {
    "en": "Mazda",
    "ms": "Mazda"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l18",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which luxury car brand's logo is a letter 'B' with wings?",
   "ms": "Logo jenama kereta mewah manakah ialah huruf 'B' bersayap?"
  },
  "opts": [
   {
    "en": "Bentley",
    "ms": "Bentley"
   },
   {
    "en": "Bugatti",
    "ms": "Bugatti"
   },
   {
    "en": "BMW",
    "ms": "BMW"
   },
   {
    "en": "Buick",
    "ms": "Buick"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l19",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a circle with an arrow pointing up to the right?",
   "ms": "Logo jenama kereta manakah ialah bulatan dengan anak panah menghala ke atas kanan?"
  },
  "opts": [
   {
    "en": "Volvo",
    "ms": "Volvo"
   },
   {
    "en": "Volkswagen",
    "ms": "Volkswagen"
   },
   {
    "en": "Opel",
    "ms": "Opel"
   },
   {
    "en": "Saab",
    "ms": "Saab"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l20",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a black horse on a crest with antlers and red and black stripes?",
   "ms": "Logo jenama kereta manakah ialah kuda hitam pada lambang dengan tanduk rusa serta jalur merah dan hitam?"
  },
  "opts": [
   {
    "en": "Porsche",
    "ms": "Porsche"
   },
   {
    "en": "Ferrari",
    "ms": "Ferrari"
   },
   {
    "en": "Lamborghini",
    "ms": "Lamborghini"
   },
   {
    "en": "Aston Martin",
    "ms": "Aston Martin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l21",
  "cat": "Cars",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which electric car brand's logo is a stylised letter 'T'?",
   "ms": "Logo jenama kereta elektrik manakah ialah huruf 'T' bergaya?"
  },
  "opts": [
   {
    "en": "Tesla",
    "ms": "Tesla"
   },
   {
    "en": "Toyota",
    "ms": "Toyota"
   },
   {
    "en": "Tata",
    "ms": "Tata"
   },
   {
    "en": "Lotus",
    "ms": "Lotus"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l22",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which sports brand's logo is a simple curved 'tick' called the swoosh?",
   "ms": "Logo jenama sukan manakah ialah tanda 'betul' melengkung yang dipanggil swoosh?"
  },
  "opts": [
   {
    "en": "Nike",
    "ms": "Nike"
   },
   {
    "en": "Adidas",
    "ms": "Adidas"
   },
   {
    "en": "Puma",
    "ms": "Puma"
   },
   {
    "en": "Reebok",
    "ms": "Reebok"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l23",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which sports brand is known for three stripes and a three-leaf trefoil?",
   "ms": "Jenama sukan manakah terkenal dengan tiga jalur dan logo tiga daun?"
  },
  "opts": [
   {
    "en": "Adidas",
    "ms": "Adidas"
   },
   {
    "en": "Nike",
    "ms": "Nike"
   },
   {
    "en": "Puma",
    "ms": "Puma"
   },
   {
    "en": "Fila",
    "ms": "Fila"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l24",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which sports brand's logo is a leaping big cat?",
   "ms": "Logo jenama sukan manakah ialah kucing besar yang melompat?"
  },
  "opts": [
   {
    "en": "Puma",
    "ms": "Puma"
   },
   {
    "en": "Jaguar",
    "ms": "Jaguar"
   },
   {
    "en": "Nike",
    "ms": "Nike"
   },
   {
    "en": "Asics",
    "ms": "Asics"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l25",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which clothing brand's logo is a small green crocodile?",
   "ms": "Logo jenama pakaian manakah ialah seekor buaya hijau kecil?"
  },
  "opts": [
   {
    "en": "Lacoste",
    "ms": "Lacoste"
   },
   {
    "en": "Ralph Lauren",
    "ms": "Ralph Lauren"
   },
   {
    "en": "Crocs",
    "ms": "Crocs"
   },
   {
    "en": "Tommy Hilfiger",
    "ms": "Tommy Hilfiger"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l26",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fashion brand's logo is two interlocking letter 'C's back to back?",
   "ms": "Logo jenama fesyen manakah ialah dua huruf 'C' bertaut membelakangi satu sama lain?"
  },
  "opts": [
   {
    "en": "Chanel",
    "ms": "Chanel"
   },
   {
    "en": "Gucci",
    "ms": "Gucci"
   },
   {
    "en": "Coach",
    "ms": "Coach"
   },
   {
    "en": "Celine",
    "ms": "Celine"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l27",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fashion brand's logo is two interlocking letter 'G's?",
   "ms": "Logo jenama fesyen manakah ialah dua huruf 'G' bertaut?"
  },
  "opts": [
   {
    "en": "Gucci",
    "ms": "Gucci"
   },
   {
    "en": "Givenchy",
    "ms": "Givenchy"
   },
   {
    "en": "Guess",
    "ms": "Guess"
   },
   {
    "en": "Chanel",
    "ms": "Chanel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l28",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fashion brand's famous monogram combines the letters 'L' and 'V'?",
   "ms": "Monogram terkenal jenama fesyen manakah menggabungkan huruf 'L' dan 'V'?"
  },
  "opts": [
   {
    "en": "Louis Vuitton",
    "ms": "Louis Vuitton"
   },
   {
    "en": "Levi's",
    "ms": "Levi's"
   },
   {
    "en": "Lanvin",
    "ms": "Lanvin"
   },
   {
    "en": "Valentino",
    "ms": "Valentino"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l29",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which clothing brand's logo is a polo player riding a horse?",
   "ms": "Logo jenama pakaian manakah ialah pemain polo menunggang kuda?"
  },
  "opts": [
   {
    "en": "Ralph Lauren",
    "ms": "Ralph Lauren"
   },
   {
    "en": "Lacoste",
    "ms": "Lacoste"
   },
   {
    "en": "Hermès",
    "ms": "Hermès"
   },
   {
    "en": "Ferrari",
    "ms": "Ferrari"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l30",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fashion brand's logo is the head of Medusa?",
   "ms": "Logo jenama fesyen manakah ialah kepala Medusa?"
  },
  "opts": [
   {
    "en": "Versace",
    "ms": "Versace"
   },
   {
    "en": "Prada",
    "ms": "Prada"
   },
   {
    "en": "Armani",
    "ms": "Armani"
   },
   {
    "en": "Dior",
    "ms": "Dior"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l31",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which shoe brand's classic 'All Star' patch has a star in a circle?",
   "ms": "Jenama kasut manakah yang tampalan klasik 'All Star'nya mempunyai bintang dalam bulatan?"
  },
  "opts": [
   {
    "en": "Converse",
    "ms": "Converse"
   },
   {
    "en": "Vans",
    "ms": "Vans"
   },
   {
    "en": "Nike",
    "ms": "Nike"
   },
   {
    "en": "Bata",
    "ms": "Bata"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l32",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which sports brand's logo is an interlocking 'U' and 'A'?",
   "ms": "Logo jenama sukan manakah ialah huruf 'U' dan 'A' bertaut?"
  },
  "opts": [
   {
    "en": "Under Armour",
    "ms": "Under Armour"
   },
   {
    "en": "Umbro",
    "ms": "Umbro"
   },
   {
    "en": "Asics",
    "ms": "Asics"
   },
   {
    "en": "Uniqlo",
    "ms": "Uniqlo"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l33",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which outdoor brand's logo looks like a quarter of a dome with curved lines?",
   "ms": "Logo jenama luar manakah kelihatan seperti suku kubah dengan garisan melengkung?"
  },
  "opts": [
   {
    "en": "The North Face",
    "ms": "The North Face"
   },
   {
    "en": "Columbia",
    "ms": "Columbia"
   },
   {
    "en": "Patagonia",
    "ms": "Patagonia"
   },
   {
    "en": "Timberland",
    "ms": "Timberland"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l34",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which brand's 'Jumpman' logo shows a basketball player leaping for a dunk?",
   "ms": "Logo 'Jumpman' jenama manakah menunjukkan pemain bola keranjang melompat?"
  },
  "opts": [
   {
    "en": "Air Jordan",
    "ms": "Air Jordan"
   },
   {
    "en": "Spalding",
    "ms": "Spalding"
   },
   {
    "en": "Puma",
    "ms": "Puma"
   },
   {
    "en": "Converse",
    "ms": "Converse"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l35",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which luxury watch brand's logo is a golden crown?",
   "ms": "Logo jenama jam tangan mewah manakah ialah mahkota emas?"
  },
  "opts": [
   {
    "en": "Rolex",
    "ms": "Rolex"
   },
   {
    "en": "Omega",
    "ms": "Omega"
   },
   {
    "en": "Casio",
    "ms": "Casio"
   },
   {
    "en": "Seiko",
    "ms": "Seiko"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l36",
  "cat": "Fashion",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which clothing brand's logo is a red square with white letters?",
   "ms": "Logo jenama pakaian manakah ialah segi empat merah dengan huruf putih?"
  },
  "opts": [
   {
    "en": "Uniqlo",
    "ms": "Uniqlo"
   },
   {
    "en": "Zara",
    "ms": "Zara"
   },
   {
    "en": "H&M",
    "ms": "H&M"
   },
   {
    "en": "Padini",
    "ms": "Padini"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l37",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fast-food chain's logo is a pair of golden arches forming an 'M'?",
   "ms": "Logo rangkaian makanan segera manakah ialah sepasang lengkung emas membentuk 'M'?"
  },
  "opts": [
   {
    "en": "McDonald's",
    "ms": "McDonald's"
   },
   {
    "en": "Burger King",
    "ms": "Burger King"
   },
   {
    "en": "Marrybrown",
    "ms": "Marrybrown"
   },
   {
    "en": "Wendy's",
    "ms": "Wendy's"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l38",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fast-food chain's logo shows a smiling man with white hair, glasses and a bow tie?",
   "ms": "Logo rangkaian makanan segera manakah menunjukkan lelaki tersenyum berambut putih, berkaca mata dan bertali leher kupu-kupu?"
  },
  "opts": [
   {
    "en": "KFC",
    "ms": "KFC"
   },
   {
    "en": "Texas Chicken",
    "ms": "Texas Chicken"
   },
   {
    "en": "Wendy's",
    "ms": "Wendy's"
   },
   {
    "en": "Pizza Hut",
    "ms": "Pizza Hut"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l39",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which coffee chain's logo is a green twin-tailed mermaid (siren)?",
   "ms": "Logo rangkaian kopi manakah ialah duyung berekor dua berwarna hijau?"
  },
  "opts": [
   {
    "en": "Starbucks",
    "ms": "Starbucks"
   },
   {
    "en": "Coffee Bean",
    "ms": "Coffee Bean"
   },
   {
    "en": "Costa Coffee",
    "ms": "Costa Coffee"
   },
   {
    "en": "Tim Hortons",
    "ms": "Tim Hortons"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l40",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which pizza chain's logo includes a red roof shape?",
   "ms": "Logo rangkaian piza manakah mengandungi bentuk bumbung merah?"
  },
  "opts": [
   {
    "en": "Pizza Hut",
    "ms": "Pizza Hut"
   },
   {
    "en": "Domino's",
    "ms": "Domino's"
   },
   {
    "en": "Papa John's",
    "ms": "Papa John's"
   },
   {
    "en": "Sbarro",
    "ms": "Sbarro"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l41",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which pizza chain's logo is a domino tile with dots?",
   "ms": "Logo rangkaian piza manakah ialah kepingan domino dengan titik?"
  },
  "opts": [
   {
    "en": "Domino's",
    "ms": "Domino's"
   },
   {
    "en": "Pizza Hut",
    "ms": "Pizza Hut"
   },
   {
    "en": "Papa John's",
    "ms": "Papa John's"
   },
   {
    "en": "Little Caesars",
    "ms": "Little Caesars"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l42",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which sandwich chain's logo has arrows on the first and last letters of its name?",
   "ms": "Logo rangkaian sandwic manakah mempunyai anak panah pada huruf pertama dan terakhir namanya?"
  },
  "opts": [
   {
    "en": "Subway",
    "ms": "Subway"
   },
   {
    "en": "Quiznos",
    "ms": "Quiznos"
   },
   {
    "en": "Jimmy John's",
    "ms": "Jimmy John's"
   },
   {
    "en": "Arby's",
    "ms": "Arby's"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l43",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which burger chain's logo shows its name between two halves of a bun?",
   "ms": "Logo rangkaian burger manakah menunjukkan namanya di antara dua keping roti?"
  },
  "opts": [
   {
    "en": "Burger King",
    "ms": "Burger King"
   },
   {
    "en": "McDonald's",
    "ms": "McDonald's"
   },
   {
    "en": "Carl's Jr.",
    "ms": "Carl's Jr."
   },
   {
    "en": "A&W",
    "ms": "A&W"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l44",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which fast-food chain's logo is a smiling girl with red pigtails?",
   "ms": "Logo rangkaian makanan segera manakah ialah gadis tersenyum dengan rambut merah bertocang?"
  },
  "opts": [
   {
    "en": "Wendy's",
    "ms": "Wendy's"
   },
   {
    "en": "KFC",
    "ms": "KFC"
   },
   {
    "en": "Dairy Queen",
    "ms": "Dairy Queen"
   },
   {
    "en": "Arby's",
    "ms": "Arby's"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l45",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which energy drink's logo shows two red bulls charging at a yellow sun?",
   "ms": "Logo minuman tenaga manakah menunjukkan dua lembu merah menerkam ke arah matahari kuning?"
  },
  "opts": [
   {
    "en": "Red Bull",
    "ms": "Red Bull"
   },
   {
    "en": "Monster",
    "ms": "Monster"
   },
   {
    "en": "Livita",
    "ms": "Livita"
   },
   {
    "en": "Lipovitan",
    "ms": "Lipovitan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l46",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which energy drink's logo looks like green claw marks forming an 'M'?",
   "ms": "Logo minuman tenaga manakah kelihatan seperti kesan cakaran hijau membentuk 'M'?"
  },
  "opts": [
   {
    "en": "Monster",
    "ms": "Monster"
   },
   {
    "en": "Red Bull",
    "ms": "Red Bull"
   },
   {
    "en": "Rockstar",
    "ms": "Rockstar"
   },
   {
    "en": "Mountain Dew",
    "ms": "Mountain Dew"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l47",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which soft drink's logo is a circle in red, white and blue?",
   "ms": "Logo minuman ringan manakah ialah bulatan merah, putih dan biru?"
  },
  "opts": [
   {
    "en": "Pepsi",
    "ms": "Pepsi"
   },
   {
    "en": "Coca-Cola",
    "ms": "Coca-Cola"
   },
   {
    "en": "7UP",
    "ms": "7UP"
   },
   {
    "en": "Fanta",
    "ms": "Fanta"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l48",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which soft drink is famous for its flowing white handwriting-style name on red?",
   "ms": "Minuman ringan manakah terkenal dengan nama bertulisan tangan putih yang beralun di atas merah?"
  },
  "opts": [
   {
    "en": "Coca-Cola",
    "ms": "Coca-Cola"
   },
   {
    "en": "Pepsi",
    "ms": "Pepsi"
   },
   {
    "en": "Sprite",
    "ms": "Sprite"
   },
   {
    "en": "100Plus",
    "ms": "100Plus"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l49",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which snack's logo is a man's face with a big moustache?",
   "ms": "Logo snek manakah ialah wajah lelaki bermisai tebal?"
  },
  "opts": [
   {
    "en": "Pringles",
    "ms": "Pringles"
   },
   {
    "en": "Lay's",
    "ms": "Lay's"
   },
   {
    "en": "Mister Potato",
    "ms": "Mister Potato"
   },
   {
    "en": "Doritos",
    "ms": "Doritos"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l50",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which food company's logo shows a mother bird feeding chicks in a nest?",
   "ms": "Logo syarikat makanan manakah menunjukkan ibu burung menyuap anak dalam sarang?"
  },
  "opts": [
   {
    "en": "Nestlé",
    "ms": "Nestlé"
   },
   {
    "en": "Dutch Lady",
    "ms": "Dutch Lady"
   },
   {
    "en": "Danone",
    "ms": "Danone"
   },
   {
    "en": "Kellogg's",
    "ms": "Kellogg's"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l51",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which chocolate's logo hides a bear inside a mountain?",
   "ms": "Logo coklat manakah menyembunyikan seekor beruang di dalam gunung?"
  },
  "opts": [
   {
    "en": "Toblerone",
    "ms": "Toblerone"
   },
   {
    "en": "Cadbury",
    "ms": "Cadbury"
   },
   {
    "en": "Kit Kat",
    "ms": "Kit Kat"
   },
   {
    "en": "Ferrero Rocher",
    "ms": "Ferrero Rocher"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l52",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which canned food brand's logo is a rooster?",
   "ms": "Logo jenama makanan tin manakah ialah ayam jantan?"
  },
  "opts": [
   {
    "en": "Ayam Brand",
    "ms": "Ayam Brand"
   },
   {
    "en": "Adabi",
    "ms": "Adabi"
   },
   {
    "en": "Kimball",
    "ms": "Kimball"
   },
   {
    "en": "Yeo's",
    "ms": "Yeo's"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l53",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which Malaysian snack brand's mascot is a smiling cartoon potato?",
   "ms": "Maskot jenama snek Malaysia manakah ialah kentang kartun tersenyum?"
  },
  "opts": [
   {
    "en": "Mister Potato",
    "ms": "Mister Potato"
   },
   {
    "en": "Pringles",
    "ms": "Pringles"
   },
   {
    "en": "Lay's",
    "ms": "Lay's"
   },
   {
    "en": "Jacker",
    "ms": "Jacker"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l54",
  "cat": "Food",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which ketchup brand's label is shaped like a keystone?",
   "ms": "Label jenama sos tomato manakah berbentuk batu kunci (keystone)?"
  },
  "opts": [
   {
    "en": "Heinz",
    "ms": "Heinz"
   },
   {
    "en": "Kimball",
    "ms": "Kimball"
   },
   {
    "en": "Maggi",
    "ms": "Maggi"
   },
   {
    "en": "Life",
    "ms": "Life"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l55",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which company's logo is an apple with a bite taken out?",
   "ms": "Logo syarikat manakah ialah epal yang digigit?"
  },
  "opts": [
   {
    "en": "Apple",
    "ms": "Apple"
   },
   {
    "en": "Samsung",
    "ms": "Samsung"
   },
   {
    "en": "Xiaomi",
    "ms": "Xiaomi"
   },
   {
    "en": "Huawei",
    "ms": "Huawei"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l56",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which company's logo is four coloured squares?",
   "ms": "Logo syarikat manakah ialah empat segi empat berwarna?"
  },
  "opts": [
   {
    "en": "Microsoft",
    "ms": "Microsoft"
   },
   {
    "en": "Google",
    "ms": "Google"
   },
   {
    "en": "Apple",
    "ms": "Apple"
   },
   {
    "en": "IBM",
    "ms": "IBM"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l57",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which phone system's logo is a little green robot?",
   "ms": "Logo sistem telefon manakah ialah robot hijau kecil?"
  },
  "opts": [
   {
    "en": "Android",
    "ms": "Android"
   },
   {
    "en": "iOS",
    "ms": "iOS"
   },
   {
    "en": "Windows",
    "ms": "Windows"
   },
   {
    "en": "HarmonyOS",
    "ms": "HarmonyOS"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l58",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Before it became 'X', which app's logo was a blue bird?",
   "ms": "Sebelum menjadi 'X', logo aplikasi manakah ialah burung biru?"
  },
  "opts": [
   {
    "en": "Twitter",
    "ms": "Twitter"
   },
   {
    "en": "Telegram",
    "ms": "Telegram"
   },
   {
    "en": "Facebook",
    "ms": "Facebook"
   },
   {
    "en": "Threads",
    "ms": "Threads"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l59",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which app's logo is a white ghost on a yellow background?",
   "ms": "Logo aplikasi manakah ialah hantu putih di atas latar kuning?"
  },
  "opts": [
   {
    "en": "Snapchat",
    "ms": "Snapchat"
   },
   {
    "en": "TikTok",
    "ms": "TikTok"
   },
   {
    "en": "Instagram",
    "ms": "Instagram"
   },
   {
    "en": "WeChat",
    "ms": "WeChat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l60",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which app's logo is the outline of a camera on a purple-orange gradient?",
   "ms": "Logo aplikasi manakah ialah garis luar kamera di atas latar gradien ungu-oren?"
  },
  "opts": [
   {
    "en": "Instagram",
    "ms": "Instagram"
   },
   {
    "en": "Snapchat",
    "ms": "Snapchat"
   },
   {
    "en": "Pinterest",
    "ms": "Pinterest"
   },
   {
    "en": "Facebook",
    "ms": "Facebook"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l61",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which app's logo is a phone handset inside a green speech bubble?",
   "ms": "Logo aplikasi manakah ialah gagang telefon di dalam belon cakap hijau?"
  },
  "opts": [
   {
    "en": "WhatsApp",
    "ms": "WhatsApp"
   },
   {
    "en": "Telegram",
    "ms": "Telegram"
   },
   {
    "en": "Line",
    "ms": "Line"
   },
   {
    "en": "Viber",
    "ms": "Viber"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l62",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which app's logo is a white play triangle on a red rounded rectangle?",
   "ms": "Logo aplikasi manakah ialah segi tiga main putih di atas segi empat bulat merah?"
  },
  "opts": [
   {
    "en": "YouTube",
    "ms": "YouTube"
   },
   {
    "en": "Netflix",
    "ms": "Netflix"
   },
   {
    "en": "Spotify",
    "ms": "Spotify"
   },
   {
    "en": "TikTok",
    "ms": "TikTok"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l63",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which streaming service's logo is a big red letter 'N'?",
   "ms": "Logo perkhidmatan penstriman manakah ialah huruf 'N' merah besar?"
  },
  "opts": [
   {
    "en": "Netflix",
    "ms": "Netflix"
   },
   {
    "en": "Disney+",
    "ms": "Disney+"
   },
   {
    "en": "Nintendo",
    "ms": "Nintendo"
   },
   {
    "en": "Viu",
    "ms": "Viu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l64",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which music app's logo is three curved lines on a green circle?",
   "ms": "Logo aplikasi muzik manakah ialah tiga garisan melengkung di atas bulatan hijau?"
  },
  "opts": [
   {
    "en": "Spotify",
    "ms": "Spotify"
   },
   {
    "en": "Apple Music",
    "ms": "Apple Music"
   },
   {
    "en": "JOOX",
    "ms": "JOOX"
   },
   {
    "en": "SoundCloud",
    "ms": "SoundCloud"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l65",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which web browser's logo is a fox wrapped around a globe?",
   "ms": "Logo pelayar web manakah ialah musang yang melilit glob?"
  },
  "opts": [
   {
    "en": "Firefox",
    "ms": "Firefox"
   },
   {
    "en": "Chrome",
    "ms": "Chrome"
   },
   {
    "en": "Safari",
    "ms": "Safari"
   },
   {
    "en": "Opera",
    "ms": "Opera"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l66",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which web browser's logo is a circle of red, yellow and green with a blue centre?",
   "ms": "Logo pelayar web manakah ialah bulatan merah, kuning dan hijau dengan bahagian tengah biru?"
  },
  "opts": [
   {
    "en": "Chrome",
    "ms": "Chrome"
   },
   {
    "en": "Firefox",
    "ms": "Firefox"
   },
   {
    "en": "Edge",
    "ms": "Edge"
   },
   {
    "en": "Opera",
    "ms": "Opera"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l67",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which social network's logo is a lowercase white 'f' on blue?",
   "ms": "Logo rangkaian sosial manakah ialah huruf kecil 'f' putih di atas biru?"
  },
  "opts": [
   {
    "en": "Facebook",
    "ms": "Facebook"
   },
   {
    "en": "Flickr",
    "ms": "Flickr"
   },
   {
    "en": "Foursquare",
    "ms": "Foursquare"
   },
   {
    "en": "Fiverr",
    "ms": "Fiverr"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l68",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which professional network's logo is the letters 'in' on a blue square?",
   "ms": "Logo rangkaian profesional manakah ialah huruf 'in' di atas segi empat biru?"
  },
  "opts": [
   {
    "en": "LinkedIn",
    "ms": "LinkedIn"
   },
   {
    "en": "Indeed",
    "ms": "Indeed"
   },
   {
    "en": "Instagram",
    "ms": "Instagram"
   },
   {
    "en": "JobStreet",
    "ms": "JobStreet"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l69",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which messaging app's logo is a white paper plane on a blue circle?",
   "ms": "Logo aplikasi pesanan manakah ialah kapal terbang kertas putih di atas bulatan biru?"
  },
  "opts": [
   {
    "en": "Telegram",
    "ms": "Telegram"
   },
   {
    "en": "WhatsApp",
    "ms": "WhatsApp"
   },
   {
    "en": "Messenger",
    "ms": "Messenger"
   },
   {
    "en": "Signal",
    "ms": "Signal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l70",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which online shop's logo has a smiling arrow pointing from 'a' to 'z'?",
   "ms": "Logo kedai dalam talian manakah mempunyai anak panah tersenyum dari 'a' ke 'z'?"
  },
  "opts": [
   {
    "en": "Amazon",
    "ms": "Amazon"
   },
   {
    "en": "eBay",
    "ms": "eBay"
   },
   {
    "en": "Alibaba",
    "ms": "Alibaba"
   },
   {
    "en": "Lazada",
    "ms": "Lazada"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l71",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which app's logo is a music note shaped like the letter 'd' in cyan and red?",
   "ms": "Logo aplikasi manakah ialah not muzik berbentuk huruf 'd' berwarna biru muda dan merah?"
  },
  "opts": [
   {
    "en": "TikTok",
    "ms": "TikTok"
   },
   {
    "en": "Spotify",
    "ms": "Spotify"
   },
   {
    "en": "Shazam",
    "ms": "Shazam"
   },
   {
    "en": "Smule",
    "ms": "Smule"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l72",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which online shop's logo is an orange shopping bag with an 'S'?",
   "ms": "Logo kedai dalam talian manakah ialah beg membeli-belah oren dengan huruf 'S'?"
  },
  "opts": [
   {
    "en": "Shopee",
    "ms": "Shopee"
   },
   {
    "en": "Lazada",
    "ms": "Lazada"
   },
   {
    "en": "Zalora",
    "ms": "Zalora"
   },
   {
    "en": "Shein",
    "ms": "Shein"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l73",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which game console brand's logo combines a 'P' and an 'S'?",
   "ms": "Logo jenama konsol permainan manakah menggabungkan huruf 'P' dan 'S'?"
  },
  "opts": [
   {
    "en": "PlayStation",
    "ms": "PlayStation"
   },
   {
    "en": "Xbox",
    "ms": "Xbox"
   },
   {
    "en": "Nintendo Switch",
    "ms": "Nintendo Switch"
   },
   {
    "en": "Sega",
    "ms": "Sega"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l74",
  "cat": "Tech",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "The penguin mascot 'Tux' is the symbol of which operating system?",
   "ms": "Maskot penguin 'Tux' ialah simbol sistem pengendalian manakah?"
  },
  "opts": [
   {
    "en": "Linux",
    "ms": "Linux"
   },
   {
    "en": "Windows",
    "ms": "Windows"
   },
   {
    "en": "macOS",
    "ms": "macOS"
   },
   {
    "en": "Android",
    "ms": "Android"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l75",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which oil company's logo is a yellow and red seashell?",
   "ms": "Logo syarikat minyak manakah ialah kulit kerang kuning dan merah?"
  },
  "opts": [
   {
    "en": "Shell",
    "ms": "Shell"
   },
   {
    "en": "Petronas",
    "ms": "Petronas"
   },
   {
    "en": "Caltex",
    "ms": "Caltex"
   },
   {
    "en": "BHPetrol",
    "ms": "BHPetrol"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l76",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which airline's logo is based on the traditional Malay kite, the wau?",
   "ms": "Logo syarikat penerbangan manakah berasaskan layang-layang tradisional Melayu, wau?"
  },
  "opts": [
   {
    "en": "Malaysia Airlines",
    "ms": "Malaysia Airlines"
   },
   {
    "en": "AirAsia",
    "ms": "AirAsia"
   },
   {
    "en": "Firefly",
    "ms": "Firefly"
   },
   {
    "en": "Batik Air",
    "ms": "Batik Air"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l77",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which brand's logo is three crossed tuning forks?",
   "ms": "Logo jenama manakah ialah tiga garpu tala bersilang?"
  },
  "opts": [
   {
    "en": "Yamaha",
    "ms": "Yamaha"
   },
   {
    "en": "Honda",
    "ms": "Honda"
   },
   {
    "en": "Suzuki",
    "ms": "Suzuki"
   },
   {
    "en": "Kawasaki",
    "ms": "Kawasaki"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l78",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which tyre brand's mascot is a white man made of tyres?",
   "ms": "Maskot jenama tayar manakah ialah lelaki putih diperbuat daripada tayar?"
  },
  "opts": [
   {
    "en": "Michelin",
    "ms": "Michelin"
   },
   {
    "en": "Goodyear",
    "ms": "Goodyear"
   },
   {
    "en": "Bridgestone",
    "ms": "Bridgestone"
   },
   {
    "en": "Continental",
    "ms": "Continental"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l79",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which toy brand's logo is a red square with white letters?",
   "ms": "Logo jenama mainan manakah ialah segi empat merah dengan huruf putih?"
  },
  "opts": [
   {
    "en": "LEGO",
    "ms": "LEGO"
   },
   {
    "en": "Mattel",
    "ms": "Mattel"
   },
   {
    "en": "Hasbro",
    "ms": "Hasbro"
   },
   {
    "en": "Bandai",
    "ms": "Bandai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l80",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which delivery company's logo hides a white arrow between the 'E' and the 'x'?",
   "ms": "Logo syarikat penghantaran manakah menyembunyikan anak panah putih di antara 'E' dan 'x'?"
  },
  "opts": [
   {
    "en": "FedEx",
    "ms": "FedEx"
   },
   {
    "en": "DHL",
    "ms": "DHL"
   },
   {
    "en": "UPS",
    "ms": "UPS"
   },
   {
    "en": "Pos Malaysia",
    "ms": "Pos Malaysia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l81",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which payment card brand's logo is two overlapping circles, red and yellow?",
   "ms": "Logo jenama kad pembayaran manakah ialah dua bulatan bertindih, merah dan kuning?"
  },
  "opts": [
   {
    "en": "Mastercard",
    "ms": "Mastercard"
   },
   {
    "en": "Visa",
    "ms": "Visa"
   },
   {
    "en": "American Express",
    "ms": "American Express"
   },
   {
    "en": "UnionPay",
    "ms": "UnionPay"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l82",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which company's logo is a fairy-tale castle?",
   "ms": "Logo syarikat manakah ialah istana dongeng?"
  },
  "opts": [
   {
    "en": "Disney",
    "ms": "Disney"
   },
   {
    "en": "Universal",
    "ms": "Universal"
   },
   {
    "en": "Warner Bros.",
    "ms": "Warner Bros."
   },
   {
    "en": "Pixar",
    "ms": "Pixar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l83",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which nature organisation's logo is a black and white panda?",
   "ms": "Logo organisasi alam semula jadi manakah ialah panda hitam putih?"
  },
  "opts": [
   {
    "en": "WWF",
    "ms": "WWF"
   },
   {
    "en": "Greenpeace",
    "ms": "Greenpeace"
   },
   {
    "en": "UNICEF",
    "ms": "UNICEF"
   },
   {
    "en": "Red Cross",
    "ms": "Palang Merah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l84",
  "cat": "Others",
  "set": "logo",
  "type": "mc",
  "q": {
   "en": "Which motorcycle brand's logo is a red wing?",
   "ms": "Logo jenama motosikal manakah ialah sayap merah?"
  },
  "opts": [
   {
    "en": "Honda",
    "ms": "Honda"
   },
   {
    "en": "Yamaha",
    "ms": "Yamaha"
   },
   {
    "en": "Harley-Davidson",
    "ms": "Harley-Davidson"
   },
   {
    "en": "Modenas",
    "ms": "Modenas"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m01",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Johor?",
   "ms": "Apakah ibu negeri Johor?"
  },
  "opts": [
   {
    "en": "Johor Bahru",
    "ms": "Johor Bahru"
   },
   {
    "en": "Muar",
    "ms": "Muar"
   },
   {
    "en": "Batu Pahat",
    "ms": "Batu Pahat"
   },
   {
    "en": "Kluang",
    "ms": "Kluang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m02",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Kedah?",
   "ms": "Apakah ibu negeri Kedah?"
  },
  "opts": [
   {
    "en": "Alor Setar",
    "ms": "Alor Setar"
   },
   {
    "en": "Sungai Petani",
    "ms": "Sungai Petani"
   },
   {
    "en": "Kulim",
    "ms": "Kulim"
   },
   {
    "en": "Langkawi",
    "ms": "Langkawi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m03",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Kelantan?",
   "ms": "Apakah ibu negeri Kelantan?"
  },
  "opts": [
   {
    "en": "Kota Bharu",
    "ms": "Kota Bharu"
   },
   {
    "en": "Pasir Mas",
    "ms": "Pasir Mas"
   },
   {
    "en": "Tumpat",
    "ms": "Tumpat"
   },
   {
    "en": "Gua Musang",
    "ms": "Gua Musang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m04",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Negeri Sembilan?",
   "ms": "Apakah ibu negeri Negeri Sembilan?"
  },
  "opts": [
   {
    "en": "Seremban",
    "ms": "Seremban"
   },
   {
    "en": "Port Dickson",
    "ms": "Port Dickson"
   },
   {
    "en": "Nilai",
    "ms": "Nilai"
   },
   {
    "en": "Kuala Pilah",
    "ms": "Kuala Pilah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m05",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Pahang?",
   "ms": "Apakah ibu negeri Pahang?"
  },
  "opts": [
   {
    "en": "Kuantan",
    "ms": "Kuantan"
   },
   {
    "en": "Temerloh",
    "ms": "Temerloh"
   },
   {
    "en": "Bentong",
    "ms": "Bentong"
   },
   {
    "en": "Pekan",
    "ms": "Pekan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m06",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Penang?",
   "ms": "Apakah ibu negeri Pulau Pinang?"
  },
  "opts": [
   {
    "en": "George Town",
    "ms": "George Town"
   },
   {
    "en": "Butterworth",
    "ms": "Butterworth"
   },
   {
    "en": "Bukit Mertajam",
    "ms": "Bukit Mertajam"
   },
   {
    "en": "Bayan Lepas",
    "ms": "Bayan Lepas"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m07",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Perak?",
   "ms": "Apakah ibu negeri Perak?"
  },
  "opts": [
   {
    "en": "Ipoh",
    "ms": "Ipoh"
   },
   {
    "en": "Taiping",
    "ms": "Taiping"
   },
   {
    "en": "Teluk Intan",
    "ms": "Teluk Intan"
   },
   {
    "en": "Kuala Kangsar",
    "ms": "Kuala Kangsar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m08",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Perlis?",
   "ms": "Apakah ibu negeri Perlis?"
  },
  "opts": [
   {
    "en": "Kangar",
    "ms": "Kangar"
   },
   {
    "en": "Arau",
    "ms": "Arau"
   },
   {
    "en": "Padang Besar",
    "ms": "Padang Besar"
   },
   {
    "en": "Kuala Perlis",
    "ms": "Kuala Perlis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m09",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Sabah?",
   "ms": "Apakah ibu negeri Sabah?"
  },
  "opts": [
   {
    "en": "Kota Kinabalu",
    "ms": "Kota Kinabalu"
   },
   {
    "en": "Sandakan",
    "ms": "Sandakan"
   },
   {
    "en": "Tawau",
    "ms": "Tawau"
   },
   {
    "en": "Lahad Datu",
    "ms": "Lahad Datu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m10",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Sarawak?",
   "ms": "Apakah ibu negeri Sarawak?"
  },
  "opts": [
   {
    "en": "Kuching",
    "ms": "Kuching"
   },
   {
    "en": "Miri",
    "ms": "Miri"
   },
   {
    "en": "Sibu",
    "ms": "Sibu"
   },
   {
    "en": "Bintulu",
    "ms": "Bintulu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m11",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Selangor?",
   "ms": "Apakah ibu negeri Selangor?"
  },
  "opts": [
   {
    "en": "Shah Alam",
    "ms": "Shah Alam"
   },
   {
    "en": "Petaling Jaya",
    "ms": "Petaling Jaya"
   },
   {
    "en": "Klang",
    "ms": "Klang"
   },
   {
    "en": "Subang Jaya",
    "ms": "Subang Jaya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m12",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the capital of Terengganu?",
   "ms": "Apakah ibu negeri Terengganu?"
  },
  "opts": [
   {
    "en": "Kuala Terengganu",
    "ms": "Kuala Terengganu"
   },
   {
    "en": "Kemaman",
    "ms": "Kemaman"
   },
   {
    "en": "Dungun",
    "ms": "Dungun"
   },
   {
    "en": "Marang",
    "ms": "Marang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m13",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How many states does Malaysia have?",
   "ms": "Berapakah bilangan negeri di Malaysia?"
  },
  "opts": [
   {
    "en": "13",
    "ms": "13"
   },
   {
    "en": "11",
    "ms": "11"
   },
   {
    "en": "14",
    "ms": "14"
   },
   {
    "en": "16",
    "ms": "16"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m14",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which of these is a Federal Territory?",
   "ms": "Antara berikut, yang manakah Wilayah Persekutuan?"
  },
  "opts": [
   {
    "en": "Labuan",
    "ms": "Labuan"
   },
   {
    "en": "Langkawi",
    "ms": "Langkawi"
   },
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Penang",
    "ms": "Pulau Pinang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m15",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which city is Malaysia's federal administrative centre?",
   "ms": "Bandar manakah pusat pentadbiran persekutuan Malaysia?"
  },
  "opts": [
   {
    "en": "Putrajaya",
    "ms": "Putrajaya"
   },
   {
    "en": "Cyberjaya",
    "ms": "Cyberjaya"
   },
   {
    "en": "Shah Alam",
    "ms": "Shah Alam"
   },
   {
    "en": "Petaling Jaya",
    "ms": "Petaling Jaya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m16",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which is the smallest state in Malaysia?",
   "ms": "Negeri manakah yang terkecil di Malaysia?"
  },
  "opts": [
   {
    "en": "Perlis",
    "ms": "Perlis"
   },
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Penang",
    "ms": "Pulau Pinang"
   },
   {
    "en": "Negeri Sembilan",
    "ms": "Negeri Sembilan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m17",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which is the largest state in Malaysia?",
   "ms": "Negeri manakah yang terbesar di Malaysia?"
  },
  "opts": [
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m18",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which state is known as the 'Land Below the Wind'?",
   "ms": "Negeri manakah dikenali sebagai 'Negeri di Bawah Bayu'?"
  },
  "opts": [
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Kedah",
    "ms": "Kedah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m19",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which state is known as the 'Land of the Hornbills'?",
   "ms": "Negeri manakah dikenali sebagai 'Bumi Kenyalang'?"
  },
  "opts": [
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Johor",
    "ms": "Johor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m20",
  "cat": "States",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which state is called 'Serambi Mekah' (Verandah of Mecca)?",
   "ms": "Negeri manakah digelar 'Serambi Mekah'?"
  },
  "opts": [
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   },
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Kedah",
    "ms": "Kedah"
   },
   {
    "en": "Perlis",
    "ms": "Perlis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m21",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is Malaysia's national flower?",
   "ms": "Apakah bunga kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Hibiscus (Bunga Raya)",
    "ms": "Bunga Raya"
   },
   {
    "en": "Orchid",
    "ms": "Orkid"
   },
   {
    "en": "Jasmine",
    "ms": "Melur"
   },
   {
    "en": "Rafflesia",
    "ms": "Rafflesia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m22",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is Malaysia's national animal?",
   "ms": "Apakah haiwan kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Malayan tiger",
    "ms": "Harimau Malaya"
   },
   {
    "en": "Orangutan",
    "ms": "Orang utan"
   },
   {
    "en": "Hornbill",
    "ms": "Burung enggang"
   },
   {
    "en": "Sun bear",
    "ms": "Beruang madu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m23",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the name of Malaysia's flag?",
   "ms": "Apakah nama bendera Malaysia?"
  },
  "opts": [
   {
    "en": "Jalur Gemilang",
    "ms": "Jalur Gemilang"
   },
   {
    "en": "Sang Saka Merah Putih",
    "ms": "Sang Saka Merah Putih"
   },
   {
    "en": "Bintang Pecah",
    "ms": "Bintang Pecah"
   },
   {
    "en": "Jalur Merdeka",
    "ms": "Jalur Merdeka"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m24",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How many red and white stripes are on the Malaysian flag?",
   "ms": "Berapakah jalur merah dan putih pada bendera Malaysia?"
  },
  "opts": [
   {
    "en": "14",
    "ms": "14"
   },
   {
    "en": "13",
    "ms": "13"
   },
   {
    "en": "11",
    "ms": "11"
   },
   {
    "en": "16",
    "ms": "16"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m25",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How many points does the star on the Malaysian flag have?",
   "ms": "Berapakah bucu bintang pada bendera Malaysia?"
  },
  "opts": [
   {
    "en": "14",
    "ms": "14"
   },
   {
    "en": "13",
    "ms": "13"
   },
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "8",
    "ms": "8"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m26",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the name of Malaysia's national anthem?",
   "ms": "Apakah nama lagu kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Negaraku",
    "ms": "Negaraku"
   },
   {
    "en": "Malaysia Berjaya",
    "ms": "Malaysia Berjaya"
   },
   {
    "en": "Tanggal 31",
    "ms": "Tanggal 31"
   },
   {
    "en": "Jalur Gemilang",
    "ms": "Jalur Gemilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m27",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is Malaysia's currency?",
   "ms": "Apakah mata wang Malaysia?"
  },
  "opts": [
   {
    "en": "Ringgit",
    "ms": "Ringgit"
   },
   {
    "en": "Rupiah",
    "ms": "Rupiah"
   },
   {
    "en": "Dollar",
    "ms": "Dolar"
   },
   {
    "en": "Baht",
    "ms": "Baht"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m28",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How many principles are in the Rukun Negara?",
   "ms": "Berapakah prinsip dalam Rukun Negara?"
  },
  "opts": [
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "3",
    "ms": "3"
   },
   {
    "en": "4",
    "ms": "4"
   },
   {
    "en": "7",
    "ms": "7"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m29",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the first principle of the Rukun Negara?",
   "ms": "Apakah prinsip pertama Rukun Negara?"
  },
  "opts": [
   {
    "en": "Belief in God",
    "ms": "Kepercayaan kepada Tuhan"
   },
   {
    "en": "Loyalty to King and Country",
    "ms": "Kesetiaan kepada Raja dan Negara"
   },
   {
    "en": "Rule of Law",
    "ms": "Kedaulatan Undang-undang"
   },
   {
    "en": "Courtesy and Morality",
    "ms": "Kesopanan dan Kesusilaan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m30",
  "cat": "Symbols",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is Malaysia's national language?",
   "ms": "Apakah bahasa kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Malay (Bahasa Melayu)",
    "ms": "Bahasa Melayu"
   },
   {
    "en": "English",
    "ms": "Bahasa Inggeris"
   },
   {
    "en": "Mandarin",
    "ms": "Bahasa Mandarin"
   },
   {
    "en": "Tamil",
    "ms": "Bahasa Tamil"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m31",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "On what date did Malaya gain independence?",
   "ms": "Pada tarikh manakah Tanah Melayu mencapai kemerdekaan?"
  },
  "opts": [
   {
    "en": "31 August 1957",
    "ms": "31 Ogos 1957"
   },
   {
    "en": "16 September 1963",
    "ms": "16 September 1963"
   },
   {
    "en": "31 August 1963",
    "ms": "31 Ogos 1963"
   },
   {
    "en": "1 January 1957",
    "ms": "1 Januari 1957"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m32",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Malaysia Day on 16 September marks the formation of Malaysia in which year?",
   "ms": "Hari Malaysia pada 16 September memperingati pembentukan Malaysia pada tahun berapa?"
  },
  "opts": [
   {
    "en": "1963",
    "ms": "1963"
   },
   {
    "en": "1957",
    "ms": "1957"
   },
   {
    "en": "1965",
    "ms": "1965"
   },
   {
    "en": "1971",
    "ms": "1971"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m33",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Who was Malaysia's first Prime Minister?",
   "ms": "Siapakah Perdana Menteri pertama Malaysia?"
  },
  "opts": [
   {
    "en": "Tunku Abdul Rahman",
    "ms": "Tunku Abdul Rahman"
   },
   {
    "en": "Tun Abdul Razak",
    "ms": "Tun Abdul Razak"
   },
   {
    "en": "Tun Hussein Onn",
    "ms": "Tun Hussein Onn"
   },
   {
    "en": "Tun Dr Mahathir Mohamad",
    "ms": "Tun Dr Mahathir Mohamad"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m34",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How long is the term of the Yang di-Pertuan Agong?",
   "ms": "Berapa lamakah tempoh pemerintahan Yang di-Pertuan Agong?"
  },
  "opts": [
   {
    "en": "5 years",
    "ms": "5 tahun"
   },
   {
    "en": "4 years",
    "ms": "4 tahun"
   },
   {
    "en": "6 years",
    "ms": "6 tahun"
   },
   {
    "en": "For life",
    "ms": "Seumur hidup"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m35",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What are the two houses of Malaysia's Parliament?",
   "ms": "Apakah dua dewan Parlimen Malaysia?"
  },
  "opts": [
   {
    "en": "Dewan Rakyat and Dewan Negara",
    "ms": "Dewan Rakyat dan Dewan Negara"
   },
   {
    "en": "Dewan Rakyat and Dewan Undangan Negeri",
    "ms": "Dewan Rakyat dan Dewan Undangan Negeri"
   },
   {
    "en": "Dewan Negara and Majlis Raja-Raja",
    "ms": "Dewan Negara dan Majlis Raja-Raja"
   },
   {
    "en": "Dewan Bandaraya and Dewan Negara",
    "ms": "Dewan Bandaraya dan Dewan Negara"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m36",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What was the name of Malaysia's first national car (1985)?",
   "ms": "Apakah nama kereta nasional pertama Malaysia (1985)?"
  },
  "opts": [
   {
    "en": "Proton Saga",
    "ms": "Proton Saga"
   },
   {
    "en": "Perodua Kancil",
    "ms": "Perodua Kancil"
   },
   {
    "en": "Proton Wira",
    "ms": "Proton Wira"
   },
   {
    "en": "Perodua Myvi",
    "ms": "Perodua Myvi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m37",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which city was the centre of the famous Malay sultanate in the 15th century?",
   "ms": "Bandar manakah pusat kesultanan Melayu terkenal pada abad ke-15?"
  },
  "opts": [
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Kuala Lumpur",
    "ms": "Kuala Lumpur"
   },
   {
    "en": "Johor Bahru",
    "ms": "Johor Bahru"
   },
   {
    "en": "Kuching",
    "ms": "Kuching"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m38",
  "cat": "History",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "The name 'Kuala Lumpur' means what?",
   "ms": "Nama 'Kuala Lumpur' bermaksud apa?"
  },
  "opts": [
   {
    "en": "Muddy confluence",
    "ms": "Pertemuan sungai berlumpur"
   },
   {
    "en": "City of lights",
    "ms": "Bandar cahaya"
   },
   {
    "en": "Green valley",
    "ms": "Lembah hijau"
   },
   {
    "en": "Tin town",
    "ms": "Pekan bijih timah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m39",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "How many storeys does each Petronas Twin Tower have?",
   "ms": "Berapakah tingkat setiap Menara Berkembar Petronas?"
  },
  "opts": [
   {
    "en": "88",
    "ms": "88"
   },
   {
    "en": "100",
    "ms": "100"
   },
   {
    "en": "118",
    "ms": "118"
   },
   {
    "en": "72",
    "ms": "72"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m40",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the tallest building in Malaysia?",
   "ms": "Apakah bangunan tertinggi di Malaysia?"
  },
  "opts": [
   {
    "en": "Merdeka 118",
    "ms": "Merdeka 118"
   },
   {
    "en": "Petronas Twin Towers",
    "ms": "Menara Berkembar Petronas"
   },
   {
    "en": "KL Tower",
    "ms": "Menara KL"
   },
   {
    "en": "The Exchange 106",
    "ms": "The Exchange 106"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m41",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "In which state are the Batu Caves?",
   "ms": "Di negeri manakah terletaknya Batu Caves?"
  },
  "opts": [
   {
    "en": "Selangor",
    "ms": "Selangor"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Kuala Lumpur",
    "ms": "Kuala Lumpur"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m42",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Mount Kinabalu is in which state?",
   "ms": "Gunung Kinabalu terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m43",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the highest mountain in Malaysia?",
   "ms": "Apakah gunung tertinggi di Malaysia?"
  },
  "opts": [
   {
    "en": "Mount Kinabalu",
    "ms": "Gunung Kinabalu"
   },
   {
    "en": "Mount Tahan",
    "ms": "Gunung Tahan"
   },
   {
    "en": "Mount Mulu",
    "ms": "Gunung Mulu"
   },
   {
    "en": "Mount Ledang",
    "ms": "Gunung Ledang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m44",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the longest river in Malaysia?",
   "ms": "Apakah sungai terpanjang di Malaysia?"
  },
  "opts": [
   {
    "en": "Rajang River",
    "ms": "Sungai Rajang"
   },
   {
    "en": "Pahang River",
    "ms": "Sungai Pahang"
   },
   {
    "en": "Kinabatangan River",
    "ms": "Sungai Kinabatangan"
   },
   {
    "en": "Perak River",
    "ms": "Sungai Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m45",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Cameron Highlands is in which state?",
   "ms": "Cameron Highlands terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   },
   {
    "en": "Selangor",
    "ms": "Selangor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m46",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Langkawi island belongs to which state?",
   "ms": "Pulau Langkawi terletak dalam negeri mana?"
  },
  "opts": [
   {
    "en": "Kedah",
    "ms": "Kedah"
   },
   {
    "en": "Perlis",
    "ms": "Perlis"
   },
   {
    "en": "Penang",
    "ms": "Pulau Pinang"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m47",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "The famous diving island Sipadan is part of which state?",
   "ms": "Pulau selam terkenal Sipadan terletak dalam negeri mana?"
  },
  "opts": [
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Johor",
    "ms": "Johor"
   },
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m48",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Gunung Mulu National Park, famous for its caves, is in which state?",
   "ms": "Taman Negara Gunung Mulu, terkenal dengan guanya, terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m49",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "The old Portuguese fort A Famosa is in which state?",
   "ms": "Kubu lama Portugis A Famosa terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Penang",
    "ms": "Pulau Pinang"
   },
   {
    "en": "Johor",
    "ms": "Johor"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m50",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Kellie's Castle is in which state?",
   "ms": "Kellie's Castle terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Perak",
    "ms": "Perak"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Selangor",
    "ms": "Selangor"
   },
   {
    "en": "Negeri Sembilan",
    "ms": "Negeri Sembilan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m51",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "The Sepilok centre, famous for orangutans, is in which state?",
   "ms": "Pusat Sepilok yang terkenal dengan orang utan terletak di negeri mana?"
  },
  "opts": [
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Johor",
    "ms": "Johor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m52",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which two Malaysian cities became UNESCO World Heritage Sites together in 2008?",
   "ms": "Dua bandar Malaysia manakah menjadi Tapak Warisan Dunia UNESCO bersama pada 2008?"
  },
  "opts": [
   {
    "en": "Melaka and George Town",
    "ms": "Melaka dan George Town"
   },
   {
    "en": "Kuala Lumpur and Putrajaya",
    "ms": "Kuala Lumpur dan Putrajaya"
   },
   {
    "en": "Ipoh and Taiping",
    "ms": "Ipoh dan Taiping"
   },
   {
    "en": "Kuching and Kota Kinabalu",
    "ms": "Kuching dan Kota Kinabalu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m53",
  "cat": "Landmarks",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Where is the main international airport KLIA?",
   "ms": "Di manakah lapangan terbang antarabangsa utama KLIA?"
  },
  "opts": [
   {
    "en": "Sepang",
    "ms": "Sepang"
   },
   {
    "en": "Subang",
    "ms": "Subang"
   },
   {
    "en": "Putrajaya",
    "ms": "Putrajaya"
   },
   {
    "en": "Kuala Lumpur city centre",
    "ms": "Pusat bandar Kuala Lumpur"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m54",
  "cat": "Geography",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which strait separates Peninsular Malaysia from Sumatra?",
   "ms": "Selat manakah yang memisahkan Semenanjung Malaysia dan Sumatera?"
  },
  "opts": [
   {
    "en": "Strait of Malacca",
    "ms": "Selat Melaka"
   },
   {
    "en": "Strait of Johor",
    "ms": "Selat Johor"
   },
   {
    "en": "Sunda Strait",
    "ms": "Selat Sunda"
   },
   {
    "en": "Strait of Hormuz",
    "ms": "Selat Hormuz"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m55",
  "cat": "Geography",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which sea lies between Peninsular Malaysia and Borneo?",
   "ms": "Laut manakah yang terletak antara Semenanjung Malaysia dan Borneo?"
  },
  "opts": [
   {
    "en": "South China Sea",
    "ms": "Laut China Selatan"
   },
   {
    "en": "Andaman Sea",
    "ms": "Laut Andaman"
   },
   {
    "en": "Java Sea",
    "ms": "Laut Jawa"
   },
   {
    "en": "Sulu Sea",
    "ms": "Laut Sulu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m56",
  "cat": "Geography",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which country borders Peninsular Malaysia to the north?",
   "ms": "Negara manakah bersempadan dengan Semenanjung Malaysia di utara?"
  },
  "opts": [
   {
    "en": "Thailand",
    "ms": "Thailand"
   },
   {
    "en": "Myanmar",
    "ms": "Myanmar"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   },
   {
    "en": "Cambodia",
    "ms": "Kemboja"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m57",
  "cat": "Geography",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Borneo is shared by Malaysia, Indonesia and which other country?",
   "ms": "Borneo dikongsi oleh Malaysia, Indonesia dan negara mana lagi?"
  },
  "opts": [
   {
    "en": "Brunei",
    "ms": "Brunei"
   },
   {
    "en": "Philippines",
    "ms": "Filipina"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   },
   {
    "en": "Thailand",
    "ms": "Thailand"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m58",
  "cat": "Geography",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Malaysia's world-famous giant flower is called?",
   "ms": "Bunga gergasi Malaysia yang terkenal di dunia dipanggil?"
  },
  "opts": [
   {
    "en": "Rafflesia",
    "ms": "Rafflesia"
   },
   {
    "en": "Lotus",
    "ms": "Teratai"
   },
   {
    "en": "Orchid",
    "ms": "Orkid"
   },
   {
    "en": "Bougainvillea",
    "ms": "Bunga kertas"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m59",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is often called Malaysia's national dish?",
   "ms": "Apakah yang sering digelar hidangan kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Nasi lemak",
    "ms": "Nasi lemak"
   },
   {
    "en": "Nasi goreng",
    "ms": "Nasi goreng"
   },
   {
    "en": "Mee goreng",
    "ms": "Mee goreng"
   },
   {
    "en": "Roti canai",
    "ms": "Roti canai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m60",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "The rice in nasi lemak is cooked with what?",
   "ms": "Nasi dalam nasi lemak dimasak dengan apa?"
  },
  "opts": [
   {
    "en": "Coconut milk",
    "ms": "Santan"
   },
   {
    "en": "Chicken stock",
    "ms": "Stok ayam"
   },
   {
    "en": "Butter",
    "ms": "Mentega"
   },
   {
    "en": "Tomato",
    "ms": "Tomato"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m61",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which town is especially famous for satay?",
   "ms": "Pekan manakah yang terkenal dengan sate?"
  },
  "opts": [
   {
    "en": "Kajang",
    "ms": "Kajang"
   },
   {
    "en": "Ipoh",
    "ms": "Ipoh"
   },
   {
    "en": "Muar",
    "ms": "Muar"
   },
   {
    "en": "Taiping",
    "ms": "Taiping"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m62",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What does 'teh tarik' literally mean?",
   "ms": "Apakah maksud harfiah 'teh tarik'?"
  },
  "opts": [
   {
    "en": "Pulled tea",
    "ms": "Teh yang ditarik"
   },
   {
    "en": "Strong tea",
    "ms": "Teh pekat"
   },
   {
    "en": "Sweet tea",
    "ms": "Teh manis"
   },
   {
    "en": "Iced tea",
    "ms": "Teh ais"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m63",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which fruit is called the 'King of Fruits'?",
   "ms": "Buah manakah digelar 'Raja Segala Buah'?"
  },
  "opts": [
   {
    "en": "Durian",
    "ms": "Durian"
   },
   {
    "en": "Mangosteen",
    "ms": "Manggis"
   },
   {
    "en": "Rambutan",
    "ms": "Rambutan"
   },
   {
    "en": "Jackfruit",
    "ms": "Nangka"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m64",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Lemang is glutinous rice cooked inside what?",
   "ms": "Lemang ialah pulut yang dimasak di dalam apa?"
  },
  "opts": [
   {
    "en": "Bamboo",
    "ms": "Buluh"
   },
   {
    "en": "Banana leaf",
    "ms": "Daun pisang"
   },
   {
    "en": "Coconut shell",
    "ms": "Tempurung kelapa"
   },
   {
    "en": "Clay pot",
    "ms": "Periuk tanah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m65",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Ketupat is rice cooked inside what?",
   "ms": "Ketupat ialah nasi yang dimasak di dalam apa?"
  },
  "opts": [
   {
    "en": "Woven palm leaves",
    "ms": "Anyaman daun kelapa"
   },
   {
    "en": "Bamboo",
    "ms": "Buluh"
   },
   {
    "en": "Banana leaf cone",
    "ms": "Kon daun pisang"
   },
   {
    "en": "Steel tin",
    "ms": "Tin besi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m66",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What does 'ABC' stand for in the shaved-ice dessert?",
   "ms": "Apakah maksud 'ABC' bagi pencuci mulut ais?"
  },
  "opts": [
   {
    "en": "Ais Batu Campur",
    "ms": "Ais Batu Campur"
   },
   {
    "en": "Air Batu Cendol",
    "ms": "Air Batu Cendol"
   },
   {
    "en": "Ais Bijan Coklat",
    "ms": "Ais Bijan Coklat"
   },
   {
    "en": "Agar Biji Cair",
    "ms": "Agar Biji Cair"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m67",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Nasi kerabu gets its blue colour from which flower?",
   "ms": "Nasi kerabu mendapat warna biru daripada bunga apa?"
  },
  "opts": [
   {
    "en": "Butterfly pea (bunga telang)",
    "ms": "Bunga telang"
   },
   {
    "en": "Hibiscus",
    "ms": "Bunga raya"
   },
   {
    "en": "Orchid",
    "ms": "Orkid"
   },
   {
    "en": "Lotus",
    "ms": "Teratai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m68",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Keropok lekor is a famous fish snack from which state?",
   "ms": "Keropok lekor ialah snek ikan terkenal dari negeri mana?"
  },
  "opts": [
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Penang",
    "ms": "Pulau Pinang"
   },
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Perak",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m69",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Kolo mee (mee kolok) is a famous noodle dish from which state?",
   "ms": "Mee kolok ialah hidangan mi terkenal dari negeri mana?"
  },
  "opts": [
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   },
   {
    "en": "Johor",
    "ms": "Johor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m70",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which city is famous for 'white coffee'?",
   "ms": "Bandar manakah terkenal dengan 'kopi putih'?"
  },
  "opts": [
   {
    "en": "Ipoh",
    "ms": "Ipoh"
   },
   {
    "en": "Kuantan",
    "ms": "Kuantan"
   },
   {
    "en": "Kuching",
    "ms": "Kuching"
   },
   {
    "en": "Alor Setar",
    "ms": "Alor Setar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m71",
  "cat": "Food",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Gula Melaka, used in cendol, is made from what?",
   "ms": "Gula Melaka yang digunakan dalam cendol diperbuat daripada apa?"
  },
  "opts": [
   {
    "en": "Palm sap",
    "ms": "Nira kelapa"
   },
   {
    "en": "Sugar cane",
    "ms": "Tebu"
   },
   {
    "en": "Honey",
    "ms": "Madu"
   },
   {
    "en": "Corn",
    "ms": "Jagung"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m72",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Gawai Dayak is a harvest festival celebrated mainly in which state?",
   "ms": "Gawai Dayak ialah perayaan menuai yang disambut terutamanya di negeri mana?"
  },
  "opts": [
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m73",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Kaamatan is a harvest festival celebrated mainly in which state?",
   "ms": "Kaamatan ialah perayaan menuai yang disambut terutamanya di negeri mana?"
  },
  "opts": [
   {
    "en": "Sabah",
    "ms": "Sabah"
   },
   {
    "en": "Sarawak",
    "ms": "Sarawak"
   },
   {
    "en": "Kedah",
    "ms": "Kedah"
   },
   {
    "en": "Perlis",
    "ms": "Perlis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m74",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Thaipusam is famously celebrated at which landmark?",
   "ms": "Thaipusam terkenal disambut di mercu tanda mana?"
  },
  "opts": [
   {
    "en": "Batu Caves",
    "ms": "Batu Caves"
   },
   {
    "en": "Kek Lok Si",
    "ms": "Kek Lok Si"
   },
   {
    "en": "Putra Mosque",
    "ms": "Masjid Putra"
   },
   {
    "en": "A Famosa",
    "ms": "A Famosa"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m75",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Which festival is known as the 'Festival of Lights'?",
   "ms": "Perayaan manakah dikenali sebagai 'Pesta Cahaya'?"
  },
  "opts": [
   {
    "en": "Deepavali",
    "ms": "Deepavali"
   },
   {
    "en": "Hari Raya Aidilfitri",
    "ms": "Hari Raya Aidilfitri"
   },
   {
    "en": "Chinese New Year",
    "ms": "Tahun Baru Cina"
   },
   {
    "en": "Gawai",
    "ms": "Gawai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m76",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is a 'wau' in Malay culture?",
   "ms": "Apakah 'wau' dalam budaya Melayu?"
  },
  "opts": [
   {
    "en": "A traditional kite",
    "ms": "Layang-layang tradisional"
   },
   {
    "en": "A drum",
    "ms": "Gendang"
   },
   {
    "en": "A dagger",
    "ms": "Senjata pendek"
   },
   {
    "en": "A boat",
    "ms": "Perahu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m77",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Sepak takraw is played with what kind of ball?",
   "ms": "Sepak takraw dimainkan dengan bola jenis apa?"
  },
  "opts": [
   {
    "en": "A woven rattan ball",
    "ms": "Bola rotan anyaman"
   },
   {
    "en": "A leather football",
    "ms": "Bola sepak kulit"
   },
   {
    "en": "A shuttlecock",
    "ms": "Bulu tangkis"
   },
   {
    "en": "A tennis ball",
    "ms": "Bola tenis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m78",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Songket is a traditional fabric woven with what?",
   "ms": "Songket ialah kain tradisional yang ditenun dengan apa?"
  },
  "opts": [
   {
    "en": "Gold or silver thread",
    "ms": "Benang emas atau perak"
   },
   {
    "en": "Plastic thread",
    "ms": "Benang plastik"
   },
   {
    "en": "Bamboo strips",
    "ms": "Jalur buluh"
   },
   {
    "en": "Rubber",
    "ms": "Getah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m79",
  "cat": "Culture",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Wayang kulit is what kind of performance?",
   "ms": "Wayang kulit ialah persembahan jenis apa?"
  },
  "opts": [
   {
    "en": "Shadow puppet play",
    "ms": "Teater bayang-bayang patung"
   },
   {
    "en": "Martial art",
    "ms": "Seni mempertahankan diri"
   },
   {
    "en": "Folk dance",
    "ms": "Tarian rakyat"
   },
   {
    "en": "Drum show",
    "ms": "Persembahan gendang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m80",
  "cat": "Sports",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Lee Chong Wei is a world-famous Malaysian player of which sport?",
   "ms": "Lee Chong Wei ialah pemain Malaysia terkenal dunia dalam sukan apa?"
  },
  "opts": [
   {
    "en": "Badminton",
    "ms": "Badminton"
   },
   {
    "en": "Squash",
    "ms": "Skuasy"
   },
   {
    "en": "Football",
    "ms": "Bola sepak"
   },
   {
    "en": "Cycling",
    "ms": "Berbasikal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m81",
  "cat": "Sports",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "Nicol David was world number one in which sport?",
   "ms": "Nicol David pernah menjadi nombor satu dunia dalam sukan apa?"
  },
  "opts": [
   {
    "en": "Squash",
    "ms": "Skuasy"
   },
   {
    "en": "Badminton",
    "ms": "Badminton"
   },
   {
    "en": "Tennis",
    "ms": "Tenis"
   },
   {
    "en": "Bowling",
    "ms": "Boling"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m82",
  "cat": "Sports",
  "set": "malaysia",
  "type": "mc",
  "q": {
   "en": "What is the nickname of Malaysia's national football team?",
   "ms": "Apakah nama jolokan pasukan bola sepak kebangsaan Malaysia?"
  },
  "opts": [
   {
    "en": "Harimau Malaya",
    "ms": "Harimau Malaya"
   },
   {
    "en": "Garuda",
    "ms": "Garuda"
   },
   {
    "en": "Kenyalang",
    "ms": "Kenyalang"
   },
   {
    "en": "Lions",
    "ms": "Singa"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g01",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the chemical formula for water?",
   "ms": "Apakah formula kimia bagi air?"
  },
  "opts": [
   {
    "en": "H₂O",
    "ms": "H₂O"
   },
   {
    "en": "CO₂",
    "ms": "CO₂"
   },
   {
    "en": "O₂",
    "ms": "O₂"
   },
   {
    "en": "NaCl",
    "ms": "NaCl"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g02",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which element has the chemical symbol Na?",
   "ms": "Unsur manakah mempunyai simbol kimia Na?"
  },
  "opts": [
   {
    "en": "Sodium",
    "ms": "Natrium"
   },
   {
    "en": "Nitrogen",
    "ms": "Nitrogen"
   },
   {
    "en": "Nickel",
    "ms": "Nikel"
   },
   {
    "en": "Neon",
    "ms": "Neon"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g03",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which element has the chemical symbol Fe?",
   "ms": "Unsur manakah mempunyai simbol kimia Fe?"
  },
  "opts": [
   {
    "en": "Iron",
    "ms": "Besi"
   },
   {
    "en": "Fluorine",
    "ms": "Fluorin"
   },
   {
    "en": "Lead",
    "ms": "Plumbum"
   },
   {
    "en": "Silver",
    "ms": "Perak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g04",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which element has the chemical symbol Au?",
   "ms": "Unsur manakah mempunyai simbol kimia Au?"
  },
  "opts": [
   {
    "en": "Gold",
    "ms": "Emas"
   },
   {
    "en": "Silver",
    "ms": "Perak"
   },
   {
    "en": "Aluminium",
    "ms": "Aluminium"
   },
   {
    "en": "Copper",
    "ms": "Kuprum"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g05",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which gas do plants take in from the air to make food?",
   "ms": "Gas apakah yang diambil oleh tumbuhan dari udara untuk membuat makanan?"
  },
  "opts": [
   {
    "en": "Carbon dioxide",
    "ms": "Karbon dioksida"
   },
   {
    "en": "Oxygen",
    "ms": "Oksigen"
   },
   {
    "en": "Nitrogen",
    "ms": "Nitrogen"
   },
   {
    "en": "Hydrogen",
    "ms": "Hidrogen"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g06",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which gas do humans need to breathe in to live?",
   "ms": "Gas apakah yang manusia perlu sedut untuk hidup?"
  },
  "opts": [
   {
    "en": "Oxygen",
    "ms": "Oksigen"
   },
   {
    "en": "Carbon dioxide",
    "ms": "Karbon dioksida"
   },
   {
    "en": "Helium",
    "ms": "Helium"
   },
   {
    "en": "Methane",
    "ms": "Metana"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g07",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "At what temperature does water boil at sea level?",
   "ms": "Pada suhu berapakah air mendidih di aras laut?"
  },
  "opts": [
   {
    "en": "100 °C",
    "ms": "100 °C"
   },
   {
    "en": "90 °C",
    "ms": "90 °C"
   },
   {
    "en": "120 °C",
    "ms": "120 °C"
   },
   {
    "en": "80 °C",
    "ms": "80 °C"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g08",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "At what temperature does water freeze?",
   "ms": "Pada suhu berapakah air membeku?"
  },
  "opts": [
   {
    "en": "0 °C",
    "ms": "0 °C"
   },
   {
    "en": "10 °C",
    "ms": "10 °C"
   },
   {
    "en": "-10 °C",
    "ms": "-10 °C"
   },
   {
    "en": "4 °C",
    "ms": "4 °C"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g09",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which travels faster?",
   "ms": "Yang manakah bergerak lebih laju?"
  },
  "opts": [
   {
    "en": "Light",
    "ms": "Cahaya"
   },
   {
    "en": "Sound",
    "ms": "Bunyi"
   },
   {
    "en": "They are the same",
    "ms": "Sama laju"
   },
   {
    "en": "Wind",
    "ms": "Angin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g10",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What force pulls objects towards the Earth?",
   "ms": "Daya apakah yang menarik objek ke arah Bumi?"
  },
  "opts": [
   {
    "en": "Gravity",
    "ms": "Graviti"
   },
   {
    "en": "Magnetism",
    "ms": "Kemagnetan"
   },
   {
    "en": "Friction",
    "ms": "Geseran"
   },
   {
    "en": "Pressure",
    "ms": "Tekanan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g11",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the hardest natural substance?",
   "ms": "Apakah bahan semula jadi yang paling keras?"
  },
  "opts": [
   {
    "en": "Diamond",
    "ms": "Berlian"
   },
   {
    "en": "Gold",
    "ms": "Emas"
   },
   {
    "en": "Iron",
    "ms": "Besi"
   },
   {
    "en": "Granite",
    "ms": "Granit"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g12",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the unit of electrical resistance?",
   "ms": "Apakah unit rintangan elektrik?"
  },
  "opts": [
   {
    "en": "Ohm",
    "ms": "Ohm"
   },
   {
    "en": "Volt",
    "ms": "Volt"
   },
   {
    "en": "Watt",
    "ms": "Watt"
   },
   {
    "en": "Ampere",
    "ms": "Ampere"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g13",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "A liquid with pH 7 is…",
   "ms": "Cecair dengan pH 7 ialah…"
  },
  "opts": [
   {
    "en": "Neutral",
    "ms": "Neutral"
   },
   {
    "en": "Strongly acidic",
    "ms": "Sangat berasid"
   },
   {
    "en": "Strongly alkaline",
    "ms": "Sangat beralkali"
   },
   {
    "en": "Poisonous",
    "ms": "Beracun"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g14",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which gas makes up most of Earth's air?",
   "ms": "Gas manakah yang membentuk sebahagian besar udara Bumi?"
  },
  "opts": [
   {
    "en": "Nitrogen",
    "ms": "Nitrogen"
   },
   {
    "en": "Oxygen",
    "ms": "Oksigen"
   },
   {
    "en": "Carbon dioxide",
    "ms": "Karbon dioksida"
   },
   {
    "en": "Argon",
    "ms": "Argon"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g15",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the process plants use to make food from sunlight?",
   "ms": "Apakah proses yang digunakan tumbuhan untuk membuat makanan daripada cahaya matahari?"
  },
  "opts": [
   {
    "en": "Photosynthesis",
    "ms": "Fotosintesis"
   },
   {
    "en": "Respiration",
    "ms": "Respirasi"
   },
   {
    "en": "Digestion",
    "ms": "Pencernaan"
   },
   {
    "en": "Evaporation",
    "ms": "Penyejatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g16",
  "cat": "Science",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which is a renewable energy source?",
   "ms": "Yang manakah sumber tenaga boleh diperbaharui?"
  },
  "opts": [
   {
    "en": "Solar",
    "ms": "Solar"
   },
   {
    "en": "Coal",
    "ms": "Arang batu"
   },
   {
    "en": "Petrol",
    "ms": "Petrol"
   },
   {
    "en": "Natural gas",
    "ms": "Gas asli"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g17",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which planet is closest to the Sun?",
   "ms": "Planet manakah yang paling dekat dengan Matahari?"
  },
  "opts": [
   {
    "en": "Mercury",
    "ms": "Utarid"
   },
   {
    "en": "Venus",
    "ms": "Zuhrah"
   },
   {
    "en": "Earth",
    "ms": "Bumi"
   },
   {
    "en": "Mars",
    "ms": "Marikh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g18",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the largest planet in our Solar System?",
   "ms": "Apakah planet terbesar dalam Sistem Suria kita?"
  },
  "opts": [
   {
    "en": "Jupiter",
    "ms": "Musytari"
   },
   {
    "en": "Saturn",
    "ms": "Zuhal"
   },
   {
    "en": "Neptune",
    "ms": "Neptun"
   },
   {
    "en": "Earth",
    "ms": "Bumi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g19",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which planet is known as the Red Planet?",
   "ms": "Planet manakah dikenali sebagai Planet Merah?"
  },
  "opts": [
   {
    "en": "Mars",
    "ms": "Marikh"
   },
   {
    "en": "Venus",
    "ms": "Zuhrah"
   },
   {
    "en": "Jupiter",
    "ms": "Musytari"
   },
   {
    "en": "Mercury",
    "ms": "Utarid"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g20",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which planet is famous for its large rings?",
   "ms": "Planet manakah yang terkenal dengan gelang besarnya?"
  },
  "opts": [
   {
    "en": "Saturn",
    "ms": "Zuhal"
   },
   {
    "en": "Mars",
    "ms": "Marikh"
   },
   {
    "en": "Mercury",
    "ms": "Utarid"
   },
   {
    "en": "Venus",
    "ms": "Zuhrah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g21",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which is the hottest planet in our Solar System?",
   "ms": "Planet manakah yang paling panas dalam Sistem Suria kita?"
  },
  "opts": [
   {
    "en": "Venus",
    "ms": "Zuhrah"
   },
   {
    "en": "Mercury",
    "ms": "Utarid"
   },
   {
    "en": "Mars",
    "ms": "Marikh"
   },
   {
    "en": "Jupiter",
    "ms": "Musytari"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g22",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many planets are in our Solar System?",
   "ms": "Berapakah bilangan planet dalam Sistem Suria kita?"
  },
  "opts": [
   {
    "en": "8",
    "ms": "8"
   },
   {
    "en": "9",
    "ms": "9"
   },
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "10",
    "ms": "10"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g23",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the name of our galaxy?",
   "ms": "Apakah nama galaksi kita?"
  },
  "opts": [
   {
    "en": "Milky Way",
    "ms": "Bima Sakti"
   },
   {
    "en": "Andromeda",
    "ms": "Andromeda"
   },
   {
    "en": "Orion",
    "ms": "Orion"
   },
   {
    "en": "Sombrero",
    "ms": "Sombrero"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g24",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who was the first person to walk on the Moon?",
   "ms": "Siapakah orang pertama berjalan di Bulan?"
  },
  "opts": [
   {
    "en": "Neil Armstrong",
    "ms": "Neil Armstrong"
   },
   {
    "en": "Buzz Aldrin",
    "ms": "Buzz Aldrin"
   },
   {
    "en": "Yuri Gagarin",
    "ms": "Yuri Gagarin"
   },
   {
    "en": "Michael Collins",
    "ms": "Michael Collins"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g25",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Sunlight takes about how long to reach Earth?",
   "ms": "Cahaya matahari mengambil masa kira-kira berapa lama untuk sampai ke Bumi?"
  },
  "opts": [
   {
    "en": "8 minutes",
    "ms": "8 minit"
   },
   {
    "en": "8 seconds",
    "ms": "8 saat"
   },
   {
    "en": "8 hours",
    "ms": "8 jam"
   },
   {
    "en": "8 days",
    "ms": "8 hari"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g26",
  "cat": "Space",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who was the first Malaysian in space (2007)?",
   "ms": "Siapakah rakyat Malaysia pertama ke angkasa lepas (2007)?"
  },
  "opts": [
   {
    "en": "Sheikh Muszaphar Shukor",
    "ms": "Sheikh Muszaphar Shukor"
   },
   {
    "en": "Faiz Khaleed",
    "ms": "Faiz Khaleed"
   },
   {
    "en": "Lee Chong Wei",
    "ms": "Lee Chong Wei"
   },
   {
    "en": "Azhar Mansor",
    "ms": "Azhar Mansor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g27",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many bones are in an adult human body?",
   "ms": "Berapakah bilangan tulang dalam badan manusia dewasa?"
  },
  "opts": [
   {
    "en": "206",
    "ms": "206"
   },
   {
    "en": "186",
    "ms": "186"
   },
   {
    "en": "226",
    "ms": "226"
   },
   {
    "en": "300",
    "ms": "300"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g28",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the largest organ of the human body?",
   "ms": "Apakah organ terbesar badan manusia?"
  },
  "opts": [
   {
    "en": "Skin",
    "ms": "Kulit"
   },
   {
    "en": "Liver",
    "ms": "Hati"
   },
   {
    "en": "Brain",
    "ms": "Otak"
   },
   {
    "en": "Lungs",
    "ms": "Paru-paru"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g29",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which organ pumps blood around the body?",
   "ms": "Organ manakah yang mengepam darah ke seluruh badan?"
  },
  "opts": [
   {
    "en": "Heart",
    "ms": "Jantung"
   },
   {
    "en": "Lungs",
    "ms": "Paru-paru"
   },
   {
    "en": "Liver",
    "ms": "Hati"
   },
   {
    "en": "Kidney",
    "ms": "Buah pinggang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g30",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many teeth does an adult usually have, including wisdom teeth?",
   "ms": "Berapakah gigi yang biasa dimiliki orang dewasa, termasuk gigi bongsu?"
  },
  "opts": [
   {
    "en": "32",
    "ms": "32"
   },
   {
    "en": "28",
    "ms": "28"
   },
   {
    "en": "24",
    "ms": "24"
   },
   {
    "en": "36",
    "ms": "36"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g31",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which vitamin does our skin make from sunlight?",
   "ms": "Vitamin manakah yang dihasilkan oleh kulit daripada cahaya matahari?"
  },
  "opts": [
   {
    "en": "Vitamin D",
    "ms": "Vitamin D"
   },
   {
    "en": "Vitamin C",
    "ms": "Vitamin C"
   },
   {
    "en": "Vitamin A",
    "ms": "Vitamin A"
   },
   {
    "en": "Vitamin B12",
    "ms": "Vitamin B12"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g32",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Where is the smallest bone in the human body?",
   "ms": "Di manakah tulang terkecil dalam badan manusia?"
  },
  "opts": [
   {
    "en": "In the ear",
    "ms": "Di dalam telinga"
   },
   {
    "en": "In the finger",
    "ms": "Di jari"
   },
   {
    "en": "In the nose",
    "ms": "Di hidung"
   },
   {
    "en": "In the toe",
    "ms": "Di jari kaki"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g33",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which organs filter the blood and make urine?",
   "ms": "Organ manakah yang menapis darah dan menghasilkan air kencing?"
  },
  "opts": [
   {
    "en": "Kidneys",
    "ms": "Buah pinggang"
   },
   {
    "en": "Lungs",
    "ms": "Paru-paru"
   },
   {
    "en": "Stomach",
    "ms": "Perut"
   },
   {
    "en": "Heart",
    "ms": "Jantung"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g34",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the longest bone in the human body?",
   "ms": "Apakah tulang terpanjang dalam badan manusia?"
  },
  "opts": [
   {
    "en": "Femur (thigh bone)",
    "ms": "Femur (tulang paha)"
   },
   {
    "en": "Spine",
    "ms": "Tulang belakang"
   },
   {
    "en": "Humerus (upper arm)",
    "ms": "Humerus (lengan atas)"
   },
   {
    "en": "Rib",
    "ms": "Tulang rusuk"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g35",
  "cat": "Body",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which organs do we use to breathe?",
   "ms": "Organ manakah yang kita gunakan untuk bernafas?"
  },
  "opts": [
   {
    "en": "Lungs",
    "ms": "Paru-paru"
   },
   {
    "en": "Kidneys",
    "ms": "Buah pinggang"
   },
   {
    "en": "Liver",
    "ms": "Hati"
   },
   {
    "en": "Stomach",
    "ms": "Perut"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g36",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the largest animal in the world?",
   "ms": "Apakah haiwan terbesar di dunia?"
  },
  "opts": [
   {
    "en": "Blue whale",
    "ms": "Ikan paus biru"
   },
   {
    "en": "African elephant",
    "ms": "Gajah Afrika"
   },
   {
    "en": "Whale shark",
    "ms": "Jerung paus"
   },
   {
    "en": "Giraffe",
    "ms": "Zirafah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g37",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the fastest land animal?",
   "ms": "Apakah haiwan darat yang paling laju?"
  },
  "opts": [
   {
    "en": "Cheetah",
    "ms": "Cheetah"
   },
   {
    "en": "Lion",
    "ms": "Singa"
   },
   {
    "en": "Horse",
    "ms": "Kuda"
   },
   {
    "en": "Kangaroo",
    "ms": "Kanggaru"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g38",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the tallest animal?",
   "ms": "Apakah haiwan yang paling tinggi?"
  },
  "opts": [
   {
    "en": "Giraffe",
    "ms": "Zirafah"
   },
   {
    "en": "Elephant",
    "ms": "Gajah"
   },
   {
    "en": "Camel",
    "ms": "Unta"
   },
   {
    "en": "Ostrich",
    "ms": "Burung unta"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g39",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which mammal can truly fly?",
   "ms": "Mamalia manakah yang benar-benar boleh terbang?"
  },
  "opts": [
   {
    "en": "Bat",
    "ms": "Kelawar"
   },
   {
    "en": "Flying squirrel",
    "ms": "Tupai terbang"
   },
   {
    "en": "Colugo",
    "ms": "Kubung"
   },
   {
    "en": "Penguin",
    "ms": "Penguin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g40",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many legs does a spider have?",
   "ms": "Berapakah kaki labah-labah?"
  },
  "opts": [
   {
    "en": "8",
    "ms": "8"
   },
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "10",
    "ms": "10"
   },
   {
    "en": "4",
    "ms": "4"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g41",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many legs does an insect have?",
   "ms": "Berapakah kaki serangga?"
  },
  "opts": [
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "8",
    "ms": "8"
   },
   {
    "en": "4",
    "ms": "4"
   },
   {
    "en": "10",
    "ms": "10"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g42",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is a baby frog called?",
   "ms": "Apakah nama anak katak?"
  },
  "opts": [
   {
    "en": "Tadpole",
    "ms": "Berudu"
   },
   {
    "en": "Cub",
    "ms": "Anak beruang"
   },
   {
    "en": "Calf",
    "ms": "Anak lembu"
   },
   {
    "en": "Larva",
    "ms": "Larva"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g43",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What does a giant panda mainly eat?",
   "ms": "Apakah makanan utama panda gergasi?"
  },
  "opts": [
   {
    "en": "Bamboo",
    "ms": "Buluh"
   },
   {
    "en": "Fish",
    "ms": "Ikan"
   },
   {
    "en": "Fruit",
    "ms": "Buah-buahan"
   },
   {
    "en": "Insects",
    "ms": "Serangga"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g44",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the largest bird in the world?",
   "ms": "Apakah burung terbesar di dunia?"
  },
  "opts": [
   {
    "en": "Ostrich",
    "ms": "Burung unta"
   },
   {
    "en": "Eagle",
    "ms": "Helang"
   },
   {
    "en": "Emu",
    "ms": "Emu"
   },
   {
    "en": "Penguin",
    "ms": "Penguin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g45",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which animal is called the 'ship of the desert'?",
   "ms": "Haiwan manakah digelar 'kapal padang pasir'?"
  },
  "opts": [
   {
    "en": "Camel",
    "ms": "Unta"
   },
   {
    "en": "Horse",
    "ms": "Kuda"
   },
   {
    "en": "Donkey",
    "ms": "Keldai"
   },
   {
    "en": "Goat",
    "ms": "Kambing"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g46",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "A caterpillar turning into a butterfly is called…",
   "ms": "Ulat bertukar menjadi rama-rama dipanggil…"
  },
  "opts": [
   {
    "en": "Metamorphosis",
    "ms": "Metamorfosis"
   },
   {
    "en": "Photosynthesis",
    "ms": "Fotosintesis"
   },
   {
    "en": "Evolution",
    "ms": "Evolusi"
   },
   {
    "en": "Migration",
    "ms": "Migrasi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g47",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which animal has black and white stripes?",
   "ms": "Haiwan manakah mempunyai jalur hitam dan putih?"
  },
  "opts": [
   {
    "en": "Zebra",
    "ms": "Kuda belang"
   },
   {
    "en": "Tiger",
    "ms": "Harimau"
   },
   {
    "en": "Leopard",
    "ms": "Harimau bintang"
   },
   {
    "en": "Giraffe",
    "ms": "Zirafah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g48",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What do bees make?",
   "ms": "Apakah yang dihasilkan oleh lebah?"
  },
  "opts": [
   {
    "en": "Honey",
    "ms": "Madu"
   },
   {
    "en": "Milk",
    "ms": "Susu"
   },
   {
    "en": "Silk",
    "ms": "Sutera"
   },
   {
    "en": "Sugar",
    "ms": "Gula"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g49",
  "cat": "Nature",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the tallest type of grass?",
   "ms": "Apakah jenis rumput yang paling tinggi?"
  },
  "opts": [
   {
    "en": "Bamboo",
    "ms": "Buluh"
   },
   {
    "en": "Sugar cane",
    "ms": "Tebu"
   },
   {
    "en": "Lalang",
    "ms": "Lalang"
   },
   {
    "en": "Rice",
    "ms": "Padi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g50",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the square root of 81?",
   "ms": "Apakah punca kuasa dua bagi 81?"
  },
  "opts": [
   {
    "en": "9",
    "ms": "9"
   },
   {
    "en": "8",
    "ms": "8"
   },
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "11",
    "ms": "11"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g51",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is 12 × 12?",
   "ms": "Berapakah 12 × 12?"
  },
  "opts": [
   {
    "en": "144",
    "ms": "144"
   },
   {
    "en": "124",
    "ms": "124"
   },
   {
    "en": "132",
    "ms": "132"
   },
   {
    "en": "154",
    "ms": "154"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g52",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many degrees are in a right angle?",
   "ms": "Berapakah darjah dalam sudut tegak?"
  },
  "opts": [
   {
    "en": "90°",
    "ms": "90°"
   },
   {
    "en": "180°",
    "ms": "180°"
   },
   {
    "en": "45°",
    "ms": "45°"
   },
   {
    "en": "60°",
    "ms": "60°"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g53",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many sides does a hexagon have?",
   "ms": "Berapakah sisi sebuah heksagon?"
  },
  "opts": [
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "8",
    "ms": "8"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g54",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the value of pi (π), to two decimal places?",
   "ms": "Apakah nilai pi (π), kepada dua tempat perpuluhan?"
  },
  "opts": [
   {
    "en": "3.14",
    "ms": "3.14"
   },
   {
    "en": "3.41",
    "ms": "3.41"
   },
   {
    "en": "2.14",
    "ms": "2.14"
   },
   {
    "en": "3.04",
    "ms": "3.04"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g55",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What number is the Roman numeral X?",
   "ms": "Nombor Roman X ialah berapa?"
  },
  "opts": [
   {
    "en": "10",
    "ms": "10"
   },
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "50",
    "ms": "50"
   },
   {
    "en": "100",
    "ms": "100"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g56",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many minutes are in 2 hours?",
   "ms": "Berapakah minit dalam 2 jam?"
  },
  "opts": [
   {
    "en": "120",
    "ms": "120"
   },
   {
    "en": "100",
    "ms": "100"
   },
   {
    "en": "200",
    "ms": "200"
   },
   {
    "en": "90",
    "ms": "90"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g57",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which of these is a prime number?",
   "ms": "Antara berikut, yang manakah nombor perdana?"
  },
  "opts": [
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "9",
    "ms": "9"
   },
   {
    "en": "15",
    "ms": "15"
   },
   {
    "en": "21",
    "ms": "21"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g58",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many days are in a leap year?",
   "ms": "Berapakah hari dalam tahun lompat?"
  },
  "opts": [
   {
    "en": "366",
    "ms": "366"
   },
   {
    "en": "365",
    "ms": "365"
   },
   {
    "en": "364",
    "ms": "364"
   },
   {
    "en": "367",
    "ms": "367"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g59",
  "cat": "Maths",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is 25% of 200?",
   "ms": "Berapakah 25% daripada 200?"
  },
  "opts": [
   {
    "en": "50",
    "ms": "50"
   },
   {
    "en": "25",
    "ms": "25"
   },
   {
    "en": "75",
    "ms": "75"
   },
   {
    "en": "100",
    "ms": "100"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g60",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who is credited with inventing the telephone?",
   "ms": "Siapakah yang dikreditkan sebagai pencipta telefon?"
  },
  "opts": [
   {
    "en": "Alexander Graham Bell",
    "ms": "Alexander Graham Bell"
   },
   {
    "en": "Thomas Edison",
    "ms": "Thomas Edison"
   },
   {
    "en": "Nikola Tesla",
    "ms": "Nikola Tesla"
   },
   {
    "en": "Guglielmo Marconi",
    "ms": "Guglielmo Marconi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g61",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who developed the theory of relativity?",
   "ms": "Siapakah yang membangunkan teori kerelatifan?"
  },
  "opts": [
   {
    "en": "Albert Einstein",
    "ms": "Albert Einstein"
   },
   {
    "en": "Isaac Newton",
    "ms": "Isaac Newton"
   },
   {
    "en": "Galileo Galilei",
    "ms": "Galileo Galilei"
   },
   {
    "en": "Stephen Hawking",
    "ms": "Stephen Hawking"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g62",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who discovered penicillin?",
   "ms": "Siapakah yang menemui penisilin?"
  },
  "opts": [
   {
    "en": "Alexander Fleming",
    "ms": "Alexander Fleming"
   },
   {
    "en": "Louis Pasteur",
    "ms": "Louis Pasteur"
   },
   {
    "en": "Marie Curie",
    "ms": "Marie Curie"
   },
   {
    "en": "Charles Darwin",
    "ms": "Charles Darwin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g63",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who painted the Mona Lisa?",
   "ms": "Siapakah yang melukis Mona Lisa?"
  },
  "opts": [
   {
    "en": "Leonardo da Vinci",
    "ms": "Leonardo da Vinci"
   },
   {
    "en": "Pablo Picasso",
    "ms": "Pablo Picasso"
   },
   {
    "en": "Vincent van Gogh",
    "ms": "Vincent van Gogh"
   },
   {
    "en": "Michelangelo",
    "ms": "Michelangelo"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g64",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who invented the World Wide Web?",
   "ms": "Siapakah yang mencipta World Wide Web?"
  },
  "opts": [
   {
    "en": "Tim Berners-Lee",
    "ms": "Tim Berners-Lee"
   },
   {
    "en": "Bill Gates",
    "ms": "Bill Gates"
   },
   {
    "en": "Steve Jobs",
    "ms": "Steve Jobs"
   },
   {
    "en": "Mark Zuckerberg",
    "ms": "Mark Zuckerberg"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g65",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "The Wright brothers made the first powered flight in what?",
   "ms": "Adik-beradik Wright membuat penerbangan berkuasa pertama dengan apa?"
  },
  "opts": [
   {
    "en": "An aeroplane",
    "ms": "Kapal terbang"
   },
   {
    "en": "A hot-air balloon",
    "ms": "Belon udara panas"
   },
   {
    "en": "A helicopter",
    "ms": "Helikopter"
   },
   {
    "en": "A rocket",
    "ms": "Roket"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g66",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which scientist is famous for the story of an apple falling and gravity?",
   "ms": "Saintis manakah terkenal dengan kisah epal jatuh dan graviti?"
  },
  "opts": [
   {
    "en": "Isaac Newton",
    "ms": "Isaac Newton"
   },
   {
    "en": "Albert Einstein",
    "ms": "Albert Einstein"
   },
   {
    "en": "Galileo Galilei",
    "ms": "Galileo Galilei"
   },
   {
    "en": "Thomas Edison",
    "ms": "Thomas Edison"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g67",
  "cat": "People",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Who wrote 'Romeo and Juliet'?",
   "ms": "Siapakah yang menulis 'Romeo dan Juliet'?"
  },
  "opts": [
   {
    "en": "William Shakespeare",
    "ms": "William Shakespeare"
   },
   {
    "en": "Charles Dickens",
    "ms": "Charles Dickens"
   },
   {
    "en": "Mark Twain",
    "ms": "Mark Twain"
   },
   {
    "en": "Jane Austen",
    "ms": "Jane Austen"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g68",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many players does a football team have on the field?",
   "ms": "Berapakah pemain bola sepak satu pasukan di padang?"
  },
  "opts": [
   {
    "en": "11",
    "ms": "11"
   },
   {
    "en": "10",
    "ms": "10"
   },
   {
    "en": "9",
    "ms": "9"
   },
   {
    "en": "12",
    "ms": "12"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g69",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many rings are on the Olympic flag?",
   "ms": "Berapakah gelang pada bendera Olimpik?"
  },
  "opts": [
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "4",
    "ms": "4"
   },
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "7",
    "ms": "7"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g70",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which sport uses a shuttlecock?",
   "ms": "Sukan manakah menggunakan bulu tangkis?"
  },
  "opts": [
   {
    "en": "Badminton",
    "ms": "Badminton"
   },
   {
    "en": "Tennis",
    "ms": "Tenis"
   },
   {
    "en": "Squash",
    "ms": "Skuasy"
   },
   {
    "en": "Volleyball",
    "ms": "Bola tampar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g71",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many holes are on a standard golf course?",
   "ms": "Berapakah lubang di padang golf standard?"
  },
  "opts": [
   {
    "en": "18",
    "ms": "18"
   },
   {
    "en": "9",
    "ms": "9"
   },
   {
    "en": "12",
    "ms": "12"
   },
   {
    "en": "21",
    "ms": "21"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g72",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How often is the FIFA World Cup held?",
   "ms": "Berapa kerapkah Piala Dunia FIFA diadakan?"
  },
  "opts": [
   {
    "en": "Every 4 years",
    "ms": "Setiap 4 tahun"
   },
   {
    "en": "Every 2 years",
    "ms": "Setiap 2 tahun"
   },
   {
    "en": "Every year",
    "ms": "Setiap tahun"
   },
   {
    "en": "Every 5 years",
    "ms": "Setiap 5 tahun"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g73",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many players from one team are on a basketball court at a time?",
   "ms": "Berapakah pemain satu pasukan di gelanggang bola keranjang pada satu masa?"
  },
  "opts": [
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "4",
    "ms": "4"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g74",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "In which sport is a score of zero called 'love'?",
   "ms": "Dalam sukan manakah mata kosong dipanggil 'love'?"
  },
  "opts": [
   {
    "en": "Tennis",
    "ms": "Tenis"
   },
   {
    "en": "Badminton",
    "ms": "Badminton"
   },
   {
    "en": "Golf",
    "ms": "Golf"
   },
   {
    "en": "Cricket",
    "ms": "Kriket"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g75",
  "cat": "Sports",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "About how long is a marathon?",
   "ms": "Kira-kira berapa jauhkah larian maraton?"
  },
  "opts": [
   {
    "en": "42 km",
    "ms": "42 km"
   },
   {
    "en": "21 km",
    "ms": "21 km"
   },
   {
    "en": "10 km",
    "ms": "10 km"
   },
   {
    "en": "50 km",
    "ms": "50 km"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g76",
  "cat": "General",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What colour do you get by mixing blue and yellow?",
   "ms": "Warna apakah yang terhasil apabila biru dan kuning dicampur?"
  },
  "opts": [
   {
    "en": "Green",
    "ms": "Hijau"
   },
   {
    "en": "Purple",
    "ms": "Ungu"
   },
   {
    "en": "Orange",
    "ms": "Oren"
   },
   {
    "en": "Brown",
    "ms": "Coklat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g77",
  "cat": "General",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "How many colours are in a rainbow?",
   "ms": "Berapakah warna dalam pelangi?"
  },
  "opts": [
   {
    "en": "7",
    "ms": "7"
   },
   {
    "en": "5",
    "ms": "5"
   },
   {
    "en": "6",
    "ms": "6"
   },
   {
    "en": "8",
    "ms": "8"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g78",
  "cat": "General",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "A word that means the opposite of another word is called…",
   "ms": "Perkataan yang membawa maksud berlawanan dipanggil…"
  },
  "opts": [
   {
    "en": "Antonym",
    "ms": "Antonim"
   },
   {
    "en": "Synonym",
    "ms": "Sinonim"
   },
   {
    "en": "Homonym",
    "ms": "Homonim"
   },
   {
    "en": "Acronym",
    "ms": "Akronim"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g79",
  "cat": "General",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "Which musical instrument usually has 88 keys?",
   "ms": "Alat muzik manakah yang biasanya mempunyai 88 kekunci?"
  },
  "opts": [
   {
    "en": "Piano",
    "ms": "Piano"
   },
   {
    "en": "Guitar",
    "ms": "Gitar"
   },
   {
    "en": "Violin",
    "ms": "Biola"
   },
   {
    "en": "Flute",
    "ms": "Seruling"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g80",
  "cat": "General",
  "set": "general",
  "type": "mc",
  "q": {
   "en": "What is the main language spoken in Brazil?",
   "ms": "Apakah bahasa utama yang dituturkan di Brazil?"
  },
  "opts": [
   {
    "en": "Portuguese",
    "ms": "Bahasa Portugis"
   },
   {
    "en": "Spanish",
    "ms": "Bahasa Sepanyol"
   },
   {
    "en": "English",
    "ms": "Bahasa Inggeris"
   },
   {
    "en": "French",
    "ms": "Bahasa Perancis"
   }
  ],
  "ans": 0,
  "enabled": true
 }
];
