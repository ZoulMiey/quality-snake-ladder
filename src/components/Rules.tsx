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
  { icon: "🏆", en: "Faint all 3 opponents\nto win!", ms: "Pengsankan semua lawan untuk menang" },
];
import { MAX_WINNERS } from "../lib/engine.ts";

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
  const tiles = mode === "kart" ? CART_TILES : mode === "clash" ? (variant === "boss" ? BOSS_TILES : CLASH_TILES) : [
    { icon: "🎲", en: "Right = roll 1 dice\nWrong = wait 5 sec", ms: "Betul = baling 1 dadu · Salah = tunggu 5 saat" },
    { icon: "🔥", en: `${BONUS_STREAK} right in a row\n= 2 dice`, ms: `${BONUS_STREAK} betul berturut = 2 dadu` },
    { icon: "🐍🪜", en: "Answer right to\nstay safe or climb", ms: "Jawab betul untuk selamat atau naik" },
    { icon: "🧪📄", en: "Quality boxes move you\nforward or back", ms: "Petak kualiti: maju atau undur" },
    { icon: "🏁", en: `First ${MAX_WINNERS} to box ${LAST_BOX}\nwin!`, ms: `${MAX_WINNERS} pemain pertama ke petak ${LAST_BOX} menang` },
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
