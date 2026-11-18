import { useEffect, useState } from "react";

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

export function Die({ value, rolling, size = 64 }: { value: number; rolling?: boolean; size?: number }) {
  return (
    <svg className={`die ${rolling ? "rolling" : ""}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Dice ${value}`}>
      <rect x="4" y="4" width="92" height="92" rx="18" className="die-face" />
      {(PIPS[value] ?? []).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" className="die-pip" />
      ))}
    </svg>
  );
}

/** Shows the dice spinning for a moment, then the real values. `seed` changes start a new roll. */
export function DiceRoll({ values, seed, size, onDone }: { values: number[]; seed: string | number; size?: number; onDone?: () => void }) {
  const [shown, setShown] = useState<number[] | null>(null);
  useEffect(() => {
    if (!values.length) return;
    setShown(null);
    let n = 0;
    const t = setInterval(() => {
      n++;
      if (n >= 8) {
        clearInterval(t);
        setShown(values);
        onDone?.();
      } else setShown(values.map(() => 1 + Math.floor(Math.random() * 6)));
    }, 85);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const list = shown ?? values.map(() => 1);
  const done = shown === values;
  return (
    <div className="dice-row">
      {list.map((v, i) => (
        <Die key={i} value={v} rolling={!done} size={size} />
      ))}
      {done && values.length > 1 && <span className="dice-sum">= {values.reduce((a, b) => a + b, 0)}</span>}
    </div>
  );
}
