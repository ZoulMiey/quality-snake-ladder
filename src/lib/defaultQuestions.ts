// First draft of the question bank (63 questions). Correct answers are shuffled for each player in the game.
import type { Question } from "./types.ts";

export const DEFAULT_QUESTIONS: Question[] = [
 {
  "id": "q01",
  "cat": "Quality Basics",
  "type": "mc",
  "q": {
   "en": "World Quality Day is celebrated in which month?",
   "ms": "Hari Kualiti Sedunia disambut pada bulan apa?"
  },
  "opts": [
   {
    "en": "November",
    "ms": "November"
   },
   {
    "en": "March",
    "ms": "Mac"
   },
   {
    "en": "June",
    "ms": "Jun"
   },
   {
    "en": "August",
    "ms": "Ogos"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q02",
  "cat": "Quality Basics",
  "type": "mc",
  "q": {
   "en": "According to ISO 9000, quality means…",
   "ms": "Menurut ISO 9000, kualiti bermaksud…"
  },
  "opts": [
   {
    "en": "Meeting requirements",
    "ms": "Memenuhi keperluan"
   },
   {
    "en": "The most expensive product",
    "ms": "Produk yang paling mahal"
   },
   {
    "en": "The fastest production",
    "ms": "Pengeluaran yang paling cepat"
   },
   {
    "en": "The nicest packaging",
    "ms": "Pembungkusan yang paling cantik"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q03",
  "cat": "Quality Basics",
  "type": "tf",
  "q": {
   "en": "Quality is only the responsibility of the QA department.",
   "ms": "Kualiti hanya tanggungjawab jabatan QA."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q04",
  "cat": "Quality Basics",
  "type": "mc",
  "q": {
   "en": "Who finally decides whether a product is good quality?",
   "ms": "Siapakah yang akhirnya menentukan sama ada sesuatu produk itu berkualiti?"
  },
  "opts": [
   {
    "en": "The customer",
    "ms": "Pelanggan"
   },
   {
    "en": "The supplier",
    "ms": "Pembekal"
   },
   {
    "en": "The machine",
    "ms": "Mesin"
   },
   {
    "en": "The auditor",
    "ms": "Juruaudit"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q05",
  "cat": "Quality Basics",
  "type": "tf",
  "q": {
   "en": "Preventing a defect costs less than fixing it after it reaches the customer.",
   "ms": "Mencegah kecacatan lebih murah berbanding membaikinya selepas produk sampai kepada pelanggan."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q06",
  "cat": "Quality Basics",
  "type": "mc",
  "q": {
   "en": "What does \"Right First Time\" mean?",
   "ms": "Apakah maksud \"Betul Pada Kali Pertama\"?"
  },
  "opts": [
   {
    "en": "Do it correctly the first time, with no rework",
    "ms": "Buat dengan betul pada kali pertama, tanpa kerja semula"
   },
   {
    "en": "Be the first to finish",
    "ms": "Siap paling awal"
   },
   {
    "en": "Check only the first product",
    "ms": "Periksa produk pertama sahaja"
   },
   {
    "en": "Start work early",
    "ms": "Mula kerja lebih awal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q07",
  "cat": "Quality Basics",
  "type": "mc",
  "q": {
   "en": "Which one is a cost of poor quality?",
   "ms": "Yang manakah kos akibat kualiti yang rendah?"
  },
  "opts": [
   {
    "en": "Rework and scrap",
    "ms": "Kerja semula dan sisa buangan"
   },
   {
    "en": "Staff salaries",
    "ms": "Gaji pekerja"
   },
   {
    "en": "Office rent",
    "ms": "Sewa pejabat"
   },
   {
    "en": "Electricity bills",
    "ms": "Bil elektrik"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q08",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "ISO 9001 is a standard for…",
   "ms": "ISO 9001 ialah standard untuk…"
  },
  "opts": [
   {
    "en": "Quality management system",
    "ms": "Sistem pengurusan kualiti"
   },
   {
    "en": "Environmental management",
    "ms": "Pengurusan alam sekitar"
   },
   {
    "en": "Food safety",
    "ms": "Keselamatan makanan"
   },
   {
    "en": "Information security",
    "ms": "Keselamatan maklumat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q09",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "ISO 14001 is about…",
   "ms": "ISO 14001 berkaitan dengan…"
  },
  "opts": [
   {
    "en": "Environmental management",
    "ms": "Pengurusan alam sekitar"
   },
   {
    "en": "Quality management",
    "ms": "Pengurusan kualiti"
   },
   {
    "en": "Occupational safety",
    "ms": "Keselamatan pekerjaan"
   },
   {
    "en": "Energy management",
    "ms": "Pengurusan tenaga"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q10",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "ISO 45001 is about…",
   "ms": "ISO 45001 berkaitan dengan…"
  },
  "opts": [
   {
    "en": "Occupational health and safety",
    "ms": "Keselamatan dan kesihatan pekerjaan"
   },
   {
    "en": "Food safety",
    "ms": "Keselamatan makanan"
   },
   {
    "en": "Product design",
    "ms": "Reka bentuk produk"
   },
   {
    "en": "Financial audit",
    "ms": "Audit kewangan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q11",
  "cat": "ISO Standards",
  "type": "tf",
  "q": {
   "en": "Once a company gets ISO 9001 certification, it never needs to be audited again.",
   "ms": "Selepas syarikat mendapat pensijilan ISO 9001, ia tidak perlu diaudit lagi."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q12",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "What does ISO stand for?",
   "ms": "Apakah maksud ISO?"
  },
  "opts": [
   {
    "en": "International Organization for Standardization",
    "ms": "Pertubuhan Antarabangsa bagi Pemiawaian"
   },
   {
    "en": "International Standard Office",
    "ms": "Pejabat Standard Antarabangsa"
   },
   {
    "en": "Internal System Operation",
    "ms": "Operasi Sistem Dalaman"
   },
   {
    "en": "Industrial Safety Organization",
    "ms": "Pertubuhan Keselamatan Industri"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q13",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "Which one is a quality management principle in ISO 9000?",
   "ms": "Yang manakah prinsip pengurusan kualiti dalam ISO 9000?"
  },
  "opts": [
   {
    "en": "Customer focus",
    "ms": "Fokus kepada pelanggan"
   },
   {
    "en": "Maximum overtime",
    "ms": "Kerja lebih masa maksimum"
   },
   {
    "en": "Lowest price",
    "ms": "Harga paling rendah"
   },
   {
    "en": "Only one supplier",
    "ms": "Hanya seorang pembekal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q14",
  "cat": "ISO Standards",
  "type": "tf",
  "q": {
   "en": "Risk-based thinking is part of ISO 9001:2015.",
   "ms": "Pemikiran berasaskan risiko adalah sebahagian daripada ISO 9001:2015."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q15",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "What does PDCA stand for?",
   "ms": "Apakah maksud PDCA?"
  },
  "opts": [
   {
    "en": "Plan – Do – Check – Act",
    "ms": "Rancang – Laksana – Semak – Tindak"
   },
   {
    "en": "Prepare – Do – Control – Approve",
    "ms": "Sedia – Laksana – Kawal – Lulus"
   },
   {
    "en": "Plan – Deliver – Check – Audit",
    "ms": "Rancang – Hantar – Semak – Audit"
   },
   {
    "en": "Product – Design – Cost – Analysis",
    "ms": "Produk – Reka Bentuk – Kos – Analisis"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q16",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "In PDCA, which step compares the results with the plan?",
   "ms": "Dalam PDCA, langkah manakah membandingkan keputusan dengan rancangan?"
  },
  "opts": [
   {
    "en": "Check",
    "ms": "Semak"
   },
   {
    "en": "Plan",
    "ms": "Rancang"
   },
   {
    "en": "Do",
    "ms": "Laksana"
   },
   {
    "en": "Act",
    "ms": "Tindak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q17",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "The Japanese word \"Kaizen\" means…",
   "ms": "Perkataan Jepun \"Kaizen\" bermaksud…"
  },
  "opts": [
   {
    "en": "Continuous improvement",
    "ms": "Penambahbaikan berterusan"
   },
   {
    "en": "Quick inspection",
    "ms": "Pemeriksaan pantas"
   },
   {
    "en": "Zero waste",
    "ms": "Sifar pembaziran"
   },
   {
    "en": "Teamwork",
    "ms": "Kerja berpasukan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q18",
  "cat": "Continuous Improvement",
  "type": "tf",
  "q": {
   "en": "Kaizen is about small improvements made every day by everyone.",
   "ms": "Kaizen ialah penambahbaikan kecil yang dibuat setiap hari oleh semua orang."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q19",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "Six Sigma mainly aims to reduce…",
   "ms": "Six Sigma bertujuan utama untuk mengurangkan…"
  },
  "opts": [
   {
    "en": "Variation and defects",
    "ms": "Variasi dan kecacatan"
   },
   {
    "en": "Number of staff",
    "ms": "Bilangan pekerja"
   },
   {
    "en": "Production speed",
    "ms": "Kelajuan pengeluaran"
   },
   {
    "en": "Product price",
    "ms": "Harga produk"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q20",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "In Six Sigma DMAIC, what does the \"M\" stand for?",
   "ms": "Dalam DMAIC Six Sigma, apakah maksud \"M\"?"
  },
  "opts": [
   {
    "en": "Measure",
    "ms": "Ukur"
   },
   {
    "en": "Manage",
    "ms": "Urus"
   },
   {
    "en": "Maintain",
    "ms": "Selenggara"
   },
   {
    "en": "Monitor",
    "ms": "Pantau"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q21",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "Lean manufacturing focuses on removing…",
   "ms": "Pembuatan Lean memberi tumpuan kepada menghapuskan…"
  },
  "opts": [
   {
    "en": "Waste",
    "ms": "Pembaziran"
   },
   {
    "en": "Workers",
    "ms": "Pekerja"
   },
   {
    "en": "Machines",
    "ms": "Mesin"
   },
   {
    "en": "Customers",
    "ms": "Pelanggan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q22",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "Which one is NOT one of the 8 wastes in Lean?",
   "ms": "Yang manakah BUKAN salah satu daripada 8 pembaziran dalam Lean?"
  },
  "opts": [
   {
    "en": "Training",
    "ms": "Latihan"
   },
   {
    "en": "Overproduction",
    "ms": "Pengeluaran berlebihan"
   },
   {
    "en": "Waiting",
    "ms": "Menunggu"
   },
   {
    "en": "Defects",
    "ms": "Kecacatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q23",
  "cat": "Continuous Improvement",
  "type": "tf",
  "q": {
   "en": "Making more products than the customer needs is a waste.",
   "ms": "Mengeluarkan produk lebih daripada keperluan pelanggan adalah satu pembaziran."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q24",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "\"Poka-yoke\" means…",
   "ms": "\"Poka-yoke\" bermaksud…"
  },
  "opts": [
   {
    "en": "Mistake-proofing",
    "ms": "Kalis kesilapan"
   },
   {
    "en": "Fast production",
    "ms": "Pengeluaran pantas"
   },
   {
    "en": "Final inspection",
    "ms": "Pemeriksaan akhir"
   },
   {
    "en": "Machine cleaning",
    "ms": "Pembersihan mesin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q25",
  "cat": "5S",
  "type": "mc",
  "q": {
   "en": "What is the first S in 5S?",
   "ms": "Apakah S yang pertama dalam 5S?"
  },
  "opts": [
   {
    "en": "Sort (Seiri)",
    "ms": "Sisih (Seiri)"
   },
   {
    "en": "Shine (Seiso)",
    "ms": "Sapu (Seiso)"
   },
   {
    "en": "Standardize (Seiketsu)",
    "ms": "Seragam (Seiketsu)"
   },
   {
    "en": "Sustain (Shitsuke)",
    "ms": "Sentiasa amal (Shitsuke)"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q26",
  "cat": "5S",
  "type": "mc",
  "q": {
   "en": "\"A place for everything, and everything in its place\" describes which S?",
   "ms": "\"Setiap barang ada tempatnya, dan setiap barang di tempatnya\" menerangkan S yang mana?"
  },
  "opts": [
   {
    "en": "Set in order (Seiton)",
    "ms": "Susun (Seiton)"
   },
   {
    "en": "Sort (Seiri)",
    "ms": "Sisih (Seiri)"
   },
   {
    "en": "Shine (Seiso)",
    "ms": "Sapu (Seiso)"
   },
   {
    "en": "Sustain (Shitsuke)",
    "ms": "Sentiasa amal (Shitsuke)"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q27",
  "cat": "5S",
  "type": "mc",
  "q": {
   "en": "The 5th S, \"Sustain\", means…",
   "ms": "S kelima, \"Sentiasa amal\", bermaksud…"
  },
  "opts": [
   {
    "en": "Make 5S a daily habit",
    "ms": "Jadikan 5S amalan harian"
   },
   {
    "en": "Clean once a year",
    "ms": "Bersihkan sekali setahun"
   },
   {
    "en": "Buy new equipment",
    "ms": "Beli peralatan baharu"
   },
   {
    "en": "Paint the floor",
    "ms": "Cat lantai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q28",
  "cat": "5S",
  "type": "tf",
  "q": {
   "en": "5S is only about cleaning.",
   "ms": "5S hanya berkaitan dengan pembersihan."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q29",
  "cat": "5S",
  "type": "mc",
  "q": {
   "en": "In 5S, a red tag is used to…",
   "ms": "Dalam 5S, tag merah digunakan untuk…"
  },
  "opts": [
   {
    "en": "Mark items that are not needed",
    "ms": "Menandakan barang yang tidak diperlukan"
   },
   {
    "en": "Mark the best workstation",
    "ms": "Menandakan stesen kerja terbaik"
   },
   {
    "en": "Mark items for sale",
    "ms": "Menandakan barang untuk dijual"
   },
   {
    "en": "Mark finished goods",
    "ms": "Menandakan barang siap"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q30",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "Which tool is also called the \"fishbone diagram\"?",
   "ms": "Alat manakah yang juga dipanggil \"rajah tulang ikan\"?"
  },
  "opts": [
   {
    "en": "Cause-and-effect (Ishikawa) diagram",
    "ms": "Rajah sebab dan akibat (Ishikawa)"
   },
   {
    "en": "Pareto chart",
    "ms": "Carta Pareto"
   },
   {
    "en": "Histogram",
    "ms": "Histogram"
   },
   {
    "en": "Control chart",
    "ms": "Carta kawalan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q31",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "The Pareto principle is also known as the…",
   "ms": "Prinsip Pareto juga dikenali sebagai…"
  },
  "opts": [
   {
    "en": "80/20 rule",
    "ms": "Peraturan 80/20"
   },
   {
    "en": "50/50 rule",
    "ms": "Peraturan 50/50"
   },
   {
    "en": "3-sigma rule",
    "ms": "Peraturan 3-sigma"
   },
   {
    "en": "1-10-100 rule",
    "ms": "Peraturan 1-10-100"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q32",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "A control chart is used to…",
   "ms": "Carta kawalan digunakan untuk…"
  },
  "opts": [
   {
    "en": "Monitor process variation over time",
    "ms": "Memantau variasi proses dari semasa ke semasa"
   },
   {
    "en": "Plan the production schedule",
    "ms": "Merancang jadual pengeluaran"
   },
   {
    "en": "Count stock in the warehouse",
    "ms": "Mengira stok di gudang"
   },
   {
    "en": "Draw the factory layout",
    "ms": "Melukis susun atur kilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q33",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "A histogram shows…",
   "ms": "Histogram menunjukkan…"
  },
  "opts": [
   {
    "en": "How often each value occurs in the data",
    "ms": "Kekerapan setiap nilai dalam data"
   },
   {
    "en": "The steps of a process",
    "ms": "Langkah-langkah sesuatu proses"
   },
   {
    "en": "The organisation chart",
    "ms": "Carta organisasi"
   },
   {
    "en": "The root cause of a problem",
    "ms": "Punca sebenar masalah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q34",
  "cat": "QC Tools",
  "type": "tf",
  "q": {
   "en": "A check sheet is a simple form used to collect data.",
   "ms": "Helaian semak ialah borang mudah untuk mengumpul data."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q35",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "The 6M in a fishbone diagram are Man, Machine, Method, Material, Measurement and…",
   "ms": "6M dalam rajah tulang ikan ialah Manusia, Mesin, Kaedah, Bahan, Pengukuran dan…"
  },
  "opts": [
   {
    "en": "Mother Nature (Environment)",
    "ms": "Persekitaran"
   },
   {
    "en": "Money",
    "ms": "Wang"
   },
   {
    "en": "Marketing",
    "ms": "Pemasaran"
   },
   {
    "en": "Meeting",
    "ms": "Mesyuarat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q36",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "A scatter diagram shows…",
   "ms": "Rajah serakan menunjukkan…"
  },
  "opts": [
   {
    "en": "The relationship between two variables",
    "ms": "Hubungan antara dua pemboleh ubah"
   },
   {
    "en": "The order of process steps",
    "ms": "Urutan langkah proses"
   },
   {
    "en": "The cost of a product",
    "ms": "Kos sesuatu produk"
   },
   {
    "en": "The number of complaints per month",
    "ms": "Bilangan aduan setiap bulan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q37",
  "cat": "QC Tools",
  "type": "tf",
  "q": {
   "en": "A flowchart shows the steps of a process in order.",
   "ms": "Carta alir menunjukkan langkah-langkah proses mengikut urutan."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q38",
  "cat": "Problem Solving",
  "type": "mc",
  "q": {
   "en": "The \"5 Whys\" technique helps you find the…",
   "ms": "Teknik \"5 Kenapa\" membantu mencari…"
  },
  "opts": [
   {
    "en": "Root cause",
    "ms": "Punca sebenar"
   },
   {
    "en": "Person to blame",
    "ms": "Orang yang patut disalahkan"
   },
   {
    "en": "Cheapest supplier",
    "ms": "Pembekal paling murah"
   },
   {
    "en": "Fastest solution",
    "ms": "Penyelesaian paling cepat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q39",
  "cat": "Problem Solving",
  "type": "mc",
  "q": {
   "en": "What does CAPA stand for?",
   "ms": "Apakah maksud CAPA?"
  },
  "opts": [
   {
    "en": "Corrective and Preventive Action",
    "ms": "Tindakan Pembetulan dan Pencegahan"
   },
   {
    "en": "Customer and Product Analysis",
    "ms": "Analisis Pelanggan dan Produk"
   },
   {
    "en": "Check and Approve All",
    "ms": "Semak dan Luluskan Semua"
   },
   {
    "en": "Cost and Price Adjustment",
    "ms": "Pelarasan Kos dan Harga"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q40",
  "cat": "Problem Solving",
  "type": "mc",
  "q": {
   "en": "A corrective action is taken to…",
   "ms": "Tindakan pembetulan diambil untuk…"
  },
  "opts": [
   {
    "en": "Remove the cause so the problem does not happen again",
    "ms": "Menghapuskan punca supaya masalah tidak berulang"
   },
   {
    "en": "Punish the operator",
    "ms": "Menghukum operator"
   },
   {
    "en": "Hide the problem from the auditor",
    "ms": "Menyembunyikan masalah daripada juruaudit"
   },
   {
    "en": "Increase the production target",
    "ms": "Meningkatkan sasaran pengeluaran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q41",
  "cat": "Problem Solving",
  "type": "tf",
  "q": {
   "en": "A preventive action deals with a possible problem before it happens.",
   "ms": "Tindakan pencegahan menangani masalah yang mungkin berlaku sebelum ia berlaku."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q42",
  "cat": "Problem Solving",
  "type": "mc",
  "q": {
   "en": "The 8D method is used for…",
   "ms": "Kaedah 8D digunakan untuk…"
  },
  "opts": [
   {
    "en": "Team-based problem solving",
    "ms": "Penyelesaian masalah secara berpasukan"
   },
   {
    "en": "Delivering goods in 8 days",
    "ms": "Penghantaran barang dalam 8 hari"
   },
   {
    "en": "Allowing 8 defects per batch",
    "ms": "Membenarkan 8 kecacatan setiap kelompok"
   },
   {
    "en": "Designing 8 new products",
    "ms": "Mereka bentuk 8 produk baharu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q43",
  "cat": "Problem Solving",
  "type": "tf",
  "q": {
   "en": "When a problem happens, the first step is to find someone to blame.",
   "ms": "Apabila masalah berlaku, langkah pertama ialah mencari orang untuk dipersalahkan."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q44",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "What does GMP stand for?",
   "ms": "Apakah maksud GMP?"
  },
  "opts": [
   {
    "en": "Good Manufacturing Practice",
    "ms": "Amalan Pengilangan Baik"
   },
   {
    "en": "General Machine Procedure",
    "ms": "Prosedur Mesin Am"
   },
   {
    "en": "Good Material Purchase",
    "ms": "Pembelian Bahan Baik"
   },
   {
    "en": "Global Market Price",
    "ms": "Harga Pasaran Global"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q45",
  "cat": "GMP & Hygiene",
  "type": "tf",
  "q": {
   "en": "In GMP, \"if it is not written down, it did not happen\".",
   "ms": "Dalam GMP, \"jika tidak direkodkan, ia dianggap tidak berlaku\"."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q46",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "Which one should NOT be worn in the production area?",
   "ms": "Yang manakah TIDAK boleh dipakai di kawasan pengeluaran?"
  },
  "opts": [
   {
    "en": "Jewellery",
    "ms": "Barang kemas"
   },
   {
    "en": "Hair net",
    "ms": "Penutup rambut"
   },
   {
    "en": "Safety shoes",
    "ms": "Kasut keselamatan"
   },
   {
    "en": "Clean uniform",
    "ms": "Pakaian seragam yang bersih"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q47",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "What is the correct way to fix a mistake on a GMP record?",
   "ms": "Apakah cara yang betul untuk membetulkan kesilapan pada rekod GMP?"
  },
  "opts": [
   {
    "en": "One line through it, then sign and date",
    "ms": "Satu garisan memotong, kemudian tandatangan dan tarikh"
   },
   {
    "en": "Use correction fluid",
    "ms": "Gunakan cecair pemadam"
   },
   {
    "en": "Tear out the page",
    "ms": "Koyakkan muka surat"
   },
   {
    "en": "Write over the mistake",
    "ms": "Tulis di atas kesilapan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q48",
  "cat": "GMP & Hygiene",
  "type": "tf",
  "q": {
   "en": "Correction fluid (liquid paper) is allowed on GMP records.",
   "ms": "Cecair pemadam dibenarkan pada rekod GMP."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q49",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "What does FIFO mean?",
   "ms": "Apakah maksud FIFO?"
  },
  "opts": [
   {
    "en": "First In, First Out",
    "ms": "Masuk Dahulu, Keluar Dahulu"
   },
   {
    "en": "Fast In, Fast Out",
    "ms": "Masuk Cepat, Keluar Cepat"
   },
   {
    "en": "Final Inspection, Final Output",
    "ms": "Pemeriksaan Akhir, Keluaran Akhir"
   },
   {
    "en": "First Item, Full Order",
    "ms": "Item Pertama, Pesanan Penuh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q50",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "When must you wash your hands?",
   "ms": "Bilakah anda mesti mencuci tangan?"
  },
  "opts": [
   {
    "en": "Before entering production and after using the toilet",
    "ms": "Sebelum masuk kawasan pengeluaran dan selepas ke tandas"
   },
   {
    "en": "Only at the end of the shift",
    "ms": "Hanya pada akhir syif"
   },
   {
    "en": "Once a day",
    "ms": "Sekali sehari"
   },
   {
    "en": "Only when they look dirty",
    "ms": "Hanya apabila nampak kotor"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q51",
  "cat": "GMP & Hygiene",
  "type": "tf",
  "q": {
   "en": "Reference (retain) samples help us investigate customer complaints.",
   "ms": "Sampel rujukan (simpanan) membantu kita menyiasat aduan pelanggan."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q52",
  "cat": "Audit & Documents",
  "type": "mc",
  "q": {
   "en": "What is the purpose of an internal audit?",
   "ms": "Apakah tujuan audit dalaman?"
  },
  "opts": [
   {
    "en": "To check the system works and meets requirements",
    "ms": "Menyemak sistem berfungsi dan memenuhi keperluan"
   },
   {
    "en": "To find someone to blame",
    "ms": "Mencari orang untuk dipersalahkan"
   },
   {
    "en": "To replace the manager",
    "ms": "Menggantikan pengurus"
   },
   {
    "en": "To count the stock",
    "ms": "Mengira stok"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q53",
  "cat": "Audit & Documents",
  "type": "mc",
  "q": {
   "en": "A nonconformity is…",
   "ms": "Ketidakakuran ialah…"
  },
  "opts": [
   {
    "en": "Not meeting a requirement",
    "ms": "Tidak memenuhi sesuatu keperluan"
   },
   {
    "en": "A new product idea",
    "ms": "Idea produk baharu"
   },
   {
    "en": "A customer order",
    "ms": "Pesanan pelanggan"
   },
   {
    "en": "A training record",
    "ms": "Rekod latihan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q54",
  "cat": "Audit & Documents",
  "type": "mc",
  "q": {
   "en": "What does SOP stand for?",
   "ms": "Apakah maksud SOP?"
  },
  "opts": [
   {
    "en": "Standard Operating Procedure",
    "ms": "Prosedur Operasi Standard"
   },
   {
    "en": "Simple Office Plan",
    "ms": "Pelan Pejabat Ringkas"
   },
   {
    "en": "Safety Order Process",
    "ms": "Proses Arahan Keselamatan"
   },
   {
    "en": "Stock Out Procedure",
    "ms": "Prosedur Stok Keluar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q55",
  "cat": "Audit & Documents",
  "type": "tf",
  "q": {
   "en": "It is OK to use an old version of an SOP if it is easier.",
   "ms": "Boleh menggunakan versi lama SOP jika ia lebih mudah."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q56",
  "cat": "Audit & Documents",
  "type": "mc",
  "q": {
   "en": "Who must follow an SOP?",
   "ms": "Siapakah yang mesti mengikut SOP?"
  },
  "opts": [
   {
    "en": "Everyone who does that task",
    "ms": "Semua orang yang melakukan tugas itu"
   },
   {
    "en": "Only new staff",
    "ms": "Hanya pekerja baharu"
   },
   {
    "en": "Only supervisors",
    "ms": "Hanya penyelia"
   },
   {
    "en": "Only during audits",
    "ms": "Hanya semasa audit"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q57",
  "cat": "Measurement & Specs",
  "type": "mc",
  "q": {
   "en": "Calibration makes sure that…",
   "ms": "Penentukuran memastikan bahawa…"
  },
  "opts": [
   {
    "en": "Measuring equipment gives accurate readings",
    "ms": "Peralatan pengukuran memberi bacaan yang tepat"
   },
   {
    "en": "Machines run faster",
    "ms": "Mesin berjalan lebih laju"
   },
   {
    "en": "Products look nicer",
    "ms": "Produk kelihatan lebih cantik"
   },
   {
    "en": "Staff work longer",
    "ms": "Pekerja bekerja lebih lama"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q58",
  "cat": "Measurement & Specs",
  "type": "tf",
  "q": {
   "en": "Equipment with an expired calibration label can still be used for testing.",
   "ms": "Peralatan dengan label penentukuran yang tamat tempoh masih boleh digunakan untuk ujian."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "q59",
  "cat": "Measurement & Specs",
  "type": "mc",
  "q": {
   "en": "A product specification is…",
   "ms": "Spesifikasi produk ialah…"
  },
  "opts": [
   {
    "en": "The requirements the product must meet",
    "ms": "Keperluan yang mesti dipenuhi oleh produk"
   },
   {
    "en": "The product's selling price",
    "ms": "Harga jualan produk"
   },
   {
    "en": "The customer's address",
    "ms": "Alamat pelanggan"
   },
   {
    "en": "The production schedule",
    "ms": "Jadual pengeluaran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q60",
  "cat": "Measurement & Specs",
  "type": "mc",
  "q": {
   "en": "A product fails its specification. What should you do first?",
   "ms": "Produk gagal spesifikasi. Apakah yang perlu anda lakukan dahulu?"
  },
  "opts": [
   {
    "en": "Separate it and label it On Hold",
    "ms": "Asingkan dan labelkan sebagai Ditahan"
   },
   {
    "en": "Ship it anyway",
    "ms": "Hantar juga"
   },
   {
    "en": "Mix it with good products",
    "ms": "Campurkan dengan produk yang baik"
   },
   {
    "en": "Throw it away without a record",
    "ms": "Buang tanpa rekod"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q61",
  "cat": "Customer",
  "type": "mc",
  "q": {
   "en": "A customer complaint is…",
   "ms": "Aduan pelanggan ialah…"
  },
  "opts": [
   {
    "en": "A chance to improve",
    "ms": "Peluang untuk menambah baik"
   },
   {
    "en": "Something to ignore",
    "ms": "Sesuatu yang boleh diabaikan"
   },
   {
    "en": "Always the customer's mistake",
    "ms": "Sentiasa kesilapan pelanggan"
   },
   {
    "en": "Only the sales team's problem",
    "ms": "Masalah pasukan jualan sahaja"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q62",
  "cat": "Customer",
  "type": "tf",
  "q": {
   "en": "The next process that receives your work is also your customer.",
   "ms": "Proses seterusnya yang menerima hasil kerja anda juga ialah pelanggan anda."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "q63",
  "cat": "Customer",
  "type": "mc",
  "q": {
   "en": "What does KPI stand for?",
   "ms": "Apakah maksud KPI?"
  },
  "opts": [
   {
    "en": "Key Performance Indicator",
    "ms": "Petunjuk Prestasi Utama"
   },
   {
    "en": "Key Product Inspection",
    "ms": "Pemeriksaan Produk Utama"
   },
   {
    "en": "Known Process Issue",
    "ms": "Isu Proses Diketahui"
   },
   {
    "en": "Keep Production Increasing",
    "ms": "Teruskan Pengeluaran Meningkat"
   }
  ],
  "ans": 0,
  "enabled": true
 }
];
