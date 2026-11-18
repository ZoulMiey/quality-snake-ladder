import { FINAL_ZONE_NEED, FINAL_ZONE_START } from "../lib/board.ts";

/** The rules in four short tiles, used on the projector lobby and on phones. */
export default function Rules({ compact }: { compact?: boolean }) {
  const tiles = [
    { icon: "🎲", en: "Right = 2 dice\nWrong = 1 dice", ms: "Betul = 2 dadu · Salah = 1 dadu" },
    { icon: "🔥", en: "3 right in a row\n= 3 dice", ms: "3 betul berturut = 3 dadu" },
    { icon: "🐍🪜", en: "Answer right to\nstay safe or climb", ms: "Jawab betul untuk selamat atau naik" },
    { icon: "🏁", en: `Box ${FINAL_ZONE_START}+ needs\n${FINAL_ZONE_NEED} or more`, ms: `Petak ${FINAL_ZONE_START}+ perlu ${FINAL_ZONE_NEED} ke atas` },
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
