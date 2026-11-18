import { useMemo } from "react";
import { COLS, ROWS, LADDERS, SNAKES, LAST_BOX, FINAL_ZONE_START, FINAL_ZONE_NEED, cellOf } from "../lib/board.ts";
import { tokenById } from "../lib/tokens.ts";
import type { Player, PlayerState } from "../lib/types.ts";

// Board units: 100 per box.
const W = COLS * 100;
const H = ROWS * 100;
const CW = W / COLS;
const CH = H / ROWS;

/** Centre of a box in board units. */
function centre(box: number) {
  const { col, row } = cellOf(box);
  return { x: col * CW + CW / 2, y: row * CH + CH / 2 };
}

function Ladder({ from, to }: { from: number; to: number }) {
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
      <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} className="rail" />
      <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} className="rail" />
      {Array.from({ length: rungs }, (_, i) => {
        const t = (i + 0.5) / rungs;
        const x = a.x + dx * t;
        const y = a.y + dy * t;
        return <line key={i} x1={x + nx} y1={y + ny} x2={x - nx} y2={y - ny} className="rung" />;
      })}
    </g>
  );
}

const SNAKE_COLORS = ["#d9465f", "#7c3aed", "#0d9488", "#ea580c", "#2563eb"];

function Snake({ head, tail, i }: { head: number; tail: number; i: number }) {
  const a = centre(head);
  const b = centre(tail);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const wig = Math.min(40, len / 5);
  const p = (t: number, w: number) => `${a.x + dx * t + nx * w},${a.y + dy * t + ny * w}`;
  const d = `M${p(0, 0)} C${p(0.25, wig)} ${p(0.25, wig)} ${p(0.5, 0)} S${p(0.75, -wig)} ${p(1, 0)}`;
  const color = SNAKE_COLORS[i % SNAKE_COLORS.length];
  const ang = (Math.atan2(-(dy * 0.25 + ny * wig), -(dx * 0.25 + nx * wig)) * 180) / Math.PI;
  return (
    <g className="snake">
      <path d={d} stroke="rgba(0,0,0,.25)" strokeWidth={20} fill="none" strokeLinecap="round" transform="translate(3,4)" />
      <path d={d} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d={d} stroke="rgba(255,255,255,.35)" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="2 14" />
      <g transform={`translate(${a.x},${a.y}) rotate(${ang})`}>
        <ellipse rx={20} ry={15} fill={color} />
        <circle cx={8} cy={-7} r={4} fill="#fff" />
        <circle cx={8} cy={7} r={4} fill="#fff" />
        <circle cx={9} cy={-7} r={2} fill="#111" />
        <circle cx={9} cy={7} r={2} fill="#111" />
        <path d="M19,0 l12,0 m0,0 l5,-4 m-5,4 l5,4" stroke="#b91c1c" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

export type BoardPiece = { uid: string; player: Player; state: PlayerState | undefined };

export default function Board({ pieces, highlight }: { pieces: BoardPiece[]; highlight?: string | null }) {
  const cells = useMemo(() => Array.from({ length: LAST_BOX }, (_, i) => i + 1), []);

  // Group pieces by box so several on one box sit side by side.
  const byBox = new Map<number, BoardPiece[]>();
  for (const p of pieces) {
    const box = p.state?.pos ?? 0;
    if (!byBox.has(box)) byBox.set(box, []);
    byBox.get(box)!.push(p);
  }
  const atStart = byBox.get(0) ?? [];

  return (
    <div className="board-wrap">
      <div className="board">
        <div className="cells">
          {cells.map((n) => {
            const { col, row } = cellOf(n);
            const cls = [
              "cell",
              (col + row) % 2 ? "alt" : "",
              n >= FINAL_ZONE_START && n < LAST_BOX ? "final" : "",
              n === LAST_BOX ? "finish" : "",
              SNAKES[n] ? "has-snake" : "",
              LADDERS[n] ? "has-ladder" : "",
            ].join(" ");
            return (
              <div key={n} className={cls} style={{ gridColumn: col + 1, gridRow: row + 1 }}>
              </div>
            );
          })}
        </div>
        <svg className="overlay" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          {Object.entries(LADDERS).map(([f, t]) => (
            <Ladder key={f} from={+f} to={t} />
          ))}
          {Object.entries(SNAKES).map(([h, t], i) => (
            <Snake key={h} head={+h} tail={t} i={i} />
          ))}
        </svg>
        {/* Box numbers sit above the snakes and ladders so they are never hidden. */}
        <div className="cells nums" aria-hidden="true">
          {cells.map((n) => {
            const { col, row } = cellOf(n);
            return (
              <div key={n} style={{ gridColumn: col + 1, gridRow: row + 1, position: "relative" }}>
                <span className="num">{n}</span>
                {n === LAST_BOX && <span className="finish-label">🏆 FINISH</span>}
                {n === FINAL_ZONE_START && <span className="zone-label">Need {FINAL_ZONE_NEED}+</span>}
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
                const spread = n > 1 ? 30 / per : 0;
                const t = tokenById(p.player.token);
                return (
                  <div
                    key={p.uid}
                    className={`piece ${highlight === p.uid ? "hl" : ""} ${n > 3 ? "small" : ""}`}
                    style={{
                      left: `${((c.x + gx * spread * 1.6) / W) * 100}%`,
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
