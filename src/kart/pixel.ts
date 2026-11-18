// Pixel-art pictures for the drivers' view, drawn once in code (no image files).
// Each is a small canvas; the 3D view scales them up without smoothing for a 16-bit look.

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
