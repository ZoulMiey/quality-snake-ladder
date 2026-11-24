// Questions added on 24 Nov 2026 so every set has 100 (Quality 80 → 100, World 80 → 100, Logo 84 → 100,
// Malaysia 82 → 100, General Knowledge 80 → 100). Right answer first (ans 0); the game shuffles the answers.
// An existing database receives them once (setup/q100Added in QuestionManager.tsx).
import type { Question } from "./types.ts";

export const EXTRA_QUESTIONS: Question[] = [
 {
  "id": "qy01",
  "set": "quality",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "What does 'muda' mean in Lean?",
   "ms": "Apakah maksud 'muda' dalam Lean?"
  },
  "opts": [
   {
    "en": "Waste",
    "ms": "Pembaziran"
   },
   {
    "en": "Speed",
    "ms": "Kelajuan"
   },
   {
    "en": "Teamwork",
    "ms": "Kerja berpasukan"
   },
   {
    "en": "Quality",
    "ms": "Kualiti"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy02",
  "set": "quality",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "What does 'jidoka' mean?",
   "ms": "Apakah maksud 'jidoka'?"
  },
  "opts": [
   {
    "en": "Stopping automatically when a problem is found",
    "ms": "Berhenti secara automatik apabila masalah dikesan"
   },
   {
    "en": "Working faster",
    "ms": "Bekerja lebih pantas"
   },
   {
    "en": "Cleaning the machine",
    "ms": "Membersihkan mesin"
   },
   {
    "en": "Counting the stock",
    "ms": "Mengira stok"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy03",
  "set": "quality",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "SMED is a method to reduce…",
   "ms": "SMED ialah kaedah untuk mengurangkan…"
  },
  "opts": [
   {
    "en": "Changeover time",
    "ms": "Masa pertukaran"
   },
   {
    "en": "The number of workers",
    "ms": "Bilangan pekerja"
   },
   {
    "en": "The electricity bill",
    "ms": "Bil elektrik"
   },
   {
    "en": "Paperwork",
    "ms": "Kerja kertas"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy04",
  "set": "quality",
  "cat": "Lean",
  "type": "mc",
  "q": {
   "en": "What does 'Just-in-Time' (JIT) mean?",
   "ms": "Apakah maksud 'Just-in-Time' (JIT)?"
  },
  "opts": [
   {
    "en": "Make only what is needed, when it is needed",
    "ms": "Hasilkan hanya apa yang diperlukan, apabila diperlukan"
   },
   {
    "en": "Make as much as possible",
    "ms": "Hasilkan sebanyak mungkin"
   },
   {
    "en": "Always finish work early",
    "ms": "Sentiasa siapkan kerja awal"
   },
   {
    "en": "Keep a big stock just in case",
    "ms": "Simpan stok besar untuk berjaga-jaga"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy05",
  "set": "quality",
  "cat": "Continuous Improvement",
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
    "en": "Team Performance Measure",
    "ms": "Ukuran Prestasi Pasukan"
   },
   {
    "en": "Time Planning Method",
    "ms": "Kaedah Perancangan Masa"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy06",
  "set": "quality",
  "cat": "Problem Solving",
  "type": "mc",
  "q": {
   "en": "In Six Sigma DMAIC, what does the 'C' stand for?",
   "ms": "Dalam DMAIC Six Sigma, apakah maksud huruf 'C'?"
  },
  "opts": [
   {
    "en": "Control",
    "ms": "Kawal (Control)"
   },
   {
    "en": "Check",
    "ms": "Semak (Check)"
   },
   {
    "en": "Change",
    "ms": "Ubah (Change)"
   },
   {
    "en": "Count",
    "ms": "Kira (Count)"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy07",
  "set": "quality",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "How many tools are in the classic 'QC 7 tools'?",
   "ms": "Berapakah bilangan alat dalam 'QC 7 tools' yang klasik?"
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
    "en": "8",
    "ms": "8"
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
  "id": "qy08",
  "set": "quality",
  "cat": "Measurement & Specs",
  "type": "mc",
  "q": {
   "en": "A measurement is 'accurate' when it is…",
   "ms": "Sesuatu ukuran dikatakan 'tepat (accurate)' apabila ia…"
  },
  "opts": [
   {
    "en": "Close to the true value",
    "ms": "Hampir dengan nilai sebenar"
   },
   {
    "en": "Close to the other readings",
    "ms": "Hampir dengan bacaan lain"
   },
   {
    "en": "Taken very quickly",
    "ms": "Diambil dengan sangat pantas"
   },
   {
    "en": "Written with many decimals",
    "ms": "Ditulis dengan banyak titik perpuluhan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy09",
  "set": "quality",
  "cat": "Tools",
  "type": "tf",
  "q": {
   "en": "Visual management uses signs, colours and boards so everyone can see the status at a glance.",
   "ms": "Pengurusan visual menggunakan tanda, warna dan papan supaya semua orang dapat melihat status dengan sekali pandang."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy10",
  "set": "quality",
  "cat": "Quality Basics",
  "type": "tf",
  "q": {
   "en": "If you find a defect, it is best to hide it so the line can keep running.",
   "ms": "Jika anda menjumpai kecacatan, lebih baik sembunyikannya supaya barisan boleh terus berjalan."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "qy11",
  "set": "quality",
  "cat": "GMP & Hygiene",
  "type": "tf",
  "q": {
   "en": "Material that is On Hold (quarantined) can be used in production if it is urgent.",
   "ms": "Bahan yang Ditahan (dikuarantin) boleh digunakan dalam pengeluaran jika mendesak."
  },
  "ans": 1,
  "enabled": true
 },
 {
  "id": "qy12",
  "set": "quality",
  "cat": "Continuous Improvement",
  "type": "tf",
  "q": {
   "en": "Every employee can suggest an improvement, not only managers.",
   "ms": "Setiap pekerja boleh mencadangkan penambahbaikan, bukan hanya pengurus."
  },
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy13",
  "set": "quality",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "What is a 'line clearance' before a new batch starts?",
   "ms": "Apakah 'line clearance' sebelum kelompok baharu bermula?"
  },
  "opts": [
   {
    "en": "Checking nothing from the last batch is left on the line",
    "ms": "Memastikan tiada apa-apa daripada kelompok sebelumnya tertinggal di barisan"
   },
   {
    "en": "Cleaning the office",
    "ms": "Membersihkan pejabat"
   },
   {
    "en": "Sending the workers home",
    "ms": "Menghantar pekerja pulang"
   },
   {
    "en": "Making the line run faster",
    "ms": "Mempercepatkan barisan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy14",
  "set": "quality",
  "cat": "GMP & Hygiene",
  "type": "mc",
  "q": {
   "en": "Cross-contamination means…",
   "ms": "Pencemaran silang bermaksud…"
  },
  "opts": [
   {
    "en": "One product or material getting into another by mistake",
    "ms": "Satu produk atau bahan masuk ke dalam yang lain secara tidak sengaja"
   },
   {
    "en": "Two teams working together",
    "ms": "Dua pasukan bekerja bersama"
   },
   {
    "en": "Mixing colours on purpose",
    "ms": "Mencampurkan warna dengan sengaja"
   },
   {
    "en": "Checking two batches at once",
    "ms": "Memeriksa dua kelompok serentak"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy15",
  "set": "quality",
  "cat": "Audit & Documents",
  "type": "mc",
  "q": {
   "en": "In an audit, what is 'objective evidence'?",
   "ms": "Dalam audit, apakah 'bukti objektif'?"
  },
  "opts": [
   {
    "en": "Facts that can be seen or checked, such as records",
    "ms": "Fakta yang boleh dilihat atau disemak, seperti rekod"
   },
   {
    "en": "The auditor's feeling",
    "ms": "Perasaan juruaudit"
   },
   {
    "en": "What people say they will do",
    "ms": "Apa yang orang kata mereka akan buat"
   },
   {
    "en": "A rumour",
    "ms": "Khabar angin"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy16",
  "set": "quality",
  "cat": "Customer",
  "type": "mc",
  "q": {
   "en": "What does 'Voice of the Customer' mean?",
   "ms": "Apakah maksud 'Voice of the Customer' (Suara Pelanggan)?"
  },
  "opts": [
   {
    "en": "What customers need and expect",
    "ms": "Apa yang pelanggan perlukan dan harapkan"
   },
   {
    "en": "The customer service phone line",
    "ms": "Talian telefon khidmat pelanggan"
   },
   {
    "en": "An advertisement",
    "ms": "Iklan"
   },
   {
    "en": "A sales target",
    "ms": "Sasaran jualan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy17",
  "set": "quality",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "ISO 22000 is a standard for…",
   "ms": "ISO 22000 ialah standard untuk…"
  },
  "opts": [
   {
    "en": "Food safety management",
    "ms": "Pengurusan keselamatan makanan"
   },
   {
    "en": "Energy management",
    "ms": "Pengurusan tenaga"
   },
   {
    "en": "Information security",
    "ms": "Keselamatan maklumat"
   },
   {
    "en": "Road safety",
    "ms": "Keselamatan jalan raya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy18",
  "set": "quality",
  "cat": "ISO Standards",
  "type": "mc",
  "q": {
   "en": "ISO/IEC 27001 is about…",
   "ms": "ISO/IEC 27001 adalah tentang…"
  },
  "opts": [
   {
    "en": "Information security",
    "ms": "Keselamatan maklumat"
   },
   {
    "en": "Food safety",
    "ms": "Keselamatan makanan"
   },
   {
    "en": "Environmental management",
    "ms": "Pengurusan alam sekitar"
   },
   {
    "en": "Medical devices",
    "ms": "Peranti perubatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy19",
  "set": "quality",
  "cat": "QC Tools",
  "type": "mc",
  "q": {
   "en": "Which chart puts problems in order from the biggest to the smallest?",
   "ms": "Carta manakah menyusun masalah daripada yang terbesar kepada yang terkecil?"
  },
  "opts": [
   {
    "en": "Pareto chart",
    "ms": "Carta Pareto"
   },
   {
    "en": "Pie chart",
    "ms": "Carta pai"
   },
   {
    "en": "Line chart",
    "ms": "Carta garis"
   },
   {
    "en": "Gantt chart",
    "ms": "Carta Gantt"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "qy20",
  "set": "quality",
  "cat": "Continuous Improvement",
  "type": "mc",
  "q": {
   "en": "What is 'benchmarking'?",
   "ms": "Apakah 'penanda aras (benchmarking)'?"
  },
  "opts": [
   {
    "en": "Comparing with the best to learn and improve",
    "ms": "Membandingkan dengan yang terbaik untuk belajar dan menambah baik"
   },
   {
    "en": "Sitting on a bench",
    "ms": "Duduk di bangku"
   },
   {
    "en": "Marking products with a code",
    "ms": "Menanda produk dengan kod"
   },
   {
    "en": "Counting defects",
    "ms": "Mengira kecacatan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w81",
  "set": "world",
  "cat": "Flags",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇫🇮",
   "ms": "Bendera negara manakah ini? 🇫🇮"
  },
  "opts": [
   {
    "en": "Finland",
    "ms": "Finland"
   },
   {
    "en": "Sweden",
    "ms": "Sweden"
   },
   {
    "en": "Norway",
    "ms": "Norway"
   },
   {
    "en": "Iceland",
    "ms": "Iceland"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w82",
  "set": "world",
  "cat": "Flags",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇳🇴",
   "ms": "Bendera negara manakah ini? 🇳🇴"
  },
  "opts": [
   {
    "en": "Norway",
    "ms": "Norway"
   },
   {
    "en": "Denmark",
    "ms": "Denmark"
   },
   {
    "en": "Iceland",
    "ms": "Iceland"
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
  "id": "w83",
  "set": "world",
  "cat": "Flags",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇳🇱",
   "ms": "Bendera negara manakah ini? 🇳🇱"
  },
  "opts": [
   {
    "en": "Netherlands",
    "ms": "Belanda"
   },
   {
    "en": "France",
    "ms": "Perancis"
   },
   {
    "en": "Russia",
    "ms": "Rusia"
   },
   {
    "en": "Luxembourg",
    "ms": "Luxembourg"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w84",
  "set": "world",
  "cat": "Flags",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇧🇩",
   "ms": "Bendera negara manakah ini? 🇧🇩"
  },
  "opts": [
   {
    "en": "Bangladesh",
    "ms": "Bangladesh"
   },
   {
    "en": "Japan",
    "ms": "Jepun"
   },
   {
    "en": "Palau",
    "ms": "Palau"
   },
   {
    "en": "Pakistan",
    "ms": "Pakistan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w85",
  "set": "world",
  "cat": "Flags",
  "type": "mc",
  "q": {
   "en": "Which country's flag is this? 🇰🇪",
   "ms": "Bendera negara manakah ini? 🇰🇪"
  },
  "opts": [
   {
    "en": "Kenya",
    "ms": "Kenya"
   },
   {
    "en": "Nigeria",
    "ms": "Nigeria"
   },
   {
    "en": "Ghana",
    "ms": "Ghana"
   },
   {
    "en": "Uganda",
    "ms": "Uganda"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w86",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of France?",
   "ms": "Apakah ibu negara Perancis?"
  },
  "opts": [
   {
    "en": "Paris",
    "ms": "Paris"
   },
   {
    "en": "Lyon",
    "ms": "Lyon"
   },
   {
    "en": "Marseille",
    "ms": "Marseille"
   },
   {
    "en": "Nice",
    "ms": "Nice"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w87",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of the United Kingdom?",
   "ms": "Apakah ibu negara United Kingdom?"
  },
  "opts": [
   {
    "en": "London",
    "ms": "London"
   },
   {
    "en": "Manchester",
    "ms": "Manchester"
   },
   {
    "en": "Edinburgh",
    "ms": "Edinburgh"
   },
   {
    "en": "Liverpool",
    "ms": "Liverpool"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w88",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Russia?",
   "ms": "Apakah ibu negara Rusia?"
  },
  "opts": [
   {
    "en": "Moscow",
    "ms": "Moscow"
   },
   {
    "en": "St Petersburg",
    "ms": "St Petersburg"
   },
   {
    "en": "Kazan",
    "ms": "Kazan"
   },
   {
    "en": "Sochi",
    "ms": "Sochi"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w89",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Argentina?",
   "ms": "Apakah ibu negara Argentina?"
  },
  "opts": [
   {
    "en": "Buenos Aires",
    "ms": "Buenos Aires"
   },
   {
    "en": "Córdoba",
    "ms": "Córdoba"
   },
   {
    "en": "Rosario",
    "ms": "Rosario"
   },
   {
    "en": "Mendoza",
    "ms": "Mendoza"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w90",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Kenya?",
   "ms": "Apakah ibu negara Kenya?"
  },
  "opts": [
   {
    "en": "Nairobi",
    "ms": "Nairobi"
   },
   {
    "en": "Mombasa",
    "ms": "Mombasa"
   },
   {
    "en": "Kisumu",
    "ms": "Kisumu"
   },
   {
    "en": "Nakuru",
    "ms": "Nakuru"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w91",
  "set": "world",
  "cat": "Capitals",
  "type": "mc",
  "q": {
   "en": "What is the capital city of Mexico?",
   "ms": "Apakah ibu negara Mexico?"
  },
  "opts": [
   {
    "en": "Mexico City",
    "ms": "Bandar Raya Mexico"
   },
   {
    "en": "Cancún",
    "ms": "Cancún"
   },
   {
    "en": "Guadalajara",
    "ms": "Guadalajara"
   },
   {
    "en": "Monterrey",
    "ms": "Monterrey"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w92",
  "set": "world",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "Stonehenge, a ring of giant stones, is in which country?",
   "ms": "Stonehenge, bulatan batu gergasi, terletak di negara manakah?"
  },
  "opts": [
   {
    "en": "United Kingdom",
    "ms": "United Kingdom"
   },
   {
    "en": "Ireland",
    "ms": "Ireland"
   },
   {
    "en": "France",
    "ms": "Perancis"
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
  "id": "w93",
  "set": "world",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "Petra, the city carved into pink rock, is in which country?",
   "ms": "Petra, kota yang dipahat pada batu merah jambu, terletak di negara manakah?"
  },
  "opts": [
   {
    "en": "Jordan",
    "ms": "Jordan"
   },
   {
    "en": "Egypt",
    "ms": "Mesir"
   },
   {
    "en": "Iran",
    "ms": "Iran"
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
  "id": "w94",
  "set": "world",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "The Maya pyramid of Chichén Itzá is in which country?",
   "ms": "Piramid Maya Chichén Itzá terletak di negara manakah?"
  },
  "opts": [
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "Peru",
    "ms": "Peru"
   },
   {
    "en": "Brazil",
    "ms": "Brazil"
   },
   {
    "en": "Chile",
    "ms": "Chile"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w95",
  "set": "world",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "Niagara Falls lies on the border of the United States and which country?",
   "ms": "Air Terjun Niagara terletak di sempadan Amerika Syarikat dan negara manakah?"
  },
  "opts": [
   {
    "en": "Canada",
    "ms": "Kanada"
   },
   {
    "en": "Mexico",
    "ms": "Mexico"
   },
   {
    "en": "Cuba",
    "ms": "Cuba"
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
  "id": "w96",
  "set": "world",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "What is the largest hot desert in the world?",
   "ms": "Apakah gurun panas terbesar di dunia?"
  },
  "opts": [
   {
    "en": "Sahara",
    "ms": "Sahara"
   },
   {
    "en": "Kalahari",
    "ms": "Kalahari"
   },
   {
    "en": "Gobi",
    "ms": "Gobi"
   },
   {
    "en": "Namib",
    "ms": "Namib"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w97",
  "set": "world",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "What is the smallest country in the world?",
   "ms": "Apakah negara terkecil di dunia?"
  },
  "opts": [
   {
    "en": "Vatican City",
    "ms": "Kota Vatican"
   },
   {
    "en": "Monaco",
    "ms": "Monaco"
   },
   {
    "en": "Singapore",
    "ms": "Singapura"
   },
   {
    "en": "Maldives",
    "ms": "Maldives"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w98",
  "set": "world",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "Which country has the most people (since 2023)?",
   "ms": "Negara manakah mempunyai penduduk paling ramai (sejak 2023)?"
  },
  "opts": [
   {
    "en": "India",
    "ms": "India"
   },
   {
    "en": "China",
    "ms": "China"
   },
   {
    "en": "United States",
    "ms": "Amerika Syarikat"
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
  "id": "w99",
  "set": "world",
  "cat": "Currency",
  "type": "mc",
  "q": {
   "en": "What is the currency of the United Kingdom?",
   "ms": "Apakah mata wang United Kingdom?"
  },
  "opts": [
   {
    "en": "Pound sterling",
    "ms": "Paun sterling"
   },
   {
    "en": "Euro",
    "ms": "Euro"
   },
   {
    "en": "Dollar",
    "ms": "Dolar"
   },
   {
    "en": "Franc",
    "ms": "Franc"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "w100",
  "set": "world",
  "cat": "Currency",
  "type": "mc",
  "q": {
   "en": "What is the currency of South Korea?",
   "ms": "Apakah mata wang Korea Selatan?"
  },
  "opts": [
   {
    "en": "Won",
    "ms": "Won"
   },
   {
    "en": "Yen",
    "ms": "Yen"
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
  "id": "l85",
  "set": "logo",
  "cat": "Cars",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a blue oval with its name in white handwriting?",
   "ms": "Logo jenama kereta manakah ialah bujur biru dengan namanya dalam tulisan tangan putih?"
  },
  "opts": [
   {
    "en": "Ford",
    "ms": "Ford"
   },
   {
    "en": "Kia",
    "ms": "Kia"
   },
   {
    "en": "Hyundai",
    "ms": "Hyundai"
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
  "id": "l86",
  "set": "logo",
  "cat": "Cars",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a stylised 'M' shaped like wings, inside a circle?",
   "ms": "Logo jenama kereta manakah ialah huruf 'M' berbentuk sayap di dalam bulatan?"
  },
  "opts": [
   {
    "en": "Mazda",
    "ms": "Mazda"
   },
   {
    "en": "Mitsubishi",
    "ms": "Mitsubishi"
   },
   {
    "en": "Mini",
    "ms": "Mini"
   },
   {
    "en": "Maserati",
    "ms": "Maserati"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l87",
  "set": "logo",
  "cat": "Cars",
  "type": "mc",
  "q": {
   "en": "Which car brand's logo is a diamond (rhombus) shape?",
   "ms": "Logo jenama kereta manakah berbentuk berlian (rombus)?"
  },
  "opts": [
   {
    "en": "Renault",
    "ms": "Renault"
   },
   {
    "en": "Citroën",
    "ms": "Citroën"
   },
   {
    "en": "Peugeot",
    "ms": "Peugeot"
   },
   {
    "en": "Kia",
    "ms": "Kia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l88",
  "set": "logo",
  "cat": "Cars",
  "type": "mc",
  "q": {
   "en": "Which Italian car brand's round badge shows a red cross and a crowned snake?",
   "ms": "Lencana bulat jenama kereta Itali manakah menunjukkan pangkah merah dan ular bermahkota?"
  },
  "opts": [
   {
    "en": "Alfa Romeo",
    "ms": "Alfa Romeo"
   },
   {
    "en": "Fiat",
    "ms": "Fiat"
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
  "id": "l89",
  "set": "logo",
  "cat": "Fashion",
  "type": "mc",
  "q": {
   "en": "Which crystal jewellery brand's logo is a swan?",
   "ms": "Logo jenama barang kemas kristal manakah ialah seekor angsa?"
  },
  "opts": [
   {
    "en": "Swarovski",
    "ms": "Swarovski"
   },
   {
    "en": "Tiffany & Co.",
    "ms": "Tiffany & Co."
   },
   {
    "en": "Pandora",
    "ms": "Pandora"
   },
   {
    "en": "Cartier",
    "ms": "Cartier"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l90",
  "set": "logo",
  "cat": "Fashion",
  "type": "mc",
  "q": {
   "en": "Which jeans brand is known for a small red tab on the back pocket?",
   "ms": "Jenama seluar jean manakah terkenal dengan tab merah kecil pada poket belakang?"
  },
  "opts": [
   {
    "en": "Levi's",
    "ms": "Levi's"
   },
   {
    "en": "Wrangler",
    "ms": "Wrangler"
   },
   {
    "en": "Lee",
    "ms": "Lee"
   },
   {
    "en": "Diesel",
    "ms": "Diesel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l91",
  "set": "logo",
  "cat": "Food",
  "type": "mc",
  "q": {
   "en": "Which cereal brand has a rooster on its cornflakes boxes?",
   "ms": "Jenama bijirin manakah mempunyai ayam jantan pada kotak cornflakesnya?"
  },
  "opts": [
   {
    "en": "Kellogg's",
    "ms": "Kellogg's"
   },
   {
    "en": "Quaker",
    "ms": "Quaker"
   },
   {
    "en": "Nestlé",
    "ms": "Nestlé"
   },
   {
    "en": "Post",
    "ms": "Post"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l92",
  "set": "logo",
  "cat": "Food",
  "type": "mc",
  "q": {
   "en": "Which chocolate malt drink comes in a green tin showing athletes?",
   "ms": "Minuman coklat malt manakah dijual dalam tin hijau bergambar atlet?"
  },
  "opts": [
   {
    "en": "Milo",
    "ms": "Milo"
   },
   {
    "en": "Horlicks",
    "ms": "Horlicks"
   },
   {
    "en": "Ovaltine",
    "ms": "Ovaltine"
   },
   {
    "en": "Nescafé",
    "ms": "Nescafé"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l93",
  "set": "logo",
  "cat": "Food",
  "type": "mc",
  "q": {
   "en": "Which potato chip brand's logo is a red ribbon across a yellow sun-like circle?",
   "ms": "Logo jenama kerepek kentang manakah ialah reben merah merentasi bulatan kuning seperti matahari?"
  },
  "opts": [
   {
    "en": "Lay's",
    "ms": "Lay's"
   },
   {
    "en": "Pringles",
    "ms": "Pringles"
   },
   {
    "en": "Doritos",
    "ms": "Doritos"
   },
   {
    "en": "Cheetos",
    "ms": "Cheetos"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l94",
  "set": "logo",
  "cat": "Tech",
  "type": "mc",
  "q": {
   "en": "Which search engine's logo spells its name in blue, red, yellow, blue, green and red letters?",
   "ms": "Logo enjin carian manakah mengeja namanya dengan huruf biru, merah, kuning, biru, hijau dan merah?"
  },
  "opts": [
   {
    "en": "Google",
    "ms": "Google"
   },
   {
    "en": "Yahoo",
    "ms": "Yahoo"
   },
   {
    "en": "Bing",
    "ms": "Bing"
   },
   {
    "en": "Baidu",
    "ms": "Baidu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l95",
  "set": "logo",
  "cat": "Tech",
  "type": "mc",
  "q": {
   "en": "Which video-call app's logo is a white video camera on a blue background?",
   "ms": "Logo aplikasi panggilan video manakah ialah kamera video putih berlatar biru?"
  },
  "opts": [
   {
    "en": "Zoom",
    "ms": "Zoom"
   },
   {
    "en": "Skype",
    "ms": "Skype"
   },
   {
    "en": "Microsoft Teams",
    "ms": "Microsoft Teams"
   },
   {
    "en": "Google Meet",
    "ms": "Google Meet"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l96",
  "set": "logo",
  "cat": "Tech",
  "type": "mc",
  "q": {
   "en": "Which video game company's name is often shown in red inside a rounded outline?",
   "ms": "Nama syarikat permainan video manakah sering ditunjukkan dalam warna merah di dalam garis bulat?"
  },
  "opts": [
   {
    "en": "Nintendo",
    "ms": "Nintendo"
   },
   {
    "en": "Sega",
    "ms": "Sega"
   },
   {
    "en": "Atari",
    "ms": "Atari"
   },
   {
    "en": "Ubisoft",
    "ms": "Ubisoft"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l97",
  "set": "logo",
  "cat": "Others",
  "type": "mc",
  "q": {
   "en": "Which delivery company's logo is red letters on a yellow background?",
   "ms": "Logo syarikat penghantaran manakah ialah huruf merah berlatar kuning?"
  },
  "opts": [
   {
    "en": "DHL",
    "ms": "DHL"
   },
   {
    "en": "FedEx",
    "ms": "FedEx"
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
  "id": "l98",
  "set": "logo",
  "cat": "Others",
  "type": "mc",
  "q": {
   "en": "Which pocket knife brand's logo is a white cross on a red shield?",
   "ms": "Logo jenama pisau lipat manakah ialah pangkah putih pada perisai merah?"
  },
  "opts": [
   {
    "en": "Victorinox",
    "ms": "Victorinox"
   },
   {
    "en": "Swatch",
    "ms": "Swatch"
   },
   {
    "en": "Rolex",
    "ms": "Rolex"
   },
   {
    "en": "Tissot",
    "ms": "Tissot"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "l99",
  "set": "logo",
  "cat": "Others",
  "type": "mc",
  "q": {
   "en": "Which payment card brand's logo is its four-letter name in blue capital letters?",
   "ms": "Logo jenama kad pembayaran manakah ialah namanya yang empat huruf dalam huruf besar biru?"
  },
  "opts": [
   {
    "en": "Visa",
    "ms": "Visa"
   },
   {
    "en": "Mastercard",
    "ms": "Mastercard"
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
  "id": "l100",
  "set": "logo",
  "cat": "Tech",
  "type": "mc",
  "q": {
   "en": "Which ride-hailing app popular in Malaysia has a green logo with its name in white?",
   "ms": "Aplikasi e-hailing popular di Malaysia manakah mempunyai logo hijau dengan namanya berwarna putih?"
  },
  "opts": [
   {
    "en": "Grab",
    "ms": "Grab"
   },
   {
    "en": "Uber",
    "ms": "Uber"
   },
   {
    "en": "Bolt",
    "ms": "Bolt"
   },
   {
    "en": "Lyft",
    "ms": "Lyft"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m83",
  "set": "malaysia",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "The Kuala Lumpur Tower is also known as…",
   "ms": "Kuala Lumpur Tower juga dikenali sebagai…"
  },
  "opts": [
   {
    "en": "Menara KL",
    "ms": "Menara KL"
   },
   {
    "en": "Menara Merdeka",
    "ms": "Menara Merdeka"
   },
   {
    "en": "Menara Taming Sari",
    "ms": "Menara Taming Sari"
   },
   {
    "en": "Menara Alor Setar",
    "ms": "Menara Alor Setar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m84",
  "set": "malaysia",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "The revolving Taming Sari Tower is in which city?",
   "ms": "Menara Taming Sari yang berputar terletak di bandar manakah?"
  },
  "opts": [
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Kuantan",
    "ms": "Kuantan"
   },
   {
    "en": "Ipoh",
    "ms": "Ipoh"
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
  "id": "m85",
  "set": "malaysia",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "The Crystal Mosque (Masjid Kristal) is in which state?",
   "ms": "Masjid Kristal terletak di negeri manakah?"
  },
  "opts": [
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
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
  "id": "m86",
  "set": "malaysia",
  "cat": "Landmarks",
  "type": "mc",
  "q": {
   "en": "The pink-domed Putra Mosque is in which city?",
   "ms": "Masjid Putra yang berkubah merah jambu terletak di bandar manakah?"
  },
  "opts": [
   {
    "en": "Putrajaya",
    "ms": "Putrajaya"
   },
   {
    "en": "Shah Alam",
    "ms": "Shah Alam"
   },
   {
    "en": "Kuala Lumpur",
    "ms": "Kuala Lumpur"
   },
   {
    "en": "Melaka",
    "ms": "Melaka"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m87",
  "set": "malaysia",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "Which national park spreads over Pahang, Kelantan and Terengganu?",
   "ms": "Taman negara manakah meliputi Pahang, Kelantan dan Terengganu?"
  },
  "opts": [
   {
    "en": "Taman Negara",
    "ms": "Taman Negara"
   },
   {
    "en": "Endau-Rompin",
    "ms": "Endau-Rompin"
   },
   {
    "en": "Kinabalu Park",
    "ms": "Taman Kinabalu"
   },
   {
    "en": "Bako",
    "ms": "Bako"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m88",
  "set": "malaysia",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "Tioman Island belongs to which state?",
   "ms": "Pulau Tioman terletak di bawah negeri manakah?"
  },
  "opts": [
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Johor",
    "ms": "Johor"
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
  "id": "m89",
  "set": "malaysia",
  "cat": "Geography",
  "type": "mc",
  "q": {
   "en": "The Perhentian Islands belong to which state?",
   "ms": "Pulau Perhentian terletak di bawah negeri manakah?"
  },
  "opts": [
   {
    "en": "Terengganu",
    "ms": "Terengganu"
   },
   {
    "en": "Kelantan",
    "ms": "Kelantan"
   },
   {
    "en": "Pahang",
    "ms": "Pahang"
   },
   {
    "en": "Sabah",
    "ms": "Sabah"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m90",
  "set": "malaysia",
  "cat": "History",
  "type": "mc",
  "q": {
   "en": "Who was Malaysia's second Prime Minister?",
   "ms": "Siapakah Perdana Menteri Malaysia yang kedua?"
  },
  "opts": [
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
   },
   {
    "en": "Tunku Abdul Rahman",
    "ms": "Tunku Abdul Rahman"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m91",
  "set": "malaysia",
  "cat": "History",
  "type": "mc",
  "q": {
   "en": "Where was Malaya's independence proclaimed on 31 August 1957?",
   "ms": "Di manakah kemerdekaan Tanah Melayu diisytiharkan pada 31 Ogos 1957?"
  },
  "opts": [
   {
    "en": "Stadium Merdeka",
    "ms": "Stadium Merdeka"
   },
   {
    "en": "Dataran Merdeka",
    "ms": "Dataran Merdeka"
   },
   {
    "en": "Parliament House",
    "ms": "Bangunan Parlimen"
   },
   {
    "en": "Istana Negara",
    "ms": "Istana Negara"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m92",
  "set": "malaysia",
  "cat": "History",
  "type": "mc",
  "q": {
   "en": "In which year did Singapore leave Malaysia?",
   "ms": "Pada tahun berapakah Singapura keluar daripada Malaysia?"
  },
  "opts": [
   {
    "en": "1965",
    "ms": "1965"
   },
   {
    "en": "1963",
    "ms": "1963"
   },
   {
    "en": "1969",
    "ms": "1969"
   },
   {
    "en": "1957",
    "ms": "1957"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m93",
  "set": "malaysia",
  "cat": "Symbols",
  "type": "mc",
  "q": {
   "en": "What is at the top of Malaysia's coat of arms?",
   "ms": "Apakah yang terdapat di bahagian atas Jata Negara Malaysia?"
  },
  "opts": [
   {
    "en": "A crescent and a 14-pointed star",
    "ms": "Bulan sabit dan bintang pecah 14"
   },
   {
    "en": "A crown",
    "ms": "Mahkota"
   },
   {
    "en": "A tiger",
    "ms": "Seekor harimau"
   },
   {
    "en": "A hibiscus",
    "ms": "Bunga raya"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m94",
  "set": "malaysia",
  "cat": "Symbols",
  "type": "mc",
  "q": {
   "en": "What is the official palace of the Yang di-Pertuan Agong in Kuala Lumpur called?",
   "ms": "Apakah nama istana rasmi Yang di-Pertuan Agong di Kuala Lumpur?"
  },
  "opts": [
   {
    "en": "Istana Negara",
    "ms": "Istana Negara"
   },
   {
    "en": "Istana Budaya",
    "ms": "Istana Budaya"
   },
   {
    "en": "Istana Melawati",
    "ms": "Istana Melawati"
   },
   {
    "en": "Istana Besar",
    "ms": "Istana Besar"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m95",
  "set": "malaysia",
  "cat": "Culture",
  "type": "mc",
  "q": {
   "en": "Which traditional Malay martial art is often performed at weddings?",
   "ms": "Seni mempertahankan diri tradisional Melayu manakah sering dipersembahkan di majlis perkahwinan?"
  },
  "opts": [
   {
    "en": "Silat",
    "ms": "Silat"
   },
   {
    "en": "Kung fu",
    "ms": "Kung fu"
   },
   {
    "en": "Karate",
    "ms": "Karate"
   },
   {
    "en": "Taekwondo",
    "ms": "Taekwondo"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m96",
  "set": "malaysia",
  "cat": "Culture",
  "type": "mc",
  "q": {
   "en": "A traditional Malay house is built on…",
   "ms": "Rumah tradisional Melayu dibina di atas…"
  },
  "opts": [
   {
    "en": "Stilts",
    "ms": "Tiang"
   },
   {
    "en": "Boats",
    "ms": "Perahu"
   },
   {
    "en": "Rocks",
    "ms": "Batu"
   },
   {
    "en": "Sand",
    "ms": "Pasir"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m97",
  "set": "malaysia",
  "cat": "Food",
  "type": "mc",
  "q": {
   "en": "Roti canai is usually eaten with…",
   "ms": "Roti canai biasanya dimakan bersama…"
  },
  "opts": [
   {
    "en": "Dhal or curry",
    "ms": "Kuah dal atau kari"
   },
   {
    "en": "Soy sauce",
    "ms": "Kicap"
   },
   {
    "en": "Mayonnaise",
    "ms": "Mayones"
   },
   {
    "en": "Jam",
    "ms": "Jem"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m98",
  "set": "malaysia",
  "cat": "Food",
  "type": "mc",
  "q": {
   "en": "Mee bandung Muar comes from which state?",
   "ms": "Mee bandung Muar berasal dari negeri manakah?"
  },
  "opts": [
   {
    "en": "Johor",
    "ms": "Johor"
   },
   {
    "en": "Melaka",
    "ms": "Melaka"
   },
   {
    "en": "Perak",
    "ms": "Perak"
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
  "id": "m99",
  "set": "malaysia",
  "cat": "Sports",
  "type": "mc",
  "q": {
   "en": "Which Malaysian track cyclist is nicknamed the 'Pocket Rocketman'?",
   "ms": "Pelumba basikal trek Malaysia manakah digelar 'Pocket Rocketman'?"
  },
  "opts": [
   {
    "en": "Azizulhasni Awang",
    "ms": "Azizulhasni Awang"
   },
   {
    "en": "Josiah Ng",
    "ms": "Josiah Ng"
   },
   {
    "en": "Rizal Tisin",
    "ms": "Rizal Tisin"
   },
   {
    "en": "Shah Firdaus Sahrom",
    "ms": "Shah Firdaus Sahrom"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "m100",
  "set": "malaysia",
  "cat": "Sports",
  "type": "mc",
  "q": {
   "en": "Which Malaysian diver has won Olympic medals?",
   "ms": "Penerjun Malaysia manakah pernah memenangi pingat Olimpik?"
  },
  "opts": [
   {
    "en": "Pandelela Rinong",
    "ms": "Pandelela Rinong"
   },
   {
    "en": "Nicol David",
    "ms": "Nicol David"
   },
   {
    "en": "Farah Ann Abdul Hadi",
    "ms": "Farah Ann Abdul Hadi"
   },
   {
    "en": "Lee Zii Jia",
    "ms": "Lee Zii Jia"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g81",
  "set": "general",
  "cat": "Science",
  "type": "mc",
  "q": {
   "en": "What is the centre of an atom called?",
   "ms": "Apakah nama bahagian tengah sesuatu atom?"
  },
  "opts": [
   {
    "en": "Nucleus",
    "ms": "Nukleus"
   },
   {
    "en": "Electron",
    "ms": "Elektron"
   },
   {
    "en": "Molecule",
    "ms": "Molekul"
   },
   {
    "en": "Cell",
    "ms": "Sel"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g82",
  "set": "general",
  "cat": "Science",
  "type": "mc",
  "q": {
   "en": "What is the unit of electric current?",
   "ms": "Apakah unit arus elektrik?"
  },
  "opts": [
   {
    "en": "Ampere",
    "ms": "Ampere"
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
    "en": "Ohm",
    "ms": "Ohm"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g83",
  "set": "general",
  "cat": "Science",
  "type": "mc",
  "q": {
   "en": "Which colour of visible light has the longest wavelength?",
   "ms": "Warna cahaya nampak manakah mempunyai panjang gelombang paling panjang?"
  },
  "opts": [
   {
    "en": "Red",
    "ms": "Merah"
   },
   {
    "en": "Blue",
    "ms": "Biru"
   },
   {
    "en": "Green",
    "ms": "Hijau"
   },
   {
    "en": "Violet",
    "ms": "Ungu"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g84",
  "set": "general",
  "cat": "Science",
  "type": "mc",
  "q": {
   "en": "Which element has the chemical symbol Ag?",
   "ms": "Unsur manakah mempunyai simbol kimia Ag?"
  },
  "opts": [
   {
    "en": "Silver",
    "ms": "Perak"
   },
   {
    "en": "Gold",
    "ms": "Emas"
   },
   {
    "en": "Aluminium",
    "ms": "Aluminium"
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
  "id": "g85",
  "set": "general",
  "cat": "Space",
  "type": "mc",
  "q": {
   "en": "What is the closest star to Earth?",
   "ms": "Apakah bintang yang paling dekat dengan Bumi?"
  },
  "opts": [
   {
    "en": "The Sun",
    "ms": "Matahari"
   },
   {
    "en": "Polaris",
    "ms": "Polaris"
   },
   {
    "en": "Sirius",
    "ms": "Sirius"
   },
   {
    "en": "Alpha Centauri",
    "ms": "Alpha Centauri"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g86",
  "set": "general",
  "cat": "Space",
  "type": "mc",
  "q": {
   "en": "Which planet is farthest from the Sun?",
   "ms": "Planet manakah paling jauh dari Matahari?"
  },
  "opts": [
   {
    "en": "Neptune",
    "ms": "Neptun"
   },
   {
    "en": "Uranus",
    "ms": "Uranus"
   },
   {
    "en": "Saturn",
    "ms": "Zuhal"
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
  "id": "g87",
  "set": "general",
  "cat": "Body",
  "type": "mc",
  "q": {
   "en": "Which blood cells fight infection?",
   "ms": "Sel darah manakah melawan jangkitan?"
  },
  "opts": [
   {
    "en": "White blood cells",
    "ms": "Sel darah putih"
   },
   {
    "en": "Red blood cells",
    "ms": "Sel darah merah"
   },
   {
    "en": "Platelets",
    "ms": "Platelet"
   },
   {
    "en": "Plasma",
    "ms": "Plasma"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g88",
  "set": "general",
  "cat": "Body",
  "type": "mc",
  "q": {
   "en": "How many chambers does the human heart have?",
   "ms": "Berapakah bilangan ruang dalam jantung manusia?"
  },
  "opts": [
   {
    "en": "4",
    "ms": "4"
   },
   {
    "en": "2",
    "ms": "2"
   },
   {
    "en": "3",
    "ms": "3"
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
  "id": "g89",
  "set": "general",
  "cat": "Nature",
  "type": "mc",
  "q": {
   "en": "What is the largest living reptile?",
   "ms": "Apakah reptilia hidup yang terbesar?"
  },
  "opts": [
   {
    "en": "Saltwater crocodile",
    "ms": "Buaya air masin"
   },
   {
    "en": "Komodo dragon",
    "ms": "Biawak komodo"
   },
   {
    "en": "Anaconda",
    "ms": "Anakonda"
   },
   {
    "en": "Leatherback turtle",
    "ms": "Penyu belimbing"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g90",
  "set": "general",
  "cat": "Nature",
  "type": "mc",
  "q": {
   "en": "How many hearts does an octopus have?",
   "ms": "Berapakah bilangan jantung seekor sotong kurita?"
  },
  "opts": [
   {
    "en": "3",
    "ms": "3"
   },
   {
    "en": "1",
    "ms": "1"
   },
   {
    "en": "2",
    "ms": "2"
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
  "id": "g91",
  "set": "general",
  "cat": "Nature",
  "type": "mc",
  "q": {
   "en": "Which tree gives us natural rubber?",
   "ms": "Pokok manakah memberikan kita getah asli?"
  },
  "opts": [
   {
    "en": "Rubber tree",
    "ms": "Pokok getah"
   },
   {
    "en": "Oil palm",
    "ms": "Kelapa sawit"
   },
   {
    "en": "Coconut tree",
    "ms": "Pokok kelapa"
   },
   {
    "en": "Durian tree",
    "ms": "Pokok durian"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g92",
  "set": "general",
  "cat": "Maths",
  "type": "mc",
  "q": {
   "en": "What is 15 × 4?",
   "ms": "Berapakah 15 × 4?"
  },
  "opts": [
   {
    "en": "60",
    "ms": "60"
   },
   {
    "en": "45",
    "ms": "45"
   },
   {
    "en": "64",
    "ms": "64"
   },
   {
    "en": "75",
    "ms": "75"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g93",
  "set": "general",
  "cat": "Maths",
  "type": "mc",
  "q": {
   "en": "How many sides does an octagon have?",
   "ms": "Berapakah bilangan sisi sebuah oktagon?"
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
  "id": "g94",
  "set": "general",
  "cat": "Maths",
  "type": "mc",
  "q": {
   "en": "1,000 grams is equal to…",
   "ms": "1,000 gram bersamaan dengan…"
  },
  "opts": [
   {
    "en": "1 kilogram",
    "ms": "1 kilogram"
   },
   {
    "en": "10 kilograms",
    "ms": "10 kilogram"
   },
   {
    "en": "100 kilograms",
    "ms": "100 kilogram"
   },
   {
    "en": "1 tonne",
    "ms": "1 tan"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g95",
  "set": "general",
  "cat": "Maths",
  "type": "mc",
  "q": {
   "en": "How many seconds are in one hour?",
   "ms": "Berapakah bilangan saat dalam satu jam?"
  },
  "opts": [
   {
    "en": "3,600",
    "ms": "3,600"
   },
   {
    "en": "360",
    "ms": "360"
   },
   {
    "en": "6,000",
    "ms": "6,000"
   },
   {
    "en": "1,000",
    "ms": "1,000"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g96",
  "set": "general",
  "cat": "People",
  "type": "mc",
  "q": {
   "en": "Who is famous for the theory of evolution by natural selection?",
   "ms": "Siapakah yang terkenal dengan teori evolusi melalui pemilihan semula jadi?"
  },
  "opts": [
   {
    "en": "Charles Darwin",
    "ms": "Charles Darwin"
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
    "en": "Louis Pasteur",
    "ms": "Louis Pasteur"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g97",
  "set": "general",
  "cat": "People",
  "type": "mc",
  "q": {
   "en": "Who was the first woman to win a Nobel Prize?",
   "ms": "Siapakah wanita pertama yang memenangi Hadiah Nobel?"
  },
  "opts": [
   {
    "en": "Marie Curie",
    "ms": "Marie Curie"
   },
   {
    "en": "Florence Nightingale",
    "ms": "Florence Nightingale"
   },
   {
    "en": "Mother Teresa",
    "ms": "Ibu Teresa"
   },
   {
    "en": "Ada Lovelace",
    "ms": "Ada Lovelace"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g98",
  "set": "general",
  "cat": "Sports",
  "type": "mc",
  "q": {
   "en": "How many players from one team are on a volleyball court at a time?",
   "ms": "Berapakah bilangan pemain satu pasukan di gelanggang bola tampar pada satu masa?"
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
    "en": "11",
    "ms": "11"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g99",
  "set": "general",
  "cat": "Sports",
  "type": "mc",
  "q": {
   "en": "In which sport can you score with a 'slam dunk'?",
   "ms": "Dalam sukan manakah anda boleh menjaringkan mata dengan 'slam dunk'?"
  },
  "opts": [
   {
    "en": "Basketball",
    "ms": "Bola keranjang"
   },
   {
    "en": "Volleyball",
    "ms": "Bola tampar"
   },
   {
    "en": "Netball",
    "ms": "Bola jaring"
   },
   {
    "en": "Handball",
    "ms": "Bola baling"
   }
  ],
  "ans": 0,
  "enabled": true
 },
 {
  "id": "g100",
  "set": "general",
  "cat": "General",
  "type": "mc",
  "q": {
   "en": "Which language has the most native speakers in the world?",
   "ms": "Bahasa manakah mempunyai penutur asli paling ramai di dunia?"
  },
  "opts": [
   {
    "en": "Mandarin Chinese",
    "ms": "Bahasa Mandarin"
   },
   {
    "en": "English",
    "ms": "Bahasa Inggeris"
   },
   {
    "en": "Spanish",
    "ms": "Bahasa Sepanyol"
   },
   {
    "en": "Hindi",
    "ms": "Bahasa Hindi"
   }
  ],
  "ans": 0,
  "enabled": true
 }
];
