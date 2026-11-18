// The Quality Cart race track: one winding circuit seen from above.
// World units: the track fits in a 1600 x 900 area (the shape of a projector screen).

export const WORLD_W = 1600;
export const WORLD_H = 900;
export const TRACK_W = 116; // road width
export const HALF = TRACK_W / 2 - 12; // how far from the centre line a cart can drive
export const LAPS = 3;

/** Points the centre of the road passes through (a smooth curve is drawn through them). */
const CONTROL: [number, number][] = [
  [190, 520],
  [205, 300],
  [330, 150],
  [560, 140],
  [700, 270],
  [850, 300],
  [960, 170],
  [1180, 120],
  [1390, 190],
  [1440, 400],
  [1330, 540],
  [1140, 560],
  [1050, 680],
  [1150, 780],
  [930, 810],
  [700, 790],
  [590, 650],
  [430, 690],
  [300, 800],
  [200, 700],
];

const STEP = 4; // distance between stored points along the road

type Path = { x: Float64Array; y: Float64Array; h: Float64Array; L: number };

function build(): Path {
  // Smooth closed curve (Catmull-Rom), then re-sampled at equal distances.
  const dense: [number, number][] = [];
  const n = CONTROL.length;
  for (let i = 0; i < n; i++) {
    const p0 = CONTROL[(i - 1 + n) % n];
    const p1 = CONTROL[i];
    const p2 = CONTROL[(i + 1) % n];
    const p3 = CONTROL[(i + 2) % n];
    for (let k = 0; k < 40; k++) {
      const t = k / 40;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const cum = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1];
    const b = dense[i % dense.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const L = cum[cum.length - 1];
  const count = Math.floor(L / STEP);
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  let j = 0;
  for (let i = 0; i < count; i++) {
    const s = i * STEP;
    while (cum[j + 1] < s) j++;
    const a = dense[j];
    const b = dense[(j + 1) % dense.length];
    const t = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    x[i] = a[0] + (b[0] - a[0]) * t;
    y[i] = a[1] + (b[1] - a[1]) * t;
  }
  const h = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const a = (i - 1 + count) % count;
    const b = (i + 1) % count;
    h[i] = Math.atan2(y[b] - y[a], x[b] - x[a]);
  }
  return { x, y, h, L: count * STEP };
}

const PATH = build();
export const TRACK_LEN = PATH.L;
export const PATH_POINTS = PATH;

export const wrap = (s: number) => ((s % TRACK_LEN) + TRACK_LEN) % TRACK_LEN;

/** Screen position and direction of a spot on the road. s = distance along the road, d = -1 (left edge) .. 1 (right edge). */
export function place(s: number, d: number): { x: number; y: number; h: number } {
  const i = Math.floor(wrap(s) / STEP) % PATH.x.length;
  const h = PATH.h[i];
  const nx = -Math.sin(h);
  const ny = Math.cos(h);
  return { x: PATH.x[i] + nx * d * HALF, y: PATH.y[i] + ny * d * HALF, h };
}

/** Shortest distance along the road from a to b (can be negative). */
export function gap(a: number, b: number) {
  let g = wrap(b) - wrap(a);
  if (g > TRACK_LEN / 2) g -= TRACK_LEN;
  if (g < -TRACK_LEN / 2) g += TRACK_LEN;
  return g;
}

export type HazardKind = "cone" | "pothole" | "oos";
export type Hazard = { s: number; d: number; kind: HazardKind; len: number; wide: number };

/** Fixed hazards on the road (at fractions of a lap). */
export const HAZARDS: Hazard[] = (
  [
  { s: 0.1, d: -0.45, kind: "cone", len: 14, wide: 0.22 },
  { s: 0.1, d: 0.55, kind: "cone", len: 14, wide: 0.22 },
  { s: 0.2, d: 0.1, kind: "pothole", len: 18, wide: 0.3 },
  { s: 0.33, d: -0.55, kind: "oos", len: 70, wide: 0.42 },
  { s: 0.46, d: 0.45, kind: "cone", len: 14, wide: 0.22 },
  { s: 0.47, d: -0.3, kind: "pothole", len: 18, wide: 0.3 },
  { s: 0.6, d: 0.5, kind: "oos", len: 70, wide: 0.42 },
  { s: 0.71, d: -0.05, kind: "cone", len: 14, wide: 0.22 },
  { s: 0.83, d: -0.5, kind: "pothole", len: 18, wide: 0.3 },
  { s: 0.9, d: 0.4, kind: "cone", len: 14, wide: 0.22 },
  ] as Hazard[]
).map((h) => ({ ...h, s: h.s * TRACK_LEN }));

/** Rows of item boxes (each row has boxes across the road). */
export const BOX_ROWS = [0.26, 0.53, 0.77].map((f) => f * TRACK_LEN);
export const BOX_LANES = [-0.66, 0, 0.66];
