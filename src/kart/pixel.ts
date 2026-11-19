// Pixel-art pictures for the drivers' view, drawn once in code (no image files).
// Each is a small canvas; the race view scales them up smoothly (the "32-bit smooth" look the owner picked).

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return { c, ctx, px: (x: number, y: number, w2: number, h2: number, color: string) => ((ctx.fillStyle = color), ctx.fillRect(x, y, w2, h2)) };
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

export function palm() {
  const { c, px } = canvas(32, 48);
  for (let y = 14; y < 48; y++) px(14 + Math.round(Math.sin(y / 9) * 2), y, 4, 1, y % 4 === 0 ? "#6b4423" : "#8b5a2b");
  const leaf = (x: number, y: number, dx: number, dy: number, n: number, col: string) => {
    for (let i = 0; i < n; i++) px(x + dx * i, y + dy * i + Math.floor((i * i) / 9), 3, 2, col);
  };
  leaf(15, 12, -2, -1, 7, "#2f8f2f");
  leaf(16, 12, 2, -1, 7, "#2f8f2f");
  leaf(15, 13, -2, 0, 7, "#3fae3f");
  leaf(16, 13, 2, 0, 7, "#3fae3f");
  leaf(15, 11, -1, -2, 4, "#2f8f2f");
  leaf(16, 11, 1, -2, 4, "#3fae3f");
  px(13, 12, 6, 3, "#5b3a1a");
  return c;
}

export function factory() {
  const { c, px } = canvas(64, 40);
  px(0, 14, 64, 26, "#9aa3ad");
  for (let i = 0; i < 4; i++) {
    // saw-tooth roof
    for (let k = 0; k < 8; k++) px(i * 16 + k * 2, 14 - k, 2, k, "#7b8590");
    px(i * 16 + 14, 6, 2, 8, "#5d6670");
  }
  px(50, 0, 6, 16, "#b0453a");
  px(50, 0, 6, 2, "#e5e7eb");
  px(51, 4, 4, 1, "#e5e7eb");
  for (let x = 4; x < 60; x += 9) px(x, 20, 6, 5, "#6fb7e6");
  px(24, 28, 14, 12, "#4b5563");
  px(26, 30, 10, 10, "#374151");
  px(4, 30, 12, 4, "#16a34a");
  return c;
}

export function billboard(text1: string, text2: string) {
  const { c, ctx, px } = canvas(96, 52);
  px(14, 30, 4, 22, "#4b5563");
  px(78, 30, 4, 22, "#4b5563");
  px(0, 0, 96, 32, "#f5c542");
  px(2, 2, 92, 28, "#0d3b2c");
  ctx.fillStyle = "#f5c542";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text1, 48, 11);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px monospace";
  ctx.fillText(text2, 48, 22);
  return c;
}

export function cone() {
  const { c, px } = canvas(12, 14);
  for (let y = 0; y < 12; y++) {
    const w = 2 + Math.floor(y / 1.6);
    px(6 - Math.floor(w / 2), y, w, 1, y === 5 || y === 6 ? "#ffffff" : "#f97316");
  }
  px(0, 12, 12, 2, "#c2410c");
  return c;
}

export function pothole() {
  const { c, px } = canvas(24, 8);
  px(4, 1, 16, 6, "#1f2226");
  px(2, 2, 20, 4, "#1f2226");
  px(6, 2, 8, 1, "#3a3f46");
  return c;
}

export function oilSpill() {
  const { c, px } = canvas(28, 8);
  px(3, 1, 22, 6, "#0b0b0d");
  px(1, 2, 26, 4, "#0b0b0d");
  px(7, 2, 6, 1, "#6b8fbf");
  px(16, 4, 4, 1, "#4b6f9f");
  return c;
}

export function qbox() {
  const { c, ctx, px } = canvas(16, 16);
  px(0, 0, 16, 16, "#ffffff");
  px(1, 1, 14, 14, "#f59e0b");
  px(1, 1, 14, 3, "#fde68a");
  ctx.fillStyle = "#7c2d12";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Q", 8, 9);
  return c;
}

/** Out-of-spec warning stripes lying on the road. */
export function oosStripe() {
  const { c, px } = canvas(32, 6);
  for (let x = 0; x < 32; x += 8) {
    px(x, 0, 4, 6, "#dc2626");
    px(x + 4, 0, 4, 6, "#facc15");
  }
  return c;
}

