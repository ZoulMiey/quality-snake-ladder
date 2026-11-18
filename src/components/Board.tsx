import { useEffect, useMemo, useRef, useState } from "react";
import { COLS, ROWS, LADDERS, SNAKES, LAST_BOX, cellOf } from "../lib/board.ts";
import { tokenById } from "../lib/tokens.ts";
import { specialAt, type SpecialBox } from "../lib/specials.ts";
import type { Player, PlayerState } from "../lib/types.ts";

// Board units: each row is 100 high. The board stretches sideways to fill the screen, so a box can be
// wider than it is tall; the drawing is done for the real shape so snakes and ladders never look squashed.
const H = ROWS * 100;
const CH = H / ROWS;
let W = COLS * 100;
let CW = W / COLS;
function setShape(ratio: number) {
  W = Math.round(H * ratio);
  CW = W / COLS;
}

/** Centre of a box in board units. */
function centre(box: number) {
  const { col, row } = cellOf(box);
  return { x: col * CW + CW / 2, y: row * CH + CH / 2 };
}

const WOOD = [
  ["#9a6a2f", "#c08a45"],
  ["#7c4a1e", "#a8692f"],
  ["#a5702c", "#d6a35a"],
];

function Ladder({ from, to, i }: { from: number; to: number; i: number }) {
  const [rail, rung] = WOOD[i % WOOD.length];
  const a = centre(from);
  const b = centre(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 20;
  const ny = (dx / len) * 20;
  const rungs = Math.max(3, Math.round(len / 34));
  return (
    <g className="ladder">
      <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} className="rail" stroke={rail} />
      <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} className="rail" stroke={rail} />
      {Array.from({ length: rungs }, (_, i) => {
        const t = (i + 0.5) / rungs;
        const x = a.x + dx * t;
        const y = a.y + dy * t;
        return <line key={i} x1={x + nx} y1={y + ny} x2={x - nx} y2={y - ny} className="rung" stroke={rung} />;
      })}
    </g>
  );
}

const SNAKE_COLORS = ["#d9465f", "#7c3aed", "#0d9488", "#ea580c", "#2563eb", "#65a30d", "#db2777", "#0891b2"];

/**
 * A curvy snake with a tapering tail. The body wiggles along the line from head to tail;
 * the number of bends and how wide they swing change from snake to snake.
 */
