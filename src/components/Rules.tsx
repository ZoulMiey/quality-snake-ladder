import { LAST_BOX } from "../lib/board.ts";
import type { GameMode } from "../lib/types.ts";

const CART_TILES = [
  { icon: "📱", en: "Tilt your phone\nto steer", ms: "Condongkan telefon untuk memandu" },
  { icon: "❓", en: "Right answer = Turbo\nWrong = slow down", ms: "Betul = turbo · Salah = perlahan" },
  { icon: "🎁", en: "Drive through Q boxes\nfor items", ms: "Lalu kotak Q untuk dapat item" },
  { icon: "🔺", en: "Dodge cones, potholes\nand out-of-spec zones", ms: "Elak kon, lubang dan zon luar spesifikasi" },
  { icon: "🏁", en: "3 laps.\nFirst to finish wins!", ms: "3 pusingan. Yang pertama menang!" },
];
import { BONUS_STREAK } from "../lib/rules.ts";
import { FAST_MS, SHIELD, SHIELD_EVERY, SUPER_STREAK } from "../clash/sim.ts";

const CLASH_TILES = [
  { icon: "⚔️", en: "Right answer =\nyour monster attacks", ms: "Betul = raksasa anda menyerang" },
  { icon: "⚡", en: `Answer within ${FAST_MS / 1000} s\n= +25% damage`, ms: `Jawab dalam ${FAST_MS / 1000} saat = +25%` },
  { icon: "🔥", en: `${SUPER_STREAK} right in a row\n= super move ×2`, ms: `${SUPER_STREAK} betul berturut = gerakan super` },
  { icon: "🛡️", en: `Team: every ${SHIELD_EVERY} rights\n= +${SHIELD} shield`, ms: `Pasukan: setiap ${SHIELD_EVERY} betul = perisai +${SHIELD}` },
  { icon: "🏆", en: "Faint all the other\nteam's monsters to win!", ms: "Pengsankan semua lawan untuk menang" },
];
import { MAX_WINNERS } from "../lib/engine.ts";

const FISH_TILES = [
  { icon: "🐟🍀", en: "Right answer = a fish\n1 in 8 is a LUCKY FISH!", ms: "Betul = seekor ikan · 1 dalam 8 ikan bertuah" },
  { icon: "🐠", en: "3 right in a row\n= BIG FISH", ms: "3 betul berturut = IKAN BESAR" },
  { icon: "✨", en: "5 right in a row =\nSUPER BIG GOLDEN FISH", ms: "5 betul berturut = IKAN EMAS" },
  { icon: "✂️", en: "Wrong = line snaps\nwait 5 sec", ms: "Salah = tali putus, tunggu 5 saat" },
  { icon: "🌀", en: "Every minute: FRENZY\n30 s, weight ×2", ms: "Setiap minit: pesta, berat ×2" },
  { icon: "🏆", en: "Heaviest total wins!\nBehind? Catch ×2", ms: "Paling berat menang · Di belakang? Tangkapan ×2" },
];

const ROPE_TILES = [
  { icon: "🔴🔵", en: "Red vs Blue:\npick your side", ms: "Merah lawan Biru: pilih pihak" },
  { icon: "💪", en: "Right answer =\nyour team pulls", ms: "Betul = pasukan anda menarik" },
  { icon: "⚡", en: "FAST ×1.25 · 3 in a row\n= POWER PULL ×2", ms: "Pantas · 3 berturut = tarikan kuat ×2" },
  { icon: "💥", en: "HEAVE! every minute:\nevery pull ×2 for 30 s", ms: "Setiap minit: setiap tarikan ×2 selama 30 saat" },
  { icon: "💦", en: "Flag to your bank wins\nthe round. Best of 3!", ms: "Bendera ke tebing anda menang. Terbaik 3!" },
];

const SPIN_TILES = [
  { icon: "🔴🔵", en: "Red vs Blue, 3 a team.\nPick a captain 👑", ms: "Merah lawan Biru, 3 setiap pasukan. Pilih kapten" },
  { icon: "❓🎡", en: "Right answer = flick\nyour phone to spin", ms: "Betul = lontar telefon untuk memutar" },
  { icon: "🔤", en: "Guess letters for points.\nVowel = 300 · Solve = +1,000", ms: "Teka huruf · Vokal 300 · Selesai +1,000" },
  { icon: "🌟", en: "KAIZEN = next result ×2\nDEFECT = 5 s stun", ms: "KAIZEN ×2 · KECACATAN = kaku 5 saat" },
  { icon: "💥", en: "Wrong answer, letter or\nphrase = 5 s stun", ms: "Salah jawapan, huruf atau frasa = kaku 5 saat" },
  { icon: "🏆", en: "3 or 5 minutes.\nMost points wins!", ms: "3 atau 5 minit. Mata tertinggi menang!" },
];

/** The rules in four short tiles, used on the projector lobby and on phones. */
const BOSS_TILES = [
  { icon: "👹", en: "Everyone vs the\nDefect Titan", ms: "Semua lawan Gergasi Kecacatan" },
  { icon: "⚔️", en: "Right answer =\n50 damage", ms: "Betul = 50 kerosakan" },
  { icon: "🔥", en: "FAST +25%\n5 in a row = super ×2", ms: "Pantas +25% · 5 berturut = super" },
  { icon: "⚠️", en: "Every 8 s the Titan\nstomps everyone", ms: "Setiap 8 saat Titan menghentak" },
  { icon: "⚡", en: "Every 10% HP it loses:\na counter-stomp", ms: "Setiap 10% HP hilang: serang balas" },
  { icon: "😡", en: "At 30% HP: ENRAGED!\nShield + harder stomps", ms: "30% HP: mengamuk, perisai + hentakan kuat" },
  { icon: "💫", en: "Fainted? One revive\nquestion per raid", ms: "Pengsan? Satu soalan hidup semula" },
];

export default function Rules({ compact, mode, variant }: { compact?: boolean; mode?: GameMode; variant?: string }) {
  const tiles = mode === "spin" ? SPIN_TILES : mode === "rope" ? ROPE_TILES : mode === "fish" ? FISH_TILES : mode === "kart" ? CART_TILES : mode === "clash" ? (variant === "boss" ? BOSS_TILES : CLASH_TILES) : [
    { icon: "🎲", en: "Right = roll 1 dice\nWrong = wait 5 sec", ms: "Betul = baling 1 dadu · Salah = tunggu 5 saat" },
    { icon: "🔥", en: `${BONUS_STREAK} right in a row\n= 2 dice`, ms: `${BONUS_STREAK} betul berturut = 2 dadu` },
    { icon: "🐍🪜", en: "Answer right to\nstay safe or climb", ms: "Jawab betul untuk selamat atau naik" },
    { icon: "🧪📄", en: "Quality boxes move you\nforward or back", ms: "Petak kualiti: maju atau undur" },
    { icon: "🏁", en: `Race to box ${LAST_BOX}!\nWinners: players − 1 (max ${MAX_WINNERS})`, ms: `Lumba ke petak ${LAST_BOX}! Pemenang: pemain − 1 (maks ${MAX_WINNERS})` },
  ];
  return (
    <ul className={`rule-tiles ${compact ? "compact" : ""}`} aria-label="How to play">
      {tiles.map((t) => (
        <li key={t.icon}>
          <span className="rt-icon" aria-hidden="true">
            {t.icon}
          </span>
          <span className="rt-en">{t.en}</span>
          <span className="rt-ms">{t.ms}</span>
        </li>
      ))}
    </ul>
  );
}
