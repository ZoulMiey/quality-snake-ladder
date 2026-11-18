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
import { MAX_WINNERS } from "../lib/engine.ts";

/** The rules in four short tiles, used on the projector lobby and on phones. */
export default function Rules({ compact, mode }: { compact?: boolean; mode?: GameMode }) {
  const tiles = mode === "kart" ? CART_TILES : [
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