function Snake({ head, tail, i }: { head: number; tail: number; i: number }) {
  const a = centre(head);
  const b = centre(tail);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const waves = Math.max(1, Math.min(3, Math.round(len / 140))) + (i % 2 ? 0.5 : 0);
  const amp = Math.min(34, 12 + len * 0.05) * (i % 3 === 1 ? -1 : 1);
  const N = 48;
  const centreAt = (t: number) => {
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7); // no swing at the head and tail
    const w = amp * Math.sin(t * waves * Math.PI * 2) * env;
    return { x: a.x + dx * t + nx * w, y: a.y + dy * t + ny * w };
  };
  const pts = Array.from({ length: N + 1 }, (_, k) => centreAt(k / N));
  const left: string[] = [];
  const right: string[] = [];
  pts.forEach((p, k) => {
    const q = pts[Math.min(N, k + 1)];
    const o = pts[Math.max(0, k - 1)];
    const tx = q.x - o.x;
    const ty = q.y - o.y;
    const tl = Math.hypot(tx, ty) || 1;
    const t = k / N;
    const half = (21 * (1 - 0.82 * Math.pow(t, 1.25))) / 2; // thick neck, thin tail
    left.push(`${(p.x - (ty / tl) * half).toFixed(1)},${(p.y + (tx / tl) * half).toFixed(1)}`);
    right.push(`${(p.x + (ty / tl) * half).toFixed(1)},${(p.y - (tx / tl) * half).toFixed(1)}`);
  });
  const body = `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
  const spine = `M${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")}`;
  const color = SNAKE_COLORS[i % SNAKE_COLORS.length];
  const ang = (Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x) * 180) / Math.PI;
  return (
    <g className="snake">
      <path d={body} fill="rgba(0,0,0,.22)" transform="translate(3,4)" />
      <path d={body} fill={color} />
      <path d={spine} stroke="rgba(255,255,255,.45)" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeDasharray="1 12" />
      <g transform={`translate(${a.x},${a.y}) rotate(${ang})`}>
        <ellipse rx={19} ry={14} fill={color} />
        <circle cx={7} cy={-7} r={4.2} fill="#fff" />
        <circle cx={7} cy={7} r={4.2} fill="#fff" />
        <circle cx={8.5} cy={-7} r={2.1} fill="#111" />
        <circle cx={8.5} cy={7} r={2.1} fill="#111" />
        <path d="M18,0 l11,0 m0,0 l5,-4 m-5,4 l5,4" stroke="#b91c1c" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

export type BoardPiece = { uid: string; player: Player; state: PlayerState | undefined };

export default function Board({ pieces, highlight, specials, posOverride }: { pieces: BoardPiece[]; highlight?: string | null; specials?: SpecialBox[] | null; posOverride?: Record<string, number> }) {
  const cells = useMemo(() => Array.from({ length: LAST_BOX }, (_, i) => i + 1), []);
  const boardRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(1);
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.clientWidth / Math.max(1, el.clientHeight);
      if (r > 0) setRatio(Math.round(r * 100) / 100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  setShape(ratio);
  const drawing = useMemo(
    () => (
      <svg className="overlay" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {Object.entries(LADDERS).map(([f, t], i) => (
          <Ladder key={f} from={+f} to={t} i={i} />
        ))}
        {Object.entries(SNAKES).map(([h, t], i) => (
          <Snake key={h} head={+h} tail={t} i={i} />
        ))}
      </svg>
    ),
    [ratio],
  );

  // Group pieces by box so several on one box sit side by side.
  const byBox = new Map<number, BoardPiece[]>();
  for (const p of pieces) {
    const box = posOverride?.[p.uid] ?? p.state?.pos ?? 0;
    if (!byBox.has(box)) byBox.set(box, []);
    byBox.get(box)!.push(p);
  }
  const atStart = byBox.get(0) ?? [];

  return (
    <div className="board-wrap">
      <div className="board" ref={boardRef}>
        <div className="cells">
          {cells.map((n) => {
            const { col, row } = cellOf(n);
            const cls = [
              "cell",
              (col + row) % 2 ? "alt" : "",
              n === LAST_BOX ? "finish" : "",
              specialAt(specials, n) ? ((specialAt(specials, n)!.move > 0 ? "sp-good" : "sp-bad")) : "",
              SNAKES[n] ? "has-snake" : "",
              LADDERS[n] ? "has-ladder" : "",
            ].join(" ");
            return (
              <div key={n} className={cls} style={{ gridColumn: col + 1, gridRow: row + 1 }}>
              </div>
            );
          })}
        </div>
        {drawing}
        {/* Box numbers sit above the snakes and ladders so they are never hidden. */}
        <div className="cells nums" aria-hidden="true">
          {cells.map((n) => {
            const { col, row } = cellOf(n);
            return (
              <div key={n} style={{ gridColumn: col + 1, gridRow: row + 1, position: "relative" }}>
                <span className="num">{n}</span>
                {n === LAST_BOX && <span className="finish-label">🏆 FINISH</span>}
                {(() => {
                  const ev = specialAt(specials, n);
                  if (!ev) return null;
                  return (
                    <span className={`sp-label ${ev.move > 0 ? "good" : "bad"}`} title={ev.en}>
                      <span className="sp-icon">{ev.icon}</span>
                      <span className="sp-move">{ev.move > 0 ? `+${ev.move}` : `−${-ev.move}`}</span>
                    </span>
                  );
                })()}
              </div>
            );
          })}
        </div>
        <div className="pieces">
          {[...byBox.entries()]
            .filter(([box]) => box > 0)
            .flatMap(([box, list]) =>
              list.map((p, i) => {
                const c = centre(box);
                const n = list.length;
                const per = Math.ceil(Math.sqrt(n));
                const gx = (i % per) - (per - 1) / 2;
                const gy = Math.floor(i / per) - (Math.ceil(n / per) - 1) / 2;
                const spread = n > 1 ? 30 / per : 0; // spread several pieces on one box
                const t = tokenById(p.player.token);
                return (
                  <div
                    key={p.uid}
                    className={`piece ${highlight === p.uid ? "hl" : ""} ${n > 3 ? "small" : ""}`}
                    style={{
                      left: `${((c.x + gx * spread * 1.6 * (CW / CH)) / W) * 100}%`,
                      top: `${((c.y + gy * spread * 1.4) / H) * 100}%`,
                      ["--c" as string]: t.color,
                    }}
                    title={p.player.name}
                  >
                    <span className="emoji">{t.emoji}</span>
                    <span className="tag">{p.player.name}</span>
                  </div>
                );
              }),
            )}
        </div>
      </div>
      <div className="start-lane">
        <span className="start-label">START</span>
        {atStart.map((p) => {
          const t = tokenById(p.player.token);
          return (
            <span key={p.uid} className="start-piece" style={{ ["--c" as string]: t.color }}>
              {t.emoji} {p.player.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
