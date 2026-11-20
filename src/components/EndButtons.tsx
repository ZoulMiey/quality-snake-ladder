// The three buttons at the end of every game (owner, Nov 2026):
//   Play again   = same game, same players
//   New game     = same game, new players (everyone scans the QR code again)
//   Change game  = pick another game, with the same players or with new players
// The projector page (Screen.tsx) provides what each button does; every game's end screen shows <EndButtons />.
import { createContext, useContext, useState } from "react";

export type EndActions = {
  /** Same game, new players. */
  newPlayers: () => void;
  /** Back to the game list, keeping the players (true) or clearing them (false). */
  changeGame: (samePlayers: boolean) => void;
};
export const EndActionsContext = createContext<EndActions | null>(null);

export default function EndButtons({ onAgain }: { onAgain: () => void }) {
  const actions = useContext(EndActionsContext);
  const [step, setStep] = useState<"" | "new" | "change">("");
  if (step === "new")
    return (
      <div className="end-btns ask one">
        <p>
          Same game with new players? Everyone will need to scan and join again.
          <small>Permainan sama dengan pemain baharu? Semua perlu imbas dan sertai semula.</small>
        </p>
        <button className="big-btn" onClick={() => actions?.newPlayers()}>
          Yes, new players <small>Ya, pemain baharu</small>
        </button>
        <button className="btn end-back" onClick={() => setStep("")}>
          ← Back
        </button>
      </div>
    );
  if (step === "change")
    return (
      <div className="end-btns ask">
        <p>
          Choose another game: with whom?
          <small>Pilih permainan lain: dengan siapa?</small>
        </p>
        <button className="big-btn" onClick={() => actions?.changeGame(true)}>
          👥 With the same players <small>Dengan pemain yang sama</small>
        </button>
        <button className="big-btn alt" onClick={() => actions?.changeGame(false)}>
          🆕 With new players <small>Dengan pemain baharu (imbas semula)</small>
        </button>
        <button className="btn end-back" onClick={() => setStep("")}>
          ← Back
        </button>
      </div>
    );
  return (
    <div className="end-btns">
      <button className="big-btn" onClick={onAgain}>
        🔁 Play again <small>Same game, same players · Main lagi</small>
      </button>
      <button className="big-btn alt" onClick={() => setStep("new")} disabled={!actions}>
        🆕 New game <small>Same game, new players · Permainan baharu</small>
      </button>
      <button className="big-btn alt" onClick={() => setStep("change")} disabled={!actions}>
        🎮 Change game <small>Pick another game · Tukar permainan</small>
      </button>
    </div>
  );
}
