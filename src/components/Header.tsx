import type { GameMode } from "../lib/types.ts";

export const GAME_NAMES: Record<GameMode, { en: string; ms: string; icon: string }> = {
  snake: { en: "Snake & Ladder", ms: "Ular & Tangga", icon: "🐍" },
  kart: { en: "Quality Cart", ms: "Kart Kualiti", icon: "🏎️" },
  clash: { en: "Quality Clash", ms: "Pertempuran Kualiti", icon: "⚔️" },
  fish: { en: "Fishing Derby", ms: "Pertandingan Memancing", icon: "🎣" },
  rope: { en: "Pull the Rope", ms: "Tarik Tali", icon: "💪" },
};

export default function Header({ small, children, mode }: { small?: boolean; children?: React.ReactNode; mode?: GameMode }) {
  const name = mode ? GAME_NAMES[mode] : { en: "Quality Games", ms: "Permainan Kualiti", icon: "🎮" };
  return (
    <header className={`qm-header ${small ? "small" : ""}`}>
      <div className="qm-ribbon">Quality Month 2026</div>
      <div className="qm-title">
        <span className="t-en">{name.en}</span>
        <span className="t-ms">{name.ms}</span>
      </div>
      {children && <div className="qm-tools">{children}</div>}
    </header>
  );
}
