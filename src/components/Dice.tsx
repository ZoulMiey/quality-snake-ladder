import { useEffect, useRef, useState } from "react";

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[27, 27], [73, 73]],
  3: [[27, 27], [50, 50], [73, 73]],
  4: [[27, 27], [73, 27], [27, 73], [73, 73]],
  5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]],
  6: [[27, 24], [73, 24], [27, 50], [73, 50], [27, 76], [73, 76]],
};

/** How to turn the cube so that each value faces the viewer. */
const SHOW: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  3: [0, -90],
  4: [0, 90],
  2: [-90, 0],
  5: [90, 0],
};

const FACES = [1, 6, 3, 4, 2, 5];

function Face({ n }: { n: number }) {
  return (
    <div className={`face f${n}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {PIPS[n].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="9.5" className={n === 1 ? "pip pip-one" : "pip"} />
        ))}
      </svg>
    </div>
  );
}

const ROLL_MS = 1200;

/** One 3D die that tumbles and lands on `value`. A new `seed` throws it again. */
export function Die3D({ value, seed, size = 64, delay = 0 }: { value: number; seed: string | number; size?: number; delay?: number }) {
  const [rot, setRot] = useState<{ x: number; y: number; z: number; anim: boolean }>(() => ({
    x: Math.random() * 360,
    y: Math.random() * 360,
    z: Math.random() * 90,
    anim: false,
  }));
  useEffect(() => {
    // Start from a random tilt, then spin a few whole turns and land on the value.
    setRot({ x: Math.random() * 360, y: Math.random() * 360, z: Math.random() * 90, anim: false });
    const [sx, sy] = SHOW[value] ?? [0, 0];
    const turnsX = 2 + Math.floor(Math.random() * 2);
    const turnsY = 2 + Math.floor(Math.random() * 2);
    const t = setTimeout(() => setRot({ x: sx + 360 * turnsX, y: sy + 360 * turnsY, z: 0, anim: true }), 30);
    return () => clearTimeout(t);
  }, [seed, value]);
  return (
    <div className="die3d" style={{ width: size, height: size, ["--h" as string]: `${size / 2}px` }} role="img" aria-label={`Dice ${value}`}>
      <div
        className="cube"
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
          transition: rot.anim ? `transform ${ROLL_MS}ms cubic-bezier(.15,.75,.25,1) ${delay}ms` : "none",
        }}
      >
        {FACES.map((n) => (
          <Face key={n} n={n} />
        ))}
      </div>
      <div className="die-shadow" />
    </div>
  );
}

/** Throws all the dice together, then shows the total. */
export function DiceRoll({ values, seed, size, onDone }: { values: number[]; seed: string | number; size?: number; onDone?: () => void }) {
  const [done, setDone] = useState(false);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    setDone(false);
    const last = (values.length - 1) * 90;
    const t = setTimeout(() => {
      setDone(true);
      cb.current?.();
    }, ROLL_MS + last + 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  return (
    <div className="dice-row">
      {values.map((v, i) => (
        <Die3D key={i} value={v} seed={`${seed}-${i}`} size={size} delay={i * 90} />
      ))}
      {values.length > 1 && <span className={`dice-sum ${done ? "" : "hide"}`}>= {values.reduce((a, b) => a + b, 0)}</span>}
    </div>
  );
}
