// 16-bit style creature pictures, drawn in code on a 40×40 grid and then shaded and outlined.
// sprite(id, back) gives a small canvas: front view (facing you) or back view (seen from behind).
import { ELEMENTS, creatureById } from "./creatures.ts";

type Pal = { a: string; l: string; d: string; x: string; ui: string };
type Pt = [number, number];
const DK = "#1b1530";
const WH = "#ffffff";

class G {
  d: (string | null)[] = new Array(1600).fill(null);
  px(x: number, y: number, c: string) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && y >= 0 && x < 40 && y < 40) this.d[y * 40 + x] = c;
  }
  PX(x: number, y: number, c: string) {
    this.px(x, y, c);
    this.px(39 - x, y, c);
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
    this.e(40 - cx, cy, rx, ry, c);
  }
  r(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }
  R(x: number, y: number, w: number, h: number, c: string) {
    this.r(x, y, w, h, c);
    this.r(40 - x - w, y, w, h, c);
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
    this.p(pts.map(([a, b]) => [40 - a, b] as Pt), c);
  }
  eyes(cx: number, cy: number, angry = false, s = 1) {
    this.E(cx, cy, 2 * s, 2.5 * s, WH);
    this.R(cx - 1, cy - 1, 2, 3, DK);
    this.PX(cx - 1, cy - 1, WH);
    if (angry) this.P([[cx - 3, cy - 4.5], [cx + 3, cy - 2.5], [cx + 3, cy - 1.5], [cx - 3, cy - 3.5]], DK);
  }
  eye1(cx: number, cy: number) {
    this.e(cx, cy, 2, 2.5, WH);
    this.r(cx - 1, cy - 1, 2, 3, DK);
    this.px(cx - 1, cy - 1, WH);
  }
}

