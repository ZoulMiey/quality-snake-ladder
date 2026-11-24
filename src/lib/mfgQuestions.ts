// Manufacturing question set (owner, 24 Nov 2026): 100 questions, about 60 on general manufacturing
// (production, Lean, maintenance, safety, planning, measurement, automation) and 40 on personal care
// manufacturing (formulas, quality control, hygiene, packaging, materials, Malaysian rules, halal).
// Its own set, not part of Mix. Right answer first (ans 0); the game shuffles the answers.
// An existing database receives them once (setup/mfgAdded in QuestionManager.tsx).
import type { Question } from "./types.ts";

export const MFG_QUESTIONS: Question[] = [
 {
  "id": "mf001",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "What does OEE stand for?",
   "ms": "Apakah maksud OEE?"
  },
  "opts": [
   {
    "en": "Overall Equipment Effectiveness",
    "ms": "Keberkesanan Keseluruhan Peralatan"
   },
   {
    "en": "Operational Efficiency Estimate",
    "ms": "Anggaran Kecekapan Operasi"
   },
   {
    "en": "Output Every Employee",
    "ms": "Output Setiap Pekerja"
   },
   {
    "en": "Overall Energy Expense",
    "ms": "Perbelanjaan Tenaga Keseluruhan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf002",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "OEE is worked out from availability, performance and...",
   "ms": "OEE dikira daripada ketersediaan, prestasi dan..."
  },
  "opts": [
   {
    "en": "Quality",
    "ms": "Kualiti"
   },
   {
    "en": "Quantity",
    "ms": "Kuantiti"
   },
   {
    "en": "Cost",
    "ms": "Kos"
   },
   {
    "en": "Safety",
    "ms": "Keselamatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf003",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "What is 'cycle time'?",
   "ms": "Apakah 'masa kitaran'?"
  },
  "opts": [
   {
    "en": "Time to complete one unit at a process step",
    "ms": "Masa untuk menyiapkan satu unit pada satu langkah proses"
   },
   {
    "en": "Total hours the factory runs in a day",
    "ms": "Jumlah jam kilang beroperasi dalam sehari"
   },
   {
    "en": "Time for a machine to warm up each morning",
    "ms": "Masa untuk memanaskan mesin setiap pagi"
   },
   {
    "en": "Time between two planned audits",
    "ms": "Masa antara dua audit yang dirancang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf004",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'Takt time' sets the production pace to match...",
   "ms": "'Masa takt' menetapkan rentak pengeluaran supaya sepadan dengan..."
  },
  "opts": [
   {
    "en": "Customer demand",
    "ms": "Permintaan pelanggan"
   },
   {
    "en": "The machine's top speed",
    "ms": "Kelajuan maksimum mesin"
   },
   {
    "en": "The number of workers",
    "ms": "Bilangan pekerja"
   },
   {
    "en": "The supplier's lead time",
    "ms": "Masa pendahuluan pembekal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf005",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "In a production line, a 'bottleneck' is...",
   "ms": "Dalam talian pengeluaran, 'kesesakan' (bottleneck) ialah..."
  },
  "opts": [
   {
    "en": "The slowest step, which limits total output",
    "ms": "Langkah paling perlahan yang mengehadkan jumlah output"
   },
   {
    "en": "The narrow top part of a bottle",
    "ms": "Bahagian atas botol yang sempit"
   },
   {
    "en": "The fastest machine on the whole line",
    "ms": "Mesin paling laju di seluruh talian"
   },
   {
    "en": "A storage area for spare machine parts",
    "ms": "Kawasan simpanan alat ganti mesin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf006",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "What does WIP stand for?",
   "ms": "Apakah maksud WIP?"
  },
  "opts": [
   {
    "en": "Work in progress",
    "ms": "Kerja dalam proses"
   },
   {
    "en": "Worker in position",
    "ms": "Pekerja di posisi"
   },
   {
    "en": "Waste in production",
    "ms": "Sisa dalam pengeluaran"
   },
   {
    "en": "Weight in pallet",
    "ms": "Berat dalam palet"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf007",
  "set": "manufacturing",
  "cat": "Planning",
  "type": "mc",
  "q": {
   "en": "In a warehouse, FIFO means...",
   "ms": "Dalam gudang, FIFO bermaksud..."
  },
  "opts": [
   {
    "en": "First in, first out",
    "ms": "Masuk dahulu, keluar dahulu"
   },
   {
    "en": "Fast in, fast out",
    "ms": "Cepat masuk, cepat keluar"
   },
   {
    "en": "Fill in, fill out",
    "ms": "Isi masuk, isi keluar"
   },
   {
    "en": "First inspected, first ordered",
    "ms": "Diperiksa dahulu, dipesan dahulu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf008",
  "set": "manufacturing",
  "cat": "Planning",
  "type": "mc",
  "q": {
   "en": "In a warehouse, FEFO means...",
   "ms": "Dalam gudang, FEFO bermaksud..."
  },
  "opts": [
   {
    "en": "First expired, first out",
    "ms": "Tamat tempoh dahulu, keluar dahulu"
   },
   {
    "en": "First entered, first ordered",
    "ms": "Masuk dahulu, dipesan dahulu"
   },
   {
    "en": "Fast empty, fast out",
    "ms": "Cepat kosong, cepat keluar"
   },
   {
    "en": "Final entry, final output",
    "ms": "Kemasukan akhir, output akhir"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf009",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "What is a 'changeover'?",
   "ms": "Apakah 'pertukaran' (changeover)?"
  },
  "opts": [
   {
    "en": "Switching a line from one product to another",
    "ms": "Menukar talian daripada satu produk kepada produk lain"
   },
   {
    "en": "Handing the line over to the next shift",
    "ms": "Menyerahkan talian kepada syif seterusnya"
   },
   {
    "en": "Moving finished goods to the warehouse",
    "ms": "Memindahkan barang siap ke gudang"
   },
   {
    "en": "Replacing an old machine with a new one",
    "ms": "Menggantikan mesin lama dengan mesin baharu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf010",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "SMED (Single-Minute Exchange of Die) aims to...",
   "ms": "SMED (Single-Minute Exchange of Die) bertujuan untuk..."
  },
  "opts": [
   {
    "en": "Cut changeover time",
    "ms": "Memendekkan masa pertukaran"
   },
   {
    "en": "Make bigger batches",
    "ms": "Membuat kelompok yang lebih besar"
   },
   {
    "en": "Add more inspections",
    "ms": "Menambah lebih banyak pemeriksaan"
   },
   {
    "en": "Reduce the number of staff",
    "ms": "Mengurangkan bilangan pekerja"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf011",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "When is preventive maintenance done?",
   "ms": "Bilakah penyelenggaraan pencegahan dilakukan?"
  },
  "opts": [
   {
    "en": "On a schedule, before a breakdown",
    "ms": "Mengikut jadual, sebelum kerosakan"
   },
   {
    "en": "Only after a breakdown",
    "ms": "Hanya selepas kerosakan"
   },
   {
    "en": "Only when a customer complains",
    "ms": "Hanya apabila pelanggan mengadu"
   },
   {
    "en": "Only once every five years",
    "ms": "Hanya sekali setiap lima tahun"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf012",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "'Breakdown maintenance' means...",
   "ms": "'Penyelenggaraan kerosakan' bermaksud..."
  },
  "opts": [
   {
    "en": "Repairing a machine after it fails",
    "ms": "Membaiki mesin selepas ia rosak"
   },
   {
    "en": "A planned oil change",
    "ms": "Penukaran minyak yang dirancang"
   },
   {
    "en": "Daily cleaning of the machine",
    "ms": "Pembersihan harian mesin"
   },
   {
    "en": "Buying a brand-new machine",
    "ms": "Membeli mesin baharu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf013",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "What does TPM stand for?",
   "ms": "Apakah maksud TPM?"
  },
  "opts": [
   {
    "en": "Total Productive Maintenance",
    "ms": "Penyelenggaraan Produktif Menyeluruh"
   },
   {
    "en": "Total Product Management",
    "ms": "Pengurusan Produk Menyeluruh"
   },
   {
    "en": "Time Per Machine",
    "ms": "Masa Setiap Mesin"
   },
   {
    "en": "Technical Process Manual",
    "ms": "Manual Proses Teknikal"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf014",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "In TPM, 'autonomous maintenance' is mainly done by...",
   "ms": "Dalam TPM, 'penyelenggaraan autonomi' terutamanya dilakukan oleh..."
  },
  "opts": [
   {
    "en": "The machine operators",
    "ms": "Operator mesin"
   },
   {
    "en": "Outside contractors only",
    "ms": "Kontraktor luar sahaja"
   },
   {
    "en": "The finance team",
    "ms": "Pasukan kewangan"
   },
   {
    "en": "The customers",
    "ms": "Pelanggan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf015",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "What does MTBF stand for?",
   "ms": "Apakah maksud MTBF?"
  },
  "opts": [
   {
    "en": "Mean Time Between Failures",
    "ms": "Purata Masa Antara Kegagalan"
   },
   {
    "en": "Maximum Time Before Finishing",
    "ms": "Masa Maksimum Sebelum Siap"
   },
   {
    "en": "Minimum Temperature Before Freezing",
    "ms": "Suhu Minimum Sebelum Membeku"
   },
   {
    "en": "Machine Test By Foreman",
    "ms": "Ujian Mesin Oleh Penyelia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf016",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "A machine with a higher MTBF is...",
   "ms": "Mesin dengan MTBF yang lebih tinggi adalah..."
  },
  "opts": [
   {
    "en": "More reliable",
    "ms": "Lebih boleh dipercayai"
   },
   {
    "en": "Older",
    "ms": "Lebih lama"
   },
   {
    "en": "Slower",
    "ms": "Lebih perlahan"
   },
   {
    "en": "More expensive to run",
    "ms": "Lebih mahal untuk dijalankan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf017",
  "set": "manufacturing",
  "cat": "Maintenance",
  "type": "mc",
  "q": {
   "en": "MTTR (Mean Time To Repair) measures...",
   "ms": "MTTR (Purata Masa Untuk Membaiki) mengukur..."
  },
  "opts": [
   {
    "en": "How long repairs take on average",
    "ms": "Purata tempoh masa untuk membaiki"
   },
   {
    "en": "How long one batch takes",
    "ms": "Tempoh masa satu kelompok"
   },
   {
    "en": "How long it takes to train a worker",
    "ms": "Tempoh masa untuk melatih pekerja"
   },
   {
    "en": "How long delivery takes to a customer",
    "ms": "Tempoh masa penghantaran kepada pelanggan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf018",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "Lockout/Tagout (LOTO) is used to...",
   "ms": "Lockout/Tagout (LOTO) digunakan untuk..."
  },
  "opts": [
   {
    "en": "Stop a machine starting while it is serviced",
    "ms": "Menghalang mesin dihidupkan semasa diselenggara"
   },
   {
    "en": "Lock the store room after the last shift",
    "ms": "Mengunci stor selepas syif terakhir"
   },
   {
    "en": "Tag finished goods that are ready to ship",
    "ms": "Menanda barang siap yang sedia dihantar"
   },
   {
    "en": "Record who used a machine each day",
    "ms": "Merekod siapa menggunakan mesin setiap hari"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf019",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "What does PPE stand for?",
   "ms": "Apakah maksud PPE?"
  },
  "opts": [
   {
    "en": "Personal Protective Equipment",
    "ms": "Peralatan Pelindung Diri"
   },
   {
    "en": "Production Planning Exercise",
    "ms": "Latihan Perancangan Pengeluaran"
   },
   {
    "en": "Product Packing Envelope",
    "ms": "Sampul Pembungkusan Produk"
   },
   {
    "en": "Plant Power Engine",
    "ms": "Enjin Kuasa Kilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf020",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "Which PPE protects you in a very noisy machine area?",
   "ms": "PPE manakah yang melindungi anda di kawasan mesin yang sangat bising?"
  },
  "opts": [
   {
    "en": "Ear plugs",
    "ms": "Penyumbat telinga"
   },
   {
    "en": "Safety glasses",
    "ms": "Cermin mata keselamatan"
   },
   {
    "en": "Cotton gloves",
    "ms": "Sarung tangan kapas"
   },
   {
    "en": "A dust mask",
    "ms": "Topeng habuk"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf021",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "What is a 'near miss'?",
   "ms": "Apakah 'nyaris kemalangan' (near miss)?"
  },
  "opts": [
   {
    "en": "An event that almost caused harm",
    "ms": "Kejadian yang hampir menyebabkan kecederaan"
   },
   {
    "en": "A delivery that missed its time slot",
    "ms": "Penghantaran yang terlepas slot masanya"
   },
   {
    "en": "A worker who arrived late for a shift",
    "ms": "Pekerja yang lewat datang untuk syif"
   },
   {
    "en": "A target that was almost reached",
    "ms": "Sasaran yang hampir dicapai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf022",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "Why should near misses be reported?",
   "ms": "Mengapakah nyaris kemalangan perlu dilaporkan?"
  },
  "opts": [
   {
    "en": "To fix the hazard before someone gets hurt",
    "ms": "Untuk membaiki bahaya sebelum ada yang cedera"
   },
   {
    "en": "To find out who should be blamed",
    "ms": "Untuk mengetahui siapa yang patut dipersalahkan"
   },
   {
    "en": "To collect points for a monthly prize",
    "ms": "Untuk mengumpul mata bagi hadiah bulanan"
   },
   {
    "en": "Only so the paperwork is complete",
    "ms": "Hanya supaya dokumen lengkap"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf023",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "Which Malaysian department enforces occupational safety and health law?",
   "ms": "Jabatan Malaysia manakah yang menguatkuasakan undang-undang keselamatan dan kesihatan pekerjaan?"
  },
  "opts": [
   {
    "en": "DOSH",
    "ms": "JKKP"
   },
   {
    "en": "JPJ",
    "ms": "JPJ"
   },
   {
    "en": "LHDN",
    "ms": "LHDN"
   },
   {
    "en": "SIRIM",
    "ms": "SIRIM"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf024",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "A Safety Data Sheet (SDS) tells you...",
   "ms": "Risalah Data Keselamatan (SDS) memberitahu anda..."
  },
  "opts": [
   {
    "en": "How to handle a chemical safely",
    "ms": "Cara mengendalikan bahan kimia dengan selamat"
   },
   {
    "en": "The price of the chemical per kilo",
    "ms": "Harga bahan kimia sekilogram"
   },
   {
    "en": "When the next delivery will arrive",
    "ms": "Bila penghantaran seterusnya akan tiba"
   },
   {
    "en": "Which shift is allowed to use it",
    "ms": "Syif mana yang dibenarkan menggunakannya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf025",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "How should a forklift carry its load while moving?",
   "ms": "Bagaimanakah forklif patut membawa muatan semasa bergerak?"
  },
  "opts": [
   {
    "en": "Low, close to the floor",
    "ms": "Rendah, dekat dengan lantai"
   },
   {
    "en": "As high as possible",
    "ms": "Setinggi yang mungkin"
   },
   {
    "en": "On one fork only",
    "ms": "Pada satu garpu sahaja"
   },
   {
    "en": "With a person standing on the load",
    "ms": "Dengan seseorang berdiri di atas muatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf026",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "A green safety sign usually shows...",
   "ms": "Papan tanda keselamatan berwarna hijau biasanya menunjukkan..."
  },
  "opts": [
   {
    "en": "A safe condition, such as an emergency exit",
    "ms": "Keadaan selamat, seperti laluan keluar kecemasan"
   },
   {
    "en": "Danger, keep away from the area",
    "ms": "Bahaya, jauhi kawasan ini"
   },
   {
    "en": "Something that is not allowed here",
    "ms": "Sesuatu yang dilarang di sini"
   },
   {
    "en": "Where the fire-fighting equipment is",
    "ms": "Lokasi peralatan memadam kebakaran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf027",
  "set": "manufacturing",
  "cat": "Safety",
  "type": "mc",
  "q": {
   "en": "A red circle with a line through it on a safety sign means...",
   "ms": "Bulatan merah dengan garisan melintang pada papan tanda keselamatan bermaksud..."
  },
  "opts": [
   {
    "en": "Not allowed",
    "ms": "Dilarang"
   },
   {
    "en": "Must wear",
    "ms": "Wajib dipakai"
   },
   {
    "en": "First aid",
    "ms": "Pertolongan cemas"
   },
   {
    "en": "Slippery floor",
    "ms": "Lantai licin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf028",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "A Kanban is...",
   "ms": "Kanban ialah..."
  },
  "opts": [
   {
    "en": "A signal card to pull material when needed",
    "ms": "Kad isyarat untuk menarik bahan apabila perlu"
   },
   {
    "en": "A board that shows each worker's leave",
    "ms": "Papan yang menunjukkan cuti setiap pekerja"
   },
   {
    "en": "A checklist for the end-of-shift clean",
    "ms": "Senarai semak pembersihan akhir syif"
   },
   {
    "en": "A report of defects found by Quality",
    "ms": "Laporan kecacatan yang ditemui oleh Kualiti"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf029",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "'Pull' production means making products...",
   "ms": "Pengeluaran 'tarik' bermaksud membuat produk..."
  },
  "opts": [
   {
    "en": "Only when the next step or the customer needs them",
    "ms": "Hanya apabila langkah seterusnya atau pelanggan memerlukannya"
   },
   {
    "en": "As many as possible, all of the time",
    "ms": "Sebanyak mungkin, sepanjang masa"
   },
   {
    "en": "In one big batch at the start of the month",
    "ms": "Dalam satu kelompok besar pada awal bulan"
   },
   {
    "en": "Based only on last year's sales",
    "ms": "Berdasarkan jualan tahun lepas sahaja"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf030",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "What does JIT stand for?",
   "ms": "Apakah maksud JIT?"
  },
  "opts": [
   {
    "en": "Just in Time",
    "ms": "Tepat pada Masanya"
   },
   {
    "en": "Job in Training",
    "ms": "Kerja dalam Latihan"
   },
   {
    "en": "Joint Inspection Team",
    "ms": "Pasukan Pemeriksaan Bersama"
   },
   {
    "en": "Jump in Throughput",
    "ms": "Lonjakan Daya Pengeluaran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf031",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "Making more products than the customer needs is which waste?",
   "ms": "Membuat lebih banyak produk daripada keperluan pelanggan ialah pembaziran apa?"
  },
  "opts": [
   {
    "en": "Overproduction",
    "ms": "Pengeluaran berlebihan"
   },
   {
    "en": "Over-processing",
    "ms": "Pemprosesan berlebihan"
   },
   {
    "en": "Transport",
    "ms": "Pengangkutan"
   },
   {
    "en": "Inventory",
    "ms": "Inventori"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf032",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "Walking far to fetch a tool is which waste?",
   "ms": "Berjalan jauh untuk mengambil alat ialah pembaziran apa?"
  },
  "opts": [
   {
    "en": "Motion",
    "ms": "Pergerakan"
   },
   {
    "en": "Overproduction",
    "ms": "Pengeluaran berlebihan"
   },
   {
    "en": "Inventory",
    "ms": "Inventori"
   },
   {
    "en": "Over-processing",
    "ms": "Pemprosesan berlebihan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf033",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "Keeping far more stock than needed is which waste?",
   "ms": "Menyimpan stok jauh melebihi keperluan ialah pembaziran apa?"
  },
  "opts": [
   {
    "en": "Inventory",
    "ms": "Inventori"
   },
   {
    "en": "Transport",
    "ms": "Pengangkutan"
   },
   {
    "en": "Defects",
    "ms": "Kecacatan"
   },
   {
    "en": "Waiting",
    "ms": "Menunggu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf034",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "On a production line, an 'Andon' is...",
   "ms": "Di talian pengeluaran, 'Andon' ialah..."
  },
  "opts": [
   {
    "en": "A light or signal to call for help",
    "ms": "Lampu atau isyarat untuk meminta bantuan"
   },
   {
    "en": "A sign showing the line's daily target",
    "ms": "Papan tanda sasaran harian talian"
   },
   {
    "en": "A card used to order raw materials",
    "ms": "Kad untuk memesan bahan mentah"
   },
   {
    "en": "A buzzer that marks the end of a shift",
    "ms": "Loceng yang menandakan tamat syif"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf035",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "'Gemba' means...",
   "ms": "'Gemba' bermaksud..."
  },
  "opts": [
   {
    "en": "The real place where the work is done",
    "ms": "Tempat sebenar kerja dilakukan"
   },
   {
    "en": "The meeting room where plans are made",
    "ms": "Bilik mesyuarat tempat pelan dibuat"
   },
   {
    "en": "The office where reports are written",
    "ms": "Pejabat tempat laporan ditulis"
   },
   {
    "en": "The store where spare parts are kept",
    "ms": "Stor tempat alat ganti disimpan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf036",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "'Heijunka' means...",
   "ms": "'Heijunka' bermaksud..."
  },
  "opts": [
   {
    "en": "Levelling the volume and mix of production",
    "ms": "Meratakan jumlah dan campuran pengeluaran"
   },
   {
    "en": "Stopping the line when a defect is found",
    "ms": "Menghentikan talian apabila kecacatan ditemui"
   },
   {
    "en": "Checking random samples from each batch",
    "ms": "Memeriksa sampel rawak daripada setiap kelompok"
   },
   {
    "en": "Adding overtime to catch up on orders",
    "ms": "Menambah kerja lebih masa untuk mengejar pesanan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf037",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "'Standard work' is...",
   "ms": "'Kerja standard' ialah..."
  },
  "opts": [
   {
    "en": "The current best way to do a task, written down",
    "ms": "Cara terbaik semasa untuk melakukan tugas, yang ditulis"
   },
   {
    "en": "The minimum output each worker must reach",
    "ms": "Output minimum yang mesti dicapai setiap pekerja"
   },
   {
    "en": "The normal working hours in the contract",
    "ms": "Waktu bekerja biasa dalam kontrak"
   },
   {
    "en": "The uniform everyone wears on the line",
    "ms": "Pakaian seragam yang dipakai semua orang di talian"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf038",
  "set": "manufacturing",
  "cat": "Production",
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
    "en": "Special Order Product",
    "ms": "Produk Pesanan Khas"
   },
   {
    "en": "Shift Output Plan",
    "ms": "Pelan Output Syif"
   },
   {
    "en": "Safety Officer Post",
    "ms": "Jawatan Pegawai Keselamatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf039",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "A Value Stream Map shows...",
   "ms": "Peta Aliran Nilai (Value Stream Map) menunjukkan..."
  },
  "opts": [
   {
    "en": "How materials and information flow, order to delivery",
    "ms": "Aliran bahan dan maklumat, dari pesanan hingga penghantaran"
   },
   {
    "en": "Where every machine sits on the factory floor",
    "ms": "Kedudukan setiap mesin di lantai kilang"
   },
   {
    "en": "How much each product sells for in shops",
    "ms": "Harga jualan setiap produk di kedai"
   },
   {
    "en": "Which customers buy the most each month",
    "ms": "Pelanggan yang membeli paling banyak setiap bulan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf040",
  "set": "manufacturing",
  "cat": "Planning",
  "type": "mc",
  "q": {
   "en": "A Gantt chart is used for...",
   "ms": "Carta Gantt digunakan untuk..."
  },
  "opts": [
   {
    "en": "Planning tasks over time",
    "ms": "Merancang tugas mengikut masa"
   },
   {
    "en": "Measuring pH",
    "ms": "Mengukur pH"
   },
   {
    "en": "Ranking defects by cause",
    "ms": "Menyusun kecacatan mengikut punca"
   },
   {
    "en": "Drawing the factory layout",
    "ms": "Melukis susun atur kilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf041",
  "set": "manufacturing",
  "cat": "Planning",
  "type": "mc",
  "q": {
   "en": "In production planning, MRP stands for...",
   "ms": "Dalam perancangan pengeluaran, MRP bermaksud..."
  },
  "opts": [
   {
    "en": "Material Requirements Planning",
    "ms": "Perancangan Keperluan Bahan"
   },
   {
    "en": "Machine Repair Plan",
    "ms": "Pelan Pembaikan Mesin"
   },
   {
    "en": "Monthly Report of Production",
    "ms": "Laporan Bulanan Pengeluaran"
   },
   {
    "en": "Master Recipe Programme",
    "ms": "Program Resipi Induk"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf042",
  "set": "manufacturing",
  "cat": "Planning",
  "type": "mc",
  "q": {
   "en": "What does BOM stand for?",
   "ms": "Apakah maksud BOM?"
  },
  "opts": [
   {
    "en": "Bill of Materials",
    "ms": "Senarai Bahan"
   },
   {
    "en": "Batch of Machines",
    "ms": "Kelompok Mesin"
   },
   {
    "en": "Board of Managers",
    "ms": "Lembaga Pengurus"
   },
   {
    "en": "Box of Materials",
    "ms": "Kotak Bahan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf043",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "In manufacturing, a 'batch' is...",
   "ms": "Dalam pembuatan, 'kelompok' (batch) ialah..."
  },
  "opts": [
   {
    "en": "A quantity made together under the same conditions",
    "ms": "Kuantiti yang dibuat bersama dalam keadaan yang sama"
   },
   {
    "en": "All the products made in one whole year",
    "ms": "Semua produk yang dibuat dalam setahun"
   },
   {
    "en": "The products packed into one shipping carton",
    "ms": "Produk yang dibungkus dalam satu karton penghantaran"
   },
   {
    "en": "The group of workers on one shift",
    "ms": "Kumpulan pekerja dalam satu syif"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf044",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "Why does every batch get its own lot number?",
   "ms": "Mengapakah setiap kelompok diberi nombor lotnya sendiri?"
  },
  "opts": [
   {
    "en": "So it can be traced if there is a problem",
    "ms": "Supaya boleh dikesan jika ada masalah"
   },
   {
    "en": "So the warehouse can sort it by colour",
    "ms": "Supaya gudang boleh menyusunnya mengikut warna"
   },
   {
    "en": "So the selling price can be worked out",
    "ms": "Supaya harga jualan boleh dikira"
   },
   {
    "en": "So workers know when their shift ends",
    "ms": "Supaya pekerja tahu bila syif tamat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf045",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'Traceability' means being able to...",
   "ms": "'Kebolehkesanan' bermaksud dapat..."
  },
  "opts": [
   {
    "en": "Trace a product from raw material to customer",
    "ms": "Menjejak produk dari bahan mentah hingga pelanggan"
   },
   {
    "en": "Copy a drawing by tracing over its lines",
    "ms": "Menyalin lukisan dengan menyurih garisannya"
   },
   {
    "en": "Track every worker's attendance and leave",
    "ms": "Menjejak kehadiran dan cuti setiap pekerja"
   },
   {
    "en": "Find the cheapest supplier for each material",
    "ms": "Mencari pembekal termurah untuk setiap bahan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf046",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "Process yield is...",
   "ms": "Hasil proses (yield) ialah..."
  },
  "opts": [
   {
    "en": "Good output divided by total input",
    "ms": "Output baik dibahagi dengan jumlah input"
   },
   {
    "en": "Total input divided by the number of workers",
    "ms": "Jumlah input dibahagi dengan bilangan pekerja"
   },
   {
    "en": "Defects multiplied by price",
    "ms": "Kecacatan didarab dengan harga"
   },
   {
    "en": "Hours divided by shifts",
    "ms": "Jam dibahagi dengan syif"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf047",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'Scrap' is...",
   "ms": "'Skrap' ialah..."
  },
  "opts": [
   {
    "en": "Unusable material or product that is thrown away",
    "ms": "Bahan atau produk tidak boleh guna yang dibuang"
   },
   {
    "en": "Finished goods still waiting in the warehouse",
    "ms": "Barang siap yang masih menunggu di gudang"
   },
   {
    "en": "Spare parts kept for machine repairs",
    "ms": "Alat ganti yang disimpan untuk pembaikan mesin"
   },
   {
    "en": "Notes written during a shift meeting",
    "ms": "Nota yang ditulis semasa mesyuarat syif"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf048",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'Rework' means...",
   "ms": "'Kerja semula' bermaksud..."
  },
  "opts": [
   {
    "en": "Fixing a defective product so it meets the spec",
    "ms": "Membaiki produk cacat supaya memenuhi spesifikasi"
   },
   {
    "en": "Working extra hours after the shift ends",
    "ms": "Bekerja lebih masa selepas syif tamat"
   },
   {
    "en": "Moving a worker to a different job",
    "ms": "Memindahkan pekerja ke kerja lain"
   },
   {
    "en": "Throwing away a defective product",
    "ms": "Membuang produk yang cacat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf049",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'First pass yield' counts products that are good...",
   "ms": "'Hasil laluan pertama' mengira produk yang baik..."
  },
  "opts": [
   {
    "en": "The first time, without any rework",
    "ms": "Pada kali pertama, tanpa kerja semula"
   },
   {
    "en": "After rework",
    "ms": "Selepas kerja semula"
   },
   {
    "en": "When they reach the customer",
    "ms": "Apabila sampai kepada pelanggan"
   },
   {
    "en": "On the first day of the month",
    "ms": "Pada hari pertama setiap bulan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf050",
  "set": "manufacturing",
  "cat": "Measurement",
  "type": "mc",
  "q": {
   "en": "Calibration makes sure measuring equipment is...",
   "ms": "Penentukuran memastikan peralatan pengukuran adalah..."
  },
  "opts": [
   {
    "en": "Accurate against a known standard",
    "ms": "Tepat berbanding piawai yang diketahui"
   },
   {
    "en": "Clean and free of dust and dirt",
    "ms": "Bersih serta bebas habuk dan kotoran"
   },
   {
    "en": "Fitted with a brand-new battery",
    "ms": "Dipasang dengan bateri baharu"
   },
   {
    "en": "Kept in the right storage place",
    "ms": "Disimpan di tempat simpanan yang betul"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf051",
  "set": "manufacturing",
  "cat": "Measurement",
  "type": "mc",
  "q": {
   "en": "A vernier caliper is used to measure...",
   "ms": "Angkup vernier digunakan untuk mengukur..."
  },
  "opts": [
   {
    "en": "Small lengths and diameters",
    "ms": "Panjang dan diameter yang kecil"
   },
   {
    "en": "The temperature of a liquid",
    "ms": "Suhu sesuatu cecair"
   },
   {
    "en": "The weight of a carton",
    "ms": "Berat sesebuah karton"
   },
   {
    "en": "Air pressure in a tank",
    "ms": "Tekanan udara dalam tangki"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf052",
  "set": "manufacturing",
  "cat": "Measurement",
  "type": "mc",
  "q": {
   "en": "A thermocouple measures...",
   "ms": "Termogandingan (thermocouple) mengukur..."
  },
  "opts": [
   {
    "en": "Temperature",
    "ms": "Suhu"
   },
   {
    "en": "Humidity",
    "ms": "Kelembapan"
   },
   {
    "en": "Speed",
    "ms": "Kelajuan"
   },
   {
    "en": "Light",
    "ms": "Cahaya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf053",
  "set": "manufacturing",
  "cat": "Automation",
  "type": "mc",
  "q": {
   "en": "In a factory, PLC stands for...",
   "ms": "Di kilang, PLC bermaksud..."
  },
  "opts": [
   {
    "en": "Programmable Logic Controller",
    "ms": "Pengawal Logik Boleh Atur Cara"
   },
   {
    "en": "Production Line Coordinator",
    "ms": "Penyelaras Talian Pengeluaran"
   },
   {
    "en": "Packing List Checker",
    "ms": "Penyemak Senarai Pembungkusan"
   },
   {
    "en": "Plant Lighting Circuit",
    "ms": "Litar Lampu Kilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf054",
  "set": "manufacturing",
  "cat": "Automation",
  "type": "mc",
  "q": {
   "en": "Which sensor can tell a bottle is there without touching it?",
   "ms": "Penderia manakah dapat mengesan botol tanpa menyentuhnya?"
  },
  "opts": [
   {
    "en": "A photoelectric sensor",
    "ms": "Penderia fotoelektrik"
   },
   {
    "en": "A temperature probe",
    "ms": "Prob suhu"
   },
   {
    "en": "A humidity sensor",
    "ms": "Penderia kelembapan"
   },
   {
    "en": "A pressure gauge",
    "ms": "Tolok tekanan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf055",
  "set": "manufacturing",
  "cat": "Automation",
  "type": "mc",
  "q": {
   "en": "'Industry 4.0' is about...",
   "ms": "'Industri 4.0' adalah mengenai..."
  },
  "opts": [
   {
    "en": "Smart, connected machines using data and automation",
    "ms": "Mesin pintar yang berhubung, menggunakan data dan automasi"
   },
   {
    "en": "Running four shifts every day of the week",
    "ms": "Menjalankan empat syif setiap hari"
   },
   {
    "en": "The fourth version of a factory's safety rules",
    "ms": "Versi keempat peraturan keselamatan kilang"
   },
   {
    "en": "A four-day work week for all factory staff",
    "ms": "Minggu kerja empat hari untuk semua pekerja kilang"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf056",
  "set": "manufacturing",
  "cat": "Automation",
  "type": "mc",
  "q": {
   "en": "A robot that picks products up and puts them into cartons is called a...",
   "ms": "Robot yang mengambil produk dan memasukkannya ke dalam karton dipanggil..."
  },
  "opts": [
   {
    "en": "Pick-and-place robot",
    "ms": "Robot ambil-dan-letak"
   },
   {
    "en": "Automated guided vehicle",
    "ms": "Kenderaan berpandu automatik"
   },
   {
    "en": "Robotic welder",
    "ms": "Robot pengimpal"
   },
   {
    "en": "Labelling machine",
    "ms": "Mesin pelabelan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf057",
  "set": "manufacturing",
  "cat": "Automation",
  "type": "mc",
  "q": {
   "en": "A conveyor's main job is to...",
   "ms": "Tugas utama penghantar (conveyor) ialah..."
  },
  "opts": [
   {
    "en": "Move products from one place to another",
    "ms": "Memindahkan produk dari satu tempat ke tempat lain"
   },
   {
    "en": "Mix the formula evenly in a tank",
    "ms": "Mengadun formula secara sekata dalam tangki"
   },
   {
    "en": "Weigh every product before packing",
    "ms": "Menimbang setiap produk sebelum dibungkus"
   },
   {
    "en": "Print the batch code on each pack",
    "ms": "Mencetak kod kelompok pada setiap bungkusan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf058",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "Which helps the next shift know what happened on the line?",
   "ms": "Apakah yang membantu syif seterusnya mengetahui apa yang berlaku di talian?"
  },
  "opts": [
   {
    "en": "A shift handover log",
    "ms": "Log serah tugas syif"
   },
   {
    "en": "Skipping the briefing",
    "ms": "Tidak menghadiri taklimat"
   },
   {
    "en": "Rumours from friends",
    "ms": "Khabar angin daripada kawan"
   },
   {
    "en": "Switching off the machines",
    "ms": "Mematikan mesin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf059",
  "set": "manufacturing",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "'Line balancing' means...",
   "ms": "'Pengimbangan talian' bermaksud..."
  },
  "opts": [
   {
    "en": "Spreading work evenly across the stations",
    "ms": "Membahagikan kerja sama rata di setiap stesen"
   },
   {
    "en": "Making sure the factory floor is level",
    "ms": "Memastikan lantai kilang rata"
   },
   {
    "en": "Balancing the production budget each month",
    "ms": "Mengimbangi bajet pengeluaran setiap bulan"
   },
   {
    "en": "Weighing every product on the line",
    "ms": "Menimbang setiap produk di talian"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf060",
  "set": "manufacturing",
  "cat": "Production",
  "type": "mc",
  "q": {
   "en": "'Downtime' is...",
   "ms": "'Masa henti' (downtime) ialah..."
  },
  "opts": [
   {
    "en": "Time a machine or line is not producing",
    "ms": "Masa mesin atau talian tidak mengeluarkan produk"
   },
   {
    "en": "Time spent working overtime",
    "ms": "Masa bekerja lebih masa"
   },
   {
    "en": "Time the line runs at its fastest",
    "ms": "Masa talian berjalan paling laju"
   },
   {
    "en": "Time spent on training",
    "ms": "Masa untuk latihan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf061",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "In a shampoo, the ingredient that cleans and makes foam is a...",
   "ms": "Dalam syampu, bahan yang membersihkan dan menghasilkan buih ialah..."
  },
  "opts": [
   {
    "en": "Surfactant",
    "ms": "Surfaktan"
   },
   {
    "en": "Preservative",
    "ms": "Pengawet"
   },
   {
    "en": "Fragrance",
    "ms": "Pewangi"
   },
   {
    "en": "Colourant",
    "ms": "Pewarna"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf062",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "Preservatives are added to personal care products to...",
   "ms": "Pengawet ditambah ke dalam produk penjagaan diri untuk..."
  },
  "opts": [
   {
    "en": "Stop bacteria and mould from growing",
    "ms": "Menghalang pertumbuhan bakteria dan kulat"
   },
   {
    "en": "Give the product a pleasant smell",
    "ms": "Memberikan bau yang menyenangkan kepada produk"
   },
   {
    "en": "Make the product thicker and creamier",
    "ms": "Menjadikan produk lebih pekat dan berkrim"
   },
   {
    "en": "Help the product make more foam",
    "ms": "Membantu produk menghasilkan lebih banyak buih"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf063",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "'Viscosity' describes how...",
   "ms": "'Kelikatan' menerangkan betapa..."
  },
  "opts": [
   {
    "en": "Thick a liquid is, or how easily it flows",
    "ms": "Pekat sesuatu cecair, atau betapa mudah ia mengalir"
   },
   {
    "en": "Heavy a full bottle of the product is",
    "ms": "Berat sebotol penuh produk itu"
   },
   {
    "en": "Strong or weak the product's smell is",
    "ms": "Kuat atau lemah bau produk itu"
   },
   {
    "en": "Acidic or alkaline the product is",
    "ms": "Berasid atau beralkali produk itu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf064",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "Which instrument measures viscosity?",
   "ms": "Alat manakah mengukur kelikatan?"
  },
  "opts": [
   {
    "en": "Viscometer",
    "ms": "Viskometer"
   },
   {
    "en": "pH meter",
    "ms": "Meter pH"
   },
   {
    "en": "Thermometer",
    "ms": "Termometer"
   },
   {
    "en": "Ruler",
    "ms": "Pembaris"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf065",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "On the pH scale, 7 is...",
   "ms": "Pada skala pH, 7 ialah..."
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
    "en": "The boiling point of water",
    "ms": "Takat didih air"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf066",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "Healthy skin is slightly acidic. Its surface pH is about...",
   "ms": "Kulit yang sihat sedikit berasid. pH permukaannya lebih kurang..."
  },
  "opts": [
   {
    "en": "4.5 to 5.5",
    "ms": "4.5 hingga 5.5"
   },
   {
    "en": "9 to 10",
    "ms": "9 hingga 10"
   },
   {
    "en": "11 to 12",
    "ms": "11 hingga 12"
   },
   {
    "en": "1 to 2",
    "ms": "1 hingga 2"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf067",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "A lotion or cream is an emulsion. That means it is a mix of...",
   "ms": "Losyen atau krim ialah emulsi. Ini bermaksud ia campuran..."
  },
  "opts": [
   {
    "en": "Oil and water held together",
    "ms": "Minyak dan air yang bercampur sebati"
   },
   {
    "en": "Powder and water",
    "ms": "Serbuk dan air"
   },
   {
    "en": "Alcohol and fragrance only",
    "ms": "Alkohol dan pewangi sahaja"
   },
   {
    "en": "Water and air bubbles",
    "ms": "Air dan gelembung udara"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf068",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "What does an emulsifier do?",
   "ms": "Apakah fungsi pengemulsi?"
  },
  "opts": [
   {
    "en": "Stops oil and water from separating",
    "ms": "Menghalang minyak dan air daripada terpisah"
   },
   {
    "en": "Kills germs in the product",
    "ms": "Membunuh kuman dalam produk"
   },
   {
    "en": "Gives the product its fragrance",
    "ms": "Memberikan wangian kepada produk"
   },
   {
    "en": "Makes the product a brighter colour",
    "ms": "Menjadikan warna produk lebih cerah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf069",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "A common sign that a cream is unstable is...",
   "ms": "Tanda biasa bahawa krim tidak stabil ialah..."
  },
  "opts": [
   {
    "en": "Oil and water separating into layers",
    "ms": "Minyak dan air terpisah menjadi lapisan"
   },
   {
    "en": "A slightly sweet, pleasant smell",
    "ms": "Bau yang sedikit manis dan menyenangkan"
   },
   {
    "en": "A smooth, even texture",
    "ms": "Tekstur yang licin dan sekata"
   },
   {
    "en": "The same colour as the standard",
    "ms": "Warna yang sama seperti piawai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf070",
  "set": "manufacturing",
  "cat": "Quality control",
  "type": "mc",
  "q": {
   "en": "Before a batch is released, a sample is checked against...",
   "ms": "Sebelum kelompok dilepaskan, sampel diperiksa berbanding..."
  },
  "opts": [
   {
    "en": "The product specification",
    "ms": "Spesifikasi produk"
   },
   {
    "en": "Last year's best-selling product",
    "ms": "Produk terlaris tahun lepas"
   },
   {
    "en": "The supplier's price list",
    "ms": "Senarai harga pembekal"
   },
   {
    "en": "A competitor's product",
    "ms": "Produk pesaing"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf071",
  "set": "manufacturing",
  "cat": "Quality control",
  "type": "mc",
  "q": {
   "en": "Microbiological testing checks a product for...",
   "ms": "Ujian mikrobiologi memeriksa produk untuk..."
  },
  "opts": [
   {
    "en": "Bacteria, yeast and mould",
    "ms": "Bakteria, yis dan kulat"
   },
   {
    "en": "Colour and fragrance",
    "ms": "Warna dan wangian"
   },
   {
    "en": "Fill weight and cap torque",
    "ms": "Berat isian dan tork penutup"
   },
   {
    "en": "pH and viscosity",
    "ms": "pH dan kelikatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf072",
  "set": "manufacturing",
  "cat": "Quality control",
  "type": "mc",
  "q": {
   "en": "A preservative 'challenge test' checks...",
   "ms": "'Ujian cabaran' pengawet memeriksa..."
  },
  "opts": [
   {
    "en": "If the preservative can fight added germs",
    "ms": "Sama ada pengawet dapat melawan kuman yang ditambah"
   },
   {
    "en": "Whether customers like the new smell",
    "ms": "Sama ada pelanggan suka bau baharu"
   },
   {
    "en": "Whether the cap stays tight when dropped",
    "ms": "Sama ada penutup kekal ketat apabila dijatuhkan"
   },
   {
    "en": "How fast the filling line can run",
    "ms": "Kelajuan maksimum talian pengisian"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf073",
  "set": "manufacturing",
  "cat": "Quality control",
  "type": "mc",
  "q": {
   "en": "Stability testing checks that...",
   "ms": "Ujian kestabilan memastikan bahawa..."
  },
  "opts": [
   {
    "en": "The product stays good throughout its shelf life",
    "ms": "Produk kekal baik sepanjang hayat simpanannya"
   },
   {
    "en": "The mixer runs smoothly without shaking",
    "ms": "Pengadun berjalan lancar tanpa bergegar"
   },
   {
    "en": "The pallet can hold the full load safely",
    "ms": "Palet boleh menampung muatan penuh dengan selamat"
   },
   {
    "en": "The bottle stands upright without falling",
    "ms": "Botol boleh berdiri tegak tanpa jatuh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf074",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "'Shelf life' is...",
   "ms": "'Hayat simpanan' ialah..."
  },
  "opts": [
   {
    "en": "How long a product stays safe and effective",
    "ms": "Tempoh produk kekal selamat dan berkesan"
   },
   {
    "en": "The length of a shelf",
    "ms": "Panjang rak"
   },
   {
    "en": "How long it sits in a shop before it is sold",
    "ms": "Tempoh produk di kedai sebelum dijual"
   },
   {
    "en": "The time to fill one bottle",
    "ms": "Masa untuk mengisi satu botol"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf075",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "An open-jar symbol with '12M' on a cream means...",
   "ms": "Simbol balang terbuka dengan '12M' pada krim bermaksud..."
  },
  "opts": [
   {
    "en": "Use within 12 months after opening",
    "ms": "Gunakan dalam 12 bulan selepas dibuka"
   },
   {
    "en": "The jar contains 12 ml of cream",
    "ms": "Balang mengandungi 12 ml krim"
   },
   {
    "en": "It was made in the 12th month",
    "ms": "Ia dibuat pada bulan ke-12"
   },
   {
    "en": "It can only be used 12 times",
    "ms": "Ia hanya boleh digunakan 12 kali"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf076",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "'Line clearance' before a new product run means...",
   "ms": "'Pembersihan talian' (line clearance) sebelum pengeluaran produk baharu bermaksud..."
  },
  "opts": [
   {
    "en": "Removing everything left from the last product run",
    "ms": "Mengeluarkan semua yang tinggal daripada pengeluaran produk sebelumnya"
   },
   {
    "en": "Clearing the walkway so forklifts can pass",
    "ms": "Mengosongkan laluan supaya forklif boleh lalu"
   },
   {
    "en": "Deleting the last batch's records from the system",
    "ms": "Memadam rekod kelompok lepas daripada sistem"
   },
   {
    "en": "Sending operators on a break before starting",
    "ms": "Menghantar operator berehat sebelum bermula"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf077",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "Why is line clearance important?",
   "ms": "Mengapakah pembersihan talian penting?"
  },
  "opts": [
   {
    "en": "To prevent mix-ups, like the wrong label",
    "ms": "Untuk mengelakkan kekeliruan, seperti label yang salah"
   },
   {
    "en": "To save electricity between runs",
    "ms": "Untuk menjimatkan elektrik antara pengeluaran"
   },
   {
    "en": "To let the machines cool down",
    "ms": "Untuk membiarkan mesin menjadi sejuk"
   },
   {
    "en": "To make the line look tidy for visitors",
    "ms": "Supaya talian kelihatan kemas untuk pelawat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf078",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "What does CIP stand for?",
   "ms": "Apakah maksud CIP?"
  },
  "opts": [
   {
    "en": "Cleaning in Place",
    "ms": "Pembersihan di Tempat"
   },
   {
    "en": "Check in Process",
    "ms": "Semakan dalam Proses"
   },
   {
    "en": "Cost in Production",
    "ms": "Kos dalam Pengeluaran"
   },
   {
    "en": "Carton in Pallet",
    "ms": "Karton dalam Palet"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf079",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "After a mixing tank is cleaned, what should happen before it is used again?",
   "ms": "Selepas tangki pengadun dibersihkan, apakah yang perlu dilakukan sebelum digunakan semula?"
  },
  "opts": [
   {
    "en": "Check it and record that it is clean",
    "ms": "Periksa dan rekodkan bahawa ia bersih"
   },
   {
    "en": "Fill it straight away to save time",
    "ms": "Terus mengisinya untuk menjimatkan masa"
   },
   {
    "en": "Leave it open to dry for a week",
    "ms": "Biarkan terbuka untuk kering selama seminggu"
   },
   {
    "en": "Nothing, cleaning it is enough",
    "ms": "Tiada apa-apa, membersihkannya sudah memadai"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf080",
  "set": "manufacturing",
  "cat": "Materials",
  "type": "mc",
  "q": {
   "en": "Purified water is used in personal care products because it...",
   "ms": "Air tulen digunakan dalam produk penjagaan diri kerana ia..."
  },
  "opts": [
   {
    "en": "Has fewer impurities and microbes",
    "ms": "Mempunyai kurang bendasing dan mikrob"
   },
   {
    "en": "Is cheaper than normal tap water",
    "ms": "Lebih murah daripada air paip biasa"
   },
   {
    "en": "Makes the product smell fresher",
    "ms": "Menjadikan bau produk lebih segar"
   },
   {
    "en": "Gives the product a nicer colour",
    "ms": "Memberikan warna yang lebih cantik"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf081",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "A fill weight check makes sure each bottle holds...",
   "ms": "Semakan berat isian memastikan setiap botol mengandungi..."
  },
  "opts": [
   {
    "en": "At least the amount stated on the label",
    "ms": "Sekurang-kurangnya jumlah yang dinyatakan pada label"
   },
   {
    "en": "As little product as possible",
    "ms": "Produk sesedikit yang mungkin"
   },
   {
    "en": "Exactly half of the bottle's space",
    "ms": "Tepat separuh ruang botol"
   },
   {
    "en": "Whatever amount the filler gives",
    "ms": "Apa sahaja jumlah yang diberi oleh mesin pengisi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf082",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "Cap torque is checked so the cap is...",
   "ms": "Tork penutup diperiksa supaya penutup..."
  },
  "opts": [
   {
    "en": "Not too loose and not too tight",
    "ms": "Tidak terlalu longgar dan tidak terlalu ketat"
   },
   {
    "en": "As tight as the machine can go",
    "ms": "Seketat yang mampu dilakukan mesin"
   },
   {
    "en": "Shiny and free of scratches",
    "ms": "Berkilat dan bebas calar"
   },
   {
    "en": "The right colour for the product",
    "ms": "Berwarna betul untuk produk itu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf083",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "A leak test on a sealed bottle or tube checks for...",
   "ms": "Ujian kebocoran pada botol atau tiub yang dimeterai memeriksa..."
  },
  "opts": [
   {
    "en": "Product escaping from the pack",
    "ms": "Produk terkeluar dari bungkusan"
   },
   {
    "en": "Spelling mistakes on the label",
    "ms": "Kesilapan ejaan pada label"
   },
   {
    "en": "Faded print on the carton",
    "ms": "Cetakan pudar pada karton"
   },
   {
    "en": "The wrong price sticker",
    "ms": "Pelekat harga yang salah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf084",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "The batch code and expiry date on a pack are mainly for...",
   "ms": "Kod kelompok dan tarikh luput pada bungkusan terutamanya untuk..."
  },
  "opts": [
   {
    "en": "Traceability and consumer safety",
    "ms": "Kebolehkesanan dan keselamatan pengguna"
   },
   {
    "en": "Making the pack look attractive",
    "ms": "Menjadikan bungkusan kelihatan menarik"
   },
   {
    "en": "Advertising a new promotion",
    "ms": "Mengiklankan promosi baharu"
   },
   {
    "en": "Telling the shop the selling price",
    "ms": "Memberitahu kedai harga jualan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf085",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "'Primary packaging' is...",
   "ms": "'Pembungkusan primer' ialah..."
  },
  "opts": [
   {
    "en": "The pack that touches the product",
    "ms": "Bungkusan yang bersentuhan dengan produk"
   },
   {
    "en": "The carton used for shipping",
    "ms": "Karton yang digunakan untuk penghantaran"
   },
   {
    "en": "The pallet the cartons stand on",
    "ms": "Palet tempat karton diletakkan"
   },
   {
    "en": "The plastic film around a pallet",
    "ms": "Filem plastik yang membalut palet"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf086",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "'Secondary packaging' is...",
   "ms": "'Pembungkusan sekunder' ialah..."
  },
  "opts": [
   {
    "en": "The box or carton around the primary pack",
    "ms": "Kotak atau karton yang membalut bungkusan primer"
   },
   {
    "en": "The bottle that holds the product itself",
    "ms": "Botol yang mengisi produk itu sendiri"
   },
   {
    "en": "The cap that closes the bottle",
    "ms": "Penutup yang menutup botol"
   },
   {
    "en": "The formula inside the bottle",
    "ms": "Formula di dalam botol"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf087",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "A shrink-wrap tunnel uses...",
   "ms": "Terowong balutan kecut (shrink-wrap) menggunakan..."
  },
  "opts": [
   {
    "en": "Heat to shrink plastic film tight",
    "ms": "Haba untuk mengecutkan filem plastik"
   },
   {
    "en": "Water jets to wash the empty bottles",
    "ms": "Pancutan air untuk mencuci botol kosong"
   },
   {
    "en": "Magnets to hold the caps in place",
    "ms": "Magnet untuk memegang penutup di tempatnya"
   },
   {
    "en": "Cold air to cool the product quickly",
    "ms": "Udara sejuk untuk menyejukkan produk dengan cepat"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf088",
  "set": "manufacturing",
  "cat": "Packaging",
  "type": "mc",
  "q": {
   "en": "A checkweigher on the packing line...",
   "ms": "Penimbang semak (checkweigher) di talian pembungkusan..."
  },
  "opts": [
   {
    "en": "Rejects packs that are too light or too heavy",
    "ms": "Menolak bungkusan yang terlalu ringan atau terlalu berat"
   },
   {
    "en": "Prints the batch code on each pack",
    "ms": "Mencetak kod kelompok pada setiap bungkusan"
   },
   {
    "en": "Counts how many workers are on the line",
    "ms": "Mengira bilangan pekerja di talian"
   },
   {
    "en": "Checks that the label is on straight",
    "ms": "Memeriksa sama ada label dilekat lurus"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf089",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "Why wear a hairnet in the production area?",
   "ms": "Mengapakah perlu memakai jaring rambut di kawasan pengeluaran?"
  },
  "opts": [
   {
    "en": "To stop hair falling into the product",
    "ms": "Untuk mengelakkan rambut jatuh ke dalam produk"
   },
   {
    "en": "To keep the head cool in the heat",
    "ms": "Untuk menyejukkan kepala ketika panas"
   },
   {
    "en": "To show which department you are from",
    "ms": "Untuk menunjukkan jabatan anda"
   },
   {
    "en": "To keep hair tidy for photos",
    "ms": "Untuk memastikan rambut kemas untuk gambar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf090",
  "set": "manufacturing",
  "cat": "Hygiene",
  "type": "mc",
  "q": {
   "en": "Washing hands before entering production mainly prevents...",
   "ms": "Mencuci tangan sebelum memasuki kawasan pengeluaran terutamanya mengelakkan..."
  },
  "opts": [
   {
    "en": "Germs getting into the product",
    "ms": "Kuman masuk ke dalam produk"
   },
   {
    "en": "Dry skin on the hands",
    "ms": "Kulit tangan kering"
   },
   {
    "en": "Slipping on a wet floor",
    "ms": "Tergelincir di lantai basah"
   },
   {
    "en": "Machine breakdowns on the line",
    "ms": "Kerosakan mesin di talian"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf091",
  "set": "manufacturing",
  "cat": "Materials",
  "type": "mc",
  "q": {
   "en": "When raw materials arrive at the factory, they should be...",
   "ms": "Apabila bahan mentah tiba di kilang, ia perlu..."
  },
  "opts": [
   {
    "en": "Quarantined until checked and released",
    "ms": "Dikuarantin sehingga diperiksa dan dilepaskan"
   },
   {
    "en": "Used straight away to save time",
    "ms": "Terus digunakan untuk menjimatkan masa"
   },
   {
    "en": "Stored wherever there is free space",
    "ms": "Disimpan di mana-mana ruang kosong"
   },
   {
    "en": "Sent back to the supplier unopened",
    "ms": "Dihantar balik kepada pembekal tanpa dibuka"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf092",
  "set": "manufacturing",
  "cat": "Materials",
  "type": "mc",
  "q": {
   "en": "A supplier's Certificate of Analysis (CoA) shows...",
   "ms": "Sijil Analisis (CoA) daripada pembekal menunjukkan..."
  },
  "opts": [
   {
    "en": "Test results for that batch",
    "ms": "Keputusan ujian bagi kelompok itu"
   },
   {
    "en": "The supplier's company history",
    "ms": "Sejarah syarikat pembekal"
   },
   {
    "en": "The amount on the invoice",
    "ms": "Jumlah pada invois"
   },
   {
    "en": "The delivery driver's details",
    "ms": "Butiran pemandu penghantaran"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf093",
  "set": "manufacturing",
  "cat": "Regulation",
  "type": "mc",
  "q": {
   "en": "In Malaysia, cosmetic products must be notified to...",
   "ms": "Di Malaysia, produk kosmetik mesti dinotifikasikan kepada..."
  },
  "opts": [
   {
    "en": "NPRA, under the Ministry of Health",
    "ms": "NPRA, di bawah Kementerian Kesihatan"
   },
   {
    "en": "JPJ, under the Ministry of Transport",
    "ms": "JPJ, di bawah Kementerian Pengangkutan"
   },
   {
    "en": "MARDI, the agriculture research agency",
    "ms": "MARDI, agensi penyelidikan pertanian"
   },
   {
    "en": "SSM, the Companies Commission",
    "ms": "SSM, Suruhanjaya Syarikat Malaysia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf094",
  "set": "manufacturing",
  "cat": "Halal",
  "type": "mc",
  "q": {
   "en": "Malaysia's main halal certification body is...",
   "ms": "Badan pensijilan halal utama di Malaysia ialah..."
  },
  "opts": [
   {
    "en": "JAKIM",
    "ms": "JAKIM"
   },
   {
    "en": "SIRIM",
    "ms": "SIRIM"
   },
   {
    "en": "MITI",
    "ms": "MITI"
   },
   {
    "en": "MPOB",
    "ms": "MPOB"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf095",
  "set": "manufacturing",
  "cat": "Halal",
  "type": "mc",
  "q": {
   "en": "For a halal product, what must be controlled?",
   "ms": "Bagi produk halal, apakah yang mesti dikawal?"
  },
  "opts": [
   {
    "en": "All ingredients and the whole process",
    "ms": "Semua bahan dan keseluruhan proses"
   },
   {
    "en": "Only the halal logo on the label",
    "ms": "Logo halal pada label sahaja"
   },
   {
    "en": "Only the main ingredient",
    "ms": "Bahan utama sahaja"
   },
   {
    "en": "Only the final product's smell",
    "ms": "Bau produk akhir sahaja"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf096",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "An antiperspirant mainly works to...",
   "ms": "Antiperspiran terutamanya berfungsi untuk..."
  },
  "opts": [
   {
    "en": "Reduce sweating",
    "ms": "Mengurangkan peluh"
   },
   {
    "en": "Colour the skin",
    "ms": "Mewarnakan kulit"
   },
   {
    "en": "Clean the teeth",
    "ms": "Membersihkan gigi"
   },
   {
    "en": "Moisturise the hair",
    "ms": "Melembapkan rambut"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf097",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "Hair conditioner is used after shampoo mainly to...",
   "ms": "Perapi rambut digunakan selepas syampu terutamanya untuk..."
  },
  "opts": [
   {
    "en": "Make hair soft and easy to comb",
    "ms": "Menjadikan rambut lembut dan mudah disikat"
   },
   {
    "en": "Remove all the oil from hair",
    "ms": "Menghilangkan semua minyak daripada rambut"
   },
   {
    "en": "Colour the hair",
    "ms": "Mewarnakan rambut"
   },
   {
    "en": "Kill head lice",
    "ms": "Membunuh kutu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf098",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "In skin care, glycerin mainly works as a...",
   "ms": "Dalam penjagaan kulit, gliserin terutamanya berfungsi sebagai..."
  },
  "opts": [
   {
    "en": "Humectant (draws in moisture)",
    "ms": "Humektan (menarik kelembapan)"
   },
   {
    "en": "Preservative (stops germs)",
    "ms": "Pengawet (menghalang kuman)"
   },
   {
    "en": "Sunscreen (blocks UV)",
    "ms": "Pelindung matahari (menyekat UV)"
   },
   {
    "en": "Fragrance (adds scent)",
    "ms": "Pewangi (menambah bau)"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf099",
  "set": "manufacturing",
  "cat": "Personal care",
  "type": "mc",
  "q": {
   "en": "On sunscreen, SPF stands for...",
   "ms": "Pada pelindung matahari, SPF bermaksud..."
  },
  "opts": [
   {
    "en": "Sun Protection Factor",
    "ms": "Faktor Perlindungan Matahari"
   },
   {
    "en": "Skin Purity Formula",
    "ms": "Formula Ketulenan Kulit"
   },
   {
    "en": "Special Perfume Fragrance",
    "ms": "Wangian Minyak Wangi Khas"
   },
   {
    "en": "Sweat Proof Finish",
    "ms": "Kemasan Kalis Peluh"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "mf100",
  "set": "manufacturing",
  "cat": "Quality control",
  "type": "mc",
  "q": {
   "en": "Retained samples of every batch are kept so that...",
   "ms": "Sampel simpanan setiap kelompok disimpan supaya..."
  },
  "opts": [
   {
    "en": "The batch can be re-tested after a complaint",
    "ms": "Kelompok boleh diuji semula jika ada aduan"
   },
   {
    "en": "Staff can take them home to try",
    "ms": "Pekerja boleh membawanya pulang untuk dicuba"
   },
   {
    "en": "They can be sold at a discount later",
    "ms": "Ia boleh dijual dengan harga diskaun kemudian"
   },
   {
    "en": "The warehouse always looks well stocked",
    "ms": "Gudang sentiasa kelihatan penuh dengan stok"
   }
  ],
  "ans": 0,
  "enabled": true
 }
];
