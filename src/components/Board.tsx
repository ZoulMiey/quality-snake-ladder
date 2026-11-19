import { useEffect, useMemo, useRef, useState } from "react";
import { COLS, ROWS, LADDERS, SNAKES, LAST_BOX, cellOf } from "../lib/board.ts";
import { tokenById } from "../lib/tokens.ts";
import { specialAt, type SpecialBox } from "../lib/specials.ts";
import type { Player, PlayerState } from "../lib/types.ts";
import { ALERT_TEXT, SPOT_FADE_MS, SPOT_LINGER_MS, climbProgress, slideProgress, verdictText, type Moment } from "../lib/moments.ts";

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

function ladderShape(from: number, to: number) {
  const a = centre(from);
  const b = centre(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return { a, b, dx, dy, len, rungs: Math.max(3, Math.round(len / 34)) };
}

function Ladder({ from, to, i, glow }: { from: number; to: number; i: number; glow?: string }) {
  const [rail, rung] = WOOD[i % WOOD.length];
  const { a, b, dx, dy, len, rungs } = ladderShape(from, to);
  const nx = (-dy / len) * 20;
  const ny = (dx / len) * 20;
  return (
    <g className="ladder">
      {glow && (
        <g className={`glow ${glow}`}>
          <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} />
          <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} />
        </g>
      )}
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
 * `centreAt(t)` is the middle of the body (t = 0 head, 1 tail): pieces slide down along it.
 */
function snakeShape(head: number, tail: number, i: number) {
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
  return { a, body, spine, color, ang, centreAt };
}

function Snake({ head, tail, i, glow }: { head: number; tail: number; i: number; glow?: string }) {
  const { a, body, spine, color, ang } = snakeShape(head, tail, i);
  return (
    <g className="snake">
      {glow && <path d={body} className={`glow ${glow}`} />}
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

const SNAKE_KEYS = Object.keys(SNAKES);
const LADDER_KEYS = Object.keys(LADDERS);
const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` });

/** Glow colour of the snake/ladder: pulsing while the player answers, then the colour of the result. */
function glowFor(m: Moment): string | undefined {
  if (m.stage === "alert" || m.stage === "answer") return `ask ${m.kind}`;
  if (m.stage === "after" && (m.afterMs ?? 0) > 400) return undefined;
  return `tone-${verdictText(m.outcome!, m.from!, m.to!).tone}`;
}

/** Where a piece riding down a snake or up a ladder is, t = 0 → 1. */
function rideAt(m: Moment, t: number) {
  if (m.kind === "snake") return snakeShape(m.box, m.end, SNAKE_KEYS.indexOf(String(m.box))).centreAt(slideProgress(t));
  const L = ladderShape(m.box, m.end);
  const p = climbProgress(t, L.rungs);
  return { x: L.a.x + L.dx * p, y: L.a.y + L.dy * p };
}

/** Spotlight around a snake/ladder (board units). */
function spotOf(m: Moment) {
  const a = centre(m.box);
  const b = centre(m.end);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const rx = Math.abs(a.x - b.x) / 2 + CW * 0.9;
  const ry = Math.abs(a.y - b.y) / 2 + CH * 1.2;
  return { cx, cy, rx, ry };
}

function momentTone(m: Moment): string {
  return m.outcome ? `tone-${verdictText(m.outcome, m.from!, m.to!).tone}` : `ask-${m.kind}`;
}

export default function Board({
  pieces,
  highlight,
  specials,
  posOverride,
  moments,
  spotlight,
}: {
  pieces: BoardPiece[];
  highlight?: string | null;
  specials?: SpecialBox[] | null;
  posOverride?: Record<string, number>;
  /** Snake & ladder moments in progress (see src/lib/moments.ts). */
  moments?: Moment[];
  /** 1–8 players: spotlight instead of pop-up words. */
  spotlight?: boolean;
}) {
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

  const ms = moments ?? [];
  const momentOf = new Map(ms.map((m) => [m.uid, m]));
  // Spotlights stay a moment after the piece stops, then fade out.
  const spots = spotlight ? ms.filter((m) => m.stage !== "after" || (m.afterMs ?? 0) < SPOT_LINGER_MS + SPOT_FADE_MS) : [];
  const spotOpacity = spots.reduce((o, m) => Math.max(o, m.stage === "after" ? 1 - Math.max(0, (m.afterMs ?? 0) - SPOT_LINGER_MS) / SPOT_FADE_MS : 1), 0);
  const spotOn = new Set(spots.map((m) => m.uid));

  // Group pieces by box so several on one box sit side by side.
  const byBox = new Map<number, BoardPiece[]>();
  for (const p of pieces) {
    const m = momentOf.get(p.uid);
    // After a snake/ladder answer, the piece waits on the head/foot until the phone's verdict alert is over.
    const held = m && (m.stage === "verdict" || m.stage === "move") ? m.from : undefined;
    const box = held ?? posOverride?.[p.uid] ?? p.state?.pos ?? 0;
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
        {ms.length > 0 && (
          <svg className="overlay fx" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            {ms.map((m) => {
              const g = glowFor(m);
              if (!g) return null;
              return m.kind === "snake" ? (
                <Snake key={m.key} head={m.box} tail={m.end} i={SNAKE_KEYS.indexOf(String(m.box))} glow={g} />
              ) : (
                <Ladder key={m.key} from={m.box} to={m.end} i={LADDER_KEYS.indexOf(String(m.box))} glow={g} />
              );
            })}
          </svg>
        )}
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
        <div className="trails" aria-hidden="true">
          {ms
            .filter((m) => m.stage === "move")
            .flatMap((m) =>
              [1, 2, 3, 4, 5, 6].map((k) => {
                const t = (m.ride ?? 0) - k * 0.035;
                if (t <= 0) return null;
                return <span key={`${m.key}-${k}`} className={`trail ${m.kind}`} style={{ ...pct(rideAt(m, t)), opacity: 0.4 - k * 0.055, ["--k" as string]: k }} />;
              }),
            )}
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
                const m = momentOf.get(p.uid);
                const riding = m?.stage === "move";
                const at = riding ? pct(rideAt(m!, m!.ride ?? 0)) : { left: `${((c.x + gx * spread * 1.6 * (CW / CH)) / W) * 100}%`, top: `${((c.y + gy * spread * 1.4) / H) * 100}%` };
                const cls = [
                  "piece",
                  highlight === p.uid ? "hl" : "",
                  n > 3 && !riding ? "small" : "",
                  m && m.stage !== "after" ? "actor" : "",
                  riding ? "riding" : "",
                  spots.length && !spotOn.has(p.uid) ? "under" : "",
                  m && (m.stage === "alert" || m.stage === "answer") ? `asking ${m.kind}` : "",
                ].join(" ");
                return (
                  <div
                    key={p.uid}
                    className={cls}
                    style={{ ...at, ["--c" as string]: t.color }}
                    title={p.player.name}
                  >
                    <span className="emoji">{t.emoji}</span>
                    <span className="tag">{p.player.name}</span>
                  </div>
                );
              }),
            )}
        </div>
        {spots.length > 0 && (
          <svg className="overlay spot" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" style={{ opacity: spotOpacity }}>
            <defs>
              <mask id="spot-mask">
                <rect width={W} height={H} fill="#fff" />
                {spots.map((m) => {
                  const e = spotOf(m);
                  return <ellipse key={m.key} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#000" />;
                })}
              </mask>
            </defs>
            <rect width={W} height={H} className="spot-dark" mask="url(#spot-mask)" />
            {spots.map((m) => {
              const e = spotOf(m);
              return <ellipse key={m.key} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} className={`spot-ring ${momentTone(m)}`} />;
            })}
          </svg>
        )}
        <div className="moments" aria-hidden="true">
          {spots.map((m) => {
            const e = spotOf(m);
            const below = e.cy + e.ry + CH * 1.1 < H;
            const who = pieces.find((p) => p.uid === m.uid);
            const t = who ? tokenById(who.player.token) : null;
            const a = ALERT_TEXT[m.kind];
            const v = m.outcome ? verdictText(m.outcome, m.from!, m.to!) : null;
            const x = Math.max(W * 0.14, Math.min(W * 0.86, e.cx));
            return (
              <div
                key={`${m.key}-spot`}
                className={`spot-label ${momentTone(m)} ${below ? "below" : "above"}`}
                style={{ ...pct({ x, y: below ? e.cy + e.ry : e.cy - e.ry }), opacity: spotOpacity }}
              >
                <b>{v ? `${v.en} / ${v.ms}` : `${a.icon} ${a.en} / ${a.ms}`}</b>
                <small>
                  {t ? `${t.emoji} ${who!.player.name} · ` : ""}
                  {v ? `${v.sub} · ${v.subMs}` : `Box ${m.box} · ${m.secs ?? 30}s`}
                </small>
              </div>
            );
          })}
          {ms.map((m) => {
            const out: React.ReactNode[] = [];
            // Several players on the same snake/ladder at once: only the newest one's words, so they stay readable.
            if (ms.some((o) => o !== m && o.box === m.box && o.startedAt > m.startedAt)) return out;
            const a = ALERT_TEXT[m.kind];
            const v = m.outcome ? verdictText(m.outcome, m.from!, m.to!) : null;
            if (m.stage === "answer")
              out.push(
                <div key={`${m.key}-bubble`} className={`m-bubble ${m.kind}`} style={pct(centre(m.box))}>
                  {a.icon} {m.secs}s
                </div>,
              );
            if (spotlight) return out;
            if (m.stage === "alert") {
              out.push(<span key={`${m.key}-ring-a`} className={`m-ring ask-${m.kind}`} style={pct(centre(m.box))} />);
              out.push(
                <div key={`${m.key}-alert`} className={`m-float ask-${m.kind}`} style={pct(centre(m.box))}>
                  <b>{a.en}</b>
                  <small>{a.ms}</small>
                </div>,
              );
            }
            if (v && m.stage === "verdict") {
              out.push(<span key={`${m.key}-ring-v`} className={`m-ring tone-${v.tone}`} style={pct(centre(m.box))} />);
              out.push(
                <div key={`${m.key}-verdict`} className={`m-float tone-${v.tone}`} style={pct(centre(m.box))}>
                  <b>{v.en}</b>
                  <small>{v.ms}</small>
                </div>,
              );
            }
            if (v && v.delta && m.stage === "after") {
              out.push(<span key={`${m.key}-ring-d`} className={`m-ring tone-${v.tone}`} style={pct(centre(m.to!))} />);
              out.push(
                <div key={`${m.key}-delta`} className={`m-float big tone-${v.tone}`} style={pct(centre(m.to!))}>
                  <b>{v.delta}</b>
                </div>,
              );
            }
            return out;
          })}
        </div>
      </div>
      <div className="start-lane">
        <span className="start-label">START</span>
        {atStart.map((p) => {
          const t = tokenById(p.player.token);
          return (
            <span key={p.uid} className="start-piece" style={{ ["--c" as string]: t.color }}>
              {t.emoji}
              {atStart.length <= 8 ? ` ${p.player.name}` : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
