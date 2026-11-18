// The Defect Titan: a big boss drawn on a 64×64 grid, shaded and outlined like the monsters.
type Pt = [number, number];
const N = 64;
const DK = "#1b1530";
const WH = "#ffffff";

class G {
  d: (string | null)[] = new Array(N * N).fill(null);
  px(x: number, y: number, c: string) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && y >= 0 && x < N && y < N) this.d[y * N + x] = c;
  }
  PX(x: number, y: number, c: string) {
    this.px(x, y, c);
    this.px(N - 1 - x, y, c);
  }
  e(cx: number, cy: number, rx: number, ry: number, c: string) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.px(x, y, c);
      }
  }
  E(cx: number, cy: number, rx: number, ry: number, c: string) {
    this.e(cx, cy, rx, ry, c);
    this.e(N - cx, cy, rx, ry, c);
  }
  r(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }
  R(x: number, y: number, w: number, h: number, c: string) {
    this.r(x, y, w, h, c);
    this.r(N - x - w, y, w, h, c);
  }
  p(pts: Pt[], c: string) {
    let x0 = 99, x1 = -99, y0 = 99, y1 = -99;
    for (const [a, b] of pts) {
      x0 = Math.min(x0, a);
      x1 = Math.max(x1, a);
      y0 = Math.min(y0, b);
      y1 = Math.max(y1, b);
    }
    for (let y = Math.floor(y0); y <= y1; y++)
      for (let x = Math.floor(x0); x <= x1; x++) {
        const X = x + 0.5, Y = y + 0.5;
        let ins = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (yi > Y !== yj > Y && X < ((xj - xi) * (Y - yi)) / (yj - yi) + xi) ins = !ins;
        }
        if (ins) this.px(x, y, c);
      }
  }
  P(pts: Pt[], c: string) {
    this.p(pts, c);
    this.p(pts.map(([a, b]) => [N - a, b] as Pt), c);
  }
}

const STEEL = "#646a7c";
const DARK = "#3d4150";
const RUST = "#c0632b";
const YEL = "#ffcf40";
const RED = "#ff3b3b";
const OOZE = "#7ed957";

function drawTitan(g: G) {
  // legs and feet with warning tape
  g.R(15, 45, 11, 15, STEEL);
  g.R(12, 57, 16, 6, DARK);
  for (let y = 47; y < 56; y += 4) {
    g.P([[15, y + 3], [18, y], [21, y], [18, y + 3]], YEL);
    g.P([[21, y + 3], [24, y], [26, y], [26, y + 1], [24, y + 3]], YEL);
  }
  g.r(19, 41, 26, 6, DARK);
  // shoulders with rusty spikes
  g.P([[7, 16], [9, 6], [13, 15]], RUST);
  g.E(12, 20, 8, 7, DARK);
  // left arm: leaking pipe
  g.r(2, 22, 8, 19, STEEL);
  for (let y = 25; y < 40; y += 5) g.r(2, y, 8, 1, DARK);
  g.r(1, 40, 10, 4, DARK);
  g.e(6, 46, 2.6, 3, OOZE);
  g.px(5, 50, OOZE);
  g.px(6, 53, OOZE);
  g.px(7, 56, OOZE);
  // right arm: hammer fist
  g.r(54, 22, 8, 15, STEEL);
  g.r(51, 36, 13, 11, DARK);
  for (let x = 52; x < 63; x += 3) g.r(x, 36, 2, 2, STEEL);
  // torso
  g.p([[12, 17], [52, 17], [48, 44], [16, 44]], STEEL);
  g.r(14, 39, 36, 4, YEL);
  for (let x = 14; x < 50; x += 4) g.p([[x, 43], [x + 2, 39], [x + 4, 39], [x + 2, 43]], DK);
  // cracked gear on the chest
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    g.e(31 + Math.cos(a) * 10, 28 + Math.sin(a) * 10, 2.2, 2.2, RUST);
  }
  g.e(31, 28, 9, 9, RUST);
  g.e(31, 28, 4.5, 4.5, DARK);
  g.px(30, 27, "#8a90a3");
  const crack: Pt[] = [[27, 20], [28, 22], [27, 24], [29, 26], [28, 29], [30, 31], [29, 34], [31, 36]];
  for (const [x, y] of crack) {
    g.px(x, y, DK);
    g.px(x + 1, y, DK);
  }
  // NG stamp
  g.r(40, 30, 9, 7, RED);
  const NG = ["X.X.XXX", "XXX.X..", "XXX.X.X", "X.X.XXX"];
  NG.forEach((row, j) => [...row].forEach((ch, i) => ch === "X" && g.px(41 + i, 31 + j, WH)));
  // head, visor and the red eye
  g.e(32, 9, 8, 5, STEEL);
  g.r(24, 9, 16, 9, STEEL);
  g.r(25, 12, 14, 4, DK);
  g.e(32, 14, 3.4, 1.8, RED);
  g.px(31, 13, WH);
  g.r(31, 1, 2, 5, DARK);
  g.e(32, 1.5, 1.6, 1.6, RED);
  g.R(22, 10, 2, 5, RUST);
}

function rgb(h: string, f: number): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f < 1) {
    r *= f;
    g *= f;
    b *= f;
  } else if (f > 1) {
    const k = f - 1;
    r += (255 - r) * k;
    g += (255 - g) * k;
    b += (255 - b) * k;
  }
  return [r | 0, g | 0, b | 0];
}

const cache: Record<string, HTMLCanvasElement> = {};
/** The Defect Titan as a 64×64 canvas. mode "white" = hit flash, "red" = angry tint. */
export function titan(mode: "" | "white" | "red" = ""): HTMLCanvasElement {
  if (cache[mode]) return cache[mode];
  const g = new G();
  drawTitan(g);
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const x = cv.getContext("2d")!;
  const im = x.createImageData(N, N);
  const has = (i: number, j: number) => i >= 0 && j >= 0 && i < N && j < N && g.d[j * N + i] != null;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const v = g.d[j * N + i];
      let col: [number, number, number] | null = null;
      if (v) {
        let f = 1;
        if (v !== WH && v !== DK) {
          if (!has(i + 1, j) || !has(i, j + 1)) f = 0.68;
          else if (!has(i + 2, j + 1) || !has(i + 1, j + 2)) f = 0.84;
          else if (!has(i - 1, j) || !has(i, j - 1)) f = 1.3;
        }
        col = rgb(v, f);
      } else if (has(i - 1, j) || has(i + 1, j) || has(i, j - 1) || has(i, j + 1)) col = [27, 21, 48];
      if (col) {
        if (mode === "white") col = [255, 255, 255];
        else if (mode === "red") col = [Math.min(255, col[0] + 90), col[1] * 0.6, col[2] * 0.6];
        im.data.set([col[0] | 0, col[1] | 0, col[2] | 0, 255], (j * N + i) * 4);
      }
    }
  x.putImageData(im, 0, 0);
  cache[mode] = cv;
  return cv;
}