/** A cart seen from behind, in the player's colour. */
export function cartRear(color: string) {
  const { c, px } = canvas(48, 28);
  const dark = shade(color, -0.25);
  const light = shade(color, 0.2);
  px(2, 18, 9, 10, "#111827"); // tyres
  px(37, 18, 9, 10, "#111827");
  px(3, 20, 7, 1, "#374151");
  px(38, 20, 7, 1, "#374151");
  px(5, 9, 38, 14, color); // body
  px(5, 9, 38, 2, light);
  px(5, 20, 38, 3, dark);
  px(12, 3, 24, 8, dark); // cabin
  px(14, 4, 20, 6, "#1e293b"); // rear window
  px(15, 5, 6, 2, "#475569");
  px(2, 6, 44, 3, dark); // spoiler
  px(8, 8, 3, 2, dark);
  px(37, 8, 3, 2, dark);
  px(7, 13, 7, 3, "#ef4444"); // tail lights
  px(34, 13, 7, 3, "#ef4444");
  px(19, 15, 10, 4, "#e5e7eb"); // number plate
  px(21, 16, 6, 2, "#6b7280");
  px(20, 23, 3, 2, "#6b7280"); // exhaust
  px(25, 23, 3, 2, "#6b7280");
  return c;
}

export function flame(frame: number) {
  const { c, px } = canvas(8, 10);
  const h = 6 + (frame % 3);
  px(2, 0, 4, h, "#f97316");
  px(3, 0, 2, h - 2, "#fde047");
  return c;
}

// ---- Scenery for the sideways race view (countryside + factory zone) ----

/** A pine tree: dark or light green. */
export function pine(dark: string, light: string) {
  const { c, px } = canvas(18, 34);
  px(8, 28, 3, 6, "#6b3f1f");
  for (let y = 0; y < 29; y++) {
    const half = Math.floor(((y % 9) + 2) * 0.9 + y * 0.18);
    px(9 - half, y, half * 2, 1, dark);
    px(9 - half, y, Math.max(1, half - 1), 1, light);
  }
  px(8, 0, 2, 2, light);
  return c;
}

/** A round tree (green oak or orange autumn tree). */
export function roundTree(dark: string, mid: string, light: string) {
  const { c, px } = canvas(26, 30);
  px(11, 20, 4, 10, "#6b3f1f");
  for (let y = 0; y < 22; y++)
    for (let x = 0; x < 26; x++) {
      const dx = x - 13;
      const dy = y - 11;
      if (Math.hypot(dx * 0.95, dy) < 11.5) px(x, y, 1, 1, Math.hypot(dx, dy) < 6 && dx < 0 && dy < 0 ? light : dx + dy > 6 ? dark : mid);
    }
  return c;
}

export function rock() {
  const { c, px } = canvas(16, 10);
  for (let y = 0; y < 10; y++) for (let x = 0; x < 16; x++) if (Math.hypot((x - 8) / 8, (y - 9) / 9) < 1) px(x, y, 1, 1, x < 7 && y < 6 ? "#c9ccd1" : x > 10 ? "#7d828a" : "#a4a9b0");
  return c;
}

export function bush() {
  const { c, px } = canvas(18, 9);
  for (let y = 0; y < 9; y++) for (let x = 0; x < 18; x++) if (Math.hypot((x - 9) / 9, (y - 9) / 8) < 1) px(x, y, 1, 1, y < 4 ? "#7cc24b" : "#4f9a33");
  return c;
}

/** Red sign with white arrows pointing into the next bend (dir 1 = right, -1 = left). */
export function arrowSign(dir: number) {
  const { c, ctx, px } = canvas(30, 22);
  px(13, 12, 3, 10, "#3b3f46");
  px(0, 0, 30, 13, "#ffffff");
  px(1, 1, 28, 11, "#d33a3a");
  ctx.fillStyle = "#fff";
  for (let k = 0; k < 3; k++) {
    const x0 = 5 + k * 8;
    ctx.beginPath();
    if (dir > 0) {
      ctx.moveTo(x0, 3);
      ctx.lineTo(x0 + 5, 6.5);
      ctx.lineTo(x0, 10);
      ctx.lineTo(x0 + 2, 6.5);
    } else {
      ctx.moveTo(x0 + 5, 3);
      ctx.lineTo(x0, 6.5);
      ctx.lineTo(x0 + 5, 10);
      ctx.lineTo(x0 + 3, 6.5);
    }
    ctx.closePath();
    ctx.fill();
  }
  return c;
}