const DRAW: Record<string, (g: G, T: Pal, b: boolean) => void> = {
  dragon(g, T, b) {
    g.P([[15, 18], [3, 9], [4, 16], [2, 22], [9, 22], [13, 26]], T.d);
    g.p([[26, 30], [36, 31], [38, 26], [35, 34], [25, 35]], T.a);
    g.e(37.5, 25, 1.6, 2.6, T.x);
    g.e(20, 28, 9, 8, T.a);
    if (!b) g.e(20, 30, 5, 6, T.l);
    g.E(14, 36, 3.2, 2, T.a);
    g.P([[14, 10], [11, 2], [17, 8]], "#f5e6c8");
    g.e(20, 15, 8, 7, T.a);
    g.e(20, 7, 1.6, 2.6, T.x);
    if (!b) {
      g.e(20, 19.5, 5, 3, T.l);
      g.PX(18, 19, DK);
      g.eyes(16, 14, true);
    } else for (const y of [20, 26, 32]) g.p([[18, y], [20, y - 4], [22, y]], T.x);
  },
  bull(g, T, b) {
    const body = "#a8352a";
    g.e(20, 27, 14, 9, body);
    g.R(9, 31, 5, 7, body);
    g.R(9, 36, 5, 2, "#3a2a2a");
    g.E(8, 20, 3, 4.5, T.x);
    g.E(8, 21, 1.6, 2.6, T.l);
    g.P([[14, 15], [5, 11], [5, 6], [9, 11], [15, 12]], "#f2e3c6");
    g.e(20, 18, 8, 7, T.a);
    if (!b) {
      g.e(20, 23, 5.5, 3.2, "#f0b89a");
      g.PX(17, 23, DK);
      g.r(18, 26, 4, 1, "#c9ccd6");
      g.PX(17, 25, "#c9ccd6");
      g.eyes(16, 17, true, 0.9);
    } else {
      g.r(13, 27, 14, 7, "#3a2a2a");
      for (let i = 0; i < 3; i++) g.r(14, 28 + i * 2, 12, 1, T.l);
    }
  },
  lizard(g, T, b) {
    g.p([[23, 31], [35, 25], [37, 20], [38, 24], [30, 32], [24, 35]], T.a);
    g.e(37, 19, 1.8, 2.6, T.x);
    g.e(19, 29, 6.5, 6, T.a);
    if (!b) g.e(19, 31, 3.5, 4, T.l);
    g.e(14, 35, 2.6, 2, T.a);
    g.e(24, 35, 2.6, 2, T.a);
    g.p([[11, 16], [13, 6], [16, 11], [19, 2], [21, 10], [24, 5], [26, 16]], T.x);
    g.p([[13, 16], [14, 10], [16, 13], [19, 6], [21, 13], [23, 9], [24, 16]], T.l);
    g.e(18.5, 18, 7.5, 6, T.a);
    if (!b) {
      g.eye1(15, 18);
      g.eye1(22, 18);
      g.r(16, 22, 5, 1, DK);
    }
  },
  shark(g, T, b) {
    g.p([[16, 16], [21, 2], [24, 16]], T.a);
    g.P([[11, 24], [2, 31], [4, 33], [12, 30]], T.a);
    g.P([[12, 34], [15, 39], [20, 35]], T.d);
    g.e(20, 25, 10, 11, T.a);
    if (!b) {
      g.e(20, 29, 6.5, 7, "#e8f6ff");
      g.eyes(15, 20, true);
      g.r(14, 26, 12, 3, DK);
      for (let x = 14; x < 26; x += 2) {
        g.px(x, 26, WH);
        g.px(x + 1, 28, WH);
      }
    } else {
      g.R(11, 22, 1, 5, T.d);
      g.R(13, 22, 1, 5, T.d);
    }
  },
  turtle(g, T, b) {
    const skin = "#6fc3c8";
    g.E(9, 33, 4, 3, skin);
    g.e(20, 24, 14, 10, T.d);
    g.e(20, 32, 14, 3, "#cfe9f5");
    g.e(20, 21, 4, 3, T.a);
    g.E(11, 25, 3, 2.6, T.a);
    g.E(15, 17, 2.6, 2, T.a);
    g.p([[20, 5], [16.5, 12], [23.5, 12]], T.l);
    g.e(20, 12, 3.8, 3.4, T.l);
    g.px(19, 11, WH);
    if (!b) {
      g.e(20, 27, 6.5, 5, skin);
      g.eyes(17, 26, false, 0.9);
      g.r(19, 30, 2, 1, DK);
    } else g.e(20, 36, 2, 2, skin);
  },
  otter(g, T, b) {
    const fur = "#9a6a45";
    const cream = "#ecd3ae";
    g.p([[24, 32], [35, 30], [37, 34], [26, 36]], fur);
    g.e(20, 28, 7, 8, fur);
    g.E(15, 36, 3, 2, fur);
    g.E(13, 11, 2.4, 2.4, fur);
    g.e(20, 17, 8, 6.5, fur);
    if (!b) {
      g.e(20, 30, 4, 5, cream);
      g.e(20, 20, 4.5, 2.8, cream);
      g.r(19, 18, 2, 2, DK);
      g.eyes(16, 15, false, 0.9);
      g.r(25, 22, 4, 9, "#dff4ff");
      g.r(25, 26, 4, 5, T.a);
      g.r(25, 21, 4, 1, "#c8553d");
      g.e(24, 27, 2, 1.6, fur);
    } else g.r(25, 22, 4, 2, "#c8553d");
  },
  falcon(g, T, b) {
    g.P([[15, 18], [2, 11], [4, 17], [1, 21], [5, 23], [3, 27], [13, 29]], T.d);
    g.P([[18, 11], [16, 4], [20, 9]], T.a);
    g.e(20, 26, 7, 9, T.a);
    g.R(16, 34, 2, 3, "#ffcf40");
    g.e(20, 14, 6.5, 5.5, T.a);
    if (!b) {
      g.e(20, 28, 4, 6, T.l);
      g.P([[16, 26], [20, 28], [20, 29], [16, 27]], T.d);
      g.eyes(17, 13, true, 0.9);
      g.p([[18, 16], [22, 16], [20, 20]], "#ffcf40");
    } else g.P([[15, 21], [20, 25], [20, 26], [15, 22]], T.d);
  },
  owl(g, T, b) {
    g.P([[10, 16], [8, 7], [15, 12]], T.a);
    g.e(20, 25, 12, 12, T.a);
    g.E(14, 36, 2.4, 1.6, "#ffcf40");
    if (!b) {
      g.e(20, 29, 8, 7.5, T.l);
      g.E(15, 20, 4.8, 4.8, DK);
      g.E(15, 20, 3.8, 3.8, WH);
      g.R(14, 19, 2, 3, DK);
      g.PX(14, 19, WH);
      g.r(19, 19, 2, 1, DK);
      g.p([[18, 23], [22, 23], [20, 27]], "#ffcf40");
      g.r(25, 27, 8, 10, "#b8865a");
      g.r(26, 29, 6, 7, WH);
      g.r(27, 30, 4, 1, DK);
      g.r(27, 32, 3, 1, DK);
      g.r(27, 34, 4, 1, DK);
      g.r(28, 26, 2, 2, "#8a8f99");
    } else for (let k = 0; k < 3; k++) g.P([[14, 19 + k * 5], [20, 22 + k * 5], [20, 23 + k * 5], [14, 20 + k * 5]], T.d);
  },
  swallow(g, T, b) {
    g.p([[17, 31], [12, 39], [20, 34], [28, 39], [23, 31]], T.d);
    g.P([[15, 22], [4, 17], [6, 23], [3, 26], [14, 28]], T.d);
    g.e(20, 25, 6.5, 8, T.a);
    g.e(20, 15, 6, 5.2, T.d);
    if (!b) {
      g.e(20, 28, 3.6, 5, T.l);
      g.eyes(17, 14, false, 0.9);
      g.p([[19, 17], [21, 17], [20, 20]], "#ffcf40");
      g.r(24, 18, 8, 6, "#ffe066");
      g.r(25, 19, 3, 1, DK);
      g.r(25, 21, 5, 1, DK);
    }
  },
  rhino(g, T, b) {
    g.e(20, 28, 12.5, 8, T.a);
    g.R(10, 31, 5, 7, T.a);
    g.R(10, 36, 5, 2, T.d);
    g.E(13, 11, 2, 3.2, T.a);
    g.e(20, 18, 7.5, 7, T.a);
    if (!b) {
      g.e(20, 23, 5.5, 4, T.l);
      g.PX(18, 24, DK);
      g.eyes(16, 16, true, 0.9);
      g.p([[18, 22], [20, 7], [22, 22]], "#f2e6cf");
    } else {
      g.p([[19, 12], [20, 8], [21, 12]], "#f2e6cf");
      g.R(15, 26, 1, 4, T.d);
      g.R(17, 28, 1, 3, T.d);
    }
  },
  golem(g, T, b) {
    const s = "#8f97a3";
    g.R(11, 30, 7, 8, s);
    g.R(3, 16, 7, 14, s);
    g.r(9, 13, 22, 18, s);
    g.r(14, 4, 12, 10, s);
    if (!b) {
      g.R(16, 8, 3, 2, "#7af0ff");
      g.r(12, 19, 16, 3, "#f2d06b");
      for (let x = 12; x < 28; x += 2) g.r(x, 19, 1, x % 4 === 0 ? 2 : 1, DK);
      g.e(20, 26, 2, 2.4, T.l);
    } else {
      g.r(15, 17, 1, 6, "#6c7380");
      g.r(16, 22, 4, 1, "#6c7380");
      g.r(24, 24, 1, 5, "#6c7380");
      g.e(20, 6, 3, 1.6, "#6fa86a");
    }
  },
  mole(g, _T, b) {
    const fur = "#6b5a7a";
    const pink = "#ff9fb0";
    g.e(20, 27, 9.5, 9, fur);
    g.E(15, 36, 3, 2, fur);
    g.E(9, 27, 4, 3.2, pink);
    g.R(5, 29, 1, 2, WH);
    g.R(7, 30, 1, 2, WH);
    g.e(20, 17, 7.5, 6, fur);
    g.e(20, 12, 7.5, 4.2, "#ffcf40");
    g.r(11, 13, 18, 2, "#ffcf40");
    g.r(19, 9, 2, 2, "#e09a00");
    if (!b) {
      g.e(20, 29, 5.5, 6, "#c9a98c");
      g.e(20, 21, 3, 2.4, pink);
      g.R(15, 16, 2, 2, DK);
      g.PX(15, 16, WH);
    }
  },
  fox(g, T, b) {
    g.p([[25, 31], [33, 24], [30, 24], [37, 14], [28, 22], [31, 22], [24, 28]], T.a);
    g.e(36, 15, 1.6, 2, WH);
    g.P([[12, 15], [10, 2], [19, 10]], T.a);
    if (!b) g.P([[13, 12], [12, 6], [16, 10]], T.d);
    g.e(20, 28, 6.5, 7, T.a);
    g.E(15, 35, 2.6, 2, T.a);
    g.e(20, 16, 8.5, 6.5, T.a);
    if (!b) {
      g.e(20, 20, 4, 2.6, "#fff7d6");
      g.r(19, 19, 2, 1, DK);
      g.eyes(16, 15, true, 0.9);
      g.r(17, 25, 6, 1, DK);
      g.px(18, 26, DK);
      g.px(19, 27, DK);
      g.px(18, 28, DK);
      g.r(17, 29, 6, 1, DK);
    }
  },
  beetle(g, T, b) {
    const m = "#3d3a5c";
    g.R(5, 25, 5, 1, m);
    g.R(4, 30, 6, 1, m);
    g.R(6, 35, 5, 1, m);
    g.R(14, 6, 1, 6, m);
    g.E(14.5, 5, 1.6, 1.6, T.x);
    g.e(20, 15, 7, 5, m);
    g.e(20, 26, 13, 10, m);
    if (!b) {
      g.e(20, 27, 10, 7.5, T.a);
      g.e(20, 27, 6, 4.6, "#fff8e0");
      for (let i = -2; i <= 2; i++) g.px(20 + i * 2, 24 + Math.abs(i), DK);
      for (let k = 0; k < 4; k++) g.px(20 + k, 29 - k, "#d83a3a");
      g.px(20, 29, DK);
      g.eyes(17, 15, false, 0.8);
    } else {
      g.e(20, 25, 12, 9, T.a);
      g.r(20, 16, 1, 19, T.d);
      g.E(14, 22, 2, 2, T.d);
      g.E(15, 29, 1.6, 1.6, T.d);
    }
  },
  bee(g, T, b) {
    g.E(10, 16, 6, 5, "#dff6ff");
    g.R(16, 4, 1, 6, DK);
    g.E(16.5, 4, 1.6, 1.6, T.x);
    g.p([[18, 32], [22, 32], [20, 38]], DK);
    g.e(20, 25, 7.5, 8, T.a);
    g.r(13, 23, 14, 2, DK);
    g.r(13, 28, 14, 2, DK);
    g.e(20, 14, 6.5, 5.5, T.a);
    if (!b) {
      g.eyes(17, 14, false, 1);
      g.r(19, 18, 2, 1, DK);
    }
  },
};

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

/** The creature picture as a 40×40 canvas. mode "white" gives a white silhouette (hit flash). */
export function sprite(id: string, back = false, mode: "" | "white" = ""): HTMLCanvasElement {
  const key = `${id}|${back ? "b" : "f"}|${mode}`;
  if (cache[key]) return cache[key];
  const c = creatureById(id);
  const g = new G();
  (DRAW[c.id] ?? DRAW.dragon)(g, ELEMENTS[c.type], back);
  const cv = document.createElement("canvas");
  cv.width = cv.height = 40;
  const x = cv.getContext("2d")!;
  const im = x.createImageData(40, 40);
  const has = (i: number, j: number) => i >= 0 && j >= 0 && i < 40 && j < 40 && g.d[j * 40 + i] != null;
  for (let j = 0; j < 40; j++)
    for (let i = 0; i < 40; i++) {
      const v = g.d[j * 40 + i];
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
        im.data.set([col[0], col[1], col[2], 255], (j * 40 + i) * 4);
      }
    }
  x.putImageData(im, 0, 0);
  cache[key] = cv;
  return cv;
}