/** Big green-and-gold quality billboard on two posts. */
export function qualityBoard(line1: string, line2: string) {
  const { c, ctx, px } = canvas(150, 64);
  px(28, 40, 5, 24, "#3b3f46");
  px(117, 40, 5, 24, "#3b3f46");
  px(0, 0, 150, 44, "#f5c542");
  px(3, 3, 144, 38, "#0d3b2c");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillText(line1, 75, 16);
  ctx.fillStyle = "#f5c542";
  ctx.font = "7px 'Press Start 2P', monospace";
  ctx.fillText(line2, 75, 30);
  return c;
}

/** Factory with a chimney and a "QC LAB" sign. */
export function qcLab() {
  const { c, ctx, px } = canvas(90, 60);
  px(62, 0, 9, 30, "#8b949e");
  px(62, 6, 9, 3, "#d33a3a");
  px(62, 14, 9, 3, "#d33a3a");
  px(0, 24, 90, 36, "#b7bec6");
  px(0, 24, 90, 4, "#9aa3ad");
  ctx.fillStyle = "#9aa3ad";
  for (let k = 0; k < 4; k++) {
    ctx.beginPath();
    ctx.moveTo(k * 22, 24);
    ctx.lineTo(k * 22 + 22, 14);
    ctx.lineTo(k * 22 + 22, 24);
    ctx.fill();
  }
  for (let k = 0; k < 6; k++) px(6 + k * 14, 34, 8, 7, "#5aa9e6");
  px(38, 46, 16, 14, "#4d5560");
  px(6, 48, 26, 8, "#0d3b2c");
  ctx.fillStyle = "#f5c542";
  ctx.font = "6px 'Press Start 2P', monospace";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("QC LAB", 7, 55);
  return c;
}

export function warehouse() {
  const { c, px } = canvas(110, 44);
  px(0, 6, 110, 38, "#5f7d95");
  px(0, 0, 110, 8, "#4a6378");
  for (let k = 0; k < 4; k++) {
    px(8 + k * 26, 18, 20, 26, "#cfd6dd");
    for (let y = 20; y < 44; y += 3) px(8 + k * 26, y, 20, 1, "#aab4be");
  }
  px(0, 8, 110, 3, "#f5c542");
  return c;
}

export function fence() {
  const { c, px } = canvas(40, 12);
  for (let x = 0; x < 40; x += 8) px(x, 0, 2, 12, "#9aa3ad");
  px(0, 2, 40, 1, "#c4cad1");
  px(0, 7, 40, 1, "#c4cad1");
  return c;
}

/** A cart from behind with two racing stripes; `lean` (-2..2) shifts the body into a turn. */
export function racerRear(color: string, lean = 0) {
  const { c, px } = canvas(48, 28);
  const o = lean;
  const dark = shade(color, -0.25);
  const light = shade(color, 0.18);
  const lum = parseInt(color.slice(1, 3), 16) * 0.3 + parseInt(color.slice(3, 5), 16) * 0.59 + parseInt(color.slice(5, 7), 16) * 0.11;
  const stripe = lum > 170 ? "#1f2937" : "#f8fafc";
  px(2, 18, 10, 10, "#111");
  px(36, 18, 10, 10, "#111");
  px(3, 19, 8, 8, "#333");
  px(37, 19, 8, 8, "#333");
  px(4 + o, 8, 40, 14, color);
  px(4 + o, 8, 40, 2, light);
  px(4 + o, 19, 40, 3, dark);
  px(8 + o, 2, 32, 8, color);
  px(11 + o, 3, 26, 6, "#1d2733");
  px(12 + o, 4, 10, 2, "#40556b");
  px(19 + o, 2, 4, 20, stripe);
  px(25 + o, 2, 4, 20, stripe);
  px(6 + o, 12, 7, 4, "#ff3b3b");
  px(35 + o, 12, 7, 4, "#ff3b3b");
  px(7 + o, 13, 2, 1, "#ffd0d0");
  px(36 + o, 13, 2, 1, "#ffd0d0");
  px(14 + o, 18, 20, 4, "#2a2f36");
  px(16 + o, 22, 4, 2, "#9aa3ad");
  px(28 + o, 22, 4, 2, "#9aa3ad");
  return c;
}
